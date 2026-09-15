import {
    addPageNumbers,
    createPdf,
    drawText,
    drawDivider,
    drawRtlDateParts,
    drawRtlTimeParts,
    rgb,
    savePdf,
} from './pdfUtils';

import {
    formatCurrency,
    formatDecimal,
    formatNumber,
    sanitizeFileName,
} from '../formatters';

/* ============================================================================
   PAGE
   ========================================================================== */

const MARGIN = 11;
const PAGE_TOP = 11;
const PAGE_BOTTOM = 18;

const TABLE_HEADER_HEIGHT = 8;
const TABLE_ROW_HEIGHT = 9;

/* ============================================================================
   COLUMNS
   ========================================================================== */

const getColumns = (
    model
) => [
    {
        key: 'product',
        label:
            model.labels.product,
        width: 29,
    },

    {
        key: 'category',
        label:
            model.labels.category,
        width: 25,
    },

    {
        key: 'quantity',
        label:
            model.labels.quantity,
        width: 17,
    },

    {
        key: 'amount',
        label:
            model.labels.amount,
        width: 27,
    },

    {
        key: 'paymentLabel',
        label:
            model.labels.paymentType,
        width: 23,
    },

    {
        key: 'customer',
        label:
            model.labels.customer,
        width: 27,
    },

    {
        key: 'date',
        label:
            model.labels.date,
        width: 31,
    },
];

/* ============================================================================
   HEADER
   ========================================================================== */

const drawHeader = (
    doc,
    model,
    y
) => {
    const width =
        doc.internal.pageSize
            .getWidth();

    const rtl =
        model.direction ===
        'rtl';

    drawText(
        doc,
        model.labels.title,
        rtl
            ? width -
              MARGIN
            : MARGIN,
        y + 4,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size: 15,

            color:
                rgb(
                    20,
                    20,
                    20
                ),
        }
    );

    drawText(
        doc,
        `${model.labels.period}: ${model.filters.periodLabel}`,
        rtl
            ? width -
              MARGIN
            : MARGIN,
        y + 11,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size: 7.5,

            color:
                rgb(
                    85,
                    85,
                    85
                ),
        }
    );

    drawText(
        doc,
        `${model.labels.payment}: ${model.filters.paymentLabel}`,
        rtl
            ? width -
              MARGIN
            : MARGIN,
        y + 17,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size: 7.5,

            color:
                rgb(
                    85,
                    85,
                    85
                ),
        }
    );

    drawDivider(
        doc,
        MARGIN,
        y + 23,
        width -
            MARGIN * 2,
        rgb(
            70,
            70,
            70
        )
    );

    return y + 30;
};

/* ============================================================================
   SUMMARY
   ========================================================================== */

const drawSummary = (
    doc,
    model,
    y
) => {
    const width =
        doc.internal.pageSize
            .getWidth();

    const rtl =
        model.direction ===
        'rtl';

    drawText(
        doc,
        model.labels.salesTitle,
        rtl
            ? width -
              MARGIN
            : MARGIN,
        y,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size: 9,

            color:
                rgb(
                    25,
                    25,
                    25
                ),
        }
    );

    const rows = [
        [
            model.labels.totalSales,
            formatCurrency(
                model.summary.totalRevenue,
                model.language,
                model.labels.currency
            ),
        ],

        [
            model.labels.transactions,
            formatNumber(
                model.summary.totalTransactions,
                model.language
            ),
        ],

        [
            model.labels.items,
            formatDecimal(
                model.summary.totalItems,
                model.language
            ),
        ],

        [
            model.labels.average,
            formatCurrency(
                model.summary.averageSale,
                model.language,
                model.labels.currency
            ),
        ],

        [
            model.labels.cash,
            formatCurrency(
                model.summary.cashSales,
                model.language,
                model.labels.currency
            ),
        ],

        [
            model.labels.credit,
            formatCurrency(
                model.summary.creditSales,
                model.language,
                model.labels.currency
            ),
        ],
    ];

    const top = y + 6;
    const rowHeight = 8;

    const halfWidth =
        (
            width -
            MARGIN * 2
        ) / 2;

    rows.forEach(
        (
            row,
            index
        ) => {
            const column =
                index % 2;

            const line =
                Math.floor(
                    index / 2
                );

            const x =
                MARGIN +
                column *
                    halfWidth;

            const rowY =
                top +
                line *
                    rowHeight;

            doc.setDrawColor(
                185,
                185,
                185
            );

            doc.setFillColor(
                255,
                255,
                255
            );

            doc.rect(
                x,
                rowY,
                halfWidth,
                rowHeight,
                'FD'
            );

            const labelX =
                rtl
                    ? x +
                      halfWidth -
                      3
                    : x + 3;

            const valueX =
                rtl
                    ? x + 3
                    : x +
                      halfWidth -
                      3;

            drawText(
                doc,
                row[0],
                labelX,
                rowY + 5.3,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    size: 6.8,

                    color:
                        rgb(
                            70,
                            70,
                            70
                        ),

                    maxWidth:
                        halfWidth *
                        0.55,
                }
            );

            drawText(
                doc,
                row[1],
                valueX,
                rowY + 5.3,
                {
                    rtl,

                    align:
                        rtl
                            ? 'left'
                            : 'right',

                    bold: true,

                    size: 6.8,

                    color:
                        rgb(
                            30,
                            30,
                            30
                        ),

                    maxWidth:
                        halfWidth *
                        0.4,
                }
            );
        }
    );

    return (
        top +
        Math.ceil(
            rows.length / 2
        ) *
            rowHeight +
        9
    );
};

/* ============================================================================
   TABLE HEADER
   ========================================================================== */

const drawTableHeader = (
    doc,
    model,
    y,
    columns
) => {
    const width =
        doc.internal.pageSize
            .getWidth();

    const rtl =
        model.direction ===
        'rtl';

    let x =
        rtl
            ? width -
              MARGIN
            : MARGIN;

    columns.forEach(
        (
            column
        ) => {
            const left =
                rtl
                    ? x -
                      column.width
                    : x;

            doc.setFillColor(
                230,
                230,
                230
            );

            doc.setDrawColor(
                120,
                120,
                120
            );

            doc.rect(
                left,
                y,
                column.width,
                TABLE_HEADER_HEIGHT,
                'FD'
            );

            drawText(
                doc,
                column.label,
                rtl
                    ? x - 2
                    : x + 2,
                y + 5.3,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size: 6,

                    color:
                        rgb(
                            35,
                            35,
                            35
                        ),

                    maxWidth:
                        column.width -
                        4,
                }
            );

            x =
                rtl
                    ? left
                    : x +
                      column.width;
        }
    );
};

/* ============================================================================
   TABLE ROW
   ========================================================================== */

const drawTableRow = (
    doc,
    model,
    y,
    columns,
    sale
) => {
    const width =
        doc.internal.pageSize
            .getWidth();

    const rtl =
        model.direction ===
        'rtl';

    let x =
        rtl
            ? width -
              MARGIN
            : MARGIN;

    columns.forEach(
        (
            column
        ) => {
            const left =
                rtl
                    ? x -
                      column.width
                    : x;

            doc.setFillColor(
                255,
                255,
                255
            );

            doc.setDrawColor(
                205,
                205,
                205
            );

            doc.rect(
                left,
                y,
                column.width,
                TABLE_ROW_HEIGHT,
                'FD'
            );

            /*
             * Special RTL date handling.
             *
             * Do not send:
             *
             *     23 سنبله 1405
             *     06:57 ب.ظ
             *
             * as one mixed RTL string.
             */
            if (
                column.key ===
                'date'
            ) {
                if (
                    rtl &&
                    model.language ===
                        'fa'
                ) {
                    drawRtlDateParts(
                        doc,
                        sale.date,
                        {
                            x:
                                left,

                            y:
                                y + 3.5,

                            width:
                                column.width -
                                4,

                            size: 5.4,

                            color:
                                rgb(
                                    45,
                                    45,
                                    45
                                ),
                        }
                    );

                    drawRtlTimeParts(
                        doc,
                        sale.time,
                        {
                            x:
                                left,

                            y:
                                y + 7,

                            width:
                                column.width -
                                4,

                            size: 5.1,

                            color:
                                rgb(
                                    85,
                                    85,
                                    85
                                ),
                        }
                    );
                } else {
                    const value =
                        sale.time
                            ? `${sale.date} ${sale.time}`
                            : sale.date;

                    drawText(
                        doc,
                        value ||
                            '-',
                        rtl
                            ? x - 2
                            : x + 2,
                        y + 5.5,
                        {
                            rtl,

                            align:
                                rtl
                                    ? 'right'
                                    : 'left',

                            size:
                                6.2,

                            color:
                                rgb(
                                    45,
                                    45,
                                    45
                                ),

                            maxWidth:
                                column.width -
                                4,
                        }
                    );
                }

                x =
                    rtl
                        ? left
                        : x +
                          column.width;

                return;
            }

            let value =
                sale[
                    column.key
                ];

            if (
                column.key ===
                'quantity'
            ) {
                value =
                    formatDecimal(
                        sale.quantity,
                        model.language
                    );
            }

            if (
                column.key ===
                'amount'
            ) {
                value =
                    formatCurrency(
                        sale.amount,
                        model.language,
                        model.labels.currency
                    );
            }

            drawText(
                doc,
                value || '-',
                rtl
                    ? x - 2
                    : x + 2,
                y + 5.5,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    size:
                        model.language ===
                        'fa'
                            ? 5.5
                            : 6.2,

                    color:
                        rgb(
                            45,
                            45,
                            45
                        ),

                    maxWidth:
                        column.width -
                        4,
                }
            );

            x =
                rtl
                    ? left
                    : x +
                      column.width;
        }
    );

    return TABLE_ROW_HEIGHT;
};

/* ============================================================================
   PAGE BREAK
   ========================================================================== */

const startNewPage = (
    doc,
    model,
    columns
) => {
    doc.addPage();

    const y =
        PAGE_TOP;

    drawTableHeader(
        doc,
        model,
        y,
        columns
    );

    return (
        y +
        TABLE_HEADER_HEIGHT
    );
};

/* ============================================================================
   RENDER
   ========================================================================== */

export const renderSimplePdf =
    async (
        model
    ) => {
        const doc =
            await createPdf({
                rtl:
                    model.direction ===
                    'rtl',
            });

        const width =
            doc.internal.pageSize
                .getWidth();

        const height =
            doc.internal.pageSize
                .getHeight();

        let y =
            PAGE_TOP;

        y =
            drawHeader(
                doc,
                model,
                y
            );

        y =
            drawSummary(
                doc,
                model,
                y
            );

        const columns =
            getColumns(
                model
            );

        if (
            !Array.isArray(
                model.sales
            ) ||
            model.sales.length ===
                0
        ) {
            drawText(
                doc,
                model.labels.noData,
                model.direction ===
                    'rtl'
                    ? width -
                      MARGIN
                    : MARGIN,
                y + 10,
                {
                    rtl:
                        model.direction ===
                        'rtl',

                    align:
                        model.direction ===
                        'rtl'
                            ? 'right'
                            : 'left',

                    bold: true,

                    size: 9,
                }
            );

            addPageNumbers(
                doc,
                model
            );

            const filename =
                `${sanitizeFileName(
                    model.labels.title ||
                        'report'
                )}-simple.pdf`;

            savePdf(
                doc,
                filename
            );

            return {
                filename,
                model,
            };
        }

        if (
            y +
                TABLE_HEADER_HEIGHT +
                TABLE_ROW_HEIGHT >
            height -
                PAGE_BOTTOM
        ) {
            y =
                startNewPage(
                    doc,
                    model,
                    columns
                );
        } else {
            drawTableHeader(
                doc,
                model,
                y,
                columns
            );

            y +=
                TABLE_HEADER_HEIGHT;
        }

        for (
            let index = 0;
            index <
            model.sales.length;
            index += 1
        ) {
            const nextRowBottom =
                y +
                TABLE_ROW_HEIGHT;

            if (
                nextRowBottom >
                height -
                    PAGE_BOTTOM
            ) {
                y =
                    startNewPage(
                        doc,
                        model,
                        columns
                    );
            }

            drawTableRow(
                doc,
                model,
                y,
                columns,
                model.sales[
                    index
                ]
            );

            y +=
                TABLE_ROW_HEIGHT;
        }

        /*
         * Footer now receives model.meta.generatedDate / generatedTime.
         *
         * pdfUtils will render them as structured RTL components.
         */
        addPageNumbers(
            doc,
            model
        );

        const filename =
            `${sanitizeFileName(
                model.labels.title ||
                    'report'
            )}-simple.pdf`;

        savePdf(
            doc,
            filename
        );

        return {
            filename,
            model,
        };
    };

export default renderSimplePdf;