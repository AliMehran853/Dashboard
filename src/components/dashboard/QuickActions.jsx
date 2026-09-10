import {
    useMemo,
} from 'react';

import {
    ArrowLeft,
    BarChart3,
    CreditCard,
    Plus,
    ShoppingCart,
} from 'lucide-react';

import {
    Link,
} from 'react-router-dom';

import {
    useTranslation,
} from 'react-i18next';


// =========================================================
// Quick Actions
// =========================================================

function QuickActions() {

    const {
        t,
        i18n,
    } = useTranslation();


    const isRTL =
        i18n.dir() === 'rtl';


    // =====================================================
    // Actions
    // =====================================================

    const actions = useMemo(
        () => [

            {
                id:
                    'new-sale',

                title:
                    t(
                        'dashboard.quickActions.newSale.title'
                    ),

                description:
                    t(
                        'dashboard.quickActions.newSale.description'
                    ),

                icon:
                    Plus,

                tone:
                    'accent',

                href:
                    '/sales',
            },


            {
                id:
                    'shopping-list',

                title:
                    t(
                        'dashboard.quickActions.shoppingList.title'
                    ),

                description:
                    t(
                        'dashboard.quickActions.shoppingList.description'
                    ),

                icon:
                    ShoppingCart,

                tone:
                    'violet',

                href:
                    '/shopping-list',
            },


            {
                id:
                    'credit-sale',

                title:
                    t(
                        'dashboard.quickActions.creditSale.title'
                    ),

                description:
                    t(
                        'dashboard.quickActions.creditSale.description'
                    ),

                icon:
                    CreditCard,

                tone:
                    'warning',

                href:
                    '/credit-sales',
            },


            {
                id:
                    'reports',

                title:
                    t(
                        'dashboard.quickActions.reports.title'
                    ),

                description:
                    t(
                        'dashboard.quickActions.reports.description'
                    ),

                icon:
                    BarChart3,

                tone:
                    'cyan',

                href:
                    '/reports',
            },

        ],
        [t]
    );


    // =====================================================
    // Tone Styles
    // =====================================================

    const toneStyles = {

        accent: {

            iconWrapper:
                `
                    bg-[var(--accent-soft)]
                    border-[var(--accent-border)]
                `,

            icon:
                `
                    text-[var(--accent-500)]
                `,

            accent:
                `
                    bg-[var(--accent-500)]
                `,

            arrow:
                `
                    text-[var(--accent-500)]
                `,

        },


        violet: {

            iconWrapper:
                `
                    bg-violet-500/10
                    dark:bg-violet-400/10
                    border-violet-500/15
                    dark:border-violet-400/15
                `,

            icon:
                `
                    text-violet-500
                    dark:text-violet-400
                `,

            accent:
                `
                    bg-violet-500
                `,

            arrow:
                `
                    text-violet-500
                    dark:text-violet-400
                `,

        },


        warning: {

            iconWrapper:
                `
                    bg-amber-500/10
                    dark:bg-amber-400/10
                    border-amber-500/15
                    dark:border-amber-400/15
                `,

            icon:
                `
                    text-amber-500
                    dark:text-amber-400
                `,

            accent:
                `
                    bg-amber-500
                `,

            arrow:
                `
                    text-amber-500
                    dark:text-amber-400
                `,

        },


        cyan: {

            iconWrapper:
                `
                    bg-cyan-500/10
                    dark:bg-cyan-400/10
                    border-cyan-500/15
                    dark:border-cyan-400/15
                `,

            icon:
                `
                    text-cyan-500
                    dark:text-cyan-400
                `,

            accent:
                `
                    bg-cyan-500
                `,

            arrow:
                `
                    text-cyan-500
                    dark:text-cyan-400
                `,

        },

    };


    // =====================================================
    // Render
    // =====================================================

    return (

        <section
            dir={i18n.dir()}
        >

            {/* Header */}

            <div
                className="
                    mb-4
                    sm:mb-5
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-2.5
                    "
                >

                    <div
                        className="
                            h-5
                            w-1
                            rounded-full
                            bg-[var(--accent-500)]
                        "
                    />

                    <h2
                        className="
                            text-base
                            sm:text-lg
                            font-semibold
                            tracking-tight
                            text-[var(--text-primary)]
                        "
                    >
                        {
                            t(
                                'dashboard.quickActions.title'
                            )
                        }
                    </h2>

                </div>


                <p
                    className="
                        mt-1.5
                        text-[11px]
                        sm:text-xs
                        leading-5
                        text-[var(--text-muted)]
                    "
                >
                    {
                        t(
                            'dashboard.quickActions.description'
                        )
                    }
                </p>

            </div>


            {/* Actions */}

            <div
                className="
                    grid
                    grid-cols-1
                    min-[420px]:grid-cols-2
                    xl:grid-cols-4
                    gap-3
                    sm:gap-4
                "
            >

                {actions.map(
                    (action) => {

                        const Icon =
                            action.icon;


                        const styles =
                            toneStyles[
                                action.tone
                            ];


                        return (

                            <Link
                                key={
                                    action.id
                                }

                                to={
                                    action.href
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
                                    Accent Top Line
                                ================================================== */}

                                <div
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

                                            ${styles.iconWrapper}
                                        `}
                                    >

                                        <Icon
                                            size={20}
                                            strokeWidth={1.9}
                                            className={
                                                styles.icon
                                            }
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

                                            ${
                                                isRTL
                                                    ? '-translate-x-1'
                                                    : 'translate-x-1 rotate-180'
                                            }

                                            group-hover:translate-x-0
                                            group-hover:opacity-100

                                            ${styles.arrow}
                                        `}
                                    />

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
                                        min-w-0
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
                                            action.title
                                        }
                                    </p>


                                    <h3
                                        className="
                                            mt-1.5
                                            truncate
                                            text-base
                                            sm:text-lg
                                            font-bold
                                            tracking-tight
                                            text-[var(--text-primary)]
                                        "
                                    >
                                        {
                                            action.title
                                        }
                                    </h3>


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
                                            action.description
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

                            </Link>

                        );

                    }
                )}

            </div>

        </section>

    );

}


export default QuickActions;