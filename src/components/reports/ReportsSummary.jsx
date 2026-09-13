import { BarChart3, TrendingUp, Wallet, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const formatNumber = (value, language) => {
    const num = Number(toEnglishNumbers(value)) || 0;
    const isEnglish = String(language || '').toLowerCase().startsWith('en');
    return new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR').format(num);
};

function ReportsSummary({ summary = {} }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');
    const direction = isEnglish ? 'ltr' : 'rtl';

    const { bestCategory = '-', bestCategorySales = 0, averageSale = 0, totalItems = 0 } = summary;
    const currency = t('common.currency', { defaultValue: isEnglish ? 'AF' : 'افغانی' });

    const cards = [
        {
            id: 'best-category',
            icon: TrendingUp,
            label: t('reports.summary.bestCategory', { defaultValue: isEnglish ? 'Best Category' : 'بهترین دسته‌بندی' }),
            value: bestCategory,
        },
        {
            id: 'average-sale',
            icon: Wallet,
            label: t('reports.summary.averageSale', { defaultValue: isEnglish ? 'Average Sale' : 'میانگین فروش' }),
            value: `${formatNumber(averageSale, language)} ${currency}`,
        },
        {
            id: 'total-items',
            icon: BarChart3,
            label: t('reports.summary.totalItems', { defaultValue: isEnglish ? 'Total Items' : 'مجموع اقلام' }),
            value: `${formatNumber(totalItems, language)} ${t('reports.summary.itemUnit', { defaultValue: isEnglish ? 'items' : 'قلم' })}`,
        },
        {
            id: 'best-category-sales',
            icon: CreditCard,
            highlight: true,
            label: t('reports.summary.bestCategorySales', { defaultValue: isEnglish ? 'Best Category Sales' : 'فروش بهترین دسته‌بندی' }),
            value: `${formatNumber(bestCategorySales, language)} ${currency}`,
        },
    ];

    return (
        <section dir={direction} className="ui-card overflow-hidden p-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                    <BarChart3 size={17} className="text-[var(--accent-500)]" />
                </div>
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                        {t('reports.summary.title', { defaultValue: isEnglish ? 'Report Summary' : 'خلاصه گزارش' })}
                    </h2>
                    <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">
                        {t('reports.summary.description', { defaultValue: isEnglish ? 'Key insights from the selected report' : 'مهم‌ترین اطلاعات گزارش انتخاب‌شده' })}
                    </p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-5">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.id} className="group ui-card-tint p-4">
                            <div className="ui-layer flex min-w-0 items-center gap-2">
                                <div
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 group-hover:scale-105 ${
                                        card.highlight
                                            ? 'border-[var(--accent-border)] bg-[var(--accent-soft)]'
                                            : 'border-[var(--border-subtle)] bg-[var(--surface)]'
                                    }`}
                                >
                                    <Icon
                                        size={14}
                                        className={card.highlight ? 'text-[var(--accent-500)]' : 'text-[var(--text-muted)]'}
                                    />
                                </div>
                                <span className="min-w-0 truncate text-[10px] font-medium text-[var(--text-muted)]">
                                    {card.label}
                                </span>
                            </div>

                            <p
                                dir={direction}
                                className={`ui-layer mt-2 truncate number-font text-base font-bold ${
                                    card.highlight ? 'text-[var(--accent-500)]' : 'text-[var(--text-primary)]'
                                }`}
                            >
                                {card.value}
                            </p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default ReportsSummary;