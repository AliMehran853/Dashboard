import {
    useEffect,
    useState,
} from 'react';

import {
    X,
    ShoppingCart,
    Save,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import {
    getCategories,
} from '../../database/db';


// =========================================================
// Shared Field Class (accent-aware)
// =========================================================

const FIELD_CLASS = `
    w-full
    h-11

    px-3

    rounded-xl

    border
    border-[var(--input-border)]

    bg-[var(--input-bg)]

    text-sm

    text-[var(--text)]

    placeholder:text-[var(--text-soft)]

    outline-none

    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]

    disabled:opacity-60

    transition
`;


const TEXTAREA_CLASS = `
    w-full

    px-3
    py-3

    rounded-xl

    border
    border-[var(--input-border)]

    bg-[var(--input-bg)]

    text-sm

    text-[var(--text)]

    placeholder:text-[var(--text-soft)]

    outline-none
    resize-none

    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]

    disabled:opacity-60

    leading-6

    transition
`;


// =========================================================
// Modal Panel Style
// =========================================================

const MODAL_PANEL_STYLE = {
    background: `
        linear-gradient(
            135deg,
            var(--glass-active-tint),
            var(--glass-active-tint-soft) 70%,
            transparent 100%
        ),
        var(--glass-bg-strong)
    `,
    backdropFilter:
        'blur(var(--glass-blur-strong)) saturate(220%) brightness(1.12)',
    WebkitBackdropFilter:
        'blur(var(--glass-blur-strong)) saturate(220%) brightness(1.12)',
    boxShadow:
        'var(--shadow-xl), var(--glass-inner-shadow)',
};


// =========================================================
// Shopping List Form
// =========================================================

function ShoppingListForm({

    item = null,

    saving = false,

    onClose,

    onSubmit,

}) {

    const {
        t,
        i18n,
    } = useTranslation();


    // =====================================================
    // Form State
    // =====================================================

    const getDefaultFormData = () => ({

        name: '',

        quantity: 1,

        unit: 'عدد',

        category: '',

        priority: 'normal',

        note: '',

    });


    const [
        formData,
        setFormData,
    ] = useState(
        getDefaultFormData()
    );


    const [
        categories,
        setCategories,
    ] = useState([]);


    const [
        error,
        setError,
    ] = useState('');


    // =====================================================
    // Units
    // =====================================================

    const units = [

        {
            value: 'عدد',
            label:
                t(
                    'shoppingList.form.units.piece'
                ),
        },

        {
            value: 'بسته',
            label:
                t(
                    'shoppingList.form.units.pack'
                ),
        },

        {
            value: 'کارتن',
            label:
                t(
                    'shoppingList.form.units.carton'
                ),
        },

        {
            value: 'کیلو',
            label:
                t(
                    'shoppingList.form.units.kilogram'
                ),
        },

        {
            value: 'گرم',
            label:
                t(
                    'shoppingList.form.units.gram'
                ),
        },

        {
            value: 'لیتر',
            label:
                t(
                    'shoppingList.form.units.liter'
                ),
        },

        {
            value: 'متر',
            label:
                t(
                    'shoppingList.form.units.meter'
                ),
        },

    ];


    // =====================================================
    // Load Categories
    // =====================================================

    useEffect(() => {

        let active = true;


        const loadCategories = async () => {

            try {

                const data =
                    await getCategories();


                if (!active) {
                    return;
                }


                setCategories(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (loadError) {

                console.error(
                    'Failed to load categories:',
                    loadError
                );

            }

        };


        loadCategories();


        return () => {

            active = false;

        };

    }, []);


    // =====================================================
    // Load Item For Edit
    // =====================================================

    useEffect(() => {

        if (item) {

            setFormData({

                name:
                    item.name || '',

                quantity:
                    item.quantity ?? 1,

                unit:
                    item.unit || 'عدد',

                category:
                    item.category || '',

                priority:
                    item.priority || 'normal',

                note:
                    item.note ||
                    item.description ||
                    '',

            });

        } else {

            setFormData(
                getDefaultFormData()
            );

        }


        setError('');

    }, [item]);


    // =====================================================
    // Change Handler
    // =====================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setFormData(
            (current) => ({

                ...current,

                [name]: value,

            })
        );

    };


    // =====================================================
    // Submit
    // =====================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setError('');


        const name =
            formData.name.trim();


        if (!name) {

            setError(
                t(
                    'shoppingList.form.errors.nameRequired'
                )
            );

            return;

        }


        const quantity =
            Number(
                formData.quantity
            );


        if (
            !Number.isFinite(
                quantity
            ) ||
            quantity <= 0
        ) {

            setError(
                t(
                    'shoppingList.form.errors.quantityInvalid'
                )
            );

            return;

        }


        try {

            await onSubmit({

                name,

                quantity,

                unit:
                    formData.unit?.trim() ||
                    'عدد',

                category:
                    formData.category?.trim() ||
                    '',

                priority:
                    formData.priority ||
                    'normal',

                note:
                    formData.note?.trim() ||
                    '',

            });

        } catch (submitError) {

            console.error(
                'Failed to save shopping item:',
                submitError
            );


            setError(
                submitError?.message ||
                t(
                    'shoppingList.form.errors.save'
                )
            );

        }

    };


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            className="
                fixed
                inset-0
                z-50

                backdrop-blur-md

                flex
                items-center
                justify-center

                p-3
                sm:p-4
            "

            style={{
                background: `
                    radial-gradient(
                        circle at 50% 50%,
                        rgba(0, 0, 0, 0.55),
                        rgba(0, 0, 0, 0.72)
                    )
                `,
            }}

            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {

                    if (!saving) {

                        onClose();

                    }

                }

            }}
        >

            <div
                dir={i18n.dir()}

                className="
                    relative
                    flex flex-col

                    w-full
                    max-w-lg

                    max-h-[calc(100vh-1.5rem)]
                    sm:max-h-[90vh]

                    overflow-hidden

                    rounded-2xl

                    border
                    border-[var(--glass-border)]
                "

                style={MODAL_PANEL_STYLE}
            >

                {/* =================================================
                    Header (fixed)
                ================================================== */}

                <div
                    className="
                        flex-shrink-0

                        flex
                        items-center
                        justify-between

                        gap-3

                        px-4
                        py-4

                        sm:px-5

                        border-b
                        border-[var(--border-subtle)]
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
                                w-10
                                h-10
                                shrink-0

                                rounded-xl

                                bg-[var(--accent-soft)]

                                border
                                border-[var(--accent-border)]

                                flex
                                items-center
                                justify-center
                            "
                        >

                            <ShoppingCart
                                size={19}

                                className="
                                    text-[var(--accent-500)]
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
                                    text-sm
                                    font-bold

                                    text-[var(--text)]

                                    truncate
                                "
                            >

                                {item
                                    ? t(
                                        'shoppingList.form.editTitle'
                                    )
                                    : t(
                                        'shoppingList.form.addTitle'
                                    )
                                }

                            </h2>


                            <p
                                className="
                                    text-[11px]

                                    text-[var(--text-muted)]

                                    mt-1

                                    leading-5
                                "
                            >
                                {t(
                                    'shoppingList.form.subtitle'
                                )}
                            </p>

                        </div>

                    </div>


                    <button
                        type="button"

                        onClick={onClose}

                        disabled={saving}

                        aria-label={t(
                            'shoppingList.details.actions.close'
                        )}

                        className="
                            ui-icon-button

                            h-9
                            w-9

                            rounded-lg
                        "
                    >

                        <X
                            size={18}
                        />

                    </button>

                </div>


                {/* =================================================
                    Form (scrollable body)
                ================================================== */}

                <form
                    onSubmit={handleSubmit}

                    className="
                        flex-1
                        min-h-0
                        overflow-y-auto
                        main-scrollbar

                        p-4
                        sm:p-5

                        space-y-4
                    "
                >

                    {/* Error */}

                    {error && (

                        <div
                            role="alert"

                            className="
                                rounded-xl

                                border
                                border-red-500/25

                                bg-red-500/10

                                px-4
                                py-3

                                text-xs

                                text-red-500
                                dark:text-red-400

                                leading-5
                            "
                        >
                            {error}
                        </div>

                    )}


                    {/* =================================================
                        Name
                    ================================================== */}

                    <div>

                        <label
                            className="
                                block

                                text-xs
                                font-medium

                                text-[var(--text-muted)]

                                mb-2
                            "
                        >
                            {t(
                                'shoppingList.form.fields.name'
                            )}
                        </label>


                        <input
                            type="text"

                            name="name"

                            value={
                                formData.name
                            }

                            onChange={
                                handleChange
                            }

                            placeholder={t(
                                'shoppingList.form.fields.namePlaceholder'
                            )}

                            autoFocus

                            disabled={saving}

                            dir={i18n.dir()}

                            className={FIELD_CLASS}
                        />

                    </div>


                    {/* =================================================
                        Quantity + Unit
                    ================================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-2

                            gap-3
                        "
                    >

                        {/* Quantity */}

                        <div>

                            <label
                                className="
                                    block

                                    text-xs
                                    font-medium

                                    text-[var(--text-muted)]

                                    mb-2
                                "
                            >
                                {t(
                                    'shoppingList.form.fields.quantity'
                                )}
                            </label>


                            <input
                                type="number"

                                name="quantity"

                                min="0.01"

                                step="any"

                                value={
                                    formData.quantity
                                }

                                onChange={
                                    handleChange
                                }

                                disabled={saving}

                                dir="ltr"

                                className={`
                                    ${FIELD_CLASS}
                                    text-left
                                `}
                            />

                        </div>


                        {/* Unit */}

                        <div>

                            <label
                                className="
                                    block

                                    text-xs
                                    font-medium

                                    text-[var(--text-muted)]

                                    mb-2
                                "
                            >
                                {t(
                                    'shoppingList.form.fields.unit'
                                )}
                            </label>


                            <select
                                name="unit"

                                value={
                                    formData.unit
                                }

                                onChange={
                                    handleChange
                                }

                                disabled={saving}

                                dir={i18n.dir()}

                                className={`
                                    ${FIELD_CLASS}
                                    cursor-pointer
                                `}
                            >

                                {units.map(
                                    (unit) => (

                                        <option
                                            key={
                                                unit.value
                                            }

                                            value={
                                                unit.value
                                            }
                                        >
                                            {
                                                unit.label
                                            }
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    {/* =================================================
                        Category
                    ================================================== */}

                    <div>

                        <label
                            className="
                                block

                                text-xs
                                font-medium

                                text-[var(--text-muted)]

                                mb-2
                            "
                        >
                            {t(
                                'shoppingList.form.fields.category'
                            )}
                        </label>


                        <input
                            type="text"

                            name="category"

                            value={
                                formData.category
                            }

                            onChange={
                                handleChange
                            }

                            list="shopping-category-options"

                            placeholder={t(
                                'shoppingList.form.fields.categoryPlaceholder'
                            )}

                            autoComplete="off"

                            disabled={saving}

                            dir={i18n.dir()}

                            className={FIELD_CLASS}
                        />


                        <datalist
                            id="shopping-category-options"
                        >

                            {categories.map(
                                (category) => {

                                    if (
                                        !category?.id &&
                                        !category?.name
                                    ) {

                                        return null;

                                    }


                                    return (

                                        <option
                                            key={
                                                category.id ??
                                                category.name
                                            }

                                            value={
                                                category.name
                                            }
                                        />

                                    );

                                }
                            )}


                            {item?.category &&
                                !categories.some(
                                    (category) =>
                                        category.name ===
                                        item.category
                                ) && (

                                    <option
                                        value={
                                            item.category
                                        }
                                    />

                                )}

                        </datalist>


                        <p
                            className="
                                mt-2

                                text-[10px]

                                text-[var(--text-muted)]

                                leading-5
                            "
                        >
                            {t(
                                'shoppingList.form.fields.categoryHint'
                            )}
                        </p>

                    </div>


                    {/* =================================================
                        Priority
                    ================================================== */}

                    <div>

                        <label
                            className="
                                block

                                text-xs
                                font-medium

                                text-[var(--text-muted)]

                                mb-2
                            "
                        >
                            {t(
                                'shoppingList.form.fields.priority'
                            )}
                        </label>


                        <select
                            name="priority"

                            value={
                                formData.priority
                            }

                            onChange={
                                handleChange
                            }

                            disabled={saving}

                            dir={i18n.dir()}

                            className={`
                                ${FIELD_CLASS}
                                cursor-pointer
                            `}
                        >

                            <option value="low">
                                {t(
                                    'shoppingList.form.priority.low'
                                )}
                            </option>

                            <option value="normal">
                                {t(
                                    'shoppingList.form.priority.normal'
                                )}
                            </option>

                            <option value="high">
                                {t(
                                    'shoppingList.form.priority.high'
                                )}
                            </option>

                            <option value="urgent">
                                {t(
                                    'shoppingList.form.priority.urgent'
                                )}
                            </option>

                        </select>

                    </div>


                    {/* =================================================
                        Note
                    ================================================== */}

                    <div>

                        <label
                            className="
                                block

                                text-xs
                                font-medium

                                text-[var(--text-muted)]

                                mb-2
                            "
                        >
                            {t(
                                'shoppingList.form.fields.note'
                            )}
                        </label>


                        <textarea
                            name="note"

                            value={
                                formData.note
                            }

                            onChange={
                                handleChange
                            }

                            rows="3"

                            placeholder={t(
                                'shoppingList.form.fields.notePlaceholder'
                            )}

                            disabled={saving}

                            dir={i18n.dir()}

                            className={TEXTAREA_CLASS}
                        />

                    </div>


                    {/* =================================================
                        Actions
                    ================================================== */}

                    <div
                        className="
                            grid
                            grid-cols-1
                            sm:grid-cols-[1fr_auto]

                            gap-3

                            pt-2
                        "
                    >

                        <button
                            type="submit"

                            disabled={saving}

                            className="
                                ui-button-primary

                                w-full
                                h-11

                                text-sm
                            "
                        >

                            <Save
                                size={17}
                            />


                            {saving
                                ? t(
                                    'shoppingList.form.actions.saving'
                                )
                                : item
                                    ? t(
                                        'shoppingList.form.actions.saveChanges'
                                    )
                                    : t(
                                        'shoppingList.form.actions.add'
                                    )
                            }

                        </button>


                        <button
                            type="button"

                            onClick={onClose}

                            disabled={saving}

                            className="
                                ui-button-secondary

                                w-full
                                sm:w-auto

                                h-11
                                px-5

                                text-sm
                            "
                        >
                            {t(
                                'shoppingList.form.actions.cancel'
                            )}
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}


export default ShoppingListForm;