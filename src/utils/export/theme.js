/* ============================================================================
   BASE PDF COLORS
   ========================================================================== */

export const PDF_COLORS =
  Object.freeze({
    white: '#FFFFFF',
    black: '#000000',

    dark: '#111827',
    darker: '#0F172A',

    primary: '#8B0D1A',
    primaryDark: '#450106',
    primaryLight: '#C40B11',

    accent: '#2563EB',
    accent2: '#0F766E',

    success: '#15803D',
    warning: '#D97706',
    danger: '#B91C1C',
    info: '#0891B2',

    text: '#111827',
    textDark: '#0F172A',
    muted: '#64748B',
    lightText: '#9CA3AF',

    background: '#FFFFFF',
    surface: '#F8FAFC',
    surfaceSoft: '#F1F5F9',
    card: '#FFFFFF',
    rowAlt: '#F8FAFC',

    border: '#D1D5DB',
    borderLight: '#E5E7EB',

    chart1: '#8B0D1A',
    chart2: '#2563EB',
    chart3: '#15803D',
    chart4: '#D97706',
    chart5: '#7C3AED',
    chart6: '#0F766E',
    chart7: '#DB2777',
    chart8: '#0891B2',
  });

/* ============================================================================
   CHART COLORS
   ========================================================================== */

export const PDF_CHART_COLORS =
  Object.freeze([
    PDF_COLORS.chart1,
    PDF_COLORS.chart2,
    PDF_COLORS.chart3,
    PDF_COLORS.chart4,
    PDF_COLORS.chart5,
    PDF_COLORS.chart6,
    PDF_COLORS.chart7,
    PDF_COLORS.chart8,
  ]);

/* ============================================================================
   COLOR PDF THEME
   ========================================================================== */

export const COLOR_PDF_THEME =
  Object.freeze({
    primary:
      PDF_COLORS.primary,

    primaryDark:
      PDF_COLORS.primaryDark,

    primaryLight:
      PDF_COLORS.primaryLight,

    secondary:
      PDF_COLORS.accent,

    accent:
      PDF_COLORS.accent,

    accent2:
      PDF_COLORS.accent2,

    background:
      PDF_COLORS.background,

    surface:
      PDF_COLORS.surface,

    surfaceSoft:
      PDF_COLORS.surfaceSoft,

    card:
      PDF_COLORS.card,

    text:
      PDF_COLORS.text,

    textDark:
      PDF_COLORS.textDark,

    muted:
      PDF_COLORS.muted,

    border:
      PDF_COLORS.border,

    borderLight:
      PDF_COLORS.borderLight,

    white:
      PDF_COLORS.white,

    black:
      PDF_COLORS.black,

    success:
      PDF_COLORS.success,

    warning:
      PDF_COLORS.warning,

    danger:
      PDF_COLORS.danger,

    info:
      PDF_COLORS.info,

    colors:
      PDF_COLORS,

    page:
      Object.freeze({
        background:
          PDF_COLORS.background,

        surface:
          PDF_COLORS.surface,

        surfaceSoft:
          PDF_COLORS.surfaceSoft,

        card:
          PDF_COLORS.card,

        ink:
          PDF_COLORS.text,

        text:
          PDF_COLORS.text,

        muted:
          PDF_COLORS.muted,

        line:
          PDF_COLORS.border,

        border:
          PDF_COLORS.border,
      }),

    border:
      Object.freeze({
        default:
          PDF_COLORS.border,

        light:
          PDF_COLORS.borderLight,

        dark:
          PDF_COLORS.dark,
      }),

    text:
      Object.freeze({
        primary:
          PDF_COLORS.text,

        secondary:
          PDF_COLORS.muted,

        muted:
          PDF_COLORS.muted,

        inverse:
          PDF_COLORS.white,

        light:
          PDF_COLORS.lightText,
      }),

    accent:
      Object.freeze({
        primary:
          PDF_COLORS.primary,

        secondary:
          PDF_COLORS.accent,

        success:
          PDF_COLORS.success,

        warning:
          PDF_COLORS.warning,

        danger:
          PDF_COLORS.danger,
      }),

    chart:
      Object.freeze({
        primary:
          PDF_COLORS.chart1,

        secondary:
          PDF_COLORS.chart2,

        cash:
          PDF_COLORS.chart3,

        credit:
          PDF_COLORS.chart4,

        blue:
          PDF_COLORS.chart2,

        green:
          PDF_COLORS.chart3,

        amber:
          PDF_COLORS.chart4,

        purple:
          PDF_COLORS.chart5,

        teal:
          PDF_COLORS.chart6,

        pink:
          PDF_COLORS.chart7,

        cyan:
          PDF_COLORS.chart8,

        colors:
          PDF_CHART_COLORS,

        background:
          PDF_COLORS.white,

        surface:
          PDF_COLORS.surface,

        text:
          PDF_COLORS.text,

        muted:
          PDF_COLORS.muted,

        border:
          PDF_COLORS.border,
      }),

    chartColors:
      PDF_CHART_COLORS,

    charts:
      PDF_CHART_COLORS,

    textColors:
      Object.freeze({
        primary:
          PDF_COLORS.text,

        secondary:
          PDF_COLORS.muted,

        inverse:
          PDF_COLORS.white,

        light:
          PDF_COLORS.lightText,
      }),

    borderColors:
      Object.freeze({
        default:
          PDF_COLORS.border,

        light:
          PDF_COLORS.borderLight,
      }),

    backgroundColors:
      Object.freeze({
        page:
          PDF_COLORS.background,

        surface:
          PDF_COLORS.surface,

        card:
          PDF_COLORS.card,

        alternateRow:
          PDF_COLORS.rowAlt,
      }),
  });

/* ============================================================================
   SIMPLE PDF THEME
   ========================================================================== */

export const SIMPLE_PDF_THEME =
  Object.freeze({
    colors:
      Object.freeze({
        background:
          '#FFFFFF',

        surface:
          '#FFFFFF',

        card:
          '#FFFFFF',

        primary:
          '#000000',

        secondary:
          '#333333',

        text:
          '#000000',

        muted:
          '#555555',

        border:
          '#000000',

        borderLight:
          '#BDBDBD',

        white:
          '#FFFFFF',

        black:
          '#000000',
      }),

    page:
      Object.freeze({
        background:
          '#FFFFFF',

        surface:
          '#FFFFFF',

        ink:
          '#000000',

        text:
          '#000000',

        muted:
          '#555555',

        line:
          '#000000',

        border:
          '#BDBDBD',
      }),

    table:
      Object.freeze({
        header:
          '#000000',

        headerText:
          '#FFFFFF',

        border:
          '#777777',

        row:
          '#FFFFFF',

        alternateRow:
          '#F5F5F5',
      }),
  });

/* ============================================================================
   PDF PAGE
   ========================================================================== */

export const PDF_PAGE =
  Object.freeze({
    width: 210,
    height: 297,

    marginTop: 12,
    marginBottom: 14,
    marginLeft: 11,
    marginRight: 11,

    contentWidth:
      210 - 22,

    contentHeight:
      297 - 26,
  });

/* ============================================================================
   PDF SPACING
   ========================================================================== */

export const PDF_SPACING =
  Object.freeze({
    headerTitleY:
      20,

    headerSubtitleY:
      26,

    headerDividerY:
      31,

    sectionGap:
      8,

    sectionTitleGap:
      7,

    cardGap:
      4,

    cardHeight:
      24,

    tableHeaderHeight:
      8,

    tableRowHeight:
      9,

    chartGap:
      8,

    footerGap:
      6,

    small:
      3,

    medium:
      6,

    large:
      10,
  });

/* ============================================================================
   COMBINED THEME
   ========================================================================== */

export const PDF_THEME =
  Object.freeze({
    colors:
      PDF_COLORS,

    color:
      COLOR_PDF_THEME,

    colorPdf:
      COLOR_PDF_THEME,

    simple:
      SIMPLE_PDF_THEME,

    page:
      PDF_PAGE,

    spacing:
      PDF_SPACING,

    charts:
      PDF_CHART_COLORS,
  });

export default PDF_THEME;