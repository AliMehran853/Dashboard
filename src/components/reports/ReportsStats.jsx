import { TrendingUp, ShoppingCart, CreditCard, Wallet } from 'lucide-react';
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

function ReportsStats({ statistics = {} }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');

    const totalSales = Number(toEnglishNumbers(statistics.totalSales ?? statistics.totalTransactions ?? 0)) || 0;
    const totalRevenue = Number(toEnglishNumbers(statistics.totalRevenue ?? 0)) || 0;
    const cashSales = Number(toEnglishNumbers(statistics.cashSales ?? 0)) || 0;
    const creditSales = Number(toEnglishNumbers(statistics.creditSales ?? 0)) || 0;

    const currency = t('common.currency', { defaultValue: isEnglish ? 'AF' : 'افغانی' });

    const stats = [
        {
            id: 'total-sales',
            icon: ShoppingCart,
            title: t('reports.stats.totalSales', { defaultValue: isEnglish ? 'Total Sales' : 'مجموع فروش' }),
            value: formatNumber(totalSales, language),
            iconClass: 'text-emerald-500 dark:text-emerald-400',
            iconBg: 'border-emerald-500/10 bg-emerald-500/10',
        },
        {
            id: 'total-revenue',
            icon: TrendingUp,
            title: t('reports.stats.totalRevenue', { defaultValue: isEnglish ? 'Total Revenue' : 'مجموع درآمد' }),
            value: `${formatNumber(totalRevenue, language)} ${currency}`,
            iconClass: 'text-sky-500 dark:text-sky-400',
            iconBg: 'border-sky-500/10 bg-sky-500/10',
        },
        {
            id: 'cash-sales',
            icon: Wallet,
            title: t('reports.stats.cashSales', { defaultValue: isEnglish ? 'Cash Sales' : 'فروش نقدی' }),
            value: `${formatNumber(cashSales, language)} ${currency}`,
            iconClass: 'text-amber-500 dark:text-amber-400',
            iconBg: 'border-amber-500/10 bg-amber-500/10',
        },
        {
            id: 'credit-sales',
            icon: CreditCard,
            title: t('reports.stats.creditSales', { defaultValue: isEnglish ? 'Credit Sales' : 'فروش نسیه' }),
            value: `${formatNumber(creditSales, language)} ${currency}`,
            iconClass: 'text-violet-500 dark:text-violet-400',
            iconBg: 'border-violet-500/10 bg-violet-500/10',
        },
    ];

    return (
        <section dir={isEnglish ? 'ltr' : 'rtl'} className="space-y-4">
            {/* Section header (from i18n) */}
            <header className="flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className="h-7 w-1 shrink-0 rounded-full bg-[var(--accent-500)] shadow-[0_0_12px_var(--accent-glow)] sm:h-8"
                />
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-[var(--text)] sm:text-base lg:text-lg">
                        {t('reports.stats.sectionTitle', {
                            defaultValue: isEnglish ? 'Report Overview' : 'خلاصه گزارش',
                        })}
                    </h2>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
                        {t('reports.stats.sectionDescription', {
                            defaultValue: isEnglish ? 'Key figures from the selected report' : 'اعداد کلیدی گزارش انتخاب‌شده',
                        })}
                    </p>
                </div>
            </header>

            {/* Stats grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <article key={stat.id} className="group ui-card-tint ui-card-tint--lift p-4 sm:p-5">
                            <div className="ui-layer flex min-w-0 items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-medium leading-5 text-[var(--text-muted)]">
                                        {stat.title}
                                    </p>
                                    <p
                                        dir={isEnglish ? 'ltr' : 'rtl'}
                                        className="mt-2 truncate number-font text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-2xl"
                                    >
                                        {stat.value}
                                    </p>
                                </div>

                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 group-hover:scale-105 sm:h-11 sm:w-11 ${stat.iconBg}`}>
                                    <Icon
                                        size={19}
                                        strokeWidth={2}
                                        className={`transition-transform duration-300 group-hover:scale-110 ${stat.iconClass}`}
                                    />
                                </div>
                            </div>

                            <div className="ui-layer mt-4 h-px overflow-hidden rounded-full bg-[var(--border)]">
                                <div className="h-full w-8 rounded-full bg-[var(--accent-500)] opacity-60 transition-all duration-500 group-hover:w-16 group-hover:opacity-100" />
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default ReportsStats;