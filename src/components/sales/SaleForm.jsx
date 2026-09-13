import { useEffect, useState } from 'react';
import {
    X, Package, Tag, Hash, DollarSign, User, Phone,
    Banknote, CreditCard, FileText, Calculator, Loader2, Plus, Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts, getCategories, addCategory } from '../../database/db';
import { addSale } from '../../services/salesService';

// ---------- helpers ----------
const toEnglishNumbers = (v) =>
    String(v ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const toNumber = (v) => {
    const normalized = toEnglishNumbers(v).replace(/,/g, '').replace(/٬/g, '').replace(/[^\d.-]/g, '');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
};

const fmt = (v) => Number(v || 0).toLocaleString('en-US');

const FIELD_CLASS = `
    h-11 w-full rounded-xl
    border border-[var(--input-border)] bg-[var(--input-bg)]
    text-sm text-[var(--text)]
    placeholder:text-[var(--text-soft)] outline-none
    transition-colors duration-200
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    disabled:opacity-50
`;

const TEXTAREA_CLASS = `
    w-full rounded-xl
    border border-[var(--input-border)] bg-[var(--input-bg)]
    p-4 text-sm text-[var(--text)]
    placeholder:text-[var(--text-soft)] outline-none resize-none
    transition-colors duration-200
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    disabled:opacity-50
`;

function SaleForm({ onClose, onSuccess }) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [addingCategory, setAddingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState('');

    const [productId, setProductId] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unitPrice, setUnitPrice] = useState('');
    const [paymentType, setPaymentType] = useState('cash');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [note, setNote] = useState('');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const numericQuantity = toNumber(quantity);
    const numericUnitPrice = toNumber(unitPrice);
    const total = numericQuantity * numericUnitPrice;

    const loadData = async () => {
        try {
            setLoadingData(true);
            setError('');
            const [p, c] = await Promise.all([getProducts(), getCategories()]);
            setProducts(Array.isArray(p) ? p : []);
            setCategories(Array.isArray(c) ? c : []);
        } catch (err) {
            console.error('Failed to load sale form data:', err);
            setError(t('sales.form.errors.loadData'));
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        loadData();
        const onProducts = () => loadData();
        const onCats = () => loadData();
        window.addEventListener('products-updated', onProducts);
        window.addEventListener('categories-updated', onCats);
        return () => {
            window.removeEventListener('products-updated', onProducts);
            window.removeEventListener('categories-updated', onCats);
        };
    }, []);

    const handleAddCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) {
            setCategoryError(t('sales.form.category.errors.required'));
            return;
        }

        const existing = categories.find(
            (item) => item.name?.trim().toLowerCase() === name.toLowerCase()
        );
        if (existing) {
            setCategory(existing.name || name);
            setNewCategoryName('');
            setShowNewCategory(false);
            setCategoryError('');
            return;
        }

        try {
            setAddingCategory(true);
            setCategoryError('');
            const created = await addCategory(name);
            const updated = await getCategories();
            setCategories(Array.isArray(updated) ? updated : []);
            setCategory(created?.name || name);
            setNewCategoryName('');
            setShowNewCategory(false);
            window.dispatchEvent(new Event('categories-updated'));
            window.dispatchEvent(new Event('database-updated'));
        } catch (err) {
            console.error('Failed to add category:', err);
            setCategoryError(err?.message || t('sales.form.category.errors.create'));
        } finally {
            setAddingCategory(false);
        }
    };

    const handleProductChange = (value) => {
        setProductId(value);
        const product = products.find((p) => String(p.id) === String(value));
        if (!product) {
            setCategory('');
            setUnitPrice('');
            return;
        }
        setCategory(product.category || '');
        setUnitPrice(product.sellPrice != null ? String(product.sellPrice) : '');
        setError('');
    };

    const handleQuantityChange = (v) => {
        setQuantity(toEnglishNumbers(v).replace(/[^\d]/g, ''));
        setError('');
    };

    const handleUnitPriceChange = (v) => {
        setUnitPrice(toEnglishNumbers(v).replace(/[^\d]/g, ''));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;
        try {
            setSaving(true);
            setError('');

            const product = products.find((p) => String(p.id) === String(productId));
            if (!product) throw new Error(t('sales.form.errors.productRequired'));

            const cleanCategory = category.trim();
            if (!cleanCategory) throw new Error(t('sales.form.errors.categoryRequired'));

            const finalQuantity = toNumber(quantity);
            if (!finalQuantity || finalQuantity <= 0) throw new Error(t('sales.form.errors.quantityInvalid'));

            const finalUnitPrice = toNumber(unitPrice);
            if (unitPrice === '' || finalUnitPrice < 0) throw new Error(t('sales.form.errors.priceInvalid'));

            const cleanCustomerName = customerName.trim();
            const cleanCustomerPhone = toEnglishNumbers(customerPhone.trim());
            const cleanNote = note.trim();

            if (paymentType === 'credit' && !cleanCustomerName) {
                throw new Error(t('sales.form.errors.creditCustomerRequired'));
            }

            await addSale({
                productId: product.id,
                productName: product.name,
                category: cleanCategory,
                quantity: finalQuantity,
                unitPrice: finalUnitPrice,
                total: finalQuantity * finalUnitPrice,
                paymentType,
                customerName: cleanCustomerName,
                customerPhone: cleanCustomerPhone,
                note: cleanNote,
                date: new Date().toISOString(),
            });

            window.dispatchEvent(new Event('sales-updated'));
            window.dispatchEvent(new Event('products-updated'));
            window.dispatchEvent(new Event('database-updated'));
            if (paymentType === 'credit') window.dispatchEvent(new Event('credit-sales-updated'));

            if (onSuccess) await onSuccess();
            else onClose();
        } catch (err) {
            console.error('Failed to create sale:', err);
            setError(err?.message || t('sales.form.errors.submit'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/[0.5] p-2 backdrop-blur-md sm:p-4 dark:bg-black/[0.6]"
        >
            <div className="ui-modal flex max-h-[calc(100vh-1rem)] w-full max-w-2xl flex-col sm:max-h-[90vh]">
                {/* header */}
                <div className="ui-modal-header flex flex-shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] sm:h-11 sm:w-11">
                            <Package size={19} className="text-[var(--accent-500)]" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-[var(--text)] sm:text-lg">{t('sales.form.title')}</h2>
                            <p className="mt-1 text-[11px] text-[var(--text-muted)] sm:text-xs">{t('sales.form.subtitle')}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} disabled={saving} aria-label={t('common.closeMenu')} className="ui-icon-button h-9 w-9 rounded-lg">
                        <X size={19} />
                    </button>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit} className="main-scrollbar flex-1 min-h-0 space-y-5 overflow-y-auto p-4 sm:space-y-6 sm:p-6">
                    {error && (
                        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* product section */}
                    <section>
                        <SectionLabel icon={Package} title={t('sales.form.productSection.title')} />

                        {loadingData ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={22} className="animate-spin text-[var(--accent-500)]" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                {/* product */}
                                <div className="min-w-0">
                                    <label className="mb-2 block text-xs text-[var(--text-muted)]">
                                        {t('sales.form.fields.product')}
                                    </label>
                                    <div className="relative">
                                        <Package size={16} className={`pointer-events-none absolute ${isEnglish ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[var(--text-soft)]`} />
                                        <select
                                            value={productId}
                                            onChange={(e) => handleProductChange(e.target.value)}
                                            disabled={saving}
                                            className={`${FIELD_CLASS} ${isEnglish ? 'pl-10 pr-4' : 'pr-10 pl-4'}`}
                                        >
                                            <option value="">{t('sales.form.fields.productPlaceholder')}</option>
                                            {products.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* category */}
                                <div className="min-w-0">
                                    <div className="mb-2 flex items-center justify-between gap-3">
                                        <label className="text-xs text-[var(--text-muted)]">{t('sales.form.fields.category')}</label>
                                        <button
                                            type="button"
                                            disabled={saving}
                                            onClick={() => { setShowNewCategory(!showNewCategory); setCategoryError(''); }}
                                            className="flex shrink-0 items-center gap-1 text-[11px] text-[var(--accent-500)] transition hover:text-[var(--accent-400)] disabled:opacity-50"
                                        >
                                            <Plus size={13} />
                                            {t('sales.form.category.new')}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Tag size={16} className={`pointer-events-none absolute ${isEnglish ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[var(--text-soft)]`} />
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            disabled={saving}
                                            className={`${FIELD_CLASS} ${isEnglish ? 'pl-10 pr-4' : 'pr-10 pl-4'}`}
                                        >
                                            <option value="">{t('sales.form.fields.categoryPlaceholder')}</option>
                                            {categories.map((item) => (
                                                <option key={item.id} value={item.name}>{item.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {showNewCategory && (
                                        <div className="mt-3 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3">
                                            <div className="flex flex-col gap-2 min-[420px]:flex-row">
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={newCategoryName}
                                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                                                    placeholder={t('sales.form.category.placeholder')}
                                                    disabled={addingCategory}
                                                    className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg-focus)] px-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--input-border-focus)]"
                                                />
                                                <button type="button" onClick={handleAddCategory} disabled={addingCategory} className="ui-button-primary h-10 px-4 text-sm">
                                                    {addingCategory ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                                    {t('sales.form.category.add')}
                                                </button>
                                            </div>
                                            {categoryError && (
                                                <p className="mt-2 text-xs text-red-500 dark:text-red-400">{categoryError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* quantity */}
                                <div className="min-w-0">
                                    <label className="mb-2 block text-xs text-[var(--text-muted)]">{t('sales.form.fields.quantity')}</label>
                                    <div className="relative">
                                        <Hash size={16} className={`pointer-events-none absolute ${isEnglish ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[var(--text-soft)]`} />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(e.target.value)}
                                            disabled={saving}
                                            className={`${FIELD_CLASS} ${isEnglish ? 'pl-10 pr-4' : 'pr-10 pl-4'}`}
                                        />
                                    </div>
                                </div>

                                {/* unit price */}
                                <div className="min-w-0">
                                    <label className="mb-2 block text-xs text-[var(--text-muted)]">{t('sales.form.fields.unitPrice')}</label>
                                    <div className="relative">
                                        <DollarSign size={16} className={`pointer-events-none absolute ${isEnglish ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[var(--text-soft)]`} />
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={unitPrice}
                                            onChange={(e) => handleUnitPriceChange(e.target.value)}
                                            disabled={saving}
                                            className={`${FIELD_CLASS} ${isEnglish ? 'pl-10 pr-14' : 'pr-10 pl-14'}`}
                                        />
                                        <span className={`pointer-events-none absolute ${isEnglish ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-xs text-[var(--text-soft)]`}>
                                            {t('common.currency')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* total */}
                    <section className="relative overflow-hidden rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-4 sm:p-5">
                        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[var(--accent-soft-heavy)] blur-2xl" />
                        <div className="relative flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                                    <Calculator size={18} className="text-[var(--accent-500)]" />
                                </div>
                                <div>
                                    <p className="text-xs text-[var(--text-secondary)]">{t('sales.form.total.title')}</p>
                                    <p className="mt-1 text-[11px] text-[var(--text-muted)]">{t('sales.form.total.description')}</p>
                                </div>
                            </div>
                            <div className={`${isEnglish ? 'text-left' : 'text-right'} min-[420px]:shrink-0`}>
                                <p dir="ltr" className="text-2xl font-bold text-[var(--accent-500)]">{fmt(total)}</p>
                                <span className="text-xs text-[var(--text-muted)]">{t('common.currency')}</span>
                            </div>
                        </div>
                    </section>

                    {/* payment */}
                    <section>
                        <SectionLabel icon={Banknote} title={t('sales.form.payment.title')} />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {[
                                { value: 'cash', Icon: Banknote, label: t('sales.paymentTypes.cash'), desc: t('sales.form.payment.cashDescription') },
                                { value: 'credit', Icon: CreditCard, label: t('sales.paymentTypes.credit'), desc: t('sales.form.payment.creditDescription') },
                            ].map(({ value, Icon, label, desc }) => (
                                <label key={value} className="cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value={value}
                                        checked={paymentType === value}
                                        onChange={() => { setPaymentType(value); setError(''); }}
                                        className="peer sr-only"
                                    />
                                    <div className="rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] p-4 transition peer-checked:border-[var(--accent-border-hover)]">
                                        <div className="flex items-center gap-3">
                                            <Icon size={20} className="text-[var(--accent-500)]" />
                                            <div>
                                                <p className="text-sm font-medium text-[var(--text)]">{label}</p>
                                                <p className="mt-1 text-[11px] text-[var(--text-muted)]">{desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* customer */}
                    <section>
                        <SectionLabel icon={User} title={t('sales.form.customer.title')} />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder={paymentType === 'credit' ? t('sales.form.customer.nameRequired') : t('sales.form.customer.name')}
                                disabled={saving}
                                className={`${FIELD_CLASS} px-4`}
                            />
                            <div className="relative">
                                <Phone size={16} className={`pointer-events-none absolute ${isEnglish ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[var(--text-soft)]`} />
                                <input
                                    type="tel"
                                    dir="ltr"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(toEnglishNumbers(e.target.value))}
                                    placeholder={t('sales.form.customer.phone')}
                                    disabled={saving}
                                    className={`${FIELD_CLASS} ${isEnglish ? 'pl-10 pr-4' : 'pr-10 pl-4'}`}
                                />
                            </div>
                        </div>
                    </section>

                    {/* note */}
                    <section>
                        <SectionLabel icon={FileText} title={t('sales.form.note.title')} />
                        <textarea
                            rows="3"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={t('sales.form.note.placeholder')}
                            disabled={saving}
                            className={TEXTAREA_CLASS}
                        />
                    </section>

                    {/* actions */}
                    <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                        <button type="button" onClick={onClose} disabled={saving} className="ui-button-secondary h-11 w-full px-5 text-sm sm:w-auto">
                            {t('sales.form.actions.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving || loadingData || !productId}
                            className="ui-button-primary h-11 w-full px-6 text-sm sm:w-auto"
                        >
                            {saving && <Loader2 size={17} className="animate-spin" />}
                            {saving ? t('sales.form.actions.saving') : t('sales.form.actions.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SectionLabel({ icon: Icon, title }) {
    return (
        <div className="mb-4 flex items-center gap-2">
            <Icon size={16} className="text-[var(--accent-500)]" />
            <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
        </div>
    );
}

export default SaleForm;