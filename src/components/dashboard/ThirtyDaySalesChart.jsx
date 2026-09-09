import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import Chart from 'react-apexcharts';

import {
    CalendarDays,
    TrendingUp,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import {
    formatJalaliDate,
    getJalaliMonthStyle,
} from '../../utils/date/jalali';


// =========================================================
// Helpers
// =========================================================

const getSaleAmount = (sale) => {

    if (!sale) {
        return 0;
    }


    const directAmount = Number(
        sale.totalAmount ??
        sale.total ??
        sale.amount ??
        sale.finalAmount ??
        sale.payableAmount ??
        sale.grandTotal
    );


    if (Number.isFinite(directAmount)) {

        return Math.max(
            0,
            directAmount
        );

    }


    if (Array.isArray(sale.items)) {

        return sale.items.reduce(
            (total, item) => {

                const quantity =
                    Number(
                        item.quantity ?? 0
                    );

                const price =
                    Number(
                        item.sellPrice ??
                        item.price ??
                        item.unitPrice ??
                        0
                    );


                if (
                    !Number.isFinite(
                        quantity
                    ) ||
                    !Number.isFinite(
                        price
                    )
                ) {

                    return total;

                }


                return (
                    total +
                    Math.max(
                        0,
                        quantity
                    ) *
                    Math.max(
                        0,
                        price
                    )
                );

            },
            0
        );

    }


    return 0;

};


// =========================================================
// Sale Date
// =========================================================

const getSaleDate = (sale) => (
    sale?.date ??
    sale?.createdAt ??
    sale?.updatedAt ??
    null
);


// =========================================================
// Date Key
// =========================================================

const createDateKey = (date) => (
    [
        date.getFullYear(),

        String(
            date.getMonth() + 1
        ).padStart(
            2,
            '0'
        ),

        String(
            date.getDate()
        ).padStart(
            2,
            '0'
        ),
    ].join('-')
);


// =========================================================
// Thirty Day Sales Chart
// =========================================================

function ThirtyDaySalesChart({
    sales = [],
    loading = false,
}) {

    const {
        t,
        i18n,
    } = useTranslation();


    // =====================================================
    // Mobile Chart Scroll Ref
    // =====================================================

    const chartScrollRef =
        useRef(null);


    // =====================================================
    // Theme
    // =====================================================

    const [
        isDark,
        setIsDark,
    ] = useState(
        () => (
            typeof document !== 'undefined' &&
            document.documentElement.classList.contains(
                'dark'
            )
        )
    );


    // =====================================================
    // Jalali Month Style
    // =====================================================

    const [
        jalaliMonthStyle,
        setJalaliMonthStyle,
    ] = useState(
        getJalaliMonthStyle()
    );


    // =====================================================
    // Detect Theme
    // =====================================================

    useEffect(() => {

        if (
            typeof document ===
            'undefined'
        ) {

            return undefined;

        }


        const updateTheme = () => {

            setIsDark(
                document.documentElement.classList.contains(
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
            document.documentElement,
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
    // Detect Jalali Month Style Changes
    // =====================================================

    useEffect(() => {

        if (
            typeof window ===
            'undefined'
        ) {

            return undefined;

        }


        const handleChange = (
            event
        ) => {

            setJalaliMonthStyle(
                event?.detail ||
                getJalaliMonthStyle()
            );

        };


        const handleStorage = () => {

            setJalaliMonthStyle(
                getJalaliMonthStyle()
            );

        };


        window.addEventListener(
            'jalali-month-style-changed',
            handleChange
        );


        window.addEventListener(
            'storage',
            handleStorage
        );


        return () => {

            window.removeEventListener(
                'jalali-month-style-changed',
                handleChange
            );


            window.removeEventListener(
                'storage',
                handleStorage
            );

        };

    }, []);


    // =====================================================
    // Current Language
    // =====================================================

    const isEnglish =
        String(
            i18n.language || ''
        )
            .toLowerCase()
            .startsWith('en');


    // =====================================================
    // Build Last 30 Days
    // =====================================================

    const chartData =
        useMemo(
            () => {

                const days = [];


                const today =
                    new Date();


                today.setHours(
                    0,
                    0,
                    0,
                    0
                );


                for (
                    let index = 29;
                    index >= 0;
                    index -= 1
                ) {

                    const date =
                        new Date(
                            today
                        );


                    date.setDate(
                        today.getDate() -
                        index
                    );


                    days.push(
                        date
                    );

                }


                const totalsByDay = {};


                days.forEach(
                    (date) => {

                        totalsByDay[
                            createDateKey(
                                date
                            )
                        ] = 0;

                    }
                );


                if (
                    Array.isArray(
                        sales
                    )
                ) {

                    sales.forEach(
                        (sale) => {

                            const saleDate =
                                getSaleDate(
                                    sale
                                );


                            if (!saleDate) {

                                return;

                            }


                            const parsedDate =
                                new Date(
                                    saleDate
                                );


                            if (
                                Number.isNaN(
                                    parsedDate.getTime()
                                )
                            ) {

                                return;

                            }


                            const key =
                                createDateKey(
                                    parsedDate
                                );


                            if (
                                !(key in totalsByDay)
                            ) {

                                return;

                            }


                            totalsByDay[key] +=
                                Math.max(
                                    0,
                                    getSaleAmount(
                                        sale
                                    )
                                );

                        }
                    );

                }


                const categories =
                    days.map(
                        (date) =>
                            String(
                                date.getDate()
                            )
                    );


                const jalaliDates =
                    days.map(
                        (date) =>
                            formatJalaliDate(
                                date,
                                {
                                    monthStyle:
                                        jalaliMonthStyle,

                                    withMonthName:
                                        true,
                                }
                            )
                    );


                const englishDates =
                    days.map(
                        (date) =>
                            new Intl.DateTimeFormat(
                                'en-US',
                                {
                                    year:
                                        'numeric',

                                    month:
                                        'short',

                                    day:
                                        'numeric',
                                }
                            ).format(
                                date
                            )
                    );


                const values =
                    days.map(
                        (date) => {

                            return Math.max(
                                0,
                                Number(
                                    totalsByDay[
                                        createDateKey(
                                            date
                                        )
                                    ]
                                ) || 0
                            );

                        }
                    );


                const total =
                    values.reduce(
                        (
                            sum,
                            value
                        ) =>
                            sum +
                            value,
                        0
                    );


                const highest =
                    Math.max(
                        ...values,
                        0
                    );


                const saleDays =
                    values.filter(
                        (value) =>
                            value > 0
                    ).length;


                return {

                    categories,

                    jalaliDates,

                    englishDates,

                    values,

                    total,

                    highest,

                    saleDays,

                };

            },
            [
                sales,
                jalaliMonthStyle,
            ]
        );


    // =====================================================
    // Chart Data Signature
    // =====================================================

    const thirtyDayChartSignature =
        useMemo(
            () =>
                [
                    i18n.language,
                    jalaliMonthStyle,
                    chartData.total,
                    chartData.highest,
                    chartData.values.join('-'),
                    chartData.categories.join('-'),
                ].join('|'),
            [
                i18n.language,
                jalaliMonthStyle,
                chartData.total,
                chartData.highest,
                chartData.values,
                chartData.categories,
            ]
        );


    // =====================================================
    // English Mobile View Starts At Latest Days
    // =====================================================

    useEffect(() => {

        const element =
            chartScrollRef.current;


        if (!element) {

            return undefined;

        }


        if (!isEnglish) {

            return undefined;

        }


        const scrollToLatest =
            () => {

                const maxScrollLeft =
                    Math.max(
                        0,
                        element.scrollWidth -
                        element.clientWidth
                    );


                element.scrollLeft =
                    maxScrollLeft;

            };


        const frameOne =
            requestAnimationFrame(
                scrollToLatest
            );


        const frameTwo =
            requestAnimationFrame(
                () => {

                    requestAnimationFrame(
                        scrollToLatest
                    );

                }
            );


        return () => {

            cancelAnimationFrame(
                frameOne
            );


            cancelAnimationFrame(
                frameTwo
            );

        };

    }, [
        isEnglish,
        thirtyDayChartSignature,
    ]);


    // =====================================================
    // Theme Colors
    // =====================================================

    const textColor =
        isDark
            ? '#94a3b8'
            : '#64748b';


    const gridColor =
        isDark
            ? 'rgba(71, 85, 105, 0.35)'
            : 'rgba(148, 163, 184, 0.25)';


    const tooltipTheme =
        isDark
            ? 'dark'
            : 'light';


    // =====================================================
    // Format Number
    // =====================================================

    const formatNumber = (
        value
    ) => {

        return Number(
            value || 0
        ).toLocaleString(
            isEnglish
                ? 'en-US'
                : 'fa-IR'
        );

    };


    // =====================================================
    // Chart Options
    // =====================================================

    const options =
        useMemo(
            () => ({

                chart: {

                    type:
                        'area',

                    background:
                        'transparent',

                    fontFamily:
                        'inherit',

                    parentHeightOffset:
                        0,

                    redrawOnWindowResize:
                        true,

                    toolbar: {

                        show:
                            false,

                    },

                    zoom: {

                        enabled:
                            false,

                    },

                    /*
                     * Disabled for stable SVG layout.
                     */

                    animations: {

                        enabled:
                            false,

                    },

                },


                colors: [

                    '#10b981',

                ],


                dataLabels: {

                    enabled:
                        false,

                },


                stroke: {

                    curve:
                        'smooth',

                    width:
                        2.5,

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
                                : 0.20,

                        opacityTo:
                            0.02,

                        stops: [

                            0,

                            72,

                            100,

                        ],

                    },

                },


                grid: {

                    show:
                        true,

                    borderColor:
                        gridColor,

                    strokeDashArray:
                        4,

                    position:
                        'back',

                    padding: {

                        top:
                            8,

                        right:
                            4,

                        bottom:
                            4,

                        left:
                            4,

                    },


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

                },


                xaxis: {

                    categories:
                        chartData.categories,

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

                        trim:
                            false,

                        hideOverlappingLabels:
                            false,

                        rotate:
                            0,

                        rotateAlways:
                            false,

                        minHeight:
                            24,

                        maxHeight:
                            36,

                        offsetY:
                            2,


                        style: {

                            colors:
                                textColor,

                            fontSize:
                                '10px',

                            fontWeight:
                                500,

                            fontFamily:
                                'inherit',

                        },

                    },

                },


                yaxis: {

                    show:
                        true,

                    min:
                        0,

                    forceNiceScale:
                        true,

                    decimalsInFloat:
                        0,


                    labels: {

                        show:
                            true,

                        minWidth:
                            42,

                        maxWidth:
                            58,

                        offsetX:
                            0,


                        style: {

                            colors:
                                textColor,

                            fontSize:
                                '10px',

                            fontFamily:
                                'inherit',

                        },


                        formatter:
                            (
                                value
                            ) => {

                                const number =
                                    Number(
                                        value
                                    );


                                if (
                                    !Number.isFinite(
                                        number
                                    )
                                ) {

                                    return '0';

                                }


                                if (
                                    number >=
                                    1000000
                                ) {

                                    return `${
                                        (
                                            number /
                                            1000000
                                        ).toFixed(
                                            1
                                        )
                                    }M`;

                                }


                                if (
                                    number >=
                                    1000
                                ) {

                                    return `${
                                        (
                                            number /
                                            1000
                                        ).toFixed(
                                            1
                                        )
                                    }k`;

                                }


                                return Math.round(
                                    number
                                ).toLocaleString(
                                    isEnglish
                                        ? 'en-US'
                                        : 'fa-IR'
                                );

                            },

                    },

                },


                tooltip: {

                    enabled:
                        true,

                    theme:
                        tooltipTheme,

                    shared:
                        false,

                    intersect:
                        false,


                    x: {

                        show:
                            true,


                        formatter:
                            (
                                _value,
                                {
                                    dataPointIndex,
                                } = {}
                            ) => {

                                if (
                                    isEnglish
                                ) {

                                    return (
                                        chartData
                                            .englishDates[
                                                dataPointIndex
                                            ] ||
                                        ''
                                    );

                                }


                                return (
                                    chartData
                                        .jalaliDates[
                                            dataPointIndex
                                        ] ||
                                    ''
                                );

                            },

                    },


                    y: {

                        formatter:
                            (
                                value
                            ) => (
                                `${formatNumber(
                                    value
                                )} ${
                                    t(
                                        'common.currency'
                                    )
                                }`
                            ),

                    },

                },


                markers: {

                    size:
                        3.5,

                    strokeWidth:
                        2,


                    hover: {

                        size:
                            6,

                    },

                },


                states: {

                    hover: {

                        filter: {

                            type:
                                'none',

                        },

                    },


                    active: {

                        filter: {

                            type:
                                'none',

                        },

                    },

                },


                responsive: [

                    {

                        breakpoint:
                            1024,

                        options: {

                            markers: {

                                size:
                                    3.5,

                                hover: {

                                    size:
                                        6,

                                },

                            },

                        },

                    },


                    {

                        breakpoint:
                            640,

                        options: {

                            markers: {

                                size:
                                    3,

                                hover: {

                                    size:
                                        6,

                                },

                            },


                            grid: {

                                padding: {

                                    top:
                                        6,

                                    right:
                                        8,

                                    bottom:
                                        10,

                                    left:
                                        0,

                                },

                            },


                            xaxis: {

                                labels: {

                                    rotate:
                                        -45,

                                    rotateAlways:
                                        true,

                                    fontSize:
                                        '8px',

                                    offsetY:
                                        2,

                                },

                            },


                            yaxis: {

                                labels: {

                                    minWidth:
                                        34,

                                    maxWidth:
                                        44,


                                    style: {

                                        fontSize:
                                            '8px',

                                    },

                                },

                            },

                        },

                    },


                    {

                        breakpoint:
                            420,

                        options: {

                            xaxis: {

                                labels: {

                                    rotate:
                                        -50,

                                    fontSize:
                                        '8px',

                                },

                            },

                        },

                    },

                ],

            }),
            [
                chartData.categories,
                chartData.englishDates,
                chartData.jalaliDates,
                gridColor,
                i18n.language,
                isDark,
                isEnglish,
                t,
                textColor,
                tooltipTheme,
            ]
        );


    // =====================================================
    // Series
    // =====================================================

    const series =
        useMemo(
            () => [

                {

                    name:
                        t(
                            'dashboard.thirtyDaySalesChart.series'
                        ),

                    data:
                        chartData.values,

                },

            ],
            [
                chartData.values,
                t,
            ]
        );


    // =====================================================
    // Render
    // =====================================================

    return (

        <section
            dir={i18n.dir()}

            className="
                ui-card

                w-full
                min-w-0

                overflow-hidden

                p-4
                sm:p-5
                lg:p-6
            "
        >

            {/* =================================================
                Header
            ================================================= */}

            <div
                className="
                    flex
                    flex-col
                    gap-3

                    mb-4

                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                "
            >

                <div
                    className="
                        min-w-0
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

                                text-[var(--accent-500)]
                            "
                        >

                            <CalendarDays
                                size={17}
                                strokeWidth={1.8}
                            />

                        </div>


                        <h2
                            className="
                                truncate

                                text-base
                                font-semibold

                                tracking-[-0.01em]

                                text-[var(--text)]

                                sm:text-lg
                                lg:text-xl
                            "
                        >
                            {
                                t(
                                    'dashboard.thirtyDaySalesChart.title'
                                )
                            }
                        </h2>

                    </div>


                    <p
                        className="
                            mt-1.5

                            text-xs
                            leading-5

                            text-[var(--text-muted)]
                        "
                    >
                        {
                            t(
                                'dashboard.thirtyDaySalesChart.description'
                            )
                        }
                    </p>

                </div>


                {/* Summary */}

                <div
                    className="
                        flex
                        items-center
                        gap-3

                        self-start

                        rounded-xl

                        border
                        border-[var(--accent-border)]

                        bg-[var(--accent-soft)]

                        px-3.5
                        py-2.5

                        sm:self-auto
                        sm:min-w-[190px]
                        sm:justify-between
                    "
                >

                    <div>

                        <p
                            className="
                                text-[10px]

                                text-[var(--text-muted)]
                            "
                        >
                            {
                                t(
                                    'dashboard.thirtyDaySalesChart.total'
                                )
                            }
                        </p>


                        <p
                            className="
                                mt-0.5

                                text-base
                                font-semibold

                                text-[var(--text)]

                                sm:text-lg
                            "
                        >

                            {
                                formatNumber(
                                    chartData.total
                                )
                            }

                            {' '}

                            <span
                                className="
                                    text-[10px]
                                    font-normal

                                    text-[var(--text-soft)]
                                "
                            >
                                {
                                    t(
                                        'common.currency'
                                    )
                                }
                            </span>

                        </p>

                    </div>


                    <div
                        className="
                            h-8
                            w-px

                            bg-[var(--border)]
                        "
                    />


                    <div>

                        <p
                            className="
                                text-[10px]

                                text-[var(--text-muted)]
                            "
                        >
                            {
                                t(
                                    'dashboard.thirtyDaySalesChart.saleDays'
                                )
                            }
                        </p>


                        <p
                            dir="ltr"

                            className="
                                mt-0.5

                                text-base
                                font-semibold

                                text-[var(--accent-600)]
                            "
                        >

                            {
                                chartData.saleDays
                            }

                            <span
                                className="
                                    ms-1

                                    text-[10px]
                                    font-normal

                                    text-[var(--text-soft)]
                                "
                            >
                                / 30
                            </span>

                        </p>

                    </div>

                </div>

            </div>


            {/* =================================================
                Chart Viewport
            ================================================= */}

            <div
                ref={chartScrollRef}

                className="
                    w-full
                    min-w-0

                    overflow-x-auto
                    overflow-y-hidden

                    overscroll-x-contain

                    touch-pan-x

                    pb-2

                    sm:overflow-x-hidden
                    sm:pb-0

                    scrollbar-thin
                "
            >

                <div
                    className="
                        h-[300px]

                        w-[1800px]

                        sm:h-[320px]
                        sm:w-full

                        lg:h-[350px]
                    "
                >

                    {loading ? (

                        <div
                            className="
                                flex
                                h-full
                                w-full

                                items-center
                                justify-center
                            "
                        >

                            <div
                                className="
                                    rounded-xl

                                    border
                                    border-[var(--border-subtle)]

                                    bg-[var(--surface-muted)]

                                    px-4
                                    py-3

                                    text-xs

                                    text-[var(--text-muted)]
                                "
                            >
                                {
                                    t(
                                        'dashboard.thirtyDaySalesChart.loading'
                                    )
                                }
                            </div>

                        </div>

                    ) : chartData.total <= 0 ? (

                        <div
                            className="
                                flex
                                h-full
                                w-full

                                items-center
                                justify-center

                                text-center
                            "
                        >

                            <div>

                                <div
                                    className="
                                        mx-auto
                                        mb-3

                                        flex
                                        h-11
                                        w-11

                                        items-center
                                        justify-center

                                        rounded-xl

                                        bg-[var(--surface-muted)]

                                        text-[var(--text-soft)]
                                    "
                                >

                                    <TrendingUp
                                        size={22}
                                        strokeWidth={1.7}
                                    />

                                </div>


                                <p
                                    className="
                                        text-sm

                                        text-[var(--text-muted)]
                                    "
                                >
                                    {
                                        t(
                                            'dashboard.thirtyDaySalesChart.empty'
                                        )
                                    }
                                </p>

                            </div>

                        </div>

                    ) : (

                        <div
                            className="
                                h-full
                                w-full
                                min-w-0
                            "
                        >

                            <Chart
                                key={` 
                                    ${i18n.language}-
                                    ${jalaliMonthStyle}-
                                    ${isDark}-
                                    ${chartData.total}-
                                    ${chartData.highest}-
                                    ${chartData.values.join('-')}
                                `}

                                options={
                                    options
                                }

                                series={
                                    series
                                }

                                type="area"

                                width="100%"

                                height="100%"
                            />

                        </div>

                    )}

                </div>

            </div>

        </section>

    );

}


export default ThirtyDaySalesChart;