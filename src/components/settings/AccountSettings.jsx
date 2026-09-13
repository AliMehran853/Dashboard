import { useEffect, useState } from 'react';
import {
    User, Mail, Lock, Save, ShieldCheck, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';

function AccountSettings() {
    const { t, i18n } = useTranslation();
    const { user, getAccount, updateAccount } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const direction = i18n.dir();
    const isRtl = direction === 'rtl';

    // Initial load
    useEffect(() => {
        let cancelled = false;
        try {
            const account = getAccount();
            if (cancelled) return;
            setName(account?.name || '');
            setEmail(account?.email || '');
        } catch (loadError) {
            console.error('Failed to load account:', loadError);
            if (!cancelled) setError(t('settings.account.errors.load'));
        } finally {
            if (!cancelled) setLoading(false);
        }
        return () => { cancelled = true; };
    }, [getAccount, t]);

    // Sync from auth user
    useEffect(() => {
        if (typeof user?.name === 'string') setName(user.name);
        if (typeof user?.email === 'string') setEmail(user.email);
    }, [user?.name, user?.email]);

    // External account update
    useEffect(() => {
        const handler = (event) => {
            const nextUser = event?.detail;
            if (typeof nextUser?.name === 'string') setName(nextUser.name);
            if (typeof nextUser?.email === 'string') setEmail(nextUser.email);
        };
        window.addEventListener('account-updated', handler);
        return () => window.removeEventListener('account-updated', handler);
    }, []);

    const handleSave = (event) => {
        event.preventDefault();
        if (saving) return;

        setSuccess('');
        setError('');

        const cleanName = name.trim();
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (!cleanName) return setError(t('settings.account.errors.nameRequired'));
        if (!cleanEmail) return setError(t('settings.account.errors.emailRequired'));

        const changes = { name: cleanName, email: cleanEmail };
        if (cleanPassword) changes.password = cleanPassword;

        try {
            setSaving(true);
            const result = updateAccount(changes);

            if (!result?.success) {
                setError(result?.message || t('settings.account.errors.save'));
                return;
            }

            const savedUser = result.user;
            if (savedUser) {
                setName(savedUser.name || '');
                setEmail(savedUser.email || '');
            } else {
                setName(cleanName);
                setEmail(cleanEmail);
            }

            setPassword('');
            setSuccess(t('settings.account.messages.success'));
        } catch (saveError) {
            console.error('Failed to update account:', saveError);
            setError(t('settings.account.errors.save'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section dir={direction} className="ui-card overflow-hidden p-0">
                <div className="p-8 text-center text-sm text-[var(--text-muted)]">
                    {t('settings.account.loading')}
                </div>
            </section>
        );
    }

    const inputPadding = isRtl
        ? { paddingRight: '32px', paddingLeft: '16px' }
        : { paddingLeft: '32px', paddingRight: '16px' };
    const iconPosition = isRtl ? 'right-3' : 'left-3';

    return (
        <section dir={direction} className="ui-card overflow-hidden p-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/10 bg-cyan-500/10">
                    <ShieldCheck size={19} className="text-cyan-500 dark:text-cyan-400" />
                </div>
                <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-[var(--text-primary)]">
                        {t('settings.account.title')}
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                        {t('settings.account.description')}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6 p-4 sm:p-6">
                {/* Name */}
                <Field
                    label={t('settings.account.fields.name.label')}
                    icon={User}
                    value={name}
                    onChange={(v) => { setName(v); setSuccess(''); }}
                    placeholder={t('settings.account.fields.name.placeholder')}
                    direction={direction}
                    iconPosition={iconPosition}
                    inputPadding={inputPadding}
                    disabled={saving}
                />

                {/* Email */}
                <div>
                    <Field
                        label={t('settings.account.fields.email.label')}
                        icon={Mail}
                        value={email}
                        onChange={(v) => { setEmail(v); setSuccess(''); }}
                        placeholder={t('settings.account.fields.email.placeholder')}
                        direction={direction}
                        iconPosition={iconPosition}
                        inputPadding={inputPadding}
                        disabled={saving}
                        type="email"
                        inputDir="ltr"
                    />
                    <p className="mt-2 text-[11px] leading-5 text-[var(--text-muted)]">
                        {t('settings.account.fields.email.hint')}
                    </p>
                </div>

                {/* Password */}
                <div>
                    <Field
                        label={t('settings.account.fields.password.label')}
                        icon={Lock}
                        value={password}
                        onChange={setPassword}
                        placeholder={t('settings.account.fields.password.placeholder')}
                        direction={direction}
                        iconPosition={iconPosition}
                        inputPadding={inputPadding}
                        disabled={saving}
                        type="password"
                        inputDir="ltr"
                    />
                    <p className="mt-2 text-[11px] leading-5 text-[var(--text-muted)]">
                        {t('settings.account.fields.password.hint')}
                    </p>
                </div>

                {/* Active account */}
                {user && (
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 transition-colors duration-200">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={15} className="shrink-0 text-emerald-500 dark:text-emerald-400" />
                            <span className="text-xs text-[var(--text-muted)]">
                                {t('settings.account.activeAccount')}
                            </span>
                        </div>
                    </div>
                )}

                {/* Success */}
                {success && (
                    <StatusBanner
                        tone="success"
                        icon={CheckCircle2}
                        message={success}
                    />
                )}

                {/* Error */}
                {error && (
                    <StatusBanner
                        tone="danger"
                        icon={AlertTriangle}
                        message={error}
                    />
                )}

                {/* Footer */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="ui-button-primary h-11 w-full sm:w-auto"
                    >
                        <Save size={16} />
                        <span>
                            {saving
                                ? t('settings.account.actions.saving')
                                : t('settings.account.actions.save')}
                        </span>
                    </button>
                </div>
            </form>
        </section>
    );
}

// =========================================================
// Small components
// =========================================================

function Field({
    label, icon: Icon, value, onChange, placeholder,
    direction, iconPosition, inputPadding, disabled,
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
                    disabled={disabled}
                    style={inputPadding}
                    className="ui-input h-11 w-full"
                />
            </div>
        </div>
    );
}

function StatusBanner({ tone, icon: Icon, message }) {
    const classes = tone === 'success'
        ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
        : 'border-rose-500/15 bg-rose-500/5 text-rose-600 dark:text-rose-400';

    return (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-5 ${classes}`}>
            <Icon size={17} className="mt-0.5 shrink-0" />
            <span>{message}</span>
        </div>
    );
}

export default AccountSettings;