import {
  formatEnglishDate,
  formatJalaliDate,
  getJalaliMonthStyle,
  formatTime12Hour,
} from '../date/formatDate';

/* ============================================================================
   DIGITS
   ========================================================================== */

export const toEnglishDigits = (
  value
) => {
  return String(
    value ?? ''
  )
    .replace(
      /[۰-۹]/g,
      (digit) =>
        String(
          '۰۱۲۳۴۵۶۷۸۹'.indexOf(
            digit
          )
        )
    )
    .replace(
      /[٠-٩]/g,
      (digit) =>
        String(
          '٠١٢٣٤٥٦٧٨٩'.indexOf(
            digit
          )
        )
    );
};

/* ============================================================================
   NUMBER
   ========================================================================== */

export const safeNumber = (
  value,
  fallback = 0
) => {
  const number =
    Number(
      toEnglishDigits(
        value
      )
    );

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
};

export const formatNumber = (
  value,
  language = 'fa'
) => {
  return new Intl.NumberFormat(
    language === 'en'
      ? 'en-US'
      : 'fa-IR'
  ).format(
    safeNumber(
      value
    )
  );
};

/*
 * Whole number formatter.
 *
 * This is specifically for output where decimal values
 * should never be displayed.
 *
 * Example:
 * 1250.75 -> 1251
 * 4800.20 -> 4800
 * 99.99   -> 100
 */

export const formatWholeNumber = (
  value,
  language = 'fa'
) => {
  return new Intl.NumberFormat(
    language === 'en'
      ? 'en-US'
      : 'fa-IR',
    {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }
  ).format(
    Math.round(
      safeNumber(
        value
      )
    )
  );
};

export const formatDecimal = (
  value,
  language = 'fa'
) => {
  return new Intl.NumberFormat(
    language === 'en'
      ? 'en-US'
      : 'fa-IR',
    {
      maximumFractionDigits: 3,
    }
  ).format(
    safeNumber(
      value
    )
  );
};

export const formatCurrency = (
  value,
  language = 'fa',
  currency = 'AF'
) => {
  const formattedNumber =
    formatNumber(
      value,
      language
    );

  const formattedCurrency =
    String(
      currency ??
        ''
    ).trim();

  if (
    !formattedCurrency
  ) {
    return formattedNumber;
  }

  return `${formattedNumber} ${formattedCurrency}`;
};

/*
 * Whole currency formatter.
 *
 * Intended for PDF display where monetary values
 * should be shown as whole numbers.
 */

export const formatWholeCurrency = (
  value,
  language = 'fa',
  currency = 'AF'
) => {
  const formattedNumber =
    formatWholeNumber(
      value,
      language
    );

  const formattedCurrency =
    String(
      currency ??
        ''
    ).trim();

  if (
    !formattedCurrency
  ) {
    return formattedNumber;
  }

  return `${formattedNumber} ${formattedCurrency}`;
};

/* ============================================================================
   DATE
   ========================================================================== */

export const formatDateForExport = (
  value,
  language = 'fa'
) => {
  if (!value) {
    return '-';
  }

  if (
    language === 'en'
  ) {
    return (
      formatEnglishDate(
        value,
        {
          locale:
            'en-US',

          options: {
            year:
              'numeric',

            month:
              '2-digit',

            day:
              '2-digit',
          },
        }
      ) || '-'
    );
  }

  return (
    formatJalaliDate(
      value,
      {
        monthStyle:
          getJalaliMonthStyle(),

        withMonthName:
          true,
      }
    ) || '-'
  );
};

/* ============================================================================
   TIME — 12 HOUR
   ========================================================================== */

export const formatTimeForExport = (
  value,
  language = 'fa'
) => {
  if (!value) {
    return '';
  }

  return (
    formatTime12Hour(
      value,
      {
        locale:
          language === 'en'
            ? 'en-US'
            : 'fa-IR',
      }
    ) || ''
  );
};

/* ============================================================================
   PHONE
   ========================================================================== */

/*
 * Phone numbers are intentionally kept as text.
 *
 * We do not run them through number formatters because:
 * - leading zeroes must be preserved
 * - country codes must remain intact
 * - +93 / +98 / etc. must not be converted
 * - spaces and separators may be meaningful to the user
 */

export const formatPhoneForExport = (
  value
) => {
  const phone =
    String(
      value ?? ''
    ).trim();

  return phone || '-';
};

/* ============================================================================
   TEXT
   ========================================================================== */

export const normalizeExportText = (
  value,
  fallback = ''
) => {
  const normalized =
    String(
      value ?? ''
    )
      .replace(
        /\r\n/g,
        '\n'
      )
      .replace(
        /\r/g,
        '\n'
      )
      .trim();

  return (
    normalized ||
    fallback
  );
};

export const truncateText = (
  value,
  maxLength = 60
) => {
  const valueText =
    String(
      value ?? ''
    );

  const safeLength =
    Math.max(
      1,
      Number(maxLength) || 60
    );

  if (
    valueText.length <=
    safeLength
  ) {
    return valueText;
  }

  return `${valueText.slice(
    0,
    Math.max(
      1,
      safeLength - 1
    )
  )}…`;
};

/* ============================================================================
   FILENAME
   ========================================================================== */

export const sanitizeFileName = (
  value
) => {
  return (
    String(
      value ||
        'report'
    )
      .replace(
        /[\\/:*?"<>|]/g,
        '-'
      )
      .replace(
        /\s+/g,
        '-'
      )
      .replace(
        /-+/g,
        '-'
      )
      .replace(
        /^-|-$/g,
        ''
      )
      .slice(
        0,
        100
      ) ||
    'report'
  );
};