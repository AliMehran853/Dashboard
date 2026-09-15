import html2canvas from 'html2canvas';

import {
    jsPDF,
} from 'jspdf';

import {
    formatJalaliDate,
} from '../date/jalali';


// =========================================================
// Constants
// =========================================================

const STORE_SETTINGS_KEY =
    'storeSettings';


// =========================================================
// Safe Number
// =========================================================

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


// =========================================================
// Safe String
// =========================================================

const toString = (
    value
) => {

    if (
        value === null ||
        value === undefined
    ) {

        return '';

    }


    return String(
        value
    ).trim();

};


// =========================================================
// Sale Amount
// =========================================================

const getSaleAmount = (
    sale
) => {

    if (!sale) {

        return 0;

    }


    const directAmount =
        Number(
            sale.totalAmount ??
            sale.total ??
            sale.amount ??
            sale.saleAmount ??
            sale.finalAmount ??
            sale.finalPrice ??
            sale.payableAmount ??
            sale.grandTotal
        );


    if (
        Number.isFinite(
            directAmount
        )
    ) {

        return directAmount;

    }


    const price =
        Number(
            sale.sellPrice ??
            sale.price ??
            sale.unitPrice ??
            0
        );


    const quantity =
        Number(
            sale.quantity ??
            sale.qty ??
            1
        );


    if (
        Number.isFinite(price) &&
        Number.isFinite(quantity)
    ) {

        return (
            price *
            quantity
        );

    }


    return 0;

};


// =========================================================
// Sale Date
// =========================================================

const getSaleDate = (
    sale
) => {

    return (
        sale?.date ||
        sale?.createdAt ||
        sale?.updatedAt ||
        null
    );

};


// =========================================================
// Format Date
// =========================================================

const formatDate = (
    value,
    language
) => {

    if (!value) {

        return '-';

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return '-';

    }


    const isEnglish =
        String(
            language || ''
        )
            .toLowerCase()
            .startsWith(
                'en'
            );


    if (isEnglish) {

        return new Intl.DateTimeFormat(
            'en-US',
            {
                year:
                    'numeric',

                month:
                    '2-digit',

                day:
                    '2-digit',
            }
        ).format(
            date
        );

    }


    return (
        formatJalaliDate(
            date,
            {
                monthStyle:
                    'af',

                withMonthName:
                    true,
            }
        ) ||
        '-'
    );

};


// =========================================================
// Format Time
// =========================================================

const formatTime = (
    value,
    language
) => {

    if (!value) {

        return '-';

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return '-';

    }


    return new Intl.DateTimeFormat(
        String(
            language || ''
        )
            .toLowerCase()
            .startsWith('en')
            ? 'en-US'
            : 'fa-AF',
        {
            hour:
                '2-digit',

            minute:
                '2-digit',
        }
    ).format(
        date
    );

};


// =========================================================
// Money
// =========================================================

const formatMoney = (
    value,
    language
) => {

    return Number(
        value || 0
    ).toLocaleString(
        String(
            language || ''
        )
            .toLowerCase()
            .startsWith('en')
            ? 'en-US'
            : 'fa-IR'
    );

};


// =========================================================
// Payment Label
// =========================================================

const getPaymentLabel = (
    paymentType,
    language
) => {

    const value =
        toString(
            paymentType
        ).toLowerCase();


    const isEnglish =
        String(
            language || ''
        )
            .toLowerCase()
            .startsWith(
                'en'
            );


    if (
        value === 'credit' ||
        value === 'نسیه'
    ) {

        return isEnglish
            ? 'Credit'
            : 'نسیه';

    }


    return isEnglish
        ? 'Cash'
        : 'نقدی';

};


// =========================================================
// Store Settings
// =========================================================

const getStoreSettings = () => {

    try {

        const stored =
            localStorage.getItem(
                STORE_SETTINGS_KEY
            );


        if (!stored) {

            return {

                storeName:
                    'فروشگاه من',

                ownerName:
                    'مدیر فروشگاه',

                phone:
                    '',

                address:
                    '',

            };

        }


        const parsed =
            JSON.parse(
                stored
            );


        return {

            storeName:
                toString(
                    parsed?.storeName
                ) ||
                'فروشگاه من',

            ownerName:
                toString(
                    parsed?.ownerName
                ) ||
                'مدیر فروشگاه',

            phone:
                toString(
                    parsed?.phone
                ),

            address:
                toString(
                    parsed?.address
                ),

        };

    } catch {

        return {

            storeName:
                'فروشگاه من',

            ownerName:
                'مدیر فروشگاه',

            phone:
                '',

            address:
                '',

        };

    }

};


// =========================================================
// Escape HTML
// =========================================================

const escapeHtml = (
    value
) => {

    return String(
        value ?? ''
    )
        .replace(
            /&/g,
            '&amp;'
        )
        .replace(
            /</g,
            '&lt;'
        )
        .replace(
            />/g,
            '&gt;'
        )
        .replace(
            /"/g,
            '&quot;'
        )
        .replace(
            /'/g,
            '&#039;'
        );

};


// =========================================================
// Period Label
// =========================================================

const getPeriodLabel = (
    period,
    language
) => {

    const isEnglish =
        String(
            language || ''
        )
            .toLowerCase()
            .startsWith(
                'en'
            );


    const labels = {

        all:
            isEnglish
                ? 'All'
                : 'همه',

        today:
            isEnglish
                ? 'Today'
                : 'امروز',

        week:
            isEnglish
                ? 'This Week'
                : 'این هفته',

        month:
            isEnglish
                ? 'This Month'
                : 'این ماه',

    };


    return (
        labels[
            period
        ] ||
        labels.week
    );

};


// =========================================================
// Build Report Page
// =========================================================

const buildReportPage = ({
    reportData,
    salesChunk,
    pageNumber,
    totalPages,
    language,
    period,
    paymentType,
    category,
    search,
    store,
}) => {

    const isEnglish =
        String(
            language || ''
        )
            .toLowerCase()
            .startsWith(
                'en'
            );


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


    const paymentDistribution =
        Array.isArray(
            reportData.paymentDistribution
        )
            ? reportData.paymentDistribution
            : [];


    const categorySales =
        Array.isArray(
            reportData.categorySales
        )
            ? reportData.categorySales
            : [];


    const title =
        isEnglish
            ? 'Sales Report'
            : 'گزارش فروش';


    const summaryTitle =
        isEnglish
            ? 'Report Summary'
            : 'خلاصه گزارش';


    const salesTitle =
        isEnglish
            ? 'Sales Details'
            : 'جزئیات فروش';


    const labels = {

        store:
            isEnglish
                ? 'Store'
                : 'فروشگاه',

        manager:
            isEnglish
                ? 'Manager'
                : 'مدیر',

        period:
            isEnglish
                ? 'Period'
                : 'بازه',

        payment:
            isEnglish
                ? 'Payment'
                : 'پرداخت',

        category:
            isEnglish
                ? 'Category'
                : 'دسته‌بندی',

        totalSales:
            isEnglish
                ? 'Total Sales'
                : 'مبلغ کل فروش',

        transactions:
            isEnglish
                ? 'Transactions'
                : 'تراکنش‌ها',

        items:
            isEnglish
                ? 'Items Sold'
                : 'کالاهای فروخته‌شده',

        average:
            isEnglish
                ? 'Average Sale'
                : 'متوسط فروش',

        cash:
            isEnglish
                ? 'Cash Sales'
                : 'فروش نقدی',

        credit:
            isEnglish
                ? 'Credit Sales'
                : 'فروش نسیه',

        bestCategory:
            isEnglish
                ? 'Best Category'
                : 'بهترین دسته',

        date:
            isEnglish
                ? 'Date'
                : 'تاریخ',

        time:
            isEnglish
                ? 'Time'
                : 'زمان',

        product:
            isEnglish
                ? 'Product'
                : 'محصول',

        quantity:
            isEnglish
                ? 'Qty'
                : 'تعداد',

        amount:
            isEnglish
                ? 'Amount'
                : 'مبلغ',

        paymentType:
            isEnglish
                ? 'Payment'
                : 'نوع پرداخت',

        customer:
            isEnglish
                ? 'Customer'
                : 'مشتری',

    };


    const totalSales =
        Number(
            statistics.totalRevenue ??
            statistics.totalSales ??
            0
        );


    const totalTransactions =
        Number(
            statistics.totalTransactions ??
            0
        );


    const totalItems =
        Number(
            summary.totalItems ??
            0
        );


    const averageSale =
        Number(
            summary.averageSale ??
            0
        );


    const cashSales =
        Number(
            statistics.cashSales ??
            0
        );


    const creditSales =
        Number(
            statistics.creditSales ??
            0
        );


    const paymentRows =
        paymentDistribution
            .map(
                (item) => `

                    <div class="mini-row">

                        <span>
                            ${escapeHtml(
                                getPaymentLabel(
                                    item?.name,
                                    language
                                )
                            )}
                        </span>

                        <strong>
                            ${formatMoney(
                                item?.value,
                                language
                            )}
                        ${
                            isEnglish
                                ? ' AF'
                                : ' افغانی'
                        }
                        </strong>

                    </div>

                `
            )
            .join(
                ''
            );


    const topCategories =
        categorySales
            .slice(
                0,
                5
            )
            .map(
                (item) => `

                    <div class="mini-row">

                        <span>
                            ${escapeHtml(
                                item?.category ||
                                '-'
                            )}
                        </span>

                        <strong>
                            ${formatMoney(
                                item?.sales,
                                language
                            )}
                        ${
                            isEnglish
                                ? ' AF'
                                : ' افغانی'
                        }
                        </strong>

                    </div>

                `
            )
            .join(
                ''
            );


    const salesRows =
        salesChunk
            .map(
                (sale) => `

                    <tr>

                        <td>
                            ${escapeHtml(
                                formatDate(
                                    getSaleDate(
                                        sale
                                    ),
                                    language
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                formatTime(
                                    getSaleDate(
                                        sale
                                    ),
                                    language
                                )
                            )}
                        </td>

                        <td class="product">
                            ${escapeHtml(
                                sale?.productName ||
                                '-'
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                sale?.category ||
                                '-'
                            )}
                        </td>

                        <td class="number">
                            ${escapeHtml(
                                Number(
                                    sale?.quantity ??
                                    sale?.qty ??
                                    1
                                ).toLocaleString(
                                    isEnglish
                                        ? 'en-US'
                                        : 'fa-IR'
                                )
                            )}
                        </td>

                        <td class="number">
                            ${escapeHtml(
                                formatMoney(
                                    getSaleAmount(
                                        sale
                                    ),
                                    language
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                getPaymentLabel(
                                    sale?.paymentType,
                                    language
                                )
                            )}
                        </td>

                        <td>
                            ${escapeHtml(
                                sale?.customerName ||
                                '-'
                            )}
                        </td>

                    </tr>

                `
            )
            .join(
                ''
            );


    return `

        <div
            class="report-page"
            dir="${direction}"
        >

            <div class="top-line"></div>


            <header class="header">

                <div>

                    <div class="eyebrow">
                        ${escapeHtml(
                            isEnglish
                                ? 'STORE MANAGEMENT'
                                : 'مدیریت فروشگاه'
                        )}
                    </div>


                    <h1>
                        ${escapeHtml(
                            title
                        )}
                    </h1>


                    <p>
                        ${escapeHtml(
                            store.storeName
                        )}
                    </p>

                </div>


                <div class="manager-box">

                    <span>
                        ${escapeHtml(
                            labels.manager
                        )}
                    </span>


                    <strong>
                        ${escapeHtml(
                            store.ownerName
                        )}
                    </strong>

                </div>

            </header>


            <section class="meta">

                <div>

                    <span>
                        ${escapeHtml(
                            labels.period
                        )}
                    </span>


                    <strong>
                        ${escapeHtml(
                            getPeriodLabel(
                                period,
                                language
                            )
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        ${escapeHtml(
                            labels.payment
                        )}
                    </span>


                    <strong>

                        ${escapeHtml(
                            paymentType === 'all'
                                ? (
                                    isEnglish
                                        ? 'All'
                                        : 'همه'
                                )
                                : getPaymentLabel(
                                    paymentType,
                                    language
                                )
                        )}

                    </strong>

                </div>


                <div>

                    <span>
                        ${escapeHtml(
                            labels.category
                        )}
                    </span>


                    <strong>

                        ${escapeHtml(
                            category === 'all'
                                ? (
                                    isEnglish
                                        ? 'All'
                                        : 'همه'
                                )
                                : category
                        )}

                    </strong>

                </div>


                ${
                    search
                        ? `
                            <div>

                                <span>
                                    ${
                                        isEnglish
                                            ? 'Search'
                                            : 'جستجو'
                                    }
                                </span>


                                <strong>
                                    ${escapeHtml(
                                        search
                                    )}
                                </strong>

                            </div>
                        `
                        : ''
                }

            </section>


            ${
                pageNumber === 1

                    ? `

                        <section>

                            <h2 class="section-title">
                                ${escapeHtml(
                                    summaryTitle
                                )}
                            </h2>


                            <div class="stats-grid">

                                <div class="stat-card">

                                    <span>
                                        ${escapeHtml(
                                            labels.totalSales
                                        )}
                                    </span>


                                    <strong>
                                        ${formatMoney(
                                            totalSales,
                                            language
                                        )}
                                    </strong>


                                    <small>
                                        ${
                                            isEnglish
                                                ? 'AF'
                                                : 'افغانی'
                                        }
                                    </small>

                                </div>


                                <div class="stat-card">

                                    <span>
                                        ${escapeHtml(
                                            labels.transactions
                                        )}
                                    </span>


                                    <strong>
                                        ${totalTransactions.toLocaleString(
                                            isEnglish
                                                ? 'en-US'
                                                : 'fa-IR'
                                        )}
                                    </strong>

                                </div>


                                <div class="stat-card">

                                    <span>
                                        ${escapeHtml(
                                            labels.items
                                        )}
                                    </span>


                                    <strong>
                                        ${totalItems.toLocaleString(
                                            isEnglish
                                                ? 'en-US'
                                                : 'fa-IR'
                                        )}
                                    </strong>

                                </div>


                                <div class="stat-card">

                                    <span>
                                        ${escapeHtml(
                                            labels.average
                                        )}
                                    </span>


                                    <strong>
                                        ${formatMoney(
                                            averageSale,
                                            language
                                        )}
                                    </strong>


                                    <small>
                                        ${
                                            isEnglish
                                                ? 'AF'
                                                : 'افغانی'
                                        }
                                    </small>

                                </div>

                            </div>


                            <div class="columns">

                                <div class="info-card">

                                    <h3>
                                        ${
                                            isEnglish
                                                ? 'Payment Overview'
                                                : 'خلاصه پرداخت'
                                        }
                                    </h3>

                                    ${paymentRows}

                                </div>


                                <div class="info-card">

                                    <h3>
                                        ${
                                            isEnglish
                                                ? 'Top Categories'
                                                : 'دسته‌های پرفروش'
                                        }
                                    </h3>

                                    ${topCategories}

                                </div>

                            </div>


                            <div class="financial-row">

                                <div>

                                    <span>
                                        ${escapeHtml(
                                            labels.cash
                                        )}
                                    </span>


                                    <strong>
                                        ${formatMoney(
                                            cashSales,
                                            language
                                        )}
                                        ${
                                            isEnglish
                                                ? ' AF'
                                                : ' افغانی'
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        ${escapeHtml(
                                            labels.credit
                                        )}
                                    </span>


                                    <strong>
                                        ${formatMoney(
                                            creditSales,
                                            language
                                        )}
                                        ${
                                            isEnglish
                                                ? ' AF'
                                                : ' افغانی'
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        ${escapeHtml(
                                            labels.bestCategory
                                        )}
                                    </span>


                                    <strong>
                                        ${escapeHtml(
                                            summary.bestCategory ||
                                            '-'
                                        )}
                                    </strong>

                                </div>

                            </div>

                        </section>

                    `
                    : ''
            }


            <section>

                <div class="table-title-row">

                    <h2 class="section-title">
                        ${escapeHtml(
                            salesTitle
                        )}
                    </h2>


                    <span>

                        ${
                            isEnglish

                                ? `Page ${pageNumber} of ${totalPages}`

                                : `صفحه ${pageNumber} از ${totalPages}`

                        }

                    </span>

                </div>


                <table>

                    <thead>

                        <tr>

                            <th>
                                ${escapeHtml(
                                    labels.date
                                )}
                            </th>

                            <th>
                                ${escapeHtml(
                                    labels.time
                                )}
                            </th>

                            <th>
                                ${escapeHtml(
                                    labels.product
                                )}
                            </th>

                            <th>
                                ${escapeHtml(
                                    labels.category
                                )}
                            </th>

                            <th>
                                ${escapeHtml(
                                    labels.quantity
                                )}
                            </th>

                            <th>
                                ${escapeHtml(
                                    labels.amount
                                )}
                            </th>

                            <th>
                                ${escapeHtml(
                                    labels.paymentType
                                )}
                            </th>

                            <th>
                                ${escapeHtml(
                                    labels.customer
                                )}
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        ${
                            salesRows ||

                            `

                                <tr>

                                    <td colspan="8">

                                        ${
                                            isEnglish

                                                ? 'No sales found'

                                                : 'فروشی برای این گزارش ثبت نشده است'

                                        }

                                    </td>

                                </tr>

                            `
                        }

                    </tbody>

                </table>

            </section>


            <footer class="footer">

                <span>
                    ${escapeHtml(
                        store.storeName
                    )}
                </span>


                <span>
                    ${escapeHtml(
                        isEnglish
                            ? 'Generated from Shop Manager'
                            : 'تهیه‌شده توسط سیستم مدیریت فروشگاه'
                    )}
                </span>

            </footer>

        </div>

    `;

};


// =========================================================
// Styles
// =========================================================

const getStyles = () => {

    return `

        * {
            box-sizing: border-box;
        }


        body {
            margin: 0;
            padding: 0;
            background: #f1f5f9;
        }


        .report-page {

            width: 794px;

            min-height: 1123px;

            padding: 42px;

            background: #ffffff;

            color: #0f172a;

            font-family:
                system-ui,
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                sans-serif;

            direction: rtl;
        }


        .report-page[dir="ltr"] {
            direction: ltr;
        }


        .top-line {

            height: 5px;

            border-radius: 999px;

            background:
                linear-gradient(
                    90deg,
                    #10b981,
                    #14b8a6
                );

            margin-bottom: 28px;
        }


        .header {

            display: flex;

            align-items: flex-start;

            justify-content: space-between;

            gap: 24px;

            margin-bottom: 24px;
        }


        .eyebrow {

            font-size: 10px;

            font-weight: 700;

            color: #10b981;

            margin-bottom: 6px;

            letter-spacing: 0;
        }


        .report-page[dir="ltr"] .eyebrow {

            letter-spacing: 1.5px;

        }


        .report-page[dir="rtl"] .eyebrow {

            letter-spacing: 0;

            word-spacing: 0;

        }


        h1 {

            margin: 0;

            font-size: 28px;

            line-height: 1.25;

            font-weight: 800;

            color: #0f172a;
        }


        .header p {

            margin: 7px 0 0;

            font-size: 13px;

            color: #64748b;
        }


        .manager-box {

            min-width: 180px;

            padding: 13px 16px;

            border-radius: 14px;

            background: #f0fdf4;

            border: 1px solid #bbf7d0;

            text-align: right;
        }


        .report-page[dir="ltr"] .manager-box {

            text-align: left;

        }


        .manager-box span {

            display: block;

            font-size: 10px;

            color: #64748b;

            margin-bottom: 4px;
        }


        .manager-box strong {

            font-size: 14px;

            color: #166534;
        }


        .meta {

            display: grid;

            grid-template-columns:
                repeat(3, 1fr);

            gap: 10px;

            margin-bottom: 24px;
        }


        .meta > div {

            padding: 11px 13px;

            border:
                1px solid
                #e2e8f0;

            background: #f8fafc;

            border-radius: 12px;
        }


        .meta span {

            display: block;

            font-size: 9px;

            color: #64748b;

            margin-bottom: 5px;
        }


        .meta strong {

            display: block;

            font-size: 11px;

            color: #0f172a;
        }


        .section-title {

            margin: 0 0 12px;

            font-size: 14px;

            font-weight: 800;

            color: #0f172a;
        }


        .stats-grid {

            display: grid;

            grid-template-columns:
                repeat(4, 1fr);

            gap: 10px;

            margin-bottom: 14px;
        }


        .stat-card {

            position: relative;

            padding: 14px;

            min-height: 94px;

            border:
                1px solid
                #e2e8f0;

            border-radius: 14px;

            background: #ffffff;
        }


        .stat-card span {

            display: block;

            font-size: 9px;

            color: #64748b;

            margin-bottom: 8px;
        }


        .stat-card strong {

            font-size: 19px;

            font-weight: 800;

            color: #0f172a;
        }


        .stat-card small {

            margin-inline-start: 4px;

            font-size: 9px;

            color: #94a3b8;
        }


        .columns {

            display: grid;

            grid-template-columns:
                repeat(2, 1fr);

            gap: 12px;

            margin-bottom: 12px;
        }


        .info-card {

            padding: 14px;

            border:
                1px solid
                #e2e8f0;

            border-radius: 14px;

            background: #f8fafc;
        }


        .info-card h3 {

            margin: 0 0 10px;

            font-size: 11px;

            font-weight: 800;

            color: #334155;
        }


        .mini-row {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 12px;

            padding: 7px 0;

            border-bottom:
                1px solid
                #e2e8f0;

            font-size: 10px;
        }


        .mini-row:last-child {

            border-bottom: 0;

        }


        .mini-row span {

            color: #64748b;

        }


        .mini-row strong {

            color: #0f172a;

        }


        .financial-row {

            display: grid;

            grid-template-columns:
                repeat(3, 1fr);

            gap: 10px;

            margin-bottom: 22px;
        }


        .financial-row > div {

            padding: 12px 14px;

            border-radius: 12px;

            background: #ecfdf5;

            border:
                1px solid
                #a7f3d0;
        }


        .financial-row span {

            display: block;

            font-size: 9px;

            color: #64748b;

            margin-bottom: 5px;
        }


        .financial-row strong {

            font-size: 12px;

            color: #047857;
        }


        .table-title-row {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 12px;
        }


        .table-title-row > span {

            font-size: 9px;

            color: #94a3b8;
        }


        table {

            width: 100%;

            border-collapse: separate;

            border-spacing: 0;

            overflow: hidden;

            border:
                1px solid
                #e2e8f0;

            border-radius: 12px;

            font-size: 9px;
        }


        thead th {

            padding: 9px 7px;

            background: #f8fafc;

            border-bottom:
                1px solid
                #e2e8f0;

            color: #475569;

            font-weight: 800;

            text-align: right;

            white-space: nowrap;
        }


        .report-page[dir="ltr"] thead th {

            text-align: left;

        }


        tbody td {

            padding: 8px 7px;

            border-bottom:
                1px solid
                #f1f5f9;

            color: #475569;

            vertical-align: middle;
        }


        tbody tr:last-child td {

            border-bottom: 0;

        }


        tbody td.product {

            font-weight: 700;

            color: #0f172a;
        }


        tbody td.number {

            direction: ltr;

            text-align: right;

            white-space: nowrap;
        }


        .footer {

            display: flex;

            align-items: center;

            justify-content: space-between;

            gap: 12px;

            margin-top: 24px;

            padding-top: 12px;

            border-top:
                1px solid
                #e2e8f0;

            font-size: 8px;

            color: #94a3b8;
        }

    `;

};


// =========================================================
// Export Report To PDF
// =========================================================

export const exportReportToPDF = async ({
    reportData = {},
    period = 'week',
    paymentType = 'all',
    category = 'all',
    search = '',
    language = 'fa',
}) => {

    const store =
        getStoreSettings();


    const rawSales =
        Array.isArray(
            reportData.rawSales
        )
            ? [...reportData.rawSales]
            : [];


    // =====================================================
    // Newest First
    // =====================================================

    rawSales.sort(
        (
            first,
            second
        ) => {

            const firstTime =
                new Date(
                    getSaleDate(
                        first
                    ) || 0
                ).getTime();


            const secondTime =
                new Date(
                    getSaleDate(
                        second
                    ) || 0
                ).getTime();


            return (
                secondTime -
                firstTime
            );

        }
    );


    // =====================================================
    // Pages
    // =====================================================

    const chunkSize =
        14;


    const chunks = [];


    if (
        rawSales.length === 0
    ) {

        chunks.push([]);

    } else {

        for (
            let index = 0;
            index < rawSales.length;
            index += chunkSize
        ) {

            chunks.push(
                rawSales.slice(
                    index,
                    index +
                    chunkSize
                )
            );

        }

    }


    const totalPages =
        chunks.length;


    // =====================================================
    // Hidden Rendering Container
    // =====================================================

    const container =
        document.createElement(
            'div'
        );


    container.style.position =
        'fixed';

    container.style.left =
        '-100000px';

    container.style.top =
        '0';

    container.style.width =
        '794px';

    container.style.background =
        '#ffffff';

    container.style.zIndex =
        '-1';


    // =====================================================
    // Style
    // =====================================================

    const style =
        document.createElement(
            'style'
        );


    style.textContent =
        getStyles();


    document.head.appendChild(
        style
    );


    // =====================================================
    // Build HTML
    // =====================================================

    container.innerHTML =
        chunks
            .map(
                (
                    chunk,
                    index
                ) =>
                    buildReportPage({

                        reportData,

                        salesChunk:
                            chunk,

                        pageNumber:
                            index + 1,

                        totalPages,

                        language,

                        period,

                        paymentType,

                        category,

                        search,

                        store,

                    })
            )
            .join(
                ''
            );


    document.body.appendChild(
        container
    );


    try {

        // =================================================
        // Wait For Fonts
        // =================================================

        if (
            document.fonts?.ready
        ) {

            await document.fonts.ready;

        }


        // =================================================
        // Wait For Layout
        // =================================================

        await new Promise(
            (resolve) =>
                requestAnimationFrame(
                    () =>
                        requestAnimationFrame(
                            resolve
                        )
                )
        );


        // =================================================
        // Find Pages
        // =================================================

        const pages =
            Array.from(
                container.querySelectorAll(
                    '.report-page'
                )
            );


        // =================================================
        // Create PDF
        // =================================================

        const pdf =
            new jsPDF({
                orientation:
                    'p',

                unit:
                    'mm',

                format:
                    'a4',

                compress:
                    true,

            });


        // =================================================
        // Render Pages
        // =================================================

        for (
            let index = 0;
            index < pages.length;
            index += 1
        ) {

            const page =
                pages[index];


            const canvas =
                await html2canvas(
                    page,
                    {

                        scale:
                            2,

                        useCORS:
                            true,

                        backgroundColor:
                            '#ffffff',

                        logging:
                            false,

                        width:
                            794,

                        windowWidth:
                            794,

                    }
                );


            const imageData =
                canvas.toDataURL(
                    'image/jpeg',
                    0.95
                );


            if (
                index > 0
            ) {

                pdf.addPage();

            }


            pdf.addImage(

                imageData,

                'JPEG',

                0,

                0,

                210,

                297,

                undefined,

                'FAST'

            );

        }


        // =================================================
        // Filename
        // =================================================

        const isEnglish =
            String(
                language || ''
            )
                .toLowerCase()
                .startsWith(
                    'en'
                );


        const datePart =
            new Date()
                .toISOString()
                .slice(
                    0,
                    10
                );


        const filename =
            isEnglish

                ? `sales-report-${datePart}.pdf`

                : `گزارش-فروش-${datePart}.pdf`;


        // =================================================
        // Save
        // =================================================

        pdf.save(
            filename
        );


        return {

            success:
                true,

            filename,

        };

    } finally {

        // =================================================
        // Cleanup
        // =================================================

        container.remove();

        style.remove();

    }

};


export default exportReportToPDF;