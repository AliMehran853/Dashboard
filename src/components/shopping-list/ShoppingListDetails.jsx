import {
    X,
    ShoppingCart,
    Pencil,
    Trash2,
    CheckCircle2,
    Clock,
    AlertTriangle,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import {
    useTranslation,
} from 'react-i18next';

import {
    formatJalaliDate,
    getJalaliMonthStyle,
} from '../../utils/date/jalali';


// =========================================================
// Convert Persian / Arabic Numbers To English
// =========================================================

const toEnglishNumbers = (
    value
) => {

    return String(
        value ?? ''
    )
        .replace(
            /[۰-۹]/g,
            (digit) =>
                String(
                    '۰۱۲۳۴۵۶۷۸۹'.indexOf(
                        digit
                    )
                )
        )
        .replace(
            /[٠-٩]/g,
            (digit) =>
                String(
                    '٠١٢٣٤٥٦٧٨٩'.indexOf(
                        digit
                    )
                )
        );

};


// =========================================================
// Format Number
// =========================================================

const formatNumber = (
    value,
    language
) => {

    const number =
        Number(
            toEnglishNumbers(
                value
            )
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return '0';

    }


    const isEnglish =
        String(
            language || ''
        )
            .toLowerCase()
            .startsWith('en');


    return new Intl.NumberFormat(
        isEnglish
            ? 'en-US'
            : 'fa-IR'
    ).format(
        number
    );

};


// =========================================================
// Shopping List Details
// =========================================================

function ShoppingListDetails({
    item,
    onClose,
    onEdit,
    onDelete,
    onToggleComplete,
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
    // Global Jalali Month Style
    // =====================================================

    const [
        jalaliMonthStyle,
        setJalaliMonthStyle,
    ] = useState(
        getJalaliMonthStyle()
    );


    // =====================================================
    // Listen For Global Jalali Month Style Changes
    // =====================================================

    useEffect(() => {

        if (
            typeof window ===
            'undefined'
        ) {

            return undefined;

        }


        const handleJalaliStyleChange = (
            event
        ) => {

            const nextStyle =
                event?.detail ||
                getJalaliMonthStyle();


            setJalaliMonthStyle(
                nextStyle
            );

        };


        const handleStorageChange = (
            event
        ) => {

            if (
                event.key ===
                'jalaliMonthStyle'
            ) {

                setJalaliMonthStyle(
                    getJalaliMonthStyle()
                );

            }

        };


        window.addEventListener(
            'jalali-month-style-changed',
            handleJalaliStyleChange
        );


        window.addEventListener(
            'storage',
            handleStorageChange
        );


        return () => {

            window.removeEventListener(
                'jalali-month-style-changed',
                handleJalaliStyleChange
            );


            window.removeEventListener(
                'storage',
                handleStorageChange
            );

        };

    }, []);


    // =====================================================
    // No Item
    // =====================================================

    if (!item) {

        return null;

    }


    // =====================================================
    // Priority
    // =====================================================

    const priorityMap = {

        low: {

            label:
                t(
                    'shoppingList.details.priority.low',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Low'
                                : 'کم',
                    }
                ),

            icon:
                Clock,

            className:
                `
                    border-slate-200
                    bg-slate-100
                    text-slate-600
                    dark:border-slate-700
                    dark:bg-slate-500/10
                    dark:text-slate-400
                `,

        },


        normal: {

            label:
                t(
                    'shoppingList.details.priority.normal',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Normal'
                                : 'عادی',
                    }
                ),

            icon:
                Clock,

            className:
                `
                    border-slate-200
                    bg-slate-100
                    text-slate-600
                    dark:border-slate-700
                    dark:bg-slate-500/10
                    dark:text-slate-400
                `,

        },


        high: {

            label:
                t(
                    'shoppingList.details.priority.high',
                    {
                        defaultValue:
                            isEnglish
                                ? 'High'
                                : 'زیاد',
                    }
                ),

            icon:
                AlertTriangle,

            className:
                `
                    border-amber-200
                    bg-amber-50
                    text-amber-600
                    dark:border-amber-500/20
                    dark:bg-amber-500/10
                    dark:text-amber-400
                `,

        },


        urgent: {

            label:
                t(
                    'shoppingList.details.priority.urgent',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Urgent'
                                : 'فوری',
                    }
                ),

            icon:
                AlertTriangle,

            className:
                `
                    border-rose-200
                    bg-rose-50
                    text-rose-500
                    dark:border-rose-500/20
                    dark:bg-rose-500/10
                    dark:text-rose-400
                `,

        },

    };


    const priority =
        priorityMap[
            item.priority
        ] ||
        priorityMap.normal;


    const PriorityIcon =
        priority.icon;


    // =====================================================
    // Status
    // =====================================================

    const isCompleted =
        item.status ===
            'completed' ||
        item.completed ===
            true;


    // =====================================================
    // Date Formatter
    // =====================================================

    const formatDate =
        (
            date
        ) => {

            if (!date) {

                return t(
                    'shoppingList.details.notAvailable',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Not available'
                                : 'در دسترس نیست',
                    }
                );

            }


            try {

                const parsedDate =
                    new Date(
                        date
                    );


                if (
                    Number.isNaN(
                        parsedDate.getTime()
                    )
                ) {

                    return t(
                        'shoppingList.details.notAvailable',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'Not available'
                                    : 'در دسترس نیست',
                        }
                    );

                }


                if (
                    isEnglish
                ) {

                    return new Intl.DateTimeFormat(
                        'en-US',
                        {
                            year:
                                'numeric',

                            month:
                                'long',

                            day:
                                'numeric',

                        }
                    ).format(
                        parsedDate
                    );

                }


                return (
                    formatJalaliDate(
                        parsedDate,
                        {
                            monthStyle:
                                jalaliMonthStyle,

                            withMonthName:
                                true,
                        }
                    ) ||
                    '-'
                );

            } catch {

                return t(
                    'shoppingList.details.notAvailable',
                    {
                        defaultValue:
                            isEnglish
                                ? 'Not available'
                                : 'در دسترس نیست',
                    }
                );

            }

        };


    // =====================================================
    // Actions
    // =====================================================

    const handleDelete =
        () => {

            if (
                typeof onDelete ===
                'function'
            ) {

                onDelete(
                    item
                );

            }

        };


    const handleEdit =
        () => {

            if (
                typeof onEdit ===
                'function'
            ) {

                onEdit(
                    item
                );

            }

        };


    const handleComplete =
        () => {

            if (
                typeof onToggleComplete ===
                'function'
            ) {

                onToggleComplete(
                    item
                );

            }

        };


    // =====================================================
    // Note
    // =====================================================

    const note =
        item.note?.trim() ||
        item.description?.trim() ||
        '';


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            className="
                fixed
                inset-0
                z-[80]
                flex
                items-center
                justify-center
                bg-slate-950/[0.22]
                p-3
                backdrop-blur-md
                sm:p-4
                dark:bg-black/[0.50]
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
        >

            <div
                dir={
                    direction
                }
                className="
                    relative
                    flex
                    w-full
                    max-w-2xl
                    max-h-[calc(100dvh-1rem)]
                    flex-col
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[var(--border)]
                    bg-[var(--surface)]/95
                    shadow-2xl
                    shadow-black/20
                    backdrop-blur-xl
                    sm:max-h-[90vh]
                "
            >

                <div
                    className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        top-0
                        z-20
                        h-px
                        bg-emerald-500/60
                    "
                />


                {/* =================================================
                    Header
                ================================================== */}

                <div
                    className="
                        relative
                        z-10
                        flex
                        shrink-0
                        items-center
                        justify-between
                        gap-3
                        border-b
                        border-[var(--border)]
                        bg-[var(--surface)]/95
                        px-4
                        py-4
                        backdrop-blur-md
                        sm:px-5
                    "
                >

                    <div
                        className="
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
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-emerald-500/10
                                bg-emerald-500/10
                            "
                        >

                            <ShoppingCart
                                size={19}
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
                                    text-sm
                                    font-bold
                                    text-[var(--text-primary)]
                                "
                            >
                                {
                                    t(
                                        'shoppingList.details.title'
                                    )
                                }
                            </h2>


                            <p
                                className="
                                    mt-1
                                    truncate
                                    text-[10px]
                                    text-[var(--text-muted)]
                                "
                            >
                                {
                                    t(
                                        'shoppingList.details.subtitle'
                                    )
                                }
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
                                'shoppingList.details.actions.close'
                            )
                        }
                        className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            text-[var(--text-muted)]
                            transition-all
                            duration-200
                            hover:bg-[var(--surface-muted)]
                            hover:text-[var(--text-primary)]
                        "
                    >

                        <X
                            size={18}
                        />

                    </button>

                </div>


                {/* =================================================
                    Content
                ================================================== */}

                <div
                    className="
                        min-h-0
                        flex-1
                        overflow-y-auto
                        overscroll-contain
                        p-4
                        sm:p-5
                    "
                >

                    {/* Item Identity */}

                    <div
                        className="
                            relative
                            overflow-hidden
                            rounded-2xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-muted)]
                            p-4
                            sm:p-5
                        "
                    >

                        <div
                            className="
                                pointer-events-none
                                absolute
                                -end-12
                                -top-12
                                h-36
                                w-36
                                rounded-full
                                bg-emerald-500/10
                                blur-3xl
                            "
                        />


                        <div
                            className="
                                relative
                                z-10
                            "
                        >

                            <p
                                className="
                                    text-[10px]
                                    font-medium
                                    text-[var(--text-muted)]
                                "
                            >
                                {
                                    t(
                                        'shoppingList.details.itemLabel'
                                    )
                                }
                            </p>


                            <h3
                                className="
                                    mt-2
                                    break-words
                                    text-xl
                                    font-bold
                                    tracking-tight
                                    text-[var(--text-primary)]
                                "
                            >
                                {
                                    item.name
                                }
                            </h3>


                            {
                                item.category && (

                                    <span
                                        className="
                                            mt-3
                                            inline-flex
                                            max-w-full
                                            items-center
                                            truncate
                                            rounded-lg
                                            border
                                            border-[var(--border)]
                                            bg-[var(--surface)]
                                            px-2.5
                                            py-1
                                            text-[10px]
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            item.category
                                        }
                                    </span>

                                )
                            }

                        </div>

                    </div>


                    {/* Status + Priority */}

                    <div
                        className="
                            mt-4
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                        "
                    >

                        {/* Status */}

                        <InfoCard
                            label={
                                t(
                                    'shoppingList.details.statusLabel'
                                )
                            }
                        >

                            <span
                                className={`
                                    inline-flex
                                    max-w-full
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    px-2.5
                                    py-1.5
                                    text-xs
                                    font-medium
                                    ${
                                        isCompleted
                                            ? `
                                                border-emerald-200
                                                bg-emerald-50
                                                text-emerald-600
                                                dark:border-emerald-500/20
                                                dark:bg-emerald-500/10
                                                dark:text-emerald-400
                                            `
                                            : `
                                                border-blue-200
                                                bg-blue-50
                                                text-blue-600
                                                dark:border-blue-500/20
                                                dark:bg-blue-500/10
                                                dark:text-blue-400
                                            `
                                    }
                                `}
                            >

                                {
                                    isCompleted
                                        ? (
                                            <CheckCircle2
                                                size={14}
                                                className="shrink-0"
                                            />
                                        )
                                        : (
                                            <Clock
                                                size={14}
                                                className="shrink-0"
                                            />
                                        )
                                }


                                <span
                                    className="
                                        truncate
                                    "
                                >
                                    {
                                        isCompleted
                                            ? t(
                                                'shoppingList.details.status.completed',
                                                {
                                                    defaultValue:
                                                        isEnglish
                                                            ? 'Completed'
                                                            : 'تکمیل‌شده',
                                                }
                                            )
                                            : t(
                                                'shoppingList.details.status.pending',
                                                {
                                                    defaultValue:
                                                        isEnglish
                                                            ? 'Pending'
                                                            : 'در انتظار',
                                                }
                                            )
                                    }
                                </span>

                            </span>

                        </InfoCard>


                        {/* Priority */}

                        <InfoCard
                            label={
                                t(
                                    'shoppingList.details.priorityLabel'
                                )
                            }
                        >

                            <span
                                className={`
                                    inline-flex
                                    max-w-full
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    px-2.5
                                    py-1.5
                                    text-xs
                                    font-medium
                                    ${priority.className}
                                `}
                            >

                                <PriorityIcon
                                    size={14}
                                    className="shrink-0"
                                />


                                <span
                                    className="
                                        truncate
                                    "
                                >
                                    {
                                        priority.label
                                    }
                                </span>

                            </span>

                        </InfoCard>

                    </div>


                    {/* Quantity */}

                    <InfoCard
                        className="
                            mt-4
                        "
                        label={
                            t(
                                'shoppingList.details.quantityLabel'
                            )
                        }
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            "
                        >

                            <div
                                className="
                                    min-w-0
                                "
                            >

                                <p
                                    dir={
                                        isEnglish
                                            ? 'ltr'
                                            : 'rtl'
                                    }
                                    className="
                                        number-font
                                        text-lg
                                        font-bold
                                        text-[var(--text-primary)]
                                    "
                                >
                                    {
                                        formatNumber(
                                            item.quantity ?? 1,
                                            language
                                        )
                                    }

                                    <span
                                        className="
                                            ms-1
                                            font-sans
                                            text-[10px]
                                            font-medium
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            item.unit ||
                                            t(
                                                'shoppingList.details.defaultUnit',
                                                {
                                                    defaultValue:
                                                        isEnglish
                                                            ? 'unit'
                                                            : 'واحد',
                                                }
                                            )
                                        }
                                    </span>

                                </p>

                            </div>


                            {
                                item.category && (

                                    <div
                                        className="
                                            min-w-0
                                        "
                                    >

                                        <p
                                            className="
                                                text-[9px]
                                                text-[var(--text-muted)]
                                            "
                                        >
                                            {
                                                t(
                                                    'shoppingList.details.categoryLabel'
                                                )
                                            }
                                        </p>


                                        <p
                                            className="
                                                mt-1
                                                break-words
                                                text-sm
                                                text-[var(--text-secondary)]
                                            "
                                        >
                                            {
                                                item.category
                                            }
                                        </p>

                                    </div>

                                )
                            }

                        </div>

                    </InfoCard>


                    {/* Note */}

                    {
                        note && (

                            <InfoCard
                                className="
                                    mt-4
                                "
                                label={
                                    t(
                                        'shoppingList.details.noteLabel'
                                    )
                                }
                            >

                                <div
                                    className="
                                        mt-1
                                        whitespace-pre-wrap
                                        break-words
                                        text-sm
                                        leading-6
                                        text-[var(--text-secondary)]
                                    "
                                >
                                    {
                                        note
                                    }
                                </div>

                            </InfoCard>

                        )
                    }


                    {/* Dates */}

                    <div
                        className="
                            mt-4
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                        "
                    >

                        <InfoCard
                            label={
                                t(
                                    'shoppingList.details.createdAt'
                                )
                            }
                        >

                            <p
                                className="
                                    mt-1
                                    break-words
                                    text-xs
                                    text-[var(--text-secondary)]
                                "
                            >
                                {
                                    formatDate(
                                        item.createdAt
                                    )
                                }
                            </p>

                        </InfoCard>


                        {
                            item.updatedAt && (

                                <InfoCard
                                    label={
                                        t(
                                            'shoppingList.details.updatedAt'
                                        )
                                    }
                                >

                                    <p
                                        className="
                                            mt-1
                                            break-words
                                            text-xs
                                            text-[var(--text-secondary)]
                                        "
                                    >
                                        {
                                            formatDate(
                                                item.updatedAt
                                            )
                                        }
                                    </p>

                                </InfoCard>

                            )
                        }

                    </div>

                </div>


                {/* =================================================
                    Footer
                ================================================== */}

                <div
                    className="
                        shrink-0
                        border-t
                        border-[var(--border)]
                        bg-[var(--surface)]/95
                        px-4
                        py-3
                        backdrop-blur-md
                        sm:px-5
                    "
                >

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-2
                            sm:grid-cols-2
                        "
                    >

                        {
                            !isCompleted && (

                                <button
                                    type="button"
                                    onClick={
                                        handleComplete
                                    }
                                    className="
                                        flex
                                        h-10
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-emerald-500
                                        px-4
                                        text-xs
                                        font-semibold
                                        text-slate-950
                                        shadow-lg
                                        shadow-emerald-500/15
                                        transition-all
                                        duration-200
                                        hover:bg-emerald-400
                                        sm:col-span-2
                                    "
                                >

                                    <CheckCircle2
                                        size={16}
                                    />

                                    {
                                        t(
                                            'shoppingList.details.actions.complete'
                                        )
                                    }

                                </button>

                            )
                        }


                        <button
                            type="button"
                            onClick={
                                handleEdit
                            }
                            className="
                                flex
                                h-10
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-[var(--border)]
                                bg-[var(--surface-muted)]
                                px-4
                                text-xs
                                font-medium
                                text-[var(--text-secondary)]
                                transition-all
                                duration-200
                                hover:border-blue-500/20
                                hover:bg-blue-500/5
                                hover:text-blue-600
                                dark:hover:text-blue-400
                            "
                        >

                            <Pencil
                                size={15}
                            />

                            {
                                t(
                                    'shoppingList.details.actions.edit'
                                )
                            }

                        </button>


                        <button
                            type="button"
                            onClick={
                                handleDelete
                            }
                            className="
                                flex
                                h-10
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                border
                                border-rose-500/10
                                bg-rose-500/5
                                px-4
                                text-xs
                                font-medium
                                text-rose-500
                                transition-all
                                duration-200
                                hover:bg-rose-500/10
                                dark:text-rose-400
                            "
                        >

                            <Trash2
                                size={15}
                            />

                            {
                                t(
                                    'shoppingList.details.actions.delete'
                                )
                            }

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}


// =========================================================
// Info Card
// =========================================================

function InfoCard({
    label,
    children,
    className = '',
}) {

    return (

        <div
            className={`
                min-w-0
                rounded-xl
                border
                border-[var(--border)]
                bg-[var(--surface-muted)]
                p-4
                ${className}
            `}
        >

            <p
                className="
                    text-[10px]
                    font-medium
                    text-[var(--text-muted)]
                "
            >
                {
                    label
                }
            </p>


            <div
                className="
                    mt-2
                "
            >
                {
                    children
                }
            </div>

        </div>

    );

}


export default ShoppingListDetails;