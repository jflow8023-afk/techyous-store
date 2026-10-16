import { createServerFn } from "@tanstack/react-start";

type Fields = { name: string; description: string; features: string[] };
export type Translations = { ar: Fields; fr: Fields; en: Fields };

const fieldsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "description", "features"],
  properties: { name: { type: "string" }, description: { type: "string" }, features: { type: "array", items: { type: "string" } } },
};

export const translateProduct = createServerFn({ method: "POST" })
  .inputValidator((d: Fields) => ({
    name: String(d.name ?? "").slice(0, 300),
    description: String(d.description ?? "").slice(0, 4000),
    features: (Array.isArray(d.features) ? d.features : []).slice(0, 40).map((f) => String(f).slice(0, 300)),
  }))
  .handler(async ({ data }): Promise<{ ok: true; tr: Translations } | { ok: false; error: string }> => {
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) return { ok: false, error: "missing key" };
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key, Authorization: `Bearer ${key}`, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        instructions: "You translate electronics store product listings into Arabic (Modern Standard, natural for Morocco), French and English. Keep brand names, model numbers and units (4K, HDMI, USB-C, GB, W) unchanged. Keep the same number and order of features. If the source is already in a target language, polish it lightly.",
        input: JSON.stringify(data),
        text: { format: { type: "json_schema", name: "translations", strict: true, schema: { type: "object", additionalProperties: false, required: ["ar", "fr", "en"], properties: { ar: fieldsSchema, fr: fieldsSchema, en: fieldsSchema } } } },
      }),
    });
    if (!res.ok || !res.body) {
      const msg = await res.text().catch(() => "");
      return { ok: false, error: `${res.status} ${msg.slice(0, 200)}` };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", out = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        try {
          const ev = JSON.parse(line.slice(5).trim());
          if (ev.type === "response.output_text.delta") out += ev.delta;
          if (ev.type === "error" || ev.type === "response.failed") return { ok: false, error: "translation failed" };
        } catch {}
      }
    }
    try { return { ok: true, tr: JSON.parse(out) as Translations }; } catch { return { ok: false, error: "bad output" }; }
  });
