import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const FIELD_CLASS = `
    w-full h-11 rounded-xl
    border border-[var(--input-border)]
    bg-[var(--input-bg)]
    text-sm text-[var(--text)]
    placeholder:text-[var(--text-soft)]
    outline-none
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    transition
`;

function ProductFilters({
    search = '', category = 'all', stockStatus = 'all', categories = [],
    onSearchChange, onCategoryChange, onStockStatusChange, onClearFilters,
}) {
    const { t } = useTranslation();

    const stockStatuses = [
        { value: 'all', label: t('productFilters.allProducts') },
        { value: 'available', label: t('productFilters.available') },
        { value: 'low', label: t('productFilters.lowStock') },
        { value: 'out', label: t('productFilters.outOfStock') },
    ];

    const hasFilters = search.trim() !== '' || category !== 'all' || stockStatus !== 'all';

    const categoryOptions = [
        { value: 'all', label: t('productFilters.allCategories') },
        ...categories
            .filter(Boolean)
            .map((item) =>
                typeof item === 'object' && item !== null
                    ? { value: item.name, label: item.name }
                    : { value: item, label: item }
            )
            .filter((item) => item.value),
    ];

    const handleSearchChange = (event) => onSearchChange?.(toEnglishNumbers(event.target.value));

    return (
        <section className="group ui-card-tint p-4">
            <div aria-hidden="true" className="ui-tint" />

            <div className="ui-layer mb-4 flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center">
                        <SlidersHorizontal size={16} className="text-[var(--accent-500)]" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[var(--text)] truncate">
                            {t('productFilters.title')}
                        </h3>
                        <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                            {t('productFilters.description')}
                        </p>
                    </div>
                </div>

                {hasFilters && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="self-start xs:self-auto shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/5 dark:hover:text-red-400 transition"
                    >
                        <X size={13} />
                        {t('productFilters.clear')}
                    </button>
                )}
            </div>

            <div className="ui-layer grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Search */}
                <div className="relative min-w-0">
                    <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)] pointer-events-none" />
                    <input
                        type="text"
                        value={search}
                        onChange={handleSearchChange}
                        placeholder={t('productFilters.searchPlaceholder')}
                        className={`${FIELD_CLASS} ps-10 pe-4`}
                    />
                </div>

                {/* Category */}
                <FilterSelect
                    value={category}
                    onChange={onCategoryChange}
                    options={categoryOptions}
                />

                {/* Stock */}
                <FilterSelect
                    value={stockStatus}
                    onChange={onStockStatusChange}
                    options={stockStatuses}
                />
            </div>

            {hasFilters && (
                <div className="ui-layer flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)]">{t('productFilters.activeFilters')}</span>

                    {search.trim() !== '' && (
                        <Chip tone="accent">
                            <Search size={11} className="shrink-0" />
                            <span className="max-w-[12rem] truncate">{search}</span>
                        </Chip>
                    )}

                    {category !== 'all' && (
                        <Chip>
                            {t('productFilters.category')}
                            <span className="max-w-[10rem] truncate text-[var(--text-secondary)]">
                                {categoryOptions.find((i) => i.value === category)?.label || category}
                            </span>
                        </Chip>
                    )}

                    {stockStatus !== 'all' && (
                        <Chip>
                            {t('productFilters.status')}
                            <span className="text-[var(--text-secondary)]">
                                {stockStatuses.find((i) => i.value === stockStatus)?.label}
                            </span>
                        </Chip>
                    )}
                </div>
            )}
        </section>
    );
}

// =========================================================
// Small helpers
// =========================================================

function FilterSelect({ value, onChange, options }) {
    return (
        <div className="relative min-w-0">
            <select
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                className={`${FIELD_CLASS} appearance-none ps-4 pe-10 cursor-pointer`}
            >
                {options.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                ))}
            </select>
            <ChevronDown size={16} className="absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)] pointer-events-none" />
        </div>
    );
}

function Chip({ children, tone = 'muted' }) {
    const cls = tone === 'accent'
        ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent-600)] dark:text-[var(--accent-300)]'
        : 'bg-[var(--surface-muted)] border-[var(--border-subtle)] text-[var(--text-muted)]';
    return (
        <span className={`inline-flex items-center gap-1.5 max-w-full px-2.5 py-1.5 rounded-lg border text-[10px] ${cls}`}>
            {children}
        </span>
    );
}

export default ProductFilters;