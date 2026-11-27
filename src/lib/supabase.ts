import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || "https://cpimymezvuzrojepfwmv.supabase.co";
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_GZUPWac-nhXiJ3LUncP7PA_1Lq9HZDO";

export const ADMIN_EMAIL = "jflow8023@gmail.com";
export const supabase = createClient(url, publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export async function isStoreAdmin() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return false;
  return data.user.email.toLowerCase() === ADMIN_EMAIL;
}

export async function sendAdminSignInLink(email: string) {
  if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
    throw new Error("هذا البريد غير مصرح له بالدخول إلى لوحة الإدارة.");
  }
  const { error } = await supabase.auth.signInWithOtp({
    email: ADMIN_EMAIL,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/admin`,
    },
  });
  if (error) throw error;
}

export async function signOutAdmin() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
