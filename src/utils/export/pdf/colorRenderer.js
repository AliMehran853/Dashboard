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

const TABLE_HEADER_HEIGHT = 9;

const TABLE_ROW_HEIGHT = 11;

const TABLE_SECTION_GAP = 6;

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
        16;

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
        top + 7,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size: 8.5,

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
        top + 12,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size: 6.2,

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
        TABLE_SECTION_GAP
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
        16,
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
        16,
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
        PAGE_TOP + 7,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size: 8.5,

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
        PAGE_TOP + 12,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size: 6.2,

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
        16 +
        TABLE_SECTION_GAP
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
        31;

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
        y + 10,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size: 15.5,

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
        y + 18,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size: 7.2,

            color: rgb(
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
                        y + 10,

                    width:
                        49,

                    size:
                        5.2,

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
                        y + 17,

                    width:
                        49,

                    size:
                        5.1,

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
            y + 24,
            {
                rtl: false,

                align:
                    rtl
                        ? 'left'
                        : 'right',

                size:
                    6.7,

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
        7
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

            size: 9.5,

            color:
                COLORS.ink,
        }
    );

    return y + 7;
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

    /*
     * سه کارت بالایی:
     *
     * 1. میانگین فروش
     * 2. کالاهای فروخته‌شده
     * 3. تعداد تراکنش
     *
     * کل فروش در Summary پایین قرار دارد.
     */

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
        27;

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

            /*
             * Card
             */

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

            /*
             * Accent bar
             */

            doc.setFillColor(
                ...card.accent
            );

            doc.roundedRect(
                rtl
                    ? left +
                      cardW -
                      1.5
                    : left,
                y,
                1.5,
                cardH,
                0.75,
                0.75,
                'F'
            );

            /*
             * Soft value area
             */

            doc.setFillColor(
                ...card.background
            );

            doc.roundedRect(
                left + 3,
                y + 5.5,
                cardW - 6,
                8,
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

            /*
             * Label
             */

            drawText(
                doc,
                card.label,
                textX,
                y + 10.5,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size: 6.4,

                    color:
                        COLORS.muted,

                    maxWidth:
                        cardW - 10,
                }
            );

            /*
             * Value
             */

            drawText(
                doc,
                card.value,
                textX,
                y + 21.5,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size: 9,

                    color:
                        card.accent,

                    maxWidth:
                        cardW - 10,
                }
            );
        }
    );

    return y + cardH + 5;
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
        21;

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
                y + 7,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    size: 6.1,

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
                y + 14,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size: 6.9,

                    color:
                        COLORS.ink,

                    maxWidth:
                        itemWidth - 8,
                }
            );
        }
    );

    return y + 28;
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

    /*
     * چهار کارت پایین:
     *
     * 1. فروش نقدی
     * 2. فروش نسیه
     * 3. کل فروش
     * 4. بهترین دسته
     */

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
        27;

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

            /*
             * Main card
             */

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

            /*
             * Accent bar
             */

            doc.setFillColor(
                ...item.accent
            );

            doc.roundedRect(
                left + 3,
                y + 2.5,
                boxW - 6,
                1.6,
                0.8,
                0.8,
                'F'
            );

            /*
             * Soft value area
             */

            doc.setFillColor(
                ...item.background
            );

            doc.roundedRect(
                left + 3,
                y + 5.5,
                boxW - 6,
                8,
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

            /*
             * Label
             */

            drawText(
                doc,
                item.label,
                textX,
                y + 10.5,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size: 6.2,

                    color:
                        COLORS.muted,

                    maxWidth:
                        boxW - 10,
                }
            );

            /*
             * Value
             */

            drawText(
                doc,
                item.value,
                textX,
                y + 21.5,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size: 8.4,

                    color:
                        item.accent,

                    maxWidth:
                        boxW - 10,
                }
            );
        }
    );

    return y + boxH + 5;
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
            29,
    },

    {
        key:
            'category',

        label:
            model.labels.category,

        width:
            25,
    },

    {
        key:
            'quantity',

        label:
            model.labels.quantity,

        width:
            17,
    },

    {
        key:
            'amount',

        label:
            model.labels.amount,

        width:
            27,
    },

    {
        key:
            'paymentLabel',

        label:
            model.labels.paymentType,

        width:
            23,
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
            'date',

        label:
            model.labels.date,

        width:
            31,
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

        case 'date':
            return (
                sale.date ||
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
                y + 5.8,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size:
                        5.8,

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
    y
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
                    y + 4,

                width:
                    columnWidth - 4,

                size:
                    5.1,

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
                    y + 8.1,

                width:
                    columnWidth - 4,

                size:
                    4.9,

                color:
                    COLORS.muted,
            }
        );

        return;
    }

    drawText(
        doc,
        sale.date || '-',
        rtl
            ? left +
              columnWidth -
              2
            : left + 2,
        y + 4.2,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            size:
                5.6,

            color:
                COLORS.ink,

            maxWidth:
                columnWidth - 4,
        }
    );

    if (
        sale.time
    ) {
        drawText(
            doc,
            sale.time,
            rtl
                ? left +
                  columnWidth -
                  2
                : left + 2,
            y + 8.1,
            {
                rtl: false,

                align:
                    rtl
                        ? 'right'
                        : 'left',

                size:
                    5,

                color:
                    COLORS.muted,
            }
        );
    }
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
                TABLE_ROW_HEIGHT,
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
                    y
                );
            } else {
                const value =
                    getSaleCellValue(
                        sale,
                        column,
                        model
                    );

                drawText(
                    doc,
                    value || '-',
                    rtl
                        ? left +
                          column.width -
                          2
                        : left + 2,
                    y + 6.1,
                    {
                        rtl,

                        align:
                            rtl
                                ? 'right'
                                : 'left',

                        size:
                            model.language ===
                            'fa'
                                ? 5.35
                                : 5.9,

                        color:
                            COLORS.ink,

                        maxWidth:
                            column.width - 4,
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

    return (
        y +
        TABLE_ROW_HEIGHT
    );
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
        if (
            y +
                TABLE_ROW_HEIGHT >
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

        y =
            drawTableRow(
                doc,
                model,
                y,
                columns,
                sales[index],
                index
            );
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
        18;

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
        y + 11,
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

    /*
     * -------------------------------------------------------------
     * HEADER
     * -------------------------------------------------------------
     */

    y =
        drawHeader(
            doc,
            model,
            y
        );

    /*
     * -------------------------------------------------------------
     * TOP KPI CARDS
     *
     * 1. Average Sale
     * 2. Items Sold
     * 3. Transactions
     * -------------------------------------------------------------
     */

    y =
        drawKpis(
            doc,
            model,
            y
        );

    /*
     * -------------------------------------------------------------
     * FILTER SUMMARY
     * -------------------------------------------------------------
     */

    y =
        drawFilterSummary(
            doc,
            model,
            y
        );

    /*
     * -------------------------------------------------------------
     * SALES SUMMARY TITLE
     * -------------------------------------------------------------
     */

    y =
        drawSectionTitle(
            doc,
            model,
            model.labels.salesTitle ||
                model.labels.title,
            y
        );

    /*
     * -------------------------------------------------------------
     * BOTTOM SUMMARY CARDS
     *
     * 1. Cash Sales
     * 2. Credit Sales
     * 3. Total Sales
     * 4. Best Category
     * -------------------------------------------------------------
     */

    y =
        drawSummary(
            doc,
            model,
            y
        );

    /*
     * -------------------------------------------------------------
     * CHARTS
     * -------------------------------------------------------------
     */

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
            8;

        const chartHeight =
            64;

        const chartBottomGap =
            9;

        const requiredSpace =
            chartTitleSpace +
            chartHeight +
            chartBottomGap;

        /*
         * اگر فضای کافی باقی نمانده باشد،
         * Analytics به صفحه جدید منتقل می‌شود.
         */

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

        /*
         * Payment chart
         */

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

        /*
         * Category chart
         */

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

        /*
         * -------------------------------------------------------------
         * PAGE 1 — OVERVIEW
         * -------------------------------------------------------------
         */

        drawOverviewPage(
            doc,
            model
        );

        /*
         * -------------------------------------------------------------
         * SALES TABLE
         *
         * جدول فروش همیشه از صفحه جدا شروع می‌شود.
         * -------------------------------------------------------------
         */

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

        /*
         * Empty state
         */

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
            /*
             * Full paginated table
             */

            drawTablePage(
                doc,
                model,
                columns,
                sales,
                tableY
            );
        }

        /*
         * -------------------------------------------------------------
         * PAGE NUMBERS
         * -------------------------------------------------------------
         */

        addPageNumbers(
            doc,
            model
        );

        /*
         * -------------------------------------------------------------
         * SAVE
         * -------------------------------------------------------------
         */

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