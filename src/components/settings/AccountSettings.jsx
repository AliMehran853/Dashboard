import { useEffect, useMemo, useState } from 'react';
import {
    User, Mail, Lock, Save, ShieldCheck, CheckCircle2, AlertTriangle,
    Eye, EyeOff, Info, Sparkles, HelpCircle, ChevronDown,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth, detectEmailTypo } from '../../context/AuthContext';

// =========================================================
// Constants
// =========================================================

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 6;
const MIN_ANSWER_LENGTH = 2;
const QUESTIONS_COUNT = 3;

const ALL_QUESTION_IDS = [
    'firstSchool',
    'firstPet',
    'birthCity',
    'firstTeacher',
    'childhoodFriend',
];

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

const SELECT_CLASS = `
    w-full rounded-xl border border-[var(--input-border)]
    bg-[var(--input-bg)] px-3 py-3 text-sm text-[var(--text)]
    outline-none transition-all duration-200 cursor-pointer
    hover:border-[var(--input-border-hover)]
    focus:border-[var(--input-border-focus)]
    focus:shadow-[0_0_0_3px_var(--accent-soft-strong)]
    disabled:cursor-not-allowed disabled:opacity-60
    appearance-none
`;

// =========================================================
// Account Settings
// =========================================================

function AccountSettings() {
    const { t, i18n } = useTranslation();
    const { user, getAccount, updateAccount } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [currentEmail, setCurrentEmail] = useState('');

    // Current saved security questions (ids only, no answers)
    const [currentQuestionIds, setCurrentQuestionIds] = useState([]);

    // Toggle to change security questions
    const [changeQuestions, setChangeQuestions] = useState(false);
    const [newQuestions, setNewQuestions] = useState([
        { id: '', answer: '' },
        { id: '', answer: '' },
        { id: '', answer: '' },
    ]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [emailSuggestion, setEmailSuggestion] = useState('');

    const direction = i18n.dir();
    const isRtl = direction === 'rtl';

    // ---------------------------------------------------------
    // Initial load
    // ---------------------------------------------------------
    useEffect(() => {
        let cancelled = false;

        try {
            const account = getAccount();
            if (cancelled) return;

            setName(account?.name || '');
            setEmail(account?.email || '');
            setCurrentEmail(account?.email || '');

            const ids = Array.isArray(account?.securityQuestions)
                ? account.securityQuestions.map((q) => q.id)
                : [];
            setCurrentQuestionIds(ids);
        } catch (loadError) {
            console.error('Failed to load account:', loadError);
            if (!cancelled) setError(t('settings.account.errors.load'));
        } finally {
            if (!cancelled) setLoading(false);
        }

        return () => {
            cancelled = true;
        };
    }, [getAccount, t]);

    // ---------------------------------------------------------
    // Sync from auth user
    // ---------------------------------------------------------
    useEffect(() => {
        if (typeof user?.name === 'string') setName(user.name);
        if (typeof user?.email === 'string') {
            setEmail(user.email);
            setCurrentEmail(user.email);
        }
    }, [user?.name, user?.email]);

    // ---------------------------------------------------------
    // External account update
    // ---------------------------------------------------------
    useEffect(() => {
        const handler = (event) => {
            const nextUser = event?.detail;
            if (typeof nextUser?.name === 'string') setName(nextUser.name);
            if (typeof nextUser?.email === 'string') {
                setEmail(nextUser.email);
                setCurrentEmail(nextUser.email);
            }

            // Refresh current security question IDs
            try {
                const acc = getAccount();
                const ids = Array.isArray(acc?.securityQuestions)
                    ? acc.securityQuestions.map((q) => q.id)
                    : [];
                setCurrentQuestionIds(ids);
            } catch {
                /* ignore */
            }
        };

        window.addEventListener('account-updated', handler);
        return () => window.removeEventListener('account-updated', handler);
    }, [getAccount]);

    // ---------------------------------------------------------
    // Live typo detection while typing email
    // ---------------------------------------------------------
    useEffect(() => {
        const typo = detectEmailTypo(email.trim());
        setEmailSuggestion(typo || '');
    }, [email]);

    // ---------------------------------------------------------
    // Update new question slot
    // ---------------------------------------------------------
    const updateQuestion = (index, patch) => {
        setNewQuestions((prev) =>
            prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
        );
        if (error) setError('');
    };

    // ---------------------------------------------------------
    // Reset question change state
    // ---------------------------------------------------------
    const cancelQuestionChange = () => {
        setChangeQuestions(false);
        setNewQuestions([
            { id: '', answer: '' },
            { id: '', answer: '' },
            { id: '', answer: '' },
        ]);
    };

    // ---------------------------------------------------------
    // Save
    // ---------------------------------------------------------
    const handleSave = (event) => {
        event.preventDefault();
        if (saving) return;

        setSuccess('');
        setError('');

        const cleanName = name.trim();
        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        // Name
        if (!cleanName) {
            return setError(
                t('settings.account.errors.nameRequired', {
                    defaultValue: 'نام مدیر را وارد کنید.',
                })
            );
        }

        // Email
        if (!cleanEmail) {
            return setError(
                t('settings.account.errors.emailRequired', {
                    defaultValue: 'ایمیل را وارد کنید.',
                })
            );
        }

        const typo = detectEmailTypo(cleanEmail);
        if (typo) {
            return setError(
                t('settings.account.errors.emailTypo', {
                    suggestion: typo,
                    defaultValue: `ایمیل احتمالاً اشتباه است. منظورتان «${typo}» بود؟`,
                })
            );
        }

        if (!EMAIL_REGEX.test(cleanEmail)) {
            return setError(
                t('settings.account.errors.emailInvalid', {
                    defaultValue: 'فرمت ایمیل صحیح نیست.',
                })
            );
        }

        // Password (only if typed)
        if (cleanPassword && cleanPassword.length < MIN_PASSWORD_LENGTH) {
            return setError(
                t('settings.account.errors.passwordMin', {
                    count: MIN_PASSWORD_LENGTH,
                    defaultValue: `رمز عبور باید حداقل ${MIN_PASSWORD_LENGTH} کاراکتر باشد.`,
                })
            );
        }

        // Build changes
        const changes = { name: cleanName, email: cleanEmail };
        if (cleanPassword) changes.password = cleanPassword;

        // Security questions (optional — only if user toggled and filled)
        let securityChanged = false;
        if (changeQuestions) {
            const anyFilled = newQuestions.some(
                (q) => q.id || q.answer.trim()
            );

            if (anyFilled) {
                const cleanQuestions = newQuestions.map((q) => ({
                    id: String(q.id || '').trim(),
                    answer: String(q.answer || '').trim(),
                }));

                if (cleanQuestions.some((q) => !q.id)) {
                    return setError(
                        t('settings.account.errors.securityRequired', {
                            defaultValue:
                                'لطفاً هر ۳ سؤال امنیتی را انتخاب کنید.',
                        })
                    );
                }

                if (cleanQuestions.some((q) => !q.answer)) {
                    return setError(
                        t('settings.account.errors.securityRequired', {
                            defaultValue:
                                'لطفاً به همه سؤالات امنیتی پاسخ دهید.',
                        })
                    );
                }

                if (
                    cleanQuestions.some(
                        (q) => q.answer.length < MIN_ANSWER_LENGTH
                    )
                ) {
                    return setError(
                        t('settings.account.errors.securityRequired', {
                            defaultValue:
                                'پاسخ هر سؤال باید حداقل ۲ کاراکتر باشد.',
                        })
                    );
                }

                const ids = cleanQuestions.map((q) => q.id);
                if (new Set(ids).size !== ids.length) {
                    return setError(
                        t('settings.account.errors.securityDuplicate', {
                            defaultValue:
                                'سؤالات امنیتی نباید تکراری باشند.',
                        })
                    );
                }

                changes.securityQuestions = cleanQuestions;
                securityChanged = true;
            }
        }

        const emailChanged = cleanEmail !== currentEmail;
        const passwordChanged = Boolean(cleanPassword);

        // Save
        try {
            setSaving(true);
            const result = updateAccount(changes);

            if (!result?.success) {
                setError(
                    result?.message ||
                    t('settings.account.errors.save', {
                        defaultValue:
                            'ذخیره اطلاعات حساب انجام نشد.',
                    })
                );
                return;
            }

            const savedUser = result.user;
            if (savedUser) {
                setName(savedUser.name || '');
                setEmail(savedUser.email || '');
                setCurrentEmail(savedUser.email || '');
            } else {
                setName(cleanName);
                setEmail(cleanEmail);
                setCurrentEmail(cleanEmail);
            }

            setPassword('');
            setEmailSuggestion('');

            if (securityChanged) {
                // refresh displayed current question ids
                try {
                    const acc = getAccount();
                    const ids = Array.isArray(acc?.securityQuestions)
                        ? acc.securityQuestions.map((q) => q.id)
                        : [];
                    setCurrentQuestionIds(ids);
                } catch {
                    /* ignore */
                }
                cancelQuestionChange();
            }

            // Success message
            if (securityChanged) {
                setSuccess(
                    t('settings.account.messages.successWithSecurity', {
                        defaultValue:
                            'اطلاعات و سؤالات امنیتی با موفقیت ذخیره شد.',
                    })
                );
            } else if (emailChanged || passwordChanged) {
                setSuccess(
                    t('settings.account.messages.successWithCredentials', {
                        defaultValue:
                            'ذخیره شد. دفعه بعد با ایمیل و رمز عبور جدید وارد شوید.',
                    })
                );
            } else {
                setSuccess(
                    t('settings.account.messages.success', {
                        defaultValue:
                            'اطلاعات حساب با موفقیت ذخیره شد.',
                    })
                );
            }
        } catch (saveError) {
            console.error('Failed to update account:', saveError);
            setError(
                t('settings.account.errors.save', {
                    defaultValue: 'ذخیره اطلاعات حساب انجام نشد.',
                })
            );
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------------------------------------
    // Loading
    // ---------------------------------------------------------
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

    // =========================================================
    // Render
    // =========================================================

    return (
        <section dir={direction} className="ui-card overflow-hidden p-0">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/10 bg-cyan-500/10">
                    <ShieldCheck
                        size={19}
                        className="text-cyan-500 dark:text-cyan-400"
                    />
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
                {/* Active Account */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
                    <div className="flex items-start gap-3">
                        <ShieldCheck
                            size={17}
                            className="mt-0.5 shrink-0 text-emerald-500 dark:text-emerald-400"
                        />
                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-[var(--text-muted)]">
                                {t('settings.account.activeAccount', {
                                    defaultValue: 'حساب فعال',
                                })}
                            </p>
                            <p
                                dir="ltr"
                                className="mt-1 truncate text-sm font-medium text-[var(--text-primary)]"
                            >
                                {currentEmail || '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Name */}
                <Field
                    label={t('settings.account.fields.name.label')}
                    icon={User}
                    value={name}
                    onChange={(v) => {
                        setName(v);
                        setSuccess('');
                    }}
                    placeholder={t('settings.account.fields.name.placeholder')}
                    direction={direction}
                    iconPosition={iconPosition}
                    inputPadding={inputPadding}
                    disabled={saving}
                />

                {/* Email + Typo Suggestion */}
                <div>
                    <Field
                        label={t('settings.account.fields.email.label')}
                        icon={Mail}
                        value={email}
                        onChange={(v) => {
                            setEmail(v);
                            setSuccess('');
                            setError('');
                        }}
                        placeholder={t(
                            'settings.account.fields.email.placeholder'
                        )}
                        direction={direction}
                        iconPosition={iconPosition}
                        inputPadding={inputPadding}
                        disabled={saving}
                        type="email"
                        inputDir="ltr"
                    />

                    {emailSuggestion && (
                        <div className="mt-2 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5">
                            <Sparkles
                                size={14}
                                className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] leading-5 text-amber-700 dark:text-amber-300">
                                    {t(
                                        'settings.account.errors.emailTypoSuggest',
                                        {
                                            suggestion: emailSuggestion,
                                            defaultValue: `آیا منظورتان «${emailSuggestion}» بود؟`,
                                        }
                                    )}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEmail(emailSuggestion);
                                        setEmailSuggestion('');
                                        setError('');
                                    }}
                                    disabled={saving}
                                    className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-700 transition-colors hover:bg-amber-500/20 disabled:opacity-50 dark:text-amber-300"
                                >
                                    {t(
                                        'settings.account.actions.fixTypo',
                                        {
                                            defaultValue:
                                                'استفاده از این ایمیل',
                                        }
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <p className="mt-2 text-[11px] leading-5 text-[var(--text-muted)]">
                        {t('settings.account.fields.email.hint', {
                            defaultValue: 'با این ایمیل وارد سیستم می‌شوید.',
                        })}
                    </p>
                </div>

                {/* Password */}
                <div>
                    <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">
                        {t('settings.account.fields.password.label')}
                    </label>

                    <div className="relative">
                        <Lock
                            size={16}
                            className={`pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 text-[var(--text-muted)] ${iconPosition}`}
                        />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setSuccess('');
                            }}
                            placeholder={t(
                                'settings.account.fields.password.placeholder'
                            )}
                            dir="ltr"
                            disabled={saving}
                            style={
                                isRtl
                                    ? {
                                          paddingRight: '32px',
                                          paddingLeft: '44px',
                                      }
                                    : {
                                          paddingLeft: '32px',
                                          paddingRight: '44px',
                                      }
                            }
                            className="ui-input h-11 w-full"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            disabled={saving}
                            tabIndex={-1}
                            aria-label={
                                showPassword
                                    ? t('login.actions.hidePassword', {
                                          defaultValue: 'مخفی کردن رمز',
                                      })
                                    : t('login.actions.showPassword', {
                                          defaultValue: 'نمایش رمز',
                                      })
                            }
                            className={`absolute top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--text-soft)] transition-colors duration-200 hover:bg-[var(--surface-muted)] hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-50 ${
                                isRtl ? 'left-2' : 'right-2'
                            }`}
                        >
                            {showPassword ? (
                                <EyeOff size={17} />
                            ) : (
                                <Eye size={17} />
                            )}
                        </button>
                    </div>

                    <p className="mt-2 text-[11px] leading-5 text-[var(--text-muted)]">
                        {t('settings.account.fields.password.hint', {
                            defaultValue:
                                'برای تغییر رمز، رمز جدید را وارد کنید. حداقل ۶ کاراکتر.',
                        })}
                    </p>
                </div>

                {/* ──────────────── Security Questions ──────────────── */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                    <div className="mb-3 flex items-start gap-3">
                        <HelpCircle
                            size={17}
                            className="mt-0.5 shrink-0 text-[var(--accent-500)]"
                        />
                        <div className="min-w-0 flex-1">
                            <h3 className="text-[12.5px] font-semibold text-[var(--text-primary)]">
                                {t('settings.account.securitySection.title', {
                                    defaultValue: 'سؤالات امنیتی',
                                })}
                            </h3>
                            <p className="mt-1 text-[11px] leading-5 text-[var(--text-muted)]">
                                {t(
                                    'settings.account.securitySection.description',
                                    {
                                        defaultValue:
                                            'این سؤالات برای بازیابی اطلاعات ورود در صورت فراموشی استفاده می‌شوند.',
                                    }
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Current questions list */}
                    {!changeQuestions && (
                        <>
                            {currentQuestionIds.length > 0 ? (
                                <div className="space-y-2">
                                    {currentQuestionIds.map((id, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2.5"
                                        >
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[10px] font-semibold text-[var(--accent-600)] dark:text-[var(--accent-300)]">
                                                {index + 1}
                                            </span>
                                            <p className="min-w-0 flex-1 truncate text-[12px] text-[var(--text-secondary)]">
                                                {t(`securityQuestions.${id}`)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2.5 text-[11px] text-amber-700 dark:text-amber-300">
                                    {t(
                                        'settings.account.securitySection.hint',
                                        {
                                            defaultValue:
                                                'برای امنیت بیشتر، سؤالات امنیتی تعیین کنید.',
                                        }
                                    )}
                                </p>
                            )}

                            <button
                                type="button"
                                onClick={() => setChangeQuestions(true)}
                                disabled={saving}
                                className="mt-3 ui-button-secondary h-10 w-full text-xs"
                            >
                                <HelpCircle size={14} />
                                {t(
                                    'settings.account.securitySection.changeToggle',
                                    {
                                        defaultValue:
                                            'می‌خواهم سؤالات را تغییر دهم',
                                    }
                                )}
                            </button>
                        </>
                    )}

                    {/* Change questions form */}
                    {changeQuestions && (
                        <div className="space-y-3">
                            <p className="text-[10.5px] leading-4 text-[var(--text-muted)]">
                                {t(
                                    'settings.account.securitySection.hint',
                                    {
                                        defaultValue:
                                            'برای تغییر، ۳ سؤال جدید انتخاب کنید و به همه پاسخ دهید. در غیر این صورت، انصراف دهید.',
                                    }
                                )}
                            </p>

                            <div className="space-y-4">
                                {newQuestions.map((q, index) => {
                                    const usedIds = newQuestions
                                        .filter((_, i) => i !== index)
                                        .map((qq) => qq.id)
                                        .filter(Boolean);

                                    return (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                                        >
                                            <p className="mb-2 text-[11px] font-medium text-[var(--text-muted)]">
                                                {t(
                                                    'login.setup.fields.questionN',
                                                    {
                                                        n: index + 1,
                                                        defaultValue: `سؤال ${
                                                            index + 1
                                                        }`,
                                                    }
                                                )}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <select
                                                        value={q.id || ''}
                                                        onChange={(e) =>
                                                            updateQuestion(
                                                                index,
                                                                {
                                                                    id: e.target
                                                                        .value,
                                                                    answer:
                                                                        q.answer,
                                                                }
                                                            )
                                                        }
                                                        disabled={saving}
                                                        className={
                                                            SELECT_CLASS
                                                        }
                                                    >
                                                        <option value="">
                                                            {t(
                                                                'login.setup.fields.questionPlaceholder',
                                                                {
                                                                    defaultValue:
                                                                        'یک سؤال انتخاب کنید',
                                                                }
                                                            )}
                                                        </option>
                                                        {ALL_QUESTION_IDS.map(
                                                            (id) => {
                                                                const isUsed =
                                                                    usedIds.includes(
                                                                        id
                                                                    );
                                                                if (isUsed)
                                                                    return null;
                                                                return (
                                                                    <option
                                                                        key={
                                                                            id
                                                                        }
                                                                        value={
                                                                            id
                                                                        }
                                                                    >
                                                                        {t(
                                                                            `securityQuestions.${id}`
                                                                        )}
                                                                    </option>
                                                                );
                                                            }
                                                        )}
                                                    </select>
                                                    <ChevronDown
                                                        size={14}
                                                        className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-[var(--text-soft)]"
                                                    />
                                                </div>

                                                <input
                                                    type="text"
                                                    value={q.answer || ''}
                                                    onChange={(e) =>
                                                        updateQuestion(index, {
                                                            id: q.id,
                                                            answer:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder={t(
                                                        'login.setup.fields.answerPlaceholder',
                                                        {
                                                            defaultValue:
                                                                'پاسخ خود را وارد کنید',
                                                        }
                                                    )}
                                                    disabled={
                                                        saving || !q.id
                                                    }
                                                    dir={
                                                        isRtl ? 'rtl' : 'ltr'
                                                    }
                                                    className={FIELD_CLASS}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                type="button"
                                onClick={cancelQuestionChange}
                                disabled={saving}
                                className="ui-button-secondary h-10 w-full text-xs"
                            >
                                {t(
                                    'settings.account.securitySection.cancelChange',
                                    { defaultValue: 'انصراف از تغییر' }
                                )}
                            </button>
                        </div>
                    )}
                </div>

                {/* Info note */}
                <div className="flex items-start gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-3.5 py-3">
                    <Info
                        size={15}
                        className="mt-0.5 shrink-0 text-[var(--text-muted)]"
                    />
                    <p className="text-[11px] leading-5 text-[var(--text-muted)]">
                        {t('settings.account.credentialsNote', {
                            defaultValue:
                                'این اطلاعات فقط روی همین دستگاه ذخیره می‌شود. اگر آن‌ها را فراموش کنید، فقط از طریق سؤالات امنیتی می‌توانید بازیابی کنید.',
                        })}
                    </p>
                </div>

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
    label,
    icon: Icon,
    value,
    onChange,
    placeholder,
    direction,
    iconPosition,
    inputPadding,
    disabled,
    type = 'text',
    inputDir,
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
    const classes =
        tone === 'success'
            ? 'border-emerald-500/15 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
            : 'border-rose-500/15 bg-rose-500/5 text-rose-600 dark:text-rose-400';

    return (
        <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm leading-5 ${classes}`}
        >
            <Icon size={17} className="mt-0.5 shrink-0" />
            <span>{message}</span>
        </div>
    );
}

export default AccountSettings;