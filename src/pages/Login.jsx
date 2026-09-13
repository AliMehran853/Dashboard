import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LockKeyhole, Mail, Eye, EyeOff, Store,
    ArrowRight, ArrowLeft, ShieldCheck, Check,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

// =========================================================
// Shared field class
// =========================================================

const FIELD_CLASS = `
    w-full rounded-xl border border-[var(--input-border)]
    bg-[var(--input-bg)] py-3 text-sm text-[var(--text)]
    placeholder:text-[var(--text-soft)] outline-none
    transition-all duration-200
    hover:border-[var(--input-border-hover)]
    focus:border-[var(--input-border-focus)]
    focus:bg-[var(--input-bg-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    disabled:cursor-not-allowed disabled:opacity-60
`;

// =========================================================
// Login
// =========================================================

function Login() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { login, isAuthenticated, loading } = useAuth();
    const isRTL = i18n.dir() === 'rtl';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Redirect authenticated user
    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [loading, isAuthenticated, navigate]);

    // Load remembered email
    useEffect(() => {
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered) {
            setEmail(remembered);
            setRememberMe(true);
        }
    }, []);

    // Submit
    const handleSubmit = (event) => {
        event.preventDefault();
        if (isLoading) return;

        setError('');

        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (!cleanEmail) return setError(t('login.errors.emailRequired'));
        if (!cleanPassword) return setError(t('login.errors.passwordRequired'));

        setIsLoading(true);

        try {
            const result = login(cleanEmail, cleanPassword);

            if (!result?.success) {
                setError(result?.message || t('login.errors.invalidCredentials'));
                setIsLoading(false);
                return;
            }

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', cleanEmail);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            navigate('/dashboard', { replace: true });
        } catch (loginError) {
            console.error('Login failed:', loginError);
            setError(t('login.errors.failed'));
            setIsLoading(false);
        }
    };

    // =========================================================
    // Render
    // =========================================================

    return (
        <main
            dir={i18n.dir()}
            className="
                relative flex min-h-screen items-center justify-center
                overflow-hidden bg-[var(--page-bg)]
                px-3 py-6 text-[var(--text)] transition-colors duration-300
                sm:px-6 sm:py-10
                lg:py-12
            "
        >
            {/* ================= Ambient background ================= */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">

                {/* Grid with radial mask */}
                <div
                    className="absolute inset-0 text-[var(--text)]"
                    style={{
                        opacity: 0.035,
                        backgroundImage: `
                            linear-gradient(to right, currentColor 1px, transparent 1px),
                            linear-gradient(to bottom, currentColor 1px, transparent 1px)
                        `,
                        backgroundSize: '44px 44px',
                        maskImage:
                            'radial-gradient(ellipse 85% 75% at 50% 45%, black 25%, transparent 78%)',
                        WebkitMaskImage:
                            'radial-gradient(ellipse 85% 75% at 50% 45%, black 25%, transparent 78%)',
                    }}
                />

                {/* Top-right glow */}
                <div
                    className="login-glow-anim absolute -right-24 -top-24 h-56 w-56 rounded-full blur-3xl sm:-right-32 sm:-top-32 sm:h-96 sm:w-96"
                    style={{
                        background:
                            'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)',
                    }}
                />

                {/* Bottom-left glow (delayed) */}
                <div
                    className="login-glow-anim absolute -bottom-24 -left-24 h-56 w-56 rounded-full opacity-60 blur-3xl sm:-bottom-32 sm:-left-32 sm:h-96 sm:w-96"
                    style={{
                        background:
                            'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)',
                        animationDelay: '-3s',
                    }}
                />

                {/* Center soft glow */}
                <div
                    className="login-glow-anim absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:h-[26rem] sm:w-[26rem] lg:h-[32rem] lg:w-[32rem]"
                    style={{
                        background:
                            'radial-gradient(circle at center, var(--accent-soft) 0%, transparent 72%)',
                        animationDelay: '-5s',
                    }}
                />

                {/* Vignette */}
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.06) 100%)',
                    }}
                />
            </div>

            {/* ================= Content ================= */}
            <div className="relative z-10 w-full max-w-[26.5rem]">

                {/* ================= Brand ================= */}
                <div className="login-enter mb-6 text-center sm:mb-8">
                    <div className="mb-4 flex justify-center sm:mb-5">
                        <div className="relative">
                            {/* Outer glow */}
                            <div
                                className="absolute -inset-3 rounded-[1.4rem] blur-2xl"
                                style={{ background: 'var(--accent-soft-heavy)' }}
                            />

                            {/* Logo tile */}
                            <div
                                className="
                                    relative flex h-14 w-14 items-center justify-center
                                    overflow-hidden rounded-2xl border
                                    shadow-[0_14px_40px_-8px_var(--accent-glow)]
                                    sm:h-[4.25rem] sm:w-[4.25rem]
                                "
                                style={{
                                    background:
                                        'linear-gradient(135deg, var(--accent-400) 0%, var(--accent-500) 45%, var(--accent-600) 100%)',
                                    borderColor: 'var(--accent-border)',
                                }}
                            >
                                {/* Inner highlight */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/10" />

                                {/* Shine sweep */}
                                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                                    <div className="login-shine-anim absolute -inset-y-4 w-8 bg-white/30 blur-md" />
                                </div>

                                {/* Corner blob */}
                                <div className="absolute -right-3 -top-3 h-9 w-9 rounded-full bg-white/20 blur-md" />

                                <Store
                                    size={26}
                                    strokeWidth={1.8}
                                    className="relative z-10 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)] sm:hidden"
                                />
                                <Store
                                    size={28}
                                    strokeWidth={1.8}
                                    className="relative z-10 hidden text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)] sm:block"
                                />
                            </div>
                        </div>
                    </div>

                    <h1 className="
                        px-2 text-[1.25rem] font-semibold leading-tight tracking-[-0.025em]
                        text-[var(--text)]
                        sm:px-3 sm:text-[1.45rem]
                        lg:text-[1.6rem]
                    ">
                        {t('login.brand.title')}
                    </h1>

                    <p className="
                        mx-auto mt-2 max-w-[24rem] px-2 text-[11.5px] leading-5
                        text-[var(--text-muted)]
                        sm:mt-2.5 sm:px-3 sm:text-[12.5px]
                    ">
                        {t('login.brand.description')}
                    </p>
                </div>

                {/* ================= Login card ================= */}
                <div className="login-enter login-enter-d1 relative">
                    {/* Gradient border wrapper */}
                    <div
                        className="relative rounded-[1.4rem] p-px shadow-[var(--shadow-xl)]"
                        style={{
                            background:
                                'linear-gradient(160deg, var(--accent-border-strong) 0%, var(--glass-border) 35%, var(--glass-border) 65%, var(--accent-border) 100%)',
                        }}
                    >
                        <section className="relative overflow-hidden rounded-[1.4rem] bg-[var(--surface)] backdrop-blur-2xl">

                            {/* Top accent line */}
                            <div
                                className="pointer-events-none absolute inset-x-4 top-0 h-px opacity-90 sm:inset-x-6"
                                style={{
                                    background:
                                        'linear-gradient(90deg, transparent, var(--accent-500), transparent)',
                                }}
                            />

                            {/* Inner top highlight */}
                            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/[0.04] to-transparent" />

                            {/* Corner glow */}
                            <div
                                className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl"
                                style={{ background: 'var(--accent-soft)' }}
                            />

                            <div className="relative p-4 sm:p-6 md:p-7">
                                {/* ---------- Form header ---------- */}
                                <div className="mb-5 flex items-center gap-3 sm:mb-6">
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                                        style={{
                                            background: 'var(--accent-soft)',
                                            borderColor: 'var(--accent-border)',
                                            color: 'var(--accent-600)',
                                        }}
                                    >
                                        <ShieldCheck size={17} strokeWidth={2} />
                                    </div>

                                    <div className="min-w-0">
                                        <h2 className="truncate text-[13.5px] font-semibold text-[var(--text)] sm:text-[15px]">
                                            {t('login.form.title')}
                                        </h2>
                                        <p className="mt-0.5 text-[10.5px] leading-4 text-[var(--text-muted)] sm:text-[12px]">
                                            {t('login.form.description')}
                                        </p>
                                    </div>
                                </div>

                                {/* ---------- Error ---------- */}
                                {error && (
                                    <div
                                        role="alert"
                                        className="login-enter mb-5 rounded-xl border px-3.5 py-3 text-[11.5px] leading-5 sm:text-[13px]"
                                        style={{
                                            borderColor: 'rgba(239, 68, 68, 0.28)',
                                            background: 'var(--danger-soft)',
                                            color: 'var(--danger)',
                                        }}
                                    >
                                        {error}
                                    </div>
                                )}

                                {/* ---------- Form ---------- */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Email */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-[11px] font-medium text-[var(--text-muted)] sm:text-[12px]"
                                        >
                                            {t('login.fields.email.label')}
                                        </label>
                                        <div className="relative">
                                            <Mail
                                                size={17}
                                                strokeWidth={1.9}
                                                className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                                            />
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (error) setError('');
                                                }}
                                                placeholder={t('login.fields.email.placeholder')}
                                                autoComplete="email"
                                                dir="ltr"
                                                disabled={isLoading}
                                                className={`${FIELD_CLASS} ps-11 pe-4`}
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <div className="mb-2 flex items-center justify-between gap-3">
                                            <label
                                                htmlFor="password"
                                                className="text-[11px] font-medium text-[var(--text-muted)] sm:text-[12px]"
                                            >
                                                {t('login.fields.password.label')}
                                            </label>
                                            <button
                                                type="button"
                                                disabled={isLoading}
                                                className="shrink-0 text-[10.5px] font-medium text-[var(--accent-600)] transition-colors hover:text-[var(--accent-500)] disabled:cursor-not-allowed disabled:opacity-50 sm:text-[11.5px]"
                                            >
                                                {t('login.actions.forgotPassword')}
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <LockKeyhole
                                                size={17}
                                                strokeWidth={1.9}
                                                className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                                            />
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value);
                                                    if (error) setError('');
                                                }}
                                                placeholder={t('login.fields.password.placeholder')}
                                                autoComplete="current-password"
                                                dir="ltr"
                                                disabled={isLoading}
                                                className={`${FIELD_CLASS} ps-11 pe-12`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((p) => !p)}
                                                disabled={isLoading}
                                                aria-label={
                                                    showPassword
                                                        ? t('login.actions.hidePassword')
                                                        : t('login.actions.showPassword')
                                                }
                                                className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-soft)] transition-all duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember me */}
                                    <div className="flex items-center justify-between gap-3 pt-1">
                                        <label className="group inline-flex cursor-pointer select-none items-center gap-2.5">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                disabled={isLoading}
                                                className="peer sr-only"
                                            />
                                            <span
                                                className="
                                                    flex h-[18px] w-[18px] shrink-0 items-center justify-center
                                                    rounded-md border border-[var(--border-strong)]
                                                    bg-[var(--surface)]
                                                    transition-all duration-200
                                                    peer-checked:border-[var(--accent-500)]
                                                    peer-checked:bg-[var(--accent-500)]
                                                    peer-checked:shadow-[0_0_0_3px_var(--accent-soft)]
                                                    peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--accent-soft-strong)]
                                                    group-hover:border-[var(--accent-border-hover)]
                                                    peer-disabled:cursor-not-allowed peer-disabled:opacity-50
                                                "
                                            >
                                                <Check
                                                    size={12}
                                                    strokeWidth={3}
                                                    className="scale-50 text-white opacity-0 transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100"
                                                />
                                            </span>
                                            <span className="text-[11.5px] text-[var(--text-muted)] sm:text-[12.5px]">
                                                {t('login.fields.rememberMe')}
                                            </span>
                                        </label>
                                    </div>

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="
                                            group relative mt-2 flex w-full items-center justify-center gap-2
                                            overflow-hidden rounded-xl border py-3 text-sm font-semibold text-white
                                            transition-all duration-200
                                            hover:-translate-y-[1px]
                                            active:translate-y-0
                                            disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0
                                        "
                                        style={{
                                            background:
                                                'linear-gradient(100deg, var(--accent-500) 0%, var(--accent-600) 100%)',
                                            borderColor: 'var(--accent-border-strong)',
                                            boxShadow:
                                                '0 12px 28px -8px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.22)',
                                        }}
                                    >
                                        {/* Hover sheen */}
                                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                                        <span className="relative">
                                            {isLoading
                                                ? t('login.actions.loggingIn')
                                                : t('login.actions.login')}
                                        </span>

                                        {!isLoading && (
                                            isRTL ? (
                                                <ArrowLeft
                                                    size={16}
                                                    strokeWidth={2.2}
                                                    className="relative transition-transform duration-200 group-hover:-translate-x-0.5"
                                                />
                                            ) : (
                                                <ArrowRight
                                                    size={16}
                                                    strokeWidth={2.2}
                                                    className="relative transition-transform duration-200 group-hover:translate-x-0.5"
                                                />
                                            )
                                        )}
                                    </button>
                                </form>

                                {/* ---------- Security ---------- */}
                                <div className="mt-5 border-t border-[var(--border-subtle)] pt-4 sm:mt-6">
                                    <div className="flex items-center justify-center gap-2 text-center text-[10.5px] leading-4 text-[var(--text-soft)] sm:text-[11.5px]">
                                        <LockKeyhole size={13} className="shrink-0" />
                                        <span>{t('login.security')}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                {/* ================= Footer ================= */}
                <p className="login-enter login-enter-d2 mt-5 text-center text-[10.5px] leading-4 text-[var(--text-soft)] sm:mt-6 sm:text-[11.5px]">
                    {t('login.footer')}
                </p>
            </div>
        </main>
    );
}

export default Login;