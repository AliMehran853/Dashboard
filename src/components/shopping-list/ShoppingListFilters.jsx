import {
    Search,
    ListFilter,
    RotateCcw,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';


// =========================================================
// Shopping List Filters
// =========================================================

function ShoppingListFilters({

    search = '',

    status = 'all',

    priority = 'all',

    onSearchChange,

    onStatusChange,

    onPriorityChange,

    onClearFilters,

}) {

    const {
        t,
        i18n,
    } = useTranslation();


    // =====================================================
    // Language
    // =====================================================

    const language =
        i18n.language || 'fa';


    const isEnglish =
        String(
            language
        )
            .toLowerCase()
            .startsWith('en');


    const direction =
        isEnglish
            ? 'ltr'
            : 'rtl';


    // =====================================================
    // Status Options
    // =====================================================

    const statusOptions = [

        {
            value:
                'all',

            label:
                t(
                    'shoppingList.filters.status.all',
                    {
                        defaultValue:
                            isEnglish
                                ? 'All'
                                : 'همه',
                    }
                ),
        },


        {
            value:
                'pending',

            label:
                t(
                    'shoppingList.filters.status.pending',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Pending'
                                : 'در انتظار',
                    }
                ),
        },


        {
            value:
                'completed',

            label:
                t(
                    'shoppingList.filters.status.completed',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Completed'
                                : 'تکمیل‌شده',
                    }
                ),
        },

    ];


    // =====================================================
    // Priority Options
    // =====================================================

    const priorityOptions = [

        {
            value:
                'all',

            label:
                t(
                    'shoppingList.filters.priority.all',
                    {
                        defaultValue:
                            isEnglish
                                ? 'All priorities'
                                : 'همه اولویت‌ها',
                    }
                ),
        },


        {
            value:
                'low',

            label:
                t(
                    'shoppingList.filters.priority.low',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Low'
                                : 'کم',
                    }
                ),
        },


        {
            value:
                'normal',

            label:
                t(
                    'shoppingList.filters.priority.normal',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Normal'
                                : 'عادی',
                    }
                ),
        },


        {
            value:
                'high',

            label:
                t(
                    'shoppingList.filters.priority.high',
                    {
                        defaultValue:
                            isEnglish
                                ? 'High'
                                : 'زیاد',
                    }
                ),
        },


        {
            value:
                'urgent',

            label:
                t(
                    'shoppingList.filters.priority.urgent',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Urgent'
                                : 'فوری',
                    }
                ),
        },

    ];


    // =====================================================
    // Status Handler
    // =====================================================

    const handleStatusChange =
        (value) => {

            onStatusChange?.(
                value
            );

        };


    // =====================================================
    // Priority Handler
    // =====================================================

    const handlePriorityChange =
        (
            event
        ) => {

            onPriorityChange?.(
                event.target.value
            );

        };


    // =====================================================
    // Clear Handler
    // =====================================================

    const handleClear =
        () => {

            onClearFilters?.();

        };


    // =====================================================
    // Render
    // =====================================================

    return (

        <section
            dir={
                direction
            }
            className="
                ui-card
                relative
                p-4
                sm:p-5
            "
        >

            {/* Accent */}

            <div
                className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    rounded-full
                    bg-emerald-500/40
                "
            />


            {/* =================================================
                Header
            ================================================== */}

            <div
                className="
                    mb-4
                    flex
                    items-center
                    gap-2.5
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
                        border
                        border-emerald-500/10
                        bg-emerald-500/10
                    "
                >

                    <ListFilter
                        size={15}
                        className="
                            text-emerald-500
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
                            truncate
                            text-xs
                            font-semibold
                            text-[var(--text-primary)]
                        "
                    >
                        {
                            t(
                                'shoppingList.filters.title',
                                {
                                    defaultValue:
                                        isEnglish
                                            ? 'Shopping List Filters'
                                            : 'فیلترهای لیست خرید',
                                }
                            )
                        }
                    </h2>


                    <p
                        className="
                            mt-0.5
                            truncate
                            text-[10px]
                            text-[var(--text-muted)]
                        "
                    >
                        {
                            t(
                                'shoppingList.filters.description',
                                {
                                    defaultValue:
                                        isEnglish
                                            ? 'Filter items by status and priority.'
                                            : 'اقلام را بر اساس وضعیت و اولویت فیلتر کنید.',
                                }
                            )
                        }
                    </p>

                </div>

            </div>


            {/* =================================================
                Filters
            ================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    items-center
                    gap-3
                    lg:grid-cols-[minmax(0,1fr)_auto]
                    xl:grid-cols-[minmax(0,1fr)_auto_minmax(150px,150px)_auto]
                "
            >

                {/* =================================================
                    Search
                ================================================== */}

                <div
                    className="
                        relative
                        min-w-0
                    "
                >

                    <Search
                        size={17}
                        className={`
                            pointer-events-none
                            absolute
                            top-1/2
                            -translate-y-1/2
                            text-[var(--text-muted)]
                            ${
                                isEnglish
                                    ? 'left-3'
                                    : 'right-3'
                            }
                        `}
                    />


                    <input
                        type="text"
                        value={
                            search
                        }
                        onChange={(
                            event
                        ) => {

                            onSearchChange?.(
                                event.target.value
                            );

                        }}
                        placeholder={
                            t(
                                'shoppingList.filters.searchPlaceholder',
                                {
                                    defaultValue:
                                        isEnglish
                                            ? 'Search items...'
                                            : 'جستجوی اقلام...',
                                }
                            )
                        }
                        dir={
                            direction
                        }
                        className={`
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-muted)]
                            text-xs
                            text-[var(--text-primary)]
                            outline-none
                            transition-all
                            duration-200
                            placeholder:text-[var(--text-muted)]
                            focus:border-emerald-500/50
                            focus:ring-2
                            focus:ring-emerald-500/10
                            ${
                                isEnglish
                                    ? 'pl-10 pr-4'
                                    : 'pr-10 pl-4'
                            }
                        `}
                    />

                </div>


                {/* =================================================
                    Status
                ================================================== */}

                <div
                    className="
                        flex
                        min-w-0
                        items-center
                        gap-2
                        overflow-x-auto
                        pb-0.5
                    "
                >

                    <div
                        className="
                            flex
                            min-w-max
                            items-center
                            gap-1
                            rounded-xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-muted)]
                            p-1
                        "
                    >

                        {
                            statusOptions.map(
                                (
                                    option
                                ) => {

                                    const isActive =
                                        status ===
                                        option.value;


                                    return (

                                        <button
                                            key={
                                                option.value
                                            }
                                            type="button"
                                            onClick={() =>
                                                handleStatusChange(
                                                    option.value
                                                )
                                            }
                                            className={`
                                                h-9
                                                rounded-lg
                                                px-3
                                                text-[10px]
                                                font-medium
                                                whitespace-nowrap
                                                transition-all
                                                duration-200
                                                sm:px-3.5
                                                ${
                                                    isActive
                                                        ? `
                                                            bg-emerald-500/10
                                                            text-emerald-600
                                                            shadow-sm
                                                            dark:text-emerald-400
                                                        `
                                                        : `
                                                            text-[var(--text-muted)]
                                                            hover:bg-[var(--surface)]
                                                            hover:text-[var(--text-primary)]
                                                        `
                                                }
                                            `}
                                        >
                                            {
                                                option.label
                                            }
                                        </button>

                                    );

                                }
                            )
                        }

                    </div>

                </div>


                {/* =================================================
                    Priority
                ================================================== */}

                <select
                    value={
                        priority
                    }
                    onChange={
                        handlePriorityChange
                    }
                    dir={
                        direction
                    }
                    className="
                        h-11
                        w-full
                        min-w-0
                        rounded-xl
                        border
                        border-[var(--border)]
                        bg-[var(--surface-muted)]
                        px-3
                        text-xs
                        text-[var(--text-primary)]
                        outline-none
                        transition-all
                        duration-200
                        focus:border-emerald-500/50
                        focus:ring-2
                        focus:ring-emerald-500/10
                        xl:min-w-[150px]
                    "
                >

                    {
                        priorityOptions.map(
                            (
                                option
                            ) => (

                                <option
                                    key={
                                        option.value
                                    }
                                    value={
                                        option.value
                                    }
                                    className="
                                        bg-white
                                        text-slate-900
                                        dark:bg-slate-900
                                        dark:text-white
                                    "
                                >
                                    {
                                        option.label
                                    }
                                </option>

                            )
                        )
                    }

                </select>


                {/* =================================================
                    Clear Filters
                ================================================== */}

                <button
                    type="button"
                    onClick={
                        handleClear
                    }
                    className="
                        flex
                        h-11
                        w-full
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-[var(--border)]
                        bg-[var(--surface)]
                        px-4
                        text-xs
                        font-medium
                        text-[var(--text-muted)]
                        transition-all
                        duration-200
                        hover:border-slate-300
                        hover:bg-[var(--surface-muted)]
                        hover:text-[var(--text-primary)]
                        dark:hover:border-slate-700
                        sm:w-auto
                    "
                >

                    <RotateCcw
                        size={14}
                    />

                    {
                        t(
                            'shoppingList.filters.clear',
                            {
                                defaultValue:
                                    isEnglish
                                        ? 'Clear filters'
                                        : 'پاک کردن فیلترها',
                            }
                        )
                    }

                </button>

            </div>

        </section>

    );

}


export default ShoppingListFilters;