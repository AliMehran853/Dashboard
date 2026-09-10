import {
  Eye,
  User,
  Phone,
  Wallet,
  Trash2,
  Package,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import {
  useTranslation,
} from 'react-i18next';

import {
  formatJalaliDate,
  getJalaliMonthStyle,
} from '../../utils/date/jalali';


// =========================================================
// Format Number
// =========================================================

const formatNumber = (
  number
) => {
  return new Intl.NumberFormat(
    'en-US'
  ).format(
    Number(number) || 0
  );
};


// =========================================================
// Format Date
// =========================================================

const formatDate = (
  date,
  isEnglish,
  jalaliMonthStyle
) => {

  if (!date) {
    return '-';
  }


  const parsedDate =
    new Date(date);


  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return '-';
  }


  // -------------------------------------------------------
  // English
  // -------------------------------------------------------

  if (isEnglish) {

    return new Intl.DateTimeFormat(
      'en-US',
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    ).format(
      parsedDate
    );

  }


  // -------------------------------------------------------
  // Jalali
  // -------------------------------------------------------

  return (
    formatJalaliDate(
      parsedDate,
      {
        monthStyle:
          jalaliMonthStyle,

        withMonthName:
          true,
      }
    ) || '-'
  );

};


// =========================================================
// Status
// =========================================================

const getStatus = (
  credit
) => {

  const remaining =
    Number(
      credit?.remaining
    ) || 0;

  const paid =
    Number(
      credit?.paid
    ) || 0;


  if (remaining <= 0) {
    return 'settled';
  }


  if (paid > 0) {
    return 'partial';
  }


  return 'debt';

};


// =========================================================
// Customer Name
// =========================================================

const getCustomerName = (
  credit
) => {

  return (
    credit?.customerName ||
    credit?.name ||
    '-'
  );

};


// =========================================================
// Extract Product Names From A Credit Account
// Supports: items / sales / products / creditSales arrays,
// plus single `product`, `productName`, `lastProduct` fields.
// =========================================================

const getCreditProducts = (
  credit
) => {

  if (
    !credit ||
    typeof credit !== 'object'
  ) {

    return [];

  }


  const names = [];

  const seen = new Set();


  const push = (value) => {

    if (typeof value !== 'string') {
      return;
    }


    const trimmed =
      value.trim();


    if (!trimmed) {
      return;
    }


    const key =
      trimmed.toLowerCase();


    if (seen.has(key)) {
      return;
    }


    seen.add(key);

    names.push(trimmed);

  };


  // -------------------------------------------------------
  // Arrays
  // -------------------------------------------------------

  const arraysToScan = [

    credit.items,

    credit.sales,

    credit.creditSales,

    credit.products,

  ];


  arraysToScan.forEach((arr) => {

    if (!Array.isArray(arr)) {
      return;
    }


    arr.forEach((item) => {

      if (typeof item === 'string') {

        push(item);

        return;

      }


      if (
        item &&
        typeof item === 'object'
      ) {

        push(item.product);

        push(item.productName);

        push(item.name);

      }

    });

  });


  // -------------------------------------------------------
  // Single Fields
  // -------------------------------------------------------

  push(credit.product);

  push(credit.productName);

  push(credit.lastProduct);


  return names;

};


// =========================================================
// Payments Count For A Credit Account
// =========================================================

const getPaymentsCount = (
  credit
) => {

  if (
    !credit ||
    typeof credit !== 'object'
  ) {

    return 0;

  }


  const candidates = [

    credit.payments,

    credit.paymentHistory,

    credit.transactions,

  ];


  for (const arr of candidates) {

    if (Array.isArray(arr)) {
      return arr.length;
    }

  }


  return 0;

};


// =========================================================
// Credit Table
// =========================================================

function CreditTable({
  credits = [],
  loading = false,
  onViewDetails,
  onPayment,
  onDelete,
}) {

  const {
    t,
    i18n,
  } = useTranslation();


  const isEnglish =
    i18n.language === 'en';


  // =======================================================
  // Jalali Month Style
  // =======================================================

  const [
    jalaliMonthStyle,
    setJalaliMonthStyle,
  ] = useState(
    () =>
      getJalaliMonthStyle()
  );


  // =======================================================
  // Listen For Jalali Month Style Changes
  // =======================================================

  useEffect(() => {

    if (
      typeof window ===
      'undefined'
    ) {
      return undefined;
    }


    const handleJalaliMonthStyleChange =
      (event) => {

        setJalaliMonthStyle(
          event?.detail ||
          getJalaliMonthStyle()
        );

      };


    const handleStorage =
      (event) => {

        if (
          event.key ===
          'jalaliMonthStyle'
        ) {

          setJalaliMonthStyle(
            getJalaliMonthStyle()
          );

        }

      };


    window.addEventListener(
      'jalali-month-style-changed',
      handleJalaliMonthStyleChange
    );


    window.addEventListener(
      'storage',
      handleStorage
    );


    return () => {

      window.removeEventListener(
        'jalali-month-style-changed',
        handleJalaliMonthStyleChange
      );


      window.removeEventListener(
        'storage',
        handleStorage
      );

    };

  }, []);


  // =======================================================
  // Actions
  // =======================================================

  const handleDetails = (
    credit
  ) => {

    if (!credit) {
      return;
    }


    onViewDetails?.(
      credit
    );

  };


  const handlePayment = (
    credit
  ) => {

    if (!credit) {
      return;
    }


    const remaining =
      Number(
        credit.remaining
      ) || 0;


    if (remaining <= 0) {
      return;
    }


    onPayment?.(
      credit
    );

  };


  const handleDelete = (
    credit
  ) => {

    if (!credit) {
      return;
    }


    const remaining =
      Number(
        credit.remaining
      ) || 0;


    if (remaining > 0) {
      return;
    }


    onDelete?.(
      credit
    );

  };


  // =======================================================
  // Status Label
  // =======================================================

  const getStatusLabel = (
    credit
  ) => {

    const status =
      getStatus(
        credit
      );


    if (
      status === 'settled'
    ) {

      return t(
        'credit.table.status.settled',
        {
          defaultValue:
            isEnglish
              ? 'Settled'
              : 'تسویه‌شده',
        }
      );

    }


    if (
      status === 'partial'
    ) {

      return t(
        'credit.table.status.partial',
        {
          defaultValue:
            isEnglish
              ? 'Partial Payment'
              : 'پرداخت جزئی',
        }
      );

    }


    return t(
      'credit.table.status.debt',
      {
        defaultValue:
          isEnglish
            ? 'Debt'
            : 'بدهکار',
      }
    );

  };


  // =======================================================
  // Status Badge
  // =======================================================

  const renderStatus = (
    credit
  ) => {

    const status =
      getStatus(
        credit
      );


    if (
      status === 'settled'
    ) {

      return (
        <span
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-emerald-500/15
            bg-emerald-500/10
            px-2.5
            py-1
            text-[10px]
            font-semibold
            text-emerald-600
            dark:text-emerald-400
          "
        >

          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-emerald-500
              shadow-[0_0_8px_rgba(16,185,129,0.35)]
            "
          />

          {getStatusLabel(
            credit
          )}

        </span>
      );

    }


    if (
      status === 'partial'
    ) {

      return (
        <span
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-full
            border
            border-orange-500/15
            bg-orange-500/10
            px-2.5
            py-1
            text-[10px]
            font-semibold
            text-orange-600
            dark:text-orange-400
          "
        >

          <span
            className="
              h-1.5
              w-1.5
              rounded-full
              bg-orange-500
              shadow-[0_0_8px_rgba(249,115,22,0.35)]
            "
          />

          {getStatusLabel(
            credit
          )}

        </span>
      );

    }


    return (
      <span
        className="
          inline-flex
          items-center
          gap-1.5
          rounded-full
          border
          border-amber-500/15
          bg-amber-500/10
          px-2.5
          py-1
          text-[10px]
          font-semibold
          text-amber-600
          dark:text-amber-400
        "
      >

        <span
          className="
            h-1.5
            w-1.5
            rounded-full
            bg-amber-500
            shadow-[0_0_8px_rgba(245,158,11,0.35)]
          "
        />

        {getStatusLabel(
          credit
        )}

      </span>
    );

  };


  // =======================================================
  // Product Chips (shared)
  // =======================================================

  const renderProductChips = (
    credit,
    max = 2
  ) => {

    const products =
      getCreditProducts(
        credit
      );


    if (products.length === 0) {
      return null;
    }


    const visible =
      products.slice(
        0,
        max
      );


    const extra =
      products.length - visible.length;


    return (
      <div
        className="
          mt-1.5
          flex
          min-w-0
          flex-wrap
          items-center
          gap-1
        "
      >

        {visible.map(
          (name) => (

            <span
              key={name}
              title={name}
              className="
                inline-flex
                max-w-[9rem]
                min-w-0
                items-center
                gap-1
                rounded-md
                border
                border-[var(--border)]
                bg-[var(--surface-muted)]
                px-1.5
                py-0.5
                text-[9px]
                leading-4
                text-[var(--text-secondary)]
              "
            >

              <Package
                size={9}
                className="
                  shrink-0
                  text-[var(--text-muted)]
                "
              />


              <span
                className="
                  truncate
                "
              >
                {name}
              </span>

            </span>

          )
        )}


        {extra > 0 && (

          <span
            className="
              inline-flex
              items-center
              rounded-md
              border
              border-[var(--border)]
              bg-[var(--surface-muted)]
              px-1.5
              py-0.5
              text-[9px]
              leading-4
              text-[var(--text-muted)]
            "
          >
            +{extra}
          </span>

        )}

      </div>
    );

  };


  // =======================================================
  // Payments Count Hint (shared)
  // =======================================================

  const renderPaymentsHint = (
    credit
  ) => {

    const count =
      getPaymentsCount(
        credit
      );


    if (count <= 0) {
      return null;
    }


    return (
      <p
        className="
          mt-0.5
          text-[9px]
          text-[var(--text-muted)]
        "
      >
        {formatNumber(
          count
        )}{' '}

        {t(
          'credit.table.paymentsCount',
          {
            defaultValue:
              isEnglish
                ? 'payments'
                : 'پرداخت',
          }
        )}
      </p>
    );

  };


  // =======================================================
  // Common Action Button
  // =======================================================

  const actionButtonClass = `
    flex
    h-8
    w-8
    shrink-0
    items-center
    justify-center
    rounded-lg
    border
    border-[var(--border)]
    bg-[var(--surface)]
    text-[var(--text-muted)]
    transition-all
    duration-200
    hover:-translate-y-0.5
  `;


  // =======================================================
  // Render
  // =======================================================

  return (
    <section
      className="
        ui-card
        overflow-hidden
        p-0
      "
    >

      {/* ===================================================
          Header
      ==================================================== */}

      <div
        className="
          relative
          flex
          items-center
          justify-between
          gap-3
          border-b
          border-[var(--border)]
          px-4
          py-3.5
          sm:px-5
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-px
            bg-amber-500/70
          "
        />


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
                h-4
                w-1
                rounded-full
                bg-amber-500
              "
            />

            <h2
              className="
                text-sm
                font-semibold
                tracking-tight
                text-[var(--text-primary)]
              "
            >
              {t(
                'credit.table.title',
                {
                  defaultValue:
                    isEnglish
                      ? 'Customer Accounts'
                      : 'حساب‌های مشتریان',
                }
              )}
            </h2>

          </div>


          <p
            className="
              mt-1
              truncate
              text-[10px]
              text-[var(--text-muted)]
              sm:text-[11px]
            "
          >
            {t(
              'credit.table.description',
              {
                defaultValue:
                  isEnglish
                    ? 'Customer credit account records'
                    : 'سوابق حساب‌های نسیه مشتریان',
              }
            )}
          </p>

        </div>


        <span
          className="
            inline-flex
            shrink-0
            items-center
            gap-1.5
            rounded-lg
            border
            border-[var(--border)]
            bg-[var(--surface-muted)]
            px-2.5
            py-1.5
            text-[10px]
            font-medium
            text-[var(--text-muted)]
          "
        >

          <span
            dir="ltr"
            className="
              number-font
              font-semibold
              text-[var(--text-primary)]
            "
          >
            {formatNumber(
              credits.length
            )}
          </span>


          <span>
            {t(
              'credit.table.accountsCount',
              {
                defaultValue:
                  isEnglish
                    ? 'accounts'
                    : 'حساب',
              }
            )}
          </span>

        </span>

      </div>


      {/* ===================================================
          Loading
      ==================================================== */}

      {loading && (
        <div
          className="
            grid
            gap-3
            p-4
            sm:p-5
          "
        >

          {[1, 2, 3].map(
            (item) => (
              <div
                key={item}
                className="
                  h-16
                  rounded-xl
                  border
                  border-[var(--border)]
                  bg-[var(--surface-muted)]
                  animate-pulse
                "
              />
            )
          )}

        </div>
      )}


      {/* ===================================================
          Empty
      ==================================================== */}

      {!loading &&
        credits.length === 0 && (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              px-4
              py-14
              text-center
              sm:py-16
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                border
                border-[var(--border)]
                bg-[var(--surface-muted)]
              "
            >
              <User
                size={20}
                className="
                  text-[var(--text-muted)]
                "
              />
            </div>


            <p
              className="
                mt-3
                text-sm
                font-medium
                text-[var(--text-secondary)]
              "
            >
              {t(
                'credit.table.empty.title',
                {
                  defaultValue:
                    isEnglish
                      ? 'No accounts found'
                      : 'حسابی پیدا نشد',
                }
              )}
            </p>


            <p
              className="
                mt-1
                max-w-sm
                text-[10px]
                leading-5
                text-[var(--text-muted)]
              "
            >
              {t(
                'credit.table.empty.description',
                {
                  defaultValue:
                    isEnglish
                      ? 'No customer accounts match the selected criteria.'
                      : 'هیچ حسابی با معیارهای انتخاب‌شده مطابقت ندارد.',
                }
              )}
            </p>

          </div>
        )}


      {/* ===================================================
          Data
      ==================================================== */}

      {!loading &&
        credits.length > 0 && (
          <>

            {/* =================================================
                Desktop
            ================================================= */}

            <div
              className="
                hidden
                overflow-x-auto
                md:block
              "
            >

              <table
                className="
                  w-full
                  min-w-[960px]
                  border-collapse
                "
              >

                <thead>

                  <tr
                    className="
                      border-b
                      border-[var(--border)]
                      bg-[var(--surface-muted)]
                    "
                  >

                    {/* Customer */}

                    <th
                      className="
                        px-5
                        py-3
                        text-start
                        text-[10px]
                        font-semibold
                        text-[var(--text-muted)]
                      "
                    >
                      {t(
                        'credit.table.columns.customer',
                        {
                          defaultValue:
                            isEnglish
                              ? 'Customer'
                              : 'مشتری',
                        }
                      )}
                    </th>


                    {/* Total Debt */}

                    <th
                      className="
                        px-4
                        py-3
                        text-start
                        text-[10px]
                        font-semibold
                        text-[var(--text-muted)]
                      "
                    >
                      {t(
                        'credit.table.columns.totalDebt',
                        {
                          defaultValue:
                            isEnglish
                              ? 'Total Debt'
                              : 'کل بدهی',
                        }
                      )}
                    </th>


                    {/* Paid */}

                    <th
                      className="
                        px-4
                        py-3
                        text-start
                        text-[10px]
                        font-semibold
                        text-[var(--text-muted)]
                      "
                    >
                      {t(
                        'credit.table.columns.paid',
                        {
                          defaultValue:
                            isEnglish
                              ? 'Paid'
                              : 'پرداخت‌شده',
                        }
                      )}
                    </th>


                    {/* Remaining */}

                    <th
                      className="
                        px-4
                        py-3
                        text-start
                        text-[10px]
                        font-semibold
                        text-[var(--text-muted)]
                      "
                    >
                      {t(
                        'credit.table.columns.remaining',
                        {
                          defaultValue:
                            isEnglish
                              ? 'Remaining'
                              : 'باقی‌مانده',
                        }
                      )}
                    </th>


                    {/* Last Transaction */}

                    <th
                      className="
                        px-4
                        py-3
                        text-start
                        text-[10px]
                        font-semibold
                        text-[var(--text-muted)]
                      "
                    >
                      {t(
                        'credit.table.columns.lastTransaction',
                        {
                          defaultValue:
                            isEnglish
                              ? 'Last Transaction'
                              : 'آخرین تراکنش',
                        }
                      )}
                    </th>


                    {/* Status */}

                    <th
                      className="
                        px-4
                        py-3
                        text-center
                        text-[10px]
                        font-semibold
                        text-[var(--text-muted)]
                      "
                    >
                      {t(
                        'credit.table.columns.status',
                        {
                          defaultValue:
                            isEnglish
                              ? 'Status'
                              : 'وضعیت',
                        }
                      )}
                    </th>


                    {/* Actions */}

                    <th
                      className="
                        px-4
                        py-3
                        text-center
                        text-[10px]
                        font-semibold
                        text-[var(--text-muted)]
                      "
                    >
                      {t(
                        'credit.table.columns.actions',
                        {
                          defaultValue:
                            isEnglish
                              ? 'Actions'
                              : 'عملیات',
                        }
                      )}
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {credits.map(
                    (credit) => {

                      const customerName =
                        getCustomerName(
                          credit
                        );


                      const remaining =
                        Number(
                          credit.remaining
                        ) || 0;


                      const isSettled =
                        remaining <= 0;


                      return (
                        <tr
                          key={
                            credit.id
                          }
                          className="
                            border-b
                            border-[var(--border)]
                            transition-colors
                            last:border-b-0
                            hover:bg-[var(--surface-muted)]
                          "
                        >

                          {/* Customer + Products */}

                          <td
                            className="
                              px-5
                              py-3.5
                              align-top
                            "
                          >

                            <div
                              className="
                                flex
                                items-start
                                gap-3
                              "
                            >

                              <div
                                className="
                                  flex
                                  h-9
                                  w-9
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-xl
                                  border
                                  border-amber-500/10
                                  bg-amber-500/10
                                "
                              >
                                <User
                                  size={16}
                                  className="
                                    text-amber-500
                                    dark:text-amber-400
                                  "
                                />
                              </div>


                              <div
                                className="
                                  min-w-0
                                "
                              >

                                <p
                                  className="
                                    truncate
                                    text-xs
                                    font-semibold
                                    text-[var(--text-primary)]
                                  "
                                >
                                  {customerName}
                                </p>


                                <div
                                  className="
                                    mt-1
                                    flex
                                    items-center
                                    gap-1.5
                                  "
                                >

                                  <Phone
                                    size={10}
                                    className="
                                      text-[var(--text-muted)]
                                    "
                                  />


                                  <span
                                    dir="ltr"
                                    className="
                                      truncate
                                      text-[10px]
                                      text-[var(--text-muted)]
                                    "
                                  >
                                    {
                                      credit.phone ||
                                      '-'
                                    }
                                  </span>

                                </div>


                                {renderProductChips(
                                  credit,
                                  2
                                )}

                              </div>

                            </div>

                          </td>


                          {/* Total Debt */}

                          <td
                            className="
                              whitespace-nowrap
                              px-4
                              py-3.5
                              align-top
                            "
                          >

                            <span
                              dir="ltr"
                              className="
                                number-font
                                text-xs
                                font-medium
                                text-[var(--text-secondary)]
                              "
                            >
                              {formatNumber(
                                credit.totalDebt
                              )}
                            </span>


                            <span
                              className="
                                ms-1
                                text-[9px]
                                text-[var(--text-muted)]
                              "
                            >
                              {t(
                                'common.currency',
                                {
                                  defaultValue:
                                    'افغانی',
                                }
                              )}
                            </span>

                          </td>


                          {/* Paid + Payments Count */}

                          <td
                            className="
                              whitespace-nowrap
                              px-4
                              py-3.5
                              align-top
                            "
                          >

                            <span
                              dir="ltr"
                              className="
                                number-font
                                text-xs
                                font-medium
                                text-emerald-600
                                dark:text-emerald-400
                              "
                            >
                              {formatNumber(
                                credit.paid
                              )}
                            </span>


                            <span
                              className="
                                ms-1
                                text-[9px]
                                text-[var(--text-muted)]
                              "
                            >
                              {t(
                                'common.currency',
                                {
                                  defaultValue:
                                    'افغانی',
                                }
                              )}
                            </span>


                            {renderPaymentsHint(
                              credit
                            )}

                          </td>


                          {/* Remaining */}

                          <td
                            className="
                              whitespace-nowrap
                              px-4
                              py-3.5
                              align-top
                            "
                          >

                            <span
                              dir="ltr"
                              className={`
                                number-font
                                text-xs
                                font-bold
                                ${
                                  remaining > 0
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }
                              `}
                            >
                              {formatNumber(
                                remaining
                              )}
                            </span>


                            <span
                              className="
                                ms-1
                                text-[9px]
                                text-[var(--text-muted)]
                              "
                            >
                              {t(
                                'common.currency',
                                {
                                  defaultValue:
                                    'افغانی',
                                }
                              )}
                            </span>

                          </td>


                          {/* Last Transaction */}

                          <td
                            className="
                              whitespace-nowrap
                              px-4
                              py-3.5
                              align-top
                            "
                          >

                            <span
                              className="
                                text-[10px]
                                text-[var(--text-secondary)]
                              "
                            >
                              {formatDate(
                                credit.lastTransaction,
                                isEnglish,
                                jalaliMonthStyle
                              )}
                            </span>

                          </td>


                          {/* Status */}

                          <td
                            className="
                              px-4
                              py-3.5
                              align-top
                              text-center
                            "
                          >
                            {renderStatus(
                              credit
                            )}
                          </td>


                          {/* Actions */}

                          <td
                            className="
                              px-4
                              py-3.5
                              align-top
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                justify-center
                                gap-1.5
                              "
                            >

                              {/* View */}

                              <button
                                type="button"
                                onClick={() =>
                                  handleDetails(
                                    credit
                                  )
                                }
                                title={t(
                                  'credit.table.actions.viewDetails',
                                  {
                                    defaultValue:
                                      isEnglish
                                        ? 'View Details'
                                        : 'مشاهده جزئیات',
                                  }
                                )}
                                aria-label={t(
                                  'credit.table.actions.viewDetails',
                                  {
                                    defaultValue:
                                      isEnglish
                                        ? 'View Details'
                                        : 'مشاهده جزئیات',
                                  }
                                )}
                                className={`
                                  ${actionButtonClass}
                                  hover:border-amber-500/20
                                  hover:bg-amber-500/5
                                  hover:text-amber-500
                                  dark:hover:text-amber-400
                                `}
                              >
                                <Eye
                                  size={14}
                                />
                              </button>


                              {/* Payment */}

                              {remaining > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePayment(
                                      credit
                                    )
                                  }
                                  title={t(
                                    'credit.table.actions.payment',
                                    {
                                      defaultValue:
                                        isEnglish
                                          ? 'Record Payment'
                                          : 'ثبت پرداخت',
                                    }
                                  )}
                                  aria-label={t(
                                    'credit.table.actions.payment',
                                    {
                                      defaultValue:
                                        isEnglish
                                          ? 'Record Payment'
                                          : 'ثبت پرداخت',
                                    }
                                  )}
                                  className={`
                                    ${actionButtonClass}
                                    hover:border-emerald-500/20
                                    hover:bg-emerald-500/5
                                    hover:text-emerald-500
                                    dark:hover:text-emerald-400
                                  `}
                                >
                                  <Wallet
                                    size={14}
                                  />
                                </button>
                              )}


                              {/* Delete */}

                              {isSettled && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDelete(
                                      credit
                                    )
                                  }
                                  title={t(
                                    'credit.table.actions.delete',
                                    {
                                      defaultValue:
                                        isEnglish
                                          ? 'Delete Account'
                                          : 'حذف حساب',
                                    }
                                  )}
                                  aria-label={t(
                                    'credit.table.actions.delete',
                                    {
                                      defaultValue:
                                        isEnglish
                                          ? 'Delete Account'
                                          : 'حذف حساب',
                                    }
                                  )}
                                  className={`
                                    ${actionButtonClass}
                                    border-rose-500/10
                                    text-rose-500
                                    hover:border-rose-500/25
                                    hover:bg-rose-500/5
                                    hover:text-rose-600
                                    dark:text-rose-400
                                    dark:hover:text-rose-300
                                  `}
                                >
                                  <Trash2
                                    size={14}
                                  />
                                </button>
                              )}

                            </div>

                          </td>

                        </tr>
                      );

                    }
                  )}

                </tbody>

              </table>

            </div>


            {/* =================================================
                Mobile
            ================================================= */}

            <div
              className="
                divide-y
                divide-[var(--border)]
                md:hidden
              "
            >

              {credits.map(
                (credit) => {

                  const customerName =
                    getCustomerName(
                      credit
                    );


                  const remaining =
                    Number(
                      credit.remaining
                    ) || 0;


                  const isSettled =
                    remaining <= 0;


                  return (
                    <article
                      key={
                        credit.id
                      }
                      className="
                        p-4
                        transition-colors
                        hover:bg-[var(--surface-muted)]
                      "
                    >

                      {/* Header */}

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >

                        <div
                          className="
                            flex
                            min-w-0
                            items-start
                            gap-3
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
                              border-amber-500/10
                              bg-amber-500/10
                            "
                          >

                            <User
                              size={17}
                              className="
                                text-amber-500
                                dark:text-amber-400
                              "
                            />

                          </div>


                          <div
                            className="
                              min-w-0
                            "
                          >

                            <p
                              className="
                                truncate
                                text-sm
                                font-semibold
                                text-[var(--text-primary)]
                              "
                            >
                              {customerName}
                            </p>


                            <p
                              dir="ltr"
                              className="
                                mt-1
                                truncate
                                text-[10px]
                                text-[var(--text-muted)]
                              "
                            >
                              {
                                credit.phone ||
                                '-'
                              }
                            </p>


                            {renderProductChips(
                              credit,
                              3
                            )}

                          </div>

                        </div>


                        {/* Actions */}

                        <div
                          className="
                            flex
                            shrink-0
                            items-center
                            gap-1.5
                          "
                        >

                          {/* View */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDetails(
                                credit
                              )
                            }
                            title={t(
                              'credit.table.actions.viewDetails',
                              {
                                defaultValue:
                                  isEnglish
                                    ? 'View Details'
                                    : 'مشاهده جزئیات',
                              }
                            )}
                            aria-label={t(
                              'credit.table.actions.viewDetails',
                              {
                                defaultValue:
                                  isEnglish
                                    ? 'View Details'
                                    : 'مشاهده جزئیات',
                              }
                            )}
                            className={`
                              ${actionButtonClass}
                              hover:border-amber-500/20
                              hover:bg-amber-500/5
                              hover:text-amber-500
                              dark:hover:text-amber-400
                            `}
                          >
                            <Eye
                              size={14}
                            />
                          </button>


                          {/* Payment */}

                          {remaining > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                handlePayment(
                                  credit
                                )
                              }
                              title={t(
                                'credit.table.actions.payment',
                                {
                                  defaultValue:
                                    isEnglish
                                      ? 'Record Payment'
                                      : 'ثبت پرداخت',
                                }
                              )}
                              aria-label={t(
                                'credit.table.actions.payment',
                                {
                                  defaultValue:
                                    isEnglish
                                      ? 'Record Payment'
                                      : 'ثبت پرداخت',
                                }
                              )}
                              className={`
                                ${actionButtonClass}
                                hover:border-emerald-500/20
                                hover:bg-emerald-500/5
                                hover:text-emerald-500
                                dark:hover:text-emerald-400
                              `}
                            >
                              <Wallet
                                size={14}
                              />
                            </button>
                          )}


                          {/* Delete */}

                          {isSettled && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  credit
                                )
                              }
                              title={t(
                                'credit.table.actions.delete',
                                {
                                  defaultValue:
                                    isEnglish
                                      ? 'Delete Account'
                                      : 'حذف حساب',
                                }
                              )}
                              aria-label={t(
                                'credit.table.actions.delete',
                                {
                                  defaultValue:
                                    isEnglish
                                      ? 'Delete Account'
                                      : 'حذف حساب',
                                }
                              )}
                              className={`
                                ${actionButtonClass}
                                border-rose-500/10
                                text-rose-500
                                hover:border-rose-500/25
                                hover:bg-rose-500/5
                                hover:text-rose-600
                                dark:text-rose-400
                                dark:hover:text-rose-300
                              `}
                            >
                              <Trash2
                                size={14}
                              />
                            </button>
                          )}

                        </div>

                      </div>


                      {/* Status + Remaining */}

                      <div
                        className="
                          mt-3
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >

                        <div>
                          {renderStatus(
                            credit
                          )}
                        </div>


                        <div
                          className="
                            rounded-xl
                            border
                            border-amber-500/10
                            bg-amber-500/5
                            px-3
                            py-2
                            text-end
                          "
                        >

                          <p
                            className="
                              text-[9px]
                              text-[var(--text-muted)]
                            "
                          >
                            {t(
                              'credit.table.columns.remaining',
                              {
                                defaultValue:
                                  isEnglish
                                    ? 'Remaining'
                                    : 'باقی‌مانده',
                              }
                            )}
                          </p>


                          <p
                            dir="ltr"
                            className={`
                              mt-0.5
                              number-font
                              text-sm
                              font-bold
                              ${
                                remaining > 0
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }
                            `}
                          >
                            {formatNumber(
                              remaining
                            )}{' '}

                            <span
                              className="
                                text-[9px]
                                font-medium
                                text-[var(--text-muted)]
                              "
                            >
                              {t(
                                'common.currency',
                                {
                                  defaultValue:
                                    'افغانی',
                                }
                              )}
                            </span>

                          </p>

                        </div>

                      </div>


                      {/* Financial */}

                      <div
                        className="
                          mt-3
                          grid
                          grid-cols-2
                          gap-2
                        "
                      >

                        <div
                          className="
                            rounded-xl
                            border
                            border-[var(--border)]
                            bg-[var(--surface-muted)]
                            p-3
                          "
                        >

                          <p
                            className="
                              text-[9px]
                              text-[var(--text-muted)]
                            "
                          >
                            {t(
                              'credit.table.columns.totalDebt',
                              {
                                defaultValue:
                                  isEnglish
                                    ? 'Total Debt'
                                    : 'کل بدهی',
                              }
                            )}
                          </p>


                          <p
                            dir="ltr"
                            className="
                              mt-1
                              number-font
                              text-xs
                              font-semibold
                              text-[var(--text-primary)]
                            "
                          >
                            {formatNumber(
                              credit.totalDebt
                            )}
                          </p>

                        </div>


                        <div
                          className="
                            rounded-xl
                            border
                            border-emerald-500/10
                            bg-emerald-500/5
                            p-3
                          "
                        >

                          <p
                            className="
                              text-[9px]
                              text-[var(--text-muted)]
                            "
                          >
                            {t(
                              'credit.table.columns.paid',
                              {
                                defaultValue:
                                  isEnglish
                                    ? 'Paid'
                                    : 'پرداخت‌شده',
                              }
                            )}
                          </p>


                          <p
                            dir="ltr"
                            className="
                              mt-1
                              number-font
                              text-xs
                              font-semibold
                              text-emerald-600
                              dark:text-emerald-400
                            "
                          >
                            {formatNumber(
                              credit.paid
                            )}
                          </p>


                          {renderPaymentsHint(
                            credit
                          )}

                        </div>

                      </div>


                      {/* Footer */}

                      <div
                        className="
                          mt-3
                          flex
                          items-center
                          justify-between
                          gap-3
                          border-t
                          border-[var(--border)]
                          pt-3
                        "
                      >

                        <span
                          className="
                            text-[9px]
                            text-[var(--text-muted)]
                          "
                        >
                          {t(
                            'credit.table.columns.lastTransaction',
                            {
                              defaultValue:
                                isEnglish
                                  ? 'Last Transaction'
                                  : 'آخرین تراکنش',
                            }
                          )}
                        </span>


                        <span
                          className="
                            text-[10px]
                            font-medium
                            text-[var(--text-secondary)]
                          "
                        >
                          {formatDate(
                            credit.lastTransaction,
                            isEnglish,
                            jalaliMonthStyle
                          )}
                        </span>

                      </div>

                    </article>
                  );

                }
              )}

            </div>

          </>
        )}

    </section>
  );
}


export default CreditTable;