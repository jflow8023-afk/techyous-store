import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Truck, ShieldCheck, Headphones } from "lucide-react";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { normalizeCategory } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { WhatsAppFab } from "@/components/WhatsAppFab";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TechYous | متجر الإلكترونيات في المغرب" },
      { name: "description", content: "تلفزيونات ذكية، TV Box، ميكروفونات، صوتيات وإكسسوارات الألعاب. الدفع عند الاستلام في جميع أنحاء المغرب." },
      { property: "og:title", content: "TechYous | متجر الإلكترونيات في المغرب" },
      { property: "og:description", content: "أفضل الإلكترونيات بأسعار بالدرهم مع الدفع عند الاستلام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const products = useStore((s) => s.products);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<"newest" | "asc" | "desc">("newest");
  const { t, cat: catName } = useT();
  const qq = q.toLowerCase();
  const list = useMemo(() => {
    const l = products.filter((p) => (cat === "all" || normalizeCategory(p.category) === cat) && [p.name, ...Object.values(p.tr ?? {}).map((x) => x?.name ?? "")].some((n) => n.toLowerCase().includes(qq)));
    return sort === "asc" ? [...l].sort((a, b) => a.price - b.price) : sort === "desc" ? [...l].sort((a, b) => b.price - a.price) : l;
  }, [products, qq, cat, sort]);

  return (
    <div className="min-h-screen">
      <Header search={q} onSearch={setQ} />
      <section className="bg-glow">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-10 text-center sm:pt-14">
          <h1 className="font-display text-3xl font-black leading-tight sm:text-5xl">{t("heroA")} <span className="text-primary">{t("heroB")}</span></h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("heroSub")}</p>
          <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-primary" /> {t("fast")}</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> {t("quality")}</span>
            <span className="flex items-center gap-1.5"><Headphones className="h-4 w-4 text-primary" /> {t("support")}</span>
          </div>
        </div>
      </section>
      <nav aria-label={t("all")} className="store-categories sticky z-20 border-b bg-background/85 backdrop-blur">
        <div className="category-scroll mx-auto flex max-w-7xl gap-2 overflow-x-auto overscroll-x-contain px-3 py-3 sm:px-4">
          {[{ id: "all" }, ...CATEGORIES].map((c) => (
            <Button key={c.id} aria-pressed={cat === c.id} variant={cat === c.id ? "default" : "secondary"} onClick={() => setCat(c.id)} className="h-10 shrink-0 rounded-full px-4 text-sm font-semibold">{c.id === "all" ? t("all") : catName(c.id)}</Button>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:justify-between">
          <span className="text-sm text-muted-foreground">{list.length}</span>
          <label className="flex min-w-0 items-center gap-2 text-sm">
            <span className="hidden shrink-0 text-muted-foreground sm:inline">{t("sortBy")}</span>
            <select aria-label={t("sortBy")} value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="input-field min-w-0 max-w-52 py-2 text-sm sm:w-auto">
              <option value="newest">{t("newest")}</option>
              <option value="asc">{t("priceAsc")}</option>
              <option value="desc">{t("priceDesc")}</option>
            </select>
          </label>
        </div>
        {list.length === 0 ? <p className="py-20 text-center text-muted-foreground">{t("noResults")}</p> : (
          <div className="product-grid grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {list.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  );
}
