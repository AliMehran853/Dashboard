import {
    useTranslation,
} from 'react-i18next';

import SettingsHeader
    from '../components/settings/SettingsHeader';

import StoreSettings
    from '../components/settings/StoreSettings';

import CategorySettings
    from '../components/settings/CategorySettings';

import BackupSettings
    from '../components/settings/BackupSettings';

import AppearanceSettings
    from '../components/settings/AppearanceSettings';

import NotificationSettings
    from '../components/settings/NotificationSettings';

import AccountSettings
    from '../components/settings/AccountSettings';


// =========================================================
// Settings Page
// =========================================================

function Settings() {

    const {
        i18n,
    } = useTranslation();


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            dir={
                i18n.dir()
            }

            className="
                min-h-full
                space-y-5
                pb-6

                text-[var(--text-primary)]

                transition-colors
                duration-300
            "
        >

            {/* =================================================
                Header
            ================================================== */}

            <section
                className="
                    relative
                    overflow-hidden

                    rounded-2xl

                    bg-[var(--surface)]

                    p-0
                "
            >

                {/* =================================================
                    Soft Glow
                ================================================== */}

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none

                        absolute
                        -start-16
                        -top-20

                        h-48
                        w-48

                        rounded-full

                        bg-emerald-500/[0.06]

                        blur-3xl

                        dark:bg-emerald-400/[0.055]
                    "
                />


                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none

                        absolute
                        -end-16
                        -bottom-24

                        h-44
                        w-44

                        rounded-full

                        bg-cyan-500/[0.025]

                        blur-3xl

                        dark:bg-cyan-400/[0.035]
                    "
                />


                <div
                    className="
                        relative
                        z-10
                    "
                >

                    <SettingsHeader />

                </div>

            </section>


            {/* =================================================
                Store Information
            ================================================== */}

            <StoreSettings />


            {/* =================================================
                Categories
            ================================================== */}

            <CategorySettings />


            {/* =================================================
                Backup & Restore
            ================================================== */}

            <BackupSettings />


            {/* =================================================
                Appearance
            ================================================== */}

            <AppearanceSettings />


            {/* =================================================
                Notifications
            ================================================== */}

            <NotificationSettings />


            {/* =================================================
                Account
            ================================================== */}

            <AccountSettings />

        </div>

    );

}


export default Settings;