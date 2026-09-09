import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import Chart from 'react-apexcharts';

import {
    BarChart3,
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
// Category Sales Chart
// =========================================================

function CategorySalesChart({
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

                        category:
                            String(
                                item.category ??
                                t(
                                    'reports.charts.categorySales.uncategorized',
                                    {
                                        defaultValue:
                                            isEnglish
                                                ? 'Uncategorized'
                                                : 'بدون دسته‌بندی',
                                    }
                                )
                            ),

                        sales:
                            Number(
                                toEnglishNumbers(
                                    item.sales
                                )
                            ) || 0,

                    })
                )

                .sort(
                    (a, b) =>
                        b.sales -
                        a.sales
                );

        }, [
            data,
            t,
            isEnglish,
        ]);


    // =====================================================
    // Categories
    // =====================================================

    const categories =
        useMemo(() => {

            return chartData.map(
                (item) =>
                    item.category
            );

        }, [
            chartData,
        ]);


    // =====================================================
    // Sales
    // =====================================================

    const sales =
        useMemo(() => {

            return chartData.map(
                (item) =>
                    item.sales
            );

        }, [
            chartData,
        ]);


    // =====================================================
    // Theme Tokens
    // =====================================================

    const theme =
        useMemo(() => {

            return {

                text:
                    isDark
                        ? '#94a3b8'
                        : '#64748b',

                yText:
                    isDark
                        ? '#cbd5e1'
                        : '#334155',

                grid:
                    isDark
                        ? 'rgba(71,85,105,0.30)'
                        : 'rgba(148,163,184,0.24)',

                tooltip:
                    isDark
                        ? 'dark'
                        : 'light',

            };

        }, [
            isDark,
        ]);


    // =====================================================
    // Chart Height
    // =====================================================

    const chartHeight =
        Math.max(
            320,
            chartData.length *
                (
                    chartData.length >= 7
                        ? 48
                        : 54
                )
        );


    // =====================================================
    // Chart Options
    // =====================================================

    const options =
        useMemo(() => {

            return {

                chart: {

                    type: 'bar',

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


                colors: [
                    '#10b981',
                ],


                plotOptions: {

                    bar: {

                        horizontal:
                            true,

                        borderRadius:
                            6,

                        borderRadiusApplication:
                            'end',

                        borderRadiusWhenStacked:
                            'last',

                        barHeight:
                            chartData.length > 8
                                ? '58%'
                                : '62%',

                        distributed:
                            false,

                    },

                },


                dataLabels: {
                    enabled: false,
                },


                xaxis: {

                    categories,

                    min: 0,

                    forceNiceScale:
                        true,

                    axisBorder: {
                        show: false,
                    },

                    axisTicks: {
                        show: false,
                    },

                    labels: {

                        show: true,

                        style: {

                            colors:
                                theme.text,

                            fontSize:
                                '10px',

                            fontFamily:
                                isEnglish
                                    ? 'Space Grotesk, sans-serif'
                                    : 'Vazirmatn, sans-serif',

                        },

                        formatter: (
                            value
                        ) => {

                            return formatNumber(
                                value,
                                language
                            );

                        },

                    },

                },


                yaxis: {

                    reversed:
                        !isEnglish,

                    labels: {

                        show: true,

                        style: {

                            colors:
                                theme.yText,

                            fontSize:
                                '11px',

                            fontWeight:
                                500,

                            fontFamily:
                                isEnglish
                                    ? 'Space Grotesk, sans-serif'
                                    : 'Vazirmatn, sans-serif',

                        },

                        maxWidth:
                            isEnglish
                                ? 150
                                : 130,

                        trim:
                            true,

                    },

                },


                grid: {

                    show: true,

                    borderColor:
                        theme.grid,

                    strokeDashArray:
                        4,

                    position:
                        'back',

                    xaxis: {

                        lines: {
                            show: true,
                        },

                    },

                    yaxis: {

                        lines: {
                            show: false,
                        },

                    },

                    padding: {

                        top:
                            0,

                        right:
                            isEnglish
                                ? 14
                                : 10,

                        bottom:
                            0,

                        left:
                            isEnglish
                                ? 10
                                : 14,

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


                legend: {
                    show: false,
                },


                states: {

                    hover: {

                        filter: {

                            type:
                                'lighten',

                            value:
                                0.05,

                        },

                    },

                    active: {

                        filter: {

                            type:
                                'none',

                        },

                    },

                },

            };

        }, [
            categories,
            chartData.length,
            theme,
            language,
            isEnglish,
        ]);


    // =====================================================
    // Series
    // =====================================================

    const series =
        useMemo(() => {

            return [

                {

                    name:
                        t(
                            'reports.charts.categorySales.series',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Sales'
                                        : 'فروش',
                            }
                        ),

                    data:
                        sales,

                },

            ];

        }, [
            sales,
            t,
            isEnglish,
        ]);


    // =====================================================
    // Empty State
    // =====================================================

    if (
        chartData.length === 0
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
                        h-64
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
                    px-2
                    py-4
                    sm:px-4
                "
            >

                <Chart
                    key={
                        `category-${isDark ? 'dark' : 'light'}-${language}`
                    }
                    options={
                        options
                    }
                    series={
                        series
                    }
                    type="bar"
                    height={
                        chartHeight
                    }
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
                    bg-emerald-500/50
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
                    border-emerald-500/10
                    bg-emerald-500/10
                "
            >

                <BarChart3
                    size={17}
                    className="
                        text-emerald-500
                        dark:text-emerald-400
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
                            'reports.charts.categorySales.title',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Sales by Category'
                                        : 'فروش بر اساس دسته‌بندی',
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
                            'reports.charts.categorySales.description',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Compare sales performance across categories'
                                        : 'مقایسه عملکرد فروش دسته‌بندی‌ها',
                            }
                        )
                    }
                </p>

            </div>

        </div>

    );

}


export default CategorySalesChart;