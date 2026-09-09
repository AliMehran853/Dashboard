import Dexie from 'dexie';


// =========================================================
// Database
// =========================================================

export const db = new Dexie('TaqwaShopDB');


// =========================================================
// Version 1
// =========================================================

db.version(1).stores({
  products:
    '++id, name, category, stock, minStock, createdAt, updatedAt',

  categories:
    '++id, &name, createdAt',

  sales:
    '++id, productId, category, paymentType, customerId, date, createdAt',

  creditSales:
    '++id, saleId, customerId, status, dueDate, createdAt',

  customers:
    '++id, name, phone, createdAt',

  expenses:
    '++id, category, date, createdAt',
});


// =========================================================
// Version 2
// =========================================================

db.version(2).stores({
  products:
    '++id, name, category, stock, minStock, createdAt, updatedAt',

  categories:
    '++id, &name, createdAt',

  sales:
    '++id, productId, category, paymentType, customerId, date, createdAt',

  creditSales:
    '++id, saleId, customerId, status, dueDate, createdAt',

  customers:
    '++id, name, phone, createdAt',

  expenses:
    '++id, category, date, createdAt',

  shoppingList:
    '++id, name, category, completed, priority, createdAt, updatedAt',
});


// =========================================================
// Version 3
// =========================================================

db.version(3).stores({
  products:
    '++id, name, category, stock, minStock, createdAt, updatedAt',

  categories:
    '++id, &name, createdAt',

  sales:
    '++id, productId, category, paymentType, customerId, date, createdAt',

  creditSales:
    '++id, saleId, customerId, status, dueDate, createdAt',

  customers:
    '++id, name, phone, createdAt',

  expenses:
    '++id, category, date, createdAt',

  shoppingList:
    '++id, name, category, completed, priority, createdAt, updatedAt',
});


// =========================================================
// Version 4
// Credit Payments
// =========================================================

db.version(4).stores({
  products:
    '++id, name, category, stock, minStock, createdAt, updatedAt',

  categories:
    '++id, &name, createdAt',

  sales:
    '++id, productId, category, paymentType, customerId, date, createdAt',

  creditSales:
    '++id, saleId, customerId, status, dueDate, createdAt',

  customers:
    '++id, name, phone, createdAt',

  expenses:
    '++id, category, date, createdAt',

  shoppingList:
    '++id, name, category, completed, priority, createdAt, updatedAt',

  creditPayments:
    '++id, customerId, date, createdAt',
});


// =========================================================
// Product Units
// =========================================================

export const defaultUnits = [
  'عدد',
  'بسته',
  'کیلوگرم',
  'گرم',
  'لیتر',
  'متر',
  'کارتن',
];


// =========================================================
// Database Initialization
// =========================================================

export const initializeDatabase = async () => {
  if (!db.isOpen()) {
    await db.open();
  }

  return db;
};


// =========================================================
// Products
// =========================================================

export const addProduct = async (product) => {
  await initializeDatabase();

  if (!product?.name?.trim()) {
    throw new Error('نام محصول الزامی است.');
  }

  const now =
    new Date().toISOString();

  const newProduct = {
    name:
      product.name.trim(),

    category:
      product.category?.trim() || '',

    stock:
      Number(product.stock) || 0,

    minStock:
      Number(product.minStock) || 0,

    buyPrice:
      Number(product.buyPrice) || 0,

    sellPrice:
      Number(product.sellPrice) || 0,

    unit:
      product.unit?.trim() ||
      defaultUnits[0],

    description:
      product.description?.trim() || '',

    createdAt:
      now,

    updatedAt:
      now,
  };

  const id =
    await db.products.add(
      newProduct
    );

  if (newProduct.category) {
    await addCategory(
      newProduct.category
    );
  }

  dispatchEventSafe(
    'products-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return {
    id,
    ...newProduct,
  };
};


export const getProducts = async () => {
  await initializeDatabase();

  return db.products
    .orderBy('createdAt')
    .reverse()
    .toArray();
};


export const getProduct = async (id) => {
  await initializeDatabase();

  const productId =
    normalizeId(id);

  if (!productId) {
    return null;
  }

  return db.products.get(
    productId
  );
};


export const updateProduct = async (
  id,
  changes
) => {
  await initializeDatabase();

  const productId =
    normalizeId(id);

  if (!productId) {
    throw new Error(
      'شناسه محصول معتبر نیست.'
    );
  }

  const existing =
    await db.products.get(
      productId
    );

  if (!existing) {
    throw new Error(
      'محصول پیدا نشد.'
    );
  }

  const normalizedChanges = {
    ...changes,
  };

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'name'
    )
  ) {
    normalizedChanges.name =
      String(
        normalizedChanges.name ?? ''
      ).trim();

    if (!normalizedChanges.name) {
      throw new Error(
        'نام محصول الزامی است.'
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'category'
    )
  ) {
    normalizedChanges.category =
      String(
        normalizedChanges.category ?? ''
      ).trim();
  }

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'stock'
    )
  ) {
    normalizedChanges.stock =
      Number(normalizedChanges.stock) || 0;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'minStock'
    )
  ) {
    normalizedChanges.minStock =
      Number(normalizedChanges.minStock) || 0;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'buyPrice'
    )
  ) {
    normalizedChanges.buyPrice =
      Number(normalizedChanges.buyPrice) || 0;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'sellPrice'
    )
  ) {
    normalizedChanges.sellPrice =
      Number(normalizedChanges.sellPrice) || 0;
  }

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'unit'
    )
  ) {
    normalizedChanges.unit =
      String(
        normalizedChanges.unit ?? ''
      ).trim() ||
      defaultUnits[0];
  }

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'description'
    )
  ) {
    normalizedChanges.description =
      String(
        normalizedChanges.description ?? ''
      ).trim();
  }

  await db.products.update(
    productId,
    {
      ...normalizedChanges,
      updatedAt:
        new Date().toISOString(),
    }
  );

  if (
    normalizedChanges.category
  ) {
    await addCategory(
      normalizedChanges.category
    );
  }

  dispatchEventSafe(
    'products-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return db.products.get(
    productId
  );
};


export const deleteProduct = async (id) => {
  await initializeDatabase();

  const productId =
    normalizeId(id);

  if (!productId) {
    throw new Error(
      'شناسه محصول معتبر نیست.'
    );
  }

  const product =
    await db.products.get(
      productId
    );

  if (!product) {
    throw new Error(
      'محصول پیدا نشد.'
    );
  }

  const salesCount =
    await db.sales
      .where('productId')
      .equals(productId)
      .count();

  if (salesCount > 0) {
    throw new Error(
      'این محصول دارای سابقه فروش است و قابل حذف نیست.'
    );
  }

  await db.products.delete(
    productId
  );

  dispatchEventSafe(
    'products-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return true;
};


export const getProductCount = async () => {
  await initializeDatabase();

  return db.products.count();
};


// =========================================================
// Categories
// =========================================================

export const addCategory = async (name) => {
  await initializeDatabase();

  const cleanName =
    String(name ?? '').trim();

  if (!cleanName) {
    throw new Error(
      'نام دسته‌بندی الزامی است.'
    );
  }

  const existing =
    await db.categories
      .where('name')
      .equalsIgnoreCase(
        cleanName
      )
      .first();

  if (existing) {
    return existing;
  }

  const category = {
    name:
      cleanName,

    createdAt:
      new Date().toISOString(),
  };

  const id =
    await db.categories.add(
      category
    );

  dispatchEventSafe(
    'categories-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return {
    id,
    ...category,
  };
};


export const getCategories = async () => {
  await initializeDatabase();

  return db.categories
    .orderBy('name')
    .toArray();
};


export const getCategory = async (id) => {
  await initializeDatabase();

  const categoryId =
    normalizeId(id);

  if (!categoryId) {
    return null;
  }

  return db.categories.get(
    categoryId
  );
};


export const deleteCategory = async (id) => {
  await initializeDatabase();

  const categoryId =
    normalizeId(id);

  if (!categoryId) {
    throw new Error(
      'شناسه دسته‌بندی معتبر نیست.'
    );
  }

  const category =
    await db.categories.get(
      categoryId
    );

  if (!category) {
    throw new Error(
      'دسته‌بندی پیدا نشد.'
    );
  }

  const usedByProducts =
    await db.products
      .where('category')
      .equals(category.name)
      .count();

  if (usedByProducts > 0) {
    throw new Error(
      'این دسته‌بندی در محصولات استفاده شده است.'
    );
  }

  await db.categories.delete(
    categoryId
  );

  dispatchEventSafe(
    'categories-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return true;
};


// =========================================================
// Customers
// =========================================================

export const addCustomer = async (customer) => {
  await initializeDatabase();

  const name =
    customer?.name?.trim() || '';

  const phone =
    customer?.phone?.trim() || '';

  if (!name) {
    throw new Error(
      'نام مشتری الزامی است.'
    );
  }

  const now =
    new Date().toISOString();

  let existing = null;

  if (phone) {
    existing =
      await db.customers
        .where('phone')
        .equals(phone)
        .first();
  }

  if (!existing) {
    existing =
      await db.customers
        .where('name')
        .equals(name)
        .first();
  }

  if (existing) {
    return existing;
  }

  const newCustomer = {
    name,
    phone,
    createdAt:
      now,
  };

  const id =
    await db.customers.add(
      newCustomer
    );

  dispatchEventSafe(
    'customers-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return {
    id,
    ...newCustomer,
  };
};


export const getCustomers = async () => {
  await initializeDatabase();

  return db.customers
    .orderBy('createdAt')
    .reverse()
    .toArray();
};


export const getCustomer = async (id) => {
  await initializeDatabase();

  const customerId =
    normalizeId(id);

  if (!customerId) {
    return null;
  }

  return db.customers.get(
    customerId
  );
};


export const updateCustomer = async (
  id,
  changes
) => {
  await initializeDatabase();

  const customerId =
    normalizeId(id);

  if (!customerId) {
    throw new Error(
      'شناسه مشتری معتبر نیست.'
    );
  }

  const customer =
    await db.customers.get(
      customerId
    );

  if (!customer) {
    throw new Error(
      'مشتری پیدا نشد.'
    );
  }

  const normalizedChanges = {
    ...changes,
  };

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'name'
    )
  ) {
    normalizedChanges.name =
      String(
        normalizedChanges.name ?? ''
      ).trim();

    if (!normalizedChanges.name) {
      throw new Error(
        'نام مشتری الزامی است.'
      );
    }
  }

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'phone'
    )
  ) {
    normalizedChanges.phone =
      String(
        normalizedChanges.phone ?? ''
      ).trim();
  }

  await db.customers.update(
    customerId,
    normalizedChanges
  );

  dispatchEventSafe(
    'customers-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return db.customers.get(
    customerId
  );
};


export const deleteCustomer = async (id) => {
  await initializeDatabase();

  const customerId =
    normalizeId(id);

  if (!customerId) {
    throw new Error(
      'شناسه مشتری معتبر نیست.'
    );
  }

  const customer =
    await db.customers.get(
      customerId
    );

  if (!customer) {
    throw new Error(
      'مشتری پیدا نشد.'
    );
  }

  const salesCount =
    await db.sales
      .where('customerId')
      .equals(customerId)
      .count();

  const creditSalesCount =
    await db.creditSales
      .where('customerId')
      .equals(customerId)
      .count();

  const creditPaymentsCount =
    await db.creditPayments
      .where('customerId')
      .equals(customerId)
      .count();

  if (
    salesCount > 0 ||
    creditSalesCount > 0 ||
    creditPaymentsCount > 0
  ) {
    throw new Error(
      'این مشتری دارای سابقه مالی است و قابل حذف نیست.'
    );
  }

  await db.customers.delete(
    customerId
  );

  dispatchEventSafe(
    'customers-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return true;
};


// =========================================================
// Shopping List
// =========================================================

export const addShoppingItem = async (item) => {
  await initializeDatabase();

  if (!item?.name?.trim()) {
    throw new Error(
      'نام مورد خرید الزامی است.'
    );
  }

  const now =
    new Date().toISOString();

  const newItem = {
    name:
      item.name.trim(),

    category:
      item.category?.trim() || '',

    completed:
      Boolean(item.completed),

    priority:
      item.priority || 'medium',

    createdAt:
      now,

    updatedAt:
      now,
  };

  const id =
    await db.shoppingList.add(
      newItem
    );

  if (newItem.category) {
    await addCategory(
      newItem.category
    );
  }

  dispatchEventSafe(
    'shopping-list-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return {
    id,
    ...newItem,
  };
};


export const getShoppingItems = async () => {
  await initializeDatabase();

  return db.shoppingList
    .orderBy('createdAt')
    .reverse()
    .toArray();
};


export const getShoppingItem = async (id) => {
  await initializeDatabase();

  const itemId =
    normalizeId(id);

  if (!itemId) {
    return null;
  }

  return db.shoppingList.get(
    itemId
  );
};


export const updateShoppingItem = async (
  id,
  changes
) => {
  await initializeDatabase();

  const itemId =
    normalizeId(id);

  if (!itemId) {
    throw new Error(
      'شناسه مورد خرید معتبر نیست.'
    );
  }

  const existing =
    await db.shoppingList.get(
      itemId
    );

  if (!existing) {
    throw new Error(
      'مورد خرید پیدا نشد.'
    );
  }

  const normalizedChanges = {
    ...changes,
  };

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'completed'
    )
  ) {
    normalizedChanges.completed =
      Boolean(
        normalizedChanges.completed
      );
  }

  if (
    typeof normalizedChanges.name ===
    'string'
  ) {
    normalizedChanges.name =
      normalizedChanges.name.trim();
  }

  if (
    typeof normalizedChanges.category ===
    'string'
  ) {
    normalizedChanges.category =
      normalizedChanges.category.trim();
  }

  await db.shoppingList.update(
    itemId,
    {
      ...normalizedChanges,
      updatedAt:
        new Date().toISOString(),
    }
  );

  if (
    normalizedChanges.category
  ) {
    await addCategory(
      normalizedChanges.category
    );
  }

  dispatchEventSafe(
    'shopping-list-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return db.shoppingList.get(
    itemId
  );
};


export const deleteShoppingItem = async (id) => {
  await initializeDatabase();

  const itemId =
    normalizeId(id);

  if (!itemId) {
    throw new Error(
      'شناسه مورد خرید معتبر نیست.'
    );
  }

  const existing =
    await db.shoppingList.get(
      itemId
    );

  if (!existing) {
    throw new Error(
      'مورد خرید پیدا نشد.'
    );
  }

  await db.shoppingList.delete(
    itemId
  );

  dispatchEventSafe(
    'shopping-list-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return true;
};


export const toggleShoppingItem = async (id) => {
  await initializeDatabase();

  const item =
    await getShoppingItem(id);

  if (!item) {
    throw new Error(
      'مورد خرید پیدا نشد.'
    );
  }

  return updateShoppingItem(
    id,
    {
      completed:
        !Boolean(item.completed),
    }
  );
};


export const clearCompletedShoppingItems =
  async () => {
    await initializeDatabase();

    const completedItems =
      await db.shoppingList
        .filter(
          (item) =>
            item.completed === true
        )
        .toArray();

    const ids =
      completedItems.map(
        (item) => item.id
      );

    if (ids.length > 0) {
      await db.shoppingList.bulkDelete(
        ids
      );
    }

    dispatchEventSafe(
      'shopping-list-updated'
    );

    dispatchEventSafe(
      'database-updated'
    );

    return true;
  };


// =========================================================
// Expenses
// =========================================================

export const addExpense = async (expense) => {
  await initializeDatabase();

  const now =
    new Date().toISOString();

  const newExpense = {
    category:
      expense?.category?.trim() || '',

    amount:
      Number(expense?.amount) || 0,

    date:
      expense?.date || now,

    createdAt:
      now,
  };

  if (newExpense.amount < 0) {
    throw new Error(
      'مبلغ هزینه نمی‌تواند منفی باشد.'
    );
  }

  const id =
    await db.expenses.add(
      newExpense
    );

  dispatchEventSafe(
    'expenses-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return {
    id,
    ...newExpense,
  };
};


export const getExpenses = async () => {
  await initializeDatabase();

  return db.expenses
    .orderBy('createdAt')
    .reverse()
    .toArray();
};


export const getExpense = async (id) => {
  await initializeDatabase();

  const expenseId =
    normalizeId(id);

  if (!expenseId) {
    return null;
  }

  return db.expenses.get(
    expenseId
  );
};


export const updateExpense = async (
  id,
  changes
) => {
  await initializeDatabase();

  const expenseId =
    normalizeId(id);

  if (!expenseId) {
    throw new Error(
      'شناسه هزینه معتبر نیست.'
    );
  }

  const existing =
    await db.expenses.get(
      expenseId
    );

  if (!existing) {
    throw new Error(
      'هزینه پیدا نشد.'
    );
  }

  const normalizedChanges = {
    ...changes,
  };

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'category'
    )
  ) {
    normalizedChanges.category =
      String(
        normalizedChanges.category ?? ''
      ).trim();
  }

  if (
    Object.prototype.hasOwnProperty.call(
      normalizedChanges,
      'amount'
    )
  ) {
    normalizedChanges.amount =
      Number(normalizedChanges.amount) || 0;

    if (normalizedChanges.amount < 0) {
      throw new Error(
        'مبلغ هزینه نمی‌تواند منفی باشد.'
      );
    }
  }

  await db.expenses.update(
    expenseId,
    {
      ...normalizedChanges,
      updatedAt:
        new Date().toISOString(),
    }
  );

  dispatchEventSafe(
    'expenses-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return db.expenses.get(
    expenseId
  );
};


export const deleteExpense = async (id) => {
  await initializeDatabase();

  const expenseId =
    normalizeId(id);

  if (!expenseId) {
    throw new Error(
      'شناسه هزینه معتبر نیست.'
    );
  }

  const existing =
    await db.expenses.get(
      expenseId
    );

  if (!existing) {
    throw new Error(
      'هزینه پیدا نشد.'
    );
  }

  await db.expenses.delete(
    expenseId
  );

  dispatchEventSafe(
    'expenses-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return true;
};


// =========================================================
// Utility
// =========================================================

const normalizeId = (value) => {
  const id =
    Number(value);

  return Number.isFinite(id) &&
    id > 0
    ? id
    : null;
};


const dispatchEventSafe = (
  eventName
) => {
  if (
    typeof window === 'undefined'
  ) {
    return;
  }

  window.dispatchEvent(
    new Event(eventName)
  );
};


const dispatchDatabaseEvents = () => {
  const events = [
    'products-updated',
    'categories-updated',
    'sales-updated',
    'credit-sales-updated',
    'credit-payments-updated',
    'customers-updated',
    'expenses-updated',
    'shopping-list-updated',
    'database-updated',
  ];

  events.forEach(
    dispatchEventSafe
  );
};


// =========================================================
// Database Cleanup
// =========================================================

export const clearProducts = async () => {
  await initializeDatabase();

  await db.products.clear();

  dispatchEventSafe(
    'products-updated'
  );

  dispatchEventSafe(
    'database-updated'
  );

  return true;
};


export const clearDatabase = async () => {
  await initializeDatabase();

  await Promise.all([
    db.products.clear(),
    db.categories.clear(),
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
  if (db.isOpen()) {
    db.close();
  }

  await db.delete();

  await db.open();

  dispatchDatabaseEvents();

  return true;
};


export const getDatabaseStatus = async () => {
  await initializeDatabase();

  return {
    products:
      await db.products.count(),

    categories:
      await db.categories.count(),

    sales:
      await db.sales.count(),

    creditSales:
      await db.creditSales.count(),

    creditPayments:
      await db.creditPayments.count(),

    customers:
      await db.customers.count(),

    expenses:
      await db.expenses.count(),

    shoppingList:
      await db.shoppingList.count(),
  };
};


// =========================================================
// Default Export
// =========================================================

export default db;