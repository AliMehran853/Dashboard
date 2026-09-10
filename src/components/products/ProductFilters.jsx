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
// Shared Field Class (accent-aware)
// =========================================================

const FIELD_CLASS = `
    w-full
    h-11

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

    transition
`;


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
                group
                relative
                overflow-hidden

                rounded-2xl

                border
                border-[var(--border)]

                p-4

                shadow-[var(--shadow-card)]

                transition-all
                duration-300
                ease-[var(--ease-out)]

                hover:border-[var(--glass-border-hover)]
                hover:shadow-[var(--shadow-card-hover)]
            "
            style={{
                background: `
                    linear-gradient(
                        135deg,
                        var(--glass-active-tint),
                        var(--glass-active-tint-soft) 70%,
                        transparent 100%
                    ),
                    var(--surface)
                `,
            }}
        >

            {/* =================================================
                Hover Tint Overlay
                Fades in on hover, follows accent color.
            ================================================= */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    rounded-2xl
                    opacity-0
                    transition-opacity
                    duration-300
                    ease-[var(--ease-out)]
                    group-hover:opacity-100
                "
                style={{
                    background: `
                        linear-gradient(
                            135deg,
                            var(--glass-hover-tint),
                            var(--glass-hover-tint-soft) 70%,
                            transparent 100%
                        )
                    `,
                }}
            />


            {/* =================================================
                Accent Top Line
            ================================================= */}

            <div
                aria-hidden="true"
                className="
                    absolute
                    top-0
                    inset-x-0

                    h-px

                    bg-[var(--accent-500)]

                    opacity-40
                "
            />


            {/* =================================================
                Header
            ================================================= */}

            <div
                className="
                    relative
                    z-10

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

                            bg-[var(--accent-soft)]

                            border
                            border-[var(--accent-border)]

                            flex
                            items-center
                            justify-center
                        "
                    >

                        <SlidersHorizontal
                            size={16}

                            className="
                                text-[var(--accent-500)]
                            "
                        />

                    </div>


                    <div className="min-w-0">

                        <h3
                            className="
                                text-sm
                                font-semibold

                                text-[var(--text)]

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

                                text-[var(--text-muted)]
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

                            text-[var(--text-muted)]

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


            {/* =================================================
                Filters
            ================================================= */}

            <div
                className="
                    relative
                    z-10

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

                            text-[var(--text-soft)]

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

                        className={`
                            ${FIELD_CLASS}
                            ps-10
                            pe-4
                        `}
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

                        className={`
                            ${FIELD_CLASS}
                            appearance-none
                            ps-4
                            pe-10
                            cursor-pointer
                        `}
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

                            text-[var(--text-soft)]

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

                        className={`
                            ${FIELD_CLASS}
                            appearance-none
                            ps-4
                            pe-10
                            cursor-pointer
                        `}
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

                            text-[var(--text-soft)]

                            pointer-events-none
                        "
                    />

                </div>

            </div>


            {/* =================================================
                Active Filters
            ================================================= */}

            {hasFilters && (

                <div
                    className="
                        relative
                        z-10

                        flex
                        flex-wrap

                        items-center

                        gap-2

                        mt-4
                        pt-4

                        border-t
                        border-[var(--border-subtle)]
                    "
                >

                    <span
                        className="
                            text-[10px]

                            text-[var(--text-muted)]
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

                                bg-[var(--accent-soft)]

                                border
                                border-[var(--accent-border)]

                                text-[10px]

                                text-[var(--accent-600)]

                                dark:text-[var(--accent-300)]
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

                                bg-[var(--surface-muted)]

                                border
                                border-[var(--border-subtle)]

                                text-[10px]

                                text-[var(--text-muted)]
                            "
                        >

                            {t(
                                'productFilters.category'
                            )}

                            <span
                                className="
                                    max-w-[10rem]
                                    truncate

                                    text-[var(--text-secondary)]
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

                                bg-[var(--surface-muted)]

                                border
                                border-[var(--border-subtle)]

                                text-[10px]

                                text-[var(--text-muted)]
                            "
                        >

                            {t(
                                'productFilters.status'
                            )}

                            <span
                                className="
                                    text-[var(--text-secondary)]
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