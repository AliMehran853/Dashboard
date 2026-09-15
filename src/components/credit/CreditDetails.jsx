import { useEffect, useState } from 'react';
import {
    X, UserRound, Phone, CalendarDays, CreditCard, WalletCards,
    CircleDollarSign, CheckCircle2, Clock3, ArrowDownToLine, ReceiptText,
    ShoppingBag, History, Ruler, Layers,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatJalaliDate, getJalaliMonthStyle } from '../../utils/date/jalali';

// =========================================================
// Helpers
// =========================================================

const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const getValidDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (value, isEnglish, jalaliMonthStyle) => {
    const d = getValidDate(value);
    if (!d) return '-';
    if (isEnglish) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(d);
    }
    return (
        formatJalaliDate(d, {
            monthStyle: jalaliMonthStyle,
            withMonthName: true,
        }) || '-'
    );
};

const formatDateTime = (value, isEnglish, jalaliMonthStyle) => {
    const d = getValidDate(value);
    if (!d) return '-';
    if (isEnglish) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(d);
    }
    const j = formatJalaliDate(d, {
        monthStyle: jalaliMonthStyle,
        withMonthName: true,
    });
    if (!j) return '-';
    const time = new Intl.DateTimeFormat('fa-IR', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(d);
    return `${j} - ${time}`;
};

// =========================================================
// Credit Details
// =========================================================

function CreditDetails({ customer, onClose, onPayment }) {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || 'fa').toLowerCase().startsWith('en');

    const [jalaliMonthStyle, setJalaliMonthStyle] = useState(getJalaliMonthStyle);

    useEffect(() => {
        const onChange = (e) =>
            setJalaliMonthStyle(e?.detail || getJalaliMonthStyle());
        const onStorage = (e) => {
            if (e.key === 'jalaliMonthStyle') setJalaliMonthStyle(getJalaliMonthStyle());
        };
        window.addEventListener('jalali-month-style-changed', onChange);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('jalali-month-style-changed', onChange);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    useEffect(() => {
        if (!customer) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [customer, onClose]);

    if (!customer) return null;

    const customerName =
        customer.customerName || customer.name || t('credit.details.defaults.customer');
    const customerPhone = customer.phone || customer.customerPhone || '';

    const totalDebt = Math.max(0, num(customer.totalDebt));
    const paid = Math.max(0, num(customer.paid));
    const remaining = Math.max(0, num(customer.remaining));

    const paymentProgress =
        totalDebt > 0
            ? Math.min(100, Math.round((paid / totalDebt) * 100))
            : remaining <= 0
                ? 100
                : 0;

    const status = remaining <= 0 ? 'settled' : paid > 0 ? 'partial' : 'debt';

    const STATUS = {
        settled: {
            label: t('credit.table.status.settled'),
            icon: CheckCircle2,
            className: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-500',
            bar: 'bg-emerald-500',
        },
        partial: {
            label: t('credit.table.status.partial'),
            icon: Clock3,
            className: 'border-amber-500/15 bg-amber-500/10 text-amber-500',
            bar: 'bg-amber-500',
        },
        debt: {
            label: t('credit.table.status.debt'),
            icon: CircleDollarSign,
            className: 'border-rose-500/15 bg-rose-500/10 text-rose-500',
            bar: 'bg-rose-500',
        },
    };

    const currentStatus = STATUS[status] || STATUS.debt;
    const StatusIcon = currentStatus.icon;

    const creditSales = Array.isArray(customer.creditSales) ? customer.creditSales : [];
    const payments = Array.isArray(customer.payments) ? customer.payments : [];

    const lastTransactionValue =
        customer.lastTransaction ||
        customer.latestCreditSale?.createdAt ||
        customer.latestPayment?.createdAt ||
        null;

    const fmt = (v) =>
        new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(num(v));

    return (
        <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/[0.26] p-3 backdrop-blur-[20px] backdrop-saturate-[0.70] animate-[profileBackdropIn_180ms_ease-out] sm:p-5 dark:bg-black/[0.50]"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
            role="presentation"
        >
            <div
                className="ui-modal flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden animate-[profileModalIn_180ms_ease-out]"
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* ═══ Header ═══ */}
                <div className="ui-modal-header relative shrink-0 overflow-hidden px-5 py-5 sm:px-6 sm:py-6">
                    <div className="relative z-10 flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] shadow-[var(--shadow-xs)] sm:h-14 sm:w-14">
                                <UserRound className="h-6 w-6 text-[var(--accent-500)] sm:h-7 sm:w-7" />
                            </div>
                            <div className="min-w-0">
                                <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <h2 className="truncate text-lg font-bold tracking-tight text-[var(--text)] sm:text-xl">
                                        {customerName}
                                    </h2>
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${currentStatus.className}`}
                                    >
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {currentStatus.label}
                                    </span>
                                </div>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {t('credit.details.subtitle')}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            aria-label={t('credit.details.footer.close')}
                            className="ui-icon-button h-10 w-10 shrink-0"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* ═══ Body ═══ */}
                <div className="main-scrollbar min-h-0 flex-1 overflow-y-auto">
                    <div className="space-y-5 p-5 sm:p-6">
                        {/* Customer info */}
                        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 sm:p-5">
                            <SectionHeading
                                icon={UserRound}
                                title={t('credit.details.customer.title')}
                            />
                            <div className="grid gap-3 sm:grid-cols-2">
                                <InfoCard
                                    icon={UserRound}
                                    label={t('credit.details.customer.name')}
                                    value={customerName}
                                />
                                <InfoCard
                                    icon={Phone}
                                    label={t('credit.details.customer.phone')}
                                    value={customerPhone || '-'}
                                    dir="ltr"
                                />
                                <InfoCard
                                    icon={CalendarDays}
                                    label={t('credit.details.customer.lastTransaction')}
                                    value={formatDateTime(
                                        lastTransactionValue,
                                        isEnglish,
                                        jalaliMonthStyle
                                    )}
                                    wide
                                    dir={isEnglish ? 'ltr' : undefined}
                                />
                            </div>
                        </section>

                        {/* Financial summary */}
                        <section>
                            <SectionHeading
                                icon={WalletCards}
                                title={t('credit.details.financialSummary.title')}
                                description={t('credit.details.paymentAction.description')}
                            />
                            <div className="grid gap-3 sm:grid-cols-3">
                                <MetricCard
                                    tone="neutral"
                                    icon={CreditCard}
                                    label={t('credit.details.financialSummary.totalDebt')}
                                    value={fmt(totalDebt)}
                                    suffix={t('common.currency')}
                                />
                                <MetricCard
                                    tone="success"
                                    icon={CheckCircle2}
                                    label={t('credit.details.financialSummary.paid')}
                                    value={fmt(paid)}
                                    suffix={`${paymentProgress}%`}
                                />
                                <MetricCard
                                    tone={remaining > 0 ? 'danger' : 'success'}
                                    icon={
                                        remaining > 0 ? CircleDollarSign : CheckCircle2
                                    }
                                    label={t('credit.details.financialSummary.remaining')}
                                    value={fmt(remaining)}
                                    suffix={
                                        remaining > 0
                                            ? t('credit.details.remaining')
                                            : t('credit.table.status.settled')
                                    }
                                />
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                                <div className="mb-2 flex items-center justify-between gap-3">
                                    <span className="text-xs font-semibold text-[var(--text-secondary)]">
                                        {t('credit.details.paymentProgress')}
                                    </span>
                                    <span
                                        dir="ltr"
                                        className="number-font text-xs font-bold text-[var(--text)]"
                                    >
                                        {paymentProgress}%
                                    </span>
                                </div>
                                <div
                                    className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface)]"
                                    dir="ltr"
                                >
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${currentStatus.bar}`}
                                        style={{ width: `${paymentProgress}%` }}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Credit Sales */}
                        <section>
                            <SectionHeading
                                icon={ShoppingBag}
                                title={t('credit.details.transactions.creditSalesTitle')}
                                description={t(
                                    'credit.details.transactions.creditSalesDescription'
                                )}
                            />
                            {creditSales.length === 0 ? (
                                <EmptyHistory
                                    icon={ShoppingBag}
                                    text={t('credit.details.transactions.noCreditSales')}
                                />
                            ) : (
                                <div className="space-y-2">
                                    {creditSales
                                        .slice()
                                        .sort(
                                            (a, b) =>
                                                new Date(b.createdAt || b.date || 0) -
                                                new Date(a.createdAt || a.date || 0)
                                        )
                                        .map((sale, idx) => {
                                            // Support both legacy and new enriched credit sales
                                            const qty = num(sale.quantity);
                                            const factor = num(sale.saleFactor) || 1;
                                            const qtyInBase =
                                                num(sale.quantityInBase) || qty * factor;
                                            const saleUnit =
                                                sale.saleUnit || sale.baseUnit || '';
                                            const baseUnit = sale.baseUnit || '';

                                            return (
                                                <TransactionCard
                                                    key={sale.id || `${sale.saleId}-${idx}`}
                                                    icon={ReceiptText}
                                                    tone="amber"
                                                    title={
                                                        sale.productName
                                                            ? `${t('credit.details.transactions.creditSale')} • ${sale.productName}`
                                                            : t(
                                                                'credit.details.transactions.creditSale'
                                                            )
                                                    }
                                                    date={formatDateTime(
                                                        sale.createdAt || sale.date,
                                                        isEnglish,
                                                        jalaliMonthStyle
                                                    )}
                                                    amount={fmt(sale.amount)}
                                                    currency={t('common.currency')}
                                                    meta={
                                                        qty > 0 && saleUnit
                                                            ? {
                                                                primary: `${fmt(qty)} ${saleUnit}`,
                                                                secondary:
                                                                    factor !== 1 && baseUnit
                                                                        ? `= ${fmt(qtyInBase)} ${baseUnit}`
                                                                        : '',
                                                            }
                                                            : null
                                                    }
                                                />
                                            );
                                        })}
                                </div>
                            )}
                        </section>

                        {/* Payments */}
                        <section>
                            <SectionHeading
                                icon={History}
                                title={t('credit.details.transactions.paymentsTitle')}
                                description={t('credit.details.transactions.paymentsDescription')}
                            />
                            {payments.length === 0 ? (
                                <EmptyHistory
                                    icon={History}
                                    text={t('credit.details.transactions.noPayments')}
                                />
                            ) : (
                                <div className="space-y-2">
                                    {payments
                                        .slice()
                                        .sort(
                                            (a, b) =>
                                                new Date(b.createdAt || b.date || 0) -
                                                new Date(a.createdAt || a.date || 0)
                                        )
                                        .map((payment, idx) => (
                                            <TransactionCard
                                                key={payment.id || `payment-${idx}`}
                                                icon={ArrowDownToLine}
                                                tone="success"
                                                title={t('credit.details.transactions.payment')}
                                                date={formatDateTime(
                                                    payment.date || payment.createdAt,
                                                    isEnglish,
                                                    jalaliMonthStyle
                                                )}
                                                amount={fmt(payment.amount)}
                                                currency={t('common.currency')}
                                                description={payment.description}
                                            />
                                        ))}
                                </div>
                            )}
                        </section>

                        {/* Payment action / settled */}
                        {remaining > 0 ? (
                            <section className="relative overflow-hidden rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4 sm:p-5">
                                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-500/10 bg-[var(--surface)]">
                                            <ArrowDownToLine className="h-5 w-5 text-amber-500" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-bold text-[var(--text)]">
                                                {t('credit.details.paymentAction.title')}
                                            </h3>
                                            <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                                                {t('credit.details.paymentAction.description')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onPayment?.(customer)}
                                        className="ui-button-primary w-full shrink-0 rounded-xl px-4 py-3 sm:w-auto"
                                    >
                                        <ReceiptText className="h-4 w-4" />
                                        {t('credit.details.paymentAction.button')}
                                    </button>
                                </div>
                            </section>
                        ) : (
                            <section className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/10 bg-[var(--surface)]">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-emerald-500">
                                            {t('credit.table.status.settled')}
                                        </h3>
                                        <p className="mt-1 text-xs leading-5 text-emerald-500/75">
                                            {t('credit.details.settledDescription')}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* ═══ Footer ═══ */}
                <div className="ui-modal-footer flex shrink-0 items-center justify-between gap-3 px-5 py-4 sm:px-6">
                    <div className="hidden items-center gap-2 text-xs text-[var(--text-muted)] sm:flex">
                        <CreditCard className="h-4 w-4" />
                        <span>{t('credit.details.footer.recorded')}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onClose?.()}
                        className="ui-button-secondary w-full rounded-xl px-5 py-3 sm:w-auto"
                    >
                        {t('credit.details.footer.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

// =========================================================
// Sub-components
// =========================================================

function SectionHeading({ icon: Icon, title, description }) {
    return (
        <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
                <Icon className="h-4 w-4 text-[var(--accent-500)]" />
            </div>
            <div className="min-w-0">
                <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
                {description && (
                    <p className="mt-0.5 text-xs text-[var(--text-muted)]">{description}</p>
                )}
            </div>
        </div>
    );
}

function InfoCard({ icon: Icon, label, value, dir, wide = false }) {
    return (
        <div
            className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 ${wide ? 'sm:col-span-2' : ''
                }`}
        >
            <div className="mb-2 flex items-center gap-2 text-[var(--text-muted)]">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <p dir={dir} className="truncate text-sm font-bold text-[var(--text)]">
                {value}
            </p>
        </div>
    );
}

const METRIC_TONES = {
    neutral: {
        wrapper: 'border-[var(--border)] bg-[var(--surface)]',
        iconBg: 'bg-[var(--surface-muted)]',
        icon: 'text-[var(--text-muted)]',
        value: 'text-[var(--text)]',
        suffix: 'text-[var(--text-muted)]',
    },
    success: {
        wrapper: 'border-emerald-500/15 bg-emerald-500/5',
        iconBg: 'bg-emerald-500/10',
        icon: 'text-emerald-500',
        value: 'text-emerald-500',
        suffix: 'text-emerald-500/70',
    },
    danger: {
        wrapper: 'border-rose-500/15 bg-rose-500/5',
        iconBg: 'bg-rose-500/10',
        icon: 'text-rose-500',
        value: 'text-rose-500',
        suffix: 'text-rose-500/70',
    },
};

function MetricCard({ tone = 'neutral', icon: Icon, label, value, suffix }) {
    const s = METRIC_TONES[tone];
    return (
        <div className={`rounded-2xl border p-4 ${s.wrapper}`}>
            <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-[var(--text-muted)]">{label}</p>
                <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${s.iconBg}`}
                >
                    <Icon className={`h-4 w-4 ${s.icon}`} />
                </div>
            </div>
            <p
                dir="ltr"
                className={`number-font text-lg font-extrabold tracking-tight ${s.value}`}
            >
                {value}
            </p>
            <p className={`mt-1 text-[11px] ${s.suffix}`}>{suffix}</p>
        </div>
    );
}

const TX_TONES = {
    neutral: {
        wrapper: 'border-[var(--border)] bg-[var(--surface)]',
        iconBg: 'bg-[var(--surface-muted)]',
        icon: 'text-[var(--text-muted)]',
        title: 'text-[var(--text-secondary)]',
        date: 'text-[var(--text-muted)]',
        amount: 'text-[var(--text)]',
        currency: 'text-[var(--text-muted)]',
    },
    amber: {
        wrapper: 'border-amber-500/15 bg-amber-500/5',
        iconBg: 'bg-amber-500/10',
        icon: 'text-amber-500',
        title: 'text-amber-500',
        date: 'text-[var(--text-muted)]',
        amount: 'text-amber-500',
        currency: 'text-amber-500/60',
    },
    success: {
        wrapper: 'border-emerald-500/15 bg-emerald-500/5',
        iconBg: 'bg-emerald-500/10',
        icon: 'text-emerald-500',
        title: 'text-emerald-500',
        date: 'text-emerald-500/65',
        amount: 'text-emerald-500',
        currency: 'text-emerald-500/60',
    },
};

function TransactionCard({
    icon: Icon,
    tone = 'neutral',
    title,
    date,
    amount,
    currency,
    description,
    meta,
}) {
    const s = TX_TONES[tone];
    return (
        <div className={`rounded-2xl border p-4 ${s.wrapper}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.iconBg}`}
                    >
                        <Icon className={`h-4 w-4 ${s.icon}`} />
                    </div>
                    <div className="min-w-0">
                        <p className={`truncate text-xs font-semibold ${s.title}`}>{title}</p>
                        <p className={`mt-1 text-[10px] ${s.date}`}>{date}</p>

                        {/* Multi-unit meta */}
                        {meta?.primary && (
                            <div className="mt-2 inline-flex flex-wrap items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                                    <Ruler size={10} className="text-[var(--text-muted)]" />
                                    {meta.primary}
                                </span>
                                {meta.secondary && (
                                    <span className="inline-flex items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">
                                        <Layers size={10} />
                                        {meta.secondary}
                                    </span>
                                )}
                            </div>
                        )}

                        {description && (
                            <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
                <div className="shrink-0 text-end">
                    <p dir="ltr" className={`number-font text-sm font-bold ${s.amount}`}>
                        {amount}
                    </p>
                    <p className={`mt-1 text-[9px] ${s.currency}`}>{currency}</p>
                </div>
            </div>
        </div>
    );
}

function EmptyHistory({ icon: Icon, text }) {
    return (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-8 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <Icon className="h-5 w-5 text-[var(--text-muted)]" />
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">{text}</p>
        </div>
    );
}

export default CreditDetails;