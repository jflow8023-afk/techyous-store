export const CATEGORIES = [
  { id: "tv", label: "تلفزيونات و TV Box" },
  { id: "audio", label: "صوتيات وميكروفونات" },
  { id: "phones", label: "هواتف وحواسيب" },
  { id: "accessories", label: "كوابل وإكسسوارات" },
  { id: "gaming", label: "إكسسوارات الألعاب" },
] as const;

// Keep previously saved products visible without rewriting their stored data.
export function normalizeCategory(id: string): string {
  return ({ tvbox: "tv", mic: "audio", smart: "accessories" } as Record<string, string>)[id] ?? id;
}