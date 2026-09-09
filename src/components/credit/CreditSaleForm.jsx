import {
    useMemo,
    useState,
} from 'react';

import {
    X,
    User,
    Phone,
    Package,
    Hash,
    CalendarDays,
    CreditCard,
    Wallet,
    Save,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';


// =========================================================
// Credit Sale Form
// =========================================================

function CreditSaleForm({
    onClose,
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
        formData,
        setFormData,
    ] = useState({

        customerName: '',

        phone: '',

        product: '',

        quantity: '',

        unitPrice: '',

        date: '',

    });


    const [
        error,
        setError,
    ] = useState('');


    // =======================================================
    // Handle Input Change
    // =======================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            (
                previous
            ) => ({

                ...previous,

                [name]:
                    value,

            })
        );


        setError('');

    };


    // =======================================================
    // Calculate Total
    // =======================================================

    const totalAmount =
        useMemo(
            () => {

                const quantity =
                    Number(
                        formData.quantity
                    ) || 0;


                const unitPrice =
                    Number(
                        formData.unitPrice
                    ) || 0;


                return (
                    quantity *
                    unitPrice
                );

            },
            [
                formData.quantity,
                formData.unitPrice,
            ]
        );


    // =======================================================
    // Format Number
    // =======================================================

    const formatNumber = (
        number
    ) => {

        return new Intl.NumberFormat(
            isEnglish
                ? 'en-US'
                : 'fa-IR'
        ).format(
            Number(
                number
            ) || 0
        );

    };


    // =======================================================
    // Submit
    // =======================================================

    const handleSubmit = (
        event
    ) => {

        event.preventDefault();


        if (
            !formData.customerName.trim()
        ) {

            setError(
                t(
                    'credit.saleForm.errors.customerRequired'
                )
            );

            return;

        }


        if (
            !formData.product.trim()
        ) {

            setError(
                t(
                    'credit.saleForm.errors.productRequired'
                )
            );

            return;

        }


        if (
            !formData.quantity ||
            Number(
                formData.quantity
            ) <= 0
        ) {

            setError(
                t(
                    'credit.saleForm.errors.quantityRequired'
                )
            );

            return;

        }


        if (
            formData.unitPrice === '' ||
            Number(
                formData.unitPrice
            ) < 0
        ) {

            setError(
                t(
                    'credit.saleForm.errors.priceInvalid'
                )
            );

            return;

        }


        const creditSale = {

            ...formData,

            customerName:
                formData.customerName.trim(),

            phone:
                formData.phone.trim(),

            product:
                formData.product.trim(),

            quantity:
                Number(
                    formData.quantity
                ),

            unitPrice:
                Number(
                    formData.unitPrice
                ),

            date:
                formData.date ||
                new Date()
                    .toISOString()
                    .split('T')[0],

            totalAmount,

        };


        if (onSubmit) {

            onSubmit(
                creditSale
            );

        }

    };


    // =======================================================
    // Input Direction Helpers
    // =======================================================

    const iconPosition =
        isEnglish
            ? 'left-3'
            : 'right-3';


    const inputIconPadding =
        isEnglish
            ? 'pl-10 pr-4'
            : 'pr-10 pl-4';


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

                z-50

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

                    onClose?.();

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
                    max-w-2xl

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

                        relative
                        overflow-hidden

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
                        aria-hidden="true"

                        className="
                            pointer-events-none

                            absolute

                            -top-16
                            -end-12

                            h-28
                            w-28

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
                                border-amber-500/15

                                bg-amber-500/10
                            "
                        >

                            <CreditCard
                                size={20}

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

                            <div
                                className="
                                    flex
                                    flex-wrap

                                    items-center

                                    gap-2
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
                                        'credit.saleForm.title'
                                    )}
                                </h2>


                                <span
                                    className="
                                        rounded-lg

                                        border
                                        border-amber-500/15

                                        bg-amber-500/10

                                        px-2
                                        py-1

                                        text-[10px]

                                        font-medium

                                        text-amber-500
                                    "
                                >
                                    {t(
                                        'credit.saleForm.badge'
                                    )}
                                </span>

                            </div>


                            <p
                                className="
                                    mt-1

                                    text-[11px]
                                    sm:text-xs

                                    text-[var(--text-muted)]
                                "
                            >
                                {t(
                                    'credit.saleForm.subtitle'
                                )}
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"

                        onClick={
                            onClose
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
                                    sm:text-sm

                                    leading-5

                                    text-red-500
                                    dark:text-red-400
                                "
                            >
                                {error}
                            </div>

                        )}


                        {/* =================================================
                            Customer Information
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon={
                                    User
                                }

                                title={t(
                                    'credit.saleForm.customer.title'
                                )}
                            />


                            <div
                                className="
                                    grid

                                    grid-cols-1
                                    sm:grid-cols-2

                                    gap-4
                                "
                            >

                                {/* Customer Name */}

                                <Field
                                    label={t(
                                        'credit.saleForm.customer.name'
                                    )}

                                    icon={
                                        User
                                    }

                                    iconPosition={
                                        iconPosition
                                    }
                                >

                                    <input
                                        type="text"

                                        name="customerName"

                                        value={
                                            formData.customerName
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        placeholder={t(
                                            'credit.saleForm.customer.namePlaceholder'
                                        )}

                                        className={`
                                            ui-input

                                            h-11
                                            w-full

                                            ${inputIconPadding}
                                        `}
                                    />

                                </Field>


                                {/* Phone */}

                                <Field
                                    label={t(
                                        'credit.saleForm.customer.phone'
                                    )}

                                    optional={
                                        t(
                                            'credit.saleForm.optional'
                                        )
                                    }

                                    icon={
                                        Phone
                                    }

                                    iconPosition={
                                        iconPosition
                                    }
                                >

                                    <input
                                        type="tel"

                                        name="phone"

                                        value={
                                            formData.phone
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        placeholder={t(
                                            'credit.saleForm.customer.phonePlaceholder'
                                        )}

                                        dir="ltr"

                                        className={`
                                            ui-input

                                            h-11
                                            w-full

                                            ${inputIconPadding}
                                        `}
                                    />

                                </Field>

                            </div>

                        </section>


                        {/* Divider */}

                        <div
                            className="
                                h-px

                                bg-[var(--border)]
                            "
                        />


                        {/* =================================================
                            Sale Information
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon={
                                    Package
                                }

                                title={t(
                                    'credit.saleForm.sale.title'
                                )}
                            />


                            <div
                                className="
                                    space-y-4
                                "
                            >

                                {/* Product */}

                                <Field
                                    label={t(
                                        'credit.saleForm.sale.product'
                                    )}

                                    icon={
                                        Package
                                    }

                                    iconPosition={
                                        iconPosition
                                    }
                                >

                                    <input
                                        type="text"

                                        name="product"

                                        value={
                                            formData.product
                                        }

                                        onChange={
                                            handleChange
                                        }

                                        placeholder={t(
                                            'credit.saleForm.sale.productPlaceholder'
                                        )}

                                        className={`
                                            ui-input

                                            h-11
                                            w-full

                                            ${inputIconPadding}
                                        `}
                                    />

                                </Field>


                                {/* Quantity + Price */}

                                <div
                                    className="
                                        grid

                                        grid-cols-1
                                        sm:grid-cols-2

                                        gap-4
                                    "
                                >

                                    {/* Quantity */}

                                    <Field
                                        label={t(
                                            'credit.saleForm.sale.quantity'
                                        )}

                                        icon={
                                            Hash
                                        }

                                        iconPosition={
                                            iconPosition
                                        }
                                    >

                                        <input
                                            type="number"

                                            name="quantity"

                                            value={
                                                formData.quantity
                                            }

                                            onChange={
                                                handleChange
                                            }

                                            min="1"

                                            placeholder={t(
                                                'credit.saleForm.sale.quantityPlaceholder'
                                            )}

                                            className={`
                                                ui-input

                                                h-11
                                                w-full

                                                ${inputIconPadding}
                                            `}
                                        />

                                    </Field>


                                    {/* Unit Price */}

                                    <Field
                                        label={t(
                                            'credit.saleForm.sale.unitPrice'
                                        )}

                                        icon={
                                            Wallet
                                        }

                                        iconPosition={
                                            iconPosition
                                        }
                                    >

                                        <div
                                            className="
                                                relative
                                            "
                                        >

                                            <input
                                                type="number"

                                                name="unitPrice"

                                                value={
                                                    formData.unitPrice
                                                }

                                                onChange={
                                                    handleChange
                                                }

                                                min="0"

                                                placeholder={t(
                                                    'credit.saleForm.sale.unitPricePlaceholder'
                                                )}

                                                dir="ltr"

                                                className={`
                                                    ui-input

                                                    h-11
                                                    w-full

                                                    ${
                                                        isEnglish
                                                            ? 'pl-10 pr-14'
                                                            : 'pr-10 pl-14'
                                                    }
                                                `}
                                            />


                                            <span
                                                className={`
                                                    pointer-events-none

                                                    absolute

                                                    ${
                                                        isEnglish
                                                            ? 'right-3'
                                                            : 'left-3'
                                                    }

                                                    top-1/2
                                                    -translate-y-1/2

                                                    text-[10px]

                                                    text-[var(--text-muted)]
                                                `}
                                            >
                                                {t(
                                                    'common.currency'
                                                )}
                                            </span>

                                        </div>

                                    </Field>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            Total
                        ================================================= */}

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

                                    -top-14
                                    -end-12

                                    h-28
                                    w-28

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

                                    min-[420px]:flex-row
                                    min-[420px]:items-center
                                    min-[420px]:justify-between
                                "
                            >

                                <div
                                    className="
                                        flex
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

                                        <CreditCard
                                            size={18}

                                            className="
                                                text-amber-500
                                            "
                                        />

                                    </div>


                                    <div>

                                        <p
                                            className="
                                                text-xs

                                                font-medium

                                                text-[var(--text-secondary)]
                                            "
                                        >
                                            {t(
                                                'credit.saleForm.total.title'
                                            )}
                                        </p>


                                        <p
                                            className="
                                                mt-1

                                                text-[10px]

                                                text-[var(--text-muted)]
                                            "
                                        >
                                            {t(
                                                'credit.saleForm.total.description'
                                            )}
                                        </p>

                                    </div>

                                </div>


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
                                        dir="ltr"

                                        className="
                                            text-2xl

                                            font-bold
                                            number-font

                                            tracking-tight

                                            text-amber-500
                                        "
                                    >

                                        {formatNumber(
                                            totalAmount
                                        )}

                                        <span
                                            className="
                                                ms-1

                                                text-sm

                                                font-medium

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
                            Date
                        ================================================= */}

                        <section>

                            <SectionTitle
                                icon={
                                    CalendarDays
                                }

                                title={t(
                                    'credit.saleForm.sale.date'
                                )}
                            />


                            <div
                                className="
                                    relative
                                "
                            >

                                <CalendarDays
                                    size={16}

                                    className={`
                                        pointer-events-none

                                        absolute

                                        ${iconPosition}

                                        top-1/2
                                        -translate-y-1/2

                                        text-[var(--text-muted)]
                                    `}
                                />


                                <input
                                    type="date"

                                    name="date"

                                    value={
                                        formData.date
                                    }

                                    onChange={
                                        handleChange
                                    }

                                    className={`
                                        ui-input

                                        h-11
                                        w-full

                                        ${inputIconPadding}
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
                            sm:items-center
                            sm:justify-between

                            sm:px-6
                        "
                    >

                        <button
                            type="button"

                            onClick={
                                onClose
                            }

                            className="
                                ui-button-secondary

                                h-11

                                w-full
                                sm:w-auto

                                rounded-xl

                                px-5
                            "
                        >
                            {t(
                                'credit.saleForm.actions.cancel'
                            )}
                        </button>


                        <button
                            type="submit"

                            className="
                                ui-button-primary

                                group

                                h-11

                                w-full
                                sm:w-auto

                                rounded-xl

                                px-5
                            "
                        >

                            <Save
                                size={16}

                                className="
                                    transition-transform
                                    duration-300

                                    group-hover:-translate-y-0.5
                                "
                            />

                            {t(
                                'credit.saleForm.actions.submit'
                            )}

                        </button>

                    </div>

                </form>

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
                mb-4

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

                    bg-[var(--surface-muted)]

                    border
                    border-[var(--border-subtle)]
                "
            >

                <Icon
                    size={15}

                    className="
                        text-[var(--accent)]
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
// Field
// =========================================================

function Field({
    label,
    optional,
    icon: Icon,
    iconPosition,
    children,
}) {

    return (

        <div
            className="
                min-w-0
            "
        >

            <label
                className="
                    mb-2

                    block

                    text-xs

                    font-medium

                    text-[var(--text-muted)]
                "
            >

                {label}


                {optional && (

                    <span
                        className="
                            ms-1

                            text-[10px]

                            font-normal

                            text-[var(--text-muted)]
                        "
                    >
                        {optional}
                    </span>

                )}

            </label>


            <div
                className="
                    relative
                "
            >

                <Icon
                    size={15}

                    className={`
                        pointer-events-none

                        absolute

                        ${iconPosition}

                        top-1/2
                        -translate-y-1/2

                        z-10

                        text-[var(--text-muted)]
                    `}
                />


                {children}

            </div>

        </div>

    );

}


export default CreditSaleForm;