import { useEffect, useState } from 'react';
import {
    Banknote,
    CreditCard,
    ShoppingBag,
    TrendingUp,
    Loader2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getTodaySalesStatistics } from '../../services/salesService';

// =========================================================
// Defaults & Normalizer
// =========================================================

const DEFAULT_STATS = {
    totalSales: 0,
    cashSales: 0,
    creditSales: 0,
    totalItems: 0,
    salesCount: 0,
};

const normalizeStats = (v) => ({
    totalSales: Number(v?.totalSales) || 0,
    cashSales: Number(v?.cashSales) || 0,
    creditSales: Number(v?.creditSales) || 0,
    totalItems: Number(v?.totalItems) || 0,
    salesCount: Number(v?.salesCount) || 0,
});

// =========================================================
// Tone styles (icon backgrounds)
// =========================================================

const TONES = {
    accent: {
        iconBg: 'bg-[var(--accent-soft)] border-[var(--accent-border)]',
        iconText: 'text-[var(--accent-500)]',
    },
    cyan: {
        iconBg: 'bg-cyan-500/10 border-cyan-500/15 dark:border-cyan-400/15',
        iconText: 'text-cyan-500 dark:text-cyan-400',
    },
    warning: {
        iconBg: 'bg-amber-500/10 border-amber-500/15 dark:border-amber-400/15',
        iconText: 'text-amber-500 dark:text-amber-400',
    },
    violet: {
        iconBg: 'bg-violet-500/10 border-violet-500/15 dark:border-violet-400/15',
        iconText: 'text-violet-500 dark:text-violet-400',
    },
};

// =========================================================
// Sales Stats
// =========================================================

function SalesStats() {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || 'fa').toLowerCase().startsWith('en');

    const [stats, setStats] = useState(DEFAULT_STATS);
    const [loading, setLoading] = useState(true);

    const fmt = (v) =>
        new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR').format(Number(v) || 0);

    // =====================================================
    // Load
    // =====================================================

    const loadStats = async () => {
        try {
            setLoading(true);
            const result = await getTodaySalesStatistics();
            setStats(normalizeStats(result));
        } catch (err) {
            console.error('Failed to load sales statistics:', err);
            setStats(DEFAULT_STATS);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();

        const onSales = () => loadStats();
        const onDb = () => loadStats();
        const onVis = () => {
            if (document.visibilityState === 'visible') loadStats();
        };
        const onFocus = () => loadStats();

        window.addEventListener('sales-updated', onSales);
        window.addEventListener('database-updated', onDb);
        document.addEventListener('visibilitychange', onVis);
        window.addEventListener('focus', onFocus);

        return () => {
            window.removeEventListener('sales-updated', onSales);
            window.removeEventListener('database-updated', onDb);
            document.removeEventListener('visibilitychange', onVis);
            window.removeEventListener('focus', onFocus);
        };
    }, []);

    // =====================================================
    // Cards
    // =====================================================

    const cards = [
        {
            id: 'today-sales',
            tone: 'accent',
            icon: TrendingUp,
            title: t('sales.stats.todaySales.title'),
            value: `${fmt(stats.totalSales)} ${t('common.currency')}`,
            description: t('sales.stats.todaySales.description', {
                count: fmt(stats.salesCount),
            }),
        },
        {
            id: 'cash-sales',
            tone: 'cyan',
            icon: Banknote,
            title: t('sales.stats.cashSales.title'),
            value: `${fmt(stats.cashSales)} ${t('common.currency')}`,
            description: t('sales.stats.cashSales.description'),
        },
        {
            id: 'credit-sales',
            tone: 'warning',
            icon: CreditCard,
            title: t('sales.stats.creditSales.title'),
            value: `${fmt(stats.creditSales)} ${t('common.currency')}`,
            description: t('sales.stats.creditSales.description'),
        },
        {
            id: 'total-items',
            tone: 'violet',
            icon: ShoppingBag,
            title: t('sales.stats.items.title'),
            value: fmt(stats.totalItems),
            description: t('sales.stats.items.description'),
        },
    ];

    // =====================================================
    // Render
    // =====================================================

    return (
        <section dir={isEnglish ? 'ltr' : 'rtl'} className="space-y-4">
            {/* Section header */}
            <header className="flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className="h-7 w-1 shrink-0 rounded-full bg-[var(--accent-500)] shadow-[0_0_12px_var(--accent-glow)] sm:h-8"
                />
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-[var(--text)] sm:text-base lg:text-lg">
                        {t('sales.stats.sectionTitle', {
                            defaultValue: isEnglish
                                ? "Today's Sales Summary"
                                : 'خلاصه فروش امروز',
                        })}
                    </h2>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
                        {t('sales.stats.sectionDescription', {
                            defaultValue: isEnglish
                                ? "Today's sales and payment overview"
                                : 'نمای کلی فروش و پرداخت‌های امروز',
                        })}
                    </p>
                </div>
            </header>

            {/* Stats grid */}
            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    const tone = TONES[card.tone];

                    return (
                        <article
                            key={card.id}
                            className="ui-card group relative min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5"
                        >
                            {/* Top row */}
                            <div className="relative z-10 flex items-start justify-between gap-3">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:h-11 sm:w-11 ${tone.iconBg}`}
                                >
                                    {loading ? (
                                        <Loader2
                                            size={20}
                                            strokeWidth={1.9}
                                            className="animate-spin text-[var(--text-muted)]"
                                        />
                                    ) : (
                                        <Icon
                                            size={20}
                                            strokeWidth={1.9}
                                            className={tone.iconText}
                                        />
                                    )}
                                </div>

                                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-[9px] font-medium text-[var(--text-muted)] sm:text-[10px]">
                                    {t('common.today')}
                                </span>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 mt-4 sm:mt-5">
                                <p className="text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
                                    {card.title}
                                </p>

                                <div className="mt-1.5 flex min-w-0 items-baseline gap-1.5">
                                    {loading ? (
                                        <div className="h-8 w-28 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
                                    ) : (
                                        <h3
                                            dir="ltr"
                                            className="number-font min-w-0 truncate text-2xl font-bold tracking-tight text-[var(--text)]"
                                        >
                                            {card.value}
                                        </h3>
                                    )}
                                </div>

                                <p className="mt-2.5 min-h-[2.5rem] text-[10px] leading-5 text-[var(--text-muted)] sm:text-[11px]">
                                    {card.description}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default SalesStats;