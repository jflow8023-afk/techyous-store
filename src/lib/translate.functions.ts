import { createServerFn } from "@tanstack/react-start";

type Fields = { name: string; description: string; features: string[]; accessToken: string };
export type Translations = { ar: Fields; fr: Fields; en: Fields };

const fieldsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "description", "features"],
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    features: { type: "array", items: { type: "string" } },
  },
};

const translationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["ar", "fr", "en"],
  properties: { ar: fieldsSchema, fr: fieldsSchema, en: fieldsSchema },
};

export const translateProduct = createServerFn({ method: "POST" })
  .validator((d: Fields) => ({
    name: String(d.name ?? "").slice(0, 300),
    description: String(d.description ?? "").slice(0, 4000),
    features: (Array.isArray(d.features) ? d.features : []).slice(0, 40).map((f) => String(f).slice(0, 300)),
    accessToken: String(d.accessToken ?? ""),
  }))
  .handler(async ({ data }): Promise<{ ok: true; tr: Translations } | { ok: false; error: string }> => {
    // Verify the signed-in store owner before spending AI Gateway credits.
    // An explicit gateway key can also be used for non-Vercel environments.
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseUrl = "https://cpimymezvuzrojepfwmv.supabase.co";
    // Use the project's confirmed legacy anon JWT for server-side getUser.
    // This is a public client key (RLS remains enforced); never use service_role here.
    const supabasePublicKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwaW15bWV6dnV6cm9qZXBmd212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ4MDQ2NDQsImV4cCI6MjExMDM4MDY0NH0.iMBL0znPiPFs7UGrOdUeETvU61HKvn_GyN4Y72Eq62Y";
    if (!data.accessToken) return { ok: false, error: "انتهت جلسة الإدارة. سجّل الدخول مجدداً." };
    const authClient = createClient(supabaseUrl, supabasePublicKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: authData, error: authError } = await authClient.auth.getUser(data.accessToken);
    if (authError) {
      console.error("Product translation owner verification failed:", authError.message);
      return { ok: false, error: "تعذر التحقق من جلسة الإدارة. سجّل الخروج ثم ادخل مجدداً." };
    }
    if (authData.user?.email?.toLowerCase() !== "jflow8023@gmail.com") {
      console.error("Product translation rejected non-owner email:", authData.user?.email ?? "missing email");
      return { ok: false, error: "هذا الحساب ليس بريد صاحب المتجر. اخرج من لوحة الإدارة وادخل ببريد jflow8023@gmail.com." };
    }
    // Free machine-translation fallback: MyMemory. No Vercel AI Gateway,
    // credit card, or paid API key is required. Keep requests small to respect
    // the provider's per-request limit.
    const sourceText = [data.name, data.description, ...data.features].join(" ");
    const hasArabic = /[\\u0600-\\u06FF]/.test(sourceText);
    const frenchHints = /[àâçéèêëîïôùûüÿœ]|\\b(le|la|les|des|une|un|avec|pour|sans|compatible|manette|casque|écouteurs)\\b/i.test(sourceText);
    const sourceLang = hasArabic ? "ar" : frenchHints ? "fr" : "en";

    const splitForProvider = (value: string): string[] => {
      const words = value.trim().split(/\\s+/);
      const chunks: string[] = [];
      let current = "";
      for (const word of words) {
        const candidate = current ? current + " " + word : word;
        if (new TextEncoder().encode(candidate).length > 420 && current) {
          chunks.push(current);
          current = word;
        } else {
          current = candidate;
        }
      }
      if (current) chunks.push(current);
      return chunks.length ? chunks : [""];
    };

    const translateText = async (value: string, target: "ar" | "fr" | "en"): Promise<string> => {
      if (!value.trim() || target === sourceLang) return value;
      const chunks = splitForProvider(value);
      const translated: string[] = [];
      for (const chunk of chunks) {
        const params = new URLSearchParams({
          q: chunk,
          langpair: `${sourceLang}|${target}`,
        });
        const response = await fetch(`https://api.mymemory.translated.net/get?${params.toString()}`, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error(`MyMemory HTTP ${response.status}`);
        const body = await response.json() as {
          responseStatus?: number;
          responseDetails?: string;
          responseData?: { translatedText?: string };
        };
        if (Number(body.responseStatus) !== 200 || typeof body.responseData?.translatedText !== "string") {
          throw new Error(body.responseDetails || "تعذرت خدمة الترجمة المجانية أو انتهى حدها اليومي.");
        }
        translated.push(body.responseData.translatedText);
      }
      return translated.join(" ");
    };

    try {
      const tr = {} as Translations;
      for (const target of ["ar", "fr", "en"] as const) {
        tr[target] = {
          name: await translateText(data.name, target),
          description: await translateText(data.description, target),
          features: await Promise.all(data.features.map((feature) => translateText(feature, target))),
          accessToken: data.accessToken,
        };
      }
      return { ok: true, tr };
    } catch (error) {
      console.error("MyMemory product translation failed:", error);
      return { ok: false, error: error instanceof Error ? `تعذرت خدمة الترجمة المجانية: ${error.message}` : "تعذرت خدمة الترجمة المجانية. حاول لاحقاً." };
    }
  });
