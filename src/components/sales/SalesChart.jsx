import { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { TrendingUp, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getSales } from '../../services/salesService';

// ---------- helpers ----------
const getSaleDate = (sale) => sale?.date || sale?.createdAt || null;
const getSaleTotal = (sale) => {
    if (sale?.total != null) { const n = Number(sale.total); if (Number.isFinite(n)) return n; }
    if (sale?.totalAmount != null) { const n = Number(sale.totalAmount); if (Number.isFinite(n)) return n; }
    return Number(sale?.quantity || 0) * Number(sale?.unitPrice || 0);
};

const getCssVar = (name, fallback) => {
    if (typeof document === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

function SalesChart() {
    const { t, i18n } = useTranslation();
    const isEnglish = i18n.language === 'en';

    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDark, setIsDark] = useState(() =>
        typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    );

    const loadSales = async () => {
        try {
            setLoading(true);
            const result = await getSales();
            setSales(Array.isArray(result) ? result : []);
        } catch (err) {
            console.error('Failed to load sales chart data:', err);
            setSales([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSales();
        const onSales = () => loadSales();
        const onDb = () => loadSales();
        window.addEventListener('sales-updated', onSales);
        window.addEventListener('database-updated', onDb);
        return () => {
            window.removeEventListener('sales-updated', onSales);
            window.removeEventListener('database-updated', onDb);
        };
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        const root = document.documentElement;
        const update = () => setIsDark(root.classList.contains('dark'));
        update();
        const obs = new MutationObserver(update);
        obs.observe(root, { attributes: true, attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);

    const lastSevenDays = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = [];
        for (let i = 6; i >= 0; i -= 1) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            result.push(d);
        }
        return result;
    }, []);

    const chartData = useMemo(() => {
        const cashData = [];
        const creditData = [];
        const categories = [];

        lastSevenDays.forEach((day) => {
            let cash = 0;
            let credit = 0;

            sales.forEach((sale) => {
                const rawDate = getSaleDate(sale);
                if (!rawDate) return;
                const d = new Date(rawDate);
                if (Number.isNaN(d.getTime()) || !sameDay(d, day)) return;
                const total = getSaleTotal(sale);
                if (sale.paymentType === 'credit') credit += total;
                else cash += total;
            });

            cashData.push(cash);
            creditData.push(credit);
            categories.push(
                new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'fa-IR-u-ca-persian', { weekday: 'short' }).format(day)
            );
        });

        return { categories, cashData, creditData };
    }, [sales, lastSevenDays, isEnglish]);

    const totalSales = useMemo(
        () => chartData.cashData.reduce((a, b) => a + b, 0) + chartData.creditData.reduce((a, b) => a + b, 0),
        [chartData]
    );

    const fmt = (v) => Number(v || 0).toLocaleString(isEnglish ? 'en-US' : 'fa-IR');

    // palette-aware tokens
    const theme = useMemo(() => ({
        accent: getCssVar('--accent-500', '#10b981'),
        warning: getCssVar('--warning', '#f59e0b'),
        text: getCssVar('--text-muted', '#64748b'),
        grid: getCssVar('--border-subtle', 'rgba(148,163,184,0.25)'),
        tooltip: isDark ? 'dark' : 'light',
    }), [isDark]);

    const series = useMemo(() => [
        { name: t('sales.chart.cashSales'), data: chartData.cashData },
        { name: t('sales.chart.creditSales'), data: chartData.creditData },
    ], [chartData, t, i18n.language]);

    const options = useMemo(() => ({
        chart: {
            type: 'area', background: 'transparent',
            toolbar: { show: false }, zoom: { enabled: false },
            fontFamily: 'inherit', foreColor: theme.text,
            animations: { enabled: false },
            redrawOnWindowResize: true, redrawOnParentResize: false,
        },
        colors: [theme.accent, theme.warning],
        stroke: { curve: 'smooth', width: 2.5 },
        fill: {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.02, stops: [0, 100] },
        },
        dataLabels: { enabled: false },
        grid: { borderColor: theme.grid, strokeDashArray: 4, padding: { left: 5, right: 5 } },
        xaxis: {
            categories: chartData.categories,
            labels: {
                style: {
                    colors: Array(chartData.categories.length).fill(theme.text),
                    fontSize: '11px',
                },
                rotate: typeof window !== 'undefined' && window.innerWidth < 640 ? -35 : 0,
                hideOverlappingLabels: true,
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
        },
        yaxis: {
            labels: {
                style: { colors: [theme.text], fontSize: '11px' },
                formatter: (value) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${Math.round(value / 1000)}k`;
                    return Math.round(value);
                },
            },
        },
        tooltip: {
            theme: theme.tooltip,
            shared: true, intersect: false,
            y: { formatter: (value) => `${fmt(value)} ${t('common.currency')}` },
        },
        legend: {
            show: true, position: 'top',
            horizontalAlign: isEnglish ? 'left' : 'right',
            fontSize: '12px',
            labels: { colors: theme.text },
            markers: { width: 8, height: 8, radius: 12 },
            itemMargin: { horizontal: 10 },
        },
        markers: { size: 0, hover: { size: 5 } },
        responsive: [
            {
                breakpoint: 768,
                options: {
                    chart: { height: 280 },
                    legend: { position: 'bottom', horizontalAlign: 'center' },
                    xaxis: { labels: { rotate: -35, style: { fontSize: '10px' } } },
                },
            },
            {
                breakpoint: 480,
                options: {
                    chart: { height: 250 },
                    legend: { fontSize: '10px' },
                    yaxis: { labels: { show: false } },
                },
            },
        ],
    }), [chartData.categories, isEnglish, t, theme]);

    return (
        <section dir={isEnglish ? 'ltr' : 'rtl'} className="ui-card min-w-0 overflow-hidden p-4 sm:p-5 lg:p-6">
            {/* header */}
            <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                            <TrendingUp size={15} className="text-[var(--accent-500)]" />
                        </div>
                        <h2 className="text-base font-semibold text-[var(--text)] sm:text-lg">
                            {t('sales.chart.title')}
                        </h2>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {t('sales.chart.description')}
                    </p>
                </div>
                <div className="shrink-0 self-start rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] sm:self-auto">
                    {t('sales.chart.thisWeek')}
                </div>
            </div>

            {loading && (
                <div className="flex h-[240px] items-center justify-center sm:h-[300px] md:h-[320px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
                            <Loader2 size={18} className="animate-spin text-[var(--accent-500)]" />
                        </div>
                        <span className="text-sm text-[var(--text-muted)]">{t('sales.chart.loading')}</span>
                    </div>
                </div>
            )}

            {!loading && totalSales <= 0 && (
                <div className="flex h-[240px] flex-col items-center justify-center text-center sm:h-[300px] md:h-[320px]">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
                        <TrendingUp size={20} className="text-[var(--text-muted)]" />
                    </div>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">{t('sales.chart.empty')}</p>
                </div>
            )}

            {!loading && totalSales > 0 && (
                <div className="h-[240px] w-full min-w-0 overflow-hidden sm:h-[300px] md:h-[320px]">
                    <Chart
                        key={`${i18n.language}-${isDark}-${sales.length}`}
                        options={options}
                        series={series}
                        type="area"
                        height="100%"
                        width="100%"
                    />
                </div>
            )}
        </section>
    );
}

export default SalesChart;