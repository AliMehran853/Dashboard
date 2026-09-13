import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    X, Package, Save, ChevronDown, Hash, Layers3, ShoppingCart,
    Warehouse, AlertTriangle, FileText,
} from 'lucide-react';
import { defaultUnits, getCategories } from '../../database/db';

// =========================================================
// Helpers
// =========================================================

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const toPersianNumbers = (value) =>
    String(value ?? '').replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

const formatInputNumber = (value, language) =>
    String(language || '').toLowerCase().startsWith('en')
        ? String(value ?? '')
        : toPersianNumbers(String(value ?? ''));

const normalizeNumericInput = (value) =>
    toEnglishNumbers(String(value ?? ''))
        .replace(/[^0-9.]/g, '')
        .replace(/^(\d*\.\d*).*$/, '$1');

const initialForm = {
    name: '', category: '', buyPrice: '', sellPrice: '',
    stock: '', minStock: '', unit: defaultUnits[0] || '', description: '',
};

const INPUT_BASE = `
    h-11 w-full rounded-xl border bg-[var(--input-bg)] px-4 text-sm
    text-[var(--text)] outline-none transition-all duration-200
    placeholder:text-[var(--text-soft)]
    disabled:cursor-not-allowed disabled:opacity-50
`;

const fieldClass = (hasError) =>
    `${INPUT_BASE} ${
        hasError
            ? 'border-rose-400 dark:border-rose-500/50'
            : 'border-[var(--input-border)] focus:border-[var(--input-border-focus)] focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]'
    }`;

const selectClass = `
    h-11 w-full appearance-none rounded-xl border border-[var(--input-border)]
    bg-[var(--input-bg)] px-10 text-sm text-[var(--text)] outline-none transition-all
    focus:border-[var(--input-border-focus)] focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer
`;

// =========================================================
// Product Form
// =========================================================

function ProductForm({ product = null, onClose, onSubmit }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');

    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [saving, setSaving] = useState(false);
    const [databaseError, setDatabaseError] = useState('');
    const isEditing = Boolean(product);

    // Fill form on edit
    useEffect(() => {
        if (!product) {
            setForm({ ...initialForm, unit: defaultUnits[0] || '' });
            setErrors({});
            setDatabaseError('');
            return;
        }
        const clean = (v) => (v !== undefined && v !== null ? toEnglishNumbers(v) : '');
        setForm({
            name: product.name ?? '',
            category: product.category ?? '',
            buyPrice: clean(product.buyPrice),
            sellPrice: clean(product.sellPrice),
            stock: clean(product.stock),
            minStock: clean(product.minStock),
            unit: product.unit || defaultUnits[0] || '',
            description: product.description ?? '',
        });
        setErrors({});
        setDatabaseError('');
    }, [product]);

    // Load categories
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoadingCategories(true);
                setDatabaseError('');
                const data = await getCategories();
                if (mounted) setCategories(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to load categories:', err);
                if (mounted) setDatabaseError(t('products.form.errors.loadCategories'));
            } finally {
                if (mounted) setLoadingCategories(false);
            }
        })();
        return () => { mounted = false; };
    }, [t]);

    // Escape
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !saving) onClose?.();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose, saving]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        const numericFields = ['buyPrice', 'sellPrice', 'stock', 'minStock'];
        const nextValue = numericFields.includes(name) ? normalizeNumericInput(value) : value;
        setForm((prev) => ({ ...prev, [name]: nextValue }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        if (databaseError) setDatabaseError('');
    };

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = t('products.form.errors.nameRequired');
        if (!form.category) next.category = t('products.form.errors.categoryRequired');

        const checkNum = (field, key, errorKey) => {
            const v = form[field];
            if (v === '' || !Number.isFinite(Number(v)) || Number(v) < 0) {
                next[key] = t(errorKey);
            }
        };
        checkNum('buyPrice', 'buyPrice', 'products.form.errors.buyPriceInvalid');
        checkNum('sellPrice', 'sellPrice', 'products.form.errors.sellPriceInvalid');
        if (form.buyPrice !== '' && form.sellPrice !== '' && Number(form.sellPrice) < Number(form.buyPrice)) {
            next.sellPrice = t('products.form.errors.sellPriceLowerThanBuy');
        }
        checkNum('stock', 'stock', 'products.form.errors.stockInvalid');
        checkNum('minStock', 'minStock', 'products.form.errors.minStockInvalid');
        if (!form.unit) next.unit = t('products.form.errors.unitRequired');

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (saving || !validate()) return;

        setSaving(true);
        setDatabaseError('');
        try {
            await onSubmit({
                name: form.name.trim(),
                category: form.category,
                buyPrice: Number(toEnglishNumbers(form.buyPrice)),
                sellPrice: Number(toEnglishNumbers(form.sellPrice)),
                stock: Number(toEnglishNumbers(form.stock)),
                minStock: Number(toEnglishNumbers(form.minStock)),
                unit: form.unit,
                description: form.description.trim(),
            });
            setForm({ ...initialForm, unit: defaultUnits[0] || '' });
            setErrors({});
        } catch (err) {
            console.error('Failed to submit product:', err);
            setDatabaseError(err?.message || t('products.form.errors.save'));
        } finally {
            setSaving(false);
        }
    };

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget && !saving) onClose?.();
    };

    return (
        <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            onMouseDown={handleOverlayClick}
            className="fixed inset-0 z-[70] flex items-center justify-center p-2 backdrop-blur-[20px] sm:p-4"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.45), rgba(0,0,0,0.62))' }}
        >
            <div className="ui-glass-tint relative flex w-full max-w-2xl max-h-[calc(100dvh-1rem)] flex-col overflow-hidden rounded-2xl border border-[var(--glass-border)] shadow-[var(--shadow-xl)] sm:max-h-[90vh]">
                {/* Header */}
                <div className="relative flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-4 py-3.5 sm:px-5 sm:py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] sm:h-11 sm:w-11">
                            <Package size={19} className="text-[var(--accent-500)]" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold text-[var(--text)]">
                                {isEditing ? t('products.form.editTitle') : t('products.form.addTitle')}
                            </h2>
                            <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
                                {isEditing ? t('products.form.editSubtitle') : t('products.form.addSubtitle')}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label={t('common.closeMenu', { defaultValue: isEnglish ? 'Close' : 'بستن' })}
                        className="ui-icon-button shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <div className="main-scrollbar min-h-0 flex-1 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-4 sm:p-5">
                        {databaseError && (
                            <div className="mb-5 rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3 text-xs text-rose-600 dark:text-rose-400">
                                {databaseError}
                            </div>
                        )}

                        <SectionHeader icon={Hash} title={t('products.form.sections.basic')} />
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <FieldLabel>{t('products.form.fields.name')}</FieldLabel>
                                <input
                                    type="text" name="name" value={form.name} onChange={handleChange}
                                    disabled={saving}
                                    placeholder={t('products.form.fields.namePlaceholder')}
                                    className={fieldClass(Boolean(errors.name))}
                                />
                                <FieldError>{errors.name}</FieldError>
                            </div>

                            <div>
                                <FieldLabel>{t('products.form.fields.category')}</FieldLabel>
                                <div className="relative">
                                    <Layers3 size={15} className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isEnglish ? 'left-3' : 'right-3'} text-[var(--text-soft)]`} />
                                    <select
                                        name="category" value={form.category} onChange={handleChange}
                                        disabled={saving || loadingCategories}
                                        className={selectClass}
                                    >
                                        <option value="">
                                            {loadingCategories
                                                ? t('products.form.fields.loadingCategories')
                                                : t('products.form.fields.categoryPlaceholder')}
                                        </option>
                                        {categories.map((item) => (
                                            <option key={item.id} value={item.name}>{item.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={15} className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isEnglish ? 'right-3' : 'left-3'} text-[var(--text-soft)]`} />
                                </div>
                                <FieldError>{errors.category}</FieldError>
                            </div>

                            <div>
                                <FieldLabel>{t('products.form.fields.unit')}</FieldLabel>
                                <div className="relative">
                                    <Package size={15} className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isEnglish ? 'left-3' : 'right-3'} text-[var(--text-soft)]`} />
                                    <select name="unit" value={form.unit} onChange={handleChange} disabled={saving} className={selectClass}>
                                        {defaultUnits.map((unit) => (
                                            <option key={unit} value={unit}>{unit}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={15} className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isEnglish ? 'right-3' : 'left-3'} text-[var(--text-soft)]`} />
                                </div>
                                <FieldError>{errors.unit}</FieldError>
                            </div>
                        </div>

                        <SectionHeader icon={ShoppingCart} title={t('products.form.sections.prices')} />
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <CurrencyField
                                name="buyPrice"
                                label={t('products.form.fields.buyPrice')}
                                value={formatInputNumber(form.buyPrice, language)}
                                placeholder={t('products.form.fields.buyPricePlaceholder')}
                                onChange={handleChange}
                                disabled={saving}
                                error={Boolean(errors.buyPrice)}
                                errorMessage={errors.buyPrice}
                                isEnglish={isEnglish}
                            />
                            <CurrencyField
                                name="sellPrice"
                                label={t('products.form.fields.sellPrice')}
                                value={formatInputNumber(form.sellPrice, language)}
                                placeholder={t('products.form.fields.sellPricePlaceholder')}
                                onChange={handleChange}
                                disabled={saving}
                                error={Boolean(errors.sellPrice)}
                                errorMessage={errors.sellPrice}
                                isEnglish={isEnglish}
                            />
                        </div>

                        <SectionHeader icon={Warehouse} title={t('products.form.sections.inventory')} />
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <FieldLabel>{t('products.form.fields.stock')}</FieldLabel>
                                <input
                                    type="text" inputMode="decimal" name="stock"
                                    value={formatInputNumber(form.stock, language)}
                                    onChange={handleChange} disabled={saving}
                                    placeholder={t('products.form.fields.stockPlaceholder')}
                                    className={fieldClass(Boolean(errors.stock))}
                                />
                                <FieldError>{errors.stock}</FieldError>
                            </div>

                            <div>
                                <label className="mb-2 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                                    <span>{t('products.form.fields.minStock')}</span>
                                    <AlertTriangle size={12} className="text-amber-500 dark:text-amber-400" />
                                </label>
                                <input
                                    type="text" inputMode="decimal" name="minStock"
                                    value={formatInputNumber(form.minStock, language)}
                                    onChange={handleChange} disabled={saving}
                                    placeholder={t('products.form.fields.minStockPlaceholder')}
                                    className={fieldClass(Boolean(errors.minStock))}
                                />
                                <FieldError>{errors.minStock}</FieldError>
                            </div>
                        </div>

                        <SectionHeader icon={FileText} title={t('products.form.sections.description')} />
                        <div className="mb-6">
                            <textarea
                                name="description" value={form.description} onChange={handleChange}
                                disabled={saving} rows={4}
                                placeholder={t('products.form.fields.descriptionPlaceholder')}
                                className="w-full resize-none rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm leading-6 text-[var(--text)] outline-none transition-all duration-200 placeholder:text-[var(--text-soft)] focus:border-[var(--input-border-focus)] focus:shadow-[0_0_0_3px_var(--accent-soft-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:justify-end">
                            <button type="button" onClick={onClose} disabled={saving} className="ui-button-secondary w-full sm:w-auto">
                                {t('products.form.actions.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={saving || loadingCategories}
                                className="ui-button-primary w-full sm:w-auto"
                            >
                                {saving ? (
                                    <>
                                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        {t('products.form.actions.saving')}
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        {isEditing
                                            ? t('products.form.actions.saveChanges')
                                            : t('products.form.actions.save')}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// =========================================================
// Sub-components
// =========================================================

function CurrencyField({ name, label, value, placeholder, onChange, disabled, error, errorMessage, isEnglish }) {
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <div className="relative">
                <input
                    type="text" inputMode="decimal" name={name}
                    value={value} onChange={onChange} disabled={disabled}
                    placeholder={placeholder}
                    className={`${fieldClass(error)} ${isEnglish ? 'pe-14' : 'ps-14'}`}
                />
                <span className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-muted)] ${isEnglish ? 'right-3' : 'left-3'}`}>
                    {isEnglish ? 'AF' : 'افغانی'}
                </span>
            </div>
            <FieldError>{errorMessage}</FieldError>
        </div>
    );
}

function SectionHeader({ icon: Icon, title }) {
    return (
        <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                <Icon size={13} className="text-[var(--accent-500)]" />
            </div>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)]">{title}</h3>
        </div>
    );
}

function FieldLabel({ children }) {
    return <label className="mb-2 block text-[11px] text-[var(--text-muted)]">{children}</label>;
}

function FieldError({ children }) {
    if (!children) return null;
    return <p className="mt-1.5 text-[10px] text-rose-500 dark:text-rose-400">{children}</p>;
}

export default ProductForm;