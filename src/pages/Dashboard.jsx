import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    CreditCard,
    Package,
    ShoppingBasket,
    ShoppingCart,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import {
    initializeDatabase,
    db,
} from '../database/db';

import SalesChart
    from '../components/dashboard/SalesChart';

import PaymentChart
    from '../components/dashboard/PaymentChart';

import ThirtyDaySalesChart
    from '../components/dashboard/ThirtyDaySalesChart';

import MonthlySalesChart
    from '../components/dashboard/MonthlySalesChart';

import QuickActions
    from '../components/dashboard/QuickActions';

import RecentTransactions
    from '../components/dashboard/RecentTransactions';


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


    if (
        Number.isFinite(
            directAmount
        )
    ) {

        return Math.max(
            0,
            directAmount
        );

    }


    if (
        Array.isArray(
            sale.items
        )
    ) {

        return sale.items.reduce(
            (
                total,
                item
            ) => {

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
// Is Today
// =========================================================

const isToday = (
    dateValue
) => {

    if (!dateValue) {
        return false;
    }


    const date =
        new Date(
            dateValue
        );


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


// =========================================================
// Dashboard
// =========================================================

function Dashboard() {

    const {
        t,
        i18n,
    } = useTranslation();


    // =====================================================
    // State
    // =====================================================

    const [
        sales,
        setSales,
    ] = useState([]);


    const [
        productsCount,
        setProductsCount,
    ] = useState(0);


    const [
        shoppingCount,
        setShoppingCount,
    ] = useState(0);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState('');


    // =====================================================
    // Load Dashboard Data
    // =====================================================

    const loadDashboardData =
        useCallback(
            async () => {

                try {

                    setLoading(true);

                    setError('');


                    await initializeDatabase();


                    const [
                        salesData,
                        productCount,
                        shoppingItems,
                    ] =
                        await Promise.all([

                            db.sales
                                .orderBy(
                                    'createdAt'
                                )
                                .reverse()
                                .toArray(),

                            db.products.count(),

                            db.shoppingList
                                .toArray(),

                        ]);


                    setSales(
                        Array.isArray(
                            salesData
                        )
                            ? salesData
                            : []
                    );


                    setProductsCount(
                        Number(
                            productCount
                        ) || 0
                    );


                    setShoppingCount(

                        Array.isArray(
                            shoppingItems
                        )

                            ? shoppingItems.filter(
                                (item) =>
                                    !Boolean(
                                        item.completed
                                    )
                            ).length

                            : 0

                    );

                } catch (
                    dashboardError
                ) {

                    console.error(
                        'Failed to load dashboard data:',
                        dashboardError
                    );


                    setSales([]);

                    setProductsCount(0);

                    setShoppingCount(0);


                    setError(
                        dashboardError?.message ||
                        t(
                            'dashboard.errors.load'
                        )
                    );

                } finally {

                    setLoading(false);

                }

            },
            [
                t,
            ]
        );


    // =====================================================
    // Initial Load
    // =====================================================

    useEffect(() => {

        loadDashboardData();

    }, [
        loadDashboardData,
    ]);


    // =====================================================
    // Refresh Dashboard
    // =====================================================

    useEffect(() => {

        const events = [

            'products-updated',

            'sales-updated',

            'credit-sales-updated',

            'shopping-list-updated',

            'categories-updated',

            'database-updated',

        ];


        events.forEach(
            (eventName) => {

                window.addEventListener(
                    eventName,
                    loadDashboardData
                );

            }
        );


        const handleVisibilityChange =
            () => {

                if (
                    document.visibilityState ===
                    'visible'
                ) {

                    loadDashboardData();

                }

            };


        const handleFocus =
            () => {

                loadDashboardData();

            };


        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange
        );


        window.addEventListener(
            'focus',
            handleFocus
        );


        return () => {

            events.forEach(
                (eventName) => {

                    window.removeEventListener(
                        eventName,
                        loadDashboardData
                    );

                }
            );


            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );


            window.removeEventListener(
                'focus',
                handleFocus
            );

        };

    }, [
        loadDashboardData,
    ]);


    // =====================================================
    // Dashboard Statistics
    // =====================================================

    const dashboardData =
        useMemo(
            () => {

                const todaySales =
                    sales.filter(
                        (sale) =>
                            isToday(
                                getSaleDate(
                                    sale
                                )
                            )
                    );


                const todayTotal =
                    todaySales.reduce(
                        (
                            total,
                            sale
                        ) =>
                            total +
                            getSaleAmount(
                                sale
                            ),
                        0
                    );


                const todayCredit =
                    todaySales
                        .filter(
                            (sale) =>
                                sale.paymentType ===
                                    'credit' ||
                                sale.paymentType ===
                                    'نسیه'
                        )
                        .reduce(
                            (
                                total,
                                sale
                            ) =>
                                total +
                                getSaleAmount(
                                    sale
                                ),
                            0
                        );


                const todayCash =
                    todaySales
                        .filter(
                            (sale) =>
                                sale.paymentType ===
                                    'cash' ||
                                sale.paymentType ===
                                    'نقدی'
                        )
                        .reduce(
                            (
                                total,
                                sale
                            ) =>
                                total +
                                getSaleAmount(
                                    sale
                                ),
                            0
                        );


                return {

                    todayTotal,

                    todayCredit,

                    todayCash,

                    todayTransactions:
                        todaySales.length,

                    productsCount,

                    shoppingCount,

                };

            },
            [
                sales,
                productsCount,
                shoppingCount,
            ]
        );


    // =====================================================
    // Statistics
    // =====================================================

    const stats =
        useMemo(
            () => [

                {
                    id:
                        'today-sales',

                    title:
                        t(
                            'dashboard.stats.todaySales.title'
                        ),

                    value:
                        dashboardData.todayTotal,

                    unit:
                        t(
                            'dashboard.stats.todaySales.unit'
                        ),

                    description:
                        t(
                            'dashboard.stats.todaySales.transactionCount',
                            {
                                count:
                                    dashboardData.todayTransactions,
                            }
                        ),

                    change:
                        dashboardData.todayTransactions > 0
                            ? t(
                                'dashboard.stats.todaySales.active'
                            )
                            : t(
                                'dashboard.stats.todaySales.noSales'
                            ),

                    icon:
                        ShoppingCart,

                    color:
                        'emerald',
                },


                {
                    id:
                        'credit-sales',

                    title:
                        t(
                            'dashboard.stats.creditSales.title'
                        ),

                    value:
                        dashboardData.todayCredit,

                    unit:
                        t(
                            'dashboard.stats.creditSales.unit'
                        ),

                    description:
                        t(
                            'dashboard.stats.creditSales.description'
                        ),

                    change:
                        dashboardData.todayCredit > 0
                            ? t(
                                'dashboard.stats.creditSales.recorded'
                            )
                            : t(
                                'dashboard.stats.creditSales.none'
                            ),

                    icon:
                        CreditCard,

                    color:
                        'amber',
                },


                {
                    id:
                        'products',

                    title:
                        t(
                            'dashboard.stats.products.title'
                        ),

                    value:
                        dashboardData.productsCount,

                    unit:
                        t(
                            'dashboard.stats.products.unit'
                        ),

                    description:
                        t(
                            'dashboard.stats.products.description'
                        ),

                    change:
                        dashboardData.productsCount > 0
                            ? t(
                                'dashboard.stats.products.active'
                            )
                            : t(
                                'dashboard.stats.products.empty'
                            ),

                    icon:
                        Package,

                    color:
                        'violet',
                },


                {
                    id:
                        'shopping-list',

                    title:
                        t(
                            'dashboard.stats.shoppingList.title'
                        ),

                    value:
                        dashboardData.shoppingCount,

                    unit:
                        t(
                            'dashboard.stats.shoppingList.unit'
                        ),

                    description:
                        t(
                            'dashboard.stats.shoppingList.description'
                        ),

                    change:
                        dashboardData.shoppingCount > 0
                            ? t(
                                'dashboard.stats.shoppingList.pending'
                            )
                            : t(
                                'dashboard.stats.shoppingList.completed'
                            ),

                    icon:
                        ShoppingBasket,

                    color:
                        'cyan',
                },

            ],
            [
                t,
                dashboardData,
            ]
        );


    // =====================================================
    // Color Styles
    // =====================================================

    const colorStyles = {

        emerald: {

            iconBg:
                'bg-emerald-500/10',

            iconText:
                'text-emerald-500 dark:text-emerald-400',

            accent:
                'bg-emerald-500',

            glow:
                'group-hover:shadow-emerald-500/10',

        },


        amber: {

            iconBg:
                'bg-amber-500/10',

            iconText:
                'text-amber-500 dark:text-amber-400',

            accent:
                'bg-amber-500',

            glow:
                'group-hover:shadow-amber-500/10',

        },


        violet: {

            iconBg:
                'bg-violet-500/10',

            iconText:
                'text-violet-500 dark:text-violet-400',

            accent:
                'bg-violet-500',

            glow:
                'group-hover:shadow-violet-500/10',

        },


        cyan: {

            iconBg:
                'bg-cyan-500/10',

            iconText:
                'text-cyan-500 dark:text-cyan-400',

            accent:
                'bg-cyan-500',

            glow:
                'group-hover:shadow-cyan-500/10',

        },

    };


    // =====================================================
    // Format Number
    // =====================================================

    const formatNumber = (
        value
    ) => {

        return Number(
            value || 0
        ).toLocaleString(
            i18n.language === 'en'
                ? 'en-US'
                : 'fa-IR'
        );

    };


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            dir={i18n.dir()}

            className="
                w-full
                max-w-none
                min-w-0

                space-y-5

                sm:space-y-6

                pb-2

                text-[var(--text)]
            "
        >

            {/* =================================================
                Page Header
            ================================================= */}

            <section
                className="
                    relative
                    overflow-hidden

                    rounded-2xl

                    border
                    border-[var(--border-subtle)]

                    bg-[var(--surface)]

                    p-4
                    sm:p-5
                    md:p-6

                    shadow-[var(--shadow-sm)]

                    transition-colors
                    duration-300
                "
            >

                {/* Accent glow */}

                <div
                    aria-hidden="true"

                    className="
                        pointer-events-none

                        absolute
                        -start-16
                        -top-20

                        h-48
                        w-48

                        rounded-full

                        bg-[var(--accent-soft-heavy)]

                        blur-3xl
                    "
                />


                <div
                    aria-hidden="true"

                    className="
                        pointer-events-none

                        absolute
                        -end-16
                        -bottom-24

                        h-44
                        w-44

                        rounded-full

                        bg-indigo-500/[0.035]

                        blur-3xl

                        dark:bg-indigo-400/[0.045]
                    "
                />


                <div
                    className="
                        relative
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <span
                            className="
                                h-2
                                w-2

                                rounded-full

                                bg-[var(--accent-500)]

                                shadow-[0_0_12px_var(--accent-glow)]
                            "
                        />


                        <span
                            className="
                                text-[10px]
                                font-medium

                                uppercase
                                tracking-[0.12em]

                                text-[var(--accent-600)]
                            "
                        >
                            Taqwa
                        </span>

                    </div>


                    <h1
                        className="
                            mt-2

                            text-xl
                            font-semibold
                            tracking-[-0.02em]

                            text-[var(--text)]

                            sm:text-2xl
                            lg:text-3xl
                        "
                    >
                        {
                            t(
                                'common.dashboard'
                            )
                        }
                    </h1>


                    <p
                        className="
                            mt-1.5

                            max-w-2xl

                            text-xs
                            leading-5

                            text-[var(--text-muted)]

                            sm:text-sm
                        "
                    >
                        {
                            t(
                                'common.dashboardSubtitle'
                            )
                        }
                    </p>

                </div>

            </section>


            {/* =================================================
                Error
            ================================================= */}

            {error && (

                <div
                    role="alert"

                    className="
                        rounded-2xl

                        border
                        border-red-500/20

                        bg-red-500/[0.06]

                        px-4
                        py-3

                        text-xs
                        leading-5

                        text-[var(--danger)]

                        sm:text-sm
                    "
                >
                    {error}
                </div>

            )}


            {/* =================================================
                Statistics
            ================================================= */}

            <section
                className="
                    grid

                    grid-cols-1

                    min-[420px]:grid-cols-2

                    xl:grid-cols-4

                    gap-3
                    sm:gap-4

                    min-w-0
                "
            >

                {stats.map(
                    (stat) => {

                        const Icon =
                            stat.icon;


                        const styles =
                            colorStyles[
                                stat.color
                            ];


                        return (

                            <article
                                key={
                                    stat.id
                                }

                                className={`
                                    group
                                    relative
                                    min-w-0
                                    overflow-hidden

                                    rounded-2xl

                                    border
                                    border-[var(--border)]

                                    bg-[var(--surface)]

                                    p-4
                                    sm:p-5

                                    shadow-sm

                                    transition-all
                                    duration-300

                                    hover:-translate-y-0.5

                                    hover:border-slate-300
                                    dark:hover:border-slate-700

                                    hover:shadow-lg

                                    ${styles.glow}
                                `}
                            >

                                {/* Accent */}

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

                                        ${styles.accent}
                                    `}
                                />


                                {/* Decorative Glow */}

                                <div
                                    aria-hidden="true"

                                    className="
                                        pointer-events-none

                                        absolute
                                        -right-8
                                        -top-8

                                        h-24
                                        w-24

                                        rounded-full

                                        bg-white/5

                                        blur-2xl

                                        opacity-0

                                        transition-opacity
                                        duration-300

                                        group-hover:opacity-100

                                        dark:bg-white/[0.03]
                                    "
                                />


                                {/* Top */}

                                <div
                                    className="
                                        relative
                                        z-10

                                        flex
                                        items-start
                                        justify-between

                                        gap-3
                                    "
                                >

                                    <div
                                        className={`
                                            flex
                                            h-10
                                            w-10
                                            sm:h-11
                                            sm:w-11

                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-xl

                                            border
                                            border-white/5

                                            ${styles.iconBg}
                                        `}
                                    >

                                        <Icon
                                            size={20}
                                            strokeWidth={1.9}

                                            className={
                                                styles.iconText
                                            }
                                        />

                                    </div>


                                    <span
                                        className="
                                            rounded-md

                                            border
                                            border-[var(--border)]

                                            bg-[var(--surface-muted)]

                                            px-2
                                            py-1

                                            text-[9px]
                                            sm:text-[10px]

                                            font-medium

                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            t(
                                                'common.today'
                                            )
                                        }
                                    </span>

                                </div>


                                {/* Content */}

                                <div
                                    className="
                                        relative
                                        z-10

                                        mt-4
                                        sm:mt-5
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            sm:text-sm

                                            font-medium

                                            text-[var(--text-secondary)]
                                        "
                                    >
                                        {
                                            stat.title
                                        }
                                    </p>


                                    <div
                                        className="
                                            mt-1.5

                                            flex
                                            min-w-0

                                            items-baseline

                                            gap-1.5
                                        "
                                    >

                                        {loading ? (

                                            <div
                                                className="
                                                    h-8
                                                    w-28

                                                    rounded-lg

                                                    bg-[var(--surface-muted)]

                                                    animate-pulse
                                                "
                                            />

                                        ) : (

                                            <>

                                                <h3
                                                    dir="ltr"

                                                    className="
                                                        min-w-0
                                                        truncate

                                                        number-font

                                                        text-2xl
                                                        font-bold

                                                        tracking-tight

                                                        text-[var(--text-primary)]
                                                    "
                                                >
                                                    {
                                                        formatNumber(
                                                            stat.value
                                                        )
                                                    }
                                                </h3>


                                                <span
                                                    className="
                                                        shrink-0

                                                        text-xs
                                                        sm:text-sm

                                                        font-medium

                                                        text-[var(--text-muted)]
                                                    "
                                                >
                                                    {
                                                        stat.unit
                                                    }
                                                </span>

                                            </>

                                        )}

                                    </div>


                                    <p
                                        className="
                                            mt-2.5

                                            min-h-[2.5rem]

                                            text-[10px]
                                            sm:text-[11px]

                                            leading-5

                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            stat.description
                                        }
                                    </p>


                                    <span
                                        className={`
                                            mt-1

                                            inline-block

                                            text-[10px]
                                            sm:text-[11px]

                                            font-medium

                                            ${styles.iconText}
                                        `}
                                    >
                                        {
                                            stat.change
                                        }
                                    </span>

                                </div>


                                {/* Bottom indicator */}

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

                                            w-10

                                            rounded-full

                                            opacity-70

                                            transition-all
                                            duration-500

                                            group-hover:w-20
                                            group-hover:opacity-100

                                            ${styles.accent}
                                        `}
                                    />

                                </div>

                            </article>

                        );

                    }
                )}

            </section>


            {/* =================================================
                Weekly + Payment Charts
            ================================================= */}

            <section
                className="
                    grid

                    grid-cols-1
                    lg:grid-cols-2

                    gap-3
                    sm:gap-4

                    min-w-0

                    items-stretch
                "
            >

                <div
                    className="
                        w-full
                        min-w-0
                    "
                >

                    <SalesChart
                        sales={
                            sales
                        }

                        loading={
                            loading
                        }
                    />

                </div>


                <div
                    className="
                        w-full
                        min-w-0
                    "
                >

                    <PaymentChart
                        sales={
                            sales
                        }

                        loading={
                            loading
                        }
                    />

                </div>

            </section>


            {/* =================================================
                Last 30 Days Sales
            ================================================= */}

            <section
                className="
                    w-full
                    min-w-0
                "
            >

                <ThirtyDaySalesChart
                    sales={
                        sales
                    }

                    loading={
                        loading
                    }
                />

            </section>


            {/* =================================================
                Last 12 Months Sales
            ================================================= */}

            <section
                className="
                    w-full
                    min-w-0
                "
            >

                <MonthlySalesChart
                    sales={
                        sales
                    }

                    loading={
                        loading
                    }
                />

            </section>


            {/* =================================================
                Quick Actions
            ================================================= */}

            <QuickActions />


            {/* =================================================
                Recent Transactions
            ================================================= */}

            <RecentTransactions
                sales={
                    sales
                }

                loading={
                    loading
                }
            />

        </div>

    );

}


export default Dashboard;