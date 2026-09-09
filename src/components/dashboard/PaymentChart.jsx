import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import Chart from 'react-apexcharts';

import {
    Banknote,
    CreditCard,
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


    const amount = Number(
        sale.totalAmount ??
        sale.total ??
        sale.amount ??
        sale.finalAmount ??
        sale.payableAmount ??
        sale.grandTotal
    );


    if (Number.isFinite(amount)) {
        return Math.max(0, amount);
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
                    Math.max(0, quantity) *
                    Math.max(0, price)
                );

            },
            0
        );

    }


    return 0;

};


const getSaleDate = (sale) => (
    sale?.date ??
    sale?.createdAt ??
    sale?.updatedAt ??
    null
);


const isToday = (value) => {

    if (!value) {
        return false;
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return false;
    }


    const now =
        new Date();


    return (
        date.getFullYear() ===
            now.getFullYear() &&

        date.getMonth() ===
            now.getMonth() &&

        date.getDate() ===
            now.getDate()
    );

};


const getCssVariable = (
    name,
    fallback
) => {

    if (
        typeof document === 'undefined'
    ) {
        return fallback;
    }


    const value =
        getComputedStyle(
            document.documentElement
        )
            .getPropertyValue(name)
            .trim();


    return value || fallback;

};


// =========================================================
// Payment Chart
// =========================================================

function PaymentChart({
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
                attributeFilter: ['class'],
            }
        );


        return () => {
            observer.disconnect();
        };

    }, []);


    // =====================================================
    // Payment Data
    // =====================================================

    const paymentData = useMemo(
        () => {

            const todaySales =
                Array.isArray(sales)
                    ? sales.filter(
                        (sale) =>
                            isToday(
                                getSaleDate(
                                    sale
                                )
                            )
                    )
                    : [];


            const cash =
                todaySales
                    .filter(
                        (sale) => (
                            sale.paymentType ===
                                'cash' ||
                            sale.paymentType ===
                                'نقدی'
                        )
                    )
                    .reduce(
                        (
                            total,
                            sale
                        ) => (
                            total +
                            getSaleAmount(
                                sale
                            )
                        ),
                        0
                    );


            const credit =
                todaySales
                    .filter(
                        (sale) => (
                            sale.paymentType ===
                                'credit' ||
                            sale.paymentType ===
                                'نسیه'
                        )
                    )
                    .reduce(
                        (
                            total,
                            sale
                        ) => (
                            total +
                            getSaleAmount(
                                sale
                            )
                        ),
                        0
                    );


            return {

                cash:
                    Math.max(
                        0,
                        cash
                    ),

                credit:
                    Math.max(
                        0,
                        credit
                    ),

                total:
                    Math.max(
                        0,
                        cash + credit
                    ),

            };

        },
        [sales]
    );


    const {
        cash:
            cashSales,

        credit:
            creditSales,

        total:
            totalSales,
    } = paymentData;


    // =====================================================
    // Number Formatter
    // =====================================================

    const formatNumber = (value) => (
        Number(value || 0).toLocaleString(
            i18n.language === 'en'
                ? 'en-US'
                : 'fa-IR'
        )
    );


    // =====================================================
    // Theme Tokens
    // =====================================================

    const accentColor =
        getCssVariable(
            '--accent-500',
            isDark
                ? '#10b981'
                : '#059669'
        );


    const secondaryColor =
        getCssVariable(
            '--status-warning',
            isDark
                ? '#f59e0b'
                : '#d97706'
        );


    const textColor =
        getCssVariable(
            '--text-muted',
            isDark
                ? '#94a3b8'
                : '#64748b'
        );


    const valueColor =
        getCssVariable(
            '--text',
            isDark
                ? '#f8fafc'
                : '#0f172a'
        );


    // =====================================================
    // Chart Options
    // =====================================================

    const options = useMemo(
        () => ({

            chart: {

                type:
                    'donut',

                background:
                    'transparent',

                fontFamily:
                    'inherit',

                foreColor:
                    textColor,

                parentHeightOffset:
                    0,

                animations: {
                    enabled: false,
                },

                redrawOnWindowResize:
                    true,

                toolbar: {
                    show: false,
                },

                zoom: {
                    enabled: false,
                },

            },


            labels: [

                t(
                    'dashboard.paymentChart.cash'
                ),

                t(
                    'dashboard.paymentChart.credit'
                ),

            ],


            colors: [
                accentColor,
                secondaryColor,
            ],


            stroke: {
                width: 2,
                colors: [
                    'transparent',
                ],
            },


            dataLabels: {
                enabled: false,
            },


            legend: {
                show: false,
            },


            tooltip: {

                enabled: true,

                theme:
                    isDark
                        ? 'dark'
                        : 'light',

                y: {

                    formatter: (value) => (
                        `${formatNumber(value)} ${
                            t('common.currency')
                        }`
                    ),

                },

            },


            plotOptions: {

                pie: {

                    expandOnClick:
                        true,

                    donut: {

                        size:
                            '72%',

                        labels: {

                            show:
                                true,

                            name: {

                                show:
                                    true,

                                color:
                                    textColor,

                                fontSize:
                                    '11px',

                                fontWeight:
                                    500,

                                offsetY:
                                    -2,

                            },


                            value: {

                                show:
                                    true,

                                color:
                                    valueColor,

                                fontSize:
                                    '19px',

                                fontWeight:
                                    500,

                                offsetY:
                                    3,

                                formatter: (
                                    value
                                ) => (
                                    `${formatNumber(value)} ${
                                        t(
                                            'common.currency'
                                        )
                                    }`
                                ),

                            },


                            total: {

                                show:
                                    true,

                                label:
                                    t(
                                        'dashboard.paymentChart.total'
                                    ),

                                color:
                                    textColor,

                                fontSize:
                                    '11px',

                                formatter:
                                    () => (
                                        `${formatNumber(
                                            totalSales
                                        )} ${
                                            t(
                                                'common.currency'
                                            )
                                        }`
                                    ),

                            },

                        },

                    },

                },

            },


            states: {

                hover: {

                    filter: {
                        type: 'none',
                    },

                },

                active: {

                    filter: {
                        type: 'none',
                    },

                },

            },


            responsive: [

                {

                    breakpoint:
                        768,

                    options: {

                        plotOptions: {

                            pie: {

                                donut: {

                                    size:
                                        '70%',

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
                                220,

                        },

                        plotOptions: {

                            pie: {

                                donut: {

                                    size:
                                        '66%',

                                },

                            },

                        },

                    },

                },

            ],

        }),
        [
            accentColor,
            secondaryColor,
            isDark,
            t,
            textColor,
            totalSales,
            valueColor,
        ]
    );


    // =====================================================
    // Summary Card
    // =====================================================

    const SummaryCard = ({
        icon: Icon,
        title,
        value,
        tone,
    }) => (

        <div
            className="
                min-w-0
                rounded-xl
                border
                border-[var(--border-subtle)]
                bg-[var(--surface-muted)]
                p-3

                transition-all
                duration-200

                hover:border-[var(--border)]
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
                    className={`
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg

                        ${
                            tone === 'accent'
                                ? `
                                    border
                                    border-[var(--accent-border)]
                                    bg-[var(--accent-soft)]
                                    text-[var(--accent-500)]
                                `
                                : `
                                    border
                                    border-amber-500/15
                                    bg-amber-500/[0.07]
                                    text-amber-500
                                    dark:text-amber-400
                                `
                        }
                    `}
                >

                    <Icon
                        size={16}
                        strokeWidth={1.8}
                    />

                </div>


                <div
                    className="
                        min-w-0
                    "
                >

                    <p
                        className="
                            truncate
                            text-[11px]
                            text-[var(--text-muted)]
                        "
                    >
                        {title}
                    </p>


                    <p
                        className="
                            mt-0.5
                            truncate
                            text-sm
                            font-medium
                            text-[var(--text)]
                        "
                    >

                        {formatNumber(
                            value
                        )}

                        {' '}

                        <span
                            className="
                                text-[9px]
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

        </div>

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
                overflow-hidden

                p-4
                sm:p-5
            "
        >

            {/* Header */}

            <div
                className="
                    mb-4
                "
            >

                <h2
                    className="
                        text-base
                        font-semibold
                        tracking-[-0.01em]
                        text-[var(--text)]
                        sm:text-lg
                    "
                >
                    {
                        t(
                            'dashboard.paymentChart.title'
                        )
                    }
                </h2>


                <p
                    className="
                        mt-1
                        text-xs
                        leading-5
                        text-[var(--text-muted)]
                    "
                >
                    {
                        t(
                            'dashboard.paymentChart.description'
                        )
                    }
                </p>

            </div>


            {/* Chart */}

            <div
                className="
                    flex
                    min-w-0
                    items-center
                    justify-center

                    h-[220px]

                    sm:h-[245px]
                "
            >

                {loading ? (

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
                                'dashboard.paymentChart.loading'
                            )
                        }
                    </div>

                ) : totalSales <= 0 ? (

                    <div
                        className="
                            max-w-[15rem]
                            rounded-xl
                            border
                            border-[var(--border-subtle)]
                            bg-[var(--surface-muted)]
                            px-4
                            py-3
                            text-center
                            text-xs
                            leading-5
                            text-[var(--text-muted)]
                        "
                    >
                        {
                            t(
                                'dashboard.paymentChart.empty'
                            )
                        }
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
                                ${isDark}-
                                ${cashSales}-
                                ${creditSales}-
                                ${totalSales}
                            `}
                            options={options}
                            series={[
                                cashSales,
                                creditSales,
                            ]}
                            type="donut"
                            width="100%"
                            height="100%"
                        />

                    </div>

                )}

            </div>


            {/* Summary */}

            <div
                className="
                    mt-3

                    grid
                    grid-cols-1
                    min-[380px]:grid-cols-2

                    gap-2
                    sm:gap-3
                "
            >

                <SummaryCard
                    icon={Banknote}
                    title={t(
                        'dashboard.paymentChart.cash'
                    )}
                    value={cashSales}
                    tone="accent"
                />


                <SummaryCard
                    icon={CreditCard}
                    title={t(
                        'dashboard.paymentChart.credit'
                    )}
                    value={creditSales}
                    tone="warning"
                />

            </div>

        </section>

    );

}


export default PaymentChart;