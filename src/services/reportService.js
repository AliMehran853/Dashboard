import {
    db,
    initializeDatabase,
} from '../database/db';

// =========================================================
// Report Service
// =========================================================

// =========================================================
// Helpers
// =========================================================

// ---------------------------------------------------------
// Sale Date
// ---------------------------------------------------------

const getSaleDate = (sale) =>
    sale?.date ||
    sale?.createdAt ||
    sale?.updatedAt ||
    null;

// ---------------------------------------------------------
// Sale Amount
// ---------------------------------------------------------

const getSaleAmount = (sale) => {
    if (!sale) return 0;

    // ─── Direct amount candidates ───
    const amountCandidates = [
        sale.total,
        sale.totalAmount,
        sale.totalPrice,
        sale.amount,
        sale.saleAmount,
        sale.finalAmount,
        sale.finalPrice,
        sale.payableAmount,
        sale.grandTotal,
    ];

    for (const candidate of amountCandidates) {
        if (candidate === null || candidate === undefined || candidate === '') continue;
        const number = Number(candidate);
        if (Number.isFinite(number)) return number;
    }

    // ─── Price × Quantity fallback ───
    const price = Number(
        sale.sellPrice ??
        sale.price ??
        sale.unitPrice ??
        0
    );
    const quantity = Number(sale.quantity ?? sale.qty ?? 1);

    if (Number.isFinite(price) && Number.isFinite(quantity)) {
        return price * quantity;
    }

    // ─── Multiple items fallback ───
    if (Array.isArray(sale.items)) {
        return sale.items.reduce((total, item) => {
            const itemPrice = Number(
                item?.sellPrice ??
                item?.price ??
                item?.unitPrice ??
                0
            );
            const itemQuantity = Number(item?.quantity ?? item?.qty ?? 1);

            if (!Number.isFinite(itemPrice) || !Number.isFinite(itemQuantity)) {
                return total;
            }
            return total + itemPrice * itemQuantity;
        }, 0);
    }

    return 0;
};

// ---------------------------------------------------------
// Sale Quantity (in BASE units)
// ---------------------------------------------------------

/**
 * مقدار فروش بر حسب واحد پایه (base unit).
 *
 * In the new multi-unit architecture, a sale record has:
 *   - quantity:      in the SALE unit (e.g. 5 cartons)
 *   - saleFactor:    pieces per sale unit (e.g. 12)
 *   - quantityInBase: quantity × saleFactor (e.g. 60 pieces)
 *
 * For correct aggregation across mixed sale units, we MUST use
 * quantityInBase. The other branches are legacy fallbacks.
 */
const getSaleQuantity = (sale) => {
    // ─── Preferred: enriched records ───
    const inBase = Number(sale?.quantityInBase);
    if (Number.isFinite(inBase) && inBase > 0) return inBase;

    // ─── Fallback: reconstruct from quantity × factor ───
    const q = Number(sale?.quantity ?? sale?.qty);
    const f = Number(sale?.saleFactor) || 1;
    if (Number.isFinite(q)) return q * f;

    // ─── Legacy: multiple items ───
    if (Array.isArray(sale?.items)) {
        return sale.items.reduce((total, item) => {
            const itemQuantity = Number(item?.quantity ?? item?.qty ?? 0);
            return total + (Number.isFinite(itemQuantity) ? itemQuantity : 0);
        }, 0);
    }

    return 0;
};

// ---------------------------------------------------------
// Date bounds
// ---------------------------------------------------------

const startOfDay = (date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
};

const endOfDay = (date) => {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
};

// ---------------------------------------------------------
// Local Date Key
// ---------------------------------------------------------

const getLocalDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ---------------------------------------------------------
// Period Range
// ---------------------------------------------------------

/**
 * Returns { start, end } Date bounds for a period key.
 *
 * Supported keys:
 *   - 'today'     → today
 *   - 'yesterday' → yesterday
 *   - 'week'      → last 7 days (default)
 *   - 'month'     → current month so far
 *   - 'year'      → current year so far
 *   - 'all'       → last 365 days (capped for trend-chart performance)
 *   - unknown     → falls back to 'week'
 */
const getPeriodRange = (period) => {
    const today = new Date();

    // ─── Today ───
    if (period === 'today') {
        return { start: startOfDay(today), end: endOfDay(today) };
    }

    // ─── Yesterday ───
    if (period === 'yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }

    // ─── Month ───
    if (period === 'month') {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        return { start: startOfDay(start), end: endOfDay(today) };
    }

    // ─── Year ───
    if (period === 'year') {
        const start = new Date(today.getFullYear(), 0, 1);
        return { start: startOfDay(start), end: endOfDay(today) };
    }

    // ─── All (capped to last 365 days) ───
    // We cap "all" because the trend chart generates one point per day
    // and thousands of points would freeze the browser.
    if (period === 'all') {
        const start = new Date(today);
        start.setDate(start.getDate() - 364);
        return { start: startOfDay(start), end: endOfDay(today) };
    }

    // ─── Week (default) ───
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return { start: startOfDay(start), end: endOfDay(today) };
};

// ---------------------------------------------------------
// Normalize Payment Type
// ---------------------------------------------------------

const normalizePaymentType = (paymentType) =>
    String(paymentType || '').trim().toLowerCase();

const isCashPayment = (paymentType) => {
    const value = normalizePaymentType(paymentType);
    return value === 'cash' || value === 'نقدی' || value === 'نقد';
};

const isCreditPayment = (paymentType) => {
    const value = normalizePaymentType(paymentType);
    return value === 'credit' || value === 'نسیه';
};

// ---------------------------------------------------------
// Sale Date Parser
// ---------------------------------------------------------

const parseSaleDate = (sale) => {
    const value = getSaleDate(sale);
    if (!value) return null;

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date;
};

// ---------------------------------------------------------
// Search
// ---------------------------------------------------------

const normalizeSearch = (value) =>
    String(value || '').trim().toLowerCase();

const saleMatchesSearch = (sale, search) => {
    const normalizedSearch = normalizeSearch(search);
    if (!normalizedSearch) return true;

    const searchableText = [
        sale?.productName,
        sale?.category,
        sale?.customerName,
        sale?.customerPhone,
        sale?.note,
        sale?.paymentType,
        sale?.saleUnit,
        sale?.baseUnit,
    ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    return searchableText.includes(normalizedSearch);
};

// =========================================================
// Main Report
// =========================================================

export const getSalesReport = async ({
    period = 'week',
    paymentType = 'all',
    category = 'all',
    search = '',
} = {}) => {
    await initializeDatabase();

    // ═══ Load all sales ═══
    const allSales = await db.sales.toArray();

    // ═══ Period range ═══
    const { start, end } = getPeriodRange(period);

    // ═══ Normalize filters ═══
    const normalizedPaymentType = normalizePaymentType(paymentType);
    const normalizedSearch = normalizeSearch(search);

    // ═══ Filter ═══
    const filteredSales = allSales.filter((sale) => {
        // Date
        const saleDate = parseSaleDate(sale);
        if (!saleDate) return false;
        if (saleDate < start || saleDate > end) return false;

        // Payment
        if (normalizedPaymentType !== 'all') {
            const salePayment = normalizePaymentType(sale?.paymentType);
            if (salePayment !== normalizedPaymentType) return false;
        }

        // Category
        if (category !== 'all') {
            const saleCategory = String(sale?.category || '').trim();
            if (saleCategory !== String(category).trim()) return false;
        }

        // Search
        if (normalizedSearch && !saleMatchesSearch(sale, normalizedSearch)) {
            return false;
        }

        return true;
    });

    // ═══ Statistics ═══
    let totalRevenue = 0;
    let cashSales = 0;
    let creditSales = 0;
    let totalItems = 0;

    filteredSales.forEach((sale) => {
        const amount = getSaleAmount(sale);
        totalRevenue += amount;

        if (isCashPayment(sale?.paymentType)) {
            cashSales += amount;
        } else if (isCreditPayment(sale?.paymentType)) {
            creditSales += amount;
        } else {
            // Unknown → treat as cash to keep financial totals consistent
            cashSales += amount;
        }

        totalItems += getSaleQuantity(sale);
    });

    // ═══ Transactions ═══
    const totalTransactions = filteredSales.length;

    // ═══ Average Sale ═══
    const averageSale = totalTransactions > 0
        ? Math.round(totalRevenue / totalTransactions)
        : 0;

    // ═══ Sales trend (per-day buckets) ═══
    const salesByDate = {};

    filteredSales.forEach((sale) => {
        const date = parseSaleDate(sale);
        if (!date) return;

        const key = getLocalDateKey(date);
        if (!salesByDate[key]) salesByDate[key] = 0;
        salesByDate[key] += getSaleAmount(sale);
    });

    const salesTrend = [];
    const current = new Date(start);

    while (current <= end) {
        const key = getLocalDateKey(current);

        const dayName = current.toLocaleDateString('fa-AF', {
            weekday: 'long',
        });

        salesTrend.push({
            date: dayName,
            isoDate: key,
            sales: salesByDate[key] || 0,
        });

        current.setDate(current.getDate() + 1);
    }

    // ═══ Payment distribution ═══
    const paymentDistribution = [
        { name: 'نقدی', value: cashSales },
        { name: 'نسیه', value: creditSales },
    ];

    // ═══ Category sales ═══
    const categoryMap = {};

    filteredSales.forEach((sale) => {
        const saleCategory = String(sale?.category || '').trim();
        const categoryName = saleCategory || 'بدون دسته‌بندی';
        const amount = getSaleAmount(sale);

        if (!categoryMap[categoryName]) categoryMap[categoryName] = 0;
        categoryMap[categoryName] += amount;
    });

    const categorySales = Object.entries(categoryMap)
        .map(([categoryName, sales]) => ({
            category: categoryName,
            sales,
        }))
        .sort((a, b) => b.sales - a.sales);

    // ═══ Best category ═══
    const bestCategory = categorySales[0];

    // ═══ Return ═══
    return {
        statistics: {
            // NOTE:
            //   totalSales / totalTransactions = COUNT (number of transactions)
            //   totalRevenue                   = MONEY
            totalSales: totalTransactions,
            totalTransactions,
            totalRevenue,
            cashSales,
            creditSales,
        },

        salesTrend,
        paymentDistribution,
        categorySales,

        summary: {
            bestCategory: bestCategory?.category || '-',
            bestCategorySales: bestCategory?.sales || 0,
            averageSale,
            totalItems,
        },

        // Keep filtered sales for exports
        rawSales: filteredSales,
    };
};

// =========================================================
// Categories For Report Filter
// =========================================================

export const getReportCategories = async () => {
    await initializeDatabase();
    return db.categories.orderBy('name').toArray();
};

// =========================================================
// Default Export
// =========================================================

export default {
    getSalesReport,
    getReportCategories,
};