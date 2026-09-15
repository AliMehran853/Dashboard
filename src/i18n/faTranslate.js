const faTranslate = {
  translation: {
    // =====================================================
    // Common
    // =====================================================

    common: {
      appName: "Shop Manager",
      storeManagement: "مدیریت فروشگاه",

      dashboard: "داشبورد",
      dashboardSummary: "خلاصه وضعیت فروشگاه",
      dashboardSubtitle: "خلاصه وضعیت فروشگاه و فعالیت‌های امروز",

      mainMenu: "منوی اصلی",
      system: "سیستم",

      shoppingList: "لیست خرید",

      logout: "خروج از حساب",

      notifications: "اعلان‌ها",

      profile: "پروفایل من",
      settings: "تنظیمات",

      administrator: "مدیر فروشگاه",
      systemAdministrator: "مدیر سیستم",

      enableLightMode: "فعال کردن حالت روشن",
      enableDarkMode: "فعال کردن حالت تاریک",

      lightMode: "حالت روشن",
      darkMode: "حالت تاریک",

      openMenu: "باز کردن منو",
      closeMenu: "بستن منو",

      language: "زبان",

      persian: "فارسی",
      english: "English",

      today: "امروز",
      yesterday: "دیروز",

      incoming: "ورودی",
      outgoing: "خروج",

      currency: "AF",
    },

    // =====================================================
    // Navigation
    // =====================================================

    navigation: {
      dashboard: "داشبورد",
      sales: "فروش نقدی",
      creditSales: "فروش نسیه",
      products: "محصولات",
      reports: "گزارشات",
      shoppingList: "لیست خرید",
      settings: "تنظیمات",
    },

    // =====================================================
    // Dashboard
    // =====================================================

    dashboard: {
      stats: {
        todaySales: {
          title: "فروش امروز",
          transactionCount: "{{count}} معامله امروز",
          active: "فعال",
          noSales: "بدون فروش",
          unit: "AF",
        },

        creditSales: {
          title: "فروش نسیه",
          description: "مجموع فروش نسیه امروز",
          recorded: "ثبت شده",
          none: "بدون نسیه",
          unit: "AF",
        },

        products: {
          title: "محصولات",
          description: "تعداد محصولات فروشگاه",
          active: "فعال",
          empty: "خالی",
          unit: "کالا",
        },

        shoppingList: {
          title: "لیست خرید",
          description: "تعداد موارد تکمیل‌نشده",
          pending: "در انتظار",
          completed: "تکمیل شده",
          unit: "مورد",
        },
      },

      salesChart: {
        title: "روند فروش",
        description: "مجموع فروش هفت روز اخیر",
        total: "مجموع فروش",
        series: "فروش",
        loading: "در حال دریافت اطلاعات فروش...",
        empty: "در هفت روز اخیر هیچ فروشی ثبت نشده است.",
      },

      paymentChart: {
        title: "وضعیت پرداخت",
        description: "تقسیم فروش امروز بر اساس نوع پرداخت",
        cash: "فروش نقدی",
        credit: "فروش نسیه",
        total: "فروش کل",
        loading: "در حال دریافت اطلاعات...",
        empty: "هنوز فروشی برای امروز ثبت نشده است.",
      },

      thirtyDaySalesChart: {
        title: "فروش ۳۰ روز اخیر",
        description: "روند روزانه فروش در ۳۰ روز گذشته",
        total: "مجموع فروش",
        saleDays: "روزهای فروش",
        series: "فروش روزانه",
        loading: "در حال دریافت اطلاعات فروش ۳۰ روز اخیر...",
        empty: "در ۳۰ روز اخیر هیچ فروشی ثبت نشده است.",
      },

      monthlySalesChart: {
        title: "فروش ماهانه",
        description: "روند فروش در ۱۲ ماه اخیر",
        total: "مجموع فروش",
        series: "فروش ماهانه",
        loading: "در حال دریافت اطلاعات فروش ماهانه...",
        empty: "در ۱۲ ماه اخیر هیچ فروشی ثبت نشده است.",
      },

      quickActions: {
        title: "دسترسی سریع",
        description: "عملیات پرکاربرد فروشگاه را سریع انجام دهید",

        newSale: {
          title: "ثبت فروش",
          description: "ثبت یک فروش جدید",
        },

        shoppingList: {
          title: "لیست خرید",
          description: "مدیریت خریدهای فروشگاه",
        },

        creditSale: {
          title: "ثبت نسیه",
          description: "مدیریت فروش‌های نسیه",
        },

        reports: {
          title: "گزارش‌ها",
          description: "مشاهده گزارش‌های مالی",
        },
      },

      recentTransactions: {
        title: "آخرین تراکنش‌ها",
        description: "آخرین فروش‌های ثبت‌شده در فروشگاه",
        viewAll: "مشاهده همه",

        loading: "در حال دریافت تراکنش‌ها...",
        empty: "هنوز هیچ فروشی ثبت نشده است.",

        sale: {
          title: "فروش",
          description: "فروش ثبت‌شده",
        },

        saleDescription: "فروش ثبت‌شده",
        customer: "مشتری",
        itemsCount: "{{count}} قلم کالا",

        paymentTypes: {
          cash: "نقدی",
          credit: "نسیه",
        },
      },
    },

    // =====================================================
    // Products
    // =====================================================

    products: {
      page: {
        title: "محصولات",
        description: "مدیریت محصولات و موجودی انبار",
        addProduct: "افزودن محصول",
      },

      statsSection: {
        title: "خلاصه محصولات",
        description: "وضعیت فعلی محصولات و موجودی انبار",
      },

      pageTitle: "محصولات",
      pageDescription: "مدیریت محصولات و موجودی انبار",
      addProduct: "افزودن محصول",

      error: {
        load: "دریافت محصولات انجام نشد.",
        update: "ویرایش محصول انجام نشد.",
        add: "افزودن محصول انجام نشد.",
        delete: "حذف محصول انجام نشد.",
      },

      deleteModal: {
        title: "حذف محصول",
        subtitle: "تأیید عملیات حذف",
        question: "آیا از حذف این محصول مطمئن هستید؟",
        messageBefore: "محصول",
        messageAfter: "به‌صورت دائمی از لیست محصولات حذف خواهد شد.",
        warning:
          "این عملیات قابل بازگشت نیست. قبل از حذف، مطمئن شوید که دیگر به این محصول نیاز ندارید.",
        cancel: "انصراف",
        delete: "حذف محصول",
        deleting: "در حال حذف...",
      },

      form: {
        addTitle: "افزودن محصول جدید",
        editTitle: "ویرایش محصول",

        addSubtitle: "اطلاعات محصول را وارد کنید",
        editSubtitle: "اطلاعات محصول را ویرایش کنید",

        errors: {
          loadCategories: "دریافت دسته‌بندی‌ها انجام نشد.",
          nameRequired: "نام محصول را وارد کنید.",
          categoryRequired: "دسته‌بندی محصول را انتخاب کنید.",
          buyPriceInvalid: "قیمت خرید معتبر نیست.",
          sellPriceInvalid: "قیمت فروش معتبر نیست.",
          sellPriceLowerThanBuy: "قیمت فروش نباید کمتر از قیمت خرید باشد.",
          stockInvalid: "موجودی اولیه معتبر نیست.",
          minStockInvalid: "حداقل موجودی معتبر نیست.",
          unitRequired: "واحد محصول را انتخاب کنید.",
          save: "ذخیره محصول انجام نشد. لطفاً دوباره تلاش کنید.",
        },

        sections: {
          basic: "اطلاعات پایه",
          prices: "قیمت‌ها",
          inventory: "موجودی انبار",
          description: "توضیحات",
        },

        fields: {
          name: "نام محصول",
          namePlaceholder: "مثلاً نوشابه کوکاکولا",

          category: "دسته‌بندی",
          categoryPlaceholder: "انتخاب دسته‌بندی",
          loadingCategories: "در حال دریافت...",

          unit: "واحد",

          buyPrice: "قیمت خرید",
          buyPricePlaceholder: "مثلاً 35",

          sellPrice: "قیمت فروش",
          sellPricePlaceholder: "مثلاً 50",

          stock: "موجودی اولیه",
          stockPlaceholder: "مثلاً 25",

          minStock: "حداقل موجودی",
          minStockPlaceholder: "مثلاً 5",

          descriptionPlaceholder: "توضیحات اختیاری درباره محصول...",
        },

        actions: {
          cancel: "انصراف",
          saving: "در حال ذخیره...",
          save: "ذخیره محصول",
          saveChanges: "ذخیره تغییرات",
        },
      },

      table: {
        title: "لیست محصولات",
        description: "مدیریت محصولات و موجودی انبار",
        productCount: "محصول",

        loading: "در حال دریافت محصولات...",

        empty: {
          title: "هنوز محصولی ثبت نشده است",
          description: "اولین محصول خود را اضافه کنید.",
        },

        columns: {
          product: "محصول",
          category: "دسته‌بندی",
          buyPrice: "قیمت خرید",
          sellPrice: "قیمت فروش",
          stock: "موجودی",
          status: "وضعیت",
          updated: "بروزرسانی",
          actions: "عملیات",
        },

        status: {
          outOfStock: "ناموجود",
          lowStock: "موجودی کم",
          available: "موجود",
        },

        actions: {
          viewDetails: "مشاهده جزئیات",
          details: "جزئیات",
          options: "گزینه‌ها",
          edit: "ویرایش محصول",
          delete: "حذف محصول",
        },
      },

      details: {
        title: "جزئیات محصول",
        subtitle: "مشاهده اطلاعات کامل محصول",

        lastUpdated: "آخرین بروزرسانی",

        defaults: {
          category: "بدون دسته‌بندی",
          unit: "عدد",
        },

        status: {
          outOfStock: "ناموجود",
          lowStock: "موجودی کم",
          available: "موجود",
        },

        sections: {
          pricing: "اطلاعات قیمت",
          inventory: "اطلاعات موجودی",
        },

        labels: {
          buyPrice: "قیمت خرید",
          sellPrice: "قیمت فروش",
          profitPerUnit: "سود هر واحد",
          profitMargin: "حاشیه سود",

          currentStock: "موجودی فعلی",
          minimumStock: "حداقل موجودی",
          inventoryPurchaseValue: "ارزش خرید موجودی",
          inventorySalesValue: "ارزش فروش موجودی",
        },

        stockWarning: {
          outOfStock: {
            title: "این محصول ناموجود است",
            description: "برای ادامه فروش، موجودی این محصول را تأمین کنید.",
          },

          lowStock: {
            title: "موجودی این محصول کم است",
            description:
              "موجودی فعلی کمتر یا مساوی حداقل موجودی ({{count}} {{unit}}) است.",
          },
        },

        summary: {
          potentialProfit: "سود بالقوه موجودی",
          productUnit: "واحد محصول",
          category: "دسته‌بندی",
        },

        description: {
          title: "توضیحات",
        },

        actions: {
          edit: "ویرایش",
          delete: "حذف",
          close: "بستن",
        },
      },
    },

    // =====================================================
    // Product Statistics
    // =====================================================

    productStats: {
      products: {
        title: "تعداد محصولات",
        description: "محصول ثبت شده",
      },

      categories: {
        title: "دسته‌بندی‌ها",
        description: "دسته‌بندی فعال",
      },

      lowStock: {
        title: "موجودی کم",
        checking: "در حال بررسی موجودی",
        outOfStock: "{{count}} محصول ناموجود",
        supply: "نیاز به تأمین",
      },

      inventoryValue: {
        title: "ارزش موجودی",
        description: "بر اساس قیمت خرید",
      },
    },

    // =====================================================
    // Product Filters
    // =====================================================

    productFilters: {
      title: "فیلتر محصولات",
      description: "جستجو و فیلتر محصولات",
      clear: "پاک کردن فیلترها",
      searchPlaceholder: "جستجوی محصول...",
      allCategories: "همه دسته‌ها",
      allProducts: "همه محصولات",
      available: "موجود",
      lowStock: "موجودی کم",
      outOfStock: "ناموجود",
      activeFilters: "فیلترهای فعال:",
      category: "دسته:",
      status: "وضعیت:",
    },

    // =====================================================
    // Sales
    // =====================================================

    sales: {
      pageTitle: "فروش نقدی",
      pageDescription: "مدیریت و ثبت فروش‌های نقدی فروشگاه",
      addSale: "ثبت فروش جدید",

      paymentTypes: {
        cash: "نقدی",
        credit: "نسیه",
      },

      stats: {
        todaySales: {
          title: "فروش امروز",
          description: "{{count}} فروش ثبت شده",
        },

        cashSales: {
          title: "فروش نقدی",
          description: "پرداخت نقدی",
        },

        creditSales: {
          title: "فروش نسیه",
          description: "بدهی مشتریان",
        },

        pendingCredit: {
          title: "بدهی معوق نسیه",
          description: "{{count}} مشتری بدهکار",
          cta: "مشاهده صفحه نسیه",
        },

        items: {
          title: "تعداد کالا",
          description: "واحد فروخته شده",
        },
      },

      filters: {
        title: "فیلتر فروش‌ها",
        description: "جستجو و فیلتر فروش‌ها",
        clear: "پاک کردن فیلترها",
        searchPlaceholder: "جستجوی فروش...",
        allPayments: "همه پرداخت‌ها",
        cash: "نقدی",
        credit: "نسیه",
        allCategories: "همه دسته‌ها",
        activeFilters: "فیلترهای فعال:",
        payment: "پرداخت:",
        category: "دسته:",
      },

      chart: {
        title: "روند فروش",
        description: "مقایسه فروش نقدی و نسیه در هفته جاری",
        thisWeek: "این هفته",
        cashSales: "فروش نقدی",
        creditSales: "فروش نسیه",
      },

      form: {
        title: "ثبت فروش جدید",
        subtitle: "اطلاعات فروش را وارد کنید",

        errors: {
          loadData: "دریافت اطلاعات با مشکل مواجه شد.",
          productRequired: "لطفاً محصول را انتخاب کنید.",
          categoryRequired: "لطفاً دسته‌بندی را انتخاب کنید.",
          quantityInvalid: "تعداد باید بیشتر از صفر باشد.",
          priceInvalid: "قیمت فروش معتبر نیست.",
          creditCustomerRequired: "برای فروش نسیه، نام مشتری را وارد کنید.",
          submit: "ثبت فروش با مشکل مواجه شد.",
        },

        productSection: {
          title: "اطلاعات محصول",
        },

        fields: {
          product: "محصول",
          productPlaceholder: "انتخاب محصول",
          category: "دسته‌بندی",
          categoryPlaceholder: "انتخاب دسته‌بندی",
          quantity: "تعداد",
          unitPrice: "قیمت واحد",
        },

        category: {
          new: "دسته جدید",
          placeholder: "نام دسته جدید",
          add: "افزودن",

          errors: {
            required: "نام دسته‌بندی را وارد کنید.",
            create: "ایجاد دسته‌بندی ناموفق بود.",
          },
        },

        total: {
          title: "مبلغ کل فروش",
          description: "تعداد × قیمت واحد",
        },

        payment: {
          title: "نوع پرداخت",
          cashDescription: "مبلغ دریافت شده",
          creditDescription: "ثبت بدهی مشتری",
        },

        customer: {
          title: "اطلاعات مشتری",
          name: "نام مشتری",
          nameRequired: "نام مشتری *",
          phone: "07XX XXX XXX",
        },

        note: {
          title: "توضیحات",
          placeholder: "توضیحات مربوط به این فروش...",
        },

        actions: {
          cancel: "انصراف",
          saving: "در حال ثبت...",
          submit: "ثبت فروش",
        },
      },

      table: {
        title: "لیست فروش‌ها",
        salesCount: "فروش",
        loading: "در حال دریافت فروش‌ها...",
        viewDetails: "مشاهده جزئیات",
        fallbackProduct: "محصول",

        empty: {
          title: "فروشی پیدا نشد",
          description: "هنوز فروشی با این مشخصات ثبت نشده است.",
        },

        columns: {
          product: "محصول",
          category: "دسته‌بندی",
          quantity: "تعداد",
          amount: "مبلغ",
          payment: "پرداخت",
          date: "تاریخ",
          actions: "عملیات",
        },
      },

      details: {
        title: "جزئیات فروش",
        subtitle: "اطلاعات کامل تراکنش",

        totalAmount: "مبلغ کل",
        units: "عدد",

        paymentStatus: {
          title: "وضعیت پرداخت",

          cashTitle: "پرداخت نقدی",
          creditTitle: "پرداخت نسیه",

          cashDescription: "مبلغ فروش به صورت کامل دریافت شده است",
          creditDescription: "این مبلغ در حساب مشتری ثبت شده است",

          settled: "تسویه شده",
          unpaid: "پرداخت نشده",
        },

        saleInformation: {
          title: "اطلاعات فروش",
          quantity: "تعداد",
          unitPrice: "قیمت واحد",
          date: "تاریخ",
          time: "ساعت",
        },

        customer: {
          title: "اطلاعات مشتری",
          name: "نام مشتری",
          phone: "شماره تماس",
        },

        note: {
          title: "توضیحات",
          empty: "بدون توضیحات",
        },

        footer: {
          recorded: "تراکنش ثبت شده",
          close: "بستن",
        },
      },
    },

    // =====================================================
    // Credit
    // =====================================================

    credit: {
      page: {
        title: "حساب‌های نسیه",
        badge: "نسیه",
        description: "مدیریت بدهی و حساب‌های نسیه مشتریان فروشگاه",
        newCustomer: "مشتری جدید",
        newCredit: "ثبت فروش نسیه",
        debtorCustomers: "بدهکاران",
        person: "نفر",
      },

      stats: {
        sectionTitle: "خلاصه حساب‌های نسیه",
        sectionDescription: "وضعیت فعلی بدهی مشتریان",

        totalDebt: {
          title: "کل بدهی",
          description: "مجموع مبلغ فروش‌های نسیه مشتریان",
        },

        remaining: {
          title: "بدهی باقی‌مانده",
          description: "مجموع بدهی پرداخت‌نشده مشتریان",
        },

        todayDebt: {
          title: "نسیه امروز",
          description: "مجموع فروش‌های نسیه ثبت‌شده امروز",
        },

        debtors: {
          title: "بدهکاران",
          description: "مشتریان دارای بدهی باقی‌مانده",
          unit: "نفر",
        },

        settled: {
          title: "حساب‌های تسویه‌شده",
          description: "مشتریانی که بدهی خود را کامل پرداخت کرده‌اند",
          unit: "نفر",
        },

        paid: {
          title: "مجموع پرداختی",
          description: "مجموع پرداخت‌های دریافت‌شده از مشتریان",
        },
      },

      filters: {
        title: "جستجو و فیلتر",
        description: "حساب نسیه مشتری موردنظر را پیدا و مرتب کنید",
        clear: "پاک کردن فیلترها",
        searchPlaceholder: "جستجوی نام یا شماره مشتری...",

        status: {
          all: "همه حساب‌ها",
          allShort: "همه",
          debt: "بدهکار",
          partial: "پرداخت جزئی",
          settled: "تسویه‌شده",
        },

        sort: {
          newest: "جدیدترین",
          oldest: "قدیمی‌ترین",
          highest: "بیشترین بدهی",
          lowest: "کمترین بدهی",
          name: "نام مشتری",
        },

        quickStatus: {
          title: "وضعیت:",
        },
      },

      table: {
        title: "حساب‌های مشتریان",
        description: "سوابق حساب‌های نسیه مشتریان",
        accountsCount: "حساب",
        loading: "در حال بارگذاری حساب‌ها...",

        columns: {
          customer: "مشتری",
          totalDebt: "کل بدهی",
          paid: "پرداخت‌شده",
          remaining: "باقی‌مانده",
          lastTransaction: "آخرین تراکنش",
          status: "وضعیت",
          actions: "عملیات",
        },

        status: {
          debt: "بدهکار",
          partial: "پرداخت جزئی",
          settled: "تسویه‌شده",
        },

        actions: {
          viewDetails: "مشاهده جزئیات",
          payment: "ثبت پرداخت",
          delete: "حذف حساب",
        },

        empty: {
          title: "حسابی پیدا نشد",
          description: "هیچ حساب مشتری با معیارهای انتخاب‌شده مطابقت ندارد.",
        },

        delete: {
          title: "حذف حساب مشتری",
          description:
            "این حساب به‌طور کامل تسویه شده است. آیا از حذف آن مطمئن هستید؟",
          cancel: "انصراف",
          confirm: "حذف حساب",
        },

        deleteConfirm: "آیا مطمئن هستید که حساب «{{customer}}» حذف شود؟",
      },

      details: {
        title: "جزئیات حساب",
        subtitle: "اطلاعات کامل حساب نسیه مشتری",
        remaining: "باقی‌مانده",

        defaults: {
          customer: "مشتری",
        },

        customer: {
          title: "اطلاعات مشتری",
          name: "نام مشتری",
          phone: "شماره تماس",
          lastTransaction: "آخرین تراکنش",
        },

        financialSummary: {
          title: "خلاصه حساب",
          totalDebt: "کل بدهی",
          paid: "پرداخت‌شده",
          remaining: "باقی‌مانده",
        },

        paymentProgress: "میزان تسویه",

        paymentAction: {
          title: "پرداخت بدهی",
          description: "پرداخت مشتری را برای کاهش بدهی باقی‌مانده ثبت کنید",
          button: "ثبت پرداخت",
        },

        settledDescription:
          "این حساب به‌طور کامل تسویه شده و در حال حاضر بدهی باقی‌مانده‌ای ندارد.",

        transactions: {
          title: "تاریخچه حساب",

          payment: "پرداخت بدهی",
          creditSale: "فروش نسیه",

          creditSalesTitle: "فروش‌های نسیه",
          creditSalesDescription: "سوابق فروش‌های نسیه این مشتری",

          paymentsTitle: "پرداخت‌های مشتری",
          paymentsDescription: "سوابق پرداخت‌های انجام‌شده توسط مشتری",

          noPayments: "هنوز هیچ پرداختی برای این حساب ثبت نشده است.",

          empty: {
            title: "هنوز تراکنشی ثبت نشده است",
            description:
              "تاریخچه فروش نسیه و پرداخت‌های مشتری اینجا نمایش داده می‌شود.",
          },

          noDate: "بدون تاریخ",
        },

        footer: {
          recorded: "اطلاعات حساب ثبت شده است",
          close: "بستن",
        },
      },

      paymentModal: {
        title: "ثبت پرداخت",
        subtitle: "ثبت پرداخت برای بدهی مشتری",
        optional: "(اختیاری)",

        defaults: {
          customer: "مشتری",
        },

        customer: {
          creditAccount: "حساب نسیه",
          currentDebt: "بدهی فعلی",
        },

        fields: {
          amount: "مبلغ پرداختی",
          amountPlaceholder: "مثلاً 1500",
          maximum: "حداکثر مبلغ قابل پرداخت:",
          paymentMethod: "روش پرداخت",
          date: "تاریخ پرداخت",
          description: "توضیحات",
          descriptionPlaceholder: "مثلاً پرداخت بخشی از بدهی...",
        },

        methods: {
          cash: "پرداخت نقدی",
          card: "کارت / انتقال بانکی",
        },

        errors: {
          amountRequired: "لطفاً مبلغ پرداختی را وارد کنید.",
          amountTooHigh:
            "مبلغ پرداختی نمی‌تواند بیشتر از بدهی باقی‌مانده باشد.",
        },

        actions: {
          cancel: "انصراف",
          submit: "ثبت پرداخت",
        },
      },

      saleForm: {
        title: "ثبت فروش نسیه",
        badge: "نسیه",
        subtitle: "ثبت فروش جدید به‌صورت نسیه برای مشتری",
        optional: "(اختیاری)",

        errors: {
          customerRequired: "لطفاً نام مشتری را وارد کنید.",
          productRequired: "لطفاً محصول را انتخاب کنید.",
          quantityRequired: "تعداد باید بیشتر از صفر باشد.",
          priceInvalid: "لطفاً قیمت واحد معتبر وارد کنید.",
        },

        customer: {
          title: "اطلاعات مشتری",
          name: "نام مشتری",
          namePlaceholder: "مثلاً احمد محمدی",
          phone: "شماره تماس",
          phonePlaceholder: "0700123456",
        },

        sale: {
          title: "اطلاعات فروش",
          product: "محصول",
          productPlaceholder: "مثلاً نوشابه",
          quantity: "تعداد",
          quantityPlaceholder: "مثلاً 2",
          unitPrice: "قیمت هر واحد",
          unitPricePlaceholder: "مثلاً 50",
          date: "تاریخ فروش",
        },

        total: {
          title: "مبلغ کل نسیه",
          description: "تعداد × قیمت هر واحد",
        },

        actions: {
          cancel: "انصراف",
          submit: "ثبت فروش نسیه",
        },
      },

      errors: {
        load: "بارگذاری حساب‌های نسیه با مشکل مواجه شد.",

        invalidCustomer: "مشتری انتخاب‌شده معتبر نیست.",

        invalidPayment: "لطفاً مبلغ پرداختی معتبر وارد کنید.",

        paymentExceedsRemaining:
          "مبلغ پرداختی نمی‌تواند بیشتر از بدهی باقی‌مانده باشد.",

        paymentSave: "ثبت پرداخت انجام نشد. لطفاً دوباره تلاش کنید.",

        productNotFound: "محصول انتخاب‌شده پیدا نشد.",

        insufficientStock: "موجودی محصول کافی نیست. موجودی فعلی:",

        saleSave: "ثبت فروش نسیه انجام نشد. لطفاً دوباره تلاش کنید.",

        cannotDeleteWithDebt: "این مشتری هنوز بدهی باقی‌مانده دارد.",

        cannotDeleteWithHistory:
          "این مشتری دارای سابقه مالی است و قابل حذف نیست.",

        deleteCustomer: "حذف حساب مشتری انجام نشد. لطفاً دوباره تلاش کنید.",
      },
    },

    // =====================================================
    // Reports
    // =====================================================

    reports: {
      page: {
        title: "گزارشات",
        description: "بررسی عملکرد فروش و وضعیت مالی فروشگاه",
      },

      actions: {
        export: "خروجی گزارش",
        exporting: "در حال آماده‌سازی...",
      },

      loading: "در حال دریافت گزارش...",

      errors: {
        load: "دریافت گزارش با مشکل مواجه شد.",
        export: "ایجاد فایل خروجی انجام نشد.",
      },

      empty: "اطلاعاتی برای نمایش وجود ندارد.",

      filters: {
        title: "فیلترهای گزارش",
        description: "جستجو و فیلتر اطلاعات گزارش",

        activeFilters: "فیلترهای فعال:",
        periodLabel: "بازه:",
        paymentLabel: "پرداخت:",
        categoryLabel: "دسته:",

        searchPlaceholder: "جستجو در گزارش...",

        period: {
          all: "تمام گزارش‌ها",
          today: "امروز",
          week: "این هفته",
          month: "این ماه",
        },

        payment: {
          all: "همه پرداخت‌ها",
          cash: "نقدی",
          credit: "نسیه",
        },

        category: {
          all: "همه دسته‌ها",
        },

        clear: "پاک کردن",
      },

      stats: {
        totalSales: "تعداد فروش",
        totalRevenue: "مجموع فروش",
        cashSales: "فروش نقدی",
        creditSales: "فروش نسیه",
      },

      summary: {
        title: "خلاصه گزارش",
        description: "نمای کلی عملکرد فروش",

        bestCategory: "پرفروش‌ترین دسته",
        averageSale: "میانگین هر فروش",
        totalItems: "تعداد کالاهای فروخته شده",
        itemUnit: "عدد",
        bestCategorySales: "فروش دسته برتر",
      },

      charts: {
        salesTrend: {
          title: "روند فروش",
          description: "میزان فروش در روزهای اخیر",
          series: "فروش",
        },

        categorySales: {
          title: "فروش بر اساس دسته‌بندی",
          description: "مقایسه میزان فروش دسته‌بندی‌های مختلف",
          series: "فروش",
          uncategorized: "بدون دسته‌بندی",
        },

        paymentDistribution: {
          title: "نوع پرداخت",
          description: "مقایسه فروش نقدی و نسیه",

          cash: "نقدی",
          credit: "نسیه",
          unknown: "نامشخص",

          total: "مجموع",
        },
      },
    },

    // =====================================================
    // Shopping List
    // =====================================================

    shoppingList: {
      page: {
        title: "لیست خرید",
        description: "مدیریت نیازهای مغازه برای خریدهای آینده",
      },

      actions: {
        add: "افزودن مورد خرید",
      },

      defaultUnit: "عدد",

      errors: {
        load: "دریافت لیست خرید انجام نشد.",
        save: "ذخیره مورد خرید انجام نشد.",
        delete: "حذف مورد خرید انجام نشد.",
        toggle: "تغییر وضعیت مورد خرید انجام نشد.",

        nameRequired: "نام مورد خرید الزامی است.",
        quantityInvalid: "مقدار باید بیشتر از صفر باشد.",
        itemNotFound: "مورد خرید پیدا نشد.",
        itemNotFoundAfterEdit: "مورد خرید پس از ویرایش پیدا نشد.",
      },

      filters: {
        searchPlaceholder: "جستجوی مورد خرید...",

        status: {
          all: "همه",
          pending: "باقی‌مانده",
          completed: "انجام‌شده",
        },

        priority: {
          all: "همه اولویت‌ها",
          low: "کم",
          normal: "عادی",
          high: "مهم",
          urgent: "فوری",
        },

        clear: "پاک کردن فیلترها",
      },

      stats: {
        total: "کل موارد",
        pending: "باقی‌مانده",
        completed: "انجام‌شده",
      },

      form: {
        addTitle: "افزودن به لیست خرید",
        editTitle: "ویرایش مورد خرید",

        subtitle: "اطلاعات موردی که باید خریداری شود",

        fields: {
          name: "نام مورد خرید",
          namePlaceholder: "مثلاً نوشابه",

          quantity: "مقدار",
          unit: "واحد",

          category: "دسته‌بندی",
          categoryPlaceholder: "مثلاً کیک یا میوه",

          categoryHint:
            "دسته‌بندی‌های قبلی هنگام تایپ پیشنهاد می‌شوند. دسته‌بندی جدید نیز هنگام ذخیره به دسته‌بندی‌ها اضافه می‌شود.",

          priority: "اولویت خرید",

          note: "توضیحات",
          notePlaceholder: "توضیحات اضافی...",
        },

        units: {
          piece: "عدد",
          pack: "بسته",
          carton: "کارتن",
          kilogram: "کیلو",
          gram: "گرم",
          liter: "لیتر",
          meter: "متر",
        },

        priority: {
          low: "کم",
          normal: "عادی",
          high: "مهم",
          urgent: "فوری",
        },

        errors: {
          nameRequired: "نام مورد خرید الزامی است.",
          quantityInvalid: "مقدار باید بیشتر از صفر باشد.",
          save: "ذخیره مورد خرید انجام نشد.",
        },

        actions: {
          saving: "در حال ذخیره...",
          saveChanges: "ذخیره تغییرات",
          add: "افزودن به لیست",
          cancel: "انصراف",
        },
      },

      deleteModal: {
        title: "حذف مورد خرید",

        messageBefore: "آیا مطمئن هستید که می‌خواهید",
        messageAfter: "را از لیست خرید حذف کنید؟",

        cancel: "انصراف",
        delete: "حذف کردن",
        deleting: "در حال حذف...",
      },

      details: {
        title: "جزئیات مورد خرید",
        subtitle: "اطلاعات کامل مورد انتخاب‌شده",

        itemLabel: "مورد خرید",

        statusLabel: "وضعیت",
        status: {
          completed: "خریداری شده",
          pending: "در انتظار خرید",
        },

        priorityLabel: "اولویت",
        priority: {
          low: "کم",
          normal: "عادی",
          high: "مهم",
          urgent: "فوری",
        },

        quantityLabel: "مقدار مورد نیاز",
        defaultUnit: "عدد",
        categoryLabel: "دسته‌بندی",
        noteLabel: "توضیحات",

        createdAt: "تاریخ ایجاد",
        updatedAt: "آخرین تغییر",

        notAvailable: "---",

        actions: {
          close: "بستن",
          complete: "انجام شد",
          edit: "ویرایش",
          delete: "حذف",
        },
      },

      table: {
        title: "موارد خرید",
        itemCount: "مورد",

        columns: {
          item: "مورد خرید",
          quantity: "تعداد",
          priority: "اولویت",
          actions: "عملیات",
        },

        labels: {
          quantity: "تعداد:",
          priority: "اولویت:",
        },

        categoryPrefix: "دسته‌بندی:",
        noName: "بدون نام",

        priority: {
          low: "کم",
          normal: "عادی",
          high: "مهم",
          urgent: "فوری",
        },

        empty: {
          title: "لیست خرید خالی است",
          description: "هنوز موردی برای خرید اضافه نشده است.",
        },

        actions: {
          details: "جزئیات",
          complete: "انجام شد",
          restore: "بازگرداندن به لیست",
          markComplete: "علامت‌گذاری به عنوان انجام‌شده",
          edit: "ویرایش",
          delete: "حذف",
        },
      },
    },

    // =====================================================
    // Settings
    // =====================================================

    settings: {
      page: {
        title: "تنظیمات",
        description: "تنظیمات فروشگاه، ظاهر برنامه و اطلاعات سیستم",
      },

      store: {
        title: "اطلاعات فروشگاه",
        description: "اطلاعات اصلی فروشگاه را مدیریت کنید",

        fields: {
          name: {
            label: "نام فروشگاه",
            placeholder: "نام فروشگاه",
          },

          owner: {
            label: "نام مدیر",
            placeholder: "نام مدیر فروشگاه",
          },

          phone: {
            label: "شماره تماس",
            placeholder: "07XX XXX XXX",
          },

          address: {
            label: "آدرس",
            placeholder: "آدرس فروشگاه",
          },

          description: {
            label: "توضیحات فروشگاه",
            placeholder: "توضیحات کوتاه درباره فروشگاه...",
          },
        },

        messages: {
          saved: "اطلاعات فروشگاه ذخیره شد.",
        },

        actions: {
          save: "ذخیره اطلاعات",
        },
      },

      account: {
        title: "حساب کاربری",
        description: "مدیریت اطلاعات ورود مدیر",

        loading: "در حال دریافت اطلاعات حساب...",

        fields: {
          name: {
            label: "نام مدیر",
            placeholder: "نام مدیر",
          },

          email: {
            label: "ایمیل ورود",
            placeholder: "example@gmail.com",
            hint: "این ایمیل برای ورود به حساب استفاده می‌شود.",
          },

          password: {
            label: "رمز عبور",
            placeholder: "رمز عبور جدید",
            hint: "برای تغییر رمز، رمز جدید را وارد کنید.",
          },
        },

        activeAccount: "حساب فعال",

        messages: {
          success: "اطلاعات حساب با موفقیت ذخیره شد.",
        },

        errors: {
          load: "دریافت اطلاعات حساب با مشکل مواجه شد.",
          nameRequired: "نام مدیر را وارد کنید.",
          emailRequired: "ایمیل را وارد کنید.",
          passwordRequired: "رمز عبور را وارد کنید.",
          save: "ذخیره اطلاعات حساب با مشکل مواجه شد.",
        },

        actions: {
          save: "ذخیره تغییرات",
          saving: "در حال ذخیره...",
        },
      },

      appearance: {
        title: "ظاهر برنامه",
        description: "تنظیم حالت نمایش و رنگ‌بندی برنامه",

        theme: {
          title: "حالت نمایش",
          description: "حالت مورد علاقه خود را انتخاب کنید.",

          dark: "تاریک",
          darkMode: "حالت تاریک",

          light: "روشن",
          lightMode: "حالت روشن",
        },

        jalaliMonths: {
          title: "نام ماه‌های جلالی",
          description:
            "نحوه نمایش نام ماه‌های جلالی در سراسر برنامه را انتخاب کنید.",

          afghanistan: "افغانستان",
          afghanistanMonths:
            "حمل، ثور، جوزا، سرطان، اسد، سنبله، میزان، عقرب، قوس، جدی، دلو، حوت",

          iran: "ایران",
          iranMonths:
            "فروردین، اردیبهشت، خرداد، تیر، مرداد، شهریور، مهر، آبان، آذر، دی، بهمن، اسفند",
        },

        accent: {
          title: "رنگ اصلی",
          description: "رنگ اصلی مورد استفاده در برنامه.",
        },

        colors: {
          emerald: {
            name: "سبز زمردی",
            description: "پیشنهاد اصلی",
          },

          blue: {
            name: "آبی",
            description: "آرام و حرفه‌ای",
          },

          indigo: {
            name: "نیلی",
            description: "عمیق و متمرکز",
          },

          violet: {
            name: "بنفش",
            description: "مدرن و لوکس",
          },

          rose: {
            name: "رز",
            description: "ظریف و متفاوت",
          },

          red: {
            name: "قرمز",
            description: "پرشور و پرانرژی",
          },

          amber: {
            name: "کهربایی",
            description: "گرم و درخشان",
          },

          cyan: {
            name: "فیروزه‌ای",
            description: "تکنولوژیک و تازه",
          },

          teal: {
            name: "سبزآبی",
            description: "متین و متعادل",
          },
        },
      },

      backup: {
        title: "پشتیبان‌گیری و بازیابی",
        description: "محافظت از اطلاعات فروشگاه",

        security: {
          title: "اطلاعات شما مهم است",
          description:
            "پیشنهاد می‌شود به صورت منظم از اطلاعات فروشگاه نسخه پشتیبان تهیه کنید.",
        },

        export: {
          title: "ایجاد نسخه پشتیبان",
          description: "اطلاعات فعلی برنامه را در یک فایل JSON ذخیره کنید.",

          preparing: "در حال آماده‌سازی...",
          button: "دریافت Backup",
        },

        import: {
          title: "بازیابی اطلاعات",
          description:
            "اطلاعات ذخیره‌شده در یک فایل Backup را دوباره وارد کنید.",

          restoring: "در حال بازیابی...",
          button: "انتخاب فایل Backup",
        },

        fileFormat: {
          label: "فرمت پشتیبان",
        },

        messages: {
          exportSuccess: "نسخه پشتیبان با موفقیت ایجاد و دانلود شد.",

          importSuccess:
            "اطلاعات با موفقیت بازیابی شد. صفحه برای اعمال تغییرات دوباره بارگذاری می‌شود.",
        },

        errors: {
          export: "ایجاد نسخه پشتیبان با مشکل مواجه شد.",
          import: "فایل Backup معتبر نیست یا امکان بازیابی آن وجود ندارد.",
        },
      },

      categories: {
        title: "دسته‌بندی‌ها",
        description: "مدیریت دسته‌بندی‌های محصولات",

        form: {
          placeholder: "نام دسته‌بندی جدید",
          add: "افزودن",
        },

        list: {
          title: "دسته‌بندی‌های موجود",
          count: "دسته‌بندی",
          empty: "هنوز دسته‌بندی‌ای وجود ندارد.",
        },

        actions: {
          delete: "حذف دسته‌بندی",
        },

        deleteConfirm: "آیا از حذف دسته‌بندی «{{name}}» مطمئن هستید؟",

        messages: {
          added: "دسته‌بندی با موفقیت اضافه شد.",
          deleted: "دسته‌بندی با موفقیت حذف شد.",
        },

        errors: {
          load: "دریافت دسته‌بندی‌ها با مشکل مواجه شد.",
          add: "افزودن دسته‌بندی با مشکل مواجه شد.",
          delete: "حذف دسته‌بندی با مشکل مواجه شد.",
          nameRequired: "نام دسته‌بندی را وارد کنید.",
        },
      },

      notifications: {
        title: "اعلان‌ها",
        description: "مدیریت اعلان‌های سیستم",

        items: {
          lowStock: {
            title: "موجودی کم",
            description: "هنگام کم شدن موجودی محصول اطلاع بده",
          },

          newSale: {
            title: "ثبت فروش",
            description: "نمایش اعلان هنگام ثبت فروش جدید",
          },

          credit: {
            title: "بدهی مشتری",
            description: "یادآوری فروش‌های نسیه",
          },

          successfulActions: {
            title: "عملیات موفق",
            description: "نمایش پیام موفقیت عملیات‌ها",
          },
        },
      },
    },

    // =====================================================
    // Login
    // =====================================================

    login: {
      brand: {
        title: "مدیریت فروشگاه",
        description: "برای ادامه وارد حساب مدیر شوید",
      },

      form: {
        title: "ورود به حساب",
        description: "اطلاعات حساب مدیر را وارد کنید",
      },

      fields: {
        email: {
          label: "ایمیل",
          placeholder: "example@email.com",
        },

        password: {
          label: "رمز عبور",
          placeholder: "رمز عبور خود را وارد کنید",
        },

        rememberMe: "مرا به خاطر بسپار",
      },

      actions: {
        forgotPassword: "فراموشی رمز؟",
        showPassword: "نمایش رمز عبور",
        hidePassword: "مخفی کردن رمز عبور",
        loggingIn: "در حال ورود...",
        login: "ورود به سیستم",
      },

      errors: {
        emailRequired: "لطفاً ایمیل خود را وارد کنید.",
        passwordRequired: "لطفاً رمز عبور خود را وارد کنید.",
        invalidCredentials: "ایمیل یا رمز عبور صحیح نیست.",
        failed: "ورود به سیستم انجام نشد.",
      },

      security: "این بخش فقط برای مدیر فروشگاه است",

      footer: "Shop Manager • سیستم مدیریت فروشگاه",
    },
  },
};

export default faTranslate;