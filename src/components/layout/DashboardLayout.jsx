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