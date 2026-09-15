/**
 * Jalali date utilities
 * Supports Persian (Iranian) and Afghan month names.
 *
 * نکته:
 * - محاسبات تاریخ مستقل از نام ماه‌ها هستند.
 * - نام ماه فقط در لایه‌ی نمایش تغییر می‌کند.
 * - تاریخ میلادی/انگلیسی هیچ تغییری نمی‌کند.
 */

/* ============================================================================
   JALALI MONTH NAMES
   ========================================================================== */

export const JALALI_MONTH_NAMES = {
  ir: [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ],

  af: [
    'حمل',
    'ثور',
    'جوزا',
    'سرطان',
    'اسد',
    'سنبله',
    'میزان',
    'عقرب',
    'قوس',
    'جدی',
    'دلو',
    'حوت',
  ],
};

export const DEFAULT_JALALI_MONTH_STYLE =
  'af';

/* ============================================================================
   JALALI MONTH SHORT NAMES
   ========================================================================== */

export const JALALI_MONTH_SHORT_NAMES = {
  ir: [
    'فرو',
    'ارد',
    'خرد',
    'تیر',
    'مرد',
    'شهر',
    'مهر',
    'آبا',
    'آذر',
    'دی',
    'بهم',
    'اسف',
  ],

  af: [
    'حمل',
    'ثور',
    'جوزا',
    'سرطان',
    'اسد',
    'سنبله',
    'میزان',
    'عقرب',
    'قوس',
    'جدی',
    'دلو',
    'حوت',
  ],
};

/* ============================================================================
   SETTINGS
   ========================================================================== */

export const JALALI_MONTH_STYLE_STORAGE_KEY =
  'jalaliMonthStyle';

export const JALALI_MONTH_STYLES = {
  IRAN: 'ir',
  AFGHANISTAN: 'af',
};

/* ============================================================================
   HELPERS
   ========================================================================== */

export function normalizeJalaliMonthStyle(
  style
) {
  if (
    style === 'ir' ||
    style === 'af'
  ) {
    return style;
  }

  return DEFAULT_JALALI_MONTH_STYLE;
}

export function getJalaliMonthStyle() {
  if (
    typeof window ===
    'undefined'
  ) {
    return DEFAULT_JALALI_MONTH_STYLE;
  }

  try {
    const savedStyle =
      window.localStorage.getItem(
        JALALI_MONTH_STYLE_STORAGE_KEY
      );

    return normalizeJalaliMonthStyle(
      savedStyle
    );
  } catch {
    return DEFAULT_JALALI_MONTH_STYLE;
  }
}

export function setJalaliMonthStyle(
  style
) {
  const normalizedStyle =
    normalizeJalaliMonthStyle(
      style
    );

  if (
    typeof window !==
    'undefined'
  ) {
    try {
      window.localStorage.setItem(
        JALALI_MONTH_STYLE_STORAGE_KEY,
        normalizedStyle
      );

      window.dispatchEvent(
        new CustomEvent(
          'jalali-month-style-changed',
          {
            detail:
              normalizedStyle,
          }
        )
      );
    } catch {
      // Ignore localStorage errors.
    }
  }

  return normalizedStyle;
}

/* ============================================================================
   MONTH NAMES
   ========================================================================== */

export function getJalaliMonthName(
  month,
  style = null
) {
  const normalizedStyle =
    normalizeJalaliMonthStyle(
      style ||
        getJalaliMonthStyle()
    );

  const monthNumber =
    Number(month);

  if (
    !Number.isInteger(
      monthNumber
    ) ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    return '';
  }

  return JALALI_MONTH_NAMES[
    normalizedStyle
  ][
    monthNumber - 1
  ];
}

export function getJalaliMonthShortName(
  month,
  style = null
) {
  const normalizedStyle =
    normalizeJalaliMonthStyle(
      style ||
        getJalaliMonthStyle()
    );

  const monthNumber =
    Number(month);

  if (
    !Number.isInteger(
      monthNumber
    ) ||
    monthNumber < 1 ||
    monthNumber > 12
  ) {
    return '';
  }

  return JALALI_MONTH_SHORT_NAMES[
    normalizedStyle
  ][
    monthNumber - 1
  ];
}

export function getJalaliMonthNames(
  style = null
) {
  const normalizedStyle =
    normalizeJalaliMonthStyle(
      style ||
        getJalaliMonthStyle()
    );

  return [
    ...JALALI_MONTH_NAMES[
      normalizedStyle
    ],
  ];
}

/* ============================================================================
   GREGORIAN -> JALALI
   ========================================================================== */

export function gregorianToJalali(
  gregorianYear,
  gregorianMonth,
  gregorianDay
) {
  let gy =
    Number(gregorianYear);

  let gm =
    Number(gregorianMonth);

  let gd =
    Number(gregorianDay);

  if (
    !Number.isInteger(gy) ||
    !Number.isInteger(gm) ||
    !Number.isInteger(gd)
  ) {
    return null;
  }

  gy -= 1600;
  gm -= 1;
  gd -= 1;

  const gregorianDaysInMonth = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  const jalaliDaysInMonth = [
    31,
    31,
    31,
    31,
    31,
    31,
    30,
    30,
    30,
    30,
    30,
    29,
  ];

  let dayNumber =
    365 * gy +
    Math.floor(
      (gy + 3) / 4
    ) -
    Math.floor(
      (gy + 99) / 100
    ) +
    Math.floor(
      (gy + 399) / 400
    );

  for (
    let i = 0;
    i < gm;
    i += 1
  ) {
    dayNumber +=
      gregorianDaysInMonth[
        i
      ];
  }

  if (
    gm > 1 &&
    (gy + 1600) % 4 ===
      0 &&
    (
      (gy + 1600) % 100 !==
        0 ||
      (gy + 1600) % 400 ===
        0
    )
  ) {
    dayNumber += 1;
  }

  dayNumber += gd;

  let jalaliDayNumber =
    dayNumber - 79;

  const jalaliYear =
    979 +
    33 *
      Math.floor(
        jalaliDayNumber /
          12053
      );

  jalaliDayNumber %=
    12053;

  let jy =
    jalaliYear +
    4 *
      Math.floor(
        jalaliDayNumber /
          1461
      );

  jalaliDayNumber %=
    1461;

  if (
    jalaliDayNumber >
    365
  ) {
    jy += Math.floor(
      (jalaliDayNumber - 1) /
        365
    );

    jalaliDayNumber =
      (jalaliDayNumber - 1) %
      365;
  }

  let jm;
  let jd;

  if (
    jalaliDayNumber <
    186
  ) {
    jm =
      1 +
      Math.floor(
        jalaliDayNumber /
          31
      );

    jd =
      1 +
      (
        jalaliDayNumber %
        31
      );
  } else {
    jm =
      7 +
      Math.floor(
        (jalaliDayNumber - 186) /
          30
      );

    jd =
      1 +
      (
        (jalaliDayNumber - 186) %
        30
      );
  }

  void jalaliDaysInMonth;

  return {
    year: jy,
    month: jm,
    day: jd,
  };
}

/* ============================================================================
   DATE -> JALALI
   ========================================================================== */

export function dateToJalali(
  dateInput
) {
  const date =
    normalizeDate(
      dateInput
    );

  if (!date) {
    return null;
  }

  return gregorianToJalali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
}

/* ============================================================================
   FORMAT JALALI
   ========================================================================== */

export function formatJalaliParts(
  jalaliDate,
  {
    monthStyle = null,
    withMonthName = true,
    separator = ' ',
  } = {}
) {
  if (!jalaliDate) {
    return '';
  }

  const {
    year,
    month,
    day,
  } = jalaliDate;

  if (
    !Number.isInteger(
      Number(year)
    ) ||
    !Number.isInteger(
      Number(month)
    ) ||
    !Number.isInteger(
      Number(day)
    )
  ) {
    return '';
  }

  if (
    withMonthName
  ) {
    const monthName =
      getJalaliMonthName(
        month,
        monthStyle
      );

    /*
     * Logical Persian date:
     *
     * 23 سنبله 1405
     *
     * Do not reverse this string here.
     * PDF renderer handles mixed RTL/LTR presentation.
     */
    return `${day} ${monthName} ${year}`;
  }

  return [
    String(year),
    String(month).padStart(
      2,
      '0'
    ),
    String(day).padStart(
      2,
      '0'
    ),
  ].join(separator);
}

export function formatJalaliDate(
  dateInput,
  {
    monthStyle = null,
    withMonthName = true,
    separator = ' ',
  } = {}
) {
  const jalaliDate =
    dateToJalali(
      dateInput
    );

  if (!jalaliDate) {
    return '';
  }

  return formatJalaliParts(
    jalaliDate,
    {
      monthStyle,
      withMonthName,
      separator,
    }
  );
}

/* ============================================================================
   DATE NORMALIZATION
   ========================================================================== */

export function normalizeDate(
  dateInput
) {
  if (
    dateInput instanceof
    Date
  ) {
    if (
      Number.isNaN(
        dateInput.getTime()
      )
    ) {
      return null;
    }

    return dateInput;
  }

  if (
    typeof dateInput ===
    'number'
  ) {
    const date =
      new Date(
        dateInput
      );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }

  if (
    typeof dateInput ===
    'string'
  ) {
    const trimmed =
      dateInput.trim();

    if (!trimmed) {
      return null;
    }

    const date =
      new Date(trimmed);

    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {
      return date;
    }

    const match =
      trimmed.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
      );

    if (match) {
      const [
        ,
        year,
        month,
        day,
      ] = match;

      const parsedDate =
        new Date(
          Number(year),
          Number(month) - 1,
          Number(day)
        );

      return Number.isNaN(
        parsedDate.getTime()
      )
        ? null
        : parsedDate;
    }
  }

  return null;
}

/* ============================================================================
   MONTH LABEL
   ========================================================================== */

export function getJalaliMonthLabel(
  month,
  year = null,
  {
    monthStyle = null,
    includeYear = false,
  } = {}
) {
  const monthName =
    getJalaliMonthName(
      month,
      monthStyle
    );

  if (!monthName) {
    return '';
  }

  if (
    includeYear &&
    year !== null &&
    year !== undefined
  ) {
    return `${monthName} ${year}`;
  }

  return monthName;
}