import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, Package, ShoppingBasket, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { initializeDatabase, db } from '../database/db';
import SalesChart from '../components/dashboard/SalesChart';
import PaymentChart from '../components/dashboard/PaymentChart';
import ThirtyDaySalesChart from '../components/dashboard/ThirtyDaySalesChart';
import MonthlySalesChart from '../components/dashboard/MonthlySalesChart';
import QuickActions from '../components/dashboard/QuickActions';
import RecentTransactions from '../components/dashboard/RecentTransactions';

// =========================================================
// Helpers
// =========================================================

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

const getSaleDate = (sale) => sale?.date ?? sale?.createdAt ?? sale?.updatedAt ?? null;
const isCash = (sale) => sale?.paymentType === 'cash' || sale?.paymentType === 'نقدی';
const isCredit = (sale) => sale?.paymentType === 'credit' || sale?.paymentType === 'نسیه';

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

// =========================================================
// Tone styles (icon backgrounds)
// =========================================================

const TONES = {
    accent: {
        iconBg: 'bg-[var(--accent-soft)] border-[var(--accent-border)]',
        iconText: 'text-[var(--accent-500)]',
    },
    warning: {
        iconBg: 'bg-amber-500/10 border-amber-500/15 dark:border-amber-400/15',
        iconText: 'text-amber-500 dark:text-amber-400',
    },
    violet: {
        iconBg: 'bg-violet-500/10 border-violet-500/15 dark:border-violet-400/15',
        iconText: 'text-violet-500 dark:text-violet-400',
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

// =========================================================
// Dashboard Page
// =========================================================

function Dashboard() {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || 'fa').toLowerCase().startsWith('en');

    const [sales, setSales] = useState([]);
    const [productsCount, setProductsCount] = useState(0);
    const [shoppingCount, setShoppingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // =====================================================
    // Load data
    // =====================================================

    const loadDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            await initializeDatabase();

            const [salesData, productCount, shoppingItems] = await Promise.all([
                db.sales.orderBy('createdAt').reverse().toArray(),
                db.products.count(),
                db.shoppingList.toArray(),
            ]);

            setSales(Array.isArray(salesData) ? salesData : []);
            setProductsCount(Number(productCount) || 0);
            setShoppingCount(
                Array.isArray(shoppingItems)
                    ? shoppingItems.filter((i) => !i.completed).length
                    : 0
            );
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
            setSales([]);
            setProductsCount(0);
            setShoppingCount(0);
            setError(err?.message || t('dashboard.errors.load'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // =====================================================
    // Live refresh
    // =====================================================

    useEffect(() => {
        DB_EVENTS.forEach((e) => window.addEventListener(e, loadDashboardData));

        const onVisibility = () => {
            if (document.visibilityState === 'visible') loadDashboardData();
        };

        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('focus', loadDashboardData);

        return () => {
            DB_EVENTS.forEach((e) => window.removeEventListener(e, loadDashboardData));
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('focus', loadDashboardData);
        };
    }, [loadDashboardData]);

    // =====================================================
    // Derived data
    // =====================================================

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
            productsCount,
            shoppingCount,
        };
    }, [sales, productsCount, shoppingCount]);

    // =====================================================
    // Stats cards
    // =====================================================

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
                id: 'products',
                tone: 'violet',
                icon: Package,
                title: t('dashboard.stats.products.title'),
                value: dashboardData.productsCount,
                unit: t('dashboard.stats.products.unit'),
                description: t('dashboard.stats.products.description'),
                change:
                    dashboardData.productsCount > 0
                        ? t('dashboard.stats.products.active')
                        : t('dashboard.stats.products.empty'),
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

    const formatNumber = (v) =>
        Number(v || 0).toLocaleString(isEnglish ? 'en-US' : 'fa-IR');

    // =====================================================
    // Render
    // =====================================================

    return (
        <div dir={i18n.dir()} className="w-full max-w-none min-w-0 space-y-5 sm:space-y-6 pb-2 text-[var(--text)]">

            {/* ================= Page header ================= */}
            <section className="ui-card relative overflow-hidden rounded-2xl p-4 sm:p-5 md:p-6">
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -start-16 -top-20 h-48 w-48 rounded-full bg-[var(--accent-soft-heavy)] blur-3xl"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -end-16 -bottom-24 h-44 w-44 rounded-full bg-indigo-500/[0.035] blur-3xl dark:bg-indigo-400/[0.045]"
                />

                <div className="relative">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[var(--accent-500)] shadow-[0_0_12px_var(--accent-glow)]" />
                        <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--accent-600)]">
                            Taqwa
                        </span>
                    </div>

                    <h1 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-2xl lg:text-3xl">
                        {t('common.dashboard')}
                    </h1>

                    <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--text-muted)] sm:text-sm">
                        {t('common.dashboardSubtitle')}
                    </p>
                </div>
            </section>

            {/* ================= Error ================= */}
            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs leading-5 text-[var(--danger)] sm:text-sm"
                >
                    {error}
                </div>
            )}

            {/* ================= Stats ================= */}
            <section className="space-y-4">
                {/* Section header */}
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

                {/* Stats grid */}
                <div className="grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        const tone = TONES[stat.tone];

                        return (
                            <article
                                key={stat.id}
                                className="
                                    group relative min-w-0 overflow-hidden rounded-2xl
                                    border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5
                                    transition-all duration-300 ease-[var(--ease-out)]
                                    hover:bg-[var(--surface-hover)]
                                    hover:border-[var(--accent-border-hover)]
                                    hover:shadow-[var(--shadow-card-hover)]
                                "
                            >
                                {/* Top row */}
                                <div className="relative z-10 flex items-start justify-between gap-3">
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:h-11 sm:w-11 ${tone.iconBg}`}
                                    >
                                        <Icon size={20} strokeWidth={1.9} className={tone.iconText} />
                                    </div>

                                    <span className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-[9px] font-medium text-[var(--text-muted)] sm:text-[10px]">
                                        {t('common.today')}
                                    </span>
                                </div>

                                {/* Content */}
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
                                                    {formatNumber(stat.value)}
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

                                    <span
                                        className={`mt-1 inline-block text-[10px] font-medium sm:text-[11px] ${tone.iconText}`}
                                    >
                                        {stat.change}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </section>

            {/* ================= Weekly + Payment ================= */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 min-w-0 items-stretch">
                <div className="w-full min-w-0">
                    <SalesChart sales={sales} loading={loading} />
                </div>
                <div className="w-full min-w-0">
                    <PaymentChart sales={sales} loading={loading} />
                </div>
            </section>

            {/* ================= 30 days ================= */}
            <section className="w-full min-w-0">
                <ThirtyDaySalesChart sales={sales} loading={loading} />
            </section>

            {/* ================= 12 months ================= */}
            <section className="w-full min-w-0">
                <MonthlySalesChart sales={sales} loading={loading} />
            </section>

            {/* ================= Quick actions ================= */}
            <QuickActions />

            {/* ================= Recent transactions ================= */}
            <RecentTransactions sales={sales} loading={loading} />
        </div>
    );
}

export default Dashboard;