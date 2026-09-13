import { useTranslation } from 'react-i18next';

import SettingsHeader from '../components/settings/SettingsHeader';
import StoreSettings from '../components/settings/StoreSettings';
import CategorySettings from '../components/settings/CategorySettings';
import BackupSettings from '../components/settings/BackupSettings';
import AppearanceSettings from '../components/settings/AppearanceSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import AccountSettings from '../components/settings/AccountSettings';

function Settings() {
    const { i18n } = useTranslation();

    return (
        <div
            dir={i18n.dir()}
            className="min-h-full space-y-5 pb-6 text-[var(--text-primary)] transition-colors duration-300"
        >
            <SettingsHeader />
            <StoreSettings />
            <CategorySettings />
            <BackupSettings />
            <AppearanceSettings />
            <NotificationSettings />
            <AccountSettings />
        </div>
    );
}

export default Settings;