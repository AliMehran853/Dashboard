import { useEffect, useState } from 'react';
import { Eye, User, Phone, Wallet, Trash2, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { formatJalaliDate, getJalaliMonthStyle } from '../../utils/date/jalali';

const fmtNum = (v) => new Intl.NumberFormat('en-US').format(Number(v) || 0);

const formatDate = (date, isEnglish, jalaliMonthStyle) => {
    if (!date) return '-';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '-';
    if (isEnglish) return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    return formatJalaliDate(d, { monthStyle: jalaliMonthStyle, withMonthName: true }) || '-';
};

const getStatus = (credit) => {
    const remaining = Number(credit?.remaining) || 0;
    const paid = Number(credit?.paid) || 0;
    if (remaining <= 0) return 'settled';
    if (paid > 0) return 'partial';
    return 'debt';
};

const getCustomerName = (credit) => credit?.customerName || credit?.name || '-';

const getCreditProducts = (credit) => {
    if (!credit || typeof credit !== 'object') return [];
    const names = []; const seen = new Set();
    const push = (v) => {
        if (typeof v !== 'string') return;
        const t = v.trim(); if (!t) return;
        const k = t.toLowerCase(); if (seen.has(k)) return;
        seen.add(k); names.push(t);
    };
    [credit.items, credit.sales, credit.creditSales, credit.products].forEach((arr) => {
        if (!Array.isArray(arr)) return;
        arr.forEach((item) => {
            if (typeof item === 'string') { push(item); return; }
            if (item && typeof item === 'object') { push(item.product); push(item.productName); push(item.name); }
        });
    });
    push(credit.product); push(credit.productName); push(credit.lastProduct);
    return names;
};

const getPaymentsCount = (credit) => {
    if (!credit || typeof credit !== 'object') return 0;
    for (const arr of [credit.payments, credit.paymentHistory, credit.transactions]) {
        if (Array.isArray(arr)) return arr.length;
    }
    return 0;
};

const STATUS_BADGES = {
    settled: 'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400',
    partial: 'inline-flex items-center gap-1.5 rounded-full border border-orange-500/15 bg-orange-500/10 px-2.5 py-1 text-[10px] font-semibold text-orange-600 dark:text-orange-400',
    debt: 'inline-flex items-center gap-1.5 rounded-full border border-amber-500/15 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400',
};
const STATUS_DOTS = { settled: 'bg-emerald-500', partial: 'bg-orange-500', debt: 'bg-amber-500' };

function CreditTable({ credits = [], loading = false, onViewDetails, onPayment, onDelete }) {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';

    const [jalaliMonthStyle, setJalaliMonthStyle] = useState(getJalaliMonthStyle);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const onChange = (e) => setJalaliMonthStyle(e?.detail || getJalaliMonthStyle());
        const onStorage = (e) => { if (e.key === 'jalaliMonthStyle') setJalaliMonthStyle(getJalaliMonthStyle()); };
        window.addEventListener('jalali-month-style-changed', onChange);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('jalali-month-style-changed', onChange);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    const handleDetails = (c) => c && onViewDetails?.(c);
    const handlePayment = (c) => { if (!c || (Number(c.remaining) || 0) <= 0) return; onPayment?.(c); };
    const handleDelete = (c) => { if (!c || (Number(c.remaining) || 0) > 0) return; onDelete?.(c); };

    const statusLabel = (c) => {
        const s = getStatus(c);
        if (s === 'settled') return t('credit.table.status.settled', { defaultValue: isEnglish ? 'Settled' : 'تسویه‌شده' });
        if (s === 'partial') return t('credit.table.status.partial', { defaultValue: isEnglish ? 'Partial Payment' : 'پرداخت جزئی' });
        return t('credit.table.status.debt', { defaultValue: isEnglish ? 'Debt' : 'بدهکار' });
    };

    const renderStatus = (c) => {
        const s = getStatus(c);
        return (
            <span className={STATUS_BADGES[s]}>
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOTS[s]}`} />
                {statusLabel(c)}
            </span>
        );
    };

    const renderProductChips = (c, max = 2) => {
        const products = getCreditProducts(c);
        if (products.length === 0) return null;
        const visible = products.slice(0, max);
        const extra = products.length - visible.length;
        return (
            <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1">
                {visible.map((name) => (
                    <span key={name} title={name} className="inline-flex max-w-[9rem] min-w-0 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-[9px] leading-4 text-[var(--text-secondary)]">
                        <Package size={9} className="shrink-0 text-[var(--text-muted)]" />
                        <span className="truncate">{name}</span>
                    </span>
                ))}
                {extra > 0 && (
                    <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-1.5 py-0.5 text-[9px] leading-4 text-[var(--text-muted)]">+{extra}</span>
                )}
            </div>
        );
    };

    const renderPaymentsHint = (c) => {
        const count = getPaymentsCount(c);
        if (count <= 0) return null;
        return (
            <p className="mt-0.5 text-[9px] text-[var(--text-muted)]">
                {fmtNum(count)}{' '}
                {t('credit.table.paymentsCount', { defaultValue: isEnglish ? 'payments' : 'پرداخت' })}
            </p>
        );
    };

    const actionBtn = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition-all duration-200 hover:-translate-y-0.5';

    return (
        <section className="ui-card overflow-hidden p-0">
            {/* header */}
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3.5 sm:px-5">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="h-4 w-1 rounded-full bg-amber-500" />
                        <h2 className="text-sm font-semibold tracking-tight text-[var(--text)]">
                            {t('credit.table.title', { defaultValue: isEnglish ? 'Customer Accounts' : 'حساب‌های مشتریان' })}
                        </h2>
                    </div>
                    <p className="mt-1 truncate text-[10px] text-[var(--text-muted)] sm:text-[11px]">
                        {t('credit.table.description', { defaultValue: isEnglish ? 'Customer credit account records' : 'سوابق حساب‌های نسیه مشتریان' })}
                    </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-2.5 py-1.5 text-[10px] font-medium text-[var(--text-muted)]">
                    <span dir="ltr" className="number-font font-semibold text-[var(--text)]">{fmtNum(credits.length)}</span>
                    <span>{t('credit.table.accountsCount', { defaultValue: isEnglish ? 'accounts' : 'حساب' })}</span>
                </span>
            </div>

            {/* loading */}
            {loading && (
                <div className="grid gap-3 p-4 sm:p-5">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]" />
                    ))}
                </div>
            )}

            {/* empty */}
            {!loading && credits.length === 0 && (
                <div className="flex flex-col items-center justify-center px-4 py-14 text-center sm:py-16">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                        <User size={20} className="text-[var(--text-muted)]" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">
                        {t('credit.table.empty.title', { defaultValue: isEnglish ? 'No accounts found' : 'حسابی پیدا نشد' })}
                    </p>
                    <p className="mt-1 max-w-sm text-[10px] leading-5 text-[var(--text-muted)]">
                        {t('credit.table.empty.description', { defaultValue: isEnglish ? 'No customer accounts match the selected criteria.' : 'هیچ حسابی با معیارهای انتخاب‌شده مطابقت ندارد.' })}
                    </p>
                </div>
            )}

            {!loading && credits.length > 0 && (
                <>
                    {/* desktop */}
                    <div className="hidden overflow-x-auto md:block">
                        <table className="w-full min-w-[960px] border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
                                    {[
                                        t('credit.table.columns.customer', { defaultValue: isEnglish ? 'Customer' : 'مشتری' }),
                                        t('credit.table.columns.totalDebt', { defaultValue: isEnglish ? 'Total Debt' : 'کل بدهی' }),
                                        t('credit.table.columns.paid', { defaultValue: isEnglish ? 'Paid' : 'پرداخت‌شده' }),
                                        t('credit.table.columns.remaining', { defaultValue: isEnglish ? 'Remaining' : 'باقی‌مانده' }),
                                        t('credit.table.columns.lastTransaction', { defaultValue: isEnglish ? 'Last Transaction' : 'آخرین تراکنش' }),
                                        t('credit.table.columns.status', { defaultValue: isEnglish ? 'Status' : 'وضعیت' }),
                                        t('credit.table.columns.actions', { defaultValue: isEnglish ? 'Actions' : 'عملیات' }),
                                    ].map((label, i) => (
                                        <th key={i} className={`px-4 py-3 text-[10px] font-semibold text-[var(--text-muted)] ${i === 0 ? 'px-5 text-start' : i >= 5 ? 'text-center' : 'text-start'}`}>
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {credits.map((credit) => {
                                    const customerName = getCustomerName(credit);
                                    const remaining = Number(credit.remaining) || 0;
                                    const isSettled = remaining <= 0;
                                    return (
                                        <tr key={credit.id} className="border-b border-[var(--border)] transition-colors last:border-b-0 hover:bg-[var(--surface-muted)]">
                                            <td className="px-5 py-3.5 align-top">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/10 bg-amber-500/10">
                                                        <User size={16} className="text-amber-500 dark:text-amber-400" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="truncate text-xs font-semibold text-[var(--text)]">{customerName}</p>
                                                        <div className="mt-1 flex items-center gap-1.5">
                                                            <Phone size={10} className="text-[var(--text-muted)]" />
                                                            <span dir="ltr" className="truncate text-[10px] text-[var(--text-muted)]">{credit.phone || '-'}</span>
                                                        </div>
                                                        {renderProductChips(credit, 2)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5 align-top">
                                                <span dir="ltr" className="number-font text-xs font-medium text-[var(--text-secondary)]">{fmtNum(credit.totalDebt)}</span>
                                                <span className="ms-1 text-[9px] text-[var(--text-muted)]">{t('common.currency', { defaultValue: 'افغانی' })}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5 align-top">
                                                <span dir="ltr" className="number-font text-xs font-medium text-emerald-600 dark:text-emerald-400">{fmtNum(credit.paid)}</span>
                                                <span className="ms-1 text-[9px] text-[var(--text-muted)]">{t('common.currency', { defaultValue: 'افغانی' })}</span>
                                                {renderPaymentsHint(credit)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5 align-top">
                                                <span dir="ltr" className={`number-font text-xs font-bold ${remaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                    {fmtNum(remaining)}
                                                </span>
                                                <span className="ms-1 text-[9px] text-[var(--text-muted)]">{t('common.currency', { defaultValue: 'افغانی' })}</span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5 align-top">
                                                <span className="text-[10px] text-[var(--text-secondary)]">
                                                    {formatDate(credit.lastTransaction, isEnglish, jalaliMonthStyle)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center align-top">{renderStatus(credit)}</td>
                                            <td className="px-4 py-3.5 align-top">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button type="button" onClick={() => handleDetails(credit)} aria-label={t('credit.table.actions.viewDetails', { defaultValue: isEnglish ? 'View Details' : 'مشاهده جزئیات' })} className={`${actionBtn} hover:border-amber-500/20 hover:bg-amber-500/5 hover:text-amber-500 dark:hover:text-amber-400`}>
                                                        <Eye size={14} />
                                                    </button>
                                                    {remaining > 0 && (
                                                        <button type="button" onClick={() => handlePayment(credit)} aria-label={t('credit.table.actions.payment', { defaultValue: isEnglish ? 'Record Payment' : 'ثبت پرداخت' })} className={`${actionBtn} hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-500 dark:hover:text-emerald-400`}>
                                                            <Wallet size={14} />
                                                        </button>
                                                    )}
                                                    {isSettled && (
                                                        <button type="button" onClick={() => handleDelete(credit)} aria-label={t('credit.table.actions.delete', { defaultValue: isEnglish ? 'Delete Account' : 'حذف حساب' })} className={`${actionBtn} border-rose-500/10 text-rose-500 hover:border-rose-500/25 hover:bg-rose-500/5 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300`}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* mobile */}
                    <div className="divide-y divide-[var(--border)] md:hidden">
                        {credits.map((credit) => {
                            const customerName = getCustomerName(credit);
                            const remaining = Number(credit.remaining) || 0;
                            const isSettled = remaining <= 0;
                            return (
                                <article key={credit.id} className="p-4 transition-colors hover:bg-[var(--surface-muted)]">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/10 bg-amber-500/10">
                                                <User size={17} className="text-amber-500 dark:text-amber-400" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-[var(--text)]">{customerName}</p>
                                                <p dir="ltr" className="mt-1 truncate text-[10px] text-[var(--text-muted)]">{credit.phone || '-'}</p>
                                                {renderProductChips(credit, 3)}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1.5">
                                            <button type="button" onClick={() => handleDetails(credit)} aria-label={t('credit.table.actions.viewDetails', { defaultValue: isEnglish ? 'View Details' : 'مشاهده جزئیات' })} className={`${actionBtn} hover:border-amber-500/20 hover:bg-amber-500/5 hover:text-amber-500 dark:hover:text-amber-400`}>
                                                <Eye size={14} />
                                            </button>
                                            {remaining > 0 && (
                                                <button type="button" onClick={() => handlePayment(credit)} aria-label={t('credit.table.actions.payment', { defaultValue: isEnglish ? 'Record Payment' : 'ثبت پرداخت' })} className={`${actionBtn} hover:border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-500 dark:hover:text-emerald-400`}>
                                                    <Wallet size={14} />
                                                </button>
                                            )}
                                            {isSettled && (
                                                <button type="button" onClick={() => handleDelete(credit)} aria-label={t('credit.table.actions.delete', { defaultValue: isEnglish ? 'Delete Account' : 'حذف حساب' })} className={`${actionBtn} border-rose-500/10 text-rose-500 hover:border-rose-500/25 hover:bg-rose-500/5 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300`}>
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3">
                                        <div>{renderStatus(credit)}</div>
                                        <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 px-3 py-2 text-end">
                                            <p className="text-[9px] text-[var(--text-muted)]">
                                                {t('credit.table.columns.remaining', { defaultValue: isEnglish ? 'Remaining' : 'باقی‌مانده' })}
                                            </p>
                                            <p dir="ltr" className={`number-font mt-0.5 text-sm font-bold ${remaining > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                                {fmtNum(remaining)}{' '}
                                                <span className="text-[9px] font-medium text-[var(--text-muted)]">
                                                    {t('common.currency', { defaultValue: 'افغانی' })}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
                                            <p className="text-[9px] text-[var(--text-muted)]">
                                                {t('credit.table.columns.totalDebt', { defaultValue: isEnglish ? 'Total Debt' : 'کل بدهی' })}
                                            </p>
                                            <p dir="ltr" className="number-font mt-1 text-xs font-semibold text-[var(--text)]">{fmtNum(credit.totalDebt)}</p>
                                        </div>
                                        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-3">
                                            <p className="text-[9px] text-[var(--text-muted)]">
                                                {t('credit.table.columns.paid', { defaultValue: isEnglish ? 'Paid' : 'پرداخت‌شده' })}
                                            </p>
                                            <p dir="ltr" className="number-font mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{fmtNum(credit.paid)}</p>
                                            {renderPaymentsHint(credit)}
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--border)] pt-3">
                                        <span className="text-[9px] text-[var(--text-muted)]">
                                            {t('credit.table.columns.lastTransaction', { defaultValue: isEnglish ? 'Last Transaction' : 'آخرین تراکنش' })}
                                        </span>
                                        <span className="text-[10px] font-medium text-[var(--text-secondary)]">
                                            {formatDate(credit.lastTransaction, isEnglish, jalaliMonthStyle)}
                                        </span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </>
            )}
        </section>
    );
}

export default CreditTable;