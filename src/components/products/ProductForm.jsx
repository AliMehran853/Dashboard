import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    X, Package, Save, ChevronDown, Hash, Layers3, ShoppingCart,
    Warehouse, AlertTriangle, FileText, Plus, Trash2, Ruler,
    TrendingUp, TrendingDown, Info, Star, Check, Loader2,
    Sparkles, Package2, Scale, Repeat,
} from 'lucide-react';
import {
    defaultUnits, getCategories, getUnits, addCategory, addUnit,
    UNIT_CATEGORIES, normalizeSaleOption,
} from '../../database/db';

// =========================================================
// Constants
// =========================================================

const DEFAULT_SUGGESTED_MARGIN = 25;

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

const cleanNumericInput = (value) => {
    const en = toEnglishNumbers(String(value ?? ''));
    let cleaned = en.replace(/[^0-9.]/g, '');
    const firstDot = cleaned.indexOf('.');
    if (firstDot !== -1) {
        cleaned =
            cleaned.slice(0, firstDot + 1) +
            cleaned.slice(firstDot + 1).replace(/\./g, '');
    }
    return cleaned;
};

const toNum = (v) => {
    const n = Number(toEnglishNumbers(v));
    return Number.isFinite(n) ? n : 0;
};

const formatMoney = (v, language) => {
    const n = Number(v) || 0;
    const isEn = String(language || '').toLowerCase().startsWith('en');
    return new Intl.NumberFormat(isEn ? 'en-US' : 'fa-IR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(n);
};

const uid = (prefix = 'x') =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const roundTo = (value, decimals = 2) => {
    const f = Math.pow(10, decimals);
    return Math.round((Number(value) || 0) * f) / f;
};

// =========================================================
// Margin math
// =========================================================

const computeMarginFromPrice = (price, cost) => {
    if (!(cost > 0) || !(price > 0)) return 0;
    return ((price - cost) / cost) * 100;
};

const computePriceFromMargin = (cost, margin) => {
    if (!(cost > 0)) return 0;
    return cost * (1 + (Number(margin) || 0) / 100);
};

// =========================================================
// Initial Form
// =========================================================

const initialForm = {
    name: '',
    category: '',
    baseUnit: '',
    description: '',
    minStock: '',

    purchaseQuantity: '',
    purchaseUnit: '',
    purchaseFactor: '1',
    purchasePrice: '',
    purchaseNote: '',

    saleOptions: [],
};

const INPUT_BASE = `
    h-11 w-full rounded-xl border bg-[var(--input-bg)] px-4 text-sm
    text-[var(--text)] outline-none
    transition-[border-color,box-shadow,background-color] duration-200
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
    bg-[var(--input-bg)] px-4 text-sm text-[var(--text)] outline-none
    transition-[border-color,box-shadow,background-color] duration-200
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
    const isEditing = Boolean(product);

    const [form, setForm] = useState(initialForm);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dbError, setDbError] = useState('');
    const formRef = useRef(null);

    const [subUnitEnabled, setSubUnitEnabled] = useState(false);
    const [subUnit, setSubUnit] = useState('');
    const [subUnitQty, setSubUnitQty] = useState('');
    const [baseUnitOriginal, setBaseUnitOriginal] = useState(null);

    const [priceInputMode, setPriceInputMode] = useState('unit');

    // ═══ Load ═══
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const [cats, uns] = await Promise.all([getCategories(), getUnits()]);
                if (!mounted) return;
                setCategories(Array.isArray(cats) ? cats : []);
                setUnits(
                    Array.isArray(uns) && uns.length > 0
                        ? uns
                        : defaultUnits.map((n, i) => ({ id: i, name: n, category: 'count' }))
                );
            } catch (err) {
                console.error('Failed to load form data:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // ═══ Fill on edit ═══
    useEffect(() => {
        if (!product) {
            setForm(initialForm);
            setErrors({});
            setDbError('');
            setSubUnitEnabled(false);
            setSubUnit('');
            setSubUnitQty('');
            setBaseUnitOriginal(null);
            setPriceInputMode('unit');
            return;
        }

        setForm({
            name: product.name || '',
            category: product.category || '',
            baseUnit: product.baseUnit || product.unit || '',
            description: product.description || '',
            minStock: product.minStock != null ? String(product.minStock) : '',

            purchaseQuantity: '',
            purchaseUnit: product.baseUnit || product.unit || '',
            purchaseFactor: '1',
            purchasePrice: '',
            purchaseNote: '',

            saleOptions: Array.isArray(product.saleOptions)
                ? product.saleOptions.map((o, idx) => {
                    const factor = Number(o.factor) || 1;
                    const price = Number(o.price) || 0;
                    const cost = (Number(product.avgCost) || 0) * factor;
                    return {
                        id: o.id || uid('opt'),
                        unit: o.unit || '',
                        factor: String(factor),
                        price: String(price),
                        targetMargin: String(roundTo(computeMarginFromPrice(price, cost), 2)),
                        isDefault: Boolean(o.isDefault) || idx === 0,
                    };
                })
                : [],
        });
        setErrors({});
        setDbError('');
    }, [product]);

    // ═══ Escape + Ctrl/Cmd + Enter ═══
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                if (!saving && !loading) formRef.current?.requestSubmit?.();
                return;
            }
            if (e.key === 'Escape' && !saving) {
                const inlineOpen = document.querySelector('[data-inline-add-open="true"]');
                if (!inlineOpen) onClose?.();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose, saving, loading]);

    // ═══ Purchase calc ═══
    const purchaseCalc = useMemo(() => {
        const qty = toNum(form.purchaseQuantity);
        const factor = toNum(form.purchaseFactor) || 1;
        const price = toNum(form.purchasePrice);
        const stockInBase = qty * factor;
        const totalPaid = qty * price;
        const costPerBase = factor > 0 ? price / factor : 0;
        return { qty, factor, price, stockInBase, totalPaid, costPerBase };
    }, [form.purchaseQuantity, form.purchaseFactor, form.purchasePrice]);

    const effectiveAvgCost = isEditing
        ? Number(product?.avgCost) || 0
        : purchaseCalc.costPerBase;

    // ═══ Merged units ═══
    const allUnits = useMemo(() => {
        const map = new Map();
        for (const u of units) if (u?.name) map.set(u.name, u);

        const addIfMissing = (name) => {
            const clean = String(name || '').trim();
            if (clean && !map.has(clean)) {
                map.set(clean, { id: `_inline_${clean}`, name: clean, category: 'count', isInline: true });
            }
        };
        addIfMissing(form.baseUnit);
        addIfMissing(form.purchaseUnit);
        addIfMissing(subUnit);
        for (const so of form.saleOptions) addIfMissing(so.unit);

        return Array.from(map.values()).sort((a, b) =>
            String(a.name).localeCompare(String(b.name), 'fa')
        );
    }, [units, form.baseUnit, form.purchaseUnit, subUnit, form.saleOptions]);

    // ═══ Sync sub-unit → form ═══
    useEffect(() => {
        if (isEditing) return;
        if (!subUnitEnabled) return;

        const cleanUnit = String(subUnit || '').trim();
        const cleanQty = cleanNumericInput(subUnitQty);
        const qtyNum = Number(cleanQty);

        if (!cleanUnit || !cleanQty || !Number.isFinite(qtyNum) || qtyNum <= 0) {
            return;
        }

        setForm((prev) => {
            const alreadySynced =
                prev.baseUnit === cleanUnit && prev.purchaseFactor === cleanQty;
            if (alreadySynced) return prev;

            return {
                ...prev,
                baseUnit: cleanUnit,
                purchaseFactor: cleanQty,
            };
        });
    }, [subUnitEnabled, subUnit, subUnitQty, isEditing]);

    // ═══ Price input display (per-unit or total) ═══
    const displayedPrice = useMemo(() => {
        if (priceInputMode === 'unit') {
            return form.purchasePrice;
        }
        const qty = toNum(form.purchaseQuantity);
        const unitPrice = toNum(form.purchasePrice);
        if (qty <= 0 || form.purchasePrice === '') return '';
        return String(roundTo(unitPrice * qty, 4));
    }, [priceInputMode, form.purchasePrice, form.purchaseQuantity]);

    // ═══ Handlers ═══
    const handleChange = (event) => {
        const { name, value } = event.target;
        const numeric = ['minStock', 'purchaseQuantity', 'purchaseFactor'];
        const nextValue = numeric.includes(name) ? cleanNumericInput(value) : value;

        setForm((prev) => {
            const next = { ...prev, [name]: nextValue };

            if (
                name === 'purchaseQuantity' &&
                priceInputMode === 'total' &&
                prev.purchasePrice
            ) {
                const oldQty = toNum(prev.purchaseQuantity);
                const newQty = toNum(nextValue);
                if (oldQty > 0 && newQty > 0) {
                    const totalAmount = toNum(prev.purchasePrice) * oldQty;
                    next.purchasePrice = String(roundTo(totalAmount / newQty, 4));
                }
            }

            if (name === 'baseUnit') {
                const oldUnit = prev.baseUnit;

                if (!prev.purchaseUnit || prev.purchaseUnit === oldUnit) {
                    next.purchaseUnit = nextValue;
                }

                if (oldUnit && nextValue !== oldUnit) {
                    next.saleOptions = prev.saleOptions.map((o) =>
                        o.unit === oldUnit ? { ...o, unit: nextValue } : o
                    );
                }
            }

            return next;
        });

        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
        if (dbError) setDbError('');
    };

    const handlePriceInput = (raw) => {
        const cleaned = cleanNumericInput(raw);

        if (priceInputMode === 'unit') {
            setForm((prev) => ({ ...prev, purchasePrice: cleaned }));
            return;
        }

        const qty = toNum(form.purchaseQuantity);
        const totalVal = Number(cleaned);

        if (qty > 0 && Number.isFinite(totalVal)) {
            setForm((prev) => ({
                ...prev,
                purchasePrice: String(roundTo(totalVal / qty, 4)),
            }));
        } else {
            setForm((prev) => ({ ...prev, purchasePrice: cleaned }));
        }

        if (errors.purchasePrice) setErrors((prev) => ({ ...prev, purchasePrice: '' }));
        if (dbError) setDbError('');
    };

    const handleCategoryAdded = (cat) => {
        setCategories((prev) => {
            if (prev.some((c) => c.name === cat.name)) return prev;
            return [...prev, cat].sort((a, b) =>
                String(a.name).localeCompare(String(b.name), 'fa')
            );
        });
    };

    const handleUnitAdded = (unit) => {
        setUnits((prev) => {
            if (prev.some((u) => u.name === unit.name)) return prev;
            return [...prev, unit];
        });
    };

    const handleSubUnitToggle = () => {
        if (subUnitEnabled) {
            setSubUnitEnabled(false);
            setSubUnit('');
            setSubUnitQty('');
            if (baseUnitOriginal) {
                setForm((prev) => ({
                    ...prev,
                    baseUnit: baseUnitOriginal,
                    purchaseFactor: '1',
                }));
            }
            setBaseUnitOriginal(null);
        } else {
            setBaseUnitOriginal(form.baseUnit);
            setSubUnitEnabled(true);
        }
    };

    const addSaleOption = () => {
        setForm((prev) => {
            const isFirst = prev.saleOptions.length === 0;
            const costForUnit = effectiveAvgCost;
            const suggested = costForUnit > 0
                ? roundTo(computePriceFromMargin(costForUnit, DEFAULT_SUGGESTED_MARGIN), 2)
                : '';

            return {
                ...prev,
                saleOptions: [
                    ...prev.saleOptions,
                    {
                        id: uid('opt'),
                        unit: prev.baseUnit || '',
                        factor: '1',
                        price: suggested ? String(suggested) : '',
                        targetMargin: String(DEFAULT_SUGGESTED_MARGIN),
                        isDefault: isFirst,
                    },
                ],
            };
        });
    };

    const addSuggestedSaleOption = () => {
        if (!form.baseUnit || effectiveAvgCost <= 0) return;
        const suggested = roundTo(
            computePriceFromMargin(effectiveAvgCost, DEFAULT_SUGGESTED_MARGIN),
            2
        );

        setForm((prev) => ({
            ...prev,
            saleOptions: [
                {
                    id: uid('opt'),
                    unit: prev.baseUnit,
                    factor: '1',
                    price: String(suggested),
                    targetMargin: String(DEFAULT_SUGGESTED_MARGIN),
                    isDefault: true,
                },
                ...prev.saleOptions.map((o) => ({ ...o, isDefault: false })),
            ],
        }));
    };

    const updateSaleOption = (id, patch) => {
        setForm((prev) => ({
            ...prev,
            saleOptions: prev.saleOptions.map((o) =>
                o.id === id ? { ...o, ...patch } : o
            ),
        }));
    };

    const removeSaleOption = (id) => {
        setForm((prev) => {
            const next = prev.saleOptions.filter((o) => o.id !== id);
            if (next.length > 0 && !next.some((o) => o.isDefault)) next[0].isDefault = true;
            return { ...prev, saleOptions: next };
        });
    };

    const setDefaultSaleOption = (id) => {
        setForm((prev) => ({
            ...prev,
            saleOptions: prev.saleOptions.map((o) => ({
                ...o,
                isDefault: o.id === id,
            })),
        }));
    };

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = t('products.form.errors.nameRequired');
        if (!form.baseUnit) next.baseUnit = t('products.form.errors.unitRequired');

        if (!isEditing) {
            if (purchaseCalc.qty < 0)
                next.purchaseQuantity = isEnglish ? 'Invalid quantity.' : 'تعداد معتبر نیست.';
            if (purchaseCalc.factor <= 0)
                next.purchaseFactor = isEnglish ? 'Invalid factor.' : 'ضریب معتبر نیست.';
            if (purchaseCalc.price < 0)
                next.purchasePrice = isEnglish ? 'Invalid price.' : 'قیمت معتبر نیست.';
        }

        if (form.minStock !== '' && toNum(form.minStock) < 0) {
            next.minStock = t('products.form.errors.minStockInvalid');
        }

        if (form.saleOptions.length === 0) {
            next.saleOptions = isEnglish
                ? 'Add at least one sale option.'
                : 'حداقل یک روش فروش اضافه کنید.';
        }

        form.saleOptions.forEach((opt, idx) => {
            if (!opt.unit) {
                next[`sale_${idx}_unit`] = isEnglish ? 'Unit required.' : 'واحد الزامی است.';
            }
            const f = toNum(opt.factor);
            if (f <= 0) {
                next[`sale_${idx}_factor`] = isEnglish
                    ? 'Factor must be > 0.'
                    : 'ضریب باید بزرگتر از صفر باشد.';
            }
        });

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (saving || !validate()) return;

        setSaving(true);
        setDbError('');

        try {
            const avgForNormalize = isEditing ? effectiveAvgCost : purchaseCalc.costPerBase;

            const payload = {
                name: form.name.trim(),
                category: form.category,
                baseUnit: form.baseUnit,
                description: form.description.trim(),
                minStock: toNum(form.minStock),

                saleOptions: form.saleOptions.map((o, idx) =>
                    normalizeSaleOption(
                        {
                            id: o.id,
                            unit: o.unit,
                            factor: toNum(o.factor) || 1,
                            price: toNum(o.price),
                            targetMargin: toNum(o.targetMargin),
                            isDefault: Boolean(o.isDefault),
                        },
                        avgForNormalize,
                        idx
                    )
                ),
            };

            if (!isEditing) {
                payload.purchase = {
                    quantity: purchaseCalc.qty,
                    unit: form.purchaseUnit || form.baseUnit,
                    factor: purchaseCalc.factor,
                    pricePerUnit: purchaseCalc.price,
                    note: form.purchaseNote,
                };
            }

            await onSubmit(payload);
            setForm(initialForm);
            setErrors({});
            setSubUnitEnabled(false);
            setSubUnit('');
            setSubUnitQty('');
            setBaseUnitOriginal(null);
            setPriceInputMode('unit');
        } catch (err) {
            console.error('Failed to submit product:', err);
            setDbError(err?.message || t('products.form.errors.save'));
        } finally {
            setSaving(false);
        }
    };

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget && !saving) onClose?.();
    };

    const isSameUnit =
        !form.purchaseUnit || !form.baseUnit || form.purchaseUnit === form.baseUnit;

    const purchaseGridClass = isSameUnit
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

    const subUnitQtyNum = toNum(subUnitQty);
    const purchaseQtyNum = toNum(form.purchaseQuantity);
    const purchasePriceNum = toNum(form.purchasePrice);
    const subUnitTotalStock = purchaseQtyNum * subUnitQtyNum;
    const subUnitCostPer = subUnitQtyNum > 0 ? purchasePriceNum / subUnitQtyNum : 0;

    const showSubUnitCard =
        !isEditing &&
        Boolean(form.purchaseUnit) &&
        Boolean(form.purchaseQuantity) &&
        Boolean(form.purchasePrice) &&
        (subUnitEnabled || isSameUnit);

    return (
        <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            onMouseDown={handleOverlayClick}
            className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4"
            style={{ background: 'rgba(0, 0, 0, 0.55)' }}
        >
            <div
                className="
                    relative flex w-full max-w-3xl flex-col overflow-hidden
                    rounded-2xl border border-[var(--border)] bg-[var(--surface)]
                    shadow-2xl
                    max-h-[calc(100vh-1rem)]
                    supports-[height:100svh]:max-h-[calc(100svh-1rem)]
                    sm:max-h-[92vh]
                "
            >
                {/* ───────── Header ───────── */}
                <div className="relative flex shrink-0 items-center justify-between gap-4 border-b border-[var(--border-subtle)] px-4 py-3.5 sm:px-5 sm:py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] sm:h-11 sm:w-11">
                            <Package size={19} className="text-[var(--accent-500)]" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="truncate text-sm font-semibold text-[var(--text)]">
                                {isEditing
                                    ? t('products.form.editTitle')
                                    : t('products.form.addTitle')}
                            </h2>
                            <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">
                                {isEditing
                                    ? t('products.form.editSubtitle')
                                    : t('products.form.addSubtitle')}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label={t('common.closeMenu', {
                            defaultValue: isEnglish ? 'Close' : 'بستن',
                        })}
                        className="ui-icon-button shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ───────── Body ───────── */}
                <div
                    className="
                        main-scrollbar min-h-0 flex-1 overflow-y-auto
                        overscroll-contain
                        [scrollbar-gutter:stable]
                        [overflow-anchor:auto]
                    "
                    style={{ willChange: 'scroll-position' }}
                >
                    <form ref={formRef} onSubmit={handleSubmit} className="p-4 sm:p-5">
                        {dbError && (
                            <div className="mb-5 rounded-xl border border-rose-500/15 bg-rose-500/5 px-4 py-3 text-xs text-rose-600 dark:text-rose-400">
                                {dbError}
                            </div>
                        )}

                        {/* ══════════ Basic Info ══════════ */}
                        <SectionHeader icon={Hash} title={t('products.form.sections.basic')} />
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <FieldLabel>{t('products.form.fields.name')}</FieldLabel>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    disabled={saving}
                                    placeholder={t('products.form.fields.namePlaceholder')}
                                    className={fieldClass(Boolean(errors.name))}
                                />
                                <FieldError>{errors.name}</FieldError>
                            </div>

                            <div>
                                <FieldLabel>{t('products.form.fields.category')}</FieldLabel>
                                <CategorySelect
                                    value={form.category}
                                    onChange={(val) => {
                                        setForm((prev) => ({ ...prev, category: val }));
                                        if (errors.category)
                                            setErrors((prev) => ({ ...prev, category: '' }));
                                    }}
                                    categories={categories}
                                    onCategoryAdded={handleCategoryAdded}
                                    disabled={saving}
                                    loading={loading}
                                    isEnglish={isEnglish}
                                    placeholder={t('products.form.fields.categoryPlaceholder')}
                                />
                                <FieldError>{errors.category}</FieldError>
                            </div>

                            <div>
                                <FieldLabel>
                                    {isEnglish ? 'Base Unit' : 'واحد پایه'}
                                    <span className="ms-1 text-[9px] text-[var(--text-soft)]">
                                        {isEnglish
                                            ? '(smallest sellable unit)'
                                            : '(کوچکترین واحد فروش)'}
                                    </span>
                                </FieldLabel>
                                <UnitSelect
                                    value={form.baseUnit}
                                    onChange={(val) => {
                                        handleChange({ target: { name: 'baseUnit', value: val } });
                                        if (errors.baseUnit)
                                            setErrors((prev) => ({ ...prev, baseUnit: '' }));
                                    }}
                                    units={allUnits}
                                    onUnitAdded={handleUnitAdded}
                                    disabled={saving || isEditing || subUnitEnabled}
                                    isEnglish={isEnglish}
                                    placeholder={isEnglish ? 'Select unit' : 'انتخاب واحد'}
                                    showIcon
                                />
                                <FieldError>{errors.baseUnit}</FieldError>
                                {isEditing && (
                                    <p className="mt-1.5 text-[9px] text-[var(--text-soft)]">
                                        {isEnglish
                                            ? 'Locked after creation.'
                                            : 'پس از ایجاد قابل تغییر نیست.'}
                                    </p>
                                )}
                                {subUnitEnabled && !isEditing && (
                                    <p className="mt-1.5 flex items-center gap-1 text-[9px] text-[var(--accent-600)] dark:text-[var(--accent-300)]">
                                        <Sparkles size={10} />
                                        {isEnglish
                                            ? 'Auto-managed by sub-unit'
                                            : 'خودکار از زیرواحد خرید'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ══════════ Initial Purchase ══════════ */}
                        {!isEditing && (
                            <>
                                <SectionHeader
                                    icon={ShoppingCart}
                                    title={isEnglish ? 'Initial Purchase' : 'خرید اولیه'}
                                />
                                <div className={`mb-3 grid gap-4 ${purchaseGridClass}`}>
                                    {/* Quantity */}
                                    <div>
                                        <FieldLabel>{isEnglish ? 'Quantity' : 'تعداد'}</FieldLabel>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            dir="ltr"
                                            name="purchaseQuantity"
                                            value={form.purchaseQuantity}
                                            onChange={handleChange}
                                            disabled={saving}
                                            placeholder="0"
                                            className={`${fieldClass(Boolean(errors.purchaseQuantity))} text-center number-font`}
                                        />
                                        <FieldError>{errors.purchaseQuantity}</FieldError>
                                    </div>

                                    {/* Purchase Unit */}
                                    <div>
                                        <FieldLabel>{isEnglish ? 'Unit' : 'واحد خرید'}</FieldLabel>
                                        <UnitSelect
                                            value={form.purchaseUnit}
                                            onChange={(val) =>
                                                handleChange({
                                                    target: { name: 'purchaseUnit', value: val },
                                                })
                                            }
                                            units={allUnits}
                                            onUnitAdded={handleUnitAdded}
                                            disabled={saving}
                                            isEnglish={isEnglish}
                                            placeholder={isEnglish ? 'Select unit' : 'انتخاب واحد'}
                                            compact
                                            hideAdd
                                        />
                                    </div>

                                    {/* Factor (only when unit ≠ base) */}
                                    {!isSameUnit && (
                                        <div>
                                            <FieldLabel>
                                                {isEnglish ? 'Each =' : 'هر یک ='}
                                                {form.baseUnit && (
                                                    <span className="ms-1 text-[9px] text-[var(--text-soft)]">
                                                        ({form.baseUnit})
                                                    </span>
                                                )}
                                            </FieldLabel>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                dir="ltr"
                                                name="purchaseFactor"
                                                value={form.purchaseFactor}
                                                onChange={handleChange}
                                                disabled={saving}
                                                placeholder="1"
                                                className={`${fieldClass(Boolean(errors.purchaseFactor))} text-center number-font`}
                                            />
                                            <FieldError>{errors.purchaseFactor}</FieldError>
                                        </div>
                                    )}

                                    {/* ═════════════════════════════════════════════
                                        ✅ FIX: هم‌ترازی کارت قیمت با بقیه
                                        دکمه toggle از بالای input منتقل شد به
                                        داخل خود input (absolute). اینطور
                                        FieldLabel مثل بقیه کارت‌ها یک ارتفاع
                                        یکسان دارد و input هم‌تراز می‌شود.
                                    ═════════════════════════════════════════════ */}
                                    <div className="min-w-0">
                                        <FieldLabel>
                                            {priceInputMode === 'unit'
                                                ? (isEnglish
                                                    ? `Price / ${form.purchaseUnit || 'unit'} (AF)`
                                                    : `قیمت هر ${form.purchaseUnit || 'واحد'} (AF)`)
                                                : (isEnglish
                                                    ? 'Total price (AF)'
                                                    : 'قیمت کل خرید (AF)')}
                                        </FieldLabel>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                dir="ltr"
                                                name="purchasePrice"
                                                value={formatInputNumber(displayedPrice, language)}
                                                onChange={(e) => handlePriceInput(e.target.value)}
                                                disabled={saving}
                                                placeholder="0"
                                                className={`${fieldClass(Boolean(errors.purchasePrice))} pe-20 text-center number-font`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setPriceInputMode((m) =>
                                                        m === 'unit' ? 'total' : 'unit'
                                                    )
                                                }
                                                disabled={saving}
                                                className="absolute end-1.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-1 text-[9px] font-medium text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-600)] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-[var(--accent-300)]"
                                                title={
                                                    isEnglish
                                                        ? 'Switch per-unit / total'
                                                        : 'تغییر واحد / کل'
                                                }
                                            >
                                                <Repeat size={10} />
                                                <span>
                                                    {priceInputMode === 'unit'
                                                        ? (isEnglish ? 'Total' : 'کل')
                                                        : (isEnglish ? 'Unit' : 'واحد')}
                                                </span>
                                            </button>
                                        </div>

                                        <FieldError>{errors.purchasePrice}</FieldError>

                                        {purchaseCalc.qty > 0 &&
                                            purchaseCalc.price > 0 && (
                                                <p className="mt-1.5 text-[10px] text-[var(--text-muted)]">
                                                    {priceInputMode === 'unit' ? (
                                                        <>
                                                            {isEnglish ? 'Total: ' : 'جمع کل: '}
                                                            <span className="number-font font-medium text-[var(--text-secondary)]">
                                                                {formatMoney(
                                                                    purchaseCalc.totalPaid,
                                                                    language
                                                                )}{' '}
                                                                AF
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {isEnglish
                                                                ? `Per ${form.purchaseUnit || 'unit'}: `
                                                                : `هر ${form.purchaseUnit || 'واحد'}: `}
                                                            <span className="number-font font-medium text-[var(--text-secondary)]">
                                                                {formatMoney(
                                                                    purchaseCalc.price,
                                                                    language
                                                                )}{' '}
                                                                AF
                                                            </span>
                                                        </>
                                                    )}
                                                </p>
                                            )}
                                    </div>
                                </div>

                                {/* SUB-UNIT CARD */}
                                {showSubUnitCard && (
                                    <div className="mb-3 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-500)] text-white">
                                                <Sparkles size={14} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-[11px] font-semibold text-[var(--accent-600)] dark:text-[var(--accent-300)]">
                                                    {isEnglish
                                                        ? `Is there a smaller unit inside each ${form.purchaseUnit || '—'}?`
                                                        : `آیا داخل هر ${form.purchaseUnit || '—'}، واحد کوچک‌تری هست؟`}
                                                </p>
                                                <p className="mt-0.5 text-[10px] leading-5 text-[var(--text-muted)]">
                                                    {isEnglish
                                                        ? 'For example: 20 pieces inside each carton. This helps you sell by piece without losing money.'
                                                        : 'مثلاً ۲۰ دانه داخل هر کارتن. اینطوری می‌تونی دانه‌ای بفروشی بدون ضرر.'}
                                                </p>

                                                <label className="mt-3 flex cursor-pointer items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={subUnitEnabled}
                                                        onChange={handleSubUnitToggle}
                                                        disabled={saving}
                                                        className="h-4 w-4 cursor-pointer accent-[var(--accent-500)]"
                                                    />
                                                    <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                                                        {isEnglish
                                                            ? 'Yes, enable sub-unit'
                                                            : 'بله، فعال کن'}
                                                    </span>
                                                </label>

                                                {subUnitEnabled && (
                                                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2.5">
                                                        <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
                                                            {isEnglish ? 'Each' : 'هر'}{' '}
                                                            <span className="font-semibold text-[var(--text-secondary)]">
                                                                {form.purchaseUnit}
                                                            </span>
                                                        </span>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            dir="ltr"
                                                            value={subUnitQty}
                                                            onChange={(e) =>
                                                                setSubUnitQty(
                                                                    cleanNumericInput(e.target.value)
                                                                )
                                                            }
                                                            disabled={saving}
                                                            placeholder="20"
                                                            className="h-9 w-20 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-2 text-center text-xs number-font outline-none transition-[border-color,box-shadow] focus:border-[var(--input-border-focus)]"
                                                        />
                                                        <select
                                                            value={subUnit}
                                                            onChange={(e) =>
                                                                setSubUnit(e.target.value)
                                                            }
                                                            disabled={saving}
                                                            className="h-9 min-w-[6rem] cursor-pointer rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-2 text-xs text-[var(--text)] outline-none transition-[border-color,box-shadow] focus:border-[var(--input-border-focus)]"
                                                        >
                                                            <option value="">
                                                                {isEnglish
                                                                    ? 'Select unit'
                                                                    : 'انتخاب واحد'}
                                                            </option>
                                                            {allUnits.map((u) => (
                                                                <option
                                                                    key={u.id ?? u.name}
                                                                    value={u.name}
                                                                >
                                                                    {u.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}

                                                {subUnitEnabled &&
                                                    subUnit &&
                                                    subUnitQtyNum > 0 && (
                                                        <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2 sm:grid-cols-3">
                                                            <SubUnitPreview
                                                                icon={Package2}
                                                                label={
                                                                    isEnglish
                                                                        ? 'Base unit'
                                                                        : 'واحد پایه'
                                                                }
                                                                value={subUnit}
                                                            />
                                                            <SubUnitPreview
                                                                icon={Scale}
                                                                label={
                                                                    isEnglish
                                                                        ? 'Total stock'
                                                                        : 'موجودی کل'
                                                                }
                                                                value={`${formatMoney(
                                                                    subUnitTotalStock,
                                                                    language
                                                                )} ${subUnit}`}
                                                            />
                                                            <SubUnitPreview
                                                                icon={TrendingUp}
                                                                label={
                                                                    isEnglish
                                                                        ? 'Cost / unit'
                                                                        : 'قیمت هر واحد'
                                                                }
                                                                value={`${formatMoney(
                                                                    subUnitCostPer,
                                                                    language
                                                                )} AF`}
                                                                accent
                                                            />
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Note */}
                                <div className="mb-3">
                                    <FieldLabel>
                                        {isEnglish
                                            ? 'Note (optional)'
                                            : 'یادداشت (اختیاری)'}
                                    </FieldLabel>
                                    <input
                                        type="text"
                                        name="purchaseNote"
                                        value={form.purchaseNote}
                                        onChange={handleChange}
                                        disabled={saving}
                                        placeholder={
                                            isEnglish
                                                ? 'e.g. transport fare included'
                                                : 'مثلاً کرایه موتر شامل است'
                                        }
                                        className={fieldClass(false)}
                                    />
                                </div>

                                {/* Purchase Summary */}
                                {purchaseCalc.costPerBase > 0 && (
                                    <div className="mb-3 grid grid-cols-1 gap-2 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3 sm:grid-cols-3">
                                        <SummaryStat
                                            label={isEnglish ? 'Cost per' : 'قیمت هر'}
                                            suffix={form.baseUnit}
                                            value={formatMoney(
                                                purchaseCalc.costPerBase,
                                                language
                                            )}
                                            accent
                                        />
                                        <SummaryStat
                                            label={
                                                isEnglish ? 'Stock in base' : 'موجودی پایه'
                                            }
                                            suffix={form.baseUnit}
                                            value={formatMoney(
                                                purchaseCalc.stockInBase,
                                                language
                                            )}
                                        />
                                        <SummaryStat
                                            label={
                                                isEnglish ? 'Investment' : 'سرمایه‌گذاری'
                                            }
                                            suffix="AF"
                                            value={formatMoney(
                                                purchaseCalc.totalPaid,
                                                language
                                            )}
                                        />
                                    </div>
                                )}

                                {/* Suggested Sale Option */}
                                {purchaseCalc.costPerBase > 0 &&
                                    form.baseUnit &&
                                    form.saleOptions.length === 0 && (
                                        <button
                                            type="button"
                                            onClick={addSuggestedSaleOption}
                                            disabled={saving}
                                            className="mb-6 flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-[var(--accent-border)] bg-[var(--accent-soft)] p-3 text-start transition-colors duration-200 hover:bg-[var(--accent-soft-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <div className="flex min-w-0 items-center gap-2.5">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-500)] text-white">
                                                    <Sparkles size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-[11px] font-semibold text-[var(--accent-600)] dark:text-[var(--accent-300)]">
                                                        {isEnglish
                                                            ? 'Add a suggested sale option'
                                                            : 'افزودن روش فروش پیشنهادی'}
                                                    </p>
                                                    <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                                                        {isEnglish
                                                            ? `Sell 1 ${form.baseUnit} at ${formatMoney(roundTo(computePriceFromMargin(purchaseCalc.costPerBase, DEFAULT_SUGGESTED_MARGIN), 2), language)} AF (${DEFAULT_SUGGESTED_MARGIN}% margin)`
                                                            : `فروش ۱ ${form.baseUnit} به ${formatMoney(roundTo(computePriceFromMargin(purchaseCalc.costPerBase, DEFAULT_SUGGESTED_MARGIN), 2), language)} افغانی (${DEFAULT_SUGGESTED_MARGIN}٪ سود)`}
                                                    </p>
                                                </div>
                                            </div>
                                            <Plus
                                                size={16}
                                                className="shrink-0 text-[var(--accent-500)]"
                                            />
                                        </button>
                                    )}
                            </>
                        )}

                        {/* ══════════ Sale Options ══════════ */}
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <SectionHeader
                                icon={TrendingUp}
                                title={isEnglish ? 'Sale Options' : 'روش‌های فروش'}
                                noMargin
                            />
                            <button
                                type="button"
                                onClick={addSaleOption}
                                disabled={saving}
                                className="ui-button-secondary h-9 shrink-0 px-3 text-xs"
                            >
                                <Plus size={14} />
                                {isEnglish ? 'Add' : 'افزودن'}
                            </button>
                        </div>

                        {form.saleOptions.length === 0 ? (
                            <div className="mb-6 rounded-xl border border-dashed border-rose-500/25 bg-rose-500/[0.04] px-4 py-4 text-center text-[11px] text-rose-600 dark:text-rose-400">
                                {isEnglish
                                    ? 'Add at least one sale option (piece, carton, kg...).'
                                    : 'حداقل یک روش فروش اضافه کنید (دانه، کارتن، کیلو...).'}
                            </div>
                        ) : (
                            <div className="mb-6 space-y-3">
                                {form.saleOptions.map((opt, idx) => (
                                    <SaleOptionRow
                                        key={opt.id}
                                        index={idx + 1}
                                        option={opt}
                                        units={allUnits}
                                        baseUnit={form.baseUnit}
                                        avgCost={effectiveAvgCost}
                                        language={language}
                                        isEnglish={isEnglish}
                                        onUpdate={(patch) => updateSaleOption(opt.id, patch)}
                                        onRemove={() => removeSaleOption(opt.id)}
                                        onSetDefault={() => setDefaultSaleOption(opt.id)}
                                        saving={saving}
                                    />
                                ))}
                            </div>
                        )}

                        {/* ══════════ Inventory ══════════ */}
                        <SectionHeader
                            icon={Warehouse}
                            title={t('products.form.sections.inventory')}
                        />
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                            {isEditing && (
                                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                                    <p className="text-[10px] text-[var(--text-muted)]">
                                        {isEnglish ? 'Current Stock' : 'موجودی فعلی'}
                                    </p>
                                    <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                                        {formatMoney(product.stock, language)}{' '}
                                        <span className="text-[10px] font-normal text-[var(--text-muted)]">
                                            {product.baseUnit}
                                        </span>
                                    </p>
                                    <p className="mt-1 text-[9px] text-[var(--text-soft)]">
                                        {isEnglish
                                            ? 'To add stock, use the "New Purchase" button in details view.'
                                            : 'برای افزودن موجودی از دکمه «خرید جدید» در جزئیات محصول استفاده کنید.'}
                                    </p>
                                </div>
                            )}

                            <div className={isEditing ? '' : 'md:col-span-2'}>
                                <label className="mb-2 flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                                    <span>{t('products.form.fields.minStock')}</span>
                                    {form.baseUnit && (
                                        <span className="text-[9px] text-[var(--text-soft)]">
                                            ({form.baseUnit})
                                        </span>
                                    )}
                                    <AlertTriangle
                                        size={12}
                                        className="text-amber-500 dark:text-amber-400"
                                    />
                                </label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    dir="ltr"
                                    name="minStock"
                                    value={form.minStock}
                                    onChange={handleChange}
                                    disabled={saving}
                                    placeholder={t(
                                        'products.form.fields.minStockPlaceholder'
                                    )}
                                    className={`${fieldClass(Boolean(errors.minStock))} text-center number-font`}
                                />
                                <FieldError>{errors.minStock}</FieldError>
                            </div>
                        </div>

                        {/* ══════════ Description ══════════ */}
                        <SectionHeader
                            icon={FileText}
                            title={t('products.form.sections.description')}
                        />
                        <div className="mb-6">
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                disabled={saving}
                                rows={3}
                                placeholder={t(
                                    'products.form.fields.descriptionPlaceholder'
                                )}
                                className="w-full resize-none rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-sm leading-6 text-[var(--text)] outline-none transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-[var(--text-soft)] focus:border-[var(--input-border-focus)] focus:shadow-[0_0_0_3px_var(--accent-soft-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>

                        {/* ══════════ Footer ══════════ */}
                        <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-subtle)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="hidden text-[10px] text-[var(--text-soft)] sm:block">
                                {isEnglish
                                    ? 'Tip: Ctrl + Enter to save'
                                    : 'نکته: Ctrl + Enter برای ذخیره'}
                            </p>
                            <div className="flex flex-col-reverse gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={saving}
                                    className="ui-button-secondary w-full sm:w-auto"
                                >
                                    {t('products.form.actions.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || loading}
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
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// =========================================================
// Sub-Unit Preview Item
// =========================================================

function SubUnitPreview({ icon: Icon, label, value, accent = false }) {
    return (
        <div className="flex min-w-0 items-center gap-2">
            <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                    accent
                        ? 'bg-[var(--accent-soft-strong)] text-[var(--accent-600)] dark:text-[var(--accent-300)]'
                        : 'bg-[var(--surface-muted)] text-[var(--text-muted)]'
                }`}
            >
                <Icon size={13} />
            </div>
            <div className="min-w-0">
                <p className="text-[9px] text-[var(--text-muted)]">{label}</p>
                <p
                    className={`mt-0.5 truncate text-[11px] font-semibold ${
                        accent
                            ? 'text-[var(--accent-600)] dark:text-[var(--accent-300)]'
                            : 'text-[var(--text-primary)]'
                    }`}
                >
                    {value}
                </p>
            </div>
        </div>
    );
}

// =========================================================
// Category Select
// =========================================================

function CategorySelect({
    value,
    onChange,
    categories,
    onCategoryAdded,
    disabled,
    loading,
    isEnglish,
    placeholder,
}) {
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (adding && inputRef.current) setTimeout(() => inputRef.current?.focus(), 0);
    }, [adding]);

    const handleCancel = () => {
        if (busy) return;
        setAdding(false);
        setNewName('');
        setError('');
    };

    const handleAdd = async () => {
        const clean = String(newName || '').trim().replace(/\s+/g, ' ');
        if (!clean) {
            setError(isEnglish ? 'Name required.' : 'نام الزامی است.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            const created = await addCategory(clean);
            setNewName('');
            setAdding(false);
            onCategoryAdded?.(created);
            onChange?.(created.name);
        } catch (err) {
            setError(err?.message || (isEnglish ? 'Failed to add.' : 'افزودن انجام نشد.'));
        } finally {
            setBusy(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    return (
        <div className="space-y-2" data-inline-add-open={adding ? 'true' : 'false'}>
            <div className="flex items-stretch gap-2">
                <div className="relative min-w-0 flex-1">
                    <Layers3
                        size={15}
                        className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                    />
                    <select
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                        disabled={disabled || loading || busy}
                        className={`${selectClass} ps-10 pe-10`}
                    >
                        <option value="">{placeholder || '—'}</option>
                        {categories.map((item) => (
                            <option key={item.id} value={item.name}>
                                {item.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={15}
                        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                    />
                </div>

                <button
                    type="button"
                    onClick={() => setAdding(true)}
                    disabled={disabled || busy || adding}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-600)] transition-colors duration-200 hover:bg-[var(--accent-soft-strong)] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[var(--accent-300)]"
                >
                    <Plus size={15} />
                </button>
            </div>

            {adding && (
                <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-2.5">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newName}
                            onChange={(e) => {
                                setNewName(e.target.value);
                                if (error) setError('');
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={busy}
                            placeholder={
                                isEnglish ? 'New category name' : 'نام دسته‌بندی جدید'
                            }
                            className="h-9 min-w-0 flex-1 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--text)] outline-none transition-[border-color,box-shadow] focus:border-[var(--input-border-focus)]"
                        />
                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={busy || !newName.trim()}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-500)] text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {busy ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <Check size={14} />
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={busy}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors duration-200 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-40 dark:hover:text-rose-400"
                        >
                            <X size={14} />
                        </button>
                    </div>
                    {error && (
                        <p className="mt-2 text-[10px] text-rose-500 dark:text-rose-400">
                            {error}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// =========================================================
// Unit Select
// =========================================================

function UnitSelect({
    value,
    onChange,
    units,
    onUnitAdded,
    disabled,
    isEnglish,
    placeholder,
    compact = false,
    showIcon = false,
    hideAdd = false,
}) {
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [newCategory, setNewCategory] = useState('count');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (adding && inputRef.current) setTimeout(() => inputRef.current?.focus(), 0);
    }, [adding]);

    const handleCancel = () => {
        if (busy) return;
        setAdding(false);
        setNewName('');
        setNewCategory('count');
        setError('');
        setShowCategoryPicker(false);
    };

    const handleAdd = async () => {
        const clean = String(newName || '').trim().replace(/\s+/g, ' ');
        if (!clean) {
            setError(isEnglish ? 'Name required.' : 'نام الزامی است.');
            return;
        }
        setBusy(true);
        setError('');
        try {
            const created = await addUnit(clean, newCategory);
            setNewName('');
            setNewCategory('count');
            setAdding(false);
            setShowCategoryPicker(false);
            onUnitAdded?.(created);
            onChange?.(created.name);
        } catch (err) {
            setError(err?.message || (isEnglish ? 'Failed to add.' : 'افزودن انجام نشد.'));
        } finally {
            setBusy(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    const height = compact ? 'h-10' : 'h-11';
    const btnSize = compact ? 'h-10 w-10' : 'h-11 w-11';
    const iconSize = compact ? 14 : 15;

    const selectedCat = UNIT_CATEGORIES.find((c) => c.value === newCategory);
    const catLabel = selectedCat
        ? isEnglish
            ? selectedCat.labelEn
            : selectedCat.labelFa
        : '—';

    return (
        <div className="space-y-2" data-inline-add-open={adding ? 'true' : 'false'}>
            <div className="flex items-stretch gap-2">
                <div className="relative min-w-0 flex-1">
                    {showIcon && !compact && (
                        <Ruler
                            size={15}
                            className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                        />
                    )}
                    <select
                        value={value}
                        onChange={(e) => onChange?.(e.target.value)}
                        disabled={disabled || busy}
                        className={
                            compact
                                ? `ui-input ${height} w-full cursor-pointer pe-9`
                                : `${selectClass} ps-10 pe-10`
                        }
                    >
                        <option value="">{placeholder || '—'}</option>
                        {units.map((u) => (
                            <option key={u.id ?? u.name} value={u.name}>
                                {u.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={iconSize}
                        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                    />
                </div>

                {!hideAdd && (
                    <button
                        type="button"
                        onClick={() => setAdding(true)}
                        disabled={disabled || busy || adding}
                        className={`${btnSize} flex shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-600)] transition-colors duration-200 hover:bg-[var(--accent-soft-strong)] disabled:cursor-not-allowed disabled:opacity-50 dark:text-[var(--accent-300)]`}
                    >
                        <Plus size={iconSize} />
                    </button>
                )}
            </div>

            {!hideAdd && adding && (
                <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-2.5">
                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                        <input
                            ref={inputRef}
                            type="text"
                            value={newName}
                            onChange={(e) => {
                                setNewName(e.target.value);
                                if (error) setError('');
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={busy}
                            placeholder={
                                isEnglish ? 'New unit name' : 'نام واحد جدید'
                            }
                            className="h-9 min-w-[7rem] flex-1 rounded-lg border border-[var(--input-border)] bg-[var(--input-bg)] px-3 text-xs text-[var(--text)] outline-none transition-[border-color,box-shadow] focus:border-[var(--input-border-focus)]"
                        />

                        <button
                            type="button"
                            onClick={() => setShowCategoryPicker((s) => !s)}
                            disabled={busy}
                            className="flex h-9 shrink-0 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-[10px] text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--accent-border)] hover:text-[var(--accent-600)]"
                        >
                            <span className="max-w-[5rem] truncate">{catLabel}</span>
                            <ChevronDown size={11} />
                        </button>

                        <button
                            type="button"
                            onClick={handleAdd}
                            disabled={busy || !newName.trim()}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-500)] text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {busy ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <Check size={14} />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={busy}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-colors duration-200 hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-40 dark:hover:text-rose-400"
                        >
                            <X size={14} />
                        </button>
                    </div>

                    {showCategoryPicker && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {UNIT_CATEGORIES.map((c) => (
                                <button
                                    key={c.value}
                                    type="button"
                                    onClick={() => {
                                        setNewCategory(c.value);
                                        setShowCategoryPicker(false);
                                    }}
                                    className={`rounded-lg border px-2 py-1 text-[10px] transition-colors duration-200 ${
                                        newCategory === c.value
                                            ? 'border-[var(--accent-border)] bg-[var(--accent-soft-strong)] text-[var(--accent-600)] dark:text-[var(--accent-300)]'
                                            : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent-border)]'
                                    }`}
                                >
                                    {isEnglish ? c.labelEn : c.labelFa}
                                </button>
                            ))}
                        </div>
                    )}

                    {error && (
                        <p className="mt-2 text-[10px] text-rose-500 dark:text-rose-400">
                            {error}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// =========================================================
// Sale Option Row
// =========================================================

function SaleOptionRow({
    index,
    option,
    units,
    baseUnit,
    avgCost,
    language,
    isEnglish,
    onUpdate,
    onRemove,
    onSetDefault,
    saving,
}) {
    const factor = toNum(option.factor) || 1;
    const price = toNum(option.price);

    const costForUnit = avgCost * factor;
    const profit = price - costForUnit;
    const margin = computeMarginFromPrice(price, costForUnit);

    const suggested = costForUnit > 0
        ? computePriceFromMargin(costForUnit, DEFAULT_SUGGESTED_MARGIN)
        : 0;

    const isSameUnit = !option.unit || option.unit === baseUnit;

    const [ratioMode, setRatioMode] = useState(() =>
        factor < 1 ? 'divide' : 'multiply'
    );

    const ratioValue =
        ratioMode === 'divide'
            ? factor > 0
                ? roundTo(1 / factor, 6)
                : 1
            : factor;

    const [ratioText, setRatioText] = useState(String(ratioValue));

    useEffect(() => {
        const next =
            ratioMode === 'divide'
                ? factor > 0
                    ? roundTo(1 / factor, 6)
                    : 1
                : factor;
        setRatioText(String(next));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [option.id, option.unit, baseUnit, ratioMode]);

    const tone =
        profit < 0
            ? {
                bg: 'border-rose-500/25 bg-rose-500/[0.05]',
                text: 'text-rose-500 dark:text-rose-400',
                Icon: TrendingDown,
            }
            : profit === 0
                ? {
                    bg: 'border-amber-500/25 bg-amber-500/[0.05]',
                    text: 'text-amber-500 dark:text-amber-400',
                    Icon: Info,
                }
                : margin < 10
                    ? {
                        bg: 'border-amber-500/25 bg-amber-500/[0.05]',
                        text: 'text-amber-500 dark:text-amber-400',
                        Icon: TrendingUp,
                    }
                    : {
                        bg: 'border-emerald-500/25 bg-emerald-500/[0.05]',
                        text: 'text-emerald-600 dark:text-emerald-400',
                        Icon: TrendingUp,
                    };

    const TrendIcon = tone.Icon;

    const handleUnitChange = (newUnit) => {
        const patch = { unit: newUnit };

        if (!newUnit || newUnit === baseUnit) {
            patch.factor = '1';
            if (avgCost > 0) {
                patch.price = String(
                    roundTo(
                        computePriceFromMargin(avgCost, DEFAULT_SUGGESTED_MARGIN),
                        2
                    )
                );
            }
            onUpdate(patch);
            return;
        }

        patch.factor = '1';
        setRatioMode('multiply');
        if (avgCost > 0) {
            patch.price = String(
                roundTo(computePriceFromMargin(avgCost, DEFAULT_SUGGESTED_MARGIN), 2)
            );
        }
        onUpdate(patch);
    };

    const handleRatioChange = (raw) => {
        const cleaned = cleanNumericInput(raw);
        setRatioText(cleaned);

        const num = Number(cleaned);
        if (!Number.isFinite(num) || num <= 0) return;

        let nextFactor;
        if (ratioMode === 'divide') {
            nextFactor = 1 / num;
        } else {
            nextFactor = num;
        }

        const nextCost = avgCost * nextFactor;
        const currentMargin = Number.isFinite(Number(option.targetMargin))
            ? Number(option.targetMargin)
            : DEFAULT_SUGGESTED_MARGIN;
        const nextPrice = computePriceFromMargin(nextCost, currentMargin);

        onUpdate({
            factor: String(roundTo(nextFactor, 8)),
            price: String(roundTo(nextPrice, 2)),
            targetMargin: String(roundTo(currentMargin, 2)),
        });
    };

    const toggleRatioMode = () => {
        if (isSameUnit) return;
        setRatioMode((m) => (m === 'multiply' ? 'divide' : 'multiply'));
    };

    const handlePriceChange = (raw) => {
        const cleaned = cleanNumericInput(raw);
        const newPrice = Number(cleaned);

        const patch = { price: cleaned };

        if (costForUnit > 0 && Number.isFinite(newPrice) && newPrice > 0) {
            const newMargin = computeMarginFromPrice(newPrice, costForUnit);
            patch.targetMargin = String(roundTo(newMargin, 2));
        }

        onUpdate(patch);
    };

    const ratioLabel = (() => {
        if (isSameUnit) return null;
        if (ratioMode === 'multiply') {
            return isEnglish
                ? `1 ${option.unit} = ? ${baseUnit}`
                : `۱ ${option.unit} = چند ${baseUnit}`;
        }
        return isEnglish
            ? `1 ${baseUnit} = ? ${option.unit}`
            : `۱ ${baseUnit} = چند ${option.unit}`;
    })();

    const priceLabel = isEnglish
        ? `Price / ${option.unit || '—'} (AF)`
        : `قیمت / ${option.unit || '—'} (AF)`;

    const ratioHint = (() => {
        if (isSameUnit) return null;
        if (factor === 1 || factor <= 0) return null;
        if (factor > 1) {
            return `1 ${option.unit} = ${roundTo(factor, 6)} ${baseUnit}`;
        }
        return `1 ${baseUnit} = ${roundTo(1 / factor, 6)} ${option.unit}`;
    })();

    const gridCols = isSameUnit
        ? 'grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-2 lg:grid-cols-4';

    return (
        <div
            className={`relative rounded-xl border p-3 transition-colors duration-200 ${tone.bg}`}
        >
            <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-1.5 text-[10px] font-medium text-[var(--text-muted)]">
                        {index}
                    </span>
                    {option.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)] px-2 py-0.5 text-[9px] font-medium text-[var(--accent-600)] dark:text-[var(--accent-300)]">
                            <Star size={9} className="fill-current" />
                            {isEnglish ? 'Default' : 'پیش‌فرض'}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {!option.isDefault && (
                        <button
                            type="button"
                            onClick={onSetDefault}
                            disabled={saving}
                            className="flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] text-[var(--text-muted)] transition-colors duration-200 hover:bg-[var(--accent-soft)] hover:text-[var(--accent-500)]"
                        >
                            <Star size={11} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onRemove}
                        disabled={saving}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors duration-200 hover:bg-rose-500/10 hover:text-rose-500 disabled:opacity-40 dark:hover:text-rose-400"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>

            <div className={`grid gap-3 ${gridCols}`}>
                <div className="min-w-0">
                    <label className="mb-1.5 block text-[10px] text-[var(--text-muted)]">
                        {isEnglish ? 'Sale Unit' : 'واحد فروش'}
                    </label>
                    <div className="relative">
                        <select
                            value={option.unit}
                            onChange={(e) => handleUnitChange(e.target.value)}
                            disabled={saving}
                            className="ui-input h-10 w-full cursor-pointer appearance-none pe-9"
                        >
                            <option value="">—</option>
                            {units.map((u) => (
                                <option key={u.id ?? u.name} value={u.name}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                        />
                    </div>
                </div>

                {!isSameUnit && (
                    <div className="min-w-0">
                        <div className="mb-1.5 flex items-center justify-between gap-1">
                            <label className="truncate text-[10px] text-[var(--text-muted)]">
                                {ratioLabel}
                            </label>
                            <button
                                type="button"
                                onClick={toggleRatioMode}
                                disabled={saving}
                                className="shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 text-[9px] font-medium text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-600)] disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-[var(--accent-300)]"
                            >
                                ⇄
                            </button>
                        </div>
                        <input
                            type="text"
                            inputMode="decimal"
                            dir="ltr"
                            value={formatInputNumber(ratioText, language)}
                            onChange={(e) => handleRatioChange(e.target.value)}
                            disabled={saving}
                            placeholder={ratioMode === 'multiply' ? '1' : ''}
                            className="ui-input h-10 w-full text-center number-font"
                        />
                    </div>
                )}

                <div className="min-w-0">
                    <label className="mb-1.5 block truncate text-[10px] text-[var(--text-muted)]">
                        {priceLabel}
                    </label>
                    <input
                        type="text"
                        inputMode="decimal"
                        dir="ltr"
                        value={formatInputNumber(option.price, language)}
                        onChange={(e) => handlePriceChange(e.target.value)}
                        disabled={saving}
                        placeholder="0"
                        className="ui-input h-10 w-full text-center number-font"
                    />
                </div>

                <div className="min-w-0">
                    <label className="mb-1.5 block text-[10px] text-[var(--text-muted)]">
                        {isEnglish ? 'Margin %' : 'درصد سود'}
                        <span className="ms-1 text-[8px] text-[var(--text-soft)]">
                            ({isEnglish ? 'auto' : 'خودکار'})
                        </span>
                    </label>
                    <input
                        type="text"
                        dir="ltr"
                        readOnly
                        tabIndex={-1}
                        value={formatInputNumber(
                            Number.isFinite(margin) ? margin.toFixed(1) : '0.0',
                            language
                        )}
                        placeholder="0.0"
                        className="ui-input h-10 w-full cursor-not-allowed text-center number-font opacity-80"
                    />
                </div>
            </div>

            {avgCost > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[var(--border-subtle)] pt-2 text-[10px]">
                    <span className="flex items-center gap-1 text-[var(--text-muted)]">
                        {isEnglish ? 'Cost:' : 'تمام‌شده:'}
                        <span className="number-font font-medium text-[var(--text-secondary)]">
                            {formatMoney(costForUnit, language)} AF
                        </span>
                    </span>

                    {price > 0 && (
                        <span className={`flex items-center gap-1 ${tone.text}`}>
                            <TrendIcon size={11} />
                            {profit >= 0
                                ? isEnglish
                                    ? 'Profit:'
                                    : 'سود:'
                                : isEnglish
                                    ? 'Loss:'
                                    : 'ضرر:'}
                            <span className="number-font font-medium">
                                {profit >= 0 ? '+' : ''}
                                {formatMoney(profit, language)} AF
                            </span>
                            <span className="opacity-70">
                                ({profit >= 0 ? '+' : ''}
                                {Number.isFinite(margin) ? margin.toFixed(1) : '0.0'}%)
                            </span>
                        </span>
                    )}

                    {ratioHint && (
                        <span className="text-[var(--text-soft)]">
                            {isEnglish ? 'Ratio: ' : 'نسبت: '}
                            <span className="font-medium text-[var(--text-secondary)]">
                                {ratioHint}
                            </span>
                        </span>
                    )}

                    {suggested > 0 && price !== suggested && (
                        <button
                            type="button"
                            onClick={() => {
                                const newMargin = computeMarginFromPrice(
                                    suggested,
                                    costForUnit
                                );
                                onUpdate({
                                    price: String(roundTo(suggested, 2)),
                                    targetMargin: String(roundTo(newMargin, 2)),
                                });
                            }}
                            disabled={saving}
                            className="ms-auto flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--text-muted)] transition-colors duration-200 hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-600)] dark:hover:text-[var(--accent-300)]"
                        >
                            {isEnglish ? 'Suggested:' : 'پیشنهاد:'}
                            <span className="number-font font-medium">
                                {formatMoney(suggested, language)} AF
                            </span>
                            <span className="text-[9px] opacity-70">
                                ({DEFAULT_SUGGESTED_MARGIN}%)
                            </span>
                        </button>
                    )}
                </div>
            )}

            {profit < 0 && (
                <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-rose-500/15 bg-rose-500/[0.06] px-2.5 py-1.5 text-[10px] text-rose-600 dark:text-rose-400">
                    <AlertTriangle size={12} />
                    {isEnglish
                        ? 'Below cost — you will lose money.'
                        : 'زیر قیمت خرید — ضرر می‌کنید.'}
                </div>
            )}
        </div>
    );
}

// =========================================================
// Sub-components
// =========================================================

function SectionHeader({ icon: Icon, title, noMargin = false }) {
    return (
        <div className={`flex items-center gap-2.5 ${noMargin ? '' : 'mb-4'}`}>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                <Icon size={13} className="text-[var(--accent-500)]" />
            </div>
            <h3 className="text-xs font-semibold text-[var(--text-secondary)]">
                {title}
            </h3>
        </div>
    );
}

function FieldLabel({ children }) {
    return (
        <label className="mb-2 block text-[11px] text-[var(--text-muted)]">
            {children}
        </label>
    );
}

function FieldError({ children }) {
    if (!children) return null;
    return (
        <p className="mt-1.5 text-[10px] text-rose-500 dark:text-rose-400">
            {children}
        </p>
    );
}

function SummaryStat({ label, value, suffix, accent = false }) {
    return (
        <div className="min-w-0">
            <p className="text-[10px] text-[var(--text-muted)]">{label}</p>
            <p
                className={`mt-1 truncate text-sm font-semibold number-font ${
                    accent
                        ? 'text-[var(--accent-600)] dark:text-[var(--accent-300)]'
                        : 'text-[var(--text-primary)]'
                }`}
            >
                {value}
                {suffix && (
                    <span className="ms-1 text-[9px] font-normal text-[var(--text-muted)]">
                        {suffix}
                    </span>
                )}
            </p>
        </div>
    );
}

export default ProductForm;