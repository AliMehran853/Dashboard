// =========================================================
// PDF Export API
// =========================================================

import {
    buildExportModel,
} from './model';

import {
    renderSimplePdf,
} from './pdf/simpleRenderer';

import {
    renderColorPdf,
} from './pdf/colorRenderer';

/* =========================================================
   PDF TYPES
   ========================================================= */

export const PDF_TYPES =
    Object.freeze({
        SIMPLE: 'simple',
        COLOR: 'color',
    });

/* =========================================================
   NORMALIZE PDF TYPE
   ========================================================= */

const normalizePdfType = (
    options = {}
) => {
    const rawType =
        options.type ??
        options.themeMode ??
        PDF_TYPES.SIMPLE;

    const normalized =
        String(
            rawType
        ).toLowerCase();

    /*
     * Supports:
     *
     * "simple"
     * "color"
     * "SIMPLE"
     * "COLOR"
     */
    if (
        normalized ===
        PDF_TYPES.COLOR
    ) {
        return PDF_TYPES.COLOR;
    }

    return PDF_TYPES.SIMPLE;
};

/* =========================================================
   SIMPLE PDF
   ========================================================= */

export const exportReportToSimplePDF =
    async (
        options = {}
    ) => {
        const model =
            buildExportModel(
                options
            );

        return renderSimplePdf(
            model
        );
    };

/* =========================================================
   COLOR PDF
   ========================================================= */

export const exportReportToColorPDF =
    async (
        options = {}
    ) => {
        const model =
            buildExportModel(
                options
            );

        return renderColorPdf(
            model
        );
    };

/* =========================================================
   GENERIC PDF API
   ========================================================= */

export const exportReportToPDF =
    async (
        options = {}
    ) => {
        const type =
            normalizePdfType(
                options
            );

        if (
            type ===
            PDF_TYPES.COLOR
        ) {
            return exportReportToColorPDF(
                options
            );
        }

        return exportReportToSimplePDF(
            options
        );
    };