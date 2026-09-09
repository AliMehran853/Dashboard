import {
    useEffect,
    useState,
} from 'react';

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

        totalSales:
            0,

        totalTransactions:
            0,

        cashSales:
            0,

        creditSales:
            0,

        totalRevenue:
            0,

    },


    salesTrend: [],


    paymentDistribution: [],


    categorySales: [],


    summary: {

        bestCategory:
            '-',

        bestCategorySales:
            0,

        averageSale:
            0,

        totalItems:
            0,

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

            Array.isArray(
                result.salesTrend
            )
                ? result.salesTrend
                : [],


        paymentDistribution:

            Array.isArray(
                result.paymentDistribution
            )
                ? result.paymentDistribution
                : [],


        categorySales:

            Array.isArray(
                result.categorySales
            )
                ? result.categorySales
                : [],


        summary: {

            ...fallback.summary,

            ...(result.summary || {}),

        },


        rawSales:

            Array.isArray(
                result.rawSales
            )
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
        String(
            language
        )
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

        let cancelled =
            false;


        const loadCategories =
            async () => {

                try {

                    const result =
                        await getReportCategories();


                    if (
                        cancelled
                    ) {

                        return;

                    }


                    setCategories(
                        Array.isArray(
                            result
                        )
                            ? result
                            : []
                    );

                } catch (
                    loadError
                ) {

                    console.error(
                        'Failed to load report categories:',
                        loadError
                    );


                    if (
                        !cancelled
                    ) {

                        setCategories([]);

                    }

                }

            };


        loadCategories();


        return () => {

            cancelled =
                true;

        };

    }, []);


    // =====================================================
    // Load Report
    // =====================================================

    useEffect(() => {

        let cancelled =
            false;


        const loadReport =
            async () => {

                try {

                    setLoading(
                        true
                    );

                    setError('');


                    const result =
                        await getSalesReport({

                            period,

                            paymentType,

                            category,

                            search,

                        });


                    if (
                        cancelled
                    ) {

                        return;

                    }


                    setReportData(
                        normalizeReportData(
                            result
                        )
                    );

                } catch (
                    loadError
                ) {

                    console.error(
                        'Failed to load report:',
                        loadError
                    );


                    if (
                        !cancelled
                    ) {

                        setReportData(
                            createDefaultReportData()
                        );


                        setError(
                            t(
                                'reports.errors.load'
                            )
                        );

                    }

                } finally {

                    if (
                        !cancelled
                    ) {

                        setLoading(
                            false
                        );

                    }

                }

            };


        loadReport();


        return () => {

            cancelled =
                true;

        };

    }, [
        period,
        paymentType,
        category,
        search,
        t,
    ]);


    // =====================================================
    // Clear Filters
    // =====================================================

    const handleClearFilters =
        () => {

            setSearch('');

            setPeriod(
                'week'
            );

            setPaymentType(
                'all'
            );

            setCategory(
                'all'
            );

        };


    // =====================================================
    // Open Export
    // =====================================================

    const handleExportClick =
        () => {

            setExportError('');

            setExportOpen(
                (
                    current
                ) =>
                    !current
            );

        };


    // =====================================================
    // Export Excel
    // =====================================================

    const handleExportExcel =
        async () => {

            if (
                exporting
            ) {

                return;

            }


            try {

                setExporting(
                    true
                );

                setExportError('');


                exportReportToExcel({

                    reportData,

                    period,

                    paymentType,

                    category,

                    search,

                    language:
                        i18n.language,

                });


                setExportOpen(
                    false
                );

            } catch (
                exportException
            ) {

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

                setExporting(
                    false
                );

            }

        };


    // =====================================================
    // Export PDF
    // =====================================================

    const handleExportPDF =
        async () => {

            if (
                exporting
            ) {

                return;

            }


            try {

                setExporting(
                    true
                );

                setExportError('');


                await exportReportToPDF({

                    reportData,

                    period,

                    paymentType,

                    category,

                    search,

                    language:
                        i18n.language,

                });


                setExportOpen(
                    false
                );

            } catch (
                exportException
            ) {

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

                setExporting(
                    false
                );

            }

        };


    // =====================================================
    // Render
    // =====================================================

    return (

        <div
            dir={
                direction
            }

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
                    overflow-hidden

                    rounded-2xl

                    border
                    border-[var(--border-subtle)]

                    bg-[var(--surface)]

                    p-4

                    shadow-[var(--shadow-sm)]

                    transition-colors
                    duration-300

                    sm:p-5
                    md:p-6
                "
            >

                {/* Accent glow */}

                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none

                        absolute
                        -start-16
                        -top-20

                        h-48
                        w-48

                        rounded-full

                        bg-emerald-500/[0.06]

                        blur-3xl

                        dark:bg-emerald-400/[0.055]
                    "
                />


                <div
                    aria-hidden="true"
                    className="
                        pointer-events-none

                        absolute
                        -end-16
                        -bottom-24

                        h-44
                        w-44

                        rounded-full

                        bg-indigo-500/[0.025]

                        blur-3xl

                        dark:bg-indigo-400/[0.035]
                    "
                />


                <div
                    className="
                        relative

                        flex
                        flex-col
                        gap-4

                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                    "
                >

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
                                border-emerald-500/10

                                bg-emerald-500/10
                            "
                        >

                            <BarChart3
                                size={20}
                                className="
                                    text-emerald-500
                                    dark:text-emerald-400
                                "
                            />

                        </div>


                        <div
                            className="
                                min-w-0
                            "
                        >

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
                                        bg-emerald-500
                                        shadow-[0_0_12px_rgba(16,185,129,0.35)]
                                    "
                                />

                                <span
                                    className="
                                        text-[10px]
                                        font-medium
                                        uppercase
                                        tracking-[0.12em]
                                        text-emerald-600
                                        dark:text-emerald-400
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
                                {
                                    t(
                                        'reports.page.title'
                                    )
                                }
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
                                {
                                    t(
                                        'reports.page.description'
                                    )
                                }
                            </p>

                        </div>

                    </div>


                    {/* =================================================
                        Export Area
                    ================================================== */}

                    <div
                        className="
                            relative
                            z-[60]
                            w-full
                            lg:w-auto
                        "
                    >

                        <button
                            type="button"
                            onClick={
                                handleExportClick
                            }
                            disabled={
                                loading ||
                                exporting
                            }
                            className="
                                flex
                                h-10
                                w-full
                                items-center
                                justify-center
                                gap-2

                                rounded-xl

                                border
                                border-[var(--border)]

                                bg-[var(--surface-muted)]

                                px-4

                                text-xs
                                font-medium

                                text-[var(--text-secondary)]

                                transition-all
                                duration-200

                                hover:border-emerald-500/20
                                hover:bg-emerald-500/5
                                hover:text-emerald-600

                                dark:hover:text-emerald-400

                                disabled:cursor-not-allowed
                                disabled:opacity-50

                                lg:w-auto
                            "
                        >

                            {
                                exporting
                                    ? (
                                        <Loader2
                                            size={15}
                                            className="
                                                animate-spin
                                            "
                                        />
                                    )
                                    : (
                                        <Download
                                            size={15}
                                        />
                                    )
                            }


                            {
                                exporting
                                    ? (
                                        t(
                                            'reports.actions.exporting',
                                            {
                                                defaultValue:
                                                    isEnglish
                                                        ? 'Preparing...'
                                                        : 'در حال آماده‌سازی...',
                                            }
                                        )
                                    )
                                    : (
                                        t(
                                            'reports.actions.export'
                                        )
                                    )
                            }

                        </button>


                        {/* =================================================
                            Export Menu
                        ================================================== */}

                        {
                            exportOpen && (

                                <>

                                    {/* Backdrop */}

                                    <button
                                        type="button"
                                        aria-label={
                                            t(
                                                'common.closeMenu',
                                                {
                                                    defaultValue:
                                                        isEnglish
                                                            ? 'Close menu'
                                                            : 'بستن منو',
                                                }
                                            )
                                        }
                                        onClick={() =>
                                            setExportOpen(
                                                false
                                            )
                                        }
                                        className="
                                            fixed
                                            inset-0
                                            z-40
                                            cursor-default
                                            bg-black/5
                                        "
                                    />


                                    {/* =================================================
                                        Export Dropdown
                                    ================================================== */}

                                    <div
                                        className={`
                                            absolute
                                            top-full
                                            z-[70]
                                            mt-2

                                            overflow-hidden

                                            rounded-2xl

                                            border
                                            border-[var(--border)]

                                            bg-[var(--surface)]/95

                                            p-1.5

                                            shadow-2xl
                                            shadow-black/15

                                            backdrop-blur-md
                                            backdrop-saturate-150

                                            w-64
                                            max-w-[calc(100vw-1rem)]

                                            sm:w-72
                                            sm:max-w-none

                                            ${
                                                isEnglish
                                                    ? `
                                                        right-0
                                                        left-auto
                                                    `
                                                    : `
                                                        left-0
                                                        right-auto
                                                    `
                                            }
                                        `}
                                    >

                                        {/* Glass Overlay */}

                                        <div
                                            className="
                                                pointer-events-none
                                                absolute
                                                inset-0
                                                bg-white/20
                                                dark:bg-white/[0.015]
                                            "
                                        />


                                        <div
                                            className="
                                                relative
                                                z-10
                                            "
                                        >

                                            {/* =================================================
                                                Menu Header
                                            ================================================== */}

                                            <div
                                                className="
                                                    border-b
                                                    border-[var(--border)]
                                                    px-3
                                                    py-3
                                                "
                                            >

                                                <p
                                                    className="
                                                        text-sm
                                                        font-semibold
                                                        text-[var(--text-primary)]
                                                    "
                                                >
                                                    {
                                                        t(
                                                            'reports.actions.export'
                                                        )
                                                    }
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


                                            {/* =================================================
                                                Menu Items
                                            ================================================== */}

                                            <div
                                                className="
                                                    space-y-1
                                                    p-1
                                                "
                                            >

                                                {/* =================================================
                                                    Excel
                                                ================================================== */}

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleExportExcel
                                                    }
                                                    disabled={
                                                        exporting
                                                    }
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
                                                        hover:bg-emerald-500/5
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
                                                            border-emerald-500/10
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


                                                    <div
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-[var(--text-primary)]
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


                                                {/* =================================================
                                                    PDF
                                                ================================================== */}

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleExportPDF
                                                    }
                                                    disabled={
                                                        exporting
                                                    }
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
                                                        hover:bg-rose-500/5
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
                                                            border-rose-500/10
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


                                                    <div
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                text-sm
                                                                font-semibold
                                                                text-[var(--text-primary)]
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

                                    </div>

                                </>

                            )
                        }

                    </div>

                </div>

            </section>


            {/* =================================================
                Export Error
            ================================================== */}

            {
                exportError && (

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

                            text-[var(--danger)]

                            sm:text-sm
                        "
                    >
                        {
                            exportError
                        }
                    </div>

                )
            }


            {/* =================================================
                Filters
            ================================================== */}

            <ReportsFilters

                search={
                    search
                }

                period={
                    period
                }

                paymentType={
                    paymentType
                }

                category={
                    category
                }

                categories={
                    categories
                }

                onSearchChange={
                    setSearch
                }

                onPeriodChange={
                    setPeriod
                }

                onPaymentTypeChange={
                    setPaymentType
                }

                onCategoryChange={
                    setCategory
                }

                onClearFilters={
                    handleClearFilters
                }

            />


            {/* =================================================
                Error
            ================================================== */}

            {
                error && (

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

                            text-[var(--danger)]

                            sm:text-sm
                        "
                    >
                        {
                            error
                        }
                    </div>

                )
            }


            {/* =================================================
                Loading / Report
            ================================================== */}

            {
                loading

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
                                    border-emerald-500/10

                                    bg-emerald-500/5
                                "
                            >

                                <Loader2
                                    size={26}
                                    className="
                                        animate-spin
                                        text-emerald-500
                                        dark:text-emerald-400
                                    "
                                />

                            </div>


                            <span
                                className="
                                    text-sm
                                "
                            >
                                {
                                    t(
                                        'reports.loading'
                                    )
                                }
                            </span>

                        </div>

                    )

                    : (

                        <>

                            <ReportsStats
                                statistics={
                                    reportData.statistics
                                }
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
                                    data={
                                        reportData.salesTrend
                                    }
                                />


                                <PaymentDistributionChart
                                    data={
                                        reportData.paymentDistribution
                                    }
                                />

                            </div>


                            <CategorySalesChart
                                data={
                                    reportData.categorySales
                                }
                            />


                            <ReportsSummary
                                summary={
                                    reportData.summary
                                }
                            />

                        </>

                    )
            }

        </div>

    );

}


export default Reports;