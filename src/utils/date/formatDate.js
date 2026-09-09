import {
  dateToJalali,
  formatJalaliDate,
  formatJalaliParts,
  getJalaliMonthName,
  getJalaliMonthShortName,
  getJalaliMonthStyle,
  getJalaliMonthNames,
  normalizeDate,
  setJalaliMonthStyle,
} from './jalali';

// ----------------------------------------------------
// Gregorian / English date
// ----------------------------------------------------

export function formatEnglishDate(
  dateInput,
  {
    locale = 'en-US',
    options = {},
  } = {}
) {
  const date = normalizeDate(dateInput);

  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
}

// ----------------------------------------------------
// Gregorian numeric date
// ----------------------------------------------------

export function formatEnglishNumericDate(dateInput) {
  const date = normalizeDate(dateInput);

  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// ----------------------------------------------------
// Jalali date
// ----------------------------------------------------

export function formatDate(
  dateInput,
  {
    calendar = 'jalali',
    monthStyle = null,
    withMonthName = true,
    separator = ' ',
  } = {}
) {
  if (calendar === 'gregorian' || calendar === 'english') {
    return formatEnglishDate(dateInput);
  }

  return formatJalaliDate(dateInput, {
    monthStyle,
    withMonthName,
    separator,
  });
}

// ----------------------------------------------------
// Common aliases
// ----------------------------------------------------

export function formatJalali(
  dateInput,
  options = {}
) {
  return formatJalaliDate(dateInput, options);
}

export function formatJalaliDateWithMonth(
  dateInput,
  monthStyle = null
) {
  return formatJalaliDate(dateInput, {
    monthStyle,
    withMonthName: true,
  });
}

export function formatJalaliNumeric(
  dateInput,
  separator = '/'
) {
  const jalaliDate = dateToJalali(dateInput);

  if (!jalaliDate) {
    return '';
  }

  return [
    String(jalaliDate.year),
    String(jalaliDate.month).padStart(2, '0'),
    String(jalaliDate.day).padStart(2, '0'),
  ].join(separator);
}

// ----------------------------------------------------
// Month helpers
// ----------------------------------------------------

export {
  getJalaliMonthName,
  getJalaliMonthShortName,
  getJalaliMonthStyle,
  getJalaliMonthNames,
  setJalaliMonthStyle,
  dateToJalali,
  formatJalaliDate,
  formatJalaliParts,
};

// ----------------------------------------------------
// Utility for chart labels
// ----------------------------------------------------

export function getJalaliMonthLabel(
  month,
  year = null,
  {
    monthStyle = null,
    includeYear = false,
  } = {}
) {
  const monthName = getJalaliMonthName(month, monthStyle);

  if (!monthName) {
    return '';
  }

  if (includeYear && year !== null && year !== undefined) {
    return `${monthName} ${year}`;
  }

  return monthName;
}

// ----------------------------------------------------
// Utility for displaying a date safely
// ----------------------------------------------------

export function safeFormatDate(
  dateInput,
  fallback = '—',
  options = {}
) {
  const result = formatDate(dateInput, options);

  return result || fallback;
}