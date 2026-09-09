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

                bg-black/60
                dark:bg-black/70

                backdrop-blur-sm

                flex
                items-center
                justify-center

                p-3
                sm:p-4
            "

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
                    w-full
                    max-w-lg

                    max-h-[calc(100vh-1.5rem)]
                    sm:max-h-[90vh]

                    overflow-y-auto

                    rounded-2xl

                    border
                    border-slate-200
                    dark:border-slate-700

                    bg-white
                    dark:bg-slate-900

                    shadow-2xl
                    shadow-slate-900/10
                    dark:shadow-black/50
                "
            >

                {/* =================================================
                    Header
                ================================================== */}

                <div
                    className="
                        flex
                        items-center
                        justify-between

                        gap-3

                        px-4
                        py-4

                        sm:px-5

                        border-b
                        border-slate-200
                        dark:border-slate-800
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

                                bg-emerald-500/10

                                flex
                                items-center
                                justify-center
                            "
                        >

                            <ShoppingCart
                                size={19}

                                className="
                                    text-emerald-600
                                    dark:text-emerald-400
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

                                    text-slate-900
                                    dark:text-white

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

                                    text-slate-500

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
                            w-9
                            h-9
                            shrink-0

                            rounded-lg

                            flex
                            items-center
                            justify-center

                            text-slate-400
                            dark:text-slate-500

                            hover:text-slate-900
                            dark:hover:text-white

                            hover:bg-slate-100
                            dark:hover:bg-slate-800

                            disabled:opacity-50

                            transition
                        "
                    >

                        <X
                            size={18}
                        />

                    </button>

                </div>


                {/* =================================================
                    Form
                ================================================== */}

                <form
                    onSubmit={handleSubmit}

                    className="
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
                                border-red-500/20

                                bg-red-500/10

                                px-4
                                py-3

                                text-xs

                                text-red-600
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

                                text-slate-600
                                dark:text-slate-400

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

                            className="
                                w-full
                                h-11

                                px-3

                                rounded-xl

                                bg-slate-50
                                dark:bg-slate-950

                                border
                                border-slate-200
                                dark:border-slate-800

                                text-sm

                                text-slate-900
                                dark:text-white

                                placeholder:text-slate-400
                                dark:placeholder:text-slate-600

                                outline-none

                                focus:border-emerald-500/50

                                disabled:opacity-60

                                transition
                            "
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

                                    text-slate-600
                                    dark:text-slate-400

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

                                className="
                                    w-full
                                    h-11

                                    px-3

                                    rounded-xl

                                    bg-slate-50
                                    dark:bg-slate-950

                                    border
                                    border-slate-200
                                    dark:border-slate-800

                                    text-sm

                                    text-slate-900
                                    dark:text-white

                                    text-left

                                    outline-none

                                    focus:border-emerald-500/50

                                    disabled:opacity-60
                                "
                            />

                        </div>


                        {/* Unit */}

                        <div>

                            <label
                                className="
                                    block

                                    text-xs
                                    font-medium

                                    text-slate-600
                                    dark:text-slate-400

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

                                className="
                                    w-full
                                    h-11

                                    px-3

                                    rounded-xl

                                    bg-slate-50
                                    dark:bg-slate-950

                                    border
                                    border-slate-200
                                    dark:border-slate-800

                                    text-sm

                                    text-slate-900
                                    dark:text-white

                                    outline-none

                                    focus:border-emerald-500/50

                                    disabled:opacity-60
                                "
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

                                text-slate-600
                                dark:text-slate-400

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

                            className="
                                w-full
                                h-11

                                px-3

                                rounded-xl

                                bg-slate-50
                                dark:bg-slate-950

                                border
                                border-slate-200
                                dark:border-slate-800

                                text-sm

                                text-slate-900
                                dark:text-white

                                placeholder:text-slate-400
                                dark:placeholder:text-slate-600

                                outline-none

                                focus:border-emerald-500/50

                                disabled:opacity-60
                            "
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

                                text-slate-500
                                dark:text-slate-600

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

                                text-slate-600
                                dark:text-slate-400

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

                            className="
                                w-full
                                h-11

                                px-3

                                rounded-xl

                                bg-slate-50
                                dark:bg-slate-950

                                border
                                border-slate-200
                                dark:border-slate-800

                                text-sm

                                text-slate-900
                                dark:text-white

                                outline-none

                                focus:border-emerald-500/50

                                disabled:opacity-60
                            "
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

                                text-slate-600
                                dark:text-slate-400

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

                            className="
                                w-full

                                px-3
                                py-3

                                rounded-xl

                                bg-slate-50
                                dark:bg-slate-950

                                border
                                border-slate-200
                                dark:border-slate-800

                                text-sm

                                text-slate-900
                                dark:text-white

                                placeholder:text-slate-400
                                dark:placeholder:text-slate-600

                                outline-none

                                resize-none

                                focus:border-emerald-500/50

                                disabled:opacity-60

                                leading-6
                            "
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
                                w-full

                                h-11

                                rounded-xl

                                bg-emerald-500
                                hover:bg-emerald-400

                                disabled:opacity-50
                                disabled:cursor-not-allowed

                                text-slate-950

                                text-sm
                                font-semibold

                                flex
                                items-center
                                justify-center
                                gap-2

                                transition
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
                                w-full
                                sm:w-auto

                                h-11

                                px-5

                                rounded-xl

                                bg-slate-100
                                dark:bg-slate-800

                                hover:bg-slate-200
                                dark:hover:bg-slate-700

                                disabled:opacity-50

                                text-slate-700
                                dark:text-slate-300

                                text-sm

                                transition
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