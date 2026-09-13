import { useEffect, useMemo, useState } from 'react';
import { X, User, Phone, Package, Hash, CalendarDays, CreditCard, Wallet, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../../database/db';

const toEnglishNumbers = (value) => String(value ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const toNumber = (value) => {
    const n = Number(toEnglishNumbers(value).replace(/,/g, '').replace(/٬/g, '').replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : 0;
};

const FIELD_CLASS = `
    h-11 w-full rounded-xl
    border border-[var(--input-border)] bg-[var(--input-bg)]
    text-sm text-[var(--text)] placeholder:text-[var(--text-soft)] outline-none
    transition-colors duration-200
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    disabled:opacity-50
`;

function CreditSaleForm({ onClose, onSubmit }) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [formData, setFormData] = useState({
        customerName: '', phone: '', productId: '', product: '', quantity: '', unitPrice: '', date: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoadingProducts(true);
                const result = await getProducts();
                if (mounted) setProducts(Array.isArray(result) ? result : []);
            } catch (err) {
                console.error('Failed to load products for credit form:', err);
                if (mounted) setProducts([]);
            } finally {
                if (mounted) setLoadingProducts(false);
            }
        };
        load();
        const onProducts = () => load();
        window.addEventListener('products-updated', onProducts);
        return () => {
            mounted = false;
            window.removeEventListener('products-updated', onProducts);
        };
    }, []);

    const availableProducts = useMemo(
        () => products.filter((p) => (Number(toEnglishNumbers(p?.stock)) || 0) > 0),
        [products]
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((p) => ({ ...p, [name]: value }));
        setError('');
    };

    const handleProductChange = (e) => {
        const value = e.target.value;
        const product = availableProducts.find((p) => String(p.id) === String(value));
        setFormData((p) => ({
            ...p,
            productId: value,
            product: product?.name || '',
            unitPrice: product?.sellPrice != null ? String(product.sellPrice) : p.unitPrice,
        }));
        setError('');
    };

    const handleQuantityChange = (e) => {
        setFormData((p) => ({ ...p, quantity: toEnglishNumbers(e.target.value).replace(/[^\d]/g, '') }));
        setError('');
    };

    const handleUnitPriceChange = (e) => {
        setFormData((p) => ({ ...p, unitPrice: toEnglishNumbers(e.target.value).replace(/[^\d]/g, '') }));
        setError('');
    };

    const totalAmount = useMemo(
        () => toNumber(formData.quantity) * toNumber(formData.unitPrice),
        [formData.quantity, formData.unitPrice]
    );

    const fmt = (n) => new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR').format(Number(n) || 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.customerName.trim()) { setError(t('credit.saleForm.errors.customerRequired')); return; }
        if (!formData.productId || !formData.product.trim()) { setError(t('credit.saleForm.errors.productRequired')); return; }
        if (!formData.quantity || toNumber(formData.quantity) <= 0) { setError(t('credit.saleForm.errors.quantityRequired')); return; }
        if (formData.unitPrice === '' || toNumber(formData.unitPrice) < 0) { setError(t('credit.saleForm.errors.priceInvalid')); return; }

        onSubmit?.({
            ...formData,
            customerName: formData.customerName.trim(),
            phone: formData.phone.trim(),
            productId: formData.productId,
            product: formData.product.trim(),
            quantity: toNumber(formData.quantity),
            unitPrice: toNumber(formData.unitPrice),
            date: formData.date || new Date().toISOString().split('T')[0],
            totalAmount,
        });
    };

    const iconPosition = isEnglish ? 'left-3' : 'right-3';
    const inputIconPadding = isEnglish ? 'pl-10 pr-4' : 'pr-10 pl-4';

    return (
        <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/[0.26] p-2 backdrop-blur-[18px] backdrop-saturate-[0.72] animate-[profileBackdropIn_180ms_ease-out] sm:p-4 dark:bg-black/[0.50]"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
            role="presentation"
        >
            <div className="ui-modal relative flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden animate-[profileModalIn_180ms_ease-out] sm:max-h-[90vh]" onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="ui-modal-header flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/10 sm:h-11 sm:w-11">
                            <CreditCard size={20} className="text-amber-500" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-bold text-[var(--text)] sm:text-lg">{t('credit.saleForm.title')}</h2>
                                <span className="rounded-lg border border-amber-500/15 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-500">
                                    {t('credit.saleForm.badge')}
                                </span>
                            </div>
                            <p className="mt-1 text-[11px] text-[var(--text-muted)] sm:text-xs">{t('credit.saleForm.subtitle')}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} aria-label={t('common.closeMenu')} className="ui-icon-button h-9 w-9 shrink-0">
                        <X size={19} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="main-scrollbar flex-1 min-h-0 overflow-y-auto">
                    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                        {error && (
                            <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-500 sm:text-sm dark:text-red-400">
                                {error}
                            </div>
                        )}

                        {/* customer */}
                        <section>
                            <SectionTitle icon={User} title={t('credit.saleForm.customer.title')} />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field label={t('credit.saleForm.customer.name')} icon={User} iconPosition={iconPosition}>
                                    <input
                                        type="text" name="customerName" value={formData.customerName}
                                        onChange={handleChange} placeholder={t('credit.saleForm.customer.namePlaceholder')}
                                        className={`${FIELD_CLASS} ${inputIconPadding}`}
                                    />
                                </Field>
                                <Field label={t('credit.saleForm.customer.phone')} optional={t('credit.saleForm.optional')} icon={Phone} iconPosition={iconPosition}>
                                    <input
                                        type="tel" name="phone" value={formData.phone}
                                        onChange={handleChange} placeholder={t('credit.saleForm.customer.phonePlaceholder')}
                                        dir="ltr" className={`${FIELD_CLASS} ${inputIconPadding}`}
                                    />
                                </Field>
                            </div>
                        </section>

                        <div className="h-px bg-[var(--border)]" />

                        {/* sale */}
                        <section>
                            <SectionTitle icon={Package} title={t('credit.saleForm.sale.title')} />
                            <div className="space-y-4">
                                <Field label={t('credit.saleForm.sale.product')} icon={Package} iconPosition={iconPosition}>
                                    {loadingProducts ? (
                                        <div className="flex h-11 w-full items-center justify-center rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-muted)]">
                                            <Loader2 size={16} className="animate-spin" />
                                        </div>
                                    ) : (
                                        <select
                                            name="productId" value={formData.productId} onChange={handleProductChange}
                                            className={`${FIELD_CLASS} ${inputIconPadding} cursor-pointer`}
                                        >
                                            <option value="">{t('credit.saleForm.sale.productPlaceholder')}</option>
                                            {availableProducts.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </Field>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <Field label={t('credit.saleForm.sale.quantity')} icon={Hash} iconPosition={iconPosition}>
                                        <input
                                            type="text" inputMode="numeric" name="quantity" value={formData.quantity}
                                            onChange={handleQuantityChange} placeholder={t('credit.saleForm.sale.quantityPlaceholder')}
                                            className={`${FIELD_CLASS} ${inputIconPadding}`}
                                        />
                                    </Field>
                                    <Field label={t('credit.saleForm.sale.unitPrice')} icon={Wallet} iconPosition={iconPosition}>
                                        <div className="relative">
                                            <input
                                                type="text" inputMode="numeric" name="unitPrice" value={formData.unitPrice}
                                                onChange={handleUnitPriceChange} placeholder={t('credit.saleForm.sale.unitPricePlaceholder')}
                                                dir="ltr"
                                                className={`${FIELD_CLASS} ${isEnglish ? 'pl-10 pr-14' : 'pr-10 pl-14'}`}
                                            />
                                            <span className={`pointer-events-none absolute ${isEnglish ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)]`}>
                                                {t('common.currency')}
                                            </span>
                                        </div>
                                    </Field>
                                </div>
                            </div>
                        </section>

                        {/* total */}
                        <section className="relative overflow-hidden rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4 sm:p-5">
                            <div className="relative z-10 flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/10 bg-amber-500/10">
                                        <CreditCard size={18} className="text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-[var(--text-secondary)]">{t('credit.saleForm.total.title')}</p>
                                        <p className="mt-1 text-[10px] text-[var(--text-muted)]">{t('credit.saleForm.total.description')}</p>
                                    </div>
                                </div>
                                <div className={`${isEnglish ? 'text-left' : 'text-right'} shrink-0`}>
                                    <p dir="ltr" className="number-font text-2xl font-bold tracking-tight text-amber-500">
                                        {fmt(totalAmount)}
                                        <span className="ms-1 text-sm font-medium text-[var(--text-muted)]">{t('common.currency')}</span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* date */}
                        <section>
                            <SectionTitle icon={CalendarDays} title={t('credit.saleForm.sale.date')} />
                            <div className="relative">
                                <CalendarDays size={16} className={`pointer-events-none absolute ${iconPosition} top-1/2 -translate-y-1/2 text-[var(--text-muted)]`} />
                                <input
                                    type="date" name="date" value={formData.date} onChange={handleChange}
                                    className={`${FIELD_CLASS} ${inputIconPadding}`}
                                />
                            </div>
                        </section>
                    </div>

                    <div className="ui-modal-footer sticky bottom-0 flex flex-col-reverse gap-3 px-4 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <button type="button" onClick={onClose} className="ui-button-secondary h-11 w-full rounded-xl px-5 sm:w-auto">
                            {t('credit.saleForm.actions.cancel')}
                        </button>
                        <button type="submit" className="ui-button-primary group h-11 w-full rounded-xl px-5 sm:w-auto">
                            <Save size={16} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
                            {t('credit.saleForm.actions.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SectionTitle({ icon: Icon, title }) {
    return (
        <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)]">
                <Icon size={15} className="text-[var(--accent-500)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
        </div>
    );
}

function Field({ label, optional, icon: Icon, iconPosition, children }) {
    return (
        <div className="min-w-0">
            <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                {label}
                {optional && <span className="ms-1 text-[10px] font-normal text-[var(--text-muted)]">{optional}</span>}
            </label>
            <div className="relative">
                <Icon size={15} className={`pointer-events-none absolute ${iconPosition} top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)]`} />
                {children}
            </div>
        </div>
    );
}

export default CreditSaleForm;