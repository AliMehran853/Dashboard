import {
    db,
    initializeDatabase,
    addCustomer,
} from '../database/db';


// =========================================================
// Helpers
// =========================================================

// ---------------------------------------------------------
// Number
// ---------------------------------------------------------

const normalizeNumber = (
    value
) => {

    const number =
        Number(
            value
        );


    return Number.isFinite(
        number
    )
        ? number
        : 0;

};


// ---------------------------------------------------------
// ID
// ---------------------------------------------------------

const normalizeId = (
    value
) => {

    const id =
        Number(
            value
        );


    return (
        Number.isFinite(id) &&
        id > 0
    )
        ? id
        : null;

};


// ---------------------------------------------------------
// Sale Date
// ---------------------------------------------------------

const getSaleDate = (
    sale
) => {

    return (
        sale?.date ||
        sale?.createdAt ||
        sale?.updatedAt ||
        null
    );

};


// ---------------------------------------------------------
// Sale Total
// ---------------------------------------------------------

const getSaleTotal = (
    sale
) => {

    // =====================================================
    // Stored Total
    // =====================================================

    const directTotal =
        sale?.total;


    if (
        directTotal !== undefined &&
        directTotal !== null
    ) {

        const total =
            Number(
                directTotal
            );


        if (
            Number.isFinite(
                total
            )
        ) {

            return total;

        }

    }


    // =====================================================
    // totalAmount
    // =====================================================

    const totalAmount =
        sale?.totalAmount;


    if (
        totalAmount !== undefined &&
        totalAmount !== null
    ) {

        const total =
            Number(
                totalAmount
            );


        if (
            Number.isFinite(
                total
            )
        ) {

            return total;

        }

    }


    // =====================================================
    // Fallback
    // =====================================================

    return (

        normalizeNumber(
            sale?.quantity
        ) *

        normalizeNumber(
            sale?.unitPrice
        )

    );

};


// ---------------------------------------------------------
// Payment Type
// ---------------------------------------------------------

const normalizePaymentType = (
    value
) => {

    return value === 'credit'
        ? 'credit'
        : 'cash';

};


// ---------------------------------------------------------
// Database Event
// ---------------------------------------------------------

const dispatchDatabaseEvent = (
    eventName
) => {

    if (
        typeof window ===
        'undefined'
    ) {

        return;

    }


    window.dispatchEvent(
        new Event(
            eventName
        )
    );

};


// ---------------------------------------------------------
// Sale Events
// ---------------------------------------------------------

const dispatchSaleUpdatedEvents = ({
    credit = false,
    product = false,
    customer = false,
} = {}) => {

    dispatchDatabaseEvent(
        'sales-updated'
    );


    dispatchDatabaseEvent(
        'database-updated'
    );


    if (product) {

        dispatchDatabaseEvent(
            'products-updated'
        );

    }


    if (customer) {

        dispatchDatabaseEvent(
            'customers-updated'
        );

    }


    if (credit) {

        dispatchDatabaseEvent(
            'credit-sales-updated'
        );

    }

};


// =========================================================
// Add Sale
// =========================================================

export const addSale = async (
    sale
) => {

    await initializeDatabase();


    if (!sale) {

        throw new Error(
            'اطلاعات فروش ارسال نشده است.'
        );

    }


    // =====================================================
    // Product
    // =====================================================

    const productId =
        normalizeId(
            sale.productId
        );


    if (!productId) {

        throw new Error(
            'محصول انتخاب نشده است.'
        );

    }


    // =====================================================
    // Quantity
    // =====================================================

    const quantity =
        normalizeNumber(
            sale.quantity
        );


    if (
        quantity <= 0
    ) {

        throw new Error(
            'تعداد باید بیشتر از صفر باشد.'
        );

    }


    // =====================================================
    // Unit Price
    // =====================================================

    const unitPrice =
        normalizeNumber(
            sale.unitPrice
        );


    if (
        unitPrice < 0
    ) {

        throw new Error(
            'قیمت فروش معتبر نیست.'
        );

    }


    // =====================================================
    // Payment
    // =====================================================

    const paymentType =
        normalizePaymentType(
            sale.paymentType
        );


    // =====================================================
    // Customer
    // =====================================================

    const customerName =
        sale.customerName?.trim() ||
        '';


    const customerPhone =
        sale.customerPhone?.trim() ||
        '';


    const note =
        sale.note?.trim() ||
        '';


    if (
        paymentType === 'credit' &&
        !customerName &&
        !sale.customerId
    ) {

        throw new Error(
            'برای فروش نسیه باید اطلاعات مشتری وارد شود.'
        );

    }


    // =====================================================
    // Category
    // =====================================================

    const category =
        sale.category?.trim() ||
        '';


    // =====================================================
    // Dates
    // =====================================================

    const saleDate =
        sale.date ||
        new Date().toISOString();


    const now =
        new Date().toISOString();


    // =====================================================
    // Result
    // =====================================================

    let saleResult =
        null;


    let createdCustomer =
        false;


    // =====================================================
    // Transaction
    // =====================================================

    await db.transaction(
        'rw',

        db.products,
        db.sales,
        db.creditSales,
        db.customers,

        async () => {

            // =============================================
            // Product
            // =============================================

            const product =
                await db.products.get(
                    productId
                );


            if (!product) {

                throw new Error(
                    'محصول پیدا نشد.'
                );

            }


            // =============================================
            // Stock
            // =============================================

            const currentStock =
                normalizeNumber(
                    product.stock
                );


            if (
                currentStock <
                quantity
            ) {

                throw new Error(
                    `موجودی کافی نیست. موجودی فعلی: ${currentStock}`
                );

            }


            // =============================================
            // Customer
            // =============================================

            let customerId =
                normalizeId(
                    sale.customerId
                );


            if (
                customerId
            ) {

                const existingCustomer =
                    await db.customers.get(
                        customerId
                    );


                if (
                    !existingCustomer
                ) {

                    throw new Error(
                        'مشتری پیدا نشد.'
                    );

                }

            } else if (
                customerName ||
                customerPhone
            ) {

                const customer =
                    await addCustomer({

                        name:
                            customerName,

                        phone:
                            customerPhone,

                    });


                customerId =
                    customer.id;


                createdCustomer =
                    true;

            }


            // =============================================
            // Credit Validation
            // =============================================

            if (
                paymentType === 'credit' &&
                !customerId
            ) {

                throw new Error(
                    'برای فروش نسیه باید اطلاعات مشتری وارد شود.'
                );

            }


            // =============================================
            // Total
            // =============================================

            const total =
                quantity *
                unitPrice;


            // =============================================
            // Sale Object
            // =============================================

            const newSale = {

                productId:
                    product.id,

                productName:
                    product.name,

                category:
                    category ||
                    product.category ||
                    '',

                quantity,

                unitPrice,

                total,

                paymentType,

                customerId:
                    customerId ||
                    null,

                customerName,

                customerPhone,

                note,

                date:
                    saleDate,

                createdAt:
                    now,

            };


            // =============================================
            // Add Sale
            // =============================================

            const saleId =
                await db.sales.add(
                    newSale
                );


            // =============================================
            // Decrease Stock
            // =============================================

            const newStock =
                currentStock -
                quantity;


            await db.products.update(
                product.id,
                {

                    stock:
                        newStock,

                    updatedAt:
                        now,

                }
            );


            // =============================================
            // Credit
            // =============================================

            if (
                paymentType ===
                'credit'
            ) {

                await db.creditSales.add({

                    saleId,

                    customerId,

                    amount:
                        total,

                    status:
                        'pending',

                    dueDate:
                        sale.dueDate ||
                        null,

                    createdAt:
                        now,

                });

            }


            // =============================================
            // Result
            // =============================================

            saleResult = {

                id:
                    saleId,

                ...newSale,

            };

        }

    );


    // =====================================================
    // Events
    // =====================================================

    dispatchSaleUpdatedEvents({

        credit:
            saleResult?.paymentType ===
            'credit',

        product:
            true,

        customer:
            createdCustomer,

    });


    return saleResult;

};


// =========================================================
// Get Sales
// =========================================================

export const getSales =
    async () => {

        await initializeDatabase();


        return db.sales
            .orderBy(
                'createdAt'
            )
            .reverse()
            .toArray();

    };


// =========================================================
// Get Sale
// =========================================================

export const getSale =
    async (
        id
    ) => {

        await initializeDatabase();


        const saleId =
            normalizeId(
                id
            );


        if (!saleId) {

            return null;

        }


        return db.sales.get(
            saleId
        );

    };


// =========================================================
// Get Today's Sales
// =========================================================

export const getTodaySales =
    async () => {

        await initializeDatabase();


        const sales =
            await getSales();


        const today =
            new Date();


        const year =
            today.getFullYear();


        const month =
            today.getMonth();


        const day =
            today.getDate();


        return sales.filter(
            (sale) => {

                const value =
                    getSaleDate(
                        sale
                    );


                if (!value) {

                    return false;

                }


                const date =
                    new Date(
                        value
                    );


                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {

                    return false;

                }


                return (

                    date.getFullYear() ===
                    year &&

                    date.getMonth() ===
                    month &&

                    date.getDate() ===
                    day

                );

            }
        );

    };


// =========================================================
// Today's Statistics
// =========================================================

export const getTodaySalesStatistics =
    async () => {

        const sales =
            await getTodaySales();


        let totalSales =
            0;


        let cashSales =
            0;


        let creditSales =
            0;


        let totalItems =
            0;


        sales.forEach(
            (sale) => {

                const total =
                    getSaleTotal(
                        sale
                    );


                const quantity =
                    normalizeNumber(
                        sale.quantity
                    );


                totalSales +=
                    total;


                totalItems +=
                    quantity;


                if (
                    sale.paymentType ===
                    'credit'
                ) {

                    creditSales +=
                        total;

                } else {

                    cashSales +=
                        total;

                }

            }
        );


        return {

            totalSales,

            cashSales,

            creditSales,

            totalItems,

            salesCount:
                sales.length,

        };

    };


// =========================================================
// Delete Sale
// =========================================================

export const deleteSale =
    async (
        id
    ) => {

        await initializeDatabase();


        const saleId =
            normalizeId(
                id
            );


        if (!saleId) {

            throw new Error(
                'شناسه فروش معتبر نیست.'
            );

        }


        let deletedSale =
            null;


        await db.transaction(
            'rw',

            db.sales,

            db.products,

            db.creditSales,

            async () => {

                // =========================================
                // Sale
                // =========================================

                const sale =
                    await db.sales.get(
                        saleId
                    );


                if (!sale) {

                    throw new Error(
                        'فروش پیدا نشد.'
                    );

                }


                deletedSale =
                    sale;


                // =========================================
                // Restore Stock
                // =========================================

                const product =
                    await db.products.get(
                        sale.productId
                    );


                if (
                    product
                ) {

                    const currentStock =
                        normalizeNumber(
                            product.stock
                        );


                    const saleQuantity =
                        normalizeNumber(
                            sale.quantity
                        );


                    await db.products.update(
                        product.id,
                        {

                            stock:
                                currentStock +
                                saleQuantity,

                            updatedAt:
                                new Date()
                                    .toISOString(),

                        }
                    );

                }


                // =========================================
                // Credit
                // =========================================

                await db.creditSales
                    .where(
                        'saleId'
                    )
                    .equals(
                        saleId
                    )
                    .delete();


                // =========================================
                // Delete
                // =========================================

                await db.sales.delete(
                    saleId
                );

            }
        );


        // =================================================
        // Events
        // =================================================

        dispatchSaleUpdatedEvents({

            credit:
                deletedSale?.paymentType ===
                'credit',

            product:
                true,

        });


        return true;

    };


// =========================================================
// Get Sales By Date Range
// =========================================================

export const getSalesByDateRange =
    async (
        startDate,
        endDate
    ) => {

        await initializeDatabase();


        const start =
            new Date(
                startDate
            );


        const end =
            new Date(
                endDate
            );


        if (
            Number.isNaN(
                start.getTime()
            ) ||
            Number.isNaN(
                end.getTime()
            )
        ) {

            return [];

        }


        const sales =
            await getSales();


        return sales.filter(
            (sale) => {

                const value =
                    getSaleDate(
                        sale
                    );


                if (!value) {

                    return false;

                }


                const date =
                    new Date(
                        value
                    );


                if (
                    Number.isNaN(
                        date.getTime()
                    )
                ) {

                    return false;

                }


                return (

                    date >= start &&
                    date <= end

                );

            }
        );

    };


// =========================================================
// Payment Statistics
// =========================================================

export const getPaymentStatistics =
    async () => {

        await initializeDatabase();


        const sales =
            await getSales();


        let cash =
            0;


        let credit =
            0;


        sales.forEach(
            (sale) => {

                const total =
                    getSaleTotal(
                        sale
                    );


                if (
                    sale.paymentType ===
                    'credit'
                ) {

                    credit +=
                        total;

                } else {

                    cash +=
                        total;

                }

            }
        );


        return {

            cash,

            credit,

            total:
                cash +
                credit,

        };

    };


// =========================================================
// Category Sales Statistics
// =========================================================

export const getCategorySalesStatistics =
    async () => {

        await initializeDatabase();


        const sales =
            await getSales();


        const result =
            {};


        sales.forEach(
            (sale) => {

                const category =
                    sale.category?.trim() ||
                    '';


                const key =
                    category ||
                    '__uncategorized__';


                if (
                    !result[key]
                ) {

                    result[key] = {

                        category,

                        amount:
                            0,

                        quantity:
                            0,

                    };

                }


                result[key].amount +=
                    getSaleTotal(
                        sale
                    );


                result[key].quantity +=
                    normalizeNumber(
                        sale.quantity
                    );

            }
        );


        return Object.values(
            result
        );

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

    deleteSale,

    getSalesByDateRange,

    getPaymentStatistics,

    getCategorySalesStatistics,

};