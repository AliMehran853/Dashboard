import {
    drawText,
    drawCard,
} from './pdfUtils';

import {
    COLOR_PDF_THEME,
} from '../theme';

/* ==========================================================================
   HELPERS
   ========================================================================== */

const hexToRgb = (
    hex
) => {
    const value =
        String(
            hex || ''
        )
            .replace(
                '#',
                ''
            )
            .trim();

    if (
        value.length !== 6 ||
        !/^[0-9a-fA-F]{6}$/.test(
            value
        )
    ) {
        return [
            0,
            0,
            0,
        ];
    }

    return [
        parseInt(
            value.slice(
                0,
                2
            ),
            16
        ),

        parseInt(
            value.slice(
                2,
                4
            ),
            16
        ),

        parseInt(
            value.slice(
                4,
                6
            ),
            16
        ),
    ];
};

const getNumber = (
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

const clamp = (
    value,
    min = 0,
    max = 1
) =>
    Math.min(
        max,
        Math.max(
            min,
            value
        )
    );

/* ==========================================================================
   CHART TITLES
   ========================================================================== */

const getChartTitle = (
    model,
    type
) => {
    if (
        type === 'payment'
    ) {
        return (
            model.labels.paymentChart ||
            model.labels.payment ||
            'Payment Overview'
        );
    }

    return (
        model.labels.categoryChart ||
        model.labels.category ||
        'Top Categories'
    );
};

/* ==========================================================================
   CARD COLORS
   ========================================================================== */

const getCardColors = () => ({
    fill:
        hexToRgb(
            COLOR_PDF_THEME.card
        ),

    border:
        hexToRgb(
            COLOR_PDF_THEME.border.light
        ),
});

/* ==========================================================================
   CHART HEADER INDICATOR COLORS
   ========================================================================== */

/*
 * IMPORTANT:
 *
 * These are intentionally explicit.
 *
 * Payment Overview:
 *      GREEN
 *
 * Top Categories:
 *      BLUE
 *
 * This is specifically for the small vertical
 * indicator on the RIGHT side of the chart header
 * in Persian / RTL mode.
 */

const CHART_HEADER_COLORS = {
    payment:
        '#10B981',

    category:
        '#2563EB',
};

const getChartIndicatorColor = (
    type
) => {
    if (
        type === 'category'
    ) {
        return (
            CHART_HEADER_COLORS
                .category
        );
    }

    return (
        CHART_HEADER_COLORS
            .payment
    );
};

/* ==========================================================================
   CHART HEADER
   ========================================================================== */

const drawChartHeader = (
    doc,
    model,
    title,
    type,
    x,
    y,
    width
) => {
    const rtl =
        model.direction ===
        'rtl';

    /*
     * Direct fixed color:
     *
     * Payment    -> #10B981
     * Categories -> #2563EB
     */
    const indicatorColor =
        getChartIndicatorColor(
            type
        );

    doc.setFillColor(
        ...hexToRgb(
            indicatorColor
        )
    );

    /*
     * In Persian / RTL:
     * indicator is on the RIGHT.
     *
     * In English / LTR:
     * indicator is on the LEFT.
     */
    doc.roundedRect(
        rtl
            ? x +
              width -
              7
            : x + 4,
        y + 4,
        1.8,
        7.5,
        0.9,
        0.9,
        'F'
    );

    const titleX =
        rtl
            ? x +
              width -
              11
            : x + 9;

    drawText(
        doc,
        title,
        titleX,
        y + 9,
        {
            rtl,

            align:
                rtl
                    ? 'right'
                    : 'left',

            bold: true,

            size:
                8.6,

            color:
                hexToRgb(
                    COLOR_PDF_THEME
                        .text
                        .primary
                ),

            maxWidth:
                width - 18,
        }
    );
};

/* ==========================================================================
   PAYMENT OVERVIEW
   ========================================================================== */

export const drawPaymentOverview = (
    doc,
    model,
    x,
    y,
    width = 88,
    height = 64
) => {
    const rtl =
        model.direction ===
        'rtl';

    const cardColors =
        getCardColors();

    /* ---------------------------------------------------------------------- */
    /* CARD                                                                    */
    /* ---------------------------------------------------------------------- */

    drawCard(
        doc,
        x,
        y,
        width,
        height,
        {
            fill:
                cardColors.fill,

            border:
                cardColors.border,
        }
    );

    /* ---------------------------------------------------------------------- */
    /* HEADER                                                                  */
    /* ---------------------------------------------------------------------- */

    drawChartHeader(
        doc,
        model,
        getChartTitle(
            model,
            'payment'
        ),
        'payment',
        x,
        y,
        width
    );

    /* ---------------------------------------------------------------------- */
    /* DATA                                                                    */
    /* ---------------------------------------------------------------------- */

    const values =
        Array.isArray(
            model.paymentDistribution
        )
            ? model.paymentDistribution
            : [];

    if (
        !values.length
    ) {
        drawText(
            doc,
            model.labels.noData,
            rtl
                ? x +
                  width -
                  7
                : x + 7,
            y + 35,
            {
                rtl,

                align:
                    rtl
                        ? 'right'
                        : 'left',

                size:
                    7.4,

                color:
                    hexToRgb(
                        COLOR_PDF_THEME
                            .text
                            .muted
                    ),
            }
        );

        return (
            y +
            height +
            8
        );
    }

    const total =
        values.reduce(
            (
                sum,
                item
            ) =>
                sum +
                getNumber(
                    item?.value
                ),
            0
        );

    /*
     * Payment chart:
     *
     * Cash
     * Credit
     *
     * Extra vertical breathing room.
     */
    const rowStartY =
        y + 18;

    const rowGap =
        24;

    const labelX =
        rtl
            ? x +
              width -
              7
            : x + 7;

    const percentageX =
        rtl
            ? x + 7
            : x +
              width -
              7;

    const barX =
        x + 7;

    const barWidth =
        width - 14;

    const barHeight =
        5.5;

    values
        .slice(
            0,
            3
        )
        .forEach(
            (
                item,
                index
            ) => {
                const value =
                    getNumber(
                        item?.value
                    );

                const ratio =
                    total > 0
                        ? clamp(
                              value /
                                  total
                          )
                        : 0;

                const rowY =
                    rowStartY +
                    index *
                        rowGap;

                /* ---------------------------------------------------------- */
                /* LABEL                                                        */
                /* ---------------------------------------------------------- */

                drawText(
                    doc,
                    item?.label ||
                        '-',
                    labelX,
                    rowY + 4,
                    {
                        rtl,

                        align:
                            rtl
                                ? 'right'
                                : 'left',

                        bold: true,

                        size:
                            6.5,

                        color:
                            hexToRgb(
                                COLOR_PDF_THEME
                                    .text
                                    .primary
                            ),

                        maxWidth:
                            width - 25,
                    }
                );

                /* ---------------------------------------------------------- */
                /* PERCENTAGE                                                   */
                /* ---------------------------------------------------------- */

                drawText(
                    doc,
                    `${Math.round(
                        ratio *
                            100
                    )}%`,
                    percentageX,
                    rowY + 4,
                    {
                        rtl: false,

                        align:
                            rtl
                                ? 'left'
                                : 'right',

                        bold: true,

                        size:
                            6.2,

                        color:
                            hexToRgb(
                                COLOR_PDF_THEME
                                    .text
                                    .secondary
                            ),
                    }
                );

                /* ---------------------------------------------------------- */
                /* BACKGROUND BAR                                               */
                /* ---------------------------------------------------------- */

                doc.setFillColor(
                    ...hexToRgb(
                        COLOR_PDF_THEME
                            .page
                            .surfaceSoft
                    )
                );

                doc.roundedRect(
                    barX,
                    rowY + 6.5,
                    barWidth,
                    barHeight,
                    2,
                    2,
                    'F'
                );

                /* ---------------------------------------------------------- */
                /* FILLED BAR                                                   */
                /* ---------------------------------------------------------- */

                if (
                    ratio > 0
                ) {
                    const fillWidth =
                        Math.max(
                            2.5,
                            barWidth *
                                ratio
                        );

                    const color =
                        item?.key ===
                        'credit'
                            ? COLOR_PDF_THEME
                                .chart
                                .credit
                            : COLOR_PDF_THEME
                                .chart
                                .cash;

                    doc.setFillColor(
                        ...hexToRgb(
                            color
                        )
                    );

                    const fillX =
                        rtl
                            ? barX +
                              barWidth -
                              fillWidth
                            : barX;

                    doc.roundedRect(
                        fillX,
                        rowY + 6.5,
                        fillWidth,
                        barHeight,
                        2,
                        2,
                        'F'
                    );
                }
            }
        );

    return (
        y +
        height +
        8
    );
};

/* ==========================================================================
   TOP CATEGORIES
   ========================================================================== */

export const drawTopCategories = (
    doc,
    model,
    x,
    y,
    width = 88,
    height = 64
) => {
    const rtl =
        model.direction ===
        'rtl';

    const cardColors =
        getCardColors();

    /* ---------------------------------------------------------------------- */
    /* CARD                                                                    */
    /* ---------------------------------------------------------------------- */

    drawCard(
        doc,
        x,
        y,
        width,
        height,
        {
            fill:
                cardColors.fill,

            border:
                cardColors.border,
        }
    );

    /* ---------------------------------------------------------------------- */
    /* HEADER                                                                  */
    /* ---------------------------------------------------------------------- */

    drawChartHeader(
        doc,
        model,
        getChartTitle(
            model,
            'category'
        ),
        'category',
        x,
        y,
        width
    );

    /* ---------------------------------------------------------------------- */
    /* TOP 4 CATEGORIES                                                        */
    /* ---------------------------------------------------------------------- */

    /*
     * Sort by real sales value first,
     * then keep only the top four.
     */
    const items =
        Array.isArray(
            model.categorySales
        )
            ? [...model.categorySales]
                  .map(
                      (item) => ({
                          ...item,

                          sales:
                              getNumber(
                                  item?.sales
                              ),
                      })
                  )
                  .sort(
                      (
                          a,
                          b
                      ) =>
                          b.sales -
                          a.sales
                  )
                  .slice(
                      0,
                      4
                  )
            : [];

    if (
        !items.length
    ) {
        drawText(
            doc,
            model.labels.noData,
            rtl
                ? x +
                  width -
                  7
                : x + 7,
            y + 35,
            {
                rtl,

                align:
                    rtl
                        ? 'right'
                        : 'left',

                size:
                    7.4,

                color:
                    hexToRgb(
                        COLOR_PDF_THEME
                            .text
                            .muted
                    ),
            }
        );

        return (
            y +
            height +
            8
        );
    }

    /* ---------------------------------------------------------------------- */
    /* MAX VALUE                                                               */
    /* ---------------------------------------------------------------------- */

    const maxValue =
        Math.max(
            ...items.map(
                (
                    item
                ) =>
                    getNumber(
                        item?.sales
                    )
            ),
            1
        );

    /* ---------------------------------------------------------------------- */
    /* ROW LAYOUT                                                              */
    /* ---------------------------------------------------------------------- */

    /*
     * Four rows with larger vertical spacing.
     */
    const rowStartY =
        y + 17;

    const rowGap =
        11.8;

    const labelX =
        rtl
            ? x +
              width -
              7
            : x + 7;

    const valueX =
        rtl
            ? x + 7
            : x +
              width -
              7;

    const barX =
        x + 7;

    const barWidth =
        width - 14;

    const barHeight =
        4.8;

    /* ---------------------------------------------------------------------- */
    /* DRAW TOP 4                                                              */
    /* ---------------------------------------------------------------------- */

    items.forEach(
        (
            item,
            index
        ) => {
            const value =
                getNumber(
                    item?.sales
                );

            const ratio =
                clamp(
                    value /
                        maxValue
                );

            const rowY =
                rowStartY +
                index *
                    rowGap;

            /* -------------------------------------------------------------- */
            /* CATEGORY NAME                                                    */
            /* -------------------------------------------------------------- */

            drawText(
                doc,
                item?.category ||
                    '-',
                labelX,
                rowY + 3.4,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size:
                        6.1,

                    color:
                        hexToRgb(
                            COLOR_PDF_THEME
                                .text
                                .primary
                        ),

                    maxWidth:
                        width - 30,
                }
            );

            /* -------------------------------------------------------------- */
            /* SALES VALUE                                                      */
            /* -------------------------------------------------------------- */

            drawText(
                doc,
                String(
                    value
                ),
                valueX,
                rowY + 3.4,
                {
                    rtl: false,

                    align:
                        rtl
                            ? 'left'
                            : 'right',

                    bold: true,

                    size:
                        5.9,

                    color:
                        hexToRgb(
                            COLOR_PDF_THEME
                                .text
                                .secondary
                        ),
                }
            );

            /* -------------------------------------------------------------- */
            /* BACKGROUND BAR                                                   */
            /* -------------------------------------------------------------- */

            doc.setFillColor(
                ...hexToRgb(
                    COLOR_PDF_THEME
                        .page
                        .surfaceSoft
                )
            );

            doc.roundedRect(
                barX,
                rowY + 5.2,
                barWidth,
                barHeight,
                2,
                2,
                'F'
            );

            /* -------------------------------------------------------------- */
            /* PROGRESS BAR                                                     */
            /* -------------------------------------------------------------- */

            if (
                ratio > 0
            ) {
                const fillWidth =
                    Math.max(
                        3,
                        barWidth *
                            ratio
                    );

                /*
                 * Top category:
                 *      green
                 *
                 * Other categories:
                 *      blue
                 */
                const color =
                    index === 0
                        ? COLOR_PDF_THEME
                            .accent
                            .primary
                        : COLOR_PDF_THEME
                            .chart
                            .blue;

                doc.setFillColor(
                    ...hexToRgb(
                        color
                    )
                );

                const fillX =
                    rtl
                        ? barX +
                          barWidth -
                          fillWidth
                        : barX;

                doc.roundedRect(
                    fillX,
                    rowY + 5.2,
                    fillWidth,
                    barHeight,
                    2,
                    2,
                    'F'
                );
            }
        }
    );

    return (
        y +
        height +
        8
    );
};