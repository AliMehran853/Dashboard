import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LockKeyhole,
    Mail,
    Eye,
    EyeOff,
    Store,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    UserPlus,
    Check,
    X,
    HelpCircle,
    Copy,
    Sparkles,
    AlertTriangle,
    KeyRound,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    useAuth,
    detectEmailTypo,
} from '../context/AuthContext';

// =========================================================
// Constants
// =========================================================

const FIELD_CLASS = `
    w-full rounded-xl border border-[var(--input-border)]
    bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--text)]
    placeholder:text-[var(--text-soft)] outline-none
    transition-all duration-200
    hover:border-[var(--input-border-hover)]
    focus:border-[var(--input-border-focus)]
    focus:bg-[var(--input-bg-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    disabled:cursor-not-allowed disabled:opacity-60
`;

const SELECT_CLASS = `
    w-full rounded-xl border border-[var(--input-border)]
    bg-[var(--input-bg)] px-3 py-2.5 text-sm text-[var(--text)]
    outline-none transition-all duration-200 cursor-pointer
    hover:border-[var(--input-border-hover)]
    focus:border-[var(--input-border-focus)]
    focus:bg-[var(--input-bg-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    disabled:cursor-not-allowed disabled:opacity-60
    appearance-none
`;

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_ANSWER_LENGTH = 2;
const TOTAL_SETUP_STEPS = 2;

const ALL_QUESTION_IDS = [
    'firstSchool',
    'firstPet',
    'birthCity',
    'firstTeacher',
    'childhoodFriend',
];

const AUTOCOMPLETE_EMAIL = 'off';
const AUTOCOMPLETE_PASSWORD_NEW = 'new-password';
const AUTOCOMPLETE_PASSWORD_CURRENT = 'new-password';

// =========================================================
// Login — decides Setup vs Login
// =========================================================

function Login() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const {
        login,
        registerAccount,
        hasAccount,
        isAuthenticated,
        loading,
    } = useAuth();

    const [mode, setMode] = useState('loading');

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [loading, isAuthenticated, navigate]);

    useEffect(() => {
        if (loading) return;
        setMode(hasAccount() ? 'login' : 'setup');
    }, [loading, hasAccount]);

    const handleSuccess = () => {
        navigate('/dashboard', { replace: true });
    };

    if (mode === 'loading') {
        return <LoadingScreen />;
    }

    return (
        <LoginShell>
            {mode === 'setup' ? (
                <SetupPanel
                    registerAccount={registerAccount}
                    onSuccess={handleSuccess}
                />
            ) : (
                <LoginPanel
                    login={login}
                    onSuccess={handleSuccess}
                />
            )}
        </LoginShell>
    );
}

// =========================================================
// Loading Screen
// =========================================================

function LoadingScreen() {
    const { t, i18n } = useTranslation();

    return (
        <main
            dir={i18n.dir()}
            className="flex min-h-dvh w-full items-center justify-center bg-[var(--page-bg)] text-[var(--text)]"
        >
            <div className="flex flex-col items-center gap-3">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent-500)]" />
                <span className="text-xs text-[var(--text-muted)]">
                    {t('login.loading')}
                </span>
            </div>
        </main>
    );
}

// =========================================================
// Login Shell
// =========================================================

function LoginShell({ children }) {
    const { t, i18n } = useTranslation();

    return (
        <main
            dir={i18n.dir()}
            className="
                relative min-h-dvh w-full overflow-x-hidden
                bg-[var(--page-bg)] text-[var(--text)]
                transition-colors duration-300
            "
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
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

                <div
                    className="login-glow-anim absolute -right-24 -top-24 h-56 w-56 rounded-full blur-3xl sm:-right-32 sm:-top-32 sm:h-96 sm:w-96"
                    style={{
                        background:
                            'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)',
                    }}
                />

                <div
                    className="login-glow-anim absolute -bottom-24 -left-24 h-56 w-56 rounded-full opacity-60 blur-3xl sm:-bottom-32 sm:-left-32 sm:h-96 sm:w-96"
                    style={{
                        background:
                            'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)',
                        animationDelay: '-3s',
                    }}
                />

                <div
                    className="login-glow-anim absolute left-1/2 top-1/2 h-[18rem] w-[18rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl sm:h-[26rem] sm:w-[26rem] lg:h-[32rem] lg:w-[32rem]"
                    style={{
                        background:
                            'radial-gradient(circle at center, var(--accent-soft) 0%, transparent 72%)',
                        animationDelay: '-5s',
                    }}
                />

                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.06) 100%)',
                    }}
                />
            </div>

            <div
                className="
                    relative z-10 mx-auto flex min-h-dvh w-full max-w-[24.5rem]
                    flex-col items-stretch justify-center
                    px-4 py-5 sm:px-5 sm:py-7
                "
            >
                {/* Logo */}
                <div className="login-enter mb-3 flex justify-center sm:mb-4">
                    <div className="relative">
                        <div
                            className="absolute -inset-2 rounded-2xl blur-xl"
                            style={{ background: 'var(--accent-soft-heavy)' }}
                        />
                        <div
                            className="
                                relative flex h-11 w-11 items-center justify-center
                                overflow-hidden rounded-2xl border
                                shadow-[0_10px_30px_-8px_var(--accent-glow)]
                                sm:h-12 sm:w-12
                            "
                            style={{
                                background:
                                    'linear-gradient(135deg, var(--accent-400) 0%, var(--accent-500) 45%, var(--accent-600) 100%)',
                                borderColor: 'var(--accent-border)',
                            }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-black/10" />
                            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                                <div className="login-shine-anim absolute -inset-y-4 w-6 bg-white/30 blur-md" />
                            </div>
                            <div className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white/20 blur-md" />
                            <Store
                                size={20}
                                strokeWidth={1.9}
                                className="relative z-10 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.25)]"
                            />
                        </div>
                    </div>
                </div>

                {children}

                <p
                    className="
                        login-enter login-enter-d2 mt-2.5 text-center
                        text-[10px] leading-4 text-[var(--text-soft)]
                        sm:mt-3 sm:text-[11px]
                    "
                >
                    {t('login.footer')}
                </p>
            </div>
        </main>
    );
}

// =========================================================
// Card Shell — compact + unified header
// =========================================================

function CardShell({
    icon: Icon,
    title,
    description,
    accent = 'default',
    badge,
    children,
}) {
    const iconStyle =
        accent === 'setup'
            ? {
                background: 'rgb(18 184 134 / 0.10)',
                borderColor: 'rgb(18 184 134 / 0.28)',
                color: 'rgb(13 159 116)',
            }
            : {
                background: 'var(--accent-soft)',
                borderColor: 'var(--accent-border)',
                color: 'var(--accent-600)',
            };

    return (
        <div className="login-enter login-enter-d1 relative">
            <div
                className="relative rounded-[1.2rem] p-px shadow-[var(--shadow-xl)]"
                style={{
                    background:
                        'linear-gradient(160deg, var(--accent-border-strong) 0%, var(--glass-border) 35%, var(--glass-border) 65%, var(--accent-border) 100%)',
                }}
            >
                <section className="relative overflow-hidden rounded-[1.2rem] bg-[var(--surface)] backdrop-blur-2xl">
                    <div
                        className="pointer-events-none absolute inset-x-4 top-0 h-px opacity-90"
                        style={{
                            background:
                                'linear-gradient(90deg, transparent, var(--accent-500), transparent)',
                        }}
                    />

                    <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.04] to-transparent" />

                    <div
                        className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full blur-3xl"
                        style={{ background: 'var(--accent-soft)' }}
                    />

                    <div className="relative p-4 sm:p-5">
                        <div className="mb-3.5 flex items-start gap-2.5">
                            <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                                style={iconStyle}
                            >
                                <Icon size={16} strokeWidth={2.1} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-[14.5px] font-semibold leading-tight text-[var(--text)] sm:text-[15.5px]">
                                    {title}
                                </h1>
                                <p className="mt-0.5 text-[10.5px] leading-4 text-[var(--text-muted)] sm:text-[11.5px]">
                                    {description}
                                </p>
                            </div>
                            {badge && (
                                <span className="shrink-0 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-0.5 text-[9.5px] font-medium text-[var(--text-muted)]">
                                    {badge}
                                </span>
                            )}
                        </div>

                        {children}
                    </div>
                </section>
            </div>
        </div>
    );
}

// =========================================================
// Step Indicator (compact)
// =========================================================

function StepIndicator({ current, total, label }) {
    return (
        <div className="mb-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
                {Array.from({ length: total }).map((_, i) => {
                    const stepNum = i + 1;
                    const isActive = stepNum === current;
                    const isDone = stepNum < current;

                    return (
                        <div key={stepNum} className="flex items-center gap-1.5">
                            <div
                                className={`
                                    flex h-6 w-6 shrink-0 items-center justify-center
                                    rounded-full border text-[10px] font-semibold
                                    transition-all duration-300
                                    ${
                                        isActive
                                            ? 'scale-105 border-[var(--accent-500)] bg-[var(--accent-500)] text-white shadow-[0_0_0_3px_var(--accent-soft)]'
                                            : isDone
                                            ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-600)] dark:text-[var(--accent-300)]'
                                            : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-soft)]'
                                    }
                                `}
                            >
                                {isDone ? <Check size={11} strokeWidth={3} /> : stepNum}
                            </div>

                            {stepNum < total && (
                                <div
                                    className={`
                                        h-0.5 w-6 rounded-full transition-all duration-300
                                        ${isDone ? 'bg-[var(--accent-400)]' : 'bg-[var(--border)]'}
                                    `}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {label && (
                <span className="text-[10px] font-medium text-[var(--text-soft)]">
                    {label}
                </span>
            )}
        </div>
    );
}

// =========================================================
// Error Box (compact)
// =========================================================

function ErrorBox({ message }) {
    if (!message) return null;
    return (
        <div
            role="alert"
            className="
                login-enter mb-3 flex items-start gap-2 rounded-xl border
                px-3 py-2 text-[11.5px] leading-5
            "
            style={{
                borderColor: 'rgba(239, 68, 68, 0.28)',
                background: 'var(--danger-soft)',
                color: 'var(--danger)',
            }}
        >
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            <span>{message}</span>
        </div>
    );
}

// =========================================================
// Field Label
// =========================================================

function FieldLabel({ children }) {
    return (
        <label className="mb-1 block text-[11px] font-medium text-[var(--text-muted)]">
            {children}
        </label>
    );
}

// =========================================================
// Password Field (shared)
// =========================================================

function PasswordField({
    id,
    label,
    value,
    onChange,
    placeholder,
    show,
    onToggleShow,
    disabled,
    autoComplete,
}) {
    const { t } = useTranslation();
    return (
        <div>
            <FieldLabel>{label}</FieldLabel>
            <div className="relative">
                <LockKeyhole
                    size={16}
                    strokeWidth={1.9}
                    className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                />
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    dir="ltr"
                    disabled={disabled}
                    className={`${FIELD_CLASS} ps-9 pe-10`}
                />
                <button
                    type="button"
                    onClick={onToggleShow}
                    disabled={disabled}
                    tabIndex={-1}
                    aria-label={
                        show
                            ? t('login.actions.hidePassword')
                            : t('login.actions.showPassword')
                    }
                    className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-soft)] transition-all duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
            </div>
        </div>
    );
}

// =========================================================
// Submit Button (shared, full-width primary)
// =========================================================

function SubmitButton({
    isLoading,
    label,
    loadingLabel,
    isRTL,
    type = 'submit',
}) {
    return (
        <button
            type={type}
            disabled={isLoading}
            className="
                group relative flex w-full items-center justify-center gap-2
                overflow-hidden rounded-xl border py-3 text-sm font-semibold
                text-white transition-all duration-200
                hover:-translate-y-[1px] active:translate-y-0
                disabled:cursor-not-allowed disabled:opacity-60
                disabled:hover:translate-y-0
            "
            style={{
                background:
                    'linear-gradient(100deg, var(--accent-500) 0%, var(--accent-600) 100%)',
                borderColor: 'var(--accent-border-strong)',
                boxShadow:
                    '0 10px 24px -8px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.22)',
            }}
        >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative whitespace-nowrap">
                {isLoading ? loadingLabel : label}
            </span>
            {!isLoading &&
                (isRTL ? (
                    <ArrowLeft
                        size={15}
                        strokeWidth={2.2}
                        className="relative shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
                    />
                ) : (
                    <ArrowRight
                        size={15}
                        strokeWidth={2.2}
                        className="relative shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                ))}
        </button>
    );
}

// =========================================================
// Back Button (ghost style — subtle, full width)
// =========================================================

function BackButton({ onClick, disabled, label }) {
    const { i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="
                group flex w-full items-center justify-center gap-1.5
                rounded-xl border border-transparent bg-transparent
                py-2.5 text-[12.5px] font-medium text-[var(--text-muted)]
                transition-all duration-200
                hover:bg-[var(--surface-muted)]
                hover:text-[var(--text)]
                disabled:cursor-not-allowed disabled:opacity-50
            "
        >
            {isRTL ? (
                <ArrowRight
                    size={13}
                    strokeWidth={2.2}
                    className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
                />
            ) : (
                <ArrowLeft
                    size={13}
                    strokeWidth={2.2}
                    className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
                />
            )}
            <span className="whitespace-nowrap">{label}</span>
        </button>
    );
}

// =========================================================
// Security Question Row (compact)
// =========================================================

function SecurityQuestionRow({
    index,
    question,
    onChange,
    disabled,
    isRTL,
    usedIds,
}) {
    const { t } = useTranslation();

    return (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5">
            <div className="mb-1.5 flex items-center gap-1.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[10px] font-semibold text-[var(--accent-600)] dark:text-[var(--accent-300)]">
                    {index + 1}
                </span>
                <p className="text-[10.5px] font-medium text-[var(--text-muted)]">
                    {t('login.setup.fields.questionN', { n: index + 1 })}
                </p>
            </div>

            <div className="space-y-1.5">
                <select
                    value={question.id || ''}
                    onChange={(e) =>
                        onChange(index, {
                            id: e.target.value,
                            answer: question.answer,
                        })
                    }
                    disabled={disabled}
                    className={SELECT_CLASS}
                >
                    <option value="">
                        {t('login.setup.fields.questionPlaceholder')}
                    </option>
                    {ALL_QUESTION_IDS.map((id) => {
                        if (usedIds.includes(id)) return null;
                        return (
                            <option key={id} value={id}>
                                {t(`securityQuestions.${id}`)}
                            </option>
                        );
                    })}
                </select>

                <input
                    type="text"
                    value={question.answer || ''}
                    onChange={(e) =>
                        onChange(index, {
                            id: question.id,
                            answer: e.target.value,
                        })
                    }
                    placeholder={t('login.setup.fields.answerPlaceholder')}
                    disabled={disabled || !question.id}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className={FIELD_CLASS}
                />
            </div>
        </div>
    );
}

// =========================================================
// Setup Panel — Wizard دو مرحله‌ای
// =========================================================

function SetupPanel({ registerAccount, onSuccess }) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    const [step, setStep] = useState(1);

    // Step 1
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [emailSuggestion, setEmailSuggestion] = useState('');

    // Step 2
    const [questions, setQuestions] = useState([
        { id: '', answer: '' },
        { id: '', answer: '' },
        { id: '', answer: '' },
    ]);

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const typo = detectEmailTypo(email.trim());
        setEmailSuggestion(typo || '');
    }, [email]);

    useEffect(() => {
        setError('');
    }, [step]);

    const updateQuestion = (index, patch) => {
        setQuestions((prev) =>
            prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
        );
        if (error) setError('');
    };

    const validateStep1 = () => {
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();
        const cleanConfirm = confirmPassword.trim();

        if (!cleanEmail) {
            setError(t('login.setup.errors.emailRequired'));
            return false;
        }

        const typo = detectEmailTypo(cleanEmail);
        if (typo) {
            setError(
                t('settings.account.errors.emailTypo', { suggestion: typo })
            );
            return false;
        }

        if (!EMAIL_REGEX.test(cleanEmail)) {
            setError(t('login.setup.errors.emailInvalid'));
            return false;
        }

        if (!cleanPassword) {
            setError(t('login.setup.errors.passwordRequired'));
            return false;
        }

        if (cleanPassword.length < MIN_PASSWORD_LENGTH) {
            setError(
                t('login.setup.errors.passwordMin', {
                    count: MIN_PASSWORD_LENGTH,
                })
            );
            return false;
        }

        if (cleanPassword !== cleanConfirm) {
            setError(t('login.setup.errors.passwordMismatch'));
            return false;
        }

        return true;
    };

    const goToStep2 = (event) => {
        event?.preventDefault?.();
        setError('');
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleFinalSubmit = (event) => {
        event.preventDefault();
        if (isLoading) return;

        setError('');

        const cleanQuestions = questions.map((q) => ({
            id: String(q.id || '').trim(),
            answer: String(q.answer || '').trim(),
        }));

        if (cleanQuestions.some((q) => !q.id)) {
            return setError(t('login.setup.errors.questionsRequired'));
        }

        if (cleanQuestions.some((q) => !q.answer)) {
            return setError(t('login.setup.errors.questionsRequired'));
        }

        if (cleanQuestions.some((q) => q.answer.length < MIN_ANSWER_LENGTH)) {
            return setError(
                t('login.setup.errors.answerMin', { count: MIN_ANSWER_LENGTH })
            );
        }

        const ids = cleanQuestions.map((q) => q.id);
        if (new Set(ids).size !== ids.length) {
            return setError(t('login.setup.errors.questionsDuplicate'));
        }

        setIsLoading(true);

        try {
            const result = registerAccount({
                email: email.trim(),
                password: password.trim(),
                securityQuestions: cleanQuestions,
            });

            if (!result?.success) {
                setError(
                    result?.message || t('login.setup.errors.saveFailed')
                );
                setIsLoading(false);
                return;
            }

            onSuccess?.();
        } catch (err) {
            console.error('Setup failed:', err);
            setError(t('login.setup.errors.saveFailed'));
            setIsLoading(false);
        }
    };

    const useSuggestion = () => {
        setEmail(emailSuggestion);
        setEmailSuggestion('');
        setError('');
    };

    const goBack = () => {
        if (isLoading) return;
        setStep(1);
    };

    return (
        <CardShell
            icon={UserPlus}
            title={t('login.setup.brand.title')}
            description={t('login.setup.brand.description')}
            accent="setup"
            badge={t('login.setup.badge')}
        >
            <StepIndicator
                current={step}
                total={TOTAL_SETUP_STEPS}
                label={t('login.setup.stepLabel', {
                    current: step,
                    total: TOTAL_SETUP_STEPS,
                })}
            />

            <ErrorBox message={error} />

            {/* ═══════════ STEP 1 ═══════════ */}
            {step === 1 && (
                <form
                    onSubmit={goToStep2}
                    className="space-y-2.5"
                    autoComplete="off"
                >
                    {/* Email */}
                    <div>
                        <FieldLabel>
                            {t('login.setup.fields.email.label')}
                        </FieldLabel>
                        <div className="relative">
                            <Mail
                                size={16}
                                strokeWidth={1.9}
                                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                            />
                            <input
                                id="setup-email"
                                name="setup-user-email-field"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder={t(
                                    'login.setup.fields.email.placeholder'
                                )}
                                autoComplete={AUTOCOMPLETE_EMAIL}
                                dir="ltr"
                                disabled={isLoading}
                                className={`${FIELD_CLASS} ps-9 pe-3`}
                            />
                        </div>

                        {emailSuggestion && (
                            <div className="mt-1.5 flex items-start gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-1.5">
                                <Sparkles
                                    size={12}
                                    className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10.5px] leading-4 text-amber-700 dark:text-amber-300">
                                        {t(
                                            'settings.account.errors.emailTypoSuggest',
                                            { suggestion: emailSuggestion }
                                        )}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={useSuggestion}
                                        disabled={isLoading}
                                        className="mt-1 text-[10px] font-medium text-amber-700 underline-offset-2 hover:underline dark:text-amber-300"
                                    >
                                        {t(
                                            'settings.account.actions.fixTypo'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <PasswordField
                        id="setup-password"
                        label={t('login.setup.fields.password.label')}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder={t(
                            'login.setup.fields.password.placeholder',
                            { count: MIN_PASSWORD_LENGTH }
                        )}
                        show={showPassword}
                        onToggleShow={() => setShowPassword((p) => !p)}
                        disabled={isLoading}
                        autoComplete={AUTOCOMPLETE_PASSWORD_NEW}
                    />

                    <PasswordField
                        id="setup-confirm"
                        label={t(
                            'login.setup.fields.confirmPassword.label'
                        )}
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (error) setError('');
                        }}
                        placeholder={t(
                            'login.setup.fields.confirmPassword.placeholder'
                        )}
                        show={showConfirm}
                        onToggleShow={() => setShowConfirm((p) => !p)}
                        disabled={isLoading}
                        autoComplete={AUTOCOMPLETE_PASSWORD_NEW}
                    />

                    <div className="pt-1">
                        <SubmitButton
                            isLoading={isLoading}
                            label={t('login.setup.actions.next')}
                            loadingLabel={t('login.setup.actions.next')}
                            isRTL={isRTL}
                            type="submit"
                        />
                    </div>
                </form>
            )}

            {/* ═══════════ STEP 2 ═══════════ */}
            {step === 2 && (
                <form
                    onSubmit={handleFinalSubmit}
                    className="space-y-2.5"
                    autoComplete="off"
                >
                    {/* Info banner */}
                    <div className="flex items-start gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-2.5 py-2">
                        <HelpCircle
                            size={13}
                            className="mt-0.5 shrink-0 text-[var(--accent-500)]"
                        />
                        <p className="text-[10.5px] leading-4 text-[var(--text-muted)]">
                            {t('login.setup.sections.securityHint')}
                        </p>
                    </div>

                    {/* Questions */}
                    <div className="space-y-2">
                        {questions.map((q, index) => {
                            const usedIds = questions
                                .filter((_, i) => i !== index)
                                .map((qq) => qq.id)
                                .filter(Boolean);

                            return (
                                <SecurityQuestionRow
                                    key={index}
                                    index={index}
                                    question={q}
                                    onChange={updateQuestion}
                                    disabled={isLoading}
                                    isRTL={isRTL}
                                    usedIds={usedIds}
                                />
                            );
                        })}
                    </div>

                    {/* Buttons — stacked vertically */}
                    <div className="space-y-1 pt-1">
                        <SubmitButton
                            isLoading={isLoading}
                            label={t('login.setup.actions.create')}
                            loadingLabel={t('login.setup.actions.creating')}
                            isRTL={isRTL}
                        />
                        <BackButton
                            onClick={goBack}
                            disabled={isLoading}
                            label={t('login.setup.actions.back')}
                        />
                    </div>
                </form>
            )}

            {/* Security footer */}
            <div className="mt-3 border-t border-[var(--border-subtle)] pt-2.5">
                <div className="flex items-center justify-center gap-1.5 text-center text-[10px] leading-4 text-[var(--text-soft)]">
                    <LockKeyhole size={11} className="shrink-0" />
                    <span>{t('login.setup.security')}</span>
                </div>
            </div>
        </CardShell>
    );
}

// =========================================================
// Login Panel — دفعات بعد
// =========================================================

function LoginPanel({ login, onSuccess }) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [forgotOpen, setForgotOpen] = useState(false);

    useEffect(() => {
        const remembered = localStorage.getItem('rememberedEmail');
        if (remembered) {
            setEmail(remembered);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (isLoading) return;

        setError('');

        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        if (!cleanEmail) {
            return setError(t('login.errors.emailRequired'));
        }
        if (!cleanPassword) {
            return setError(t('login.errors.passwordRequired'));
        }

        setIsLoading(true);

        try {
            const result = login(cleanEmail, cleanPassword);

            if (!result?.success) {
                setError(
                    result?.message || t('login.errors.invalidCredentials')
                );
                setIsLoading(false);
                return;
            }

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', cleanEmail);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            onSuccess?.();
        } catch (loginError) {
            console.error('Login failed:', loginError);
            setError(t('login.errors.failed'));
            setIsLoading(false);
        }
    };

    return (
        <>
            <CardShell
                icon={ShieldCheck}
                title={t('login.brand.title')}
                description={t('login.brand.description')}
            >
                <ErrorBox message={error} />

                <form
                    onSubmit={handleSubmit}
                    className="space-y-2.5"
                    autoComplete="off"
                >
                    {/* Email */}
                    <div>
                        <FieldLabel>{t('login.fields.email.label')}</FieldLabel>
                        <div className="relative">
                            <Mail
                                size={16}
                                strokeWidth={1.9}
                                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                            />
                            <input
                                id="login-email"
                                name="login-user-email-field"
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder={t('login.fields.email.placeholder')}
                                autoComplete={AUTOCOMPLETE_EMAIL}
                                dir="ltr"
                                disabled={isLoading}
                                className={`${FIELD_CLASS} ps-9 pe-3`}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <div className="mb-1 flex items-center justify-between gap-3">
                            <label
                                htmlFor="login-password"
                                className="text-[11px] font-medium text-[var(--text-muted)]"
                            >
                                {t('login.fields.password.label')}
                            </label>
                            <button
                                type="button"
                                onClick={() => setForgotOpen(true)}
                                disabled={isLoading}
                                className="shrink-0 text-[10.5px] font-medium text-[var(--accent-600)] transition-colors hover:text-[var(--accent-500)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {t('login.actions.forgotPassword')}
                            </button>
                        </div>
                        <div className="relative">
                            <LockKeyhole
                                size={16}
                                strokeWidth={1.9}
                                className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                            />
                            <input
                                id="login-password"
                                name="login-user-password-field"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (error) setError('');
                                }}
                                placeholder={t('login.fields.password.placeholder')}
                                autoComplete={AUTOCOMPLETE_PASSWORD_CURRENT}
                                dir="ltr"
                                disabled={isLoading}
                                className={`${FIELD_CLASS} ps-9 pe-10`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                disabled={isLoading}
                                tabIndex={-1}
                                aria-label={
                                    showPassword
                                        ? t('login.actions.hidePassword')
                                        : t('login.actions.showPassword')
                                }
                                className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-soft)] transition-all duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center justify-between gap-3 pt-0.5">
                        <label className="group inline-flex cursor-pointer select-none items-center gap-2">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) =>
                                    setRememberMe(e.target.checked)
                                }
                                disabled={isLoading}
                                className="peer sr-only"
                            />
                            <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-md border border-[var(--border-strong)] bg-[var(--surface)] transition-all duration-200 peer-checked:border-[var(--accent-500)] peer-checked:bg-[var(--accent-500)] peer-checked:shadow-[0_0_0_3px_var(--accent-soft)] group-hover:border-[var(--accent-border-hover)] peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                                <Check
                                    size={10}
                                    strokeWidth={3}
                                    className="scale-50 text-white opacity-0 transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100"
                                />
                            </span>
                            <span className="text-[11px] text-[var(--text-muted)]">
                                {t('login.fields.rememberMe')}
                            </span>
                        </label>
                    </div>

                    <div className="pt-1">
                        <SubmitButton
                            isLoading={isLoading}
                            label={t('login.actions.login')}
                            loadingLabel={t('login.actions.loggingIn')}
                            isRTL={isRTL}
                        />
                    </div>
                </form>

                <div className="mt-3 border-t border-[var(--border-subtle)] pt-2.5">
                    <div className="flex items-center justify-center gap-1.5 text-center text-[10px] leading-4 text-[var(--text-soft)]">
                        <LockKeyhole size={11} className="shrink-0" />
                        <span>{t('login.security')}</span>
                    </div>
                </div>
            </CardShell>

            {forgotOpen && (
                <ForgotPasswordModal
                    onClose={() => setForgotOpen(false)}
                />
            )}
        </>
    );
}

// =========================================================
// Forgot Password Modal
// =========================================================

function ForgotPasswordModal({ onClose }) {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.dir() === 'rtl';
    const {
        getSecurityQuestionsForEmail,
        verifySecurityAnswers,
        resetAccount,
    } = useAuth();

    const [step, setStep] = useState('email');

    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState([]);
    const [questionsError, setQuestionsError] = useState('');

    const [revealedEmail, setRevealedEmail] = useState('');
    const [revealedPassword, setRevealedPassword] = useState('');
    const [copiedField, setCopiedField] = useState(null);

    const [isBusy, setIsBusy] = useState(false);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !isBusy) onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose, isBusy]);

    const handleEmailSubmit = (event) => {
        event.preventDefault();
        if (isBusy) return;

        setEmailError('');
        const cleanEmail = email.trim();

        if (!cleanEmail) {
            return setEmailError(
                t('login.forgotPassword.errors.emailRequired')
            );
        }

        setIsBusy(true);

        try {
            const result = getSecurityQuestionsForEmail(cleanEmail);

            if (!result?.success) {
                setEmailError(
                    result?.message ||
                    t('login.forgotPassword.errors.emailNotFound')
                );
                setIsBusy(false);
                return;
            }

            setQuestions(result.questions);
            setAnswers(new Array(result.questions.length).fill(''));
            setStep('questions');
        } finally {
            setIsBusy(false);
        }
    };

    const handleAnswersSubmit = (event) => {
        event.preventDefault();
        if (isBusy) return;

        setQuestionsError('');

        if (answers.some((a) => !String(a || '').trim())) {
            return setQuestionsError(
                t('login.forgotPassword.errors.answersRequired')
            );
        }

        setIsBusy(true);

        try {
            const result = verifySecurityAnswers(email.trim(), answers);

            if (!result?.success) {
                setQuestionsError(
                    result?.message ||
                    t('login.forgotPassword.errors.answersIncorrect')
                );
                setIsBusy(false);
                return;
            }

            setRevealedEmail(result.email);
            setRevealedPassword(result.password);
            setStep('result');
        } finally {
            setIsBusy(false);
        }
    };

    const handleCopy = async (text, field) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

    const handleResetConfirm = () => {
        setIsBusy(true);
        const result = resetAccount();
        setIsBusy(false);

        if (result?.success) {
            onClose();
            window.location.reload();
        }
    };

    return (
        <div
            dir={i18n.dir()}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !isBusy) onClose();
            }}
        >
            <div className="relative w-full max-w-md max-h-[92dvh] overflow-hidden rounded-t-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl sm:rounded-2xl">
                <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--border-subtle)] px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                        <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                            style={{
                                background: 'var(--accent-soft)',
                                borderColor: 'var(--accent-border)',
                                color: 'var(--accent-600)',
                            }}
                        >
                            <KeyRound size={16} strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[var(--text)]">
                                {t('login.forgotPassword.title')}
                            </h3>
                            <p className="mt-0.5 truncate text-[10.5px] text-[var(--text-muted)]">
                                {step === 'email' &&
                                    t('login.forgotPassword.step', {
                                        current: 1,
                                        total: 3,
                                    })}
                                {step === 'questions' &&
                                    t('login.forgotPassword.step', {
                                        current: 2,
                                        total: 3,
                                    })}
                                {step === 'result' &&
                                    t('login.forgotPassword.step', {
                                        current: 3,
                                        total: 3,
                                    })}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isBusy}
                        aria-label={t('common.close')}
                        className="ui-icon-button h-8 w-8 shrink-0"
                    >
                        <X size={15} />
                    </button>
                </div>

                <div className="main-scrollbar max-h-[calc(92dvh-7rem)] overflow-y-auto p-4 sm:p-5">
                    {step === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
                            <div>
                                <h4 className="text-[13.5px] font-semibold text-[var(--text)]">
                                    {t('login.forgotPassword.stepEmail.title')}
                                </h4>
                                <p className="mt-1 text-[11px] leading-4 text-[var(--text-muted)]">
                                    {t(
                                        'login.forgotPassword.stepEmail.description'
                                    )}
                                </p>
                            </div>

                            <ErrorBox message={emailError} />

                            <div>
                                <FieldLabel>
                                    {t(
                                        'login.forgotPassword.stepEmail.emailLabel'
                                    )}
                                </FieldLabel>
                                <div className="relative">
                                    <Mail
                                        size={16}
                                        strokeWidth={1.9}
                                        className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                                    />
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError('');
                                        }}
                                        placeholder={t(
                                            'login.forgotPassword.stepEmail.emailPlaceholder'
                                        )}
                                        autoComplete="off"
                                        dir="ltr"
                                        disabled={isBusy}
                                        className={`${FIELD_CLASS} ps-9 pe-3`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isBusy}
                                className="ui-button-primary h-11 w-full"
                            >
                                {isBusy
                                    ? t(
                                          'login.forgotPassword.stepEmail.checking'
                                      )
                                    : t(
                                          'login.forgotPassword.stepEmail.submit'
                                      )}
                            </button>

                            <FallbackReset
                                onTrigger={() => setStep('resetConfirm')}
                                disabled={isBusy}
                            />
                        </form>
                    )}

                    {step === 'questions' && (
                        <form onSubmit={handleAnswersSubmit} className="space-y-3.5">
                            <div>
                                <h4 className="text-[13.5px] font-semibold text-[var(--text)]">
                                    {t(
                                        'login.forgotPassword.stepQuestions.title'
                                    )}
                                </h4>
                                <p className="mt-1 text-[11px] leading-4 text-[var(--text-muted)]">
                                    {t(
                                        'login.forgotPassword.stepQuestions.description'
                                    )}
                                </p>
                            </div>

                            <ErrorBox message={questionsError} />

                            <div className="space-y-2">
                                {questions.map((q, index) => (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5"
                                    >
                                        <p className="mb-1.5 text-[11px] font-medium text-[var(--text-secondary)]">
                                            {t(`securityQuestions.${q.id}`)}
                                        </p>
                                        <input
                                            type="text"
                                            value={answers[index] || ''}
                                            onChange={(e) => {
                                                const next = [...answers];
                                                next[index] = e.target.value;
                                                setAnswers(next);
                                                if (questionsError)
                                                    setQuestionsError('');
                                            }}
                                            placeholder={t(
                                                'login.forgotPassword.stepQuestions.answerPlaceholder'
                                            )}
                                            dir={isRTL ? 'rtl' : 'ltr'}
                                            disabled={isBusy}
                                            className={FIELD_CLASS}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Buttons — stacked vertically */}
                            <div className="space-y-1">
                                <button
                                    type="submit"
                                    disabled={isBusy}
                                    className="ui-button-primary h-11 w-full"
                                >
                                    {isBusy
                                        ? t(
                                              'login.forgotPassword.stepQuestions.verifying'
                                          )
                                        : t(
                                              'login.forgotPassword.stepQuestions.submit'
                                          )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isBusy) return;
                                        setStep('email');
                                        setAnswers([]);
                                        setQuestionsError('');
                                    }}
                                    disabled={isBusy}
                                    className="
                                        group flex w-full items-center justify-center gap-1.5
                                        rounded-xl border border-transparent bg-transparent
                                        py-2.5 text-[12.5px] font-medium text-[var(--text-muted)]
                                        transition-all duration-200
                                        hover:bg-[var(--surface-muted)] hover:text-[var(--text)]
                                        disabled:cursor-not-allowed disabled:opacity-50
                                    "
                                >
                                    {isRTL ? (
                                        <ArrowRight size={13} strokeWidth={2.2} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                                    ) : (
                                        <ArrowLeft size={13} strokeWidth={2.2} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />
                                    )}
                                    <span>
                                        {t(
                                            'login.forgotPassword.stepQuestions.back'
                                        )}
                                    </span>
                                </button>
                            </div>

                            <FallbackReset
                                onTrigger={() => setStep('resetConfirm')}
                                disabled={isBusy}
                            />
                        </form>
                    )}

                    {step === 'result' && (
                        <div className="space-y-3.5">
                            <div className="text-center">
                                <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15">
                                    <Check
                                        size={22}
                                        strokeWidth={2.5}
                                        className="text-emerald-500"
                                    />
                                </div>
                                <h4 className="text-[13.5px] font-semibold text-[var(--text)]">
                                    {t(
                                        'login.forgotPassword.stepResult.title'
                                    )}
                                </h4>
                                <p className="mt-1 text-[11px] leading-4 text-[var(--text-muted)]">
                                    {t(
                                        'login.forgotPassword.stepResult.description'
                                    )}
                                </p>
                            </div>

                            <ResultRow
                                label={t(
                                    'login.forgotPassword.stepResult.emailLabel'
                                )}
                                value={revealedEmail}
                                copied={copiedField === 'email'}
                                onCopy={() => handleCopy(revealedEmail, 'email')}
                                copyLabel={t('common.copy')}
                                copiedLabel={t('common.copied')}
                                dir="ltr"
                            />

                            <ResultRow
                                label={t(
                                    'login.forgotPassword.stepResult.passwordLabel'
                                )}
                                value={revealedPassword}
                                copied={copiedField === 'password'}
                                onCopy={() =>
                                    handleCopy(revealedPassword, 'password')
                                }
                                copyLabel={t('common.copy')}
                                copiedLabel={t('common.copied')}
                                dir="ltr"
                                mono
                            />

                            <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5">
                                <AlertTriangle
                                    size={13}
                                    className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                                />
                                <p className="text-[10.5px] leading-4 text-amber-700 dark:text-amber-300">
                                    {t(
                                        'login.forgotPassword.stepResult.warning'
                                    )}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isBusy}
                                className="ui-button-primary h-11 w-full"
                            >
                                {t('login.forgotPassword.stepResult.close')}
                            </button>
                        </div>
                    )}

                    {step === 'resetConfirm' && (
                        <div className="space-y-3.5">
                            <div className="text-center">
                                <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/15">
                                    <AlertTriangle
                                        size={22}
                                        strokeWidth={2.5}
                                        className="text-rose-500"
                                    />
                                </div>
                                <h4 className="text-[13.5px] font-semibold text-[var(--text)]">
                                    {t(
                                        'login.forgotPassword.fallback.button'
                                    )}
                                </h4>
                            </div>

                            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2.5">
                                <p className="text-[11px] leading-4 text-rose-700 dark:text-rose-300">
                                    {t(
                                        'login.forgotPassword.fallback.confirm'
                                    )}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={handleResetConfirm}
                                    disabled={isBusy}
                                    className="ui-button-danger h-11 w-full"
                                >
                                    {t(
                                        'login.forgotPassword.fallback.confirmButton'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('email');
                                        setEmailError('');
                                    }}
                                    disabled={isBusy}
                                    className="
                                        group flex w-full items-center justify-center gap-1.5
                                        rounded-xl border border-transparent bg-transparent
                                        py-2.5 text-[12.5px] font-medium text-[var(--text-muted)]
                                        transition-all duration-200
                                        hover:bg-[var(--surface-muted)] hover:text-[var(--text)]
                                        disabled:cursor-not-allowed disabled:opacity-50
                                    "
                                >
                                    {isRTL ? (
                                        <ArrowRight size={13} strokeWidth={2.2} className="shrink-0" />
                                    ) : (
                                        <ArrowLeft size={13} strokeWidth={2.2} className="shrink-0" />
                                    )}
                                    <span>
                                        {t(
                                            'login.forgotPassword.fallback.cancel'
                                        )}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// =========================================================
// Result Row
// =========================================================

function ResultRow({
    label,
    value,
    copied,
    onCopy,
    copyLabel,
    copiedLabel,
    dir = 'ltr',
    mono = false,
}) {
    return (
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-2.5">
            <p className="mb-1 text-[10px] font-medium text-[var(--text-muted)]">
                {label}
            </p>
            <div className="flex items-center gap-2">
                <p
                    dir={dir}
                    className={`min-w-0 flex-1 truncate text-[12.5px] font-medium text-[var(--text)] ${
                        mono ? 'number-font' : ''
                    }`}
                >
                    {value}
                </p>
                <button
                    type="button"
                    onClick={onCopy}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[10px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-600)] dark:hover:text-[var(--accent-300)]"
                >
                    {copied ? (
                        <>
                            <Check size={11} />
                            {copiedLabel}
                        </>
                    ) : (
                        <>
                            <Copy size={11} />
                            {copyLabel}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// =========================================================
// Fallback Reset Button
// =========================================================

function FallbackReset({ onTrigger, disabled }) {
    const { t } = useTranslation();

    return (
        <div className="mt-2 border-t border-[var(--border-subtle)] pt-3.5">
            <p className="mb-2 text-[10.5px] leading-4 text-[var(--text-muted)]">
                {t('login.forgotPassword.fallback.description')}
            </p>
            <button
                type="button"
                onClick={onTrigger}
                disabled={disabled}
                className="ui-button-danger h-10 w-full text-[12.5px]"
            >
                {t('login.forgotPassword.fallback.button')}
            </button>
        </div>
    );
}

export default Login;