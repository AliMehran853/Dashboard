import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'react-apexcharts';
import { CalendarRange, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { dateToJalali, getJalaliMonthName, getJalaliMonthStyle } from '../../utils/date/jalali';

// ---------- helpers ----------
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
const createMonthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const getCssVar = (name, fallback) => {
    if (typeof document === 'undefined') return fallback;
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
};

// ---------- component ----------
function MonthlySalesChart({ sales = [], loading = false }) {
    const { t, i18n } = useTranslation();
    const chartScrollRef = useRef(null);

    // theme
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

    // jalali month style
    const [jalaliMonthStyle, setJalaliMonthStyle] = useState(getJalaliMonthStyle);

    useEffect(() => {
        const onChange = (e) => setJalaliMonthStyle(e?.detail || getJalaliMonthStyle());
        const onStorage = () => setJalaliMonthStyle(getJalaliMonthStyle());
        window.addEventListener('jalali-month-style-changed', onChange);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('jalali-month-style-changed', onChange);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    const isEnglish = String(i18n.language || '').toLowerCase().startsWith('en');

    // chart data
    const chartData = useMemo(() => {
        const months = [];
        const today = new Date();
        today.setDate(1);
        today.setHours(0, 0, 0, 0);

        for (let i = 11; i >= 0; i -= 1) {
            const d = new Date(today);
            d.setMonth(today.getMonth() - i);
            months.push(d);
        }

        const totals = {};
        months.forEach((d) => { totals[createMonthKey(d)] = 0; });

        if (Array.isArray(sales)) {
            sales.forEach((sale) => {
                const raw = getSaleDate(sale);
                if (!raw) return;
                const parsed = new Date(raw);
                if (Number.isNaN(parsed.getTime())) return;
                const key = createMonthKey(parsed);
                if (!(key in totals)) return;
                totals[key] += getSaleAmount(sale);
            });
        }

        const categories = months.map((d) => {
            if (isEnglish) {
                return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(d);
            }
            const j = dateToJalali(d);
            return j ? getJalaliMonthName(j.month, jalaliMonthStyle) : '';
        });

        const values = months.map((d) => Math.max(0, Number(totals[createMonthKey(d)]) || 0));
        const total = values.reduce((s, v) => s + v, 0);
        const highest = Math.max(...values, 0);

        return { categories, values, total, highest };
    }, [sales, isEnglish, jalaliMonthStyle]);

    const chartSignature = useMemo(
        () => [i18n.language, jalaliMonthStyle, chartData.total, chartData.highest,
            chartData.values.join(','), chartData.categories.join(',')].join('|'),
        [i18n.language, jalaliMonthStyle, chartData]
    );

    // scroll to latest on EN mobile
    useEffect(() => {
        if (!isEnglish) return undefined;
        const el = chartScrollRef.current;
        if (!el) return undefined;
        const scroll = () => { el.scrollLeft = Math.max(0, el.scrollWidth - el.clientWidth); };
        const f1 = requestAnimationFrame(scroll);
        const f2 = requestAnimationFrame(() => requestAnimationFrame(scroll));
        return () => { cancelAnimationFrame(f1); cancelAnimationFrame(f2); };
    }, [isEnglish, chartSignature]);

    // theme tokens (memoized)
    const tokens = useMemo(() => ({
        accent: getCssVar('--accent-500', '#10b981'),
        text: getCssVar('--text-muted', '#64748b'),
        grid: getCssVar('--border-subtle', 'rgba(100,116,139,.16)'),
        value: getCssVar('--text', '#0f172a'),
    }), [isDark]);

    const formatNumber = (v) => Number(v || 0).toLocaleString(isEnglish ? 'en-US' : 'fa-IR');

    const options = useMemo(() => ({
        chart: {
            type: 'area', background: 'transparent', fontFamily: 'inherit',
            foreColor: tokens.text, parentHeightOffset: 0,
            animations: { enabled: false }, redrawOnWindowResize: true,
            toolbar: { show: false }, zoom: { enabled: false }, selection: { enabled: false },
        },
        colors: [tokens.accent],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2.5, lineCap: 'round' },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 0.9, inverseColors: false,
                opacityFrom: isDark ? 0.26 : 0.18, opacityTo: 0.015, stops: [0, 72, 100],
            },
        },
        grid: {
            show: true, borderColor: tokens.grid, strokeDashArray: 4, position: 'back',
            padding: { top: 8, right: 8, bottom: 4, left: 6 },
            xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } },
        },
        xaxis: {
            categories: chartData.categories, tickPlacement: 'on',
            axisBorder: { show: false }, axisTicks: { show: false },
            labels: {
                show: true, trim: false, hideOverlappingLabels: false,
                rotate: 0, rotateAlways: false, minHeight: 26, maxHeight: 36, offsetY: 2,
                style: { colors: tokens.text, fontSize: '10px', fontWeight: 500, fontFamily: 'inherit' },
            },
        },
        yaxis: {
            show: true, min: 0, forceNiceScale: true, decimalsInFloat: 0,
            labels: {
                show: true, minWidth: 44, maxWidth: 62,
                style: { colors: tokens.text, fontSize: '10px', fontFamily: 'inherit' },
                formatter: (value) => {
                    const n = Number(value);
                    if (!Number.isFinite(n)) return '0';
                    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
                    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
                    return Math.round(n).toLocaleString(isEnglish ? 'en-US' : 'fa-IR');
                },
            },
        },
        tooltip: {
            enabled: true, theme: isDark ? 'dark' : 'light',
            shared: false, intersect: false, followCursor: false,
            x: { show: true },
            y: { formatter: (value) => `${formatNumber(value)} ${t('common.currency')}` },
        },
        markers: {
            size: 3.5, strokeWidth: 2, strokeColors: tokens.value,
            hover: { size: 6 },
        },
        states: {
            hover: { filter: { type: 'none' } },
            active: { filter: { type: 'none' } },
        },
        responsive: [
            { breakpoint: 1024, options: { markers: { size: 3.5, hover: { size: 6 } } } },
            {
                breakpoint: 640,
                options: {
                    markers: { size: 3, hover: { size: 6 } },
                    grid: { padding: { top: 8, right: 10, bottom: 12, left: 2 } },
                    xaxis: { labels: { rotate: -20, rotateAlways: true, fontSize: '9px', offsetY: 2 } },
                    yaxis: { labels: { minWidth: 36, maxWidth: 48, style: { fontSize: '8px' } } },
                },
            },
            { breakpoint: 420, options: { xaxis: { labels: { rotate: -25, fontSize: '9px' } } } },
        ],
    }), [tokens, isDark, isEnglish, chartData.categories, t]);

    const series = useMemo(
        () => [{ name: t('dashboard.monthlySalesChart.series'), data: chartData.values }],
        [chartData.values, t]
    );

    const emptyState = (
        <div className="flex h-full w-full items-center justify-center text-center">
            <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-6 py-7">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--text-soft)]">
                    <TrendingUp size={21} strokeWidth={1.7} />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">
                    {t('dashboard.monthlySalesChart.empty')}
                </p>
            </div>
        </div>
    );

    return (
        <section dir={i18n.dir()} className="ui-card w-full min-w-0 overflow-hidden p-4 sm:p-5 lg:p-6">
            {/* header */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-500)]">
                            <CalendarRange size={18} strokeWidth={1.8} />
                        </div>
                        <h2 className="truncate text-base font-semibold tracking-[-0.01em] text-[var(--text)] sm:text-lg lg:text-xl">
                            {t('dashboard.monthlySalesChart.title')}
                        </h2>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
                        {t('dashboard.monthlySalesChart.description')}
                    </p>
                </div>

                <div className="shrink-0 rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-2.5 sm:min-w-[155px] sm:text-end">
                    <p className="text-[10px] text-[var(--text-muted)]">
                        {t('dashboard.monthlySalesChart.total')}
                    </p>
                    <p className="mt-0.5 text-base font-semibold text-[var(--text)] sm:text-lg">
                        {formatNumber(chartData.total)}{' '}
                        <span className="text-[10px] font-normal text-[var(--text-soft)]">
                            {t('common.currency')}
                        </span>
                    </p>
                </div>
            </div>

            {/* chart */}
            <div ref={chartScrollRef} className="w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain touch-pan-x pb-2 sm:overflow-x-hidden sm:pb-0 scrollbar-thin">
                <div className="h-[320px] w-[1120px] sm:h-[350px] sm:w-full lg:h-[380px] xl:h-[400px]">
                    {loading ? (
                        <div className="flex h-full w-full items-center justify-center">
                            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3 text-xs text-[var(--text-muted)]">
                                {t('dashboard.monthlySalesChart.loading')}
                            </div>
                        </div>
                    ) : chartData.total <= 0 ? emptyState : (
                        <div className="h-full w-full min-w-0">
                            <Chart key={chartSignature} options={options} series={series} type="area" width="100%" height="100%" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default MonthlySalesChart;