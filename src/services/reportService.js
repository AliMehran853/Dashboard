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
// Sale Amount
// ---------------------------------------------------------

const getSaleAmount = (
    sale
) => {

    if (!sale) {

        return 0;

    }


    // =====================================================
    // Direct Amount
    // =====================================================

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


    for (
        const candidate of
        amountCandidates
    ) {

        if (
            candidate === null ||
            candidate === undefined ||
            candidate === ''
        ) {

            continue;

        }


        const number =
            Number(
                candidate
            );


        if (
            Number.isFinite(
                number
            )
        ) {

            return number;

        }

    }


    // =====================================================
    // Price × Quantity
    // =====================================================

    const price =
        Number(
            sale.sellPrice ??
            sale.price ??
            sale.unitPrice ??
            0
        );


    const quantity =
        Number(
            sale.quantity ??
            sale.qty ??
            1
        );


    if (
        Number.isFinite(price) &&
        Number.isFinite(quantity)
    ) {

        return (
            price *
            quantity
        );

    }


    // =====================================================
    // Multiple Items
    // =====================================================

    if (
        Array.isArray(
            sale.items
        )
    ) {

        return sale.items.reduce(
            (
                total,
                item
            ) => {

                const itemPrice =
                    Number(
                        item?.sellPrice ??
                        item?.price ??
                        item?.unitPrice ??
                        0
                    );


                const itemQuantity =
                    Number(
                        item?.quantity ??
                        item?.qty ??
                        1
                    );


                if (
                    !Number.isFinite(
                        itemPrice
                    ) ||
                    !Number.isFinite(
                        itemQuantity
                    )
                ) {

                    return total;

                }


                return (
                    total +
                    (
                        itemPrice *
                        itemQuantity
                    )
                );

            },
            0
        );

    }


    return 0;

};


// ---------------------------------------------------------
// Sale Quantity
// ---------------------------------------------------------

const getSaleQuantity = (
    sale
) => {

    const quantity =
        Number(
            sale?.quantity ??
            sale?.qty
        );


    if (
        Number.isFinite(
            quantity
        )
    ) {

        return quantity;

    }


    if (
        Array.isArray(
            sale?.items
        )
    ) {

        return sale.items.reduce(
            (
                total,
                item
            ) => {

                const itemQuantity =
                    Number(
                        item?.quantity ??
                        item?.qty ??
                        0
                    );


                return (
                    total +
                    (
                        Number.isFinite(
                            itemQuantity
                        )
                            ? itemQuantity
                            : 0
                    )
                );

            },
            0
        );

    }


    return 0;

};


// ---------------------------------------------------------
// Start Of Day
// ---------------------------------------------------------

const startOfDay = (
    date
) => {

    const result =
        new Date(
            date
        );


    result.setHours(
        0,
        0,
        0,
        0
    );


    return result;

};


// ---------------------------------------------------------
// End Of Day
// ---------------------------------------------------------

const endOfDay = (
    date
) => {

    const result =
        new Date(
            date
        );


    result.setHours(
        23,
        59,
        59,
        999
    );


    return result;

};


// ---------------------------------------------------------
// Local Date Key
// ---------------------------------------------------------

const getLocalDateKey = (
    date
) => {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            '0'
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            '0'
        );


    return (
        `${year}-${month}-${day}`
    );

};


// ---------------------------------------------------------
// Period Range
// ---------------------------------------------------------

const getPeriodRange = (
    period
) => {

    const today =
        new Date();


    // =====================================================
    // Today
    // =====================================================

    if (
        period === 'today'
    ) {

        return {

            start:
                startOfDay(
                    today
                ),

            end:
                endOfDay(
                    today
                ),

        };

    }


    // =====================================================
    // Yesterday
    // =====================================================

    if (
        period === 'yesterday'
    ) {

        const yesterday =
            new Date(
                today
            );


        yesterday.setDate(
            yesterday.getDate() - 1
        );


        return {

            start:
                startOfDay(
                    yesterday
                ),

            end:
                endOfDay(
                    yesterday
                ),

        };

    }


    // =====================================================
    // Week
    // =====================================================

    if (
        period === 'week'
    ) {

        const start =
            new Date(
                today
            );


        start.setDate(
            start.getDate() - 6
        );


        return {

            start:
                startOfDay(
                    start
                ),

            end:
                endOfDay(
                    today
                ),

        };

    }


    // =====================================================
    // Month
    // =====================================================

    if (
        period === 'month'
    ) {

        const start =
            new Date(
                today.getFullYear(),
                today.getMonth(),
                1
            );


        return {

            start:
                startOfDay(
                    start
                ),

            end:
                endOfDay(
                    today
                ),

        };

    }


    // =====================================================
    // Year
    // =====================================================

    if (
        period === 'year'
    ) {

        const start =
            new Date(
                today.getFullYear(),
                0,
                1
            );


        return {

            start:
                startOfDay(
                    start
                ),

            end:
                endOfDay(
                    today
                ),

        };

    }


    // =====================================================
    // Default = Week
    // =====================================================

    const start =
        new Date(
            today
        );


    start.setDate(
        start.getDate() - 6
    );


    return {

        start:
            startOfDay(
                start
            ),

        end:
            endOfDay(
                today
            ),

    };

};


// ---------------------------------------------------------
// Normalize Payment Type
// ---------------------------------------------------------

const normalizePaymentType = (
    paymentType
) => {

    return String(
        paymentType || ''
    )
        .trim()
        .toLowerCase();

};


// ---------------------------------------------------------
// Is Cash
// ---------------------------------------------------------

const isCashPayment = (
    paymentType
) => {

    const value =
        normalizePaymentType(
            paymentType
        );


    return (

        value === 'cash' ||

        value === 'نقدی' ||

        value === 'نقد'

    );

};


// ---------------------------------------------------------
// Is Credit
// ---------------------------------------------------------

const isCreditPayment = (
    paymentType
) => {

    const value =
        normalizePaymentType(
            paymentType
        );


    return (

        value === 'credit' ||

        value === 'نسیه'

    );

};


// ---------------------------------------------------------
// Normalize Sale Date
// ---------------------------------------------------------

const parseSaleDate = (
    sale
) => {

    const value =
        getSaleDate(
            sale
        );


    if (!value) {

        return null;

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

        return null;

    }


    return date;

};


// ---------------------------------------------------------
// Normalize Search
// ---------------------------------------------------------

const normalizeSearch = (
    value
) => {

    return String(
        value || ''
    )
        .trim()
        .toLowerCase();

};


// ---------------------------------------------------------
// Sale Matches Search
// ---------------------------------------------------------

const saleMatchesSearch = (
    sale,
    search
) => {

    const normalizedSearch =
        normalizeSearch(
            search
        );


    if (
        !normalizedSearch
    ) {

        return true;

    }


    const searchableText = [

        sale?.productName,

        sale?.category,

        sale?.customerName,

        sale?.customerPhone,

        sale?.note,

        sale?.paymentType,

    ]
        .filter(
            Boolean
        )
        .join(
            ' '
        )
        .toLowerCase();


    return searchableText.includes(
        normalizedSearch
    );

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


    // =====================================================
    // Get All Sales
    // =====================================================

    const allSales =
        await db.sales.toArray();


    // =====================================================
    // Period
    // =====================================================

    const {
        start,
        end,
    } =
        getPeriodRange(
            period
        );


    // =====================================================
    // Normalize Filters
    // =====================================================

    const normalizedPaymentType =
        normalizePaymentType(
            paymentType
        );


    const normalizedSearch =
        normalizeSearch(
            search
        );


    // =====================================================
    // Filter Sales
    // =====================================================

    const filteredSales =
        allSales.filter(
            (sale) => {

                // -----------------------------------------
                // Date
                // -----------------------------------------

                const saleDate =
                    parseSaleDate(
                        sale
                    );


                if (!saleDate) {

                    return false;

                }


                if (
                    saleDate < start ||
                    saleDate > end
                ) {

                    return false;

                }


                // -----------------------------------------
                // Payment
                // -----------------------------------------

                if (
                    normalizedPaymentType !==
                    'all'
                ) {

                    const salePayment =
                        normalizePaymentType(
                            sale?.paymentType
                        );


                    if (
                        salePayment !==
                        normalizedPaymentType
                    ) {

                        return false;

                    }

                }


                // -----------------------------------------
                // Category
                // -----------------------------------------

                if (
                    category !== 'all'
                ) {

                    const saleCategory =
                        String(
                            sale?.category ||
                            ''
                        ).trim();


                    if (
                        saleCategory !==
                        String(
                            category
                        ).trim()
                    ) {

                        return false;

                    }

                }


                // -----------------------------------------
                // Search
                // -----------------------------------------

                if (
                    normalizedSearch
                ) {

                    if (
                        !saleMatchesSearch(
                            sale,
                            normalizedSearch
                        )
                    ) {

                        return false;

                    }

                }


                return true;

            }
        );


    // =====================================================
    // Statistics
    // =====================================================

    let totalRevenue = 0;

    let cashSales = 0;

    let creditSales = 0;

    let totalItems = 0;


    filteredSales.forEach(
        (sale) => {

            // ---------------------------------------------
            // Amount
            // ---------------------------------------------

            const amount =
                getSaleAmount(
                    sale
                );


            totalRevenue +=
                amount;


            // ---------------------------------------------
            // Payment
            // ---------------------------------------------

            if (
                isCashPayment(
                    sale?.paymentType
                )
            ) {

                cashSales +=
                    amount;

            } else if (
                isCreditPayment(
                    sale?.paymentType
                )
            ) {

                creditSales +=
                    amount;

            } else {

                // Unknown payment types are treated as cash
                // to keep the financial total consistent.

                cashSales +=
                    amount;

            }


            // ---------------------------------------------
            // Quantity
            // ---------------------------------------------

            totalItems +=
                getSaleQuantity(
                    sale
                );

        }
    );


    // =====================================================
    // Transactions
    // =====================================================

    const totalTransactions =
        filteredSales.length;


    // =====================================================
    // Average Sale
    // =====================================================

    const averageSale =
        totalTransactions > 0

            ? Math.round(
                totalRevenue /
                totalTransactions
            )

            : 0;


    // =====================================================
    // Sales Trend
    // =====================================================

    const salesByDate = {};


    filteredSales.forEach(
        (sale) => {

            const date =
                parseSaleDate(
                    sale
                );


            if (!date) {

                return;

            }


            const key =
                getLocalDateKey(
                    date
                );


            if (
                !salesByDate[key]
            ) {

                salesByDate[key] =
                    0;

            }


            salesByDate[key] +=
                getSaleAmount(
                    sale
                );

        }
    );


    // =====================================================
    // Build Trend
    // =====================================================

    const salesTrend = [];


    const current =
        new Date(
            start
        );


    while (
        current <= end
    ) {

        const key =
            getLocalDateKey(
                current
            );


        const dayName =
            current.toLocaleDateString(
                'fa-AF',
                {
                    weekday:
                        'long',
                }
            );


        salesTrend.push({

            date:
                dayName,

            isoDate:
                key,

            sales:
                salesByDate[key] ||
                0,

        });


        current.setDate(
            current.getDate() + 1
        );

    }


    // =====================================================
    // Payment Distribution
    // =====================================================

    const paymentDistribution = [

        {

            name:
                'نقدی',

            value:
                cashSales,

        },

        {

            name:
                'نسیه',

            value:
                creditSales,

        },

    ];


    // =====================================================
    // Category Sales
    // =====================================================

    const categoryMap = {};


    filteredSales.forEach(
        (sale) => {

            const saleCategory =
                String(
                    sale?.category ||
                    ''
                ).trim();


            const categoryName =
                saleCategory ||
                'بدون دسته‌بندی';


            const amount =
                getSaleAmount(
                    sale
                );


            if (
                !categoryMap[
                    categoryName
                ]
            ) {

                categoryMap[
                    categoryName
                ] = 0;

            }


            categoryMap[
                categoryName
            ] +=
                amount;

        }
    );


    const categorySales =
        Object.entries(
            categoryMap
        )
            .map(
                ([
                    categoryName,
                    sales,
                ]) => ({

                    category:
                        categoryName,

                    sales:
                        sales,

                })
            )
            .sort(
                (
                    first,
                    second
                ) =>
                    second.sales -
                    first.sales
            );


    // =====================================================
    // Best Category
    // =====================================================

    const bestCategory =
        categorySales[0];


    // =====================================================
    // Return
    // =====================================================

    return {

        statistics: {

            // -------------------------------------------------
            // IMPORTANT:
            //
            // totalSales = COUNT
            // totalRevenue = MONEY
            // -------------------------------------------------

            totalSales:
                totalTransactions,

            totalTransactions:
                totalTransactions,

            totalRevenue:
                totalRevenue,

            cashSales:
                cashSales,

            creditSales:
                creditSales,

        },


        salesTrend,


        paymentDistribution,


        categorySales,


        summary: {

            bestCategory:
                bestCategory?.category ||
                '-',

            bestCategorySales:
                bestCategory?.sales ||
                0,

            averageSale:
                averageSale,

            totalItems:
                totalItems,

        },


        // Keep filtered sales for exports
        rawSales:
            filteredSales,

    };

};


// =========================================================
// Categories For Report Filter
// =========================================================

export const getReportCategories =
    async () => {

        await initializeDatabase();


        return db.categories
            .orderBy(
                'name'
            )
            .toArray();

    };


// =========================================================
// Default Export
// =========================================================

export default {

    getSalesReport,

    getReportCategories,

};