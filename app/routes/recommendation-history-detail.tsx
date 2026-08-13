import { useMemo, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useParams } from "react-router";

import { AppShell } from "~/components/layouts/AppShell";
import { OutfitCard } from "~/components/shared/OutfitCard";
import { useOutfitHistoryItem } from "~/hooks/useOutfit";
import {
  dedupeOutfitAlternatives,
  formatMissingGap,
  formatOutfitReasoning,
} from "~/lib/outfitDisplay";
import type {
  OutfitAlternative,
  OutfitHistoryDetail,
  OutfitRecommendationItem,
  OutfitSet,
} from "~/types/outfit";

export default function RecommendationHistoryDetailPage() {
  const { historyId } = useParams();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const historyQuery = useOutfitHistoryItem(historyId);
  const history = historyQuery.data?.data;
  const alternatives = useMemo(
    () => normalizeHistoryRecommendations(history),
    [history]
  );
  const selected = alternatives[selectedIndex] ?? alternatives[0];
  const missingGap =
    selected?.missing_gap ??
    history?.missing_categories ??
    history?.missing_gap ??
    null;

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-10 md:py-12">
        <Link
          className="mb-6 inline-flex text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878] transition-colors hover:text-[#1c1b1b]"
          to="/profile"
        >
          <FiArrowLeft className="mr-2 size-4" aria-hidden="true" />
          Kembali ke Profile
        </Link>

        {historyQuery.isLoading ? (
          <div className="h-96 animate-pulse bg-white" />
        ) : historyQuery.isError || !history ? (
          <section className="border border-[#E8E8E4] bg-white p-6">
            <p className="text-lg font-semibold text-[#1c1b1b]">
              Detail rekomendasi tidak bisa dimuat.
            </p>
          </section>
        ) : (
          <div className="space-y-6">
            <header className="border-b border-[#E8E8E4] pb-6">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#747878]">
                Detail Rekomendasi
              </p>
              <h1 className="text-3xl font-semibold leading-tight text-[#1c1b1b]">
                {formatOccasion(history.occasion)}
              </h1>
              <p className="mt-2 text-sm text-[#747878]">
                Dibuat {formatDateTime(history.created_at)}
              </p>
            </header>

            {alternatives.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto border border-[#E8E8E4] bg-white p-3">
                {alternatives.map((item, index) => (
                  <button
                    className={`shrink-0 border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                      (selectedIndex === index ||
                        (!alternatives[selectedIndex] && index === 0))
                        ? "border-[#1c1b1b] bg-[#1c1b1b] text-white"
                        : "border-[#E8E8E4] text-[#747878]"
                    }`}
                    key={item.candidate_id ?? item.rank ?? index}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                  >
                    Outfit {index + 1}
                  </button>
                ))}
              </div>
            ) : null}

            <OutfitCard outfit={selected?.outfit ?? toOutfitSet(history)} />

            <article className="border border-[#E8E8E4] bg-white p-5">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
                Alasan
              </p>
              <p className="text-sm leading-relaxed text-[#1c1b1b]">
                {formatOutfitReasoning(selected?.reasoning ?? history.reasoning)}
              </p>
              {formatMissingGap(missingGap) ? (
                <p className="mt-3 text-sm text-[#747878]">
                  Kategori kurang: {formatMissingGap(missingGap)}
                </p>
              ) : null}
            </article>
          </div>
        )}
      </main>
    </AppShell>
  );
}

function normalizeHistoryRecommendations(
  history: OutfitHistoryDetail | null | undefined
): OutfitAlternative[] {
  if (!history) return [];

  return dedupeOutfitAlternatives([
    {
      outfit: toOutfitSet(history),
      reasoning: history.reasoning,
      missing_gap: history.missing_categories ?? history.missing_gap ?? null,
    },
    ...(history.recommendations ?? []),
  ]);
}

function toOutfitSet(history: OutfitHistoryDetail): OutfitSet {
  if (history.outfit) return history.outfit;

  const fallbackOutfit = history.recommendations?.find(
    (item) => item.outfit
  )?.outfit;

  if (fallbackOutfit) return fallbackOutfit;

  const recommendedItems = history.recommended_items ?? {};

  return {
    top: getRecommendedItem(recommendedItems, "top"),
    bottom: getRecommendedItem(recommendedItems, "bottom"),
    outer: getRecommendedItem(recommendedItems, "outer"),
    footwear: getRecommendedItem(recommendedItems, "footwear"),
  };
}

function getRecommendedItem(
  recommendedItems: OutfitHistoryDetail["recommended_items"],
  category: keyof OutfitSet
): OutfitRecommendationItem | null {
  return recommendedItems?.[category] ?? null;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatOccasion(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
