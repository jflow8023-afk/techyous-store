import { useState } from "react";
import { X, Minus, Plus, Trash2, CheckCircle2, Truck, AlertTriangle, Phone, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actions, CITIES, MIN_ORDER, shippingFor, useStore } from "@/lib/store";
import { useT } from "@/lib/i18n";
import { cartWaText, orderWaText, STORE_PHONE, waLink, type WaOrder } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/BrandIcons";

export function CartDrawer() {
  const open = useStore((s) => s.cartOpen);
  const cart = useStore((s) => s.cart);
  const products = useStore((s) => s.products);
  const { t, lang, money, pt } = useT();
  const [step, setStep] = useState<"cart" | "checkout" | "done">("cart");
  const [orderId, setOrderId] = useState("");
  const [placed, setPlaced] = useState<WaOrder | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", cityId: "casa", address: "" });
  const lines = cart.flatMap((c) => { const p = products.find((p) => p.id === c.productId); return p ? [{ ...c, p }] : []; });
  const subtotal = lines.reduce((a, l) => a + l.p.price * l.qty, 0);
  const shipping = shippingFor(form.cityId);
  const belowMin = subtotal < MIN_ORDER;
  const close = () => { actions.setCartOpen(false); if (step === "done") { setStep("cart"); setPlaced(null); } };
  const phoneOk = /^0[5-7]\d{8}$/.test(form.phone.replace(/\s/g, ""));
  const waItems = () => lines.map((l) => ({ name: pt(l.p).name, price: l.p.price, qty: l.qty }));
  const waCartHref = () => waLink(cartWaText(waItems(), subtotal, lang));

  const MinAlert = () => belowMin ? (
    <div className="flex items-start gap-2 rounded-lg bg-warning/10 p-3 text-xs leading-relaxed text-warning">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {t("minOrder", { n: money(MIN_ORDER - subtotal) })}
    </div>
  ) : null;

  const WaButton = ({ href, label }: { href: string; label: string }) => (
    <Button asChild variant="whatsapp" className="h-auto min-h-12 w-full whitespace-normal py-3">
    <a href={href} target="_blank" rel="noopener noreferrer">
      <WhatsAppIcon className="h-5 w-5 shrink-0" /> <span className="min-w-0 truncate">{label}</span>
    </a>
    </Button>
  );

  return (
    <>
      <div onClick={close} className={`fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside aria-label={t("cart")} aria-hidden={!open} inert={!open} className={`fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col overflow-hidden border-r bg-popover transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-bold">{step === "checkout" ? t("checkout") : step === "done" ? t("done") : t("cart")}</h2>
          <Button variant="ghost" size="icon" onClick={close} aria-label={lang === "ar" ? "إغلاق" : lang === "fr" ? "Fermer" : "Close"}><X /></Button>
        </div>
        {step !== "done" && <div className="shrink-0 space-y-2 border-b px-5 py-4 text-xs text-muted-foreground">
          <p className="flex items-start gap-2 leading-relaxed"><Truck className="h-4 w-4 shrink-0 text-primary" />{t("shipNote")}</p>
          <p className="flex items-start gap-2"><ShoppingBag className="h-4 w-4 shrink-0 text-primary" />{t("minOrderNote")}</p>
        </div>}

        {step === "done" ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <CheckCircle2 className="h-16 w-16 text-success" />
            <p className="text-xl font-bold">{t("thanks")}</p>
            <p className="text-muted-foreground">{t("orderNo")} <b className="text-primary" dir="ltr">{orderId}</b></p>
            <p className="text-sm text-muted-foreground">{t("callSoon")} {t("cod")}.</p>
            {placed && <WaButton href={waLink(orderWaText(placed, lang))} label={t("sendOnWa")} />}
            <p className="text-xs text-muted-foreground">{t("waHint")}</p>
            <a href={STORE_PHONE.tel} dir="ltr" className="flex items-center gap-1.5 text-sm font-bold text-primary"><Phone className="h-4 w-4 shrink-0" /> {STORE_PHONE.local}</a>
            <Button onClick={close} className="mt-2 h-12 w-full max-w-xs">{t("continue")}</Button>
          </div>
        ) : lines.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">{t("empty")}</div>
        ) : step === "cart" ? (
          <>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
              {lines.map((l) => (
                 <div key={l.productId} className="flex gap-4 border-b py-4 last:border-0">
                  <img src={l.p.images[0]} alt={pt(l.p).name} className="h-20 w-20 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold">{pt(l.p).name}</p>
                    <p className="mt-1 font-bold text-primary">{money(l.p.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="outline" size="icon" aria-label={`${t("add")}: ${pt(l.p).name}`} onClick={() => actions.setQty(l.productId, l.qty + 1)} className="h-8 w-8"><Plus /></Button>
                      <span className="w-6 text-center">{l.qty}</span>
                      <Button variant="outline" size="icon" aria-label={`−: ${pt(l.p).name}`} onClick={() => actions.setQty(l.productId, l.qty - 1)} className="h-8 w-8"><Minus /></Button>
                      <Button variant="ghost" size="icon" aria-label={`×: ${pt(l.p).name}`} onClick={() => actions.setQty(l.productId, 0)} className="ms-auto h-8 w-8 text-destructive"><Trash2 /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 border-t p-4">
              <MinAlert />
              <div className="flex justify-between text-lg font-bold"><span>{t("subtotal")}</span><span className="text-primary">{money(subtotal)}</span></div>
              <Button disabled={belowMin} onClick={() => setStep("checkout")} className="h-12 w-full">{t("checkout")}</Button>
              {belowMin ? (
                <Button disabled variant="whatsapp" className="h-12 w-full">
                  <WhatsAppIcon className="h-5 w-5 shrink-0" /> {t("waOrder")}
                </Button>
              ) : (
                <WaButton href={waCartHref()} label={t("waOrder")} />
              )}
            </div>
          </>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col overflow-y-auto" onSubmit={(e) => {
            e.preventDefault(); if (!phoneOk || belowMin) return;
            const city = CITIES.find((c) => c.id === form.cityId);
            if (!city) return;
            const items = waItems();
            const id = actions.placeOrder({ name: form.name, phone: form.phone, city: city.ar, address: form.address }, form.cityId);
            setPlaced({ id, items, subtotal, shipping, total: subtotal + shipping, name: form.name, phone: form.phone, city: city[lang], address: form.address });
            setOrderId(id); setStep("done"); setForm({ ...form, address: "" });
          }}>
            <div className="flex-1 space-y-4 p-4">
              <label className="block space-y-1.5"><span className="text-sm font-semibold">{t("name")}</span><input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" /></label>
              <label className="block space-y-1.5"><span className="text-sm font-semibold">{t("phone")}</span><input required dir="ltr" inputMode="tel" placeholder="06XXXXXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
                {form.phone && !phoneOk && <span className="text-xs text-destructive">{t("phoneErr")}</span>}</label>
              <label className="block space-y-1.5"><span className="text-sm font-semibold">{t("city")}</span>
                <select value={form.cityId} onChange={(e) => setForm({ ...form, cityId: e.target.value })} className="input-field">
                  {CITIES.map((c) => <option key={c.id} value={c.id}>{c[lang]} — {money(shippingFor(c.id))}</option>)}
                </select></label>
              <label className="block space-y-1.5"><span className="text-sm font-semibold">{t("address")}</span><textarea required maxLength={300} rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" /></label>
              <div className="flex items-center gap-3 border-t pt-4">
                <Truck className="h-6 w-6 shrink-0 text-primary" />
                <div className="min-w-0"><p className="font-bold">{t("cod")}</p><p className="text-xs text-muted-foreground">{t("codSub")}</p></div>
              </div>
            </div>
            <div className="space-y-2 border-t p-4">
              <MinAlert />
              <div className="flex justify-between text-sm text-muted-foreground"><span>{t("subtotal")}</span><span>{money(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-muted-foreground"><span>{t("shipping")}</span><span>{money(shipping)}</span></div>
              <div className="flex justify-between text-lg font-bold"><span>{t("total")}</span><span className="text-primary">{money(subtotal + shipping)}</span></div>
              <Button type="submit" disabled={!phoneOk || belowMin} className="h-12 w-full">{t("confirm")}</Button>
              {!belowMin && <WaButton href={waCartHref()} label={t("waOrder")} />}
              <Button variant="ghost" type="button" onClick={() => setStep("cart")} className="w-full text-muted-foreground"><ArrowLeft className="rtl:rotate-180" />{t("backCart")}</Button>
            </div>
          </form>
        )}
      </aside>
    </>
  );
}
