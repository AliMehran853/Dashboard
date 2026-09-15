import {
    drawText,
    drawCard,
} from './pdfUtils';

import {
    COLOR_PDF_THEME,
} from '../theme';

/* ============================================================================
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
) =>
    Number(value) || 0;

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

const drawChartHeader = (
    doc,
    model,
    title,
    x,
    y,
    width
) => {
    const rtl =
        model.direction ===
        'rtl';

    /*
     * Small accent indicator.
     */

    doc.setFillColor(
        ...hexToRgb(
            COLOR_PDF_THEME.accent.primary
        )
    );

    doc.roundedRect(
        rtl
            ? x +
              width -
              7
            : x + 4,
        y + 4,
        1.6,
        7,
        0.8,
        0.8,
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

            size: 8.2,

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

/* ============================================================================
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

    /*
     * Card
     */

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

    /*
     * Header
     */

    drawChartHeader(
        doc,
        model,
        getChartTitle(
            model,
            'payment'
        ),
        x,
        y,
        width
    );

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
            y + 32,
            {
                rtl,

                align:
                    rtl
                        ? 'right'
                        : 'left',

                size: 7,

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
     * We use a clean row:
     *
     * label | percentage
     * full-width progress bar
     *
     * No text is placed over the colored bar.
     */

    const rowStartY =
        y + 18;

    const rowGap = 20;

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

    const barHeight = 5.2;

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

                /*
                 * Label
                 */

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

                        size: 6.1,

                        color:
                            hexToRgb(
                                COLOR_PDF_THEME
                                    .text
                                    .primary
                            ),

                        maxWidth:
                            width -
                            25,
                    }
                );

                /*
                 * Percentage
                 */

                drawText(
                    doc,
                    `${Math.round(
                        ratio * 100
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

                        size: 5.8,

                        color:
                            hexToRgb(
                                COLOR_PDF_THEME
                                    .text
                                    .secondary
                            ),
                    }
                );

                /*
                 * Background bar
                 */

                doc.setFillColor(
                    ...hexToRgb(
                        COLOR_PDF_THEME
                            .page
                            .surfaceSoft
                    )
                );

                doc.roundedRect(
                    barX,
                    rowY + 6,
                    barWidth,
                    barHeight,
                    2,
                    2,
                    'F'
                );

                /*
                 * Fill bar
                 */

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
                        rowY + 6,
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

/* ============================================================================
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

    /*
     * Card
     */

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

    /*
     * Header
     */

    drawChartHeader(
        doc,
        model,
        getChartTitle(
            model,
            'category'
        ),
        x,
        y,
        width
    );

    const items =
        Array.isArray(
            model.categorySales
        )
            ? model.categorySales.slice(
                0,
                5
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
            y + 32,
            {
                rtl,

                align:
                    rtl
                        ? 'right'
                        : 'left',

                size: 7,

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

    /*
     * Five compact rows.
     */

    const rowStartY =
        y + 17;

    const rowGap = 9;

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

    const barHeight = 4.6;

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

            /*
             * Category name
             */

            drawText(
                doc,
                item?.category ||
                    '-',
                labelX,
                rowY + 3.3,
                {
                    rtl,

                    align:
                        rtl
                            ? 'right'
                            : 'left',

                    bold: true,

                    size: 5.45,

                    color:
                        hexToRgb(
                            COLOR_PDF_THEME
                                .text
                                .primary
                        ),

                    maxWidth:
                        width -
                        28,
                }
            );

            /*
             * Numeric amount
             */

            drawText(
                doc,
                String(
                    value
                ),
                valueX,
                rowY + 3.3,
                {
                    rtl: false,

                    align:
                        rtl
                            ? 'left'
                            : 'right',

                    bold: true,

                    size: 5.2,

                    color:
                        hexToRgb(
                            COLOR_PDF_THEME
                                .text
                                .secondary
                        ),
                }
            );

            /*
             * Background
             */

            doc.setFillColor(
                ...hexToRgb(
                    COLOR_PDF_THEME
                        .page
                        .surfaceSoft
                )
            );

            doc.roundedRect(
                barX,
                rowY + 4.6,
                barWidth,
                barHeight,
                2,
                2,
                'F'
            );

            /*
             * Progress
             */

            if (
                ratio > 0
            ) {
                const fillWidth =
                    Math.max(
                        3,
                        barWidth *
                            ratio
                    );

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
                    rowY + 4.6,
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