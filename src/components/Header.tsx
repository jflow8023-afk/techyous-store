import { Link } from "@tanstack/react-router";
import { Search, ShoppingCart, ShieldCheck } from "lucide-react";
import { actions, useStore } from "@/lib/store";
import { LANGS, useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

export function Header({ search, onSearch }: { search?: string; onSearch?: (v: string) => void }) {
  const count = useStore((s) => s.cart.reduce((a, c) => a + c.qty, 0));
  const { t, lang, setLang } = useT();
  return (
    <header className={`store-header sticky top-0 z-30 border-b bg-background/85 backdrop-blur-lg ${onSearch ? "store-header-search" : ""}`}>
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-3 px-3 py-3 sm:px-4 lg:flex lg:gap-5">
        <Link to="/" className="min-w-0 truncate font-display text-xl font-black sm:text-2xl lg:shrink-0" dir="ltr">
          TECH<span className="text-primary">YOUS</span>
        </Link>
          {onSearch && (
            <div className="relative order-3 col-span-2 min-w-0 lg:order-none lg:flex-1">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input type="search" aria-label={t("search")} value={search} onChange={(e) => onSearch(e.target.value)} placeholder={t("search")} className="input-field h-11 ps-10" />
            </div>
          )}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:ms-auto">
          <div className="flex rounded-lg bg-secondary p-0.5" dir="ltr">
            {LANGS.map((l) => (
              <Button variant={lang === l ? "default" : "ghost"} size="sm" aria-pressed={lang === l} key={l} onClick={() => setLang(l)} className="h-9 px-2 text-xs font-bold">{l.toUpperCase()}</Button>
            ))}
          </div>
          <Button asChild variant="outline" className="h-10 px-2.5 lg:px-3">
            <Link to="/admin" aria-label={t("admin")} title={t("admin")}>
              <ShieldCheck className="h-4 w-4 text-primary" /> <span className="hidden lg:inline">{t("admin")}</span>
            </Link>
          </Button>
          <Button size="icon" onClick={() => actions.setCartOpen(true)} aria-label={t("cart")} className="relative h-10 w-10 shrink-0">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && <span className="absolute -end-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-destructive px-1 text-xs text-destructive-foreground">{count}</span>}
          </Button>
        </div>
      </div>
    </header>
  );
}
