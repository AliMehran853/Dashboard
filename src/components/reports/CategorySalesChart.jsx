import { useEffect, useMemo, useState } from 'react';
import Chart from 'react-apexcharts';
import { BarChart3 } from 'lucide-react';
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

function CategorySalesChart({ data = [] }) {
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

    const chartData = useMemo(() => {
        if (!Array.isArray(data)) return [];
        return data
            .filter((item) => item && typeof item === 'object')
            .map((item) => ({
                category: String(
                    item.category ??
                    t('reports.charts.categorySales.uncategorized', { defaultValue: isEnglish ? 'Uncategorized' : 'بدون دسته‌بندی' })
                ),
                sales: Number(toEnglishNumbers(item.sales)) || 0,
            }))
            .sort((a, b) => b.sales - a.sales);
    }, [data, t, isEnglish]);

    const categories = useMemo(() => chartData.map((i) => i.category), [chartData]);
    const sales = useMemo(() => chartData.map((i) => i.sales), [chartData]);

    const theme = useMemo(
        () => ({
            text: isDark ? '#94a3b8' : '#64748b',
            yText: isDark ? '#cbd5e1' : '#334155',
            grid: isDark ? 'rgba(71,85,105,0.30)' : 'rgba(148,163,184,0.24)',
            tooltip: isDark ? 'dark' : 'light',
        }),
        [isDark]
    );

    const chartHeight = Math.max(320, chartData.length * (chartData.length >= 7 ? 48 : 54));

    const options = useMemo(
        () => ({
            chart: {
                type: 'bar',
                background: 'transparent',
                toolbar: { show: false },
                fontFamily: isEnglish ? 'Space Grotesk, sans-serif' : 'Vazirmatn, sans-serif',
                animations: { enabled: false },
                redrawOnWindowResize: true,
                redrawOnParentResize: true,
                zoom: { enabled: false },
            },
            colors: ['#10b981'],
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 6,
                    borderRadiusApplication: 'end',
                    borderRadiusWhenStacked: 'last',
                    barHeight: chartData.length > 8 ? '58%' : '62%',
                    distributed: false,
                },
            },
            dataLabels: { enabled: false },
            xaxis: {
                categories,
                min: 0,
                forceNiceScale: true,
                axisBorder: { show: false },
                axisTicks: { show: false },
                labels: {
                    show: true,
                    style: {
                        colors: theme.text,
                        fontSize: '10px',
                        fontFamily: isEnglish ? 'Space Grotesk, sans-serif' : 'Vazirmatn, sans-serif',
                    },
                    formatter: (value) => formatNumber(value, language),
                },
            },
            yaxis: {
                reversed: !isEnglish,
                labels: {
                    show: true,
                    style: {
                        colors: theme.yText,
                        fontSize: '11px',
                        fontWeight: 500,
                        fontFamily: isEnglish ? 'Space Grotesk, sans-serif' : 'Vazirmatn, sans-serif',
                    },
                    maxWidth: isEnglish ? 150 : 130,
                    trim: true,
                },
            },
            grid: {
                show: true,
                borderColor: theme.grid,
                strokeDashArray: 4,
                position: 'back',
                xaxis: { lines: { show: true } },
                yaxis: { lines: { show: false } },
                padding: {
                    top: 0,
                    right: isEnglish ? 14 : 10,
                    bottom: 0,
                    left: isEnglish ? 10 : 14,
                },
            },
            tooltip: {
                enabled: true,
                theme: theme.tooltip,
                y: {
                    formatter: (value) => `${formatNumber(value, language)} ${isEnglish ? 'AF' : 'افغانی'}`,
                },
            },
            legend: { show: false },
        }),
        [categories, chartData.length, theme, language, isEnglish]
    );

    const series = useMemo(
        () => [
            {
                name: t('reports.charts.categorySales.series', { defaultValue: isEnglish ? 'Sales' : 'فروش' }),
                data: sales,
            },
        ],
        [sales, t, isEnglish]
    );

    if (chartData.length === 0) {
        return (
            <div dir={direction} className="ui-card overflow-hidden p-0">
                <ChartHeader t={t} isEnglish={isEnglish} />
                <div className="flex h-64 items-center justify-center px-5 text-center text-xs text-[var(--text-muted)]">
                    {t('reports.empty', { defaultValue: isEnglish ? 'No report data available.' : 'داده‌ای برای نمایش گزارش وجود ندارد.' })}
                </div>
            </div>
        );
    }

    return (
        <div dir={direction} className="ui-card overflow-hidden p-0">
            <ChartHeader t={t} isEnglish={isEnglish} />
            <div className="w-full min-w-0 overflow-hidden px-2 py-4 sm:px-4">
                <Chart
                    key={`category-${isDark ? 'dark' : 'light'}-${language}`}
                    options={options}
                    series={series}
                    type="bar"
                    height={chartHeight}
                />
            </div>
        </div>
    );
}

function ChartHeader({ t, isEnglish }) {
    return (
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/10">
                <BarChart3 size={17} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {t('reports.charts.categorySales.title', { defaultValue: isEnglish ? 'Sales by Category' : 'فروش بر اساس دسته‌بندی' })}
                </h2>
                <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">
                    {t('reports.charts.categorySales.description', {
                        defaultValue: isEnglish ? 'Compare sales performance across categories' : 'مقایسه عملکرد فروش دسته‌بندی‌ها',
                    })}
                </p>
            </div>
        </div>
    );
}

export default CategorySalesChart;