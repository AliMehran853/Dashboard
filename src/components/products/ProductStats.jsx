import { useEffect, useMemo, useState } from 'react';
import { Package, Layers3, AlertTriangle, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getProducts, getCategories } from '../../database/db';
import { useCountUp } from '../../hooks/useCountUp';

// =========================================================
// Helpers
// =========================================================

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const formatNumber = (number, language) => {
    const locale = String(language || '').toLowerCase().startsWith('en')
        ? 'en-US'
        : 'fa-IR';
    return new Intl.NumberFormat(locale).format(
        Number(toEnglishNumbers(number)) || 0
    );
};

// =========================================================
// AnimatedNumber
// =========================================================

function AnimatedNumber({ value, language, className, dir }) {
    const animated = useCountUp(Number(toEnglishNumbers(value)) || 0, {
        duration: 900,
    });

    const isEnglish = String(language || '').toLowerCase().startsWith('en');
    const formatted = new Intl.NumberFormat(
        isEnglish ? 'en-US' : 'fa-IR'
    ).format(animated);

    return (
        <span dir={dir} className={className}>
            {formatted}
        </span>
    );
}

// =========================================================
// Product Stats
// =========================================================

function ProductStats({ refreshKey = 0 }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');

    const [products, setProducts] = useState([]);
    const [categoriesCount, setCategoriesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                setLoading(true);

                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories(),
                ]);

                if (!mounted) return;

                setProducts(Array.isArray(productsData) ? productsData : []);
                setCategoriesCount(
                    Array.isArray(categoriesData) ? categoriesData.length : 0
                );
            } catch (err) {
                console.error('Failed to load product statistics:', err);
                if (mounted) {
                    setProducts([]);
                    setCategoriesCount(0);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [refreshKey]);

    const { lowStockCount, outOfStockCount, inventoryValue } = useMemo(() => {
        let low = 0;
        let out = 0;
        let value = 0;

        for (const product of products) {
            const stock = Number(toEnglishNumbers(product.stock)) || 0;
            const minStock = Number(toEnglishNumbers(product.minStock)) || 0;
            const avgCost = Number(toEnglishNumbers(product.avgCost)) || 0;

            if (stock === 0) out += 1;
            else if (stock <= minStock) low += 1;

            const totalValue = Number(product.totalValue);
            if (Number.isFinite(totalValue) && totalValue > 0) {
                value += totalValue;
            } else {
                value += stock * avgCost;
            }
        }

        return {
            lowStockCount: low,
            outOfStockCount: out,
            inventoryValue: value,
        };
    }, [products]);

    const stats = [
        {
            id: 'products',
            title: t('productStats.products.title'),
            value: products.length,
            description: t('productStats.products.description'),
            icon: Package,
            iconClass: 'text-emerald-500 dark:text-emerald-400',
            iconBg: 'border-emerald-500/15 bg-emerald-500/10',
        },
        {
            id: 'categories',
            title: t('productStats.categories.title'),
            value: categoriesCount,
            description: t('productStats.categories.description'),
            icon: Layers3,
            iconClass: 'text-cyan-500 dark:text-cyan-400',
            iconBg: 'border-cyan-500/15 bg-cyan-500/10',
        },
        {
            id: 'low-stock',
            title: t('productStats.lowStock.title'),
            value: lowStockCount,
            description: loading
                ? t('productStats.lowStock.checking')
                : outOfStockCount > 0
                ? t('productStats.lowStock.outOfStock', {
                      count: formatNumber(outOfStockCount, language),
                  })
                : t('productStats.lowStock.supply'),
            icon: AlertTriangle,
            iconClass: 'text-amber-500 dark:text-amber-400',
            iconBg: 'border-amber-500/15 bg-amber-500/10',
        },
        {
            id: 'inventory-value',
            title: t('productStats.inventoryValue.title'),
            value: inventoryValue,
            description: t('productStats.inventoryValue.description'),
            icon: Wallet,
            iconClass: 'text-violet-500 dark:text-violet-400',
            iconBg: 'border-violet-500/15 bg-violet-500/10',
        },
    ];

    return (
        <section>
            <header className="mb-4 flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className="h-7 w-1 shrink-0 rounded-full bg-[var(--accent-500)] shadow-[0_0_12px_var(--accent-glow)] sm:h-8"
                />

                <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-[var(--text)] sm:text-base lg:text-lg">
                        {t('products.statsSection.title')}
                    </h2>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
                        {t('products.statsSection.description')}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <article
                            key={stat.id}
                            className="ui-card group flex h-full flex-col p-4 sm:p-5"
                        >
                            {/* ─── Row 1: title + icon ─── */}
                            <div className="flex items-start justify-between gap-3">
                                <p className="min-w-0 flex-1 truncate pt-1 text-xs font-medium text-[var(--text-muted)]">
                                    {stat.title}
                                </p>

                                <div
                                    className={`
                                        flex h-10 w-10 shrink-0 items-center justify-center
                                        rounded-xl border
                                        transition-transform duration-300 ease-[var(--ease-soft)]
                                        group-hover:scale-110
                                        sm:h-11 sm:w-11
                                        ${stat.iconBg}
                                    `}
                                >
                                    <Icon
                                        size={19}
                                        strokeWidth={1.9}
                                        className={stat.iconClass}
                                    />
                                </div>
                            </div>

                            {/* ─── Row 2: value ─── */}
                            <p
                                dir={isEnglish ? 'ltr' : 'rtl'}
                                className="
                                    mt-3 truncate number-font
                                    text-2xl font-bold tracking-tight
                                    text-[var(--text-primary)]
                                    sm:text-3xl
                                "
                            >
                                {loading ? (
                                    <span className="inline-block h-7 w-20 animate-pulse rounded-lg bg-[var(--surface-muted)] align-middle" />
                                ) : (
                                    <AnimatedNumber
                                        value={stat.value}
                                        language={language}
                                    />
                                )}
                            </p>

                            {/* ─── Row 3: description ─── */}
                            <p className="mt-2 min-h-[2rem] text-[10px] leading-5 text-[var(--text-muted)] sm:text-[11px]">
                                {stat.description}
                            </p>

                            {/* ─── Row 4: progress line (چسبیده به پایین) ─── */}
                            <div className="mt-auto pt-4">
                                <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
                                    <div
                                        className="
                                            absolute inset-y-0 start-0 w-8 rounded-full
                                            bg-[var(--accent-500)] opacity-60
                                            transition-all duration-500 ease-[var(--ease-soft)]
                                            group-hover:w-16 group-hover:opacity-100
                                        "
                                    />
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default ProductStats;