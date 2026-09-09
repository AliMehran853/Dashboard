import {
    useEffect,
    useState,
} from 'react';

import {
    X,
    Wallet,
    User,
    CalendarDays,
    FileText,
    CheckCircle2,
    Loader2,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';


// =========================================================
// Helpers
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


const parseNumber = (
    value
) => {

    const normalized =
        toEnglishNumbers(
            value
        )
            .replace(
                /,/g,
                ''
            )
            .replace(
                /٬/g,
                ''
            )
            .replace(
                /[^\d.-]/g,
                ''
            );


    const number =
        Number(
            normalized
        );


    return Number.isFinite(
        number
    )
        ? number
        : 0;

};


const getTodayDate = () => {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            '0'
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            '0'
        );


    return `${year}-${month}-${day}`;

};


const normalizeId = (
    value
) => {

    const id =
        Number(
            value
        );


    return Number.isFinite(
        id
    ) &&
        id > 0

        ? id

        : null;

};


// =========================================================
// Credit Payment Modal
// =========================================================

function CreditPaymentModal({
    onClose,
    customer,
    onSubmit,
}) {

    const {
        t,
        i18n,
    } = useTranslation();


    const isEnglish =
        i18n.language === 'en';


    // =======================================================
    // Form State
    // =======================================================

    const [
        amount,
        setAmount,
    ] = useState('');


    const [
        description,
        setDescription,
    ] = useState('');


    const [
        paymentMethod,
        setPaymentMethod,
    ] = useState('cash');


    const [
        date,
        setDate,
    ] = useState(
        getTodayDate()
    );


    const [
        error,
        setError,
    ] = useState('');


    const [
        saving,
        setSaving,
    ] = useState(false);


    // =======================================================
    // Escape
    // =======================================================

    useEffect(() => {

        const handleKeyDown = (
            event
        ) => {

            if (
                event.key === 'Escape' &&
                !saving
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
        onClose,
        saving,
    ]);


    // =======================================================
    // Customer Validation
    // =======================================================

    if (!customer) {
        return null;
    }


    // =======================================================
    // Customer Data
    // =======================================================

    const customerId =
        normalizeId(
            customer.customerId ??
            customer.id
        );


    const customerName =
        customer.customerName ||
        customer.name ||
        '';


    const customerPhone =
        customer.phone ||
        customer.customerPhone ||
        '';


    const remainingDebt =
        Math.max(
            0,
            parseNumber(
                customer.remaining
            )
        );


    // =======================================================
    // Format Number
    // =======================================================

    const formatNumber = (
        value
    ) => {

        return new Intl.NumberFormat(
            isEnglish
                ? 'en-US'
                : 'fa-IR'
        ).format(
            parseNumber(
                value
            )
        );

    };


    // =======================================================
    // Submit
    // =======================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();


        if (saving) {
            return;
        }


        setError('');


        // -----------------------------------------------------
        // Customer
        // -----------------------------------------------------

        if (!customerId) {

            setError(
                t(
                    'credit.paymentModal.errors.customerRequired'
                )
            );


            return;

        }


        // -----------------------------------------------------
        // Amount
        // -----------------------------------------------------

        const paymentAmount =
            parseNumber(
                amount
            );


        if (
            paymentAmount <= 0
        ) {

            setError(
                t(
                    'credit.paymentModal.errors.amountRequired'
                )
            );


            return;

        }


        if (
            paymentAmount >
            remainingDebt
        ) {

            setError(
                t(
                    'credit.paymentModal.errors.amountTooHigh'
                )
            );


            return;

        }


        // -----------------------------------------------------
        // Date
        // -----------------------------------------------------

        if (!date) {

            setError(
                t(
                    'credit.paymentModal.errors.dateRequired'
                )
            );


            return;

        }


        // -----------------------------------------------------
        // Payment Data
        // -----------------------------------------------------

        const paymentData = {

            customerId,

            customerName,

            amount:
                paymentAmount,

            paymentMethod:
                paymentMethod ||
                'cash',

            description:
                description.trim(),

            date,

            createdAt:
                new Date().toISOString(),

        };


        // -----------------------------------------------------
        // Submit
        // -----------------------------------------------------

        try {

            setSaving(true);


            if (
                typeof onSubmit !==
                'function'
            ) {

                throw new Error(
                    t(
                        'credit.paymentModal.errors.submit'
                    )
                );

            }


            await onSubmit(
                paymentData
            );


            setAmount('');
            setDescription('');
            setError('');

        } catch (
            submitError
        ) {

            console.error(
                'Failed to submit credit payment:',
                submitError
            );


            setError(
                submitError?.message ||
                t(
                    'credit.paymentModal.errors.submit'
                )
            );

        } finally {

            setSaving(false);

        }

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

                z-[60]

                flex
                items-center
                justify-center

                p-2
                sm:p-4

                bg-slate-950/[0.26]
                dark:bg-black/[0.50]

                backdrop-blur-[18px]
                backdrop-saturate-[0.72]

                animate-[profileBackdropIn_180ms_ease-out]
            "

            onMouseDown={(
                event
            ) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    if (!saving) {
                        onClose?.();
                    }

                }

            }}

            role="presentation"
        >

            {/* =================================================
                Modal
            ================================================= */}

            <div
                className="
                    relative

                    w-full
                    max-w-lg

                    max-h-[calc(100dvh-1rem)]
                    sm:max-h-[90vh]

                    overflow-y-auto

                    rounded-2xl

                    border
                    border-[var(--border)]

                    bg-[var(--surface)]

                    shadow-[var(--shadow-xl)]

                    main-scrollbar

                    animate-[profileModalIn_180ms_ease-out]
                "

                onMouseDown={(
                    event
                ) =>
                    event.stopPropagation()
                }

                role="dialog"

                aria-modal="true"
            >

                {/* =================================================
                    Header
                ================================================= */}

                <div
                    className="
                        sticky

                        top-0

                        z-10

                        flex
                        items-center
                        justify-between

                        gap-3

                        border-b
                        border-[var(--border)]

                        bg-[var(--surface-elevated)]/95

                        px-4
                        py-4

                        backdrop-blur-xl

                        sm:px-6
                        sm:py-5
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
                            className="
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
                                border-[var(--accent)]/15

                                bg-[var(--accent-soft)]
                            "
                        >

                            <Wallet
                                size={20}

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

                            <h2
                                className="
                                    text-base
                                    sm:text-lg

                                    font-bold

                                    text-[var(--text)]
                                "
                            >
                                {t(
                                    'credit.paymentModal.title'
                                )}
                            </h2>


                            <p
                                className="
                                    mt-1

                                    text-[11px]
                                    sm:text-xs

                                    text-[var(--text-muted)]
                                "
                            >
                                {t(
                                    'credit.paymentModal.subtitle'
                                )}
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"

                        onClick={() =>
                            onClose?.()
                        }

                        disabled={
                            saving
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

                            disabled:opacity-50
                        "
                    >

                        <X
                            size={19}
                        />

                    </button>

                </div>


                {/* =================================================
                    Form
                ================================================= */}

                <form
                    onSubmit={
                        handleSubmit
                    }
                >

                    <div
                        className="
                            space-y-5

                            p-4

                            sm:space-y-6
                            sm:p-6
                        "
                    >

                        {/* =================================================
                            Customer Information
                        ================================================= */}

                        <section
                            className="
                                relative
                                overflow-hidden

                                rounded-2xl

                                border
                                border-[var(--border)]

                                bg-[var(--surface-muted)]

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

                                    h-24
                                    w-24

                                    rounded-full

                                    bg-amber-500/6

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

                                    min-[420px]:flex-row
                                    min-[420px]:items-center
                                    min-[420px]:justify-between
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
                                        className="
                                            flex

                                            h-10
                                            w-10

                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-xl

                                            bg-amber-500/10

                                            border
                                            border-amber-500/10
                                        "
                                    >

                                        <User
                                            size={18}

                                            className="
                                                text-amber-500
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
                                                truncate

                                                text-sm

                                                font-semibold

                                                text-[var(--text)]
                                            "
                                        >
                                            {
                                                customerName ||
                                                t(
                                                    'credit.paymentModal.defaults.customer'
                                                )
                                            }
                                        </p>


                                        <p
                                            className="
                                                mt-1

                                                truncate

                                                text-[10px]
                                                sm:text-[11px]

                                                text-[var(--text-muted)]
                                            "
                                        >

                                            {customerPhone
                                                ? `${customerPhone} • `
                                                : ''}

                                            {t(
                                                'credit.paymentModal.customer.creditAccount'
                                            )}

                                        </p>

                                    </div>

                                </div>


                                {/* Remaining Debt */}

                                <div
                                    className={`
                                        ${
                                            isEnglish
                                                ? 'text-left'
                                                : 'text-right'
                                        }

                                        shrink-0
                                    `}
                                >

                                    <p
                                        className="
                                            text-[10px]

                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {t(
                                            'credit.paymentModal.customer.currentDebt'
                                        )}
                                    </p>


                                    <p
                                        dir="ltr"

                                        className="
                                            mt-1

                                            text-lg

                                            font-bold
                                            number-font

                                            text-amber-500
                                        "
                                    >

                                        {formatNumber(
                                            remainingDebt
                                        )}

                                        <span
                                            className="
                                                ms-1

                                                text-[11px]

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
                            Error
                        ================================================= */}

                        {error && (

                            <div
                                role="alert"

                                className="
                                    rounded-xl

                                    border
                                    border-red-500/20

                                    bg-red-500/5

                                    px-4
                                    py-3

                                    text-xs

                                    leading-5

                                    text-red-500
                                    dark:text-red-400
                                "
                            >
                                {error}
                            </div>

                        )}


                        {/* =================================================
                            Payment Amount
                        ================================================= */}

                        <section>

                            <label
                                className="
                                    mb-2
                                    block

                                    text-xs

                                    font-medium

                                    text-[var(--text-secondary)]
                                "
                            >
                                {t(
                                    'credit.paymentModal.fields.amount'
                                )}
                            </label>


                            <div
                                className="
                                    relative
                                "
                            >

                                <Wallet
                                    size={17}

                                    className={`
                                        pointer-events-none

                                        absolute

                                        ${
                                            isEnglish
                                                ? 'left-4'
                                                : 'right-4'
                                        }

                                        top-1/2
                                        -translate-y-1/2

                                        text-[var(--text-muted)]
                                    `}
                                />


                                <input
                                    type="text"

                                    inputMode="numeric"

                                    value={
                                        amount
                                    }

                                    onChange={(
                                        event
                                    ) => {

                                        setAmount(
                                            toEnglishNumbers(
                                                event.target.value
                                            )
                                        );

                                        setError('');

                                    }}

                                    placeholder={t(
                                        'credit.paymentModal.fields.amountPlaceholder'
                                    )}

                                    disabled={
                                        saving ||
                                        remainingDebt <= 0
                                    }

                                    className={`
                                        ui-input

                                        h-12

                                        w-full

                                        ${
                                            isEnglish
                                                ? 'pl-11 pr-14'
                                                : 'pr-11 pl-14'
                                        }

                                        disabled:opacity-50
                                    `}
                                />


                                <span
                                    className={`
                                        pointer-events-none

                                        absolute

                                        ${
                                            isEnglish
                                                ? 'right-4'
                                                : 'left-4'
                                        }

                                        top-1/2
                                        -translate-y-1/2

                                        text-xs

                                        text-[var(--text-muted)]
                                    `}
                                >
                                    {t(
                                        'common.currency'
                                    )}
                                </span>

                            </div>


                            <p
                                className="
                                    mt-2

                                    text-[10px]

                                    text-[var(--text-muted)]
                                "
                            >

                                {t(
                                    'credit.paymentModal.fields.maximum'
                                )}

                                {' '}

                                <span
                                    dir="ltr"

                                    className="
                                        number-font

                                        font-medium

                                        text-[var(--text-secondary)]
                                    "
                                >
                                    {formatNumber(
                                        remainingDebt
                                    )}
                                </span>

                                {' '}

                                {t(
                                    'common.currency'
                                )}

                            </p>

                        </section>


                        {/* =================================================
                            Payment Method
                        ================================================= */}

                        <section>

                            <label
                                className="
                                    mb-3
                                    block

                                    text-xs

                                    font-medium

                                    text-[var(--text-secondary)]
                                "
                            >
                                {t(
                                    'credit.paymentModal.fields.paymentMethod'
                                )}
                            </label>


                            <div
                                className="
                                    grid

                                    grid-cols-1
                                    sm:grid-cols-2

                                    gap-3
                                "
                            >

                                {/* Cash */}

                                <button
                                    type="button"

                                    onClick={() =>
                                        setPaymentMethod(
                                            'cash'
                                        )
                                    }

                                    disabled={
                                        saving
                                    }

                                    className={`
                                        flex

                                        h-12

                                        items-center
                                        justify-center

                                        gap-2

                                        rounded-xl

                                        border

                                        text-xs

                                        font-medium

                                        transition-all

                                        ${
                                            paymentMethod ===
                                            'cash'

                                                ? `
                                                    border-cyan-500/25
                                                    bg-cyan-500/10
                                                    text-cyan-500
                                                `

                                                : `
                                                    border-[var(--border)]
                                                    bg-[var(--surface-muted)]
                                                    text-[var(--text-muted)]

                                                    hover:border-cyan-500/20
                                                    hover:bg-cyan-500/5
                                                    hover:text-cyan-500
                                                `
                                        }

                                        disabled:opacity-50
                                    `}
                                >

                                    <Wallet
                                        size={16}
                                    />

                                    {t(
                                        'credit.paymentModal.methods.cash'
                                    )}

                                </button>


                                {/* Card */}

                                <button
                                    type="button"

                                    onClick={() =>
                                        setPaymentMethod(
                                            'card'
                                        )
                                    }

                                    disabled={
                                        saving
                                    }

                                    className={`
                                        flex

                                        h-12

                                        items-center
                                        justify-center

                                        gap-2

                                        rounded-xl

                                        border

                                        text-xs

                                        font-medium

                                        transition-all

                                        ${
                                            paymentMethod ===
                                            'card'

                                                ? `
                                                    border-violet-500/25
                                                    bg-violet-500/10
                                                    text-violet-500
                                                `

                                                : `
                                                    border-[var(--border)]
                                                    bg-[var(--surface-muted)]
                                                    text-[var(--text-muted)]

                                                    hover:border-violet-500/20
                                                    hover:bg-violet-500/5
                                                    hover:text-violet-500
                                                `
                                        }

                                        disabled:opacity-50
                                    `}
                                >

                                    <CheckCircle2
                                        size={16}
                                    />

                                    {t(
                                        'credit.paymentModal.methods.card'
                                    )}

                                </button>

                            </div>

                        </section>


                        {/* =================================================
                            Date
                        ================================================= */}

                        <section>

                            <label
                                className="
                                    mb-2
                                    block

                                    text-xs

                                    font-medium

                                    text-[var(--text-secondary)]
                                "
                            >
                                {t(
                                    'credit.paymentModal.fields.date'
                                )}
                            </label>


                            <div
                                className="
                                    relative
                                "
                            >

                                <CalendarDays
                                    size={17}

                                    className={`
                                        pointer-events-none

                                        absolute

                                        ${
                                            isEnglish
                                                ? 'left-4'
                                                : 'right-4'
                                        }

                                        top-1/2
                                        -translate-y-1/2

                                        text-[var(--text-muted)]
                                    `}
                                />


                                <input
                                    type="date"

                                    value={
                                        date
                                    }

                                    onChange={(
                                        event
                                    ) =>
                                        setDate(
                                            event.target.value
                                        )
                                    }

                                    disabled={
                                        saving
                                    }

                                    className={`
                                        ui-input

                                        h-12

                                        w-full

                                        ${
                                            isEnglish
                                                ? 'pl-11 pr-4'
                                                : 'pr-11 pl-4'
                                        }

                                        disabled:opacity-50
                                    `}
                                />

                            </div>

                        </section>


                        {/* =================================================
                            Description
                        ================================================= */}

                        <section>

                            <label
                                className="
                                    mb-2

                                    block

                                    text-xs

                                    font-medium

                                    text-[var(--text-secondary)]
                                "
                            >

                                {t(
                                    'credit.paymentModal.fields.description'
                                )}

                                <span
                                    className="
                                        ms-1

                                        text-[10px]

                                        font-normal

                                        text-[var(--text-muted)]
                                    "
                                >
                                    {t(
                                        'credit.paymentModal.optional'
                                    )}
                                </span>

                            </label>


                            <div
                                className="
                                    relative
                                "
                            >

                                <FileText
                                    size={17}

                                    className={`
                                        pointer-events-none

                                        absolute

                                        ${
                                            isEnglish
                                                ? 'left-4'
                                                : 'right-4'
                                        }

                                        top-4

                                        text-[var(--text-muted)]
                                    `}
                                />


                                <textarea
                                    value={
                                        description
                                    }

                                    onChange={(
                                        event
                                    ) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }

                                    rows={3}

                                    placeholder={t(
                                        'credit.paymentModal.fields.descriptionPlaceholder'
                                    )}

                                    disabled={
                                        saving
                                    }

                                    className={`
                                        ui-input

                                        min-h-[96px]

                                        w-full

                                        resize-none

                                        ${
                                            isEnglish
                                                ? 'pl-11 pr-4'
                                                : 'pr-11 pl-4'
                                        }

                                        py-3

                                        disabled:opacity-50
                                    `}
                                />

                            </div>

                        </section>

                    </div>


                    {/* =================================================
                        Footer
                    ================================================= */}

                    <div
                        className="
                            sticky

                            bottom-0

                            flex

                            flex-col-reverse

                            gap-3

                            border-t
                            border-[var(--border)]

                            bg-[var(--surface-elevated)]/95

                            px-4
                            py-4

                            backdrop-blur-xl

                            sm:flex-row
                            sm:justify-end

                            sm:px-6
                        "
                    >

                        <button
                            type="button"

                            onClick={() =>
                                onClose?.()
                            }

                            disabled={
                                saving
                            }

                            className="
                                ui-button-secondary

                                h-11

                                w-full
                                sm:w-auto

                                rounded-xl

                                px-5

                                disabled:opacity-50
                            "
                        >
                            {t(
                                'credit.paymentModal.actions.cancel'
                            )}
                        </button>


                        <button
                            type="submit"

                            disabled={
                                saving ||
                                remainingDebt <= 0
                            }

                            className="
                                ui-button-primary

                                h-11

                                w-full
                                sm:w-auto

                                rounded-xl

                                px-6

                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            {saving && (

                                <Loader2
                                    size={16}

                                    className="
                                        animate-spin
                                    "
                                />

                            )}


                            {saving

                                ? t(
                                    'credit.paymentModal.actions.saving'
                                )

                                : t(
                                    'credit.paymentModal.actions.submit'
                                )}

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}


export default CreditPaymentModal;