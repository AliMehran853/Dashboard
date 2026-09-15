import { useEffect, useMemo, useState } from 'react';
import {
    Eye, ShoppingBag, Loader2, Receipt, Search,
    Banknote, CreditCard,
} from 'lucide-react';
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

const SEARCH_INPUT_STYLE = {
    paddingInlineStart: '2.75rem',
    paddingInlineEnd: '1rem',
};

function ReportsSalesTable({ onViewSale }) {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || 'fa').toLowerCase().startsWith('en');

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [jalaliMonthStyle, setJalaliMonthStyle] = useState(getJalaliMonthStyle);

    const [search, setSearch] = useState('');
    const [paymentFilter, setPaymentFilter] = useState('all');

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

    const filteredSales = useMemo(() => {
        const query = search.trim().toLowerCase();

        return sales.filter((sale) => {
            if (paymentFilter !== 'all' && sale.paymentType !== paymentFilter) return false;

            if (query) {
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
                if (!text.includes(query)) return false;
            }
            return true;
        });
    }, [sales, search, paymentFilter]);

    const fmtMoney = (v) => Number(v || 0).toLocaleString(isEnglish ? 'en-US' : 'fa-IR');
    const fmtNumber = (v) => Number(v || 0).toLocaleString(isEnglish ? 'en-US' : 'fa-IR');

    const formatDate = (value) => {
        if (!value) return '-';
        if (isEnglish) {
            const d = new Date(value);
            if (Number.isNaN(d.getTime())) return '-';
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric', month: '2-digit', day: '2-digit',
            }).format(d);
        }
        return formatJalaliDate(value, {
            monthStyle: jalaliMonthStyle, withMonthName: true,
        }) || '-';
    };

    const formatTime = (value) => {
        if (!value) return '';
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        return new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'fa-IR', {
            hour: '2-digit', minute: '2-digit',
        }).format(d);
    };

    const paymentFilters = [
        { value: 'all', label: isEnglish ? 'All' : 'همه', icon: Receipt },
        { value: 'cash', label: isEnglish ? 'Cash' : 'نقدی', icon: Banknote },
        { value: 'credit', label: isEnglish ? 'Credit' : 'نسیه', icon: CreditCard },
    ];

    if (loading) {
        return (
            <section dir={isEnglish ? 'ltr' : 'rtl'} className="ui-card flex min-h-64 items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                        <Loader2 size={20} className="animate-spin text-[var(--accent-500)]" />
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">
                        {t('sales.table.loading', { defaultValue: isEnglish ? 'Loading...' : 'در حال بارگذاری...' })}
                    </span>
                </div>
            </section>
        );
    }

    return (
        /* ✅ FIX #1: overflow-hidden → overflow-clip
           overflow-clip گوشه‌ها را می‌بُرد ولی scroll container نمی‌سازد،
           بنابراین iOS ژست‌های عمودی را بلاک نمی‌کند. */
        <section
            dir={isEnglish ? 'ltr' : 'rtl'}
            className="ui-card w-full min-w-0 overflow-clip p-0"
        >
            {/* Header */}
            <div className="flex flex-col gap-4 border-b border-[var(--border)] px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                            <ShoppingBag size={17} className="text-[var(--accent-500)]" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[var(--text)] sm:text-base">
                                {isEnglish ? 'All Transactions' : 'همه تراکنش‌ها'}
                            </h3>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="number-font font-mono text-[11px] text-[var(--text-muted)]">
                                    {fmtNumber(filteredSales.length)}
                                </span>
                                <span className="text-[11px] text-[var(--text-muted)]">
                                    {isEnglish ? 'transactions' : 'تراکنش'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="relative min-w-0 md:max-w-xs md:flex-1">
                        <Search
                            size={16}
                            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={isEnglish ? 'Search transactions...' : 'جستجوی تراکنش‌ها...'}
                            style={SEARCH_INPUT_STYLE}
                            className="ui-input h-10 w-full text-xs"
                        />
                    </div>

                    <div className="inline-flex w-fit items-center gap-1 self-start rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-1 md:self-auto">
                        {paymentFilters.map((f) => {
                            const active = paymentFilter === f.value;
                            const Icon = f.icon;
                            return (
                                <button
                                    key={f.value}
                                    type="button"
                                    onClick={() => setPaymentFilter(f.value)}
                                    className={`flex h-8 items-center gap-2 rounded-lg px-3.5 text-[11px] font-medium transition-all duration-200 ${
                                        active
                                            ? 'bg-[var(--surface)] text-[var(--accent-600)] shadow-[0_1px_3px_rgba(0,0,0,0.08)] dark:text-[var(--accent-300)]'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text)]'
                                    }`}
                                >
                                    <Icon size={13} className="shrink-0" />
                                    <span className="whitespace-nowrap">{f.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Empty */}
            {filteredSales.length === 0 && (
                <div className="flex min-h-40 flex-col items-center justify-center px-6 py-10 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                        <Receipt size={20} className="text-[var(--text-muted)]" />
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                        {isEnglish ? 'No transactions found.' : 'هیچ تراکنشی یافت نشد.'}
                    </p>
                </div>
            )}

            {/* Desktop table — ✅ FIX #2: اضافه شد `touch-scroll-x` */}
            {filteredSales.length > 0 && (
                <div className="touch-scroll-x main-scrollbar hidden overflow-x-auto md:block">
                    <table className="w-full min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)] text-[11px] text-[var(--text-muted)]">
                                <Th>{isEnglish ? 'Product' : 'محصول'}</Th>
                                <Th>{isEnglish ? 'Category' : 'دسته‌بندی'}</Th>
                                <Th>{isEnglish ? 'Quantity' : 'تعداد'}</Th>
                                <Th>{isEnglish ? 'Amount' : 'مبلغ'}</Th>
                                <Th>{isEnglish ? 'Payment' : 'پرداخت'}</Th>
                                <Th>{isEnglish ? 'Customer' : 'مشتری'}</Th>
                                <Th>{isEnglish ? 'Date' : 'تاریخ'}</Th>
                                <Th>{isEnglish ? 'Actions' : 'عملیات'}</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.map((sale) => {
                                const isCredit = sale.paymentType === 'credit';
                                const saleFactor = Number(sale.saleFactor) || 1;
                                const saleUnit = sale.saleUnit || sale.baseUnit || '';
                                const qtyInBase = getQuantityInBase(sale);
                                const baseUnit = sale.baseUnit || '';

                                return (
                                    <tr
                                        key={sale.id}
                                        className="border-b border-[var(--border)]/70 transition-colors last:border-b-0 hover:bg-[var(--surface-hover)]"
                                    >
                                        <td className="px-5 py-4">
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                                                    isCredit
                                                        ? 'border-amber-500/15 bg-amber-500/10'
                                                        : 'border-emerald-500/15 bg-emerald-500/10'
                                                }`}>
                                                    {isCredit ? (
                                                        <CreditCard size={15} className="text-amber-500" />
                                                    ) : (
                                                        <Banknote size={15} className="text-emerald-500" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-[var(--text)]">
                                                        {sale.productName || '-'}
                                                    </p>
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
                                                        <span className="text-[10px] text-[var(--text-muted)]">{saleUnit}</span>
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
                                                <p dir="ltr" className="number-font whitespace-nowrap text-sm font-semibold text-[var(--accent-500)]">
                                                    {fmtMoney(getSaleTotal(sale))}{' '}
                                                    <span className="text-[10px] font-normal text-[var(--text-muted)]">
                                                        {t('common.currency')}
                                                    </span>
                                                </p>
                                                <p dir="ltr" className="number-font mt-1 text-[10px] text-[var(--text-muted)]">
                                                    {fmtMoney(sale.unitPrice)} × {fmtNumber(sale.quantity)}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                                                isCredit
                                                    ? 'border-amber-500/15 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                                    : 'border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            }`}>
                                                {isCredit ? <CreditCard size={11} /> : <Banknote size={11} />}
                                                {isCredit
                                                    ? t('sales.paymentTypes.credit')
                                                    : t('sales.paymentTypes.cash')}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="truncate text-[11px] text-[var(--text-secondary)]">
                                                {sale.customerName || '-'}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="min-w-[110px]">
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
                                                className="ui-icon-button h-9 w-9"
                                                title={isEnglish ? 'View details' : 'مشاهده جزئیات'}
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
            )}

            {/* Mobile list */}
            {filteredSales.length > 0 && (
                <div className="divide-y divide-[var(--border)] bg-[var(--surface)] md:hidden">
                    {filteredSales.map((sale) => {
                        const isCredit = sale.paymentType === 'credit';
                        return (
                            <article key={sale.id} className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                                            isCredit
                                                ? 'border-amber-500/15 bg-amber-500/10'
                                                : 'border-emerald-500/15 bg-emerald-500/10'
                                        }`}>
                                            {isCredit ? <CreditCard size={17} className="text-amber-500" /> : <Banknote size={17} className="text-emerald-500" />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-[var(--text)]">
                                                {sale.productName || '-'}
                                            </p>
                                            <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
                                                {sale.category || '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onViewSale?.(sale)}
                                        className="ui-icon-button h-9 w-9 shrink-0"
                                    >
                                        <Eye size={17} />
                                    </button>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-[var(--text-muted)]">
                                            {isEnglish ? 'Amount' : 'مبلغ'}
                                        </p>
                                        <p dir="ltr" className="number-font mt-1 text-base font-bold text-[var(--accent-500)]">
                                            {fmtMoney(getSaleTotal(sale))}
                                            <span className="ms-1 text-[10px] font-normal text-[var(--text-muted)]">{t('common.currency')}</span>
                                        </p>
                                    </div>
                                    <span className={`inline-flex shrink-0 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium ${
                                        isCredit
                                            ? 'border-amber-500/15 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                            : 'border-emerald-500/15 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                    }`}>
                                        {isCredit
                                            ? t('sales.paymentTypes.credit')
                                            : t('sales.paymentTypes.cash')}
                                    </span>
                                </div>

                                <div className="mt-2 text-[10px] text-[var(--text-muted)]">
                                    {formatDate(sale.date || sale.createdAt)} · {formatTime(sale.date || sale.createdAt)}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function Th({ children }) {
    return <th className="whitespace-nowrap px-5 py-4 text-start font-medium">{children}</th>;
}

export default ReportsSalesTable;