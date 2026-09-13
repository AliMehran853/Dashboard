import {
    X, Package, Layers3, ShoppingCart, Warehouse, AlertTriangle,
    CheckCircle2, XCircle, TrendingUp, Hash, Pencil, Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatJalaliDate, getJalaliMonthStyle } from '../../utils/date/jalali';

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

const formatNumber = (value, language) =>
    new Intl.NumberFormat(getNumberLocale(language)).format(Number(toEnglishNumbers(value)) || 0);

const formatDecimal = (value, language, digits = 1) =>
    new Intl.NumberFormat(getNumberLocale(language), {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(Number(toEnglishNumbers(value)) || 0);

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
        return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(parsed);
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

// =========================================================
// Product Details
// =========================================================

function ProductDetails({ product, onClose, onEdit, onDelete }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');

    const [jalaliMonthStyle, setJalaliMonthStyle] = useState(getJalaliMonthStyle());

    useEffect(() => {
        const onStyleChange = (event) => setJalaliMonthStyle(event?.detail || getJalaliMonthStyle());
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

    const buyPrice = Number(toEnglishNumbers(product.buyPrice)) || 0;
    const sellPrice = Number(toEnglishNumbers(product.sellPrice)) || 0;
    const stock = Number(toEnglishNumbers(product.stock)) || 0;
    const minStock = Number(toEnglishNumbers(product.minStock)) || 0;
    const profitPerUnit = sellPrice - buyPrice;
    const stockValue = stock * buyPrice;
    const potentialSalesValue = stock * sellPrice;
    const potentialProfit = stock * profitPerUnit;
    const profitMargin = sellPrice > 0 ? (profitPerUnit / sellPrice) * 100 : 0;
    const profitClass = profitPerUnit >= 0
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-rose-500 dark:text-rose-400';
    const currency = isEnglish ? 'AF' : 'افغانی';
    const unit = product.unit || t('products.details.defaults.unit');

    const handleOverlayMouseDown = (event) => {
        if (event.target === event.currentTarget) onClose?.();
    };

    return (
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
                        <button type="button" onClick={onClose} aria-label={t('common.closeMenu')} className="ui-icon-button shrink-0">
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
                                            <Pill icon={Layers3}>{product.category || t('products.details.defaults.category')}</Pill>
                                            <Pill icon={Hash}>{formatId(product.id, language)}</Pill>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <p className="text-[9px] text-[var(--text-muted)]">{t('products.details.lastUpdated')}</p>
                                    <p className="mt-1 whitespace-nowrap text-xs text-[var(--text-secondary)]">
                                        {formatDisplayDate(product.updatedAt, language, jalaliMonthStyle)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Main info */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <InfoSection icon={ShoppingCart} iconClass="bg-blue-500/10 text-blue-500 dark:text-blue-400" title={t('products.details.sections.pricing')}>
                                <InfoRow label={t('products.details.labels.buyPrice')} value={formatNumber(buyPrice, language)} suffix={currency} />
                                <InfoRow label={t('products.details.labels.sellPrice')} value={formatNumber(sellPrice, language)} suffix={currency} strong />
                                <Divider />
                                <InfoRow label={t('products.details.labels.profitPerUnit')} value={formatNumber(profitPerUnit, language)} suffix={currency} valueClass={profitClass} />
                                <InfoRow label={t('products.details.labels.profitMargin')} value={formatDecimal(profitMargin, language)} suffix="%" valueClass={profitClass} />
                            </InfoSection>

                            <InfoSection icon={Warehouse} iconClass="bg-amber-500/10 text-amber-500 dark:text-amber-400" title={t('products.details.sections.inventory')}>
                                <InfoRow label={t('products.details.labels.currentStock')} value={formatNumber(stock, language)} suffix={unit} />
                                <InfoRow label={t('products.details.labels.minimumStock')} value={formatNumber(minStock, language)} suffix={unit} />
                                <Divider />
                                <InfoRow label={t('products.details.labels.inventoryPurchaseValue')} value={formatNumber(stockValue, language)} suffix={currency} valueClass="text-violet-600 dark:text-violet-400" />
                                <InfoRow label={t('products.details.labels.inventorySalesValue')} value={formatNumber(potentialSalesValue, language)} suffix={currency} valueClass="text-blue-600 dark:text-blue-400" />
                            </InfoSection>
                        </div>

                        {/* Stock warning */}
                        {stock <= minStock && <StockWarning stock={stock} minStock={minStock} unit={unit} language={language} />}

                        {/* Summary */}
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <SummaryCard
                                icon={TrendingUp}
                                label={t('products.details.summary.potentialProfit')}
                                value={`${formatNumber(potentialProfit, language)} ${currency}`}
                                iconClass="text-emerald-500 dark:text-emerald-400"
                                valueClass="text-emerald-600 dark:text-emerald-400"
                            />
                            <SummaryCard icon={Package} label={t('products.details.summary.productUnit')} value={unit} iconClass="text-blue-500 dark:text-blue-400" />
                            <SummaryCard
                                icon={Layers3}
                                label={t('products.details.summary.category')}
                                value={product.category || t('products.details.defaults.category')}
                                iconClass="text-violet-500 dark:text-violet-400"
                            />
                        </div>

                        {product.description && (
                            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                                <p className="text-[10px] text-[var(--text-muted)]">{t('products.details.description.title')}</p>
                                <p className="mt-2 break-words text-xs leading-6 text-[var(--text-secondary)]">{product.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex shrink-0 flex-col gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                        <div className="flex items-center gap-2">
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
                        <button type="button" onClick={onClose} className="ui-button-secondary w-full sm:w-auto">
                            {t('products.details.actions.close')}
                        </button>
                    </div>
                </div>
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
                {suffix && <span className="ms-1 text-[9px] text-[var(--text-muted)]">{suffix}</span>}
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
            <p dir="auto" className={`mt-2 truncate text-sm font-semibold ${valueClass || 'text-[var(--text-secondary)]'}`}>
                {value}
            </p>
        </div>
    );
}

function StockWarning({ stock, minStock, unit, language }) {
    const { t } = useTranslation();
    const isOut = stock <= 0;
    const tone = isOut ? 'rose' : 'amber';
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
                                count: new Intl.NumberFormat(
                                    String(language || '').toLowerCase().startsWith('en') ? 'en-US' : 'fa-IR'
                                ).format(Number(toEnglishNumbers(minStock)) || 0),
                                unit,
                            })}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;