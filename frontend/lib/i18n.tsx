"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── Types ──────────────────────────────────────────────────────────────
export type Locale = "en" | "fr" | "ar";

type TranslationKeys = {
    // Navbar
    nav_cars: string;
    nav_services: string;
    nav_articles: string;
    nav_contact: string;
    nav_book_now: string;
    whatsapp_message: string;

    // Hero
    hero_subtitle: string;
    hero_browse: string;
    hero_contact: string;

    // Featured Cars
    featured_badge: string;
    featured_title_1: string;
    featured_title_2: string;
    featured_desc: string;
    featured_view_all: string;

    // Car Card
    car_no_image: string;
    car_contact_us: string;
    car_per_day: string;
    car_seats: string;
    car_view_details: string;

    // Services
    services_badge: string;
    services_title_1: string;
    services_title_2: string;
    services_desc: string;

    // Articles
    articles_badge: string;
    articles_title_1: string;
    articles_title_2: string;
    articles_desc: string;
    articles_no_image: string;
    articles_read_more: string;

    // Google Reviews
    reviews_badge: string;
    reviews_verified_google: string;
    reviews_title_1: string;
    reviews_title_2: string;
    reviews_desc: string;
    reviews_verified: string;
    reviews_cta: string;
    review_1_date: string;
    review_1_text: string;
    review_2_date: string;
    review_2_text: string;
    review_3_date: string;
    review_3_text: string;
    review_4_date: string;
    review_4_text: string;

    // Footer
    footer_about: string;
    footer_quick_links: string;
    footer_home: string;
    footer_fleet: string;
    footer_services: string;
    footer_articles: string;
    footer_contact_heading: string;
    footer_contact: string;
    footer_address: string;
    footer_find_us: string;
    footer_rights: string;

    // Contracts (admin)
    contracts_download_contract: string;
    contracts_download_invoice: string;
    contracts_btn_contract: string;
    contracts_btn_invoice: string;

    // Date locale
    date_locale: string;
};

// ─── Translations ───────────────────────────────────────────────────────
const translations: Record<Locale, TranslationKeys> = {
    en: {
        // Navbar
        nav_cars: "Cars",
        nav_services: "Services",
        nav_articles: "Articles",
        nav_contact: "Contact",
        nav_book_now: "Book Now",
        whatsapp_message: "Hello, I would like to book a vehicle.",

        // Hero
        hero_subtitle: "Premium Fleet. Instant Availability. Zero Friction.",
        hero_browse: "Browse Fleet",
        hero_contact: "Contact Us",

        // Featured Cars
        featured_badge: "Our Fleet",
        featured_title_1: "Featured",
        featured_title_2: "Cars",
        featured_desc: "Explore our premium fleet of vehicles, each carefully selected for comfort, reliability, and performance.",
        featured_view_all: "View All Cars",

        // Car Card
        car_no_image: "No Image",
        car_contact_us: "Contact us",
        car_per_day: "/ day",
        car_seats: "Seats",
        car_view_details: "View Details",

        // Services
        services_badge: "What We Offer",
        services_title_1: "Our",
        services_title_2: "Services",
        services_desc: "Everything you need for a seamless and worry-free rental experience.",

        // Articles
        articles_badge: "Blog & Tips",
        articles_title_1: "Latest",
        articles_title_2: "Articles",
        articles_desc: "Travel tips, road trip guides, and everything you need to know about driving in Morocco.",
        articles_no_image: "No Image",
        articles_read_more: "Read More",

        // Google Reviews
        reviews_badge: "Customer Reviews",
        reviews_verified_google: "Verified on Google",
        reviews_title_1: "What our",
        reviews_title_2: "Travelers Say",
        reviews_desc: "Trust is at the heart of our service. Discover why our clients choose us for their travels in Agadir.",
        reviews_verified: "Verified Review",
        reviews_cta: "Leave us a review on Google",
        review_1_date: "2 weeks ago",
        review_1_text: "Exceptional service! The car was spotless and delivered on time at Agadir airport. I highly recommend Misters Drivers for their professionalism.",
        review_2_date: "1 month ago",
        review_2_text: "The best car rental experience in Morocco. Zero friction, clear pricing, and the car was nearly new. 5 stars all the way!",
        review_3_date: "2 months ago",
        review_3_text: "Very responsive and attentive team. I rented a BMW X5 for a business trip and everything was perfect. The value for money is unbeatable.",
        review_4_date: "3 weeks ago",
        review_4_text: "Simple and fast rental. No hidden fees. It's nice to find such a transparent agency in Agadir.",

        // Footer
        footer_about: "Premium car rental agency in Agadir. Varied fleet, airport delivery, and 24/7 assistance. Your mobility partner in Morocco.",
        footer_quick_links: "Quick Links",
        footer_home: "Home",
        footer_fleet: "Our Fleet",
        footer_services: "Services",
        footer_articles: "Articles",
        footer_contact_heading: "Contact",
        footer_contact: "Contact",
        footer_address: "Mag N° AH 545, Cité El Qods, Agadir, Morocco",
        footer_find_us: "Find Us",
        footer_rights: "All rights reserved.",

        // Contracts (admin)
        contracts_download_contract: "Contract",
        contracts_download_invoice: "Invoice",
        contracts_btn_contract: "Contract",
        contracts_btn_invoice: "Invoice",

        // Date locale
        date_locale: "en-US",
    },
    fr: {
        // Navbar
        nav_cars: "Voitures",
        nav_services: "Services",
        nav_articles: "Articles",
        nav_contact: "Contact",
        nav_book_now: "Réserver",
        whatsapp_message: "Bonjour, je souhaite réserver un véhicule.",

        // Hero
        hero_subtitle: "Flotte Premium. Disponibilité Immédiate. Zéro Friction.",
        hero_browse: "Voir la Flotte",
        hero_contact: "Contactez-nous",

        // Featured Cars
        featured_badge: "Notre Flotte",
        featured_title_1: "Voitures",
        featured_title_2: "Vedettes",
        featured_desc: "Découvrez notre flotte premium de véhicules, chacun soigneusement sélectionné pour le confort, la fiabilité et la performance.",
        featured_view_all: "Voir Toutes les Voitures",

        // Car Card
        car_no_image: "Pas d'Image",
        car_contact_us: "Contactez-nous",
        car_per_day: "/ jour",
        car_seats: "Places",
        car_view_details: "Voir Détails",

        // Services
        services_badge: "Ce que nous offrons",
        services_title_1: "Nos",
        services_title_2: "Services",
        services_desc: "Tout ce dont vous avez besoin pour une expérience de location fluide et sans souci.",

        // Articles
        articles_badge: "Blog & Conseils",
        articles_title_1: "Derniers",
        articles_title_2: "Articles",
        articles_desc: "Conseils de voyage, guides de road trip et tout ce que vous devez savoir sur la conduite au Maroc.",
        articles_no_image: "Pas d'Image",
        articles_read_more: "Lire la Suite",

        // Google Reviews
        reviews_badge: "Avis Clients",
        reviews_verified_google: "Vérifié sur Google",
        reviews_title_1: "Ce que disent nos",
        reviews_title_2: "Voyageurs",
        reviews_desc: "La confiance est au cœur de notre service. Découvrez pourquoi nos clients nous choisissent pour leurs déplacements à Agadir.",
        reviews_verified: "Avis Vérifié",
        reviews_cta: "Laissez-nous un avis sur Google",
        review_1_date: "il y a 2 semaines",
        review_1_text: "Service exceptionnel ! La voiture était impeccable et livrée à l'heure à l'aéroport d'Agadir. Je recommande vivement Misters Drivers pour leur professionnalisme.",
        review_2_date: "il y a 1 mois",
        review_2_text: "The best car rental experience in Morocco. Zero friction, clear pricing, and the car was nearly new. 5 stars all the way!",
        review_3_date: "il y a 2 mois",
        review_3_text: "Équipe très réactive et à l'écoute. J'ai loué une BMW X5 pour un voyage d'affaires et tout était parfait. Le rapport qualité-prix est imbattable.",
        review_4_date: "il y a 3 semaines",
        review_4_text: "Location simple et rapide. Pas de frais cachés. C'est agréable de trouver une agence aussi transparente à Agadir.",

        // Footer
        footer_about: "Agence de location de voitures à Agadir. Service premium, flotte variée et assistance 24h/24. Votre partenaire de mobilité au Maroc.",
        footer_quick_links: "Liens Rapides",
        footer_home: "Accueil",
        footer_fleet: "Notre Flotte",
        footer_services: "Services",
        footer_articles: "Articles",
        footer_contact_heading: "Contact",
        footer_contact: "Contact",
        footer_address: "Mag N° AH 545, Cité El Qods, Agadir, Maroc",
        footer_find_us: "Nous Trouver",
        footer_rights: "Tous droits réservés.",

        // Contracts (admin)
        contracts_download_contract: "Contrat",
        contracts_download_invoice: "Facture",
        contracts_btn_contract: "Contrat",
        contracts_btn_invoice: "Facture",

        // Date locale
        date_locale: "fr-FR",
    },
    ar: {
        // Navbar
        nav_cars: "السيارات",
        nav_services: "الخدمات",
        nav_articles: "المقالات",
        nav_contact: "اتصل بنا",
        nav_book_now: "احجز الآن",
        whatsapp_message: "مرحباً، أود حجز سيارة.",

        // Hero
        hero_subtitle: "أسطول فاخر. توفر فوري. بدون تعقيد.",
        hero_browse: "تصفح الأسطول",
        hero_contact: "اتصل بنا",

        // Featured Cars
        featured_badge: "أسطولنا",
        featured_title_1: "سيارات",
        featured_title_2: "مميزة",
        featured_desc: "اكتشف أسطولنا الفاخر من السيارات، كل واحدة مختارة بعناية من أجل الراحة والموثوقية والأداء.",
        featured_view_all: "عرض جميع السيارات",

        // Car Card
        car_no_image: "لا توجد صورة",
        car_contact_us: "اتصل بنا",
        car_per_day: "/ يوم",
        car_seats: "مقاعد",
        car_view_details: "عرض التفاصيل",

        // Services
        services_badge: "ما نقدمه",
        services_title_1: "خدماتنا",
        services_title_2: "المتميزة",
        services_desc: "كل ما تحتاجه لتجربة تأجير سلسة وخالية من المتاعب.",

        // Articles
        articles_badge: "مدونة ونصائح",
        articles_title_1: "أحدث",
        articles_title_2: "المقالات",
        articles_desc: "نصائح سفر، أدلة رحلات برية، وكل ما تحتاج معرفته عن القيادة في المغرب.",
        articles_no_image: "لا توجد صورة",
        articles_read_more: "اقرأ المزيد",

        // Google Reviews
        reviews_badge: "آراء العملاء",
        reviews_verified_google: "موثق على جوجل",
        reviews_title_1: "ماذا يقول",
        reviews_title_2: "مسافرونا",
        reviews_desc: "الثقة في صميم خدمتنا. اكتشف لماذا يختارنا عملاؤنا لتنقلاتهم في أكادير.",
        reviews_verified: "تقييم موثق",
        reviews_cta: "اترك لنا تقييماً على جوجل",
        review_1_date: "قبل أسبوعين",
        review_1_text: "خدمة استثنائية! السيارة كانت نظيفة جداً وتم تسليمها في الوقت المحدد في مطار أكادير. أنصح بشدة بـ Misters Drivers لاحترافيتهم.",
        review_2_date: "قبل شهر",
        review_2_text: "أفضل تجربة تأجير سيارات في المغرب. بدون تعقيد، أسعار واضحة، والسيارة كانت شبه جديدة. 5 نجوم!",
        review_3_date: "قبل شهرين",
        review_3_text: "فريق متجاوب ومهتم جداً. استأجرت BMW X5 لرحلة عمل وكان كل شيء مثالياً. القيمة مقابل السعر لا تُضاهى.",
        review_4_date: "قبل 3 أسابيع",
        review_4_text: "تأجير بسيط وسريع. لا رسوم مخفية. من الجميل أن تجد وكالة بهذه الشفافية في أكادير.",

        // Footer
        footer_about: "وكالة تأجير سيارات فاخرة في أكادير. أسطول متنوع، توصيل للمطار، ومساعدة على مدار الساعة. شريكك في التنقل بالمغرب.",
        footer_quick_links: "روابط سريعة",
        footer_home: "الرئيسية",
        footer_fleet: "أسطولنا",
        footer_services: "الخدمات",
        footer_articles: "المقالات",
        footer_contact_heading: "اتصل بنا",
        footer_contact: "اتصل بنا",
        footer_address: "ماغ رقم AH 545، حي القدس، أكادير، المغرب",
        footer_find_us: "موقعنا",
        footer_rights: "جميع الحقوق محفوظة.",

        // Contracts (admin)
        contracts_download_contract: "العقد",
        contracts_download_invoice: "الفاتورة",
        contracts_btn_contract: "العقد",
        contracts_btn_invoice: "الفاتورة",

        // Date locale
        date_locale: "ar-MA",
    },
};

// ─── Context ────────────────────────────────────────────────────────────
interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType>({
    locale: "en",
    setLocale: () => {},
    t: translations.en,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>("en");

    useEffect(() => {
        const saved = localStorage.getItem("locale") as Locale | null;
        if (saved && (saved === "en" || saved === "fr" || saved === "ar")) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem("locale", newLocale);
        document.documentElement.lang = newLocale;
        document.documentElement.dir = newLocale === "ar" ? "rtl" : "ltr";
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
