import {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';


// =========================================================
// Theme Context
// =========================================================

const ThemeContext = createContext(null);


// =========================================================
// Allowed Accent Colors
// =========================================================

const ALLOWED_ACCENTS = [
    'emerald',
    'blue',
    'violet',
    'amber',
    'cyan',
    'rose',
];


// =========================================================
// Theme Provider
// =========================================================

export function ThemeProvider({ children }) {

    // =====================================================
    // Theme
    // =====================================================

    const [
        theme,
        setThemeState,
    ] = useState(() => {

        const savedTheme =
            localStorage.getItem('app_theme');

        return savedTheme === 'light'
            ? 'light'
            : 'dark';

    });


    // =====================================================
    // Accent
    // =====================================================

    const [
        accentColor,
        setAccentColorState,
    ] = useState(() => {

        const savedAccent =
            localStorage.getItem(
                'app_accent_color'
            );

        return ALLOWED_ACCENTS.includes(
            savedAccent
        )
            ? savedAccent
            : 'emerald';

    });


    // =====================================================
    // Apply Theme
    // =====================================================

    useEffect(() => {

        const root =
            document.documentElement;


        if (theme === 'dark') {

            root.classList.add('dark');

        } else {

            root.classList.remove('dark');

        }


        root.style.colorScheme =
            theme;


        localStorage.setItem(
            'app_theme',
            theme
        );

    }, [theme]);


    // =====================================================
    // Apply Accent
    // =====================================================

    useEffect(() => {

        const root =
            document.documentElement;


        root.dataset.accent =
            accentColor;


        localStorage.setItem(
            'app_accent_color',
            accentColor
        );

    }, [accentColor]);


    // =====================================================
    // Set Theme
    // =====================================================

    const setTheme = (newTheme) => {

        if (
            newTheme !== 'dark' &&
            newTheme !== 'light'
        ) {

            return;

        }


        setThemeState(
            newTheme
        );

    };


    // =====================================================
    // Toggle Theme
    // =====================================================

    const toggleTheme = () => {

        setThemeState(
            (currentTheme) => {

                return currentTheme === 'dark'
                    ? 'light'
                    : 'dark';

            }
        );

    };


    // =====================================================
    // Set Accent
    // =====================================================

    const setAccentColor = (
        newAccent
    ) => {

        if (
            !ALLOWED_ACCENTS.includes(
                newAccent
            )
        ) {

            return;

        }


        setAccentColorState(
            newAccent
        );

    };


    // =====================================================
    // Context Value
    // =====================================================

    const value = {

        theme,

        setTheme,

        toggleTheme,

        accentColor,

        setAccentColor,

    };


    // =====================================================
    // Provider
    // =====================================================

    return (

        <ThemeContext.Provider
            value={value}
        >

            {children}

        </ThemeContext.Provider>

    );

}


// =========================================================
// useTheme
// =========================================================

export function useTheme() {

    const context =
        useContext(
            ThemeContext
        );


    if (!context) {

        throw new Error(
            'useTheme must be used inside ThemeProvider'
        );

    }


    return context;

}