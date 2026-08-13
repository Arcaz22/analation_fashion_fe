import { useMemo, useState } from "react";
import { FiEdit3, FiZap } from "react-icons/fi";

import { AppShell } from "~/components/layouts/AppShell";
import { OutfitCard } from "~/components/shared/OutfitCard";
import { useCreateOutfitRecommendation } from "~/hooks/useOutfit";
import {
  dedupeOutfitAlternatives,
  formatMissingGap,
  formatOutfitReasoning,
} from "~/lib/outfitDisplay";
import type {
  OutfitAlternative,
  OutfitOccasion,
  OutfitRecommendation,
} from "~/types/outfit";

const presetOccasions: { label: string; value: OutfitOccasion }[] = [
  { label: "Santai", value: "santai" },
  { label: "Kuliah", value: "kuliah" },
  { label: "Kerja", value: "kerja" },
  { label: "Olahraga", value: "olahraga" },
  { label: "Formal Event", value: "formal-event" },
];

type OccasionMode = "preset" | "custom";

export default function RecommendationsPage() {
  const [occasionMode, setOccasionMode] = useState<OccasionMode>("preset");
  const [occasion, setOccasion] = useState<OutfitOccasion>("kuliah");
  const [customOccasion, setCustomOccasion] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const createRecommendation = useCreateOutfitRecommendation();
  const recommendation = createRecommendation.data?.data;

  const alternatives = useMemo(
    () => normalizeRecommendations(recommendation),
    [recommendation]
  );
  const selected = alternatives[selectedIndex];

  async function handleGenerate() {
    const normalizedOccasion =
      occasionMode === "custom" ? customOccasion.trim() : occasion;

    if (!normalizedOccasion) return;

    setSelectedIndex(0);
    await createRecommendation.mutateAsync({
      occasion: normalizedOccasion,
      top_k: 3,
    });
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-10 md:py-10">
        <div className="mb-7">
          <h1 className="mb-2 text-3xl font-semibold leading-tight text-[#1c1b1b]">
            Rekomendasi Outfit
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-[#747878]">
            Pilih kebutuhan berpakaian, lalu sistem akan mencocokkan profil dan
            koleksi match aktif Anda.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <section className="border border-[#E8E8E4] bg-white p-6">
              <h2 className="mb-5 text-lg font-semibold text-[#1c1b1b]">
                Mau berpakaian untuk acara apa?
              </h2>
              <div className="mb-6 flex flex-wrap gap-2">
                {presetOccasions.map((option) => (
                  <button
                    className={`border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    occasionMode === "preset" && occasion === option.value
                        ? "border-[#1c1b1b] bg-[#1c1b1b] text-white"
                        : "border-[#E8E8E4] text-[#747878] hover:border-[#1c1b1b] hover:text-[#1c1b1b]"
                    }`}
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setOccasionMode("preset");
                      setOccasion(option.value);
                    }}
                  >
                    {option.label}
                  </button>
                ))}
                <button
                  className={`inline-flex items-center gap-2 border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    occasionMode === "custom"
                      ? "border-[#1c1b1b] bg-[#1c1b1b] text-white"
                      : "border-[#E8E8E4] text-[#747878] hover:border-[#1c1b1b] hover:text-[#1c1b1b]"
                  }`}
                  type="button"
                  onClick={() => setOccasionMode("custom")}
                >
                  <FiEdit3 className="size-3.5" aria-hidden="true" />
                  Lainnya
                </button>
              </div>
              {occasionMode === "custom" ? (
                <div className="mb-6">
                  <label
                    className="mb-2 block text-xs font-semibold text-[#1c1b1b]"
                    htmlFor="custom-occasion"
                  >
                    Tulis kebutuhan Anda
                  </label>
                  <input
                    className="h-12 w-full border border-[#E8E8E4] bg-[#FAFAF8] px-4 text-sm text-[#1c1b1b] outline-none transition-colors placeholder:text-[#9b9d9b] focus:border-[#1c1b1b]"
                    id="custom-occasion"
                    maxLength={60}
                    placeholder="Contoh: beach wedding, interview startup"
                    type="text"
                    value={customOccasion}
                    onChange={(event) => setCustomOccasion(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleGenerate();
                      }
                    }}
                  />
                  <p className="mt-2 text-[11px] text-[#747878]">
                    Contoh: beach wedding, interview startup, konser outdoor.
                  </p>
                </div>
              ) : null}
              <button
                className="h-12 w-full bg-[#1c1b1b] px-5 text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={
                  createRecommendation.isPending ||
                  (occasionMode === "custom" && !customOccasion.trim())
                }
                type="button"
                onClick={handleGenerate}
              >
                {!createRecommendation.isPending ? (
                  <FiZap className="mr-2 inline size-4" aria-hidden="true" />
                ) : null}
                {createRecommendation.isPending
                  ? "Menganalisis..."
                  : "Hasilkan Rekomendasi"}
              </button>
            </section>

            {recommendation ? (
              <section className="border border-[#E8E8E4] bg-white p-5">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
                  Kandidat
                </p>
                <p className="text-2xl font-semibold text-[#1c1b1b]">
                  {recommendation.candidate_count}
                </p>
              </section>
            ) : null}
          </aside>

          <section className="min-h-130 border border-[#E8E8E4] bg-[#F6F6F4] p-4 md:p-6">
            {createRecommendation.isPending ? (
              <div className="grid min-h-115 place-items-center text-center">
                <div>
                  <p className="text-sm font-semibold text-[#1c1b1b]">
                    AI sedang menganalisis...
                  </p>
                  <p className="mt-2 text-xs text-[#747878]">
                    Mencocokkan kebutuhan Anda dengan koleksi match.
                  </p>
                </div>
              </div>
            ) : createRecommendation.isError ? (
              <div className="border border-[#f0c8c8] bg-[#fff7f7] p-5">
                <p className="text-sm font-semibold text-[#ba1a1a]">
                  Rekomendasi belum bisa dibuat.
                </p>
                <p className="mt-1 text-sm text-[#747878]">
                  Pastikan profil dan minimal top, bottom, footwear aktif sudah
                  lengkap.
                </p>
              </div>
            ) : selected ? (
              <div className="space-y-5">
                {alternatives.length > 1 ? (
                  <div className="flex gap-2 overflow-x-auto border border-[#E8E8E4] bg-white p-3">
                    {alternatives.map((item, index) => (
                      <button
                        className={`shrink-0 border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] ${
                          selectedIndex === index
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

                <OutfitCard outfit={selected.outfit} />

                <article className="border border-[#E8E8E4] bg-white p-5">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
                    Alasan
                  </p>
                  <p className="text-sm leading-relaxed text-[#1c1b1b]">
                    {formatOutfitReasoning(selected.reasoning)}
                  </p>
                  {formatMissingGap(selected.missing_gap) ? (
                    <p className="mt-3 text-sm text-[#747878]">
                      Gap: {formatMissingGap(selected.missing_gap)}
                    </p>
                  ) : null}
                </article>
              </div>
            ) : (
              <div className="grid min-h-115 place-items-center text-center">
                <div>
                  <p className="mb-2 text-lg font-semibold text-[#1c1b1b]">
                    Belum ada rekomendasi
                  </p>
                  <p className="max-w-sm text-sm leading-relaxed text-[#747878]">
                    Pilih preset atau tulis kebutuhan custom di sebelah kiri,
                    lalu hasilkan rekomendasi.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}

function normalizeRecommendations(
  recommendation: OutfitRecommendation | undefined
): OutfitAlternative[] {
  if (!recommendation) return [];

  return dedupeOutfitAlternatives([
    {
      candidate_id: recommendation.candidate_id,
      outfit: recommendation.outfit,
      reasoning: recommendation.reasoning,
      missing_gap: recommendation.missing_gap,
    },
    ...(recommendation.recommendations ?? []),
  ]);
}
