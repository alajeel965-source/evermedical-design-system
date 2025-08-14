export interface TranslationKey {
  common: {
    buttons: {
      submit: string;
      cancel: string;
      save: string;
      edit: string;
      delete: string;
      search: string;
      filter: string;
      clearFilters: string;
      viewAll: string;
      loadMore: string;
      register: string;
      connect: string;
      message: string;
      addToCart: string;
      submitQuote: string;
      openFilters: string;
    };
    labels: {
      language: string;
      settings: string;
      profile: string;
      logout: string;
      login: string;
      signup: string;
      dashboard: string;
      home: string;
      about: string;
      contact: string;
      help: string;
      privacy: string;
      terms: string;
      primaryNavigation: string;
      selectLanguage: string;
      languageOptions: string;
      userMenu: string;
      userMenuOptions: string;
      openMobileMenu: string;
      mobileNavigation: string;
    };
    navigation: {
      marketplace: string;
      events: string;
      networking: string;
      rfqs: string;
      pricing: string;
      dashboards: string;
      company: string;
      legal: string;
    };
    status: {
      active: string;
      inactive: string;
      pending: string;
      verified: string;
      inStock: string;
      outOfStock: string;
      urgent: string;
      normal: string;
      low: string;
    };
  };
  pages: {
    home: {
      title: string;
      subtitle: string;
      cta: string;
      features: {
        verifiedSuppliers: {
          title: string;
          description: string;
        };
        aiMatching: {
          title: string;
          description: string;
        };
        qrCme: {
          title: string;
          description: string;
        };
      };
      stats: {
        suppliers: string;
        categories: string;
        globalReach: string;
        monthlyRfqs: string;
      };
    };
    marketplace: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
    };
    events: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      filters: {
        specialty: string;
        subspecialty: string;
        date: string;
        format: string;
          cmeCredits: string;
        };
        specialties: {
          title: string;
          subtitle: string;
        };
      };
    networking: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      suggestedConnections: string;
    };
    rfqs: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
    };
    pricing: {
      title: string;
      subtitle: string;
      plans: {
        basic: string;
        professional: string;
        enterprise: string;
      };
    };
    dashboards: {
      title: string;
      subtitle: string;
    };
  };
}

export const translations: Record<"en" | "ar", TranslationKey> = {
  en: {
    common: {
      buttons: {
        submit: "Submit",
        cancel: "Cancel",
        save: "Save",
        edit: "Edit",
        delete: "Delete",
        search: "Search",
        filter: "Filter",
        clearFilters: "Clear Filters",
        viewAll: "View All",
        loadMore: "Load More",
        register: "Register",
        connect: "Connect",
        message: "Message",
        addToCart: "Add to Cart",
        submitQuote: "Submit Quote",
        openFilters: "Open filters",
      },
      labels: {
        language: "Language",
        settings: "Settings",
        profile: "Profile",
        logout: "Logout",
        login: "Login",
        signup: "Sign Up",
        dashboard: "Dashboard",
        home: "Home",
        about: "About",
        contact: "Contact",
        help: "Help",
        privacy: "Privacy",
        terms: "Terms",
        primaryNavigation: "Primary navigation",
        selectLanguage: "Select language",
        languageOptions: "Language options",
        userMenu: "User menu",
        userMenuOptions: "User menu options",
        openMobileMenu: "Open mobile menu",
        mobileNavigation: "Mobile navigation",
      },
      navigation: {
        marketplace: "Marketplace",
        events: "Events",
        networking: "Networking",
        rfqs: "RFQs",
        pricing: "Pricing",
        dashboards: "Dashboards",
        company: "Company",
        legal: "Legal",
      },
      status: {
        active: "Active",
        inactive: "Inactive",
        pending: "Pending",
        verified: "Verified",
        inStock: "In Stock",
        outOfStock: "Out of Stock",
        urgent: "Urgent",
        normal: "Normal",
        low: "Low",
      },
    },
    pages: {
      home: {
        title: "Medical Equipment Marketplace",
        subtitle: "Connect with verified suppliers worldwide",
        cta: "Get Started",
        features: {
          verifiedSuppliers: {
            title: "Verified Suppliers",
            description: "All suppliers are thoroughly vetted with ISO certifications, regulatory compliance, and quality assurance documentation.",
          },
          aiMatching: {
            title: "AI Matching",
            description: "Advanced AI algorithms instantly match your requirements with the most suitable suppliers based on location, price, and specifications.",
          },
          qrCme: {
            title: "QR-Verifiable CME",
            description: "Continuing Medical Education credits with blockchain-verified certificates and QR code authentication for professional development.",
          },
        },
        stats: {
          suppliers: "Active Suppliers",
          categories: "Equipment Categories",
          globalReach: "Global Reach",
          monthlyRfqs: "Monthly RFQs",
        },
      },
      marketplace: {
        title: "Medical Marketplace",
        subtitle: "Find the medical equipment you need",
        searchPlaceholder: "Search medical equipment...",
      },
      events: {
        title: "Medical Events",
        subtitle: "Discover medical conferences and training events",
        searchPlaceholder: "Search events...",
        filters: {
          specialty: "Specialty",
          subspecialty: "Subspecialty",
          date: "Date",
          format: "Format",
          cmeCredits: "CME Credits",
        },
        specialties: {
          title: "Medical Specialties",
          subtitle: "Find events by specialty",
        },
      },
      networking: {
        title: "Professional Networking",
        subtitle: "Connect with healthcare professionals worldwide",
        searchPlaceholder: "Search professionals...",
        suggestedConnections: "Suggested Connections",
      },
      rfqs: {
        title: "Requests for Quotation",
        subtitle: "Post and respond to medical equipment RFQs",
        searchPlaceholder: "Search RFQs...",
      },
      pricing: {
        title: "Pricing Plans",
        subtitle: "Choose the plan that fits your needs",
        plans: {
          basic: "Basic",
          professional: "Professional",
          enterprise: "Enterprise",
        },
      },
      dashboards: {
        title: "Analytics Dashboard",
        subtitle: "Track your medical equipment business metrics",
      },
    },
  },
  ar: {
    common: {
      buttons: {
        submit: "إرسال",
        cancel: "إلغاء",
        save: "حفظ",
        edit: "تعديل",
        delete: "حذف",
        search: "بحث",
        filter: "تصفية",
        clearFilters: "مسح المرشحات",
        viewAll: "عرض الكل",
        loadMore: "تحميل المزيد",
        register: "تسجيل",
        connect: "اتصال",
        message: "رسالة",
        addToCart: "إضافة للسلة",
        submitQuote: "إرسال عرض سعر",
        openFilters: "فتح المرشحات",
      },
      labels: {
        language: "اللغة",
        settings: "الإعدادات",
        profile: "الملف الشخصي",
        logout: "تسجيل الخروج",
        login: "تسجيل الدخول",
        signup: "إنشاء حساب",
        dashboard: "لوحة التحكم",
        home: "الرئيسية",
        about: "حول",
        contact: "اتصل بنا",
        help: "مساعدة",
        privacy: "الخصوصية",
        terms: "الشروط",
        primaryNavigation: "التنقل الأساسي",
        selectLanguage: "اختر اللغة",
        languageOptions: "خيارات اللغة",
        userMenu: "قائمة المستخدم",
        userMenuOptions: "خيارات قائمة المستخدم",
        openMobileMenu: "فتح القائمة المحمولة",
        mobileNavigation: "التنقل المحمول",
      },
      navigation: {
        marketplace: "السوق",
        events: "الأحداث",
        networking: "التواصل",
        rfqs: "طلبات الأسعار",
        pricing: "التسعير",
        dashboards: "لوحات التحكم",
        company: "الشركة",
        legal: "قانوني",
      },
      status: {
        active: "نشط",
        inactive: "غير نشط",
        pending: "معلق",
        verified: "موثق",
        inStock: "متوفر",
        outOfStock: "نفد المخزون",
        urgent: "عاجل",
        normal: "عادي",
        low: "منخفض",
      },
    },
    pages: {
      home: {
        title: "سوق المعدات الطبية",
        subtitle: "تواصل مع موردين موثقين حول العالم",
        cta: "ابدأ الآن",
        features: {
          verifiedSuppliers: {
            title: "موردون موثقون",
            description: "جميع الموردين تم فحصهم بدقة مع شهادات ISO والامتثال التنظيمي ووثائق ضمان الجودة.",
          },
          aiMatching: {
            title: "مطابقة بالذكاء الاصطناعي",
            description: "خوارزميات ذكية متقدمة تطابق متطلباتك فوراً مع أنسب الموردين حسب الموقع والسعر والمواصفات.",
          },
          qrCme: {
            title: "CME قابل للتحقق بـ QR",
            description: "اعتمادات التعليم الطبي المستمر مع شهادات موثقة بالبلوك تشين ومصادقة رمز QR للتطوير المهني.",
          },
        },
        stats: {
          suppliers: "موردون نشطون",
          categories: "فئات المعدات",
          globalReach: "الوصول العالمي",
          monthlyRfqs: "طلبات أسعار شهرية",
        },
      },
      marketplace: {
        title: "السوق الطبي",
        subtitle: "اعثر على المعدات الطبية التي تحتاجها",
        searchPlaceholder: "البحث عن معدات طبية...",
      },
      events: {
        title: "الأحداث الطبية",
        subtitle: "اكتشف المؤتمرات الطبية وأحداث التدريب",
        searchPlaceholder: "البحث عن أحداث...",
        filters: {
          specialty: "التخصص",
          subspecialty: "التخصص الفرعي",
          date: "التاريخ",
          format: "الشكل",
          cmeCredits: "اعتمادات CME",
        },
        specialties: {
          title: "التخصصات الطبية",
          subtitle: "ابحث عن الفعاليات حسب التخصص",
        },
      },
      networking: {
        title: "التواصل المهني",
        subtitle: "تواصل مع المهنيين الصحيين حول العالم",
        searchPlaceholder: "البحث عن مهنيين...",
        suggestedConnections: "اتصالات مقترحة",
      },
      rfqs: {
        title: "طلبات عروض الأسعار",
        subtitle: "انشر واستجب لطلبات أسعار المعدات الطبية",
        searchPlaceholder: "البحث عن طلبات الأسعار...",
      },
      pricing: {
        title: "خطط التسعير",
        subtitle: "اختر الخطة التي تناسب احتياجاتك",
        plans: {
          basic: "أساسي",
          professional: "مهني",
          enterprise: "مؤسسي",
        },
      },
      dashboards: {
        title: "لوحة تحليلات",
        subtitle: "تتبع مقاييس أعمال المعدات الطبية الخاصة بك",
      },
    },
  },
};