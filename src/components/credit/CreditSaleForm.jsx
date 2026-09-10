import {
    useEffect,
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
    Loader2,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import {
    getProducts,
} from '../../database/db';


// =========================================================
// Helpers
// =========================================================

const toEnglishNumbers = (value) => {

    return String(value ?? '')
        .replace(/[۰-۹]/g, (digit) =>
            String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
        )
        .replace(/[٠-٩]/g, (digit) =>
            String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
        );

};


const toNumber = (value) => {

    const normalized = toEnglishNumbers(value)
        .replace(/,/g, '')
        .replace(/٬/g, '')
        .replace(/[^\d.-]/g, '');

    const number = Number(normalized);

    return Number.isFinite(number) ? number : 0;

};


// =========================================================
// Shared Field Class (no padding — so pl/pr utilities work)
// =========================================================

const FIELD_CLASS = `
    w-full h-11
    rounded-xl
    border border-[var(--input-border)]
    bg-[var(--input-bg)]
    text-sm
    text-[var(--text)]
    placeholder:text-[var(--text-soft)]
    outline-none
    transition-colors duration-200
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    disabled:opacity-50
`;


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
    // Products (loaded from DB)
    // =======================================================

    const [
        products,
        setProducts,
    ] = useState([]);


    const [
        loadingProducts,
        setLoadingProducts,
    ] = useState(true);


    // =======================================================
    // Form State
    // =======================================================

    const [
        formData,
        setFormData,
    ] = useState({

        customerName: '',

        phone: '',

        productId: '',

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
    // Load Products
    // =======================================================

    useEffect(() => {

        let mounted = true;


        const loadProducts = async () => {

            try {

                setLoadingProducts(true);


                const result =
                    await getProducts();


                if (!mounted) {
                    return;
                }


                setProducts(
                    Array.isArray(result)
                        ? result
                        : []
                );

            } catch (loadError) {

                console.error(
                    'Failed to load products for credit form:',
                    loadError
                );


                if (mounted) {
                    setProducts([]);
                }

            } finally {

                if (mounted) {
                    setLoadingProducts(false);
                }

            }

        };


        loadProducts();


        const handleProductsUpdated = () => {
            loadProducts();
        };


        window.addEventListener(
            'products-updated',
            handleProductsUpdated
        );


        return () => {

            mounted = false;

            window.removeEventListener(
                'products-updated',
                handleProductsUpdated
            );

        };

    }, []);


    // =======================================================
    // Only Products With Stock > 0
    // =======================================================

    const availableProducts =
        useMemo(() => {

            return products.filter((product) => {

                const stock =
                    Number(
                        toEnglishNumbers(
                            product?.stock
                        )
                    ) || 0;


                return stock > 0;

            });

        }, [products]);


    // =======================================================
    // Handle Input Change (text fields)
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
    // Handle Product Select
    // Auto-fills unit price from the selected product
    // =======================================================

    const handleProductChange = (
        event
    ) => {

        const value =
            event.target.value;


        const product =
            availableProducts.find(
                (item) =>
                    String(item.id) ===
                    String(value)
            );


        setFormData(
            (
                previous
            ) => ({

                ...previous,

                productId:
                    value,

                product:
                    product?.name || '',

                unitPrice:
                    product?.sellPrice !==
                        undefined &&
                    product?.sellPrice !==
                        null
                        ? String(
                            product.sellPrice
                        )
                        : previous.unitPrice,

            })
        );


        setError('');

    };


    // =======================================================
    // Handle Quantity (numeric only)
    // =======================================================

    const handleQuantityChange = (
        event
    ) => {

        const normalized =
            toEnglishNumbers(
                event.target.value
            ).replace(
                /[^\d]/g,
                ''
            );


        setFormData(
            (
                previous
            ) => ({

                ...previous,

                quantity:
                    normalized,

            })
        );


        setError('');

    };


    // =======================================================
    // Handle Unit Price (numeric only)
    // =======================================================

    const handleUnitPriceChange = (
        event
    ) => {

        const normalized =
            toEnglishNumbers(
                event.target.value
            ).replace(
                /[^\d]/g,
                ''
            );


        setFormData(
            (
                previous
            ) => ({

                ...previous,

                unitPrice:
                    normalized,

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
                    toNumber(
                        formData.quantity
                    );


                const unitPrice =
                    toNumber(
                        formData.unitPrice
                    );


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
            !formData.productId ||
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
            toNumber(
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
            toNumber(
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

            productId:
                formData.productId,

            product:
                formData.product.trim(),

            quantity:
                toNumber(
                    formData.quantity
                ),

            unitPrice:
                toNumber(
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
    // Direction Helpers
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
                                            ${FIELD_CLASS}
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
                                            ${FIELD_CLASS}
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

                                {/* Product Select */}

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

                                    {loadingProducts ? (

                                        <div
                                            className="
                                                flex
                                                h-11
                                                w-full

                                                items-center
                                                justify-center

                                                rounded-xl

                                                border
                                                border-[var(--input-border)]

                                                bg-[var(--input-bg)]

                                                text-[var(--text-muted)]
                                            "
                                        >

                                            <Loader2
                                                size={16}
                                                className="
                                                    animate-spin
                                                "
                                            />

                                        </div>

                                    ) : (

                                        <select
                                            name="productId"

                                            value={
                                                formData.productId
                                            }

                                            onChange={
                                                handleProductChange
                                            }

                                            className={`
                                                ${FIELD_CLASS}
                                                ${inputIconPadding}
                                                cursor-pointer
                                            `}
                                        >

                                            <option value="">
                                                {t(
                                                    'credit.saleForm.sale.productPlaceholder'
                                                )}
                                            </option>


                                            {availableProducts.map(
                                                (product) => (

                                                    <option
                                                        key={
                                                            product.id
                                                        }

                                                        value={
                                                            product.id
                                                        }
                                                    >
                                                        {product.name}
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    )}

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
                                            type="text"

                                            inputMode="numeric"

                                            name="quantity"

                                            value={
                                                formData.quantity
                                            }

                                            onChange={
                                                handleQuantityChange
                                            }

                                            placeholder={t(
                                                'credit.saleForm.sale.quantityPlaceholder'
                                            )}

                                            className={`
                                                ${FIELD_CLASS}
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
                                                type="text"

                                                inputMode="numeric"

                                                name="unitPrice"

                                                value={
                                                    formData.unitPrice
                                                }

                                                onChange={
                                                    handleUnitPriceChange
                                                }

                                                placeholder={t(
                                                    'credit.saleForm.sale.unitPricePlaceholder'
                                                )}

                                                dir="ltr"

                                                className={`
                                                    ${FIELD_CLASS}

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
                                        ${FIELD_CLASS}
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