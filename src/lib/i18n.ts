import { useEffect } from "react";
import { actions, useStore, type Product } from "./store";
import { normalizeCategory } from "./categories";

export type Lang = "ar" | "fr" | "en";
export const LANGS: Lang[] = ["ar", "fr", "en"];

const dict = {
  search: { ar: "ابحث عن منتج...", fr: "Rechercher un produit...", en: "Search products..." },
  admin: { ar: "دخول المسؤول", fr: "Admin", en: "Admin Login" },
  heroA: { ar: "أحدث الإلكترونيات", fr: "Le meilleur de la tech", en: "The latest electronics" },
  heroB: { ar: "بين يديك", fr: "à portée de main", en: "in your hands" },
  heroSub: { ar: "توصيل لجميع المدن المغربية والدفع عند الاستلام", fr: "Livraison partout au Maroc, paiement à la livraison", en: "Delivery across Morocco, cash on delivery" },
  fast: { ar: "توصيل سريع", fr: "Livraison rapide", en: "Fast delivery" },
  quality: { ar: "ضمان الجودة", fr: "Qualité garantie", en: "Quality guaranteed" },
  support: { ar: "دعم 7/7", fr: "Support 7/7", en: "Support 7/7" },
  all: { ar: "الكل", fr: "Tout", en: "All" },
  noResults: { ar: "لا توجد منتجات مطابقة", fr: "Aucun produit trouvé", en: "No matching products" },
  sortBy: { ar: "ترتيب حسب", fr: "Trier par", en: "Sort by" },
  newest: { ar: "الأحدث", fr: "Nouveautés", en: "Newest first" },
  priceAsc: { ar: "الأرخص أولاً", fr: "Prix croissant", en: "Price: Low to High" },
  priceDesc: { ar: "الأغلى أولاً", fr: "Prix décroissant", en: "Price: High to Low" },
  add: { ar: "أضف", fr: "Ajouter", en: "Add" },
  addToCart: { ar: "أضف إلى السلة", fr: "Ajouter au panier", en: "Add to cart" },
  inStock: { ar: "متوفر", fr: "En stock", en: "In stock" },
  lowStock: { ar: "مخزون محدود", fr: "Stock limité", en: "Low stock" },
  outStock: { ar: "نفد المخزون", fr: "Rupture", en: "Out of stock" },
  back: { ar: "العودة للمتجر", fr: "Retour à la boutique", en: "Back to store" },
  features: { ar: "المميزات", fr: "Caractéristiques", en: "Features" },
  notFound: { ar: "المنتج غير موجود.", fr: "Produit introuvable.", en: "Product not found." },
  cod: { ar: "الدفع عند الاستلام", fr: "Paiement à la livraison", en: "Cash on delivery" },
  codSub: { ar: "ادفع نقداً عند وصول طلبك", fr: "Payez en espèces à la réception", en: "Pay cash when your order arrives" },
  codLine: { ar: "الدفع عند الاستلام - توصيل لجميع المدن", fr: "Paiement à la livraison - partout au Maroc", en: "Cash on delivery - all cities" },
  cart: { ar: "سلة التسوق", fr: "Panier", en: "Shopping cart" },
  checkout: { ar: "إتمام الطلب", fr: "Commander", en: "Checkout" },
  done: { ar: "تم الطلب", fr: "Commande confirmée", en: "Order placed" },
  empty: { ar: "السلة فارغة", fr: "Votre panier est vide", en: "Your cart is empty" },
  subtotal: { ar: "المجموع الفرعي", fr: "Sous-total", en: "Subtotal" },
  shipping: { ar: "التوصيل", fr: "Livraison", en: "Shipping" },
  total: { ar: "المجموع الكلي", fr: "Total", en: "Total" },
  minOrder: { ar: "الحد الأدنى للطلب هو 100 درهم. أضف {n} أخرى لإتمام الطلب.", fr: "Commande minimum : 100 MAD. Ajoutez encore {n}.", en: "Minimum order is 100 MAD. Add {n} more to checkout." },
  name: { ar: "الاسم الكامل", fr: "Nom complet", en: "Full name" },
  phone: { ar: "رقم الهاتف", fr: "Téléphone", en: "Phone number" },
  phoneErr: { ar: "أدخل رقماً مغربياً صحيحاً (مثال: 0612345678)", fr: "Numéro marocain invalide (ex : 0612345678)", en: "Enter a valid Moroccan number (e.g. 0612345678)" },
  city: { ar: "المدينة", fr: "Ville", en: "City" },
  address: { ar: "عنوان التوصيل", fr: "Adresse de livraison", en: "Shipping address" },
  confirm: { ar: "تأكيد الطلب", fr: "Confirmer la commande", en: "Confirm order" },
  backCart: { ar: "العودة للسلة", fr: "Retour au panier", en: "Back to cart" },
  thanks: { ar: "شكراً لك! تم استلام طلبك", fr: "Merci ! Commande reçue", en: "Thank you! Order received" },
  orderNo: { ar: "رقم الطلب:", fr: "N° de commande :", en: "Order number:" },
  callSoon: { ar: "سنتصل بك قريباً لتأكيد الطلب.", fr: "Nous vous appellerons pour confirmer.", en: "We'll call you soon to confirm." },
  continue: { ar: "متابعة التسوق", fr: "Continuer mes achats", en: "Continue shopping" },
  currency: { ar: "درهم", fr: "MAD", en: "MAD" },
  footerAbout: {
    ar: "متجر إلكترونيات مغربي: تلفزيونات و TV Box، صوتيات وميكروفونات، هواتف وحواسيب، كوابل وإكسسوارات ألعاب. الدفع عند الاستلام في جميع المدن.",
    fr: "Boutique high-tech au Maroc : TV et TV Box, audio et microphones, téléphones et ordinateurs, câbles et accessoires gaming. Paiement à la livraison partout au Maroc.",
    en: "Moroccan electronics store: TVs & TV Boxes, audio & microphones, phones & computers, cables & gaming accessories. Cash on delivery nationwide.",
  },
  footerContact: { ar: "تواصل معنا", fr: "Contactez-nous", en: "Contact us" },
  followUs: { ar: "تابعنا", fr: "Suivez-nous", en: "Follow us" },
  waOrder: { ar: "اطلب عبر واتساب", fr: "Commander sur WhatsApp", en: "Order on WhatsApp" },
  waChat: { ar: "راسلنا على واتساب", fr: "Discuter sur WhatsApp", en: "Chat on WhatsApp" },
  sendOnWa: { ar: "أرسل الطلب على واتساب", fr: "Envoyer la commande sur WhatsApp", en: "Send the order on WhatsApp" },
  waHint: {
    ar: "أرسل طلبك على واتساب لتأكيده بسرعة.",
    fr: "Envoyez votre commande sur WhatsApp pour la confirmer plus vite.",
    en: "Send your order on WhatsApp to confirm it faster.",
  },
  waCallNote: {
    ar: "نرد على الرسائل والاتصال يومياً.",
    fr: "Nous répondons aux messages et aux appels tous les jours.",
    en: "We answer messages and calls every day.",
  },
  needHelp: { ar: "لأي استفسار قبل الطلب:", fr: "Une question avant de commander :", en: "A question before ordering:" },
  shipNote: {
    ar: "التوصيل: 20 درهم للقنيطرة، 30 درهم لباقي المدن",
    fr: "Livraison : 20 MAD à Kénitra, 30 MAD pour les autres villes",
    en: "Shipping: 20 MAD in Kenitra, 30 MAD elsewhere",
  },
  minOrderNote: { ar: "الحد الأدنى للطلب: 100 درهم", fr: "Commande minimum : 100 MAD", en: "Minimum order: 100 MAD" },
  rights: { ar: "جميع الحقوق محفوظة", fr: "Tous droits réservés", en: "All rights reserved" },
} as const;

export type Key = keyof typeof dict;

export const CAT_LABELS: Record<string, Record<Lang, string>> = {
  tv: { ar: "تلفزيونات و TV Box", fr: "TV et TV Box", en: "TVs & TV Boxes" },
  audio: { ar: "صوتيات وميكروفونات", fr: "Audio et microphones", en: "Audio & Microphones" },
  phones: { ar: "هواتف وحواسيب", fr: "Téléphones et ordinateurs", en: "Phones & Computers" },
  accessories: { ar: "كوابل وإكسسوارات", fr: "Câbles et accessoires", en: "Cables & Accessories" },
  gaming: { ar: "إكسسوارات الألعاب", fr: "Accessoires Gaming", en: "Gaming Accessories" },
};

export function useT() {
  const lang = useStore((s) => s.lang);
  const t = (k: Key, vars?: Record<string, string | number>) => {
    let s: string = dict[k][lang];
    if (vars) for (const [a, b] of Object.entries(vars)) s = s.replace(`{${a}}`, String(b));
    return s;
  };
  const money = (n: number) => `${n.toLocaleString("fr-MA")} ${dict.currency[lang]}`;
  const cat = (id: string) => CAT_LABELS[normalizeCategory(id)]?.[lang] ?? id;
  const pt = (p: Product) => { const x = p.tr?.[lang]; return { name: x?.name || p.name, description: x?.description || p.description, features: x?.features?.length ? x.features : p.features }; };
  return { t, lang, money, cat, pt, setLang: actions.setLang };
}

export function LangDirSync() {
  const lang = useStore((s) => s.lang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  return null;
}
