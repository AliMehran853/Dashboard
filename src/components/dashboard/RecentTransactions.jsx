import { useEffect, useState } from 'react';
import { ArrowUpLeft, Banknote, CreditCard, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatJalaliDate, getJalaliMonthStyle } from '../../utils/date/jalali';

// ---------- helpers ----------
const getSaleAmount = (sale) => {
    if (!sale) return 0;
    const direct = Number(sale.totalAmount ?? sale.total ?? sale.amount ?? sale.finalAmount ?? sale.payableAmount ?? sale.grandTotal);
    if (Number.isFinite(direct)) return Math.max(0, direct);
    if (!Array.isArray(sale.items)) return 0;
    return sale.items.reduce((total, item) => {
        const q = Number(item.quantity ?? 0);
        const p = Number(item.sellPrice ?? item.price ?? item.unitPrice ?? 0);
        if (!Number.isFinite(q) || !Number.isFinite(p)) return total;
        return total + Math.max(0, q) * Math.max(0, p);
    }, 0);
};

const getSaleDate = (sale) => sale?.date ?? sale?.createdAt ?? sale?.updatedAt ?? null;
const isCredit = (sale) => sale?.paymentType === 'credit' || sale?.paymentType === 'نسیه';

const getSaleDescription = (sale, t) => {
    if (sale?.customerName) return sale.customerName;
    if (sale?.customer?.name) return sale.customer.name;
    if (sale?.customerId) return t('dashboard.recentTransactions.customer');
    if (Array.isArray(sale?.items) && sale.items.length) {
        return sale.items.length === 1
            ? (sale.items[0]?.name || t('dashboard.recentTransactions.saleDescription'))
            : t('dashboard.recentTransactions.itemsCount', { count: sale.items.length });
    }
    return t('dashboard.recentTransactions.saleDescription');
};

// ---------- component ----------
function RecentTransactions({ sales = [], loading = false }) {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [jalaliMonthStyle, setJalaliMonthStyle] = useState(getJalaliMonthStyle);

    useEffect(() => {
        const onChange = (e) => setJalaliMonthStyle(e?.detail || getJalaliMonthStyle());
        const onStorage = (e) => {
            if (e.key === 'jalaliMonthStyle') setJalaliMonthStyle(e.newValue || getJalaliMonthStyle());
        };
        window.addEventListener('jalali-month-style-changed', onChange);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('jalali-month-style-changed', onChange);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    const recentSales = Array.isArray(sales)
        ? sales.filter((s) => s && getSaleDate(s)).slice(0, 4)
        : [];

    const formatAmount = (amount) =>
        Number(amount || 0).toLocaleString(i18n.language === 'en' ? 'en-US' : 'fa-IR');

    const formatDate = (value) => {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '';

        const isEnglish = String(i18n.language || '').toLowerCase().startsWith('en');
        if (isEnglish) {
            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
            }).format(date);
        }
        const jalali = formatJalaliDate(date, { monthStyle: jalaliMonthStyle, withMonthName: true });
        const time = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(date);
        return `${jalali} - ${time}`;
    };

    const getPaymentLabel = (sale) => isCredit(sale)
        ? t('dashboard.recentTransactions.paymentTypes.credit')
        : t('dashboard.recentTransactions.paymentTypes.cash');

    const getIcon = (sale) => isCredit(sale) ? CreditCard : Banknote;

    const getStyle = (sale) => isCredit(sale)
        ? {
            wrapper: 'border border-amber-500/15 bg-amber-500/[0.07] dark:border-amber-400/15 dark:bg-amber-400/[0.06]',
            icon: 'text-amber-500 dark:text-amber-400',
        }
        : {
            wrapper: 'border border-[var(--accent-border)] bg-[var(--accent-soft)]',
            icon: 'text-[var(--accent-500)]',
        };

    return (
        <section dir={i18n.dir()} className="ui-card w-full min-w-0 overflow-hidden p-0">
            {/* header */}
            <div className="flex flex-col gap-3 border-b border-[var(--border-subtle)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-500)] shadow-[0_0_10px_var(--accent-glow)]" />
                        <h2 className="truncate text-base font-semibold tracking-[-0.01em] text-[var(--text)] sm:text-lg">
                            {t('dashboard.recentTransactions.title')}
                        </h2>
                    </div>
                    <p className="mt-1.5 text-xs leading-5 text-[var(--text-muted)]">
                        {t('dashboard.recentTransactions.description')}
                    </p>
                </div>

                {/* ✅ FIXED: → /reports (combined transactions) */}
                <button
                    type="button"
                    onClick={() => navigate('/reports')}
                    className="self-start shrink-0 rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium text-[var(--accent-600)] transition-all duration-200 hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] sm:self-auto"
                >
                    {t('dashboard.recentTransactions.viewAll')}
                </button>
            </div>

            {/* list */}
            <div className="divide-y divide-[var(--border-subtle)]">
                {loading ? (
                    <div className="px-5 py-12 text-center text-xs text-[var(--text-muted)]">
                        {t('dashboard.recentTransactions.loading')}
                    </div>
                ) : recentSales.length === 0 ? (
                    <div className="flex flex-col items-center px-5 py-12 text-center">
                        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] text-[var(--text-soft)]">
                            <ShoppingCart size={22} strokeWidth={1.7} />
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">
                            {t('dashboard.recentTransactions.empty')}
                        </p>
                    </div>
                ) : (
                    recentSales.map((sale, index) => {
                        const Icon = getIcon(sale);
                        const style = getStyle(sale);
                        const amount = getSaleAmount(sale);
                        const date = getSaleDate(sale);
                        const description = getSaleDescription(sale, t);

                        return (
                            <div
                                key={sale.id ?? `${date}-${index}`}
                                className="group flex min-w-0 items-center gap-3 px-4 py-3.5 transition-colors duration-200 hover:bg-[var(--surface-muted)] sm:gap-4 sm:px-5 sm:py-4"
                            >
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-[1.03] ${style.wrapper}`}>
                                    <Icon size={17} strokeWidth={1.8} className={style.icon} />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <h3 className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--text)] sm:text-sm">
                                            {t('dashboard.recentTransactions.sale.title')}
                                        </h3>
                                        <span className="hidden h-1 w-1 shrink-0 rounded-full bg-[var(--text-soft)] md:block" />
                                        <span className="hidden max-w-[12rem] truncate text-[11px] text-[var(--text-muted)] md:block">
                                            {description}
                                        </span>
                                    </div>

                                    <div className="mt-1.5 flex min-w-0 items-center gap-1.5 sm:gap-2">
                                        <span className="min-w-0 truncate text-[10px] sm:text-[11px] text-[var(--text-soft)]">
                                            {formatDate(date)}
                                        </span>
                                        <span className="shrink-0 text-[var(--text-soft)]">•</span>
                                        <span className="shrink-0 text-[10px] sm:text-[11px] text-[var(--text-muted)]">
                                            {getPaymentLabel(sale)}
                                        </span>
                                    </div>
                                </div>

                                <div className="min-w-[5rem] shrink-0 text-end">
                                    <div className="flex items-center justify-end gap-1">
                                        <p className="whitespace-nowrap text-xs font-semibold text-[var(--text)] sm:text-sm">
                                            {formatAmount(amount)}
                                        </p>
                                        <span className="hidden text-[10px] text-[var(--text-soft)] sm:inline">
                                            {t('common.currency')}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center justify-end gap-1">
                                        <ArrowUpLeft size={10} className="text-[var(--accent-500)]" />
                                        <span className="text-[9px] sm:text-[10px] text-[var(--text-soft)]">
                                            {t('common.incoming')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </section>
    );
}

export default RecentTransactions;