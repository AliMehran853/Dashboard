import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    TrendingUp,
} from 'lucide-react';

import Chart from 'react-apexcharts';

import {
    useTranslation,
} from 'react-i18next';

import {
    formatJalaliDate,
    getJalaliMonthStyle,
} from '../../utils/date/jalali';


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
// Sales Trend Chart
// =========================================================

function SalesTrendChart({
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


        return document.documentElement
            .classList
            .contains(
                'dark'
            );

    });


    // =====================================================
    // Jalali Month Style
    // =====================================================

    const [
        jalaliMonthStyle,
        setJalaliMonthStyle,
    ] = useState(
        () =>
            getJalaliMonthStyle()
    );


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
    // Detect Jalali Month Style
    // =====================================================

    useEffect(() => {

        if (
            typeof window ===
            'undefined'
        ) {

            return undefined;

        }


        const handleJalaliMonthStyleChange = (
            event
        ) => {

            setJalaliMonthStyle(
                event?.detail ||
                getJalaliMonthStyle()
            );

        };


        const handleStorage = (
            event
        ) => {

            if (
                event.key ===
                'jalaliMonthStyle'
            ) {

                setJalaliMonthStyle(
                    getJalaliMonthStyle()
                );

            }

        };


        window.addEventListener(
            'jalali-month-style-changed',
            handleJalaliMonthStyleChange
        );


        window.addEventListener(
            'storage',
            handleStorage
        );


        return () => {

            window.removeEventListener(
                'jalali-month-style-changed',
                handleJalaliMonthStyleChange
            );


            window.removeEventListener(
                'storage',
                handleStorage
            );

        };

    }, []);


    // =====================================================
    // Format Day Label
    // =====================================================

    const formatDayLabel = (
        isoDate,
        fallback
    ) => {

        if (
            !isoDate
        ) {

            return fallback;

        }


        const date =
            new Date(
                `${isoDate}T12:00:00`
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return fallback;

        }


        const locale =
            isEnglish
                ? 'en-US'
                : 'fa-IR';


        return new Intl.DateTimeFormat(
            locale,
            {
                weekday:
                    'short',
            }
        ).format(
            date
        );

    };


    // =====================================================
    // Format Full Date
    // =====================================================

    const formatFullDate = (
        isoDate,
        fallback = ''
    ) => {

        if (
            !isoDate
        ) {

            return fallback;

        }


        const date =
            new Date(
                `${isoDate}T12:00:00`
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return fallback;

        }


        // -------------------------------------------------
        // English
        // -------------------------------------------------

        if (
            isEnglish
        ) {

            return new Intl.DateTimeFormat(
                'en-US',
                {
                    year:
                        'numeric',

                    month:
                        'long',

                    day:
                        'numeric',
                }
            ).format(
                date
            );

        }


        // -------------------------------------------------
        // Persian / Jalali
        // -------------------------------------------------

        return (
            formatJalaliDate(
                date,
                {
                    monthStyle:
                        jalaliMonthStyle,

                    withMonthName:
                        true,
                }
            ) ||
            fallback
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
                    (item) => {

                        const rawDate =
                            String(
                                item.date ??
                                ''
                            );


                        const isoDate =
                            item.isoDate ??
                            null;


                        return {

                            date:
                                formatDayLabel(
                                    isoDate,
                                    rawDate
                                ),

                            isoDate,

                            sales:
                                Number(
                                    toEnglishNumbers(
                                        item.sales
                                    )
                                ) || 0,

                        };

                    }
                );

        }, [
            data,
            isEnglish,
        ]);


    // =====================================================
    // Categories
    // =====================================================

    const categories =
        useMemo(() => {

            return chartData.map(
                (item) =>
                    item.date
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
                    item.sales
            );

        }, [
            chartData,
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

                grid:
                    isDark
                        ? 'rgba(71,85,105,0.30)'
                        : 'rgba(148,163,184,0.24)',

                tooltip:
                    isDark
                        ? 'dark'
                        : 'light',

                emerald:
                    '#10b981',

                tooltipText:
                    isDark
                        ? '#f8fafc'
                        : '#0f172a',

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
                        'area',

                    background:
                        'transparent',

                    toolbar: {

                        show:
                            false,

                    },

                    zoom: {

                        enabled:
                            false,

                    },

                    fontFamily:
                        isEnglish
                            ? 'Space Grotesk, sans-serif'
                            : 'Vazirmatn, sans-serif',

                    animations: {

                        enabled:
                            false,

                    },

                    redrawOnWindowResize:
                        true,

                    redrawOnParentResize:
                        true,

                },


                colors: [

                    theme.emerald,

                ],


                stroke: {

                    curve:
                        'smooth',

                    width:
                        3,

                    lineCap:
                        'round',

                },


                fill: {

                    type:
                        'gradient',

                    gradient: {

                        shadeIntensity:
                            1,

                        inverseColors:
                            false,

                        opacityFrom:
                            isDark
                                ? 0.28
                                : 0.18,

                        opacityTo:
                            0.02,

                        stops: [
                            0,
                            75,
                            100,
                        ],

                    },

                },


                dataLabels: {

                    enabled:
                        false,

                },


                grid: {

                    show:
                        true,

                    borderColor:
                        theme.grid,

                    strokeDashArray:
                        4,

                    position:
                        'back',

                    xaxis: {

                        lines: {

                            show:
                                false,

                        },

                    },

                    yaxis: {

                        lines: {

                            show:
                                true,

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


                xaxis: {

                    categories,

                    tickPlacement:
                        'on',

                    axisBorder: {

                        show:
                            false,

                    },

                    axisTicks: {

                        show:
                            false,

                    },

                    labels: {

                        show:
                            true,

                        rotate:
                            0,

                        rotateAlways:
                            false,

                        trim:
                            true,

                        hideOverlappingLabels:
                            true,

                        showDuplicates:
                            false,

                        style: {

                            colors:
                                theme.text,

                            fontSize:
                                '10px',

                            fontFamily:
                                isEnglish
                                    ? 'Space Grotesk, sans-serif'
                                    : 'Vazirmatn, sans-serif',

                            fontWeight:
                                400,

                        },

                    },

                    tooltip: {

                        enabled:
                            false,

                    },

                },


                yaxis: {

                    min:
                        0,

                    forceNiceScale:
                        true,

                    labels: {

                        show:
                            true,

                        minWidth:
                            42,

                        maxWidth:
                            72,

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


                tooltip: {

                    enabled:
                        true,

                    theme:
                        theme.tooltip,

                    shared:
                        false,

                    intersect:
                        false,

                    x: {

                        formatter: (
                            _value,
                            {
                                dataPointIndex,
                            }
                        ) => {

                            const item =
                                chartData[
                                    dataPointIndex
                                ];


                            if (
                                item?.isoDate
                            ) {

                                return formatFullDate(
                                    item.isoDate,
                                    item.date
                                );

                            }


                            return (
                                item?.date ||
                                ''
                            );

                        },

                    },

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


                markers: {

                    size:
                        4,

                    colors: [

                        theme.emerald,

                    ],

                    strokeColors:
                        isDark
                            ? '#0f172a'
                            : '#ffffff',

                    strokeWidth:
                        2,

                    hover: {

                        size:
                            6,

                    },

                },


                legend: {

                    show:
                        false,

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
            chartData,
            language,
            isEnglish,
            isDark,
            jalaliMonthStyle,
            theme,
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
                            'reports.charts.salesTrend.series',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Sales'
                                        : 'فروش',
                            }
                        ),

                    data:
                        values,

                },

            ];

        }, [
            values,
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
                    min-w-0
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
                        h-[280px]
                        items-center
                        justify-center
                        px-5
                        text-center
                        text-xs
                        leading-5
                        text-[var(--text-muted)]
                        sm:h-[320px]
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
                min-w-0
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
                    py-3
                    sm:px-3
                    sm:py-4
                "
            >

                <div
                    className="
                        w-full
                        min-w-0
                    "
                >

                    <Chart
                        key={`
                            sales-
                            ${isDark ? 'dark' : 'light'}-
                            ${language}-
                            ${jalaliMonthStyle}
                        `}
                        options={
                            options
                        }
                        series={
                            series
                        }
                        type="area"
                        height={255}
                    />

                </div>

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
                min-w-0
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

                <TrendingUp
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
                            'reports.charts.salesTrend.title',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Sales Trend'
                                        : 'روند فروش',
                            }
                        )
                    }
                </h2>


                <p
                    className="
                        mt-1
                        truncate
                        text-[10px]
                        leading-5
                        text-[var(--text-muted)]
                    "
                >
                    {
                        t(
                            'reports.charts.salesTrend.description',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Sales performance over the selected period'
                                        : 'روند عملکرد فروش در بازه انتخاب‌شده',
                            }
                        )
                    }
                </p>

            </div>

        </div>

    );

}


export default SalesTrendChart;