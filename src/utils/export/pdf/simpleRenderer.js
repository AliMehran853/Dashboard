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

/* ==========================================================================
   PAGE
   ========================================================================== */

const MARGIN = 11;

const PAGE_TOP = 11;

const PAGE_BOTTOM = 18;

const TABLE_HEADER_HEIGHT = 11;

const TABLE_MIN_ROW_HEIGHT = 13;

const TABLE_CELL_PADDING_X = 1.8;

const TABLE_TEXT_SIZE_FA = 7;

const TABLE_TEXT_SIZE_EN = 7.3;

const TABLE_LINE_HEIGHT = 4.3;

const TABLE_TOP_PADDING = 3.8;

const TABLE_BOTTOM_PADDING = 2.8;

/* ==========================================================================
   TEXT WRAPPING
   ========================================================================== */

const getProcessedText = (
    doc,
    value,
    rtl
) => {
    const text =
        String(
            value ?? ''
        );

    if (
        rtl &&
        typeof doc.processArabic ===
            'function'
    ) {
        return doc.processArabic(
            text
        );
    }

    return text;
};

const getWrappedLines = (
    doc,
    value,
    width,
    {
        size,
        rtl,
        bold = false,
    } = {}
) => {
    const text =
        String(
            value ?? ''
        ).trim();

    if (!text) {
        return ['-'];
    }

    doc.setFont(
        'Vazirmatn',
        bold
            ? 'bold'
            : 'normal'
    );

    doc.setFontSize(
        size
    );

    const processed =
        getProcessedText(
            doc,
            text,
            rtl
        );

    const lines =
        doc.splitTextToSize(
            processed,
            Math.max(
                width,
                1
            )
        );

    return (
        Array.isArray(lines) &&
        lines.length
    )
        ? lines
        : ['-'];
};

const drawWrappedCellText = (
    doc,
    value,
    {
        left,
        top,
        width,
        height,
        rtl,
        align,
        size,
        color,
        bold = false,
        lineHeight =
            TABLE_LINE_HEIGHT,
    }
) => {
    const lines =
        getWrappedLines(
            doc,
            value,
            width -
                TABLE_CELL_PADDING_X * 2,
            {
                size,
                rtl,
                bold,
            }
        );

    doc.setFont(
        'Vazirmatn',
        bold
            ? 'bold'
            : 'normal'
    );

    doc.setFontSize(
        size
    );

    doc.setTextColor(
        ...color
    );

    const totalHeight =
        (
            lines.length - 1
        ) *
            lineHeight +
        size * 0.35;

    const startY =
        top +
        Math.max(
            TABLE_TOP_PADDING,
            (
                height -
                totalHeight
            ) / 2 +
                size * 0.35
        );

    const textX =
        rtl
            ? left +
              width -
              TABLE_CELL_PADDING_X
            : left +
              TABLE_CELL_PADDING_X;

    lines.forEach(
        (
            line,
            index
        ) => {
            doc.text(
                line,
                textX,
                startY +
                    index *
                        lineHeight,
                {
                    align:
                        align ||
                        (
                            rtl
                                ? 'right'
                                : 'left'
                        ),
                }
            );
        }
    );

    return lines;
};

/* ==========================================================================
   COLUMNS
   ========================================================================== */

const getColumns = (
    model
) => [
    {
        key:
            'product',

        label:
            model.labels.product,

        width:
            32,
    },

    {
        key:
            'category',

        label:
            model.labels.category,

        width:
            22,
    },

    {
        key:
            'quantity',

        label:
            model.labels.quantity,

        width:
            14,
    },

    {
        key:
            'amount',

        label:
            model.labels.amount,

        width:
            24,
    },

    {
        key:
            'paymentLabel',

        label:
            model.labels.paymentType,

        width:
            20,
    },

    {
        key:
            'customer',

        label:
            model.labels.customer,

        width:
            27,
    },

    {
        key:
            'customerPhone',

        label:
            model.labels.phone,

        width:
            22,
    },

    {
        key:
            'date',

        label:
            model.labels.date,

        width:
            27,
    },
];

/* ==========================================================================
   CELL VALUE
   ========================================================================== */

const getCellValue = (
    sale,
    column,
    model
) => {
    switch (
        column.key
    ) {
        case 'product':
            return (
                sale.product ||
                '-'
            );

        case 'category':
            return (
                sale.category ||
                '-'
            );

        case 'quantity':
            return formatDecimal(
                sale.quantity,
                model.language
            );

        case 'amount':
            return formatCurrency(
                sale.amount,
                model.language,
                model.labels.currency
            );

        case 'paymentLabel':
            return (
                sale.paymentLabel ||
                '-'
            );

        case 'customer':
            return (
                sale.customer ||
                '-'
            );

        case 'customerPhone':
            return (
                sale.customerPhone ||
                '-'
            );

        default:
            return '-';
    }
};

/* ==========================================================================
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
            ? width - MARGIN
            : MARGIN,
        y + 4.5,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size:
                17,

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
            ? width - MARGIN
            : MARGIN,
        y + 12,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size:
                8.5,

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
            ? width - MARGIN
            : MARGIN,
        y + 19.5,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size:
                8.5,

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
        y + 25,
        width -
            MARGIN * 2,
        rgb(
            70,
            70,
            70
        )
    );

    return y + 33;
};

/* ==========================================================================
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
            ? width - MARGIN
            : MARGIN,
        y,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size:
                10.5,

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

    const top =
        y + 8;

    const rowHeight =
        10;

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
                175,
                175,
                175
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
                      4
                    : x + 4;

            const valueX =
                rtl
                    ? x + 4
                    : x +
                      halfWidth -
                      4;

            drawText(
                doc,
                row[0],
                labelX,
                rowY + 6.6,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    size:
                        7.9,

                    color:
                        rgb(
                            65,
                            65,
                            65
                        ),

                    maxWidth:
                        halfWidth *
                        0.56,
                }
            );

            drawText(
                doc,
                row[1],
                valueX,
                rowY + 6.6,
                {
                    rtl,

                    align:
                        rtl
                            ? 'left'
                            : 'right',

                    bold: true,

                    size:
                        7.9,

                    color:
                        rgb(
                            25,
                            25,
                            25
                        ),

                    maxWidth:
                        halfWidth *
                        0.41,
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
        10
    );
};

/* ==========================================================================
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
            ? width - MARGIN
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
                110,
                110,
                110
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
                y + 7.3,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size:
                        7.5,

                    color:
                        rgb(
                            30,
                            30,
                            30
                        ),

                    maxWidth:
                        column.width - 4,
                }
            );

            x =
                rtl
                    ? left
                    : x +
                      column.width;
        }
    );

    return (
        y +
        TABLE_HEADER_HEIGHT
    );
};

/* ==========================================================================
   TABLE ROW LAYOUT
   ========================================================================== */

const getTableRowLayout = (
    doc,
    model,
    columns,
    sale
) => {
    const rtl =
        model.direction ===
        'rtl';

    const fontSize =
        model.language === 'fa'
            ? TABLE_TEXT_SIZE_FA
            : TABLE_TEXT_SIZE_EN;

    const cells =
        columns.map(
            (column) => {
                if (
                    column.key ===
                    'date'
                ) {
                    return {
                        key:
                            column.key,

                        lines:
                            2,
                    };
                }

                const value =
                    getCellValue(
                        sale,
                        column,
                        model
                    );

                const lines =
                    getWrappedLines(
                        doc,
                        value || '-',
                        column.width -
                            TABLE_CELL_PADDING_X * 2,
                        {
                            size:
                                fontSize,

                            rtl,

                            bold:
                                false,
                        }
                    );

                return {
                    key:
                        column.key,

                    value:
                        value || '-',

                    lines:
                        lines.length,
                };
            }
        );

    const maxLines =
        Math.max(
            ...cells.map(
                (cell) =>
                    cell.lines
            ),
            2
        );

    const calculatedHeight =
        TABLE_TOP_PADDING +
        TABLE_BOTTOM_PADDING +
        (
            maxLines - 1
        ) *
            TABLE_LINE_HEIGHT +
        fontSize;

    const rowHeight =
        Math.max(
            TABLE_MIN_ROW_HEIGHT,
            calculatedHeight
        );

    return {
        rowHeight,
        fontSize,
    };
};

/* ==========================================================================
   TABLE ROW
   ========================================================================== */

const drawTableRow = (
    doc,
    model,
    y,
    columns,
    sale,
    index
) => {
    const width =
        doc.internal.pageSize
            .getWidth();

    const rtl =
        model.direction ===
        'rtl';

    const rowLayout =
        getTableRowLayout(
            doc,
            model,
            columns,
            sale
        );

    let x =
        rtl
            ? width - MARGIN
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
                200,
                200,
                200
            );

            doc.rect(
                left,
                y,
                column.width,
                rowLayout.rowHeight,
                'FD'
            );

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
                                left +
                                1.5,

                            y:
                                y + 5,

                            width:
                                column.width -
                                3,

                            size:
                                6.2,

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
                                left +
                                1.5,

                            y:
                                y +
                                Math.min(
                                    10.1,
                                    rowLayout.rowHeight -
                                        2
                                ),

                            width:
                                column.width -
                                3,

                            size:
                                5.9,

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

                    drawWrappedCellText(
                        doc,
                        value || '-',
                        {
                            left,

                            top:
                                y,

                            width:
                                column.width,

                            height:
                                rowLayout.rowHeight,

                            rtl,

                            align:
                                rtl
                                    ? 'right'
                                    : 'left',

                            size:
                                6.6,

                            color:
                                rgb(
                                    45,
                                    45,
                                    45
                                ),
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

            const value =
                getCellValue(
                    sale,
                    column,
                    model
                );

            drawWrappedCellText(
                doc,
                value || '-',
                {
                    left,

                    top:
                        y,

                    width:
                        column.width,

                    height:
                        rowLayout.rowHeight,

                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    size:
                        rowLayout.fontSize,

                    color:
                        rgb(
                            45,
                            45,
                            45
                        ),
                }
            );

            x =
                rtl
                    ? left
                    : x +
                      column.width;
        }
    );

    return (
        y +
        rowLayout.rowHeight
    );
};

/* ==========================================================================
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

/* ==========================================================================
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

        /*
         * EMPTY DATA
         */

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
                    ? width - MARGIN
                    : MARGIN,
                y + 11,
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

                    size:
                        9,
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

        /*
         * FIRST TABLE HEADER
         */

        if (
            y +
                TABLE_HEADER_HEIGHT +
                TABLE_MIN_ROW_HEIGHT >
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
            y =
                drawTableHeader(
                    doc,
                    model,
                    y,
                    columns
                );
        }

        /*
         * TABLE ROWS
         */

        for (
            let index = 0;
            index <
            model.sales.length;
            index += 1
        ) {
            const rowLayout =
                getTableRowLayout(
                    doc,
                    model,
                    columns,
                    model.sales[index]
                );

            /*
             * Use the REAL calculated row height
             * before deciding whether to create a
             * new page.
             */
            if (
                y +
                    rowLayout.rowHeight >
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

            y =
                drawTableRow(
                    doc,
                    model,
                    y,
                    columns,
                    model.sales[index],
                    index
                );
        }

        /*
         * FOOTERS
         */

        addPageNumbers(
            doc,
            model
        );

        /*
         * SAVE
         */

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