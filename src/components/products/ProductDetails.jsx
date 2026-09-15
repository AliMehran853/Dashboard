import {
    X, Package, Layers3, ShoppingCart, Warehouse, AlertTriangle,
    CheckCircle2, XCircle, TrendingUp, Hash, Pencil, Trash2,
    Star, Repeat, ArrowLeftRight, Plus, Loader2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatJalaliDate, getJalaliMonthStyle } from '../../utils/date/jalali';
import { getUnits, addPurchase } from '../../database/db';

// =========================================================
// Helpers
// =========================================================

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const toPersianNumbers = (value) =>
    String(value ?? '').replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

const getNumberLocale = (language) =>
    String(language || '').toLowerCase().startsWith('en') ? 'en-US' : 'fa-IR';

const formatNumber = (value, language, digits = 0) => {
    const n = Number(toEnglishNumbers(value)) || 0;
    return new Intl.NumberFormat(getNumberLocale(language), {
        minimumFractionDigits: digits,
        maximumFractionDigits: Math.max(digits, 2),
    }).format(n);
};

const formatDecimal = (value, language, digits = 1) => {
    const n = Number(toEnglishNumbers(value)) || 0;
    return new Intl.NumberFormat(getNumberLocale(language), {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(n);
};

const formatId = (value, language) => {
    const n = Number(toEnglishNumbers(value));
    if (Number.isNaN(n)) {
        return String(language || '').toLowerCase().startsWith('en')
            ? String(value ?? '-')
            : toPersianNumbers(String(value ?? '-'));
    }
    return formatNumber(n, language);
};

const formatDisplayDate = (date, language, jalaliMonthStyle) => {
    if (!date) return '---';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '---';
    if (String(language || '').toLowerCase().startsWith('en')) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
        }).format(parsed);
    }
    return formatJalaliDate(parsed, { monthStyle: jalaliMonthStyle, withMonthName: true });
};

const getStockStatus = (product, t) => {
    const stock = Number(toEnglishNumbers(product.stock)) || 0;
    const minStock = Number(toEnglishNumbers(product.minStock)) || 0;
    if (stock <= 0) {
        return {
            label: t('products.details.status.outOfStock'),
            className: 'text-rose-500 dark:text-rose-400 bg-rose-500/10 border-rose-500/10',
            icon: XCircle,
        };
    }
    if (stock <= minStock) {
        return {
            label: t('products.details.status.lowStock'),
            className: 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/10',
            icon: AlertTriangle,
        };
    }
    return {
        label: t('products.details.status.available'),
        className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/10',
        icon: CheckCircle2,
    };
};

const cleanNumericInput = (value) => {
    const en = toEnglishNumbers(String(value ?? ''));
    let cleaned = en.replace(/[^0-9.]/g, '');
    const firstDot = cleaned.indexOf('.');
    if (firstDot !== -1) {
        cleaned =
            cleaned.slice(0, firstDot + 1) +
            cleaned.slice(firstDot + 1).replace(/\./g, '');
    }
    return cleaned;
};

const toNum = (v) => {
    const n = Number(toEnglishNumbers(v));
    return Number.isFinite(n) ? n : 0;
};

// =========================================================
// Product Details
// =========================================================

function ProductDetails({ product, onClose, onEdit, onDelete, onPurchaseComplete }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');

    const [jalaliMonthStyle, setJalaliMonthStyle] = useState(getJalaliMonthStyle());
    const [stockModalOpen, setStockModalOpen] = useState(false);

    useEffect(() => {
        const onStyleChange = (event) =>
            setJalaliMonthStyle(event?.detail || getJalaliMonthStyle());
        const onStorage = (event) => {
            if (event.key === 'jalaliMonthStyle') setJalaliMonthStyle(getJalaliMonthStyle());
        };
        window.addEventListener('jalali-month-style-changed', onStyleChange);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('jalali-month-style-changed', onStyleChange);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    if (!product) return null;

    const stockStatus = getStockStatus(product, t);
    const StatusIcon = stockStatus.icon;

    const avgCost = Number(toEnglishNumbers(product.avgCost)) || 0;
    const stock = Number(toEnglishNumbers(product.stock)) || 0;
    const minStock = Number(toEnglishNumbers(product.minStock)) || 0;
    const totalValue = Number(product.totalValue) || (avgCost * stock);

    const saleOptions = Array.isArray(product.saleOptions) ? product.saleOptions : [];
    const purchaseOptions = Array.isArray(product.purchaseOptions) ? product.purchaseOptions : [];
    const conversions = Array.isArray(product.conversions) ? product.conversions : [];

    const defaultOpt = saleOptions.find((o) => o.isDefault) || saleOptions[0] || null;
    const defaultPrice = Number(defaultOpt?.price) || 0;
    const defaultFactor = Number(defaultOpt?.factor) || 1;
    const defaultCostForUnit = avgCost * defaultFactor;
    const profitPerUnit = defaultPrice - defaultCostForUnit;
    const profitMargin = defaultPrice > 0 ? (profitPerUnit / defaultPrice) * 100 : 0;
    const profitClass = profitPerUnit >= 0
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-rose-500 dark:text-rose-400';

    const potentialSalesValue = defaultOpt && defaultFactor > 0
        ? stock * (defaultPrice / defaultFactor)
        : 0;
    const potentialProfit = potentialSalesValue - totalValue;

    const currency = isEnglish ? 'AF' : 'افغانی';
    const unit = product.baseUnit || t('products.details.defaults.unit');

    const handleOverlayMouseDown = (event) => {
        if (event.target === event.currentTarget) onClose?.();
    };

    const handleOpenStockModal = () => {
        setStockModalOpen(true);
    };

    const handleStockSuccess = () => {
        setStockModalOpen(false);
        onPurchaseComplete?.();
    };

    return (
        <>
            <div
                dir={isEnglish ? 'ltr' : 'rtl'}
                onMouseDown={handleOverlayMouseDown}
                className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/[0.45] p-2 backdrop-blur-[20px] dark:bg-black/[0.58] sm:p-4"
            >
                <div className="flex min-h-full items-start justify-center sm:items-center">
                    <div className="relative flex w-full max-w-3xl max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:max-h-[90vh]">
                        {/* Header */}
                        <div className="relative flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 py-3 sm:px-5 sm:py-4">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/10 sm:h-11 sm:w-11">
                                    <Package size={19} className="text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                                            {t('products.details.title')}
                                        </h2>
                                        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-[9px] ${stockStatus.className}`}>
                                            <StatusIcon size={11} />
                                            {stockStatus.label}
                                        </span>
                                    </div>
                                    <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
                                        {t('products.details.subtitle')}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label={t('common.closeMenu')}
                                className="ui-icon-button shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Scrollable content */}
                        <div className="main-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 sm:p-5">
                            {/* Identity */}
                            <div className="relative mb-4 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:mb-5 sm:p-5">
                                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
                                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] sm:h-14 sm:w-14">
                                            <Package size={23} className="text-emerald-500 dark:text-emerald-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="truncate text-base font-bold tracking-tight text-[var(--text-primary)] sm:text-lg">
                                                {product.name}
                                            </h3>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <Pill icon={Layers3}>
                                                    {product.category || t('products.details.defaults.category')}
                                                </Pill>
                                                <Pill icon={Hash}>{formatId(product.id, language)}</Pill>
                                                <Pill icon={Package}>{unit}</Pill>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <p className="text-[9px] text-[var(--text-muted)]">
                                            {t('products.details.lastUpdated')}
                                        </p>
                                        <p className="mt-1 whitespace-nowrap text-xs text-[var(--text-secondary)]">
                                            {formatDisplayDate(product.updatedAt, language, jalaliMonthStyle)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Main info */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <InfoSection
                                    icon={ShoppingCart}
                                    iconClass="bg-blue-500/10 text-blue-500 dark:text-blue-400"
                                    title={isEnglish ? 'Cost & Stock' : 'قیمت تمام‌شده و موجودی'}
                                >
                                    <InfoRow
                                        label={isEnglish ? 'Avg cost / unit' : 'میانگین قیمت هر واحد'}
                                        value={formatNumber(avgCost, language)}
                                        suffix={`${currency} / ${unit}`}
                                        strong
                                    />
                                    <InfoRow
                                        label={isEnglish ? 'Stock value' : 'ارزش موجودی'}
                                        value={formatNumber(totalValue, language)}
                                        suffix={currency}
                                        valueClass="text-violet-600 dark:text-violet-400"
                                    />
                                    <Divider />
                                    <InfoRow
                                        label={t('products.details.labels.currentStock')}
                                        value={formatNumber(stock, language)}
                                        suffix={unit}
                                    />
                                    <InfoRow
                                        label={t('products.details.labels.minimumStock')}
                                        value={formatNumber(minStock, language)}
                                        suffix={unit}
                                    />

                                    <button
                                        type="button"
                                        onClick={handleOpenStockModal}
                                        className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-2.5 text-[11px] font-medium text-emerald-600 transition-all duration-200 hover:border-emerald-500/40 hover:bg-emerald-500/20 dark:text-emerald-400"
                                    >
                                        <Plus size={13} strokeWidth={2.5} />
                                        {isEnglish ? 'Add Stock' : 'افزودن موجودی'}
                                    </button>
                                </InfoSection>

                                <InfoSection
                                    icon={TrendingUp}
                                    iconClass="bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                                    title={isEnglish ? 'Default Sale Option' : 'روش فروش پیش‌فرض'}
                                >
                                    {defaultOpt ? (
                                        <>
                                            <InfoRow
                                                label={isEnglish ? 'Unit' : 'واحد'}
                                                value={defaultOpt.unit}
                                                strong
                                            />
                                            {defaultFactor !== 1 && (
                                                <InfoRow
                                                    label={isEnglish ? 'Each = ' : 'هر یک = '}
                                                    value={`${formatDecimal(defaultFactor, language)} ${unit}`}
                                                />
                                            )}
                                            <InfoRow
                                                label={isEnglish ? 'Price' : 'قیمت فروش'}
                                                value={formatNumber(defaultPrice, language)}
                                                suffix={currency}
                                            />
                                            <Divider />
                                            <InfoRow
                                                label={isEnglish ? 'Profit / unit' : 'سود هر واحد'}
                                                value={formatNumber(profitPerUnit, language)}
                                                suffix={currency}
                                                valueClass={profitClass}
                                            />
                                            <InfoRow
                                                label={isEnglish ? 'Margin' : 'درصد سود'}
                                                value={formatDecimal(profitMargin, language)}
                                                suffix="%"
                                                valueClass={profitClass}
                                            />
                                        </>
                                    ) : (
                                        <p className="text-[11px] text-[var(--text-muted)]">
                                            {isEnglish
                                                ? 'No sale options defined.'
                                                : 'هیچ روش فروشی تعریف نشده.'}
                                        </p>
                                    )}
                                </InfoSection>
                            </div>

                            {/* All Sale Options */}
                            {saleOptions.length > 0 && (
                                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                                            <TrendingUp size={14} className="text-emerald-500 dark:text-emerald-400" />
                                        </div>
                                        <h4 className="text-xs font-semibold text-[var(--text-secondary)]">
                                            {isEnglish ? 'All Sale Options' : 'همه روش‌های فروش'}
                                        </h4>
                                    </div>
                                    <div className="space-y-2">
                                        {saleOptions.map((opt) => {
                                            const f = Number(opt.factor) || 1;
                                            const p = Number(opt.price) || 0;
                                            const cost = avgCost * f;
                                            const profit = p - cost;
                                            const margin = p > 0 ? (profit / p) * 100 : 0;
                                            const isLoss = profit < 0;
                                            const isThin = profit > 0 && margin < 10;

                                            return (
                                                <div
                                                    key={opt.id}
                                                    className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                                                            {opt.unit}
                                                            {f !== 1 && (
                                                                <span className="text-[9px] text-[var(--text-muted)]">
                                                                    × {formatDecimal(f, language)}
                                                                </span>
                                                            )}
                                                        </span>
                                                        {opt.isDefault && (
                                                            <span className="inline-flex items-center gap-1 rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] px-1.5 py-0.5 text-[9px] text-[var(--accent-600)] dark:text-[var(--accent-300)]">
                                                                <Star size={9} className="fill-current" />
                                                                {isEnglish ? 'Default' : 'پیش‌فرض'}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                                                        <span className="number-font text-[var(--text-primary)]">
                                                            {formatNumber(p, language)} {currency}
                                                        </span>
                                                        <span
                                                            className={`number-font ${
                                                                isLoss
                                                                    ? 'text-rose-500 dark:text-rose-400'
                                                                    : isThin
                                                                        ? 'text-amber-500 dark:text-amber-400'
                                                                        : 'text-emerald-600 dark:text-emerald-400'
                                                            }`}
                                                        >
                                                            {profit >= 0 ? '+' : ''}{formatNumber(profit, language)}
                                                            <span className="ms-1 opacity-70">
                                                                ({margin >= 0 ? '+' : ''}{margin.toFixed(1)}%)
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Purchase Templates */}
                            {purchaseOptions.length > 0 && (
                                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                                            <ShoppingCart size={14} className="text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <h4 className="text-xs font-semibold text-[var(--text-secondary)]">
                                            {isEnglish ? 'Purchase Templates' : 'الگوهای خرید'}
                                        </h4>
                                    </div>
                                    <div className="space-y-2">
                                        {purchaseOptions.map((po) => {
                                            const f = Number(po.factor) || 1;
                                            const lastPrice = Number(po.lastPrice) || 0;
                                            const costPerBase = f > 0 ? lastPrice / f : 0;
                                            return (
                                                <div
                                                    key={po.id}
                                                    className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[11px] sm:flex-row sm:items-center sm:justify-between"
                                                >
                                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                                        <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                                                            {po.unit}
                                                            {f !== 1 && (
                                                                <span className="text-[9px] text-[var(--text-muted)]">
                                                                    × {formatDecimal(f, language)}
                                                                </span>
                                                            )}
                                                        </span>
                                                        {po.note && (
                                                            <span className="truncate text-[9px] text-[var(--text-muted)]">
                                                                {po.note}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                        <span className="number-font text-[var(--text-secondary)]">
                                                            {formatNumber(lastPrice, language)} {currency}
                                                        </span>
                                                        {f !== 1 && costPerBase > 0 && (
                                                            <span className="text-[9px] text-[var(--text-muted)]">
                                                                ({formatNumber(costPerBase, language)} / {unit})
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Unit Conversions */}
                            {conversions.length > 0 && (
                                <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                                            <Repeat size={14} className="text-violet-500 dark:text-violet-400" />
                                        </div>
                                        <h4 className="text-xs font-semibold text-[var(--text-secondary)]">
                                            {isEnglish ? 'Unit Conversions' : 'تبدیل واحدها'}
                                        </h4>
                                    </div>
                                    <div className="space-y-2">
                                        {conversions.map((c) => (
                                            <div
                                                key={c.id}
                                                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-[11px]"
                                            >
                                                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                                                    <span>{c.fromUnit}</span>
                                                    <ArrowLeftRight size={11} className="text-[var(--text-muted)]" />
                                                    <span>{c.toUnit}</span>
                                                </div>
                                                <span className="number-font text-[var(--text-primary)]">
                                                    1 {c.fromUnit} = {formatDecimal(c.ratio, language)} {c.toUnit}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stock warning */}
                            {stock <= minStock && (
                                <StockWarning stock={stock} minStock={minStock} unit={unit} language={language} />
                            )}

                            {/* Summary */}
                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <SummaryCard
                                    icon={TrendingUp}
                                    label={isEnglish ? 'Potential Profit' : 'سود بالقوه'}
                                    value={`${formatNumber(potentialProfit, language)} ${currency}`}
                                    iconClass="text-emerald-500 dark:text-emerald-400"
                                    valueClass={
                                        potentialProfit >= 0
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-rose-500 dark:text-rose-400'
                                    }
                                />
                                <SummaryCard
                                    icon={Package}
                                    label={t('products.details.summary.productUnit')}
                                    value={unit}
                                    iconClass="text-blue-500 dark:text-blue-400"
                                />
                                <SummaryCard
                                    icon={Layers3}
                                    label={t('products.details.summary.category')}
                                    value={product.category || t('products.details.defaults.category')}
                                    iconClass="text-violet-500 dark:text-violet-400"
                                />
                            </div>

                            {product.description && (
                                <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                                    <p className="text-[10px] text-[var(--text-muted)]">
                                        {t('products.details.description.title')}
                                    </p>
                                    <p className="mt-2 break-words text-xs leading-6 text-[var(--text-secondary)]">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex shrink-0 flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleOpenStockModal}
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/10 px-4 text-xs text-emerald-600 transition-all duration-200 hover:bg-emerald-500/20 dark:text-emerald-400"
                                >
                                    <Plus size={14} strokeWidth={2.4} />
                                    {isEnglish ? 'Add Stock' : 'افزودن موجودی'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onEdit?.(product)}
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500/10 bg-blue-500/10 px-4 text-xs text-blue-600 transition-all duration-200 hover:bg-blue-500/20 dark:text-blue-400"
                                >
                                    <Pencil size={14} />
                                    {t('products.details.actions.edit')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete?.(product)}
                                    className="flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-500/10 bg-rose-500/10 px-4 text-xs text-rose-500 transition-all duration-200 hover:bg-rose-500/20 dark:text-rose-400"
                                >
                                    <Trash2 size={14} />
                                    {t('products.details.actions.delete')}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="ui-button-secondary w-full sm:w-auto"
                            >
                                {t('products.details.actions.close')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Stock Modal */}
            {stockModalOpen && (
                <AddStockModal
                    product={product}
                    onClose={() => setStockModalOpen(false)}
                    onSuccess={handleStockSuccess}
                />
            )}
        </>
    );
}

// =========================================================
// Add Stock Modal
// =========================================================

function AddStockModal({ product, onClose, onSuccess }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');

    const [allUnits, setAllUnits] = useState([]);
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [factor, setFactor] = useState('1');
    const [price, setPrice] = useState('');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const productBaseUnit = product.baseUnit || '';
    const purchaseOptions = Array.isArray(product.purchaseOptions)
        ? product.purchaseOptions
        : [];

    // Load units
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const dbUnits = await getUnits();
                if (!mounted) return;

                const names = new Set();
                if (productBaseUnit) names.add(productBaseUnit);
                purchaseOptions.forEach((po) => po.unit && names.add(po.unit));
                (Array.isArray(dbUnits) ? dbUnits : []).forEach(
                    (u) => u?.name && names.add(u.name)
                );

                const sorted = Array.from(names)
                    .filter(Boolean)
                    .sort((a, b) => String(a).localeCompare(String(b), 'fa'));

                setAllUnits(sorted);
            } catch (err) {
                console.error('Failed to load units:', err);
                if (mounted) {
                    setAllUnits([productBaseUnit].filter(Boolean));
                }
            }
        })();
        return () => { mounted = false; };
    }, [productBaseUnit]); // eslint-disable-line react-hooks/exhaustive-deps

    // Initialize unit from most recent purchaseOption
    useEffect(() => {
        const sorted = [...purchaseOptions].sort(
            (a, b) => new Date(b.lastDate || 0) - new Date(a.lastDate || 0)
        );
        const initialUnit = sorted[0]?.unit || productBaseUnit;
        setUnit(initialUnit);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product.id]);

    // Auto-fill factor + price when unit changes
    useEffect(() => {
        if (!unit) return;

        const match = purchaseOptions.find((po) => po.unit === unit);
        if (match) {
            setFactor(String(match.factor || 1));
            if (match.lastPrice != null && match.lastPrice !== 0) {
                setPrice(String(match.lastPrice));
            }
            return;
        }

        if (unit === productBaseUnit) {
            setFactor('1');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unit]);

    // Calculations
    const qtyNum = toNum(quantity);
    const factorNum = toNum(factor) || 1;
    const priceNum = toNum(price);
    const receivedInBase = qtyNum * factorNum;
    const totalPaid = qtyNum * priceNum;
    const costPerBase = factorNum > 0 ? priceNum / factorNum : 0;

    const oldStock = Number(product.stock) || 0;
    const oldValue = Number(product.totalValue) || 0;
    const newStock = oldStock + receivedInBase;
    const newValue = oldValue + totalPaid;
    const newAvgCost = newStock > 0 ? newValue / newStock : 0;

    const isSameUnit = unit === productBaseUnit;

    // Submit
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (saving) return;

        setError('');

        if (qtyNum <= 0) {
            setError(isEnglish ? 'Quantity must be greater than zero.' : 'تعداد باید بیشتر از صفر باشد.');
            return;
        }
        if (factorNum <= 0) {
            setError(isEnglish ? 'Factor is invalid.' : 'ضریب تبدیل معتبر نیست.');
            return;
        }
        if (priceNum < 0) {
            setError(isEnglish ? 'Price is invalid.' : 'قیمت معتبر نیست.');
            return;
        }
        if (!unit) {
            setError(isEnglish ? 'Unit is required.' : 'واحد خرید الزامی است.');
            return;
        }

        setSaving(true);
        try {
            await addPurchase(product.id, {
                quantity: qtyNum,
                unit,
                factor: factorNum,
                pricePerUnit: priceNum,
                note,
            });
            onSuccess?.();
        } catch (err) {
            console.error('Failed to add purchase:', err);
            setError(
                err?.message ||
                (isEnglish ? 'Failed to add stock.' : 'افزودن موجودی انجام نشد.')
            );
            setSaving(false);
        }
    };

    const handleOverlay = (event) => {
        if (event.target === event.currentTarget && !saving) onClose?.();
    };

    // Prevent body scroll
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    // Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !saving) onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose, saving]);

    const currency = isEnglish ? 'AF' : 'افغانی';

    return (
        <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            onMouseDown={handleOverlay}
            className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/[0.55] backdrop-blur-[8px] sm:items-center sm:p-4"
        >
            <div className="
                relative flex w-full max-w-lg flex-col overflow-hidden
                rounded-t-3xl border border-[var(--border)] bg-[var(--surface)]
                shadow-2xl sm:rounded-2xl
                max-h-[92dvh] sm:max-h-[90vh]
            ">
                <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                    {/* Header */}
                    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3.5 sm:px-5">
                        <div className="flex min-w-0 items-center gap-2.5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                                <Plus size={17} className="text-emerald-500 dark:text-emerald-400" />
                            </div>
                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-[var(--text)]">
                                    {isEnglish ? 'Add Stock' : 'افزودن موجودی'}
                                </h3>
                                <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                                    {product.name}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            aria-label={t('common.closeMenu')}
                            className="ui-icon-button h-8 w-8 shrink-0"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="main-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
                        {/* Current stock card */}
                        <div className="mb-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[10px] text-[var(--text-muted)]">
                                        {isEnglish ? 'Current stock' : 'موجودی فعلی'}
                                    </p>
                                    <p className="mt-0.5 text-base font-bold text-[var(--text-primary)] number-font">
                                        {formatNumber(oldStock, language)}
                                        <span className="ms-1 text-[10px] font-normal text-[var(--text-muted)]">
                                            {productBaseUnit}
                                        </span>
                                    </p>
                                </div>
                                <div className="text-end">
                                    <p className="text-[10px] text-[var(--text-muted)]">
                                        {isEnglish ? 'Avg cost' : 'میانگین قیمت'}
                                    </p>
                                    <p className="mt-0.5 text-base font-bold text-[var(--text-primary)] number-font">
                                        {formatNumber(newAvgCost, language)}
                                        <span className="ms-1 text-[10px] font-normal text-[var(--text-muted)]">
                                            {currency}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                role="alert"
                                className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/[0.06] px-3 py-2.5 text-[11.5px] leading-5 text-rose-600 dark:text-rose-400"
                            >
                                <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Form grid */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Quantity */}
                            <div className="min-w-0">
                                <label className="mb-1.5 block text-[10.5px] font-medium text-[var(--text-muted)]">
                                    {isEnglish ? 'Quantity' : 'تعداد'}
                                </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    dir="ltr"
                                    value={quantity}
                                    onChange={(e) =>
                                        setQuantity(cleanNumericInput(e.target.value))
                                    }
                                    disabled={saving}
                                    placeholder="0"
                                    autoFocus
                                    className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-center text-sm text-[var(--text)] number-font outline-none transition-[border-color,box-shadow] focus:border-[var(--input-border-focus)] focus:shadow-[0_0_0_3px_var(--accent-soft-strong)] disabled:opacity-60"
                                />
                            </div>

                            {/* Unit */}
                            <div className="min-w-0">
                                <label className="mb-1.5 block text-[10.5px] font-medium text-[var(--text-muted)]">
                                    {isEnglish ? 'Unit' : 'واحد خرید'}
                                </label>
                                <select
                                    value={unit}
                                    onChange={(e) => setUnit(e.target.value)}
                                    disabled={saving}
                                    className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text)] outline-none transition-[border-color,box-shadow] focus:border-[var(--input-border-focus)] focus:shadow-[0_0_0_3px_var(--accent-soft-strong)] disabled:opacity-60"
                                >
                                    {allUnits.map((u) => (
                                        <option key={u} value={u}>
                                            {u}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Factor */}
                            {!isSameUnit && (
                                <div className="col-span-2 min-w-0">
                                    <label className="mb-1.5 block text-[10.5px] font-medium text-[var(--text-muted)]">
                                        {isEnglish ? 'Each unit contains' : 'هر یک شامل'}
                                        <span className="ms-1 font-semibold text-[var(--text-secondary)]">
                                            ({productBaseUnit})
                                        </span>
                                    </label>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        dir="ltr"
                                        value={factor}
                                        onChange={(e) =>
                                            setFactor(cleanNumericInput(e.target.value))
                                        }
                                        disabled={saving}
                                        placeholder="1"
                                        className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-center text-sm text-[var(--text)] number-font outline-none transition-[border-color,box-shadow] focus:border-[var(--input-border-focus)] focus:shadow-[0_0_0_3px_var(--accent-soft-strong)] disabled:opacity-60"
                                    />
                                </div>
                            )}

                            {/* Price per unit */}
                            <div className="col-span-2 min-w-0">
                                <label className="mb-1.5 block text-[10.5px] font-medium text-[var(--text-muted)]">
                                    {isEnglish
                                        ? `Price per ${unit || 'unit'} (${currency})`
                                        : `قیمت هر ${unit || 'واحد'} (${currency})`}
                                </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    dir="ltr"
                                    value={price}
                                    onChange={(e) =>
                                        setPrice(cleanNumericInput(e.target.value))
                                    }
                                    disabled={saving}
                                    placeholder="0"
                                    className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-center text-sm text-[var(--text)] number-font outline-none transition-[border-color,box-shadow] focus:border-[var(--input-border-focus)] focus:shadow-[0_0_0_3px_var(--accent-soft-strong)] disabled:opacity-60"
                                />
                            </div>

                            {/* Note */}
                            <div className="col-span-2 min-w-0">
                                <label className="mb-1.5 block text-[10.5px] font-medium text-[var(--text-muted)]">
                                    {isEnglish ? 'Note (optional)' : 'یادداشت (اختیاری)'}
                                </label>
                                <input
                                    type="text"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    disabled={saving}
                                    placeholder={
                                        isEnglish
                                            ? 'e.g. transport fare included'
                                            : 'مثلاً کرایه موتر شامل است'
                                    }
                                    className="h-11 w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-sm text-[var(--text)] outline-none transition-[border-color,box-shadow] focus:border-[var(--input-border-focus)] focus:shadow-[0_0_0_3px_var(--accent-soft-strong)] disabled:opacity-60"
                                />
                            </div>
                        </div>

                        {/* Live Preview */}
                        {qtyNum > 0 && (
                            <div className="mt-4 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3">
                                <p className="mb-2 text-[10.5px] font-semibold text-[var(--accent-600)] dark:text-[var(--accent-300)]">
                                    {isEnglish ? 'Preview' : 'پیش‌نمایش'}
                                </p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="min-w-0">
                                        <p className="text-[9.5px] text-[var(--text-muted)]">
                                            {isEnglish ? 'New stock' : 'موجودی جدید'}
                                        </p>
                                        <p className="mt-0.5 truncate text-sm font-bold text-[var(--text-primary)] number-font">
                                            {formatNumber(newStock, language)}
                                            <span className="ms-0.5 text-[9px] font-normal text-[var(--text-muted)]">
                                                {productBaseUnit}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9.5px] text-[var(--text-muted)]">
                                            {isEnglish ? 'New avg cost' : 'میانگین جدید'}
                                        </p>
                                        <p className="mt-0.5 truncate text-sm font-bold text-[var(--text-primary)] number-font">
                                            {formatNumber(newAvgCost, language)}
                                            <span className="ms-0.5 text-[9px] font-normal text-[var(--text-muted)]">
                                                {currency}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[9.5px] text-[var(--text-muted)]">
                                            {isEnglish ? 'Total paid' : 'سرمایه‌گذاری'}
                                        </p>
                                        <p className="mt-0.5 truncate text-sm font-bold text-[var(--accent-600)] dark:text-[var(--accent-300)] number-font">
                                            {formatNumber(totalPaid, language)}
                                            <span className="ms-0.5 text-[9px] font-normal text-[var(--text-muted)]">
                                                {currency}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                {!isSameUnit && costPerBase > 0 && (
                                    <p className="mt-2 border-t border-[var(--accent-border)] pt-2 text-center text-[10px] text-[var(--text-muted)]">
                                        {isEnglish ? 'Cost / ' : 'قیمت هر '}
                                        {productBaseUnit}:
                                        <span className="ms-1 font-medium text-[var(--text-secondary)] number-font">
                                            {formatNumber(costPerBase, language)} {currency}
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-[var(--border-subtle)] px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="ui-button-secondary h-11 w-full sm:w-auto"
                        >
                            {isEnglish ? 'Cancel' : 'انصراف'}
                        </button>
                        <button
                            type="submit"
                            disabled={saving || qtyNum <= 0 || priceNum < 0}
                            className="ui-button-primary h-11 w-full sm:w-auto"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={15} className="animate-spin" />
                                    {isEnglish ? 'Adding...' : 'در حال افزودن...'}
                                </>
                            ) : (
                                <>
                                    <Plus size={15} strokeWidth={2.5} />
                                    {isEnglish ? 'Add Stock' : 'افزودن موجودی'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// =========================================================
// Sub-components
// =========================================================

function Pill({ icon: Icon, children }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-[10px] text-[var(--text-muted)]">
            <Icon size={11} />
            {children}
        </span>
    );
}

function Divider() {
    return <div className="h-px bg-[var(--border)]" />;
}

function InfoSection({ icon: Icon, iconClass, title, children }) {
    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <div className="mb-4 flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClass}`}>
                    <Icon size={14} />
                </div>
                <h3 className="text-xs font-semibold text-[var(--text-secondary)]">{title}</h3>
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function InfoRow({ label, value, suffix, strong = false, valueClass = '' }) {
    return (
        <div className="flex min-w-0 items-center justify-between gap-4">
            <span className="min-w-0 truncate text-[11px] text-[var(--text-muted)]">{label}</span>
            <span
                dir="auto"
                className={`shrink-0 text-sm ${strong ? 'font-bold' : 'font-semibold'} ${valueClass || 'text-[var(--text-secondary)]'}`}
            >
                {value}
                {suffix && (
                    <span className="ms-1 text-[9px] text-[var(--text-muted)]">{suffix}</span>
                )}
            </span>
        </div>
    );
}

function SummaryCard({ icon: Icon, label, value, iconClass = '', valueClass = '' }) {
    return (
        <div className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
            <div className="flex min-w-0 items-center gap-2">
                <Icon size={14} className={`shrink-0 ${iconClass}`} />
                <span className="min-w-0 truncate text-[10px] text-[var(--text-muted)]">{label}</span>
            </div>
            <p
                dir="auto"
                className={`mt-2 truncate text-sm font-semibold ${valueClass || 'text-[var(--text-secondary)]'}`}
            >
                {value}
            </p>
        </div>
    );
}

function StockWarning({ stock, minStock, unit, language }) {
    const { t } = useTranslation();
    const isOut = stock <= 0;
    const tone = isOut ? 'rose' : 'amber';

    const locale = String(language || '').toLowerCase().startsWith('en') ? 'en-US' : 'fa-IR';

    return (
        <div className={`mt-4 rounded-xl border p-4 border-${tone}-500/15 bg-${tone}-500/5`}>
            <div className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-${tone}-500/10`}>
                    <AlertTriangle size={15} className={`text-${tone}-500 dark:text-${tone}-400`} />
                </div>
                <div className="min-w-0">
                    <p className={`text-xs font-semibold text-${tone}-500 dark:text-${tone}-400`}>
                        {isOut
                            ? t('products.details.stockWarning.outOfStock.title')
                            : t('products.details.stockWarning.lowStock.title')}
                    </p>
                    <p className="mt-1 break-words text-[10px] leading-5 text-[var(--text-muted)]">
                        {isOut
                            ? t('products.details.stockWarning.outOfStock.description')
                            : t('products.details.stockWarning.lowStock.description', {
                                count: new Intl.NumberFormat(locale).format(
                                    Number(toEnglishNumbers(minStock)) || 0
                                ),
                                unit,
                            })}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;