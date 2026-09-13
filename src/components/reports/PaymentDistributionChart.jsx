import { useEffect, useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import Chart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const formatNumber = (value, language) => {
    const num = Number(toEnglishNumbers(value)) || 0;
    const isEnglish = String(language || '').toLowerCase().startsWith('en');
    return new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR').format(num);
};

function PaymentDistributionChart({ data = [] }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');
    const direction = isEnglish ? 'ltr' : 'rtl';

    const [isDark, setIsDark] = useState(() =>
        typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    );

    useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        const root = document.documentElement;
        const update = () => setIsDark(root.classList.contains('dark'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    const getPaymentName = (name) => {
        const value = String(name ?? '').trim().toLowerCase();
        if (['cash', 'نقدی', 'cash sales', 'فروش نقدی'].includes(value)) {
            return t('reports.charts.paymentDistribution.cash', { defaultValue: isEnglish ? 'Cash' : 'نقدی' });
        }
        if (['credit', 'نسیه', 'credit sales', 'فروش نسیه'].includes(value)) {
            return t('reports.charts.paymentDistribution.credit', { defaultValue: isEnglish ? 'Credit' : 'نسیه' });
        }
        if (!value) {
            return t('reports.charts.paymentDistribution.unknown', { defaultValue: isEnglish ? 'Unknown' : 'نامشخص' });
        }
        return String(name);
    };

    const chartData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
                name: getPaymentName(item.name),
                value: Number(toEnglishNumbers(item.value)) || 0,
            }));
    }, [data, t, isEnglish]);

    const labels = useMemo(() => chartData.map((i) => i.name), [chartData]);
    const values = useMemo(() => chartData.map((i) => i.value), [chartData]);
    const total = useMemo(() => values.reduce((sum, v) => sum + Number(v || 0), 0), [values]);

    const theme = useMemo(
        () => ({
            text: isDark ? '#94a3b8' : '#64748b',
            title: isDark ? '#f8fafc' : '#0f172a',
            muted: isDark ? '#64748b' : '#94a3b8',
            stroke: isDark ? '#111827' : '#ffffff',
            tooltip: isDark ? 'dark' : 'light',
        }),
        [isDark]
    );

    const options = useMemo(
        () => ({
            chart: {
                type: 'donut',
                background: 'transparent',
                toolbar: { show: false },
                fontFamily: isEnglish ? 'Space Grotesk, sans-serif' : 'Vazirmatn, sans-serif',
                animations: { enabled: false },
                redrawOnWindowResize: true,
                redrawOnParentResize: true,
                zoom: { enabled: false },
            },
            labels,
            colors: ['#10b981', '#f59e0b', '#38bdf8', '#8b5cf6'],
            stroke: { width: 2, colors: [theme.stroke] },
            dataLabels: { enabled: false },
            legend: {
                show: true,
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '11px',
                fontFamily: isEnglish ? 'Space Grotesk, sans-serif' : 'Vazirmatn, sans-serif',
                fontWeight: 500,
                labels: { colors: theme.text },
                markers: { size: 4, offsetX: isEnglish ? -3 : 3 },
                itemMargin: { horizontal: isEnglish ? 8 : 10, vertical: 5 },
            },
            plotOptions: {
                pie: {
                    expandOnClick: true,
                    donut: {
                        size: '68%',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                color: theme.text,
                                fontSize: '11px',
                                fontWeight: 500,
                                fontFamily: isEnglish ? 'Space Grotesk, sans-serif' : 'Vazirmatn, sans-serif',
                                offsetY: -3,
                            },
                            value: {
                                show: true,
                                color: theme.title,
                                fontSize: '18px',
                                fontWeight: 700,
                                fontFamily: isEnglish ? 'Space Grotesk, sans-serif' : 'Vazirmatn, sans-serif',
                                offsetY: 5,
                                formatter: (value) => formatNumber(value, language),
                            },
                            total: {
                                show: true,
                                showAlways: true,
                                label: t('reports.charts.paymentDistribution.total', { defaultValue: isEnglish ? 'Total' : 'مجموع' }),
                                color: theme.muted,
                                fontSize: '11px',
                                fontWeight: 500,
                                fontFamily: isEnglish ? 'Space Grotesk, sans-serif' : 'Vazirmatn, sans-serif',
                                formatter: () => formatNumber(total, language),
                            },
                        },
                    },
                },
            },
            tooltip: {
                enabled: true,
                theme: theme.tooltip,
                y: {
                    formatter: (value) => `${formatNumber(value, language)} ${isEnglish ? 'AF' : 'افغانی'}`,
                },
            },
        }),
        [labels, theme, total, t, language, isEnglish]
    );

    if (chartData.length === 0 || total <= 0) {
        return (
            <div dir={direction} className="ui-card overflow-hidden p-0">
                <ChartHeader t={t} isEnglish={isEnglish} />
                <div className="flex h-[320px] items-center justify-center px-5 text-center text-xs text-[var(--text-muted)]">
                    {t('reports.empty', { defaultValue: isEnglish ? 'No report data available.' : 'داده‌ای برای نمایش گزارش وجود ندارد.' })}
                </div>
            </div>
        );
    }

    return (
        <div dir={direction} className="ui-card overflow-hidden p-0">
            <ChartHeader t={t} isEnglish={isEnglish} />
            <div className="w-full min-w-0 overflow-hidden px-1 py-4 sm:px-3">
                <Chart
                    key={`payment-${isDark ? 'dark' : 'light'}-${language}`}
                    options={options}
                    series={values}
                    type="donut"
                    height={320}
                />
            </div>
        </div>
    );
}

function ChartHeader({ t, isEnglish }) {
    return (
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/10 bg-sky-500/10">
                <CreditCard size={17} className="text-sky-500 dark:text-sky-400" />
            </div>
            <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {t('reports.charts.paymentDistribution.title', { defaultValue: isEnglish ? 'Payment Distribution' : 'توزیع روش پرداخت' })}
                </h2>
                <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">
                    {t('reports.charts.paymentDistribution.description', {
                        defaultValue: isEnglish ? 'Compare cash and credit sales' : 'مقایسه فروش نقدی و نسیه',
                    })}
                </p>
            </div>
        </div>
    );
}

export default PaymentDistributionChart;