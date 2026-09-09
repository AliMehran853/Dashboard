import {
    Search,
    RotateCcw,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';


// =========================================================
// Reports Filters
// =========================================================

function ReportsFilters({

    search = '',

    period = 'week',

    paymentType = 'all',

    category = 'all',

    categories = [],

    onSearchChange,

    onPeriodChange,

    onPaymentTypeChange,

    onCategoryChange,

    onClearFilters,

}) {

    const {
        t,
        i18n,
    } = useTranslation();


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            dir={i18n.dir()}

            className="
                rounded-2xl

                border
                border-slate-200
                dark:border-slate-800

                bg-white
                dark:bg-slate-900/60

                p-4
            "
        >

            <div
                className="
                    grid
                    grid-cols-1

                    sm:grid-cols-2

                    xl:grid-cols-[minmax(0,1fr)_repeat(3,minmax(140px,1fr))_auto]

                    gap-3
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
                        size={16}
                        className={`
                            absolute

                            top-1/2
                            -translate-y-1/2

                            text-slate-400
                            dark:text-slate-600

                            ${
                                i18n.dir() === 'rtl'
                                    ? 'right-3'
                                    : 'left-3'
                            }
                        `}
                    />


                    <input
                        type="text"

                        value={search}

                        onChange={(event) =>
                            onSearchChange?.(
                                event.target.value
                            )
                        }

                        placeholder={t(
                            'reports.filters.searchPlaceholder'
                        )}

                        dir={i18n.dir()}

                        className={`
                            w-full
                            h-10

                            rounded-xl

                            border
                            border-slate-200
                            dark:border-slate-800

                            bg-slate-50
                            dark:bg-slate-950/50

                            ${
                                i18n.dir() === 'rtl'
                                    ? 'pr-9 pl-3'
                                    : 'pl-9 pr-3'
                            }

                            text-xs

                            text-slate-800
                            dark:text-slate-200

                            placeholder:text-slate-400
                            dark:placeholder:text-slate-600

                            outline-none

                            focus:border-emerald-400
                            dark:focus:border-emerald-500/40

                            focus:ring-2
                            focus:ring-emerald-500/10

                            transition
                        `}
                    />

                </div>


                {/* =================================================
                    Period
                ================================================== */}

                <select
                    value={period}

                    onChange={(event) =>
                        onPeriodChange?.(
                            event.target.value
                        )
                    }

                    dir={i18n.dir()}

                    className="
                        w-full
                        h-10
                        min-w-0

                        rounded-xl

                        border
                        border-slate-200
                        dark:border-slate-800

                        bg-slate-50
                        dark:bg-slate-950/50

                        px-3

                        text-xs

                        text-slate-700
                        dark:text-slate-300

                        outline-none

                        focus:border-emerald-400
                        dark:focus:border-emerald-500/40

                        focus:ring-2
                        focus:ring-emerald-500/10

                        transition
                    "
                >

                    <option value="all">
                        {t(
                            'reports.filters.period.all'
                        )}
                    </option>

                    <option value="today">
                        {t(
                            'reports.filters.period.today'
                        )}
                    </option>

                    <option value="week">
                        {t(
                            'reports.filters.period.week'
                        )}
                    </option>

                    <option value="month">
                        {t(
                            'reports.filters.period.month'
                        )}
                    </option>

                </select>


                {/* =================================================
                    Payment
                ================================================== */}

                <select
                    value={paymentType}

                    onChange={(event) =>
                        onPaymentTypeChange?.(
                            event.target.value
                        )
                    }

                    dir={i18n.dir()}

                    className="
                        w-full
                        h-10
                        min-w-0

                        rounded-xl

                        border
                        border-slate-200
                        dark:border-slate-800

                        bg-slate-50
                        dark:bg-slate-950/50

                        px-3

                        text-xs

                        text-slate-700
                        dark:text-slate-300

                        outline-none

                        focus:border-emerald-400
                        dark:focus:border-emerald-500/40

                        focus:ring-2
                        focus:ring-emerald-500/10

                        transition
                    "
                >

                    <option value="all">
                        {t(
                            'reports.filters.payment.all'
                        )}
                    </option>

                    <option value="cash">
                        {t(
                            'reports.filters.payment.cash'
                        )}
                    </option>

                    <option value="credit">
                        {t(
                            'reports.filters.payment.credit'
                        )}
                    </option>

                </select>


                {/* =================================================
                    Category
                ================================================== */}

                <select
                    value={category}

                    onChange={(event) =>
                        onCategoryChange?.(
                            event.target.value
                        )
                    }

                    dir={i18n.dir()}

                    className="
                        w-full
                        h-10
                        min-w-0

                        rounded-xl

                        border
                        border-slate-200
                        dark:border-slate-800

                        bg-slate-50
                        dark:bg-slate-950/50

                        px-3

                        text-xs

                        text-slate-700
                        dark:text-slate-300

                        outline-none

                        focus:border-emerald-400
                        dark:focus:border-emerald-500/40

                        focus:ring-2
                        focus:ring-emerald-500/10

                        transition
                    "
                >

                    <option value="all">
                        {t(
                            'reports.filters.category.all'
                        )}
                    </option>


                    {categories.map((item) => {

                        const value =
                            typeof item === 'string'
                                ? item
                                : item?.value ??
                                  item?.id ??
                                  item?.name ??
                                  '';


                        const label =
                            typeof item === 'string'
                                ? item
                                : item?.label ??
                                  item?.name ??
                                  item?.value ??
                                  '';


                        if (!value) {
                            return null;
                        }


                        return (

                            <option
                                key={value}
                                value={value}
                            >
                                {label}
                            </option>

                        );

                    })}

                </select>


                {/* =================================================
                    Clear
                ================================================== */}

                <button
                    type="button"

                    onClick={
                        onClearFilters
                    }

                    className="
                        w-full
                        sm:col-span-2
                        xl:col-span-1

                        h-10
                        px-4

                        rounded-xl

                        border
                        border-slate-200
                        dark:border-slate-800

                        bg-white
                        dark:bg-transparent

                        text-xs

                        text-slate-500

                        hover:text-slate-900
                        dark:hover:text-white

                        hover:bg-slate-100
                        dark:hover:bg-slate-800

                        transition

                        flex
                        items-center
                        justify-center
                        gap-2
                    "
                >

                    <RotateCcw
                        size={14}
                    />

                    {t(
                        'reports.filters.clear'
                    )}

                </button>

            </div>

        </div>

    );

}


export default ReportsFilters;