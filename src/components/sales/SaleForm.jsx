import { useEffect, useState } from 'react';
import {
  X,
  Package,
  Tag,
  Hash,
  DollarSign,
  User,
  Phone,
  Banknote,
  CreditCard,
  FileText,
  Calculator,
  Loader2,
  Plus,
  Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  getProducts,
  getCategories,
  addCategory,
} from '../../database/db';

import { addSale } from '../../services/salesService';

// =========================================================
// Helpers
// =========================================================

const toEnglishNumbers = (value) => {
  return String(value ?? '')
    .replace(/[۰-۹]/g, (digit) =>
      String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit))
    )
    .replace(/[٠-٩]/g, (digit) =>
      String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))
    );
};

const toNumber = (value) => {
  const normalized = toEnglishNumbers(value)
    .replace(/,/g, '')
    .replace(/٬/g, '')
    .replace(/[^\d.-]/g, '');

  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString('en-US');
};

// =========================================================
// Shared Field Classes (accent-aware)
// =========================================================

const FIELD_CLASS = `
  w-full h-11
  rounded-xl
  border border-[var(--input-border)]
  bg-[var(--input-bg)]
  text-sm
  text-[var(--text)]
  placeholder:text-[var(--text-soft)]
  outline-none
  transition-colors duration-200
  focus:border-[var(--input-border-focus)]
  focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
  disabled:opacity-50
`;

const TEXTAREA_CLASS = `
  w-full
  rounded-xl
  border border-[var(--input-border)]
  bg-[var(--input-bg)]
  p-4
  text-sm
  text-[var(--text)]
  placeholder:text-[var(--text-soft)]
  outline-none
  resize-none
  transition-colors duration-200
  focus:border-[var(--input-border-focus)]
  focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
  disabled:opacity-50
`;

// =========================================================
// Modal Panel Style (same look as .ui-modal, but WITHOUT
// overflow:hidden so the form can scroll internally)
// =========================================================

const MODAL_PANEL_STYLE = {
  background: `
    linear-gradient(
      135deg,
      var(--glass-active-tint),
      var(--glass-active-tint-soft) 70%,
      transparent 100%
    ),
    var(--glass-bg-strong)
  `,
  backdropFilter:
    'blur(var(--glass-blur-strong)) saturate(220%) brightness(1.12)',
  WebkitBackdropFilter:
    'blur(var(--glass-blur-strong)) saturate(220%) brightness(1.12)',
  boxShadow:
    'var(--shadow-xl), var(--glass-inner-shadow)',
};

// =========================================================
// Sale Form
// =========================================================

function SaleForm({ onClose, onSuccess }) {
  const { t, i18n } = useTranslation();

  const isEnglish = i18n.language === 'en';

  // =====================================================
  // Data
  // =====================================================

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // =====================================================
  // Category Creation
  // =====================================================

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  // =====================================================
  // Form
  // =====================================================

  const [productId, setProductId] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [note, setNote] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // =====================================================
  // Total
  // =====================================================

  const numericQuantity = toNumber(quantity);
  const numericUnitPrice = toNumber(unitPrice);
  const total = numericQuantity * numericUnitPrice;

  // =====================================================
  // Load Data
  // =====================================================

  const loadData = async () => {
    try {
      setLoadingData(true);
      setError('');

      const [productsResult, categoriesResult] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(
        Array.isArray(productsResult) ? productsResult : []
      );

      setCategories(
        Array.isArray(categoriesResult) ? categoriesResult : []
      );
    } catch (loadError) {
      console.error(
        'Failed to load sale form data:',
        loadError
      );

      setError(t('sales.form.errors.loadData'));
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleProductsUpdated = () => {
      loadData();
    };

    const handleCategoriesUpdated = () => {
      loadData();
    };

    window.addEventListener(
      'products-updated',
      handleProductsUpdated
    );

    window.addEventListener(
      'categories-updated',
      handleCategoriesUpdated
    );

    return () => {
      window.removeEventListener(
        'products-updated',
        handleProductsUpdated
      );

      window.removeEventListener(
        'categories-updated',
        handleCategoriesUpdated
      );
    };
  }, []);

  // =====================================================
  // Add New Category
  // =====================================================

  const handleAddCategory = async () => {
    const name = newCategoryName.trim();

    if (!name) {
      setCategoryError(
        t('sales.form.category.errors.required')
      );
      return;
    }

    const exists = categories.some(
      (item) =>
        item.name?.trim().toLowerCase() ===
        name.toLowerCase()
    );

    if (exists) {
      const existingCategory = categories.find(
        (item) =>
          item.name?.trim().toLowerCase() ===
          name.toLowerCase()
      );

      setCategory(existingCategory?.name || name);
      setNewCategoryName('');
      setShowNewCategory(false);
      setCategoryError('');

      return;
    }

    try {
      setAddingCategory(true);
      setCategoryError('');

      const createdCategory = await addCategory(name);
      const updatedCategories = await getCategories();

      const safeCategories = Array.isArray(updatedCategories)
        ? updatedCategories
        : [];

      setCategories(safeCategories);

      setCategory(createdCategory?.name || name);
      setNewCategoryName('');
      setShowNewCategory(false);

      window.dispatchEvent(
        new Event('categories-updated')
      );

      window.dispatchEvent(
        new Event('database-updated')
      );
    } catch (categoryCreateError) {
      console.error(
        'Failed to add category:',
        categoryCreateError
      );

      setCategoryError(
        categoryCreateError?.message ||
          t('sales.form.category.errors.create')
      );
    } finally {
      setAddingCategory(false);
    }
  };

  // =====================================================
  // Product Change
  // =====================================================

  const handleProductChange = (value) => {
    setProductId(value);

    const product = products.find(
      (item) =>
        String(item.id) === String(value)
    );

    if (!product) {
      setCategory('');
      setUnitPrice('');
      return;
    }

    setCategory(product.category || '');

    setUnitPrice(
      product.sellPrice !== undefined &&
        product.sellPrice !== null
        ? String(product.sellPrice)
        : ''
    );

    setError('');
  };

  // =====================================================
  // Quantity Change
  // =====================================================

  const handleQuantityChange = (value) => {
    const normalized = toEnglishNumbers(value).replace(
      /[^\d]/g,
      ''
    );

    setQuantity(normalized);
    setError('');
  };

  // =====================================================
  // Price Change
  // =====================================================

  const handleUnitPriceChange = (value) => {
    const normalized = toEnglishNumbers(value).replace(
      /[^\d]/g,
      ''
    );

    setUnitPrice(normalized);
    setError('');
  };

  // =====================================================
  // Payment Change
  // =====================================================

  const handlePaymentChange = (type) => {
    setPaymentType(type);
    setError('');
  };

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (saving) return;

    try {
      setSaving(true);
      setError('');

      // =================================================
      // Product
      // =================================================

      const product = products.find(
        (item) =>
          String(item.id) === String(productId)
      );

      if (!product) {
        throw new Error(
          t('sales.form.errors.productRequired')
        );
      }

      // =================================================
      // Category
      // =================================================

      const cleanCategory = category.trim();

      if (!cleanCategory) {
        throw new Error(
          t('sales.form.errors.categoryRequired')
        );
      }

      // =================================================
      // Quantity
      // =================================================

      const finalQuantity = toNumber(quantity);

      if (!finalQuantity || finalQuantity <= 0) {
        throw new Error(
          t('sales.form.errors.quantityInvalid')
        );
      }

      // =================================================
      // Unit Price
      // =================================================

      const finalUnitPrice = toNumber(unitPrice);

      if (unitPrice === '' || finalUnitPrice < 0) {
        throw new Error(
          t('sales.form.errors.priceInvalid')
        );
      }

      // =================================================
      // Customer
      // =================================================

      const cleanCustomerName = customerName.trim();

      const cleanCustomerPhone =
        toEnglishNumbers(
          customerPhone.trim()
        );

      const cleanNote = note.trim();

      if (
        paymentType === 'credit' &&
        !cleanCustomerName
      ) {
        throw new Error(
          t(
            'sales.form.errors.creditCustomerRequired'
          )
        );
      }

      // =================================================
      // Create Sale
      // =================================================

      const saleData = {
        productId: product.id,
        productName: product.name,
        category: cleanCategory,
        quantity: finalQuantity,
        unitPrice: finalUnitPrice,
        total: finalQuantity * finalUnitPrice,
        paymentType,
        customerName: cleanCustomerName,
        customerPhone: cleanCustomerPhone,
        note: cleanNote,
        date: new Date().toISOString(),
      };

      await addSale(saleData);

      // =================================================
      // Notify application
      // =================================================

      window.dispatchEvent(
        new Event('sales-updated')
      );

      window.dispatchEvent(
        new Event('products-updated')
      );

      window.dispatchEvent(
        new Event('database-updated')
      );

      if (paymentType === 'credit') {
        window.dispatchEvent(
          new Event('credit-sales-updated')
        );
      }

      // =================================================
      // Success
      // =================================================

      if (onSuccess) {
        await onSuccess();
      } else {
        onClose();
      }
    } catch (submitError) {
      console.error(
        'Failed to create sale:',
        submitError
      );

      setError(
        submitError?.message ||
          t('sales.form.errors.submit')
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // Render
  // =====================================================

  return (
    <div
      dir={isEnglish ? 'ltr' : 'rtl'}
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        p-2 sm:p-4
        backdrop-blur-md
      "
      style={{
        background: `
          radial-gradient(
            circle at 50% 50%,
            rgba(0, 0, 0, 0.55),
            rgba(0, 0, 0, 0.72)
          )
        `,
      }}
    >
      {/* =================================================
          Modal Panel
          Flex column, overflow-hidden to clip rounded corners.
          Header is a fixed child, form is the scrollable child.
      ================================================== */}

      <div
        className="
          relative
          flex flex-col
          w-full
          max-w-2xl
          max-h-[calc(100vh-1rem)]
          sm:max-h-[90vh]
          overflow-hidden
          rounded-2xl
          border border-[var(--glass-border)]
        "
        style={MODAL_PANEL_STYLE}
      >

        {/* =================================================
            Header (fixed, never scrolls)
        ================================================== */}

        <div
          className="
            flex-shrink-0
            flex items-center justify-between
            gap-3
            px-4 sm:px-6
            py-4 sm:py-5
            border-b border-[var(--border-subtle)]
          "
          style={{
            background: `
              linear-gradient(
                135deg,
                var(--glass-active-tint),
                var(--glass-active-tint-soft) 70%,
                transparent 100%
              ),
              rgba(0, 0, 0, 0)
            `,
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex h-10 w-10 shrink-0
                sm:h-11 sm:w-11
                items-center justify-center
                rounded-xl
                border border-[var(--accent-border)]
                bg-[var(--accent-soft)]
              "
            >
              <Package
                size={19}
                className="
                  text-[var(--accent-500)]
                "
              />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  text-base sm:text-lg
                  font-bold
                  text-[var(--text)]
                "
              >
                {t('sales.form.title')}
              </h2>

              <p
                className="
                  mt-1
                  text-[11px] sm:text-xs
                  text-[var(--text-muted)]
                "
              >
                {t('sales.form.subtitle')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label={t('common.closeMenu')}
            className="
              ui-icon-button
              h-9 w-9
              rounded-lg
            "
          >
            <X size={19} />
          </button>
        </div>

        {/* =================================================
            Form (scrollable body)
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="
            flex-1
            min-h-0
            overflow-y-auto
            main-scrollbar
            space-y-5 sm:space-y-6
            p-4 sm:p-6
          "
        >
          {error && (
            <div
              className="
                rounded-xl
                border border-red-500/25
                bg-red-500/10
                px-4 py-3
                text-sm
                text-red-500
                dark:text-red-400
              "
            >
              {error}
            </div>
          )}

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Package
                size={16}
                className="
                  text-[var(--accent-500)]
                "
              />

              <h3
                className="
                  text-sm font-semibold
                  text-[var(--text)]
                "
              >
                {t('sales.form.productSection.title')}
              </h3>
            </div>

            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2
                  size={22}
                  className="
                    animate-spin
                    text-[var(--accent-500)]
                  "
                />
              </div>
            ) : (
              <div
                className="
                  grid grid-cols-1
                  md:grid-cols-2
                  gap-4
                "
              >
                <div className="min-w-0">
                  <label
                    className="
                      mb-2 block
                      text-xs
                      text-[var(--text-muted)]
                    "
                  >
                    {t('sales.form.fields.product')}
                  </label>

                  <div className="relative">
                    <Package
                      size={16}
                      className={`
                        pointer-events-none
                        absolute
                        ${isEnglish ? 'left-3' : 'right-3'}
                        top-1/2
                        -translate-y-1/2
                        text-[var(--text-soft)]
                      `}
                    />

                    <select
                      value={productId}
                      onChange={(event) =>
                        handleProductChange(
                          event.target.value
                        )
                      }
                      disabled={saving}
                      className={`
                        ${FIELD_CLASS}
                        ${
                          isEnglish
                            ? 'pl-10 pr-4'
                            : 'pr-10 pl-4'
                        }
                      `}
                    >
                      <option value="">
                        {t(
                          'sales.form.fields.productPlaceholder'
                        )}
                      </option>

                      {products.map((product) => (
                        <option
                          key={product.id}
                          value={product.id}
                        >
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      className="
                        text-xs
                        text-[var(--text-muted)]
                      "
                    >
                      {t('sales.form.fields.category')}
                    </label>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setShowNewCategory(
                          !showNewCategory
                        );
                        setCategoryError('');
                      }}
                      className="
                        flex shrink-0
                        items-center gap-1
                        text-[11px]
                        text-[var(--accent-500)]
                        hover:text-[var(--accent-400)]
                        disabled:opacity-50
                        transition
                      "
                    >
                      <Plus size={13} />
                      {t('sales.form.category.new')}
                    </button>
                  </div>

                  <div className="relative">
                    <Tag
                      size={16}
                      className={`
                        pointer-events-none
                        absolute
                        ${isEnglish ? 'left-3' : 'right-3'}
                        top-1/2
                        -translate-y-1/2
                        text-[var(--text-soft)]
                      `}
                    />

                    <select
                      value={category}
                      onChange={(event) =>
                        setCategory(
                          event.target.value
                        )
                      }
                      disabled={saving}
                      className={`
                        ${FIELD_CLASS}
                        ${
                          isEnglish
                            ? 'pl-10 pr-4'
                            : 'pr-10 pl-4'
                        }
                      `}
                    >
                      <option value="">
                        {t(
                          'sales.form.fields.categoryPlaceholder'
                        )}
                      </option>

                      {categories.map((item) => (
                        <option
                          key={item.id}
                          value={item.name}
                        >
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showNewCategory && (
                    <div
                      className="
                        mt-3
                        rounded-xl
                        border border-[var(--accent-border)]
                        bg-[var(--accent-soft)]
                        p-3
                      "
                    >
                      <div className="flex flex-col min-[420px]:flex-row gap-2">
                        <input
                          autoFocus
                          type="text"
                          value={newCategoryName}
                          onChange={(event) =>
                            setNewCategoryName(
                              event.target.value
                            )
                          }
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                              event.preventDefault();
                              handleAddCategory();
                            }
                          }}
                          placeholder={t(
                            'sales.form.category.placeholder'
                          )}
                          disabled={addingCategory}
                          className="
                            min-w-0 flex-1
                            h-10
                            rounded-lg
                            border border-[var(--input-border)]
                            bg-[var(--input-bg-focus)]
                            px-3
                            text-sm
                            text-[var(--text)]
                            placeholder:text-[var(--text-soft)]
                            outline-none
                            focus:border-[var(--input-border-focus)]
                          "
                        />

                        <button
                          type="button"
                          onClick={handleAddCategory}
                          disabled={addingCategory}
                          className="
                            ui-button-primary
                            h-10
                            px-4
                            text-sm
                          "
                        >
                          {addingCategory ? (
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                          ) : (
                            <Check size={15} />
                          )}

                          {t(
                            'sales.form.category.add'
                          )}
                        </button>
                      </div>

                      {categoryError && (
                        <p
                          className="
                            mt-2
                            text-xs
                            text-red-500
                            dark:text-red-400
                          "
                        >
                          {categoryError}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <label
                    className="
                      mb-2 block
                      text-xs
                      text-[var(--text-muted)]
                    "
                  >
                    {t('sales.form.fields.quantity')}
                  </label>

                  <div className="relative">
                    <Hash
                      size={16}
                      className={`
                        pointer-events-none
                        absolute
                        ${isEnglish ? 'left-3' : 'right-3'}
                        top-1/2
                        -translate-y-1/2
                        text-[var(--text-soft)]
                      `}
                    />

                    <input
                      type="text"
                      inputMode="numeric"
                      value={quantity}
                      onChange={(event) =>
                        handleQuantityChange(
                          event.target.value
                        )
                      }
                      disabled={saving}
                      className={`
                        ${FIELD_CLASS}
                        ${
                          isEnglish
                            ? 'pl-10 pr-4'
                            : 'pr-10 pl-4'
                        }
                      `}
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label
                    className="
                      mb-2 block
                      text-xs
                      text-[var(--text-muted)]
                    "
                  >
                    {t(
                      'sales.form.fields.unitPrice'
                    )}
                  </label>

                  <div className="relative">
                    <DollarSign
                      size={16}
                      className={`
                        pointer-events-none
                        absolute
                        ${isEnglish ? 'left-3' : 'right-3'}
                        top-1/2
                        -translate-y-1/2
                        text-[var(--text-soft)]
                      `}
                    />

                    <input
                      type="text"
                      inputMode="numeric"
                      value={unitPrice}
                      onChange={(event) =>
                        handleUnitPriceChange(
                          event.target.value
                        )
                      }
                      disabled={saving}
                      className={`
                        ${FIELD_CLASS}
                        ${
                          isEnglish
                            ? 'pl-10 pr-14'
                            : 'pr-10 pl-14'
                        }
                      `}
                    />

                    <span
                      className={`
                        pointer-events-none
                        absolute
                        ${isEnglish ? 'right-3' : 'left-3'}
                        top-1/2
                        -translate-y-1/2
                        text-xs
                        text-[var(--text-soft)]
                      `}
                    >
                      {t('common.currency')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* =================================================
              Total
          ================================================= */}

          <section
            className="
              relative
              overflow-hidden
              rounded-2xl
              border border-[var(--accent-border)]
              p-4 sm:p-5
            "
            style={{
              background: `
                linear-gradient(
                  135deg,
                  var(--accent-soft-strong),
                  var(--accent-soft) 70%,
                  transparent 100%
                ),
                var(--surface)
              `,
            }}
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                -right-8
                -top-8
                h-24
                w-24
                rounded-full
                bg-[var(--accent-soft-heavy)]
                blur-2xl
              "
            />

            <div
              className="
                relative
                flex
                flex-col
                min-[420px]:flex-row
                min-[420px]:items-center
                min-[420px]:justify-between
                gap-4
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-10 w-10
                    shrink-0
                    items-center justify-center
                    rounded-xl
                    border border-[var(--accent-border)]
                    bg-[var(--accent-soft)]
                  "
                >
                  <Calculator
                    size={18}
                    className="
                      text-[var(--accent-500)]
                    "
                  />
                </div>

                <div>
                  <p
                    className="
                      text-xs
                      text-[var(--text-secondary)]
                    "
                  >
                    {t(
                      'sales.form.total.title'
                    )}
                  </p>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      text-[var(--text-muted)]
                    "
                  >
                    {t(
                      'sales.form.total.description'
                    )}
                  </p>
                </div>
              </div>

              <div
                className={`
                  ${isEnglish ? 'text-left' : 'text-right'}
                  min-[420px]:shrink-0
                `}
              >
                <p
                  className="
                    text-2xl
                    font-bold
                    text-[var(--accent-500)]
                  "
                  dir="ltr"
                >
                  {formatNumber(total)}
                </p>

                <span
                  className="
                    text-xs
                    text-[var(--text-muted)]
                  "
                >
                  {t('common.currency')}
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              Payment
          ================================================= */}

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Banknote
                size={16}
                className="
                  text-[var(--accent-500)]
                "
              />

              <h3
                className="
                  text-sm font-semibold
                  text-[var(--text)]
                "
              >
                {t('sales.form.payment.title')}
              </h3>
            </div>

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-3
              "
            >
              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentType === 'cash'}
                  onChange={() =>
                    handlePaymentChange('cash')
                  }
                  className="peer sr-only"
                />

                <div
                  className="
                    rounded-xl
                    border border-[var(--input-border)]
                    bg-[var(--input-bg)]
                    p-4
                    transition
                    peer-checked:border-[var(--accent-border-hover)]
                  "
                  style={{
                    transition:
                      'border-color 220ms var(--ease-out), background 220ms var(--ease-out)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Banknote
                      size={20}
                      className="
                        text-[var(--accent-500)]
                      "
                    />

                    <div>
                      <p
                        className="
                          text-sm font-medium
                          text-[var(--text)]
                        "
                      >
                        {t(
                          'sales.paymentTypes.cash'
                        )}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[11px]
                          text-[var(--text-muted)]
                        "
                      >
                        {t(
                          'sales.form.payment.cashDescription'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </label>

              <label className="cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="credit"
                  checked={paymentType === 'credit'}
                  onChange={() =>
                    handlePaymentChange('credit')
                  }
                  className="peer sr-only"
                />

                <div
                  className="
                    rounded-xl
                    border border-[var(--input-border)]
                    bg-[var(--input-bg)]
                    p-4
                    transition
                    peer-checked:border-[var(--accent-border-hover)]
                  "
                  style={{
                    transition:
                      'border-color 220ms var(--ease-out), background 220ms var(--ease-out)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard
                      size={20}
                      className="
                        text-[var(--accent-500)]
                      "
                    />

                    <div>
                      <p
                        className="
                          text-sm font-medium
                          text-[var(--text)]
                        "
                      >
                        {t(
                          'sales.paymentTypes.credit'
                        )}
                      </p>

                      <p
                        className="
                          mt-1
                          text-[11px]
                          text-[var(--text-muted)]
                        "
                      >
                        {t(
                          'sales.form.payment.creditDescription'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* =================================================
              Customer
          ================================================= */}

          <section>
            <div className="mb-4 flex items-center gap-2">
              <User
                size={16}
                className="
                  text-[var(--accent-500)]
                "
              />

              <h3
                className="
                  text-sm font-semibold
                  text-[var(--text)]
                "
              >
                {t(
                  'sales.form.customer.title'
                )}
              </h3>
            </div>

            <div
              className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
              "
            >
              <input
                type="text"
                value={customerName}
                onChange={(event) =>
                  setCustomerName(
                    event.target.value
                  )
                }
                placeholder={
                  paymentType === 'credit'
                    ? t(
                        'sales.form.customer.nameRequired'
                      )
                    : t(
                        'sales.form.customer.name'
                      )
                }
                disabled={saving}
                className={`
                  ${FIELD_CLASS}
                  px-4
                `}
              />

              <div className="relative">
                <Phone
                  size={16}
                  className={`
                    pointer-events-none
                    absolute
                    ${isEnglish ? 'left-3' : 'right-3'}
                    top-1/2
                    -translate-y-1/2
                    text-[var(--text-soft)]
                  `}
                />

                <input
                  type="tel"
                  dir="ltr"
                  value={customerPhone}
                  onChange={(event) =>
                    setCustomerPhone(
                      toEnglishNumbers(
                        event.target.value
                      )
                    )
                  }
                  placeholder={t(
                    'sales.form.customer.phone'
                  )}
                  disabled={saving}
                  className={`
                    ${FIELD_CLASS}
                    ${
                      isEnglish
                        ? 'pl-10 pr-4'
                        : 'pr-10 pl-4'
                    }
                  `}
                />
              </div>
            </div>
          </section>

          {/* =================================================
              Note
          ================================================= */}

          <section>
            <div className="mb-4 flex items-center gap-2">
              <FileText
                size={16}
                className="
                  text-[var(--accent-500)]
                "
              />

              <h3
                className="
                  text-sm font-semibold
                  text-[var(--text)]
                "
              >
                {t(
                  'sales.form.note.title'
                )}
              </h3>
            </div>

            <textarea
              rows="3"
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder={t(
                'sales.form.note.placeholder'
              )}
              disabled={saving}
              className={TEXTAREA_CLASS}
            />
          </section>

          {/* =================================================
              Actions
          ================================================= */}

          <div
            className="
              flex
              flex-col-reverse
              sm:flex-row
              sm:justify-end
              gap-3
              pt-1
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                ui-button-secondary
                h-11
                w-full sm:w-auto
                px-5
                text-sm
              "
            >
              {t(
                'sales.form.actions.cancel'
              )}
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loadingData ||
                !productId
              }
              className="
                ui-button-primary
                h-11
                w-full sm:w-auto
                px-6
                text-sm
              "
            >
              {saving && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {saving
                ? t(
                    'sales.form.actions.saving'
                  )
                : t(
                    'sales.form.actions.submit'
                  )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SaleForm;