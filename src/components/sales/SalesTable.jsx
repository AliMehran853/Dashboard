import {
    useEffect,
    useState,
} from 'react';

import {
    Eye,
    ShoppingBag,
    Loader2,
    Receipt,
    ChevronRight,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import {
    getSales,
} from '../../services/salesService';

import {
    formatJalaliDate,
    getJalaliMonthStyle,
} from '../../utils/date/jalali';


// =========================================================
// Helpers
// =========================================================

const getSaleTotal = (
    sale
) => {

    if (
        sale?.total !== undefined &&
        sale?.total !== null
    ) {

        return Number(
            sale.total
        ) || 0;

    }


    if (
        sale?.totalAmount !== undefined &&
        sale?.totalAmount !== null
    ) {

        return Number(
            sale.totalAmount
        ) || 0;

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
// Sales Table
// =========================================================

function SalesTable({
    filters = {},
    onViewSale,
}) {

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
    // Load Sales
    // =====================================================

    const loadSales = async () => {

        try {

            setLoading(
                true
            );


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
                'Failed to load sales:',
                error
            );


            setSales([]);

        } finally {

            setLoading(
                false
            );

        }

    };


    // =====================================================
    // Initial Load + Database Events
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
    // Listen For Jalali Month Style Changes
    // =====================================================

    useEffect(() => {

        if (
            typeof window ===
            'undefined'
        ) {

            return undefined;

        }


        const handleJalaliMonthStyleChange =
            (
                event
            ) => {

                setJalaliMonthStyle(
                    event?.detail ||
                    getJalaliMonthStyle()
                );

            };


        const handleStorage =
            (
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
    // Filtering
    // =====================================================

    const filteredSales =
        sales.filter(
            (sale) => {

                const search =
                    filters.search
                        ?.trim()
                        .toLowerCase() ||
                    '';


                const paymentType =
                    filters.paymentType ||
                    'all';


                const category =
                    filters.category ||
                    'all';


                // -------------------------------------------------
                // Search
                // -------------------------------------------------

                if (search) {

                    const searchableText = [

                        sale.productName,
                        sale.category,
                        sale.customerName,
                        sale.customerPhone,
                        sale.note,

                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase();


                    if (
                        !searchableText.includes(
                            search
                        )
                    ) {

                        return false;

                    }

                }


                // -------------------------------------------------
                // Payment
                // -------------------------------------------------

                if (
                    paymentType !== 'all' &&
                    sale.paymentType !==
                        paymentType
                ) {

                    return false;

                }


                // -------------------------------------------------
                // Category
                // -------------------------------------------------

                if (
                    category !== 'all' &&
                    sale.category !==
                        category
                ) {

                    return false;

                }


                return true;

            }
        );


    // =====================================================
    // Format Money
    // =====================================================

    const formatMoney = (
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
    // Date Formatter
    // =====================================================

    const formatDate = (
        value
    ) => {

        if (!value) {

            return '-';

        }


        // -------------------------------------------------
        // English
        // -------------------------------------------------

        if (isEnglish) {

            const date =
                new Date(
                    value
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return '-';

            }


            return new Intl.DateTimeFormat(
                'en-US',
                {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
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
                value,
                {
                    monthStyle:
                        jalaliMonthStyle,

                    withMonthName:
                        true,
                }
            ) ||
            '-'
        );

    };


    // =====================================================
    // Time
    // =====================================================

    const formatTime = (
        value
    ) => {

        if (!value) {

            return '';

        }


        const date =
            new Date(
                value
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return '';

        }


        return new Intl.DateTimeFormat(
            isEnglish
                ? 'en-US'
                : 'fa-IR',
            {
                hour: '2-digit',
                minute: '2-digit',
            }
        ).format(
            date
        );

    };


    // =====================================================
    // Loading
    // =====================================================

    if (loading) {

        return (

            <section
                dir={
                    isEnglish
                        ? 'ltr'
                        : 'rtl'
                }

                className="
                    ui-card

                    min-h-64

                    flex
                    items-center
                    justify-center

                    p-6
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
                            h-11
                            w-11

                            items-center
                            justify-center

                            rounded-xl

                            border
                            border-[var(--accent)]/10

                            bg-[var(--accent-soft)]
                        "
                    >

                        <Loader2
                            size={20}

                            className="
                                animate-spin

                                text-[var(--accent)]
                            "
                        />

                    </div>


                    <span
                        className="
                            text-sm

                            text-[var(--text-muted)]
                        "
                    >
                        {t(
                            'sales.table.loading'
                        )}
                    </span>

                </div>

            </section>

        );

    }


    // =====================================================
    // Empty
    // =====================================================

    if (
        filteredSales.length === 0
    ) {

        return (

            <section
                dir={
                    isEnglish
                        ? 'ltr'
                        : 'rtl'
                }

                className="
                    ui-card

                    min-h-64

                    flex
                    flex-col
                    items-center
                    justify-center

                    px-6
                    py-10

                    text-center
                "
            >

                <div
                    className="
                        flex
                        h-14
                        w-14

                        items-center
                        justify-center

                        rounded-2xl

                        border
                        border-[var(--border)]

                        bg-[var(--surface-muted)]

                        mb-4
                    "
                >

                    <Receipt
                        size={24}

                        className="
                            text-[var(--text-muted)]
                        "
                    />

                </div>


                <h3
                    className="
                        text-sm

                        font-semibold

                        text-[var(--text)]
                    "
                >
                    {t(
                        'sales.table.empty.title'
                    )}
                </h3>


                <p
                    className="
                        mt-2

                        max-w-md

                        text-xs
                        leading-5

                        text-[var(--text-muted)]
                    "
                >
                    {t(
                        'sales.table.empty.description'
                    )}
                </p>

            </section>

        );

    }


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
                    relative

                    flex
                    items-center
                    justify-between

                    gap-4

                    px-4
                    sm:px-5
                    lg:px-6

                    py-4
                    sm:py-5

                    border-b
                    border-[var(--border)]

                    bg-[var(--surface)]
                "
            >

                {/* Accent Line */}

                <div
                    aria-hidden="true"

                    className="
                        pointer-events-none

                        absolute

                        inset-x-0
                        top-0

                        h-px

                        bg-[var(--accent)]

                        opacity-20
                    "
                />


                <div
                    className="
                        flex
                        items-center

                        gap-3

                        min-w-0
                    "
                >

                    <div
                        className="
                            flex
                            h-10
                            w-10

                            shrink-0

                            items-center
                            justify-center

                            rounded-xl

                            border
                            border-[var(--accent)]/10

                            bg-[var(--accent-soft)]

                            shadow-[var(--shadow-xs)]
                        "
                    >

                        <ShoppingBag
                            size={17}

                            className="
                                text-[var(--accent)]
                            "
                        />

                    </div>


                    <div
                        className="
                            min-w-0
                        "
                    >

                        <h3
                            className="
                                text-sm
                                sm:text-base

                                font-semibold

                                text-[var(--text)]

                                truncate
                            "
                        >
                            {t(
                                'sales.table.title'
                            )}
                        </h3>


                        <div
                            className="
                                mt-1

                                flex
                                items-center
                                gap-1.5
                            "
                        >

                            <span
                                className="
                                    text-[11px]

                                    font-mono
                                    number-font

                                    text-[var(--text-muted)]
                                "
                            >
                                {
                                    formatNumber(
                                        filteredSales.length
                                    )
                                }
                            </span>


                            <span
                                className="
                                    text-[11px]

                                    text-[var(--text-muted)]
                                "
                            >
                                {t(
                                    'sales.table.salesCount'
                                )}
                            </span>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                Desktop Table
            ================================================= */}

            <div
                className="
                    hidden
                    md:block

                    overflow-x-auto

                    main-scrollbar
                "
            >

                <table
                    className="
                        w-full
                        min-w-[920px]

                        border-collapse
                    "
                >

                    <thead>

                        <tr
                            className="
                                border-b
                                border-[var(--border)]

                                bg-[var(--surface-muted)]

                                text-[11px]

                                text-[var(--text-muted)]
                            "
                        >

                            <th
                                className="
                                    px-5
                                    py-4

                                    font-medium
                                    text-start

                                    whitespace-nowrap
                                "
                            >
                                {t(
                                    'sales.table.columns.product'
                                )}
                            </th>


                            <th
                                className="
                                    px-5
                                    py-4

                                    font-medium
                                    text-start

                                    whitespace-nowrap
                                "
                            >
                                {t(
                                    'sales.table.columns.category'
                                )}
                            </th>


                            <th
                                className="
                                    px-5
                                    py-4

                                    font-medium
                                    text-start

                                    whitespace-nowrap
                                "
                            >
                                {t(
                                    'sales.table.columns.quantity'
                                )}
                            </th>


                            <th
                                className="
                                    px-5
                                    py-4

                                    font-medium
                                    text-start

                                    whitespace-nowrap
                                "
                            >
                                {t(
                                    'sales.table.columns.amount'
                                )}
                            </th>


                            <th
                                className="
                                    px-5
                                    py-4

                                    font-medium
                                    text-start

                                    whitespace-nowrap
                                "
                            >
                                {t(
                                    'sales.table.columns.payment'
                                )}
                            </th>


                            <th
                                className="
                                    px-5
                                    py-4

                                    font-medium
                                    text-start

                                    whitespace-nowrap
                                "
                            >
                                {t(
                                    'sales.table.columns.date'
                                )}
                            </th>


                            <th
                                className="
                                    px-5
                                    py-4

                                    font-medium
                                    text-start

                                    whitespace-nowrap
                                "
                            >
                                {t(
                                    'sales.table.columns.actions'
                                )}
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredSales.map(
                            (
                                sale
                            ) => (

                                <tr
                                    key={
                                        sale.id
                                    }

                                    className="
                                        group

                                        border-b
                                        border-[var(--border)]/70

                                        last:border-b-0

                                        hover:bg-[var(--surface-hover)]

                                        transition-colors
                                        duration-200
                                    "
                                >

                                    {/* Product */}

                                    <td
                                        className="
                                            px-5
                                            py-4
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center

                                                gap-3

                                                min-w-0
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

                                                    rounded-lg

                                                    border
                                                    border-[var(--border-subtle)]

                                                    bg-[var(--surface-muted)]
                                                "
                                            >

                                                <ShoppingBag
                                                    size={16}

                                                    className="
                                                        text-[var(--text-muted)]
                                                    "
                                                />

                                            </div>


                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <p
                                                    className="
                                                        text-sm

                                                        font-medium

                                                        text-[var(--text)]

                                                        truncate
                                                    "
                                                >
                                                    {
                                                        sale.productName ||
                                                        t(
                                                            'sales.table.fallbackProduct'
                                                        )
                                                    }
                                                </p>


                                                {sale.customerName && (

                                                    <p
                                                        className="
                                                            mt-1

                                                            text-[10px]

                                                            text-[var(--text-muted)]

                                                            truncate
                                                        "
                                                    >
                                                        {
                                                            sale.customerName
                                                        }
                                                    </p>

                                                )}

                                            </div>

                                        </div>

                                    </td>


                                    {/* Category */}

                                    <td
                                        className="
                                            px-5
                                            py-4
                                        "
                                    >

                                        <span
                                            className="
                                                inline-flex
                                                max-w-[160px]

                                                items-center

                                                rounded-lg

                                                border
                                                border-[var(--border-subtle)]

                                                bg-[var(--surface-muted)]

                                                px-2.5
                                                py-1

                                                text-[11px]

                                                text-[var(--text-secondary)]

                                                truncate
                                            "
                                        >
                                            {
                                                sale.category ||
                                                '-'
                                            }
                                        </span>

                                    </td>


                                    {/* Quantity */}

                                    <td
                                        className="
                                            px-5
                                            py-4
                                        "
                                    >

                                        <span
                                            className="
                                                text-sm

                                                font-mono
                                                number-font

                                                text-[var(--text-secondary)]
                                            "
                                        >
                                            {
                                                formatNumber(
                                                    sale.quantity
                                                )
                                            }
                                        </span>

                                    </td>


                                    {/* Amount */}

                                    <td
                                        className="
                                            px-5
                                            py-4
                                        "
                                    >

                                        <div>

                                            <p
                                                dir="ltr"

                                                className="
                                                    text-sm

                                                    font-semibold
                                                    number-font

                                                    text-[var(--accent)]

                                                    whitespace-nowrap
                                                "
                                            >

                                                {
                                                    formatMoney(
                                                        getSaleTotal(
                                                            sale
                                                        )
                                                    )
                                                }

                                                {' '}

                                                <span
                                                    className="
                                                        text-[10px]

                                                        font-normal

                                                        text-[var(--text-muted)]
                                                    "
                                                >
                                                    {
                                                        t(
                                                            'common.currency'
                                                        )
                                                    }
                                                </span>

                                            </p>


                                            <p
                                                dir="ltr"

                                                className="
                                                    mt-1

                                                    text-[10px]

                                                    number-font

                                                    text-[var(--text-muted)]
                                                "
                                            >

                                                {
                                                    formatMoney(
                                                        sale.unitPrice
                                                    )
                                                }

                                                {' × '}

                                                {
                                                    formatNumber(
                                                        sale.quantity
                                                    )
                                                }

                                            </p>

                                        </div>

                                    </td>


                                    {/* Payment */}

                                    <td
                                        className="
                                            px-5
                                            py-4
                                        "
                                    >

                                        <span
                                            className={`
                                                inline-flex
                                                items-center

                                                rounded-lg

                                                border

                                                px-2.5
                                                py-1

                                                text-[11px]

                                                font-medium

                                                ${
                                                    sale.paymentType ===
                                                    'credit'

                                                        ? `
                                                            border-amber-500/15
                                                            bg-amber-500/10
                                                            text-amber-500
                                                        `

                                                        : `
                                                            border-cyan-500/15
                                                            bg-cyan-500/10
                                                            text-cyan-500
                                                        `
                                                }
                                            `}
                                        >

                                            {
                                                sale.paymentType ===
                                                'credit'

                                                    ? t(
                                                        'sales.paymentTypes.credit'
                                                    )

                                                    : t(
                                                        'sales.paymentTypes.cash'
                                                    )
                                            }

                                        </span>

                                    </td>


                                    {/* Date */}

                                    <td
                                        className="
                                            px-5
                                            py-4
                                        "
                                    >

                                        <div
                                            className="
                                                min-w-[120px]
                                            "
                                        >

                                            <p
                                                className="
                                                    text-xs

                                                    text-[var(--text-secondary)]

                                                    whitespace-nowrap
                                                "
                                            >
                                                {
                                                    formatDate(
                                                        sale.date ||
                                                        sale.createdAt
                                                    )
                                                }
                                            </p>


                                            <p
                                                className="
                                                    mt-1

                                                    text-[10px]

                                                    font-mono
                                                    number-font

                                                    text-[var(--text-muted)]
                                                "
                                            >
                                                {
                                                    formatTime(
                                                        sale.date ||
                                                        sale.createdAt
                                                    )
                                                }
                                            </p>

                                        </div>

                                    </td>


                                    {/* Action */}

                                    <td
                                        className="
                                            px-5
                                            py-4
                                        "
                                    >

                                        <button
                                            type="button"

                                            onClick={() =>
                                                onViewSale?.(
                                                    sale
                                                )
                                            }

                                            aria-label={
                                                t(
                                                    'sales.table.viewDetails'
                                                )
                                            }

                                            title={
                                                t(
                                                    'sales.table.viewDetails'
                                                )
                                            }

                                            className="
                                                ui-icon-button

                                                h-9
                                                w-9

                                                text-[var(--text-muted)]

                                                hover:border-[var(--accent)]/20

                                                hover:bg-[var(--accent-soft)]

                                                hover:text-[var(--accent)]
                                            "
                                        >

                                            <Eye
                                                size={17}
                                            />

                                        </button>

                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>


            {/* =================================================
                Mobile
            ================================================= */}

            <div
                className="
                    md:hidden

                    divide-y
                    divide-[var(--border)]

                    bg-[var(--surface)]
                "
            >

                {filteredSales.map(
                    (
                        sale
                    ) => (

                        <article
                            key={
                                sale.id
                            }

                            className="
                                relative

                                p-4

                                hover:bg-[var(--surface-hover)]

                                transition-colors
                                duration-200
                            "
                        >

                            {/* =================================================
                                Product Header
                            ================================================= */}

                            <div
                                className="
                                    flex
                                    items-start
                                    justify-between

                                    gap-3

                                    min-w-0
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center

                                        gap-3

                                        min-w-0
                                        flex-1
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            h-10
                                            w-10

                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-xl

                                            border
                                            border-[var(--accent)]/10

                                            bg-[var(--accent-soft)]
                                        "
                                    >

                                        <ShoppingBag
                                            size={17}

                                            className="
                                                text-[var(--accent)]
                                            "
                                        />

                                    </div>


                                    <div
                                        className="
                                            min-w-0
                                            flex-1
                                        "
                                    >

                                        <p
                                            className="
                                                text-sm

                                                font-semibold

                                                text-[var(--text)]

                                                truncate
                                            "
                                        >
                                            {
                                                sale.productName ||
                                                t(
                                                    'sales.table.fallbackProduct'
                                                )
                                            }
                                        </p>


                                        <div
                                            className="
                                                mt-1

                                                flex
                                                items-center
                                                gap-1.5

                                                min-w-0
                                            "
                                        >

                                            <span
                                                className="
                                                    text-[11px]

                                                    text-[var(--text-muted)]

                                                    truncate
                                                "
                                            >
                                                {
                                                    sale.category ||
                                                    '-'
                                                }
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                {/* View */}

                                <button
                                    type="button"

                                    onClick={() =>
                                        onViewSale?.(
                                            sale
                                        )
                                    }

                                    aria-label={
                                        t(
                                            'sales.table.viewDetails'
                                        )
                                    }

                                    className="
                                        ui-icon-button

                                        h-9
                                        w-9

                                        shrink-0

                                        text-[var(--text-muted)]

                                        hover:border-[var(--accent)]/20

                                        hover:bg-[var(--accent-soft)]

                                        hover:text-[var(--accent)]
                                    "
                                >

                                    <Eye
                                        size={17}
                                    />

                                </button>

                            </div>


                            {/* =================================================
                                Amount Highlight
                            ================================================= */}

                            <div
                                className="
                                    mt-4

                                    rounded-xl

                                    border
                                    border-[var(--accent)]/10

                                    bg-[var(--accent-soft)]

                                    px-3
                                    py-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between

                                        gap-3
                                    "
                                >

                                    <div
                                        className="
                                            min-w-0
                                        "
                                    >

                                        <p
                                            className="
                                                text-[10px]

                                                text-[var(--text-muted)]
                                            "
                                        >
                                            {t(
                                                'sales.table.columns.amount'
                                            )}
                                        </p>


                                        <p
                                            dir="ltr"

                                            className="
                                                mt-1

                                                text-lg

                                                font-bold
                                                number-font

                                                text-[var(--accent)]

                                                truncate
                                            "
                                        >

                                            {
                                                formatMoney(
                                                    getSaleTotal(
                                                        sale
                                                    )
                                                )
                                            }

                                            <span
                                                className="
                                                    ms-1

                                                    text-[10px]

                                                    font-normal

                                                    text-[var(--text-muted)]
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
                                            shrink-0

                                            text-end
                                        "
                                    >

                                        <span
                                            className={`
                                                inline-flex

                                                rounded-lg

                                                border

                                                px-2.5
                                                py-1.5

                                                text-[10px]

                                                font-medium

                                                ${
                                                    sale.paymentType ===
                                                    'credit'

                                                        ? `
                                                            border-amber-500/15
                                                            bg-amber-500/10
                                                            text-amber-500
                                                        `

                                                        : `
                                                            border-cyan-500/15
                                                            bg-cyan-500/10
                                                            text-cyan-500
                                                        `
                                                }
                                            `}
                                        >
                                            {
                                                sale.paymentType ===
                                                'credit'

                                                    ? t(
                                                        'sales.paymentTypes.credit'
                                                    )

                                                    : t(
                                                        'sales.paymentTypes.cash'
                                                    )
                                            }
                                        </span>

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                Mobile Information
                            ================================================= */}

                            <div
                                className="
                                    mt-3

                                    rounded-xl

                                    border
                                    border-[var(--border)]

                                    bg-[var(--surface-muted)]

                                    p-3
                                "
                            >

                                {/* Quantity + Unit Price */}

                                <div
                                    className="
                                        grid
                                        grid-cols-2

                                        gap-3
                                    "
                                >

                                    <InfoItem
                                        label={t(
                                            'sales.table.columns.quantity'
                                        )}

                                        value={
                                            formatNumber(
                                                sale.quantity
                                            )
                                        }
                                    />


                                    <InfoItem
                                        align="end"

                                        label={t(
                                            'sales.form.fields.unitPrice'
                                        )}

                                        value={`${formatMoney(
                                            sale.unitPrice
                                        )} ${t(
                                            'common.currency'
                                        )}`}
                                    />

                                </div>


                                <div
                                    className="
                                        my-3

                                        h-px

                                        bg-[var(--border)]
                                    "
                                />


                                {/* Date + Time */}

                                <div
                                    className="
                                        grid
                                        grid-cols-2

                                        gap-3
                                    "
                                >

                                    <InfoItem
                                        label={t(
                                            'sales.table.columns.date'
                                        )}

                                        value={
                                            formatDate(
                                                sale.date ||
                                                sale.createdAt
                                            )
                                        }
                                    />


                                    <InfoItem
                                        align="end"

                                        label={t(
                                            'sales.table.columns.date'
                                        )}

                                        value={
                                            formatTime(
                                                sale.date ||
                                                sale.createdAt
                                            )
                                        }
                                    />

                                </div>


                                {sale.customerName && (

                                    <>
                                        <div
                                            className="
                                                my-3

                                                h-px

                                                bg-[var(--border)]
                                            "
                                        />

                                        <InfoItem
                                            label={t(
                                                'sales.details.customer.name'
                                            )}

                                            value={
                                                sale.customerName
                                            }
                                        />
                                    </>

                                )}

                            </div>

                        </article>

                    )
                )}

            </div>

        </section>

    );

}


// =========================================================
// Info Item
// =========================================================

function InfoItem({
    label,
    value,

    align = 'start',

    valueClass = `
        text-[var(--text-secondary)]
    `,
}) {

    return (

        <div
            className={`
                min-w-0

                ${
                    align === 'end'
                        ? 'text-end'
                        : 'text-start'
                }
            `}
        >

            <p
                className="
                    mb-1

                    text-[10px]

                    text-[var(--text-muted)]

                    truncate
                "
            >
                {label}
            </p>


            <p
                className={`
                    text-xs

                    font-medium

                    truncate

                    ${valueClass}
                `}
            >
                {value}
            </p>

        </div>

    );

}


export default SalesTable;