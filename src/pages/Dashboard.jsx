import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, Banknote, ShoppingBasket, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { initializeDatabase, db } from '../database/db';
import SalesChart from '../components/dashboard/SalesChart';
import PaymentChart from '../components/dashboard/PaymentChart';
import ThirtyDaySalesChart from '../components/dashboard/ThirtyDaySalesChart';
import MonthlySalesChart from '../components/dashboard/MonthlySalesChart';
import QuickActions from '../components/dashboard/QuickActions';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { useCountUp } from '../hooks/useCountUp';

function AnimatedNumber({ value, language, className, dir, decimals = 0 }) {
    const animated = useCountUp(Number(value) || 0, {
        duration: 900,
        decimals,
    });

    const isEnglish = String(language || '').toLowerCase().startsWith('en');

    const formatted = new Intl.NumberFormat(
        isEnglish ? 'en-US' : 'fa-IR',
        {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }
    ).format(animated);

    return (
        <span dir={dir} className={className}>
            {formatted}
        </span>
    );
}

const getSaleAmount = (sale) => {
    if (!sale) return 0;

    const direct = Number(
        sale.totalAmount ??
        sale.total ??
        sale.amount ??
        sale.finalAmount ??
        sale.payableAmount ??
        sale.grandTotal
    );

    if (Number.isFinite(direct)) return Math.max(0, direct);
    if (!Array.isArray(sale.items)) return 0;

    return sale.items.reduce((total, item) => {
        const q = Number(item.quantity ?? 0);
        const p = Number(item.sellPrice ?? item.price ?? item.unitPrice ?? 0);
        if (!Number.isFinite(q) || !Number.isFinite(p)) return total;
        return total + Math.max(0, q) * Math.max(0, p);
    }, 0);
};

const getSaleDate = (sale) =>
    sale?.date ?? sale?.createdAt ?? sale?.updatedAt ?? null;

const isCash = (sale) =>
    sale?.paymentType === 'cash' || sale?.paymentType === 'نقدی';

const isCredit = (sale) =>
    sale?.paymentType === 'credit' || sale?.paymentType === 'نسیه';

const isToday = (value) => {
    if (!value) return false;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
};

const TONES = {
    accent: {
        iconBg: 'bg-[var(--accent-soft)] border-[var(--accent-border)]',
        iconText: 'text-[var(--accent-500)]',
    },
    success: {
        iconBg: 'bg-emerald-500/10 border-emerald-500/15 dark:border-emerald-400/15',
        iconText: 'text-emerald-500 dark:text-emerald-400',
    },
    warning: {
        iconBg: 'bg-amber-500/10 border-amber-500/15 dark:border-amber-400/15',
        iconText: 'text-amber-500 dark:text-amber-400',
    },
    cyan: {
        iconBg: 'bg-cyan-500/10 border-cyan-500/15 dark:border-cyan-400/15',
        iconText: 'text-cyan-500 dark:text-cyan-400',
    },
};

const DB_EVENTS = [
    'products-updated',
    'sales-updated',
    'credit-sales-updated',
    'shopping-list-updated',
    'categories-updated',
    'database-updated',
];

function Dashboard() {
    const { t, i18n } = useTranslation();

    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');

    const [sales, setSales] = useState([]);
    const [shoppingCount, setShoppingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            await initializeDatabase();

            const [salesData, shoppingItems] = await Promise.all([
                db.sales.orderBy('createdAt').reverse().toArray(),
                db.shoppingList.toArray(),
            ]);

            setSales(Array.isArray(salesData) ? salesData : []);
            setShoppingCount(
                Array.isArray(shoppingItems)
                    ? shoppingItems.filter((i) => !i.completed).length
                    : 0
            );
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setSales([]);
            setShoppingCount(0);
            setError(err?.message || t('dashboard.errors.load'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    useEffect(() => {
        DB_EVENTS.forEach((e) => window.addEventListener(e, loadDashboardData));

        const onVisibility = () => {
            if (document.visibilityState === 'visible') {
                loadDashboardData();
            }
        };

        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('focus', loadDashboardData);

        return () => {
            DB_EVENTS.forEach((e) => window.removeEventListener(e, loadDashboardData));
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('focus', loadDashboardData);
        };
    }, [loadDashboardData]);

    const dashboardData = useMemo(() => {
        const today = sales.filter((s) => isToday(getSaleDate(s)));

        const total = today.reduce((acc, s) => acc + getSaleAmount(s), 0);
        const credit = today.filter(isCredit).reduce((acc, s) => acc + getSaleAmount(s), 0);
        const cash = today.filter(isCash).reduce((acc, s) => acc + getSaleAmount(s), 0);

        return {
            todayTotal: total,
            todayCredit: credit,
            todayCash: cash,
            todayTransactions: today.length,
            shoppingCount,
        };
    }, [sales, shoppingCount]);

    const stats = useMemo(
        () => [
            {
                id: 'today-sales',
                tone: 'accent',
                icon: ShoppingCart,
                title: t('dashboard.stats.todaySales.title'),
                value: dashboardData.todayTotal,
                unit: t('dashboard.stats.todaySales.unit'),
                description: t('dashboard.stats.todaySales.transactionCount', {
                    count: dashboardData.todayTransactions,
                }),
                change:
                    dashboardData.todayTransactions > 0
                        ? t('dashboard.stats.todaySales.active')
                        : t('dashboard.stats.todaySales.noSales'),
            },
            {
                id: 'cash-sales',
                tone: 'success',
                icon: Banknote,
                title: t('dashboard.stats.cashSales.title'),
                value: dashboardData.todayCash,
                unit: t('dashboard.stats.cashSales.unit'),
                description: t('dashboard.stats.cashSales.description'),
                change:
                    dashboardData.todayCash > 0
                        ? t('dashboard.stats.cashSales.recorded')
                        : t('dashboard.stats.cashSales.none'),
            },
            {
                id: 'credit-sales',
                tone: 'warning',
                icon: CreditCard,
                title: t('dashboard.stats.creditSales.title'),
                value: dashboardData.todayCredit,
                unit: t('dashboard.stats.creditSales.unit'),
                description: t('dashboard.stats.creditSales.description'),
                change:
                    dashboardData.todayCredit > 0
                        ? t('dashboard.stats.creditSales.recorded')
                        : t('dashboard.stats.creditSales.none'),
            },
            {
                id: 'shopping-list',
                tone: 'cyan',
                icon: ShoppingBasket,
                title: t('dashboard.stats.shoppingList.title'),
                value: dashboardData.shoppingCount,
                unit: t('dashboard.stats.shoppingList.unit'),
                description: t('dashboard.stats.shoppingList.description'),
                change:
                    dashboardData.shoppingCount > 0
                        ? t('dashboard.stats.shoppingList.pending')
                        : t('dashboard.stats.shoppingList.completed'),
            },
        ],
        [t, dashboardData]
    );

    return (
        <div
            dir={i18n.dir()}
            className="
                w-full
                max-w-none
                min-w-0
                space-y-5
                sm:space-y-6
                pb-2
                text-[var(--text)]
            "
        >
            <section className="ui-card relative overflow-hidden rounded-2xl p-4 sm:p-5 md:p-6">
                <div className="relative">
                    <h1 className="text-xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-2xl lg:text-3xl">
                        {t('common.dashboard')}
                    </h1>
                    <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--text-muted)] sm:text-sm">
                        {t('common.dashboardSubtitle')}
                    </p>
                </div>
            </section>

            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs leading-5 text-[var(--danger)] sm:text-sm"
                >
                    {error}
                </div>
            )}

            <section className="space-y-4">
                <header className="flex items-center gap-3">
                    <span
                        aria-hidden="true"
                        className="h-7 w-1 shrink-0 rounded-full bg-[var(--accent-500)] shadow-[0_0_12px_var(--accent-glow)] sm:h-8"
                    />
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-[var(--text)] sm:text-base lg:text-lg">
                            {t('dashboard.stats.sectionTitle', {
                                defaultValue: isEnglish
                                    ? 'Dashboard Overview'
                                    : 'خلاصه وضعیت داشبورد',
                            })}
                        </h2>
                        <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
                            {t('dashboard.stats.sectionDescription', {
                                defaultValue: isEnglish
                                    ? "Today's activity and store overview"
                                    : 'فعالیت امروز و نمای کلی فروشگاه',
                            })}
                        </p>
                    </div>
                </header>

                <div className="grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        const tone = TONES[stat.tone];

                        return (
                            <article
                                key={stat.id}
                                className="ui-card group relative min-w-0 p-4 sm:p-5"
                            >
                                <div className="relative z-10 flex items-start justify-between gap-3">
                                    <div
                                        className={`
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            sm:h-11
                                            sm:w-11
                                            ${tone.iconBg}
                                        `}
                                    >
                                        <Icon size={20} strokeWidth={1.9} className={tone.iconText} />
                                    </div>

                                    <span className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-[9px] font-medium text-[var(--text-muted)] sm:text-[10px]">
                                        {t('common.today')}
                                    </span>
                                </div>

                                <div className="relative z-10 mt-4 sm:mt-5">
                                    <p className="text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
                                        {stat.title}
                                    </p>

                                    <div className="mt-1.5 flex min-w-0 items-baseline gap-1.5">
                                        {loading ? (
                                            <div className="h-8 w-28 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
                                        ) : (
                                            <>
                                                <h3
                                                    dir="ltr"
                                                    className="min-w-0 truncate number-font text-2xl font-bold tracking-tight text-[var(--text)]"
                                                >
                                                    <AnimatedNumber
                                                        value={stat.value}
                                                        language={language}
                                                    />
                                                </h3>

                                                <span className="shrink-0 text-xs font-medium text-[var(--text-muted)] sm:text-sm">
                                                    {stat.unit}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <p className="mt-2.5 min-h-[2.5rem] text-[10px] leading-5 text-[var(--text-muted)] sm:text-[11px]">
                                        {stat.description}
                                    </p>

                                    <span className={`mt-1 inline-block text-[10px] font-medium sm:text-[11px] ${tone.iconText}`}>
                                        {stat.change}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 min-w-0 items-stretch">
                <div className="w-full min-w-0">
                    <SalesChart sales={sales} loading={loading} />
                </div>
                <div className="w-full min-w-0">
                    <PaymentChart sales={sales} loading={loading} />
                </div>
            </section>

            <section className="w-full min-w-0">
                <ThirtyDaySalesChart sales={sales} loading={loading} />
            </section>

            <section className="w-full min-w-0">
                <MonthlySalesChart sales={sales} loading={loading} />
            </section>

            <QuickActions />

            <RecentTransactions sales={sales} loading={loading} />
        </div>
    );
}

export default Dashboard;