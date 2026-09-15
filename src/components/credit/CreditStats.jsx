import { AlertCircle, CheckCircle2, CreditCard, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCountUp } from '../../hooks/useCountUp';

const TONES = {
    warning: {
        iconBg: 'bg-amber-500/10 border-amber-500/15 dark:border-amber-400/15',
        iconText: 'text-amber-500 dark:text-amber-400',
    },
    orange: {
        iconBg: 'bg-orange-500/10 border-orange-500/15 dark:border-orange-400/15',
        iconText: 'text-orange-500 dark:text-orange-400',
    },
    cyan: {
        iconBg: 'bg-cyan-500/10 border-cyan-500/15 dark:border-cyan-400/15',
        iconText: 'text-cyan-500 dark:text-cyan-400',
    },
    success: {
        iconBg: 'bg-emerald-500/10 border-emerald-500/15 dark:border-emerald-400/15',
        iconText: 'text-emerald-500 dark:text-emerald-400',
    },
};

// =========================================================
// AnimatedNumber
// =========================================================

function AnimatedNumber({ value, language, className, dir }) {
    const animated = useCountUp(Number(value) || 0, { duration: 900 });

    const isEnglish = String(language || '').toLowerCase().startsWith('en');
    const formatted = new Intl.NumberFormat(
        isEnglish ? 'en-US' : 'fa-IR',
        { minimumFractionDigits: 0, maximumFractionDigits: 2 }
    ).format(animated);

    return (
        <span dir={dir} className={className}>
            {formatted}
        </span>
    );
}

// =========================================================
// CreditStats
// =========================================================

function CreditStats({ statistics = {}, loading = false }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');

    const stats = [
        {
            id: 'total-debt',
            tone: 'warning',
            icon: CreditCard,
            title: t('credit.stats.totalDebt.title'),
            value: Number(statistics.totalDebt) || 0,
            unit: t('common.currency'),
            label: t('credit.stats.totalDebt.description'),
        },
        {
            id: 'remaining',
            tone: 'orange',
            icon: AlertCircle,
            title: t('credit.stats.remaining.title', {
                defaultValue: isEnglish
                    ? 'Outstanding Debt'
                    : 'بدهی باقی‌مانده',
            }),
            value: Number(statistics.totalRemaining) || 0,
            unit: t('common.currency'),
            label: t('credit.stats.remaining.description', {
                defaultValue: isEnglish
                    ? 'Total unpaid debt across all customers'
                    : 'مجموع بدهی پرداخت‌نشده مشتریان',
            }),
        },
        {
            id: 'debtors',
            tone: 'cyan',
            icon: Users,
            title: t('credit.stats.debtors.title'),
            value: Number(statistics.debtorCount) || 0,
            unit: t('credit.stats.debtors.unit'),
            label: t('credit.stats.debtors.description'),
        },
        {
            id: 'settled',
            tone: 'success',
            icon: CheckCircle2,
            title: t('credit.stats.settled.title'),
            value: Number(statistics.totalPaid) || 0,
            unit: t('common.currency'),
            label: t('credit.stats.settled.description'),
        },
    ];

    return (
        <section>
            <div className="mb-4 sm:mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="h-5 w-1 rounded-full bg-[var(--accent-500)]" />
                    <h2 className="text-base font-semibold tracking-tight text-[var(--text)] sm:text-lg">
                        {t('credit.stats.sectionTitle')}
                    </h2>
                </div>
                <p className="mt-1.5 text-[11px] text-[var(--text-muted)] sm:text-xs">
                    {t('credit.stats.sectionDescription')}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const tone = TONES[stat.tone];
                    return (
                        <article
                            key={stat.id}
                            className="ui-card group relative min-w-0 overflow-hidden rounded-2xl p-4 sm:p-5"
                        >
                            <div className="relative z-10 flex items-start justify-between gap-3">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border sm:h-11 sm:w-11 ${tone.iconBg}`}
                                >
                                    {loading ? (
                                        <span className="h-5 w-5 animate-pulse rounded-full bg-[var(--surface-muted)]" />
                                    ) : (
                                        <Icon
                                            size={20}
                                            strokeWidth={1.9}
                                            className={tone.iconText}
                                        />
                                    )}
                                </div>
                                <span className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 text-[9px] font-medium text-[var(--text-muted)] sm:text-[10px]">
                                    {t('credit.stats.badge', {
                                        defaultValue: isEnglish
                                            ? 'All-time'
                                            : 'کل دوره',
                                    })}
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
                                                className="number-font min-w-0 truncate text-2xl font-bold tracking-tight text-[var(--text)]"
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
                                    {stat.label}
                                </p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default CreditStats;