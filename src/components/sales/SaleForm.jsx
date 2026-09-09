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
        bg-slate-200/80 dark:bg-slate-950/80
        backdrop-blur-sm
      "
    >
      <div
        className="
          relative
          w-full
          max-w-2xl
          max-h-[calc(100vh-1rem)]
          sm:max-h-[90vh]
          overflow-y-auto
          rounded-2xl
          border border-slate-200
          dark:border-slate-800
          bg-white dark:bg-slate-900
          shadow-2xl
          shadow-slate-900/10
          dark:shadow-black/50
        "
      >
        <div
          className="
            sticky top-0 z-10
            flex items-center justify-between
            gap-3
            px-4 sm:px-6
            py-4 sm:py-5
            border-b border-slate-200
            dark:border-slate-800
            bg-white/95 dark:bg-slate-900/95
            backdrop-blur
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex h-10 w-10 shrink-0
                sm:h-11 sm:w-11
                items-center justify-center
                rounded-xl
                bg-emerald-500/10
                border border-emerald-500/10
              "
            >
              <Package
                size={19}
                className="
                  text-emerald-600
                  dark:text-emerald-400
                "
              />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  text-base sm:text-lg
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                {t('sales.form.title')}
              </h2>

              <p
                className="
                  mt-1
                  text-[11px] sm:text-xs
                  text-slate-500
                  dark:text-slate-500
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
              flex h-9 w-9 shrink-0
              items-center justify-center
              rounded-lg
              text-slate-500
              hover:text-slate-900
              dark:hover:text-white
              hover:bg-slate-100
              dark:hover:bg-slate-800
              disabled:opacity-50
              transition
            "
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6 p-4 sm:p-6"
        >
          {error && (
            <div
              className="
                rounded-xl
                border border-red-200
                dark:border-red-500/20
                bg-red-50
                dark:bg-red-500/5
                px-4 py-3
                text-sm
                text-red-600
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
                  text-emerald-600
                  dark:text-emerald-400
                "
              />

              <h3
                className="
                  text-sm font-semibold
                  text-slate-900
                  dark:text-white
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
                    text-emerald-600
                    dark:text-emerald-400
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
                      text-slate-500
                      dark:text-slate-400
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
                        text-slate-400
                        dark:text-slate-600
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
                        w-full h-11
                        rounded-xl
                        border
                        border-slate-200
                        dark:border-slate-800
                        bg-slate-50
                        dark:bg-slate-950/60
                        ${
                          isEnglish
                            ? 'pl-10 pr-4'
                            : 'pr-10 pl-4'
                        }
                        text-sm
                        text-slate-800
                        dark:text-slate-300
                        outline-none
                        focus:border-emerald-500/50
                        disabled:opacity-50
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
                        text-slate-500
                        dark:text-slate-400
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
                        text-emerald-600
                        dark:text-emerald-400
                        hover:text-emerald-500
                        dark:hover:text-emerald-300
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
                        text-slate-400
                        dark:text-slate-600
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
                        w-full h-11
                        rounded-xl
                        border
                        border-slate-200
                        dark:border-slate-800
                        bg-slate-50
                        dark:bg-slate-950/60
                        ${
                          isEnglish
                            ? 'pl-10 pr-4'
                            : 'pr-10 pl-4'
                        }
                        text-sm
                        text-slate-800
                        dark:text-slate-300
                        outline-none
                        focus:border-emerald-500/50
                        disabled:opacity-50
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
                        border border-emerald-500/20
                        bg-emerald-500/5
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
                            border
                            border-slate-200
                            dark:border-slate-800
                            bg-white
                            dark:bg-slate-950/60
                            px-3
                            text-sm
                            text-slate-900
                            dark:text-white
                            placeholder:text-slate-400
                            dark:placeholder:text-slate-600
                            outline-none
                            focus:border-emerald-500/50
                          "
                        />

                        <button
                          type="button"
                          onClick={handleAddCategory}
                          disabled={addingCategory}
                          className="
                            h-10
                            px-4
                            rounded-lg
                            bg-emerald-500
                            hover:bg-emerald-400
                            disabled:opacity-50
                            text-slate-950
                            text-sm font-semibold
                            flex items-center
                            justify-center
                            gap-2
                            transition
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
                      text-slate-500
                      dark:text-slate-400
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
                        text-slate-400
                        dark:text-slate-600
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
                        w-full h-11
                        rounded-xl
                        border
                        border-slate-200
                        dark:border-slate-800
                        bg-slate-50
                        dark:bg-slate-950/60
                        ${
                          isEnglish
                            ? 'pl-10 pr-4'
                            : 'pr-10 pl-4'
                        }
                        text-sm
                        text-slate-900
                        dark:text-white
                        outline-none
                        focus:border-emerald-500/50
                      `}
                    />
                  </div>
                </div>

                <div className="min-w-0">
                  <label
                    className="
                      mb-2 block
                      text-xs
                      text-slate-500
                      dark:text-slate-400
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
                        text-slate-400
                        dark:text-slate-600
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
                        w-full h-11
                        rounded-xl
                        border
                        border-slate-200
                        dark:border-slate-800
                        bg-slate-50
                        dark:bg-slate-950/60
                        ${
                          isEnglish
                            ? 'pl-10 pr-14'
                            : 'pr-10 pl-14'
                        }
                        text-sm
                        text-slate-900
                        dark:text-white
                        outline-none
                        focus:border-emerald-500/50
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
                        text-slate-400
                        dark:text-slate-600
                      `}
                    >
                      {t('common.currency')}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>

          <section
            className="
              rounded-2xl
              border border-emerald-500/10
              bg-emerald-500/5
              p-4 sm:p-5
            "
          >
            <div
              className="
                flex
                flex-col
                min-[420px]:flex-row
                min-[420px]:items-center
                min-[420px]:justify-between
                gap-4
              "
            >
              <div className="flex items-center gap-3">
                <Calculator
                  size={20}
                  className="
                    text-emerald-600
                    dark:text-emerald-400
                  "
                />

                <div>
                  <p
                    className="
                      text-xs
                      text-slate-600
                      dark:text-slate-500
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
                      text-slate-500
                      dark:text-slate-600
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
                    text-emerald-600
                    dark:text-emerald-400
                  "
                  dir="ltr"
                >
                  {formatNumber(total)}
                </p>

                <span
                  className="
                    text-xs
                    text-slate-500
                    dark:text-slate-500
                  "
                >
                  {t('common.currency')}
                </span>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <Banknote
                size={16}
                className="
                  text-cyan-600
                  dark:text-cyan-400
                "
              />

              <h3
                className="
                  text-sm font-semibold
                  text-slate-900
                  dark:text-white
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
                    border border-slate-200
                    dark:border-slate-800
                    bg-slate-50
                    dark:bg-slate-950/40
                    p-4
                    transition
                    peer-checked:border-cyan-500/40
                    peer-checked:bg-cyan-500/5
                  "
                >
                  <div className="flex items-center gap-3">
                    <Banknote
                      size={20}
                      className="
                        text-cyan-600
                        dark:text-cyan-400
                      "
                    />

                    <div>
                      <p
                        className="
                          text-sm font-medium
                          text-slate-900
                          dark:text-white
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
                          text-slate-500
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
                    border border-slate-200
                    dark:border-slate-800
                    bg-slate-50
                    dark:bg-slate-950/40
                    p-4
                    transition
                    peer-checked:border-amber-500/40
                    peer-checked:bg-amber-500/5
                  "
                >
                  <div className="flex items-center gap-3">
                    <CreditCard
                      size={20}
                      className="
                        text-amber-600
                        dark:text-amber-400
                      "
                    />

                    <div>
                      <p
                        className="
                          text-sm font-medium
                          text-slate-900
                          dark:text-white
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
                          text-slate-500
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

          <section>
            <div className="mb-4 flex items-center gap-2">
              <User
                size={16}
                className="
                  text-amber-600
                  dark:text-amber-400
                "
              />

              <h3
                className="
                  text-sm font-semibold
                  text-slate-900
                  dark:text-white
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
                className="
                  w-full h-11
                  rounded-xl
                  border border-slate-200
                  dark:border-slate-800
                  bg-slate-50
                  dark:bg-slate-950/60
                  px-4
                  text-sm
                  text-slate-900
                  dark:text-white
                  placeholder:text-slate-400
                  dark:placeholder:text-slate-600
                  outline-none
                  focus:border-emerald-500/50
                  disabled:opacity-50
                "
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
                    text-slate-400
                    dark:text-slate-600
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
                    w-full h-11
                    rounded-xl
                    border border-slate-200
                    dark:border-slate-800
                    bg-slate-50
                    dark:bg-slate-950/60
                    ${
                      isEnglish
                        ? 'pl-10 pr-4'
                        : 'pr-10 pl-4'
                    }
                    text-sm
                    text-slate-900
                    dark:text-white
                    placeholder:text-slate-400
                    dark:placeholder:text-slate-600
                    outline-none
                    focus:border-emerald-500/50
                    disabled:opacity-50
                  `}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <FileText
                size={16}
                className="
                  text-slate-500
                  dark:text-slate-400
                "
              />

              <h3
                className="
                  text-sm font-semibold
                  text-slate-900
                  dark:text-white
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
              className="
                w-full
                rounded-xl
                border border-slate-200
                dark:border-slate-800
                bg-slate-50
                dark:bg-slate-950/60
                p-4
                text-sm
                text-slate-900
                dark:text-white
                placeholder:text-slate-400
                dark:placeholder:text-slate-600
                outline-none
                resize-none
                focus:border-emerald-500/50
                disabled:opacity-50
              "
            />
          </section>

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
                h-11
                w-full sm:w-auto
                px-5
                rounded-xl
                border border-slate-200
                dark:border-slate-800
                text-sm
                text-slate-600
                dark:text-slate-400
                hover:text-slate-900
                dark:hover:text-white
                hover:bg-slate-100
                dark:hover:bg-slate-800
                disabled:opacity-50
                transition
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
                h-11
                w-full sm:w-auto
                px-6
                rounded-xl
                bg-emerald-500
                hover:bg-emerald-400
                disabled:opacity-50
                disabled:cursor-not-allowed
                text-slate-950
                text-sm
                font-semibold
                transition
                flex items-center
                justify-center
                gap-2
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