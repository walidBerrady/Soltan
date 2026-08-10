import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

type Dict = Record<string, string>;

const en: Dict = {
  // Header
  "nav.shop": "Shop",
  "nav.orders": "Orders",
  "nav.products": "Products",
  "nav.signin": "Sign In",
  "nav.wishlist": "Wishlist",
  "nav.bag": "Bag",
  "nav.account": "Account",
  "nav.logout": "Logout",

  // Home / hero
  "home.eyebrow": "Summer Collection 2024",
  "home.heroTitle": "The quiet confidence of linen and light.",
  "home.cta": "Explore the Edit",
  "home.collections": "The Collections",
  "home.shopByCategory": "Shop by category.",
  "home.curatedRoom": "The Curated Room",
  "home.essentials": "Essentials for a slow-living wardrobe.",
  "home.viewBag": "View Bag",
  "home.filterByPrice": "Filter by Price",
  "home.upTo": "Up to",
  "home.reset": "Reset",
  "home.empty": "No products in this price range.",

  // Categories
  "cat.dresses": "Dresses",
  "cat.bags": "Bags",
  "cat.shoes": "Shoes",
  "cat.jewelry": "Jewelry",

  // Product card
  "card.soldOut": "Sold Out",
  "card.quickAdd": "Quick Add",
  "card.addedToBag": "Added to bag",
  "card.savedToWishlist": "Saved to wishlist",
  "card.removedFromWishlist": "Removed from wishlist",
  "card.viewImage": "View image",
  "card.prev": "Previous",
  "card.next": "Next",

  // Cart
  "cart.checkout": "Checkout",
  "cart.title": "Your Bag",
  "cart.empty": "Your bag is empty.",
  "cart.continue": "Continue Shopping",
  "cart.selectAll": "Select all",
  "cart.clear": "Clear bag",
  "cart.remove": "Remove",
  "cart.summary": "Summary",
  "cart.itemSelected": "item selected",
  "cart.itemsSelected": "items selected",
  "cart.subtotal": "Subtotal",
  "cart.shipping": "Shipping",
  "cart.calculatedNext": "Calculated next",
  "cart.total": "Total",
  "cart.fullName": "Full Name",
  "cart.location": "Location",
  "cart.locationPh": "City, address",
  "cart.phone": "Phone Number",
  "cart.phoneHint": "Must start with +212 or 0",
  "cart.moreDetails": "+ More details (optional)",
  "cart.hideDetails": "− Hide more details",
  "cart.email": "Email",
  "cart.notes": "Notes",
  "cart.notesPh": "Any special instructions…",
  "cart.placing": "Placing order…",
  "cart.selectToCheckout": "Select items to checkout",
  "cart.checkoutBtn": "Checkout",

  // Wishlist
  "wish.eyebrow": "Saved",
  "wish.title": "Your Wishlist",
  "wish.empty": "No saved items yet.",
  "wish.moveToBag": "Move to Bag",
  "wish.clear": "Clear Wishlist",

  // Auth
  "auth.account": "Account",
  "auth.signin": "Sign In",
  "auth.create": "Create Account",
  "auth.verify": "Verify Email",
  "auth.signinSub": "Sign in to your account to checkout.",
  "auth.signupSub": "Fill in your details — we'll email you a 6-digit code to confirm.",
  "auth.verifySub": "Check your email for the 6-digit verification code we just sent you.",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.confirmPassword": "Confirm Password",
  "auth.fullName": "Full Name",
  "auth.code": "6-Digit Code",
  "auth.please": "Please wait…",
  "auth.verifying": "Verifying…",
  "auth.verifyContinue": "Verify & Continue",
  "auth.resend": "Resend code",
  "auth.needAccount": "Need an account? Sign up",
  "auth.haveAccount": "Already have an account? Sign in",
  "auth.diffEmail": "← Use a different email",
  "auth.back": "← Back to shop",

  // Success
  "ok.confirmation": "Confirmation",
  "ok.thanks": "Thank you.",
  "ok.received": "Your order has been received. A confirmation will be in your inbox shortly.",
  "ok.continue": "Continue Shopping",

  // Footer
  "footer.made": "Website made by Berrady",

  // Lang
  "lang.toggle": "العربية",
};

const ar: Dict = {
  // Header
  "nav.shop": "المتجر",
  "nav.orders": "الطلبات",
  "nav.products": "المنتجات",
  "nav.signin": "تسجيل الدخول",
  "nav.wishlist": "المفضلة",
  "nav.bag": "السلة",
  "nav.account": "الحساب",
  "nav.logout": "تسجيل الخروج",

  // Home
  "home.eyebrow": "تشكيلة الصيف 2024",
  "home.heroTitle": "ثقة هادئة من الكتان والنور.",
  "home.cta": "اكتشف التشكيلة",
  "home.collections": "المجموعات",
  "home.shopByCategory": "تسوّق حسب الفئة.",
  "home.curatedRoom": "الغرفة المختارة",
  "home.essentials": "أساسيات لخزانة بأسلوب هادئ.",
  "home.viewBag": "عرض السلة",
  "home.filterByPrice": "تصفية حسب السعر",
  "home.upTo": "حتى",
  "home.reset": "إعادة",
  "home.empty": "لا توجد منتجات في هذا النطاق السعري.",

  // Categories
  "cat.dresses": "فساتين",
  "cat.bags": "حقائب",
  "cat.shoes": "أحذية",
  "cat.jewelry": "مجوهرات",

  // Product card
  "card.soldOut": "نفذت الكمية",
  "card.quickAdd": "إضافة سريعة",
  "card.addedToBag": "تمت الإضافة إلى السلة",
  "card.savedToWishlist": "تم الحفظ في المفضلة",
  "card.removedFromWishlist": "تمت الإزالة من المفضلة",
  "card.viewImage": "عرض الصورة",
  "card.prev": "السابق",
  "card.next": "التالي",

  // Cart
  "cart.checkout": "إتمام الشراء",
  "cart.title": "سلتك",
  "cart.empty": "سلتك فارغة.",
  "cart.continue": "متابعة التسوّق",
  "cart.selectAll": "تحديد الكل",
  "cart.clear": "إفراغ السلة",
  "cart.remove": "إزالة",
  "cart.summary": "الملخص",
  "cart.itemSelected": "منتج محدّد",
  "cart.itemsSelected": "منتجات محدّدة",
  "cart.subtotal": "المجموع الفرعي",
  "cart.shipping": "الشحن",
  "cart.calculatedNext": "يُحتسب لاحقاً",
  "cart.total": "المجموع",
  "cart.fullName": "الاسم الكامل",
  "cart.location": "العنوان",
  "cart.locationPh": "المدينة، العنوان",
  "cart.phone": "رقم الهاتف",
  "cart.phoneHint": "يجب أن يبدأ بـ +212 أو 0",
  "cart.moreDetails": "+ تفاصيل إضافية (اختياري)",
  "cart.hideDetails": "− إخفاء التفاصيل",
  "cart.email": "البريد الإلكتروني",
  "cart.notes": "ملاحظات",
  "cart.notesPh": "أي تعليمات خاصة…",
  "cart.placing": "جاري إرسال الطلب…",
  "cart.selectToCheckout": "اختر منتجات للشراء",
  "cart.checkoutBtn": "إتمام شراء",

  // Wishlist
  "wish.eyebrow": "محفوظات",
  "wish.title": "قائمة المفضلة",
  "wish.empty": "لا توجد عناصر محفوظة بعد.",
  "wish.moveToBag": "نقل إلى السلة",
  "wish.clear": "إفراغ المفضلة",

  // Auth
  "auth.account": "الحساب",
  "auth.signin": "تسجيل الدخول",
  "auth.create": "إنشاء حساب",
  "auth.verify": "تأكيد البريد",
  "auth.signinSub": "سجّل الدخول لحسابك لإتمام الشراء.",
  "auth.signupSub": "املأ بياناتك — سنرسل لك رمزاً من 6 أرقام للتأكيد.",
  "auth.verifySub": "تحقق من بريدك الإلكتروني للحصول على رمز التحقق المكوّن من 6 أرقام الذي أرسلناه لك للتو.",
  "auth.email": "البريد الإلكتروني",
  "auth.password": "كلمة المرور",
  "auth.confirmPassword": "تأكيد كلمة المرور",
  "auth.fullName": "الاسم الكامل",
  "auth.code": "رمز من 6 أرقام",
  "auth.please": "يرجى الانتظار…",
  "auth.verifying": "جاري التحقق…",
  "auth.verifyContinue": "تأكيد ومتابعة",
  "auth.resend": "إعادة إرسال الرمز",
  "auth.needAccount": "لا تملك حساب؟ سجّل الآن",
  "auth.haveAccount": "لديك حساب؟ سجّل الدخول",
  "auth.diffEmail": "→ استخدم بريداً آخر",
  "auth.back": "→ العودة للمتجر",

  // Success
  "ok.confirmation": "تأكيد",
  "ok.thanks": "شكراً لك.",
  "ok.received": "تم استلام طلبك. ستصلك رسالة التأكيد قريباً.",
  "ok.continue": "متابعة التسوّق",

  // Footer
  "footer.made": "الموقع من إنجاز Berrady",

  // Lang
  "lang.toggle": "English",
};

const dicts: Record<Lang, Dict> = { en, ar };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // hydrate from localStorage on client
  useEffect(() => {
    try {
      const saved = localStorage.getItem("soltan-lang");
      if (saved === "en" || saved === "ar") setLangState(saved);
    } catch {}
  }, []);

  // sync html lang/dir
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const value = useMemo<Ctx>(() => {
    const setLang = (l: Lang) => {
      setLangState(l);
      try {
        localStorage.setItem("soltan-lang", l);
      } catch {}
    };
    return {
      lang,
      setLang,
      toggle: () => setLang(lang === "en" ? "ar" : "en"),
      t: (key: string) => dicts[lang][key] ?? dicts.en[key] ?? key,
      dir: lang === "ar" ? "rtl" : "ltr",
    };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
