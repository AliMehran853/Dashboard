import { useMemo } from 'react';
import { ArrowLeft, BarChart3, CreditCard, Plus, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// ---------- tones ----------
// `accent` follows the active palette (via CSS vars from AppearanceSettings).
// Others are semantic categories so each action stays visually distinct.
const TONES = {
    accent: {
        iconBg: 'bg-[var(--accent-soft)] border-[var(--accent-border)]',
        iconText: 'text-[var(--accent-500)]',
    },
    violet: {
        iconBg: 'bg-violet-500/10 border-violet-500/15 dark:border-violet-400/15',
        iconText: 'text-violet-500 dark:text-violet-400',
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

// ---------- component ----------
function QuickActions() {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    const actions = useMemo(() => [
        {
            id: 'new-sale',
            title: t('dashboard.quickActions.newSale.title'),
            description: t('dashboard.quickActions.newSale.description'),
            icon: Plus,
            tone: 'accent',
            href: '/sales',
        },
        {
            id: 'shopping-list',
            title: t('dashboard.quickActions.shoppingList.title'),
            description: t('dashboard.quickActions.shoppingList.description'),
            icon: ShoppingCart,
            tone: 'violet',
            href: '/shopping-list',
        },
        {
            id: 'credit-sale',
            title: t('dashboard.quickActions.creditSale.title'),
            description: t('dashboard.quickActions.creditSale.description'),
            icon: CreditCard,
            tone: 'warning',
            href: '/credit-sales',
        },
        {
            id: 'reports',
            title: t('dashboard.quickActions.reports.title'),
            description: t('dashboard.quickActions.reports.description'),
            icon: BarChart3,
            tone: 'cyan',
            href: '/reports',
        },
    ], [t]);

    return (
        <section dir={i18n.dir()}>

            {/* header */}
            <div className="mb-4 sm:mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="h-5 w-1 rounded-full bg-[var(--accent-500)]" />

                    <h2 className="text-base sm:text-lg font-semibold tracking-tight text-[var(--text)]">
                        {t('dashboard.quickActions.title')}
                    </h2>
                </div>

                <p className="mt-1.5 text-[11px] sm:text-xs leading-5 text-[var(--text-muted)]">
                    {t('dashboard.quickActions.description')}
                </p>
            </div>

            {/* actions */}
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">

                {actions.map((action) => {
                    const Icon = action.icon;
                    const tone = TONES[action.tone];

                    return (
                        <Link
                            key={action.id}
                            to={action.href}
                            className="
                                group relative min-w-0 overflow-hidden rounded-2xl
                                border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5
                                transition-all duration-300 ease-[var(--ease-out)]
                                hover:bg-[var(--surface-hover)]
                                hover:!border-[var(--accent-border-hover)]
                                hover:shadow-[var(--shadow-card-hover)]
                            "
                        >

                            {/* icon + arrow */}
                            <div className="relative z-10 flex items-start justify-between gap-3">

                                <div className={`flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl border ${tone.iconBg}`}>
                                    <Icon
                                        size={20}
                                        strokeWidth={1.9}
                                        className={tone.iconText}
                                    />
                                </div>

                                <ArrowLeft
                                    size={16}
                                    strokeWidth={1.8}
                                    className={`
                                        shrink-0
                                        opacity-0
                                        transition-all
                                        duration-300
                                        ${isRTL ? '-translate-x-1' : 'translate-x-1 rotate-180'}
                                        group-hover:translate-x-0
                                        group-hover:opacity-100
                                        ${tone.iconText}
                                    `}
                                />

                            </div>

                            {/* content */}
                            <div className="relative z-10 mt-4 sm:mt-5 min-w-0">

                                <h3 className="truncate text-base sm:text-lg font-bold tracking-tight text-[var(--text)]">
                                    {action.title}
                                </h3>

                                <p className="mt-2 min-h-[2.5rem] text-[10px] sm:text-[11px] leading-5 text-[var(--text-muted)]">
                                    {action.description}
                                </p>

                            </div>

                        </Link>
                    );
                })}

            </div>

        </section>
    );
}

export default QuickActions;