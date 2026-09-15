import { useEffect, useState } from 'react';
import { Eye, ShoppingBag, Loader2, Receipt, Banknote } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSales } from '../../services/salesService';
import { formatJalaliDate, getJalaliMonthStyle } from '../../utils/date/jalali';

const getSaleTotal = (sale) => {
    if (sale?.total != null) return Number(sale.total) || 0;
    if (sale?.totalAmount != null) return Number(sale.totalAmount) || 0;
    return Number(sale?.quantity || 0) * Number(sale?.unitPrice || 0);
};

const getQuantityInBase = (sale) => {
    const stored = Number(sale?.quantityInBase);
    if (Number.isFinite(stored) && stored > 0) return stored;
    const q = Number(sale?.quantity) || 0;
    const f = Number(sale?.saleFactor) || 1;
    return q * f;
};

function SalesTable({ filters = {}, onViewSale }) {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || 'fa').toLowerCase().startsWith('en');

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jalaliMonthStyle, setJalaliMonthStyle] = useState(getJalaliMonthStyle);

    const loadSales = async () => {
        try {
            setLoading(true);
            const result = await getSales();
            setSales(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error('Failed to load sales:', err);
            setSales([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
        const onSales = () => loadSales();
        const onDb = () => loadSales();
        window.addEventListener('sales-updated', onSales);
        window.addEventListener('database-updated', onDb);
        return () => {
            window.removeEventListener('sales-updated', onSales);
            window.removeEventListener('database-updated', onDb);
        };
    }, []);

    useEffect(() => {
        const onChange = (e) => setJalaliMonthStyle(e?.detail || getJalaliMonthStyle());
        const onStorage = (e) => {
            if (e.key === 'jalaliMonthStyle') setJalaliMonthStyle(getJalaliMonthStyle());
        };
        window.addEventListener('jalali-month-style-changed', onChange);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('jalali-month-style-changed', onChange);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    // ═══ Cash-only filter + user filters ═══
    const filteredSales = sales
        .filter((sale) => sale.paymentType === 'cash')
        .filter((sale) => {
            const search = filters.search?.trim().toLowerCase() || '';
            const category = filters.category || 'all';

            if (search) {
                const text = [
                    sale.productName,
                    sale.category,
                    sale.customerName,
                    sale.customerPhone,
                    sale.note,
                    sale.saleUnit,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                if (!text.includes(search)) return false;
            }

            if (category !== 'all' && sale.category !== category) return false;
            return true;
        });

    const fmtMoney = (v) =>
        Number(v || 0).toLocaleString(isEnglish ? 'en-US' : 'fa-IR');
    const fmtNumber = (v) =>
        Number(v || 0).toLocaleString(isEnglish ? 'en-US' : 'fa-IR');

    const formatDate = (value) => {
        if (!value) return '-';
        if (isEnglish) {
            const d = new Date(value);
            if (Number.isNaN(d.getTime())) return '-';
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).format(d);
        }
        return (
            formatJalaliDate(value, {
                monthStyle: jalaliMonthStyle,
                withMonthName: true,
            }) || '-'
        );
    };

    const formatTime = (value) => {
        if (!value) return '';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        return new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(d);
    };

    if (loading) {
        return (
            <section
                dir={isEnglish ? 'ltr' : 'rtl'}
                className="ui-card flex min-h-64 items-center justify-center p-6"
            >
                <div className="flex flex-col items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                        <Loader2 size={20} className="animate-spin text-[var(--accent-500)]" />
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">
                        {t('sales.table.loading')}
                    </span>
                </div>
            </section>
        );
    }

    if (filteredSales.length === 0) {
        return (
            <section
                dir={isEnglish ? 'ltr' : 'rtl'}
                className="ui-card flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center"
            >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                    <Receipt size={24} className="text-[var(--text-muted)]" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--text)]">
                    {t('sales.table.empty.title')}
                </h3>
                <p className="mt-2 max-w-md text-xs leading-5 text-[var(--text-muted)]">
                    {t('sales.table.empty.description')}
                </p>
            </section>
        );
    }

    return (
        <section
            dir={isEnglish ? 'ltr' : 'rtl'}
            className="ui-card w-full min-w-0 overflow-hidden p-0"
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10 shadow-[var(--shadow-xs)]">
                        <Banknote size={17} className="text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-[var(--text)] sm:text-base">
                            {isEnglish ? 'Cash Sales' : 'فروش‌های نقدی'}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5">
                            <span className="number-font font-mono text-[11px] text-[var(--text-muted)]">
                                {fmtNumber(filteredSales.length)}
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)]">
                                {t('sales.table.salesCount')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Desktop */}
            <div className="main-scrollbar hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] border-collapse">
                    <thead>
                        <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[11px] text-[var(--text-muted)]">
                            <Th>{t('sales.table.columns.product')}</Th>
                            <Th>{t('sales.table.columns.category')}</Th>
                            <Th>{t('sales.table.columns.quantity')}</Th>
                            <Th>{t('sales.table.columns.amount')}</Th>
                            <Th>{t('sales.table.columns.date')}</Th>
                            <Th>{t('sales.table.columns.actions')}</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map((sale) => {
                            const saleFactor = Number(sale.saleFactor) || 1;
                            const saleUnit = sale.saleUnit || sale.baseUnit || '';
                            const qtyInBase = getQuantityInBase(sale);
                            const baseUnit = sale.baseUnit || '';

                            return (
                                <tr
                                    key={sale.id}
                                    className="group border-b border-[var(--border)]/70 transition-colors duration-200 last:border-b-0 hover:bg-[var(--surface-hover)]"
                                >
                                    <td className="px-5 py-4">
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)]">
                                                <ShoppingBag size={16} className="text-[var(--text-muted)]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium text-[var(--text)]">
                                                    {sale.productName || t('sales.table.fallbackProduct')}
                                                </p>
                                                {sale.customerName && (
                                                    <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
                                                        {sale.customerName}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <span className="inline-flex max-w-[160px] items-center truncate rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)]">
                                            {sale.category || '-'}
                                        </span>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-baseline gap-1">
                                                <span className="number-font font-mono text-sm text-[var(--text-secondary)]">
                                                    {fmtNumber(sale.quantity)}
                                                </span>
                                                {saleUnit && (
                                                    <span className="text-[10px] text-[var(--text-muted)]">
                                                        {saleUnit}
                                                    </span>
                                                )}
                                            </div>
                                            {saleFactor !== 1 && baseUnit && (
                                                <span className="text-[9px] text-[var(--text-muted)]">
                                                    = {fmtNumber(qtyInBase)} {baseUnit}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div>
                                            <p
                                                dir="ltr"
                                                className="number-font whitespace-nowrap text-sm font-semibold text-emerald-600 dark:text-emerald-400"
                                            >
                                                {fmtMoney(getSaleTotal(sale))}{' '}
                                                <span className="text-[10px] font-normal text-[var(--text-muted)]">
                                                    {t('common.currency')}
                                                </span>
                                            </p>
                                            <p
                                                dir="ltr"
                                                className="number-font mt-1 text-[10px] text-[var(--text-muted)]"
                                            >
                                                {fmtMoney(sale.unitPrice)} × {fmtNumber(sale.quantity)}
                                                {saleUnit && ` ${saleUnit}`}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <div className="min-w-[120px]">
                                            <p className="whitespace-nowrap text-xs text-[var(--text-secondary)]">
                                                {formatDate(sale.date || sale.createdAt)}
                                            </p>
                                            <p className="number-font mt-1 font-mono text-[10px] text-[var(--text-muted)]">
                                                {formatTime(sale.date || sale.createdAt)}
                                            </p>
                                        </div>
                                    </td>

                                    <td className="px-5 py-4">
                                        <button
                                            type="button"
                                            onClick={() => onViewSale?.(sale)}
                                            aria-label={t('sales.table.viewDetails')}
                                            title={t('sales.table.viewDetails')}
                                            className="ui-icon-button h-9 w-9"
                                        >
                                            <Eye size={17} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-[var(--border)] bg-[var(--surface)] md:hidden">
                {filteredSales.map((sale) => {
                    const saleFactor = Number(sale.saleFactor) || 1;
                    const saleUnit = sale.saleUnit || sale.baseUnit || '';
                    const qtyInBase = getQuantityInBase(sale);
                    const baseUnit = sale.baseUnit || '';

                    return (
                        <article
                            key={sale.id}
                            className="relative p-4 transition-colors duration-200 hover:bg-[var(--surface-hover)]"
                        >
                            <div className="flex min-w-0 items-start justify-between gap-3">
                                <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/15 bg-emerald-500/10">
                                        <Banknote size={17} className="text-emerald-500 dark:text-emerald-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-[var(--text)]">
                                            {sale.productName || t('sales.table.fallbackProduct')}
                                        </p>
                                        <div className="mt-1 flex min-w-0 items-center gap-1.5">
                                            <span className="truncate text-[11px] text-[var(--text-muted)]">
                                                {sale.category || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onViewSale?.(sale)}
                                    aria-label={t('sales.table.viewDetails')}
                                    className="ui-icon-button h-9 w-9 shrink-0"
                                >
                                    <Eye size={17} />
                                </button>
                            </div>

                            <div className="mt-4 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] px-3 py-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-[var(--text-muted)]">
                                            {t('sales.table.columns.amount')}
                                        </p>
                                        <p
                                            dir="ltr"
                                            className="number-font mt-1 truncate text-lg font-bold text-emerald-600 dark:text-emerald-400"
                                        >
                                            {fmtMoney(getSaleTotal(sale))}
                                            <span className="ms-1 text-[10px] font-normal text-[var(--text-muted)]">
                                                {t('common.currency')}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <InfoItem
                                        label={t('sales.table.columns.quantity')}
                                        value={
                                            <>
                                                {fmtNumber(sale.quantity)}
                                                {saleUnit && ` ${saleUnit}`}
                                                {saleFactor !== 1 && baseUnit && (
                                                    <span className="ms-1 text-[9px] text-[var(--text-muted)]">
                                                        ({fmtNumber(qtyInBase)} {baseUnit})
                                                    </span>
                                                )}
                                            </>
                                        }
                                    />
                                    <InfoItem
                                        align="end"
                                        label={t('sales.form.fields.unitPrice')}
                                        value={`${fmtMoney(sale.unitPrice)} ${t('common.currency')}`}
                                    />
                                </div>
                                <div className="my-3 h-px bg-[var(--border)]" />
                                <div className="grid grid-cols-2 gap-3">
                                    <InfoItem
                                        label={t('sales.table.columns.date')}
                                        value={formatDate(sale.date || sale.createdAt)}
                                    />
                                    <InfoItem
                                        align="end"
                                        label={t('sales.table.columns.date')}
                                        value={formatTime(sale.date || sale.createdAt)}
                                    />
                                </div>
                                {sale.customerName && (
                                    <>
                                        <div className="my-3 h-px bg-[var(--border)]" />
                                        <InfoItem
                                            label={t('sales.details.customer.name')}
                                            value={sale.customerName}
                                        />
                                    </>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

// =========================================================
// Small helpers
// =========================================================

function Th({ children }) {
    return (
        <th className="whitespace-nowrap px-5 py-4 text-start font-medium">
            {children}
        </th>
    );
}

function InfoItem({ label, value, align = 'start' }) {
    return (
        <div className={`min-w-0 ${align === 'end' ? 'text-end' : 'text-start'}`}>
            <p className="mb-1 truncate text-[10px] text-[var(--text-muted)]">{label}</p>
            <p className="truncate text-xs font-medium text-[var(--text-secondary)]">
                {value}
            </p>
        </div>
    );
}

export default SalesTable;