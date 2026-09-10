import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import {
    getCategories,
} from '../../database/db';


// =========================================================
// Default Filters
// =========================================================

const DEFAULT_FILTERS = {
    search: '',
    paymentType: 'all',
    category: 'all',
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
// Sales Filters
// =========================================================

function SalesFilters({

    filters = DEFAULT_FILTERS,

    onChange,

}) {

    const {
        t,
        i18n,
    } = useTranslation();


    const isEnglish =
        i18n.language === 'en';


    // =====================================================
    // Normalize Filters
    // =====================================================

    const {
        search = '',
        paymentType = 'all',
        category = 'all',
    } = filters;


    // =====================================================
    // Categories
    // =====================================================

    const [
        categories,
        setCategories,
    ] = useState([]);


    const [
        loadingCategories,
        setLoadingCategories,
    ] = useState(true);


    // =====================================================
    // Load Categories
    // =====================================================

    const loadCategories = async () => {

        try {

            setLoadingCategories(true);


            const result =
                await getCategories();


            const safeCategories =
                Array.isArray(result)
                    ? result
                    : [];


            setCategories(
                safeCategories
            );


        } catch (error) {

            console.error(
                'Failed to load sales categories:',
                error
            );


            setCategories([]);


        } finally {

            setLoadingCategories(false);

        }

    };


    // =====================================================
    // Initial Load + Database Events
    // =====================================================

    useEffect(() => {

        let mounted = true;


        const load = async () => {

            try {

                setLoadingCategories(true);


                const result =
                    await getCategories();


                if (!mounted) {
                    return;
                }


                setCategories(
                    Array.isArray(result)
                        ? result
                        : []
                );


            } catch (error) {

                console.error(
                    'Failed to load sales categories:',
                    error
                );


                if (mounted) {
                    setCategories([]);
                }


            } finally {

                if (mounted) {
                    setLoadingCategories(false);
                }

            }

        };


        load();


        const handleCategoriesUpdated = () => {
            loadCategories();
        };


        const handleDatabaseUpdated = () => {
            loadCategories();
        };


        window.addEventListener(
            'categories-updated',
            handleCategoriesUpdated
        );


        window.addEventListener(
            'database-updated',
            handleDatabaseUpdated
        );


        return () => {

            mounted = false;


            window.removeEventListener(
                'categories-updated',
                handleCategoriesUpdated
            );


            window.removeEventListener(
                'database-updated',
                handleDatabaseUpdated
            );

        };

    }, []);


    // =====================================================
    // Payment Types
    // =====================================================

    const paymentTypes = useMemo(() => {

        return [

            {
                value: 'all',

                label: t(
                    'sales.filters.allPayments'
                ),
            },

            {
                value: 'cash',

                label: t(
                    'sales.filters.cash'
                ),
            },

            {
                value: 'credit',

                label: t(
                    'sales.filters.credit'
                ),
            },

        ];

    }, [t, i18n.language]);


    // =====================================================
    // Category Options
    // =====================================================

    const categoryOptions =
        useMemo(() => {

            const uniqueCategories =
                new Map();


            categories.forEach(
                (item) => {

                    const name =
                        typeof item === 'object' &&
                        item !== null
                            ? item.name
                            : item;


                    if (
                        typeof name !== 'string'
                    ) {
                        return;
                    }


                    const cleanName =
                        name.trim();


                    if (!cleanName) {
                        return;
                    }


                    const key =
                        cleanName.toLowerCase();


                    if (
                        !uniqueCategories.has(key)
                    ) {

                        uniqueCategories.set(
                            key,
                            cleanName
                        );

                    }

                }
            );


            return [

                {
                    value: 'all',

                    label: t(
                        'sales.filters.allCategories'
                    ),
                },

                ...Array.from(
                    uniqueCategories.values()
                ).map(
                    (name) => ({
                        value: name,
                        label: name,
                    })
                ),

            ];

        }, [
            categories,
            t,
            i18n.language,
        ]);


    // =====================================================
    // Active Filters
    // =====================================================

    const hasFilters =
        search.trim() !== '' ||
        paymentType !== 'all' ||
        category !== 'all';


    // =====================================================
    // Search
    // =====================================================

    const handleSearchChange = (
        event
    ) => {

        onChange?.({

            ...filters,

            search:
                event.target.value,

        });

    };


    // =====================================================
    // Payment
    // =====================================================

    const handlePaymentChange = (
        event
    ) => {

        onChange?.({

            ...filters,

            paymentType:
                event.target.value,

        });

    };


    // =====================================================
    // Category
    // =====================================================

    const handleCategoryChange = (
        event
    ) => {

        onChange?.({

            ...filters,

            category:
                event.target.value,

        });

    };


    // =====================================================
    // Clear
    // =====================================================

    const handleClear = () => {

        onChange?.({
            ...DEFAULT_FILTERS,
        });

    };


    // =====================================================
    // Render
    // =====================================================

    return (

        <section
            dir={isEnglish ? 'ltr' : 'rtl'}
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
                    min-[420px]:flex-row

                    min-[420px]:items-center
                    min-[420px]:justify-between

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


                    <div
                        className="
                            min-w-0
                        "
                    >

                        <h3
                            className="
                                text-sm
                                font-semibold

                                text-[var(--text)]

                                truncate
                            "
                        >
                            {t(
                                'sales.filters.title'
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
                                'sales.filters.description'
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
                            min-[420px]:self-auto

                            shrink-0

                            flex
                            items-center
                            justify-center
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
                            'sales.filters.clear'
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
                                'sales.filters.searchPlaceholder'
                            )
                        }

                        className={`
                            ${FIELD_CLASS}
                            ps-10
                            pe-4
                        `}
                    />

                </div>


                {/* Payment */}

                <div
                    className="
                        relative
                        min-w-0
                    "
                >

                    <select
                        value={paymentType}

                        onChange={
                            handlePaymentChange
                        }

                        className={`
                            ${FIELD_CLASS}
                            appearance-none
                            ps-4
                            pe-10
                            cursor-pointer
                        `}
                    >

                        {paymentTypes.map(
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


                {/* Category */}

                <div
                    className="
                        relative
                        min-w-0
                    "
                >

                    <select
                        value={
                            categoryOptions.some(
                                (item) =>
                                    item.value ===
                                    category
                            )
                                ? category
                                : 'all'
                        }

                        onChange={
                            handleCategoryChange
                        }

                        disabled={
                            loadingCategories
                        }

                        className={`
                            ${FIELD_CLASS}
                            appearance-none
                            ps-4
                            pe-10
                            cursor-pointer
                            disabled:opacity-50
                            disabled:cursor-not-allowed
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
                            'sales.filters.activeFilters'
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


                    {/* Payment */}

                    {paymentType !== 'all' && (

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
                                'sales.filters.payment'
                            )}

                            <span
                                className="
                                    text-[var(--text-secondary)]
                                "
                            >
                                {
                                    paymentTypes.find(
                                        (item) =>
                                            item.value ===
                                            paymentType
                                    )?.label
                                }
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
                                'sales.filters.category'
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

                </div>

            )}

        </section>

    );

}


export default SalesFilters;