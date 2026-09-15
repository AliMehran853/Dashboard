const enTranslate = {
  translation: {
    // =====================================================
    // Common
    // =====================================================

    common: {
      appName: "Shop Manager",
      storeManagement: "Store Management",

      dashboard: "Dashboard",
      dashboardSummary: "Store overview",
      dashboardSubtitle: "Store overview and today's activity",

      mainMenu: "Main Menu",
      system: "System",

      shoppingList: "Shopping List",

      logout: "Log Out",

      notifications: "Notifications",

      profile: "My Profile",
      settings: "Settings",

      administrator: "Store Manager",
      systemAdministrator: "System Administrator",

      enableLightMode: "Enable light mode",
      enableDarkMode: "Enable dark mode",

      lightMode: "Light mode",
      darkMode: "Dark mode",

      openMenu: "Open menu",
      closeMenu: "Close menu",

      language: "Language",

      persian: "فارسی",
      english: "English",

      today: "Today",
      yesterday: "Yesterday",

      incoming: "Incoming",
      outgoing: "Outgoing",

      currency: "AF",

      copy: "Copy",
      copied: "Copied",
      cancel: "Cancel",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      close: "Close",
    },

    // =====================================================
    // Navigation
    // =====================================================

    navigation: {
      dashboard: "Dashboard",
      sales: "Cash Sales",
      creditSales: "Credit Sales",
      products: "Products",
      reports: "Reports",
      shoppingList: "Shopping List",
      settings: "Settings",
    },

    // =====================================================
    // Dashboard
    // =====================================================

    dashboard: {
      stats: {
        todaySales: {
          title: "Today's Sales",
          transactionCount: "{{count}} transactions today",
          active: "Active",
          noSales: "No sales",
          unit: "AF",
        },

        creditSales: {
          title: "Credit Sales",
          description: "Total credit sales today",
          recorded: "Recorded",
          none: "No credit",
          unit: "AF",
        },

        products: {
          title: "Products",
          description: "Total store products",
          active: "Active",
          empty: "Empty",
          unit: "items",
        },

        shoppingList: {
          title: "Shopping List",
          description: "Uncompleted shopping items",
          pending: "Pending",
          completed: "Completed",
          unit: "items",
        },
      },

      salesChart: {
        title: "Sales Trend",
        description: "Total sales over the last seven days",
        total: "Total Sales",
        series: "Sales",
        loading: "Loading sales data...",
        empty: "No sales have been recorded in the last seven days.",
      },

      paymentChart: {
        title: "Payment Status",
        description: "Today's sales by payment method",
        cash: "Cash Sales",
        credit: "Credit Sales",
        total: "Total Sales",
        loading: "Loading information...",
        empty: "No sales have been recorded today yet.",
      },

      thirtyDaySalesChart: {
        title: "Sales - Last 30 Days",
        description: "Daily sales activity over the last 30 days",
        total: "Total Sales",
        saleDays: "Sales Days",
        series: "Daily Sales",
        loading: "Loading 30-day sales data...",
        empty: "No sales have been recorded in the last 30 days.",
      },

      monthlySalesChart: {
        title: "Monthly Sales",
        description: "Sales trend over the last 12 months",
        total: "Total Sales",
        series: "Monthly Sales",
        loading: "Loading monthly sales data...",
        empty: "No sales have been recorded in the last 12 months.",
      },

      quickActions: {
        title: "Quick Actions",
        description: "Perform common store operations quickly",

        newSale: {
          title: "New Sale",
          description: "Create a new sale",
        },

        shoppingList: {
          title: "Shopping List",
          description: "Manage store purchases",
        },

        creditSale: {
          title: "New Credit Sale",
          description: "Manage credit sales",
        },

        reports: {
          title: "Reports",
          description: "View financial reports",
        },
      },

      recentTransactions: {
        title: "Recent Transactions",
        description: "Latest sales recorded in the store",
        viewAll: "View All",

        loading: "Loading transactions...",
        empty: "No sales have been recorded yet.",

        sale: {
          title: "Sale",
          description: "Recorded sale",
        },

        saleDescription: "Recorded sale",
        customer: "Customer",
        itemsCount: "{{count}} items",

        paymentTypes: {
          cash: "Cash",
          credit: "Credit",
        },
      },
    },

    // =====================================================
    // Products
    // =====================================================

    products: {
      page: {
        title: "Products",
        description: "Manage products and inventory",
        addProduct: "Add Product",
      },

      statsSection: {
        title: "Product Summary",
        description: "Current status of products and inventory",
      },

      pageTitle: "Products",
      pageDescription: "Manage products and inventory",
      addProduct: "Add Product",

      error: {
        load: "Failed to load products.",
        update: "Failed to update product.",
        add: "Failed to add product.",
        delete: "Failed to delete product.",
      },

      deleteModal: {
        title: "Delete Product",
        subtitle: "Confirm deletion",
        question: "Are you sure you want to delete this product?",
        messageBefore: "Product",
        messageAfter: "will be permanently removed from the product list.",
        warning:
          "This action cannot be undone. Make sure you no longer need this product before deleting it.",
        cancel: "Cancel",
        delete: "Delete Product",
        deleting: "Deleting...",
      },

      form: {
        addTitle: "Add New Product",
        editTitle: "Edit Product",

        addSubtitle: "Enter product information",
        editSubtitle: "Edit product information",

        errors: {
          loadCategories: "Failed to load categories.",
          nameRequired: "Please enter the product name.",
          categoryRequired: "Please select a product category.",
          buyPriceInvalid: "Purchase price is invalid.",
          sellPriceInvalid: "Selling price is invalid.",
          sellPriceLowerThanBuy:
            "Selling price cannot be lower than purchase price.",
          stockInvalid: "Initial stock is invalid.",
          minStockInvalid: "Minimum stock is invalid.",
          unitRequired: "Please select the product unit.",
          save: "Failed to save the product. Please try again.",
        },

        sections: {
          basic: "Basic Information",
          prices: "Prices",
          inventory: "Inventory",
          description: "Description",
        },

        fields: {
          name: "Product Name",
          namePlaceholder: "e.g. Coca-Cola",

          category: "Category",
          categoryPlaceholder: "Select category",
          loadingCategories: "Loading...",

          unit: "Unit",

          buyPrice: "Purchase Price",
          buyPricePlaceholder: "e.g. 35",

          sellPrice: "Selling Price",
          sellPricePlaceholder: "e.g. 50",

          stock: "Initial Stock",
          stockPlaceholder: "e.g. 25",

          minStock: "Minimum Stock",
          minStockPlaceholder: "e.g. 5",

          descriptionPlaceholder: "Optional description about the product...",
        },

        actions: {
          cancel: "Cancel",
          saving: "Saving...",
          save: "Save Product",
          saveChanges: "Save Changes",
        },
      },

      table: {
        title: "Product List",
        description: "Manage products and inventory",
        productCount: "products",

        loading: "Loading products...",

        empty: {
          title: "No products have been registered yet",
          description: "Add your first product.",
        },

        columns: {
          product: "Product",
          category: "Category",
          buyPrice: "Purchase Price",
          sellPrice: "Selling Price",
          stock: "Stock",
          status: "Status",
          updated: "Updated",
          actions: "Actions",
        },

        status: {
          outOfStock: "Out of Stock",
          lowStock: "Low Stock",
          available: "Available",
        },

        actions: {
          viewDetails: "View Details",
          details: "Details",
          options: "Options",
          edit: "Edit Product",
          delete: "Delete Product",
        },
      },

      details: {
        title: "Product Details",
        subtitle: "View complete product information",

        lastUpdated: "Last Updated",

        defaults: {
          category: "Uncategorized",
          unit: "unit",
        },

        status: {
          outOfStock: "Out of Stock",
          lowStock: "Low Stock",
          available: "Available",
        },

        sections: {
          pricing: "Pricing Information",
          inventory: "Inventory Information",
        },

        labels: {
          buyPrice: "Purchase Price",
          sellPrice: "Selling Price",
          profitPerUnit: "Profit Per Unit",
          profitMargin: "Profit Margin",

          currentStock: "Current Stock",
          minimumStock: "Minimum Stock",
          inventoryPurchaseValue: "Inventory Purchase Value",
          inventorySalesValue: "Inventory Sales Value",
        },

        stockWarning: {
          outOfStock: {
            title: "This product is out of stock",
            description: "Restock this product to continue selling it.",
          },

          lowStock: {
            title: "This product is low on stock",
            description:
              "Current stock is less than or equal to the minimum stock ({{count}} {{unit}}).",
          },
        },

        summary: {
          potentialProfit: "Potential Inventory Profit",
          productUnit: "Product Unit",
          category: "Category",
        },

        description: {
          title: "Description",
        },

        actions: {
          edit: "Edit",
          delete: "Delete",
          close: "Close",
        },
      },
    },

    // =====================================================
    // Product Statistics
    // =====================================================

    productStats: {
      products: {
        title: "Total Products",
        description: "Registered products",
      },

      categories: {
        title: "Categories",
        description: "Active categories",
      },

      lowStock: {
        title: "Low Stock",
        checking: "Checking inventory",
        outOfStock: "{{count}} products out of stock",
        supply: "Needs restocking",
      },

      inventoryValue: {
        title: "Inventory Value",
        description: "Based on purchase price",
      },
    },

    // =====================================================
    // Product Filters
    // =====================================================

    productFilters: {
      title: "Product Filters",
      description: "Search and filter products",
      clear: "Clear Filters",
      searchPlaceholder: "Search products...",
      allCategories: "All Categories",
      allProducts: "All Products",
      available: "Available",
      lowStock: "Low Stock",
      outOfStock: "Out of Stock",
      activeFilters: "Active filters:",
      category: "Category:",
      status: "Status:",
    },

    // =====================================================
    // Sales
    // =====================================================

    sales: {
      pageTitle: "Cash Sales",
      pageDescription: "Manage and record cash sales",
      addSale: "New Sale",

      paymentTypes: {
        cash: "Cash",
        credit: "Credit",
      },

      stats: {
        todaySales: {
          title: "Today's Sales",
          description: "{{count}} sales recorded",
        },

        cashSales: {
          title: "Cash Sales",
          description: "Cash payments",
        },

        creditSales: {
          title: "Credit Sales",
          description: "Customer debt",
        },

        pendingCredit: {
          title: "Pending Credit Debt",
          description: "{{count}} unpaid customer",
          cta: "View credit page",
        },

        items: {
          title: "Items Sold",
          description: "Units sold",
        },
      },

      filters: {
        title: "Sales Filters",
        description: "Search and filter sales",
        clear: "Clear Filters",
        searchPlaceholder: "Search sales...",
        allPayments: "All Payments",
        cash: "Cash",
        credit: "Credit",
        allCategories: "All Categories",
        activeFilters: "Active filters:",
        payment: "Payment:",
        category: "Category:",
      },

      chart: {
        title: "Sales Trend",
        description: "Compare cash and credit sales this week",
        thisWeek: "This Week",
        cashSales: "Cash Sales",
        creditSales: "Credit Sales",
      },

      form: {
        title: "New Sale",
        subtitle: "Enter sale information",

        errors: {
          loadData: "Failed to load information.",
          productRequired: "Please select a product.",
          categoryRequired: "Please select a category.",
          quantityInvalid: "Quantity must be greater than zero.",
          priceInvalid: "Sale price is invalid.",
          creditCustomerRequired:
            "Please enter the customer name for a credit sale.",
          submit: "Failed to record the sale.",
        },

        productSection: {
          title: "Product Information",
        },

        fields: {
          product: "Product",
          productPlaceholder: "Select product",
          category: "Category",
          categoryPlaceholder: "Select category",
          quantity: "Quantity",
          unitPrice: "Unit Price",
        },

        category: {
          new: "New category",
          placeholder: "New category name",
          add: "Add",

          errors: {
            required: "Please enter a category name.",
            create: "Failed to create category.",
          },
        },

        total: {
          title: "Total Sale Amount",
          description: "Quantity × Unit Price",
        },

        payment: {
          title: "Payment Method",
          cashDescription: "Payment received",
          creditDescription: "Customer debt recorded",
        },

        customer: {
          title: "Customer Information",
          name: "Customer Name",
          nameRequired: "Customer Name *",
          phone: "07XX XXX XXX",
        },

        note: {
          title: "Notes",
          placeholder: "Notes related to this sale...",
        },

        actions: {
          cancel: "Cancel",
          saving: "Saving...",
          submit: "Record Sale",
        },
      },

      table: {
        title: "Sales List",
        salesCount: "sales",
        loading: "Loading sales...",
        viewDetails: "View details",
        fallbackProduct: "Product",

        empty: {
          title: "No sales found",
          description:
            "No sales matching these criteria have been recorded yet.",
        },

        columns: {
          product: "Product",
          category: "Category",
          quantity: "Quantity",
          amount: "Amount",
          payment: "Payment",
          date: "Date",
          actions: "Actions",
        },
      },

      details: {
        title: "Sale Details",
        subtitle: "Complete transaction information",

        totalAmount: "Total Amount",
        units: "units",

        paymentStatus: {
          title: "Payment Status",

          cashTitle: "Cash Payment",
          creditTitle: "Credit Payment",

          cashDescription: "The full sale amount has been received.",
          creditDescription:
            "This amount has been added to the customer account.",

          settled: "Settled",
          unpaid: "Unpaid",
        },

        saleInformation: {
          title: "Sale Information",
          quantity: "Quantity",
          unitPrice: "Unit Price",
          date: "Date",
          time: "Time",
        },

        customer: {
          title: "Customer Information",
          name: "Customer Name",
          phone: "Phone Number",
        },

        note: {
          title: "Notes",
          empty: "No notes",
        },

        footer: {
          recorded: "Transaction recorded",
          close: "Close",
        },
      },
    },

    // =====================================================
    // Credit
    // =====================================================

    credit: {
      page: {
        title: "Credit Accounts",
        badge: "Credit",
        description: "Manage customer debts and store credit accounts",
        newCustomer: "New Customer",
        newCredit: "New Credit Sale",
        debtorCustomers: "Debtors",
        person: "customers",
      },

      stats: {
        sectionTitle: "Credit Overview",
        sectionDescription: "Current customer debt status",

        totalDebt: {
          title: "Total Debt",
          description: "Total amount of customer credit sales",
        },

        remaining: {
          title: "Remaining Debt",
          description: "Total unpaid customer debt",
        },

        todayDebt: {
          title: "Today's Credit",
          description: "Credit sales recorded today",
        },

        debtors: {
          title: "Debtors",
          description: "Customers with outstanding debt",
          unit: "customers",
        },

        settled: {
          title: "Settled Accounts",
          description: "Customers who have fully paid their debt",
          unit: "customers",
        },

        paid: {
          title: "Total Paid",
          description: "Total payments received from customers",
        },
      },

      filters: {
        title: "Search & Filter",
        description: "Find and organize customer credit accounts",
        clear: "Clear Filters",
        searchPlaceholder: "Search customer name or phone...",

        status: {
          all: "All Accounts",
          allShort: "All",
          debt: "Debt",
          partial: "Partial Payment",
          settled: "Settled",
        },

        sort: {
          newest: "Newest",
          oldest: "Oldest",
          highest: "Highest Debt",
          lowest: "Lowest Debt",
          name: "Customer Name",
        },

        quickStatus: {
          title: "Status:",
        },
      },

      table: {
        title: "Customer Accounts",
        description: "Customer credit account records",
        accountsCount: "accounts",
        loading: "Loading accounts...",

        columns: {
          customer: "Customer",
          totalDebt: "Total Debt",
          paid: "Paid",
          remaining: "Remaining",
          lastTransaction: "Last Transaction",
          status: "Status",
          actions: "Actions",
        },

        status: {
          debt: "Debt",
          partial: "Partial Payment",
          settled: "Settled",
        },

        actions: {
          viewDetails: "View Details",
          payment: "Record Payment",
          delete: "Delete Account",
        },

        empty: {
          title: "No accounts found",
          description: "No customer accounts match the selected criteria.",
        },

        delete: {
          title: "Delete Customer Account",
          description:
            "This account has been fully settled. Are you sure you want to delete it?",
          cancel: "Cancel",
          confirm: "Delete Account",
        },

        deleteConfirm: "Are you sure you want to delete “{{customer}}”?",
      },

      details: {
        title: "Account Details",
        subtitle: "Complete customer credit account information",
        remaining: "Remaining",

        defaults: {
          customer: "Customer",
        },

        customer: {
          title: "Customer Information",
          name: "Customer Name",
          phone: "Phone Number",
          lastTransaction: "Last Transaction",
        },

        financialSummary: {
          title: "Account Summary",
          totalDebt: "Total Debt",
          paid: "Paid",
          remaining: "Remaining",
        },

        paymentProgress: "Payment Progress",

        paymentAction: {
          title: "Pay Debt",
          description:
            "Record a payment toward the customer's outstanding debt",
          button: "Record Payment",
        },

        settledDescription:
          "This account has been fully settled and there is no remaining debt.",

        transactions: {
          title: "Account History",

          payment: "Debt Payment",
          creditSale: "Credit Sale",

          creditSalesTitle: "Credit Sales",
          creditSalesDescription: "Customer credit sales history",

          paymentsTitle: "Customer Payments",
          paymentsDescription: "Customer payment history",

          noPayments: "No payments have been recorded for this account yet.",

          empty: {
            title: "No Transactions Yet",
            description:
              "Credit sales and customer payment history will appear here.",
          },

          noDate: "No date",
        },

        footer: {
          recorded: "Account information recorded",
          close: "Close",
        },
      },

      paymentModal: {
        title: "Record Payment",
        subtitle: "Record a payment toward the customer's debt",
        optional: "(Optional)",

        defaults: {
          customer: "Customer",
        },

        customer: {
          creditAccount: "Credit Account",
          currentDebt: "Current Debt",
        },

        fields: {
          amount: "Payment Amount",
          amountPlaceholder: "e.g. 1500",
          maximum: "Maximum payable amount:",
          paymentMethod: "Payment Method",
          date: "Payment Date",
          description: "Description",
          descriptionPlaceholder: "e.g. Partial payment of debt...",
        },

        methods: {
          cash: "Cash Payment",
          card: "Card / Bank Transfer",
        },

        errors: {
          amountRequired: "Please enter the payment amount.",
          amountTooHigh: "The payment amount cannot exceed the remaining debt.",
        },

        actions: {
          cancel: "Cancel",
          submit: "Record Payment",
        },
      },

      saleForm: {
        title: "New Credit Sale",
        badge: "Credit",
        subtitle: "Record a new customer credit sale",
        optional: "(Optional)",

        errors: {
          customerRequired: "Please enter the customer name.",
          productRequired: "Please select the product.",
          quantityRequired: "Quantity must be greater than zero.",
          priceInvalid: "Please enter a valid unit price.",
        },

        customer: {
          title: "Customer Information",
          name: "Customer Name",
          namePlaceholder: "e.g. Ahmad Mohammadi",
          phone: "Phone Number",
          phonePlaceholder: "0700123456",
        },

        sale: {
          title: "Sale Information",
          product: "Product",
          productPlaceholder: "e.g. Soda",
          quantity: "Quantity",
          quantityPlaceholder: "e.g. 2",
          unitPrice: "Unit Price",
          unitPricePlaceholder: "e.g. 50",
          date: "Sale Date",
        },

        total: {
          title: "Total Credit Amount",
          description: "Quantity × Unit Price",
        },

        actions: {
          cancel: "Cancel",
          submit: "Record Credit Sale",
        },
      },

      errors: {
        load: "Unable to load credit accounts.",

        invalidCustomer: "The selected customer is not valid.",

        invalidPayment: "Please enter a valid payment amount.",

        paymentExceedsRemaining:
          "The payment amount cannot exceed the remaining debt.",

        paymentSave: "Unable to record the payment. Please try again.",

        productNotFound: "The selected product could not be found.",

        insufficientStock: "Insufficient stock. Available quantity:",

        saleSave: "Unable to record the credit sale. Please try again.",

        cannotDeleteWithDebt: "This customer still has an outstanding debt.",

        cannotDeleteWithHistory:
          "This customer has financial history and cannot be deleted.",

        deleteCustomer:
          "Unable to delete the customer account. Please try again.",
      },
    },

    // =====================================================
    // Reports
    // =====================================================

    reports: {
      page: {
        title: "Reports",
        description: "Review sales performance and store financial status",
      },

      actions: {
        export: "Export Report",
        exporting: "Preparing...",

        exportMenuHint: "Choose a format for the current report.",

        exportExcel: "Excel",
        exportExcelDesc: "Editable spreadsheet with full sales details",

        exportPdfColor: "PDF (Color)",
        exportPdfColorDesc: "Premium report with charts and colors",

        exportPdfMono: "PDF (Black & White)",
        exportPdfMonoDesc: "Printer-friendly for laser and budget printers",
      },

      loading: "Loading report...",

      errors: {
        load: "Failed to load the report.",
        export: "Failed to create the export file.",
      },

      empty: "No information is available to display.",

      filters: {
        title: "Report Filters",
        description: "Search and filter report data",

        activeFilters: "Active filters:",
        periodLabel: "Period:",
        paymentLabel: "Payment:",
        categoryLabel: "Category:",

        searchPlaceholder: "Search reports...",

        period: {
          all: "All Reports",
          today: "Today",
          week: "This Week",
          month: "This Month",
        },

        payment: {
          all: "All Payments",
          cash: "Cash",
          credit: "Credit",
        },

        category: {
          all: "All Categories",
        },

        clear: "Clear",
      },

      stats: {
        sectionTitle: "Report Overview",
        sectionDescription: "Key figures from the selected report",

        totalSales: "Total Sales",
        totalRevenue: "Total Revenue",
        cashSales: "Cash Sales",
        creditSales: "Credit Sales",
      },

      summary: {
        title: "Report Summary",
        description: "Overview of sales performance",

        bestCategory: "Best-Selling Category",
        averageSale: "Average Sale",
        totalItems: "Items Sold",
        itemUnit: "items",
        bestCategorySales: "Top Category Sales",
      },

      charts: {
        salesTrend: {
          title: "Sales Trend",
          description: "Sales volume over recent days",
          series: "Sales",
        },

        categorySales: {
          title: "Sales by Category",
          description: "Compare sales across different categories",
          series: "Sales",
          uncategorized: "Uncategorized",
        },

        paymentDistribution: {
          title: "Payment Type",
          description: "Compare cash and credit sales",

          cash: "Cash",
          credit: "Credit",
          unknown: "Unknown",

          total: "Total",
        },
      },

      export: {
        title: "Sales Report",
        salesTitle: "Sales Details",
        page: "Page {{current}} of {{total}}",
        generatedBy: "Generated by Shop Manager",
        printedAt: "Printed: {{date}}",

        labels: {
          manager: "Manager",
          period: "Period",
          payment: "Payment",
          category: "Category",
          search: "Search",
          totalSales: "Total Sales",
          transactions: "Transactions",
          items: "Items Sold",
          average: "Average Sale",
          cash: "Cash Sales",
          credit: "Credit Sales",
          bestCategory: "Best Category",
          date: "Date",
          time: "Time",
          product: "Product",
          quantity: "Qty",
          amount: "Amount",
          paymentType: "Payment",
          customer: "Customer",
          noData: "No sales found",
        },

        charts: {
          paymentOverview: "Payment Overview",
          topCategories: "Top Categories",
        },
      },
    },

    // =====================================================
    // Shopping List
    // =====================================================

    shoppingList: {
      page: {
        title: "Shopping List",
        description: "Manage store needs for upcoming purchases",
      },

      actions: {
        add: "Add Shopping Item",
      },

      defaultUnit: "unit",

      errors: {
        load: "Failed to load the shopping list.",
        save: "Failed to save the shopping item.",
        delete: "Failed to delete the shopping item.",
        toggle: "Failed to change the shopping item status.",

        nameRequired: "Shopping item name is required.",
        quantityInvalid: "Quantity must be greater than zero.",
        itemNotFound: "Shopping item was not found.",
        itemNotFoundAfterEdit:
          "The shopping item could not be found after editing.",
      },

      filters: {
        searchPlaceholder: "Search shopping items...",

        status: {
          all: "All",
          pending: "Pending",
          completed: "Completed",
        },

        priority: {
          all: "All Priorities",
          low: "Low",
          normal: "Normal",
          high: "High",
          urgent: "Urgent",
        },

        clear: "Clear Filters",
      },

      stats: {
        total: "Total Items",
        pending: "Pending",
        completed: "Completed",
      },

      form: {
        addTitle: "Add to Shopping List",
        editTitle: "Edit Shopping Item",

        subtitle: "Enter information about the item to purchase",

        fields: {
          name: "Shopping Item Name",
          namePlaceholder: "e.g. Coca-Cola",

          quantity: "Quantity",
          unit: "Unit",

          category: "Category",
          categoryPlaceholder: "e.g. Cakes or Fruits",

          categoryHint:
            "Previously used categories are suggested while typing. New categories are also added when saved.",

          priority: "Purchase Priority",

          note: "Description",
          notePlaceholder: "Additional notes...",
        },

        units: {
          piece: "Piece",
          pack: "Pack",
          carton: "Carton",
          kilogram: "Kg",
          gram: "Gram",
          liter: "Liter",
          meter: "Meter",
        },

        priority: {
          low: "Low",
          normal: "Normal",
          high: "High",
          urgent: "Urgent",
        },

        errors: {
          nameRequired: "Shopping item name is required.",
          quantityInvalid: "Quantity must be greater than zero.",
          save: "Failed to save the shopping item.",
        },

        actions: {
          saving: "Saving...",
          saveChanges: "Save Changes",
          add: "Add to List",
          cancel: "Cancel",
        },
      },

      deleteModal: {
        title: "Delete Shopping Item",

        messageBefore: "Are you sure you want to delete",
        messageAfter: "from the shopping list?",

        cancel: "Cancel",
        delete: "Delete",
        deleting: "Deleting...",
      },

      details: {
        title: "Shopping Item Details",
        subtitle: "Complete information about the selected item",

        itemLabel: "Shopping Item",

        statusLabel: "Status",
        status: {
          completed: "Purchased",
          pending: "Pending Purchase",
        },

        priorityLabel: "Priority",
        priority: {
          low: "Low",
          normal: "Normal",
          high: "High",
          urgent: "Urgent",
        },

        quantityLabel: "Required Quantity",
        defaultUnit: "unit",
        categoryLabel: "Category",
        noteLabel: "Description",

        createdAt: "Created At",
        updatedAt: "Last Updated",

        notAvailable: "---",

        actions: {
          close: "Close",
          complete: "Mark as Done",
          edit: "Edit",
          delete: "Delete",
        },
      },

      table: {
        title: "Shopping Items",
        itemCount: "items",

        columns: {
          item: "Shopping Item",
          quantity: "Quantity",
          priority: "Priority",
          actions: "Actions",
        },

        labels: {
          quantity: "Quantity:",
          priority: "Priority:",
        },

        categoryPrefix: "Category:",
        noName: "Unnamed",

        priority: {
          low: "Low",
          normal: "Normal",
          high: "High",
          urgent: "Urgent",
        },

        empty: {
          title: "Shopping List Is Empty",
          description: "No shopping items have been added yet.",
        },

        actions: {
          details: "Details",
          complete: "Mark as Done",
          restore: "Restore to List",
          markComplete: "Mark as Completed",
          edit: "Edit",
          delete: "Delete",
        },
      },
    },

    // =====================================================
    // Settings
    // =====================================================

    settings: {
      page: {
        title: "Settings",
        description:
          "Store settings, application appearance, and system information",
      },

      store: {
        title: "Store Information",
        description: "Manage your store's basic information",

        fields: {
          name: {
            label: "Store Name",
            placeholder: "Store name",
          },

          owner: {
            label: "Administrator Name",
            placeholder: "Store administrator",
          },

          phone: {
            label: "Phone Number",
            placeholder: "07XX XXX XXX",
          },

          address: {
            label: "Address",
            placeholder: "Store address",
          },

          description: {
            label: "Store Description",
            placeholder: "A short description about the store...",
          },
        },

        messages: {
          saved: "Store information saved successfully.",
        },

        actions: {
          save: "Save Information",
        },
      },

      account: {
        title: "User Account",
        description: "Manage administrator login information",

        loading: "Loading account information...",

        fields: {
          name: {
            label: "Administrator Name",
            placeholder: "Administrator name",
          },

          email: {
            label: "Login Email",
            placeholder: "example@gmail.com",
            hint: "This email is used to sign in to the account.",
          },

          password: {
            label: "Password",
            placeholder: "New password",
            hint: "Enter a new password to change it. At least 6 characters.",
          },
        },

        activeAccount: "Active Account",

        securitySection: {
          title: "Security Questions",
          description:
            "These questions are used to recover your credentials if you forget them.",
          hint:
            "To change them, pick 3 new questions and answer them all. Otherwise leave them empty.",
          currentTitle: "Current Questions",
          changeTitle: "Change Questions",
          changeToggle: "I want to change my questions",
          cancelChange: "Cancel change",
          leaveEmpty:
            "To change questions, pick 3 new ones and answer them",
        },

        credentialsNote:
          "This information is stored on this device only. If you forget it, you can only recover it via your security questions.",

        messages: {
          success: "Account information saved successfully.",
          successWithCredentials:
            "Saved. Use your new email and password next time you sign in.",
          successWithSecurity:
            "Account and security questions saved successfully.",
        },

        errors: {
          load: "Failed to load account information.",
          nameRequired: "Please enter the administrator name.",
          emailRequired: "Please enter the email address.",
          emailInvalid: "Email format is invalid.",
          emailTypo: "Email looks wrong. Did you mean “{{suggestion}}”?",
          emailTypoSuggest: "Did you mean “{{suggestion}}”?",
          passwordRequired: "Please enter the password.",
          passwordMin: "Password must be at least {{count}} characters.",
          save: "Failed to save account information.",
          securityRequired: "Please answer all security questions.",
          securityDuplicate: "Security questions must be different.",
        },

        actions: {
          save: "Save Changes",
          saving: "Saving...",
          fixTypo: "Use this email",
        },
      },

      appearance: {
        title: "Appearance",
        description: "Customize the display mode and application colors",

        theme: {
          title: "Display Mode",
          description: "Choose your preferred display mode.",

          dark: "Dark",
          darkMode: "Dark Mode",

          light: "Light",
          lightMode: "Light Mode",
        },

        jalaliMonths: {
          title: "Jalali Month Names",
          description:
            "Choose how Jalali month names are displayed throughout the application.",

          afghanistan: "Afghanistan",
          afghanistanMonths:
            "Hamal, Saur, Jawza, Saratan, Asad, Sonbola, Mizan, Aqrab, Qaws, Jadi, Dalwa, Hoot",

          iran: "Iran",
          iranMonths:
            "Farvardin, Ordibehesht, Khordad, Tir, Mordad, Shahrivar, Mehr, Aban, Azar, Dey, Bahman, Esfand",
        },

        accent: {
          title: "Accent Color",
          description: "The main color used throughout the application.",
        },

        colors: {
          emerald: {
            name: "Emerald",
            description: "Recommended",
          },

          blue: {
            name: "Blue",
            description: "Calm and professional",
          },

          indigo: {
            name: "Indigo",
            description: "Deep and focused",
          },

          violet: {
            name: "Violet",
            description: "Modern and luxurious",
          },

          rose: {
            name: "Rose",
            description: "Subtle and distinctive",
          },

          red: {
            name: "Red",
            description: "Bold and energetic",
          },

          amber: {
            name: "Amber",
            description: "Warm and glowing",
          },

          cyan: {
            name: "Cyan",
            description: "Fresh and technological",
          },

          teal: {
            name: "Teal",
            description: "Serene and balanced",
          },
        },
      },

      backup: {
        title: "Backup & Restore",
        description: "Protect your store data",

        security: {
          title: "Your Data Matters",
          description:
            "We recommend regularly creating backups of your store data.",
        },

        export: {
          title: "Create Backup",
          description: "Save the current application data to a JSON file.",

          preparing: "Preparing...",
          button: "Download Backup",
        },

        import: {
          title: "Restore Data",
          description:
            "Import previously saved information from a Backup file.",

          restoring: "Restoring...",
          button: "Choose Backup File",
        },

        fileFormat: {
          label: "Backup Format",
        },

        messages: {
          exportSuccess: "Backup created and downloaded successfully.",
          importSuccess:
            "Data restored successfully. The page will reload to apply the changes.",
        },

        errors: {
          export: "Failed to create the backup.",
          import: "The Backup file is invalid or could not be restored.",
        },
      },

      categories: {
        title: "Categories",
        description: "Manage product categories",

        form: {
          placeholder: "New category name",
          add: "Add",
        },

        list: {
          title: "Existing Categories",
          count: "categories",
          empty: "No categories have been added yet.",
        },

        actions: {
          delete: "Delete Category",
        },

        deleteConfirm:
          'Are you sure you want to delete the category "{{name}}"?',

        messages: {
          added: "Category added successfully.",
          deleted: "Category deleted successfully.",
        },

        errors: {
          load: "Failed to load categories.",
          add: "Failed to add the category.",
          delete: "Failed to delete the category.",
          nameRequired: "Please enter a category name.",
        },
      },

      notifications: {
        title: "Notifications",
        description: "Manage system notifications",

        items: {
          lowStock: {
            title: "Low Stock",
            description: "Notify when product stock becomes low",
          },

          newSale: {
            title: "New Sale",
            description: "Show a notification when a new sale is recorded",
          },

          credit: {
            title: "Customer Debt",
            description: "Reminders for credit sales",
          },

          successfulActions: {
            title: "Successful Actions",
            description: "Show success messages for completed actions",
          },
        },
      },
    },

    // =====================================================
    // Security Questions
    // =====================================================

    securityQuestions: {
      firstSchool: "What was the name of my first school?",
      firstPet: "What was the name of my first pet?",
      birthCity: "What city was I born in?",
      firstTeacher: "What was my first teacher's name?",
      childhoodFriend: "What was my best childhood friend's name?",
    },

    // =====================================================
    // Login
    // =====================================================

    login: {
      loading: "Preparing...",

      brand: {
        title: "Store Management",
        description: "Sign in to the administrator account to continue",
      },

      form: {
        title: "Sign in to your account",
        description: "Enter the administrator account information",
      },

      fields: {
        email: {
          label: "Email",
          placeholder: "example@email.com",
        },

        password: {
          label: "Password",
          placeholder: "Enter your password",
        },

        rememberMe: "Remember me",
      },

      actions: {
        forgotPassword: "Forgot password?",
        showPassword: "Show password",
        hidePassword: "Hide password",
        loggingIn: "Signing in...",
        login: "Sign in",
      },

      errors: {
        emailRequired: "Please enter your email address.",
        passwordRequired: "Please enter your password.",
        invalidCredentials: "Incorrect email or password.",
        failed: "Unable to sign in.",
      },

      // ─────────── Setup ───────────
      setup: {
        brand: {
          title: "Welcome to your store",
          description: "Create your store manager account to get started",
        },

        form: {
          title: "Create Manager Account",
          description: "Set your email, password, and security questions",
        },

        sections: {
          credentials: "Login Credentials",
          credentialsHint: "You will use these to sign in",
          security: "Security Questions",
          securityHint:
            "If you forget your password, answer these questions to recover it. Pick 3 out of 5.",
        },

        fields: {
          email: {
            label: "Email",
            placeholder: "example@email.com",
          },
          password: {
            label: "Password",
            placeholder: "At least {{count}} characters",
          },
          confirmPassword: {
            label: "Confirm Password",
            placeholder: "Re-enter your password",
          },
          questionN: "Question {{n}}",
          questionPlaceholder: "Choose a question",
          answer: "Answer",
          answerPlaceholder: "Enter your answer",
          emailSuggestion: "Did you mean “{{suggestion}}”?",
          useSuggestion: "Use this email",
        },

        actions: {
          create: "Create Account & Start",
          creating: "Creating...",
        },

        errors: {
          emailRequired: "Please enter your email.",
          emailInvalid: "Email format is invalid.",
          passwordRequired: "Please enter a password.",
          passwordMin: "Password must be at least {{count}} characters.",
          passwordMismatch: "Passwords do not match.",
          saveFailed: "Failed to save account information.",
          questionsRequired: "Please answer all security questions.",
          questionsDuplicate: "Security questions must be different.",
          answerMin: "Each answer must be at least {{count}} characters.",
        },

        security:
          "These credentials are stored on this device only. Keep them safe.",
      },

      // ─────────── Forgot Password ───────────
      forgotPassword: {
        title: "Password Recovery",
        subtitle: "Answer your security questions",

        step: "Step {{current}} of {{total}}",

        stepEmail: {
          title: "Enter your email",
          description:
            "Enter the email you used when creating your account",
          emailLabel: "Email",
          emailPlaceholder: "example@email.com",
          submit: "Check Email",
          checking: "Checking...",
        },

        stepQuestions: {
          title: "Answer your security questions",
          description: "Answers are not case-sensitive or space-sensitive",
          answerLabel: "Answer",
          answerPlaceholder: "Enter your answer",
          submit: "Verify Answers",
          verifying: "Verifying...",
          back: "Back",
        },

        stepResult: {
          title: "Your Account Credentials",
          description: "Save this information somewhere safe",
          emailLabel: "Email",
          passwordLabel: "Password",
          copy: "Copy",
          copied: "Copied",
          warning:
            "Once you close this window, you cannot view this information again.",
          close: "Close",
        },

        fallback: {
          title: "Forgot your answers?",
          description:
            "If you also forgot the answers, you must reset your account. All store data (products, sales) is preserved but your login credentials will be erased.",
          button: "Reset Account",
          confirm:
            "Are you sure? Your account will be deleted and you must register again. Store data is preserved.",
          confirmButton: "Yes, Reset Account",
          cancel: "Cancel",
        },

        errors: {
          emailRequired: "Please enter your email.",
          emailNotFound: "No account found with this email.",
          noSecurityQuestions:
            "This account has no security questions. You must reset it.",
          answersRequired: "All answers are required.",
          answersIncorrect: "One or more answers are incorrect.",
          resetFailed: "Unable to reset the account.",
        },
      },

      security: "This section is for the store administrator only",

      footer: "Shop Manager • Store Management System",
    },
  },
};

export default enTranslate;