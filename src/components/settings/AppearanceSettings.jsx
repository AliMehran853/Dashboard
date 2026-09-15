import {
    Palette, Moon, Sun, Check, Sparkles, CalendarDays,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import {
    getJalaliMonthStyle, setJalaliMonthStyle, JALALI_MONTH_STYLES,
} from '../../utils/date/jalali';

// =========================================================
// Accent Palettes
// =========================================================

const ACCENT_KEYS = [
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

const ACCENT_STYLES = {
    emerald: { swatch: 'bg-emerald-500', ring: 'ring-emerald-500/30', text: 'text-emerald-500', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
    blue:    { swatch: 'bg-blue-500',    ring: 'ring-blue-500/30',    text: 'text-blue-500',    border: 'border-blue-500/40',    bg: 'bg-blue-500/10' },
    indigo:  { swatch: 'bg-indigo-500',  ring: 'ring-indigo-500/30',  text: 'text-indigo-500',  border: 'border-indigo-500/40',  bg: 'bg-indigo-500/10' },
    violet:  { swatch: 'bg-violet-500',  ring: 'ring-violet-500/30',  text: 'text-violet-500',  border: 'border-violet-500/40',  bg: 'bg-violet-500/10' },
    rose:    { swatch: 'bg-rose-500',    ring: 'ring-rose-500/30',    text: 'text-rose-500',    border: 'border-rose-500/40',    bg: 'bg-rose-500/10' },
    red:     { swatch: 'bg-red-500',     ring: 'ring-red-500/30',     text: 'text-red-500',     border: 'border-red-500/40',     bg: 'bg-red-500/10' },
    amber:   { swatch: 'bg-amber-500',   ring: 'ring-amber-500/30',   text: 'text-amber-500',   border: 'border-amber-500/40',   bg: 'bg-amber-500/10' },
    cyan:    { swatch: 'bg-cyan-500',    ring: 'ring-cyan-500/30',    text: 'text-cyan-500',    border: 'border-cyan-500/40',    bg: 'bg-cyan-500/10' },
    teal:    { swatch: 'bg-teal-500',    ring: 'ring-teal-500/30',    text: 'text-teal-500',    border: 'border-teal-500/40',    bg: 'bg-teal-500/10' },
};

// =========================================================
// Appearance Settings
// =========================================================

function AppearanceSettings() {
    const { t, i18n } = useTranslation();
    const { theme, setTheme, accentColor, setAccentColor } = useTheme();

    const [jalaliMonthStyle, setJalaliMonthStyleState] = useState(() => getJalaliMonthStyle());
    const direction = i18n.dir();

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const handleChange = (event) => {
            setJalaliMonthStyleState(event?.detail || getJalaliMonthStyle());
        };
        const handleStorage = (event) => {
            if (event.key === 'jalaliMonthStyle') {
                setJalaliMonthStyleState(getJalaliMonthStyle());
            }
        };

        window.addEventListener('jalali-month-style-changed', handleChange);
        window.addEventListener('storage', handleStorage);
        return () => {
            window.removeEventListener('jalali-month-style-changed', handleChange);
            window.removeEventListener('storage', handleStorage);
        };
    }, []);

    const handleJalaliMonthStyleChange = (style) => {
        setJalaliMonthStyleState(setJalaliMonthStyle(style));
    };

    return (
        <section dir={direction} className="ui-card overflow-hidden p-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/10 bg-violet-500/10">
                    <Palette size={19} className="text-violet-500 dark:text-violet-400" />
                </div>
                <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-[var(--text-primary)]">
                        {t('settings.appearance.title')}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                        {t('settings.appearance.description')}
                    </p>
                </div>
            </div>

            <div className="space-y-8 p-4 sm:p-6">
                {/* Theme */}
                <div>
                    <SectionHeading
                        icon={Sparkles}
                        title={t('settings.appearance.theme.title')}
                        description={t('settings.appearance.theme.description')}
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <ThemeCard
                            active={theme === 'dark'}
                            onClick={() => setTheme('dark')}
                            icon={Moon}
                            title={t('settings.appearance.theme.dark')}
                            description={t('settings.appearance.theme.darkMode')}
                        />
                        <ThemeCard
                            active={theme === 'light'}
                            onClick={() => setTheme('light')}
                            icon={Sun}
                            title={t('settings.appearance.theme.light')}
                            description={t('settings.appearance.theme.lightMode')}
                            light
                        />
                    </div>
                </div>

                {/* Jalali months */}
                <div>
                    <SectionHeading
                        icon={CalendarDays}
                        title={t('settings.appearance.jalaliMonths.title')}
                        description={t('settings.appearance.jalaliMonths.description')}
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <ChoiceCard
                            active={jalaliMonthStyle === JALALI_MONTH_STYLES.AFGHANISTAN}
                            onClick={() => handleJalaliMonthStyleChange(JALALI_MONTH_STYLES.AFGHANISTAN)}
                            title={t('settings.appearance.jalaliMonths.afghanistan')}
                            description={t('settings.appearance.jalaliMonths.afghanistanMonths')}
                        />
                        <ChoiceCard
                            active={jalaliMonthStyle === JALALI_MONTH_STYLES.IRAN}
                            onClick={() => handleJalaliMonthStyleChange(JALALI_MONTH_STYLES.IRAN)}
                            title={t('settings.appearance.jalaliMonths.iran')}
                            description={t('settings.appearance.jalaliMonths.iranMonths')}
                        />
                    </div>
                </div>

                {/* Accent */}
                <div>
                    <div className="mb-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[var(--accent-500)]" />
                            <p className="text-sm font-semibold text-[var(--text-primary)]">
                                {t('settings.appearance.accent.title')}
                            </p>
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                            {t('settings.appearance.accent.description')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {ACCENT_KEYS.map((name) => {
                            const s = ACCENT_STYLES[name];
                            const isActive = accentColor === name;
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setAccentColor(name)}
                                    className={`group relative flex w-full items-center gap-3 rounded-xl border p-3 text-start transition-all duration-200 ${
                                        isActive
                                            ? `${s.border} ${s.bg} shadow-sm`
                                            : 'border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)]'
                                    }`}
                                >
                                    <span
                                        className={`h-9 w-9 shrink-0 rounded-xl ${s.swatch} ring-4 transition-all duration-200 ${
                                            isActive ? s.ring : 'ring-transparent'
                                        }`}
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className={`block truncate text-xs font-semibold ${
                                            isActive ? s.text : 'text-[var(--text-primary)]'
                                        }`}>
                                            {t(`settings.appearance.colors.${name}.name`)}
                                        </span>
                                        <span className="mt-0.5 block truncate text-[10px] text-[var(--text-muted)]">
                                            {t(`settings.appearance.colors.${name}.description`)}
                                        </span>
                                    </span>
                                    {isActive && (
                                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${s.swatch}`}>
                                            <Check size={13} className="text-white" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

// =========================================================
// Sub-components
// =========================================================

function SectionHeading({ icon: Icon, title, description }) {
    return (
        <div className="mb-4">
            <div className="flex items-center gap-2">
                <Icon size={15} className="text-[var(--accent-500)]" />
                <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
            </div>
            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">{description}</p>
        </div>
    );
}

function ThemeCard({ active, onClick, icon: Icon, title, description, light = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative w-full rounded-xl border p-4 text-start transition-all duration-200 ${
                active
                    ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] shadow-sm'
                    : 'border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)]'
            }`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        light ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500 dark:text-slate-300'
                    }`}>
                        <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{title}</p>
                        <p className="mt-1 truncate text-[10px] text-[var(--text-muted)]">{description}</p>
                    </div>
                </div>
                {active && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-500)]">
                        <Check size={13} className="text-white" />
                    </span>
                )}
            </div>
        </button>
    );
}

function ChoiceCard({ active, onClick, title, description }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`group relative w-full rounded-xl border p-4 text-start transition-all duration-200 ${
                active
                    ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] shadow-sm'
                    : 'border-[var(--border)] bg-[var(--surface-muted)] hover:border-[var(--border-strong)] hover:bg-[var(--surface)]'
            }`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
                    <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">{description}</p>
                </div>
                {active && (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-500)]">
                        <Check size={13} className="text-white" />
                    </span>
                )}
            </div>
        </button>
    );
}

export default AppearanceSettings;