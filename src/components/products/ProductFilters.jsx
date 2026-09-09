import {
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';


// =========================================================
// Convert Persian / Arabic Numbers To English
// =========================================================

const toEnglishNumbers = (value) => {

    return String(value ?? '')

        .replace(
            /[۰-۹]/g,
            (digit) =>
                String(
                    '۰۱۲۳۴۵۶۷۸۹'
                        .indexOf(digit)
                )
        )

        .replace(
            /[٠-٩]/g,
            (digit) =>
                String(
                    '٠١٢٣٤٥٦٧٨٩'
                        .indexOf(digit)
                )
        );

};


// =========================================================
// Product Filters
// =========================================================

function ProductFilters({

    search = '',

    category = 'all',

    stockStatus = 'all',

    categories = [],

    onSearchChange,

    onCategoryChange,

    onStockStatusChange,

    onClearFilters,

}) {

    const { t } =
        useTranslation();


    // =====================================================
    // Stock Status
    // =====================================================

    const stockStatuses = [

        {
            value: 'all',
            label: t(
                'productFilters.allProducts'
            ),
        },

        {
            value: 'available',
            label: t(
                'productFilters.available'
            ),
        },

        {
            value: 'low',
            label: t(
                'productFilters.lowStock'
            ),
        },

        {
            value: 'out',
            label: t(
                'productFilters.outOfStock'
            ),
        },

    ];


    // =====================================================
    // Has Active Filters
    // =====================================================

    const hasFilters =
        search.trim() !== '' ||
        category !== 'all' ||
        stockStatus !== 'all';


    // =====================================================
    // Category Options
    // =====================================================

    const categoryOptions = [

        {
            value: 'all',
            label: t(
                'productFilters.allCategories'
            ),
        },

        ...categories

            .filter(Boolean)

            .map((item) => {

                if (
                    typeof item === 'object' &&
                    item !== null
                ) {

                    return {

                        value: item.name,

                        label: item.name,

                    };

                }


                return {

                    value: item,

                    label: item,

                };

            })

            .filter(
                (item) =>
                    item.value
            ),

    ];


    // =====================================================
    // Search Change
    // =====================================================

    const handleSearchChange = (
        event
    ) => {

        const value =
            toEnglishNumbers(
                event.target.value
            );

        onSearchChange?.(value);

    };


    // =====================================================
    // Clear
    // =====================================================

    const handleClear = () => {
        onClearFilters?.();
    };


    // =====================================================
    // Render
    // =====================================================

    return (

        <section
            className="
                relative
                overflow-hidden

                rounded-2xl

                border
                border-slate-200
                dark:border-slate-800

                bg-white
                dark:bg-slate-900

                p-4

                shadow-sm
                shadow-slate-200/40
                dark:shadow-none
            "
        >

            {/* Accent */}

            <div
                className="
                    absolute
                    top-0
                    inset-x-0

                    h-px

                    bg-emerald-500

                    opacity-20
                "
            />


            {/* Header */}

            <div
                className="
                    flex
                    flex-col
                    xs:flex-row

                    xs:items-center
                    xs:justify-between

                    gap-3

                    mb-4
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-2.5

                        min-w-0
                    "
                >

                    <div
                        className="
                            w-9
                            h-9
                            shrink-0

                            rounded-xl

                            bg-slate-100
                            dark:bg-slate-800

                            border
                            border-slate-200
                            dark:border-slate-700

                            flex
                            items-center
                            justify-center
                        "
                    >

                        <SlidersHorizontal
                            size={16}

                            className="
                                text-slate-500
                                dark:text-slate-400
                            "
                        />

                    </div>


                    <div className="min-w-0">

                        <h3
                            className="
                                text-sm
                                font-semibold

                                text-slate-900
                                dark:text-white

                                truncate
                            "
                        >
                            {t(
                                'productFilters.title'
                            )}
                        </h3>


                        <p
                            className="
                                mt-0.5

                                text-[10px]

                                text-slate-400
                                dark:text-slate-500
                            "
                        >
                            {t(
                                'productFilters.description'
                            )}
                        </p>

                    </div>

                </div>


                {hasFilters && (

                    <button
                        type="button"

                        onClick={
                            handleClear
                        }

                        className="
                            self-start
                            xs:self-auto

                            shrink-0

                            flex
                            items-center
                            gap-1.5

                            px-2.5
                            py-1.5

                            rounded-lg

                            text-[11px]

                            text-slate-500

                            hover:text-red-500
                            hover:bg-red-500/5

                            dark:hover:text-red-400

                            transition
                        "
                    >

                        <X size={13} />

                        {t(
                            'productFilters.clear'
                        )}

                    </button>

                )}

            </div>


            {/* Filters */}

            <div
                className="
                    grid

                    grid-cols-1
                    md:grid-cols-3

                    gap-3
                "
            >

                {/* Search */}

                <div
                    className="
                        relative
                        min-w-0
                    "
                >

                    <Search
                        size={16}

                        className="
                            absolute

                            start-3
                            top-1/2

                            -translate-y-1/2

                            text-slate-400
                            dark:text-slate-600

                            pointer-events-none
                        "
                    />


                    <input
                        type="text"

                        value={search}

                        onChange={
                            handleSearchChange
                        }

                        placeholder={
                            t(
                                'productFilters.searchPlaceholder'
                            )
                        }

                        className="
                            w-full
                            h-11

                            rounded-xl

                            border
                            border-slate-200
                            dark:border-slate-800

                            bg-slate-50
                            dark:bg-slate-950/60

                            ps-10
                            pe-4

                            text-sm

                            text-slate-700
                            dark:text-slate-200

                            placeholder:text-slate-400
                            dark:placeholder:text-slate-600

                            outline-none

                            focus:border-emerald-500/50
                            focus:ring-2
                            focus:ring-emerald-500/10

                            transition
                        "
                    />

                </div>


                {/* Category */}

                <div
                    className="
                        relative
                        min-w-0
                    "
                >

                    <select
                        value={category}

                        onChange={(event) =>
                            onCategoryChange?.(
                                event.target.value
                            )
                        }

                        className="
                            appearance-none

                            w-full
                            h-11

                            rounded-xl

                            border
                            border-slate-200
                            dark:border-slate-800

                            bg-slate-50
                            dark:bg-slate-950/60

                            ps-4
                            pe-10

                            text-sm

                            text-slate-700
                            dark:text-slate-300

                            outline-none

                            focus:border-emerald-500/50
                            focus:ring-2
                            focus:ring-emerald-500/10

                            transition

                            cursor-pointer
                        "
                    >

                        {categoryOptions.map(
                            (item) => (

                                <option
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </option>

                            )
                        )}

                    </select>


                    <ChevronDown
                        size={16}

                        className="
                            absolute

                            end-3
                            top-1/2

                            -translate-y-1/2

                            text-slate-400
                            dark:text-slate-600

                            pointer-events-none
                        "
                    />

                </div>


                {/* Stock Status */}

                <div
                    className="
                        relative
                        min-w-0
                    "
                >

                    <select
                        value={stockStatus}

                        onChange={(event) =>
                            onStockStatusChange?.(
                                event.target.value
                            )
                        }

                        className="
                            appearance-none

                            w-full
                            h-11

                            rounded-xl

                            border
                            border-slate-200
                            dark:border-slate-800

                            bg-slate-50
                            dark:bg-slate-950/60

                            ps-4
                            pe-10

                            text-sm

                            text-slate-700
                            dark:text-slate-300

                            outline-none

                            focus:border-emerald-500/50
                            focus:ring-2
                            focus:ring-emerald-500/10

                            transition

                            cursor-pointer
                        "
                    >

                        {stockStatuses.map(
                            (item) => (

                                <option
                                    key={item.value}
                                    value={item.value}
                                >
                                    {item.label}
                                </option>

                            )
                        )}

                    </select>


                    <ChevronDown
                        size={16}

                        className="
                            absolute

                            end-3
                            top-1/2

                            -translate-y-1/2

                            text-slate-400
                            dark:text-slate-600

                            pointer-events-none
                        "
                    />

                </div>

            </div>


            {/* Active Filters */}

            {hasFilters && (

                <div
                    className="
                        flex
                        flex-wrap

                        items-center

                        gap-2

                        mt-4
                        pt-4

                        border-t
                        border-slate-200
                        dark:border-slate-800
                    "
                >

                    <span
                        className="
                            text-[10px]

                            text-slate-400
                            dark:text-slate-500
                        "
                    >
                        {t(
                            'productFilters.activeFilters'
                        )}
                    </span>


                    {/* Search */}

                    {search.trim() !== '' && (

                        <span
                            className="
                                inline-flex
                                items-center
                                gap-1.5

                                max-w-full

                                px-2.5
                                py-1.5

                                rounded-lg

                                bg-emerald-500/10

                                border
                                border-emerald-500/10

                                text-[10px]

                                text-emerald-600
                                dark:text-emerald-400
                            "
                        >

                            <Search
                                size={11}
                                className="shrink-0"
                            />

                            <span
                                className="
                                    max-w-[12rem]

                                    truncate
                                "
                            >
                                {search}
                            </span>

                        </span>

                    )}


                    {/* Category */}

                    {category !== 'all' && (

                        <span
                            className="
                                inline-flex
                                items-center
                                gap-1.5

                                max-w-full

                                px-2.5
                                py-1.5

                                rounded-lg

                                bg-slate-100
                                dark:bg-slate-800

                                text-[10px]

                                text-slate-500
                                dark:text-slate-400
                            "
                        >

                            {t(
                                'productFilters.category'
                            )}

                            <span
                                className="
                                    max-w-[10rem]
                                    truncate

                                    text-slate-700
                                    dark:text-slate-300
                                "
                            >
                                {
                                    categoryOptions.find(
                                        (item) =>
                                            item.value ===
                                            category
                                    )?.label ||
                                    category
                                }
                            </span>

                        </span>

                    )}


                    {/* Stock */}

                    {stockStatus !== 'all' && (

                        <span
                            className="
                                inline-flex
                                items-center
                                gap-1.5

                                px-2.5
                                py-1.5

                                rounded-lg

                                bg-slate-100
                                dark:bg-slate-800

                                text-[10px]

                                text-slate-500
                                dark:text-slate-400
                            "
                        >

                            {t(
                                'productFilters.status'
                            )}

                            <span
                                className="
                                    text-slate-700
                                    dark:text-slate-300
                                "
                            >
                                {
                                    stockStatuses.find(
                                        (item) =>
                                            item.value ===
                                            stockStatus
                                    )?.label
                                }
                            </span>

                        </span>

                    )}

                </div>

            )}

        </section>

    );

}


export default ProductFilters;

