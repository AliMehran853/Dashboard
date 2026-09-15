import { useEffect, useState } from 'react';
import {
    X, Wallet, User, CalendarDays, FileText, CheckCircle2, Loader2,
    CreditCard, Banknote,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// =========================================================
// Helpers
// =========================================================

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const parseNumber = (value) => {
    const normalized = toEnglishNumbers(value)
        .replace(/,/g, '')
        .replace(/٬/g, '')
        .replace(/[^\d.-]/g, '');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
};

const normalizeNumericInput = (v) =>
    toEnglishNumbers(v).replace(/[^\d.]/g, '').replace(/^(\d*\.\d*).*$/, '$1');

const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
    ).padStart(2, '0')}`;
};

const normalizeId = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
};

// =========================================================
// Credit Payment Modal
// =========================================================

function CreditPaymentModal({ onClose, customer, onSubmit }) {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || 'fa').toLowerCase().startsWith('en');

    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [date, setDate] = useState(getTodayDate());
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    // ═══ Escape + Ctrl+Enter ═══
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape' && !saving) onClose?.();
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !saving) {
                // Submit is handled by form
                const form = document.querySelector('form[data-credit-payment-form]');
                form?.requestSubmit?.();
            }
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [onClose, saving]);

    if (!customer) return null;

    const customerId = normalizeId(customer.customerId ?? customer.id);
    const customerName = customer.customerName || customer.name || '';
    const customerPhone = customer.phone || customer.customerPhone || '';
    const remainingDebt = Math.max(0, parseNumber(customer.remaining));

    const fmt = (v) =>
        new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(parseNumber(v));

    const paymentAmount = parseNumber(amount);
    const remainingAfter = Math.max(0, remainingDebt - paymentAmount);
    const willSettle = paymentAmount > 0 && remainingAfter === 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;
        setError('');

        if (!customerId) {
            setError(t('credit.paymentModal.errors.customerRequired'));
            return;
        }
        if (paymentAmount <= 0) {
            setError(t('credit.paymentModal.errors.amountRequired'));
            return;
        }
        if (paymentAmount > remainingDebt) {
            setError(t('credit.paymentModal.errors.amountTooHigh'));
            return;
        }
        if (!date) {
            setError(t('credit.paymentModal.errors.dateRequired'));
            return;
        }

        try {
            setSaving(true);
            if (typeof onSubmit !== 'function') {
                throw new Error(t('credit.paymentModal.errors.submit'));
            }
            await onSubmit({
                customerId,
                customerName,
                amount: paymentAmount,
                paymentMethod: paymentMethod || 'cash',
                description: description.trim(),
                date,
                createdAt: new Date().toISOString(),
            });
            setAmount('');
            setDescription('');
            setError('');
        } catch (err) {
            console.error('Failed to submit credit payment:', err);
            setError(err?.message || t('credit.paymentModal.errors.submit'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/[0.26] p-2 backdrop-blur-[18px] backdrop-saturate-[0.72] animate-[profileBackdropIn_180ms_ease-out] sm:p-4 dark:bg-black/[0.50]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !saving) onClose?.();
            }}
            role="presentation"
        >
            <div
                className="ui-modal relative flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col overflow-hidden animate-[profileModalIn_180ms_ease-out] sm:max-h-[90vh]"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="ui-modal-header relative flex shrink-0 items-center justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] sm:h-11 sm:w-11">
                            <Wallet size={20} className="text-[var(--accent-500)]" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-[var(--text)] sm:text-lg">
                                {t('credit.paymentModal.title')}
                            </h2>
                            <p className="mt-1 text-[11px] text-[var(--text-muted)] sm:text-xs">
                                {t('credit.paymentModal.subtitle')}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => onClose?.()}
                        disabled={saving}
                        aria-label={t('common.closeMenu')}
                        className="ui-icon-button h-9 w-9 shrink-0 disabled:opacity-50"
                    >
                        <X size={19} />
                    </button>
                </div>

                <form
                    data-credit-payment-form
                    onSubmit={handleSubmit}
                    className="main-scrollbar flex-1 min-h-0 overflow-y-auto"
                >
                    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
                        {/* ═══ Customer card ═══ */}
                        <section className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                            <div className="relative z-10 flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/10 bg-amber-500/10">
                                        <User size={18} className="text-amber-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-semibold text-[var(--text)]">
                                            {customerName ||
                                                t('credit.paymentModal.defaults.customer')}
                                        </p>
                                        <p className="mt-1 truncate text-[10px] text-[var(--text-muted)] sm:text-[11px]">
                                            {customerPhone ? `${customerPhone} • ` : ''}
                                            {t('credit.paymentModal.customer.creditAccount')}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    className={`${isEnglish ? 'text-left' : 'text-right'} shrink-0`}
                                >
                                    <p className="text-[10px] text-[var(--text-muted)]">
                                        {t('credit.paymentModal.customer.currentDebt')}
                                    </p>
                                    <p
                                        dir="ltr"
                                        className="number-font mt-1 text-lg font-bold text-amber-500"
                                    >
                                        {fmt(remainingDebt)}
                                        <span className="ms-1 text-[11px] font-normal text-[var(--text-muted)]">
                                            {t('common.currency')}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {error && (
                            <div
                                role="alert"
                                className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-500 dark:text-red-400"
                            >
                                {error}
                            </div>
                        )}

                        {/* ═══ Amount ═══ */}
                        <section>
                            <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                                {t('credit.paymentModal.fields.amount')}
                            </label>
                            <div className="relative">
                                <Wallet
                                    size={17}
                                    className={`pointer-events-none absolute ${
                                        isEnglish ? 'left-4' : 'right-4'
                                    } top-1/2 -translate-y-1/2 text-[var(--text-muted)]`}
                                />
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(normalizeNumericInput(e.target.value));
                                        setError('');
                                    }}
                                    placeholder={t('credit.paymentModal.fields.amountPlaceholder')}
                                    disabled={saving || remainingDebt <= 0}
                                    className={`ui-input h-12 w-full ${
                                        isEnglish ? 'pl-11 pr-14' : 'pr-11 pl-14'
                                    } disabled:opacity-50`}
                                />
                                <span
                                    className={`pointer-events-none absolute ${
                                        isEnglish ? 'right-4' : 'left-4'
                                    } top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]`}
                                >
                                    {t('common.currency')}
                                </span>
                            </div>

                            {/* Quick fill buttons */}
                            {remainingDebt > 0 && (
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setAmount(String(remainingDebt))}
                                        disabled={saving}
                                        className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-muted)] transition hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-600)] disabled:opacity-50 dark:hover:text-[var(--accent-300)]"
                                    >
                                        {isEnglish ? 'Full amount' : 'کل بدهی'}
                                    </button>
                                    {remainingDebt >= 2 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setAmount(String(Math.floor(remainingDebt / 2)))
                                            }
                                            disabled={saving}
                                            className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-medium text-[var(--text-muted)] transition hover:border-[var(--accent-border)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-600)] disabled:opacity-50 dark:hover:text-[var(--accent-300)]"
                                        >
                                            {isEnglish ? 'Half' : 'نصف'}
                                        </button>
                                    )}
                                </div>
                            )}

                            <p className="mt-2 text-[10px] text-[var(--text-muted)]">
                                {t('credit.paymentModal.fields.maximum')}{' '}
                                <span
                                    dir="ltr"
                                    className="number-font font-medium text-[var(--text-secondary)]"
                                >
                                    {fmt(remainingDebt)}
                                </span>{' '}
                                {t('common.currency')}
                            </p>

                            {/* Remaining after payment */}
                            {paymentAmount > 0 && (
                                <div
                                    className={`mt-3 flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-[11px] ${
                                        willSettle
                                            ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                                            : 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)]'
                                    }`}
                                >
                                    <span>
                                        {willSettle
                                            ? isEnglish
                                                ? 'Debt will be fully settled'
                                                : 'بدهی به‌طور کامل تسویه می‌شود'
                                            : isEnglish
                                                ? 'Remaining after payment'
                                                : 'باقی‌مانده پس از پرداخت'}
                                    </span>
                                    <span
                                        dir="ltr"
                                        className="number-font font-semibold"
                                    >
                                        {fmt(remainingAfter)} {t('common.currency')}
                                    </span>
                                </div>
                            )}
                        </section>

                        {/* ═══ Method ═══ */}
                        <section>
                            <label className="mb-3 block text-xs font-medium text-[var(--text-secondary)]">
                                {t('credit.paymentModal.fields.paymentMethod')}
                            </label>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                {[
                                    {
                                        value: 'cash',
                                        Icon: Banknote,
                                        label: t('credit.paymentModal.methods.cash'),
                                        tone: 'cyan',
                                    },
                                    {
                                        value: 'card',
                                        Icon: CreditCard,
                                        label: t('credit.paymentModal.methods.card'),
                                        tone: 'violet',
                                    },
                                ].map(({ value, Icon, label, tone }) => {
                                    const isActive = paymentMethod === value;
                                    const activeCls =
                                        tone === 'cyan'
                                            ? 'border-cyan-500/25 bg-cyan-500/10 text-cyan-500'
                                            : 'border-violet-500/25 bg-violet-500/10 text-violet-500';
                                    const hoverCls =
                                        tone === 'cyan'
                                            ? 'hover:border-cyan-500/20 hover:bg-cyan-500/5 hover:text-cyan-500'
                                            : 'hover:border-violet-500/20 hover:bg-violet-500/5 hover:text-violet-500';
                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setPaymentMethod(value)}
                                            disabled={saving}
                                            className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-xs font-medium transition-all disabled:opacity-50 ${
                                                isActive
                                                    ? activeCls
                                                    : `border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-muted)] ${hoverCls}`
                                            }`}
                                        >
                                            <Icon size={16} />
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* ═══ Date ═══ */}
                        <section>
                            <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                                {t('credit.paymentModal.fields.date')}
                            </label>
                            <div className="relative">
                                <CalendarDays
                                    size={17}
                                    className={`pointer-events-none absolute ${
                                        isEnglish ? 'left-4' : 'right-4'
                                    } top-1/2 -translate-y-1/2 text-[var(--text-muted)]`}
                                />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    disabled={saving}
                                    className={`ui-input h-12 w-full ${
                                        isEnglish ? 'pl-11 pr-4' : 'pr-11 pl-4'
                                    } disabled:opacity-50`}
                                />
                            </div>
                        </section>

                        {/* ═══ Description ═══ */}
                        <section>
                            <label className="mb-2 block text-xs font-medium text-[var(--text-secondary)]">
                                {t('credit.paymentModal.fields.description')}
                                <span className="ms-1 text-[10px] font-normal text-[var(--text-muted)]">
                                    {t('credit.paymentModal.optional')}
                                </span>
                            </label>
                            <div className="relative">
                                <FileText
                                    size={17}
                                    className={`pointer-events-none absolute ${
                                        isEnglish ? 'left-4' : 'right-4'
                                    } top-4 text-[var(--text-muted)]`}
                                />
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    placeholder={t('credit.paymentModal.fields.descriptionPlaceholder')}
                                    disabled={saving}
                                    className={`ui-input min-h-[96px] w-full resize-none py-3 ${
                                        isEnglish ? 'pl-11 pr-4' : 'pr-11 pl-4'
                                    } disabled:opacity-50`}
                                />
                            </div>
                        </section>
                    </div>

                    {/* ═══ Footer ═══ */}
                    <div className="ui-modal-footer sticky bottom-0 flex flex-col-reverse gap-3 px-4 py-4 backdrop-blur-xl sm:flex-row sm:justify-end sm:px-6">
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            disabled={saving}
                            className="ui-button-secondary h-11 w-full rounded-xl px-5 disabled:opacity-50 sm:w-auto"
                        >
                            {t('credit.paymentModal.actions.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={saving || remainingDebt <= 0}
                            className="ui-button-primary h-11 w-full rounded-xl px-6 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                        >
                            {saving && <Loader2 size={16} className="animate-spin" />}
                            {saving
                                ? t('credit.paymentModal.actions.saving')
                                : t('credit.paymentModal.actions.submit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreditPaymentModal;