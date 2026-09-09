import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import Chart from 'react-apexcharts';

import {
    TrendingUp,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';


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
// Day Key
// =========================================================

const getDayKey = (value) => {

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return createDateKey(
        date
    );

};


// =========================================================
// Sales Chart
// =========================================================

function SalesChart({
    sales = [],
    loading = false,
}) {

    const {
        t,
        i18n,
    } = useTranslation();


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


    useEffect(() => {

        if (
            typeof document === 'undefined'
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
                attributes: true,

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
    // Build Last 7 Days
    // =====================================================

    const chartData = useMemo(
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
                let index = 6;
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


            // -------------------------------------------------
            // Totals by Day
            // -------------------------------------------------

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


            // -------------------------------------------------
            // Calculate Sales
            // -------------------------------------------------

            if (Array.isArray(sales)) {

                sales.forEach(
                    (sale) => {

                        const saleDate =
                            getSaleDate(
                                sale
                            );


                        if (!saleDate) {

                            return;

                        }


                        const key =
                            getDayKey(
                                saleDate
                            );


                        if (
                            !key ||
                            !(key in totalsByDay)
                        ) {

                            return;

                        }


                        const amount =
                            getSaleAmount(
                                sale
                            );


                        if (
                            !Number.isFinite(
                                amount
                            )
                        ) {

                            return;

                        }


                        totalsByDay[key] +=
                            Math.max(
                                0,
                                amount
                            );

                    }
                );

            }


            // -------------------------------------------------
            // Locale
            // -------------------------------------------------

            const locale =
                i18n.language === 'en'
                    ? 'en-US'
                    : 'fa-IR-u-ca-persian';


            // -------------------------------------------------
            // Categories
            // -------------------------------------------------

            const categories =
                days.map(
                    (date) =>
                        new Intl.DateTimeFormat(
                            locale,
                            {
                                weekday:
                                    'short',
                            }
                        ).format(
                            date
                        )
                );


            // -------------------------------------------------
            // Values
            // -------------------------------------------------

            const values =
                days.map(
                    (date) => {

                        const value =
                            Number(
                                totalsByDay[
                                    createDateKey(
                                        date
                                    )
                                ]
                            );


                        if (
                            !Number.isFinite(
                                value
                            )
                        ) {

                            return 0;

                        }


                        return Math.max(
                            0,
                            value
                        );

                    }
                );


            // -------------------------------------------------
            // Total
            // -------------------------------------------------

            const total =
                values.reduce(
                    (
                        sum,
                        value
                    ) => {

                        if (
                            !Number.isFinite(
                                value
                            )
                        ) {

                            return sum;

                        }


                        return (
                            sum +
                            Math.max(
                                0,
                                value
                            )
                        );

                    },
                    0
                );


            return {

                categories,

                values,

                total,

            };

        },
        [
            sales,
            i18n.language,
        ]
    );


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
    // Number Formatter
    // =====================================================

    const formatNumber = (
        value
    ) => {

        const number =
            Number(value);


        if (
            !Number.isFinite(
                number
            )
        ) {

            return '0';

        }


        return Math.max(
            0,
            number
        ).toLocaleString(
            i18n.language === 'en'
                ? 'en-US'
                : 'fa-IR'
        );

    };


    // =====================================================
    // Chart Options
    // =====================================================

    const options = useMemo(
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
                 * Disabled to prevent ApexCharts from
                 * generating invalid negative SVG widths
                 * during resize/layout changes.
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
                            ? 0.32
                            : 0.24,

                    opacityTo:
                        0.02,

                    stops: [
                        0,
                        75,
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
                        2,

                    bottom:
                        4,

                    left:
                        2,

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
                        34,

                    offsetY:
                        2,


                    style: {

                        colors:
                            textColor,

                        fontSize:
                            '11px',

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
                        55,

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


                            const safeNumber =
                                Math.max(
                                    0,
                                    number
                                );


                            if (
                                safeNumber >=
                                1000000
                            ) {

                                return `${
                                    (
                                        safeNumber /
                                        1000000
                                    ).toFixed(1)
                                }M`;

                            }


                            if (
                                safeNumber >=
                                1000
                            ) {

                                return `${
                                    (
                                        safeNumber /
                                        1000
                                    ).toFixed(1)
                                }k`;

                            }


                            return Math.round(
                                safeNumber
                            ).toLocaleString(
                                i18n.language === 'en'
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

                },


                y: {

                    formatter:
                        (
                            value
                        ) =>
                            `${formatNumber(
                                value
                            )} ${
                                t(
                                    'common.currency'
                                )
                            }`,

                },

            },


            markers: {

                size:
                    4,

                strokeWidth:
                    2,


                hover: {

                    size:
                        7,

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
                                4,

                            hover: {

                                size:
                                    6,

                            },

                        },


                        xaxis: {

                            labels: {

                                fontSize:
                                    '10px',

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
                                    5,

                            },

                        },


                        grid: {

                            padding: {

                                top:
                                    8,

                                right:
                                    0,

                                bottom:
                                    8,

                                left:
                                    0,

                            },

                        },


                        xaxis: {

                            labels: {

                                rotate:
                                    -25,

                                rotateAlways:
                                    true,

                                fontSize:
                                    '9px',

                                offsetY:
                                    1,

                            },

                        },


                        yaxis: {

                            labels: {

                                minWidth:
                                    36,

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
                                    -30,

                                fontSize:
                                    '8px',

                            },

                        },


                        yaxis: {

                            labels: {

                                style: {

                                    fontSize:
                                        '8px',

                                },

                            },

                        },

                    },

                },

            ],

        }),
        [
            chartData.categories,
            gridColor,
            i18n.language,
            isDark,
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
                            'dashboard.salesChart.series'
                        ),

                    data:
                        chartData.values.map(
                            (value) =>
                                Number.isFinite(
                                    Number(
                                        value
                                    )
                                )
                                    ? Math.max(
                                        0,
                                        Number(
                                            value
                                        )
                                    )
                                    : 0
                        ),

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

                h-full
                min-w-0
                w-full

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
                    mb-4

                    flex
                    flex-col

                    gap-3

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

                            <TrendingUp
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
                                    'dashboard.salesChart.title'
                                )
                            }
                        </h2>

                    </div>


                    <p
                        className="
                            mt-2

                            text-xs
                            leading-5

                            text-[var(--text-muted)]
                        "
                    >
                        {
                            t(
                                'dashboard.salesChart.description'
                            )
                        }
                    </p>

                </div>


                {/* Total */}

                <div
                    className="
                        shrink-0

                        rounded-xl

                        border
                        border-[var(--accent-border)]

                        bg-[var(--accent-soft)]

                        px-4
                        py-2.5

                        sm:min-w-[150px]
                        sm:text-end
                    "
                >

                    <p
                        className="
                            text-[10px]

                            text-[var(--text-muted)]
                        "
                    >
                        {
                            t(
                                'dashboard.salesChart.total'
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

            </div>


            {/* =================================================
                Chart
            ================================================= */}

            <div
                className="
                    h-[290px]
                    w-full
                    min-w-0

                    overflow-hidden

                    sm:h-[320px]
                    lg:h-[340px]
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
                                    'dashboard.salesChart.loading'
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
                                        'dashboard.salesChart.empty'
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
                            key={
                                `${i18n.language}-${isDark}-${chartData.total}-${chartData.values.join(
                                    '-'
                                )}`
                            }

                            options={
                                options
                            }

                            series={
                                series
                            }

                            type="area"

                            height="100%"
                        />

                    </div>

                )}

            </div>

        </section>

    );

}


export default SalesChart;