import type { OutfitAlternative, OutfitSet } from "~/types/outfit";

export function formatOutfitReasoning(value: string | null | undefined) {
  if (!value) return "Belum ada alasan dari sistem.";

  const trimmed = value.trim();
  if (!looksLikeJsonPayload(trimmed)) return trimmed;

  const parsed = tryParseReasoningJson(trimmed);
  if (parsed) return parsed;

  const extracted = extractReasoningFromMalformedJson(trimmed);
  if (extracted) return extracted;

  return "Sistem memakai kandidat valid pertama karena respons AI tidak bisa diproses sebagai rekomendasi terstruktur.";
}

export function formatMissingGap(
  value: OutfitAlternative["missing_gap"]
): string | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    return value.filter(Boolean).join(", ") || null;
  }

  if (typeof value === "string") {
    const cleaned = value
      .replace(/Warning:\s*/g, "")
      .replace(/LLM/g, "AI")
      .trim();

    return cleaned || null;
  }

  return (
    Object.values(value)
      .filter((item) => typeof item === "string" && item.trim())
      .join(", ") || null
  );
}

export function dedupeOutfitAlternatives(items: OutfitAlternative[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item.candidate_id || getOutfitKey(item.outfit);
    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function looksLikeJsonPayload(value: string) {
  return value.startsWith("{") || value.includes('"recommendations"');
}

function tryParseReasoningJson(value: string) {
  try {
    const parsed = JSON.parse(value) as {
      reasoning?: unknown;
      recommendations?: { reasoning?: unknown }[];
    };

    if (typeof parsed.reasoning === "string") return parsed.reasoning;
    const firstReasoning = parsed.recommendations?.find(
      (item) => typeof item.reasoning === "string"
    )?.reasoning;

    return typeof firstReasoning === "string" ? firstReasoning : null;
  } catch {
    return null;
  }
}

function extractReasoningFromMalformedJson(value: string) {
  const match = value.match(/"reasoning"\s*:\s*"((?:\\.|[^"\\])*)"/);
  if (!match?.[1]) return null;

  return match[1]
    .replace(/\\"/g, '"')
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getOutfitKey(outfit: OutfitSet) {
  return ["top", "bottom", "outer", "footwear"]
    .map((slot) => outfit[slot as keyof OutfitSet]?.id ?? "none")
    .join("|");
}
