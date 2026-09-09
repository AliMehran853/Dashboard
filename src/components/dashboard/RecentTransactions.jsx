import {
    ArrowUpLeft,
    Banknote,
    CreditCard,
    ShoppingCart,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import {
    useNavigate,
} from 'react-router-dom';

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
                    !Number.isFinite(quantity) ||
                    !Number.isFinite(price)
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
// Sale Description
// =========================================================

const getSaleDescription = (
    sale,
    t
) => {

    if (sale?.customerName) {
        return sale.customerName;
    }


    if (sale?.customer?.name) {
        return sale.customer.name;
    }


    if (sale?.customerId) {

        return t(
            'dashboard.recentTransactions.customer'
        );

    }


    if (
        Array.isArray(sale?.items) &&
        sale.items.length > 0
    ) {

        if (sale.items.length === 1) {

            return (
                sale.items[0]?.name ||
                t(
                    'dashboard.recentTransactions.saleDescription'
                )
            );

        }


        return t(
            'dashboard.recentTransactions.itemsCount',
            {
                count:
                    sale.items.length,
            }
        );

    }


    return t(
        'dashboard.recentTransactions.saleDescription'
    );

};


// =========================================================
// Recent Transactions
// =========================================================

function RecentTransactions({
    sales = [],
    loading = false,
}) {

    const navigate =
        useNavigate();


    const {
        t,
        i18n,
    } = useTranslation();


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
    // Listen For Global Jalali Month Style Changes
    // =====================================================

    useEffect(() => {

        const handleJalaliStyleChange = (
            event
        ) => {

            setJalaliMonthStyle(
                event?.detail ||
                getJalaliMonthStyle()
            );

        };


        const handleStorageChange = (
            event
        ) => {

            if (
                event.key ===
                'jalaliMonthStyle'
            ) {

                setJalaliMonthStyle(
                    event.newValue ||
                    getJalaliMonthStyle()
                );

            }

        };


        window.addEventListener(
            'jalali-month-style-changed',
            handleJalaliStyleChange
        );


        window.addEventListener(
            'storage',
            handleStorageChange
        );


        return () => {

            window.removeEventListener(
                'jalali-month-style-changed',
                handleJalaliStyleChange
            );


            window.removeEventListener(
                'storage',
                handleStorageChange
            );

        };

    }, []);


    // =====================================================
    // Recent Sales
    // Dashboard shows only 4 latest transactions
    // =====================================================

    const recentSales =
        Array.isArray(sales)

            ? sales
                .filter(
                    (sale) =>
                        sale &&
                        getSaleDate(sale)
                )
                .slice(
                    0,
                    4
                )

            : [];


    // =====================================================
    // Format Amount
    // =====================================================

    const formatAmount = (
        amount
    ) => {

        return Number(
            amount || 0
        ).toLocaleString(
            i18n.language === 'en'
                ? 'en-US'
                : 'fa-IR'
        );

    };


    // =====================================================
    // Format Date
    // =====================================================

    const formatDate = (
        value
    ) => {

        if (!value) {
            return '';
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return '';

        }


        const isEnglish =
            String(
                i18n.language || ''
            )
                .toLowerCase()
                .startsWith('en');


        // -------------------------------------------------
        // English
        // -------------------------------------------------

        if (isEnglish) {

            return new Intl.DateTimeFormat(
                'en-US',
                {
                    year:
                        'numeric',

                    month:
                        'short',

                    day:
                        'numeric',

                    hour:
                        '2-digit',

                    minute:
                        '2-digit',
                }
            ).format(
                date
            );

        }


        // -------------------------------------------------
        // Persian / Jalali
        // -------------------------------------------------

        const jalaliDate =
            formatJalaliDate(
                date,
                {
                    monthStyle:
                        jalaliMonthStyle,

                    withMonthName:
                        true,
                }
            );


        const time =
            new Intl.DateTimeFormat(
                'fa-IR',
                {
                    hour:
                        '2-digit',

                    minute:
                        '2-digit',
                }
            ).format(
                date
            );


        return `${jalaliDate} - ${time}`;

    };


    // =====================================================
    // Payment Type
    // =====================================================

    const getPaymentType = (
        sale
    ) => {

        const paymentType =
            sale?.paymentType;


        if (
            paymentType === 'credit' ||
            paymentType === 'نسیه'
        ) {

            return t(
                'dashboard.recentTransactions.paymentTypes.credit'
            );

        }


        return t(
            'dashboard.recentTransactions.paymentTypes.cash'
        );

    };


    // =====================================================
    // Transaction Icon
    // =====================================================

    const getTransactionIcon = (
        sale
    ) => {

        if (
            sale?.paymentType === 'credit' ||
            sale?.paymentType === 'نسیه'
        ) {

            return CreditCard;

        }


        return Banknote;

    };


    // =====================================================
    // Transaction Style
    // =====================================================

    const getTransactionStyle = (
        sale
    ) => {

        if (
            sale?.paymentType === 'credit' ||
            sale?.paymentType === 'نسیه'
        ) {

            return {

                wrapper: `
                    border
                    border-amber-500/15
                    bg-amber-500/[0.07]

                    dark:border-amber-400/15
                    dark:bg-amber-400/[0.06]
                `,

                icon: `
                    text-amber-500
                    dark:text-amber-400
                `,

            };

        }


        return {

            wrapper: `
                border
                border-[var(--accent-border)]
                bg-[var(--accent-soft)]
            `,

            icon: `
                text-[var(--accent-500)]
            `,

        };

    };


    // =====================================================
    // Navigation
    // =====================================================

    const handleViewAll = () => {

        navigate(
            '/sales'
        );

    };


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

                p-0
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

                    border-b
                    border-[var(--border-subtle)]

                    p-4

                    sm:flex-row
                    sm:items-center
                    sm:justify-between

                    sm:px-5
                    sm:py-4
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
                                h-1.5
                                w-1.5
                                shrink-0

                                rounded-full

                                bg-[var(--accent-500)]

                                shadow-[0_0_10px_var(--accent-glow)]
                            "
                        />


                        <h2
                            className="
                                truncate

                                text-base
                                font-semibold
                                tracking-[-0.01em]

                                text-[var(--text)]

                                sm:text-lg
                            "
                        >
                            {
                                t(
                                    'dashboard.recentTransactions.title'
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
                                'dashboard.recentTransactions.description'
                            )
                        }
                    </p>

                </div>


                <button
                    type="button"

                    onClick={
                        handleViewAll
                    }

                    className="
                        self-start

                        shrink-0

                        rounded-lg

                        border
                        border-transparent

                        px-2
                        py-1.5

                        text-xs
                        font-medium

                        text-[var(--accent-600)]

                        transition-all
                        duration-200

                        hover:border-[var(--accent-border)]

                        hover:bg-[var(--accent-soft)]

                        sm:self-auto
                    "
                >
                    {
                        t(
                            'dashboard.recentTransactions.viewAll'
                        )
                    }
                </button>

            </div>


            {/* =================================================
                Transactions
            ================================================= */}

            <div
                className="
                    divide-y
                    divide-[var(--border-subtle)]
                "
            >

                {loading ? (

                    <div
                        className="
                            px-5
                            py-12

                            text-center

                            text-xs

                            text-[var(--text-muted)]
                        "
                    >
                        {
                            t(
                                'dashboard.recentTransactions.loading'
                            )
                        }
                    </div>

                ) : recentSales.length === 0 ? (

                    <div
                        className="
                            flex
                            flex-col
                            items-center

                            px-5
                            py-12

                            text-center
                        "
                    >

                        <div
                            className="
                                mb-3

                                flex
                                h-11
                                w-11

                                items-center
                                justify-center

                                rounded-xl

                                border
                                border-[var(--border-subtle)]

                                bg-[var(--surface-muted)]

                                text-[var(--text-soft)]
                            "
                        >

                            <ShoppingCart
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
                                    'dashboard.recentTransactions.empty'
                                )
                            }
                        </p>

                    </div>

                ) : (

                    recentSales.map(
                        (
                            sale,
                            index
                        ) => {

                            const Icon =
                                getTransactionIcon(
                                    sale
                                );


                            const style =
                                getTransactionStyle(
                                    sale
                                );


                            const amount =
                                getSaleAmount(
                                    sale
                                );


                            const date =
                                getSaleDate(
                                    sale
                                );


                            const description =
                                getSaleDescription(
                                    sale,
                                    t
                                );


                            return (

                                <div
                                    key={
                                        sale.id ??
                                        `${date}-${index}`
                                    }

                                    className="
                                        group

                                        flex
                                        min-w-0
                                        items-center

                                        gap-3

                                        px-4
                                        py-3.5

                                        transition-colors
                                        duration-200

                                        hover:bg-[var(--surface-muted)]

                                        sm:gap-4
                                        sm:px-5
                                        sm:py-4
                                    "
                                >

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

                                            transition-transform
                                            duration-200

                                            group-hover:scale-[1.03]

                                            ${style.wrapper}
                                        `}
                                    >

                                        <Icon
                                            size={17}
                                            strokeWidth={1.8}

                                            className={
                                                style.icon
                                            }
                                        />

                                    </div>


                                    {/* Information */}

                                    <div
                                        className="
                                            min-w-0
                                            flex-1
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                min-w-0
                                                items-center
                                                gap-2
                                            "
                                        >

                                            <h3
                                                className="
                                                    min-w-0
                                                    flex-1

                                                    truncate

                                                    text-xs
                                                    font-medium

                                                    text-[var(--text)]

                                                    sm:text-sm
                                                "
                                            >
                                                {
                                                    t(
                                                        'dashboard.recentTransactions.sale.title'
                                                    )
                                                }
                                            </h3>


                                            <span
                                                className="
                                                    hidden
                                                    h-1
                                                    w-1
                                                    shrink-0
                                                    rounded-full
                                                    bg-[var(--text-soft)]

                                                    md:block
                                                "
                                            />


                                            <span
                                                className="
                                                    hidden

                                                    max-w-[12rem]

                                                    truncate

                                                    text-[11px]

                                                    text-[var(--text-muted)]

                                                    md:block
                                                "
                                            >
                                                {
                                                    description
                                                }
                                            </span>

                                        </div>


                                        <div
                                            className="
                                                mt-1.5

                                                flex
                                                min-w-0
                                                items-center

                                                gap-1.5
                                                sm:gap-2
                                            "
                                        >

                                            <span
                                                className="
                                                    min-w-0
                                                    truncate

                                                    text-[10px]
                                                    sm:text-[11px]

                                                    text-[var(--text-soft)]
                                                "
                                            >
                                                {
                                                    formatDate(
                                                        date
                                                    )
                                                }
                                            </span>


                                            <span
                                                className="
                                                    shrink-0

                                                    text-[var(--text-soft)]
                                                "
                                            >
                                                •
                                            </span>


                                            <span
                                                className="
                                                    shrink-0

                                                    text-[10px]
                                                    sm:text-[11px]

                                                    text-[var(--text-muted)]
                                                "
                                            >
                                                {
                                                    getPaymentType(
                                                        sale
                                                    )
                                                }
                                            </span>

                                        </div>

                                    </div>


                                    {/* Amount */}

                                    <div
                                        className="
                                            min-w-[5rem]
                                            shrink-0

                                            text-end
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-end

                                                gap-1
                                            "
                                        >

                                            <p
                                                className="
                                                    whitespace-nowrap

                                                    text-xs
                                                    font-semibold

                                                    text-[var(--text)]

                                                    sm:text-sm
                                                "
                                            >
                                                {
                                                    formatAmount(
                                                        amount
                                                    )
                                                }
                                            </p>


                                            <span
                                                className="
                                                    hidden

                                                    text-[10px]

                                                    text-[var(--text-soft)]

                                                    sm:inline
                                                "
                                            >
                                                {
                                                    t(
                                                        'common.currency'
                                                    )
                                                }
                                            </span>

                                        </div>


                                        <div
                                            className="
                                                mt-1

                                                flex
                                                items-center
                                                justify-end

                                                gap-1
                                            "
                                        >

                                            <ArrowUpLeft
                                                size={10}

                                                className="
                                                    text-[var(--accent-500)]
                                                "
                                            />


                                            <span
                                                className="
                                                    text-[9px]
                                                    sm:text-[10px]

                                                    text-[var(--text-soft)]
                                                "
                                            >
                                                {
                                                    t(
                                                        'common.incoming'
                                                    )
                                                }
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            );

                        }
                    )

                )}

            </div>

        </section>

    );

}


export default RecentTransactions;