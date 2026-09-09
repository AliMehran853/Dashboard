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


            {/* =================================================
                Header
            ================================================= */}

            <div
                className="
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


                    <div
                        className="
                            min-w-0
                        "
                    >

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
                                'sales.filters.title'
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

                            text-slate-500

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
                                'sales.filters.searchPlaceholder'
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

                            text-slate-400
                            dark:text-slate-600

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

                            disabled:opacity-50
                            disabled:cursor-not-allowed
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

            </div>


            {/* =================================================
                Active Filters
            ================================================= */}

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

                                bg-slate-100
                                dark:bg-slate-800

                                text-[10px]

                                text-slate-500
                                dark:text-slate-400
                            "
                        >

                            {t(
                                'sales.filters.payment'
                            )}

                            <span
                                className="
                                    text-slate-700
                                    dark:text-slate-300
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

                                bg-slate-100
                                dark:bg-slate-800

                                text-[10px]

                                text-slate-500
                                dark:text-slate-400
                            "
                        >

                            {t(
                                'sales.filters.category'
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

                </div>

            )}

        </section>

    );

}


export default SalesFilters;