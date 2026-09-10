import {
    useEffect,
    useState,
} from 'react';

import {
    Banknote,
    CreditCard,
    ShoppingBag,
    TrendingUp,
    Loader2,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import {
    getTodaySalesStatistics,
} from '../../services/salesService';


// =========================================================
// Default Stats
// =========================================================

const DEFAULT_STATS = {
    totalSales: 0,
    cashSales: 0,
    creditSales: 0,
    totalItems: 0,
    salesCount: 0,
};


// =========================================================
// Normalize Statistics
// =========================================================

const normalizeStats = (
    value
) => {

    return {
        totalSales:
            Number(
                value?.totalSales
            ) || 0,

        cashSales:
            Number(
                value?.cashSales
            ) || 0,

        creditSales:
            Number(
                value?.creditSales
            ) || 0,

        totalItems:
            Number(
                value?.totalItems
            ) || 0,

        salesCount:
            Number(
                value?.salesCount
            ) || 0,
    };

};


// =========================================================
// Sales Stats
// =========================================================

function SalesStats() {

    const {
        t,
        i18n,
    } = useTranslation();


    const isEnglish =
        i18n.language === 'en';


    const [
        stats,
        setStats,
    ] = useState(
        DEFAULT_STATS
    );


    const [
        loading,
        setLoading,
    ] = useState(true);


    // =====================================================
    // Number Formatter
    // =====================================================

    const formatNumber = (
        value
    ) => {

        return new Intl.NumberFormat(
            isEnglish
                ? 'en-US'
                : 'fa-IR'
        ).format(
            Number(
                value
            ) || 0
        );

    };


    // =====================================================
    // Load Statistics
    // =====================================================

    const loadStats = async () => {

        try {

            setLoading(true);


            const result =
                await getTodaySalesStatistics();


            setStats(
                normalizeStats(
                    result
                )
            );

        } catch (error) {

            console.error(
                'Failed to load sales statistics:',
                error
            );


            setStats(
                DEFAULT_STATS
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // Initial Load + Database Events
    // =====================================================

    useEffect(() => {

        loadStats();


        const handleSalesUpdated = () => {
            loadStats();
        };


        const handleDatabaseUpdated = () => {
            loadStats();
        };


        window.addEventListener(
            'sales-updated',
            handleSalesUpdated
        );


        window.addEventListener(
            'database-updated',
            handleDatabaseUpdated
        );


        const handleVisibilityChange = () => {

            if (
                document.visibilityState ===
                'visible'
            ) {

                loadStats();

            }

        };


        const handleWindowFocus = () => {
            loadStats();
        };


        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange
        );


        window.addEventListener(
            'focus',
            handleWindowFocus
        );


        return () => {

            window.removeEventListener(
                'sales-updated',
                handleSalesUpdated
            );


            window.removeEventListener(
                'database-updated',
                handleDatabaseUpdated
            );


            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );


            window.removeEventListener(
                'focus',
                handleWindowFocus
            );

        };

    }, []);


    // =====================================================
    // Cards
    // =====================================================

    const cards = [

        {
            id: 'today-sales',

            title:
                t(
                    'sales.stats.todaySales.title'
                ),

            value:
                `${formatNumber(
                    stats.totalSales
                )} ${t(
                    'common.currency'
                )}`,

            description:
                t(
                    'sales.stats.todaySales.description',
                    {
                        count:
                            formatNumber(
                                stats.salesCount
                            ),
                    }
                ),

            icon:
                TrendingUp,

            tone:
                'emerald',
        },


        {
            id: 'cash-sales',

            title:
                t(
                    'sales.stats.cashSales.title'
                ),

            value:
                `${formatNumber(
                    stats.cashSales
                )} ${t(
                    'common.currency'
                )}`,

            description:
                t(
                    'sales.stats.cashSales.description'
                ),

            icon:
                Banknote,

            tone:
                'cyan',
        },


        {
            id: 'credit-sales',

            title:
                t(
                    'sales.stats.creditSales.title'
                ),

            value:
                `${formatNumber(
                    stats.creditSales
                )} ${t(
                    'common.currency'
                )}`,

            description:
                t(
                    'sales.stats.creditSales.description'
                ),

            icon:
                CreditCard,

            tone:
                'amber',
        },


        {
            id: 'total-items',

            title:
                t(
                    'sales.stats.items.title'
                ),

            value:
                formatNumber(
                    stats.totalItems
                ),

            description:
                t(
                    'sales.stats.items.description'
                ),

            icon:
                ShoppingBag,

            tone:
                'violet',
        },

    ];


    // =====================================================
    // Tone Styles (icon tones only — card tint follows accent)
    // =====================================================

    const toneStyles = {

        emerald: {

            iconBg:
                'bg-emerald-500/10',

            iconText:
                'text-emerald-500 dark:text-emerald-400',

            accent:
                'bg-emerald-500',

        },


        cyan: {

            iconBg:
                'bg-cyan-500/10',

            iconText:
                'text-cyan-500 dark:text-cyan-400',

            accent:
                'bg-cyan-500',

        },


        amber: {

            iconBg:
                'bg-amber-500/10',

            iconText:
                'text-amber-500 dark:text-amber-400',

            accent:
                'bg-amber-500',

        },


        violet: {

            iconBg:
                'bg-violet-500/10',

            iconText:
                'text-violet-500 dark:text-violet-400',

            accent:
                'bg-violet-500',

        },

    };


    // =====================================================
    // Render
    // =====================================================

    return (

        <section
            dir={
                isEnglish
                    ? 'ltr'
                    : 'rtl'
            }

            className="
                grid

                grid-cols-1
                min-[420px]:grid-cols-2
                xl:grid-cols-4

                gap-3
                sm:gap-4
            "
        >

            {cards.map(
                (card) => {

                    const Icon =
                        card.icon;


                    const styles =
                        toneStyles[
                            card.tone
                        ];


                    return (

                        <article
                            key={
                                card.id
                            }

                            className="
                                group
                                relative
                                min-w-0
                                overflow-hidden

                                rounded-2xl

                                border
                                border-[var(--border)]

                                p-4
                                sm:p-5

                                shadow-[var(--shadow-card)]

                                transition-all
                                duration-300
                                ease-[var(--ease-out)]

                                hover:-translate-y-0.5
                                hover:border-[var(--glass-border-hover)]
                                hover:shadow-[var(--shadow-card-hover)]
                            "

                            style={{
                                background: `
                                    linear-gradient(
                                        135deg,
                                        var(--glass-active-tint),
                                        var(--glass-active-tint-soft) 70%,
                                        transparent 100%
                                    ),
                                    var(--surface)
                                `,
                            }}
                        >

                            {/* =================================================
                                Hover Tint Overlay
                                Fades in on hover, follows accent color.
                            ================================================== */}

                            <div
                                aria-hidden="true"

                                className="
                                    pointer-events-none
                                    absolute
                                    inset-0
                                    rounded-2xl

                                    opacity-0

                                    transition-opacity
                                    duration-300
                                    ease-[var(--ease-out)]

                                    group-hover:opacity-100
                                "

                                style={{
                                    background: `
                                        linear-gradient(
                                            135deg,
                                            var(--glass-hover-tint),
                                            var(--glass-hover-tint-soft) 70%,
                                            transparent 100%
                                        )
                                    `,
                                }}
                            />


                            {/* =================================================
                                Accent Top Line (per-tone, for icon identity)
                            ================================================== */}

                            <div
                                aria-hidden="true"

                                className={`
                                    absolute
                                    inset-x-0
                                    top-0

                                    h-px

                                    opacity-60

                                    transition-opacity
                                    duration-300

                                    group-hover:opacity-100

                                    ${styles.accent}
                                `}
                            />


                            {/* =================================================
                                Decorative Glow
                            ================================================== */}

                            <div
                                aria-hidden="true"

                                className="
                                    pointer-events-none

                                    absolute
                                    -right-8
                                    -top-8

                                    h-24
                                    w-24

                                    rounded-full

                                    bg-white/5

                                    blur-2xl

                                    opacity-0

                                    transition-opacity
                                    duration-300

                                    group-hover:opacity-100

                                    dark:bg-white/[0.03]
                                "
                            />


                            {/* =================================================
                                Top Row
                            ================================================== */}

                            <div
                                className="
                                    relative
                                    z-10

                                    flex
                                    items-start
                                    justify-between

                                    gap-3
                                "
                            >

                                <div
                                    className={`
                                        flex

                                        h-10
                                        w-10

                                        sm:h-11
                                        sm:w-11

                                        shrink-0

                                        items-center
                                        justify-center

                                        rounded-xl

                                        border
                                        border-white/5

                                        ${styles.iconBg}
                                    `}
                                >

                                    {loading ? (

                                        <Loader2
                                            size={20}
                                            strokeWidth={1.9}

                                            className="
                                                animate-spin
                                                text-[var(--text-muted)]
                                            "
                                        />

                                    ) : (

                                        <Icon
                                            size={20}
                                            strokeWidth={1.9}

                                            className={
                                                styles.iconText
                                            }
                                        />

                                    )}

                                </div>


                                <span
                                    className="
                                        rounded-md

                                        border
                                        border-[var(--border)]

                                        bg-[var(--surface-muted)]

                                        px-2
                                        py-1

                                        text-[9px]
                                        sm:text-[10px]

                                        font-medium

                                        text-[var(--text-muted)]
                                    "
                                >
                                    {
                                        t(
                                            'common.today'
                                        )
                                    }
                                </span>

                            </div>


                            {/* =================================================
                                Content
                            ================================================== */}

                            <div
                                className="
                                    relative
                                    z-10

                                    mt-4
                                    sm:mt-5
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        sm:text-sm

                                        font-medium

                                        text-[var(--text-secondary)]
                                    "
                                >
                                    {
                                        card.title
                                    }
                                </p>


                                <div
                                    className="
                                        mt-1.5

                                        flex
                                        min-w-0

                                        items-baseline

                                        gap-1.5
                                    "
                                >

                                    {loading ? (

                                        <div
                                            className="
                                                h-8
                                                w-28

                                                rounded-lg

                                                bg-[var(--surface-muted)]

                                                animate-pulse
                                            "
                                        />

                                    ) : (

                                        <h3
                                            dir="ltr"

                                            className="
                                                min-w-0
                                                truncate

                                                number-font

                                                text-2xl
                                                font-bold

                                                tracking-tight

                                                text-[var(--text-primary)]
                                            "
                                        >
                                            {
                                                card.value
                                            }
                                        </h3>

                                    )}

                                </div>


                                <p
                                    className="
                                        mt-2.5

                                        min-h-[2.5rem]

                                        text-[10px]
                                        sm:text-[11px]

                                        leading-5

                                        text-[var(--text-muted)]
                                    "
                                >
                                    {
                                        card.description
                                    }
                                </p>

                            </div>


                            {/* =================================================
                                Bottom Indicator
                            ================================================== */}

                            <div
                                className="
                                    relative
                                    z-10

                                    mt-4

                                    h-px

                                    overflow-hidden

                                    rounded-full

                                    bg-[var(--border)]
                                "
                            >

                                <div
                                    className={`
                                        h-full

                                        w-10

                                        rounded-full

                                        opacity-70

                                        transition-all
                                        duration-500

                                        group-hover:w-20
                                        group-hover:opacity-100

                                        ${styles.accent}
                                    `}
                                />

                            </div>

                        </article>

                    );

                }
            )}

        </section>

    );

}


export default SalesStats;