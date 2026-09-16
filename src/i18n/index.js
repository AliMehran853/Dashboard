import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import faTranslate from './faTranslate';
import enTranslate from './enTranslate';

// =========================================================
// Constants
// =========================================================

const LANGUAGE_KEY = 'app-language';

const resources = {
    fa: faTranslate,
    en: enTranslate,
};

// =========================================================
// Initial Language
// =========================================================

const getInitialLanguage = () => {
    try {
        const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
        return savedLanguage === 'en' ? 'en' : 'fa';
    } catch {
        return 'fa';
    }
};

// =========================================================
// Document Language / Direction
// =========================================================

export const updateDocumentLanguage = (language) => {
    if (typeof document === 'undefined') return;

    const isEnglish = language === 'en';

    document.documentElement.lang = isEnglish ? 'en' : 'fa';
    document.documentElement.dir = isEnglish ? 'ltr' : 'rtl';
};

// =========================================================
// Initialize i18n
// =========================================================

i18n
    .use(initReactI18next)
    .init({
        resources,

        lng: getInitialLanguage(),

        fallbackLng: 'fa',

        supportedLngs: ['fa', 'en'],

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: false,
        },

        returnNull: false,
    })
    .then(() => {
        updateDocumentLanguage(i18n.language);
    });

// =========================================================
// Language Change
// =========================================================

export const changeLanguage = async (language) => {
    const nextLanguage = language === 'en' ? 'en' : 'fa';

    await i18n.changeLanguage(nextLanguage);

    try {
        localStorage.setItem(LANGUAGE_KEY, nextLanguage);
    } catch {
        /* storage may be unavailable */
    }

    updateDocumentLanguage(nextLanguage);
};

// =========================================================
// Utilities
// =========================================================

export const getCurrentLanguage = () => i18n.language;

export const isRTL = () => i18n.language !== 'en';

export default i18n;