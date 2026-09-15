import {
    db,
    initializeDatabase,
    addCustomer,
} from '../database/db';

// =========================================================
// Helpers
// =========================================================

const normalizeNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const normalizeId = (value) => {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : null;
};

const getSaleDate = (sale) =>
    sale?.date || sale?.createdAt || sale?.updatedAt || null;

const getSaleTotal = (sale) => {
    const direct = sale?.total;
    if (direct != null) {
        const n = Number(direct);
        if (Number.isFinite(n)) return n;
    }
    const alt = sale?.totalAmount;
    if (alt != null) {
        const n = Number(alt);
        if (Number.isFinite(n)) return n;
    }
    return normalizeNumber(sale?.quantity) * normalizeNumber(sale?.unitPrice);
};

const getSaleQuantityInBase = (sale) => {
    const stored = Number(sale?.quantityInBase);
    if (Number.isFinite(stored) && stored > 0) return stored;

    const q = normalizeNumber(sale?.quantity);
    const f = normalizeNumber(sale?.saleFactor) || 1;
    return q * f;
};

const normalizePaymentType = (value) =>
    value === 'credit' ? 'credit' : 'cash';

const dispatchDatabaseEvent = (eventName) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(new Event(eventName));
};

const dispatchSaleUpdatedEvents = ({
    credit = false,
    product = false,
    customer = false,
} = {}) => {
    dispatchDatabaseEvent('sales-updated');
    dispatchDatabaseEvent('database-updated');
    if (product) dispatchDatabaseEvent('products-updated');
    if (customer) dispatchDatabaseEvent('customers-updated');
    if (credit) dispatchDatabaseEvent('credit-sales-updated');
};

// =========================================================
// Add Sale
// =========================================================

export const addSale = async (sale) => {
    await initializeDatabase();

    if (!sale) throw new Error('اطلاعات فروش ارسال نشده است.');

    const productId = normalizeId(sale.productId);
    if (!productId) throw new Error('محصول انتخاب نشده است.');

    const quantity = normalizeNumber(sale.quantity);
    if (quantity <= 0) throw new Error('تعداد باید بیشتر از صفر باشد.');

    const unitPrice = normalizeNumber(sale.unitPrice);
    if (unitPrice < 0) throw new Error('قیمت فروش معتبر نیست.');

    const saleOptionId = sale.saleOptionId ? String(sale.saleOptionId) : null;
    const saleUnit = String(sale.saleUnit || '').trim();
    const saleFactorRaw = Number(sale.saleFactor);
    const saleFactor =
        Number.isFinite(saleFactorRaw) && saleFactorRaw > 0 ? saleFactorRaw : 1;

    const quantityInBase = quantity * saleFactor;

    const paymentType = normalizePaymentType(sale.paymentType);

    const customerName = sale.customerName?.trim() || '';
    const customerPhone = sale.customerPhone?.trim() || '';
    const note = sale.note?.trim() || '';
    const category = sale.category?.trim() || '';

    if (paymentType === 'credit' && !customerName && !sale.customerId) {
        throw new Error('برای فروش نسیه باید اطلاعات مشتری وارد شود.');
    }

    const saleDate = sale.date || new Date().toISOString();
    const now = new Date().toISOString();

    let saleResult = null;
    let createdCustomer = false;

    await db.transaction(
        'rw',
        db.products,
        db.sales,
        db.creditSales,
        db.customers,
        async () => {
            const product = await db.products.get(productId);
            if (!product) throw new Error('محصول پیدا نشد.');

            const currentStock = normalizeNumber(product.stock);

            if (currentStock < quantityInBase) {
                const baseUnit = product.baseUnit || '';
                throw new Error(
                    `موجودی کافی نیست. موجودی فعلی: ${currentStock} ${baseUnit}` +
                        (saleFactor !== 1
                            ? ` (این فروش معادل ${quantityInBase} ${baseUnit} است)`
                            : '')
                );
            }

            let customerId = normalizeId(sale.customerId);

            if (customerId) {
                const existing = await db.customers.get(customerId);
                if (!existing) throw new Error('مشتری پیدا نشد.');
            } else if (customerName || customerPhone) {
                const customer = await addCustomer({
                    name: customerName,
                    phone: customerPhone,
                });
                customerId = customer.id;
                createdCustomer = true;
            }

            if (paymentType === 'credit' && !customerId) {
                throw new Error('برای فروش نسیه باید اطلاعات مشتری وارد شود.');
            }

            const total = quantity * unitPrice;

            const newSale = {
                productId: product.id,
                productName: product.name,
                category: category || product.category || '',

                quantity,
                unitPrice,
                total,

                saleOptionId,
                saleUnit: saleUnit || product.baseUnit || '',
                saleFactor,
                quantityInBase,

                baseUnit: product.baseUnit || '',
                avgCostAtSale: normalizeNumber(product.avgCost),

                paymentType,
                customerId: customerId || null,
                customerName,
                customerPhone,
                note,
                date: saleDate,
                createdAt: now,
            };

            const saleId = await db.sales.add(newSale);

            await db.products.update(product.id, {
                stock: currentStock - quantityInBase,
                updatedAt: now,
            });

            if (paymentType === 'credit') {
                await db.creditSales.add({
                    saleId,
                    customerId,
                    amount: total,
                    status: 'pending',
                    dueDate: sale.dueDate || null,
                    createdAt: now,
                });
            }

            saleResult = { id: saleId, ...newSale };
        }
    );

    dispatchSaleUpdatedEvents({
        credit: saleResult?.paymentType === 'credit',
        product: true,
        customer: createdCustomer,
    });

    return saleResult;
};

// =========================================================
// Get Sales
// =========================================================

export const getSales = async () => {
    await initializeDatabase();
    return db.sales.orderBy('createdAt').reverse().toArray();
};

export const getSale = async (id) => {
    await initializeDatabase();
    const saleId = normalizeId(id);
    if (!saleId) return null;
    return db.sales.get(saleId);
};

// =========================================================
// Today
// =========================================================

export const getTodaySales = async () => {
    await initializeDatabase();
    const sales = await getSales();
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();

    return sales.filter((sale) => {
        const value = getSaleDate(sale);
        if (!value) return false;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return false;

        return (
            date.getFullYear() === year &&
            date.getMonth() === month &&
            date.getDate() === day
        );
    });
};

export const getTodaySalesStatistics = async () => {
    const sales = await getTodaySales();

    let totalSales = 0;
    let cashSales = 0;
    let creditSales = 0;
    let totalItems = 0;

    sales.forEach((sale) => {
        const total = getSaleTotal(sale);
        const quantityInBase = getSaleQuantityInBase(sale);

        totalSales += total;
        totalItems += quantityInBase;

        if (sale.paymentType === 'credit') {
            creditSales += total;
        } else {
            cashSales += total;
        }
    });

    return {
        totalSales,
        cashSales,
        creditSales,
        totalItems,
        salesCount: sales.length,
    };
};

/**
 * ✅ Today's CASH-only statistics.
 * Used by the Sales page (which shows only cash sales).
 */
export const getTodayCashSalesStatistics = async () => {
    const sales = await getTodaySales();
    const cashOnly = sales.filter((s) => s.paymentType !== 'credit');

    let totalSales = 0;
    let totalItems = 0;

    cashOnly.forEach((sale) => {
        totalSales += getSaleTotal(sale);
        totalItems += getSaleQuantityInBase(sale);
    });

    return {
        totalSales,
        cashSales: totalSales,
        creditSales: 0,
        totalItems,
        salesCount: cashOnly.length,
    };
};

// =========================================================
// ✅ NEW: Pending Credit Summary
//
//   Computes the outstanding (unpaid) credit debt across all
//   customers, plus the number of customers who still owe.
//
//   Strategy (defensive):
//     1. If creditPayments have numeric `amount` → compute
//        remaining = Σ(sales.amount) − Σ(payments.amount) per customer.
//     2. Otherwise → fall back to creditSales.status !== 'paid'.
// =========================================================

export const getPendingCreditSummary = async () => {
    await initializeDatabase();

    const [creditSales, creditPayments] = await Promise.all([
        db.creditSales.toArray(),
        db.creditPayments.toArray(),
    ]);

    const salesList = Array.isArray(creditSales) ? creditSales : [];
    const paymentsList = Array.isArray(creditPayments) ? creditPayments : [];

    // Does any payment record carry a usable `amount`?
    const hasPaymentAmounts = paymentsList.some(
        (p) => Number.isFinite(Number(p?.amount)) && Number(p.amount) > 0
    );

    // -----------------------------------------------------
    // Fallback: rely on creditSales.status only
    // -----------------------------------------------------
    if (!hasPaymentAmounts) {
        const seen = new Set();
        let pendingAmount = 0;

        for (const cs of salesList) {
            const status = String(cs?.status || '').toLowerCase();
            const isSettled =
                status === 'paid' ||
                status === 'settled' ||
                status === 'completed';

            if (isSettled) continue;

            pendingAmount += Number(cs?.amount) || 0;

            const cid = normalizeId(cs?.customerId);
            if (cid) seen.add(cid);
        }

        return {
            pendingCount: seen.size,
            pendingAmount: Math.max(0, pendingAmount),
        };
    }

    // -----------------------------------------------------
    // Full calculation: sales − payments, grouped per customer
    // -----------------------------------------------------
    const debtByCustomer = new Map();
    for (const cs of salesList) {
        const cid = normalizeId(cs?.customerId);
        if (!cid) continue;
        const prev = debtByCustomer.get(cid) || 0;
        debtByCustomer.set(cid, prev + (Number(cs?.amount) || 0));
    }

    const paidByCustomer = new Map();
    for (const cp of paymentsList) {
        const cid = normalizeId(cp?.customerId);
        if (!cid) continue;
        const prev = paidByCustomer.get(cid) || 0;
        paidByCustomer.set(cid, prev + (Number(cp?.amount) || 0));
    }

    let pendingAmount = 0;
    let pendingCount = 0;

    for (const [cid, debt] of debtByCustomer) {
        const paid = paidByCustomer.get(cid) || 0;
        const remaining = debt - paid;
        if (remaining > 0.001) {
            pendingAmount += remaining;
            pendingCount += 1;
        }
    }

    return {
        pendingCount,
        pendingAmount: Math.max(0, pendingAmount),
    };
};

// =========================================================
// Delete Sale
// =========================================================

export const deleteSale = async (id) => {
    await initializeDatabase();

    const saleId = normalizeId(id);
    if (!saleId) throw new Error('شناسه فروش معتبر نیست.');

    let deletedSale = null;

    await db.transaction('rw', db.sales, db.products, db.creditSales, async () => {
        const sale = await db.sales.get(saleId);
        if (!sale) throw new Error('فروش پیدا نشد.');

        deletedSale = sale;

        const product = await db.products.get(sale.productId);
        if (product) {
            const currentStock = normalizeNumber(product.stock);
            const restoreQty = getSaleQuantityInBase(sale);

            await db.products.update(product.id, {
                stock: currentStock + restoreQty,
                updatedAt: new Date().toISOString(),
            });
        }

        await db.creditSales.where('saleId').equals(saleId).delete();

        await db.sales.delete(saleId);
    });

    dispatchSaleUpdatedEvents({
        credit: deletedSale?.paymentType === 'credit',
        product: true,
    });

    return true;
};

// =========================================================
// Date Range
// =========================================================

export const getSalesByDateRange = async (startDate, endDate) => {
    await initializeDatabase();

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];

    const sales = await getSales();

    return sales.filter((sale) => {
        const value = getSaleDate(sale);
        if (!value) return false;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return false;
        return date >= start && date <= end;
    });
};

// =========================================================
// Statistics
// =========================================================

export const getPaymentStatistics = async () => {
    await initializeDatabase();
    const sales = await getSales();

    let cash = 0;
    let credit = 0;

    sales.forEach((sale) => {
        const total = getSaleTotal(sale);
        if (sale.paymentType === 'credit') credit += total;
        else cash += total;
    });

    return { cash, credit, total: cash + credit };
};

export const getCategorySalesStatistics = async () => {
    await initializeDatabase();
    const sales = await getSales();
    const result = {};

    sales.forEach((sale) => {
        const category = sale.category?.trim() || '';
        const key = category || '__uncategorized__';

        if (!result[key]) {
            result[key] = { category, amount: 0, quantity: 0 };
        }

        result[key].amount += getSaleTotal(sale);
        result[key].quantity += getSaleQuantityInBase(sale);
    });

    return Object.values(result);
};

// =========================================================
// Default Export
// =========================================================

export default {
    addSale,
    getSales,
    getSale,
    getTodaySales,
    getTodaySalesStatistics,
    getTodayCashSalesStatistics,
    getPendingCreditSummary,
    deleteSale,
    getSalesByDateRange,
    getPaymentStatistics,
    getCategorySalesStatistics,
};