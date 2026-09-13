import { Search, ListFilter, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FIELD_CLASS = `
    w-full h-11 min-w-0 rounded-xl
    border border-[var(--input-border)]
    bg-[var(--input-bg)]
    text-xs text-[var(--text)]
    placeholder:text-[var(--text-soft)]
    outline-none
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    transition
`;

function ShoppingListFilters({
    search = '', status = 'all', priority = 'all',
    onSearchChange, onStatusChange, onPriorityChange, onClearFilters,
}) {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || 'fa').toLowerCase().startsWith('en');
    const isRtl = i18n.dir() === 'rtl';

    const statusOptions = [
        { value: 'all', label: t('shoppingList.filters.status.all', { defaultValue: isEnglish ? 'All' : 'همه' }) },
        { value: 'pending', label: t('shoppingList.filters.status.pending', { defaultValue: isEnglish ? 'Pending' : 'در انتظار' }) },
        { value: 'completed', label: t('shoppingList.filters.status.completed', { defaultValue: isEnglish ? 'Completed' : 'تکمیل‌شده' }) },
    ];

    const priorityOptions = [
        { value: 'all', label: t('shoppingList.filters.priority.all', { defaultValue: isEnglish ? 'All priorities' : 'همه اولویت‌ها' }) },
        { value: 'low', label: t('shoppingList.filters.priority.low', { defaultValue: isEnglish ? 'Low' : 'کم' }) },
        { value: 'normal', label: t('shoppingList.filters.priority.normal', { defaultValue: isEnglish ? 'Normal' : 'عادی' }) },
        { value: 'high', label: t('shoppingList.filters.priority.high', { defaultValue: isEnglish ? 'High' : 'زیاد' }) },
        { value: 'urgent', label: t('shoppingList.filters.priority.urgent', { defaultValue: isEnglish ? 'Urgent' : 'فوری' }) },
    ];

    return (
        <section dir={i18n.dir()} className="ui-card-tint p-4 sm:p-5">
            <div className="ui-layer mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                    <ListFilter size={15} className="text-[var(--accent-500)]" />
                </div>
                <div className="min-w-0">
                    <h2 className="truncate text-xs font-semibold text-[var(--text-primary)]">
                        {t('shoppingList.filters.title', { defaultValue: isEnglish ? 'Shopping List Filters' : 'فیلترهای لیست خرید' })}
                    </h2>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                        {t('shoppingList.filters.description', { defaultValue: isEnglish ? 'Filter items by status and priority.' : 'اقلام را بر اساس وضعیت و اولویت فیلتر کنید.' })}
                    </p>
                </div>
            </div>

            <div className="ui-layer grid grid-cols-1 items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_auto_minmax(150px,150px)_auto]">
                {/* Search */}
                <div className="relative min-w-0">
                    <Search
                        size={17}
                        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--text-soft)] ${isRtl ? 'right-3' : 'left-3'}`}
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder={t('shoppingList.filters.searchPlaceholder', { defaultValue: isEnglish ? 'Search items...' : 'جستجوی اقلام...' })}
                        dir={i18n.dir()}
                        className={`${FIELD_CLASS} ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'}`}
                    />
                </div>

                {/* Status segmented */}
                <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-0.5">
                    <div className="flex min-w-max items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-1">
                        {statusOptions.map((option) => {
                            const active = status === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => onStatusChange?.(option.value)}
                                    className={`h-9 rounded-lg px-3 text-[10px] font-medium whitespace-nowrap transition-all duration-200 sm:px-3.5 ${
                                        active
                                            ? 'bg-[var(--accent-soft)] text-[var(--accent-600)] shadow-sm dark:text-[var(--accent-300)]'
                                            : 'text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Priority */}
                <select
                    value={priority}
                    onChange={(e) => onPriorityChange?.(e.target.value)}
                    dir={i18n.dir()}
                    className={`${FIELD_CLASS} cursor-pointer xl:min-w-[150px]`}
                >
                    {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>

                {/* Clear */}
                <button
                    type="button"
                    onClick={onClearFilters}
                    className="ui-button-secondary h-11 w-full shrink-0 px-4 text-xs sm:w-auto"
                >
                    <RotateCcw size={14} />
                    {t('shoppingList.filters.clear', { defaultValue: isEnglish ? 'Clear filters' : 'پاک کردن فیلترها' })}
                </button>
            </div>
        </section>
    );
}

export default ShoppingListFilters;