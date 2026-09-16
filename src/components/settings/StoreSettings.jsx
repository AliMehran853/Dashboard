import { useEffect, useState } from 'react';
import {
    Store, User, Phone, MapPin, FileText, Save, CheckCircle2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

// =========================================================
// Constants & Helpers
// =========================================================

const STORE_SETTINGS_KEY = 'storeSettings';

// ✅ defaults به‌صورت تابع — با t() ساخته می‌شوند
const getDefaultStoreSettings = (t) => ({
    storeName: t('settings.store.defaults.storeName'),
    ownerName: t('settings.store.defaults.ownerName'),
    phone: '',
    address: '',
    description: '',
});

const getStoredStoreSettings = (t) => {
    const defaults = getDefaultStoreSettings(t);

    try {
        const stored = localStorage.getItem(STORE_SETTINGS_KEY);
        if (!stored) return { ...defaults };

        const parsed = JSON.parse(stored);
        if (!parsed || typeof parsed !== 'object') return { ...defaults };

        return {
            ...defaults,
            ...parsed,
            storeName:
                typeof parsed.storeName === 'string'
                    ? parsed.storeName.trim() || defaults.storeName
                    : defaults.storeName,
            ownerName:
                typeof parsed.ownerName === 'string'
                    ? parsed.ownerName.trim() || defaults.ownerName
                    : defaults.ownerName,
            phone: typeof parsed.phone === 'string' ? parsed.phone : defaults.phone,
            address: typeof parsed.address === 'string' ? parsed.address : defaults.address,
            description:
                typeof parsed.description === 'string'
                    ? parsed.description
                    : defaults.description,
        };
    } catch (error) {
        console.error('Store Settings Read Error:', error);
        return { ...defaults };
    }
};

// =========================================================
// Store Settings
// =========================================================

function StoreSettings() {
    const { t, i18n } = useTranslation();
    const { user, updateAccount } = useAuth();

    // ✅ مقدار اولیه با t()
    const [storeName, setStoreName] = useState(() => t('settings.store.defaults.storeName'));
    const [ownerName, setOwnerName] = useState(() => t('settings.store.defaults.ownerName'));
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [saved, setSaved] = useState(false);

    const direction = i18n.dir();
    const isRtl = direction === 'rtl';

    // Initial load
    useEffect(() => {
        const settings = getStoredStoreSettings(t);
        setStoreName(settings.storeName);
        setPhone(settings.phone);
        setAddress(settings.address);
        setDescription(settings.description);

        if (typeof user?.name === 'string' && user.name.trim()) {
            setOwnerName(user.name.trim());
        } else {
            setOwnerName(settings.ownerName);
        }
    }, [user?.name, t]);

    // Sync ownerName from auth user
    useEffect(() => {
        if (typeof user?.name !== 'string') return;
        const cleanName = user.name.trim();
        if (!cleanName) return;
        setOwnerName(cleanName);
        try {
            const current = getStoredStoreSettings(t);
            if (current.ownerName !== cleanName) {
                localStorage.setItem(
                    STORE_SETTINGS_KEY,
                    JSON.stringify({ ...current, ownerName: cleanName })
                );
            }
        } catch (error) {
            console.error('Owner Name Storage Sync Error:', error);
        }
    }, [user?.name, t]);

    // External account update
    useEffect(() => {
        const handler = (event) => {
            const updatedUser = event?.detail;
            if (typeof updatedUser?.name !== 'string') return;
            const cleanName = updatedUser.name.trim();
            if (!cleanName) return;

            setOwnerName(cleanName);
            try {
                const current = getStoredStoreSettings(t);
                localStorage.setItem(
                    STORE_SETTINGS_KEY,
                    JSON.stringify({ ...current, ownerName: cleanName })
                );
            } catch (error) {
                console.error('Account -> Store Settings Sync Error:', error);
            }
        };
        window.addEventListener('account-updated', handler);
        return () => window.removeEventListener('account-updated', handler);
    }, [t]);

    // Store settings updated event
    useEffect(() => {
        const handler = () => {
            const settings = getStoredStoreSettings(t);
            setStoreName(settings.storeName);
            setPhone(settings.phone);
            setAddress(settings.address);
            setDescription(settings.description);
        };
        window.addEventListener('store-settings-updated', handler);
        return () => window.removeEventListener('store-settings-updated', handler);
    }, [t]);

    const handleSubmit = (event) => {
        event.preventDefault();

        const cleanStoreName = storeName.trim();
        const cleanOwnerName = ownerName.trim();
        const cleanPhone = phone.trim();
        const cleanAddress = address.trim();
        const cleanDescription = description.trim();

        if (!cleanStoreName || !cleanOwnerName) {
            setSaved(false);
            return;
        }

        const settings = {
            storeName: cleanStoreName,
            ownerName: cleanOwnerName,
            phone: cleanPhone,
            address: cleanAddress,
            description: cleanDescription,
        };

        try {
            localStorage.setItem(STORE_SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Store Settings Save Error:', error);
            setSaved(false);
            return;
        }

        const accountResult = updateAccount({ name: cleanOwnerName });
        if (!accountResult?.success) {
            console.error('Owner Name Sync Error:', accountResult?.message);
            setSaved(false);
            return;
        }

        setStoreName(cleanStoreName);
        setOwnerName(cleanOwnerName);
        setPhone(cleanPhone);
        setAddress(cleanAddress);
        setDescription(cleanDescription);

        try {
            window.dispatchEvent(new Event('store-settings-updated'));
        } catch (error) {
            console.error('Store Settings Event Error:', error);
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const inputPadding = isRtl
        ? { paddingRight: '32px', paddingLeft: '16px' }
        : { paddingLeft: '32px', paddingRight: '16px' };
    const iconPosition = isRtl ? 'right-3' : 'left-3';

    return (
        <section dir={direction} className="ui-card overflow-hidden p-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/10 bg-cyan-500/10">
                    <Store size={19} className="text-cyan-500 dark:text-cyan-400" />
                </div>
                <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-[var(--text-primary)]">
                        {t('settings.store.title')}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                        {t('settings.store.description')}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-6">
                {/* Store + Owner */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StoreField
                        icon={Store}
                        label={t('settings.store.fields.name.label')}
                        value={storeName}
                        onChange={setStoreName}
                        placeholder={t('settings.store.fields.name.placeholder')}
                        direction={direction}
                        iconPosition={iconPosition}
                        inputPadding={inputPadding}
                    />
                    <StoreField
                        icon={User}
                        label={t('settings.store.fields.owner.label')}
                        value={ownerName}
                        onChange={setOwnerName}
                        placeholder={t('settings.store.fields.owner.placeholder')}
                        direction={direction}
                        iconPosition={iconPosition}
                        inputPadding={inputPadding}
                    />
                </div>

                {/* Phone + Address */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <StoreField
                        icon={Phone}
                        label={t('settings.store.fields.phone.label')}
                        value={phone}
                        onChange={setPhone}
                        placeholder={t('settings.store.fields.phone.placeholder')}
                        direction={direction}
                        iconPosition={iconPosition}
                        inputPadding={inputPadding}
                        type="tel"
                        inputDir="ltr"
                    />
                    <StoreField
                        icon={MapPin}
                        label={t('settings.store.fields.address.label')}
                        value={address}
                        onChange={setAddress}
                        placeholder={t('settings.store.fields.address.placeholder')}
                        direction={direction}
                        iconPosition={iconPosition}
                        inputPadding={inputPadding}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                        {t('settings.store.fields.description.label')}
                    </label>
                    <div className="relative">
                        <FileText
                            size={16}
                            className={`pointer-events-none absolute top-4 z-10 text-[var(--text-muted)] ${iconPosition}`}
                        />
                        <textarea
                            rows="3"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('settings.store.fields.description.placeholder')}
                            dir={direction}
                            style={inputPadding}
                            className="ui-input min-h-28 w-full resize-none py-3"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-h-5">
                        {saved && (
                            <div className="flex items-center gap-2 text-xs text-emerald-500 dark:text-emerald-400">
                                <CheckCircle2 size={16} className="shrink-0" />
                                <span>{t('settings.store.messages.saved')}</span>
                            </div>
                        )}
                    </div>

                    <button type="submit" className="ui-button-primary h-11 w-full sm:w-auto">
                        <Save size={16} />
                        <span>{t('settings.store.actions.save')}</span>
                    </button>
                </div>
            </form>
        </section>
    );
}

// =========================================================
// Store Field
// =========================================================

function StoreField({
    icon: Icon, label, value, onChange, placeholder,
    direction, iconPosition, inputPadding,
    type = 'text', inputDir,
}) {
    return (
        <div>
            <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                {label}
            </label>
            <div className="relative">
                <Icon
                    size={16}
                    className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)] ${iconPosition}`}
                />
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    dir={inputDir || direction}
                    style={inputPadding}
                    className="ui-input h-11 w-full"
                />
            </div>
        </div>
    );
}

export default StoreSettings;