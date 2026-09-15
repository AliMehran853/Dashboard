import { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { Banknote, CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getSaleAmount = (sale) => {
    if (!sale) return 0;
    const direct = Number(sale.totalAmount ?? sale.total ?? sale.amount ?? sale.finalAmount ?? sale.payableAmount ?? sale.grandTotal);
    if (Number.isFinite(direct)) return Math.max(0, direct);
    if (!Array.isArray(sale.items)) return 0;
    return sale.items.reduce((total, item) => {
        const q = Number(item.quantity ?? 0);
        const p = Number(item.sellPrice ?? item.price ?? item.unitPrice ?? 0);
        if (!Number.isFinite(q) || !Number.isFinite(p)) return total;
        return total + Math.max(0, q) * Math.max(0, p);
    }, 0);
};

const getSaleDate = (sale) => sale?.date ?? sale?.createdAt ?? sale?.updatedAt ?? null;

const isToday = (value) => {
    if (!value) return false;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear()
        && d.getMonth() === now.getMonth()
        && d.getDate() === now.getDate();
};

const getCssVar = (name, fallback) => {
    if (typeof document === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

const isCash = (sale) => sale?.paymentType === 'cash' || sale?.paymentType === 'نقدی';
const isCredit = (sale) => sale?.paymentType === 'credit' || sale?.paymentType === 'نسیه';

function PaymentChart({ sales = [], loading = false }) {
    const { t, i18n } = useTranslation();

    const [isDark, setIsDark] = useState(() =>
        typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        const update = () => setIsDark(document.documentElement.classList.contains('dark'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const paymentData = useMemo(() => {
        const today = Array.isArray(sales) ? sales.filter((s) => isToday(getSaleDate(s))) : [];
        const sum = (predicate) => today.filter(predicate).reduce((acc, s) => acc + getSaleAmount(s), 0);
        const cash = Math.max(0, sum(isCash));
        const credit = Math.max(0, sum(isCredit));
        return { cash, credit, total: Math.max(0, cash + credit) };
    }, [sales]);

    const { cash: cashSales, credit: creditSales, total: totalSales } = paymentData;

    const formatNumber = (v) => Number(v || 0).toLocaleString(i18n.language === 'en' ? 'en-US' : 'fa-IR');

    const tokens = useMemo(() => ({
        accent: getCssVar('--accent-500', '#10b981'),
        secondary: getCssVar('--chart-secondary', '#d97706'),
        text: getCssVar('--text-muted', '#64748b'),
        value: getCssVar('--text', '#0f172a'),
    }), [isDark]);

    const options = useMemo(() => ({
        chart: {
            type: 'donut', background: 'transparent', fontFamily: 'inherit',
            foreColor: tokens.text, parentHeightOffset: 0,
            animations: { enabled: false }, redrawOnWindowResize: true, redrawOnParentResize: true,
            toolbar: { show: false },
            zoom: { enabled: false },
            selection: { enabled: false },
            brush: { enabled: false },
        },
        labels: [t('dashboard.paymentChart.cash'), t('dashboard.paymentChart.credit')],
        colors: [tokens.accent, tokens.secondary],
        stroke: { width: 2, colors: ['transparent'] },
        dataLabels: { enabled: false },
        legend: { show: false },
        tooltip: {
            enabled: true,
            theme: isDark ? 'dark' : 'light',
            shared: false,           /* ✅ FIX: صریحاً false */
            intersect: true,
            followCursor: false,
            fixed: { enabled: false },
            y: { formatter: (value) => `${formatNumber(value)} ${t('common.currency')}` },
        },
        plotOptions: {
            pie: {
                expandOnClick: true,
                donut: {
                    size: '72%',
                    labels: {
                        show: true,
                        name: { show: true, color: tokens.text, fontSize: '11px', fontWeight: 500, offsetY: -2 },
                        value: {
                            show: true, color: tokens.value, fontSize: '19px', fontWeight: 500, offsetY: 3,
                            formatter: (v) => `${formatNumber(v)} ${t('common.currency')}`,
                        },
                        total: {
                            show: true,
                            label: t('dashboard.paymentChart.total'),
                            color: tokens.text, fontSize: '11px',
                            formatter: () => `${formatNumber(totalSales)} ${t('common.currency')}`,
                        },
                    },
                },
            },
        },
        states: {
            hover: { filter: { type: 'none' } },
            active: { filter: { type: 'none' } },
        },
        responsive: [
            { breakpoint: 768, options: { plotOptions: { pie: { donut: { size: '70%' }, expandOnClick: false } } } },
            { breakpoint: 480, options: { chart: { height: 220 }, plotOptions: { pie: { donut: { size: '66%' }, expandOnClick: false } } } },
        ],
    }), [tokens, isDark, t, totalSales]);

    const SummaryCard = ({ icon: Icon, title, value, tone }) => {
        const isAccent = tone === 'accent';
        const iconStyle = isAccent
            ? undefined
            : {
                borderColor: 'rgb(var(--chart-secondary-rgb) / 0.2)',
                backgroundColor: 'rgb(var(--chart-secondary-rgb) / 0.1)',
                color: 'var(--chart-secondary)',
            };

        return (
            <div className="min-w-0 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] p-3 transition-all duration-200 hover:border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                    <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                            isAccent
                                ? 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-500)]'
                                : ''
                        }`}
                        style={iconStyle}
                    >
                        <Icon size={16} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-[11px] text-[var(--text-muted)]">{title}</p>
                        <p className="mt-0.5 truncate text-sm font-medium text-[var(--text)]">
                            {formatNumber(value)}{' '}
                            <span className="text-[9px] font-normal text-[var(--text-soft)]">
                                {t('common.currency')}
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section dir={i18n.dir()} className="ui-card h-full min-w-0 overflow-hidden p-4 sm:p-5">
            <div className="mb-4">
                <h2 className="text-base font-semibold tracking-[-0.01em] text-[var(--text)] sm:text-lg">
                    {t('dashboard.paymentChart.title')}
                </h2>
                <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
                    {t('dashboard.paymentChart.description')}
                </p>
            </div>

            <div className="flex min-w-0 items-center justify-center h-[220px] sm:h-[245px]">
                {loading ? (
                    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-xs text-[var(--text-muted)]">
                        {t('dashboard.paymentChart.loading')}
                    </div>
                ) : totalSales <= 0 ? (
                    <div className="max-w-[15rem] rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-center text-xs leading-5 text-[var(--text-muted)]">
                        {t('dashboard.paymentChart.empty')}
                    </div>
                ) : (
                    <div className="h-full w-full min-w-0">
                        <Chart
                            key={`${i18n.language}-${isDark}-${cashSales}-${creditSales}-${totalSales}`}
                            options={options}
                            series={[cashSales, creditSales]}
                            type="donut"
                            width="100%"
                            height="100%"
                        />
                    </div>
                )}
            </div>

            <div className="mt-3 grid grid-cols-1 min-[380px]:grid-cols-2 gap-2 sm:gap-3">
                <SummaryCard icon={Banknote} title={t('dashboard.paymentChart.cash')} value={cashSales} tone="accent" />
                <SummaryCard icon={CreditCard} title={t('dashboard.paymentChart.credit')} value={creditSales} tone="secondary" />
            </div>
        </section>
    );
}

export default PaymentChart;