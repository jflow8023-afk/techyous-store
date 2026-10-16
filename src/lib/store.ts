import { useSyncExternalStore } from "react";
import tv from "@/assets/tv.jpg";
import mic from "@/assets/mic.jpg";
import soundbar from "@/assets/soundbar.jpg";
import gamepad from "@/assets/gamepad.jpg";
import tvbox from "@/assets/tvbox.jpg";
import smartwatch from "@/assets/smartwatch.jpg";

import { CATEGORIES, normalizeCategory } from "./categories";
export { CATEGORIES } from "./categories";

export type Product = {
  id: string; name: string; category: string; price: number; stock: number;
  images: string[]; description: string; features: string[];
  tr?: Partial<Record<"ar" | "fr" | "en", { name: string; description: string; features: string[] }>> | undefined;
};
export type OrderStatus = "pending" | "shipped" | "delivered";
export type Order = {
  id: string; createdAt: number; status: OrderStatus; total: number;
  shipping?: number; subtotal?: number;
  customer: { name: string; phone: string; city: string; address: string };
  items: { productId: string; name: string; price: number; qty: number }[];
};
type CartItem = { productId: string; qty: number };
type State = { products: Product[]; orders: Order[]; cart: CartItem[]; cartOpen: boolean; lang: "ar" | "fr" | "en" };

export const MIN_ORDER = 100;
export const CITIES = [
  { id: "casa", ar: "الدار البيضاء", fr: "Casablanca", en: "Casablanca" },
  { id: "rabat", ar: "الرباط", fr: "Rabat", en: "Rabat" },
  { id: "kenitra", ar: "القنيطرة", fr: "Kénitra", en: "Kenitra" },
  { id: "marrakech", ar: "مراكش", fr: "Marrakech", en: "Marrakech" },
  { id: "fes", ar: "فاس", fr: "Fès", en: "Fes" },
  { id: "tanger", ar: "طنجة", fr: "Tanger", en: "Tangier" },
  { id: "agadir", ar: "أكادير", fr: "Agadir", en: "Agadir" },
  { id: "meknes", ar: "مكناس", fr: "Meknès", en: "Meknes" },
  { id: "oujda", ar: "وجدة", fr: "Oujda", en: "Oujda" },
  { id: "tetouan", ar: "تطوان", fr: "Tétouan", en: "Tetouan" },
  { id: "other", ar: "مدينة أخرى", fr: "Autre ville", en: "Other city" },
];
export const shippingFor = (cityId: string) => (cityId === "kenitra" ? 20 : 30);

const seed: Product[] = [
  { id: "p1", name: "تلفزيون ذكي 55 بوصة 4K UHD", category: "tv", price: 4290, stock: 8, images: [tv], description: "تلفزيون ذكي بدقة 4K مع ألوان HDR نابضة ونظام تشغيل يدعم جميع التطبيقات.", features: ["دقة 4K UHD", "HDR10+", "Wi‑Fi و Bluetooth", "Netflix و YouTube"], tr: { fr: { name: "Smart TV 55\" 4K UHD", description: "Smart TV 4K aux couleurs HDR éclatantes, compatible avec toutes les applications.", features: ["Résolution 4K UHD", "HDR10+", "Wi‑Fi et Bluetooth", "Netflix et YouTube"] }, en: { name: "55\" 4K UHD Smart TV", description: "4K smart TV with vibrant HDR colors and an OS that supports all apps.", features: ["4K UHD resolution", "HDR10+", "Wi‑Fi & Bluetooth", "Netflix & YouTube"] } } },
  { id: "p2", name: "TV Box أندرويد 4K - 4GB/64GB", category: "tvbox", price: 390, stock: 25, images: [tvbox], description: "حوّل أي تلفزيون إلى تلفزيون ذكي.", features: ["أندرويد 12", "4GB RAM / 64GB", "دعم 4K", "ريموت مع أوامر صوتية"], tr: { fr: { name: "TV Box Android 4K - 4GB/64GB", description: "Transformez n'importe quelle télé en Smart TV.", features: ["Android 12", "4GB RAM / 64GB", "Support 4K", "Télécommande à commande vocale"] }, en: { name: "Android 4K TV Box - 4GB/64GB", description: "Turn any TV into a smart TV.", features: ["Android 12", "4GB RAM / 64GB", "4K support", "Voice remote"] } } },
  { id: "p3", name: "ميكروفون USB احترافي RGB", category: "mic", price: 450, stock: 12, images: [mic], description: "ميكروفون مثالي للبث المباشر والبودكاست.", features: ["اتصال USB-C", "إضاءة RGB", "زر كتم الصوت", "منفذ سماعة"], tr: { fr: { name: "Microphone USB professionnel RGB", description: "Micro idéal pour le streaming et les podcasts.", features: ["Connexion USB-C", "Éclairage RGB", "Bouton muet", "Prise casque"] }, en: { name: "Professional RGB USB Microphone", description: "Perfect mic for live streaming and podcasts.", features: ["USB-C connection", "RGB lighting", "Mute button", "Headphone jack"] } } },
  { id: "p4", name: "مكبر صوت Soundbar مع Subwoofer", category: "audio", price: 1290, stock: 3, images: [soundbar], description: "صوت سينمائي قوي في منزلك.", features: ["قوة 240W", "Bluetooth 5.0", "HDMI ARC", "Subwoofer لاسلكي"], tr: { fr: { name: "Barre de son avec caisson de basses", description: "Un son cinéma puissant chez vous.", features: ["Puissance 240W", "Bluetooth 5.0", "HDMI ARC", "Caisson sans fil"] }, en: { name: "Soundbar with Subwoofer", description: "Powerful cinema sound at home.", features: ["240W power", "Bluetooth 5.0", "HDMI ARC", "Wireless subwoofer"] } } },
  { id: "p5", name: "يد تحكم لاسلكية Pro", category: "gaming", price: 320, stock: 0, images: [gamepad], description: "يد تحكم مريحة متوافقة مع PC والهاتف.", features: ["لاسلكية 2.4G و Bluetooth", "اهتزاز مزدوج", "بطارية 20 ساعة", "إضاءة LED"], tr: { fr: { name: "Manette sans fil Pro", description: "Manette ergonomique compatible PC et smartphone.", features: ["Sans fil 2.4G et Bluetooth", "Double vibration", "Batterie 20 h", "Éclairage LED"] }, en: { name: "Pro Wireless Controller", description: "Comfortable controller compatible with PC and phone.", features: ["2.4G wireless & Bluetooth", "Dual vibration", "20h battery", "LED lighting"] } } },
  { id: "p6", name: "ساعة ذكية + سماعات لاسلكية", category: "smart", price: 599, stock: 15, images: [smartwatch], description: "طقم ذكي لتتبع اللياقة والاستماع للموسيقى.", features: ["شاشة AMOLED", "مقاومة للماء", "تتبع النبض", "سماعات TWS"], tr: { fr: { name: "Montre connectée + écouteurs sans fil", description: "Kit connecté pour le suivi sportif et la musique.", features: ["Écran AMOLED", "Étanche", "Suivi cardiaque", "Écouteurs TWS"] }, en: { name: "Smartwatch + Wireless Earbuds", description: "Smart kit for fitness tracking and music.", features: ["AMOLED display", "Water resistant", "Heart rate tracking", "TWS earbuds"] } } },
];

const KEY = "techyous-store-v1";
const seedTr = Object.fromEntries(seed.map((p) => [p.id, p.tr]));
const initial: State = { products: seed, orders: [], cart: [], cartOpen: false, lang: "ar" };
let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      state = { ...initial, ...JSON.parse(raw), cartOpen: false };
      state.products = state.products.map((p) => (p.tr || !seedTr[p.id] ? p : { ...p, tr: seedTr[p.id] }));
    }
  } catch {}
}
function set(fn: (s: State) => Partial<State>) {
  state = { ...state, ...fn(state) };
  try {
    const { cartOpen, ...persist } = state;
    localStorage.setItem(KEY, JSON.stringify(persist));
  } catch { alert("مساحة التخزين ممتلئة، جرّب صوراً أصغر."); }
  listeners.forEach((l) => l());
}

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => { load(); listeners.add(l); l(); return () => listeners.delete(l); },
    () => { load(); return sel(state); },
    () => sel(initial),
  );
}

const uid = () => Math.random().toString(36).slice(2, 9);

export const actions = {
  setLang: (lang: State["lang"]) => set(() => ({ lang })),
  setCartOpen: (cartOpen: boolean) => set(() => ({ cartOpen })),
  addToCart: (productId: string) => set((s) => {
    const ex = s.cart.find((c) => c.productId === productId);
    return { cartOpen: true, cart: ex ? s.cart.map((c) => c.productId === productId ? { ...c, qty: c.qty + 1 } : c) : [...s.cart, { productId, qty: 1 }] };
  }),
  setQty: (productId: string, qty: number) => set((s) => ({
    cart: qty <= 0 ? s.cart.filter((c) => c.productId !== productId) : s.cart.map((c) => c.productId === productId ? { ...c, qty } : c),
  })),
  placeOrder: (customer: Order["customer"], cityId: string) => {
    const id = "TY-" + Date.now().toString().slice(-6);
    set((s) => {
      const items = s.cart.map((c) => { const p = s.products.find((x) => x.id === c.productId)!; return { productId: p.id, name: p.name, price: p.price, qty: c.qty }; }).filter(Boolean);
      const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
      const shipping = shippingFor(cityId);
      return {
        orders: [{ id, createdAt: Date.now(), status: "pending", subtotal, shipping, total: subtotal + shipping, customer, items }, ...s.orders],
        products: s.products.map((p) => { const it = items.find((i) => i.productId === p.id); return it ? { ...p, stock: Math.max(0, p.stock - it.qty) } : p; }),
        cart: [],
      };
    });
    return id;
  },
  saveProduct: (p: Omit<Product, "id"> & { id?: string }) => set((s) => p.id
    ? { products: s.products.map((x) => x.id === p.id ? (p as Product) : x) }
    : { products: [{ ...p, id: uid() }, ...s.products] }),
  deleteProduct: (id: string) => set((s) => ({ products: s.products.filter((p) => p.id !== id), cart: s.cart.filter((c) => c.productId !== id) })),
  setOrderStatus: (id: string, status: OrderStatus) => set((s) => ({ orders: s.orders.map((o) => o.id === id ? { ...o, status } : o) })),
  deleteOrder: (id: string) => set((s) => ({ orders: s.orders.filter((o) => o.id !== id) })),
};

export const formatMAD = (n: number) => `${n.toLocaleString("fr-MA")} درهم`;
export const catLabel = (id: string) => CATEGORIES.find((c) => c.id === normalizeCategory(id))?.label ?? id;
export const stockInfo = (n: number) => n === 0 ? { label: "نفد المخزون", cls: "bg-destructive/20 text-destructive" } : n <= 5 ? { label: `مخزون محدود (${n})`, cls: "bg-warning/20 text-warning" } : { label: "متوفر", cls: "bg-success/20 text-success" };

export async function fileToDataUrl(file: File, max = 800): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = url; });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = img.width * scale; c.height = img.height * scale;
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  URL.revokeObjectURL(url);
  return c.toDataURL("image/jpeg", 0.8);
}
