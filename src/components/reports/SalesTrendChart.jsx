import { useEffect, useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import Chart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';
import { formatJalaliDate, getJalaliMonthStyle } from '../../utils/date/jalali';

const toEnglishNumbers = (value) =>
    String(value ?? '')
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

const formatNumber = (value, language) => {
    const num = Number(toEnglishNumbers(value)) || 0;
    const isEnglish = String(language || '').toLowerCase().startsWith('en');
    return new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR').format(num);
};

function SalesTrendChart({ data = [] }) {
    const { t, i18n } = useTranslation();
    const language = i18n.language || 'fa';
    const isEnglish = String(language).toLowerCase().startsWith('en');
    const direction = isEnglish ? 'ltr' : 'rtl';

    const [isDark, setIsDark] = useState(() =>
        typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    );
    const [jalaliMonthStyle, setJalaliMonthStyle] = useState(() => getJalaliMonthStyle());

    useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        const root = document.documentElement;
        const update = () => setIsDark(root.classList.contains('dark'));
        update();
        const observer = new MutationObserver(update);
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const onStyle = (e) => setJalaliMonthStyle(e?.detail || getJalaliMonthStyle());
        const onStorage = (e) => { if (e.key === 'jalaliMonthStyle') setJalaliMonthStyle(getJalaliMonthStyle()); };
        window.addEventListener('jalali-month-style-changed', onStyle);
        window.addEventListener('storage', onStorage);
        return () => {
            window.removeEventListener('jalali-month-style-changed', onStyle);
            window.removeEventListener('storage', onStorage);
        };
    }, []);

    const formatDayLabel = (isoDate, fallback) => {
        if (!isoDate) return fallback;
        const date = new Date(`${isoDate}T12:00:00`);
        if (Number.isNaN(date.getTime())) return fallback;
        return new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'fa-IR', { weekday: 'short' }).format(date);
    };

    const formatFullDate = (isoDate, fallback = '') => {
        if (!isoDate) return fallback;
        const date = new Date(`${isoDate}T12:00:00`);
        if (Number.isNaN(date.getTime())) return fallback;
        if (isEnglish) {
            return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
        }
        return formatJalaliDate(date, { monthStyle: jalaliMonthStyle, withMonthName: true }) || fallback;
    };

    const chartData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data
            .filter((item) => item && typeof item === 'object')
            .map((item) => {
                const rawDate = String(item.date ?? '');
                const isoDate = item.isoDate ?? null;
                return {
                    date: formatDayLabel(isoDate, rawDate),
                    isoDate,
                    sales: Number(toEnglishNumbers(item.sales)) || 0,
                };
            });
    }, [data, isEnglish]);

    const categories = useMemo(() => chartData.map((i) => i.date), [chartData]);
    const values = useMemo(() => chartData.map((i) => i.sales), [chartData]);

    const theme = useMemo(
        () => ({
            text: isDark ? '#94a3b8' : '#64748b',
            grid: isDark ? 'rgba(71,85,105,0.30)' : 'rgba(148,163,184,0.24)',
            tooltip: isDark ? 'dark' : 'light',
            emerald: '#10b981',
        }),
        [isDark]
    );

    const options = useMemo(
        () => ({
            chart: {
                type: 'area',
                background: 'transparent',
                toolbar: { show: false },
                zoom: { enabled: false },
                selection: { enabled: false },
                brush: { enabled: false },
                fontFamily: isEnglish ? 'Space Grotesk, sans-serif' : 'Vazirmatn, sans-serif',
                animations: { enabled: false },
                redrawOnWindowResize: true,
                redrawOnParentResize: true,
            },
            colors: [theme.emerald],
            stroke: { curve: 'smooth', width: 3, lineCap: 'round' },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: false,
                    opacityFrom: isDark ? 0.28 : 0.18,
                    opacityTo: 0.02,
                    stops: [0, 75, 100],
                },
            },
            dataLabels: { enabled: false },
            grid: {
                show: true,
                borderColor: theme.grid,
                strokeDashArray: 4,
                position: 'back',
                xaxis: { lines: { show: false } },
                yaxis: { lines: { show: true } },
                padding: {
                    top: 0,
                    right: isEnglish ? 14 : 10,
                    bottom: 0,
                    left: isEnglish ? 10 : 14,
                },
            },
            xaxis: {
                categories,
                tickPlacement: 'on',
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    show: true,
                    rotate: 0,
                    trim: true,
                    hideOverlappingLabels: true,
                    showDuplicates: false,
                    style: {
                        colors: theme.text,
                        fontSize: '10px',
                        fontFamily: isEnglish ? 'Space Grotesk, sans-serif' : 'Vazirmatn, sans-serif',
                    },
                },
                tooltip: { enabled: false },
            },
            yaxis: {
                min: 0,
                forceNiceScale: true,
                labels: {
                    show: true,
                    minWidth: 42,
                    maxWidth: 72,
                    style: {
                        colors: theme.text,
                        fontSize: '10px',
                        fontFamily: isEnglish ? 'Space Grotesk, sans-serif' : 'Vazirmatn, sans-serif',
                    },
                    formatter: (value) => formatNumber(value, language),
                },
            },
            tooltip: {
                enabled: true,
                theme: theme.tooltip,
                shared: false,
                intersect: true,
                followCursor: false,
                fixed: { enabled: false },
                x: {
                    formatter: (_v, { dataPointIndex }) => {
                        const item = chartData[dataPointIndex];
                        if (item?.isoDate) return formatFullDate(item.isoDate, item.date);
                        return item?.date || '';
                    },
                },
                y: {
                    formatter: (value) => `${formatNumber(value, language)} ${isEnglish ? 'AF' : 'افغانی'}`,
                },
            },
            markers: {
                size: 4,
                colors: [theme.emerald],
                strokeColors: isDark ? '#0f172a' : '#ffffff',
                strokeWidth: 2,
                hover: { size: 6 },
            },
            legend: { show: false },
        }),
        [categories, chartData, language, isEnglish, isDark, jalaliMonthStyle, theme]
    );

    const series = useMemo(
        () => [
            {
                name: t('reports.charts.salesTrend.series', { defaultValue: isEnglish ? 'Sales' : 'فروش' }),
                data: values,
            },
        ],
        [values, t, isEnglish]
    );

    if (chartData.length === 0) {
        return (
            <div dir={direction} className="ui-card min-w-0 overflow-hidden p-0">
                <ChartHeader t={t} isEnglish={isEnglish} />
                <div className="flex h-[280px] items-center justify-center px-5 text-center text-xs leading-5 text-[var(--text-muted)] sm:h-[320px]">
                    {t('reports.empty', { defaultValue: isEnglish ? 'No report data available.' : 'داده‌ای برای نمایش گزارش وجود ندارد.' })}
                </div>
            </div>
        );
    }

    return (
        <div dir={direction} className="ui-card min-w-0 overflow-hidden p-0">
            <ChartHeader t={t} isEnglish={isEnglish} />
            <div className="w-full min-w-0 overflow-hidden px-1 py-3 sm:px-3 sm:py-4">
                <Chart
                    key={`sales-${isDark ? 'dark' : 'light'}-${language}-${jalaliMonthStyle}`}
                    options={options}
                    series={series}
                    type="area"
                    height={255}
                />
            </div>
        </div>
    );
}

function ChartHeader({ t, isEnglish }) {
    return (
        <div className="flex min-w-0 items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/10">
                <TrendingUp size={17} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {t('reports.charts.salesTrend.title', { defaultValue: isEnglish ? 'Sales Trend' : 'روند فروش' })}
                </h2>
                <p className="mt-1 truncate text-[10px] leading-5 text-[var(--text-muted)]">
                    {t('reports.charts.salesTrend.description', {
                        defaultValue: isEnglish ? 'Sales performance over the selected period' : 'روند عملکرد فروش در بازه انتخاب‌شده',
                    })}
                </p>
            </div>
        </div>
    );
}

export default SalesTrendChart;