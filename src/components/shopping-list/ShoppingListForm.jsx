import { useEffect, useState } from 'react';
import { X, ShoppingCart, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getCategories } from '../../database/db';

const FIELD_CLASS = `
    w-full h-11 px-3 rounded-xl
    border border-[var(--input-border)]
    bg-[var(--input-bg)]
    text-sm text-[var(--text)]
    placeholder:text-[var(--text-soft)]
    outline-none
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    disabled:opacity-60
    transition
`;

const TEXTAREA_CLASS = `
    w-full px-3 py-3 rounded-xl
    border border-[var(--input-border)]
    bg-[var(--input-bg)]
    text-sm text-[var(--text)]
    placeholder:text-[var(--text-soft)]
    outline-none resize-none
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    disabled:opacity-60
    leading-6
    transition
`;

const getDefaultFormData = () => ({
    name: '',
    quantity: 1,
    unit: 'عدد',
    category: '',
    priority: 'normal',
    note: '',
});

function ShoppingListForm({ item = null, saving = false, onClose, onSubmit }) {
    const { t, i18n } = useTranslation();

    const [formData, setFormData] = useState(getDefaultFormData());
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');

    const units = [
        { value: 'عدد', label: t('shoppingList.form.units.piece') },
        { value: 'بسته', label: t('shoppingList.form.units.pack') },
        { value: 'کارتن', label: t('shoppingList.form.units.carton') },
        { value: 'کیلو', label: t('shoppingList.form.units.kilogram') },
        { value: 'گرم', label: t('shoppingList.form.units.gram') },
        { value: 'لیتر', label: t('shoppingList.form.units.liter') },
        { value: 'متر', label: t('shoppingList.form.units.meter') },
    ];

    // Load categories
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await getCategories();
                if (active) setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to load categories:', err);
            }
        })();
        return () => { active = false; };
    }, []);

    // Fill form on edit
    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                quantity: item.quantity ?? 1,
                unit: item.unit || 'عدد',
                category: item.category || '',
                priority: item.priority || 'normal',
                note: item.note || item.description || '',
            });
        } else {
            setFormData(getDefaultFormData());
        }
        setError('');
    }, [item]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        const name = formData.name.trim();
        if (!name) {
            setError(t('shoppingList.form.errors.nameRequired'));
            return;
        }

        const quantity = Number(formData.quantity);
        if (!Number.isFinite(quantity) || quantity <= 0) {
            setError(t('shoppingList.form.errors.quantityInvalid'));
            return;
        }

        try {
            await onSubmit({
                name,
                quantity,
                unit: formData.unit?.trim() || 'عدد',
                category: formData.category?.trim() || '',
                priority: formData.priority || 'normal',
                note: formData.note?.trim() || '',
            });
        } catch (submitError) {
            console.error('Failed to save shopping item:', submitError);
            setError(submitError?.message || t('shoppingList.form.errors.save'));
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 backdrop-blur-md sm:p-4"
            style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.55), rgba(0,0,0,0.72))',
            }}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) onClose();
            }}
        >
            <div
                dir={i18n.dir()}
                className="ui-glass-tint relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--glass-border)] sm:max-h-[90vh]"
            >
                {/* Header */}
                <div className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-4 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                            <ShoppingCart size={19} className="text-[var(--accent-500)]" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-bold text-[var(--text)]">
                                {item ? t('shoppingList.form.editTitle') : t('shoppingList.form.addTitle')}
                            </h2>
                            <p className="mt-1 text-[11px] leading-5 text-[var(--text-muted)]">
                                {t('shoppingList.form.subtitle')}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label={t('shoppingList.details.actions.close')}
                        className="ui-icon-button h-9 w-9"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <form
                    onSubmit={handleSubmit}
                    className="main-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
                >
                    {error && (
                        <div
                            role="alert"
                            className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-500 dark:text-red-400"
                        >
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                            {t('shoppingList.form.fields.name')}
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t('shoppingList.form.fields.namePlaceholder')}
                            autoFocus
                            disabled={saving}
                            dir={i18n.dir()}
                            className={FIELD_CLASS}
                        />
                    </div>

                    {/* Quantity + Unit */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                                {t('shoppingList.form.fields.quantity')}
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                min="0.01"
                                step="any"
                                value={formData.quantity}
                                onChange={handleChange}
                                disabled={saving}
                                dir="ltr"
                                className={`${FIELD_CLASS} text-left`}
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                                {t('shoppingList.form.fields.unit')}
                            </label>
                            <select
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                disabled={saving}
                                dir={i18n.dir()}
                                className={`${FIELD_CLASS} cursor-pointer`}
                            >
                                {units.map((unit) => (
                                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                            {t('shoppingList.form.fields.category')}
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            list="shopping-category-options"
                            placeholder={t('shoppingList.form.fields.categoryPlaceholder')}
                            autoComplete="off"
                            disabled={saving}
                            dir={i18n.dir()}
                            className={FIELD_CLASS}
                        />
                        <datalist id="shopping-category-options">
                            {categories.map((category) => {
                                if (!category?.id && !category?.name) return null;
                                return (
                                    <option key={category.id ?? category.name} value={category.name} />
                                );
                            })}
                            {item?.category &&
                                !categories.some((c) => c.name === item.category) && (
                                    <option value={item.category} />
                                )}
                        </datalist>
                        <p className="mt-2 text-[10px] leading-5 text-[var(--text-muted)]">
                            {t('shoppingList.form.fields.categoryHint')}
                        </p>
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                            {t('shoppingList.form.fields.priority')}
                        </label>
                        <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            disabled={saving}
                            dir={i18n.dir()}
                            className={`${FIELD_CLASS} cursor-pointer`}
                        >
                            <option value="low">{t('shoppingList.form.priority.low')}</option>
                            <option value="normal">{t('shoppingList.form.priority.normal')}</option>
                            <option value="high">{t('shoppingList.form.priority.high')}</option>
                            <option value="urgent">{t('shoppingList.form.priority.urgent')}</option>
                        </select>
                    </div>

                    {/* Note */}
                    <div>
                        <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                            {t('shoppingList.form.fields.note')}
                        </label>
                        <textarea
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            rows="3"
                            placeholder={t('shoppingList.form.fields.notePlaceholder')}
                            disabled={saving}
                            dir={i18n.dir()}
                            className={TEXTAREA_CLASS}
                        />
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-[1fr_auto]">
                        <button
                            type="submit"
                            disabled={saving}
                            className="ui-button-primary h-11 w-full text-sm"
                        >
                            <Save size={17} />
                            {saving
                                ? t('shoppingList.form.actions.saving')
                                : item
                                    ? t('shoppingList.form.actions.saveChanges')
                                    : t('shoppingList.form.actions.add')}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="ui-button-secondary h-11 w-full px-5 text-sm sm:w-auto"
                        >
                            {t('shoppingList.form.actions.cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ShoppingListForm;