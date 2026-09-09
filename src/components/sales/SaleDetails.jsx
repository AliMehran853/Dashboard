import {
    X,
    Package,
    Tag,
    Hash,
    DollarSign,
    User,
    Phone,
    CalendarDays,
    Banknote,
    CreditCard,
    FileText,
    Receipt,
    CheckCircle2,
    Clock3,
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
// Number Helpers
// =========================================================

const normalizeNumber = (
    value
) => {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

};


// =========================================================
// Date Helper
// =========================================================

const getValidDate = (
    value
) => {

    if (!value) {
        return null;
    }

    const date =
        new Date(value);

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
// Sale Details
// =========================================================

function SaleDetails({
    sale,
    onClose,
}) {

    const {
        t,
        i18n,
    } = useTranslation();


    const isEnglish =
        i18n.language === 'en';


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
    // No Sale
    // =====================================================

    if (!sale) {
        return null;
    }


    // =====================================================
    // Payment
    // =====================================================

    const paymentType =
        sale.paymentType === 'credit'
            ? 'credit'
            : 'cash';


    const isCash =
        paymentType === 'cash';


    // =====================================================
    // Amount
    // =====================================================

    const amount =
        sale.total !== undefined &&
        sale.total !== null

            ? normalizeNumber(
                sale.total
            )

            : (
                normalizeNumber(
                    sale.quantity
                ) *
                normalizeNumber(
                    sale.unitPrice
                )
            );


    // =====================================================
    // Quantity
    // =====================================================

    const quantity =
        normalizeNumber(
            sale.quantity
        );


    // =====================================================
    // Unit Price
    // =====================================================

    const unitPrice =
        sale.unitPrice !== undefined &&
        sale.unitPrice !== null

            ? normalizeNumber(
                sale.unitPrice
            )

            : (
                quantity > 0
                    ? amount / quantity
                    : 0
            );


    // =====================================================
    // Sale ID
    // =====================================================

    const saleId =
        sale.id !== undefined &&
        sale.id !== null

            ? String(
                sale.id
            )

            : '-';


    // =====================================================
    // Date
    // =====================================================

    const rawDate =
        sale.date ||
        sale.createdAt;


    const dateObject =
        getValidDate(
            rawDate
        );


    const saleDate =
        dateObject

            ? (
                isEnglish

                    ? new Intl.DateTimeFormat(
                        'en-US',
                        {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                        }
                    ).format(
                        dateObject
                    )

                    : (
                        formatJalaliDate(
                            dateObject,
                            {
                                monthStyle:
                                    jalaliMonthStyle,

                                withMonthName:
                                    true,
                            }
                        ) ||
                        '-'
                    )
            )

            : '-';


    // =====================================================
    // Time
    // =====================================================

    const saleTime =
        dateObject

            ? new Intl.DateTimeFormat(
                isEnglish
                    ? 'en-US'
                    : 'fa-IR',
                {
                    hour: '2-digit',
                    minute: '2-digit',
                }
            ).format(
                dateObject
            )

            : '-';


    // =====================================================
    // Product
    // =====================================================

    const productName =
        sale.productName?.trim() ||
        '-';


    const category =
        sale.category?.trim() ||
        '-';


    // =====================================================
    // Customer
    // =====================================================

    const customerName =
        sale.customerName?.trim() ||
        '-';


    const customerPhone =
        sale.customerPhone?.trim() ||
        '';


    // =====================================================
    // Note
    // =====================================================

    const note =
        sale.note?.trim() ||
        '';


    // =====================================================
    // Number Formatter
    // =====================================================

    const formatNumber = (
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


    // =====================================================
    // Overlay Close
    // =====================================================

    const handleOverlayMouseDown = (
        event
    ) => {

        if (
            event.target ===
            event.currentTarget
        ) {

            onClose?.();

        }

    };


    // =====================================================
    // Render
    // =====================================================

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
                z-50

                overflow-y-auto

                bg-slate-950/[0.24]
                dark:bg-black/[0.48]

                backdrop-blur-[18px]
                backdrop-saturate-[0.72]

                p-2
                sm:p-4

                animate-[profileBackdropIn_180ms_ease-out]
            "

            onMouseDown={
                handleOverlayMouseDown
            }
        >

            <div
                className="
                    min-h-full

                    flex
                    items-start
                    justify-center

                    sm:items-center
                "
            >

                <div
                    className="
                        relative

                        w-full
                        max-w-2xl

                        h-auto

                        max-h-[calc(100dvh-1rem)]
                        sm:max-h-[90vh]

                        flex
                        flex-col

                        overflow-hidden

                        rounded-2xl

                        border
                        border-[var(--border)]

                        bg-[var(--surface)]

                        shadow-[var(--shadow-xl)]

                        transition-colors
                        duration-300

                        animate-[profileModalIn_180ms_ease-out]
                    "
                >

                    {/* =================================================
                        Header
                    ================================================= */}

                    <div
                        className="
                            shrink-0

                            flex
                            items-center
                            justify-between

                            gap-3

                            px-3
                            sm:px-6

                            py-3
                            sm:py-4

                            border-b
                            border-[var(--border)]

                            bg-[var(--surface-elevated)]

                            transition-colors
                            duration-300
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
                                    w-9
                                    h-9

                                    sm:w-10
                                    sm:h-10

                                    shrink-0

                                    rounded-xl

                                    flex
                                    items-center
                                    justify-center

                                    border
                                    border-[var(--accent)]/15

                                    bg-[var(--accent-soft)]

                                    shadow-[var(--shadow-xs)]
                                "
                            >

                                <Receipt
                                    size={18}
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

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2

                                        min-w-0
                                    "
                                >

                                    <h2
                                        className="
                                            min-w-0

                                            text-sm
                                            sm:text-lg

                                            font-bold

                                            text-[var(--text)]

                                            truncate
                                        "
                                    >
                                        {t(
                                            'sales.details.title'
                                        )}
                                    </h2>


                                    <span
                                        dir="ltr"
                                        className="
                                            shrink-0

                                            rounded-lg

                                            border
                                            border-[var(--border)]

                                            bg-[var(--surface-muted)]

                                            px-2
                                            py-1

                                            text-[10px]

                                            font-mono
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        #
                                        {saleId.padStart(
                                            4,
                                            '0'
                                        )}
                                    </span>

                                </div>


                                <p
                                    className="
                                        mt-1

                                        text-[10px]
                                        sm:text-xs

                                        text-[var(--text-muted)]

                                        truncate
                                    "
                                >
                                    {t(
                                        'sales.details.subtitle'
                                    )}
                                </p>

                            </div>

                        </div>


                        <button
                            type="button"

                            onClick={() =>
                                onClose?.()
                            }

                            aria-label={
                                t(
                                    'common.closeMenu'
                                )
                            }

                            className="
                                ui-icon-button

                                h-9
                                w-9

                                shrink-0

                                text-[var(--text-muted)]

                                hover:text-[var(--text)]

                                hover:bg-[var(--surface-hover)]
                            "
                        >

                            <X
                                size={19}
                            />

                        </button>

                    </div>


                    {/* =================================================
                        Scrollable Body
                    ================================================= */}

                    <div
                        className="
                            flex-1
                            min-h-0

                            overflow-y-auto
                            overscroll-contain

                            p-3
                            sm:p-6

                            space-y-4
                            sm:space-y-6

                            main-scrollbar
                        "
                    >

                        {/* =================================================
                            Product
                        ================================================= */}

                        <section
                            className="
                                relative
                                overflow-hidden

                                rounded-2xl

                                border
                                border-[var(--accent)]/15

                                bg-[var(--accent-soft)]

                                p-3
                                sm:p-5
                            "
                        >

                            <div
                                className="
                                    pointer-events-none

                                    absolute

                                    -top-16
                                    -end-16

                                    w-40
                                    h-40

                                    rounded-full

                                    bg-[var(--accent)]/10

                                    blur-3xl
                                "
                            />

                            <div
                                className="
                                    pointer-events-none

                                    absolute

                                    -bottom-20
                                    -start-12

                                    h-28
                                    w-28

                                    rounded-full

                                    bg-indigo-400/[0.04]

                                    blur-3xl
                                "
                            />


                            <div
                                className="
                                    relative

                                    flex
                                    flex-col

                                    sm:flex-row

                                    sm:items-center
                                    sm:justify-between

                                    gap-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center

                                        gap-3
                                        sm:gap-4

                                        min-w-0
                                    "
                                >

                                    <div
                                        className="
                                            w-11
                                            h-11

                                            sm:w-14
                                            sm:h-14

                                            shrink-0

                                            rounded-2xl

                                            border
                                            border-[var(--accent)]/15

                                            bg-[var(--surface)]

                                            flex
                                            items-center
                                            justify-center

                                            shadow-[var(--shadow-xs)]
                                        "
                                    >

                                        <Package
                                            size={21}

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
                                                sm:text-lg

                                                font-bold

                                                text-[var(--text)]

                                                truncate
                                            "
                                        >
                                            {productName}
                                        </p>


                                        <div
                                            className="
                                                flex
                                                items-center

                                                gap-2

                                                mt-1
                                            "
                                        >

                                            <Tag
                                                size={12}

                                                className="
                                                    shrink-0

                                                    text-[var(--text-muted)]
                                                "
                                            />


                                            <span
                                                className="
                                                    text-xs

                                                    text-[var(--text-secondary)]

                                                    truncate
                                                "
                                            >
                                                {category}
                                            </span>

                                        </div>

                                    </div>

                                </div>


                                <div
                                    className="
                                        shrink-0

                                        text-start
                                    "
                                >

                                    <p
                                        className="
                                            text-[10px]
                                            sm:text-[11px]

                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {t(
                                            'sales.details.totalAmount'
                                        )}
                                    </p>


                                    <p
                                        className="
                                            mt-1

                                            text-lg
                                            sm:text-2xl

                                            font-bold
                                            number-font

                                            text-[var(--accent)]
                                        "

                                        dir="ltr"
                                    >

                                        {formatNumber(amount)}

                                        <span
                                            className="
                                                ms-1

                                                text-xs
                                                sm:text-sm

                                                font-normal

                                                text-[var(--text-muted)]
                                            "
                                        >
                                            {t(
                                                'common.currency'
                                            )}
                                        </span>

                                    </p>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            Payment
                        ================================================= */}

                        <section>

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2

                                    mb-3
                                "
                            >

                                <div
                                    className="
                                        w-7
                                        h-7
                                        shrink-0

                                        rounded-lg

                                        bg-[var(--surface-muted)]

                                        flex
                                        items-center
                                        justify-center
                                    "
                                >

                                    <DollarSign
                                        size={14}

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
                                        'sales.details.paymentStatus.title'
                                    )}
                                </h3>

                            </div>


                            <div
                                className={`
                                    flex
                                    flex-col

                                    sm:flex-row

                                    sm:items-center
                                    sm:justify-between

                                    gap-4

                                    rounded-xl

                                    border

                                    p-3
                                    sm:p-4

                                    ${
                                        isCash
                                            ? 'border-cyan-500/15 bg-cyan-500/5'
                                            : 'border-amber-500/15 bg-amber-500/5'
                                    }
                                `}
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
                                        className={`
                                            w-10
                                            h-10

                                            shrink-0

                                            rounded-xl

                                            flex
                                            items-center
                                            justify-center

                                            ${
                                                isCash
                                                    ? 'bg-cyan-500/10'
                                                    : 'bg-amber-500/10'
                                            }
                                        `}
                                    >

                                        {isCash ? (

                                            <Banknote
                                                size={19}
                                                className="
                                                    text-cyan-500
                                                "
                                            />

                                        ) : (

                                            <CreditCard
                                                size={19}
                                                className="
                                                    text-amber-500
                                                "
                                            />

                                        )}

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
                                                font-medium

                                                text-[var(--text)]

                                                truncate
                                            "
                                        >
                                            {
                                                isCash
                                                    ? t(
                                                        'sales.details.paymentStatus.cashTitle'
                                                    )
                                                    : t(
                                                        'sales.details.paymentStatus.creditTitle'
                                                    )
                                            }
                                        </p>


                                        <p
                                            className="
                                                mt-1

                                                text-[11px]

                                                text-[var(--text-secondary)]

                                                leading-5
                                            "
                                        >
                                            {
                                                isCash
                                                    ? t(
                                                        'sales.details.paymentStatus.cashDescription'
                                                    )
                                                    : t(
                                                        'sales.details.paymentStatus.creditDescription'
                                                    )
                                            }
                                        </p>

                                    </div>

                                </div>


                                <div
                                    className="
                                        flex
                                        items-center

                                        gap-1.5

                                        shrink-0

                                        self-start
                                        sm:self-auto
                                    "
                                >

                                    {isCash ? (

                                        <CheckCircle2
                                            size={16}
                                            className="
                                                text-cyan-500
                                            "
                                        />

                                    ) : (

                                        <Clock3
                                            size={16}
                                            className="
                                                text-amber-500
                                            "
                                        />

                                    )}


                                    <span
                                        className={`
                                            text-xs
                                            font-medium

                                            ${
                                                isCash
                                                    ? 'text-cyan-500'
                                                    : 'text-amber-500'
                                            }
                                        `}
                                    >
                                        {
                                            isCash
                                                ? t(
                                                    'sales.details.paymentStatus.settled'
                                                )
                                                : t(
                                                    'sales.details.paymentStatus.unpaid'
                                                )
                                        }
                                    </span>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            Sale Information
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon={Receipt}
                                title={t(
                                    'sales.details.saleInformation.title'
                                )}
                            />


                            <div
                                className="
                                    grid

                                    grid-cols-2
                                    sm:grid-cols-4

                                    gap-px

                                    overflow-hidden

                                    rounded-xl

                                    border
                                    border-[var(--border)]

                                    bg-[var(--border)]
                                "
                            >

                                <InfoItem
                                    icon={Hash}
                                    label={t(
                                        'sales.details.saleInformation.quantity'
                                    )}
                                    value={`${formatNumber(
                                        quantity
                                    )} ${t(
                                        'sales.details.units'
                                    )}`}
                                />


                                <InfoItem
                                    icon={DollarSign}
                                    label={t(
                                        'sales.details.saleInformation.unitPrice'
                                    )}
                                    value={`${formatNumber(
                                        unitPrice
                                    )} ${t(
                                        'common.currency'
                                    )}`}
                                />


                                <InfoItem
                                    icon={CalendarDays}
                                    label={t(
                                        'sales.details.saleInformation.date'
                                    )}
                                    value={saleDate}
                                />


                                <InfoItem
                                    icon={Clock3}
                                    label={t(
                                        'sales.details.saleInformation.time'
                                    )}
                                    value={saleTime}
                                />

                            </div>

                        </section>


                        {/* =================================================
                            Customer
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon={User}
                                title={t(
                                    'sales.details.customer.title'
                                )}
                            />


                            <div
                                className="
                                    rounded-xl

                                    border
                                    border-[var(--border)]

                                    bg-[var(--surface-muted)]

                                    p-4
                                "
                            >

                                <div
                                    className="
                                        grid

                                        grid-cols-1
                                        sm:grid-cols-2

                                        gap-4
                                    "
                                >

                                    <CustomerItem
                                        icon={User}
                                        label={t(
                                            'sales.details.customer.name'
                                        )}
                                        value={
                                            customerName
                                        }
                                    />


                                    <CustomerItem
                                        icon={Phone}
                                        label={t(
                                            'sales.details.customer.phone'
                                        )}
                                        value={
                                            customerPhone ||
                                            '-'
                                        }
                                        dir="ltr"
                                    />

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            Note
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon={FileText}
                                title={t(
                                    'sales.details.note.title'
                                )}
                            />


                            <div
                                className="
                                    rounded-xl

                                    border
                                    border-[var(--border)]

                                    bg-[var(--surface-muted)]

                                    p-4
                                "
                            >

                                <p
                                    className="
                                        text-xs
                                        leading-6

                                        text-[var(--text-secondary)]

                                        break-words
                                    "
                                >
                                    {
                                        note ||
                                        t(
                                            'sales.details.note.empty'
                                        )
                                    }
                                </p>

                            </div>

                        </section>

                    </div>


                    {/* =================================================
                        Footer
                    ================================================= */}

                    <div
                        className="
                            shrink-0

                            flex
                            flex-col-reverse

                            sm:flex-row

                            sm:items-center
                            sm:justify-between

                            gap-3

                            px-3
                            sm:px-6

                            py-3
                            sm:py-4

                            border-t
                            border-[var(--border)]

                            bg-[var(--surface-elevated)]
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
                                    w-2
                                    h-2
                                    shrink-0

                                    rounded-full

                                    bg-emerald-500

                                    shadow-[0_0_0_3px_rgba(16,185,129,0.08)]
                                "
                            />


                            <span
                                className="
                                    text-[11px]

                                    text-[var(--text-muted)]
                                "
                            >
                                {t(
                                    'sales.details.footer.recorded'
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

                                h-10

                                px-5

                                rounded-xl
                            "
                        >
                            {t(
                                'sales.details.footer.close'
                            )}
                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}


// =========================================================
// Section Title
// =========================================================

function SectionTitle({
    icon: Icon,
    title,
}) {

    return (

        <div
            className="
                flex
                items-center
                gap-2

                mb-3
            "
        >

            <div
                className="
                    w-7
                    h-7
                    shrink-0

                    rounded-lg

                    bg-[var(--surface-muted)]

                    border
                    border-[var(--border-subtle)]

                    flex
                    items-center
                    justify-center
                "
            >

                <Icon
                    size={14}
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
                {title}
            </h3>

        </div>

    );

}


// =========================================================
// Info Item
// =========================================================

function InfoItem({
    icon: Icon,
    label,
    value,
}) {

    return (

        <div
            className="
                bg-[var(--surface)]

                p-3
                sm:p-4

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

                <Icon
                    size={14}
                    className="
                        shrink-0

                        text-[var(--text-muted)]
                    "
                />


                <span
                    className="
                        min-w-0

                        text-[10px]
                        sm:text-[11px]

                        text-[var(--text-muted)]

                        truncate
                    "
                >
                    {label}
                </span>

            </div>


            <p
                className="
                    mt-2

                    text-xs
                    sm:text-sm

                    font-semibold

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
// Customer Item
// =========================================================

function CustomerItem({
    icon: Icon,
    label,
    value,
    dir,
}) {

    return (

        <div
            className="
                flex
                items-start
                gap-3

                min-w-0
            "
        >

            <Icon
                size={15}

                className="
                    mt-0.5
                    shrink-0

                    text-[var(--text-muted)]
                "
            />


            <div
                className="
                    min-w-0
                "
            >

                <p
                    className="
                        text-[11px]

                        text-[var(--text-muted)]
                    "
                >
                    {label}
                </p>


                <p
                    dir={dir}

                    className="
                        mt-1

                        text-sm

                        text-[var(--text-secondary)]

                        truncate
                    "
                >
                    {value}
                </p>

            </div>

        </div>

    );

}


export default SaleDetails;