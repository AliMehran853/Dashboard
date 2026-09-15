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
      toEnglishDigits(value)
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
    safeNumber(value)
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
    safeNumber(value)
  );
};

export const formatCurrency = (
  value,
  language = 'fa',
  currency = 'AF'
) => {
  return `${formatNumber(
    value,
    language
  )} ${currency}`;
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
          locale: 'en-US',

          options: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
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

        withMonthName: true,
      }
    ) || '-'
  );
};

/* ============================================================================
   TIME - ALWAYS 12 HOUR
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
   TEXT
   ========================================================================== */

export const truncateText = (
  value,
  maxLength = 60
) => {
  const valueText =
    String(
      value ?? ''
    );

  if (
    valueText.length <=
    maxLength
  ) {
    return valueText;
  }

  return `${valueText.slice(
    0,
    Math.max(
      1,
      maxLength - 1
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