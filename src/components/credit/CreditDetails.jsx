import {
    X,
    UserRound,
    Phone,
    CalendarDays,
    CreditCard,
    WalletCards,
    CircleDollarSign,
    CheckCircle2,
    Clock3,
    ArrowDownToLine,
    ReceiptText,
    ShoppingBag,
    History,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

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

const normalizeNumber = (
    value
) => {

    const number =
        Number(value);


    return Number.isFinite(
        number
    )
        ? number
        : 0;

};


const getValidDate = (
    value
) => {

    if (!value) {
        return null;
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
        return null;
    }


    return date;

};


// =========================================================
// Credit Date Formatters
// =========================================================

const formatDate = (
    value,
    isEnglish,
    jalaliMonthStyle
) => {

    const date =
        getValidDate(
            value
        );


    if (!date) {
        return '-';
    }


    if (isEnglish) {

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
        '-'
    );

};


const formatDateTime = (
    value,
    isEnglish,
    jalaliMonthStyle
) => {

    const date =
        getValidDate(
            value
        );


    if (!date) {
        return '-';
    }


    if (isEnglish) {

        return new Intl.DateTimeFormat(
            'en-US',
            {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
            }
        ).format(
            date
        );

    }


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


    if (!jalaliDate) {
        return '-';
    }


    const time =
        new Intl.DateTimeFormat(
            'fa-IR',
            {
                hour: '2-digit',
                minute: '2-digit',
            }
        ).format(
            date
        );


    return `${jalaliDate} - ${time}`;

};


// =========================================================
// Credit Details
// =========================================================

const CreditDetails = ({
    customer,
    onClose,
    onPayment,
}) => {

    const {
        t,
        i18n,
    } = useTranslation();


    const isEnglish =
        i18n.language === 'en';


    // =======================================================
    // Jalali Month Style
    // =======================================================

    const [
        jalaliMonthStyle,
        setJalaliMonthStyle,
    ] = useState(
        () =>
            getJalaliMonthStyle()
    );


    // =======================================================
    // Listen For Jalali Month Style Changes
    // =======================================================

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


    // =======================================================
    // Keyboard
    // =======================================================

    useEffect(() => {

        if (!customer) {
            return undefined;
        }


        const handleKeyDown = (
            event
        ) => {

            if (
                event.key ===
                'Escape'
            ) {

                onClose?.();

            }

        };


        document.addEventListener(
            'keydown',
            handleKeyDown
        );


        return () => {

            document.removeEventListener(
                'keydown',
                handleKeyDown
            );

        };

    }, [
        customer,
        onClose,
    ]);


    // =======================================================
    // No Customer
    // =======================================================

    if (!customer) {
        return null;
    }


    // =======================================================
    // Customer
    // =======================================================

    const customerName =
        customer.customerName ||
        customer.name ||
        t(
            'credit.details.defaults.customer'
        );


    const customerPhone =
        customer.phone ||
        customer.customerPhone ||
        '';


    // =======================================================
    // Financial Data
    // =======================================================

    const totalDebt =
        Math.max(
            0,
            normalizeNumber(
                customer.totalDebt
            )
        );


    const paid =
        Math.max(
            0,
            normalizeNumber(
                customer.paid
            )
        );


    const remaining =
        Math.max(
            0,
            normalizeNumber(
                customer.remaining
            )
        );


    const paymentProgress =
        totalDebt > 0
            ? Math.min(
                100,
                Math.round(
                    (paid /
                        totalDebt) *
                    100
                )
            )
            : remaining <= 0
                ? 100
                : 0;


    const status =
        remaining <= 0
            ? 'settled'
            : paid > 0
                ? 'partial'
                : 'debt';


    // =======================================================
    // Status Meta
    // =======================================================

    const statusMeta = {

        settled: {

            label:
                t(
                    'credit.table.status.settled'
                ),

            icon:
                CheckCircle2,

            className:
                `
                    border-emerald-500/15
                    bg-emerald-500/10
                    text-emerald-500
                `,

            accent:
                'bg-emerald-500',

        },


        partial: {

            label:
                t(
                    'credit.table.status.partial'
                ),

            icon:
                Clock3,

            className:
                `
                    border-amber-500/15
                    bg-amber-500/10
                    text-amber-500
                `,

            accent:
                'bg-amber-500',

        },


        debt: {

            label:
                t(
                    'credit.table.status.debt'
                ),

            icon:
                CircleDollarSign,

            className:
                `
                    border-rose-500/15
                    bg-rose-500/10
                    text-rose-500
                `,

            accent:
                'bg-rose-500',

        },

    };


    const currentStatus =
        statusMeta[
            status
        ] ||
        statusMeta.debt;


    const StatusIcon =
        currentStatus.icon;


    // =======================================================
    // Transactions
    // =======================================================

    const creditSales =
        Array.isArray(
            customer.creditSales
        )
            ? customer.creditSales
            : [];


    const payments =
        Array.isArray(
            customer.payments
        )
            ? customer.payments
            : [];


    // =======================================================
    // Last Transaction
    // =======================================================

    const lastTransactionValue =
        customer.lastTransaction ||
        customer.latestCreditSale?.createdAt ||
        customer.latestPayment?.createdAt ||
        null;


    // =======================================================
    // Number Formatter
    // =======================================================

    const formatAmount = (
        value
    ) => {

        return new Intl.NumberFormat(
            isEnglish
                ? 'en-US'
                : 'fa-IR'
        ).format(
            normalizeNumber(
                value
            )
        );

    };


    // =======================================================
    // Render
    // =======================================================

    return (

        <div
            dir={
                isEnglish
                    ? 'ltr'
                    : 'rtl'
            }

            className="
                fixed
                inset-0

                z-[100]

                flex
                items-center
                justify-center

                bg-slate-950/[0.26]
                dark:bg-black/[0.50]

                backdrop-blur-[20px]
                backdrop-saturate-[0.70]

                p-3
                sm:p-5

                animate-[profileBackdropIn_180ms_ease-out]
            "

            onMouseDown={(
                event
            ) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    onClose?.();

                }

            }}

            role="presentation"
        >

            <div
                className="
                    flex

                    max-h-[92vh]

                    w-full
                    max-w-3xl

                    flex-col

                    overflow-hidden

                    rounded-[28px]

                    border
                    border-[var(--border)]

                    bg-[var(--surface)]

                    shadow-[var(--shadow-xl)]

                    animate-[profileModalIn_180ms_ease-out]
                "

                onMouseDown={(
                    event
                ) =>
                    event.stopPropagation()
                }

                role="dialog"

                aria-modal="true"

                aria-labelledby="credit-details-title"
            >

                {/* ===================================================
                    Header
                ==================================================== */}

                <div
                    className="
                        shrink-0

                        relative
                        overflow-hidden

                        border-b
                        border-[var(--border)]

                        bg-[var(--surface)]
                    "
                >

                    <div
                        aria-hidden="true"

                        className="
                            pointer-events-none

                            absolute

                            -top-24
                            -end-20

                            h-48
                            w-48

                            rounded-full

                            bg-amber-500/8

                            blur-3xl
                        "
                    />


                    <div
                        aria-hidden="true"

                        className="
                            pointer-events-none

                            absolute

                            -bottom-28
                            -start-14

                            h-40
                            w-40

                            rounded-full

                            bg-[var(--accent)]/6

                            blur-3xl
                        "
                    />


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
                            relative
                            z-10

                            flex
                            items-start
                            justify-between

                            gap-4

                            px-5
                            py-5

                            sm:px-6
                            sm:py-6
                        "
                    >

                        <div
                            className="
                                flex
                                min-w-0

                                items-center

                                gap-3
                                sm:gap-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-12
                                    w-12

                                    sm:h-14
                                    sm:w-14

                                    shrink-0

                                    items-center
                                    justify-center

                                    rounded-2xl

                                    border
                                    border-[var(--accent)]/15

                                    bg-[var(--accent-soft)]

                                    shadow-[var(--shadow-xs)]
                                "
                            >

                                <UserRound
                                    className="
                                        h-6
                                        w-6

                                        sm:h-7
                                        sm:w-7

                                        text-[var(--accent)]
                                    "
                                />

                            </div>


                            <div
                                className="
                                    min-w-0
                                "
                            >

                                <div
                                    className="
                                        mb-1

                                        flex
                                        flex-wrap

                                        items-center

                                        gap-2
                                    "
                                >

                                    <h2
                                        id="credit-details-title"

                                        className="
                                            truncate

                                            text-lg
                                            sm:text-xl

                                            font-bold

                                            tracking-tight

                                            text-[var(--text)]
                                        "
                                    >
                                        {
                                            customerName
                                        }
                                    </h2>


                                    <span
                                        className={`
                                            inline-flex
                                            items-center

                                            gap-1.5

                                            rounded-full

                                            border

                                            px-2.5
                                            py-1

                                            text-[11px]

                                            font-bold

                                            ${currentStatus.className}
                                        `}
                                    >

                                        <StatusIcon
                                            className="
                                                h-3.5
                                                w-3.5
                                            "
                                        />

                                        {
                                            currentStatus.label
                                        }

                                    </span>

                                </div>


                                <p
                                    className="
                                        text-sm

                                        text-[var(--text-muted)]
                                    "
                                >
                                    {t(
                                        'credit.details.subtitle'
                                    )}
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"

                            onClick={() =>
                                onClose?.()
                            }

                            className="
                                ui-icon-button

                                h-10
                                w-10

                                shrink-0

                                text-[var(--text-muted)]

                                hover:text-[var(--text)]

                                hover:bg-[var(--surface-hover)]
                            "

                            aria-label={
                                t(
                                    'credit.details.footer.close'
                                )
                            }
                        >

                            <X
                                className="
                                    h-5
                                    w-5
                                "
                            />

                        </button>

                    </div>

                </div>


                {/* ===================================================
                    Content
                ==================================================== */}

                <div
                    className="
                        min-h-0
                        flex-1

                        overflow-y-auto

                        main-scrollbar
                    "
                >

                    <div
                        className="
                            space-y-5

                            p-5

                            sm:p-6
                        "
                    >

                        {/* =================================================
                            Customer Information
                        ================================================== */}

                        <section
                            className="
                                relative
                                overflow-hidden

                                rounded-2xl

                                border
                                border-[var(--border)]

                                bg-[var(--surface-muted)]

                                p-4
                                sm:p-5
                            "
                        >

                            <div
                                aria-hidden="true"

                                className="
                                    pointer-events-none

                                    absolute

                                    -end-16
                                    -top-16

                                    h-28
                                    w-28

                                    rounded-full

                                    bg-[var(--accent)]/5

                                    blur-3xl
                                "
                            />


                            <div
                                className="
                                    relative
                                    z-10
                                "
                            >

                                <SectionHeading
                                    icon={
                                        UserRound
                                    }

                                    title={t(
                                        'credit.details.customer.title'
                                    )}
                                />


                                <div
                                    className="
                                        grid

                                        gap-3

                                        sm:grid-cols-2
                                    "
                                >

                                    {/* Name */}

                                    <InfoCard
                                        icon={
                                            UserRound
                                        }

                                        label={t(
                                            'credit.details.customer.name'
                                        )}

                                        value={
                                            customerName
                                        }
                                    />


                                    {/* Phone */}

                                    <InfoCard
                                        icon={
                                            Phone
                                        }

                                        label={t(
                                            'credit.details.customer.phone'
                                        )}

                                        value={
                                            customerPhone ||
                                            '-'
                                        }

                                        dir="ltr"
                                    />


                                    {/* Last Transaction */}

                                    <InfoCard
                                        icon={
                                            CalendarDays
                                        }

                                        label={t(
                                            'credit.details.customer.lastTransaction'
                                        )}

                                        value={
                                            formatDateTime(
                                                lastTransactionValue,
                                                isEnglish,
                                                jalaliMonthStyle
                                            )
                                        }

                                        wide
                                        dir={
                                            isEnglish
                                                ? 'ltr'
                                                : undefined
                                        }
                                    />

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            Financial Summary
                        ================================================== */}

                        <section>

                            <SectionHeading
                                icon={
                                    WalletCards
                                }

                                title={t(
                                    'credit.details.financialSummary.title'
                                )}

                                description={t(
                                    'credit.details.paymentAction.description'
                                )}
                            />


                            <div
                                className="
                                    grid

                                    gap-3

                                    sm:grid-cols-3
                                "
                            >

                                {/* Total */}

                                <MetricCard
                                    tone="neutral"

                                    icon={
                                        CreditCard
                                    }

                                    label={t(
                                        'credit.details.financialSummary.totalDebt'
                                    )}

                                    value={
                                        formatAmount(
                                            totalDebt
                                        )
                                    }

                                    suffix={t(
                                        'common.currency'
                                    )}
                                />


                                {/* Paid */}

                                <MetricCard
                                    tone="success"

                                    icon={
                                        CheckCircle2
                                    }

                                    label={t(
                                        'credit.details.financialSummary.paid'
                                    )}

                                    value={
                                        formatAmount(
                                            paid
                                        )
                                    }

                                    suffix={`${paymentProgress}%`}
                                />


                                {/* Remaining */}

                                <MetricCard
                                    tone={
                                        remaining > 0
                                            ? 'danger'
                                            : 'success'
                                    }

                                    icon={
                                        remaining > 0
                                            ? CircleDollarSign
                                            : CheckCircle2
                                    }

                                    label={t(
                                        'credit.details.financialSummary.remaining'
                                    )}

                                    value={
                                        formatAmount(
                                            remaining
                                        )
                                    }

                                    suffix={
                                        remaining > 0
                                            ? t(
                                                'credit.details.remaining'
                                            )
                                            : t(
                                                'credit.table.status.settled'
                                            )
                                    }
                                />

                            </div>


                            {/* Progress */}

                            <div
                                className="
                                    mt-4

                                    rounded-2xl

                                    border
                                    border-[var(--border)]

                                    bg-[var(--surface-muted)]

                                    p-4
                                "
                            >

                                <div
                                    className="
                                        mb-2

                                        flex
                                        items-center

                                        justify-between

                                        gap-3
                                    "
                                >

                                    <span
                                        className="
                                            text-xs

                                            font-semibold

                                            text-[var(--text-secondary)]
                                        "
                                    >
                                        {t(
                                            'credit.details.paymentProgress'
                                        )}
                                    </span>


                                    <span
                                        dir="ltr"

                                        className="
                                            text-xs

                                            font-bold
                                            number-font

                                            text-[var(--text)]
                                        "
                                    >
                                        {
                                            paymentProgress
                                        }%
                                    </span>

                                </div>


                                <div
                                    className="
                                        h-2.5
                                        w-full

                                        overflow-hidden

                                        rounded-full

                                        bg-[var(--surface)]
                                    "

                                    dir="ltr"
                                >

                                    <div
                                        className={`
                                            h-full

                                            rounded-full

                                            transition-all

                                            duration-500

                                            ${currentStatus.accent}
                                        `}

                                        style={{
                                            width:
                                                `${paymentProgress}%`,
                                        }}
                                    />

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            Credit Sales History
                        ================================================== */}

                        <section>

                            <SectionHeading
                                icon={
                                    ShoppingBag
                                }

                                title={t(
                                    'credit.details.transactions.creditSalesTitle'
                                )}

                                description={t(
                                    'credit.details.transactions.creditSalesDescription'
                                )}
                            />


                            {creditSales.length === 0 ? (

                                <EmptyHistory
                                    icon={
                                        ShoppingBag
                                    }

                                    text={t(
                                        'credit.details.transactions.noCreditSales'
                                    )}
                                />

                            ) : (

                                <div
                                    className="
                                        space-y-2
                                    "
                                >

                                    {creditSales
                                        .slice()
                                        .sort(
                                            (
                                                a,
                                                b
                                            ) =>
                                                new Date(
                                                    b.createdAt ||
                                                    b.date ||
                                                    0
                                                ) -
                                                new Date(
                                                    a.createdAt ||
                                                    a.date ||
                                                    0
                                                )
                                        )
                                        .map(
                                            (
                                                sale,
                                                index
                                            ) => (

                                                <TransactionCard
                                                    key={
                                                        sale.id ||
                                                        `${sale.saleId}-${index}`
                                                    }

                                                    icon={
                                                        ReceiptText
                                                    }

                                                    tone="amber"

                                                    title={t(
                                                        'credit.details.transactions.creditSale'
                                                    )}

                                                    date={formatDateTime(
                                                        sale.createdAt ||
                                                        sale.date,
                                                        isEnglish,
                                                        jalaliMonthStyle
                                                    )}

                                                    amount={formatAmount(
                                                        sale.amount
                                                    )}

                                                    currency={t(
                                                        'common.currency'
                                                    )}
                                                />

                                            )
                                        )}

                                </div>

                            )}

                        </section>


                        {/* =================================================
                            Payments History
                        ================================================== */}

                        <section>

                            <SectionHeading
                                icon={
                                    History
                                }

                                title={t(
                                    'credit.details.transactions.paymentsTitle'
                                )}

                                description={t(
                                    'credit.details.transactions.paymentsDescription'
                                )}
                            />


                            {payments.length === 0 ? (

                                <EmptyHistory
                                    icon={
                                        History
                                    }

                                    text={t(
                                        'credit.details.transactions.noPayments'
                                    )}
                                />

                            ) : (

                                <div
                                    className="
                                        space-y-2
                                    "
                                >

                                    {payments
                                        .slice()
                                        .sort(
                                            (
                                                a,
                                                b
                                            ) =>
                                                new Date(
                                                    b.createdAt ||
                                                    b.date ||
                                                    0
                                                ) -
                                                new Date(
                                                    a.createdAt ||
                                                    a.date ||
                                                    0
                                                )
                                        )
                                        .map(
                                            (
                                                payment,
                                                index
                                            ) => (

                                                <TransactionCard
                                                    key={
                                                        payment.id ||
                                                        `payment-${index}`
                                                    }

                                                    icon={
                                                        ArrowDownToLine
                                                    }

                                                    tone="success"

                                                    title={t(
                                                        'credit.details.transactions.payment'
                                                    )}

                                                    date={formatDateTime(
                                                        payment.date ||
                                                        payment.createdAt,
                                                        isEnglish,
                                                        jalaliMonthStyle
                                                    )}

                                                    amount={formatAmount(
                                                        payment.amount
                                                    )}

                                                    currency={t(
                                                        'common.currency'
                                                    )}

                                                    description={
                                                        payment.description
                                                    }
                                                />

                                            )
                                        )}

                                </div>

                            )}

                        </section>


                        {/* =================================================
                            Payment Action
                        ================================================== */}

                        {remaining > 0 && (

                            <section
                                className="
                                    relative
                                    overflow-hidden

                                    rounded-2xl

                                    border
                                    border-amber-500/15

                                    bg-amber-500/5

                                    p-4
                                    sm:p-5
                                "
                            >

                                <div
                                    aria-hidden="true"

                                    className="
                                        pointer-events-none

                                        absolute

                                        -end-16
                                        -top-16

                                        h-32
                                        w-32

                                        rounded-full

                                        bg-amber-500/8

                                        blur-3xl
                                    "
                                />


                                <div
                                    className="
                                        relative
                                        z-10

                                        flex
                                        flex-col

                                        gap-4

                                        sm:flex-row
                                        sm:items-center
                                        sm:justify-between
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            min-w-0

                                            items-start

                                            gap-3
                                        "
                                    >

                                        <div
                                            className="
                                                flex

                                                h-11
                                                w-11

                                                shrink-0

                                                items-center
                                                justify-center

                                                rounded-xl

                                                border
                                                border-amber-500/10

                                                bg-[var(--surface)]
                                            "
                                        >

                                            <ArrowDownToLine
                                                className="
                                                    h-5
                                                    w-5

                                                    text-amber-500
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

                                                    font-bold

                                                    text-[var(--text)]
                                                "
                                            >
                                                {t(
                                                    'credit.details.paymentAction.title'
                                                )}
                                            </h3>


                                            <p
                                                className="
                                                    mt-1

                                                    text-xs

                                                    leading-5

                                                    text-[var(--text-muted)]
                                                "
                                            >
                                                {t(
                                                    'credit.details.paymentAction.description'
                                                )}
                                            </p>

                                        </div>

                                    </div>


                                    <button
                                        type="button"

                                        onClick={() =>
                                            onPayment?.(
                                                customer
                                            )
                                        }

                                        className="
                                            ui-button-primary

                                            w-full
                                            sm:w-auto

                                            shrink-0

                                            rounded-xl

                                            px-4
                                            py-3
                                        "
                                    >

                                        <ReceiptText
                                            className="
                                                h-4
                                                w-4
                                            "
                                        />

                                        {
                                            t(
                                                'credit.details.paymentAction.button'
                                            )
                                        }

                                    </button>

                                </div>

                            </section>

                        )}


                        {/* =================================================
                            Settled
                        ================================================== */}

                        {remaining <= 0 && (

                            <section
                                className="
                                    relative
                                    overflow-hidden

                                    rounded-2xl

                                    border
                                    border-emerald-500/15

                                    bg-emerald-500/5

                                    p-4
                                "
                            >

                                <div
                                    aria-hidden="true"

                                    className="
                                        pointer-events-none

                                        absolute

                                        -end-12
                                        -top-12

                                        h-28
                                        w-28

                                        rounded-full

                                        bg-emerald-500/8

                                        blur-3xl
                                    "
                                />


                                <div
                                    className="
                                        relative
                                        z-10

                                        flex
                                        items-start

                                        gap-3
                                    "
                                >

                                    <div
                                        className="
                                            flex

                                            h-11
                                            w-11

                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-xl

                                            border
                                            border-emerald-500/10

                                            bg-[var(--surface)]
                                        "
                                    >

                                        <CheckCircle2
                                            className="
                                                h-5
                                                w-5

                                                text-emerald-500
                                            "
                                        />

                                    </div>


                                    <div>

                                        <h3
                                            className="
                                                text-sm

                                                font-bold

                                                text-emerald-500
                                            "
                                        >
                                            {t(
                                                'credit.table.status.settled'
                                            )}
                                        </h3>


                                        <p
                                            className="
                                                mt-1

                                                text-xs

                                                leading-5

                                                text-emerald-500/75
                                            "
                                        >
                                            {t(
                                                'credit.details.settledDescription'
                                            )}
                                        </p>

                                    </div>

                                </div>

                            </section>

                        )}

                    </div>

                </div>


                {/* ===================================================
                    Footer
                ==================================================== */}

                <div
                    className="
                        shrink-0

                        border-t
                        border-[var(--border)]

                        bg-[var(--surface)]

                        px-5
                        py-4

                        sm:px-6
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
                                hidden

                                items-center

                                gap-2

                                text-xs

                                text-[var(--text-muted)]

                                sm:flex
                            "
                        >

                            <CreditCard
                                className="
                                    h-4
                                    w-4
                                "
                            />

                            <span>
                                {t(
                                    'credit.details.footer.recorded'
                                )}
                            </span>

                        </div>


                        <button
                            type="button"

                            onClick={() =>
                                onClose?.()
                            }

                            className="
                                ui-button-secondary

                                w-full
                                sm:w-auto

                                rounded-xl

                                px-5
                                py-3
                            "
                        >
                            {t(
                                'credit.details.footer.close'
                            )}
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

};


// =========================================================
// Section Heading
// =========================================================

function SectionHeading({
    icon: Icon,
    title,
    description,
}) {

    return (

        <div
            className="
                mb-3

                flex
                items-center

                gap-3
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
                    border-[var(--border)]

                    bg-[var(--surface-muted)]
                "
            >

                <Icon
                    className="
                        h-4
                        w-4

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

                        font-bold

                        text-[var(--text)]
                    "
                >
                    {title}
                </h3>


                {description && (

                    <p
                        className="
                            mt-0.5

                            text-xs

                            text-[var(--text-muted)]
                        "
                    >
                        {description}
                    </p>

                )}

            </div>

        </div>

    );

}


// =========================================================
// Info Card
// =========================================================

function InfoCard({
    icon: Icon,
    label,
    value,
    dir,
    wide = false,
}) {

    return (

        <div
            className={`
                rounded-xl

                border
                border-[var(--border)]

                bg-[var(--surface)]

                p-4

                ${
                    wide
                        ? 'sm:col-span-2'
                        : ''
                }
            `}
        >

            <div
                className="
                    mb-2

                    flex
                    items-center

                    gap-2

                    text-[var(--text-muted)]
                "
            >

                <Icon
                    className="
                        h-4
                        w-4
                    "
                />


                <span
                    className="
                        text-xs
                        font-medium
                    "
                >
                    {label}
                </span>

            </div>


            <p
                dir={dir}

                className="
                    text-sm

                    font-bold

                    text-[var(--text)]

                    truncate
                "
            >
                {value}
            </p>

        </div>

    );

}


// =========================================================
// Metric Card
// =========================================================

function MetricCard({
    tone = 'neutral',
    icon: Icon,
    label,
    value,
    suffix,
}) {

    const styles = {

        neutral: {
            wrapper:
                'border-[var(--border)] bg-[var(--surface)]',
            iconBg:
                'bg-[var(--surface-muted)]',
            icon:
                'text-[var(--text-muted)]',
            value:
                'text-[var(--text)]',
            suffix:
                'text-[var(--text-muted)]',
        },

        success: {
            wrapper:
                'border-emerald-500/15 bg-emerald-500/5',
            iconBg:
                'bg-emerald-500/10',
            icon:
                'text-emerald-500',
            value:
                'text-emerald-500',
            suffix:
                'text-emerald-500/70',
        },

        danger: {
            wrapper:
                'border-rose-500/15 bg-rose-500/5',
            iconBg:
                'bg-rose-500/10',
            icon:
                'text-rose-500',
            value:
                'text-rose-500',
            suffix:
                'text-rose-500/70',
        },

    }[
        tone
    ];


    return (

        <div
            className={`
                rounded-2xl

                border

                p-4

                ${styles.wrapper}
            `}
        >

            <div
                className="
                    mb-3

                    flex
                    items-center
                    justify-between

                    gap-2
                "
            >

                <p
                    className="
                        text-xs

                        font-medium

                        text-[var(--text-muted)]
                    "
                >
                    {label}
                </p>


                <div
                    className={`
                        flex

                        h-8
                        w-8

                        shrink-0

                        items-center
                        justify-center

                        rounded-lg

                        ${styles.iconBg}
                    `}
                >

                    <Icon
                        className={`
                            h-4
                            w-4

                            ${styles.icon}
                        `}
                    />

                </div>

            </div>


            <p
                dir="ltr"

                className={`
                    text-lg

                    font-extrabold

                    number-font

                    tracking-tight

                    ${styles.value}
                `}
            >
                {value}
            </p>


            <p
                className={`
                    mt-1

                    text-[11px]

                    ${styles.suffix}
                `}
            >
                {suffix}
            </p>

        </div>

    );

}


// =========================================================
// Transaction Card
// =========================================================

function TransactionCard({
    icon: Icon,
    tone = 'neutral',
    title,
    date,
    amount,
    currency,
    description,
}) {

    const styles = {

        neutral: {
            wrapper:
                'border-[var(--border)] bg-[var(--surface)]',
            iconBg:
                'bg-[var(--surface-muted)]',
            icon:
                'text-[var(--text-muted)]',
            title:
                'text-[var(--text-secondary)]',
            date:
                'text-[var(--text-muted)]',
            amount:
                'text-[var(--text)]',
            currency:
                'text-[var(--text-muted)]',
            description:
                'text-[var(--text-muted)]',
        },

        amber: {
            wrapper:
                'border-amber-500/15 bg-amber-500/5',
            iconBg:
                'bg-amber-500/10',
            icon:
                'text-amber-500',
            title:
                'text-amber-500',
            date:
                'text-[var(--text-muted)]',
            amount:
                'text-amber-500',
            currency:
                'text-amber-500/60',
            description:
                'text-[var(--text-muted)]',
        },

        success: {
            wrapper:
                'border-emerald-500/15 bg-emerald-500/5',
            iconBg:
                'bg-emerald-500/10',
            icon:
                'text-emerald-500',
            title:
                'text-emerald-500',
            date:
                'text-emerald-500/65',
            amount:
                'text-emerald-500',
            currency:
                'text-emerald-500/60',
            description:
                'text-[var(--text-muted)]',
        },

    }[
        tone
    ];


    return (

        <div
            className={`
                rounded-2xl

                border

                p-4

                ${styles.wrapper}
            `}
        >

            <div
                className="
                    flex
                    items-start

                    justify-between

                    gap-3
                "
            >

                <div
                    className="
                        flex
                        min-w-0

                        items-center

                        gap-3
                    "
                >

                    <div
                        className={`
                            flex

                            h-9
                            w-9

                            shrink-0

                            items-center
                            justify-center

                            rounded-xl

                            ${styles.iconBg}
                        `}
                    >

                        <Icon
                            className={`
                                h-4
                                w-4

                                ${styles.icon}
                            `}
                        />

                    </div>


                    <div
                        className="
                            min-w-0
                        "
                    >

                        <p
                            className={`
                                truncate

                                text-xs

                                font-semibold

                                ${styles.title}
                            `}
                        >
                            {title}
                        </p>


                        <p
                            className={`
                                mt-1

                                text-[10px]

                                ${styles.date}
                            `}
                        >
                            {date}
                        </p>


                        {description && (

                            <p
                                className={`
                                    mt-1

                                    text-[10px]

                                    leading-5

                                    ${styles.description}
                                `}
                            >
                                {description}
                            </p>

                        )}

                    </div>

                </div>


                <div
                    className="
                        shrink-0

                        text-end
                    "
                >

                    <p
                        dir="ltr"

                        className={`
                            text-sm

                            font-bold

                            number-font

                            ${styles.amount}
                        `}
                    >
                        {amount}
                    </p>


                    <p
                        className={`
                            mt-1

                            text-[9px]

                            ${styles.currency}
                        `}
                    >
                        {currency}
                    </p>

                </div>

            </div>

        </div>

    );

}


// =========================================================
// Empty History
// =========================================================

function EmptyHistory({
    icon: Icon,
    text,
}) {

    return (

        <div
            className="
                rounded-2xl

                border
                border-dashed
                border-[var(--border)]

                bg-[var(--surface-muted)]

                px-4
                py-8

                text-center
            "
        >

            <div
                className="
                    mx-auto

                    flex

                    h-11
                    w-11

                    items-center
                    justify-center

                    rounded-xl

                    border
                    border-[var(--border)]

                    bg-[var(--surface)]
                "
            >

                <Icon
                    className="
                        h-5
                        w-5

                        text-[var(--text-muted)]
                    "
                />

            </div>


            <p
                className="
                    mt-3

                    text-xs

                    text-[var(--text-muted)]
                "
            >
                {text}
            </p>

        </div>

    );

}


export default CreditDetails;