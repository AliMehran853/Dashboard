import {
    useMemo,
} from 'react';

import {
    ShoppingCart,
    Clock3,
    CheckCircle2,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';


// =========================================================
// Convert Persian / Arabic Numbers To English
// =========================================================

const toEnglishNumbers = (
    value
) => {

    return String(
        value ?? ''
    )
        .replace(
            /[۰-۹]/g,
            (digit) =>
                String(
                    '۰۱۲۳۴۵۶۷۸۹'.indexOf(
                        digit
                    )
                )
        )
        .replace(
            /[٠-٩]/g,
            (digit) =>
                String(
                    '٠١٢٣٤٥٦٧٨٩'.indexOf(
                        digit
                    )
                )
        );

};


// =========================================================
// Format Number
// =========================================================

const formatNumber = (
    value,
    language
) => {

    const number =
        Number(
            toEnglishNumbers(
                value
            )
        ) || 0;


    const isEnglish =
        String(
            language || ''
        )
            .toLowerCase()
            .startsWith('en');


    return new Intl.NumberFormat(
        isEnglish
            ? 'en-US'
            : 'fa-IR'
    ).format(
        number
    );

};


// =========================================================
// Shopping List Stats
// =========================================================

function ShoppingListStats({
    items = [],
}) {

    const {
        t,
        i18n,
    } = useTranslation();


    // =====================================================
    // Language
    // =====================================================

    const language =
        i18n.language || 'fa';


    const isEnglish =
        String(
            language
        )
            .toLowerCase()
            .startsWith('en');


    const direction =
        isEnglish
            ? 'ltr'
            : 'rtl';


    // =====================================================
    // Statistics
    // =====================================================

    const statistics =
        useMemo(
            () => {

                const safeItems =
                    Array.isArray(
                        items
                    )
                        ? items
                        : [];


                const total =
                    safeItems.length;


                const completed =
                    safeItems.filter(
                        (item) =>
                            Boolean(
                                item?.completed
                            )
                    ).length;


                const pending =
                    total -
                    completed;


                return {

                    total,

                    pending,

                    completed,

                };

            },
            [
                items,
            ]
        );


    // =====================================================
    // Stat Items
    // =====================================================

    const statItems = [

        {
            id:
                'total',

            label:
                t(
                    'shoppingList.stats.total',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Total Items'
                                : 'مجموع اقلام',
                    }
                ),

            value:
                statistics.total,

            icon:
                ShoppingCart,

            accent:
                'emerald',

            iconClass:
                'text-emerald-500 dark:text-emerald-400',

            iconBg:
                'border-emerald-500/10 bg-emerald-500/10',

        },


        {
            id:
                'pending',

            label:
                t(
                    'shoppingList.stats.pending',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Pending'
                                : 'در انتظار',
                    }
                ),

            value:
                statistics.pending,

            icon:
                Clock3,

            accent:
                'amber',

            iconClass:
                'text-amber-500 dark:text-amber-400',

            iconBg:
                'border-amber-500/10 bg-amber-500/10',

        },


        {
            id:
                'completed',

            label:
                t(
                    'shoppingList.stats.completed',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Completed'
                                : 'تکمیل‌شده',
                    }
                ),

            value:
                statistics.completed,

            icon:
                CheckCircle2,

            accent:
                'sky',

            iconClass:
                'text-sky-500 dark:text-sky-400',

            iconBg:
                'border-sky-500/10 bg-sky-500/10',

        },

    ];


    // =====================================================
    // Render
    // =====================================================

    return (

        <section
            dir={
                direction
            }
            className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-3
                sm:gap-4
            "
        >

            {
                statItems.map(
                    (
                        stat
                    ) => {

                        const Icon =
                            stat.icon;


                        return (

                            <article
                                key={
                                    stat.id
                                }
                                className="
                                    group
                                    relative
                                    min-w-0
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    border-[var(--border)]
                                    bg-[var(--surface)]
                                    p-4
                                    shadow-sm
                                    transition-all
                                    duration-300
                                    hover:-translate-y-0.5
                                    hover:shadow-lg
                                    dark:hover:shadow-black/20
                                    sm:p-5
                                "
                            >

                                {/* Accent */}

                                <div
                                    className={`
                                        absolute
                                        inset-x-0
                                        top-0
                                        h-px
                                        opacity-50
                                        transition-opacity
                                        duration-300
                                        group-hover:opacity-100
                                        ${
                                            stat.accent ===
                                                'emerald'
                                                ? 'bg-emerald-500'
                                                : stat.accent ===
                                                    'amber'
                                                    ? 'bg-amber-500'
                                                    : 'bg-sky-500'
                                        }
                                    `}
                                />


                                {/* Glow */}

                                <div
                                    className={`
                                        pointer-events-none
                                        absolute
                                        -end-10
                                        -top-10
                                        h-28
                                        w-28
                                        rounded-full
                                        blur-3xl
                                        opacity-0
                                        transition-opacity
                                        duration-500
                                        group-hover:opacity-100
                                        ${
                                            stat.accent ===
                                                'emerald'
                                                ? 'bg-emerald-500/10'
                                                : stat.accent ===
                                                    'amber'
                                                    ? 'bg-amber-500/10'
                                                    : 'bg-sky-500/10'
                                        }
                                    `}
                                />


                                <div
                                    className="
                                        relative
                                        z-10
                                        flex
                                        min-w-0
                                        items-start
                                        justify-between
                                        gap-4
                                    "
                                >

                                    <div
                                        className="
                                            min-w-0
                                            flex-1
                                        "
                                    >

                                        <p
                                            className="
                                                truncate
                                                text-[11px]
                                                font-medium
                                                text-[var(--text-muted)]
                                            "
                                        >
                                            {
                                                stat.label
                                            }
                                        </p>


                                        <p
                                            dir={
                                                isEnglish
                                                    ? 'ltr'
                                                    : 'rtl'
                                            }
                                            className="
                                                mt-2
                                                number-font
                                                text-2xl
                                                font-bold
                                                tracking-tight
                                                text-[var(--text-primary)]
                                            "
                                        >
                                            {
                                                formatNumber(
                                                    stat.value,
                                                    language
                                                )
                                            }
                                        </p>

                                    </div>


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
                                            transition-transform
                                            duration-300
                                            group-hover:scale-105
                                            sm:h-11
                                            sm:w-11
                                            ${stat.iconBg}
                                        `}
                                    >

                                        <Icon
                                            size={19}
                                            className={
                                                stat.iconClass
                                            }
                                        />

                                    </div>

                                </div>


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
                                            w-8
                                            rounded-full
                                            transition-all
                                            duration-500
                                            group-hover:w-14
                                            ${
                                                stat.accent ===
                                                    'emerald'
                                                    ? 'bg-emerald-500'
                                                    : stat.accent ===
                                                        'amber'
                                                        ? 'bg-amber-500'
                                                        : 'bg-sky-500'
                                            }
                                        `}
                                    />

                                </div>

                            </article>

                        );

                    }
                )
            }

        </section>

    );

}


export default ShoppingListStats;