import {
    Eye,
    Package,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    MoreHorizontal,
    Pencil,
    Trash2,
} from 'lucide-react';

import {
    useEffect,
    useRef,
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
// Number Locale
// =========================================================

const getNumberLocale = (
    language
) => {

    const normalizedLanguage =
        String(
            language || ''
        )
            .toLowerCase();

    return normalizedLanguage.startsWith(
        'en'
    )
        ? 'en-US'
        : 'fa-IR';

};


// =========================================================
// Format Number
// =========================================================

const formatNumber = (
    number,
    language
) => {

    const normalizedNumber =
        Number(
            toEnglishNumbers(
                number
            )
        ) || 0;


    return new Intl.NumberFormat(
        getNumberLocale(
            language
        )
    ).format(
        normalizedNumber
    );

};


// =========================================================
// Format Date
// =========================================================

const formatDisplayDate = (
    date,
    language,
    jalaliMonthStyle
) => {

    if (!date) {
        return '-';
    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return '-';
    }


    const isEnglish =
        String(
            language || ''
        )
            .toLowerCase()
            .startsWith('en');


    if (isEnglish) {

        return new Intl.DateTimeFormat(
            'en-US',
            {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }
        ).format(
            parsedDate
        );

    }


    return formatJalaliDate(
        parsedDate,
        {
            monthStyle:
                jalaliMonthStyle,

            withMonthName:
                true,
        }
    );

};


// =========================================================
// Stock Status
// =========================================================

const getStockStatus = (
    product,
    t
) => {

    const stock =
        Number(
            toEnglishNumbers(
                product?.stock
            )
        ) || 0;


    const minStock =
        Number(
            toEnglishNumbers(
                product?.minStock
            )
        ) || 0;


    // =====================================================
    // Out Of Stock
    // =====================================================

    if (
        stock === 0
    ) {

        return {

            label:
                t(
                    'products.table.status.outOfStock'
                ),

            className: `
                text-rose-600
                dark:text-rose-400

                bg-rose-500/10

                border-rose-500/10
            `,

            dotClass:
                'bg-rose-500',

            icon:
                XCircle,

        };

    }


    // =====================================================
    // Low Stock
    // =====================================================

    if (
        stock <= minStock
    ) {

        return {

            label:
                t(
                    'products.table.status.lowStock'
                ),

            className: `
                text-amber-600
                dark:text-amber-400

                bg-amber-500/10

                border-amber-500/10
            `,

            dotClass:
                'bg-amber-500',

            icon:
                AlertTriangle,

        };

    }


    // =====================================================
    // Available
    // =====================================================

    return {

        label:
            t(
                'products.table.status.available'
            ),

        className: `
            text-emerald-600
            dark:text-emerald-400

            bg-emerald-500/10

            border-emerald-500/10
        `,

        dotClass:
            'bg-emerald-500',

        icon:
            CheckCircle2,

    };

};


// =========================================================
// Product Table
// =========================================================

function ProductTable({

    products = [],

    loading = false,

    onViewDetails,

    onEdit,

    onDelete,

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


    // =====================================================
    // Menu State
    // =====================================================

    const [
        openMenuId,
        setOpenMenuId,
    ] = useState(null);


    const menuRef =
        useRef(null);


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
    // Listen For Global Month Style Changes
    // =====================================================

    useEffect(() => {

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
    // Close Menu On Outside Click
    // =====================================================

    useEffect(() => {

        const handleClickOutside = (
            event
        ) => {

            if (
                menuRef.current &&
                !menuRef.current.contains(
                    event.target
                )
            ) {

                setOpenMenuId(null);

            }

        };


        document.addEventListener(
            'mousedown',
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );

        };

    }, []);


    // =====================================================
    // Close Menu With Escape
    // =====================================================

    useEffect(() => {

        const handleEscape = (
            event
        ) => {

            if (
                event.key === 'Escape'
            ) {

                setOpenMenuId(null);

            }

        };


        document.addEventListener(
            'keydown',
            handleEscape
        );


        return () => {

            document.removeEventListener(
                'keydown',
                handleEscape
            );

        };

    }, []);


    // =====================================================
    // Toggle Menu
    // =====================================================

    const handleToggleMenu = (
        productId
    ) => {

        setOpenMenuId(
            (current) =>
                current === productId
                    ? null
                    : productId
        );

    };


    // =====================================================
    // Edit
    // =====================================================

    const handleEdit = (
        product
    ) => {

        setOpenMenuId(
            null
        );

        onEdit?.(
            product
        );

    };


    // =====================================================
    // Delete
    // =====================================================

    const handleDelete = (
        product
    ) => {

        setOpenMenuId(
            null
        );

        onDelete?.(
            product
        );

    };


    // =====================================================
    // Render
    // =====================================================

    return (

        <section
            className="
                ui-card
                overflow-hidden
                p-0
            "
        >

            {/* =================================================
                Header
            ================================================== */}

            <div
                className="
                    relative
                    flex
                    flex-col
                    gap-3
                    border-b
                    border-[var(--border)]
                    px-4
                    py-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    sm:px-5
                "
            >

                <div
                    className="
                        absolute
                        inset-x-0
                        top-0
                        h-px
                        bg-emerald-500/70
                    "
                />


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
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-emerald-500/10
                            bg-emerald-500/10
                        "
                    >

                        <Package
                            size={17}
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
                                font-semibold
                                tracking-tight
                                text-[var(--text-primary)]
                            "
                        >
                            {
                                t(
                                    'products.table.title'
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
                                    'products.table.description'
                                )
                            }
                        </p>

                    </div>

                </div>


                {/* Count */}

                <div
                    className="
                        inline-flex
                        w-fit
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-[var(--border)]
                        bg-[var(--surface-muted)]
                        px-2.5
                        py-1.5
                        text-[10px]
                        font-medium
                        text-[var(--text-muted)]
                    "
                >

                    <span
                        dir={
                            isEnglish
                                ? 'ltr'
                                : 'rtl'
                        }
                        className="
                            number-font
                            font-semibold
                            text-[var(--text-primary)]
                        "
                    >
                        {
                            formatNumber(
                                products.length,
                                language
                            )
                        }
                    </span>


                    <span>
                        {
                            t(
                                'products.table.productCount'
                            )
                        }
                    </span>

                </div>

            </div>


            {/* =================================================
                Loading
            ================================================== */}

            {
                loading && (

                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            justify-center
                            px-5
                            py-16
                        "
                    >

                        <div
                            className="
                                h-8
                                w-8
                                rounded-full
                                border-2
                                border-[var(--border)]
                                border-t-emerald-500
                                animate-spin
                            "
                        />


                        <p
                            className="
                                mt-4
                                text-xs
                                text-[var(--text-muted)]
                            "
                        >
                            {
                                t(
                                    'products.table.loading'
                                )
                            }
                        </p>

                    </div>

                )
            }


            {/* =================================================
                Empty State
            ================================================== */}

            {
                !loading &&
                products.length === 0 && (

                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            justify-center
                            px-5
                            py-16
                            text-center
                        "
                    >

                        <div
                            className="
                                flex
                                h-16
                                w-16
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-[var(--border)]
                                bg-[var(--surface-muted)]
                            "
                        >

                            <Package
                                size={26}
                                className="
                                    text-[var(--text-muted)]
                                "
                            />

                        </div>


                        <h3
                            className="
                                mt-4
                                text-sm
                                font-semibold
                                text-[var(--text-primary)]
                            "
                        >
                            {
                                t(
                                    'products.table.empty.title'
                                )
                            }
                        </h3>


                        <p
                            className="
                                mt-2
                                max-w-md
                                text-[11px]
                                leading-5
                                text-[var(--text-muted)]
                            "
                        >
                            {
                                t(
                                    'products.table.empty.description'
                                )
                            }
                        </p>

                    </div>

                )
            }


            {/* =================================================
                Desktop Table
            ================================================== */}

            {
                !loading &&
                products.length > 0 && (

                    <div
                        className="
                            hidden
                            overflow-x-auto
                            md:block
                        "
                    >

                        <table
                            className="
                                w-full
                                min-w-[1000px]
                                border-collapse
                            "
                        >

                            {/* =================================================
                                Table Head
                            ================================================= */}

                            <thead>

                                <tr
                                    className="
                                        border-b
                                        border-[var(--border)]
                                        bg-[var(--surface-muted)]
                                    "
                                >

                                    <th
                                        className="
                                            px-5
                                            py-3
                                            text-start
                                            text-[10px]
                                            font-semibold
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            t(
                                                'products.table.columns.product'
                                            )
                                        }
                                    </th>


                                    <th
                                        className="
                                            px-4
                                            py-3
                                            text-start
                                            text-[10px]
                                            font-semibold
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            t(
                                                'products.table.columns.category'
                                            )
                                        }
                                    </th>


                                    <th
                                        className="
                                            px-4
                                            py-3
                                            text-start
                                            text-[10px]
                                            font-semibold
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            t(
                                                'products.table.columns.buyPrice'
                                            )
                                        }
                                    </th>


                                    <th
                                        className="
                                            px-4
                                            py-3
                                            text-start
                                            text-[10px]
                                            font-semibold
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            t(
                                                'products.table.columns.sellPrice'
                                            )
                                        }
                                    </th>


                                    <th
                                        className="
                                            px-4
                                            py-3
                                            text-start
                                            text-[10px]
                                            font-semibold
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            t(
                                                'products.table.columns.stock'
                                            )
                                        }
                                    </th>


                                    <th
                                        className="
                                            px-4
                                            py-3
                                            text-start
                                            text-[10px]
                                            font-semibold
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            t(
                                                'products.table.columns.status'
                                            )
                                        }
                                    </th>


                                    <th
                                        className="
                                            px-4
                                            py-3
                                            text-start
                                            text-[10px]
                                            font-semibold
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            t(
                                                'products.table.columns.updated'
                                            )
                                        }
                                    </th>


                                    <th
                                        className="
                                            px-5
                                            py-3
                                            text-center
                                            text-[10px]
                                            font-semibold
                                            text-[var(--text-muted)]
                                        "
                                    >
                                        {
                                            t(
                                                'products.table.columns.actions'
                                            )
                                        }
                                    </th>

                                </tr>

                            </thead>


                            {/* =================================================
                                Table Body
                            ================================================= */}

                            <tbody>

                                {
                                    products.map(
                                        (product) => {

                                            const stockStatus =
                                                getStockStatus(
                                                    product,
                                                    t
                                                );


                                            const StatusIcon =
                                                stockStatus.icon;


                                            return (

                                                <tr
                                                    key={
                                                        product.id
                                                    }
                                                    className="
                                                        group
                                                        border-b
                                                        border-[var(--border)]
                                                        transition-colors
                                                        last:border-b-0
                                                        hover:bg-[var(--surface-muted)]
                                                    "
                                                >

                                                    {/* Product */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-4
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
                                                                    border
                                                                    border-[var(--border)]
                                                                    bg-[var(--surface-muted)]
                                                                    transition-all
                                                                    duration-200
                                                                    group-hover:border-emerald-500/20
                                                                    group-hover:bg-emerald-500/5
                                                                "
                                                            >

                                                                <Package
                                                                    size={17}
                                                                    className="
                                                                        text-[var(--text-muted)]
                                                                        transition-colors
                                                                        group-hover:text-emerald-500
                                                                        dark:group-hover:text-emerald-400
                                                                    "
                                                                />

                                                            </div>


                                                            <div
                                                                className="
                                                                    min-w-0
                                                                "
                                                            >

                                                                <p
                                                                    className="
                                                                        truncate
                                                                        text-xs
                                                                        font-semibold
                                                                        text-[var(--text-primary)]
                                                                    "
                                                                >
                                                                    {
                                                                        product.name
                                                                    }
                                                                </p>


                                                                <p
                                                                    dir={
                                                                        isEnglish
                                                                            ? 'ltr'
                                                                            : 'rtl'
                                                                    }
                                                                    className="
                                                                        mt-1
                                                                        text-[10px]
                                                                        text-[var(--text-muted)]
                                                                    "
                                                                >
                                                                    #

                                                                    {
                                                                        formatNumber(
                                                                            product.id,
                                                                            language
                                                                        )
                                                                    }
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* Category */}

                                                    <td
                                                        className="
                                                            px-4
                                                            py-4
                                                        "
                                                    >

                                                        <span
                                                            className="
                                                                inline-flex
                                                                max-w-[180px]
                                                                truncate
                                                                items-center
                                                                rounded-lg
                                                                border
                                                                border-[var(--border)]
                                                                bg-[var(--surface-muted)]
                                                                px-2.5
                                                                py-1
                                                                text-[10px]
                                                                text-[var(--text-muted)]
                                                            "
                                                        >
                                                            {
                                                                product.category ||
                                                                '-'
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* Buy Price */}

                                                    <td
                                                        className="
                                                            whitespace-nowrap
                                                            px-4
                                                            py-4
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-baseline
                                                                gap-1
                                                            "
                                                        >

                                                            <span
                                                                dir={
                                                                    isEnglish
                                                                        ? 'ltr'
                                                                        : 'rtl'
                                                                }
                                                                className="
                                                                    number-font
                                                                    text-xs
                                                                    font-medium
                                                                    text-[var(--text-secondary)]
                                                                "
                                                            >
                                                                {
                                                                    formatNumber(
                                                                        product.buyPrice,
                                                                        language
                                                                    )
                                                                }
                                                            </span>


                                                            <span
                                                                className="
                                                                    text-[9px]
                                                                    text-[var(--text-muted)]
                                                                "
                                                            >
                                                                {
                                                                    isEnglish
                                                                        ? 'AF'
                                                                        : 'افغانی'
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* Sell Price */}

                                                    <td
                                                        className="
                                                            whitespace-nowrap
                                                            px-4
                                                            py-4
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-baseline
                                                                gap-1
                                                            "
                                                        >

                                                            <span
                                                                dir={
                                                                    isEnglish
                                                                        ? 'ltr'
                                                                        : 'rtl'
                                                                }
                                                                className="
                                                                    number-font
                                                                    text-xs
                                                                    font-bold
                                                                    text-[var(--text-primary)]
                                                                "
                                                            >
                                                                {
                                                                    formatNumber(
                                                                        product.sellPrice,
                                                                        language
                                                                    )
                                                                }
                                                            </span>


                                                            <span
                                                                className="
                                                                    text-[9px]
                                                                    text-[var(--text-muted)]
                                                                "
                                                            >
                                                                {
                                                                    isEnglish
                                                                        ? 'AF'
                                                                        : 'افغانی'
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* Stock */}

                                                    <td
                                                        className="
                                                            whitespace-nowrap
                                                            px-4
                                                            py-4
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-baseline
                                                                gap-1
                                                            "
                                                        >

                                                            <span
                                                                dir={
                                                                    isEnglish
                                                                        ? 'ltr'
                                                                        : 'rtl'
                                                                }
                                                                className="
                                                                    number-font
                                                                    text-xs
                                                                    font-semibold
                                                                    text-[var(--text-secondary)]
                                                                "
                                                            >
                                                                {
                                                                    formatNumber(
                                                                        product.stock,
                                                                        language
                                                                    )
                                                                }
                                                            </span>


                                                            <span
                                                                className="
                                                                    text-[9px]
                                                                    text-[var(--text-muted)]
                                                                "
                                                            >
                                                                {
                                                                    product.unit ||
                                                                    ''
                                                                }
                                                            </span>

                                                        </div>

                                                    </td>


                                                    {/* Status */}

                                                    <td
                                                        className="
                                                            px-4
                                                            py-4
                                                        "
                                                    >

                                                        <span
                                                            className={`
                                                                inline-flex
                                                                items-center
                                                                gap-1.5
                                                                rounded-lg
                                                                border
                                                                px-2.5
                                                                py-1
                                                                text-[10px]
                                                                font-medium
                                                                ${stockStatus.className}
                                                            `}
                                                        >

                                                            <span
                                                                className={`
                                                                    h-1.5
                                                                    w-1.5
                                                                    shrink-0
                                                                    rounded-full
                                                                    ${stockStatus.dotClass}
                                                                `}
                                                            />


                                                            <StatusIcon
                                                                size={12}
                                                            />


                                                            {
                                                                stockStatus.label
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* Updated */}

                                                    <td
                                                        className="
                                                            whitespace-nowrap
                                                            px-4
                                                            py-4
                                                        "
                                                    >

                                                        <span
                                                            className="
                                                                text-[10px]
                                                                text-[var(--text-muted)]
                                                            "
                                                        >
                                                            {
                                                                formatDisplayDate(
                                                                    product.updatedAt,
                                                                    language,
                                                                    jalaliMonthStyle
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* Actions */}

                                                    <td
                                                        className="
                                                            px-5
                                                            py-4
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                relative
                                                                flex
                                                                items-center
                                                                justify-center
                                                                gap-1
                                                            "
                                                        >

                                                            {/* View */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    onViewDetails?.(
                                                                        product
                                                                    )
                                                                }
                                                                className="
                                                                    ui-icon-button
                                                                    h-8
                                                                    w-8
                                                                    rounded-lg
                                                                    hover:border-emerald-500/20
                                                                    hover:bg-emerald-500/5
                                                                    hover:text-emerald-500
                                                                    dark:hover:text-emerald-400
                                                                "
                                                                title={
                                                                    t(
                                                                        'products.table.actions.viewDetails'
                                                                    )
                                                                }
                                                                aria-label={
                                                                    t(
                                                                        'products.table.actions.viewDetails'
                                                                    )
                                                                }
                                                            >

                                                                <Eye
                                                                    size={15}
                                                                />

                                                            </button>


                                                            {/* More */}

                                                            <div
                                                                className="
                                                                    relative
                                                                "
                                                                ref={
                                                                    openMenuId ===
                                                                    product.id
                                                                        ? menuRef
                                                                        : null
                                                                }
                                                            >

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleToggleMenu(
                                                                            product.id
                                                                        )
                                                                    }
                                                                    className={`
                                                                        ui-icon-button
                                                                        h-8
                                                                        w-8
                                                                        rounded-lg
                                                                        ${
                                                                            openMenuId ===
                                                                            product.id
                                                                                ? `
                                                                                    border-slate-300
                                                                                    bg-[var(--surface-muted)]
                                                                                    text-[var(--text-primary)]
                                                                                    dark:border-slate-700
                                                                                `
                                                                                : ''
                                                                        }
                                                                    `}
                                                                    title={
                                                                        t(
                                                                            'products.table.actions.options'
                                                                        )
                                                                    }
                                                                    aria-label={
                                                                        t(
                                                                            'products.table.actions.options'
                                                                        )
                                                                    }
                                                                >

                                                                    <MoreHorizontal
                                                                        size={15}
                                                                    />

                                                                </button>


                                                                {/* =================================================
                                                                    Dropdown
                                                                    فارسی → راست
                                                                    انگلیسی → چپ
                                                                    با blur برای پوشاندن محتوای زیر
                                                                ================================================== */}

                                                                {
                                                                    openMenuId ===
                                                                    product.id && (

                                                                        <div
                                                                            className={`
                                                                                absolute
                                                                                top-1/2
                                                                                z-[100]
                                                                                w-40
                                                                                -translate-y-1/2

                                                                                overflow-hidden

                                                                                rounded-xl
                                                                                border
                                                                                border-slate-200/80
                                                                                bg-white/95

                                                                                p-1.5

                                                                                shadow-2xl
                                                                                shadow-black/15

                                                                                backdrop-blur-md
                                                                                backdrop-saturate-150

                                                                                dark:border-slate-700/80
                                                                                dark:bg-slate-900/95

                                                                                ${
                                                                                    isEnglish
                                                                                        ? 'right-[calc(100%+8px)]'
                                                                                        : 'left-[calc(100%+8px)]'
                                                                                }
                                                                            `}
                                                                        >

                                                                            {/* Subtle Glass Overlay */}

                                                                            <div
                                                                                className="
                                                                                    pointer-events-none
                                                                                    absolute
                                                                                    inset-0
                                                                                    bg-white/30
                                                                                    dark:bg-white/[0.02]
                                                                                "
                                                                            />


                                                                            <div
                                                                                className="
                                                                                    relative
                                                                                    z-10
                                                                                "
                                                                            >

                                                                                {/* Edit */}

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        handleEdit(
                                                                                            product
                                                                                        )
                                                                                    }
                                                                                    className="
                                                                                        flex
                                                                                        w-full
                                                                                        items-center
                                                                                        gap-2
                                                                                        rounded-lg
                                                                                        px-3
                                                                                        py-2.5
                                                                                        text-xs
                                                                                        text-[var(--text-secondary)]
                                                                                        transition-colors
                                                                                        hover:bg-blue-500/5
                                                                                        hover:text-blue-600
                                                                                        dark:hover:text-blue-400
                                                                                    "
                                                                                >

                                                                                    <Pencil
                                                                                        size={14}
                                                                                        className="
                                                                                            shrink-0
                                                                                        "
                                                                                    />

                                                                                    {
                                                                                        t(
                                                                                            'products.table.actions.edit'
                                                                                        )
                                                                                    }

                                                                                </button>


                                                                                {/* Delete */}

                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() =>
                                                                                        handleDelete(
                                                                                            product
                                                                                        )
                                                                                    }
                                                                                    className="
                                                                                        flex
                                                                                        w-full
                                                                                        items-center
                                                                                        gap-2
                                                                                        rounded-lg
                                                                                        px-3
                                                                                        py-2.5
                                                                                        text-xs
                                                                                        text-rose-500
                                                                                        transition-colors
                                                                                        hover:bg-rose-500/5
                                                                                        dark:text-rose-400
                                                                                    "
                                                                                >

                                                                                    <Trash2
                                                                                        size={14}
                                                                                        className="
                                                                                            shrink-0
                                                                                        "
                                                                                    />

                                                                                    {
                                                                                        t(
                                                                                            'products.table.actions.delete'
                                                                                        )
                                                                                    }

                                                                                </button>

                                                                            </div>

                                                                        </div>

                                                                    )
                                                                }

                                                            </div>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )
                                }

                            </tbody>

                        </table>

                    </div>

                )
            }


            {/* =================================================
                Mobile Cards
            ================================================== */}

            {
                !loading &&
                products.length > 0 && (

                    <div
                        className="
                            divide-y
                            divide-[var(--border)]
                            md:hidden
                        "
                    >

                        {
                            products.map(
                                (product) => {

                                    const stockStatus =
                                        getStockStatus(
                                            product,
                                            t
                                        );


                                    const StatusIcon =
                                        stockStatus.icon;


                                    return (

                                        <article
                                            key={
                                                product.id
                                            }
                                            className="
                                                min-w-0
                                                p-4
                                                transition-colors
                                                hover:bg-[var(--surface-muted)]
                                            "
                                        >

                                            {/* =================================================
                                                Product Header
                                            ================================================== */}

                                            <div
                                                className="
                                                    flex
                                                    min-w-0
                                                    items-start
                                                    justify-between
                                                    gap-3
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        min-w-0
                                                        flex-1
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
                                                            border-[var(--border)]
                                                            bg-[var(--surface-muted)]
                                                        "
                                                    >

                                                        <Package
                                                            size={17}
                                                            className="
                                                                text-[var(--text-muted)]
                                                            "
                                                        />

                                                    </div>


                                                    <div
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                truncate
                                                                text-xs
                                                                font-semibold
                                                                text-[var(--text-primary)]
                                                            "
                                                        >
                                                            {
                                                                product.name
                                                            }
                                                        </p>


                                                        <p
                                                            className="
                                                                mt-1
                                                                truncate
                                                                text-[10px]
                                                                text-[var(--text-muted)]
                                                            "
                                                        >
                                                            {
                                                                product.category ||
                                                                '-'
                                                            }
                                                        </p>

                                                    </div>

                                                </div>


                                                {/* Status */}

                                                <span
                                                    className={`
                                                        inline-flex
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        gap-1
                                                        rounded-lg
                                                        border
                                                        px-2
                                                        py-1
                                                        text-[9px]
                                                        font-medium
                                                        whitespace-nowrap
                                                        ${stockStatus.className}
                                                    `}
                                                >

                                                    <span
                                                        className={`
                                                            h-1.5
                                                            w-1.5
                                                            rounded-full
                                                            ${stockStatus.dotClass}
                                                        `}
                                                    />

                                                    <StatusIcon
                                                        size={11}
                                                    />

                                                    {
                                                        stockStatus.label
                                                    }

                                                </span>

                                            </div>


                                            {/* =================================================
                                                Information
                                            ================================================== */}

                                            <div
                                                className="
                                                    mt-4
                                                    space-y-4
                                                    rounded-xl
                                                    border
                                                    border-[var(--border)]
                                                    bg-[var(--surface-muted)]
                                                    p-3
                                                "
                                            >

                                                {/* Prices */}

                                                <div
                                                    className="
                                                        grid
                                                        grid-cols-2
                                                        gap-x-8
                                                        gap-y-4
                                                    "
                                                >

                                                    {/* Buy */}

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
                                                                    'products.table.columns.buyPrice'
                                                                )
                                                            }
                                                        </p>


                                                        <p
                                                            dir={
                                                                isEnglish
                                                                    ? 'ltr'
                                                                    : 'rtl'
                                                            }
                                                            className="
                                                                mt-1
                                                                truncate
                                                                number-font
                                                                text-xs
                                                                text-[var(--text-secondary)]
                                                            "
                                                        >

                                                            {
                                                                formatNumber(
                                                                    product.buyPrice,
                                                                    language
                                                                )
                                                            }

                                                            <span
                                                                className="
                                                                    ms-1
                                                                    font-sans
                                                                    text-[9px]
                                                                    text-[var(--text-muted)]
                                                                "
                                                            >
                                                                {
                                                                    isEnglish
                                                                        ? 'AF'
                                                                        : 'افغانی'
                                                                }
                                                            </span>

                                                        </p>

                                                    </div>


                                                    {/* Sell */}

                                                    <div
                                                        className="
                                                            min-w-0
                                                            text-end
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
                                                                    'products.table.columns.sellPrice'
                                                                )
                                                            }
                                                        </p>


                                                        <p
                                                            dir={
                                                                isEnglish
                                                                    ? 'ltr'
                                                                    : 'rtl'
                                                            }
                                                            className="
                                                                mt-1
                                                                truncate
                                                                number-font
                                                                text-xs
                                                                font-bold
                                                                text-[var(--text-primary)]
                                                            "
                                                        >

                                                            {
                                                                formatNumber(
                                                                    product.sellPrice,
                                                                    language
                                                                )
                                                            }

                                                            <span
                                                                className="
                                                                    ms-1
                                                                    font-sans
                                                                    text-[9px]
                                                                    font-normal
                                                                    text-[var(--text-muted)]
                                                                "
                                                            >
                                                                {
                                                                    isEnglish
                                                                        ? 'AF'
                                                                        : 'افغانی'
                                                                }
                                                            </span>

                                                        </p>

                                                    </div>

                                                </div>


                                                {/* Divider */}

                                                <div
                                                    className="
                                                        h-px
                                                        bg-[var(--border)]
                                                    "
                                                />


                                                {/* Stock + Updated */}

                                                <div
                                                    className="
                                                        grid
                                                        grid-cols-2
                                                        gap-x-8
                                                        gap-y-4
                                                    "
                                                >

                                                    {/* Stock */}

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
                                                                    'products.table.columns.stock'
                                                                )
                                                            }
                                                        </p>


                                                        <p
                                                            dir={
                                                                isEnglish
                                                                    ? 'ltr'
                                                                    : 'rtl'
                                                            }
                                                            className="
                                                                mt-1
                                                                truncate
                                                                number-font
                                                                text-xs
                                                                font-semibold
                                                                text-[var(--text-secondary)]
                                                            "
                                                        >

                                                            {
                                                                formatNumber(
                                                                    product.stock,
                                                                    language
                                                                )
                                                            }

                                                            <span
                                                                className="
                                                                    ms-1
                                                                    font-sans
                                                                    text-[9px]
                                                                    font-normal
                                                                    text-[var(--text-muted)]
                                                                "
                                                            >
                                                                {
                                                                    product.unit ||
                                                                    ''
                                                                }
                                                            </span>

                                                        </p>

                                                    </div>


                                                    {/* Updated */}

                                                    <div
                                                        className="
                                                            min-w-0
                                                            text-end
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
                                                                    'products.table.columns.updated'
                                                                )
                                                            }
                                                        </p>


                                                        <p
                                                            className="
                                                                mt-1
                                                                truncate
                                                                text-xs
                                                                text-[var(--text-secondary)]
                                                            "
                                                        >
                                                            {
                                                                formatDisplayDate(
                                                                    product.updatedAt,
                                                                    language,
                                                                    jalaliMonthStyle
                                                                )
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* =================================================
                                                Mobile Actions
                                            ================================================== */}

                                            <div
                                                className="
                                                    mt-3
                                                    grid
                                                    grid-cols-[1fr_auto_auto]
                                                    gap-2
                                                "
                                            >

                                                {/* Details */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onViewDetails?.(
                                                            product
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        h-10
                                                        min-w-0
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        rounded-xl
                                                        border
                                                        border-[var(--border)]
                                                        bg-[var(--surface)]
                                                        px-3
                                                        text-xs
                                                        text-[var(--text-muted)]
                                                        transition-all
                                                        duration-200
                                                        hover:border-emerald-500/20
                                                        hover:bg-emerald-500/5
                                                        hover:text-emerald-500
                                                        dark:hover:text-emerald-400
                                                    "
                                                >

                                                    <Eye
                                                        size={15}
                                                        className="
                                                            shrink-0
                                                        "
                                                    />


                                                    <span
                                                        className="
                                                            truncate
                                                        "
                                                    >
                                                        {
                                                            t(
                                                                'products.table.actions.details'
                                                            )
                                                        }
                                                    </span>

                                                </button>


                                                {/* Edit */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            product
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        h-10
                                                        w-10
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        border
                                                        border-[var(--border)]
                                                        bg-[var(--surface)]
                                                        text-[var(--text-muted)]
                                                        transition-all
                                                        duration-200
                                                        hover:border-blue-500/20
                                                        hover:bg-blue-500/5
                                                        hover:text-blue-500
                                                        dark:hover:text-blue-400
                                                    "
                                                    title={
                                                        t(
                                                            'products.table.actions.edit'
                                                        )
                                                    }
                                                    aria-label={
                                                        t(
                                                            'products.table.actions.edit'
                                                        )
                                                    }
                                                >

                                                    <Pencil
                                                        size={15}
                                                    />

                                                </button>


                                                {/* Delete */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            product
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        h-10
                                                        w-10
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-xl
                                                        border
                                                        border-[var(--border)]
                                                        bg-[var(--surface)]
                                                        text-[var(--text-muted)]
                                                        transition-all
                                                        duration-200
                                                        hover:border-rose-500/20
                                                        hover:bg-rose-500/5
                                                        hover:text-rose-500
                                                        dark:hover:text-rose-400
                                                    "
                                                    title={
                                                        t(
                                                            'products.table.actions.delete'
                                                        )
                                                    }
                                                    aria-label={
                                                        t(
                                                            'products.table.actions.delete'
                                                        )
                                                    }
                                                >

                                                    <Trash2
                                                        size={15}
                                                    />

                                                </button>

                                            </div>

                                        </article>

                                    );

                                }
                            )
                        }

                    </div>

                )
            }

        </section>

    );

}


export default ProductTable;