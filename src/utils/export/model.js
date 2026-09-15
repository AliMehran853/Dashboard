import {
    formatDateForExport,
    formatTimeForExport,
} from './formatters';

/* ============================================================================
   BASIC HELPERS
   ========================================================================== */

const toNumber = (
    value
) => {
    const number =
        Number(value);

    return Number.isFinite(
        number
    )
        ? number
        : 0;
};

const text = (
    value,
    fallback = ''
) => {
    const result =
        String(
            value ?? ''
        ).trim();

    return (
        result ||
        fallback
    );
};

const translate = (
    t,
    key,
    fallback = ''
) => {
    if (
        typeof t !==
        'function'
    ) {
        return fallback;
    }

    if (!key) {
        return fallback;
    }

    const value =
        t(key);

    return (
        value &&
        value !== key
    )
        ? value
        : fallback;
};

/* ============================================================================
   SALE CALCULATIONS
   ========================================================================== */

export const getSaleTotal = (
    sale = {}
) => {
    const candidates = [
        sale.total,
        sale.totalAmount,
        sale.totalPrice,
        sale.amount,
        sale.saleAmount,
        sale.finalAmount,
        sale.finalPrice,
        sale.payableAmount,
        sale.grandTotal,
    ];

    for (
        const candidate of
            candidates
    ) {
        if (
            candidate === null ||
            candidate === undefined ||
            candidate === ''
        ) {
            continue;
        }

        const number =
            Number(candidate);

        if (
            Number.isFinite(
                number
            )
        ) {
            return number;
        }
    }

    const quantity =
        toNumber(
            sale.quantity ??
                sale.qty
        );

    const unitPrice =
        toNumber(
            sale.sellPrice ??
                sale.price ??
                sale.unitPrice
        );

    return (
        quantity *
        unitPrice
    );
};

export const getSaleQuantityInBase =
    (
        sale = {}
    ) => {
        const stored =
            Number(
                sale.quantityInBase
            );

        if (
            Number.isFinite(
                stored
            ) &&
            stored >= 0
        ) {
            return stored;
        }

        const quantity =
            Number(
                sale.quantity ??
                    sale.qty
            );

        const factor =
            Number(
                sale.saleFactor
            ) || 1;

        if (
            Number.isFinite(
                quantity
            )
        ) {
            return (
                quantity *
                factor
            );
        }

        return 0;
    };

/* ============================================================================
   PERIOD TRANSLATION
   ========================================================================== */

const PERIOD_TRANSLATION_KEYS = {
    all:
        'reports.filters.period.all',

    today:
        'reports.filters.period.today',

    yesterday:
        'common.yesterday',

    week:
        'reports.filters.period.week',

    month:
        'reports.filters.period.month',

    year:
        'reports.filters.period.year',
};

const PAYMENT_TRANSLATION_KEYS = {
    all:
        'reports.filters.payment.all',

    cash:
        'reports.filters.payment.cash',

    credit:
        'reports.filters.payment.credit',
};

/* ============================================================================
   PERIOD FALLBACK
   ========================================================================== */

const getPeriodFallback = (
    period,
    isEnglish
) => {
    const english = {
        all:
            'All Reports',

        today:
            'Today',

        yesterday:
            'Yesterday',

        week:
            'This Week',

        month:
            'This Month',

        year:
            'This Year',
    };

    const persian = {
        all:
            'تمام گزارش‌ها',

        today:
            'امروز',

        yesterday:
            'دیروز',

        week:
            'این هفته',

        month:
            'این ماه',

        year:
            'امسال',
    };

    return (
        (
            isEnglish
                ? english
                : persian
        )[period] ||
        (
            isEnglish
                ? english.week
                : persian.week
        )
    );
};

/* ============================================================================
   PAYMENT FALLBACK
   ========================================================================== */

const getPaymentFallback = (
    paymentType,
    isEnglish
) => {
    const english = {
        all:
            'All Payments',

        cash:
            'Cash',

        credit:
            'Credit',
    };

    const persian = {
        all:
            'همه پرداخت‌ها',

        cash:
            'نقدی',

        credit:
            'نسیه',
    };

    return (
        (
            isEnglish
                ? english
                : persian
        )[paymentType] ||
        (
            isEnglish
                ? english.all
                : persian.all
        )
    );
};

/* ============================================================================
   PAYMENT NORMALIZATION
   ========================================================================== */

const normalizePaymentType = (
    value
) =>
    String(
        value ?? ''
    )
        .trim()
        .toLowerCase();

const isCreditPayment = (
    value
) => {
    const normalized =
        normalizePaymentType(
            value
        );

    return (
        normalized ===
            'credit' ||
        normalized ===
            'نسیه'
    );
};

/* ============================================================================
   MAIN EXPORT MODEL
   ========================================================================== */

export const buildExportModel = ({
    reportData = {},
    period = 'week',
    paymentType = 'all',
    category = 'all',
    search = '',
    language = 'fa',
    t,
} = {}) => {
    const isEnglish =
        String(language)
            .toLowerCase()
            .startsWith('en');

    const exportLanguage =
        isEnglish
            ? 'en'
            : 'fa';

    const direction =
        isEnglish
            ? 'ltr'
            : 'rtl';

    const statistics =
        reportData.statistics ||
        {};

    const summary =
        reportData.summary ||
        {};

    const rawSales =
        Array.isArray(
            reportData.rawSales
        )
            ? reportData.rawSales
            : [];

    /* ---------------------------------------------------------------------- */
    /* LABELS                                                                  */
    /* ---------------------------------------------------------------------- */

    const labels = {
        title: translate(
            t,
            'reports.export.title',
            isEnglish
                ? 'Sales Report'
                : 'گزارش فروش'
        ),

        salesTitle: translate(
            t,
            'reports.export.salesTitle',
            isEnglish
                ? 'Sales Details'
                : 'جزئیات فروش'
        ),

        generatedBy: translate(
            t,
            'reports.export.generatedBy',
            isEnglish
                ? 'Generated by Shop Manager'
                : 'تهیه‌شده توسط سیستم مدیریت فروشگاه'
        ),

        printedAt: translate(
            t,
            'reports.export.printedAt',
            isEnglish
                ? 'Printed'
                : 'چاپ'
        ),

        page: translate(
            t,
            'reports.export.page',
            isEnglish
                ? 'Page {{current}} of {{total}}'
                : 'صفحه {{current}} از {{total}}'
        ),

        manager: translate(
            t,
            'reports.export.labels.manager',
            isEnglish
                ? 'Manager'
                : 'مدیر'
        ),

        period: translate(
            t,
            'reports.export.labels.period',
            isEnglish
                ? 'Period'
                : 'بازه'
        ),

        payment: translate(
            t,
            'reports.export.labels.payment',
            isEnglish
                ? 'Payment'
                : 'پرداخت'
        ),

        category: translate(
            t,
            'reports.export.labels.category',
            isEnglish
                ? 'Category'
                : 'دسته‌بندی'
        ),

        search: translate(
            t,
            'reports.export.labels.search',
            isEnglish
                ? 'Search'
                : 'جستجو'
        ),

        totalSales: translate(
            t,
            'reports.export.labels.totalSales',
            isEnglish
                ? 'Total Sales'
                : 'مبلغ کل فروش'
        ),

        transactions: translate(
            t,
            'reports.export.labels.transactions',
            isEnglish
                ? 'Transactions'
                : 'تعداد تراکنش'
        ),

        items: translate(
            t,
            'reports.export.labels.items',
            isEnglish
                ? 'Items Sold'
                : 'کالاهای فروخته‌شده'
        ),

        average: translate(
            t,
            'reports.export.labels.average',
            isEnglish
                ? 'Average Sale'
                : 'میانگین فروش'
        ),

        cash: translate(
            t,
            'reports.export.labels.cash',
            isEnglish
                ? 'Cash Sales'
                : 'فروش نقدی'
        ),

        credit: translate(
            t,
            'reports.export.labels.credit',
            isEnglish
                ? 'Credit Sales'
                : 'فروش نسیه'
        ),

        bestCategory: translate(
            t,
            'reports.export.labels.bestCategory',
            isEnglish
                ? 'Best Category'
                : 'بهترین دسته'
        ),

        date: translate(
            t,
            'reports.export.labels.date',
            isEnglish
                ? 'Date'
                : 'تاریخ'
        ),

        time: translate(
            t,
            'reports.export.labels.time',
            isEnglish
                ? 'Time'
                : 'ساعت'
        ),

        product: translate(
            t,
            'reports.export.labels.product',
            isEnglish
                ? 'Product'
                : 'محصول'
        ),

        quantity: translate(
            t,
            'reports.export.labels.quantity',
            isEnglish
                ? 'Quantity'
                : 'تعداد'
        ),

        amount: translate(
            t,
            'reports.export.labels.amount',
            isEnglish
                ? 'Amount'
                : 'مبلغ'
        ),

        paymentType: translate(
            t,
            'reports.export.labels.paymentType',
            isEnglish
                ? 'Payment'
                : 'پرداخت'
        ),

        customer: translate(
            t,
            'reports.export.labels.customer',
            isEnglish
                ? 'Customer'
                : 'مشتری'
        ),

        noData: translate(
            t,
            'reports.export.labels.noData',
            isEnglish
                ? 'No sales found'
                : 'فروشی ثبت نشده است'
        ),

        currency: translate(
            t,
            'common.currency',
            'AF'
        ),

        cashType: translate(
            t,
            'reports.filters.payment.cash',
            isEnglish
                ? 'Cash'
                : 'نقدی'
        ),

        creditType: translate(
            t,
            'reports.filters.payment.credit',
            isEnglish
                ? 'Credit'
                : 'نسیه'
        ),

        paymentChart: translate(
            t,
            'reports.export.charts.paymentOverview',
            isEnglish
                ? 'Payment Overview'
                : 'خلاصه پرداخت'
        ),

        categoryChart: translate(
            t,
            'reports.export.charts.topCategories',
            isEnglish
                ? 'Top Categories'
                : 'دسته‌های پرفروش'
        ),
    };

    /* ---------------------------------------------------------------------- */
    /* FILTERS                                                                 */
    /* ---------------------------------------------------------------------- */

    const periodKey =
        PERIOD_TRANSLATION_KEYS[
            period
        ];

    const paymentKey =
        PAYMENT_TRANSLATION_KEYS[
            paymentType
        ];

    const periodLabel =
        translate(
            t,
            periodKey,
            getPeriodFallback(
                period,
                isEnglish
            )
        );

    const paymentLabel =
        translate(
            t,
            paymentKey,
            getPaymentFallback(
                paymentType,
                isEnglish
            )
        );

    const categoryLabel =
        category === 'all'
            ? translate(
                  t,
                  'reports.filters.category.all',
                  isEnglish
                      ? 'All Categories'
                      : 'همه دسته‌ها'
              )
            : String(
                  category
              );

    /* ---------------------------------------------------------------------- */
    /* SALES                                                                    */
    /* ---------------------------------------------------------------------- */

    const sales =
        rawSales.map(
            (
                sale,
                index
            ) => {
                const dateValue =
                    sale.date ||
                    sale.createdAt ||
                    null;

                const paymentValue =
                    normalizePaymentType(
                        sale.paymentType
                    );

                const salePaymentType =
                    isCreditPayment(
                        paymentValue
                    )
                        ? 'credit'
                        : 'cash';

                const customer =
                    text(
                        sale.customerName
                    ) || '-';

                const date =
                    formatDateForExport(
                        dateValue,
                        exportLanguage
                    );

                const time =
                    formatTimeForExport(
                        dateValue,
                        exportLanguage
                    );

                return {
                    id:
                        sale.id ??
                        index + 1,

                    product:
                        text(
                            sale.productName
                        ) || '-',

                    category:
                        text(
                            sale.category
                        ) || '-',

                    quantity:
                        toNumber(
                            sale.quantity
                        ),

                    quantityInBase:
                        getSaleQuantityInBase(
                            sale
                        ),

                    saleUnit:
                        text(
                            sale.saleUnit ||
                                sale.baseUnit
                        ),

                    baseUnit:
                        text(
                            sale.baseUnit
                        ),

                    unitPrice:
                        toNumber(
                            sale.unitPrice
                        ),

                    amount:
                        getSaleTotal(
                            sale
                        ),

                    paymentType:
                        salePaymentType,

                    paymentLabel:
                        salePaymentType ===
                        'credit'
                            ? labels.creditType
                            : labels.cashType,

                    customer,

                    customerPhone:
                        text(
                            sale.customerPhone
                        ),

                    note:
                        text(
                            sale.note
                        ),

                    dateRaw:
                        dateValue,

                    date,

                    time,

                    dateTime:
                        time
                            ? `${date} ${time}`
                            : date,
                };
            }
        );

    /* ---------------------------------------------------------------------- */
    /* ANALYTICS                                                               */
    /* ---------------------------------------------------------------------- */

    const categorySales =
        Array.isArray(
            reportData.categorySales
        )
            ? reportData.categorySales.map(
                  (item) => ({
                      category:
                          text(
                              item?.category
                          ) ||
                          translate(
                              t,
                              'reports.charts.categorySales.uncategorized',
                              isEnglish
                                  ? 'Uncategorized'
                                  : 'بدون دسته‌بندی'
                          ),

                      sales:
                          toNumber(
                              item?.sales
                          ),
                  })
              )
            : [];

    const salesTrend =
        Array.isArray(
            reportData.salesTrend
        )
            ? reportData.salesTrend.map(
                  (item) => ({
                      label:
                          text(
                              item?.date
                          ),

                      isoDate:
                          item?.isoDate ||
                          '',

                      value:
                          toNumber(
                              item?.sales
                          ),
                  })
              )
            : [];

    const paymentDistribution =
        Array.isArray(
            reportData.paymentDistribution
        )
            ? reportData.paymentDistribution.map(
                  (item) => {
                      const normalized =
                          normalizePaymentType(
                              item?.name ||
                                  item?.key ||
                                  ''
                          );

                      const credit =
                          isCreditPayment(
                              normalized
                          );

                      return {
                          key:
                              credit
                                  ? 'credit'
                                  : 'cash',

                          label:
                              credit
                                  ? labels.creditType
                                  : labels.cashType,

                          value:
                              toNumber(
                                  item?.value
                              ),
                      };
                  }
              )
            : [
                  {
                      key:
                          'cash',

                      label:
                          labels.cashType,

                      value:
                          toNumber(
                              statistics.cashSales
                          ),
                  },

                  {
                      key:
                          'credit',

                      label:
                          labels.creditType,

                      value:
                          toNumber(
                              statistics.creditSales
                          ),
                  },
              ];

    /* ---------------------------------------------------------------------- */
    /* GENERATED DATE / TIME                                                   */
    /* ---------------------------------------------------------------------- */

    const generatedAt =
        new Date();

    const generatedDate =
        formatDateForExport(
            generatedAt,
            exportLanguage
        );

    const generatedTime =
        formatTimeForExport(
            generatedAt,
            exportLanguage
        );

    const generatedAtDisplay =
        generatedTime
            ? `${generatedDate} ${generatedTime}`
            : generatedDate;

    /* ---------------------------------------------------------------------- */
    /* RETURN MODEL                                                            */
    /* ---------------------------------------------------------------------- */

    return {
        language:
            exportLanguage,

        direction,

        locale:
            isEnglish
                ? 'en-US'
                : 'fa-IR',

        labels,

        filters: {
            period,

            periodLabel,

            paymentType,

            paymentLabel,

            category,

            categoryLabel,

            search:
                text(search),
        },

        meta: {
            generatedAt:
                generatedAt.toISOString(),

            generatedDate,

            generatedTime,

            generatedAtDisplay,
        },

        summary: {
            totalTransactions:
                toNumber(
                    statistics.totalTransactions ??
                        statistics.totalSales
                ),

            totalRevenue:
                toNumber(
                    statistics.totalRevenue
                ),

            cashSales:
                toNumber(
                    statistics.cashSales
                ),

            creditSales:
                toNumber(
                    statistics.creditSales
                ),

            totalItems:
                toNumber(
                    summary.totalItems
                ),

            averageSale:
                toNumber(
                    summary.averageSale
                ),

            bestCategory:
                text(
                    summary.bestCategory
                ) || '-',

            bestCategorySales:
                toNumber(
                    summary.bestCategorySales
                ),
        },

        sales,

        salesTrend,

        paymentDistribution,

        categorySales,
    };
};