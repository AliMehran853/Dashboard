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

import { useTranslation } from 'react-i18next';

import ReportsStats from '../components/reports/ReportsStats';
import ReportsFilters from '../components/reports/ReportsFilters';
import SalesTrendChart from '../components/reports/SalesTrendChart';
import PaymentDistributionChart from '../components/reports/PaymentDistributionChart';
import CategorySalesChart from '../components/reports/CategorySalesChart';
import ReportsSummary from '../components/reports/ReportsSummary';
import ReportsSalesTable from '../components/reports/ReportsSalesTable';
import SaleDetails from '../components/sales/SaleDetails';

import {
    getSalesReport,
    getReportCategories,
} from '../services/reportService';

import {
    exportReportToExcel,
    exportReportToSimplePDF,
    exportReportToColorPDF,
} from '../utils/export';

/* ============================================================================
   DEFAULT REPORT DATA
   ========================================================================== */

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

/* ============================================================================
   HELPERS
   ========================================================================== */

const asArray = (
    value
) =>
    Array.isArray(value)
        ? value
        : [];

const normalizeReportData = (
    result
) => {
    if (
        !result ||
        typeof result !==
            'object'
    ) {
        return createDefaultReportData();
    }

    const fallback =
        createDefaultReportData();

    return {
        statistics: {
            ...fallback.statistics,

            ...(result.statistics ||
                {}),
        },

        salesTrend:
            asArray(
                result.salesTrend
            ),

        paymentDistribution:
            asArray(
                result.paymentDistribution
            ),

        categorySales:
            asArray(
                result.categorySales
            ),

        summary: {
            ...fallback.summary,

            ...(result.summary ||
                {}),
        },

        rawSales:
            asArray(
                result.rawSales
            ),
    };
};

/* ============================================================================
   REPORTS
   ========================================================================== */

function Reports() {
    const { t, i18n } =
        useTranslation();

    const isEnglish =
        String(
            i18n.language ||
                'fa'
        )
            .toLowerCase()
            .startsWith('en');

    const direction =
        isEnglish
            ? 'ltr'
            : 'rtl';

    /* ---------------------------------------------------------------------- */
    /* EXPORT UI STATE                                                        */
    /* ---------------------------------------------------------------------- */

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

    const exportButtonRef =
        useRef(null);

    const exportMenuRef =
        useRef(null);

    const [
        menuStyle,
        setMenuStyle,
    ] = useState({});

    /* ---------------------------------------------------------------------- */
    /* FILTER STATE                                                           */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* REPORT STATE                                                           */
    /* ---------------------------------------------------------------------- */

    const [
        categories,
        setCategories,
    ] = useState([]);

    const [
        reportData,
        setReportData,
    ] = useState(
        createDefaultReportData()
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState('');

    const [
        selectedSale,
        setSelectedSale,
    ] = useState(null);

    /* =========================================================================
       LOAD CATEGORIES
       ======================================================================= */

    useEffect(() => {
        let cancelled = false;

        (
            async () => {
                try {
                    const result =
                        await getReportCategories();

                    if (
                        !cancelled
                    ) {
                        setCategories(
                            asArray(
                                result
                            )
                        );
                    }
                } catch (
                    err
                ) {
                    console.error(
                        'Failed to load report categories:',
                        err
                    );

                    if (
                        !cancelled
                    ) {
                        setCategories(
                            []
                        );
                    }
                }
            }
        )();

        return () => {
            cancelled = true;
        };
    }, []);

    /* =========================================================================
       LOAD REPORT
       ======================================================================= */

    useEffect(() => {
        let cancelled = false;

        (
            async () => {
                try {
                    setLoading(
                        true
                    );

                    setError(
                        ''
                    );

                    const result =
                        await getSalesReport(
                            {
                                period,

                                paymentType,

                                category,

                                search,
                            }
                        );

                    if (
                        !cancelled
                    ) {
                        setReportData(
                            normalizeReportData(
                                result
                            )
                        );
                    }
                } catch (
                    err
                ) {
                    console.error(
                        'Failed to load report:',
                        err
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
            }
        )();

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

    /* =========================================================================
       EXPORT MENU POSITION
       ======================================================================= */

    useLayoutEffect(() => {
        if (
            !exportOpen
        ) {
            return undefined;
        }

        const compute =
            () => {
                const node =
                    exportButtonRef.current;

                if (!node) {
                    return {};
                }

                const rect =
                    node.getBoundingClientRect();

                const margin =
                    8;

                const style = {
                    position:
                        'fixed',

                    top:
                        rect.bottom +
                        margin,

                    zIndex:
                        9999,
                };

                if (
                    isEnglish
                ) {
                    style.right =
                        Math.max(
                            margin,

                            window.innerWidth -
                                rect.right
                        );

                    style.left =
                        'auto';
                } else {
                    style.left =
                        Math.max(
                            margin,

                            rect.left
                        );

                    style.right =
                        'auto';
                }

                return style;
            };

        setMenuStyle(
            compute()
        );

        const reposition =
            () => {
                setMenuStyle(
                    compute()
                );
            };

        window.addEventListener(
            'resize',
            reposition
        );

        window.addEventListener(
            'scroll',
            reposition,
            true
        );

        return () => {
            window.removeEventListener(
                'resize',
                reposition
            );

            window.removeEventListener(
                'scroll',
                reposition,
                true
            );
        };
    }, [
        exportOpen,
        isEnglish,
    ]);

    /* =========================================================================
       OUTSIDE CLICK
       ======================================================================= */

    useEffect(() => {
        if (
            !exportOpen
        ) {
            return undefined;
        }

        const handler = (
            event
        ) => {
            if (
                exportMenuRef.current?.contains(
                    event.target
                )
            ) {
                return;
            }

            if (
                exportButtonRef.current?.contains(
                    event.target
                )
            ) {
                return;
            }

            setExportOpen(
                false
            );
        };

        document.addEventListener(
            'mousedown',
            handler
        );

        return () => {
            document.removeEventListener(
                'mousedown',
                handler
            );
        };
    }, [
        exportOpen,
    ]);

    /* =========================================================================
       FILTER ACTIONS
       ======================================================================= */

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

    /* =========================================================================
       EXPORT MENU
       ======================================================================= */

    const handleExportClick =
        () => {
            setExportError(
                ''
            );

            setExportOpen(
                (
                    value
                ) =>
                    !value
            );
        };

    /* =========================================================================
       EXPORT RUNNER
       ======================================================================= */

    const runExport =
        async (
            exportFunction
        ) => {
            if (
                exporting
            ) {
                return;
            }

            try {
                setExporting(
                    true
                );

                setExportError(
                    ''
                );

                await exportFunction(
                    {
                        reportData,

                        period,

                        paymentType,

                        category,

                        search,

                        language:
                            i18n.language,

                        t,
                    }
                );

                setExportOpen(
                    false
                );
            } catch (
                err
            ) {
                console.error(
                    'Export failed:',
                    err
                );

                setExportError(
                    t(
                        'reports.errors.export'
                    )
                );
            } finally {
                setExporting(
                    false
                );
            }
        };

    /* =========================================================================
       EXPORT ACTIONS
       ======================================================================= */

    const handleExportExcel =
        () =>
            runExport(
                exportReportToExcel
            );

    const handleExportPdfColor =
        () =>
            runExport(
                exportReportToColorPDF
            );

    const handleExportPdfSimple =
        () =>
            runExport(
                exportReportToSimplePDF
            );

    /* =========================================================================
       RENDER
       ======================================================================= */

    return (
        <div
            dir={direction}
            className="min-h-full space-y-5 pb-6 text-[var(--text-secondary)]"
        >
            {/* ================================================================
                PAGE HEADER
            ================================================================= */}

            <section className="ui-card-tint p-4 sm:p-5 md:p-6">
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent-500)]">
                            <BarChart3
                                size={20}
                                strokeWidth={1.9}
                            />
                        </div>

                        <div className="min-w-0">
                            <h1 className="truncate text-xl font-semibold tracking-[-0.02em] text-[var(--text)] sm:text-2xl lg:text-3xl">
                                {t(
                                    'reports.page.title'
                                )}
                            </h1>

                            <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--text-muted)] sm:text-sm">
                                {t(
                                    'reports.page.description'
                                )}
                            </p>
                        </div>
                    </div>

                    <div
                        ref={
                            exportButtonRef
                        }
                        className="relative w-full sm:w-auto"
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
                            aria-haspopup="menu"
                            aria-expanded={
                                exportOpen
                            }
                            className="ui-button-secondary group w-full px-4 text-xs font-medium sm:w-auto"
                        >
                            {exporting ? (
                                <Loader2
                                    size={
                                        15
                                    }
                                    className="animate-spin"
                                />
                            ) : (
                                <Download
                                    size={
                                        15
                                    }
                                />
                            )}

                            {exporting
                                ? t(
                                      'reports.actions.exporting'
                                  )
                                : t(
                                      'reports.actions.export'
                                  )}
                        </button>
                    </div>
                </div>
            </section>

            {/* ================================================================
                EXPORT MENU
            ================================================================= */}

            {exportOpen &&
                createPortal(
                    <div
                        ref={
                            exportMenuRef
                        }
                        style={
                            menuStyle
                        }
                        data-export-menu="true"
                        className="ui-glass-tint w-64 max-w-[calc(100vw-1rem)] overflow-hidden rounded-2xl border border-[var(--glass-border)] p-1.5 shadow-2xl shadow-black/25 sm:w-72"
                    >
                        <div className="ui-layer">
                            <div className="border-b border-[var(--border-subtle)] px-3 py-3">
                                <p className="text-sm font-semibold text-[var(--text)]">
                                    {t(
                                        'reports.actions.export'
                                    )}
                                </p>

                                <p className="mt-1 text-[10px] leading-5 text-[var(--text-muted)]">
                                    {t(
                                        'reports.actions.exportMenuHint'
                                    )}
                                </p>
                            </div>

                            <div className="space-y-1 p-1">
                                <ExportItem
                                    onClick={
                                        handleExportExcel
                                    }
                                    disabled={
                                        exporting
                                    }
                                    icon={
                                        FileSpreadsheet
                                    }
                                    iconClass="border-emerald-500/20 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400"
                                    title={t(
                                        'reports.actions.exportExcel'
                                    )}
                                    description={t(
                                        'reports.actions.exportExcelDesc'
                                    )}
                                />

                                <ExportItem
                                    onClick={
                                        handleExportPdfColor
                                    }
                                    disabled={
                                        exporting
                                    }
                                    icon={
                                        FileText
                                    }
                                    iconClass="border-sky-500/20 bg-sky-500/10 text-sky-500 dark:text-sky-400"
                                    title={t(
                                        'reports.actions.exportPdfColor'
                                    )}
                                    description={t(
                                        'reports.actions.exportPdfColorDesc'
                                    )}
                                />

                                <ExportItem
                                    onClick={
                                        handleExportPdfSimple
                                    }
                                    disabled={
                                        exporting
                                    }
                                    icon={
                                        FileText
                                    }
                                    iconClass="border-slate-500/20 bg-slate-500/10 text-slate-500 dark:text-slate-400"
                                    title={t(
                                        'reports.actions.exportPdfMono'
                                    )}
                                    description={t(
                                        'reports.actions.exportPdfMonoDesc'
                                    )}
                                />
                            </div>
                        </div>
                    </div>,
                    document.body
                )}

            {/* ================================================================
                ERRORS
            ================================================================= */}

            {exportError && (
                <ErrorBanner
                    message={
                        exportError
                    }
                />
            )}

            {error && (
                <ErrorBanner
                    message={error}
                />
            )}

            {/* ================================================================
                CONTENT
            ================================================================= */}

            {loading ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 text-[var(--text-muted)]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-soft)]">
                        <Loader2
                            size={26}
                            className="animate-spin text-[var(--accent-500)]"
                        />
                    </div>

                    <span className="text-sm">
                        {t(
                            'reports.loading'
                        )}
                    </span>
                </div>
            ) : (
                <>
                    <ReportsStats
                        statistics={
                            reportData.statistics
                        }
                    />

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

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
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

                    <ReportsSalesTable
                        onViewSale={
                            setSelectedSale
                        }
                    />
                </>
            )}

            {/* ================================================================
                SALE DETAILS
            ================================================================= */}

            {selectedSale && (
                <SaleDetails
                    sale={
                        selectedSale
                    }
                    onClose={() =>
                        setSelectedSale(
                            null
                        )
                    }
                />
            )}
        </div>
    );
}

/* ============================================================================
   EXPORT MENU ITEM
   ========================================================================== */

function ExportItem({
    onClick,
    disabled,
    icon: Icon,
    iconClass,
    title,
    description,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex w-full items-center gap-3 rounded-xl p-3 text-start transition-all duration-200 hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-50"
        >
            <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}
            >
                <Icon size={18} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[var(--text)]">
                    {title}
                </p>

                <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">
                    {
                        description
                    }
                </p>
            </div>
        </button>
    );
}

/* ============================================================================
   ERROR
   ========================================================================== */

function ErrorBanner({
    message,
}) {
    return (
        <div
            role="alert"
            className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-xs leading-5 text-red-500 dark:text-red-400 sm:text-sm"
        >
            {
                message
            }
        </div>
    );
}

export default Reports;