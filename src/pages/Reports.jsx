import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

import { createPortal } from 'react-dom';

import {
    BarChart3,
    Download,
    Loader2,
    FileSpreadsheet,
    FileText,
} from 'lucide-react';

import {
    useTranslation,
} from 'react-i18next';

import ReportsStats
    from '../components/reports/ReportsStats';

import ReportsFilters
    from '../components/reports/ReportsFilters';

import SalesTrendChart
    from '../components/reports/SalesTrendChart';

import PaymentDistributionChart
    from '../components/reports/PaymentDistributionChart';

import CategorySalesChart
    from '../components/reports/CategorySalesChart';

import ReportsSummary
    from '../components/reports/ReportsSummary';

import {
    getSalesReport,
    getReportCategories,
} from '../services/reportService';

import {
    exportReportToExcel,
} from '../utils/export/excel';

import {
    exportReportToPDF,
} from '../utils/export/pdf';


// =========================================================
// Default Report Data
// =========================================================

const createDefaultReportData = () => ({

    statistics: {
        totalSales: 0,
        totalTransactions: 0,
        cashSales: 0,
        creditSales: 0,
        totalRevenue: 0,
    },

    salesTrend: [],

    paymentDistribution: [],

    categorySales: [],

    summary: {
        bestCategory: '-',
        bestCategorySales: 0,
        averageSale: 0,
        totalItems: 0,
    },

    rawSales: [],

});


// =========================================================
// Normalize Report Data
// =========================================================

const normalizeReportData = (
    result
) => {

    const fallback =
        createDefaultReportData();


    if (
        !result ||
        typeof result !== 'object'
    ) {

        return fallback;

    }


    return {

        statistics: {
            ...fallback.statistics,
            ...(result.statistics || {}),
        },

        salesTrend:
            Array.isArray(result.salesTrend)
                ? result.salesTrend
                : [],

        paymentDistribution:
            Array.isArray(result.paymentDistribution)
                ? result.paymentDistribution
                : [],

        categorySales:
            Array.isArray(result.categorySales)
                ? result.categorySales
                : [],

        summary: {
            ...fallback.summary,
            ...(result.summary || {}),
        },

        rawSales:
            Array.isArray(result.rawSales)
                ? result.rawSales
                : [],

    };

};


// =========================================================
// Reports
// =========================================================

function Reports() {

    const {
        t,
        i18n,
    } = useTranslation();


    // =====================================================
    // Language
    // =====================================================

    const language =
        i18n.language || 'fa';


    const isEnglish =
        String(language)
            .toLowerCase()
            .startsWith('en');


    const direction =
        isEnglish
            ? 'ltr'
            : 'rtl';


    // =====================================================
    // Export State
    // =====================================================

    const [
        exportOpen,
        setExportOpen,
    ] = useState(false);


    const [
        exporting,
        setExporting,
    ] = useState(false);


    const [
        exportError,
        setExportError,
    ] = useState('');


    // =====================================================
    // Refs
    // =====================================================

    const exportButtonRef =
        useRef(null);


    const exportMenuRef =
        useRef(null);


    // =====================================================
    // Menu Position
    // =====================================================

    const [
        menuStyle,
        setMenuStyle,
    ] = useState({

        position: 'fixed',
        top: 0,
        left: 0,
        visibility: 'hidden',

    });


    // =====================================================
    // Filters
    // =====================================================

    const [
        search,
        setSearch,
    ] = useState('');


    const [
        period,
        setPeriod,
    ] = useState('week');


    const [
        paymentType,
        setPaymentType,
    ] = useState('all');


    const [
        category,
        setCategory,
    ] = useState('all');


    // =====================================================
    // Categories
    // =====================================================

    const [
        categories,
        setCategories,
    ] = useState([]);


    // =====================================================
    // Report Data
    // =====================================================

    const [
        reportData,
        setReportData,
    ] = useState(
        createDefaultReportData()
    );


    // =====================================================
    // Loading
    // =====================================================

    const [
        loading,
        setLoading,
    ] = useState(true);


    // =====================================================
    // Error
    // =====================================================

    const [
        error,
        setError,
    ] = useState('');


    // =====================================================
    // Load Categories
    // =====================================================

    useEffect(() => {

        let cancelled = false;


        const loadCategories =
            async () => {

                try {

                    const result =
                        await getReportCategories();


                    if (cancelled) {
                        return;
                    }


                    setCategories(
                        Array.isArray(result)
                            ? result
                            : []
                    );

                } catch (loadError) {

                    console.error(
                        'Failed to load report categories:',
                        loadError
                    );


                    if (!cancelled) {
                        setCategories([]);
                    }

                }

            };


        loadCategories();


        return () => {
            cancelled = true;
        };

    }, []);


    // =====================================================
    // Load Report
    // =====================================================

    useEffect(() => {

        let cancelled = false;


        const loadReport =
            async () => {

                try {

                    setLoading(true);
                    setError('');


                    const result =
                        await getSalesReport({
                            period,
                            paymentType,
                            category,
                            search,
                        });


                    if (cancelled) {
                        return;
                    }


                    setReportData(
                        normalizeReportData(result)
                    );

                } catch (loadError) {

                    console.error(
                        'Failed to load report:',
                        loadError
                    );


                    if (!cancelled) {

                        setReportData(
                            createDefaultReportData()
                        );

                        setError(
                            t('reports.errors.load')
                        );

                    }

                } finally {

                    if (!cancelled) {
                        setLoading(false);
                    }

                }

            };


        loadReport();


        return () => {
            cancelled = true;
        };

    }, [
        period,
        paymentType,
        category,
        search,
        t,
    ]);


    // =====================================================
    // Compute Menu Position
    //
    // Uses viewport coordinates from getBoundingClientRect
    // so that `position: fixed` on the portal-aligned menu
    // sits exactly under the button.
    // =====================================================

    const computeMenuPosition =
        () => {

            const button =
                exportButtonRef.current;


            if (!button) {

                return {

                    position: 'fixed',
                    top: 0,
                    left: 0,
                    visibility: 'hidden',

                };

            }


            const rect =
                button.getBoundingClientRect();


            const margin = 8;


            const next = {

                position: 'fixed',

                top:
                    rect.bottom + margin,

                zIndex:
                    9999,

                visibility:
                    'visible',

            };


            if (isEnglish) {

                // LTR — align dropdown's right edge to button's right edge

                next.right =
                    Math.max(
                        margin,
                        window.innerWidth - rect.right
                    );

                next.left =
                    'auto';

            } else {

                // RTL — align dropdown's left edge to button's left edge

                next.left =
                    Math.max(
                        margin,
                        rect.left
                    );

                next.right =
                    'auto';

            }


            return next;

        };


    // =====================================================
    // Position Menu On Open + Track Resize / Scroll
    //
    // `useLayoutEffect` runs synchronously after DOM mutation
    // so the very first frame already has the correct position.
    // =====================================================

    useLayoutEffect(() => {

        if (!exportOpen) {
            return undefined;
        }


        setMenuStyle(
            computeMenuPosition()
        );


        const handleReposition = () => {

            setMenuStyle(
                computeMenuPosition()
            );

        };


        window.addEventListener(
            'resize',
            handleReposition
        );


        window.addEventListener(
            'scroll',
            handleReposition,
            true
        );


        return () => {

            window.removeEventListener(
                'resize',
                handleReposition
            );


            window.removeEventListener(
                'scroll',
                handleReposition,
                true
            );

        };

    }, [
        exportOpen,
        isEnglish,
    ]);


    // =====================================================
    // Close On Outside Click + ESC
    // =====================================================

    useEffect(() => {

        if (!exportOpen) {
            return undefined;
        }


        const handleClickOutside = (event) => {

            if (
                exportMenuRef.current &&
                exportMenuRef.current.contains(
                    event.target
                )
            ) {
                return;
            }


            if (
                exportButtonRef.current &&
                exportButtonRef.current.contains(
                    event.target
                )
            ) {
                return;
            }


            setExportOpen(false);

        };


        const handleKeyDown = (event) => {

            if (event.key === 'Escape') {
                setExportOpen(false);
            }

        };


        document.addEventListener(
            'mousedown',
            handleClickOutside
        );


        document.addEventListener(
            'keydown',
            handleKeyDown
        );


        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );


            document.removeEventListener(
                'keydown',
                handleKeyDown
            );

        };

    }, [exportOpen]);


    // =====================================================
    // Clear Filters
    // =====================================================

    const handleClearFilters = () => {

        setSearch('');
        setPeriod('week');
        setPaymentType('all');
        setCategory('all');

    };


    // =====================================================
    // Toggle Export
    // =====================================================

    const handleExportClick = () => {

        setExportError('');

        setExportOpen(
            (current) => !current
        );

    };


    // =====================================================
    // Export Excel
    // =====================================================

    const handleExportExcel =
        async () => {

            if (exporting) {
                return;
            }


            try {

                setExporting(true);
                setExportError('');


                exportReportToExcel({
                    reportData,
                    period,
                    paymentType,
                    category,
                    search,
                    language: i18n.language,
                });


                setExportOpen(false);

            } catch (exportException) {

                console.error(
                    'Excel export failed:',
                    exportException
                );


                setExportError(
                    t(
                        'reports.errors.export',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'Excel export failed.'
                                    : 'خروجی اکسل ایجاد نشد.',
                        }
                    )
                );

            } finally {

                setExporting(false);

            }

        };


    // =====================================================
    // Export PDF
    // =====================================================

    const handleExportPDF =
        async () => {

            if (exporting) {
                return;
            }


            try {

                setExporting(true);
                setExportError('');


                await exportReportToPDF({
                    reportData,
                    period,
                    paymentType,
                    category,
                    search,
                    language: i18n.language,
                });


                setExportOpen(false);

            } catch (exportException) {

                console.error(
                    'PDF export failed:',
                    exportException
                );


                setExportError(
                    t(
                        'reports.errors.export',
                        {
                            defaultValue:
                                isEnglish
                                    ? 'PDF export failed.'
                                    : 'خروجی PDF ایجاد نشد.',
                        }
                    )
                );

            } finally {

                setExporting(false);

            }

        };


    // =====================================================
    // Render Export Menu (Portal)
    // =====================================================

    const renderExportMenu = () => {

        if (!exportOpen) {
            return null;
        }


        return createPortal(

            <div
                ref={exportMenuRef}
                style={menuStyle}
                className="
                    w-64
                    max-w-[calc(100vw-1rem)]

                    sm:w-72

                    overflow-hidden

                    rounded-2xl

                    border
                    border-[var(--glass-border)]

                    p-1.5

                    shadow-2xl
                    shadow-black/25
                "
            >

                {/* Glass Background */}

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        inset-0
                    "
                    style={{
                        background: `
                            linear-gradient(
                                135deg,
                                var(--glass-active-tint),
                                var(--glass-active-tint-soft) 70%,
                                transparent 100%
                            ),
                            var(--glass-bg-strong)
                        `,
                        backdropFilter:
                            'blur(var(--glass-blur-strong)) saturate(220%) brightness(1.12)',
                        WebkitBackdropFilter:
                            'blur(var(--glass-blur-strong)) saturate(220%) brightness(1.12)',
                    }}
                />


                <div className="relative z-10">

                    {/* Header */}

                    <div
                        className="
                            border-b
                            border-[var(--border-subtle)]
                            px-3
                            py-3
                        "
                    >

                        <p
                            className="
                                text-sm
                                font-semibold
                                text-[var(--text)]
                            "
                        >
                            {t('reports.actions.export')}
                        </p>


                        <p
                            className="
                                mt-1
                                text-[10px]
                                leading-5
                                text-[var(--text-muted)]
                            "
                        >
                            {
                                isEnglish
                                    ? 'Choose a format for the current report.'
                                    : 'فرمت مناسب برای گزارش فعلی را انتخاب کنید.'
                            }
                        </p>

                    </div>


                    {/* Items */}

                    <div className="space-y-1 p-1">

                        {/* Excel */}

                        <button
                            type="button"
                            onClick={handleExportExcel}
                            disabled={exporting}
                            className="
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-xl
                                p-3
                                text-start
                                transition-all
                                duration-200
                                hover:bg-[var(--accent-soft)]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-emerald-500/20
                                    bg-emerald-500/10
                                "
                            >

                                <FileSpreadsheet
                                    size={18}
                                    className="
                                        text-emerald-500
                                        dark:text-emerald-400
                                    "
                                />

                            </div>


                            <div className="min-w-0 flex-1">

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-[var(--text)]
                                    "
                                >
                                    Excel
                                </p>


                                <p
                                    className="
                                        mt-0.5
                                        truncate
                                        text-[10px]
                                        text-[var(--text-muted)]
                                    "
                                >
                                    {
                                        isEnglish
                                            ? 'Editable report with detailed sales'
                                            : 'گزارش قابل ویرایش با جزئیات فروش'
                                    }
                                </p>

                            </div>

                        </button>


                        {/* PDF */}

                        <button
                            type="button"
                            onClick={handleExportPDF}
                            disabled={exporting}
                            className="
                                flex
                                w-full
                                items-center
                                gap-3
                                rounded-xl
                                p-3
                                text-start
                                transition-all
                                duration-200
                                hover:bg-[var(--accent-soft)]
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-10
                                    w-10
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-rose-500/20
                                    bg-rose-500/10
                                "
                            >

                                <FileText
                                    size={18}
                                    className="
                                        text-rose-500
                                        dark:text-rose-400
                                    "
                                />

                            </div>


                            <div className="min-w-0 flex-1">

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-[var(--text)]
                                    "
                                >
                                    PDF
                                </p>


                                <p
                                    className="
                                        mt-0.5
                                        truncate
                                        text-[10px]
                                        text-[var(--text-muted)]
                                    "
                                >
                                    {
                                        isEnglish
                                            ? 'Printable management report'
                                            : 'گزارش مدیریتی مناسب چاپ'
                                    }
                                </p>

                            </div>

                        </button>

                    </div>

                </div>

            </div>,

            document.body

        );

    };


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            dir={direction}
            className="
                min-h-full
                space-y-5
                pb-6
                text-[var(--text-secondary)]
            "
        >

            {/* =================================================
                Header
            ================================================== */}

            <section
                className="
                    relative

                    rounded-2xl

                    border
                    border-[var(--border-subtle)]

                    p-4

                    shadow-[var(--shadow-sm)]

                    transition-colors
                    duration-300

                    sm:p-5
                    md:p-6
                "
                style={{
                    background: `
                        linear-gradient(
                            135deg,
                            var(--glass-active-tint),
                            var(--glass-active-tint-soft) 70%,
                            transparent 100%
                        ),
                        var(--surface)
                    `,
                }}
            >

                {/* Glow wrapper (clips glows to rounded corners) */}

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none
                        absolute
                        inset-0
                        overflow-hidden
                        rounded-2xl
                    "
                >

                    <div
                        className="
                            absolute
                            -start-20
                            -top-20
                            h-52
                            w-52
                            rounded-full
                            bg-[var(--accent-soft-heavy)]
                            blur-3xl
                        "
                    />


                    <div
                        className="
                            absolute
                            -end-16
                            -bottom-24
                            h-44
                            w-44
                            rounded-full
                            bg-[var(--accent-soft)]
                            blur-3xl
                        "
                    />

                </div>


                {/* Content */}

                <div
                    className="
                        relative
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                    "
                >

                    {/* Title */}

                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                border
                                border-[var(--accent-border)]
                                bg-[var(--accent-soft)]
                                text-[var(--accent-500)]
                            "
                        >

                            <BarChart3
                                size={20}
                                strokeWidth={1.9}
                            />

                        </div>


                        <div className="min-w-0">

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <span
                                    className="
                                        h-2
                                        w-2
                                        shrink-0
                                        rounded-full
                                        bg-[var(--accent-500)]
                                        shadow-[0_0_12px_var(--accent-glow)]
                                    "
                                />

                                <span
                                    className="
                                        text-[10px]
                                        font-medium
                                        uppercase
                                        tracking-[0.12em]
                                        text-[var(--accent-600)]
                                    "
                                >
                                    Taqwa
                                </span>

                            </div>


                            <h1
                                className="
                                    mt-2
                                    truncate
                                    text-xl
                                    font-semibold
                                    tracking-[-0.02em]
                                    text-[var(--text)]
                                    sm:text-2xl
                                    lg:text-3xl
                                "
                            >
                                {t('reports.page.title')}
                            </h1>


                            <p
                                className="
                                    mt-1.5
                                    max-w-2xl
                                    text-xs
                                    leading-5
                                    text-[var(--text-muted)]
                                    sm:text-sm
                                "
                            >
                                {t('reports.page.description')}
                            </p>

                        </div>

                    </div>


                    {/* Export Button */}

                    <div
                        ref={exportButtonRef}
                        className="
                            relative
                            w-full
                            sm:w-auto
                        "
                    >

                        <button
                            type="button"
                            onClick={handleExportClick}
                            disabled={loading || exporting}
                            aria-haspopup="menu"
                            aria-expanded={exportOpen}
                            className="
                                ui-button-secondary
                                group
                                w-full
                                sm:w-auto
                                px-4
                                text-xs
                                font-medium
                            "
                        >

                            {
                                exporting
                                    ? (
                                        <Loader2
                                            size={15}
                                            className="animate-spin"
                                        />
                                    )
                                    : (
                                        <Download size={15} />
                                    )
                            }


                            {
                                exporting
                                    ? t(
                                        'reports.actions.exporting',
                                        {
                                            defaultValue:
                                                isEnglish
                                                    ? 'Preparing...'
                                                    : 'در حال آماده‌سازی...',
                                        }
                                    )
                                    : t('reports.actions.export')
                            }

                        </button>

                    </div>

                </div>

            </section>


            {/* =================================================
                Export Menu (Portal)
            ================================================== */}

            {renderExportMenu()}


            {/* =================================================
                Export Error
            ================================================== */}

            {exportError && (

                <div
                    role="alert"
                    className="
                        rounded-2xl
                        border
                        border-red-500/20
                        bg-red-500/[0.06]
                        px-4
                        py-3
                        text-xs
                        leading-5
                        text-red-500
                        dark:text-red-400
                        sm:text-sm
                    "
                >
                    {exportError}
                </div>

            )}


            {/* =================================================
                Filters
            ================================================== */}

            <ReportsFilters
                search={search}
                period={period}
                paymentType={paymentType}
                category={category}
                categories={categories}
                onSearchChange={setSearch}
                onPeriodChange={setPeriod}
                onPaymentTypeChange={setPaymentType}
                onCategoryChange={setCategory}
                onClearFilters={handleClearFilters}
            />


            {/* =================================================
                Error
            ================================================== */}

            {error && (

                <div
                    role="alert"
                    className="
                        rounded-2xl
                        border
                        border-red-500/20
                        bg-red-500/[0.06]
                        px-4
                        py-3
                        text-xs
                        leading-5
                        text-red-500
                        dark:text-red-400
                        sm:text-sm
                    "
                >
                    {error}
                </div>

            )}


            {/* =================================================
                Loading / Report
            ================================================== */}

            {loading
                ? (
                    <div
                        className="
                            flex
                            min-h-[400px]
                            flex-col
                            items-center
                            justify-center
                            gap-3
                            text-[var(--text-muted)]
                        "
                    >

                        <div
                            className="
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-2xl
                                border
                                border-[var(--accent-border)]
                                bg-[var(--accent-soft)]
                            "
                        >

                            <Loader2
                                size={26}
                                className="
                                    animate-spin
                                    text-[var(--accent-500)]
                                "
                            />

                        </div>


                        <span className="text-sm">
                            {t('reports.loading')}
                        </span>

                    </div>
                )
                : (
                    <>

                        <ReportsStats
                            statistics={reportData.statistics}
                        />


                        <div
                            className="
                                grid
                                grid-cols-1
                                gap-5
                                xl:grid-cols-2
                            "
                        >

                            <SalesTrendChart
                                data={reportData.salesTrend}
                            />


                            <PaymentDistributionChart
                                data={reportData.paymentDistribution}
                            />

                        </div>


                        <CategorySalesChart
                            data={reportData.categorySales}
                        />


                        <ReportsSummary
                            summary={reportData.summary}
                        />

                    </>
                )
            }

        </div>

    );

}


export default Reports;