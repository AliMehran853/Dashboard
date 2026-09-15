import {
  db,
  initializeDatabase,
} from '../database/db';

// =========================================================
// Report Service
// =========================================================

// =========================================================
// Helpers
// =========================================================

// ---------------------------------------------------------
// Sale Date
// ---------------------------------------------------------

const getSaleDate = (
  sale
) =>
  sale?.date ||
  sale?.createdAt ||
  sale?.updatedAt ||
  null;

// ---------------------------------------------------------
// Sale Amount
// ---------------------------------------------------------

const getSaleAmount = (
  sale
) => {
  if (!sale) {
    return 0;
  }

  const amountCandidates = [
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
      amountCandidates
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

  if (
    Array.isArray(
      sale.items
    )
  ) {
    return sale.items.reduce(
      (
        total,
        item
      ) => {
        const itemPrice =
          Number(
            item?.sellPrice ??
              item?.price ??
              item?.unitPrice ??
              0
          );

        const itemQuantity =
          Number(
            item?.quantity ??
              item?.qty ??
              1
          );

        if (
          !Number.isFinite(
            itemPrice
          ) ||
          !Number.isFinite(
            itemQuantity
          )
        ) {
          return total;
        }

        return (
          total +
          itemPrice *
            itemQuantity
        );
      },
      0
    );
  }

  return 0;
};

// ---------------------------------------------------------
// Sale Quantity (in BASE units)
// ---------------------------------------------------------

const getSaleQuantity = (
  sale
) => {
  const inBase =
    Number(
      sale?.quantityInBase
    );

  if (
    Number.isFinite(
      inBase
    ) &&
    inBase > 0
  ) {
    return inBase;
  }

  const q =
    Number(
      sale?.quantity ??
        sale?.qty
    );

  const f =
    Number(
      sale?.saleFactor
    ) || 1;

  if (
    Number.isFinite(q)
  ) {
    return q * f;
  }

  if (
    Array.isArray(
      sale?.items
    )
  ) {
    return sale.items.reduce(
      (
        total,
        item
      ) => {
        const itemQuantity =
          Number(
            item?.quantity ??
              item?.qty ??
              0
          );

        return (
          total +
          (
            Number.isFinite(
              itemQuantity
            )
              ? itemQuantity
              : 0
          )
        );
      },
      0
    );
  }

  return 0;
};

// ---------------------------------------------------------
// Date bounds
// ---------------------------------------------------------

const startOfDay = (
  date
) => {
  const result =
    new Date(date);

  result.setHours(
    0,
    0,
    0,
    0
  );

  return result;
};

const endOfDay = (
  date
) => {
  const result =
    new Date(date);

  result.setHours(
    23,
    59,
    59,
    999
  );

  return result;
};

// ---------------------------------------------------------
// Local Date Key
// ---------------------------------------------------------

const getLocalDateKey = (
  date
) => {
  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    );

  const day =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    );

  return `${year}-${month}-${day}`;
};

// ---------------------------------------------------------
// Period Range
// ---------------------------------------------------------

const getPeriodRange = (
  period
) => {
  const today =
    new Date();

  if (
    period === 'today'
  ) {
    return {
      start:
        startOfDay(today),

      end:
        endOfDay(today),
    };
  }

  if (
    period === 'yesterday'
  ) {
    const yesterday =
      new Date(today);

    yesterday.setDate(
      yesterday.getDate() -
        1
    );

    return {
      start:
        startOfDay(
          yesterday
        ),

      end:
        endOfDay(
          yesterday
        ),
    };
  }

  if (
    period === 'month'
  ) {
    const start =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

    return {
      start:
        startOfDay(start),

      end:
        endOfDay(today),
    };
  }

  if (
    period === 'year'
  ) {
    const start =
      new Date(
        today.getFullYear(),
        0,
        1
      );

    return {
      start:
        startOfDay(start),

      end:
        endOfDay(today),
    };
  }

  if (
    period === 'all'
  ) {
    const start =
      new Date(today);

    start.setDate(
      start.getDate() -
        364
    );

    return {
      start:
        startOfDay(start),

      end:
        endOfDay(today),
    };
  }

  const start =
    new Date(today);

  start.setDate(
    start.getDate() -
      6
  );

  return {
    start:
      startOfDay(start),

    end:
      endOfDay(today),
  };
};

// ---------------------------------------------------------
// Normalize Payment Type
// ---------------------------------------------------------

const normalizePaymentType = (
  paymentType
) =>
  String(
    paymentType || ''
  )
    .trim()
    .toLowerCase();

const isCashPayment = (
  paymentType
) => {
  const value =
    normalizePaymentType(
      paymentType
    );

  return (
    value === 'cash' ||
    value === 'نقدی' ||
    value === 'نقد'
  );
};

const isCreditPayment = (
  paymentType
) => {
  const value =
    normalizePaymentType(
      paymentType
    );

  return (
    value === 'credit' ||
    value === 'نسیه'
  );
};

// ---------------------------------------------------------
// Sale Date Parser
// ---------------------------------------------------------

const parseSaleDate = (
  sale
) => {
  const value =
    getSaleDate(sale);

  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
};

// ---------------------------------------------------------
// Search
// ---------------------------------------------------------

const normalizeSearch = (
  value
) =>
  String(
    value || ''
  )
    .trim()
    .toLowerCase();

const saleMatchesSearch = (
  sale,
  search
) => {
  const normalizedSearch =
    normalizeSearch(
      search
    );

  if (
    !normalizedSearch
  ) {
    return true;
  }

  const searchableText = [
    sale?.productName,
    sale?.category,
    sale?.customerName,
    sale?.customerPhone,
    sale?.note,
    sale?.paymentType,
    sale?.saleUnit,
    sale?.baseUnit,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchableText.includes(
    normalizedSearch
  );
};

// =========================================================
// Main Report
// =========================================================

export const getSalesReport =
  async ({
    period = 'week',
    paymentType = 'all',
    category = 'all',
    search = '',
  } = {}) => {
    await initializeDatabase();

    // ═══ Load all sales ═══

    const allSales =
      await db.sales.toArray();

    // ═══ Period range ═══

    const {
      start,
      end,
    } =
      getPeriodRange(
        period
      );

    // ═══ Normalize filters ═══

    const normalizedPaymentType =
      normalizePaymentType(
        paymentType
      );

    const normalizedSearch =
      normalizeSearch(
        search
      );

    // ═══ Filter ═══

    const filteredSales =
      allSales.filter(
        (
          sale
        ) => {
          const saleDate =
            parseSaleDate(
              sale
            );

          if (!saleDate) {
            return false;
          }

          if (
            saleDate < start ||
            saleDate > end
          ) {
            return false;
          }

          if (
            normalizedPaymentType !==
            'all'
          ) {
            const salePayment =
              normalizePaymentType(
                sale?.paymentType
              );

            if (
              salePayment !==
              normalizedPaymentType
            ) {
              return false;
            }
          }

          if (
            category !==
            'all'
          ) {
            const saleCategory =
              String(
                sale?.category ||
                  ''
              ).trim();

            if (
              saleCategory !==
              String(
                category
              ).trim()
            ) {
              return false;
            }
          }

          if (
            normalizedSearch &&
            !saleMatchesSearch(
              sale,
              normalizedSearch
            )
          ) {
            return false;
          }

          return true;
        }
      );

    // ═══ Statistics ═══

    let totalRevenue = 0;
    let cashSales = 0;
    let creditSales = 0;
    let totalItems = 0;

    filteredSales.forEach(
      (
        sale
      ) => {
        const amount =
          getSaleAmount(
            sale
          );

        totalRevenue +=
          amount;

        if (
          isCashPayment(
            sale?.paymentType
          )
        ) {
          cashSales +=
            amount;
        } else if (
          isCreditPayment(
            sale?.paymentType
          )
        ) {
          creditSales +=
            amount;
        } else {
          cashSales +=
            amount;
        }

        totalItems +=
          getSaleQuantity(
            sale
          );
      }
    );

    // ═══ Transactions ═══

    const totalTransactions =
      filteredSales.length;

    // ═══ Average Sale ═══

    const averageSale =
      totalTransactions >
      0
        ? Math.round(
            totalRevenue /
              totalTransactions
          )
        : 0;

    // ═══ Sales trend ═══

    const salesByDate =
      {};

    filteredSales.forEach(
      (
        sale
      ) => {
        const date =
          parseSaleDate(
            sale
          );

        if (!date) {
          return;
        }

        const key =
          getLocalDateKey(
            date
          );

        if (
          !salesByDate[
            key
          ]
        ) {
          salesByDate[
            key
          ] = 0;
        }

        salesByDate[
          key
        ] += getSaleAmount(
          sale
        );
      }
    );

    const salesTrend =
      [];

    const current =
      new Date(start);

    while (
      current <= end
    ) {
      const key =
        getLocalDateKey(
          current
        );

      const dayName =
        current.toLocaleDateString(
          'fa-AF',
          {
            weekday:
              'long',
          }
        );

      salesTrend.push({
        date:
          dayName,

        isoDate:
          key,

        sales:
          salesByDate[
            key
          ] || 0,
      });

      current.setDate(
        current.getDate() +
          1
      );
    }

    // ═══ Payment distribution ═══

    const paymentDistribution =
      [
        {
          name:
            'نقدی',

          value:
            cashSales,
        },

        {
          name:
            'نسیه',

          value:
            creditSales,
        },
      ];

    // ═══ Category sales ═══

    const categoryMap =
      {};

    filteredSales.forEach(
      (
        sale
      ) => {
        const saleCategory =
          String(
            sale?.category ||
              ''
          ).trim();

        const categoryName =
          saleCategory ||
          'بدون دسته‌بندی';

        const amount =
          getSaleAmount(
            sale
          );

        if (
          !categoryMap[
            categoryName
          ]
        ) {
          categoryMap[
            categoryName
          ] = 0;
        }

        categoryMap[
          categoryName
        ] += amount;
      }
    );

    const categorySales =
      Object.entries(
        categoryMap
      )
        .map(
          ([
            categoryName,
            sales,
          ]) => ({
            category:
              categoryName,

            sales,
          })
        )
        .sort(
          (a, b) =>
            b.sales -
            a.sales
        );

    // ═══ Best category ═══

    const bestCategory =
      categorySales[0];

    // ═══ Return ═══

    return {
      statistics: {
        totalSales:
          totalTransactions,

        totalTransactions,

        totalRevenue,

        cashSales,

        creditSales,
      },

      salesTrend,

      paymentDistribution,

      categorySales,

      summary: {
        bestCategory:
          bestCategory?.category ||
          '-',

        bestCategorySales:
          bestCategory?.sales ||
          0,

        averageSale,

        totalItems,
      },

      rawSales:
        filteredSales,
    };
  };

// =========================================================
// Categories For Report Filter
// =========================================================

export const getReportCategories =
  async () => {
    await initializeDatabase();

    return db.categories
      .orderBy('name')
      .toArray();
  };

// =========================================================
// Default Export
// =========================================================

export default {
  getSalesReport,
  getReportCategories,
};