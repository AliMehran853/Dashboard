import { useEffect, useMemo, useState } from 'react';
import {
    X, User, Phone, Package, Hash, CalendarDays, CreditCard, Wallet,
    Save, Loader2, Ruler, AlertTriangle, TrendingUp, TrendingDown,
    Info, Star, Warehouse, Calculator, Clock, AlertCircle, FileText,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../../database/db';

// =========================================================
// Helpers
// =========================================================

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const toNumber = (value) => {
    const normalized = toEnglishNumbers(value)
        .replace(/,/g, '')
        .replace(/٬/g, '')
        .replace(/[^\d.-]/g, '');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
};

const normalizeNumericInput = (v) =>
    toEnglishNumbers(v).replace(/[^\d.]/g, '').replace(/^(\d*\.\d*).*$/, '$1');

const fmt = (v, isEnglish) =>
    new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(v) || 0);

const getTodayIso = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
    ).padStart(2, '0')}`;
};

const addDaysIso = (isoDate, days) => {
    const d = isoDate ? new Date(isoDate) : new Date();
    if (Number.isNaN(d.getTime())) return '';
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
    ).padStart(2, '0')}`;
};

const isPastDate = (isoDate) => {
    if (!isoDate) return false;
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);
    return d < today;
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

// =========================================================
// Credit Sale Form
// =========================================================

function CreditSaleForm({ onClose, onSubmit }) {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || 'fa').toLowerCase().startsWith('en');

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [customerName, setCustomerName] = useState('');
    const [phone, setPhone] = useState('');
    const [productId, setProductId] = useState('');
    const [saleOptionId, setSaleOptionId] = useState('');
    const [quantity, setQuantity] = useState('1');
    const [unitPrice, setUnitPrice] = useState('');
    const [date, setDate] = useState(getTodayIso());
    const [dueDate, setDueDate] = useState('');
    const [note, setNote] = useState('');

    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // ═══ Load products ═══
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

    // ═══ Escape + Ctrl/Cmd + Enter ═══
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !saving) onClose?.();
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !saving) {
                e.preventDefault();
                const form = document.querySelector('form[data-credit-sale-form]');
                form?.requestSubmit?.();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose, saving]);

    // ═══ Products with stock > 0 ═══
    const availableProducts = useMemo(
        () => products.filter((p) => (Number(p?.stock) || 0) > 0),
        [products]
    );

    // ═══ Derived product + option + math ═══
    const product = useMemo(
        () => availableProducts.find((p) => String(p.id) === String(productId)) || null,
        [availableProducts, productId]
    );

    const saleOptions = useMemo(
        () => (Array.isArray(product?.saleOptions) ? product.saleOptions : []),
        [product]
    );

    const selectedOption = useMemo(
        () =>
            saleOptions.find((o) => o.id === saleOptionId) ||
            saleOptions[0] ||
            null,
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
    const totalAmount = qtyNum * priceNum;

    const profitPerUnit = priceNum - costForSaleUnit;
    const totalProfit = profitPerUnit * qtyNum;
    const margin = priceNum > 0 ? (profitPerUnit / priceNum) * 100 : 0;

    const insufficientStock = qtyInBase > stockBase && stockBase >= 0;
    const belowCost = priceNum > 0 && profitPerUnit < 0;
    const dueDateIsPast = isPastDate(dueDate);

    // ═══ Handlers ═══
    const handleProductChange = (value) => {
        setProductId(value);
        const p = availableProducts.find((pp) => String(pp.id) === String(value));
        if (!p) {
            setSaleOptionId('');
            setUnitPrice('');
            setError('');
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
        setError('');
    };

    const handleOptionChange = (id) => {
        setSaleOptionId(id);
        const opt = saleOptions.find((o) => o.id === id);
        if (opt) setUnitPrice(String(opt.price ?? ''));
        setError('');
    };

    // ═══ Submit (FIXED: async + await) ═══
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;

        // ─── Validation ───
        if (!customerName.trim()) {
            setError(t('credit.saleForm.errors.customerRequired'));
            return;
        }
        if (!product) {
            setError(t('credit.saleForm.errors.productRequired'));
            return;
        }
        if (!selectedOption) {
            setError(
                isEnglish
                    ? 'This product has no sale options defined.'
                    : 'برای این محصول هیچ روش فروشی تعریف نشده است.'
            );
            return;
        }
        if (qtyNum <= 0) {
            setError(t('credit.saleForm.errors.quantityRequired'));
            return;
        }
        if (unitPrice === '' || priceNum < 0) {
            setError(t('credit.saleForm.errors.priceInvalid'));
            return;
        }
        if (insufficientStock) {
            setError(
                isEnglish
                    ? `Insufficient stock. Available: ${fmt(availableInSaleUnit, isEnglish)} ${selectedOption.unit}`
                    : `موجودی کافی نیست. موجودی فعلی: ${fmt(availableInSaleUnit, isEnglish)} ${selectedOption.unit}`
            );
            return;
        }
        if (!date) {
            setError(
                isEnglish ? 'Sale date is required.' : 'تاریخ فروش الزامی است.'
            );
            return;
        }

        const cleanName = customerName.trim();
        const cleanPhone = toEnglishNumbers(phone.trim());
        const cleanNote = note.trim();
        const saleDate = new Date(date).toISOString();
        const dueDateIso = dueDate ? new Date(dueDate).toISOString() : null;

        setSaving(true);
        setError('');

        try {
            await onSubmit?.({
                // Product
                productId: product.id,
                productName: product.name,
                product: product.name, // legacy alias
                category: product.category || '',

                // Quantity & units
                quantity: qtyNum,
                saleOptionId: selectedOption.id,
                saleUnit: selectedOption.unit,
                saleFactor,
                quantityInBase: qtyInBase,
                unitPrice: priceNum,
                total: totalAmount,
                totalAmount, // legacy alias

                // Payment
                paymentType: 'credit',

                // Customer
                customerName: cleanName,
                customerPhone: cleanPhone,
                phone: cleanPhone, // legacy alias

                // Meta
                note: cleanNote,
                date: saleDate,
                dueDate: dueDateIso,
            });
        } catch (err) {
            console.error('Credit sale submit failed:', err);
            setError(err?.message || t('credit.saleForm.errors.submit'));
        } finally {
            setSaving(false);
        }
    };

    const iconPosition = isEnglish ? 'left-3' : 'right-3';
    const inputIconPadding = isEnglish ? 'pl-10 pr-4' : 'pr-10 pl-4';

    // Quick-pick options for due date
    const DUE_QUICK_PICKS = [
        { key: 'week', label: isEnglish ? '1 week' : '۱ هفته', days: 7 },
        { key: 'twoWeeks', label: isEnglish ? '2 weeks' : '۲ هفته', days: 14 },
        { key: 'month', label: isEnglish ? '1 month' : '۱ ماه', days: 30 },
    ];

    // Submit disable reasons
    const submitDisabled =
        saving ||
        loadingProducts ||
        !product ||
        !selectedOption ||
        insufficientStock;

    return (
        <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/[0.26] p-2 backdrop-blur-[18px] backdrop-saturate-[0.72] animate-[profileBackdropIn_180ms_ease-out] sm:p-4 dark:bg-black/[0.50]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !saving) onClose?.();
            }}
            role="presentation"
        >
            <div
                className="ui-modal relative flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden animate-[profileModalIn_180ms_ease-out] sm:max-h-[90vh]"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* ═══ Header ═══ */}
                <div className="ui-modal-header flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/15 bg-amber-500/10 sm:h-11 sm:w-11">
                            <CreditCard size={20} className="text-amber-500" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-base font-bold text-[var(--text)] sm:text-lg">
                                    {t('credit.saleForm.title')}
                                </h2>
                                <span className="rounded-lg border border-amber-500/15 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-500">
                                    {t('credit.saleForm.badge')}
                                </span>
                            </div>
                            <p className="mt-1 text-[11px] text-[var(--text-muted)] sm:text-xs">
                                {t('credit.saleForm.subtitle')}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label={t('common.closeMenu')}
                        className="ui-icon-button h-9 w-9 shrink-0 disabled:opacity-50"
                    >
                        <X size={19} />
                    </button>
                </div>

                <form
                    data-credit-sale-form
                    onSubmit={handleSubmit}
                    className="main-scrollbar flex-1 min-h-0 overflow-y-auto"
                >
                    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-500 sm:text-sm dark:text-red-400"
                            >
                                {error}
                            </div>
                        )}

                        {/* ═══ Customer ═══ */}
                        <section>
                            <SectionTitle
                                icon={User}
                                title={t('credit.saleForm.customer.title')}
                            />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <Field
                                    label={t('credit.saleForm.customer.name')}
                                    icon={User}
                                    iconPosition={iconPosition}
                                >
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => {
                                            setCustomerName(e.target.value);
                                            setError('');
                                        }}
                                        disabled={saving}
                                        placeholder={t(
                                            'credit.saleForm.customer.namePlaceholder'
                                        )}
                                        className={`${FIELD_CLASS} ${inputIconPadding}`}
                                    />
                                </Field>
                                <Field
                                    label={t('credit.saleForm.customer.phone')}
                                    optional={t('credit.saleForm.optional')}
                                    icon={Phone}
                                    iconPosition={iconPosition}
                                >
                                    <input
                                        type="tel"
                                        dir="ltr"
                                        value={phone}
                                        onChange={(e) => {
                                            setPhone(toEnglishNumbers(e.target.value));
                                            setError('');
                                        }}
                                        disabled={saving}
                                        placeholder={t(
                                            'credit.saleForm.customer.phonePlaceholder'
                                        )}
                                        className={`${FIELD_CLASS} ${inputIconPadding}`}
                                    />
                                </Field>
                            </div>
                        </section>

                        <div className="h-px bg-[var(--border)]" />

                        {/* ═══ Sale ═══ */}
                        <section>
                            <SectionTitle
                                icon={Package}
                                title={t('credit.saleForm.sale.title')}
                            />

                            {loadingProducts ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2
                                        size={22}
                                        className="animate-spin text-amber-500"
                                    />
                                </div>
                            ) : (
                                <>
                                    {/* Product */}
                                    <Field
                                        label={t('credit.saleForm.sale.product')}
                                        icon={Package}
                                        iconPosition={iconPosition}
                                    >
                                        <select
                                            value={productId}
                                            onChange={(e) =>
                                                handleProductChange(e.target.value)
                                            }
                                            disabled={saving}
                                            className={`${FIELD_CLASS} ${inputIconPadding} cursor-pointer`}
                                        >
                                            <option value="">
                                                {t('credit.saleForm.sale.productPlaceholder')}
                                            </option>
                                            {availableProducts.map((p) => (
                                                <option key={p.id} value={p.id}>
                                                    {p.name}
                                                </option>
                                            ))}
                                        </select>
                                    </Field>

                                    {/* Product Info Card */}
                                    {product && (
                                        <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] px-3 py-2.5">
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <Warehouse
                                                        size={14}
                                                        className="shrink-0 text-[var(--text-muted)]"
                                                    />
                                                    <span className="text-[11px] text-[var(--text-muted)]">
                                                        {isEnglish
                                                            ? 'Available stock'
                                                            : 'موجودی قابل فروش'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="number-font text-sm font-semibold text-[var(--text-primary)]">
                                                        {fmt(stockBase, isEnglish)}{' '}
                                                        {baseUnit}
                                                    </span>
                                                    {selectedOption && saleFactor !== 1 && (
                                                        <span className="text-[10px] text-[var(--text-muted)]">
                                                            (≈{' '}
                                                            {fmt(
                                                                availableInSaleUnit,
                                                                isEnglish
                                                            )}{' '}
                                                            {selectedOption.unit})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-px bg-[var(--border-subtle)] sm:grid-cols-3">
                                                <InfoCell
                                                    label={
                                                        isEnglish
                                                            ? 'Avg cost / unit'
                                                            : 'میانگین هزینه هر واحد'
                                                    }
                                                    value={`${fmt(
                                                        avgCost,
                                                        isEnglish
                                                    )} ${isEnglish ? 'AF' : 'افغانی'} / ${
                                                        baseUnit || '-'
                                                    }`}
                                                />
                                                {selectedOption && (
                                                    <InfoCell
                                                        label={
                                                            isEnglish
                                                                ? 'Cost / sale unit'
                                                                : 'هزینه هر واحد فروش'
                                                        }
                                                        value={`${fmt(
                                                            costForSaleUnit,
                                                            isEnglish
                                                        )} ${isEnglish ? 'AF' : 'افغانی'} / ${
                                                            selectedOption.unit
                                                        }`}
                                                    />
                                                )}
                                                <InfoCell
                                                    label={
                                                        isEnglish
                                                            ? 'Min stock'
                                                            : 'حداقل موجودی'
                                                    }
                                                    value={`${fmt(
                                                        product.minStock || 0,
                                                        isEnglish
                                                    )} ${baseUnit}`}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* No Sale Options */}
                                    {product && saleOptions.length === 0 && (
                                        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.05] p-3 text-rose-600 dark:text-rose-400">
                                            <AlertTriangle
                                                size={15}
                                                className="mt-0.5 shrink-0"
                                            />
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
                                                    {isEnglish
                                                        ? 'Sale Unit'
                                                        : 'واحد فروش'}
                                                    <span className="ms-1.5 inline-flex items-center gap-1 text-[9px] text-[var(--text-soft)]">
                                                        <Ruler size={10} />
                                                        {isEnglish
                                                            ? 'how this sale is measured'
                                                            : 'بر چه اساسی این فروش'}
                                                    </span>
                                                </label>
                                            </div>

                                            {saleOptions.length === 1 ? (
                                                <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-3 py-2.5">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <Ruler
                                                            size={14}
                                                            className="shrink-0 text-amber-500"
                                                        />
                                                        <span className="truncate text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                            {saleOptions[0].unit}
                                                        </span>
                                                        {Number(
                                                            saleOptions[0].factor
                                                        ) !== 1 && (
                                                            <span className="text-[10px] text-[var(--text-muted)]">
                                                                ×{' '}
                                                                {fmt(
                                                                    saleOptions[0].factor,
                                                                    isEnglish
                                                                )}{' '}
                                                                {baseUnit}
                                                            </span>
                                                        )}
                                                        {saleOptions[0].isDefault && (
                                                            <Star
                                                                size={10}
                                                                className="text-amber-500 fill-current"
                                                            />
                                                        )}
                                                    </div>
                                                    <span className="number-font text-xs font-semibold text-amber-600 dark:text-amber-400">
                                                        {fmt(
                                                            saleOptions[0].price,
                                                            isEnglish
                                                        )}{' '}
                                                        {isEnglish ? 'AF' : 'افغانی'}
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                    {saleOptions.map((opt) => {
                                                        const isSelected =
                                                            opt.id ===
                                                            selectedOption?.id;
                                                        const f =
                                                            Number(opt.factor) || 1;
                                                        const availInUnit =
                                                            f > 0
                                                                ? stockBase / f
                                                                : 0;
                                                        return (
                                                            <button
                                                                key={opt.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    handleOptionChange(
                                                                        opt.id
                                                                    )
                                                                }
                                                                disabled={saving}
                                                                className={`group relative flex min-w-0 items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-start transition-all ${
                                                                    isSelected
                                                                        ? 'border-amber-500/30 bg-amber-500/10 shadow-[0_0_0_2px_rgba(245,158,11,0.15)]'
                                                                        : 'border-[var(--border)] bg-[var(--input-bg)] hover:border-[var(--input-border-focus)]'
                                                                }`}
                                                            >
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <Ruler
                                                                        size={14}
                                                                        className={`shrink-0 ${
                                                                            isSelected
                                                                                ? 'text-amber-500'
                                                                                : 'text-[var(--text-muted)]'
                                                                        }`}
                                                                    />
                                                                    <div className="min-w-0">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <span className="truncate text-sm font-semibold text-[var(--text)]">
                                                                                {opt.unit}
                                                                            </span>
                                                                            {f !== 1 && (
                                                                                <span className="shrink-0 text-[10px] text-[var(--text-muted)]">
                                                                                    ×{' '}
                                                                                    {fmt(
                                                                                        f,
                                                                                        isEnglish
                                                                                    )}
                                                                                </span>
                                                                            )}
                                                                            {opt.isDefault && (
                                                                                <Star
                                                                                    size={
                                                                                        10
                                                                                    }
                                                                                    className="shrink-0 text-amber-500 fill-current"
                                                                                />
                                                                            )}
                                                                        </div>
                                                                        <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                                                                            {isEnglish
                                                                                ? 'Available: '
                                                                                : 'موجودی: '}
                                                                            <span className="number-font">
                                                                                {fmt(
                                                                                    availInUnit,
                                                                                    isEnglish
                                                                                )}{' '}
                                                                                {
                                                                                    opt.unit
                                                                                }
                                                                            </span>
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <span
                                                                    className={`number-font shrink-0 text-xs font-semibold ${
                                                                        isSelected
                                                                            ? 'text-amber-500'
                                                                            : 'text-[var(--text-secondary)]'
                                                                    }`}
                                                                >
                                                                    {fmt(
                                                                        opt.price,
                                                                        isEnglish
                                                                    )}
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
                                            <Field
                                                label={
                                                    <>
                                                        {t(
                                                            'credit.saleForm.sale.quantity'
                                                        )}
                                                        <span className="ms-1 text-[10px] text-[var(--text-soft)]">
                                                            ({selectedOption.unit})
                                                        </span>
                                                    </>
                                                }
                                                icon={Hash}
                                                iconPosition={iconPosition}
                                            >
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={quantity}
                                                    onChange={(e) => {
                                                        setQuantity(
                                                            normalizeNumericInput(
                                                                e.target.value
                                                            )
                                                        );
                                                        setError('');
                                                    }}
                                                    disabled={saving}
                                                    placeholder={t(
                                                        'credit.saleForm.sale.quantityPlaceholder'
                                                    )}
                                                    className={`${FIELD_CLASS} ${inputIconPadding}`}
                                                />
                                                {qtyNum > 0 && saleFactor !== 1 && (
                                                    <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
                                                        ={' '}
                                                        <span className="number-font font-medium text-[var(--text-secondary)]">
                                                            {fmt(qtyInBase, isEnglish)}{' '}
                                                            {baseUnit}
                                                        </span>
                                                    </p>
                                                )}
                                            </Field>

                                            <Field
                                                label={
                                                    <>
                                                        {t(
                                                            'credit.saleForm.sale.unitPrice'
                                                        )}
                                                        <span className="ms-1 text-[10px] text-[var(--text-soft)]">
                                                            / {selectedOption.unit}
                                                        </span>
                                                    </>
                                                }
                                                icon={Wallet}
                                                iconPosition={iconPosition}
                                            >
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={unitPrice}
                                                        onChange={(e) => {
                                                            setUnitPrice(
                                                                normalizeNumericInput(
                                                                    e.target.value
                                                                )
                                                            );
                                                            setError('');
                                                        }}
                                                        disabled={saving}
                                                        dir="ltr"
                                                        placeholder={t(
                                                            'credit.saleForm.sale.unitPricePlaceholder'
                                                        )}
                                                        className={`${FIELD_CLASS} ${
                                                            isEnglish
                                                                ? 'pl-10 pr-14'
                                                                : 'pr-10 pl-14'
                                                        }`}
                                                    />
                                                    <span
                                                        className={`pointer-events-none absolute ${
                                                            isEnglish
                                                                ? 'right-3'
                                                                : 'left-3'
                                                        } top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)]`}
                                                    >
                                                        {t('common.currency')}
                                                    </span>
                                                </div>

                                                {/* Profit feedback */}
                                                {priceNum > 0 &&
                                                    costForSaleUnit > 0 && (
                                                        <div
                                                            className={`mt-1.5 flex items-center gap-1 text-[10px] ${
                                                                belowCost
                                                                    ? 'text-rose-500 dark:text-rose-400'
                                                                    : 'text-emerald-600 dark:text-emerald-400'
                                                            }`}
                                                        >
                                                            {belowCost ? (
                                                                <TrendingDown
                                                                    size={11}
                                                                />
                                                            ) : (
                                                                <TrendingUp
                                                                    size={11}
                                                                />
                                                            )}
                                                            {belowCost ? (
                                                                <span>
                                                                    {isEnglish
                                                                        ? `Below cost (${fmt(costForSaleUnit, isEnglish)} AF)`
                                                                        : `زیر قیمت خرید (${fmt(costForSaleUnit, isEnglish)} افغانی)`}
                                                                </span>
                                                            ) : (
                                                                <span>
                                                                    {isEnglish
                                                                        ? `Profit: ${fmt(profitPerUnit, isEnglish)} AF (${margin.toFixed(1)}%)`
                                                                        : `سود: ${fmt(profitPerUnit, isEnglish)} افغانی (${margin.toFixed(1)}٪)`}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                            </Field>
                                        </div>
                                    )}

                                    {/* Stock warning */}
                                    {product &&
                                        selectedOption &&
                                        qtyNum > 0 &&
                                        insufficientStock && (
                                            <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] p-3 text-rose-600 dark:text-rose-400">
                                                <AlertTriangle
                                                    size={15}
                                                    className="mt-0.5 shrink-0"
                                                />
                                                <div className="text-[11px] leading-5">
                                                    {isEnglish
                                                        ? `Insufficient stock. You have ${fmt(availableInSaleUnit, isEnglish)} ${selectedOption.unit} but trying to sell ${fmt(qtyNum, isEnglish)} ${selectedOption.unit}.`
                                                        : `موجودی کافی نیست. شما ${fmt(availableInSaleUnit, isEnglish)} ${selectedOption.unit} دارید ولی می‌خواهید ${fmt(qtyNum, isEnglish)} ${selectedOption.unit} بفروشید.`}
                                                </div>
                                            </div>
                                        )}

                                    {/* Below-cost warning */}
                                    {product && selectedOption && belowCost && (
                                        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] p-3 text-amber-600 dark:text-amber-400">
                                            <Info
                                                size={15}
                                                className="mt-0.5 shrink-0"
                                            />
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

                        {/* ═══ Total ═══ */}
                        {product && selectedOption && (
                            <section className="relative overflow-hidden rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4 sm:p-5">
                                <div
                                    aria-hidden="true"
                                    className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl"
                                />
                                <div className="relative z-10 flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/10 bg-amber-500/10">
                                            <Calculator
                                                size={18}
                                                className="text-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-[var(--text-secondary)]">
                                                {t('credit.saleForm.total.title')}
                                            </p>
                                            <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                                                {t(
                                                    'credit.saleForm.total.description'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className={`${
                                            isEnglish ? 'text-left' : 'text-right'
                                        } shrink-0`}
                                    >
                                        <p
                                            dir="ltr"
                                            className="number-font text-2xl font-bold tracking-tight text-amber-500"
                                        >
                                            {fmt(totalAmount, isEnglish)}
                                            <span className="ms-1 text-sm font-medium text-[var(--text-muted)]">
                                                {t('common.currency')}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Profit summary */}
                                {priceNum > 0 &&
                                    costForSaleUnit > 0 &&
                                    qtyNum > 0 && (
                                        <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-amber-500/20 pt-3 text-[11px]">
                                            <span className="text-[var(--text-muted)]">
                                                {isEnglish
                                                    ? 'Expected profit:'
                                                    : 'سود تخمینی:'}
                                            </span>
                                            <span
                                                className={`number-font font-semibold ${
                                                    totalProfit < 0
                                                        ? 'text-rose-500 dark:text-rose-400'
                                                        : 'text-emerald-600 dark:text-emerald-400'
                                                }`}
                                            >
                                                {totalProfit >= 0 ? '+' : ''}
                                                {fmt(totalProfit, isEnglish)}{' '}
                                                {isEnglish ? 'AF' : 'افغانی'}
                                            </span>
                                        </div>
                                    )}
                            </section>
                        )}

                        {/* ═══ Dates ═══ */}
                        <section>
                            <SectionTitle
                                icon={CalendarDays}
                                title={isEnglish ? 'Dates' : 'تاریخ‌ها'}
                            />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* Sale Date */}
                                <div className="relative">
                                    <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                                        {isEnglish ? 'Sale Date' : 'تاریخ فروش'}
                                        <span className="ms-1 text-[10px] text-[var(--text-soft)]">
                                            {isEnglish ? '(required)' : '(الزامی)'}
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <CalendarDays
                                            size={16}
                                            className={`pointer-events-none absolute ${iconPosition} top-1/2 -translate-y-1/2 text-[var(--text-muted)]`}
                                        />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => {
                                                setDate(e.target.value);
                                                setError('');
                                            }}
                                            disabled={saving}
                                            className={`${FIELD_CLASS} ${inputIconPadding}`}
                                        />
                                    </div>
                                    <p className="mt-1.5 text-[10px] text-[var(--text-soft)]">
                                        {isEnglish
                                            ? 'When this sale was recorded'
                                            : 'کِی این فروش ثبت شده'}
                                    </p>
                                </div>

                                {/* Due Date */}
                                <div className="relative">
                                    <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                                        {isEnglish ? 'Due Date' : 'تاریخ سررسید'}
                                        <span className="ms-1 text-[10px] text-[var(--text-soft)]">
                                            {isEnglish ? '(optional)' : '(اختیاری)'}
                                        </span>
                                    </label>
                                    <div className="relative">
                                        <Clock
                                            size={16}
                                            className={`pointer-events-none absolute ${iconPosition} top-1/2 -translate-y-1/2 ${
                                                dueDateIsPast
                                                    ? 'text-rose-500 dark:text-rose-400'
                                                    : 'text-[var(--text-muted)]'
                                            }`}
                                        />
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => {
                                                setDueDate(e.target.value);
                                                setError('');
                                            }}
                                            disabled={saving}
                                            className={`${FIELD_CLASS} ${inputIconPadding} ${
                                                dueDate && dueDateIsPast
                                                    ? 'border-rose-400 dark:border-rose-500/50'
                                                    : ''
                                            } ${dueDate ? (isEnglish ? 'pr-10' : 'pl-10') : ''}`}
                                        />
                                        {dueDate && (
                                            <button
                                                type="button"
                                                onClick={() => setDueDate('')}
                                                disabled={saving}
                                                className={`absolute ${
                                                    isEnglish
                                                        ? 'right-2.5'
                                                        : 'left-2.5'
                                                } top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400`}
                                                title={
                                                    isEnglish ? 'Clear' : 'پاک کردن'
                                                }
                                                aria-label={
                                                    isEnglish
                                                        ? 'Clear due date'
                                                        : 'پاک کردن سررسید'
                                                }
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Quick picks */}
                                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                        {DUE_QUICK_PICKS.map((qp) => (
                                            <button
                                                key={qp.key}
                                                type="button"
                                                onClick={() => {
                                                    setDueDate(
                                                        addDaysIso(
                                                            date || getTodayIso(),
                                                            qp.days
                                                        )
                                                    );
                                                    setError('');
                                                }}
                                                disabled={saving}
                                                className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-muted)] transition hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600 disabled:opacity-50 dark:hover:text-amber-400"
                                            >
                                                {qp.label}
                                            </button>
                                        ))}
                                        {dueDate && (
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] ${
                                                    dueDateIsPast
                                                        ? 'border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                        : 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-600)] dark:text-[var(--accent-300)]'
                                                }`}
                                            >
                                                {dueDateIsPast ? (
                                                    <>
                                                        <AlertCircle size={10} />
                                                        {isEnglish
                                                            ? 'Past due!'
                                                            : 'سررسید گذشته!'}
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock size={10} />
                                                        {isEnglish
                                                            ? 'Set'
                                                            : 'تعیین‌شده'}
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-1.5 text-[10px] text-[var(--text-soft)]">
                                        {isEnglish
                                            ? 'When the customer should pay back'
                                            : 'کِی مشتری باید بدهی را بدهد'}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ═══ Note ═══ */}
                        <section>
                            <SectionTitle
                                icon={FileText}
                                title={isEnglish ? 'Note' : 'یادداشت'}
                            />
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                disabled={saving}
                                rows={2}
                                placeholder={
                                    isEnglish
                                        ? 'Optional note about this credit sale...'
                                        : 'یادداشت اختیاری درباره این فروش نسیه...'
                                }
                                className="ui-input min-h-[80px] w-full resize-none py-3"
                            />
                        </section>
                    </div>

                    {/* ═══ Footer ═══ */}
                    <div className="ui-modal-footer sticky bottom-0 flex flex-col-reverse gap-3 px-4 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <p className="hidden text-[10px] text-[var(--text-soft)] sm:block">
                            {isEnglish
                                ? 'Tip: Ctrl + Enter to save'
                                : 'نکته: Ctrl + Enter برای ذخیره'}
                        </p>
                        <div className="flex flex-col-reverse gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="ui-button-secondary h-11 w-full rounded-xl px-5 disabled:opacity-50 sm:w-auto"
                            >
                                {t('credit.saleForm.actions.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={submitDisabled}
                                className="ui-button-primary group h-11 w-full rounded-xl px-5 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {saving ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Save
                                        size={16}
                                        className="transition-transform duration-300 group-hover:-translate-y-0.5"
                                    />
                                )}
                                {saving
                                    ? t('credit.saleForm.actions.saving')
                                    : t('credit.saleForm.actions.submit')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

// =========================================================
// Sub-components
// =========================================================

function SectionTitle({ icon: Icon, title }) {
    return (
        <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)]">
                <Icon size={15} className="text-amber-500" />
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
                {optional && (
                    <span className="ms-1 text-[10px] font-normal text-[var(--text-muted)]">
                        {optional}
                    </span>
                )}
            </label>
            <div className="relative">
                <Icon
                    size={15}
                    className={`pointer-events-none absolute ${iconPosition} top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)]`}
                />
                {children}
            </div>
        </div>
    );
}

function InfoCell({ label, value }) {
    return (
        <div className="min-w-0 bg-[var(--surface)] p-2.5">
            <p className="truncate text-[9.5px] text-[var(--text-muted)]">{label}</p>
            <p
                dir="auto"
                className="number-font mt-1 truncate text-xs font-medium text-[var(--text-secondary)]"
            >
                {value}
            </p>
        </div>
    );
}

export default CreditSaleForm;