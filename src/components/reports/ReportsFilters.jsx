import { Search, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FIELD_CLASS = `
    w-full h-10 min-w-0 rounded-xl
    border border-[var(--input-border)]
    bg-[var(--input-bg)]
    text-xs text-[var(--text)]
    placeholder:text-[var(--text-soft)]
    outline-none
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    transition
`;

function ReportsFilters({
    search = '', period = 'week', paymentType = 'all', category = 'all', categories = [],
    onSearchChange, onPeriodChange, onPaymentTypeChange, onCategoryChange, onClearFilters,
}) {
    const { t, i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';

    return (
        <section dir={i18n.dir()} className="ui-card-tint p-4">
            <div className="ui-layer grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_repeat(3,minmax(140px,1fr))_auto]">
                {/* Search */}
                <div className="relative min-w-0">
                    <Search
                        size={16}
                        className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[var(--text-soft)] ${isRtl ? 'right-3' : 'left-3'}`}
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        placeholder={t('reports.filters.searchPlaceholder')}
                        dir={i18n.dir()}
                        className={`${FIELD_CLASS} ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'}`}
                    />
                </div>

                {/* Period */}
                <select
                    value={period}
                    onChange={(e) => onPeriodChange?.(e.target.value)}
                    dir={i18n.dir()}
                    className={`${FIELD_CLASS} px-3 cursor-pointer`}
                >
                    <option value="all">{t('reports.filters.period.all')}</option>
                    <option value="today">{t('reports.filters.period.today')}</option>
                    <option value="week">{t('reports.filters.period.week')}</option>
                    <option value="month">{t('reports.filters.period.month')}</option>
                </select>

                {/* Payment */}
                <select
                    value={paymentType}
                    onChange={(e) => onPaymentTypeChange?.(e.target.value)}
                    dir={i18n.dir()}
                    className={`${FIELD_CLASS} px-3 cursor-pointer`}
                >
                    <option value="all">{t('reports.filters.payment.all')}</option>
                    <option value="cash">{t('reports.filters.payment.cash')}</option>
                    <option value="credit">{t('reports.filters.payment.credit')}</option>
                </select>

                {/* Category */}
                <select
                    value={category}
                    onChange={(e) => onCategoryChange?.(e.target.value)}
                    dir={i18n.dir()}
                    className={`${FIELD_CLASS} px-3 cursor-pointer`}
                >
                    <option value="all">{t('reports.filters.category.all')}</option>
                    {categories.map((item) => {
                        const value = typeof item === 'string' ? item : (item?.value ?? item?.id ?? item?.name ?? '');
                        const label = typeof item === 'string' ? item : (item?.label ?? item?.name ?? item?.value ?? '');
                        if (!value) return null;
                        return <option key={value} value={value}>{label}</option>;
                    })}
                </select>

                {/* Clear */}
                <button
                    type="button"
                    onClick={onClearFilters}
                    className="ui-button-secondary w-full sm:col-span-2 xl:col-span-1 h-10 px-4 text-xs"
                >
                    <RotateCcw size={14} />
                    {t('reports.filters.clear')}
                </button>
            </div>
        </section>
    );
}

export default ReportsFilters;