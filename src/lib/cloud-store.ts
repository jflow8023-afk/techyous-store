import { supabase, isStoreAdmin } from "./supabase";
import type { Product, Order, OrderStatus } from "./store";

type DbProduct = {
  id: string; name: string; category: string; price: number; stock: number;
  images: string[]; description: string; features: string[]; translations: Product["tr"] | null;
  active: boolean;
};
type DbOrder = {
  id: string; created_at: string; status: OrderStatus; subtotal: number; shipping: number;
  total: number; customer: Order["customer"]; items: Order["items"];
};

const toProduct = (p: DbProduct): Product => ({
  id:p.id,name:p.name,category:p.category,price:Number(p.price),stock:Number(p.stock),
  images:p.images ?? [],description:p.description ?? "",features:p.features ?? [],tr:p.translations ?? undefined,
});
const toOrder = (o: DbOrder): Order => ({
  id:o.id,createdAt:new Date(o.created_at).getTime(),status:o.status,total:Number(o.total),
  subtotal:Number(o.subtotal),shipping:Number(o.shipping),customer:o.customer,items:o.items,
});
const fromProduct = (p: Product): DbProduct => ({
  id:p.id,name:p.name,category:p.category,price:p.price,stock:p.stock,images:p.images,
  description:p.description,features:p.features,translations:p.tr ?? {},active:true,
});

async function uploadImage(src: string, index: number) {
  const isLocalAsset = src.startsWith("/") || src.startsWith("data:");
  if (!isLocalAsset) return src;
  const response = await fetch(src);
  const blob = await response.blob();
  const ext = blob.type === "image/png" ? "png" : blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${crypto.randomUUID()}-${index}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, blob, {
    contentType: blob.type || "image/jpeg", upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

export async function migrateLocalProductsIfCloudIsEmpty(localProducts: Product[]) {
  if (!(await isStoreAdmin())) return;
  const { data, error } = await supabase.from("products").select("id").limit(1);
  if (error) throw error;
  if ((data ?? []).length) return;
  for (const product of localProducts) await saveCloudProduct(product);
}

export async function loadCloudProducts() {
  const admin = await isStoreAdmin();
  let query = supabase.from("products").select("*").order("created_at",{ascending:false});
  if (!admin) query = query.eq("active",true);
  const { data,error } = await query;
  if (error) throw error;
  return (data ?? []).map((p) => toProduct(p as DbProduct));
}
export async function loadCloudOrders() {
  if (!(await isStoreAdmin())) return [];
  const { data,error } = await supabase.from("orders").select("*").order("created_at",{ascending:false});
  if (error) throw error;
  return (data ?? []).map((o) => toOrder(o as DbOrder));
}
export async function saveCloudProduct(product: Product) {
  if (!(await isStoreAdmin())) throw new Error("يجب تسجيل الدخول بحساب الإدارة.");
  const images = await Promise.all(product.images.map(uploadImage));
  const { error } = await supabase.from("products").upsert({...fromProduct({...product,images}),images});
  if (error) throw error;
}
export async function deleteCloudProduct(id: string) {
  if (!(await isStoreAdmin())) throw new Error("يجب تسجيل الدخول بحساب الإدارة.");
  const { error } = await supabase.from("products").delete().eq("id",id);
  if (error) throw error;
}
export async function createCloudOrder(order: Order) {
  const { error } = await supabase.from("orders").insert({
    id: order.id,
    status: "pending",
    subtotal: 0,
    shipping: 0,
    total: 0,
    customer: order.customer,
    items: order.items.map((item) => ({ productId: item.productId, qty: item.qty })),
  });
  if (error) throw error;
}
export async function updateCloudOrderStatus(id: string,status: OrderStatus) {
  if (!(await isStoreAdmin())) throw new Error("يجب تسجيل الدخول بحساب الإدارة.");
  const { error } = await supabase.from("orders").update({status}).eq("id",id);
  if (error) throw error;
}
export async function deleteCloudOrder(id: string) {
  if (!(await isStoreAdmin())) throw new Error("يجب تسجيل الدخول بحساب الإدارة.");
  const { error } = await supabase.from("orders").delete().eq("id",id);
  if (error) throw error;
}
