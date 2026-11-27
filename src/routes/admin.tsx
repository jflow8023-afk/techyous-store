import { translateProduct } from "@/lib/translate.functions";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart3, Package, ShoppingBag, LogOut, Plus, Pencil, Trash2, X, Lock, Phone, MapPin } from "lucide-react";
import { actions, CATEGORIES, catLabel, fileToDataUrl, formatMAD, useStore, type OrderStatus, type Product } from "@/lib/store";
import { normalizeCategory } from "@/lib/categories";
import { supabase, isStoreAdmin, sendAdminSignInLink, signOutAdmin } from "@/lib/supabase";
import { refreshCloudData } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة التحكم | TechYous" },
      { name: "description", content: "إدارة المنتجات والطلبات وإحصائيات متجر TechYous." },
      { property: "og:title", content: "لوحة التحكم | TechYous" },
      { property: "og:description", content: "إدارة المنتجات والطلبات وإحصائيات متجر TechYous." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const STATUS: Record<OrderStatus, { label: string; cls: string }> = {
  pending: { label: "قيد الانتظار", cls: "bg-warning/20 text-warning" },
  shipped: { label: "تم الشحن", cls: "bg-primary/20 text-primary" },
  delivered: { label: "تم التوصيل", cls: "bg-success/20 text-success" },
};

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  useEffect(() => {
    let alive = true;
    const check = async () => {
      const ok = await isStoreAdmin();
      if (alive) {
        setAuthed(ok);
        setChecking(false);
        if (ok) await refreshCloudData();
      }
    };
    void check();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const ok = session?.user?.email?.toLowerCase() === "jflow8023@gmail.com";
      setAuthed(ok);
      if (ok) window.setTimeout(() => { void refreshCloudData(); }, 0);
    });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);
  if (checking) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">جارٍ التحقق من الدخول...</div>;
  if (!authed) return <AdminLogin />;
  return <Dashboard onLogout={async () => { await signOutAdmin(); setAuthed(false); }} />;
}

function AdminLogin() {
  const [email, setEmail] = useState("jflow8023@gmail.com");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-glow px-4">
      <form onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setErr("");
        try { await sendAdminSignInLink(email); setSent(true); }
        catch (error) { setErr(error instanceof Error ? error.message : "تعذر إرسال رابط الدخول."); }
        finally { setBusy(false); }
      }} className="w-full max-w-sm rounded-2xl border bg-card p-6 text-center shadow-glow">
        <Lock className="mx-auto h-10 w-10 text-primary" />
        <h1 className="mt-3 text-xl font-bold">دخول المسؤول</h1>
        <p className="mt-1 text-sm text-muted-foreground">سنرسل رابط دخول آمن إلى بريد صاحب المتجر</p>
        <input required type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field mt-5 text-center" />
        {sent && <p className="mt-3 text-sm text-success">تم إرسال رابط الدخول. افتح بريدك واضغط على الرابط للمتابعة.</p>}
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
        <button disabled={busy} className="btn-primary mt-4 w-full py-3 disabled:opacity-60">{busy ? "جارٍ الإرسال..." : "إرسال رابط الدخول"}</button>
        <Link to="/" className="mt-5 inline-block text-sm text-muted-foreground hover:text-primary">العودة للمتجر</Link>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"stats" | "products" | "orders">("stats");
  const tabs = [
    { id: "stats", label: "الإحصائيات", icon: BarChart3 },
    { id: "products", label: "المنتجات", icon: Package },
    { id: "orders", label: "الطلبات", icon: ShoppingBag },
  ] as const;
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:justify-between">
          <Link to="/" className="min-w-0 truncate font-display text-xl font-black" dir="ltr">TECH<span className="text-primary">YOUS</span> <span className="text-sm text-muted-foreground">Admin</span></Link>
          <button onClick={onLogout} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm hover:bg-secondary"><LogOut className="h-4 w-4" /> خروج</button>
        </div>
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3">
          {tabs.map((t) => <button key={t.id} onClick={() => setTab(t.id)} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${tab === t.id ? "bg-primary text-primary-foreground" : "bg-secondary"}`}><t.icon className="h-4 w-4" />{t.label}</button>)}
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{tab === "stats" ? <Stats /> : tab === "products" ? <Products /> : <Orders />}</main>
    </div>
  );
}

function Stats() {
  const orders = useStore((s) => s.orders);
  const products = useStore((s) => s.products);
  const sales = orders.reduce((a, o) => a + o.total, 0);
  const counts = new Map<string, { name: string; qty: number; rev: number }>();
  orders.forEach((o) => o.items.forEach((i) => { const c = counts.get(i.productId) ?? { name: i.name, qty: 0, rev: 0 }; c.qty += i.qty; c.rev += i.qty * i.price; counts.set(i.productId, c); }));
  const top = [...counts.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  const cards = [
    { label: "إجمالي المبيعات", value: formatMAD(sales) },
    { label: "عدد الطلبات", value: orders.length },
    { label: "قيد الانتظار", value: orders.filter((o) => o.status === "pending").length },
    { label: "عدد المنتجات", value: products.length },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{cards.map((c) => <div key={c.label} className="rounded-2xl border bg-card p-4"><p className="text-sm text-muted-foreground">{c.label}</p><p className="mt-2 text-xl font-black text-primary sm:text-2xl">{c.value}</p></div>)}</div>
      <div className="rounded-2xl border bg-card p-4">
        <h2 className="mb-4 font-bold">المنتجات الأكثر مبيعاً</h2>
        {top.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد مبيعات بعد</p> : <div className="space-y-3">{top.map((t) => (
          <div key={t.name}><div className="mb-1 flex justify-between gap-2 text-sm"><span className="truncate">{t.name}</span><span className="shrink-0 text-muted-foreground">{t.qty} قطعة · {formatMAD(t.rev)}</span></div>
            <div className="h-2 rounded-full bg-secondary"><div className="h-2 rounded-full bg-primary" style={{ width: `${(t.qty / (top[0]?.qty || 1)) * 100}%` }} /></div></div>
        ))}</div>}
      </div>
    </div>
  );
}

function Products() {
  const products = useStore((s) => s.products);
  const [edit, setEdit] = useState<Partial<Product> | null>(null);
  return (
    <div>
      <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">المنتجات ({products.length})</h2>
        <button onClick={() => setEdit({ name: "", category: "tv", price: 0, stock: 10, images: [], description: "", features: [] })} className="btn-primary flex items-center gap-1.5 px-4 py-2"><Plus className="h-4 w-4" /> منتج جديد</button></div>
      <div className="space-y-2">{products.map((p) => (
        <div key={p.id} className="flex items-center gap-3 rounded-xl border bg-card p-3">
          <img src={p.images[0]} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{catLabel(p.category)} · المخزون: {p.stock}</p></div>
          <span className="hidden font-bold text-primary sm:block">{formatMAD(p.price)}</span>
          <button onClick={() => setEdit(p)} className="rounded-lg bg-secondary p-2"><Pencil className="h-4 w-4" /></button>
          <button onClick={async () => { if (!confirm("حذف هذا المنتج؟")) return; try { await actions.deleteProduct(p.id); } catch (error) { alert(error instanceof Error ? error.message : "تعذر حذف المنتج"); } }} className="rounded-lg bg-secondary p-2 text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}</div>
      {edit && <ProductForm initial={edit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function ProductForm({ initial, onClose }: { initial: Partial<Product>; onClose: () => void }) {
  const [p, setP] = useState({ ...initial, category: normalizeCategory(initial.category ?? "tv") });
  const [feat, setFeat] = useState((initial.features ?? []).join("\n"));
  const [busy, setBusy] = useState(false);
  const [translations, setTranslations] = useState<Product["tr"]>(initial.tr ?? {});
  const [translationError, setTranslationError] = useState("");
  const upload = async (files: FileList | null) => {
    if (!files) return;
    const urls = await Promise.all([...files].map((f) => fileToDataUrl(f)));
    setP((x) => ({ ...x, images: [...(x.images ?? []), ...urls] }));
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm sm:items-center sm:p-4">
      <form onSubmit={async (e) => {
          e.preventDefault();
          if (!p.images?.length) return alert("أضف صورة واحدة على الأقل");
          const features = feat.split("\n").map((s) => s.trim()).filter(Boolean);
          setBusy(true);
          try {
            let tr = translations;
            const complete = (["ar", "fr", "en"] as const).every((lang) => Boolean(tr?.[lang]?.name?.trim() && tr?.[lang]?.description?.trim() && Array.isArray(tr?.[lang]?.features)));
            if (!complete) {
              const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
              if (sessionError || !sessionData.session?.access_token) {
                setTranslationError("انتهت جلسة الإدارة. سجّل الدخول مجدداً ثم أعد المحاولة.");
                return;
              }
              const r = await translateProduct({ data: {
                name: p.name ?? "",
                description: p.description ?? "",
                features,
                accessToken: sessionData.session.access_token,
              } });
              if (!r.ok) {
                setTranslationError(r.error);
                return;
              }
              tr = r.tr;
              setTranslations(tr);
            }
            setTranslationError("");
            await actions.saveProduct({ ...(p as Product), features, tr });
            onClose();
          } catch (error) {
            alert(error instanceof Error ? "تعذرت ترجمة المنتج أو حفظه: " + error.message : "تعذرت ترجمة المنتج أو حفظه. حاول مرة أخرى.");
          } finally { setBusy(false); }
        }}
        className="max-h-[92vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-t-2xl border bg-popover p-5 sm:rounded-2xl">
        <div className="flex items-center justify-between"><h3 className="text-lg font-bold">{p.id ? "تعديل المنتج" : "منتج جديد"}</h3><button type="button" onClick={onClose}><X className="h-5 w-5" /></button></div>
        <input required placeholder="اسم المنتج" value={p.name} onChange={(e) => { setP({ ...p, name: e.target.value }); setTranslations({}); }} className="input-field" />
        <div className="grid grid-cols-3 gap-2">
          <select value={p.category} onChange={(e) => setP({ ...p, category: e.target.value })} className="input-field col-span-3 sm:col-span-1">{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select>
          <label className="col-span-3 text-xs sm:col-span-1">السعر (درهم)<input required type="number" min={0} value={p.price} onChange={(e) => setP({ ...p, price: +e.target.value })} className="input-field" /></label>
          <label className="col-span-3 text-xs sm:col-span-1">المخزون<input required type="number" min={0} value={p.stock} onChange={(e) => setP({ ...p, stock: +e.target.value })} className="input-field" /></label>
        </div>
        <textarea placeholder="الوصف" rows={2} value={p.description} onChange={(e) => { setP({ ...p, description: e.target.value }); setTranslations({}); }} className="input-field" />
        <textarea placeholder="المميزات (ميزة في كل سطر)" rows={3} value={feat} onChange={(e) => { setFeat(e.target.value); setTranslations({}); }} className="input-field" />
        <div>
          <div className="flex flex-wrap gap-2">{p.images?.map((src, i) => (
            <div key={i} className="relative"><img src={src} alt="" className="h-16 w-16 rounded-lg object-cover" />
              <button type="button" onClick={() => setP({ ...p, images: p.images!.filter((_, j) => j !== i) })} className="absolute -left-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"><X className="h-3 w-3" /></button></div>
          ))}
            <label className="grid h-16 w-16 cursor-pointer place-items-center rounded-lg border border-dashed text-muted-foreground hover:border-primary"><Plus className="h-5 w-5" /><input type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} /></label>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">أدخل الترجمات يدوياً للغات الثلاث، أو اتركها فارغة ليتم توليدها تلقائياً عند الحفظ. لن يتم حفظ المنتج قبل اكتمال الترجمات.</p>
        {(["ar", "fr", "en"] as const).map((lang) => (
          <fieldset key={lang} className="space-y-2 rounded-xl border p-3">
            <legend className="px-2 font-bold">{lang === "ar" ? "العربية" : lang === "fr" ? "Français" : "English"}</legend>
            <input className="input-field" placeholder="اسم المنتج" value={translations?.[lang]?.name ?? ""} onChange={(e) => setTranslations((old) => ({ ...old, [lang]: { name: e.target.value, description: old?.[lang]?.description ?? "", features: old?.[lang]?.features ?? [] } }))} />
            <textarea className="input-field" rows={2} placeholder="الوصف" value={translations?.[lang]?.description ?? ""} onChange={(e) => setTranslations((old) => ({ ...old, [lang]: { name: old?.[lang]?.name ?? "", description: e.target.value, features: old?.[lang]?.features ?? [] } }))} />
            <textarea className="input-field" rows={2} placeholder="المميزات (كل ميزة في سطر)" value={(translations?.[lang]?.features ?? []).join("\n")} onChange={(e) => setTranslations((old) => ({ ...old, [lang]: { name: old?.[lang]?.name ?? "", description: old?.[lang]?.description ?? "", features: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) } }))} />
          </fieldset>
        ))}
        {translationError && <p className="text-sm text-destructive">تعذرت الترجمة التلقائية: {translationError}. يمكنك كتابة أسماء المنتجات باللغات الثلاث أعلاه ثم الضغط على حفظ.</p>}
        <button type="submit" disabled={busy} className="btn-primary w-full py-3 disabled:opacity-60">{busy ? "جارٍ الترجمة والحفظ..." : "حفظ"}</button>
      </form>
    </div>
  );
}

function Orders() {
  const orders = useStore((s) => s.orders);
  const [f, setF] = useState<"all" | OrderStatus>("all");
  const list = orders.filter((o) => f === "all" || o.status === f);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2"><h2 className="me-auto text-lg font-bold">الطلبات ({orders.length})</h2>
        {(["all", "pending", "shipped", "delivered"] as const).map((s) => <button key={s} onClick={() => setF(s)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${f === s ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{s === "all" ? "الكل" : STATUS[s].label}</button>)}</div>
      {list.length === 0 ? <p className="py-16 text-center text-muted-foreground">لا توجد طلبات</p> : <div className="grid gap-3 md:grid-cols-2">{list.map((o) => (
        <div key={o.id} className="space-y-3 rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between gap-2"><span className="font-bold text-primary" dir="ltr">{o.id}</span><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS[o.status].cls}`}>{STATUS[o.status].label}</span></div>
          <div className="space-y-1 text-sm">
            <p className="font-semibold">{o.customer.name}</p>
            <a href={`tel:${o.customer.phone}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-primary"><Phone className="h-3.5 w-3.5" /><span dir="ltr">{o.customer.phone}</span></a>
            <p className="flex items-start gap-1.5 break-words text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="min-w-0">{o.customer.city} - {o.customer.address}</span></p>
          </div>
          <ul className="space-y-1 border-t pt-2 text-sm">{o.items.map((i) => <li key={i.productId} className="flex justify-between gap-2"><span className="truncate">{i.qty}× {i.name}</span><span className="shrink-0">{formatMAD(i.price * i.qty)}</span></li>)}</ul>
          <div className="grid min-w-0 gap-2 border-t pt-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
            <span className="font-black">{formatMAD(o.total)}{o.shipping != null && <span className="ms-1 text-xs font-normal text-muted-foreground">(توصيل {o.shipping})</span>}</span>
            <div className="flex min-w-0 items-center gap-2">
              <select value={o.status} onChange={async (e) => { try { await actions.setOrderStatus(o.id, e.target.value as OrderStatus); } catch (error) { alert(error instanceof Error ? error.message : "تعذر تحديث الطلب"); } }} className="input-field w-auto py-1.5 text-sm">{(Object.keys(STATUS) as OrderStatus[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}</select>
              <button onClick={async () => { if (!confirm("حذف الطلب؟")) return; try { await actions.deleteOrder(o.id); } catch (error) { alert(error instanceof Error ? error.message : "تعذر حذف الطلب"); } }} className="p-1.5 text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString("ar-MA")} · الدفع عند الاستلام</p>
        </div>
      ))}</div>}
    </div>
  );
}
