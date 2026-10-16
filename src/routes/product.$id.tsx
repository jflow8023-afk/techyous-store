import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronRight, ShoppingCart, Truck } from "lucide-react";
import { Header } from "@/components/Header";
import { actions, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { useStock } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "تفاصيل المنتج | TechYous" },
      { name: "description", content: "مواصفات المنتج والسعر بالدرهم مع الدفع عند الاستلام." },
      { property: "og:title", content: "تفاصيل المنتج | TechYous" },
      { property: "og:description", content: "مواصفات المنتج والسعر بالدرهم مع الدفع عند الاستلام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const p = useStore((s) => s.products.find((x) => x.id === id));
  const [img, setImg] = useState(0);
  const { t, money, cat, pt } = useT();
  const stock = useStock();
  if (!p) return (<><Header /><p className="py-20 text-center text-muted-foreground">{t("notFound")} <Link to="/" className="text-primary">{t("back")}</Link></p></>);
  const s = stock(p.stock);
  const L = pt(p);
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ChevronRight className="h-4 w-4 ltr:rotate-180" /> {t("back")}</Link>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="min-w-0">
            <div className="aspect-square overflow-hidden rounded-2xl border bg-card"><img src={p.images[img] ?? p.images[0]} alt={L.name} className="h-full w-full object-cover" /></div>
            {p.images.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto">{p.images.map((src, i) => (
              <Button variant="ghost" aria-label={`${L.name} — ${i + 1}`} aria-pressed={i === img} key={i} onClick={() => setImg(i)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 p-0 ${i === img ? "border-primary" : "border-transparent"}`}><img src={src} alt="" className="h-full w-full object-cover" /></Button>
            ))}</div>}
          </div>
          <div className="min-w-0 space-y-5 break-words">
            <span className="text-sm font-semibold text-primary">{cat(p.category)}</span>
            <h1 className="font-display text-2xl font-black sm:text-3xl">{L.name}</h1>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex"><span className="min-w-0 text-2xl font-black text-primary sm:text-3xl">{money(p.price)}</span><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span></div>
            <p className="leading-relaxed text-muted-foreground">{L.description}</p>
            {L.features.length > 0 && <div className="rounded-2xl border bg-card p-4"><h2 className="mb-3 font-bold">{t("features")}</h2><ul className="space-y-2">{L.features.map((f) => <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{f}</li>)}</ul></div>}
            <Button disabled={p.stock === 0} onClick={() => actions.addToCart(p.id)} className="h-auto min-h-12 w-full whitespace-normal py-3 text-lg"><ShoppingCart className="h-5 w-5" /> {t("addToCart")}</Button>
            <p className="flex items-center gap-2 text-sm text-muted-foreground"><Truck className="h-4 w-4 shrink-0 text-primary" /> {t("codLine")}</p>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
