import * as XLSX from 'xlsx';

import {
    formatJalaliDate,
} from '../date/jalali';


// =========================================================
// Constants
// =========================================================

const STORE_SETTINGS_KEY =
    'storeSettings';


// =========================================================
// Safe Number
// =========================================================

const toNumber = (
    value
) => {

    const number =
        Number(value);

    return Number.isFinite(
        number
    )
        ? number
        : 0;

};


// =========================================================
// Safe String
// =========================================================

const toString = (
    value
) => {

    if (
        value === null ||
        value === undefined
    ) {

        return '';

    }

    return String(
        value
    ).trim();

};


// =========================================================
// Is English
// =========================================================

const isEnglishLanguage = (
    language
) => {

    return String(
        language || ''
    )
        .toLowerCase()
        .startsWith(
            'en'
        );

};


// =========================================================
// Sale Amount
// =========================================================

const getSaleAmount = (
    sale
) => {

    if (!sale) {

        return 0;

    }


    const directAmountCandidates = [

        sale.totalAmount,

        sale.total,

        sale.amount,

        sale.saleAmount,

        sale.finalAmount,

        sale.finalPrice,

        sale.payableAmount,

        sale.grandTotal,

    ];


    for (
        const candidate of
        directAmountCandidates
    ) {

        if (
            candidate !== null &&
            candidate !== undefined &&
            candidate !== ''
        ) {

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

    }


    // -------------------------------------------------------
    // Single Sale
    // -------------------------------------------------------

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


    // -------------------------------------------------------
    // Multiple Items
    // -------------------------------------------------------

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
                        item.sellPrice ??
                        item.price ??
                        item.unitPrice ??
                        0
                    );


                const itemQuantity =
                    Number(
                        item.quantity ??
                        item.qty ??
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


// =========================================================
// Sale Quantity
// =========================================================

const getSaleQuantity = (
    sale
) => {

    const quantity =
        Number(
            sale?.quantity ??
            sale?.qty ??
            1
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


// =========================================================
// Sale Date
// =========================================================

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


// =========================================================
// Parse Date
// =========================================================

const getValidDate = (
    value
) => {

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


// =========================================================
// Format Date
// =========================================================

const formatDate = (
    value,
    language
) => {

    const date =
        getValidDate(
            value
        );


    if (!date) {

        return '-';

    }


    const isEnglish =
        isEnglishLanguage(
            language
        );


    if (isEnglish) {

        return new Intl.DateTimeFormat(
            'en-US',
            {
                year:
                    'numeric',

                month:
                    '2-digit',

                day:
                    '2-digit',
            }
        ).format(
            date
        );

    }


    return (
        formatJalaliDate(
            date,
            {
                monthStyle:
                    'af',

                withMonthName:
                    true,
            }
        ) ||
        '-'
    );

};


// =========================================================
// Format Time
// =========================================================

const formatTime = (
    value,
    language
) => {

    const date =
        getValidDate(
            value
        );


    if (!date) {

        return '-';

    }


    const isEnglish =
        isEnglishLanguage(
            language
        );


    return new Intl.DateTimeFormat(
        isEnglish
            ? 'en-US'
            : 'fa-AF',
        {
            hour:
                '2-digit',

            minute:
                '2-digit',
        }
    ).format(
        date
    );

};


// =========================================================
// Format Money
// =========================================================

const formatMoney = (
    value,
    language
) => {

    return toNumber(
        value
    ).toLocaleString(
        isEnglishLanguage(
            language
        )
            ? 'en-US'
            : 'fa-IR'
    );

};


// =========================================================
// Payment Label
// =========================================================

const getPaymentLabel = (
    paymentType,
    language
) => {

    const value =
        toString(
            paymentType
        ).toLowerCase();


    const isEnglish =
        isEnglishLanguage(
            language
        );


    if (
        value === 'credit' ||
        value === 'نسیه'
    ) {

        return isEnglish
            ? 'Credit'
            : 'نسیه';

    }


    return isEnglish
        ? 'Cash'
        : 'نقدی';

};


// =========================================================
// Get Store Settings
// =========================================================

const getStoreSettings = () => {

    try {

        const stored =
            localStorage.getItem(
                STORE_SETTINGS_KEY
            );


        if (!stored) {

            return {

                storeName:
                    'فروشگاه من',

                ownerName:
                    'مدیر فروشگاه',

                phone:
                    '',

                address:
                    '',

            };

        }


        const parsed =
            JSON.parse(
                stored
            );


        return {

            storeName:
                toString(
                    parsed?.storeName
                ) ||
                'فروشگاه من',

            ownerName:
                toString(
                    parsed?.ownerName
                ) ||
                'مدیر فروشگاه',

            phone:
                toString(
                    parsed?.phone
                ),

            address:
                toString(
                    parsed?.address
                ),

        };

    } catch (
        error
    ) {

        console.error(
            'Excel Store Settings Read Error:',
            error
        );


        return {

            storeName:
                'فروشگاه من',

            ownerName:
                'مدیر فروشگاه',

            phone:
                '',

            address:
                '',

        };

    }

};


// =========================================================
// Get Period Label
// =========================================================

const getPeriodLabel = (
    period,
    language
) => {

    const isEnglish =
        isEnglishLanguage(
            language
        );


    const labels = {

        all:
            isEnglish
                ? 'All'
                : 'همه',

        today:
            isEnglish
                ? 'Today'
                : 'امروز',

        week:
            isEnglish
                ? 'This Week'
                : 'این هفته',

        month:
            isEnglish
                ? 'This Month'
                : 'این ماه',

    };


    return (
        labels[
            period
        ] ||
        labels.week
    );

};


// =========================================================
// Get Category Amount
// =========================================================

const getCategoryAmount = (
    item
) => {

    return toNumber(
        item?.sales ??
        item?.amount ??
        item?.total ??
        0
    );

};


// =========================================================
// Get Payment Amount
// =========================================================

const getPaymentAmount = (
    item
) => {

    return toNumber(
        item?.value ??
        item?.amount ??
        item?.total ??
        0
    );

};


// =========================================================
// Calculate Report Totals
// =========================================================

const calculateReportTotals = (
    reportData
) => {

    const statistics =
        reportData?.statistics ||
        {};


    const summary =
        reportData?.summary ||
        {};


    const rawSales =
        Array.isArray(
            reportData?.rawSales
        )
            ? reportData.rawSales
            : [];


    // -------------------------------------------------------
    // Calculate from raw sales
    // -------------------------------------------------------

    const rawRevenue =
        rawSales.reduce(
            (
                total,
                sale
            ) =>
                total +
                getSaleAmount(
                    sale
                ),
            0
        );


    const rawCashRevenue =
        rawSales
            .filter(
                (sale) =>
                    String(
                        sale?.paymentType ||
                        ''
                    )
                        .toLowerCase() ===
                    'cash'
            )
            .reduce(
                (
                    total,
                    sale
                ) =>
                    total +
                    getSaleAmount(
                        sale
                    ),
                0
            );


    const rawCreditRevenue =
        rawSales
            .filter(
                (sale) =>
                    String(
                        sale?.paymentType ||
                        ''
                    )
                        .toLowerCase() ===
                    'credit'
            )
            .reduce(
                (
                    total,
                    sale
                ) =>
                    total +
                    getSaleAmount(
                        sale
                    ),
                0
            );


    const rawItems =
        rawSales.reduce(
            (
                total,
                sale
            ) =>
                total +
                getSaleQuantity(
                    sale
                ),
            0
        );


    const rawTransactions =
        rawSales.length;


    // -------------------------------------------------------
    // Revenue
    //
    // IMPORTANT:
    // A numeric zero from the report service must not override
    // the actual calculated revenue when raw sales are present.
    // -------------------------------------------------------

    const serviceRevenue =
        toNumber(
            statistics.totalRevenue
        );


    const serviceTotalSales =
        toNumber(
            statistics.totalSales
        );


    const revenue =
        rawRevenue > 0
            ? rawRevenue
            : (
                serviceRevenue > 0
                    ? serviceRevenue
                    : (
                        toNumber(
                            statistics.cashSales
                        ) +
                        toNumber(
                            statistics.creditSales
                        )
                    )
            );


    // -------------------------------------------------------
    // Transactions
    // -------------------------------------------------------

    const transactions =
        rawTransactions > 0
            ? rawTransactions
            : (
                toNumber(
                    statistics.totalTransactions
                ) > 0
                    ? toNumber(
                        statistics.totalTransactions
                    )
                    : serviceTotalSales
            );


    // -------------------------------------------------------
    // Items
    // -------------------------------------------------------

    const items =
        rawItems > 0
            ? rawItems
            : toNumber(
                summary.totalItems
            );


    // -------------------------------------------------------
    // Cash
    // -------------------------------------------------------

    const cashRevenue =
        rawCashRevenue > 0
            ? rawCashRevenue
            : toNumber(
                statistics.cashSales
            );


    // -------------------------------------------------------
    // Credit
    // -------------------------------------------------------

    const creditRevenue =
        rawCreditRevenue > 0
            ? rawCreditRevenue
            : toNumber(
                statistics.creditSales
            );


    // -------------------------------------------------------
    // Average
    // -------------------------------------------------------

    const average =
        transactions > 0
            ? (
                revenue /
                transactions
            )
            : toNumber(
                summary.averageSale
            );


    return {

        revenue,

        transactions,

        items,

        cashRevenue,

        creditRevenue,

        average,

    };

};


// =========================================================
// Escape For Sheet Text
// =========================================================

const cleanCellValue = (
    value
) => {

    if (
        value === null ||
        value === undefined
    ) {

        return '';

    }


    return value;

};


// =========================================================
// Export Report To Excel
// =========================================================

export const exportReportToExcel = ({
    reportData = {},
    period = 'week',
    paymentType = 'all',
    category = 'all',
    search = '',
    language = 'fa',
}) => {

    const isEnglish =
        isEnglishLanguage(
            language
        );


    // =====================================================
    // Store
    // =====================================================

    const store =
        getStoreSettings();


    // =====================================================
    // Data
    // =====================================================

    const statistics =
        reportData.statistics ||
        {};


    const summary =
        reportData.summary ||
        {};


    const rawSales =
        Array.isArray(
            reportData.rawSales
        )
            ? [...reportData.rawSales]
            : [];


    const categorySales =
        Array.isArray(
            reportData.categorySales
        )
            ? [...reportData.categorySales]
            : [];


    const paymentDistribution =
        Array.isArray(
            reportData.paymentDistribution
        )
            ? [...reportData.paymentDistribution]
            : [];


    // =====================================================
    // Sort Sales Newest First
    // =====================================================

    rawSales.sort(
        (
            first,
            second
        ) => {

            const firstTime =
                getValidDate(
                    getSaleDate(
                        first
                    )
                )?.getTime() || 0;


            const secondTime =
                getValidDate(
                    getSaleDate(
                        second
                    )
                )?.getTime() || 0;


            return (
                secondTime -
                firstTime
            );

        }
    );


    // =====================================================
    // Calculate Reliable Totals
    // =====================================================

    const totals =
        calculateReportTotals(
            {
                statistics,
                summary,
                rawSales,
            }
        );


    // =====================================================
    // Workbook
    // =====================================================

    const workbook =
        XLSX.utils.book_new();


    // =====================================================
    // Labels
    // =====================================================

    const label = {

        report:
            isEnglish
                ? 'Sales Report'
                : 'گزارش فروش',

        store:
            isEnglish
                ? 'Store'
                : 'فروشگاه',

        manager:
            isEnglish
                ? 'Manager'
                : 'مدیر',

        period:
            isEnglish
                ? 'Period'
                : 'بازه گزارش',

        payment:
            isEnglish
                ? 'Payment Type'
                : 'نوع پرداخت',

        category:
            isEnglish
                ? 'Category'
                : 'دسته‌بندی',

        search:
            isEnglish
                ? 'Search'
                : 'جستجو',

        all:
            isEnglish
                ? 'All'
                : 'همه',

        summary:
            isEnglish
                ? 'Report Summary'
                : 'خلاصه گزارش',

        totalRevenue:
            isEnglish
                ? 'Total Revenue'
                : 'مبلغ کل فروش',

        transactions:
            isEnglish
                ? 'Transactions'
                : 'تعداد تراکنش',

        totalItems:
            isEnglish
                ? 'Items Sold'
                : 'تعداد کالاهای فروخته‌شده',

        averageSale:
            isEnglish
                ? 'Average Sale'
                : 'متوسط فروش',

        cashSales:
            isEnglish
                ? 'Cash Sales'
                : 'فروش نقدی',

        creditSales:
            isEnglish
                ? 'Credit Sales'
                : 'فروش نسیه',

        bestCategory:
            isEnglish
                ? 'Best Category'
                : 'بهترین دسته',

        bestCategorySales:
            isEnglish
                ? 'Best Category Revenue'
                : 'مبلغ فروش بهترین دسته',

        sales:
            isEnglish
                ? 'Sales'
                : 'فروش‌ها',

        date:
            isEnglish
                ? 'Date'
                : 'تاریخ',

        time:
            isEnglish
                ? 'Time'
                : 'زمان',

        product:
            isEnglish
                ? 'Product'
                : 'محصول',

        quantity:
            isEnglish
                ? 'Quantity'
                : 'تعداد',

        unitPrice:
            isEnglish
                ? 'Unit Price'
                : 'قیمت واحد',

        amount:
            isEnglish
                ? 'Amount'
                : 'مبلغ',

        payment:
            isEnglish
                ? 'Payment'
                : 'پرداخت',

        customer:
            isEnglish
                ? 'Customer'
                : 'مشتری',

        note:
            isEnglish
                ? 'Note'
                : 'یادداشت',

        categorySummary:
            isEnglish
                ? 'Category Summary'
                : 'خلاصه دسته‌بندی',

        paymentSummary:
            isEnglish
                ? 'Payment Summary'
                : 'خلاصه پرداخت',

        salesAmount:
            isEnglish
                ? 'Sales Amount'
                : 'مبلغ فروش',

        share:
            isEnglish
                ? 'Share'
                : 'سهم',

        total:
            isEnglish
                ? 'Total'
                : 'مجموع',

    };


    // =====================================================
    // Summary Sheet
    // =====================================================

    const summaryRows = [

        [
            label.report,
            '',
        ],

        [
            label.store,
            cleanCellValue(
                store.storeName
            ),
        ],

        [
            label.manager,
            cleanCellValue(
                store.ownerName
            ),
        ],

        [
            label.period,
            getPeriodLabel(
                period,
                language
            ),
        ],

        [
            label.payment,
            paymentType === 'all'
                ? label.all
                : getPaymentLabel(
                    paymentType,
                    language
                ),
        ],

        [
            label.category,
            category === 'all'
                ? label.all
                : category,
        ],

        [
            label.search,
            search || '-',
        ],

        [],

        [
            label.summary,
            '',
        ],

        [
            label.totalRevenue,
            totals.revenue,
        ],

        [
            label.transactions,
            totals.transactions,
        ],

        [
            label.totalItems,
            totals.items,
        ],

        [
            label.averageSale,
            totals.average,
        ],

        [
            label.cashSales,
            totals.cashRevenue,
        ],

        [
            label.creditSales,
            totals.creditRevenue,
        ],

        [
            label.bestCategory,
            summary.bestCategory ||
            '-',
        ],

        [
            label.bestCategorySales,
            toNumber(
                summary.bestCategorySales
            ),
        ],

    ];


    const summarySheet =
        XLSX.utils.aoa_to_sheet(
            summaryRows
        );


    // -----------------------------------------------------
    // Summary Width
    // -----------------------------------------------------

    summarySheet['!cols'] = [

        {
            wch: 30,
        },

        {
            wch: 38,
        },

    ];


    // -----------------------------------------------------
    // Summary Formatting
    // -----------------------------------------------------

    summarySheet['A1'] = {
        t: 's',
        v: label.report,
    };


    summarySheet['A9'] = {
        t: 's',
        v: label.summary,
    };


    // Currency values
    const currencySummaryRows = [

        10,
        13,
        14,
        15,
        17,

    ];


    currencySummaryRows.forEach(
        (rowNumber) => {

            const cell =
                summarySheet[
                    `B${rowNumber}`
                ];


            if (cell) {

                cell.z =
                    '#,##0';

            }

        }
    );


    // -----------------------------------------------------
    // RTL
    // -----------------------------------------------------

    summarySheet['!sheetViews'] = [

        {
            rightToLeft:
                !isEnglish,
        },

    ];


    XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        isEnglish
            ? 'Summary'
            : 'خلاصه'
    );


    // =====================================================
    // Sales Sheet
    // =====================================================

    const salesRows =
        rawSales.map(
            (
                sale
            ) => {

                const saleDate =
                    getSaleDate(
                        sale
                    );


                const quantity =
                    getSaleQuantity(
                        sale
                    );


                const unitPrice =
                    toNumber(
                        sale?.unitPrice ??
                        sale?.sellPrice ??
                        sale?.price ??
                        0
                    );


                const amount =
                    getSaleAmount(
                        sale
                    );


                return {

                    [label.date]:
                        formatDate(
                            saleDate,
                            language
                        ),

                    [label.time]:
                        formatTime(
                            saleDate,
                            language
                        ),

                    [label.product]:
                        toString(
                            sale?.productName
                        ) ||
                        '-',

                    [label.category]:
                        toString(
                            sale?.category
                        ) ||
                        '-',

                    [label.quantity]:
                        quantity,

                    [label.unitPrice]:
                        unitPrice,

                    [label.amount]:
                        amount,

                    [label.payment]:
                        getPaymentLabel(
                            sale?.paymentType,
                            language
                        ),

                    [label.customer]:
                        toString(
                            sale?.customerName
                        ) ||
                        '-',

                    [label.note]:
                        toString(
                            sale?.note
                        ) ||
                        '-',

                };

            }
        );


    // -----------------------------------------------------
    // Sales Header + Rows
    // -----------------------------------------------------

    const salesSheet =
        XLSX.utils.json_to_sheet(
            salesRows
        );


    // -----------------------------------------------------
    // Sales Column Widths
    // -----------------------------------------------------

    salesSheet['!cols'] = [

        {
            wch: 16,
        },

        {
            wch: 10,
        },

        {
            wch: 26,
        },

        {
            wch: 18,
        },

        {
            wch: 12,
        },

        {
            wch: 16,
        },

        {
            wch: 18,
        },

        {
            wch: 16,
        },

        {
            wch: 24,
        },

        {
            wch: 30,
        },

    ];


    // -----------------------------------------------------
    // Number Formats
    // -----------------------------------------------------

    if (
        salesRows.length > 0
    ) {

        const headerRow =
            1;


        const bodyStart =
            2;


        const bodyEnd =
            salesRows.length +
            1;


        for (
            let row =
                bodyStart;

            row <=
            bodyEnd;

            row += 1
        ) {

            // Quantity
            if (
                salesSheet[
                    `E${row}`
                ]
            ) {

                salesSheet[
                    `E${row}`
                ].z =
                    '#,##0';

            }


            // Unit Price
            if (
                salesSheet[
                    `F${row}`
                ]
            ) {

                salesSheet[
                    `F${row}`
                ].z =
                    '#,##0';

            }


            // Amount
            if (
                salesSheet[
                    `G${row}`
                ]
            ) {

                salesSheet[
                    `G${row}`
                ].z =
                    '#,##0';

            }

        }


        // -------------------------------------------------
        // Filter
        // -------------------------------------------------

        salesSheet['!autofilter'] = {

            ref:
                `A${headerRow}:J${bodyEnd}`,

        };


        // -------------------------------------------------
        // Totals Row
        // -------------------------------------------------

        const totalRow =
            bodyEnd +
            2;


        salesSheet[
            `F${totalRow}`
        ] = {

            t:
                's',

            v:
                label.total,

        };


        salesSheet[
            `G${totalRow}`
        ] = {

            t:
                'n',

            v:
                totals.revenue,

            z:
                '#,##0',

        };


        // -------------------------------------------------
        // Total Quantity
        // -------------------------------------------------

        salesSheet[
            `E${totalRow}`
        ] = {

            t:
                'n',

            v:
                totals.items,

            z:
                '#,##0',

        };

    }


    // -----------------------------------------------------
    // RTL
    // -----------------------------------------------------

    salesSheet['!sheetViews'] = [

        {
            rightToLeft:
                !isEnglish,
        },

    ];


    XLSX.utils.book_append_sheet(
        workbook,
        salesSheet,
        isEnglish
            ? 'Sales'
            : 'فروش‌ها'
    );


    // =====================================================
    // Category Sheet
    // =====================================================

    const totalCategorySales =
        categorySales.reduce(
            (
                total,
                item
            ) =>
                total +
                getCategoryAmount(
                    item
                ),
            0
        );


    const categoryRows =
        categorySales
            .sort(
                (
                    first,
                    second
                ) =>
                    getCategoryAmount(
                        second
                    ) -
                    getCategoryAmount(
                        first
                    )
            )
            .map(
                (
                    item
                ) => {

                    const amount =
                        getCategoryAmount(
                            item
                        );


                    const share =
                        totalCategorySales >
                        0

                            ? (
                                amount /
                                totalCategorySales
                            )

                            : 0;


                    return {

                        [label.category]:
                            toString(
                                item?.category
                            ) ||
                            '-',

                        [label.salesAmount]:
                            amount,

                        [label.share]:
                            `${(
                                share *
                                100
                            ).toFixed(
                                1
                            )}%`,

                    };

                }
            );


    const categorySheet =
        XLSX.utils.json_to_sheet(
            categoryRows
        );


    categorySheet['!cols'] = [

        {
            wch: 30,
        },

        {
            wch: 22,
        },

        {
            wch: 14,
        },

    ];


    if (
        categoryRows.length > 0
    ) {

        const categoryBodyEnd =
            categoryRows.length +
            1;


        for (
            let row = 2;
            row <= categoryBodyEnd;
            row += 1
        ) {

            const cell =
                categorySheet[
                    `B${row}`
                ];


            if (cell) {

                cell.z =
                    '#,##0';

            }

        }


        categorySheet['!autofilter'] = {

            ref:
                `A1:C${categoryBodyEnd}`,

        };

    }


    categorySheet['!sheetViews'] = [

        {
            rightToLeft:
                !isEnglish,
        },

    ];


    XLSX.utils.book_append_sheet(
        workbook,
        categorySheet,
        isEnglish
            ? 'Categories'
            : 'دسته‌بندی‌ها'
    );


    // =====================================================
    // Payment Sheet
    // =====================================================

    const paymentRows =
        paymentDistribution.map(
            (
                item
            ) => {

                const amount =
                    getPaymentAmount(
                        item
                    );


                const total =
                    paymentDistribution.reduce(
                        (
                            sum,
                            current
                        ) =>
                            sum +
                            getPaymentAmount(
                                current
                            ),
                        0
                    );


                return {

                    [label.payment]:
                        getPaymentLabel(
                            item?.name,
                            language
                        ),

                    [label.salesAmount]:
                        amount,

                    [label.share]:
                        total > 0

                            ? `${(
                                (
                                    amount /
                                    total
                                ) *
                                100
                            ).toFixed(
                                1
                            )}%`

                            : '0%',

                };

            }
        );


    const paymentSheet =
        XLSX.utils.json_to_sheet(
            paymentRows
        );


    paymentSheet['!cols'] = [

        {
            wch: 22,
        },

        {
            wch: 22,
        },

        {
            wch: 14,
        },

    ];


    if (
        paymentRows.length > 0
    ) {

        const paymentBodyEnd =
            paymentRows.length +
            1;


        for (
            let row = 2;
            row <= paymentBodyEnd;
            row += 1
        ) {

            const cell =
                paymentSheet[
                    `B${row}`
                ];


            if (cell) {

                cell.z =
                    '#,##0';

            }

        }


        paymentSheet['!autofilter'] = {

            ref:
                `A1:C${paymentBodyEnd}`,

        };

    }


    paymentSheet['!sheetViews'] = [

        {
            rightToLeft:
                !isEnglish,
        },

    ];


    XLSX.utils.book_append_sheet(
        workbook,
        paymentSheet,
        isEnglish
            ? 'Payments'
            : 'پرداخت'
    );


    // =====================================================
    // Filename
    // =====================================================

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            '0'
        );


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            '0'
        );


    const datePart =
        `${year}-${month}-${day}`;


    const filename =
        isEnglish

            ? `sales-report-${datePart}.xlsx`

            : `گزارش-فروش-${datePart}.xlsx`;


    // =====================================================
    // Write
    // =====================================================

    XLSX.writeFile(
        workbook,
        filename
    );


    return {

        success:
            true,

        filename,

    };

};


export default exportReportToExcel;