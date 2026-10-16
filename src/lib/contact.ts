import type { Lang } from "./i18n";

export const STORE_PHONE = {
  local: "0672418047",
  intl: "+212672418047",
  wa: "212672418047",
  tel: "tel:+212672418047",
} as const;

export type Social = {
  id: string;
  href: string;
  handle: string;
  label: Record<Lang, string>;
};

export const SOCIALS: Social[] = [
  {
    id: "instagram-store",
    href: "https://instagram.com/techyous",
    handle: "@techyous",
    label: { ar: "إنستغرام المتجر", fr: "Instagram boutique", en: "Store Instagram" },
  },
  {
    id: "instagram-personal",
    href: "https://instagram.com/ussefbaghdadi?srtk=MWIwd2x6YzlveWhjbA%3D%3D",
    handle: "@ussefbaghdadi",
    label: { ar: "إنستغرام الشخصي", fr: "Instagram personnel", en: "Personal Instagram" },
  },
  {
    id: "tiktok",
    href: "https://tiktok.com/@ussefbaghdadi",
    handle: "@ussefbaghdadi",
    label: { ar: "تيك توك", fr: "TikTok", en: "TikTok" },
  },
];

const CURRENCY: Record<Lang, string> = { ar: "درهم", fr: "MAD", en: "MAD" };
export const waMoney = (n: number, lang: Lang) => `${n.toLocaleString("fr-MA")} ${CURRENCY[lang]}`;

export const waLink = (text: string) => `https://wa.me/${STORE_PHONE.wa}?text=${encodeURIComponent(text)}`;

const M = {
  hello: {
    ar: "السلام عليكم، أريد الاستفسار عن منتجات TechYous.",
    fr: "Bonjour, j'aimerais des informations sur les produits TechYous.",
    en: "Hello, I'd like some information about TechYous products.",
  },
  orderIntro: {
    ar: "السلام عليكم، أريد طلب المنتجات التالية:",
    fr: "Bonjour, je souhaite commander les produits suivants :",
    en: "Hello, I'd like to order the following products:",
  },
  placed: {
    ar: "السلام عليكم، أرسلت هذا الطلب عبر موقع TechYous. أرجو تأكيده:",
    fr: "Bonjour, je viens d'envoyer cette commande via le site TechYous. Merci de la confirmer :",
    en: "Hello, I just placed this order on the TechYous site. Please confirm it:",
  },
  total: { ar: "المجموع", fr: "Sous-total", en: "Subtotal" },
  shipping: { ar: "التوصيل", fr: "Livraison", en: "Shipping" },
  grand: { ar: "المجموع الكلي", fr: "Total", en: "Total" },
  name: { ar: "الاسم", fr: "Nom", en: "Name" },
  phone: { ar: "الهاتف", fr: "Téléphone", en: "Phone" },
  city: { ar: "المدينة", fr: "Ville", en: "City" },
  address: { ar: "العنوان", fr: "Adresse", en: "Address" },
  orderNo: { ar: "رقم الطلب", fr: "N° de commande", en: "Order number" },
  cod: { ar: "الدفع عند الاستلام", fr: "Paiement à la livraison", en: "Cash on delivery" },
  details: {
    ar: "سأرسل لكم تفاصيل التوصيل هنا.",
    fr: "Je vous envoie les détails de livraison ici.",
    en: "I'll send you the delivery details here.",
  },
} as const;

export type WaLine = { name: string; price: number; qty: number };

export type WaOrder = {
  id: string;
  items: WaLine[];
  subtotal: number;
  shipping: number;
  total: number;
  name: string;
  phone: string;
  city: string;
  address: string;
};

const linesText = (items: WaLine[], lang: Lang) =>
  items.map((i) => `• ${i.name} ×${i.qty} — ${waMoney(i.price * i.qty, lang)}`);

export const waGreetingText = (lang: Lang) => M.hello[lang];

export function cartWaText(items: WaLine[], subtotal: number, lang: Lang) {
  return [
    M.orderIntro[lang],
    ...linesText(items, lang),
    "",
    `${M.total[lang]}: ${waMoney(subtotal, lang)}`,
    M.details[lang],
  ].join("\n");
}

export function orderWaText(o: WaOrder, lang: Lang) {
  return [
    M.placed[lang],
    `${M.orderNo[lang]}: ${o.id}`,
    "",
    ...linesText(o.items, lang),
    "",
    `${M.total[lang]}: ${waMoney(o.subtotal, lang)}`,
    `${M.shipping[lang]}: ${waMoney(o.shipping, lang)}`,
    `${M.grand[lang]}: ${waMoney(o.total, lang)}`,
    M.cod[lang],
    "",
    `${M.name[lang]}: ${o.name}`,
    `${M.phone[lang]}: ${o.phone}`,
    `${M.city[lang]}: ${o.city}`,
    `${M.address[lang]}: ${o.address}`,
  ].join("\n");
}
