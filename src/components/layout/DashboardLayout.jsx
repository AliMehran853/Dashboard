import {
    useState,
} from 'react';

import {
    Outlet,
} from 'react-router-dom';

import {
    useTranslation,
} from 'react-i18next';

import Sidebar
    from './Sidebar';

import Header
    from './Header';


// ==========================================
function DashboardLayout() {

    const {
        i18n,
    } = useTranslation();


    const [
        isSidebarOpen,
        setIsSidebarOpen,
    ] = useState(false);


    // =====================================================
    // Direction
    // =====================================================

    const direction =
        i18n.language === 'en'
            ? 'ltr'
            : 'rtl';


    // =====================================================
    // Sidebar
    // =====================================================

    const openSidebar = () => {

        setIsSidebarOpen(true);

    };


    const closeSidebar = () => {

        setIsSidebarOpen(false);

    };


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            dir={direction}

            className="
                relative
                isolate

                h-screen
                w-full

                overflow-hidden

                bg-[var(--page-bg)]

                text-[var(--text)]

                transition-colors
                duration-300
            "
        >

            {/* =================================================
                Rich Background Layer
            ================================================== */}

            <div
                aria-hidden="true"

                className="
                    pointer-events-none

                    absolute
                    inset-0

                    overflow-hidden
                "
            >

                {/* Base solid black */}

                <div
                    className="
                        absolute
                        inset-0

                        hidden
                        dark:block

                        bg-black
                    "
                />


                {/* =================================================
                    Light — Extra darkening base
                    Slightly darker than --page-bg so the vignette
                    can pull the corners toward a deeper warm tone.
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        dark:hidden
                    "
                    style={{
                        background: `
                            linear-gradient(
                                145deg,
                                #ece4d6 0%,
                                #e6ddcc 55%,
                                #ddd2bc 100%
                            )
                        `,
                    }}
                />


                {/* =================================================
                    Grid — Light
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        dark:hidden
                    "
                    style={{
                        backgroundImage: `
                            linear-gradient(
                                to right,
                                rgba(var(--accent-rgb), 0.055) 1px,
                                transparent 1px
                            ),
                            linear-gradient(
                                to bottom,
                                rgba(var(--accent-rgb), 0.055) 1px,
                                transparent 1px
                            )
                        `,
                        backgroundSize:
                            '24px 24px',
                    }}
                />


                {/* =================================================
                    Grid — Dark (main)
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        hidden
                        dark:block
                    "
                    style={{
                        backgroundImage: `
                            linear-gradient(
                                to right,
                                rgba(var(--accent-rgb), 0.06) 1px,
                                transparent 1px
                            ),
                            linear-gradient(
                                to bottom,
                                rgba(var(--accent-rgb), 0.06) 1px,
                                transparent 1px
                            )
                        `,
                        backgroundSize:
                            '24px 24px',
                    }}
                />


                {/* =================================================
                    Grid — Dark (fine overlay)
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        hidden
                        dark:block
                    "
                    style={{
                        backgroundImage: `
                            linear-gradient(
                                to right,
                                rgba(var(--accent-rgb), 0.024) 1px,
                                transparent 1px
                            ),
                            linear-gradient(
                                to bottom,
                                rgba(var(--accent-rgb), 0.024) 1px,
                                transparent 1px
                            )
                        `,
                        backgroundSize:
                            '6px 6px',
                    }}
                />


                {/* =================================================
                    Accent Orb — Top Left
                ================================================== */}

                <div
                    className="
                        absolute

                        -top-40
                        -start-40

                        h-[30rem]
                        w-[30rem]

                        rounded-full

                        blur-[140px]

                        opacity-30
                        dark:opacity-45
                    "
                    style={{
                        background: `
                            rgba(var(--accent-rgb), 0.40)
                        `,
                    }}
                />


                {/* =================================================
                    Accent Orb — Top Right
                ================================================== */}

                <div
                    className="
                        absolute

                        -top-48
                        -end-40

                        h-[34rem]
                        w-[34rem]

                        rounded-full

                        blur-[160px]

                        opacity-18
                        dark:opacity-30
                    "
                    style={{
                        background: `
                            rgba(var(--accent-rgb), 0.35)
                        `,
                    }}
                />


                {/* =================================================
                    Accent Orb — Bottom Left
                ================================================== */}

                <div
                    className="
                        absolute

                        -bottom-44
                        -start-36

                        h-[30rem]
                        w-[30rem]

                        rounded-full

                        blur-[150px]

                        opacity-15
                        dark:opacity-25
                    "
                    style={{
                        background: `
                            rgba(var(--accent-rgb), 0.32)
                        `,
                    }}
                />


                {/* =================================================
                    Accent Orb — Bottom Right
                ================================================== */}

                <div
                    className="
                        absolute

                        -bottom-52
                        -end-44

                        h-[34rem]
                        w-[34rem]

                        rounded-full

                        blur-[160px]

                        opacity-22
                        dark:opacity-38
                    "
                    style={{
                        background: `
                            rgba(var(--accent-rgb), 0.40)
                        `,
                    }}
                />


                {/* =================================================
                    Accent Halo — Center base glow (very subtle)
                ================================================== */}

                <div
                    className="
                        absolute

                        top-1/2
                        left-1/2

                        -translate-x-1/2
                        -translate-y-1/2

                        h-[40rem]
                        w-[40rem]

                        rounded-full

                        blur-[200px]

                        opacity-10
                        dark:opacity-18
                    "
                    style={{
                        background: `
                            rgba(var(--accent-rgb), 0.28)
                        `,
                    }}
                />


                {/* =================================================
                    Accent Aura — Corner washes (light only)
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        opacity-80
                        dark:hidden
                    "
                    style={{
                        background: `
                            radial-gradient(
                                circle at 0% 0%,
                                rgba(var(--accent-rgb), 0.10),
                                transparent 38%
                            ),
                            radial-gradient(
                                circle at 100% 100%,
                                rgba(var(--accent-rgb), 0.14),
                                transparent 42%
                            )
                        `,
                    }}
                />


                {/* =================================================
                    Light Vignette — Dark corners
                    Radial gradient that keeps the center bright
                    and pulls every corner toward a warm dark tone.
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        dark:hidden
                    "
                    style={{
                        background: `
                            radial-gradient(
                                ellipse 70% 70% at 50% 50%,
                                transparent 0%,
                                rgba(60, 40, 20, 0.10) 35%,
                                rgba(45, 30, 12, 0.22) 65%,
                                rgba(30, 20, 8, 0.40) 88%,
                                rgba(20, 12, 4, 0.55) 100%
                            )
                        `,
                    }}
                />


                {/* =================================================
                    Light — Edge darkening (top / bottom)
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        dark:hidden
                    "
                    style={{
                        background: `
                            linear-gradient(
                                180deg,
                                rgba(45, 30, 12, 0.18) 0%,
                                transparent 22%,
                                transparent 78%,
                                rgba(45, 30, 12, 0.18) 100%
                            )
                        `,
                    }}
                />


                {/* =================================================
                    Light — Edge darkening (left / right)
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        dark:hidden
                    "
                    style={{
                        background: `
                            linear-gradient(
                                90deg,
                                rgba(45, 30, 12, 0.16) 0%,
                                transparent 20%,
                                transparent 80%,
                                rgba(45, 30, 12, 0.16) 100%
                            )
                        `,
                    }}
                />


                {/* =================================================
                    Heavy Vignette — Dark
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        hidden
                        dark:block
                    "
                    style={{
                        background: `
                            radial-gradient(
                                ellipse 70% 70% at 50% 50%,
                                transparent 0%,
                                rgba(0, 0, 0, 0.40) 30%,
                                rgba(0, 0, 0, 0.78) 60%,
                                rgba(0, 0, 0, 0.96) 85%,
                                #000000 100%
                            )
                        `,
                    }}
                />


                {/* =================================================
                    Top & Bottom Depth Fade — Dark
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        hidden
                        dark:block
                    "
                    style={{
                        background: `
                            linear-gradient(
                                180deg,
                                rgba(0, 0, 0, 0.75) 0%,
                                rgba(0, 0, 0, 0.25) 8%,
                                transparent 22%,
                                transparent 78%,
                                rgba(0, 0, 0, 0.25) 92%,
                                rgba(0, 0, 0, 0.75) 100%
                            )
                        `,
                    }}
                />


                {/* =================================================
                    Side Edge Darkening — Dark
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        hidden
                        dark:block
                    "
                    style={{
                        background: `
                            linear-gradient(
                                90deg,
                                rgba(0, 0, 0, 0.65) 0%,
                                rgba(0, 0, 0, 0.20) 8%,
                                transparent 20%,
                                transparent 80%,
                                rgba(0, 0, 0, 0.20) 92%,
                                rgba(0, 0, 0, 0.65) 100%
                            )
                        `,
                    }}
                />


                {/* =================================================
                    Final darkening pass — Dark
                ================================================== */}

                <div
                    className="
                        absolute
                        inset-0

                        hidden
                        dark:block

                        bg-black/35
                    "
                />

            </div>


            {/* =================================================
                Application Shell
            ================================================== */}

            <div
                className="
                    relative
                    z-10

                    flex

                    h-full
                    min-h-0
                    w-full
                "
            >

                {/* =================================================
                    Sidebar
                ================================================== */}

                <Sidebar
                    isOpen={
                        isSidebarOpen
                    }

                    onClose={
                        closeSidebar
                    }
                />


                {/* =================================================
                    Main Area
                ================================================== */}

                <div
                    className="
                        flex
                        min-w-0
                        min-h-0

                        flex-1
                        flex-col

                        bg-transparent

                        transition-colors
                        duration-300
                    "
                >

                    {/* =================================================
                        Header
                    ================================================== */}

                    <Header
                        onMenuClick={
                            openSidebar
                        }
                    />


                    {/* =================================================
                        Main Content
                    ================================================== */}

                    <main
                        className="
                            main-scrollbar

                            min-h-0
                            flex-1

                            overflow-x-hidden
                            overflow-y-auto

                            scroll-smooth

                            px-3
                            py-3

                            sm:px-4
                            sm:py-4

                            md:px-5
                            md:py-5

                            lg:px-6
                            lg:py-6
                        "
                    >

                        {/* =================================================
                            Content Surface
                        ================================================== */}

                        <div
                            className="
                                min-h-full
                                w-full
                                min-w-0

                                rounded-2xl

                                bg-transparent

                                transition-colors
                                duration-300
                            "
                        >

                            <Outlet />

                        </div>

                    </main>

                </div>

            </div>

        </div>

    );

}


export default DashboardLayout;