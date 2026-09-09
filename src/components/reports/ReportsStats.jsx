import {
    TrendingUp,
    ShoppingCart,
    CreditCard,
    Wallet,
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
// Reports Stats
// =========================================================

function ReportsStats({
    statistics = {},
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

    const totalSales =
        Number(
            toEnglishNumbers(
                statistics.totalSales ??
                statistics.totalTransactions ??
                0
            )
        ) || 0;


    const totalRevenue =
        Number(
            toEnglishNumbers(
                statistics.totalRevenue ??
                0
            )
        ) || 0;


    const cashSales =
        Number(
            toEnglishNumbers(
                statistics.cashSales ??
                0
            )
        ) || 0;


    const creditSales =
        Number(
            toEnglishNumbers(
                statistics.creditSales ??
                0
            )
        ) || 0;


    // =====================================================
    // Currency
    // =====================================================

    const currency =
        t(
            'common.currency',
            {
                defaultValue:
                    isEnglish
                        ? 'AF'
                        : 'افغانی',
            }
        );


    // =====================================================
    // Statistics Cards
    // =====================================================

    const stats = [

        {
            id:
                1,

            title:
                t(
                    'reports.stats.totalSales',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Total Sales'
                                : 'مجموع فروش',
                    }
                ),

            value:
                formatNumber(
                    totalSales,
                    language
                ),

            icon:
                ShoppingCart,

            iconClass:
                'text-emerald-500 dark:text-emerald-400',

            iconBg:
                'border-emerald-500/10 bg-emerald-500/10',

            accent:
                'bg-emerald-500',

        },


        {
            id:
                2,

            title:
                t(
                    'reports.stats.totalRevenue',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Total Revenue'
                                : 'مجموع درآمد',
                    }
                ),

            value:
                `${formatNumber(
                    totalRevenue,
                    language
                )} ${currency}`,

            icon:
                TrendingUp,

            iconClass:
                'text-sky-500 dark:text-sky-400',

            iconBg:
                'border-sky-500/10 bg-sky-500/10',

            accent:
                'bg-sky-500',

        },


        {
            id:
                3,

            title:
                t(
                    'reports.stats.cashSales',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Cash Sales'
                                : 'فروش نقدی',
                    }
                ),

            value:
                `${formatNumber(
                    cashSales,
                    language
                )} ${currency}`,

            icon:
                Wallet,

            iconClass:
                'text-amber-500 dark:text-amber-400',

            iconBg:
                'border-amber-500/10 bg-amber-500/10',

            accent:
                'bg-amber-500',

        },


        {
            id:
                4,

            title:
                t(
                    'reports.stats.creditSales',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Credit Sales'
                                : 'فروش نسیه',
                    }
                ),

            value:
                `${formatNumber(
                    creditSales,
                    language
                )} ${currency}`,

            icon:
                CreditCard,

            iconClass:
                'text-violet-500 dark:text-violet-400',

            iconBg:
                'border-violet-500/10 bg-violet-500/10',

            accent:
                'bg-violet-500',

        },

    ];


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            dir={
                direction
            }
            className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
                sm:gap-4
                xl:grid-cols-4
            "
        >

            {
                stats.map(
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

                                {/* Top Accent */}

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
                                        ${stat.accent}
                                    `}
                                />


                                <div
                                    className="
                                        pointer-events-none
                                        absolute
                                        -end-10
                                        -top-10
                                        h-28
                                        w-28
                                        rounded-full
                                        bg-black/5
                                        blur-3xl
                                        opacity-0
                                        transition-opacity
                                        duration-500
                                        group-hover:opacity-100
                                        dark:bg-white/5
                                    "
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

                                    {/* Text */}

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
                                                leading-5
                                                text-[var(--text-muted)]
                                            "
                                        >
                                            {
                                                stat.title
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
                                                truncate
                                                number-font
                                                text-xl
                                                font-bold
                                                tracking-tight
                                                text-[var(--text-primary)]
                                                sm:text-2xl
                                            "
                                        >
                                            {
                                                stat.value
                                            }
                                        </p>

                                    </div>


                                    {/* Icon */}

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
                                            transition-all
                                            duration-300
                                            group-hover:scale-105
                                            sm:h-11
                                            sm:w-11
                                            ${stat.iconBg}
                                        `}
                                    >

                                        <Icon
                                            size={19}
                                            strokeWidth={
                                                2
                                            }
                                            className={`
                                                transition-transform
                                                duration-300
                                                group-hover:scale-110
                                                ${stat.iconClass}
                                            `}
                                        />

                                    </div>

                                </div>


                                {/* Bottom Indicator */}

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
                                            opacity-60
                                            transition-all
                                            duration-500
                                            group-hover:w-16
                                            group-hover:opacity-100
                                            ${stat.accent}
                                        `}
                                    />

                                </div>

                            </article>

                        );

                    }
                )
            }

        </div>

    );

}


export default ReportsStats;