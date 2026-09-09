import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    CreditCard,
} from 'lucide-react';

import Chart from 'react-apexcharts';

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
// Payment Distribution Chart
// =========================================================

function PaymentDistributionChart({
    data = [],
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
    // Theme
    // =====================================================

    const [
        isDark,
        setIsDark,
    ] = useState(() => {

        if (
            typeof document ===
            'undefined'
        ) {

            return false;

        }


        return document.documentElement.classList.contains(
            'dark'
        );

    });


    // =====================================================
    // Detect Theme Changes
    // =====================================================

    useEffect(() => {

        if (
            typeof document ===
            'undefined'
        ) {

            return undefined;

        }


        const root =
            document.documentElement;


        const updateTheme = () => {

            setIsDark(
                root.classList.contains(
                    'dark'
                )
            );

        };


        updateTheme();


        const observer =
            new MutationObserver(
                updateTheme
            );


        observer.observe(
            root,
            {
                attributes:
                    true,

                attributeFilter: [
                    'class',
                ],
            }
        );


        return () => {

            observer.disconnect();

        };

    }, []);


    // =====================================================
    // Normalize Payment Name
    // =====================================================

    const getPaymentName = (
        name
    ) => {

        const value =
            String(
                name ?? ''
            )
                .trim()
                .toLowerCase();


        if (
            value === 'cash' ||
            value === 'نقدی' ||
            value === 'cash sales' ||
            value === 'فروش نقدی'
        ) {

            return t(
                'reports.charts.paymentDistribution.cash',
                {
                    defaultValue:
                        isEnglish
                            ? 'Cash'
                            : 'نقدی',
                }
            );

        }


        if (
            value === 'credit' ||
            value === 'نسیه' ||
            value === 'credit sales' ||
            value === 'فروش نسیه'
        ) {

            return t(
                'reports.charts.paymentDistribution.credit',
                {
                    defaultValue:
                        isEnglish
                            ? 'Credit'
                            : 'نسیه',
                }
            );

        }


        if (!value) {

            return t(
                'reports.charts.paymentDistribution.unknown',
                {
                    defaultValue:
                        isEnglish
                            ? 'Unknown'
                            : 'نامشخص',
                }
            );

        }


        return String(
            name
        );

    };


    // =====================================================
    // Normalize Data
    // =====================================================

    const chartData =
        useMemo(() => {

            if (
                !Array.isArray(
                    data
                )
            ) {

                return [];

            }


            return data

                .filter(
                    (item) =>
                        item &&
                        typeof item ===
                            'object'
                )

                .map(
                    (item) => ({

                        name:
                            getPaymentName(
                                item.name
                            ),

                        value:
                            Number(
                                toEnglishNumbers(
                                    item.value
                                )
                            ) || 0,

                    })
                );

        }, [
            data,
            t,
            isEnglish,
        ]);


    // =====================================================
    // Labels
    // =====================================================

    const labels =
        useMemo(() => {

            return chartData.map(
                (item) =>
                    item.name
            );

        }, [
            chartData,
        ]);


    // =====================================================
    // Values
    // =====================================================

    const values =
        useMemo(() => {

            return chartData.map(
                (item) =>
                    item.value
            );

        }, [
            chartData,
        ]);


    // =====================================================
    // Total
    // =====================================================

    const total =
        useMemo(() => {

            return values.reduce(
                (
                    sum,
                    value
                ) =>
                    sum +
                    Number(
                        value || 0
                    ),
                0
            );

        }, [
            values,
        ]);


    // =====================================================
    // Theme
    // =====================================================

    const theme =
        useMemo(() => {

            return {

                text:
                    isDark
                        ? '#94a3b8'
                        : '#64748b',

                title:
                    isDark
                        ? '#f8fafc'
                        : '#0f172a',

                muted:
                    isDark
                        ? '#64748b'
                        : '#94a3b8',

                stroke:
                    isDark
                        ? '#111827'
                        : '#ffffff',

                tooltip:
                    isDark
                        ? 'dark'
                        : 'light',

            };

        }, [
            isDark,
        ]);


    // =====================================================
    // Chart Options
    // =====================================================

    const options =
        useMemo(() => {

            return {

                chart: {

                    type:
                        'donut',

                    background:
                        'transparent',

                    toolbar: {
                        show: false,
                    },

                    fontFamily:
                        isEnglish
                            ? 'Space Grotesk, sans-serif'
                            : 'Vazirmatn, sans-serif',

                    animations: {
                        enabled: false,
                    },

                    redrawOnWindowResize:
                        true,

                    redrawOnParentResize:
                        true,

                    zoom: {
                        enabled: false,
                    },

                },


                labels,


                colors: [

                    '#10b981',

                    '#f59e0b',

                    '#38bdf8',

                    '#8b5cf6',

                ],


                stroke: {

                    width:
                        2,

                    colors: [
                        theme.stroke,
                    ],

                },


                dataLabels: {
                    enabled:
                        false,
                },


                legend: {

                    show:
                        true,

                    position:
                        'bottom',

                    horizontalAlign:
                        'center',

                    fontSize:
                        '11px',

                    fontFamily:
                        isEnglish
                            ? 'Space Grotesk, sans-serif'
                            : 'Vazirmatn, sans-serif',

                    fontWeight:
                        500,

                    labels: {

                        colors:
                            theme.text,

                    },

                    markers: {

                        size:
                            4,

                        offsetX:
                            isEnglish
                                ? -3
                                : 3,

                    },

                    itemMargin: {

                        horizontal:
                            isEnglish
                                ? 8
                                : 10,

                        vertical:
                            5,

                    },

                },


                plotOptions: {

                    pie: {

                        expandOnClick:
                            true,

                        donut: {

                            size:
                                '68%',

                            labels: {

                                show:
                                    true,


                                name: {

                                    show:
                                        true,

                                    color:
                                        theme.text,

                                    fontSize:
                                        '11px',

                                    fontWeight:
                                        500,

                                    fontFamily:
                                        isEnglish
                                            ? 'Space Grotesk, sans-serif'
                                            : 'Vazirmatn, sans-serif',

                                    offsetY:
                                        -3,

                                },


                                value: {

                                    show:
                                        true,

                                    color:
                                        theme.title,

                                    fontSize:
                                        '18px',

                                    fontWeight:
                                        700,

                                    fontFamily:
                                        isEnglish
                                            ? 'Space Grotesk, sans-serif'
                                            : 'Vazirmatn, sans-serif',

                                    offsetY:
                                        5,

                                    formatter: (
                                        value
                                    ) => {

                                        return formatNumber(
                                            value,
                                            language
                                        );

                                    },

                                },


                                total: {

                                    show:
                                        true,

                                    showAlways:
                                        true,

                                    label:
                                        t(
                                            'reports.charts.paymentDistribution.total',
                                            {
                                                defaultValue:
                                                    isEnglish
                                                        ? 'Total'
                                                        : 'مجموع',
                                            }
                                        ),

                                    color:
                                        theme.muted,

                                    fontSize:
                                        '11px',

                                    fontWeight:
                                        500,

                                    fontFamily:
                                        isEnglish
                                            ? 'Space Grotesk, sans-serif'
                                            : 'Vazirmatn, sans-serif',

                                    formatter:
                                        () => {

                                            return formatNumber(
                                                total,
                                                language
                                            );

                                        },

                                },

                            },

                        },

                    },

                },


                tooltip: {

                    enabled:
                        true,

                    theme:
                        theme.tooltip,

                    y: {

                        formatter: (
                            value
                        ) => {

                            return (
                                formatNumber(
                                    value,
                                    language
                                ) +
                                ' ' +
                                (
                                    isEnglish
                                        ? 'AF'
                                        : 'افغانی'
                                )
                            );

                        },

                    },

                },

            };

        }, [
            labels,
            theme,
            total,
            t,
            language,
            isEnglish,
        ]);


    // =====================================================
    // Empty State
    // =====================================================

    if (
        chartData.length === 0 ||
        total <= 0
    ) {

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

                <ChartHeader
                    t={t}
                    isEnglish={
                        isEnglish
                    }
                />


                <div
                    className="
                        flex
                        h-[320px]
                        items-center
                        justify-center
                        px-5
                        text-center
                        text-xs
                        text-[var(--text-muted)]
                    "
                >

                    {
                        t(
                            'reports.empty',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'No report data available.'
                                        : 'داده‌ای برای نمایش گزارش وجود ندارد.',
                            }
                        )
                    }

                </div>

            </div>

        );

    }


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

            <ChartHeader
                t={t}
                isEnglish={
                    isEnglish
                }
            />


            {/* =================================================
                Chart
            ================================================== */}

            <div
                className="
                    w-full
                    min-w-0
                    overflow-hidden
                    px-1
                    py-4
                    sm:px-3
                "
            >

                <Chart
                    key={
                        `payment-${isDark ? 'dark' : 'light'}-${language}`
                    }
                    options={
                        options
                    }
                    series={
                        values
                    }
                    type="donut"
                    height={320}
                />

            </div>

        </div>

    );

}


// =========================================================
// Chart Header
// =========================================================

function ChartHeader({
    t,
    isEnglish,
}) {

    return (

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

            <div
                className="
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    bg-sky-500/50
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
                    border-sky-500/10
                    bg-sky-500/10
                "
            >

                <CreditCard
                    size={17}
                    className="
                        text-sky-500
                        dark:text-sky-400
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
                            'reports.charts.paymentDistribution.title',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Payment Distribution'
                                        : 'توزیع روش پرداخت',
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
                            'reports.charts.paymentDistribution.description',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Compare cash and credit sales'
                                        : 'مقایسه فروش نقدی و نسیه',
                            }
                        )
                    }
                </p>

            </div>

        </div>

    );

}


export default PaymentDistributionChart;