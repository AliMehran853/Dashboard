// =========================================================
// Excel Export
// =========================================================

import * as XLSX from 'xlsx';

import {
    buildExportModel,
} from './model';

import {
    formatCurrency,
    formatDecimal,
    formatNumber,
    sanitizeFileName,
} from './formatters';

// ---------------------------------------------------------
// Helpers
// ---------------------------------------------------------

const buildSummarySheet = (
    model
) => {
    const {
        labels,
        summary,
        filters,
        language,
    } = model;

    return [
        [labels.title],
        [],

        [
            labels.period,
            filters.periodLabel,
        ],

        [
            labels.payment,
            filters.paymentLabel,
        ],

        [
            labels.category,
            filters.categoryLabel,
        ],

        [
            labels.search,
            filters.search || '-',
        ],

        [],

        [
            labels.totalSales,
            formatCurrency(
                summary.totalRevenue,
                language,
                labels.currency
            ),
        ],

        [
            labels.transactions,
            formatNumber(
                summary.totalTransactions,
                language
            ),
        ],

        [
            labels.items,
            formatDecimal(
                summary.totalItems,
                language
            ),
        ],

        [
            labels.average,
            formatCurrency(
                summary.averageSale,
                language,
                labels.currency
            ),
        ],

        [
            labels.cash,
            formatCurrency(
                summary.cashSales,
                language,
                labels.currency
            ),
        ],

        [
            labels.credit,
            formatCurrency(
                summary.creditSales,
                language,
                labels.currency
            ),
        ],

        [
            labels.bestCategory,
            summary.bestCategory,
        ],
    ];
};

// ---------------------------------------------------------
// Sales Sheet
// ---------------------------------------------------------

const buildSalesSheet = (
    model
) => {
    const {
        labels,
    } = model;

    const header = [
        labels.product,
        labels.category,
        labels.quantity,
        labels.amount,
        labels.paymentType,
        labels.customer,
        labels.date,
        labels.time,
    ];

    const rows =
        model.sales.map(
            (sale) => [
                sale.product,
                sale.category,
                sale.quantity,
                sale.amount,
                sale.paymentLabel,
                sale.customer,
                sale.date,
                sale.time,
            ]
        );

    return [
        header,
        ...rows,
    ];
};

// ---------------------------------------------------------
// Analytics Sheet
// ---------------------------------------------------------

const buildAnalyticsSheet = (
    model
) => {
    return [
        [
            model.labels.categoryChart,
            model.labels.amount,
        ],

        ...model.categorySales.map(
            (item) => [
                item.category,
                item.sales,
            ]
        ),

        [],

        [
            model.labels.paymentChart,
            model.labels.amount,
        ],

        ...model.paymentDistribution.map(
            (item) => [
                item.label,
                item.value,
            ]
        ),

        [],

        [
            model.labels.title,
            model.labels.amount,
        ],

        ...model.salesTrend.map(
            (item) => [
                item.label,
                item.value,
            ]
        ),
    ];
};

// ---------------------------------------------------------
// Column widths
// ---------------------------------------------------------

const calculateWidths = (
    rows,
    min = 10,
    max = 35
) => {
    const columnCount =
        rows.reduce(
            (largest, row) =>
                Math.max(
                    largest,
                    row.length
                ),
            0
        );

    return Array.from(
        {
            length: columnCount,
        },
        (_, columnIndex) => {
            let width = min;

            rows.forEach(
                (row) => {
                    const value =
                        row[
                            columnIndex
                        ];

                    width =
                        Math.max(
                            width,
                            String(
                                value ??
                                    ''
                            ).length +
                                2
                        );
                }
            );

            return {
                wch: Math.min(
                    max,
                    width
                ),
            };
        }
    );
};

const prepareSheet = (
    sheet,
    rows,
    freezeRows = 0
) => {
    sheet['!cols'] =
        calculateWidths(
            rows
        );

    if (freezeRows > 0) {
        sheet['!freeze'] = {
            xSplit: 0,
            ySplit: freezeRows,
        };
    }

    return sheet;
};

// ---------------------------------------------------------
// Export
// ---------------------------------------------------------

export const exportReportToExcel =
    async (options = {}) => {
        const model =
            buildExportModel(
                options
            );

        const workbook =
            XLSX.utils.book_new();

        // Summary
        const summaryRows =
            buildSummarySheet(
                model
            );

        const summarySheet =
            XLSX.utils.aoa_to_sheet(
                summaryRows
            );

        prepareSheet(
            summarySheet,
            summaryRows
        );

        XLSX.utils.book_append_sheet(
            workbook,
            summarySheet,
            'Summary'
        );

        // Sales
        const salesRows =
            buildSalesSheet(
                model
            );

        const salesSheet =
            XLSX.utils.aoa_to_sheet(
                salesRows
            );

        prepareSheet(
            salesSheet,
            salesRows,
            1
        );

        XLSX.utils.book_append_sheet(
            workbook,
            salesSheet,
            'Sales Data'
        );

        // Analytics
        const analyticsRows =
            buildAnalyticsSheet(
                model
            );

        const analyticsSheet =
            XLSX.utils.aoa_to_sheet(
                analyticsRows
            );

        prepareSheet(
            analyticsSheet,
            analyticsRows
        );

        XLSX.utils.book_append_sheet(
            workbook,
            analyticsSheet,
            'Analytics'
        );

        const stamp =
            new Date()
                .toISOString()
                .slice(0, 10);

        const filename =
            `${sanitizeFileName(
                model.labels.title
            )}-${stamp}.xlsx`;

        XLSX.writeFile(
            workbook,
            filename
        );

        return {
            filename,
            model,
        };
    };