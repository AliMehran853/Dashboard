import { useEffect, useState } from 'react';
import {
    Banknote,
    ShoppingBag,
    TrendingUp,
    Loader2,
    CreditCard,
    ArrowLeft,
    ArrowRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    getTodayCashSalesStatistics,
    getPendingCreditSummary,
} from '../../services/salesService';
import { useCountUp } from '../../hooks/useCountUp';

// =========================================================
// Defaults
// =========================================================

const DEFAULT_STATS = {
    totalSales: 0,
    cashSales: 0,
    creditSales: 0,
    totalItems: 0,
    salesCount: 0,
};

const DEFAULT_CREDIT = {
    pendingCount: 0,
    pendingAmount: 0,
};

const normalizeStats = (v) => ({
    totalSales: Number(v?.totalSales) || 0,
    cashSales: Number(v?.cashSales) || 0,
    creditSales: Number(v?.creditSales) || 0,
    totalItems: Number(v?.totalItems) || 0,
    salesCount: Number(v?.salesCount) || 0,
});

const normalizeCredit = (v) => ({
    pendingCount: Number(v?.pendingCount) || 0,
    pendingAmount: Number(v?.pendingAmount) || 0,
});

// =========================================================
// Tones
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
// AnimatedNumber
// =========================================================

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

// =========================================================
// Sales Stats
// =========================================================

function SalesStats() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');
    const ArrowIcon = isEnglish ? ArrowRight : ArrowLeft;

    const [stats, setStats] = useState(DEFAULT_STATS);
    const [credit, setCredit] = useState(DEFAULT_CREDIT);
    const [loading, setLoading] = useState(true);

    const fmt = (v) =>
        new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR').format(
            Number(v) || 0
        );

    const loadStats = async () => {
        try {
            setLoading(true);

            const [cashResult, creditResult] = await Promise.all([
                getTodayCashSalesStatistics(),
                getPendingCreditSummary(),
            ]);

            setStats(normalizeStats(cashResult));
            setCredit(normalizeCredit(creditResult));
        } catch (err) {
            console.error('Failed to load sales statistics:', err);
            setStats(DEFAULT_STATS);
            setCredit(DEFAULT_CREDIT);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();

        const onSales = () => loadStats();
        const onCredit = () => loadStats();
        const onPayments = () => loadStats();
        const onDb = () => loadStats();
        const onVis = () => {
            if (document.visibilityState === 'visible') loadStats();
        };
        const onFocus = () => loadStats();

        window.addEventListener('sales-updated', onSales);
        window.addEventListener('credit-sales-updated', onCredit);
        window.addEventListener('credit-payments-updated', onPayments);
        window.addEventListener('database-updated', onDb);
        document.addEventListener('visibilitychange', onVis);
        window.addEventListener('focus', onFocus);

        return () => {
            window.removeEventListener('sales-updated', onSales);
            window.removeEventListener('credit-sales-updated', onCredit);
            window.removeEventListener('credit-payments-updated', onPayments);
            window.removeEventListener('database-updated', onDb);
            document.removeEventListener('visibilitychange', onVis);
            window.removeEventListener('focus', onFocus);
        };
    }, []);

    // -----------------------------------------------------
    // Card definitions
    // -----------------------------------------------------

    const pendingCreditLabel = t('sales.stats.pendingCredit.description', {
        count: fmt(credit.pendingCount),
        defaultValue: isEnglish
            ? `${fmt(credit.pendingCount)} unpaid customer${
                  credit.pendingCount === 1 ? '' : 's'
              }`
            : `${fmt(credit.pendingCount)} مشتری بدهکار`,
    });

    const cards = [
        {
            id: 'today-sales',
            tone: 'accent',
            icon: TrendingUp,
            title: t('sales.stats.todaySales.title', {
                defaultValue: isEnglish ? "Today's Sales" : 'فروش امروز',
            }),
            value: stats.totalSales,
            unit: t('common.currency'),
            description: t('sales.stats.todaySales.description', {
                count: fmt(stats.salesCount),
                defaultValue: isEnglish
                    ? `${fmt(stats.salesCount)} sale recorded`
                    : `${fmt(stats.salesCount)} فروش ثبت شده`,
            }),
        },
        {
            id: 'cash-sales',
            tone: 'cyan',
            icon: Banknote,
            title: t('sales.stats.cashSales.title', {
                defaultValue: isEnglish ? 'Cash Sales' : 'فروش نقدی',
            }),
            value: stats.cashSales,
            unit: t('common.currency'),
            description: t('sales.stats.cashSales.description', {
                defaultValue: isEnglish
                    ? 'Paid in cash'
                    : 'پرداخت نقدی',
            }),
        },
        {
            id: 'credit-pending',
            tone: 'warning',
            icon: CreditCard,
            title: t('sales.stats.pendingCredit.title', {
                defaultValue: isEnglish
                    ? 'Pending Credit Debt'
                    : 'بدهی معوق نسیه',
            }),
            value: credit.pendingAmount,
            unit: t('common.currency'),
            description: pendingCreditLabel,
            cta: t('sales.stats.pendingCredit.cta', {
                defaultValue: isEnglish
                    ? 'View credit page'
                    : 'مشاهده صفحه نسیه',
            }),
            onClick: () => navigate('/credit-sales'),
        },
        {
            id: 'total-items',
            tone: 'violet',
            icon: ShoppingBag,
            title: t('sales.stats.items.title', {
                defaultValue: isEnglish ? 'Items Sold' : 'تعداد کالا',
            }),
            value: stats.totalItems,
            unit: null,
            description: t('sales.stats.items.description', {
                defaultValue: isEnglish
                    ? 'Total units sold today'
                    : 'واحد فروخته شده امروز',
            }),
        },
    ];

    // -----------------------------------------------------
    // Render
    // -----------------------------------------------------

    return (
        <section dir={isEnglish ? 'ltr' : 'rtl'} className="space-y-4">
            <header className="flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className="h-7 w-1 shrink-0 rounded-full bg-[var(--accent-500)] shadow-[0_0_12px_var(--accent-glow)] sm:h-8"
                />
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-[var(--text)] sm:text-base lg:text-lg">
                        {t('sales.stats.sectionTitle', {
                            defaultValue: isEnglish
                                ? "Today's Cash Sales Summary"
                                : 'خلاصه فروش نقدی امروز',
                        })}
                    </h2>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
                        {t('sales.stats.sectionDescription', {
                            defaultValue: isEnglish
                                ? "Today's cash sales overview"
                                : 'نمای کلی فروش نقدی امروز',
                        })}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon;
                    const tone = TONES[card.tone];
                    const isClickable = typeof card.onClick === 'function';

                    const Wrapper = isClickable ? 'button' : 'article';
                    const wrapperProps = isClickable
                        ? {
                              type: 'button',
                              onClick: card.onClick,
                              'aria-label': `${card.title} — ${card.cta || ''}`,
                          }
                        : {};

                    return (
                        <Wrapper
                            key={card.id}
                            {...wrapperProps}
                            className={`
                                ui-card group relative min-w-0 overflow-hidden rounded-2xl p-4 text-start sm:p-5
                                ${
                                    isClickable
                                        ? 'cursor-pointer transition-all duration-300 hover:border-[var(--accent-border-hover)] hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-500)]'
                                        : ''
                                }
                            `}
                        >
                            {/* Top row: icon + badge */}
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

                            {/* Body */}
                            <div className="relative z-10 mt-4 sm:mt-5">
                                <p className="text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
                                    {card.title}
                                </p>

                                <div className="mt-1.5 flex min-w-0 items-baseline gap-1.5">
                                    {loading ? (
                                        <div className="h-8 w-28 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
                                    ) : (
                                        <>
                                            <h3
                                                dir="ltr"
                                                className="number-font min-w-0 truncate text-2xl font-bold tracking-tight text-[var(--text)]"
                                            >
                                                <AnimatedNumber
                                                    value={card.value}
                                                    language={language}
                                                />
                                            </h3>
                                            {card.unit ? (
                                                <span className="shrink-0 text-xs font-medium text-[var(--text-muted)] sm:text-sm">
                                                    {card.unit}
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </div>

                                <p className="mt-2.5 min-h-[2.5rem] text-[10px] leading-5 text-[var(--text-muted)] sm:text-[11px]">
                                    {card.description}
                                </p>

                                {/* CTA */}
                                {card.cta ? (
                                    <span
                                        className={`mt-1 inline-flex items-center gap-1 text-[10px] font-medium sm:text-[11px] ${tone.iconText}`}
                                    >
                                        {card.cta}
                                        <ArrowIcon
                                            size={12}
                                            className="transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                                        />
                                    </span>
                                ) : null}
                            </div>
                        </Wrapper>
                    );
                })}
            </div>
        </section>
    );
}

export default SalesStats;