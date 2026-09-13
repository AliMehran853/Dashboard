import {
    Eye, Package, AlertTriangle, CheckCircle2, XCircle,
    MoreHorizontal, Pencil, Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatJalaliDate, getJalaliMonthStyle } from '../../utils/date/jalali';

// =========================================================
// Helpers
// =========================================================

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const formatNumber = (number, language) => {
    const locale = String(language || '').toLowerCase().startsWith('en') ? 'en-US' : 'fa-IR';
    return new Intl.NumberFormat(locale).format(Number(toEnglishNumbers(number)) || 0);
};

const formatDisplayDate = (date, language, jalaliMonthStyle) => {
    if (!date) return '-';
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return '-';
    if (String(language || '').toLowerCase().startsWith('en')) {
        return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(parsed);
    }
    return formatJalaliDate(parsed, { monthStyle: jalaliMonthStyle, withMonthName: true });
};

const getStockStatus = (product, t) => {
    const stock = Number(toEnglishNumbers(product?.stock)) || 0;
    const minStock = Number(toEnglishNumbers(product?.minStock)) || 0;

    if (stock === 0) {
        return {
            label: t('products.table.status.outOfStock'),
            className: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/10',
            dotClass: 'bg-rose-500',
            icon: XCircle,
        };
    }
    if (stock <= minStock) {
        return {
            label: t('products.table.status.lowStock'),
            className: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/10',
            dotClass: 'bg-amber-500',
            icon: AlertTriangle,
        };
    }
    return {
        label: t('products.table.status.available'),
        className: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/10',
        dotClass: 'bg-emerald-500',
        icon: CheckCircle2,
    };
};

// =========================================================
// Product Table
// =========================================================

function ProductTable({ products = [], loading = false, onViewDetails, onEdit, onDelete }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');

    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);
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

    useEffect(() => {
        const onDown = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setOpenMenuId(null);
        };
        const onKey = (event) => {
            if (event.key === 'Escape') setOpenMenuId(null);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    const handleToggleMenu = (id) => setOpenMenuId((cur) => (cur === id ? null : id));
    const handleEdit = (product) => { setOpenMenuId(null); onEdit?.(product); };
    const handleDelete = (product) => { setOpenMenuId(null); onDelete?.(product); };

    return (
        <section className="ui-card overflow-hidden p-0">
            {/* Header */}
            <div className="relative flex flex-col gap-3 border-b border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/10">
                        <Package size={17} className="text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold tracking-tight text-[var(--text-primary)]">
                            {t('products.table.title')}
                        </h2>
                        <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
                            {t('products.table.description')}
                        </p>
                    </div>
                </div>

                <div className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--text-muted)]">
                    <span dir={isEnglish ? 'ltr' : 'rtl'} className="number-font font-semibold text-[var(--text-primary)]">
                        {formatNumber(products.length, language)}
                    </span>
                    <span>{t('products.table.productCount')}</span>
                </div>
            </div>

            {loading && <TableLoading label={t('products.table.loading')} />}
            {!loading && products.length === 0 && <TableEmpty t={t} />}

            {!loading && products.length > 0 && (
                <>
                    <DesktopTable
                        products={products}
                        t={t}
                        language={language}
                        isEnglish={isEnglish}
                        jalaliMonthStyle={jalaliMonthStyle}
                        openMenuId={openMenuId}
                        menuRef={menuRef}
                        onToggleMenu={handleToggleMenu}
                        onViewDetails={onViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                    <MobileList
                        products={products}
                        t={t}
                        language={language}
                        isEnglish={isEnglish}
                        jalaliMonthStyle={jalaliMonthStyle}
                        onViewDetails={onViewDetails}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </>
            )}
        </section>
    );
}

// =========================================================
// Desktop Table
// =========================================================

function DesktopTable({
    products, t, language, isEnglish, jalaliMonthStyle,
    openMenuId, menuRef, onToggleMenu, onViewDetails, onEdit, onDelete,
}) {
    const columns = [
        { key: 'product', label: t('products.table.columns.product'), align: 'start' },
        { key: 'category', label: t('products.table.columns.category'), align: 'start' },
        { key: 'buyPrice', label: t('products.table.columns.buyPrice'), align: 'start' },
        { key: 'sellPrice', label: t('products.table.columns.sellPrice'), align: 'start' },
        { key: 'stock', label: t('products.table.columns.stock'), align: 'start' },
        { key: 'status', label: t('products.table.columns.status'), align: 'start' },
        { key: 'updated', label: t('products.table.columns.updated'), align: 'start' },
        { key: 'actions', label: t('products.table.columns.actions'), align: 'center' },
    ];

    return (
        <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1000px] border-collapse">
                <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`px-4 py-3 text-${col.align} text-[10px] font-semibold text-[var(--text-muted)] first:ps-5 last:pe-5`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => {
                        const stockStatus = getStockStatus(product, t);
                        const StatusIcon = stockStatus.icon;
                        const currency = isEnglish ? 'AF' : 'افغانی';
                        return (
                            <tr
                                key={product.id}
                                className="group border-b border-[var(--border)] transition-colors last:border-b-0 hover:bg-[var(--surface-muted)]"
                            >
                                {/* Product */}
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] transition-all duration-200 group-hover:border-emerald-500/20 group-hover:bg-emerald-500/5">
                                            <Package size={17} className="text-[var(--text-muted)] transition-colors group-hover:text-emerald-500 dark:group-hover:text-emerald-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{product.name}</p>
                                            <p dir={isEnglish ? 'ltr' : 'rtl'} className="mt-1 text-[10px] text-[var(--text-muted)]">
                                                #{formatNumber(product.id, language)}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Category */}
                                <td className="px-4 py-4">
                                    <span className="inline-flex max-w-[180px] truncate items-center rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] text-[var(--text-muted)]">
                                        {product.category || '-'}
                                    </span>
                                </td>

                                <PriceCell value={product.buyPrice} currency={currency} language={language} isEnglish={isEnglish} />

                                <td className="whitespace-nowrap px-4 py-4">
                                    <div className="flex items-baseline gap-1">
                                        <span dir={isEnglish ? 'ltr' : 'rtl'} className="number-font text-xs font-bold text-[var(--text-primary)]">
                                            {formatNumber(product.sellPrice, language)}
                                        </span>
                                        <span className="text-[9px] text-[var(--text-muted)]">{currency}</span>
                                    </div>
                                </td>

                                <td className="whitespace-nowrap px-4 py-4">
                                    <div className="flex items-baseline gap-1">
                                        <span dir={isEnglish ? 'ltr' : 'rtl'} className="number-font text-xs font-semibold text-[var(--text-secondary)]">
                                            {formatNumber(product.stock, language)}
                                        </span>
                                        <span className="text-[9px] text-[var(--text-muted)]">{product.unit || ''}</span>
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-medium ${stockStatus.className}`}>
                                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${stockStatus.dotClass}`} />
                                        <StatusIcon size={12} />
                                        {stockStatus.label}
                                    </span>
                                </td>

                                <td className="whitespace-nowrap px-4 py-4">
                                    <span className="text-[10px] text-[var(--text-muted)]">
                                        {formatDisplayDate(product.updatedAt, language, jalaliMonthStyle)}
                                    </span>
                                </td>

                                <td className="px-5 py-4">
                                    <div className="relative flex items-center justify-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => onViewDetails?.(product)}
                                            className="ui-icon-button h-8 w-8 rounded-lg hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-500 dark:hover:text-emerald-400"
                                            title={t('products.table.actions.viewDetails')}
                                            aria-label={t('products.table.actions.viewDetails')}
                                        >
                                            <Eye size={15} />
                                        </button>

                                        <div
                                            className="relative"
                                            ref={openMenuId === product.id ? menuRef : null}
                                        >
                                            <button
                                                type="button"
                                                onClick={() => onToggleMenu(product.id)}
                                                className={`ui-icon-button h-8 w-8 rounded-lg ${openMenuId === product.id ? 'border-slate-300 bg-[var(--surface-muted)] text-[var(--text-primary)] dark:border-slate-700' : ''}`}
                                                title={t('products.table.actions.options')}
                                                aria-label={t('products.table.actions.options')}
                                            >
                                                <MoreHorizontal size={15} />
                                            </button>

                                            {openMenuId === product.id && (
                                                <div
                                                    className={`absolute top-1/2 z-[100] w-40 -translate-y-1/2 overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 p-1.5 shadow-2xl shadow-black/15 backdrop-blur-md backdrop-saturate-150 dark:border-slate-700/80 dark:bg-slate-900/95 ${isEnglish ? 'right-[calc(100%+8px)]' : 'left-[calc(100%+8px)]'}`}
                                                >
                                                    <div className="pointer-events-none absolute inset-0 bg-white/30 dark:bg-white/[0.02]" />
                                                    <div className="relative z-10">
                                                        <button
                                                            type="button"
                                                            onClick={() => onEdit(product)}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-[var(--text-secondary)] transition-colors hover:bg-blue-500/5 hover:text-blue-600 dark:hover:text-blue-400"
                                                        >
                                                            <Pencil size={14} className="shrink-0" />
                                                            {t('products.table.actions.edit')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => onDelete(product)}
                                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-rose-500 transition-colors hover:bg-rose-500/5 dark:text-rose-400"
                                                        >
                                                            <Trash2 size={14} className="shrink-0" />
                                                            {t('products.table.actions.delete')}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function PriceCell({ value, currency, language, isEnglish }) {
    return (
        <td className="whitespace-nowrap px-4 py-4">
            <div className="flex items-baseline gap-1">
                <span dir={isEnglish ? 'ltr' : 'rtl'} className="number-font text-xs font-medium text-[var(--text-secondary)]">
                    {formatNumber(value, language)}
                </span>
                <span className="text-[9px] text-[var(--text-muted)]">{currency}</span>
            </div>
        </td>
    );
}

// =========================================================
// Mobile List
// =========================================================

function MobileList({ products, t, language, isEnglish, jalaliMonthStyle, onViewDetails, onEdit, onDelete }) {
    const currency = isEnglish ? 'AF' : 'افغانی';
    return (
        <div className="divide-y divide-[var(--border)] md:hidden">
            {products.map((product) => {
                const stockStatus = getStockStatus(product, t);
                const StatusIcon = stockStatus.icon;
                return (
                    <article key={product.id} className="min-w-0 p-4 transition-colors hover:bg-[var(--surface-muted)]">
                        <div className="flex min-w-0 items-start justify-between gap-3">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
                                    <Package size={17} className="text-[var(--text-muted)]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold text-[var(--text-primary)]">{product.name}</p>
                                    <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">{product.category || '-'}</p>
                                </div>
                            </div>

                            <span className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border px-2 py-1 text-[9px] font-medium whitespace-nowrap ${stockStatus.className}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${stockStatus.dotClass}`} />
                                <StatusIcon size={11} />
                                {stockStatus.label}
                            </span>
                        </div>

                        <div className="mt-4 space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <MobileField
                                    label={t('products.table.columns.buyPrice')}
                                    value={formatNumber(product.buyPrice, language)}
                                    suffix={currency}
                                    dir={isEnglish ? 'ltr' : 'rtl'}
                                />
                                <MobileField
                                    label={t('products.table.columns.sellPrice')}
                                    value={formatNumber(product.sellPrice, language)}
                                    suffix={currency}
                                    strong
                                    alignEnd
                                    dir={isEnglish ? 'ltr' : 'rtl'}
                                />
                            </div>

                            <div className="h-px bg-[var(--border)]" />

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <MobileField
                                    label={t('products.table.columns.stock')}
                                    value={formatNumber(product.stock, language)}
                                    suffix={product.unit || ''}
                                    dir={isEnglish ? 'ltr' : 'rtl'}
                                />
                                <MobileField
                                    label={t('products.table.columns.updated')}
                                    value={formatDisplayDate(product.updatedAt, language, jalaliMonthStyle)}
                                    alignEnd
                                />
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
                            <button
                                type="button"
                                onClick={() => onViewDetails?.(product)}
                                className="flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs text-[var(--text-muted)] transition-all duration-200 hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-500 dark:hover:text-emerald-400"
                            >
                                <Eye size={15} className="shrink-0" />
                                <span className="truncate">{t('products.table.actions.details')}</span>
                            </button>

                            <MobileAction onClick={() => onEdit(product)} icon={Pencil} tone="blue" label={t('products.table.actions.edit')} />
                            <MobileAction onClick={() => onDelete(product)} icon={Trash2} tone="rose" label={t('products.table.actions.delete')} />
                        </div>
                    </article>
                );
            })}
        </div>
    );
}

function MobileField({ label, value, suffix, strong, alignEnd, dir }) {
    return (
        <div className={`min-w-0 ${alignEnd ? 'text-end' : ''}`}>
            <p className="text-[9px] text-[var(--text-muted)]">{label}</p>
            <p
                dir={dir}
                className={`mt-1 truncate ${strong ? 'number-font text-xs font-bold text-[var(--text-primary)]' : 'text-xs text-[var(--text-secondary)]'}`}
            >
                {value}
                {suffix && <span className="ms-1 font-sans text-[9px] font-normal text-[var(--text-muted)]">{suffix}</span>}
            </p>
        </div>
    );
}

function MobileAction({ onClick, icon: Icon, tone, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-all duration-200 hover:border-${tone}-500/20 hover:bg-${tone}-500/5 hover:text-${tone}-500 dark:hover:text-${tone}-400`}
            title={label}
            aria-label={label}
        >
            <Icon size={15} />
        </button>
    );
}

// =========================================================
// States
// =========================================================

function TableLoading({ label }) {
    return (
        <div className="flex flex-col items-center justify-center px-5 py-16">
            <div className="h-8 w-8 rounded-full border-2 border-[var(--border)] border-t-emerald-500 animate-spin" />
            <p className="mt-4 text-xs text-[var(--text-muted)]">{label}</p>
        </div>
    );
}

function TableEmpty({ t }) {
    return (
        <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                <Package size={26} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
                {t('products.table.empty.title')}
            </h3>
            <p className="mt-2 max-w-md text-[11px] leading-5 text-[var(--text-muted)]">
                {t('products.table.empty.description')}
            </p>
        </div>
    );
}

export default ProductTable;