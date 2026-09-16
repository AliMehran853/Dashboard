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

      expandSidebar: "باز کردن نوار کناری",
      collapseSidebar: "کوچک کردن نوار کناری",

      language: "زبان",
      persian: "فارسی",
      english: "English",

      today: "امروز",
      yesterday: "دیروز",

      incoming: "ورودی",
      outgoing: "خروج",

      currency: "AF",

      refresh: "تازه‌سازی",

      copy: "کپی",
      copied: "کپی شد",
      cancel: "انصراف",
      confirm: "تأیید",
      back: "بازگشت",
      next: "بعدی",
      close: "بستن",
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
      errors: {
        load: "دریافت اطلاعات داشبورد انجام نشد.",
      },

      stats: {
        sectionTitle: "خلاصه وضعیت داشبورد",
        sectionDescription: "فعالیت امروز و نمای کلی فروشگاه",

        todaySales: {
          title: "فروش امروز",
          transactionCount: "{{count}} معامله امروز",
          active: "فعال",
          noSales: "بدون فروش",
          unit: "AF",
        },

        cashSales: {
          title: "فروش نقدی",
          description: "مجموع فروش نقدی امروز",
          recorded: "ثبت شده",
          none: "بدون فروش نقدی",
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

      errors: {
        load: "دریافت محصولات انجام نشد.",
        update: "ویرایش محصول انجام نشد.",
        add: "افزودن محصول انجام نشد.",
        delete: "حذف محصول انجام نشد.",
      },

      stats: {
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

      filters: {
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

      delete: {
        title: "حذف محصول",
        message:
          "آیا از حذف «{{name}}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.",
        cancel: "انصراف",
        confirm: "حذف",
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

          noSaleOption: "حداقل یک روش فروش اضافه کنید.",
          saleUnitRequired: "واحد الزامی است.",
          saleFactorInvalid: "ضریب باید بزرگتر از صفر باشد.",
          invalidQuantity: "تعداد معتبر نیست.",
          invalidFactor: "ضریب معتبر نیست.",
          invalidPrice: "قیمت معتبر نیست.",
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

        basicUnit: {
          label: "واحد پایه",
          hint: "(کوچکترین واحد فروش)",
          selectPlaceholder: "انتخاب واحد",
          locked: "پس از ایجاد قابل تغییر نیست.",
          autoManaged: "خودکار از زیرواحد خرید",
        },

        purchase: {
          title: "خرید اولیه",
          quantity: "تعداد",
          unit: "واحد خرید",
          eachEquals: "هر یک =",
          pricePerUnit: "قیمت هر {{unit}} (AF)",
          totalPrice: "قیمت کل خرید (AF)",
          total: "جمع کل:",
          perUnit: "هر {{unit}}:",
          note: "یادداشت (اختیاری)",
          notePlaceholder: "مثلاً کرایه موتر شامل است",
          switchTooltip: "تغییر واحد / کل",
          switchToTotal: "کل",
          switchToUnit: "واحد",
        },

        subUnit: {
          question: "آیا داخل هر {{unit}}، واحد کوچک‌تری هست؟",
          example:
            "مثلاً ۲۰ دانه داخل هر کارتن. اینطوری می‌تونی دانه‌ای بفروشی بدون ضرر.",
          enable: "بله، فعال کن",
          each: "هر",
          selectUnit: "انتخاب واحد",
          baseUnit: "واحد پایه",
          totalStock: "موجودی کل",
          costPerUnit: "قیمت هر واحد",
        },

        purchaseSummary: {
          costPer: "قیمت هر",
          stockInBase: "موجودی پایه",
          investment: "سرمایه‌گذاری",
        },

        suggestedOption: {
          title: "افزودن روش فروش پیشنهادی",
          description: "فروش ۱ {{unit}} به {{price}} افغانی ({{margin}}٪ سود)",
        },

        saleOptions: {
          title: "روش‌های فروش",
          add: "افزودن",
          empty: "حداقل یک روش فروش اضافه کنید (دانه، کارتن، کیلو...).",
        },

        inventoryCurrent: {
          currentStock: "موجودی فعلی",
          hint:
            "برای افزودن موجودی از دکمه «خرید جدید» در جزئیات محصول استفاده کنید.",
        },

        footer: {
          tip: "نکته: Ctrl + Enter برای ذخیره",
        },

        inlineAdd: {
          nameRequired: "نام الزامی است.",
          failed: "افزودن انجام نشد.",
          newCategoryName: "نام دسته‌بندی جدید",
          newUnitName: "نام واحد جدید",
        },

        saleRow: {
          saleUnit: "واحد فروش",
          ratioMultiply: "۱ {{unit}} = چند {{base}}",
          ratioDivide: "۱ {{base}} = چند {{unit}}",
          switchDirection: "تغییر جهت نسبت",
          price: "قیمت / {{unit}} (AF)",
          margin: "درصد سود",
          auto: "(خودکار)",
          cost: "تمام‌شده:",
          profit: "سود:",
          loss: "ضرر:",
          ratio: "نسبت:",
          suggested: "پیشنهاد:",
          belowCost: "زیر قیمت خرید — ضرر می‌کنید.",
          default: "پیش‌فرض",
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

        costStock: {
          title: "قیمت تمام‌شده و موجودی",
          avgCostPerUnit: "میانگین قیمت هر واحد",
          stockValue: "ارزش موجودی",
          addStock: "افزودن موجودی",
        },

        defaultSale: {
          title: "روش فروش پیش‌فرض",
          unit: "واحد",
          eachEquals: "هر یک = ",
          price: "قیمت فروش",
          profitPerUnit: "سود هر واحد",
          margin: "درصد سود",
          empty: "هیچ روش فروشی تعریف نشده.",
        },

        allSaleOptions: {
          title: "همه روش‌های فروش",
          default: "پیش‌فرض",
        },

        purchaseTemplates: {
          title: "الگوهای خرید",
        },

        unitConversions: {
          title: "تبدیل واحدها",
        },

        potentialProfit: "سود بالقوه",

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

        addStock: {
          title: "افزودن موجودی",
          currentStock: "موجودی فعلی",
          avgCost: "میانگین قیمت",
          quantity: "تعداد",
          unit: "واحد خرید",
          eachContains: "هر یک شامل",
          pricePerUnit: "قیمت هر {{unit}} ({{currency}})",
          note: "یادداشت (اختیاری)",
          notePlaceholder: "مثلاً کرایه موتر شامل است",
          preview: "پیش‌نمایش",
          newStock: "موجودی جدید",
          newAvgCost: "میانگین جدید",
          totalPaid: "سرمایه‌گذاری",
          costPer: "قیمت هر {{unit}}:",
          cancel: "انصراف",
          adding: "در حال افزودن...",
          submit: "افزودن موجودی",

          errors: {
            quantity: "تعداد باید بیشتر از صفر باشد.",
            factor: "ضریب تبدیل معتبر نیست.",
            price: "قیمت معتبر نیست.",
            unit: "واحد خرید الزامی است.",
            submit: "افزودن موجودی انجام نشد.",
          },
        },
      },
    },

    // =====================================================
    // Product Statistics & Filters (aliases)
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
        sectionTitle: "خلاصه فروش نقدی امروز",
        sectionDescription: "نمای کلی فروش نقدی امروز",

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
        loading: "در حال دریافت نمودار فروش...",
        empty: "هنوز فروشی برای نمایش وجود ندارد.",
      },

      form: {
        title: "ثبت فروش جدید",
        subtitle: "اطلاعات فروش را وارد کنید",
        badge: "نقدی",

        errors: {
          loadData: "دریافت اطلاعات با مشکل مواجه شد.",
          productRequired: "لطفاً محصول را انتخاب کنید.",
          categoryRequired: "لطفاً دسته‌بندی را انتخاب کنید.",
          quantityInvalid: "تعداد باید بیشتر از صفر باشد.",
          priceInvalid: "قیمت فروش معتبر نیست.",
          creditCustomerRequired: "برای فروش نسیه، نام مشتری را وارد کنید.",
          submit: "ثبت فروش با مشکل مواجه شد.",
          noSaleOptions: "برای این محصول هیچ روش فروشی تعریف نشده است.",
          insufficientStockAvailable:
            "موجودی کافی نیست. موجودی فعلی: {{count}} {{unit}}",
        },

        productSection: {
          title: "اطلاعات محصول",
        },

        stock: {
          available: "موجودی قابل فروش",
          availableShort: "موجودی:",
          avgCostPerUnit: "میانگین هزینه هر واحد",
          costPerSaleUnit: "هزینه هر واحد فروش",
          minStock: "حداقل موجودی",
        },

        saleUnit: {
          label: "واحد فروش",
          hint: "بر چه اساسی این فروش",
        },

        warnings: {
          noSaleOptions:
            "این محصول هیچ روش فروشی ندارد. از بخش محصولات حداقل یکی اضافه کنید.",
          insufficientStock:
            "موجودی کافی نیست. شما {{available}} {{unit}} دارید ولی می‌خواهید {{requested}} {{unit}} بفروشید.",
          belowCost: "قیمت فروش زیر قیمت خرید است — در این فروش ضرر می‌کنید.",
        },

        price: {
          belowCost: "زیر قیمت خرید ({{cost}} {{currency}})",
          profit: "سود: {{profit}} {{currency}} ({{margin}}٪)",
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
          expectedProfit: "سود تخمینی:",
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
          namePlaceholder: "نام مشتری (اختیاری)",
          phone: "07XX XXX XXX",
          phonePlaceholder: "شماره تماس (اختیاری)",
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

      errors: {
        noSaleData: "اطلاعات فروش ارسال نشده است.",
        productNotFound: "محصول پیدا نشد.",
        customerNotFound: "مشتری پیدا نشد.",
        invalidId: "شناسه فروش معتبر نیست.",
        notFound: "فروش پیدا نشد.",
        insufficientStock:
          "موجودی کافی نیست. موجودی فعلی: {{current}} {{unit}}",
        insufficientStockWithFactor:
          "موجودی کافی نیست. موجودی فعلی: {{current}} {{unit}} (این فروش معادل {{requested}} {{unit}} است)",
      },

      table: {
        title: "لیست فروش‌ها",
        cashTitle: "فروش‌های نقدی",
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

        unitBreakdown: "تفکیک واحد",
        conversionFactor: "ضریب تبدیل",
        deductedFromStock: "کسر شده از موجودی",

        profitTitle: "سود و زیان",
        profitableSale: "فروش سودآور",
        lossMakingSale: "فروش با ضرر",
        costPerUnit: "هزینه هر واحد: {{cost}} {{currency}} • حاشیه: {{margin}}",
        totalProfit: "سود کل",

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
        badge: "کل دوره",

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
        paymentsCount: "پرداخت",

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
          warning:
            "حساب نسیه و سوابق پرداخت حذف می‌شود، اما سابقه فروش حفظ خواهد شد.",
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
          noCreditSales: "هنوز فروش نسیه‌ای برای این مشتری ثبت نشده است.",

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

        quickFill: {
          fullAmount: "کل بدهی",
          half: "نصف",
        },

        remaining: {
          willSettle: "بدهی به‌طور کامل تسویه می‌شود",
          afterPayment: "باقی‌مانده پس از پرداخت",
        },

        errors: {
          customerRequired: "اطلاعات مشتری موجود نیست.",
          amountRequired: "لطفاً مبلغ پرداختی را وارد کنید.",
          amountTooHigh:
            "مبلغ پرداختی نمی‌تواند بیشتر از بدهی باقی‌مانده باشد.",
          dateRequired: "لطفاً تاریخ پرداخت را انتخاب کنید.",
          submit: "ثبت پرداخت انجام نشد. لطفاً دوباره تلاش کنید.",
        },

        actions: {
          cancel: "انصراف",
          saving: "در حال ذخیره...",
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
          noSaleOptions: "برای این محصول هیچ روش فروشی تعریف نشده است.",
          insufficientStock:
            "موجودی کافی نیست. موجودی فعلی: {{count}} {{unit}}",
          dateRequired: "تاریخ فروش الزامی است.",
          submit: "ثبت فروش نسیه انجام نشد. لطفاً دوباره تلاش کنید.",
        },

        customer: {
          title: "اطلاعات مشتری",
          name: "نام مشتری",
          namePlaceholder: "مثلاً احمد محمدی",
          phone: "شماره تماس",
          phonePlaceholder: "0700123456",
        },

        stock: {
          available: "موجودی قابل فروش",
          avgCostPerUnit: "میانگین هزینه هر واحد",
          costPerSaleUnit: "هزینه هر واحد فروش",
          minStock: "حداقل موجودی",
        },

        saleUnit: {
          label: "واحد فروش",
          hint: "بر چه اساسی این فروش",
        },

        warnings: {
          noSaleOptions:
            "این محصول هیچ روش فروشی ندارد. از بخش محصولات حداقل یکی اضافه کنید.",
          insufficientStock:
            "موجودی کافی نیست. شما {{available}} {{unit}} دارید ولی می‌خواهید {{requested}} {{unit}} بفروشید.",
          belowCost: "قیمت فروش زیر قیمت خرید است — در این فروش ضرر می‌کنید.",
        },

        price: {
          belowCost: "زیر قیمت خرید ({{cost}} {{currency}})",
          profit: "سود: {{profit}} {{currency}} ({{margin}}٪)",
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
          expectedProfit: "سود تخمینی:",
        },

        dates: {
          title: "تاریخ‌ها",
          saleDate: "تاریخ فروش",
          saleDateRequired: "(الزامی)",
          saleDateHint: "کِی این فروش ثبت شده",
          dueDate: "تاریخ سررسید",
          dueDateOptional: "(اختیاری)",
          dueDateHint: "کِی مشتری باید بدهی را بدهد",
          pastDue: "سررسید گذشته!",
          set: "تعیین‌شده",
          clear: "پاک کردن",
          clearAria: "پاک کردن سررسید",
          quickPicks: {
            week: "۱ هفته",
            twoWeeks: "۲ هفته",
            month: "۱ ماه",
          },
        },

        note: {
          title: "یادداشت",
          placeholder: "یادداشت اختیاری درباره این فروش نسیه...",
        },

        tip: "نکته: Ctrl + Enter برای ذخیره",

        actions: {
          cancel: "انصراف",
          saving: "در حال ذخیره...",
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

      loading: "در حال دریافت گزارش...",

      empty: "اطلاعاتی برای نمایش وجود ندارد.",

      errors: {
        load: "دریافت گزارش با مشکل مواجه شد.",
        export: "ایجاد فایل خروجی انجام نشد.",
      },

      actions: {
        export: "خروجی گزارش",
        exporting: "در حال آماده‌سازی...",

        exportMenuHint: "فرمت مناسب برای گزارش فعلی را انتخاب کنید.",

        exportExcel: "اکسل",
        exportExcelDesc: "فایل قابل ویرایش با جزئیات کامل فروش",

        exportPdfColor: "PDF رنگی",
        exportPdfColorDesc: "گزارش حرفه‌ای با نمودار و طراحی رنگی",

        exportPdfMono: "PDF سیاه و سفید",
        exportPdfMonoDesc: "مناسب چاپ لیزری و پرینترهای اقتصادی",
      },

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
        sectionTitle: "خلاصه گزارش",
        sectionDescription: "اعداد کلیدی گزارش انتخاب‌شده",

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

      table: {
        title: "همه تراکنش‌ها",
        count: "تراکنش",
        searchPlaceholder: "جستجوی تراکنش‌ها...",
        empty: "هیچ تراکنشی یافت نشد.",
        viewDetails: "مشاهده جزئیات",

        filters: {
          all: "همه",
          cash: "نقدی",
          credit: "نسیه",
        },

        columns: {
          product: "محصول",
          category: "دسته‌بندی",
          quantity: "تعداد",
          amount: "مبلغ",
          payment: "پرداخت",
          customer: "مشتری",
          date: "تاریخ",
          actions: "عملیات",
        },
      },

      export: {
        title: "گزارش فروش",
        salesTitle: "جزئیات فروش",
        page: "صفحه {{current}} از {{total}}",
        generatedBy: "تهیه‌شده توسط سیستم مدیریت فروشگاه",
        printedAt: "چاپ: {{date}}",

        labels: {
          manager: "مدیر",
          period: "بازه",
          payment: "پرداخت",
          category: "دسته‌بندی",
          search: "جستجو",
          totalSales: "مبلغ کل فروش",
          transactions: "تعداد تراکنش",
          items: "کالاهای فروخته‌شده",
          average: "میانگین فروش",
          cash: "فروش نقدی",
          credit: "فروش نسیه",
          bestCategory: "بهترین دسته",
          date: "تاریخ",
          time: "ساعت",
          product: "محصول",
          quantity: "تعداد",
          amount: "مبلغ",
          paymentType: "پرداخت",
          customer: "مشتری",
          noData: "فروشی ثبت نشده است",
        },

        charts: {
          paymentOverview: "خلاصه پرداخت",
          topCategories: "دسته‌های پرفروش",
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
        title: "فیلترهای لیست خرید",
        description: "اقلام را بر اساس وضعیت و اولویت فیلتر کنید.",
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
        sectionTitle: "خلاصه لیست خرید",
        sectionDescription: "وضعیت فعلی اقلام لیست خرید",
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
          note: "یادداشت",
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

        defaults: {
          storeName: "فروشگاه من",
          ownerName: "مدیر فروشگاه",
        },

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
            hint: "برای تغییر رمز، رمز جدید را وارد کنید. حداقل ۶ کاراکتر.",
          },
        },

        activeAccount: "حساب فعال",

        securitySection: {
          title: "سؤالات امنیتی",
          description:
            "این سؤالات برای بازیابی اطلاعات ورود در صورت فراموشی استفاده می‌شوند.",
          hint: "برای تغییر، ۳ سؤال جدید انتخاب کنید و به همه پاسخ دهید. در غیر این صورت، خالی بگذارید.",
          currentTitle: "سؤالات فعلی",
          changeTitle: "تغییر سؤالات",
          changeToggle: "می‌خواهم سؤالات را تغییر دهم",
          cancelChange: "انصراف از تغییر",
          leaveEmpty: "برای تغییر سؤالات، ۳ سؤال جدید انتخاب کنید",
        },

        credentialsNote:
          "این اطلاعات فقط روی همین دستگاه ذخیره می‌شود. اگر آن‌ها را فراموش کنید، فقط از طریق سؤالات امنیتی می‌توانید بازیابی کنید.",

        messages: {
          success: "اطلاعات حساب با موفقیت ذخیره شد.",
          successWithCredentials:
            "ذخیره شد. دفعه بعد با ایمیل و رمز عبور جدید وارد شوید.",
          successWithSecurity: "اطلاعات و سؤالات امنیتی با موفقیت ذخیره شد.",
        },

        errors: {
          load: "دریافت اطلاعات حساب با مشکل مواجه شد.",
          nameRequired: "نام مدیر را وارد کنید.",
          emailRequired: "ایمیل را وارد کنید.",
          emailInvalid: "فرمت ایمیل صحیح نیست.",
          emailTypo:
            "ایمیل احتمالاً اشتباه است. منظورتان «{{suggestion}}» بود؟",
          emailTypoSuggest: "آیا منظورتان «{{suggestion}}» بود؟",
          passwordRequired: "رمز عبور را وارد کنید.",
          passwordMin: "رمز عبور باید حداقل {{count}} کاراکتر باشد.",
          save: "ذخیره اطلاعات حساب با مشکل مواجه شد.",
          securityRequired: "لطفاً به همه سؤالات امنیتی پاسخ دهید.",
          securityDuplicate: "سؤالات امنیتی نباید تکراری باشند.",
        },

        actions: {
          save: "ذخیره تغییرات",
          saving: "در حال ذخیره...",
          fixTypo: "استفاده از این ایمیل",
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

          confirm:
            "آیا مطمئن هستید؟ تمام اطلاعات فعلی با فایل Backup جایگزین می‌شود. این عملیات قابل بازگشت نیست.",

          restoring: "در حال بازیابی...",
          button: "انتخاب فایل Backup",
        },

        fileFormat: {
          label: "فرمت پشتیبان",
          value: "JSON — پشتیبان کامل",
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

        deleteModal: {
          title: "حذف دسته‌بندی",
          subtitle: "تأیید عملیات حذف",
          message: "آیا از حذف دسته‌بندی «{{name}}» مطمئن هستید؟",
          warning: "این عملیات قابل بازگشت نیست.",
          cancel: "انصراف",
          confirm: "حذف",
          deleting: "در حال حذف...",
        },

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

      units: {
        title: "واحدهای اندازه‌گیری",
        description:
          "مدیریت واحدهای مورد استفاده در محصولات (عدد، بسته، کارتن، کیلو، متر مربع و ...)",

        form: {
          placeholder: "نام واحد جدید",
          add: "افزودن",
        },

        list: {
          title: "واحدهای موجود",
          count: "واحد",
          empty: "هنوز واحدی وجود ندارد.",
        },

        actions: {
          delete: "حذف واحد",
        },

        deleteModal: {
          title: "حذف واحد",
          subtitle: "تأیید عملیات حذف",
          message: "آیا از حذف واحد «{{name}}» مطمئن هستید؟",
          warning: "این عملیات قابل بازگشت نیست.",
          cancel: "انصراف",
          confirm: "حذف",
          deleting: "در حال حذف...",
        },

        messages: {
          added: "واحد با موفقیت اضافه شد.",
          deleted: "واحد با موفقیت حذف شد.",
        },

        errors: {
          load: "دریافت واحدها انجام نشد.",
          add: "افزودن واحد انجام نشد.",
          delete: "حذف واحد انجام نشد.",
          nameRequired: "نام واحد الزامی است.",
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
    // Security Questions
    // =====================================================

    securityQuestions: {
      firstSchool: "نام اولین مدرسه من چه بود؟",
      firstPet: "نام اولین حیوان خانگی من چه بود؟",
      birthCity: "شهر تولد من کجاست؟",
      firstTeacher: "نام اولین معلم من چه بود؟",
      childhoodFriend: "نام بهترین دوست دوران کودکی من چه بود؟",
    },

    // =====================================================
    // Login
    // =====================================================

    login: {
      loading: "در حال آماده‌سازی...",

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

      setup: {
        badge: "راه‌اندازی",
        stepLabel: "مرحله {{current}} از {{total}}",

        brand: {
          title: "به فروشگاه خود خوش آمدید",
          description: "برای شروع، حساب مدیر فروشگاه خود را بسازید",
        },

        form: {
          title: "ایجاد حساب مدیر",
          description: "ایمیل، رمز عبور و سؤالات امنیتی را تعیین کنید",
        },

        sections: {
          credentials: "اطلاعات ورود",
          credentialsHint: "با این اطلاعات وارد سیستم می‌شوید",
          security: "سؤالات امنیتی",
          securityHint:
            "اگر رمز عبور را فراموش کنید، با پاسخ به این سؤالات بازیابی می‌شود. ۳ سؤال از ۵ سؤال انتخاب کنید.",
        },

        fields: {
          email: {
            label: "ایمیل",
            placeholder: "example@email.com",
          },
          password: {
            label: "رمز عبور",
            placeholder: "حداقل {{count}} کاراکتر",
          },
          confirmPassword: {
            label: "تکرار رمز عبور",
            placeholder: "رمز عبور را دوباره وارد کنید",
          },
          questionN: "سؤال {{n}}",
          questionPlaceholder: "یک سؤال انتخاب کنید",
          answer: "پاسخ",
          answerPlaceholder: "پاسخ خود را وارد کنید",
          emailSuggestion: "آیا منظورتان «{{suggestion}}» بود؟",
          useSuggestion: "استفاده از این ایمیل",
        },

        actions: {
          next: "بعدی",
          back: "بازگشت به مرحله قبل",
          create: "ساخت حساب و شروع",
          creating: "در حال ساخت...",
        },

        errors: {
          emailRequired: "لطفاً ایمیل خود را وارد کنید.",
          emailInvalid: "فرمت ایمیل صحیح نیست.",
          passwordRequired: "لطفاً رمز عبور را وارد کنید.",
          passwordMin: "رمز عبور باید حداقل {{count}} کاراکتر باشد.",
          passwordMismatch: "رمز عبور و تکرار آن یکسان نیستند.",
          saveFailed: "ذخیره اطلاعات حساب انجام نشد.",
          questionsRequired: "لطفاً به همه سؤالات امنیتی پاسخ دهید.",
          questionsDuplicate: "سؤالات امنیتی نباید تکراری باشند.",
          answerMin: "پاسخ هر سؤال باید حداقل {{count}} کاراکتر باشد.",
        },

        security:
          "این اطلاعات فقط روی همین دستگاه ذخیره می‌شود. آن را در جای امنی نگه دارید.",
      },

      forgotPassword: {
        title: "بازیابی اطلاعات ورود",
        subtitle: "پاسخ سؤالات امنیتی خود را وارد کنید",

        step: "مرحله {{current}} از {{total}}",

        stepEmail: {
          title: "ایمیل خود را وارد کنید",
          description: "ایمیلی که هنگام ثبت‌نام استفاده کردید را وارد کنید",
          emailLabel: "ایمیل",
          emailPlaceholder: "example@email.com",
          submit: "بررسی ایمیل",
          checking: "در حال بررسی...",
        },

        stepQuestions: {
          title: "به سؤالات امنیتی پاسخ دهید",
          description: "پاسخ‌ها به حروف بزرگ/کوچک و فاصله‌ها حساس نیستند",
          answerLabel: "پاسخ",
          answerPlaceholder: "پاسخ خود را وارد کنید",
          submit: "تأیید پاسخ‌ها",
          verifying: "در حال بررسی...",
          back: "بازگشت",
        },

        stepResult: {
          title: "اطلاعات حساب شما",
          description: "این اطلاعات را در جای امنی ذخیره کنید",

          emailLabel: "ایمیل",
          passwordLabel: "رمز عبور",
          copy: "کپی",
          copied: "کپی شد",
          warning:
            "پس از بستن این پنجره، دیگر نمی‌توانید این اطلاعات را ببینید.",
          close: "بستن",
        },

        fallback: {
          title: "پاسخ سؤالات را فراموش کرده‌اید؟",
          description:
            "اگر پاسخ سؤالات را هم فراموش کرده‌اید، باید حساب را بازنشانی کنید. تمام اطلاعات فروشگاه (محصولات، فروش‌ها) حفظ می‌شود ولی اطلاعات ورود پاک می‌شود.",
          button: "بازنشانی حساب",
          confirm:
            "آیا مطمئن هستید؟ حساب کاربری حذف می‌شود و باید دوباره ثبت‌نام کنید. اطلاعات فروشگاه حفظ می‌شود.",
          confirmButton: "بله، حساب را بازنشانی کن",
          cancel: "انصراف",
        },

        errors: {
          emailRequired: "ایمیل را وارد کنید.",
          emailNotFound: "ایمیلی با این مشخصات پیدا نشد.",
          noSecurityQuestions:
            "این حساب سؤال امنیتی ندارد. باید بازنشانی کنید.",
          answersRequired: "همه پاسخ‌ها الزامی است.",
          answersIncorrect: "پاسخ یک یا چند سؤال صحیح نیست.",
          resetFailed: "بازنشانی حساب انجام نشد.",
        },
      },

      security: "این بخش فقط برای مدیر فروشگاه است",

      footer: "Shop Manager • سیستم مدیریت فروشگاه",
    },

    // =====================================================
    // Profile
    // =====================================================

    profile: {
      title: "پروفایل من",
      subtitle: "اطلاعات حساب و عکس پروفایل",
      closeAria: "بستن",

      photo: {
        sectionTitle: "عکس مدیر فروشگاه",
        sectionDescription:
          "ابتدا عکس را انتخاب کنید و سپس چهره را داخل کادر تنظیم کنید. سیستم بعد از برش، گوشه‌ها را کمی نرم و تصویر را فشرده می‌کند.",
        changeTitle: "تغییر عکس",
        badge: "عکس پروفایل",
        maxSize: "حداکثر ۵ MB",
        selectPhoto: "انتخاب عکس",
        cancelNew: "لغو عکس جدید",
        removePhoto: "حذف عکس",
        processing: "در حال پردازش...",
        fileSizeLabel: "حجم نهایی:",
        dropzone: {
          title: "عکس را اینجا رها کنید",
          description: "یا برای انتخاب از کامپیوتر کلیک کنید",
        },
      },

      account: {
        title: "اطلاعات حساب",
        description: "اطلاعات واقعی حساب مدیر",
        nameLabel: "نام مدیر",
        emailLabel: "ایمیل",
      },

      footer: {
        hint: "عکس ابتدا برش داده می‌شود و سپس برای نگهداری بهینه فشرده خواهد شد.",
        cancel: "انصراف",
        save: "ذخیره تغییرات",
        saving: "در حال ذخیره...",
      },

      crop: {
        title: "تنظیم عکس پروفایل",
        subtitle: "چهره را داخل کادر قرار دهید",
        closeAria: "بستن برش",
        dragHint: "عکس را بکشید تا چهره در مرکز قرار بگیرد",
        zoomLabel: "بزرگنمایی",
        zoomAria: "بزرگنمایی تصویر",
        cancel: "لغو",
        confirm: "تأیید برش",
        processing: "در حال پردازش...",
        footerHint:
          "صورت را با حرکت انگشت یا موس تنظیم کنید و بعد برش را تأیید کنید.",
      },

      errors: {
        imageReadFailed: "خواندن تصویر امکان‌پذیر نیست.",
        fileReadFailed: "خواندن فایل تصویر انجام نشد.",
        preparationFailed:
          "آماده‌سازی تصویر انجام نشد. لطفاً دوباره تلاش کنید.",
        invalidCropArea:
          "ناحیه برش معتبر نیست. لطفاً دوباره تلاش کنید.",
        cropFailed:
          "برش و پردازش عکس انجام نشد. لطفاً دوباره تلاش کنید.",
        processFailed: "پردازش عکس انجام نشد.",
        removeFailed: "حذف عکس انجام نشد.",
        removeAvatarFailed: "حذف عکس پروفایل انجام نشد.",
        saveFailed: "ذخیره اطلاعات پروفایل انجام نشد.",
        saveFailedRetry:
          "ذخیره اطلاعات پروفایل انجام نشد. لطفاً دوباره تلاش کنید.",
      },

      messages: {
        cropSuccess:
          "برش عکس با موفقیت انجام شد. برای نهایی شدن، ذخیره تغییرات را بزنید.",
        removeSuccess: "عکس پروفایل با موفقیت حذف شد.",
        saveSuccess: "اطلاعات پروفایل با موفقیت ذخیره شد.",
      },
    },

    // =====================================================
    // Database Errors
    // =====================================================

    db: {
      units: {
        nameRequired: "نام واحد الزامی است.",
        invalidId: "شناسه واحد معتبر نیست.",
        notFound: "واحد پیدا نشد.",
        usedAsBase:
          "این واحد به‌عنوان واحد پایه در محصولات استفاده شده است.",
      },

      categories: {
        nameRequired: "نام دسته‌بندی الزامی است.",
        invalidId: "شناسه دسته‌بندی معتبر نیست.",
        notFound: "دسته‌بندی پیدا نشد.",
        usedByProducts: "این دسته‌بندی در محصولات استفاده شده است.",
      },

      products: {
        nameRequired: "نام محصول الزامی است.",
        baseUnitRequired: "واحد پایه الزامی است.",
        invalidId: "شناسه محصول معتبر نیست.",
        notFound: "محصول پیدا نشد.",
        hasSales: "این محصول دارای سابقه فروش است و قابل حذف نیست.",
      },

      purchases: {
        quantityInvalid: "تعداد خریداری معتبر نیست.",
        factorInvalid: "ضریب تبدیل معتبر نیست.",
        priceInvalid: "قیمت خرید معتبر نیست.",
      },

      customers: {
        nameRequired: "نام مشتری الزامی است.",
        invalidId: "شناسه مشتری معتبر نیست.",
        notFound: "مشتری پیدا نشد.",
        hasHistory: "این مشتری دارای سابقه مالی است و قابل حذف نیست.",
      },

      shoppingList: {
        nameRequired: "نام مورد خرید الزامی است.",
        invalidId: "شناسه مورد خرید معتبر نیست.",
        notFound: "مورد خرید پیدا نشد.",
      },

      expenses: {
        amountNegative: "مبلغ هزینه نمی‌تواند منفی باشد.",
        invalidId: "شناسه هزینه معتبر نیست.",
        notFound: "هزینه پیدا نشد.",
      },
    },
  },
};

export default faTranslate;