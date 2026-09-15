import { computeSaleOptionMetrics } from '../database/db';

// =========================================================
// Product Service — shared product math
// =========================================================

/**
 * محاسبهٔ بهای تمام‌شدهٔ یک واحد خرید
 * @param {number} pricePerUnit قیمت خرید هر واحد خرید
 * @param {number} factor      تعداد baseUnit در یک واحد خرید
 */
export const computeCostPerBase = (pricePerUnit, factor) => {
    const p = Number(pricePerUnit) || 0;
    const f = Number(factor) || 1;
    return f > 0 ? p / f : 0;
};

/**
 * میانگین موزون بعد از یک خرید جدید
 */
export const computeWeightedAverage = ({
    oldStock = 0,
    oldValue = 0,
    addedStock = 0,
    addedValue = 0,
}) => {
    const newStock = oldStock + addedStock;
    const newValue = oldValue + addedValue;
    return {
        newStock,
        newValue,
        newAvgCost: newStock > 0 ? newValue / newStock : 0,
    };
};

/**
 * قیمت پیشنهادی فروش بر اساس درصد سود دلخواه
 */
export const computeSuggestedPrice = (avgCost, factor, targetMargin) => {
    const costForUnit = (Number(avgCost) || 0) * (Number(factor) || 1);
    const margin = Number(targetMargin) || 0;
    return costForUnit * (1 + margin / 100);
};

/**
 * متریک‌های کامل یک saleOption
 */
export const computeSaleOption = (option, avgCost) =>
    computeSaleOptionMetrics(option, avgCost);

/**
 * پیدا کردن saleOption پیش‌فرض
 */
export const getDefaultSaleOption = (product) => {
    if (!product?.saleOptions?.length) return null;
    return product.saleOptions.find((o) => o.isDefault) || product.saleOptions[0];
};

/**
 * پیدا کردن saleOption با یک واحد مشخص
 */
export const findSaleOptionByUnit = (product, unit) => {
    if (!product?.saleOptions?.length) return null;
    return product.saleOptions.find((o) => o.unit === unit) || null;
};

/**
 * اعتبارسنجی نسبت تبدیل فیزیکی
 * (مثال: کیلو ↔ متر مربع برای پلاستیک)
 */
export const computeConversion = (conversions, fromUnit, toUnit, amount) => {
    if (!Array.isArray(conversions) || !conversions.length) return null;

    // Direct
    const direct = conversions.find(
        (c) => c.fromUnit === fromUnit && c.toUnit === toUnit
    );
    if (direct) return (Number(amount) || 0) * (Number(direct.ratio) || 1);

    // Reverse
    const reverse = conversions.find(
        (c) => c.fromUnit === toUnit && c.toUnit === fromUnit
    );
    if (reverse && Number(reverse.ratio) > 0) {
        return (Number(amount) || 0) / Number(reverse.ratio);
    }

    return null;
};

/**
 * آیا این واحد با واحد پایه سازگار است (factor مثبت)؟
 */
export const isValidSaleOptionFactor = (baseUnit, saleUnit, factor) => {
    const f = Number(factor);
    if (!Number.isFinite(f) || f <= 0) return false;
    if (baseUnit === saleUnit) return f === 1;
    return true;
};

export default {
    computeCostPerBase,
    computeWeightedAverage,
    computeSuggestedPrice,
    computeSaleOption,
    getDefaultSaleOption,
    findSaleOptionByUnit,
    computeConversion,
    isValidSaleOptionFactor,
};