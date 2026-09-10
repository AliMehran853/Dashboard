import {
    Palette,
    Moon,
    Sun,
    Check,
    Sparkles,
    CalendarDays,
} from 'lucide-react';

import {
    useEffect,
    useState,
} from 'react';

import {
    useTranslation,
} from 'react-i18next';

import {
    useTheme,
} from '../../context/ThemeContext';

import {
    getJalaliMonthStyle,
    setJalaliMonthStyle,
    JALALI_MONTH_STYLES,
} from '../../utils/date/jalali';


// =========================================================
// Appearance Settings
// =========================================================

function AppearanceSettings() {

    const {
        t,
        i18n,
    } = useTranslation();


    const {
        theme,
        setTheme,

        accentColor,
        setAccentColor,
    } = useTheme();


    // =====================================================
    // Jalali Month Style
    // =====================================================

    const [
        jalaliMonthStyle,
        setJalaliMonthStyleState,
    ] = useState(
        () =>
            getJalaliMonthStyle()
    );


    // =====================================================
    // Direction
    // =====================================================

    const direction =
        i18n.dir();


    // =====================================================
    // Listen For External Changes
    // =====================================================

    useEffect(() => {

        if (
            typeof window ===
            'undefined'
        ) {

            return undefined;

        }


        const handleChange = (
            event
        ) => {

            const nextStyle =
                event?.detail ||
                getJalaliMonthStyle();


            setJalaliMonthStyleState(
                nextStyle
            );

        };


        const handleStorage = (
            event
        ) => {

            if (
                event.key ===
                'jalaliMonthStyle'
            ) {

                setJalaliMonthStyleState(
                    getJalaliMonthStyle()
                );

            }

        };


        window.addEventListener(
            'jalali-month-style-changed',
            handleChange
        );


        window.addEventListener(
            'storage',
            handleStorage
        );


        return () => {

            window.removeEventListener(
                'jalali-month-style-changed',
                handleChange
            );


            window.removeEventListener(
                'storage',
                handleStorage
            );

        };

    }, []);


    // =====================================================
    // Change Jalali Month Style
    // =====================================================

    const handleJalaliMonthStyleChange =
        (style) => {

            const nextStyle =
                setJalaliMonthStyle(
                    style
                );


            setJalaliMonthStyleState(
                nextStyle
            );

        };


    // =====================================================
    // Accent Palette
    // =====================================================

    const colors = [

        {
            name:
                'emerald',

            label:
                t(
                    'settings.appearance.colors.emerald.name'
                ),

            description:
                t(
                    'settings.appearance.colors.emerald.description'
                ),

            colorClass:
                'bg-emerald-500',

            ringClass:
                'ring-emerald-500/30',

            textClass:
                'text-emerald-500',

            borderClass:
                'border-emerald-500/40',

            bgClass:
                'bg-emerald-500/10',
        },


        {
            name:
                'blue',

            label:
                t(
                    'settings.appearance.colors.blue.name'
                ),

            description:
                t(
                    'settings.appearance.colors.blue.description'
                ),

            colorClass:
                'bg-blue-500',

            ringClass:
                'ring-blue-500/30',

            textClass:
                'text-blue-500',

            borderClass:
                'border-blue-500/40',

            bgClass:
                'bg-blue-500/10',
        },


        {
            name:
                'violet',

            label:
                t(
                    'settings.appearance.colors.violet.name'
                ),

            description:
                t(
                    'settings.appearance.colors.violet.description'
                ),

            colorClass:
                'bg-violet-500',

            ringClass:
                'ring-violet-500/30',

            textClass:
                'text-violet-500',

            borderClass:
                'border-violet-500/40',

            bgClass:
                'bg-violet-500/10',
        },


        {
            name:
                'amber',

            label:
                t(
                    'settings.appearance.colors.amber.name'
                ),

            description:
                t(
                    'settings.appearance.colors.amber.description'
                ),

            colorClass:
                'bg-amber-500',

            ringClass:
                'ring-amber-500/30',

            textClass:
                'text-amber-500',

            borderClass:
                'border-amber-500/40',

            bgClass:
                'bg-amber-500/10',
        },


        {
            name:
                'cyan',

            label:
                t(
                    'settings.appearance.colors.cyan.name'
                ),

            description:
                t(
                    'settings.appearance.colors.cyan.description'
                ),

            colorClass:
                'bg-cyan-500',

            ringClass:
                'ring-cyan-500/30',

            textClass:
                'text-cyan-500',

            borderClass:
                'border-cyan-500/40',

            bgClass:
                'bg-cyan-500/10',
        },


        {
            name:
                'rose',

            label:
                t(
                    'settings.appearance.colors.rose.name'
                ),

            description:
                t(
                    'settings.appearance.colors.rose.description'
                ),

            colorClass:
                'bg-rose-500',

            ringClass:
                'ring-rose-500/30',

            textClass:
                'text-rose-500',

            borderClass:
                'border-rose-500/40',

            bgClass:
                'bg-rose-500/10',
        },

    ];


    // =====================================================
    // Render
    // =====================================================

    return (

        <section
            dir={
                direction
            }
            className="
                ui-card
                overflow-hidden
                p-0
            "
        >

            {/* =================================================
                Header
            ================================================== */}

            <div
                className="
                    relative
                    flex
                    items-center
                    gap-3
                    border-b
                    border-[var(--border)]
                    px-4
                    py-4
                    sm:px-6
                    sm:py-5
                "
            >

                <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-violet-500/10
                        bg-violet-500/10
                    "
                >

                    <Palette
                        size={19}
                        className="
                            text-violet-500
                            dark:text-violet-400
                        "
                    />

                </div>


                <div
                    className="
                        min-w-0
                    "
                >

                    <h2
                        className="
                            truncate
                            text-base
                            font-bold
                            text-[var(--text-primary)]
                        "
                    >
                        {
                            t(
                                'settings.appearance.title'
                            )
                        }
                    </h2>


                    <p
                        className="
                            mt-1
                            text-xs
                            leading-5
                            text-[var(--text-muted)]
                        "
                    >
                        {
                            t(
                                'settings.appearance.description'
                            )
                        }
                    </p>

                </div>

            </div>


            {/* =================================================
                Content
            ================================================== */}

            <div
                className="
                    space-y-8
                    p-4
                    sm:p-6
                "
            >

                {/* =================================================
                    Theme
                ================================================== */}

                <div>

                    <SectionHeading
                        icon={
                            Sparkles
                        }
                        title={
                            t(
                                'settings.appearance.theme.title'
                            )
                        }
                        description={
                            t(
                                'settings.appearance.theme.description'
                            )
                        }
                    />


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                        "
                    >

                        <ThemeCard
                            active={
                                theme === 'dark'
                            }
                            onClick={() =>
                                setTheme(
                                    'dark'
                                )
                            }
                            icon={
                                Moon
                            }
                            title={
                                t(
                                    'settings.appearance.theme.dark'
                                )
                            }
                            description={
                                t(
                                    'settings.appearance.theme.darkMode'
                                )
                            }
                        />


                        <ThemeCard
                            active={
                                theme === 'light'
                            }
                            onClick={() =>
                                setTheme(
                                    'light'
                                )
                            }
                            icon={
                                Sun
                            }
                            title={
                                t(
                                    'settings.appearance.theme.light'
                                )
                            }
                            description={
                                t(
                                    'settings.appearance.theme.lightMode'
                                )
                            }
                            light
                        />

                    </div>

                </div>


                {/* =================================================
                    Jalali Month Naming
                ================================================== */}

                <div>

                    <SectionHeading
                        icon={
                            CalendarDays
                        }
                        title={
                            t(
                                'settings.appearance.jalaliMonths.title'
                            )
                        }
                        description={
                            t(
                                'settings.appearance.jalaliMonths.description'
                            )
                        }
                    />


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                        "
                    >

                        <ChoiceCard
                            active={
                                jalaliMonthStyle ===
                                JALALI_MONTH_STYLES.AFGHANISTAN
                            }
                            onClick={() =>
                                handleJalaliMonthStyleChange(
                                    JALALI_MONTH_STYLES.AFGHANISTAN
                                )
                            }
                            title={
                                t(
                                    'settings.appearance.jalaliMonths.afghanistan'
                                )
                            }
                            description={
                                t(
                                    'settings.appearance.jalaliMonths.afghanistanMonths'
                                )
                            }
                        />


                        <ChoiceCard
                            active={
                                jalaliMonthStyle ===
                                JALALI_MONTH_STYLES.IRAN
                            }
                            onClick={() =>
                                handleJalaliMonthStyleChange(
                                    JALALI_MONTH_STYLES.IRAN
                                )
                            }
                            title={
                                t(
                                    'settings.appearance.jalaliMonths.iran'
                                )
                            }
                            description={
                                t(
                                    'settings.appearance.jalaliMonths.iranMonths'
                                )
                            }
                        />

                    </div>

                </div>


                {/* =================================================
                    Accent Color
                ================================================== */}

                <div>

                    <div
                        className="
                            mb-4
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                            "
                        >

                            <span
                                className="
                                    h-2
                                    w-2
                                    rounded-full
                                    bg-[var(--accent)]
                                "
                            />

                            <p
                                className="
                                    text-sm
                                    font-semibold
                                    text-[var(--text-primary)]
                                "
                            >
                                {
                                    t(
                                        'settings.appearance.accent.title'
                                    )
                                }
                            </p>

                        </div>


                        <p
                            className="
                                mt-1
                                text-xs
                                leading-5
                                text-[var(--text-muted)]
                            "
                        >
                            {
                                t(
                                    'settings.appearance.accent.description'
                                )
                            }
                        </p>

                    </div>


                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            sm:grid-cols-2
                            lg:grid-cols-3
                        "
                    >

                        {
                            colors.map(
                                (
                                    color
                                ) => {

                                    const isActive =
                                        accentColor ===
                                        color.name;


                                    return (

                                        <button
                                            key={
                                                color.name
                                            }
                                            type="button"
                                            onClick={() =>
                                                setAccentColor(
                                                    color.name
                                                )
                                            }
                                            className={`
                                                group
                                                relative
                                                flex
                                                w-full
                                                items-center
                                                gap-3
                                                rounded-xl
                                                border
                                                p-3
                                                text-start
                                                transition-all
                                                duration-200
                                                ${
                                                    isActive
                                                        ? `
                                                            ${color.borderClass}
                                                            ${color.bgClass}
                                                            shadow-sm
                                                        `
                                                        : `
                                                            border-[var(--border)]
                                                            bg-[var(--surface-muted)]
                                                            hover:border-[var(--border-strong)]
                                                            hover:bg-[var(--surface)]
                                                        `
                                                }
                                            `}
                                        >

                                            <span
                                                className={`
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    rounded-xl
                                                    ${color.colorClass}
                                                    ring-4
                                                    transition-all
                                                    duration-200
                                                    ${
                                                        isActive
                                                            ? color.ringClass
                                                            : 'ring-transparent'
                                                    }
                                                `}
                                            />


                                            <span
                                                className="
                                                    min-w-0
                                                    flex-1
                                                "
                                            >

                                                <span
                                                    className={`
                                                        block
                                                        truncate
                                                        text-xs
                                                        font-semibold
                                                        ${
                                                            isActive
                                                                ? color.textClass
                                                                : 'text-[var(--text-primary)]'
                                                        }
                                                    `}
                                                >
                                                    {
                                                        color.label
                                                    }
                                                </span>


                                                <span
                                                    className="
                                                        mt-0.5
                                                        block
                                                        truncate
                                                        text-[10px]
                                                        text-[var(--text-muted)]
                                                    "
                                                >
                                                    {
                                                        color.description
                                                    }
                                                </span>

                                            </span>


                                            {
                                                isActive && (

                                                    <span
                                                        className={`
                                                            flex
                                                            h-6
                                                            w-6
                                                            shrink-0
                                                            items-center
                                                            justify-center
                                                            rounded-full
                                                            ${color.colorClass}
                                                        `}
                                                    >

                                                        <Check
                                                            size={13}
                                                            className="
                                                                text-white
                                                            "
                                                        />

                                                    </span>

                                                )
                                            }

                                        </button>

                                    );

                                }
                            )
                        }

                    </div>

                </div>

            </div>

        </section>

    );

}


// =========================================================
// Section Heading
// =========================================================

function SectionHeading({
    icon: Icon,
    title,
    description,
}) {

    return (

        <div
            className="
                mb-4
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >

                <Icon
                    size={15}
                    className="
                        text-[var(--accent)]
                    "
                />


                <p
                    className="
                        text-sm
                        font-semibold
                        text-[var(--text-primary)]
                    "
                >
                    {
                        title
                    }
                </p>

            </div>


            <p
                className="
                    mt-1
                    text-xs
                    leading-5
                    text-[var(--text-muted)]
                "
            >
                {
                    description
                }
            </p>

        </div>

    );

}


// =========================================================
// Theme Card
// =========================================================

function ThemeCard({
    active,
    onClick,
    icon: Icon,
    title,
    description,
    light = false,
}) {

    return (

        <button
            type="button"
            onClick={
                onClick
            }
            className={`
                group
                relative
                w-full
                rounded-xl
                border
                p-4
                text-start
                transition-all
                duration-200
                ${
                    active
                        ? `
                            border-[var(--accent)]
                            bg-[var(--accent-soft)]
                            shadow-sm
                        `
                        : `
                            border-[var(--border)]
                            bg-[var(--surface-muted)]
                            hover:border-[var(--border-strong)]
                            hover:bg-[var(--surface)]
                        `
                }
            `}
        >

            {
                active && (

                    <span
                        className="
                            absolute
                            inset-x-0
                            top-0
                            h-px
                            bg-[var(--accent)]
                        "
                    />

                )
            }


            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-3
                "
            >

                <div
                    className="
                        flex
                        min-w-0
                        items-center
                        gap-3
                    "
                >

                    <div
                        className={`
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            ${
                                light
                                    ? 'bg-amber-500/10 text-amber-500'
                                    : 'bg-slate-500/10 text-slate-500 dark:text-slate-300'
                            }
                        `}
                    >

                        <Icon
                            size={18}
                        />

                    </div>


                    <div
                        className="
                            min-w-0
                        "
                    >

                        <p
                            className="
                                truncate
                                text-sm
                                font-semibold
                                text-[var(--text-primary)]
                            "
                        >
                            {
                                title
                            }
                        </p>


                        <p
                            className="
                                mt-1
                                truncate
                                text-[10px]
                                text-[var(--text-muted)]
                            "
                        >
                            {
                                description
                            }
                        </p>

                    </div>

                </div>


                {
                    active && (

                        <span
                            className="
                                flex
                                h-6
                                w-6
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-[var(--accent)]
                            "
                        >

                            <Check
                                size={13}
                                className="
                                    text-white
                                "
                            />

                        </span>

                    )
                }

            </div>

        </button>

    );

}


// =========================================================
// Choice Card
// =========================================================

function ChoiceCard({
    active,
    onClick,
    title,
    description,
}) {

    return (

        <button
            type="button"
            onClick={
                onClick
            }
            className={`
                group
                relative
                w-full
                rounded-xl
                border
                p-4
                text-start
                transition-all
                duration-200
                ${
                    active
                        ? `
                            border-[var(--accent)]
                            bg-[var(--accent-soft)]
                            shadow-sm
                        `
                        : `
                            border-[var(--border)]
                            bg-[var(--surface-muted)]
                            hover:border-[var(--border-strong)]
                            hover:bg-[var(--surface)]
                        `
                }
            `}
        >

            {
                active && (

                    <span
                        className="
                            absolute
                            inset-x-0
                            top-0
                            h-px
                            bg-[var(--accent)]
                        "
                    />

                )
            }


            <div
                className="
                    flex
                    items-center
                    justify-between
                    gap-3
                "
            >

                <div
                    className="
                        min-w-0
                    "
                >

                    <p
                        className="
                            text-sm
                            font-semibold
                            text-[var(--text-primary)]
                        "
                    >
                        {
                            title
                        }
                    </p>


                    <p
                        className="
                            mt-1
                            text-[10px]
                            leading-5
                            text-[var(--text-muted)]
                        "
                    >
                        {
                            description
                        }
                    </p>

                </div>


                {
                    active && (

                        <span
                            className="
                                flex
                                h-6
                                w-6
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-[var(--accent)]
                            "
                        >

                            <Check
                                size={13}
                                className="
                                    text-white
                                "
                            />

                        </span>

                    )
                }

            </div>

        </button>

    );

}


export default AppearanceSettings;