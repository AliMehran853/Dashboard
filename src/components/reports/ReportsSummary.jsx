import {
    BarChart3,
    TrendingUp,
    Wallet,
    CreditCard,
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
// Reports Summary
// =========================================================

function ReportsSummary({
    summary = {},
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
    // Values
    // =====================================================

    const {
        bestCategory = '-',
        bestCategorySales = 0,
        averageSale = 0,
        totalItems = 0,
    } = summary;


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
    // Render
    // =====================================================

    return (

        <div
            dir={
                direction
            }
            className="
                ui-card
                overflow-hidden
                p-0
            "
        >

            {/* =================================================
                Header
            ================================================== */}

            <div
                className="
                    relative
                    flex
                    items-center
                    gap-3
                    border-b
                    border-[var(--border)]
                    px-4
                    py-4
                    sm:px-5
                "
            >

                {/* Accent Top Line */}

                <div
                    aria-hidden="true"
                    className="
                        absolute
                        inset-x-0
                        top-0
                        h-px
                        bg-[var(--accent-500)]
                        opacity-50
                    "
                />


                <div
                    className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-[var(--accent-border)]
                        bg-[var(--accent-soft)]
                    "
                >

                    <BarChart3
                        size={17}
                        className="
                            text-[var(--accent-500)]
                        "
                    />

                </div>


                <div
                    className="
                        min-w-0
                    "
                >

                    <h2
                        className="
                            truncate
                            text-sm
                            font-semibold
                            text-[var(--text-primary)]
                        "
                    >
                        {
                            t(
                                'reports.summary.title',
                                {
                                    defaultValue:
                                        isEnglish
                                            ? 'Report Summary'
                                            : 'خلاصه گزارش',
                                }
                            )
                        }
                    </h2>


                    <p
                        className="
                            mt-1
                            text-[10px]
                            leading-5
                            text-[var(--text-muted)]
                        "
                    >
                        {
                            t(
                                'reports.summary.description',
                                {
                                    defaultValue:
                                        isEnglish
                                            ? 'Key insights from the selected report'
                                            : 'مهم‌ترین اطلاعات گزارش انتخاب‌شده',
                                }
                            )
                        }
                    </p>

                </div>

            </div>


            {/* =================================================
                Content
            ================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    gap-3
                    p-4
                    sm:grid-cols-2
                    sm:gap-4
                    sm:p-5
                "
            >

                {/* =================================================
                    Best Category
                ================================================== */}

                <SummaryCard
                    icon={
                        TrendingUp
                    }
                    label={t(
                        'reports.summary.bestCategory',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'Best Category'
                                    : 'بهترین دسته‌بندی',
                        }
                    )}
                >

                    <p
                        title={
                            bestCategory
                        }
                        className="
                            mt-2
                            truncate
                            text-base
                            font-bold
                            text-[var(--text-primary)]
                        "
                    >
                        {
                            bestCategory
                        }
                    </p>


                    <p
                        dir={
                            isEnglish
                                ? 'ltr'
                                : 'rtl'
                        }
                        className="
                            mt-1
                            truncate
                            number-font
                            text-[10px]
                            text-[var(--text-muted)]
                        "
                    >
                        {
                            formatNumber(
                                bestCategorySales,
                                language
                            )
                        }

                        <span
                            className="
                                ms-1
                                font-sans
                                text-[9px]
                            "
                        >
                            {
                                currency
                            }
                        </span>

                    </p>

                </SummaryCard>


                {/* =================================================
                    Average Sale
                ================================================== */}

                <SummaryCard
                    icon={
                        Wallet
                    }
                    label={t(
                        'reports.summary.averageSale',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'Average Sale'
                                    : 'میانگین فروش',
                        }
                    )}
                >

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
                            text-base
                            font-bold
                            text-[var(--text-primary)]
                        "
                    >

                        {
                            formatNumber(
                                averageSale,
                                language
                            )
                        }


                        <span
                            className="
                                ms-1
                                font-sans
                                text-[10px]
                                font-medium
                                text-[var(--text-muted)]
                            "
                        >
                            {
                                currency
                            }
                        </span>

                    </p>

                </SummaryCard>


                {/* =================================================
                    Total Items
                ================================================== */}

                <SummaryCard
                    icon={
                        BarChart3
                    }
                    label={t(
                        'reports.summary.totalItems',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'Total Items'
                                    : 'مجموع اقلام',
                        }
                    )}
                >

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
                            text-base
                            font-bold
                            text-[var(--text-primary)]
                        "
                    >

                        {
                            formatNumber(
                                totalItems,
                                language
                            )
                        }


                        <span
                            className="
                                ms-1
                                font-sans
                                text-[10px]
                                font-medium
                                text-[var(--text-muted)]
                            "
                        >
                            {
                                t(
                                    'reports.summary.itemUnit',
                                    {
                                        defaultValue:
                                            isEnglish
                                                ? 'items'
                                                : 'قلم',
                                    }
                                )
                            }
                        </span>

                    </p>

                </SummaryCard>


                {/* =================================================
                    Best Category Sales
                ================================================== */}

                <SummaryCard
                    icon={
                        CreditCard
                    }
                    highlight
                    label={t(
                        'reports.summary.bestCategorySales',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'Best Category Sales'
                                    : 'فروش بهترین دسته‌بندی',
                        }
                    )}
                >

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
                            text-base
                            font-bold
                            text-[var(--accent-500)]
                        "
                    >

                        {
                            formatNumber(
                                bestCategorySales,
                                language
                            )
                        }


                        <span
                            className="
                                ms-1
                                font-sans
                                text-[10px]
                                font-medium
                                text-[var(--text-muted)]
                            "
                        >
                            {
                                currency
                            }
                        </span>

                    </p>

                </SummaryCard>

            </div>

        </div>

    );

}


// =========================================================
// Summary Card
// =========================================================

function SummaryCard({
    icon: Icon,
    label,
    highlight = false,
    children,
}) {

    return (

        <div
            className="
                group
                relative
                min-w-0
                overflow-hidden
                rounded-xl
                border
                border-[var(--border)]
                p-4
                shadow-[var(--shadow-xs)]
                transition-all
                duration-300
                ease-[var(--ease-out)]
                hover:-translate-y-0.5
                hover:border-[var(--glass-border-hover)]
                hover:shadow-[var(--shadow-card)]
            "
            style={{
                background: `
                    linear-gradient(
                        135deg,
                        var(--glass-active-tint),
                        var(--glass-active-tint-soft) 70%,
                        transparent 100%
                    ),
                    var(--surface-muted)
                `,
            }}
        >

            {/* Hover Tint Overlay */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-xl
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


            {/* Hover Background Glow (accent-based) */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    -end-8
                    -top-8
                    h-20
                    w-20
                    rounded-full
                    blur-2xl
                    opacity-0
                    transition-opacity
                    duration-500
                    group-hover:opacity-100
                "
                style={{
                    background: `
                        radial-gradient(
                            circle,
                            var(--accent-soft-heavy),
                            transparent 70%
                        )
                    `,
                }}
            />


            {/* Highlight Accent Bar (only for highlighted card) */}

            {highlight && (

                <div
                    aria-hidden="true"
                    className="
                        absolute
                        inset-y-3
                        start-0
                        w-[3px]
                        rounded-full
                        bg-[var(--accent-500)]
                        opacity-70
                        transition-opacity
                        duration-300
                        group-hover:opacity-100
                    "
                />

            )}


            {/* Top Row */}

            <div
                className="
                    relative
                    z-10
                    flex
                    min-w-0
                    items-center
                    gap-2
                "
            >

                <div
                    className={`
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        transition-all
                        duration-300
                        group-hover:scale-105
                        ${
                            highlight
                                ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]'
                                : 'border-[var(--border-subtle)] bg-[var(--surface)]'
                        }
                    `}
                >

                    <Icon
                        size={14}
                        className={`
                            transition-colors
                            duration-300
                            ${
                                highlight
                                    ? 'text-[var(--accent-500)]'
                                    : 'text-[var(--text-muted)] group-hover:text-[var(--accent-500)]'
                            }
                        `}
                    />

                </div>


                <span
                    className="
                        min-w-0
                        truncate
                        text-[10px]
                        font-medium
                        text-[var(--text-muted)]
                    "
                >
                    {
                        label
                    }
                </span>

            </div>


            {/* Content */}

            <div
                className="
                    relative
                    z-10
                "
            >
                {
                    children
                }
            </div>

        </div>

    );

}


export default ReportsSummary;