import { useMemo } from 'react';
import { ShoppingCart, Clock3, CheckCircle2 } from 'lucide-react';
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

function ShoppingListStats({ items = [] }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');
    const direction = isEnglish ? 'ltr' : 'rtl';

    const statistics = useMemo(() => {
        const safeItems = Array.isArray(items) ? items : [];
        const total = safeItems.length;
        const completed = safeItems.filter((i) => Boolean(i?.completed)).length;
        return { total, completed, pending: total - completed };
    }, [items]);

    const statItems = [
        {
            id: 'total',
            label: t('shoppingList.stats.total', { defaultValue: isEnglish ? 'Total Items' : 'مجموع اقلام' }),
            value: statistics.total,
            icon: ShoppingCart,
            iconClass: 'text-emerald-500 dark:text-emerald-400',
            iconBg: 'border-emerald-500/10 bg-emerald-500/10',
        },
        {
            id: 'pending',
            label: t('shoppingList.stats.pending', { defaultValue: isEnglish ? 'Pending' : 'در انتظار' }),
            value: statistics.pending,
            icon: Clock3,
            iconClass: 'text-amber-500 dark:text-amber-400',
            iconBg: 'border-amber-500/10 bg-amber-500/10',
        },
        {
            id: 'completed',
            label: t('shoppingList.stats.completed', { defaultValue: isEnglish ? 'Completed' : 'تکمیل‌شده' }),
            value: statistics.completed,
            icon: CheckCircle2,
            iconClass: 'text-sky-500 dark:text-sky-400',
            iconBg: 'border-sky-500/10 bg-sky-500/10',
        },
    ];

    return (
        <section dir={direction} className="space-y-4">
            {/* Section header (from i18n) */}
            <header className="flex items-center gap-3">
                <span
                    aria-hidden="true"
                    className="h-7 w-1 shrink-0 rounded-full bg-[var(--accent-500)] shadow-[0_0_12px_var(--accent-glow)] sm:h-8"
                />
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-[var(--text)] sm:text-base lg:text-lg">
                        {t('shoppingList.stats.sectionTitle', {
                            defaultValue: isEnglish ? 'Shopping List Overview' : 'خلاصه لیست خرید',
                        })}
                    </h2>
                    <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
                        {t('shoppingList.stats.sectionDescription', {
                            defaultValue: isEnglish ? 'Current shopping list status' : 'وضعیت فعلی اقلام لیست خرید',
                        })}
                    </p>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                {statItems.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <article key={stat.id} className="group ui-card-tint ui-card-tint--lift p-4 sm:p-5">
                            <div className="ui-layer flex min-w-0 items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[11px] font-medium text-[var(--text-muted)]">
                                        {stat.label}
                                    </p>
                                    <p
                                        dir={isEnglish ? 'ltr' : 'rtl'}
                                        className="mt-2 number-font text-2xl font-bold tracking-tight text-[var(--text-primary)]"
                                    >
                                        {formatNumber(stat.value, language)}
                                    </p>
                                </div>

                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11 ${stat.iconBg}`}>
                                    <Icon size={19} className={stat.iconClass} />
                                </div>
                            </div>

                            <div className="ui-layer mt-4 h-px overflow-hidden rounded-full bg-[var(--border)]">
                                <div className="h-full w-8 rounded-full bg-[var(--accent-500)] opacity-60 transition-all duration-500 group-hover:w-14 group-hover:opacity-100" />
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default ShoppingListStats;