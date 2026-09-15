import { useEffect, useState } from 'react';
import {
    X, Package, Tag, Hash, DollarSign, User, Phone, CalendarDays,
    Banknote, CreditCard, FileText, Receipt, CheckCircle2, Clock3,
    Ruler, Layers, TrendingUp, TrendingDown, Warehouse,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatJalaliDate, getJalaliMonthStyle } from '../../utils/date/jalali';

const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

const getValidDate = (v) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
};

function SaleDetails({ sale, onClose }) {
    const { t, i18n } = useTranslation();
    const isEnglish = String(i18n.language || 'fa').toLowerCase().startsWith('en');

    const [jalaliMonthStyle, setJalaliMonthStyle] = useState(getJalaliMonthStyle);

    useEffect(() => {
        const onChange = (e) => setJalaliMonthStyle(e?.detail || getJalaliMonthStyle());
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

    if (!sale) return null;

    const isCash = sale.paymentType !== 'credit';

    const quantity = num(sale.quantity);
    const unitPrice = num(sale.unitPrice);
    const amount = sale.total != null ? num(sale.total) : quantity * unitPrice;

    const saleFactor = num(sale.saleFactor) || 1;
    const quantityInBase =
        num(sale.quantityInBase) || quantity * saleFactor;

    const saleUnit = sale.saleUnit || sale.baseUnit || '';
    const baseUnit = sale.baseUnit || '';
    const avgCostAtSale = num(sale.avgCostAtSale);

    const costForSaleUnit = avgCostAtSale * saleFactor;
    const profitPerUnit = unitPrice - costForSaleUnit;
    const totalProfit = profitPerUnit * quantity;
    const margin = unitPrice > 0 ? (profitPerUnit / unitPrice) * 100 : 0;

    const saleId = sale.id != null ? String(sale.id) : '-';
    const dateObj = getValidDate(sale.date || sale.createdAt);

    const saleDate = dateObj
        ? isEnglish
            ? new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).format(dateObj)
            : formatJalaliDate(dateObj, {
                monthStyle: jalaliMonthStyle,
                withMonthName: true,
            }) || '-'
        : '-';

    const saleTime = dateObj
        ? new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
        }).format(dateObj)
        : '-';

    const productName = sale.productName?.trim() || '-';
    const category = sale.category?.trim() || '-';
    const customerName = sale.customerName?.trim() || '-';
    const customerPhone = sale.customerPhone?.trim() || '';
    const note = sale.note?.trim() || '';

    const fmt = (v) =>
        new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(num(v));

    const onOverlay = (e) => {
        if (e.target === e.currentTarget) onClose?.();
    };

    const currency = t('common.currency');

    return (
        <div
            dir={isEnglish ? 'ltr' : 'rtl'}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/[0.24] dark:bg-black/[0.48] backdrop-blur-[18px] backdrop-saturate-[0.72] p-2 sm:p-4 animate-[profileBackdropIn_180ms_ease-out]"
            onMouseDown={onOverlay}
        >
            <div className="min-h-full flex items-start justify-center sm:items-center">
                <div className="ui-modal flex w-full max-w-2xl max-h-[calc(100dvh-1rem)] sm:max-h-[90vh] flex-col animate-[profileModalIn_180ms_ease-out]">
                    {/* Header */}
                    <div className="ui-modal-header flex shrink-0 items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] shadow-[var(--shadow-xs)] sm:h-10 sm:w-10">
                                <Receipt size={18} className="text-[var(--accent-500)]" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 items-center gap-2">
                                    <h2 className="min-w-0 truncate text-sm font-bold text-[var(--text)] sm:text-lg">
                                        {t('sales.details.title')}
                                    </h2>
                                    <span
                                        dir="ltr"
                                        className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2 py-1 font-mono text-[10px] text-[var(--text-muted)]"
                                    >
                                        #{saleId.padStart(4, '0')}
                                    </span>
                                </div>
                                <p className="mt-1 truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
                                    {t('sales.details.subtitle')}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            aria-label={t('common.closeMenu')}
                            className="ui-icon-button h-9 w-9 shrink-0"
                        >
                            <X size={19} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="main-scrollbar flex-1 min-h-0 space-y-4 overflow-y-auto overscroll-contain p-3 sm:space-y-6 sm:p-6">
                        {/* Product hero */}
                        <section className="relative overflow-hidden rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)] p-3 sm:p-5">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -top-16 -end-16 h-40 w-40 rounded-full bg-[var(--accent-soft-heavy)] blur-3xl"
                            />
                            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--surface)] shadow-[var(--shadow-xs)] sm:h-14 sm:w-14">
                                        <Package size={21} className="text-[var(--accent-500)]" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-bold text-[var(--text)] sm:text-lg">
                                            {productName}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Tag size={12} className="shrink-0 text-[var(--text-muted)]" />
                                            <span className="truncate text-xs text-[var(--text-secondary)]">
                                                {category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="shrink-0 text-start">
                                    <p className="text-[10px] text-[var(--text-muted)] sm:text-[11px]">
                                        {t('sales.details.totalAmount')}
                                    </p>
                                    <p
                                        dir="ltr"
                                        className="number-font mt-1 text-lg font-bold text-[var(--accent-500)] sm:text-2xl"
                                    >
                                        {fmt(amount)}
                                        <span className="ms-1 text-xs font-normal text-[var(--text-muted)] sm:text-sm">
                                            {currency}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Payment */}
                        <section>
                            <SectionTitle icon={DollarSign} title={t('sales.details.paymentStatus.title')} />
                            <div
                                className={`flex flex-col gap-4 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 ${isCash
                                    ? 'border-cyan-500/15 bg-cyan-500/5'
                                    : 'border-amber-500/15 bg-amber-500/5'
                                    }`}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isCash ? 'bg-cyan-500/10' : 'bg-amber-500/10'
                                            }`}
                                    >
                                        {isCash ? (
                                            <Banknote size={19} className="text-cyan-500" />
                                        ) : (
                                            <CreditCard size={19} className="text-amber-500" />
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-[var(--text)]">
                                            {isCash
                                                ? t('sales.details.paymentStatus.cashTitle')
                                                : t('sales.details.paymentStatus.creditTitle')}
                                        </p>
                                        <p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">
                                            {isCash
                                                ? t('sales.details.paymentStatus.cashDescription')
                                                : t('sales.details.paymentStatus.creditDescription')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-1.5 self-start sm:self-auto">
                                    {isCash ? (
                                        <CheckCircle2 size={16} className="text-cyan-500" />
                                    ) : (
                                        <Clock3 size={16} className="text-amber-500" />
                                    )}
                                    <span
                                        className={`text-xs font-medium ${isCash ? 'text-cyan-500' : 'text-amber-500'
                                            }`}
                                    >
                                        {isCash
                                            ? t('sales.details.paymentStatus.settled')
                                            : t('sales.details.paymentStatus.unpaid')}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Sale Info */}
                        <section>
                            <SectionTitle icon={Receipt} title={t('sales.details.saleInformation.title')} />
                            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-4">
                                <InfoItem
                                    icon={Hash}
                                    label={t('sales.details.saleInformation.quantity')}
                                    value={`${fmt(quantity)} ${saleUnit}`}
                                />
                                <InfoItem
                                    icon={DollarSign}
                                    label={t('sales.details.saleInformation.unitPrice')}
                                    value={`${fmt(unitPrice)} ${currency}`}
                                />
                                <InfoItem
                                    icon={CalendarDays}
                                    label={t('sales.details.saleInformation.date')}
                                    value={saleDate}
                                />
                                <InfoItem
                                    icon={Clock3}
                                    label={t('sales.details.saleInformation.time')}
                                    value={saleTime}
                                />
                            </div>
                        </section>

                        {/* Unit conversion breakdown (only when factor != 1) */}
                        {saleFactor !== 1 && baseUnit && (
                            <section>
                                <SectionTitle
                                    icon={Ruler}
                                    title={isEnglish ? 'Unit Breakdown' : 'تفکیک واحد'}
                                />
                                <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
                                    <InfoItem
                                        icon={Layers}
                                        label={isEnglish ? 'Conversion factor' : 'ضریب تبدیل'}
                                        value={`1 ${saleUnit} = ${fmt(saleFactor)} ${baseUnit}`}
                                    />
                                    <InfoItem
                                        icon={Warehouse}
                                        label={
                                            isEnglish
                                                ? 'Deducted from stock'
                                                : 'کسر شده از موجودی'
                                        }
                                        value={`${fmt(quantityInBase)} ${baseUnit}`}
                                    />
                                </div>
                            </section>
                        )}

                        {/* Profit snapshot */}
                        {avgCostAtSale > 0 && unitPrice > 0 && (
                            <section>
                                <SectionTitle
                                    icon={profitPerUnit >= 0 ? TrendingUp : TrendingDown}
                                    title={isEnglish ? 'Profit' : 'سود و زیان'}
                                />
                                <div
                                    className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4 ${profitPerUnit >= 0
                                        ? 'border-emerald-500/15 bg-emerald-500/5'
                                        : 'border-rose-500/15 bg-rose-500/5'
                                        }`}
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${profitPerUnit >= 0
                                                ? 'bg-emerald-500/10'
                                                : 'bg-rose-500/10'
                                                }`}
                                        >
                                            {profitPerUnit >= 0 ? (
                                                <TrendingUp size={19} className="text-emerald-500" />
                                            ) : (
                                                <TrendingDown size={19} className="text-rose-500" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p
                                                className={`truncate text-sm font-medium ${profitPerUnit >= 0
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-rose-500 dark:text-rose-400'
                                                    }`}
                                            >
                                                {profitPerUnit >= 0
                                                    ? isEnglish
                                                        ? 'Profitable sale'
                                                        : 'فروش سودآور'
                                                    : isEnglish
                                                        ? 'Loss-making sale'
                                                        : 'فروش با ضرر'}
                                            </p>
                                            <p className="mt-1 text-[11px] leading-5 text-[var(--text-secondary)]">
                                                {isEnglish
                                                    ? `Cost per unit: ${fmt(costForSaleUnit)} ${currency} • Margin: ${margin.toFixed(1)}%`
                                                    : `هزینه هر واحد: ${fmt(costForSaleUnit)} ${currency} • حاشیه: ${margin.toFixed(1)}٪`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-start sm:text-end">
                                        <p
                                            dir="ltr"
                                            className={`number-font text-lg font-bold sm:text-xl ${profitPerUnit >= 0
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-rose-500 dark:text-rose-400'
                                                }`}
                                        >
                                            {totalProfit >= 0 ? '+' : ''}
                                            {fmt(totalProfit)}
                                            <span className="ms-1 text-xs font-normal text-[var(--text-muted)]">
                                                {currency}
                                            </span>
                                        </p>
                                        <p className="mt-1 text-[10px] text-[var(--text-muted)]">
                                            {isEnglish ? 'Total profit' : 'سود کل'}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Customer */}
                        <section>
                            <SectionTitle icon={User} title={t('sales.details.customer.title')} />
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <CustomerItem
                                        icon={User}
                                        label={t('sales.details.customer.name')}
                                        value={customerName}
                                    />
                                    <CustomerItem
                                        icon={Phone}
                                        label={t('sales.details.customer.phone')}
                                        value={customerPhone || '-'}
                                        dir="ltr"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Note */}
                        <section>
                            <SectionTitle icon={FileText} title={t('sales.details.note.title')} />
                            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                                <p className="break-words text-xs leading-6 text-[var(--text-secondary)]">
                                    {note || t('sales.details.note.empty')}
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <div className="ui-modal-footer flex shrink-0 flex-col-reverse gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.08)]" />
                            <span className="text-[11px] text-[var(--text-muted)]">
                                {t('sales.details.footer.recorded')}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => onClose?.()}
                            className="ui-button-secondary h-10 w-full rounded-xl px-5 sm:w-auto"
                        >
                            {t('sales.details.footer.close')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =========================================================
// Sub-components
// =========================================================

function SectionTitle({ icon: Icon, title }) {
    return (
        <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-muted)]">
                <Icon size={14} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }) {
    return (
        <div className="min-w-0 bg-[var(--surface)] p-3 sm:p-4">
            <div className="flex items-center gap-2">
                <Icon size={14} className="shrink-0 text-[var(--text-muted)]" />
                <span className="min-w-0 truncate text-[10px] text-[var(--text-muted)] sm:text-[11px]">
                    {label}
                </span>
            </div>
            <p
                dir="auto"
                className="mt-2 truncate text-xs font-semibold text-[var(--text)] sm:text-sm"
            >
                {value}
            </p>
        </div>
    );
}

function CustomerItem({ icon: Icon, label, value, dir }) {
    return (
        <div className="flex min-w-0 items-start gap-3">
            <Icon size={15} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
            <div className="min-w-0">
                <p className="text-[11px] text-[var(--text-muted)]">{label}</p>
                <p dir={dir} className="mt-1 truncate text-sm text-[var(--text-secondary)]">
                    {value}
                </p>
            </div>
        </div>
    );
}

export default SaleDetails;