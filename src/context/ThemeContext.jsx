import { createContext, useContext, useEffect, useState } from 'react';

// =========================================================
// Theme Context
// =========================================================

const ThemeContext = createContext(null);

const ALLOWED_ACCENTS = [
    'emerald',
    'blue',
    'indigo',
    'violet',
    'rose',
    'red',
    'amber',
    'cyan',
    'teal',
];

// =========================================================
// Theme Provider
// =========================================================

export function ThemeProvider({ children }) {
    const [theme, setThemeState] = useState(() => {
        const savedTheme = localStorage.getItem('app_theme');
        return savedTheme === 'light' ? 'light' : 'dark';
    });

    const [accentColor, setAccentColorState] = useState(() => {
        const savedAccent = localStorage.getItem('app_accent_color');
        return ALLOWED_ACCENTS.includes(savedAccent) ? savedAccent : 'emerald';
    });

    // Apply theme
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
        root.style.colorScheme = theme;
        localStorage.setItem('app_theme', theme);
    }, [theme]);

    // Apply accent
    useEffect(() => {
        const root = document.documentElement;
        root.dataset.accent = accentColor;
        localStorage.setItem('app_accent_color', accentColor);
    }, [accentColor]);

    // Setters
    const setTheme = (newTheme) => {
        if (newTheme !== 'dark' && newTheme !== 'light') return;
        setThemeState(newTheme);
    };

    const toggleTheme = () => {
        setThemeState((current) => (current === 'dark' ? 'light' : 'dark'));
    };

    const setAccentColor = (newAccent) => {
        if (!ALLOWED_ACCENTS.includes(newAccent)) return;
        setAccentColorState(newAccent);
    };

    const value = {
        theme,
        setTheme,
        toggleTheme,
        accentColor,
        setAccentColor,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

// =========================================================
// useTheme
// =========================================================

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used inside ThemeProvider');
    }
    return context;
}