import {
    Check, CheckCircle2, Circle, Edit3, Eye, Package, Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const formatNumber = (value, language) => {
    const num = Number(toEnglishNumbers(value));
    if (!Number.isFinite(num)) return '0';
    const isEnglish = String(language || '').toLowerCase().startsWith('en');
    return new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR').format(num);
};

function ShoppingListTable({
    items = [], loading = false,
    onViewDetails, onToggleComplete, onEdit, onDelete,
}) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');
    const direction = isEnglish ? 'ltr' : 'rtl';

    const getPriorityConfig = (priority) => {
        switch (priority) {
            case 'urgent':
                return {
                    label: t('shoppingList.table.priority.urgent', { defaultValue: isEnglish ? 'Urgent' : 'فوری' }),
                    className: 'border-rose-500/15 bg-rose-500/10 text-rose-600 dark:text-rose-400',
                };
            case 'high':
                return {
                    label: t('shoppingList.table.priority.high', { defaultValue: isEnglish ? 'High' : 'زیاد' }),
                    className: 'border-orange-500/15 bg-orange-500/10 text-orange-600 dark:text-orange-400',
                };
            case 'low':
                return {
                    label: t('shoppingList.table.priority.low', { defaultValue: isEnglish ? 'Low' : 'کم' }),
                    className: 'border-sky-500/15 bg-sky-500/10 text-sky-600 dark:text-sky-400',
                };
            case 'normal':
            default:
                return {
                    label: t('shoppingList.table.priority.normal', { defaultValue: isEnglish ? 'Normal' : 'عادی' }),
                    className: 'border-slate-500/15 bg-slate-500/10 text-slate-600 dark:text-slate-400',
                };
        }
    };

    // Loading skeleton
    if (loading) {
        return (
            <section dir={direction} className="ui-card overflow-hidden p-0">
                <div className="border-b border-[var(--border)] px-4 py-4 sm:px-5">
                    <div className="h-4 w-28 animate-pulse rounded-md bg-[var(--surface-muted)]" />
                </div>
                <div className="divide-y divide-[var(--border)]">
                    {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="flex items-center gap-4 px-4 py-4 sm:px-5">
                            <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-[var(--surface-muted)]" />
                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-4 w-44 max-w-full animate-pulse rounded-md bg-[var(--surface-muted)]" />
                                <div className="h-3 w-24 animate-pulse rounded-md bg-[var(--surface-muted)]" />
                            </div>
                            <div className="hidden h-8 w-20 animate-pulse rounded-lg bg-[var(--surface-muted)] sm:block" />
                            <div className="h-8 w-24 animate-pulse rounded-lg bg-[var(--surface-muted)]" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Empty
    if (!Array.isArray(items) || items.length === 0) {
        return (
            <section dir={direction} className="ui-card border-dashed p-0">
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                        <Package size={24} className="text-[var(--text-muted)]" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-[var(--text-primary)]">
                        {t('shoppingList.table.empty.title', { defaultValue: isEnglish ? 'No shopping items' : 'قلمی در لیست خرید وجود ندارد' })}
                    </h3>
                    <p className="mt-2 max-w-sm text-xs leading-5 text-[var(--text-muted)]">
                        {t('shoppingList.table.empty.description', { defaultValue: isEnglish ? 'Add a new item to start your shopping list.' : 'برای شروع، یک قلم جدید به لیست خرید اضافه کنید.' })}
                    </p>
                </div>
            </section>
        );
    }

    // Render
    return (
        <section dir={direction} className="ui-card overflow-hidden p-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/10">
                        <Package size={17} className="text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                            {t('shoppingList.table.title', { defaultValue: isEnglish ? 'Shopping List' : 'لیست خرید' })}
                        </h2>
                        <p dir={isEnglish ? 'ltr' : 'rtl'} className="mt-1 text-[10px] text-[var(--text-muted)]">
                            {formatNumber(items.length, language)}{' '}
                            {t('shoppingList.table.itemCount', { defaultValue: isEnglish ? 'items' : 'قلم' })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Desktop header */}
            <div className="hidden border-b border-[var(--border)] bg-[var(--surface-muted)] px-5 py-3 text-[10px] font-semibold text-[var(--text-muted)] md:grid md:grid-cols-[minmax(0,1fr)_120px_105px_158px] md:items-center md:gap-4">
                <span>{t('shoppingList.table.columns.item', { defaultValue: isEnglish ? 'Item' : 'قلم' })}</span>
                <span>{t('shoppingList.table.columns.quantity', { defaultValue: isEnglish ? 'Quantity' : 'مقدار' })}</span>
                <span>{t('shoppingList.table.columns.priority', { defaultValue: isEnglish ? 'Priority' : 'اولویت' })}</span>
                <span>{t('shoppingList.table.columns.actions', { defaultValue: isEnglish ? 'Actions' : 'عملیات' })}</span>
            </div>

            {/* Items */}
            <div className="divide-y divide-[var(--border)]">
                {items.map((item) => {
                    const completed = Boolean(item?.completed);
                    const priority = getPriorityConfig(item?.priority);
                    const itemName = item.name || t('shoppingList.table.noName', { defaultValue: isEnglish ? 'Unnamed item' : 'بدون نام' });

                    const toggleTitle = completed
                        ? t('shoppingList.table.actions.restore', { defaultValue: isEnglish ? 'Restore' : 'بازگردانی' })
                        : t('shoppingList.table.actions.markComplete', { defaultValue: isEnglish ? 'Mark complete' : 'تکمیل' });

                    return (
                        <article
                            key={item.id}
                            className={`group relative transition-all duration-200 ${
                                completed ? 'bg-[var(--surface-muted)] opacity-70' : 'hover:bg-[var(--surface-muted)]'
                            }`}
                        >
                            {/* Desktop */}
                            <div className="hidden px-5 py-4 md:grid md:grid-cols-[minmax(0,1fr)_120px_105px_158px] md:items-center md:gap-4">
                                {/* Item */}
                                <div className="flex min-w-0 items-start gap-3">
                                    <CheckButton
                                        completed={completed}
                                        onClick={() => onToggleComplete?.(item)}
                                        title={toggleTitle}
                                    />

                                    <div className="min-w-0 flex-1">
                                        <button
                                            type="button"
                                            onClick={() => onViewDetails?.(item)}
                                            className={`block max-w-full truncate text-start text-sm font-semibold transition-colors ${
                                                completed
                                                    ? 'text-[var(--text-muted)] line-through'
                                                    : 'text-[var(--text-primary)] hover:text-emerald-500 dark:hover:text-emerald-400'
                                            }`}
                                            title={itemName}
                                        >
                                            {itemName}
                                        </button>

                                        {(item.category || item.note) && (
                                            <div className="mt-1 flex min-w-0 items-center gap-2">
                                                {item.category && (
                                                    <span className="max-w-[180px] truncate text-[10px] text-[var(--text-muted)]">
                                                        {item.category}
                                                    </span>
                                                )}
                                                {item.category && item.note && (
                                                    <span className="h-1 w-1 shrink-0 rounded-full bg-[var(--border)]" />
                                                )}
                                                {item.note && (
                                                    <span className="max-w-[220px] truncate text-[10px] text-[var(--text-muted)]">
                                                        {item.note}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="flex min-w-0 items-center gap-2">
                                    <span dir="ltr" className="number-font text-sm font-semibold text-[var(--text-primary)]">
                                        {formatNumber(item.quantity ?? 1, language)}
                                    </span>
                                    {item.unit && (
                                        <span className="max-w-[70px] truncate text-[10px] text-[var(--text-muted)]">
                                            {item.unit}
                                        </span>
                                    )}
                                </div>

                                {/* Priority */}
                                <div className="flex items-center">
                                    <span className={`inline-flex max-w-full items-center justify-center truncate rounded-lg border px-2.5 py-1 text-[10px] font-medium ${priority.className}`}>
                                        {priority.label}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-1">
                                    <ActionButton
                                        onClick={() => onViewDetails?.(item)}
                                        title={t('shoppingList.table.actions.details', { defaultValue: isEnglish ? 'Details' : 'جزئیات' })}
                                        icon={Eye}
                                        tone="emerald"
                                    />
                                    <ActionButton
                                        onClick={() => onToggleComplete?.(item)}
                                        title={completed
                                            ? t('shoppingList.table.actions.restore', { defaultValue: isEnglish ? 'Restore' : 'بازگردانی' })
                                            : t('shoppingList.table.actions.complete', { defaultValue: isEnglish ? 'Complete' : 'تکمیل' })}
                                        icon={CheckCircle2}
                                        tone="emerald"
                                        active={completed}
                                    />
                                    <ActionButton
                                        onClick={() => onEdit?.(item)}
                                        title={t('shoppingList.table.actions.edit', { defaultValue: isEnglish ? 'Edit' : 'ویرایش' })}
                                        icon={Edit3}
                                        tone="sky"
                                    />
                                    <ActionButton
                                        onClick={() => onDelete?.(item)}
                                        title={t('shoppingList.table.actions.delete', { defaultValue: isEnglish ? 'Delete' : 'حذف' })}
                                        icon={Trash2}
                                        tone="rose"
                                    />
                                </div>
                            </div>

                            {/* Mobile */}
                            <div className="min-w-0 p-4 md:hidden">
                                <div className="flex min-w-0 items-start gap-3">
                                    <CheckButton
                                        completed={completed}
                                        onClick={() => onToggleComplete?.(item)}
                                        title={toggleTitle}
                                    />

                                    <div className="min-w-0 flex-1">
                                        <button
                                            type="button"
                                            onClick={() => onViewDetails?.(item)}
                                            className={`block w-full truncate text-start text-sm font-semibold transition-colors ${
                                                completed
                                                    ? 'text-[var(--text-muted)] line-through'
                                                    : 'text-[var(--text-primary)] hover:text-emerald-500 dark:hover:text-emerald-400'
                                            }`}
                                        >
                                            {itemName}
                                        </button>
                                        {item.category && (
                                            <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
                                                {item.category}
                                            </p>
                                        )}
                                    </div>

                                    <ActionButton
                                        onClick={() => onViewDetails?.(item)}
                                        title={t('shoppingList.table.actions.details', { defaultValue: isEnglish ? 'Details' : 'جزئیات' })}
                                        icon={Eye}
                                        tone="emerald"
                                    />
                                </div>

                                {/* Info */}
                                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                                    <div className="min-w-0">
                                        <p className="text-[9px] text-[var(--text-muted)]">
                                            {t('shoppingList.table.labels.quantity', { defaultValue: isEnglish ? 'Quantity' : 'مقدار' })}
                                        </p>
                                        <div className="mt-1 flex items-center gap-1.5">
                                            <span dir="ltr" className="number-font text-sm font-semibold text-[var(--text-primary)]">
                                                {formatNumber(item.quantity ?? 1, language)}
                                            </span>
                                            {item.unit && (
                                                <span className="max-w-[70px] truncate text-[9px] text-[var(--text-muted)]">
                                                    {item.unit}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="min-w-0 text-end">
                                        <p className="text-[9px] text-[var(--text-muted)]">
                                            {t('shoppingList.table.labels.priority', { defaultValue: isEnglish ? 'Priority' : 'اولویت' })}
                                        </p>
                                        <div className="mt-1 flex justify-end">
                                            <span className={`inline-flex max-w-full items-center justify-center truncate rounded-lg border px-2.5 py-1 text-[10px] font-medium ${priority.className}`}>
                                                {priority.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Note */}
                                {item.note && (
                                    <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5">
                                        <p className="text-[9px] text-[var(--text-muted)]">
                                            {t('shoppingList.table.labels.note', { defaultValue: isEnglish ? 'Note' : 'یادداشت' })}
                                        </p>
                                        <p className="mt-1 truncate text-[10px] leading-5 text-[var(--text-secondary)]">
                                            {item.note}
                                        </p>
                                    </div>
                                )}

                                {/* Mobile actions */}
                                <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onViewDetails?.(item)}
                                        className="flex h-10 min-w-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--text-muted)] transition-all duration-200 hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-500 dark:hover:text-emerald-400"
                                    >
                                        <Eye size={15} />
                                        <span className="truncate">
                                            {t('shoppingList.table.actions.details', { defaultValue: isEnglish ? 'Details' : 'جزئیات' })}
                                        </span>
                                    </button>

                                    <ActionButton
                                        onClick={() => onEdit?.(item)}
                                        title={t('shoppingList.table.actions.edit', { defaultValue: isEnglish ? 'Edit' : 'ویرایش' })}
                                        icon={Edit3}
                                        tone="sky"
                                        size="large"
                                    />
                                    <ActionButton
                                        onClick={() => onDelete?.(item)}
                                        title={t('shoppingList.table.actions.delete', { defaultValue: isEnglish ? 'Delete' : 'حذف' })}
                                        icon={Trash2}
                                        tone="rose"
                                        size="large"
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

// =========================================================
// Small helpers
// =========================================================

function CheckButton({ completed, onClick, title }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                completed
                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'
                    : 'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-500'
            }`}
        >
            {completed ? <Check size={14} /> : <Circle size={14} />}
        </button>
    );
}

function ActionButton({ onClick, title, icon: Icon, tone = 'slate', active = false, size = 'normal' }) {
    const toneMap = {
        emerald: {
            normal: 'hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-500 dark:hover:text-emerald-400',
            active: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
        },
        sky: {
            normal: 'hover:border-sky-500/20 hover:bg-sky-500/5 hover:text-sky-500 dark:hover:text-sky-400',
            active: 'border-sky-500/15 bg-sky-500/10 text-sky-500 dark:text-sky-400',
        },
        rose: {
            normal: 'hover:border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-500 dark:hover:text-rose-400',
            active: 'border-rose-500/15 bg-rose-500/10 text-rose-500 dark:text-rose-400',
        },
        slate: {
            normal: 'hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]',
            active: 'bg-[var(--surface-muted)] text-[var(--text-primary)]',
        },
    };

    const styles = toneMap[tone] || toneMap.slate;
    const dimensions = size === 'large' ? 'h-10 w-10' : 'h-9 w-9';

    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            className={`${dimensions} flex shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-all duration-200 ${
                active ? styles.active : styles.normal
            }`}
        >
            <Icon size={size === 'large' ? 16 : 15} />
        </button>
    );
}

export default ShoppingListTable;