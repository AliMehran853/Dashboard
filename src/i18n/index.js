import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import faTranslate from './faTranslate';
import enTranslate from './enTranslate';

const LANGUAGE_KEY =
    'app-language';

const resources = {
    fa: faTranslate,
    en: enTranslate,
};

const getInitialLanguage = () => {
    const savedLanguage =
        localStorage.getItem(
            LANGUAGE_KEY
        );

    return savedLanguage === 'en'
        ? 'en'
        : 'fa';
};

export const updateDocumentLanguage = (
    language
) => {
    const isEnglish =
        language === 'en';

    document.documentElement.lang =
        isEnglish ? 'en' : 'fa';

    document.documentElement.dir =
        isEnglish ? 'ltr' : 'rtl';
};

i18n
    .use(initReactI18next)
    .init({
        resources,

        lng: getInitialLanguage(),

        fallbackLng: 'fa',

        interpolation: {
            escapeValue: false,
        },

        react: {
            useSuspense: false,
        },
    })
    .then(() => {
        updateDocumentLanguage(
            i18n.language
        );
    });

export const changeLanguage = async (
    language
) => {
    const nextLanguage =
        language === 'en'
            ? 'en'
            : 'fa';

    await i18n.changeLanguage(
        nextLanguage
    );

    localStorage.setItem(
        LANGUAGE_KEY,
        nextLanguage
    );

    updateDocumentLanguage(
        nextLanguage
    );
};

export const getCurrentLanguage =
    () => {
        return i18n.language;
    };

export const isRTL = () => {
    return i18n.language !== 'en';
};

export default i18n;