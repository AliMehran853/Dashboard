import jsPDF from 'jspdf';

import vazirRegularUrl from '../../../assets/fonts/faFonts/Vazirmatn-Regular.ttf?url';
import vazirSemiBoldUrl from '../../../assets/fonts/faFonts/Vazirmatn-SemiBold.ttf?url';

import {
  PDF_COLORS,
  PDF_PAGE,
  PDF_SPACING,
} from '../theme';

/* ============================================================================
   RGB
   ========================================================================== */

export const rgb = (
  r,
  g,
  b
) => [
  Number(r),
  Number(g),
  Number(b),
];

/* ============================================================================
   FONT CACHE
   ========================================================================== */

let regularFontPromise = null;
let semiBoldFontPromise = null;

const arrayBufferToBase64 = (
  buffer
) => {
  let binary = '';

  const bytes =
    new Uint8Array(
      buffer
    );

  const chunkSize =
    0x8000;

  for (
    let i = 0;
    i < bytes.length;
    i += chunkSize
  ) {
    const chunk =
      bytes.subarray(
        i,
        Math.min(
          i + chunkSize,
          bytes.length
        )
      );

    binary +=
      String.fromCharCode(
        ...chunk
      );
  }

  return btoa(
    binary
  );
};

const loadFont = async (
  url
) => {
  const response =
    await fetch(url);

  if (
    !response.ok
  ) {
    throw new Error(
      `Failed to load PDF font: ${url}`
    );
  }

  const buffer =
    await response.arrayBuffer();

  return arrayBufferToBase64(
    buffer
  );
};

const getRegularFont = () => {
  if (
    !regularFontPromise
  ) {
    regularFontPromise =
      loadFont(
        vazirRegularUrl
      );
  }

  return regularFontPromise;
};

const getSemiBoldFont = () => {
  if (
    !semiBoldFontPromise
  ) {
    semiBoldFontPromise =
      loadFont(
        vazirSemiBoldUrl
      );
  }

  return semiBoldFontPromise;
};

/* ============================================================================
   FONT REGISTRATION
   ========================================================================== */

export const ensurePdfFonts =
  async (
    doc
  ) => {
    const [
      regularFont,
      semiBoldFont,
    ] =
      await Promise.all([
        getRegularFont(),
        getSemiBoldFont(),
      ]);

    doc.addFileToVFS(
      'Vazirmatn-Regular.ttf',
      regularFont
    );

    doc.addFont(
      'Vazirmatn-Regular.ttf',
      'Vazirmatn',
      'normal'
    );

    doc.addFileToVFS(
      'Vazirmatn-SemiBold.ttf',
      semiBoldFont
    );

    doc.addFont(
      'Vazirmatn-SemiBold.ttf',
      'Vazirmatn',
      'bold'
    );

    doc.setFont(
      'Vazirmatn',
      'normal'
    );
  };

/* ============================================================================
   CREATE
   ========================================================================== */

export const createPdf =
  async (
    options = {}
  ) => {
    const {
      orientation = 'portrait',
      unit = 'mm',
      format = 'a4',
    } = options;

    const doc =
      new jsPDF({
        orientation,
        unit,
        format,
        compress: true,
      });

    await ensurePdfFonts(
      doc
    );

    return doc;
  };

export const createPdfDocument =
  createPdf;

/* ============================================================================
   SAVE
   ========================================================================== */

export const savePdf = (
  doc,
  filename = 'report.pdf'
) => {
  if (!doc) {
    throw new Error(
      'PDF document is required.'
    );
  }

  let safeFilename =
    String(
      filename ||
        'report.pdf'
    ).trim();

  if (
    !safeFilename
      .toLowerCase()
      .endsWith('.pdf')
  ) {
    safeFilename += '.pdf';
  }

  doc.save(
    safeFilename
  );

  return safeFilename;
};

/* ============================================================================
   PAGE
   ========================================================================== */

export const getPdfPageSize = (
  doc
) => ({
  width:
    doc.internal.pageSize.getWidth(),

  height:
    doc.internal.pageSize.getHeight(),
});

export const getPdfContentWidth = (
  doc
) => {
  const {
    width,
  } =
    getPdfPageSize(doc);

  return (
    width -
    PDF_PAGE.marginLeft -
    PDF_PAGE.marginRight
  );
};

export const getPdfContentHeight = (
  doc
) => {
  const {
    height,
  } =
    getPdfPageSize(doc);

  return (
    height -
    PDF_PAGE.marginTop -
    PDF_PAGE.marginBottom
  );
};

/* ============================================================================
   TEXT PROCESSING
   ========================================================================== */

const hasArabicProcessor =
  (
    doc
  ) =>
    typeof doc.processArabic ===
    'function';

export const processPdfText = (
  doc,
  text,
  rtl = false
) => {
  const value =
    String(
      text ?? ''
    );

  if (!value) {
    return '';
  }

  if (
    rtl &&
    hasArabicProcessor(doc)
  ) {
    return doc.processArabic(
      value
    );
  }

  return value;
};

/* ============================================================================
   COLOR
   ========================================================================== */

const applyTextColor = (
  doc,
  color
) => {
  if (
    Array.isArray(color)
  ) {
    doc.setTextColor(
      Number(color[0]) || 0,
      Number(color[1]) || 0,
      Number(color[2]) || 0
    );

    return;
  }

  if (
    typeof color ===
    'string'
  ) {
    const value =
      color.trim();

    if (
      /^#[0-9a-fA-F]{6}$/.test(
        value
      )
    ) {
      doc.setTextColor(
        parseInt(
          value.slice(1, 3),
          16
        ),
        parseInt(
          value.slice(3, 5),
          16
        ),
        parseInt(
          value.slice(5, 7),
          16
        )
      );

      return;
    }

    if (
      /^#[0-9a-fA-F]{3}$/.test(
        value
      )
    ) {
      doc.setTextColor(
        parseInt(
          value[1] +
            value[1],
          16
        ),
        parseInt(
          value[2] +
            value[2],
          16
        ),
        parseInt(
          value[3] +
            value[3],
          16
        )
      );

      return;
    }
  }

  doc.setTextColor(
    17,
    24,
    39
  );
};

/* ============================================================================
   TEXT
   ========================================================================== */

export const drawPdfText = (
  doc,
  text,
  x,
  y,
  {
    size = 8.2,
    font = 'normal',
    bold = false,
    color = PDF_COLORS.text,
    align = 'left',
    rtl = false,
    maxWidth,
  } = {}
) => {
  const value =
    processPdfText(
      doc,
      text,
      rtl
    );

  if (!value) {
    return;
  }

  const fontStyle =
    bold ||
    font === 'bold'
      ? 'bold'
      : 'normal';

  doc.setFont(
    'Vazirmatn',
    fontStyle
  );

  doc.setFontSize(
    Number(size) ||
      8.2
  );

  applyTextColor(
    doc,
    color
  );

  const options = {
    align,
  };

  if (
    maxWidth !== undefined &&
    maxWidth !== null &&
    Number(maxWidth) > 0
  ) {
    options.maxWidth =
      Number(maxWidth);
  }

  doc.text(
    value,
    Number(x),
    Number(y),
    options
  );
};

export const drawText = (
  doc,
  text,
  x,
  y,
  options = {}
) =>
  drawPdfText(
    doc,
    text,
    x,
    y,
    options
  );

/* ============================================================================
   RTL DATE
   ========================================================================== */

export const drawRtlDateParts = (
  doc,
  dateText,
  {
    x,
    y,
    width = 40,
    size = 7.2,
    color = PDF_COLORS.text,
  } = {}
) => {
  const value =
    String(
      dateText ?? ''
    ).trim();

  if (!value) {
    return;
  }

  const match =
    value.match(
      /^(\d+)\s+(.+?)\s+(\d+)$/
    );

  if (!match) {
    drawText(
      doc,
      value,
      x + width,
      y,
      {
        rtl: true,
        align: 'right',
        size,
        color,
        maxWidth: width,
      }
    );

    return;
  }

  const [
    ,
    day,
    month,
    year,
  ] = match;

  let cursor =
    x + width;

  /*
   * DAY
   */
  drawText(
    doc,
    day,
    cursor,
    y,
    {
      rtl: false,
      align: 'right',
      size,
      color,
    }
  );

  doc.setFont(
    'Vazirmatn',
    'normal'
  );

  doc.setFontSize(
    size
  );

  cursor -=
    doc.getTextWidth(
      day
    ) +
    2;

  /*
   * MONTH
   */
  const shapedMonth =
    hasArabicProcessor(doc)
      ? doc.processArabic(
            month
        )
      : month;

  doc.setFontSize(
    size
  );

  const monthWidth =
    doc.getTextWidth(
      shapedMonth
    );

  drawText(
    doc,
    month,
    cursor,
    y,
    {
      rtl: true,
      align: 'right',
      size,
      color,
    }
  );

  cursor -=
    monthWidth +
    2;

  /*
   * YEAR
   */
  drawText(
    doc,
    year,
    cursor,
    y,
    {
      rtl: false,
      align: 'right',
      size,
      color,
    }
  );
};

/* ============================================================================
   RTL TIME
   ========================================================================== */

export const drawRtlTimeParts = (
  doc,
  timeText,
  {
    x,
    y,
    width = 40,
    size = 7,
    color = PDF_COLORS.text,
  } = {}
) => {
  const value =
    String(
      timeText ?? ''
    ).trim();

  if (!value) {
    return;
  }

  const separatorIndex =
    value.lastIndexOf(' ');

  if (
    separatorIndex <= 0
  ) {
    drawText(
      doc,
      value,
      x + width,
      y,
      {
        rtl: false,
        align: 'right',
        size,
        color,
      }
    );

    return;
  }

  const clock =
    value
      .slice(
        0,
        separatorIndex
      )
      .trim();

  const meridiem =
    value
      .slice(
        separatorIndex + 1
      )
      .trim();

  let cursor =
    x + width;

  /*
   * CLOCK
   */
  drawText(
    doc,
    clock,
    cursor,
    y,
    {
      rtl: false,
      align: 'right',
      size,
      color,
    }
  );

  doc.setFont(
    'Vazirmatn',
    'normal'
  );

  doc.setFontSize(
    size
  );

  cursor -=
    doc.getTextWidth(
      clock
    ) +
    2;

  /*
   * MERIDIEM
   */
  drawText(
    doc,
    meridiem,
    cursor,
    y,
    {
      rtl: true,
      align: 'right',
      size,
      color,
    }
  );
};

/* ============================================================================
   WRAPPED TEXT
   ========================================================================== */

export const drawPdfWrappedText =
  (
    doc,
    text,
    x,
    y,
    {
      size = 8.2,
      font = 'normal',
      bold = false,
      color = PDF_COLORS.text,
      maxWidth = 50,
      lineHeight = 4.8,
      rtl = false,
      align = 'left',
    } = {}
  ) => {
    const value =
      processPdfText(
        doc,
        text,
        rtl
      );

    if (!value) {
      return {
        lines: [],
        height: 0,
      };
    }

    const fontStyle =
      bold ||
      font === 'bold'
        ? 'bold'
        : 'normal';

    doc.setFont(
      'Vazirmatn',
      fontStyle
    );

    doc.setFontSize(
      Number(size) ||
        8.2
    );

    applyTextColor(
      doc,
      color
    );

    const safeMaxWidth =
      Math.max(
        Number(maxWidth) || 0,
        1
      );

    const safeLineHeight =
      Math.max(
        Number(lineHeight) || 0,
        1
      );

    const lines =
      doc.splitTextToSize(
        value,
        safeMaxWidth
      );

    lines.forEach(
      (
        line,
        index
      ) => {
        doc.text(
          line,
          Number(x),
          Number(y) +
            index *
              safeLineHeight,
          {
            align,
          }
        );
      }
    );

    return {
      lines,

      height:
        lines.length *
        safeLineHeight,
    };
  };

export const drawWrappedText = (
  doc,
  text,
  x,
  y,
  options = {}
) =>
  drawPdfWrappedText(
    doc,
    text,
    x,
    y,
    options
  );

/* ============================================================================
   DIVIDER
   ========================================================================== */

export const drawDivider = (
  doc,
  ...args
) => {
  if (
    args.length <= 2
  ) {
    const [
      y,
      options = {},
    ] = args;

    const {
      x1 =
        PDF_PAGE.marginLeft,

      x2 =
        doc.internal.pageSize.getWidth() -
        PDF_PAGE.marginRight,

      color =
        PDF_COLORS.border,

      lineWidth = 0.3,
    } = options;

    if (
      Array.isArray(color)
    ) {
      doc.setDrawColor(
        ...color
      );
    } else {
      doc.setDrawColor(
        color
      );
    }

    doc.setLineWidth(
      lineWidth
    );

    doc.line(
      x1,
      y,
      x2,
      y
    );

    return;
  }

  const [
    x,
    y,
    width,
    color,
  ] = args;

  if (
    Array.isArray(color)
  ) {
    doc.setDrawColor(
      ...color
    );
  } else {
    doc.setDrawColor(
      color ||
        '#000000'
    );
  }

  doc.setLineWidth(
    0.3
  );

  doc.line(
    x,
    y,
    x + width,
    y
  );
};

export const drawPdfDivider = (
  doc,
  y,
  options = {}
) =>
  drawDivider(
    doc,
    y,
    options
  );

/* ============================================================================
   RECT
   ========================================================================== */

export const drawRect = (
  doc,
  x,
  y,
  width,
  height,
  {
    fillColor = null,
    strokeColor = null,
    lineWidth = 0.2,
    radius = 0,
    style = 'S',
  } = {}
) => {
  if (
    fillColor
  ) {
    if (
      Array.isArray(fillColor)
    ) {
      doc.setFillColor(
        ...fillColor
      );
    } else {
      doc.setFillColor(
        fillColor
      );
    }
  }

  if (
    strokeColor
  ) {
    if (
      Array.isArray(strokeColor)
    ) {
      doc.setDrawColor(
        ...strokeColor
      );
    } else {
      doc.setDrawColor(
        strokeColor
      );
    }
  }

  doc.setLineWidth(
    lineWidth
  );

  if (
    radius > 0
  ) {
    doc.roundedRect(
      x,
      y,
      width,
      height,
      radius,
      radius,
      style
    );

    return;
  }

  doc.rect(
    x,
    y,
    width,
    height,
    style
  );
};

export const drawPdfRect =
  drawRect;

/* ============================================================================
   CARD
   ========================================================================== */

export const drawCard = (
  doc,
  ...args
) => {
  let config;

  if (
    args.length >= 5 &&
    typeof args[0] ===
      'number'
  ) {
    const [
      x,
      y,
      width,
      height,
      options = {},
    ] = args;

    config = {
      x,
      y,
      width,
      height,
      ...options,
    };
  } else {
    config =
      args[0] || {};
  }

  const {
    x,
    y,
    width,
    height,

    fill =
      PDF_COLORS.card,

    border =
      PDF_COLORS.border,

    label = '',
    value = '',

    accent =
      PDF_COLORS.primary,

    rtl = false,
  } = config;

  if (
    Array.isArray(fill)
  ) {
    doc.setFillColor(
      ...fill
    );
  } else {
    doc.setFillColor(
      fill
    );
  }

  if (
    Array.isArray(border)
  ) {
    doc.setDrawColor(
      ...border
    );
  } else {
    doc.setDrawColor(
      border
    );
  }

  doc.setLineWidth(
    0.25
  );

  doc.roundedRect(
    x,
    y,
    width,
    height,
    3.5,
    3.5,
    'FD'
  );

  if (label) {
    drawText(
      doc,
      label,
      rtl
        ? x + width - 4
        : x + 4,
      y + 7.4,
      {
        rtl,

        align:
          rtl
            ? 'right'
            : 'left',

        size:
          7.6,

        color:
          PDF_COLORS.muted,
      }
    );
  }

  if (value) {
    drawText(
      doc,
      value,
      rtl
        ? x + width - 4
        : x + 4,
      y + 16,
      {
        rtl,

        align:
          rtl
            ? 'right'
            : 'left',

        size:
          13.8,

        bold: true,

        color:
          accent,
      }
    );
  }
};

export const drawPdfCard =
  drawCard;

/* ============================================================================
   HEADER
   ========================================================================== */

export const drawHeader = (
  doc,
  {
    title,
    subtitle = '',
    color =
      PDF_COLORS.primary,
    rtl = false,
  } = {}
) => {
  const {
    width,
  } =
    getPdfPageSize(doc);

  const x =
    rtl
      ? width -
        PDF_PAGE.marginRight
      : PDF_PAGE.marginLeft;

  drawText(
    doc,
    title,
    x,
    PDF_SPACING.headerTitleY,
    {
      rtl,

      align:
        rtl
          ? 'right'
          : 'left',

      size:
        22,

      bold: true,

      color,
    }
  );

  if (
    subtitle
  ) {
    drawText(
      doc,
      subtitle,
      x,
      PDF_SPACING.headerSubtitleY,
      {
        rtl,

        align:
          rtl
            ? 'right'
            : 'left',

        size:
          10,

        color:
          PDF_COLORS.muted,
      }
    );
  }

  drawDivider(
    doc,
    PDF_SPACING.headerDividerY,
    {
      x1:
        PDF_PAGE.marginLeft,

      x2:
        width -
        PDF_PAGE.marginRight,

      color:
        PDF_COLORS.border,
    }
  );

  return (
    PDF_SPACING.headerDividerY +
    PDF_SPACING.sectionGap
  );
};

export const drawPdfHeader =
  drawHeader;

/* ============================================================================
   FOOTER
   ========================================================================== */

const resolveFooterOptions =
  (
    options = {}
  ) => {
    if (
      options &&
      typeof options ===
        'object' &&
      (
        'direction' in options ||
        'labels' in options ||
        'language' in options
      )
    ) {
      return {
        rtl:
          options.direction ===
          'rtl',

        language:
          String(
            options.language ||
              'en'
          ),

        leftText:
          options.meta
            ?.generatedAtDisplay ||
          '',

        generatedDate:
          options.meta
            ?.generatedDate ||
          '',

        generatedTime:
          options.meta
            ?.generatedTime ||
          '',

        rightText:
          options.labels
            ?.generatedBy ||
          '',
      };
    }

    return options;
  };

export const drawPdfFooter = (
  doc,
  options = {}
) => {
  const {
    rtl = false,
    pageNumber = null,
    leftText = '',
    generatedDate = '',
    generatedTime = '',
    rightText = '',
  } =
    resolveFooterOptions(
      options
    );

  const {
    width,
    height,
  } =
    getPdfPageSize(doc);

  const y =
    height -
    PDF_PAGE.marginBottom +
    4;

  drawDivider(
    doc,
    y - 4,
    {
      x1:
        PDF_PAGE.marginLeft,

      x2:
        width -
        PDF_PAGE.marginRight,

      color:
        PDF_COLORS.border,
    }
  );

  if (
    rtl &&
    (
      generatedDate ||
      generatedTime
    )
  ) {
    const footerWidth =
      58;

    const footerX =
      PDF_PAGE.marginLeft;

    if (
      generatedDate
    ) {
      drawRtlDateParts(
        doc,
        generatedDate,
        {
          x:
            footerX,

          y:
            y - 0.5,

          width:
            footerWidth,

          size:
            6.2,

          color:
            PDF_COLORS.muted,
        }
      );
    }

    if (
      generatedTime
    ) {
      drawRtlTimeParts(
        doc,
        generatedTime,
        {
          x:
            footerX,

          y:
            y + 3.8,

          width:
            footerWidth,

          size:
            6,

          color:
            PDF_COLORS.muted,
        }
      );
    }
  } else if (
    leftText
  ) {
    drawText(
      doc,
      leftText,
      PDF_PAGE.marginLeft,
      y,
      {
        rtl: false,

        align:
          'left',

        size:
          6.8,

        color:
          PDF_COLORS.muted,
      }
    );
  }

  if (
    rightText
  ) {
    drawText(
      doc,
      rightText,
      width -
        PDF_PAGE.marginRight,
      y,
      {
        rtl,

        align:
          'right',

        size:
          6.8,

        color:
          PDF_COLORS.muted,
      }
    );
  }

  if (
    pageNumber !==
    null
  ) {
    drawText(
      doc,
      String(pageNumber),
      width / 2,
      y,
      {
        rtl: false,

        align:
          'center',

        size:
          6.8,

        color:
          PDF_COLORS.muted,
      }
    );
  }
};

export const addPageNumbers = (
  doc,
  options = {}
) => {
  const footerOptions =
    resolveFooterOptions(
      options
    );

  const pageCount =
    doc.getNumberOfPages();

  for (
    let page = 1;
    page <= pageCount;
    page += 1
  ) {
    doc.setPage(
      page
    );

    drawPdfFooter(
      doc,
      {
        ...footerOptions,
        pageNumber: page,
      }
    );
  }
};

/* ============================================================================
   COMPATIBILITY
   ========================================================================== */

export const getRemainingPageSpace =
  (
    doc,
    currentY,
    {
      bottom =
        PDF_PAGE.marginBottom,
    } = {}
  ) =>
    getPdfPageSize(doc).height -
    bottom -
    currentY;

export const needsNewPdfPage =
  (
    doc,
    currentY,
    requiredHeight,
    options = {}
  ) =>
    getRemainingPageSpace(
      doc,
      currentY,
      options
    ) <
    Number(requiredHeight || 0);