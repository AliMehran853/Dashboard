import {
    addPageNumbers,
    createPdf,
    drawRtlDateParts,
    drawRtlTimeParts,
    drawText,
    rgb,
    savePdf,
} from './pdfUtils';

import {
    drawPaymentOverview,
    drawTopCategories,
} from './chartRenderer';

import {
    formatCurrency,
    formatDecimal,
    formatNumber,
    sanitizeFileName,
} from '../formatters';

/* ==========================================================================
   COLORS
   ========================================================================== */

const COLORS = {
    ink: rgb(15, 23, 42),
    inkSoft: rgb(30, 41, 59),
    muted: rgb(100, 116, 139),
    line: rgb(226, 232, 240),

    surface: rgb(248, 250, 252),
    surfaceStrong: rgb(241, 245, 249),

    white: rgb(255, 255, 255),

    accent: rgb(16, 185, 129),
    accentDark: rgb(5, 150, 105),
    accentSoft: rgb(236, 253, 245),

    blue: rgb(37, 99, 235),
    blueSoft: rgb(239, 246, 255),

    amber: rgb(245, 158, 11),
    amberSoft: rgb(255, 247, 237),
};

/* ==========================================================================
   PAGE
   ========================================================================== */

const MARGIN = 11;

const PAGE_TOP = 11;

const PAGE_BOTTOM = 18;

const TABLE_HEADER_HEIGHT = 11.5;

const TABLE_MIN_ROW_HEIGHT = 13.5;

const TABLE_CELL_PADDING_X = 2;

const TABLE_TEXT_SIZE_FA = 7.2;

const TABLE_TEXT_SIZE_EN = 7.5;

const TABLE_LINE_HEIGHT = 4.5;

const TABLE_TOP_PADDING = 4;

const TABLE_BOTTOM_PADDING = 3;

/* ==========================================================================
   HELPERS
   ========================================================================== */

const getPageWidth = (doc) =>
    doc.internal.pageSize.getWidth();

const getPageHeight = (doc) =>
    doc.internal.pageSize.getHeight();

const isRTL = (model) =>
    model?.direction === 'rtl';

const getContentBottom = (doc) =>
    getPageHeight(doc) - PAGE_BOTTOM;

/* ==========================================================================
   TEXT WRAPPING HELPERS
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
    const contentWidth =
        width -
        TABLE_CELL_PADDING_X * 2;

    const lines =
        getWrappedLines(
            doc,
            value,
            contentWidth,
            {
                size,
                rtl,
                bold,
            }
        );

    doc.setTextColor(
        ...color
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

    /*
     * Vertically center a wrapped block in the cell.
     */
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
   ANALYTICS CONTINUATION PAGE
   ========================================================================== */

const startAnalyticsPage = (
    doc,
    model
) => {
    doc.addPage();

    const width =
        getPageWidth(doc);

    const rtl =
        isRTL(model);

    const top =
        PAGE_TOP;

    const height =
        19;

    doc.setFillColor(
        ...COLORS.surface
    );

    doc.setDrawColor(
        ...COLORS.line
    );

    doc.setLineWidth(
        0.25
    );

    doc.roundedRect(
        MARGIN,
        top,
        width - MARGIN * 2,
        height,
        3,
        3,
        'FD'
    );

    doc.setFillColor(
        ...COLORS.accent
    );

    doc.roundedRect(
        rtl
            ? width - MARGIN - 1.5
            : MARGIN,
        top,
        1.5,
        height,
        0.7,
        0.7,
        'F'
    );

    drawText(
        doc,
        model.labels.title,
        rtl
            ? width - MARGIN - 5
            : MARGIN + 5,
        top + 8,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size: 9.8,

            color:
                COLORS.ink,
        }
    );

    drawText(
        doc,
        `${model.labels.period}: ${model.filters.periodLabel}`,
        rtl
            ? width - MARGIN - 5
            : MARGIN + 5,
        top + 14.5,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size: 7.3,

            color:
                COLORS.muted,

            maxWidth:
                width -
                MARGIN * 2 -
                10,
        }
    );

    return (
        top +
        height +
        6
    );
};

/* ==========================================================================
   TABLE PAGE
   ========================================================================== */

const startReportTablePage = (
    doc,
    model
) => {
    doc.addPage();

    const width =
        getPageWidth(doc);

    const rtl =
        isRTL(model);

    doc.setFillColor(
        ...COLORS.surface
    );

    doc.setDrawColor(
        ...COLORS.line
    );

    doc.setLineWidth(
        0.25
    );

    doc.roundedRect(
        MARGIN,
        PAGE_TOP,
        width - MARGIN * 2,
        19,
        3,
        3,
        'FD'
    );

    doc.setFillColor(
        ...COLORS.accent
    );

    doc.roundedRect(
        rtl
            ? width - MARGIN - 1.5
            : MARGIN,
        PAGE_TOP,
        1.5,
        19,
        0.7,
        0.7,
        'F'
    );

    drawText(
        doc,
        model.labels.title,
        rtl
            ? width - MARGIN - 5
            : MARGIN + 5,
        PAGE_TOP + 8,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size: 9.8,

            color:
                COLORS.ink,
        }
    );

    drawText(
        doc,
        `${model.labels.period}: ${model.filters.periodLabel}`,
        rtl
            ? width - MARGIN - 5
            : MARGIN + 5,
        PAGE_TOP + 14.5,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size: 7.3,

            color:
                COLORS.muted,

            maxWidth:
                width -
                MARGIN * 2 -
                10,
        }
    );

    return (
        PAGE_TOP +
        19 +
        6
    );
};

/* ==========================================================================
   HERO HEADER
   ========================================================================== */

const drawHeader = (
    doc,
    model,
    y
) => {
    const width =
        getPageWidth(doc);

    const rtl =
        isRTL(model);

    const headerHeight =
        37;

    doc.setFillColor(
        ...COLORS.ink
    );

    doc.roundedRect(
        MARGIN,
        y,
        width - MARGIN * 2,
        headerHeight,
        4,
        4,
        'F'
    );

    doc.setFillColor(
        ...COLORS.accent
    );

    doc.roundedRect(
        rtl
            ? width - MARGIN - 1.8
            : MARGIN,
        y,
        1.8,
        headerHeight,
        0.9,
        0.9,
        'F'
    );

    drawText(
        doc,
        model.labels.title,
        rtl
            ? width - MARGIN - 8
            : MARGIN + 8,
        y + 11.5,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size: 20,

            color:
                COLORS.white,
        }
    );

    drawText(
        doc,
        `${model.labels.period}: ${model.filters.periodLabel}`,
        rtl
            ? width - MARGIN - 8
            : MARGIN + 8,
        y + 21,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size: 9,

            color:
                rgb(
                    226,
                    232,
                    240
                ),
        }
    );

    if (
        rtl &&
        (
            model.meta?.generatedDate ||
            model.meta?.generatedTime
        )
    ) {
        if (
            model.meta?.generatedDate
        ) {
            drawRtlDateParts(
                doc,
                model.meta.generatedDate,
                {
                    x:
                        MARGIN + 8,

                    y:
                        y + 12,

                    width:
                        52,

                    size:
                        8,

                    color:
                        rgb(
                            226,
                            232,
                            240
                        ),
                }
            );
        }

        if (
            model.meta?.generatedTime
        ) {
            drawRtlTimeParts(
                doc,
                model.meta.generatedTime,
                {
                    x:
                        MARGIN + 8,

                    y:
                        y + 21,

                    width:
                        52,

                    size:
                        7.5,

                    color:
                        rgb(
                            203,
                            213,
                            225
                        ),
                }
            );
        }
    } else {
        drawText(
            doc,
            model.meta?.generatedAtDisplay || '',
            rtl
                ? MARGIN + 8
                : width - MARGIN - 8,
            y + 28,
            {
                rtl: false,

                align:
                    rtl
                        ? 'left'
                        : 'right',

                size:
                    8,

                color:
                    rgb(
                        203,
                        213,
                        225
                    ),
            }
        );
    }

    return (
        y +
        headerHeight +
        8
    );
};

/* ==========================================================================
   SECTION TITLE
   ========================================================================== */

const drawSectionTitle = (
    doc,
    model,
    title,
    y
) => {
    const width =
        getPageWidth(doc);

    const rtl =
        isRTL(model);

    drawText(
        doc,
        title,
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

            size: 10.8,

            color:
                COLORS.ink,
        }
    );

    return y + 8;
};

/* ==========================================================================
   KPI CARDS — 3 CARDS
   ========================================================================== */

const drawKpis = (
    doc,
    model,
    y
) => {
    const width =
        getPageWidth(doc);

    const rtl =
        isRTL(model);

    const kpis = [
        {
            label:
                model.labels.average,

            value:
                formatCurrency(
                    model.summary.averageSale,
                    model.language,
                    model.labels.currency
                ),

            accent:
                COLORS.accent,

            background:
                COLORS.accentSoft,
        },

        {
            label:
                model.labels.items,

            value:
                formatDecimal(
                    model.summary.totalItems,
                    model.language
                ),

            accent:
                COLORS.blue,

            background:
                COLORS.blueSoft,
        },

        {
            label:
                model.labels.transactions,

            value:
                formatNumber(
                    model.summary.totalTransactions,
                    model.language
                ),

            accent:
                COLORS.accentDark,

            background:
                COLORS.accentSoft,
        },
    ];

    const gap =
        5;

    const cardW =
        (
            width -
            MARGIN * 2 -
            gap * 2
        ) / 3;

    const cardH =
        30;

    kpis.forEach(
        (
            card,
            index
        ) => {
            const left =
                MARGIN +
                index *
                    (
                        cardW +
                        gap
                    );

            doc.setFillColor(
                ...COLORS.white
            );

            doc.setDrawColor(
                ...COLORS.line
            );

            doc.setLineWidth(
                0.3
            );

            doc.roundedRect(
                left,
                y,
                cardW,
                cardH,
                3.5,
                3.5,
                'FD'
            );

            doc.setFillColor(
                ...card.accent
            );

            doc.roundedRect(
                rtl
                    ? left +
                      cardW -
                      1.6
                    : left,
                y,
                1.6,
                cardH,
                0.8,
                0.8,
                'F'
            );

            doc.setFillColor(
                ...card.background
            );

            doc.roundedRect(
                left + 3,
                y + 5.5,
                cardW - 6,
                9,
                2,
                2,
                'F'
            );

            const textX =
                rtl
                    ? left +
                      cardW -
                      5
                    : left + 5;

            drawText(
                doc,
                card.label,
                textX,
                y + 11,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size:
                        7.2,

                    color:
                        COLORS.muted,

                    maxWidth:
                        cardW - 10,
                }
            );

            drawText(
                doc,
                card.value,
                textX,
                y + 23.5,
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
                        card.accent,

                    maxWidth:
                        cardW - 10,
                }
            );
        }
    );

    return y + cardH + 6;
};

/* ==========================================================================
   FILTER SUMMARY
   ========================================================================== */

const drawFilterSummary = (
    doc,
    model,
    y
) => {
    const width =
        getPageWidth(doc);

    const rtl =
        isRTL(model);

    const items = [];

    if (
        model.filters?.periodLabel
    ) {
        items.push({
            label:
                model.labels.period,

            value:
                model.filters.periodLabel,
        });
    }

    if (
        model.filters?.paymentLabel
    ) {
        items.push({
            label:
                model.labels.payment,

            value:
                model.filters.paymentLabel,
        });
    }

    if (
        model.filters?.categoryLabel
    ) {
        items.push({
            label:
                model.labels.category,

            value:
                model.filters.categoryLabel,
        });
    }

    if (
        model.filters?.search
    ) {
        items.push({
            label:
                model.labels.search,

            value:
                model.filters.search,
        });
    }

    if (
        !items.length
    ) {
        return y;
    }

    const height =
        23;

    doc.setFillColor(
        ...COLORS.surface
    );

    doc.setDrawColor(
        ...COLORS.line
    );

    doc.setLineWidth(
        0.25
    );

    doc.roundedRect(
        MARGIN,
        y,
        width - MARGIN * 2,
        height,
        3,
        3,
        'FD'
    );

    const available =
        width -
        MARGIN * 2 -
        8;

    const itemWidth =
        available /
        items.length;

    items.forEach(
        (
            item,
            index
        ) => {
            const left =
                MARGIN +
                4 +
                index *
                    itemWidth;

            const textX =
                rtl
                    ? left +
                      itemWidth -
                      4
                    : left + 4;

            drawText(
                doc,
                item.label,
                textX,
                y + 7.5,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    size:
                        6.9,

                    color:
                        COLORS.muted,

                    maxWidth:
                        itemWidth - 8,
                }
            );

            drawText(
                doc,
                item.value,
                textX,
                y + 16,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size:
                        7.7,

                    color:
                        COLORS.ink,

                    maxWidth:
                        itemWidth - 8,
                }
            );
        }
    );

    return y + 30;
};

/* ==========================================================================
   SUMMARY CARDS — 4 CARDS
   ========================================================================== */

const drawSummary = (
    doc,
    model,
    y
) => {
    const width =
        getPageWidth(doc);

    const rtl =
        isRTL(model);

    const items = [
        {
            label:
                model.labels.cash,

            value:
                formatCurrency(
                    model.summary.cashSales,
                    model.language,
                    model.labels.currency
                ),

            accent:
                COLORS.accentDark,

            background:
                COLORS.accentSoft,
        },

        {
            label:
                model.labels.credit,

            value:
                formatCurrency(
                    model.summary.creditSales,
                    model.language,
                    model.labels.currency
                ),

            accent:
                COLORS.amber,

            background:
                COLORS.amberSoft,
        },

        {
            label:
                model.labels.totalSales,

            value:
                formatCurrency(
                    model.summary.totalRevenue,
                    model.language,
                    model.labels.currency
                ),

            accent:
                COLORS.blue,

            background:
                COLORS.blueSoft,
        },

        {
            label:
                model.labels.bestCategory,

            value:
                model.summary.bestCategory ||
                '-',

            accent:
                COLORS.accent,

            background:
                COLORS.accentSoft,
        },
    ];

    const gap =
        4;

    const boxW =
        (
            width -
            MARGIN * 2 -
            gap * 3
        ) / 4;

    const boxH =
        30;

    items.forEach(
        (
            item,
            index
        ) => {
            const left =
                MARGIN +
                index *
                    (
                        boxW +
                        gap
                    );

            doc.setFillColor(
                ...COLORS.white
            );

            doc.setDrawColor(
                ...COLORS.line
            );

            doc.setLineWidth(
                0.3
            );

            doc.roundedRect(
                left,
                y,
                boxW,
                boxH,
                3.5,
                3.5,
                'FD'
            );

            doc.setFillColor(
                ...item.accent
            );

            doc.roundedRect(
                left + 3,
                y + 2.5,
                boxW - 6,
                1.8,
                0.9,
                0.9,
                'F'
            );

            doc.setFillColor(
                ...item.background
            );

            doc.roundedRect(
                left + 3,
                y + 6,
                boxW - 6,
                9,
                2,
                2,
                'F'
            );

            const textX =
                rtl
                    ? left +
                      boxW -
                      5
                    : left + 5;

            drawText(
                doc,
                item.label,
                textX,
                y + 11.5,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size:
                        6.9,

                    color:
                        COLORS.muted,

                    maxWidth:
                        boxW - 10,
                }
            );

            drawText(
                doc,
                item.value,
                textX,
                y + 23.5,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size:
                        9.5,

                    color:
                        item.accent,

                    maxWidth:
                        boxW - 10,
                }
            );
        }
    );

    return y + boxH + 6;
};

/* ==========================================================================
   TABLE COLUMNS
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
   TABLE CELL VALUE
   ========================================================================== */

const getSaleCellValue = (
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
   TABLE HEADER
   ========================================================================== */

const drawTableHeader = (
    doc,
    model,
    y,
    columns
) => {
    const width =
        getPageWidth(doc);

    const rtl =
        isRTL(model);

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
                ...COLORS.ink
            );

            doc.setDrawColor(
                ...COLORS.ink
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
                y + 7.7,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size:
                        7.6,

                    color:
                        COLORS.white,

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
   TABLE DATE / TIME
   ========================================================================== */

const drawTableDate = (
    doc,
    model,
    sale,
    left,
    columnWidth,
    y,
    rowHeight
) => {
    const rtl =
        isRTL(model);

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
                    left + 2,

                y:
                    y + Math.min(
                        5,
                        rowHeight / 2
                    ),

                width:
                    columnWidth - 4,

                size:
                    6.6,

                color:
                    COLORS.ink,
            }
        );

        drawRtlTimeParts(
            doc,
            sale.time,
            {
                x:
                    left + 2,

                y:
                    y +
                    Math.min(
                        10.6,
                        rowHeight - 3
                    ),

                width:
                    columnWidth - 4,

                size:
                    6.2,

                color:
                    COLORS.muted,
            }
        );

        return;
    }

    const value =
        sale.time
            ? `${sale.date} ${sale.time}`
            : sale.date;

    drawText(
        doc,
        value || '-',
        rtl
            ? left +
              columnWidth -
              2
            : left + 2,
        y +
            rowHeight /
                2 +
            2,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size:
                6.6,

            color:
                COLORS.ink,

            maxWidth:
                columnWidth - 4,
        }
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
        isRTL(model);

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
                    getSaleCellValue(
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
        cells,
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
        getPageWidth(doc);

    const rtl =
        isRTL(model);

    const rowFill =
        index % 2 === 0
            ? COLORS.white
            : COLORS.surfaceStrong;

    const layout =
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
                ...rowFill
            );

            doc.setDrawColor(
                ...COLORS.line
            );

            doc.setLineWidth(
                0.18
            );

            doc.rect(
                left,
                y,
                column.width,
                layout.rowHeight,
                'FD'
            );

            if (
                column.key ===
                'date'
            ) {
                drawTableDate(
                    doc,
                    model,
                    sale,
                    left,
                    column.width,
                    y,
                    layout.rowHeight
                );
            } else {
                const value =
                    getSaleCellValue(
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
                            layout.rowHeight,

                        rtl,

                        align:
                            rtl
                                ? 'right'
                                : 'left',

                        size:
                            layout.fontSize,

                        color:
                            COLORS.ink,
                    }
                );
            }

            x =
                rtl
                    ? left
                    : x +
                      column.width;
        }
    );

    return {
        y:
            y +
            layout.rowHeight,

        height:
            layout.rowHeight,
    };
};

/* ==========================================================================
   DRAW TABLE PAGE
   ========================================================================== */

const drawTablePage = (
    doc,
    model,
    columns,
    sales,
    startY
) => {
    let y =
        startY;

    y =
        drawTableHeader(
            doc,
            model,
            y,
            columns
        );

    for (
        let index = 0;
        index < sales.length;
        index += 1
    ) {
        const preview =
            getTableRowLayout(
                doc,
                model,
                columns,
                sales[index]
            );

        /*
         * Check the actual row height before drawing.
         */
        if (
            y +
                preview.rowHeight >
            getContentBottom(doc)
        ) {
            y =
                startReportTablePage(
                    doc,
                    model
                );

            y =
                drawTableHeader(
                    doc,
                    model,
                    y,
                    columns
                );
        }

        const result =
            drawTableRow(
                doc,
                model,
                y,
                columns,
                sales[index],
                index
            );

        y =
            result.y;
    }

    return y;
};

/* ==========================================================================
   EMPTY TABLE
   ========================================================================== */

const drawEmptyTable = (
    doc,
    model,
    y,
    columns
) => {
    const width =
        getPageWidth(doc);

    const rtl =
        isRTL(model);

    const height =
        21;

    y =
        drawTableHeader(
            doc,
            model,
            y,
            columns
        );

    doc.setFillColor(
        ...COLORS.surface
    );

    doc.setDrawColor(
        ...COLORS.line
    );

    doc.rect(
        MARGIN,
        y,
        width - MARGIN * 2,
        height,
        'FD'
    );

    drawText(
        doc,
        model.labels.noData,
        rtl
            ? width - MARGIN - 5
            : MARGIN + 5,
        y + 13,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size:
                8.5,

            color:
                COLORS.muted,
        }
    );

    return (
        y +
        height
    );
};

/* ==========================================================================
   REPORT OVERVIEW PAGE
   ========================================================================== */

const drawOverviewPage = (
    doc,
    model
) => {
    let y =
        PAGE_TOP;

    y =
        drawHeader(
            doc,
            model,
            y
        );

    y =
        drawKpis(
            doc,
            model,
            y
        );

    y =
        drawFilterSummary(
            doc,
            model,
            y
        );

    y =
        drawSectionTitle(
            doc,
            model,
            model.labels.salesTitle ||
                model.labels.title,
            y
        );

    y =
        drawSummary(
            doc,
            model,
            y
        );

    const hasPaymentChart =
        Boolean(
            model.paymentDistribution?.length
        );

    const hasCategoryChart =
        Boolean(
            model.categorySales?.length
        );

    const hasCharts =
        hasPaymentChart ||
        hasCategoryChart;

    if (
        hasCharts
    ) {
        const chartTitleSpace =
            9;

        const chartHeight =
            64;

        const chartBottomGap =
            10;

        const requiredSpace =
            chartTitleSpace +
            chartHeight +
            chartBottomGap;

        if (
            y +
                requiredSpace >
            getContentBottom(doc)
        ) {
            y =
                startAnalyticsPage(
                    doc,
                    model
                );
        }

        y =
            drawSectionTitle(
                doc,
                model,
                model.labels.paymentChart ||
                    model.labels.categoryChart ||
                    'Analytics',
                y
            );

        const pageWidth =
            getPageWidth(doc);

        const gap =
            6;

        const chartWidth =
            (
                pageWidth -
                MARGIN * 2 -
                gap
            ) / 2;

        if (
            hasPaymentChart
        ) {
            drawPaymentOverview(
                doc,
                model,
                MARGIN,
                y,
                chartWidth,
                chartHeight
            );
        }

        if (
            hasCategoryChart
        ) {
            drawTopCategories(
                doc,
                model,
                MARGIN +
                    chartWidth +
                    gap,
                y,
                chartWidth,
                chartHeight
            );
        }

        y +=
            chartHeight +
            10;
    }

    return y;
};

/* ==========================================================================
   RENDER COLOR PDF
   ========================================================================== */

export const renderColorPdf =
    async (
        model
    ) => {
        const doc =
            await createPdf({
                rtl:
                    model.direction ===
                    'rtl',
            });

        drawOverviewPage(
            doc,
            model
        );

        const columns =
            getColumns(
                model
            );

        const sales =
            Array.isArray(
                model.sales
            )
                ? model.sales
                : [];

        let tableY =
            startReportTablePage(
                doc,
                model
            );

        tableY =
            drawSectionTitle(
                doc,
                model,
                model.labels.salesTitle ||
                    model.labels.title,
                tableY
            );

        tableY +=
            2;

        if (
            !sales.length
        ) {
            drawEmptyTable(
                doc,
                model,
                tableY,
                columns
            );
        } else {
            drawTablePage(
                doc,
                model,
                columns,
                sales,
                tableY
            );
        }

        addPageNumbers(
            doc,
            model
        );

        const filename =
            `${sanitizeFileName(
                model.labels.title ||
                    'report'
            )}-color.pdf`;

        savePdf(
            doc,
            filename
        );

        return {
            filename,
            model,
        };
    };

export default renderColorPdf;