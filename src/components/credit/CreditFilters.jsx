import { Search, SlidersHorizontal, ChevronDown, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const DEFAULT_FILTERS = { search: '', status: 'all', sort: 'newest' };

function CreditFilters({ filters, onChange, onReset }) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';
    const direction = typeof i18n.dir === 'function' ? i18n.dir() : (isEnglish ? 'ltr' : 'rtl');

    const currentFilters = { ...DEFAULT_FILTERS, ...(filters || {}) };
    const handleChange = (key, value) => onChange?.({ [key]: value });

    const searchPadding = isEnglish ? 'pl-10 pr-4' : 'pr-10 pl-4';
    const selectPadding = isEnglish ? 'pl-3.5 pr-9' : 'pr-3.5 pl-9';
    const iconSide = isEnglish ? 'right-3' : 'left-3';
    const searchSide = isEnglish ? 'left-3' : 'right-3';

    const statusOptions = [
        { value: 'all', label: t('credit.filters.status.allShort', { defaultValue: isEnglish ? 'All' : 'همه' }) },
        { value: 'debt', label: t('credit.filters.status.debt', { defaultValue: isEnglish ? 'Debt' : 'بدهکار' }) },
        { value: 'partial', label: t('credit.filters.status.partial', { defaultValue: isEnglish ? 'Partial' : 'پرداخت جزئی' }) },
        { value: 'settled', label: t('credit.filters.status.settled', { defaultValue: isEnglish ? 'Settled' : 'تسویه' }) },
    ];

    return (
        <section dir={direction} className="ui-card relative overflow-hidden p-0">
            <div className="relative z-10 flex flex-col gap-3 border-b border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/10 bg-amber-500/10 shadow-[var(--shadow-xs)]">
                        <SlidersHorizontal size={16} className="text-amber-500" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-[var(--text)]">
                            {t('credit.filters.title', { defaultValue: isEnglish ? 'Search & Filter' : 'جستجو و فیلتر' })}
                        </h2>
                        <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)] sm:text-[11px]">
                            {t('credit.filters.description', { defaultValue: isEnglish ? 'Find the customer account you need' : 'حساب مشتری موردنظر را پیدا کنید' })}
                        </p>
                    </div>
                </div>

                <button type="button" onClick={() => onReset?.()} className="ui-button-secondary h-9 w-full rounded-lg px-3 text-[11px] sm:w-auto">
                    <RotateCcw size={13} />
                    <span>{t('credit.filters.clear', { defaultValue: isEnglish ? 'Clear Filters' : 'پاک کردن فیلترها' })}</span>
                </button>
            </div>

            <div className="relative z-10 grid grid-cols-1 gap-3 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_190px_190px]">
                <div className="relative min-w-0">
                    <Search size={16} className={`pointer-events-none absolute ${searchSide} top-1/2 -translate-y-1/2 text-[var(--text-muted)]`} />
                    <input
                        type="text"
                        value={currentFilters.search}
                        onChange={(e) => handleChange('search', e.target.value)}
                        placeholder={t('credit.filters.searchPlaceholder', { defaultValue: isEnglish ? 'Search customer name or phone...' : 'جستجوی نام یا شماره مشتری...' })}
                        className={`ui-input h-11 w-full ${searchPadding}`}
                    />
                </div>

                <div className="relative min-w-0">
                    <select
                        value={currentFilters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className={`ui-input h-11 w-full cursor-pointer appearance-none ${selectPadding}`}
                    >
                        <option value="all">{t('credit.filters.status.all', { defaultValue: isEnglish ? 'All Accounts' : 'همه حساب‌ها' })}</option>
                        <option value="debt">{t('credit.filters.status.debt', { defaultValue: isEnglish ? 'Debt' : 'بدهکار' })}</option>
                        <option value="partial">{t('credit.filters.status.partial', { defaultValue: isEnglish ? 'Partial Payment' : 'پرداخت جزئی' })}</option>
                        <option value="settled">{t('credit.filters.status.settled', { defaultValue: isEnglish ? 'Settled' : 'تسویه‌شده' })}</option>
                    </select>
                    <ChevronDown size={15} className={`pointer-events-none absolute ${iconSide} top-1/2 -translate-y-1/2 text-[var(--text-muted)]`} />
                </div>

                <div className="relative min-w-0">
                    <select
                        value={currentFilters.sort}
                        onChange={(e) => handleChange('sort', e.target.value)}
                        className={`ui-input h-11 w-full cursor-pointer appearance-none ${selectPadding}`}
                    >
                        <option value="newest">{t('credit.filters.sort.newest', { defaultValue: isEnglish ? 'Newest' : 'جدیدترین' })}</option>
                        <option value="oldest">{t('credit.filters.sort.oldest', { defaultValue: isEnglish ? 'Oldest' : 'قدیمی‌ترین' })}</option>
                        <option value="highest">{t('credit.filters.sort.highest', { defaultValue: isEnglish ? 'Highest Debt' : 'بیشترین بدهی' })}</option>
                        <option value="lowest">{t('credit.filters.sort.lowest', { defaultValue: isEnglish ? 'Lowest Debt' : 'کمترین بدهی' })}</option>
                        <option value="name">{t('credit.filters.sort.name', { defaultValue: isEnglish ? 'Customer Name' : 'نام مشتری' })}</option>
                    </select>
                    <ChevronDown size={15} className={`pointer-events-none absolute ${iconSide} top-1/2 -translate-y-1/2 text-[var(--text-muted)]`} />
                </div>
            </div>

            <div className="relative z-10 flex items-center gap-1.5 overflow-x-auto border-t border-[var(--border)] px-4 py-3 sm:px-5">
                <span className="shrink-0 px-1 text-[10px] font-medium text-[var(--text-muted)]">
                    {t('credit.filters.quickStatus.title', { defaultValue: isEnglish ? 'Status:' : 'وضعیت:' })}
                </span>
                {statusOptions.map((item) => {
                    const active = currentFilters.status === item.value;
                    return (
                        <button
                            key={item.value}
                            type="button"
                            onClick={() => handleChange('status', item.value)}
                            className={`shrink-0 rounded-lg border px-3 py-1.5 text-[10px] font-medium transition-all ${
                                active
                                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-500'
                                    : 'border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export default CreditFilters;