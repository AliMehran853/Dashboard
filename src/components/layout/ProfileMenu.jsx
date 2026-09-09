import {
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    createPortal,
} from 'react-dom';

import {
    UserRound,
    Settings,
    Bell,
    LogOut,
    ChevronDown,
    Languages,
    CalendarDays,
    Check,
    X,
} from 'lucide-react';

import {
    useNavigate,
} from 'react-router-dom';

import {
    useTranslation,
} from 'react-i18next';

import {
    useAuth,
} from '../../context/AuthContext';

import {
    changeLanguage,
} from '../../i18n';

import {
    getJalaliMonthStyle,
} from '../../utils/date/jalali';

import ProfileModal
    from './ProfileModal';


// =========================================================
// Profile Menu
// =========================================================

function ProfileMenu() {

    const [
        isOpen,
        setIsOpen,
    ] = useState(false);


    const [
        isProfileModalOpen,
        setIsProfileModalOpen,
    ] = useState(false);


    const [
        jalaliMonthStyle,
        setJalaliMonthStyle,
    ] = useState(
        getJalaliMonthStyle()
    );


    const menuRef =
        useRef(null);


    const buttonRef =
        useRef(null);


    const navigate =
        useNavigate();


    const {
        user,
        logout,
    } = useAuth();


    const {
        t,
        i18n,
    } = useTranslation();


    // =====================================================
    // Menu Position
    // =====================================================

    const [
        menuPosition,
        setMenuPosition,
    ] = useState({
        top: 0,
        right: 0,
    });


    // =====================================================
    // Current Language
    // =====================================================

    const currentLanguage =
        i18n.language === 'en'
            ? 'en'
            : 'fa';


    // =====================================================
    // User Data
    // =====================================================

    const displayName =
        user?.name?.trim() ||
        t(
            'common.administrator'
        );


    const avatar =
        user?.avatar ||
        '';


    // =====================================================
    // Update Menu Position
    // =====================================================

    const updateMenuPosition = () => {

        if (
            !buttonRef.current
        ) {

            return;

        }


        const rect =
            buttonRef.current.getBoundingClientRect();


        const menuWidth =
            Math.min(
                304,
                window.innerWidth - 16
            );


        const viewportPadding =
            8;


        let right =
            window.innerWidth -
            rect.right;


        let left =
            rect.right -
            menuWidth;


        /*
         * Prevent menu from going outside viewport.
         */

        if (
            left <
            viewportPadding
        ) {

            left =
                viewportPadding;

            right =
                window.innerWidth -
                menuWidth -
                viewportPadding;

        }


        if (
            right <
            viewportPadding
        ) {

            right =
                viewportPadding;

        }


        setMenuPosition({

            top:
                rect.bottom + 8,

            right,

        });

    };


    // =====================================================
    // Open Menu + Position
    // =====================================================

    const handleToggleMenu = () => {

        setIsOpen(
            (
                value
            ) => {

                const nextValue =
                    !value;


                if (
                    nextValue
                ) {

                    requestAnimationFrame(
                        updateMenuPosition
                    );

                }


                return nextValue;

            }
        );

    };


    // =====================================================
    // Close Menu
    // =====================================================

    const handleCloseMenu = () => {

        setIsOpen(
            false
        );

    };


    // =====================================================
    // Update Position While Open
    // =====================================================

    useEffect(() => {

        if (
            !isOpen
        ) {

            return;

        }


        updateMenuPosition();


        const handleResize =
            () => {

                updateMenuPosition();

            };


        const handleScroll =
            () => {

                updateMenuPosition();

            };


        window.addEventListener(
            'resize',
            handleResize
        );


        window.addEventListener(
            'scroll',
            handleScroll,
            true
        );


        return () => {

            window.removeEventListener(
                'resize',
                handleResize
            );


            window.removeEventListener(
                'scroll',
                handleScroll,
                true
            );

        };

    }, [
        isOpen,
    ]);


    // =====================================================
    // Close Outside
    // =====================================================

    useEffect(() => {

        if (
            !isOpen
        ) {

            return;

        }


        const handleClickOutside =
            (event) => {

                if (
                    menuRef.current &&
                    menuRef.current.contains(
                        event.target
                    )
                ) {

                    return;

                }


                if (
                    buttonRef.current &&
                    buttonRef.current.contains(
                        event.target
                    )
                ) {

                    return;

                }


                if (
                    isProfileModalOpen
                ) {

                    return;

                }


                setIsOpen(
                    false
                );

            };


        document.addEventListener(
            'mousedown',
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );

        };

    }, [
        isOpen,
        isProfileModalOpen,
    ]);


    // =====================================================
    // Close On Escape
    // =====================================================

    useEffect(() => {

        const handleEscape =
            (event) => {

                if (
                    event.key !==
                    'Escape'
                ) {

                    return;

                }


                setIsOpen(
                    false
                );

            };


        document.addEventListener(
            'keydown',
            handleEscape
        );


        return () => {

            document.removeEventListener(
                'keydown',
                handleEscape
            );

        };

    }, []);


    // =====================================================
    // Lock Page While Profile Menu Is Open
    // =====================================================

    useEffect(() => {

        if (
            !isOpen
        ) {

            return;

        }


        /*
         * Prevent background scrolling while the
         * profile menu is open.
         */

        const previousOverflow =
            document.body.style.overflow;


        document.body.style.overflow =
            'hidden';


        return () => {

            document.body.style.overflow =
                previousOverflow;

        };

    }, [
        isOpen,
    ]);


    // =====================================================
    // Sync Jalali Month Style
    // =====================================================

    useEffect(() => {

        const handleJalaliStyleChange =
            (
                event
            ) => {

                setJalaliMonthStyle(
                    event?.detail ||
                    getJalaliMonthStyle()
                );

            };


        const handleStorageChange =
            (
                event
            ) => {

                if (
                    event.key ===
                    'jalaliMonthStyle'
                ) {

                    setJalaliMonthStyle(
                        event.newValue ||
                        getJalaliMonthStyle()
                    );

                }

            };


        window.addEventListener(
            'jalali-month-style-changed',
            handleJalaliStyleChange
        );


        window.addEventListener(
            'storage',
            handleStorageChange
        );


        return () => {

            window.removeEventListener(
                'jalali-month-style-changed',
                handleJalaliStyleChange
            );


            window.removeEventListener(
                'storage',
                handleStorageChange
            );

        };

    }, []);


    // =====================================================
    // Navigation
    // =====================================================

    const handleSettings = () => {

        setIsOpen(
            false
        );


        navigate(
            '/settings'
        );

    };


    const handleProfile = () => {

        setIsOpen(
            false
        );


        setIsProfileModalOpen(
            true
        );

    };


    const handleLogout = () => {

        setIsOpen(
            false
        );


        logout();


        navigate(
            '/login',
            {
                replace: true,
            }
        );

    };


    // =====================================================
    // Language
    // =====================================================

    const handleLanguageChange =
        async (
            language
        ) => {

            if (
                language ===
                currentLanguage
            ) {

                return;

            }


            await changeLanguage(
                language
            );

        };


    // =====================================================
    // Jalali Month Style
    // =====================================================

    const handleJalaliMonthStyleChange =
        (
            style
        ) => {

            if (
                style ===
                jalaliMonthStyle
            ) {

                return;

            }


            setJalaliMonthStyle(
                style
            );


            try {

                localStorage.setItem(
                    'jalaliMonthStyle',
                    style
                );

            } catch (
                error
            ) {

                console.error(
                    'Failed to save Jalali month style:',
                    error
                );

            }


            window.dispatchEvent(
                new CustomEvent(
                    'jalali-month-style-changed',
                    {
                        detail:
                            style,
                    }
                )
            );

        };


    // =====================================================
    // Jalali Style Labels
    // =====================================================

    const jalaliMonthOptions = [

        {

            value:
                'af',

            label:
                t(
                    'settings.appearance.jalaliMonths.afghanistan'
                ),

            months:
                t(
                    'settings.appearance.jalaliMonths.afghanistanMonths'
                ),

        },


        {

            value:
                'ir',

            label:
                t(
                    'settings.appearance.jalaliMonths.iran'
                ),

            months:
                t(
                    'settings.appearance.jalaliMonths.iranMonths'
                ),

        },

    ];


    // =====================================================
    // Profile Dropdown Portal
    // =====================================================

    const profileDropdown =
        isOpen
            ? createPortal(

                <>

                    {/* =================================================
                        GLOBAL BACKDROP
                    ================================================== */}

                    <div
                        aria-hidden="true"

                        onMouseDown={
                            handleCloseMenu
                        }

                        className="
                            fixed
                            inset-0

                            z-[9990]

                            bg-slate-950/[0.12]
                            dark:bg-black/[0.22]

                            backdrop-blur-[4px]

                            animate-[profileBackdropIn_180ms_ease-out]

                            supports-[backdrop-filter]:bg-slate-950/[0.08]
                            supports-[backdrop-filter]:dark:bg-black/[0.16]
                        "
                    />


                    {/* =================================================
                        PROFILE DROPDOWN
                    ================================================== */}

                    <div
                        ref={
                            menuRef
                        }

                        style={{
                            position:
                                'fixed',

                            top:
                                `${menuPosition.top}px`,

                            right:
                                `${menuPosition.right}px`,
                        }}

                        className="
                            z-[10000]

                            w-[min(19rem,calc(100vw-1rem))]

                            max-h-[calc(100vh-6rem)]

                            overflow-hidden

                            rounded-2xl

                            border
                            border-[var(--glass-border)]

                            bg-[var(--surface)]

                            shadow-[var(--shadow-xl)]

                            backdrop-blur-[14px]
                            backdrop-saturate-125

                            isolation-isolate

                            origin-top

                            animate-[profileMenuIn_180ms_var(--ease-smooth)]

                            flex
                            flex-col
                        "

                        role="menu"

                        aria-label={
                            t(
                                'common.profile'
                            )
                        }
                    >

                        {/* =================================================
                            User Header
                        ================================================== */}

                        <div
                            className="
                                relative
                                shrink-0

                                border-b
                                border-[var(--border-subtle)]

                                px-4
                                py-3.5
                            "
                        >

                            {/* Accent Glow */}

                            <div
                                aria-hidden="true"

                                className="
                                    pointer-events-none

                                    absolute

                                    -top-10
                                    -end-8

                                    h-24
                                    w-24

                                    rounded-full

                                    bg-[var(--accent-soft-heavy)]

                                    blur-2xl

                                    opacity-70
                                "
                            />


                            <div
                                className="
                                    relative

                                    flex
                                    items-center

                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        relative

                                        flex
                                        h-11
                                        w-11

                                        shrink-0

                                        items-center
                                        justify-center

                                        overflow-hidden

                                        rounded-xl

                                        border
                                        border-[var(--accent-border)]

                                        bg-[var(--accent-500)]

                                        text-white

                                        shadow-[0_8px_24px_var(--accent-glow)]
                                    "
                                >

                                    {avatar ? (

                                        <img
                                            src={
                                                avatar
                                            }

                                            alt={
                                                displayName
                                            }

                                            className="
                                                h-full
                                                w-full

                                                object-cover
                                            "
                                        />

                                    ) : (

                                        <UserRound
                                            size={20}

                                            strokeWidth={
                                                1.9
                                            }
                                        />

                                    )}

                                </div>


                                <div
                                    className="
                                        min-w-0
                                        flex-1
                                    "
                                >

                                    <p
                                        className="
                                            truncate

                                            text-sm
                                            font-medium

                                            text-[var(--text)]
                                        "
                                    >

                                        {
                                            displayName
                                        }

                                    </p>


                                    <p
                                        className="
                                            mt-1

                                            truncate

                                            text-[11px]
                                            font-normal

                                            text-[var(--text-muted)]
                                        "
                                    >

                                        {
                                            user?.email ||
                                            t(
                                                'common.systemAdministrator'
                                            )
                                        }

                                    </p>

                                </div>


                                {/* Close */}

                                <button
                                    type="button"

                                    onClick={
                                        handleCloseMenu
                                    }

                                    aria-label={
                                        t(
                                            'common.closeMenu'
                                        )
                                    }

                                    title={
                                        t(
                                            'common.closeMenu'
                                        )
                                    }

                                    className="
                                        ui-icon-button

                                        h-8
                                        w-8

                                        shrink-0

                                        rounded-lg
                                    "
                                >

                                    <X
                                        size={15}

                                        strokeWidth={2}
                                    />

                                </button>

                            </div>

                        </div>


                        {/* =================================================
                            Scrollable Content
                        ================================================== */}

                        <div
                            className="
                                main-scrollbar

                                min-h-0
                                flex-1

                                overflow-y-auto

                                overscroll-contain

                                py-1
                            "
                        >

                            {/* =================================================
                                Main Menu
                            ================================================== */}

                            <div
                                className="
                                    border-b
                                    border-[var(--border-subtle)]

                                    p-2
                                "
                            >

                                {/* =================================================
                                    Profile
                                ================================================== */}

                                <button
                                    type="button"

                                    onClick={
                                        handleProfile
                                    }

                                    className="
                                        group

                                        w-full

                                        flex
                                        items-center

                                        gap-3

                                        rounded-xl

                                        border
                                        border-transparent

                                        px-3
                                        py-2.5

                                        text-start

                                        text-[var(--text-secondary)]

                                        transition-all
                                        duration-180

                                        hover:border-[var(--accent-border)]

                                        hover:bg-[var(--accent-soft)]

                                        hover:text-[var(--accent-600)]
                                    "

                                    role="menuitem"
                                >

                                    <span
                                        className="
                                            flex
                                            h-8
                                            w-8

                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-lg

                                            bg-[var(--surface-muted)]

                                            text-[var(--text-soft)]

                                            transition-all
                                            duration-180

                                            group-hover:bg-[var(--accent-soft-strong)]

                                            group-hover:text-[var(--accent-500)]
                                        "
                                    >

                                        <UserRound
                                            size={16}
                                        />

                                    </span>


                                    <span
                                        className="
                                            text-sm
                                            font-medium
                                        "
                                    >

                                        {
                                            t(
                                                'common.profile'
                                            )
                                        }

                                    </span>

                                </button>


                                {/* =================================================
                                    Settings
                                ================================================== */}

                                <button
                                    type="button"

                                    onClick={
                                        handleSettings
                                    }

                                    className="
                                        group

                                        w-full

                                        flex
                                        items-center

                                        gap-3

                                        rounded-xl

                                        border
                                        border-transparent

                                        px-3
                                        py-2.5

                                        text-start

                                        text-[var(--text-secondary)]

                                        transition-all
                                        duration-180

                                        hover:border-[var(--accent-border)]

                                        hover:bg-[var(--accent-soft)]

                                        hover:text-[var(--accent-600)]
                                    "

                                    role="menuitem"
                                >

                                    <span
                                        className="
                                            flex
                                            h-8
                                            w-8

                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-lg

                                            bg-[var(--surface-muted)]

                                            text-[var(--text-soft)]

                                            transition-all
                                            duration-180

                                            group-hover:bg-[var(--accent-soft-strong)]

                                            group-hover:text-[var(--accent-500)]
                                        "
                                    >

                                        <Settings
                                            size={16}
                                        />

                                    </span>


                                    <span
                                        className="
                                            text-sm
                                            font-medium
                                        "
                                    >

                                        {
                                            t(
                                                'common.settings'
                                            )
                                        }

                                    </span>

                                </button>


                                {/* =================================================
                                    Notifications
                                ================================================== */}

                                <button
                                    type="button"

                                    onClick={
                                        handleCloseMenu
                                    }

                                    className="
                                        group

                                        w-full

                                        flex
                                        items-center

                                        gap-3

                                        rounded-xl

                                        border
                                        border-transparent

                                        px-3
                                        py-2.5

                                        text-start

                                        text-[var(--text-secondary)]

                                        transition-all
                                        duration-180

                                        hover:border-[var(--accent-border)]

                                        hover:bg-[var(--accent-soft)]

                                        hover:text-[var(--accent-600)]
                                    "

                                    role="menuitem"
                                >

                                    <span
                                        className="
                                            flex
                                            h-8
                                            w-8

                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-lg

                                            bg-[var(--surface-muted)]

                                            text-[var(--text-soft)]

                                            transition-all
                                            duration-180

                                            group-hover:bg-[var(--accent-soft-strong)]

                                            group-hover:text-[var(--accent-500)]
                                        "
                                    >

                                        <Bell
                                            size={16}
                                        />

                                    </span>


                                    <span
                                        className="
                                            text-sm
                                            font-medium
                                        "
                                    >

                                        {
                                            t(
                                                'common.notifications'
                                            )
                                        }

                                    </span>

                                </button>

                            </div>


                            {/* =================================================
                                Language
                            ================================================== */}

                            <div
                                className="
                                    border-b
                                    border-[var(--border-subtle)]

                                    p-2
                                "
                            >

                                <div
                                    className="
                                        overflow-hidden

                                        rounded-xl

                                        border
                                        border-[var(--border-subtle)]

                                        bg-[var(--surface-muted)]
                                    "
                                >

                                    {/* Language Header */}

                                    <div
                                        className="
                                            flex
                                            items-center

                                            gap-2

                                            px-3
                                            pb-1.5
                                            pt-2.5

                                            text-[var(--text-muted)]
                                        "
                                    >

                                        <Languages
                                            size={15}
                                        />


                                        <span
                                            className="
                                                text-[11px]
                                                font-medium
                                            "
                                        >

                                            {
                                                t(
                                                    'common.language'
                                                )
                                            }

                                        </span>

                                    </div>


                                    {/* Persian */}

                                    <button
                                        type="button"

                                        onClick={() =>
                                            handleLanguageChange(
                                                'fa'
                                            )
                                        }

                                        className={`
                                            group

                                            w-full

                                            flex
                                            items-center
                                            justify-between

                                            gap-3

                                            px-3
                                            py-2

                                            text-start

                                            transition-all
                                            duration-180

                                            ${
                                                currentLanguage === 'fa'
                                                    ? `
                                                        bg-[var(--accent-soft)]

                                                        text-[var(--accent-600)]
                                                    `
                                                    : `
                                                        text-[var(--text-secondary)]

                                                        hover:bg-[var(--surface)]

                                                        hover:text-[var(--accent-600)]
                                                    `
                                            }
                                        `}

                                        role="menuitemradio"

                                        aria-checked={
                                            currentLanguage === 'fa'
                                        }
                                    >

                                        <span
                                            className="
                                                text-sm
                                                font-normal
                                            "
                                        >

                                            {
                                                t(
                                                    'common.persian'
                                                )
                                            }

                                        </span>


                                        {currentLanguage === 'fa' && (

                                            <Check
                                                size={16}

                                                className="
                                                    shrink-0

                                                    text-[var(--accent-500)]
                                                "
                                            />

                                        )}

                                    </button>


                                    {/* English */}

                                    <button
                                        type="button"

                                        onClick={() =>
                                            handleLanguageChange(
                                                'en'
                                            )
                                        }

                                        className={`
                                            group

                                            w-full

                                            flex
                                            items-center
                                            justify-between

                                            gap-3

                                            px-3
                                            py-2

                                            text-start

                                            transition-all
                                            duration-180

                                            ${
                                                currentLanguage === 'en'
                                                    ? `
                                                        bg-[var(--accent-soft)]

                                                        text-[var(--accent-600)]
                                                    `
                                                    : `
                                                        text-[var(--text-secondary)]

                                                        hover:bg-[var(--surface)]

                                                        hover:text-[var(--accent-600)]
                                                    `
                                            }
                                        `}

                                        role="menuitemradio"

                                        aria-checked={
                                            currentLanguage === 'en'
                                        }
                                    >

                                        <span
                                            className="
                                                text-sm
                                                font-normal
                                            "
                                        >

                                            {
                                                t(
                                                    'common.english'
                                                )
                                            }

                                        </span>


                                        {currentLanguage === 'en' && (

                                            <Check
                                                size={16}

                                                className="
                                                    shrink-0

                                                    text-[var(--accent-500)]
                                                "
                                            />

                                        )}

                                    </button>

                                </div>

                            </div>


                            {/* =================================================
                                Jalali Month Style
                            ================================================== */}

                            {currentLanguage === 'fa' && (

                                <div
                                    className="
                                        border-b
                                        border-[var(--border-subtle)]

                                        p-2
                                    "
                                >

                                    <div
                                        className="
                                            overflow-hidden

                                            rounded-xl

                                            border
                                            border-[var(--border-subtle)]

                                            bg-[var(--surface-muted)]
                                        "
                                    >

                                        {/* Header */}

                                        <div
                                            className="
                                                flex
                                                items-start

                                                gap-2

                                                px-3
                                                pb-2
                                                pt-2.5

                                                text-[var(--text-muted)]
                                            "
                                        >

                                            <CalendarDays
                                                size={15}

                                                className="
                                                    mt-0.5
                                                    shrink-0
                                                "
                                            />


                                            <div
                                                className="
                                                    min-w-0
                                                "
                                            >

                                                <p
                                                    className="
                                                        text-[11px]
                                                        font-medium

                                                        text-[var(--text-secondary)]
                                                    "
                                                >

                                                    {
                                                        t(
                                                            'settings.appearance.jalaliMonths.title'
                                                        )
                                                    }

                                                </p>


                                                <p
                                                    className="
                                                        mt-0.5

                                                        text-[9px]

                                                        leading-4

                                                        text-[var(--text-soft)]
                                                    "
                                                >

                                                    {
                                                        t(
                                                            'settings.appearance.jalaliMonths.description'
                                                        )
                                                    }

                                                </p>

                                            </div>

                                        </div>


                                        {/* Options */}

                                        <div
                                            className="
                                                px-1
                                                pb-1
                                            "
                                        >

                                            {
                                                jalaliMonthOptions.map(
                                                    (
                                                        option
                                                    ) => {

                                                        const isActive =
                                                            jalaliMonthStyle ===
                                                            option.value;


                                                        return (

                                                            <button
                                                                key={
                                                                    option.value
                                                                }

                                                                type="button"

                                                                onClick={() =>
                                                                    handleJalaliMonthStyleChange(
                                                                        option.value
                                                                    )
                                                                }

                                                                className={`
                                                                    group

                                                                    w-full

                                                                    flex
                                                                    items-start
                                                                    justify-between

                                                                    gap-3

                                                                    rounded-lg

                                                                    border

                                                                    px-3
                                                                    py-2.5

                                                                    text-start

                                                                    transition-all
                                                                    duration-180

                                                                    ${
                                                                        isActive
                                                                            ? `
                                                                                border-[var(--accent-border)]

                                                                                bg-[var(--accent-soft)]

                                                                                text-[var(--accent-600)]
                                                                            `
                                                                            : `
                                                                                border-transparent

                                                                                text-[var(--text-secondary)]

                                                                                hover:border-[var(--border-subtle)]

                                                                                hover:bg-[var(--surface)]

                                                                                hover:text-[var(--accent-600)]
                                                                            `
                                                                    }
                                                                `}

                                                                role="menuitemradio"

                                                                aria-checked={
                                                                    isActive
                                                                }
                                                            >

                                                                <div
                                                                    className="
                                                                        min-w-0
                                                                    "
                                                                >

                                                                    <p
                                                                        className="
                                                                            truncate

                                                                            text-sm
                                                                            font-medium
                                                                        "
                                                                    >

                                                                        {
                                                                            option.label
                                                                        }

                                                                    </p>


                                                                    <p
                                                                        className="
                                                                            mt-1

                                                                            text-[9px]

                                                                            leading-4

                                                                            text-[var(--text-soft)]
                                                                        "
                                                                    >

                                                                        {
                                                                            option.months
                                                                        }

                                                                    </p>

                                                                </div>


                                                                {isActive && (

                                                                    <Check
                                                                        size={16}

                                                                        className="
                                                                            mt-0.5
                                                                            shrink-0

                                                                            text-[var(--accent-500)]
                                                                        "
                                                                    />

                                                                )}

                                                            </button>

                                                        );

                                                    }
                                                )

                                            }

                                        </div>

                                    </div>

                                </div>

                            )}


                            {/* =================================================
                                Logout
                            ================================================== */}

                            <div
                                className="
                                    p-2
                                "
                            >

                                <button
                                    type="button"

                                    onClick={
                                        handleLogout
                                    }

                                    className="
                                        group

                                        ui-button-danger

                                        w-full

                                        justify-start

                                        border-transparent

                                        bg-transparent

                                        shadow-none

                                        text-[var(--text-secondary)]

                                        hover:bg-[var(--danger-soft)]

                                        hover:border-red-500/20

                                        hover:text-[var(--danger)]
                                    "

                                    role="menuitem"
                                >

                                    <span
                                        className="
                                            flex
                                            h-8
                                            w-8

                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-lg

                                            bg-[var(--danger-soft)]

                                            text-[var(--danger)]
                                        "
                                    >

                                        <LogOut
                                            size={16}
                                        />

                                    </span>


                                    <span
                                        className="
                                            text-sm
                                            font-medium
                                        "
                                    >

                                        {
                                            t(
                                                'common.logout'
                                            )
                                        }

                                    </span>

                                </button>

                            </div>

                        </div>

                    </div>

                </>,

                document.body

            )
            : null;


    // =====================================================
    // Render
    // =====================================================

    return (

        <>

            <div
                className="
                    relative
                "
            >

                {/* =================================================
                    Profile Button
                ================================================== */}

                <button
                    ref={
                        buttonRef
                    }

                    type="button"

                    onClick={
                        handleToggleMenu
                    }

                    className={` 
                        group

                        relative
                        z-[10001]

                        flex
                        items-center

                        gap-2
                        sm:gap-3

                        rounded-xl

                        border

                        px-1.5
                        py-1.5
                        sm:px-2

                        text-start

                        transition-all
                        duration-220

                        ${
                            isOpen
                                ? `
                                    border-[var(--accent-border)]

                                    bg-[var(--accent-soft)]

                                    shadow-[var(--shadow-accent)]
                                `
                                : `
                                    border-transparent

                                    hover:border-[var(--border-subtle)]

                                    hover:bg-[var(--surface)]

                                    hover:shadow-[var(--shadow-xs)]
                                `
                        }
                    `}

                    aria-expanded={
                        isOpen
                    }

                    aria-haspopup="menu"

                    aria-label={
                        t(
                            'common.profile'
                        )
                    }
                >

                    {/* Avatar */}

                    <div
                        className="
                            relative

                            flex
                            h-9
                            w-9

                            shrink-0

                            items-center
                            justify-center

                            overflow-hidden

                            rounded-xl

                            border
                            border-[var(--accent-border)]

                            bg-[var(--accent-soft)]

                            text-[var(--accent-500)]

                            shadow-[var(--shadow-xs)]

                            transition-all
                            duration-220

                            group-hover:border-[var(--accent-border-hover)]

                            group-hover:shadow-[var(--shadow-accent)]
                        "
                    >

                        {avatar ? (

                            <img
                                src={
                                    avatar
                                }

                                alt={
                                    displayName
                                }

                                className="
                                    h-full
                                    w-full

                                    object-cover
                                "
                            />

                        ) : (

                            <UserRound
                                size={18}

                                strokeWidth={
                                    1.9
                                }
                            />

                        )}

                    </div>


                    {/* User Information */}

                    <div
                        className="
                            hidden
                            min-w-0
                            sm:block

                            text-start
                        "
                    >

                        <p
                            className="
                                max-w-36
                                truncate

                                text-sm
                                font-medium

                                tracking-[-0.01em]

                                text-[var(--text)]
                            "
                        >

                            {
                                displayName
                            }

                        </p>


                        <p
                            className="
                                mt-0.5

                                max-w-36
                                truncate

                                text-[11px]
                                font-normal

                                text-[var(--text-muted)]
                            "
                        >

                            {
                                t(
                                    'common.systemAdministrator'
                                )
                            }

                        </p>

                    </div>


                    {/* Arrow */}

                    <ChevronDown
                        size={16}

                        strokeWidth={
                            1.8
                        }

                        className={`
                            shrink-0

                            text-[var(--text-soft)]

                            transition-transform
                            duration-220

                            ${
                                isOpen
                                    ? 'rotate-180'
                                    : ''
                            }

                            group-hover:text-[var(--accent-500)]
                        `}
                    />

                </button>

            </div>


            {/* Profile Portal */}

            {
                profileDropdown
            }


            {/* =================================================
                Profile Modal
            ================================================== */}

            <ProfileModal
                isOpen={
                    isProfileModalOpen
                }

                onClose={() =>
                    setIsProfileModalOpen(
                        false
                    )
                }
            />

        </>

    );

}


export default ProfileMenu;