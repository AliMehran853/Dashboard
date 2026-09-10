import {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Package,
    Layers3,
    AlertTriangle,
    Wallet,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import {
    getProducts,
    getCategories,
} from '../../database/db';


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
// Get Number Locale
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
// Product Stats
// =========================================================

function ProductStats({
    refreshKey = 0,
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


    // =====================================================
    // Data State
    // =====================================================

    const [products, setProducts] =
        useState([]);

    const [categoriesCount, setCategoriesCount] =
        useState(0);

    const [loading, setLoading] =
        useState(true);


    // =====================================================
    // Load Statistics
    // =====================================================

    useEffect(() => {

        let mounted = true;


        const loadStats = async () => {

            try {

                setLoading(true);


                const [
                    productsData,
                    categoriesData,
                ] = await Promise.all([
                    getProducts(),
                    getCategories(),
                ]);


                if (!mounted) {
                    return;
                }


                setProducts(
                    Array.isArray(
                        productsData
                    )
                        ? productsData
                        : []
                );


                setCategoriesCount(
                    Array.isArray(
                        categoriesData
                    )
                        ? categoriesData.length
                        : 0
                );

            } catch (error) {

                console.error(
                    'Failed to load product statistics:',
                    error
                );


                if (mounted) {

                    setProducts([]);
                    setCategoriesCount(0);

                }

            } finally {

                if (mounted) {
                    setLoading(false);
                }

            }

        };


        loadStats();


        return () => {
            mounted = false;
        };

    }, [refreshKey]);


    // =====================================================
    // Statistics
    // =====================================================

    const productCount =
        products.length;


    const lowStockCount =
        useMemo(() => {

            return products.filter(
                (product) => {

                    const stock =
                        Number(
                            toEnglishNumbers(
                                product.stock
                            )
                        ) || 0;


                    const minStock =
                        Number(
                            toEnglishNumbers(
                                product.minStock
                            )
                        ) || 0;


                    return (
                        stock > 0 &&
                        stock <= minStock
                    );

                }
            ).length;

        }, [products]);


    const outOfStockCount =
        useMemo(() => {

            return products.filter(
                (product) =>
                    Number(
                        toEnglishNumbers(
                            product.stock
                        )
                    ) === 0
            ).length;

        }, [products]);


    const inventoryValue =
        useMemo(() => {

            return products.reduce(
                (
                    total,
                    product
                ) => {

                    const stock =
                        Number(
                            toEnglishNumbers(
                                product.stock
                            )
                        ) || 0;


                    const buyPrice =
                        Number(
                            toEnglishNumbers(
                                product.buyPrice
                            )
                        ) || 0;


                    return (
                        total +
                        stock *
                        buyPrice
                    );

                },
                0
            );

        }, [products]);


    // =====================================================
    // Statistics Cards
    // =====================================================

    const stats = [

        {
            id:
                'products',

            title:
                t(
                    'productStats.products.title'
                ),

            value:
                loading
                    ? '...'
                    : formatNumber(
                        productCount,
                        language
                    ),

            description:
                t(
                    'productStats.products.description'
                ),

            icon:
                Package,

            iconClass:
                'text-emerald-500 dark:text-emerald-400',

            iconBg:
                'border-emerald-500/10 bg-emerald-500/10',
        },


        {
            id:
                'categories',

            title:
                t(
                    'productStats.categories.title'
                ),

            value:
                loading
                    ? '...'
                    : formatNumber(
                        categoriesCount,
                        language
                    ),

            description:
                t(
                    'productStats.categories.description'
                ),

            icon:
                Layers3,

            iconClass:
                'text-cyan-500 dark:text-cyan-400',

            iconBg:
                'border-cyan-500/10 bg-cyan-500/10',
        },


        {
            id:
                'low-stock',

            title:
                t(
                    'productStats.lowStock.title'
                ),

            value:
                loading
                    ? '...'
                    : formatNumber(
                        lowStockCount,
                        language
                    ),

            description:
                loading
                    ? t(
                        'productStats.lowStock.checking'
                    )
                    : outOfStockCount > 0
                        ? t(
                            'productStats.lowStock.outOfStock',
                            {
                                count:
                                    formatNumber(
                                        outOfStockCount,
                                        language
                                    ),
                            }
                        )
                        : t(
                            'productStats.lowStock.supply'
                        ),

            icon:
                AlertTriangle,

            iconClass:
                'text-amber-500 dark:text-amber-400',

            iconBg:
                'border-amber-500/10 bg-amber-500/10',
        },


        {
            id:
                'inventory-value',

            title:
                t(
                    'productStats.inventoryValue.title'
                ),

            value:
                loading
                    ? '...'
                    : formatNumber(
                        inventoryValue,
                        language
                    ),

            description:
                t(
                    'productStats.inventoryValue.description'
                ),

            icon:
                Wallet,

            iconClass:
                'text-violet-500 dark:text-violet-400',

            iconBg:
                'border-violet-500/10 bg-violet-500/10',
        },

    ];


    // =====================================================
    // Render
    // =====================================================

    return (

        <section
            className="
                grid
                grid-cols-1
                min-[420px]:grid-cols-2
                gap-3
                sm:gap-4
                xl:grid-cols-4
            "
        >

            {
                stats.map(
                    (stat) => {

                        const Icon =
                            stat.icon;


                        return (

                            <article
                                key={
                                    stat.id
                                }
                                className="
                                    group
                                    relative
                                    min-w-0
                                    overflow-hidden
                                    rounded-2xl
                                    border
                                    border-[var(--border)]
                                    p-4
                                    sm:p-5
                                    shadow-[var(--shadow-card)]
                                    transition-all
                                    duration-300
                                    ease-[var(--ease-out)]
                                    hover:-translate-y-0.5
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
                                ================================================== */}

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
                                    Hover Background Glow
                                    Fades in on hover, follows ACCENT color
                                    (not the card's own tone).
                                ================================================== */}

                                <div
                                    aria-hidden="true"
                                    className="
                                        pointer-events-none
                                        absolute
                                        -end-10
                                        -top-10
                                        h-28
                                        w-28
                                        rounded-full
                                        blur-3xl
                                        opacity-0
                                        transition-opacity
                                        duration-500
                                        group-hover:opacity-100
                                    "
                                    style={{
                                        background: `
                                            radial-gradient(
                                                circle,
                                                var(--accent-soft-heavy),
                                                transparent 70%
                                            )
                                        `,
                                    }}
                                />


                                {/* =================================================
                                    Accent Top Line (per-tone, for icon identity)
                                ================================================== */}

                                <div
                                    aria-hidden="true"
                                    className="
                                        absolute
                                        inset-x-0
                                        top-0
                                        h-px
                                        bg-[var(--accent-500)]
                                        opacity-40
                                        transition-opacity
                                        duration-300
                                        group-hover:opacity-80
                                    "
                                />


                                {/* =================================================
                                    Content
                                ================================================== */}

                                <div
                                    className="
                                        relative
                                        z-10
                                        flex
                                        items-start
                                        justify-between
                                        gap-4
                                    "
                                >

                                    {/* Text */}

                                    <div
                                        className="
                                            min-w-0
                                        "
                                    >

                                        <p
                                            className="
                                                truncate
                                                text-xs
                                                font-medium
                                                text-[var(--text-muted)]
                                            "
                                        >
                                            {
                                                stat.title
                                            }
                                        </p>


                                        <p
                                            dir={
                                                String(
                                                    language
                                                )
                                                    .toLowerCase()
                                                    .startsWith(
                                                        'en'
                                                    )
                                                        ? 'ltr'
                                                        : 'rtl'
                                            }
                                            className="
                                                mt-2
                                                truncate
                                                number-font
                                                text-xl
                                                font-bold
                                                tracking-tight
                                                text-[var(--text-primary)]
                                                sm:text-2xl
                                            "
                                        >
                                            {
                                                stat.value
                                            }
                                        </p>


                                        <p
                                            className="
                                                mt-2
                                                min-h-[2rem]
                                                text-[10px]
                                                leading-5
                                                text-[var(--text-muted)]
                                            "
                                        >
                                            {
                                                stat.description
                                            }
                                        </p>

                                    </div>


                                    {/* Icon (per-tone, for identity) */}

                                    <div
                                        className={`
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            border
                                            transition-all
                                            duration-300
                                            group-hover:scale-105
                                            sm:h-11
                                            sm:w-11
                                            ${stat.iconBg}
                                        `}
                                    >

                                        <Icon
                                            size={20}
                                            className={`
                                                transition-transform
                                                duration-300
                                                group-hover:scale-110
                                                ${stat.iconClass}
                                            `}
                                        />

                                    </div>

                                </div>


                                {/* =================================================
                                    Bottom Indicator (accent-driven)
                                ================================================== */}

                                <div
                                    className="
                                        relative
                                        z-10
                                        mt-4
                                        h-px
                                        overflow-hidden
                                        rounded-full
                                        bg-[var(--border)]
                                    "
                                >

                                    <div
                                        className="
                                            h-full
                                            w-8
                                            rounded-full
                                            bg-[var(--accent-500)]
                                            opacity-60
                                            transition-all
                                            duration-500
                                            group-hover:w-16
                                            group-hover:opacity-100
                                        "
                                    />

                                </div>

                            </article>

                        );

                    }
                )
            }

        </section>

    );

}


export default ProductStats;