import { useEffect, useMemo, useState } from 'react';
import {
    X, Package, Tag, Hash, DollarSign, User, Phone,
    Banknote, FileText, Calculator, Loader2, Plus, Check,
    Ruler, AlertTriangle, TrendingDown, TrendingUp, Info, Star, Warehouse,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts, getCategories, addCategory } from '../../database/db';
import { addSale } from '../../services/salesService';

// =========================================================
// Helpers
// =========================================================

const toEnglishNumbers = (v) =>
    String(v ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const toNumber = (v) => {
    const normalized = toEnglishNumbers(v)
        .replace(/,/g, '')
        .replace(/٬/g, '')
        .replace(/[^\d.-]/g, '');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
};

const fmt = (v, isEnglish) => {
    const n = Number(v) || 0;
    return new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(n);
};

const normalizeNumericInput = (v) =>
    toEnglishNumbers(v).replace(/[^\d.]/g, '').replace(/^(\d*\.\d*).*$/, '$1');

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

// =========================================================
// Small pieces
// =========================================================

function SectionLabel({ icon: Icon, title }) {
    return (
        <div className="mb-4 flex items-center gap-2">
            <Icon size={16} className="text-[var(--accent-500)]" />
            <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
        </div>
    );
}

function IconField({ icon: Icon, isEnglish, children }) {
    return (
        <div className="relative">
            <Icon
                size={16}
                className={`pointer-events-none absolute ${isEnglish ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[var(--text-soft)]`}
            />
            {children}
        </div>
    );
}

function FieldLabel({ children }) {
    return <label className="mb-2 block text-xs text-[var(--text-muted)]">{children}</label>;
}

// =========================================================
// Sale Form (Cash Only)
// =========================================================

function SaleForm({ onClose, onSuccess }) {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || 'fa').toLowerCase().startsWith('en');

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [addingCategory, setAddingCategory] = useState(false);
    const [categoryError, setCategoryError] = useState('');

    const [productId, setProductId] = useState('');
    const [saleOptionId, setSaleOptionId] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unitPrice, setUnitPrice] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [note, setNote] = useState('');

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // ═══ Derived ═══
    const product = useMemo(
        () => products.find((p) => String(p.id) === String(productId)) || null,
        [products, productId]
    );

    const saleOptions = useMemo(
        () => (Array.isArray(product?.saleOptions) ? product.saleOptions : []),
        [product]
    );

    const selectedOption = useMemo(
        () => saleOptions.find((o) => o.id === saleOptionId) || saleOptions[0] || null,
        [saleOptions, saleOptionId]
    );

    const stockBase = Number(product?.stock) || 0;
    const avgCost = Number(product?.avgCost) || 0;
    const baseUnit = product?.baseUnit || '';
    const saleFactor = Number(selectedOption?.factor) || 1;
    const costForSaleUnit = avgCost * saleFactor;
    const availableInSaleUnit = saleFactor > 0 ? stockBase / saleFactor : stockBase;

    const qtyNum = toNumber(quantity);
    const qtyInBase = qtyNum * saleFactor;
    const priceNum = toNumber(unitPrice);
    const total = qtyNum * priceNum;

    const profitPerUnit = priceNum - costForSaleUnit;
    const saleProfit = profitPerUnit * qtyNum;
    const margin = priceNum > 0 ? (profitPerUnit / priceNum) * 100 : 0;

    const insufficientStock = qtyInBase > stockBase;
    const belowCost = priceNum > 0 && profitPerUnit < 0;
    const thinMargin = priceNum > 0 && profitPerUnit > 0 && margin < 10;

    // ═══ Load ═══
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

    // ═══ Category inline add ═══
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

    // ═══ Product / Option ═══
    const handleProductChange = (value) => {
        setProductId(value);
        const p = products.find((pp) => String(pp.id) === String(value));

        if (!p) {
            setSaleOptionId('');
            setCategory('');
            setUnitPrice('');
            return;
        }

        const opts = Array.isArray(p.saleOptions) ? p.saleOptions : [];
        const defaultOpt = opts.find((o) => o.isDefault) || opts[0] || null;

        if (defaultOpt) {
            setSaleOptionId(defaultOpt.id);
            setUnitPrice(String(defaultOpt.price ?? ''));
        } else {
            setSaleOptionId('');
            setUnitPrice('');
        }

        setCategory(p.category || '');
        setError('');
    };

    const handleOptionChange = (id) => {
        setSaleOptionId(id);
        const opt = saleOptions.find((o) => o.id === id);
        if (opt) setUnitPrice(String(opt.price ?? ''));
        setError('');
    };

    // ═══ Submit (always cash) ═══
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;

        try {
            setSaving(true);
            setError('');

            if (!product) throw new Error(t('sales.form.errors.productRequired'));
            if (!selectedOption) {
                throw new Error(
                    isEnglish
                        ? 'This product has no sale options defined.'
                        : 'برای این محصول هیچ روش فروشی تعریف نشده است.'
                );
            }
            if (!category.trim()) throw new Error(t('sales.form.errors.categoryRequired'));
            if (qtyNum <= 0) throw new Error(t('sales.form.errors.quantityInvalid'));
            if (unitPrice === '' || priceNum < 0) {
                throw new Error(t('sales.form.errors.priceInvalid'));
            }
            if (insufficientStock) {
                throw new Error(
                    isEnglish
                        ? `Insufficient stock. Available: ${fmt(availableInSaleUnit, isEnglish)} ${selectedOption.unit}`
                        : `موجودی کافی نیست. موجودی فعلی: ${fmt(availableInSaleUnit, isEnglish)} ${selectedOption.unit}`
                );
            }

            await addSale({
                productId: product.id,
                productName: product.name,
                category: category.trim(),
                quantity: qtyNum,
                unitPrice: priceNum,
                total: qtyNum * priceNum,
                saleOptionId: selectedOption.id,
                saleUnit: selectedOption.unit,
                saleFactor,
                quantityInBase: qtyInBase,
                paymentType: 'cash', // ← always cash
                customerName: customerName.trim(),
                customerPhone: toEnglishNumbers(customerPhone.trim()),
                note: note.trim(),
                date: new Date().toISOString(),
            });

            if (onSuccess) await onSuccess();
            else onClose();
        } catch (err) {
            console.error('Failed to create sale:', err);
            setError(err?.message || t('sales.form.errors.submit'));
        } finally {
            setSaving(false);
        }
    };

    const iconPosition = isEnglish ? 'left-3' : 'right-3';
    const inputIconPadding = isEnglish ? 'pl-10 pr-4' : 'pr-10 pl-4';

    return (
        <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/[0.5] p-2 backdrop-blur-md sm:p-4 dark:bg-black/[0.6]"
        >
            <div className="ui-modal flex max-h-[calc(100vh-1rem)] w-full max-w-2xl flex-col sm:max-h-[90vh]">
                {/* Header */}
                <div className="ui-modal-header flex flex-shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 sm:h-11 sm:w-11">
                            <Banknote size={19} className="text-emerald-500 dark:text-emerald-400" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-bold text-[var(--text)] sm:text-lg">
                                    {t('sales.form.title')}
                                </h2>
                                <span className="rounded-lg border border-emerald-500/15 bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                                    {isEnglish ? 'Cash' : 'نقدی'}
                                </span>
                            </div>
                            <p className="mt-1 text-[11px] text-[var(--text-muted)] sm:text-xs">
                                {t('sales.form.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label={t('common.closeMenu')}
                        className="ui-icon-button h-9 w-9 rounded-lg"
                    >
                        <X size={19} />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="main-scrollbar flex-1 min-h-0 space-y-5 overflow-y-auto p-4 sm:space-y-6 sm:p-6"
                >
                    {error && (
                        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-500 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Product & Sale Unit */}
                    <section>
                        <SectionLabel icon={Package} title={t('sales.form.productSection.title')} />

                        {loadingData ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={22} className="animate-spin text-[var(--accent-500)]" />
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="min-w-0">
                                        <FieldLabel>{t('sales.form.fields.product')}</FieldLabel>
                                        <IconField icon={Package} isEnglish={isEnglish}>
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
                                        </IconField>
                                    </div>

                                    <div className="min-w-0">
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <label className="text-xs text-[var(--text-muted)]">
                                                {t('sales.form.fields.category')}
                                            </label>
                                            <button
                                                type="button"
                                                disabled={saving}
                                                onClick={() => {
                                                    setShowNewCategory(!showNewCategory);
                                                    setCategoryError('');
                                                }}
                                                className="flex shrink-0 items-center gap-1 text-[11px] text-[var(--accent-500)] transition hover:text-[var(--accent-400)] disabled:opacity-50"
                                            >
                                                <Plus size={13} />
                                                {t('sales.form.category.new')}
                                            </button>
                                        </div>

                                        <IconField icon={Tag} isEnglish={isEnglish}>
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
                                        </IconField>

                                        {showNewCategory && (
                                            <div className="mt-3 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3">
                                                <div className="flex flex-col gap-2 min-[420px]:flex-row">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={newCategoryName}
                                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                handleAddCategory();
                                                            }
                                                        }}
                                                        placeholder={t('sales.form.category.placeholder')}
                                                        disabled={addingCategory}
                                                        className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg-focus)] px-3 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--input-border-focus)]"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleAddCategory}
                                                        disabled={addingCategory}
                                                        className="ui-button-primary h-10 px-4 text-sm"
                                                    >
                                                        {addingCategory ? (
                                                            <Loader2 size={15} className="animate-spin" />
                                                        ) : (
                                                            <Check size={15} />
                                                        )}
                                                        {t('sales.form.category.add')}
                                                    </button>
                                                </div>
                                                {categoryError && (
                                                    <p className="mt-2 text-xs text-red-500 dark:text-red-400">
                                                        {categoryError}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Product Info */}
                                {product && (
                                    <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-3 py-2.5">
                                            <div className="flex min-w-0 items-center gap-2">
                                                <Warehouse size={14} className="shrink-0 text-[var(--text-muted)]" />
                                                <span className="text-[11px] text-[var(--text-muted)]">
                                                    {isEnglish ? 'Available stock' : 'موجودی قابل فروش'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="number-font text-sm font-semibold text-[var(--text-primary)]">
                                                    {fmt(stockBase, isEnglish)} {baseUnit}
                                                </span>
                                                {selectedOption && saleFactor !== 1 && (
                                                    <span className="text-[10px] text-[var(--text-muted)]">
                                                        (≈ {fmt(availableInSaleUnit, isEnglish)} {selectedOption.unit})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-px bg-[var(--border-subtle)] sm:grid-cols-3">
                                            <InfoCell
                                                label={isEnglish ? 'Avg cost / unit' : 'میانگین هزینه هر واحد'}
                                                value={`${fmt(avgCost, isEnglish)} ${isEnglish ? 'AF' : 'افغانی'} / ${baseUnit || '-'}`}
                                            />
                                            {selectedOption && (
                                                <InfoCell
                                                    label={isEnglish ? 'Cost / sale unit' : 'هزینه هر واحد فروش'}
                                                    value={`${fmt(costForSaleUnit, isEnglish)} ${isEnglish ? 'AF' : 'افغانی'} / ${selectedOption.unit}`}
                                                />
                                            )}
                                            <InfoCell
                                                label={isEnglish ? 'Min stock' : 'حداقل موجودی'}
                                                value={`${fmt(product.minStock || 0, isEnglish)} ${baseUnit}`}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* No Sale Options */}
                                {product && saleOptions.length === 0 && (
                                    <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-3 text-rose-600 dark:text-rose-400">
                                        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                                        <div className="text-[11px] leading-5">
                                            {isEnglish
                                                ? 'This product has no sale options. Go to Products and add at least one.'
                                                : 'این محصول هیچ روش فروشی ندارد. از بخش محصولات حداقل یکی اضافه کنید.'}
                                        </div>
                                    </div>
                                )}

                                {/* Sale Unit selection */}
                                {product && saleOptions.length > 0 && (
                                    <div className="mt-4">
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <label className="text-xs font-medium text-[var(--text-muted)]">
                                                {isEnglish ? 'Sale Unit' : 'واحد فروش'}
                                                <span className="ms-1.5 inline-flex items-center gap-1 text-[9px] text-[var(--text-soft)]">
                                                    <Ruler size={10} />
                                                    {isEnglish ? 'how this sale is measured' : 'بر چه اساسی این فروش'}
                                                </span>
                                            </label>
                                        </div>

                                        {saleOptions.length === 1 ? (
                                            <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] px-3 py-2.5">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <Ruler size={14} className="shrink-0 text-emerald-500" />
                                                    <span className="truncate text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {saleOptions[0].unit}
                                                    </span>
                                                    {Number(saleOptions[0].factor) !== 1 && (
                                                        <span className="text-[10px] text-[var(--text-muted)]">
                                                            × {fmt(saleOptions[0].factor, isEnglish)} {baseUnit}
                                                        </span>
                                                    )}
                                                    {saleOptions[0].isDefault && (
                                                        <Star size={10} className="text-emerald-500 fill-current" />
                                                    )}
                                                </div>
                                                <span className="number-font text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {fmt(saleOptions[0].price, isEnglish)} {isEnglish ? 'AF' : 'افغانی'}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {saleOptions.map((opt) => {
                                                    const isSelected = opt.id === selectedOption?.id;
                                                    const f = Number(opt.factor) || 1;
                                                    const availInUnit = f > 0 ? stockBase / f : 0;
                                                    return (
                                                        <button
                                                            key={opt.id}
                                                            type="button"
                                                            onClick={() => handleOptionChange(opt.id)}
                                                            disabled={saving}
                                                            className={`group relative flex min-w-0 items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-start transition-all ${
                                                                isSelected
                                                                    ? 'border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_0_2px_rgba(16,185,129,0.15)]'
                                                                    : 'border-[var(--border)] bg-[var(--input-bg)] hover:border-[var(--input-border-focus)]'
                                                            }`}
                                                        >
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <Ruler size={14} className={`shrink-0 ${isSelected ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`} />
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="truncate text-sm font-semibold text-[var(--text)]">
                                                                            {opt.unit}
                                                                        </span>
                                                                        {f !== 1 && (
                                                                            <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
                                                                                × {fmt(f, isEnglish)}
                                                                            </span>
                                                                        )}
                                                                        {opt.isDefault && (
                                                                            <Star size={10} className="shrink-0 text-emerald-500 fill-current" />
                                                                        )}
                                                                    </div>
                                                                    <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                                                                        {isEnglish ? 'Available: ' : 'موجودی: '}
                                                                        <span className="number-font">
                                                                            {fmt(availInUnit, isEnglish)} {opt.unit}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <span className={`number-font shrink-0 text-xs font-semibold ${isSelected ? 'text-emerald-500' : 'text-[var(--text-secondary)]'}`}>
                                                                {fmt(opt.price, isEnglish)}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Quantity + Price */}
                                {product && selectedOption && (
                                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div className="min-w-0">
                                            <FieldLabel>
                                                {t('sales.form.fields.quantity')}
                                                <span className="ms-1 text-[10px] text-[var(--text-soft)]">
                                                    ({selectedOption.unit})
                                                </span>
                                            </FieldLabel>
                                            <IconField icon={Hash} isEnglish={isEnglish}>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={quantity}
                                                    onChange={(e) => {
                                                        setQuantity(normalizeNumericInput(e.target.value));
                                                        setError('');
                                                    }}
                                                    disabled={saving}
                                                    className={`${FIELD_CLASS} ${isEnglish ? 'pl-10 pr-4' : 'pr-10 pl-4'}`}
                                                />
                                            </IconField>
                                            {qtyNum > 0 && saleFactor !== 1 && (
                                                <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
                                                    = <span className="number-font font-medium text-[var(--text-secondary)]">
                                                        {fmt(qtyInBase, isEnglish)} {baseUnit}
                                                    </span>
                                                </p>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <FieldLabel>
                                                {t('sales.form.fields.unitPrice')}
                                                <span className="ms-1 text-[10px] text-[var(--text-soft)]">
                                                    / {selectedOption.unit}
                                                </span>
                                            </FieldLabel>
                                            <IconField icon={DollarSign} isEnglish={isEnglish}>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={unitPrice}
                                                    onChange={(e) => {
                                                        setUnitPrice(normalizeNumericInput(e.target.value));
                                                        setError('');
                                                    }}
                                                    disabled={saving}
                                                    className={`${FIELD_CLASS} ${isEnglish ? 'pl-10 pr-14' : 'pr-10 pl-14'}`}
                                                />
                                                <span className={`pointer-events-none absolute ${isEnglish ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-xs text-[var(--text-soft)]`}>
                                                    {t('common.currency')}
                                                </span>
                                            </IconField>

                                            {priceNum > 0 && costForSaleUnit > 0 && (
                                                <div className={`mt-1.5 flex items-center gap-1 text-[10px] ${
                                                    belowCost
                                                        ? 'text-rose-500 dark:text-rose-400'
                                                        : thinMargin
                                                            ? 'text-amber-500 dark:text-amber-400'
                                                            : 'text-emerald-600 dark:text-emerald-400'
                                                }`}>
                                                    {belowCost ? <TrendingDown size={11} /> : <TrendingUp size={11} />}
                                                    {belowCost ? (
                                                        <span>{isEnglish ? `Below cost (${fmt(costForSaleUnit, isEnglish)} AF)` : `زیر قیمت خرید (${fmt(costForSaleUnit, isEnglish)} افغانی)`}</span>
                                                    ) : (
                                                        <span>{isEnglish ? `Profit: ${fmt(profitPerUnit, isEnglish)} AF (${margin.toFixed(1)}%)` : `سود: ${fmt(profitPerUnit, isEnglish)} افغانی (${margin.toFixed(1)}٪)`}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {product && selectedOption && qtyNum > 0 && insufficientStock && (
                                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-3 text-rose-600 dark:text-rose-400">
                                        <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                                        <div className="text-[11px] leading-5">
                                            {isEnglish
                                                ? `Insufficient stock. You have ${fmt(availableInSaleUnit, isEnglish)} ${selectedOption.unit} but trying to sell ${fmt(qtyNum, isEnglish)} ${selectedOption.unit}.`
                                                : `موجودی کافی نیست. شما ${fmt(availableInSaleUnit, isEnglish)} ${selectedOption.unit} دارید ولی می‌خواهید ${fmt(qtyNum, isEnglish)} ${selectedOption.unit} بفروشید.`}
                                        </div>
                                    </div>
                                )}

                                {product && selectedOption && belowCost && (
                                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3 text-amber-600 dark:text-amber-400">
                                        <Info size={15} className="mt-0.5 shrink-0" />
                                        <div className="text-[11px] leading-5">
                                            {isEnglish
                                                ? 'Sale price is below cost — you will lose money on this sale.'
                                                : 'قیمت فروش زیر قیمت خرید است — در این فروش ضرر می‌کنید.'}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </section>

                    {/* Total */}
                    {product && selectedOption && (
                        <section className="relative overflow-hidden rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4 sm:p-5">
                            <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
                            <div className="relative flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/10">
                                        <Calculator size={18} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-[var(--text-secondary)]">
                                            {t('sales.form.total.title')}
                                        </p>
                                        <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                                            {t('sales.form.total.description')}
                                        </p>
                                    </div>
                                </div>
                                <div className={`${isEnglish ? 'text-left' : 'text-right'} min-[420px]:shrink-0`}>
                                    <p dir="ltr" className="number-font text-2xl font-bold text-emerald-500">
                                        {fmt(total, isEnglish)}
                                        <span className="ms-1 text-xs font-normal text-[var(--text-muted)]">
                                            {t('common.currency')}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {priceNum > 0 && costForSaleUnit > 0 && qtyNum > 0 && (
                                <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-emerald-500/20 pt-3 text-[11px]">
                                    <span className="text-[var(--text-muted)]">
                                        {isEnglish ? 'Expected profit:' : 'سود تخمینی:'}
                                    </span>
                                    <span className={`number-font font-semibold ${
                                        saleProfit < 0
                                            ? 'text-rose-500 dark:text-rose-400'
                                            : 'text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                        {saleProfit >= 0 ? '+' : ''}{fmt(saleProfit, isEnglish)} {isEnglish ? 'AF' : 'افغانی'}
                                    </span>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Customer (optional) */}
                    <section>
                        <SectionLabel icon={User} title={t('sales.form.customer.title')} />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <input
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder={isEnglish ? 'Customer name (optional)' : 'نام مشتری (اختیاری)'}
                                disabled={saving}
                                className={`${FIELD_CLASS} px-4`}
                            />
                            <IconField icon={Phone} isEnglish={isEnglish}>
                                <input
                                    type="tel"
                                    dir="ltr"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(toEnglishNumbers(e.target.value))}
                                    placeholder={isEnglish ? 'Phone (optional)' : 'شماره تماس (اختیاری)'}
                                    disabled={saving}
                                    className={`${FIELD_CLASS} ${isEnglish ? 'pl-10 pr-4' : 'pr-10 pl-4'}`}
                                />
                            </IconField>
                        </div>
                    </section>

                    {/* Note */}
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

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="ui-button-secondary h-11 w-full px-5 text-sm sm:w-auto"
                        >
                            {t('sales.form.actions.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving || loadingData || !product || !selectedOption || insufficientStock}
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

// =========================================================
// Info Cell
// =========================================================

function InfoCell({ label, value }) {
    return (
        <div className="min-w-0 bg-[var(--surface)] p-2.5">
            <p className="truncate text-[9.5px] text-[var(--text-muted)]">{label}</p>
            <p dir="auto" className="number-font mt-1 truncate text-xs font-medium text-[var(--text-secondary)]">
                {value}
            </p>
        </div>
    );
}

export default SaleForm;