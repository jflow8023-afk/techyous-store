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
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://cpimymezvuzrojepfwmv.supabase.co";
    // Keep the server-side verifier on the exact same Supabase project/key
    // configuration used by the browser client.
    const supabasePublicKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_GZUPWac-nhXiJ3LUncP7PA_1Lq9HZDO";
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
    // Vercel Functions expose the OIDC token on the incoming request context,
    // not necessarily through process.env. Resolve it with Vercel's runtime helper.
    let token = process.env.AI_GATEWAY_API_KEY;
    if (!token) {
      try {
        const { getVercelOidcToken } = await import("@vercel/oidc");
        token = await getVercelOidcToken();
      } catch (error) {
        console.error("Unable to obtain Vercel OIDC token for AI Gateway:", error);
        return { ok: false, error: "تعذر الاتصال بخدمة الترجمة حالياً. حاول مرة أخرى بعد قليل." };
      }
    }
    if (!token) return { ok: false, error: "خدمة الترجمة غير مهيأة على الخادم." };

    try {
      const res = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-5-mini",
          messages: [
            {
              role: "system",
              content: "You translate electronics store product listings into Arabic (clear Modern Standard Arabic suitable for Morocco), French, and English. Return only valid JSON matching the requested schema. Keep brand names, model numbers, and technical units such as 4K, HDMI, USB-C, GB, and W unchanged. Preserve the exact number and order of features. Do not invent specifications, warranties, compatibility, or claims. If the source is already in a target language, translate faithfully and polish lightly.",
            },
            { role: "user", content: JSON.stringify(data) },
          ],
          response_format: {
            type: "json_schema",
            json_schema: { name: "product_translations", strict: true, schema: translationSchema },
          },
          max_completion_tokens: 2200,
        }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        console.error("Product translation gateway error:", res.status, msg.slice(0, 300));
        return { ok: false, error: `Translation service returned ${res.status}` };
      }

      const payload = await res.json() as {
        choices?: Array<{ message?: { content?: string | null } }>;
      };
      const content = payload.choices?.[0]?.message?.content;
      if (!content) return { ok: false, error: "Translation service returned an empty response" };

      const parsed = JSON.parse(content) as Translations;
      for (const lang of ["ar", "fr", "en"] as const) {
        const item = parsed[lang];
        if (!item || typeof item.name !== "string" || typeof item.description !== "string" ||
          !Array.isArray(item.features) || item.features.some((x) => typeof x !== "string")) {
          return { ok: false, error: "Translation response did not match the product schema" };
        }
      }
      return { ok: true, tr: parsed };
    } catch (error) {
      console.error("Product translation failed:", error);
      return { ok: false, error: "Translation request failed" };
    }
  });
