import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { actions, type Product } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function useStock() {
  const { t } = useT();
  return (n: number) => n === 0 ? { label: t("outStock"), cls: "bg-destructive/20 text-destructive" } : n <= 5 ? { label: `${t("lowStock")} (${n})`, cls: "bg-warning/20 text-warning" } : { label: t("inStock"), cls: "bg-success/20 text-success" };
}

export function ProductCard({ p }: { p: Product }) {
  const { t, money, cat, pt } = useT();
  const name = pt(p).name;
  const s = useStock()(p.stock);
  return (
    <div className="product-card group flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card transition motion-safe:hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow">
      <Link to="/product/$id" params={{ id: p.id }} className="relative block aspect-square overflow-hidden bg-secondary">
        <img src={p.images[0]} alt={name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-2 top-2 flex flex-col items-start gap-1">
          <span className="max-w-full rounded-full bg-background/90 px-2 py-1 text-[11px] font-semibold text-accent-foreground">{cat(p.category)}</span>
          <span className={`max-w-full rounded-full px-2 py-1 text-[11px] font-bold backdrop-blur ${s.cls}`}>{s.label}</span>
        </div>
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-2.5 sm:p-4">
        <Link to="/product/$id" params={{ id: p.id }} className="line-clamp-2 min-h-12 break-words text-sm font-semibold leading-relaxed hover:text-primary sm:text-base">{name}</Link>
        <div className="mt-auto grid min-w-0 gap-2 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <span className="min-w-0 break-words text-base font-black sm:text-lg">{money(p.price)}</span>
          <Button disabled={p.stock === 0} onClick={() => actions.addToCart(p.id)} className="h-10 gap-1.5 px-2 text-sm" aria-label={`${t("addToCart")} — ${name}`}>
            <ShoppingCart className="h-4 w-4" /> {t("add")}
          </Button>
        </div>
      </div>
    </div>
  );
}
