// =========================================================
// Number Utilities
// =========================================================


// =========================================================
// Convert Persian / Arabic Numbers → English Numbers
// =========================================================

export function toEnglishNumbers(value) {

    if (value === null || value === undefined) {
        return ''
    }

    return String(value)
        .replace(/[۰-۹]/g, (digit) => {
            return String(
                '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)
            );
        })
        .replace(/[٠-٩]/g, (digit) => {
            return String(
                '٠١٢٣٤٥٦٧٨٩'.indexOf(digit)
            );
        });

}


// =========================================================
// Convert Value To Number
// =========================================================

export function toNumber(value) {

    const englishValue =
        toEnglishNumbers(value);

    if (
        englishValue === '' ||
        englishValue === null ||
        englishValue === undefined
    ) {
        return 0;
    }

    const number =
        Number(englishValue);

    return Number.isFinite(number)
        ? number
        : 0;

}


// =========================================================
// Format Number For Persian UI
// =========================================================

export function formatNumber(value) {

    const number =
        toNumber(value);

    return new Intl.NumberFormat('fa-AF')
        .format(number);

}
