import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import Chart from 'react-apexcharts';

import {
    useTranslation,
} from 'react-i18next';

import {
    getSales,
} from '../../services/salesService';


// =========================================================
// Helpers
// =========================================================

const getSaleDate = (
    sale
) => {

    return (
        sale?.date ||
        sale?.createdAt ||
        null
    );

};


const getSaleTotal = (
    sale
) => {

    if (
        sale?.total !== undefined &&
        sale?.total !== null
    ) {

        const total =
            Number(
                sale.total
            );


        if (
            Number.isFinite(
                total
            )
        ) {

            return total;

        }

    }


    if (
        sale?.totalAmount !== undefined &&
        sale?.totalAmount !== null
    ) {

        const totalAmount =
            Number(
                sale.totalAmount
            );


        if (
            Number.isFinite(
                totalAmount
            )
        ) {

            return totalAmount;

        }

    }


    return (
        Number(
            sale?.quantity || 0
        ) *
        Number(
            sale?.unitPrice || 0
        )
    );

};


// =========================================================
// Sales Chart
// =========================================================

function SalesChart() {

    const {
        t,
        i18n,
    } = useTranslation();


    const isEnglish =
        i18n.language === 'en';


    // =====================================================
    // Data
    // =====================================================

    const [
        sales,
        setSales,
    ] = useState([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


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
    // Load Sales
    // =====================================================

    const loadSales = async () => {

        try {

            setLoading(true);


            const result =
                await getSales();


            setSales(
                Array.isArray(
                    result
                )
                    ? result
                    : []
            );

        } catch (error) {

            console.error(
                'Failed to load sales chart data:',
                error
            );


            setSales([]);

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // Initial Load + Events
    // =====================================================

    useEffect(() => {

        loadSales();


        const handleSalesUpdated = () => {
            loadSales();
        };


        const handleDatabaseUpdated = () => {
            loadSales();
        };


        window.addEventListener(
            'sales-updated',
            handleSalesUpdated
        );


        window.addEventListener(
            'database-updated',
            handleDatabaseUpdated
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

        };

    }, []);


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
    // Last Seven Days
    // =====================================================

    const lastSevenDays =
        useMemo(() => {

            const today =
                new Date();


            today.setHours(
                0,
                0,
                0,
                0
            );


            const result = [];


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


                result.push(
                    date
                );

            }


            return result;

        }, []);


    // =====================================================
    // Chart Data
    // =====================================================

    const chartData =
        useMemo(() => {

            const cashData = [];
            const creditData = [];
            const categories = [];


            lastSevenDays.forEach(
                (day) => {

                    let cashTotal = 0;
                    let creditTotal = 0;


                    sales.forEach(
                        (sale) => {

                            const rawDate =
                                getSaleDate(
                                    sale
                                );


                            if (!rawDate) {
                                return;
                            }


                            const saleDate =
                                new Date(
                                    rawDate
                                );


                            if (
                                Number.isNaN(
                                    saleDate.getTime()
                                )
                            ) {
                                return;
                            }


                            if (
                                saleDate.getFullYear() !==
                                day.getFullYear()
                            ) {
                                return;
                            }


                            if (
                                saleDate.getMonth() !==
                                day.getMonth()
                            ) {
                                return;
                            }


                            if (
                                saleDate.getDate() !==
                                day.getDate()
                            ) {
                                return;
                            }


                            const total =
                                getSaleTotal(
                                    sale
                                );


                            if (
                                sale.paymentType ===
                                'credit'
                            ) {

                                creditTotal +=
                                    total;

                            } else {

                                cashTotal +=
                                    total;

                            }

                        }
                    );


                    cashData.push(
                        cashTotal
                    );


                    creditData.push(
                        creditTotal
                    );


                    categories.push(
                        new Intl.DateTimeFormat(
                            isEnglish
                                ? 'en-US'
                                : 'fa-IR-u-ca-persian',
                            {
                                weekday:
                                    'short',
                            }
                        ).format(
                            day
                        )
                    );

                }
            );


            return {
                categories,
                cashData,
                creditData,
            };

        }, [
            sales,
            lastSevenDays,
            isEnglish,
        ]);


    // =====================================================
    // Total
    // =====================================================

    const totalSales =
        useMemo(() => {

            return (
                chartData.cashData.reduce(
                    (
                        total,
                        value
                    ) =>
                        total + value,
                    0
                ) +

                chartData.creditData.reduce(
                    (
                        total,
                        value
                    ) =>
                        total + value,
                    0
                )
            );

        }, [
            chartData,
        ]);


    // =====================================================
    // Number Formatter
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
    // Theme
    // =====================================================

    const theme =
        useMemo(() => {

            return isDark
                ? {
                    colors: [
                        '#10b981',
                        '#f59e0b',
                    ],

                    text:
                        '#cbd5e1',

                    muted:
                        '#64748b',

                    grid:
                        '#1e293b',

                    tooltip:
                        'dark',
                }

                : {
                    colors: [
                        '#059669',
                        '#d97706',
                    ],

                    text:
                        '#334155',

                    muted:
                        '#64748b',

                    grid:
                        '#e2e8f0',

                    tooltip:
                        'light',
                };

        }, [
            isDark,
        ]);


    // =====================================================
    // Series
    // =====================================================

    const series =
        useMemo(
            () => [

                {
                    name:
                        t(
                            'sales.chart.cashSales'
                        ),

                    data:
                        chartData.cashData,
                },


                {
                    name:
                        t(
                            'sales.chart.creditSales'
                        ),

                    data:
                        chartData.creditData,
                },

            ],
            [
                chartData,
                t,
                i18n.language,
            ]
        );


    // =====================================================
    // Chart Options
    // =====================================================

    const options =
        useMemo(
            () => ({

                chart: {

                    type: 'area',

                    background:
                        'transparent',

                    toolbar: {
                        show: false,
                    },

                    zoom: {
                        enabled: false,
                    },

                    fontFamily:
                        'inherit',

                    foreColor:
                        theme.text,

                    // Keep chart geometry stable.
                    // This also prevents the ApexCharts
                    // negative-width animation issue.
                    animations: {
                        enabled: false,
                    },

                    redrawOnWindowResize:
                        true,

                    redrawOnParentResize:
                        false,

                },


                colors:
                    theme.colors,


                stroke: {

                    curve:
                        'smooth',

                    width:
                        2.5,

                },


                fill: {

                    type:
                        'gradient',

                    gradient: {

                        shadeIntensity:
                            1,

                        opacityFrom:
                            0.25,

                        opacityTo:
                            0.02,

                        stops: [
                            0,
                            100,
                        ],

                    },

                },


                dataLabels: {
                    enabled: false,
                },


                grid: {

                    borderColor:
                        theme.grid,

                    strokeDashArray:
                        4,

                    padding: {
                        left: 5,
                        right: 5,
                    },

                },


                xaxis: {

                    categories:
                        chartData.categories,

                    labels: {

                        style: {

                            colors:
                                Array(
                                    chartData
                                        .categories
                                        .length
                                ).fill(
                                    theme.muted
                                ),

                            fontSize:
                                '11px',

                        },

                        rotate:
                            typeof window !==
                            'undefined' &&
                            window.innerWidth < 640

                                ? -35

                                : 0,

                        hideOverlappingLabels:
                            true,

                    },

                    axisBorder: {
                        show: false,
                    },

                    axisTicks: {
                        show: false,
                    },

                },


                yaxis: {

                    labels: {

                        style: {

                            colors: [
                                theme.muted,
                            ],

                            fontSize:
                                '11px',

                        },

                        formatter:
                            (value) => {

                                if (
                                    value >=
                                    1000000
                                ) {

                                    return `${(
                                        value /
                                        1000000
                                    ).toFixed(1)}M`;

                                }


                                if (
                                    value >=
                                    1000
                                ) {

                                    return `${Math.round(
                                        value /
                                        1000
                                    )}k`;

                                }


                                return Math.round(
                                    value
                                );

                            },

                    },

                },


                tooltip: {

                    theme:
                        theme.tooltip,

                    shared:
                        true,

                    intersect:
                        false,

                    y: {

                        formatter:
                            (value) => {

                                return `${formatNumber(
                                    value
                                )} ${t(
                                    'common.currency'
                                )}`;

                            },

                    },

                },


                legend: {

                    show:
                        true,

                    position:
                        'top',

                    horizontalAlign:
                        isEnglish
                            ? 'left'
                            : 'right',

                    fontSize:
                        '12px',

                    labels: {

                        colors:
                            theme.text,

                    },

                    markers: {

                        width:
                            8,

                        height:
                            8,

                        radius:
                            12,

                    },

                    itemMargin: {

                        horizontal:
                            10,

                    },

                },


                markers: {

                    size:
                        0,

                    hover: {
                        size:
                            5,
                    },

                },


                responsive: [

                    {

                        breakpoint:
                            768,

                        options: {

                            chart: {
                                height: 280,
                            },

                            legend: {

                                position:
                                    'bottom',

                                horizontalAlign:
                                    'center',

                            },

                            xaxis: {

                                labels: {

                                    rotate:
                                        -35,

                                    style: {

                                        fontSize:
                                            '10px',

                                    },

                                },

                            },

                        },

                    },


                    {

                        breakpoint:
                            480,

                        options: {

                            chart: {

                                height:
                                    250,

                            },

                            legend: {

                                fontSize:
                                    '10px',

                            },

                            yaxis: {

                                labels: {
                                    show: false,
                                },

                            },

                        },

                    },

                ],

            }),
            [
                chartData.categories,
                formatNumber,
                isEnglish,
                t,
                theme,
            ]
        );


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
                ui-card

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

                    sm:flex-row

                    sm:items-center
                    sm:justify-between

                    gap-3

                    mb-4
                    sm:mb-5
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
                            gap-2
                        "
                    >

                        <div
                            className="
                                flex
                                h-8
                                w-8

                                shrink-0

                                items-center
                                justify-center

                                rounded-lg

                                bg-[var(--accent-soft)]

                                border
                                border-[var(--accent)]/10
                            "
                        >

                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="
                                    text-[var(--accent)]
                                "
                            >
                                <polyline
                                    points="23 6 13.5 15.5 8.5 10.5 1 18"
                                />

                                <polyline
                                    points="17 6 23 6 23 12"
                                />
                            </svg>

                        </div>


                        <h2
                            className="
                                text-base
                                sm:text-lg

                                font-semibold

                                text-[var(--text)]
                            "
                        >
                            {t(
                                'sales.chart.title'
                            )}
                        </h2>

                    </div>


                    <p
                        className="
                            mt-1

                            text-xs

                            text-[var(--text-muted)]
                        "
                    >
                        {t(
                            'sales.chart.description'
                        )}
                    </p>

                </div>


                <div
                    className="
                        self-start
                        sm:self-auto

                        shrink-0

                        rounded-xl

                        border
                        border-[var(--border)]

                        bg-[var(--surface-muted)]

                        px-3
                        py-1.5

                        text-xs
                        font-medium

                        text-[var(--text-secondary)]
                    "
                >
                    {t(
                        'sales.chart.thisWeek'
                    )}
                </div>

            </div>


            {/* =================================================
                Loading
            ================================================= */}

            {loading && (

                <div
                    className="
                        h-[240px]
                        sm:h-[300px]
                        md:h-[320px]

                        flex
                        items-center
                        justify-center
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-10
                                w-10

                                items-center
                                justify-center

                                rounded-xl

                                bg-[var(--accent-soft)]
                            "
                        >

                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="
                                    animate-spin

                                    text-[var(--accent)]
                                "
                            >
                                <path
                                    d="M21 12a9 9 0 1 1-6.17-8.56"
                                />
                            </svg>

                        </div>


                        <span
                            className="
                                text-sm

                                text-[var(--text-muted)]
                            "
                        >
                            {t(
                                'sales.chart.loading'
                            )}
                        </span>

                    </div>

                </div>

            )}


            {/* =================================================
                Empty
            ================================================= */}

            {!loading &&
                totalSales <= 0 && (

                    <div
                        className="
                            h-[240px]
                            sm:h-[300px]
                            md:h-[320px]

                            flex
                            flex-col
                            items-center
                            justify-center

                            text-center
                        "
                    >

                        <div
                            className="
                                flex
                                h-12
                                w-12

                                items-center
                                justify-center

                                rounded-xl

                                border
                                border-[var(--border)]

                                bg-[var(--surface-muted)]

                                mb-3
                            "
                        >

                            <TrendingUpPlaceholder />

                        </div>


                        <p
                            className="
                                text-sm
                                font-medium

                                text-[var(--text-secondary)]
                            "
                        >
                            {t(
                                'sales.chart.empty'
                            )}
                        </p>

                    </div>

                )}


            {/* =================================================
                Chart
            ================================================= */}

            {!loading &&
                totalSales > 0 && (

                    <div
                        className="
                            w-full
                            min-w-0

                            h-[240px]
                            sm:h-[300px]
                            md:h-[320px]

                            overflow-hidden
                        "
                    >

                        <Chart
                            key={`${i18n.language}-${isDark}-${sales.length}`}

                            options={
                                options
                            }

                            series={
                                series
                            }

                            type="area"

                            height="100%"
                            width="100%"
                        />

                    </div>

                )}

        </section>

    );

}


// =========================================================
// Empty Icon
// =========================================================

function TrendingUpPlaceholder() {

    return (

        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="
                text-[var(--text-muted)]
            "
        >

            <polyline
                points="23 6 13.5 15.5 8.5 10.5 1 18"
            />

            <polyline
                points="17 6 23 6 23 12"
            />

        </svg>

    );

}


export default SalesChart;