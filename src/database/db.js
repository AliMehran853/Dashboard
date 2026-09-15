import Dexie from 'dexie';

// =========================================================
// Database
// =========================================================

export const db = new Dexie('ShopDashboardDB');

// =========================================================
// Version 1 → 4 (migration chain — DO NOT REMOVE)
// =========================================================

db.version(1).stores({
    products: '++id, name, category, stock, minStock, createdAt, updatedAt',
    categories: '++id, &name, createdAt',
    sales: '++id, productId, category, paymentType, customerId, date, createdAt',
    creditSales: '++id, saleId, customerId, status, dueDate, createdAt',
    customers: '++id, name, phone, createdAt',
    expenses: '++id, category, date, createdAt',
});

db.version(2).stores({
    products: '++id, name, category, stock, minStock, createdAt, updatedAt',
    categories: '++id, &name, createdAt',
    sales: '++id, productId, category, paymentType, customerId, date, createdAt',
    creditSales: '++id, saleId, customerId, status, dueDate, createdAt',
    customers: '++id, name, phone, createdAt',
    expenses: '++id, category, date, createdAt',
    shoppingList: '++id, name, category, completed, priority, createdAt, updatedAt',
});

db.version(3).stores({
    products: '++id, name, category, stock, minStock, createdAt, updatedAt',
    categories: '++id, &name, createdAt',
    sales: '++id, productId, category, paymentType, customerId, date, createdAt',
    creditSales: '++id, saleId, customerId, status, dueDate, createdAt',
    customers: '++id, name, phone, createdAt',
    expenses: '++id, category, date, createdAt',
    shoppingList: '++id, name, category, completed, priority, createdAt, updatedAt',
});

db.version(4).stores({
    products: '++id, name, category, stock, minStock, createdAt, updatedAt',
    categories: '++id, &name, createdAt',
    sales: '++id, productId, category, paymentType, customerId, date, createdAt',
    creditSales: '++id, saleId, customerId, status, dueDate, createdAt',
    customers: '++id, name, phone, createdAt',
    expenses: '++id, category, date, createdAt',
    shoppingList: '++id, name, category, completed, priority, createdAt, updatedAt',
    creditPayments: '++id, customerId, date, createdAt',
});

// =========================================================
// Version 5 — Multi-unit architecture (base)
//   products: baseUnit, avgCost, totalValue, saleOptions
//   units:    new table for units management
//   purchases: history of every purchase
// =========================================================

db.version(5).stores({
    products: '++id, name, category, baseUnit, stock, minStock, createdAt, updatedAt',
    categories: '++id, &name, createdAt',
    units: '++id, &name, category, createdAt',
    purchases: '++id, productId, date, createdAt',
    sales: '++id, productId, category, paymentType, customerId, date, createdAt',
    creditSales: '++id, saleId, customerId, status, dueDate, createdAt',
    customers: '++id, name, phone, createdAt',
    expenses: '++id, category, date, createdAt',
    shoppingList: '++id, name, category, completed, priority, createdAt, updatedAt',
    creditPayments: '++id, customerId, date, createdAt',
}).upgrade(async (tx) => {
    const products = await tx.table('products').toArray();

    for (const product of products) {
        const oldUnit = product.unit || 'عدد';
        const buyPrice = Number(product.buyPrice) || 0;
        const sellPrice = Number(product.sellPrice) || 0;
        const stock = Number(product.stock) || 0;

        const saleOptions = sellPrice > 0
            ? [{
                id: `opt_${product.id}_${Date.now()}`,
                unit: oldUnit,
                factor: 1,
                price: sellPrice,
            }]
            : [];

        await tx.table('products').update(product.id, {
            baseUnit: oldUnit,
            avgCost: buyPrice,
            totalValue: stock * buyPrice,
            saleOptions,
        });

        if (stock > 0) {
            await tx.table('purchases').add({
                productId: product.id,
                quantity: stock,
                unit: oldUnit,
                factor: 1,
                pricePerUnit: buyPrice,
                totalPaid: stock * buyPrice,
                receivedInBase: stock,
                costPerBase: buyPrice,
                date: product.createdAt || new Date().toISOString(),
                createdAt: product.createdAt || new Date().toISOString(),
                isMigrated: true,
            });
        }
    }
});

// =========================================================
// Version 6 — Full multi-unit commerce
//   products gains:
//     purchaseOptions: templates for how user buys (per unit)
//     conversions:     cross-physical conversions (kg ↔ m²)
//   saleOptions items gain:
//     minPrice, suggestedPrice, targetMargin, isDefault
// =========================================================

db.version(6).stores({
    products: '++id, name, category, baseUnit, stock, minStock, createdAt, updatedAt',
    categories: '++id, &name, createdAt',
    units: '++id, &name, category, createdAt',
    purchases: '++id, productId, date, createdAt',
    sales: '++id, productId, category, paymentType, customerId, date, createdAt',
    creditSales: '++id, saleId, customerId, status, dueDate, createdAt',
    customers: '++id, name, phone, createdAt',
    expenses: '++id, category, date, createdAt',
    shoppingList: '++id, name, category, completed, priority, createdAt, updatedAt',
    creditPayments: '++id, customerId, date, createdAt',
}).upgrade(async (tx) => {
    const products = await tx.table('products').toArray();

    for (const product of products) {
        const avgCost = Number(product.avgCost) || 0;

        const enhancedSaleOptions = Array.isArray(product.saleOptions)
            ? product.saleOptions.map((opt, idx) => {
                const factor = Number(opt.factor) || 1;
                const price = Number(opt.price) || 0;
                const costForUnit = avgCost * factor;
                return {
                    id: opt.id || `opt_${product.id}_${idx}`,
                    unit: String(opt.unit || product.baseUnit || ''),
                    factor,
                    price,
                    targetMargin: Number.isFinite(opt.targetMargin) ? opt.targetMargin : 25,
                    minPrice: costForUnit,
                    suggestedPrice: costForUnit * 1.25,
                    isDefault: opt.isDefault ?? (idx === 0),
                };
            })
            : [];

        // Build purchaseOptions from existing purchases
        const purchases = await tx.table('purchases')
            .where('productId').equals(product.id).toArray();

        const byUnit = new Map();
        for (const p of purchases) {
            const key = String(p.unit || product.baseUnit || '').trim();
            if (!key) continue;
            const existing = byUnit.get(key);
            const pDate = p.date || p.createdAt || '';
            if (!existing || new Date(pDate) > new Date(existing.lastDate || 0)) {
                byUnit.set(key, {
                    id: `po_${product.id}_${key}`,
                    unit: key,
                    factor: Number(p.factor) || 1,
                    lastPrice: Number(p.pricePerUnit) || 0,
                    lastDate: pDate,
                    note: '',
                });
            }
        }

        await tx.table('products').update(product.id, {
            purchaseOptions: Array.from(byUnit.values()),
            conversions: [],
            saleOptions: enhancedSaleOptions,
        });
    }
});

// =========================================================
// Constants
// =========================================================

export const defaultUnits = [
    'عدد', 'دانه', 'بوتل',
    'بسته', 'کارتن', 'بوجی', 'پلاستیک',
    'کیلوگرم', 'گرم', 'سیر',
    'لیتر', 'متر', 'متر مربع',
];

export const UNIT_CATEGORIES = [
    { value: 'count',   labelFa: 'تعداد', labelEn: 'Count' },
    { value: 'weight',  labelFa: 'وزن',   labelEn: 'Weight' },
    { value: 'volume',  labelFa: 'حجم',   labelEn: 'Volume' },
    { value: 'length',  labelFa: 'طول',   labelEn: 'Length' },
    { value: 'area',    labelFa: 'سطح',   labelEn: 'Area' },
    { value: 'package', labelFa: 'بسته',  labelEn: 'Package' },
];

const SEED_UNITS = [
    { name: 'عدد',      category: 'count' },
    { name: 'دانه',     category: 'count' },
    { name: 'بوتل',     category: 'count' },
    { name: 'بسته',     category: 'package' },
    { name: 'کارتن',    category: 'package' },
    { name: 'بوجی',     category: 'package' },
    { name: 'پلاستیک',  category: 'package' },
    { name: 'کیلوگرم',  category: 'weight' },
    { name: 'گرم',      category: 'weight' },
    { name: 'سیر',      category: 'weight' },
    { name: 'لیتر',     category: 'volume' },
    { name: 'متر',      category: 'length' },
    { name: 'متر مربع', category: 'area' },
];

// =========================================================
// Init
// =========================================================

export const initializeDatabase = async () => {
    if (!db.isOpen()) await db.open();

    try {
        const count = await db.units.count();
        if (count === 0) {
            const now = new Date().toISOString();
            await db.units.bulkAdd(SEED_UNITS.map((u) => ({ ...u, createdAt: now })));
        }
    } catch (err) {
        console.warn('Failed to seed units:', err);
    }

    return db;
};

// =========================================================
// Utilities
// =========================================================

const normalizeId = (value) => {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
};

const dispatchEventSafe = (eventName) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event(eventName));
};

const dispatchDatabaseEvents = () => {
    [
        'products-updated', 'categories-updated', 'units-updated',
        'purchases-updated', 'sales-updated', 'credit-sales-updated',
        'credit-payments-updated', 'customers-updated', 'expenses-updated',
        'shopping-list-updated', 'database-updated',
    ].forEach(dispatchEventSafe);
};

const nowIso = () => new Date().toISOString();

// =========================================================
// Sale-Option Math (shared with UI)
// =========================================================

/**
 * Normalize a raw sale-option from a form/DB into a consistent shape.
 * Auto-computes minPrice & suggestedPrice from avgCost + targetMargin.
 */
export const normalizeSaleOption = (opt, avgCost = 0, index = 0) => {
    const factor = Math.max(Number(opt?.factor) || 1, 0.0001);
    const price = Math.max(Number(opt?.price) || 0, 0);
    const targetMargin = Number.isFinite(Number(opt?.targetMargin))
        ? Number(opt.targetMargin)
        : 25;

    const costForUnit = avgCost * factor;

    return {
        id: opt?.id || `opt_${Date.now()}_${index}`,
        unit: String(opt?.unit ?? '').trim(),
        factor,
        price,
        targetMargin,
        minPrice: costForUnit,
        suggestedPrice: costForUnit * (1 + targetMargin / 100),
        isDefault: Boolean(opt?.isDefault),
    };
};

/**
 * Compute cost + profit + margin for a sale option against avgCost.
 */
export const computeSaleOptionMetrics = (option, avgCost) => {
    const factor = Number(option?.factor) || 1;
    const price = Number(option?.price) || 0;
    const costForUnit = (Number(avgCost) || 0) * factor;
    const profit = price - costForUnit;
    const margin = price > 0 ? (profit / price) * 100 : 0;

    return {
        costForUnit,
        profit,
        margin,
        isLoss: profit < 0,
        isBreakEven: profit === 0,
        isThin: profit > 0 && margin < 10,
    };
};

// =========================================================
// Units
// =========================================================

export const addUnit = async (name, category = 'count') => {
    await initializeDatabase();
    const cleanName = String(name ?? '').trim();
    if (!cleanName) throw new Error('نام واحد الزامی است.');

    const existing = await db.units.where('name').equalsIgnoreCase(cleanName).first();
    if (existing) return existing;

    const unit = { name: cleanName, category: category || 'count', createdAt: nowIso() };
    const id = await db.units.add(unit);

    dispatchEventSafe('units-updated');
    dispatchEventSafe('database-updated');
    return { id, ...unit };
};

export const getUnits = async () => {
    await initializeDatabase();
    return db.units.orderBy('name').toArray();
};

export const deleteUnit = async (id) => {
    await initializeDatabase();
    const unitId = normalizeId(id);
    if (!unitId) throw new Error('شناسه واحد معتبر نیست.');

    const unit = await db.units.get(unitId);
    if (!unit) throw new Error('واحد پیدا نشد.');

    const usedAsBase = await db.products.where('baseUnit').equals(unit.name).count();
    if (usedAsBase > 0) {
        throw new Error('این واحد به‌عنوان واحد پایه در محصولات استفاده شده است.');
    }

    await db.units.delete(unitId);

    dispatchEventSafe('units-updated');
    dispatchEventSafe('database-updated');
    return true;
};

// =========================================================
// Categories
// =========================================================

export const addCategory = async (name) => {
    await initializeDatabase();
    const cleanName = String(name ?? '').trim();
    if (!cleanName) throw new Error('نام دسته‌بندی الزامی است.');

    const existing = await db.categories.where('name').equalsIgnoreCase(cleanName).first();
    if (existing) return existing;

    const category = { name: cleanName, createdAt: nowIso() };
    const id = await db.categories.add(category);

    dispatchEventSafe('categories-updated');
    dispatchEventSafe('database-updated');
    return { id, ...category };
};

export const getCategories = async () => {
    await initializeDatabase();
    return db.categories.orderBy('name').toArray();
};

export const deleteCategory = async (id) => {
    await initializeDatabase();
    const categoryId = normalizeId(id);
    if (!categoryId) throw new Error('شناسه دسته‌بندی معتبر نیست.');

    const category = await db.categories.get(categoryId);
    if (!category) throw new Error('دسته‌بندی پیدا نشد.');

    const usedByProducts = await db.products.where('category').equals(category.name).count();
    if (usedByProducts > 0) {
        throw new Error('این دسته‌بندی در محصولات استفاده شده است.');
    }

    await db.categories.delete(categoryId);

    dispatchEventSafe('categories-updated');
    dispatchEventSafe('database-updated');
    return true;
};

// =========================================================
// Products
// =========================================================

export const addProduct = async (product) => {
    await initializeDatabase();

    if (!product?.name?.trim()) throw new Error('نام محصول الزامی است.');
    if (!product?.baseUnit?.trim()) throw new Error('واحد پایه الزامی است.');

    const now = nowIso();

    // ═══ Initial purchase ═══
    const purchaseQty = Number(product.purchase?.quantity) || 0;
    const purchaseFactor = Number(product.purchase?.factor) || 1;
    const purchasePrice = Number(product.purchase?.pricePerUnit) || 0;
    const purchaseUnit = String(product.purchase?.unit || product.baseUnit).trim();
    const purchaseNote = String(product.purchase?.note || '').trim();

    const stockInBase = purchaseQty * purchaseFactor;
    const totalPaid = purchaseQty * purchasePrice;
    const costPerBase = purchaseFactor > 0 ? purchasePrice / purchaseFactor : 0;

    // ═══ Sale options ═══
    const rawSaleOptions = Array.isArray(product.saleOptions) ? product.saleOptions : [];
    const saleOptions = rawSaleOptions
        .filter((o) => o && o.unit && Number(o.factor) > 0)
        .map((o, idx) => normalizeSaleOption(o, costPerBase, idx));

    // If none provided, auto-create one from base unit
    if (saleOptions.length === 0 && costPerBase > 0) {
        saleOptions.push(normalizeSaleOption(
            {
                unit: product.baseUnit,
                factor: 1,
                price: costPerBase * 1.25,
                targetMargin: 25,
                isDefault: true,
            },
            costPerBase,
            0,
        ));
    } else if (saleOptions.length > 0 && !saleOptions.some((o) => o.isDefault)) {
        saleOptions[0].isDefault = true;
    }

    // ═══ Purchase options (templates) ═══
    const purchaseOptions = [{
        id: `po_${Date.now()}`,
        unit: purchaseUnit,
        factor: purchaseFactor,
        lastPrice: purchasePrice,
        lastDate: now,
        note: purchaseNote,
    }];

    const newProduct = {
        name: product.name.trim(),
        category: String(product.category || '').trim(),
        baseUnit: product.baseUnit.trim(),
        description: String(product.description || '').trim(),

        stock: stockInBase,
        minStock: Number(product.minStock) || 0,

        avgCost: costPerBase,
        totalValue: totalPaid,

        saleOptions,
        purchaseOptions,
        conversions: Array.isArray(product.conversions) ? product.conversions : [],

        createdAt: now,
        updatedAt: now,
    };

    const id = await db.products.add(newProduct);

    if (purchaseQty > 0 && purchasePrice > 0) {
        await db.purchases.add({
            productId: id,
            quantity: purchaseQty,
            unit: purchaseUnit,
            factor: purchaseFactor,
            pricePerUnit: purchasePrice,
            totalPaid,
            receivedInBase: stockInBase,
            costPerBase,
            note: purchaseNote,
            date: now,
            createdAt: now,
        });
        dispatchEventSafe('purchases-updated');
    }

    if (newProduct.category) await addCategory(newProduct.category);

    dispatchEventSafe('products-updated');
    dispatchEventSafe('database-updated');
    return { id, ...newProduct };
};

export const getProducts = async () => {
    await initializeDatabase();
    return db.products.orderBy('createdAt').reverse().toArray();
};

export const getProduct = async (id) => {
    await initializeDatabase();
    const productId = normalizeId(id);
    if (!productId) return null;
    return db.products.get(productId);
};

export const updateProduct = async (id, changes) => {
    await initializeDatabase();
    const productId = normalizeId(id);
    if (!productId) throw new Error('شناسه محصول معتبر نیست.');

    const existing = await db.products.get(productId);
    if (!existing) throw new Error('محصول پیدا نشد.');

    const patch = {};

    if (Object.prototype.hasOwnProperty.call(changes, 'name')) {
        const name = String(changes.name ?? '').trim();
        if (!name) throw new Error('نام محصول الزامی است.');
        patch.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(changes, 'category')) {
        patch.category = String(changes.category ?? '').trim();
    }
    if (Object.prototype.hasOwnProperty.call(changes, 'description')) {
        patch.description = String(changes.description ?? '').trim();
    }
    if (Object.prototype.hasOwnProperty.call(changes, 'minStock')) {
        patch.minStock = Number(changes.minStock) || 0;
    }

    // Sale options — recompute min/suggested from current avgCost
    if (Array.isArray(changes.saleOptions)) {
        const avgCost = Number(existing.avgCost) || 0;
        patch.saleOptions = changes.saleOptions
            .filter((o) => o && o.unit && Number(o.factor) > 0)
            .map((o, idx) => normalizeSaleOption(o, avgCost, idx));

        if (patch.saleOptions.length > 0 && !patch.saleOptions.some((o) => o.isDefault)) {
            patch.saleOptions[0].isDefault = true;
        }
    }

    // Purchase options — editable list of templates
    if (Array.isArray(changes.purchaseOptions)) {
        patch.purchaseOptions = changes.purchaseOptions.map((po, idx) => ({
            id: po.id || `po_${Date.now()}_${idx}`,
            unit: String(po.unit || '').trim(),
            factor: Number(po.factor) || 1,
            lastPrice: Number(po.lastPrice) || 0,
            lastDate: po.lastDate || null,
            note: String(po.note || '').trim(),
        }));
    }

    // Conversions — cross-unit ratios
    if (Array.isArray(changes.conversions)) {
        patch.conversions = changes.conversions.map((c, idx) => ({
            id: c.id || `conv_${Date.now()}_${idx}`,
            fromUnit: String(c.fromUnit || '').trim(),
            toUnit: String(c.toUnit || '').trim(),
            ratio: Number(c.ratio) || 1,
            note: String(c.note || '').trim(),
        }));
    }

    // NOTE: stock, avgCost, totalValue, baseUnit are NOT editable.
    // They change only via purchases.

    await db.products.update(productId, { ...patch, updatedAt: nowIso() });

    if (patch.category) await addCategory(patch.category);

    dispatchEventSafe('products-updated');
    dispatchEventSafe('database-updated');
    return db.products.get(productId);
};

export const deleteProduct = async (id) => {
    await initializeDatabase();
    const productId = normalizeId(id);
    if (!productId) throw new Error('شناسه محصول معتبر نیست.');

    const product = await db.products.get(productId);
    if (!product) throw new Error('محصول پیدا نشد.');

    const salesCount = await db.sales.where('productId').equals(productId).count();
    if (salesCount > 0) {
        throw new Error('این محصول دارای سابقه فروش است و قابل حذف نیست.');
    }

    await db.products.delete(productId);
    await db.purchases.where('productId').equals(productId).delete();

    dispatchEventSafe('products-updated');
    dispatchEventSafe('purchases-updated');
    dispatchEventSafe('database-updated');
    return true;
};

export const getProductCount = async () => {
    await initializeDatabase();
    return db.products.count();
};

// =========================================================
// Purchases (add stock + weighted average + refresh suggestions)
// =========================================================

export const addPurchase = async (productId, purchase) => {
    await initializeDatabase();

    const id = normalizeId(productId);
    if (!id) throw new Error('شناسه محصول معتبر نیست.');

    const product = await db.products.get(id);
    if (!product) throw new Error('محصول پیدا نشد.');

    const qty = Number(purchase?.quantity) || 0;
    const factor = Number(purchase?.factor) || 1;
    const price = Number(purchase?.pricePerUnit) || 0;
    const unit = String(purchase?.unit || product.baseUnit).trim();
    const note = String(purchase?.note || '').trim();

    if (qty <= 0) throw new Error('تعداد خریداری معتبر نیست.');
    if (factor <= 0) throw new Error('ضریب تبدیل معتبر نیست.');
    if (price < 0) throw new Error('قیمت خرید معتبر نیست.');

    const receivedInBase = qty * factor;
    const totalPaid = qty * price;
    const costPerBase = price / factor;

    // Weighted average
    const oldStock = Number(product.stock) || 0;
    const oldValue = Number(product.totalValue) || 0;
    const newStock = oldStock + receivedInBase;
    const newValue = oldValue + totalPaid;
    const newAvgCost = newStock > 0 ? newValue / newStock : 0;

    const now = nowIso();

    const purchaseRecord = {
        productId: id,
        quantity: qty,
        unit,
        factor,
        pricePerUnit: price,
        totalPaid,
        receivedInBase,
        costPerBase,
        note,
        date: purchase?.date || now,
        createdAt: now,
    };

    const purchaseId = await db.purchases.add(purchaseRecord);

    // ═══ Recompute all sale-option suggestions from new avgCost ═══
    const existingOptions = Array.isArray(product.saleOptions) ? product.saleOptions : [];
    const refreshedOptions = existingOptions.map((o, idx) => {
        const margin = Number.isFinite(Number(o.targetMargin)) ? Number(o.targetMargin) : 25;
        const f = Number(o.factor) || 1;
        const costForUnit = newAvgCost * f;
        return {
            ...o,
            id: o.id || `opt_${idx}`,
            targetMargin: margin,
            minPrice: costForUnit,
            suggestedPrice: costForUnit * (1 + margin / 100),
        };
    });

    // ═══ Update purchase-options templates ═══
    const existingPurchaseOptions = Array.isArray(product.purchaseOptions)
        ? [...product.purchaseOptions]
        : [];
    const matchIdx = existingPurchaseOptions.findIndex(
        (po) => String(po.unit || '').trim() === unit
    );
    const updatedTemplate = {
        id: matchIdx >= 0
            ? existingPurchaseOptions[matchIdx].id
            : `po_${Date.now()}`,
        unit,
        factor,
        lastPrice: price,
        lastDate: purchase?.date || now,
        note,
    };
    if (matchIdx >= 0) {
        existingPurchaseOptions[matchIdx] = updatedTemplate;
    } else {
        existingPurchaseOptions.push(updatedTemplate);
    }

    await db.products.update(id, {
        stock: newStock,
        totalValue: newValue,
        avgCost: newAvgCost,
        saleOptions: refreshedOptions,
        purchaseOptions: existingPurchaseOptions,
        updatedAt: now,
    });

    dispatchEventSafe('products-updated');
    dispatchEventSafe('purchases-updated');
    dispatchEventSafe('database-updated');

    return {
        id: purchaseId,
        ...purchaseRecord,
        newAvgCost,
        newStock,
    };
};

export const getPurchases = async (productId = null) => {
    await initializeDatabase();

    if (productId) {
        const id = normalizeId(productId);
        if (!id) return [];
        return db.purchases.where('productId').equals(id).reverse().sortBy('createdAt');
    }

    return db.purchases.orderBy('createdAt').reverse().toArray();
};

// =========================================================
// Customers
// =========================================================

export const addCustomer = async (customer) => {
    await initializeDatabase();
    const name = customer?.name?.trim() || '';
    const phone = customer?.phone?.trim() || '';
    if (!name) throw new Error('نام مشتری الزامی است.');

    let existing = null;
    if (phone) existing = await db.customers.where('phone').equals(phone).first();
    if (!existing) existing = await db.customers.where('name').equals(name).first();
    if (existing) return existing;

    const newCustomer = { name, phone, createdAt: nowIso() };
    const id = await db.customers.add(newCustomer);

    dispatchEventSafe('customers-updated');
    dispatchEventSafe('database-updated');
    return { id, ...newCustomer };
};

export const getCustomers = async () => {
    await initializeDatabase();
    return db.customers.orderBy('createdAt').reverse().toArray();
};

export const getCustomer = async (id) => {
    await initializeDatabase();
    const customerId = normalizeId(id);
    if (!customerId) return null;
    return db.customers.get(customerId);
};

export const updateCustomer = async (id, changes) => {
    await initializeDatabase();
    const customerId = normalizeId(id);
    if (!customerId) throw new Error('شناسه مشتری معتبر نیست.');

    const customer = await db.customers.get(customerId);
    if (!customer) throw new Error('مشتری پیدا نشد.');

    const patch = {};
    if (Object.prototype.hasOwnProperty.call(changes, 'name')) {
        const name = String(changes.name ?? '').trim();
        if (!name) throw new Error('نام مشتری الزامی است.');
        patch.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(changes, 'phone')) {
        patch.phone = String(changes.phone ?? '').trim();
    }

    await db.customers.update(customerId, patch);
    dispatchEventSafe('customers-updated');
    dispatchEventSafe('database-updated');
    return db.customers.get(customerId);
};

export const deleteCustomer = async (id) => {
    await initializeDatabase();
    const customerId = normalizeId(id);
    if (!customerId) throw new Error('شناسه مشتری معتبر نیست.');

    const customer = await db.customers.get(customerId);
    if (!customer) throw new Error('مشتری پیدا نشد.');

    const [salesCount, creditSalesCount, creditPaymentsCount] = await Promise.all([
        db.sales.where('customerId').equals(customerId).count(),
        db.creditSales.where('customerId').equals(customerId).count(),
        db.creditPayments.where('customerId').equals(customerId).count(),
    ]);

    if (salesCount + creditSalesCount + creditPaymentsCount > 0) {
        throw new Error('این مشتری دارای سابقه مالی است و قابل حذف نیست.');
    }

    await db.customers.delete(customerId);
    dispatchEventSafe('customers-updated');
    dispatchEventSafe('database-updated');
    return true;
};

// =========================================================
// Shopping List (FIXED — quantity, unit, note, priority normalize)
// =========================================================

const SHOPPING_ALLOWED_PRIORITIES = ['low', 'normal', 'high', 'urgent'];

const normalizeShoppingPriority = (value) => {
    const v = String(value || '').trim().toLowerCase();
    return SHOPPING_ALLOWED_PRIORITIES.includes(v) ? v : 'normal';
};

const normalizeShoppingQuantity = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? n : 1;
};

export const addShoppingItem = async (item) => {
    await initializeDatabase();
    if (!item?.name?.trim()) throw new Error('نام مورد خرید الزامی است.');

    const now = nowIso();

    const newItem = {
        name: item.name.trim(),
        quantity: normalizeShoppingQuantity(item.quantity),
        unit: String(item.unit || 'عدد').trim() || 'عدد',
        category: String(item.category || '').trim(),
        completed: Boolean(item.completed),
        priority: normalizeShoppingPriority(item.priority),
        note: String(item.note || '').trim(),
        createdAt: now,
        updatedAt: now,
    };

    const id = await db.shoppingList.add(newItem);
    if (newItem.category) await addCategory(newItem.category);

    dispatchEventSafe('shopping-list-updated');
    dispatchEventSafe('database-updated');
    return { id, ...newItem };
};

export const getShoppingItems = async () => {
    await initializeDatabase();
    return db.shoppingList.orderBy('createdAt').reverse().toArray();
};

export const getShoppingItem = async (id) => {
    await initializeDatabase();
    const itemId = normalizeId(id);
    if (!itemId) return null;
    return db.shoppingList.get(itemId);
};

export const updateShoppingItem = async (id, changes) => {
    await initializeDatabase();
    const itemId = normalizeId(id);
    if (!itemId) throw new Error('شناسه مورد خرید معتبر نیست.');

    const existing = await db.shoppingList.get(itemId);
    if (!existing) throw new Error('مورد خرید پیدا نشد.');

    const patch = {};

    if (Object.prototype.hasOwnProperty.call(changes, 'name')) {
        const name = String(changes.name ?? '').trim();
        if (!name) throw new Error('نام مورد خرید الزامی است.');
        patch.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'quantity')) {
        patch.quantity = normalizeShoppingQuantity(changes.quantity);
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'unit')) {
        patch.unit = String(changes.unit || '').trim() || 'عدد';
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'category')) {
        patch.category = String(changes.category || '').trim();
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'completed')) {
        patch.completed = Boolean(changes.completed);
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'priority')) {
        patch.priority = normalizeShoppingPriority(changes.priority);
    }

    if (Object.prototype.hasOwnProperty.call(changes, 'note')) {
        patch.note = String(changes.note || '').trim();
    }

    await db.shoppingList.update(itemId, { ...patch, updatedAt: nowIso() });
    if (patch.category) await addCategory(patch.category);

    dispatchEventSafe('shopping-list-updated');
    dispatchEventSafe('database-updated');
    return db.shoppingList.get(itemId);
};

export const deleteShoppingItem = async (id) => {
    await initializeDatabase();
    const itemId = normalizeId(id);
    if (!itemId) throw new Error('شناسه مورد خرید معتبر نیست.');

    const existing = await db.shoppingList.get(itemId);
    if (!existing) throw new Error('مورد خرید پیدا نشد.');

    await db.shoppingList.delete(itemId);
    dispatchEventSafe('shopping-list-updated');
    dispatchEventSafe('database-updated');
    return true;
};

export const toggleShoppingItem = async (id) => {
    await initializeDatabase();
    const item = await getShoppingItem(id);
    if (!item) throw new Error('مورد خرید پیدا نشد.');
    return updateShoppingItem(id, { completed: !Boolean(item.completed) });
};

export const clearCompletedShoppingItems = async () => {
    await initializeDatabase();
    const completedItems = await db.shoppingList
        .filter((item) => item.completed === true)
        .toArray();
    const ids = completedItems.map((item) => item.id);
    if (ids.length > 0) await db.shoppingList.bulkDelete(ids);

    dispatchEventSafe('shopping-list-updated');
    dispatchEventSafe('database-updated');
    return true;
};

// =========================================================
// Expenses
// =========================================================

export const addExpense = async (expense) => {
    await initializeDatabase();
    const now = nowIso();
    const newExpense = {
        category: expense?.category?.trim() || '',
        amount: Number(expense?.amount) || 0,
        date: expense?.date || now,
        createdAt: now,
    };

    if (newExpense.amount < 0) throw new Error('مبلغ هزینه نمی‌تواند منفی باشد.');

    const id = await db.expenses.add(newExpense);
    dispatchEventSafe('expenses-updated');
    dispatchEventSafe('database-updated');
    return { id, ...newExpense };
};

export const getExpenses = async () => {
    await initializeDatabase();
    return db.expenses.orderBy('createdAt').reverse().toArray();
};

export const deleteExpense = async (id) => {
    await initializeDatabase();
    const expenseId = normalizeId(id);
    if (!expenseId) throw new Error('شناسه هزینه معتبر نیست.');

    const existing = await db.expenses.get(expenseId);
    if (!existing) throw new Error('هزینه پیدا نشد.');

    await db.expenses.delete(expenseId);
    dispatchEventSafe('expenses-updated');
    dispatchEventSafe('database-updated');
    return true;
};

// =========================================================
// Cleanup / Status
// =========================================================

export const clearProducts = async () => {
    await initializeDatabase();
    await db.products.clear();
    await db.purchases.clear();

    dispatchEventSafe('products-updated');
    dispatchEventSafe('purchases-updated');
    dispatchEventSafe('database-updated');
    return true;
};

export const clearDatabase = async () => {
    await initializeDatabase();

    await Promise.all([
        db.products.clear(),
        db.categories.clear(),
        db.units.clear(),
        db.purchases.clear(),
        db.sales.clear(),
        db.creditSales.clear(),
        db.customers.clear(),
        db.expenses.clear(),
        db.shoppingList.clear(),
        db.creditPayments.clear(),
    ]);

    dispatchDatabaseEvents();
    return true;
};

export const resetDatabase = async () => {
    if (db.isOpen()) db.close();
    await db.delete();
    await db.open();
    dispatchDatabaseEvents();
    return true;
};

export const getDatabaseStatus = async () => {
    await initializeDatabase();

    return {
        products: await db.products.count(),
        categories: await db.categories.count(),
        units: await db.units.count(),
        purchases: await db.purchases.count(),
        sales: await db.sales.count(),
        creditSales: await db.creditSales.count(),
        creditPayments: await db.creditPayments.count(),
        customers: await db.customers.count(),
        expenses: await db.expenses.count(),
        shoppingList: await db.shoppingList.count(),
    };
};

export default db;