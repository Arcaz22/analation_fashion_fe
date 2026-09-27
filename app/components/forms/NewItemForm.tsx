import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  FiCheck,
  FiEdit3,
  FiImage,
  FiLoader,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router";

import { wardrobeApi } from "~/api/wardrobe";
import { wardrobeKeys, useWardrobeMetadata } from "~/hooks/useWardrobe";
import { getApiErrorMessage } from "~/lib/apiError";
import { showToast } from "~/stores/toastStore";
import type {
  WardrobeCategory,
  WardrobeFormality,
} from "~/types/wardrobe";

const categoryLabels: Record<WardrobeCategory, string> = {
  accessory: "Aksesori",
  bottom: "Bawahan",
  footwear: "Sepatu",
  outer: "Outer",
  top: "Atasan",
};

const defaultCategories: WardrobeCategory[] = [
  "top",
  "bottom",
  "outer",
  "footwear",
  "accessory",
];

const defaultFormalityLevels: WardrobeFormality[] = [
  "casual",
  "smart-casual",
  "formal",
];

const presetOccasionOptions = [
  "santai",
  "kuliah",
  "kerja",
  "olahraga",
  "formal-event",
];

const occasionLabels: Record<string, string> = {
  santai: "Santai",
  kuliah: "Kuliah",
  kerja: "Kerja",
  olahraga: "Olahraga",
  "formal-event": "Formal Event",
};

type DraftStatus =
  | "queued"
  | "analyzing"
  | "ready"
  | "saving"
  | "saved"
  | "error";

interface ItemDraft {
  id: string;
  image: File;
  previewUrl: string;
  category: WardrobeCategory;
  dominantColor: string;
  description: string;
  formality: WardrobeFormality | "";
  occasions: string[];
  customOccasion: string;
  status: DraftStatus;
  error?: string;
}

export function NewItemForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const metadataQuery = useWardrobeMetadata();
  const metadata = metadataQuery.data?.data;
  const categories = metadata?.categories?.length
    ? metadata.categories
    : defaultCategories;
  const formalityLevels = metadata?.formality_levels?.length
    ? metadata.formality_levels
    : defaultFormalityLevels;
  const [drafts, setDrafts] = useState<ItemDraft[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const previewUrlsRef = useRef<string[]>([]);

  const selectedDraft = drafts.find((draft) => draft.id === selectedDraftId);
  const invalidDrafts = drafts.filter((draft) => !isDraftValid(draft));
  const busy = drafts.some(
    (draft) =>
      draft.status === "queued" ||
      draft.status === "analyzing" ||
      draft.status === "saving"
  );
  const saving = drafts.some((draft) => draft.status === "saving");
  const unsavedDrafts = drafts.filter((draft) => draft.status !== "saved");
  const canSubmit = drafts.length > 0 && invalidDrafts.length === 0 && !busy;

  const summary = useMemo(() => {
    const saved = drafts.filter((draft) => draft.status === "saved").length;
    const analyzing = drafts.filter(
      (draft) => draft.status === "queued" || draft.status === "analyzing"
    ).length;
    const errors = drafts.filter((draft) => draft.status === "error").length;

    return { saved, analyzing, errors };
  }, [drafts]);

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((previewUrl) =>
        URL.revokeObjectURL(previewUrl)
      );
      previewUrlsRef.current = [];
    };
  }, []);

  function updateDraft(id: string, patch: Partial<ItemDraft>) {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === id ? { ...draft, ...patch } : draft
      )
    );
  }

  function handleFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setErrorMessage(null);

    if (!files.length) return;

    const nextDrafts = files.map<ItemDraft>((file) => {
      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.push(previewUrl);

      return {
        id: crypto.randomUUID(),
        image: file,
        previewUrl,
        category: "top",
        dominantColor: "",
        description: "",
        formality: "",
        occasions: [],
        customOccasion: "",
        status: "queued",
      };
    });

    setDrafts((current) => [...current, ...nextDrafts]);
    setSelectedDraftId((current) => current ?? nextDrafts[0]?.id ?? null);
    void analyzeDrafts(nextDrafts);
  }

  async function analyzeDrafts(items: ItemDraft[]) {
    await Promise.all(
      items.map(async (draft) => {
        updateDraft(draft.id, { status: "analyzing", error: undefined });

        try {
          const response = await wardrobeApi.analyzeItem(draft.image);
          const result = response.data;

          updateDraft(draft.id, {
            category: result.category,
            dominantColor: result.dominant_color,
            description: result.description,
            status: "ready",
            error: undefined,
          });
        } catch (error) {
          updateDraft(draft.id, {
            status: "error",
            error: getApiErrorMessage(error, "Lengkapi detail secara manual."),
          });
        }
      })
    );
  }

  function removeDraft(id: string) {
    setDrafts((current) => {
      const removed = current.find((draft) => draft.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (previewUrl) => previewUrl !== removed.previewUrl
        );
      }

      const next = current.filter((draft) => draft.id !== id);
      setSelectedDraftId((selected) =>
        selected === id ? next[0]?.id ?? null : selected
      );
      return next;
    });
  }

  function toggleDraftOccasion(id: string, value: string) {
    const draft = drafts.find((item) => item.id === id);
    if (!draft) return;

    updateDraft(id, {
      occasions: draft.occasions.includes(value)
        ? draft.occasions.filter((item) => item !== value)
        : [...draft.occasions, value],
      status: draft.status === "saved" ? "ready" : draft.status,
    });
  }

  async function handleSaveAll() {
    setErrorMessage(null);

    if (!drafts.length) {
      setErrorMessage("Pilih minimal satu foto pakaian.");
      return;
    }

    if (invalidDrafts.length) {
      setErrorMessage("Lengkapi warna dominan pada semua draft sebelum simpan.");
      setSelectedDraftId(invalidDrafts[0].id);
      return;
    }

    const saveResults = await Promise.all(
      unsavedDrafts.map(async (draft) => {
        updateDraft(draft.id, { status: "saving", error: undefined });

        try {
          await wardrobeApi.createItem({
            image: draft.image,
            category: draft.category,
            dominant_color: draft.dominantColor.trim(),
            description: draft.description.trim() || undefined,
            formality_level: draft.formality || undefined,
            occasion_tags: [
              ...new Set([
                ...draft.occasions,
                ...(draft.customOccasion.trim()
                  ? [draft.customOccasion.trim()]
                  : []),
              ]),
            ],
            status: "active",
          });
          updateDraft(draft.id, { status: "saved" });
          return true;
        } catch (error) {
          updateDraft(draft.id, {
            status: "error",
            error: getApiErrorMessage(error),
          });
          return false;
        }
      })
    );
    const savedCount = saveResults.filter(Boolean).length;

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: wardrobeKeys.all }),
      queryClient.invalidateQueries({ queryKey: ["profile", "stats"] }),
    ]);

    if (savedCount === unsavedDrafts.length) {
      showToast({
        type: "success",
        title: "Semua item tersimpan",
        description: `${savedCount} item sudah masuk ke koleksi.`,
      });
      navigate("/catalog");
    } else if (savedCount > 0) {
      showToast({
        type: "info",
        title: "Sebagian item tersimpan",
        description: `${savedCount} item tersimpan. Cek draft yang gagal.`,
      });
    } else {
      showToast({
        type: "error",
        title: "Item gagal disimpan",
        description: "Cek pesan error pada masing-masing draft.",
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8] p-4 text-[#1c1b1b] md:p-8">
      <div className="mx-auto w-full max-w-7xl overflow-hidden border border-[#E8E8E4] bg-white shadow-sm">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[#E8E8E4] bg-white/95 px-5 py-4 backdrop-blur md:px-6">
          <div>
            <h1 className="text-2xl font-semibold leading-tight text-[#1c1b1b]">
              Tambah Pakaian
            </h1>
            <p className="mt-1 text-xs text-[#5E5E5E]">
              Pilih satu atau banyak foto, review hasil AI, lalu simpan ke koleksi.
            </p>
          </div>
          <button
            aria-label="Tutup"
            className="grid size-10 place-items-center rounded-full text-xl text-[#5E5E5E] transition-colors hover:bg-[#F7F3F2] hover:text-[#1c1b1b]"
            type="button"
            onClick={() => navigate(-1)}
          >
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="grid min-h-[calc(100vh-150px)] lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="border-b border-[#E8E8E4] p-5 lg:border-b-0 lg:border-r">
            <section>
              <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5E5E5E]">
                Foto Pakaian
              </label>
              <div className="group relative grid min-h-40 cursor-pointer place-items-center border-2 border-dashed border-[#D0D0CB] bg-[#F7F3F2]/30 p-5 text-center transition-all hover:border-[#1c1b1b]/50 hover:bg-[#F7F3F2]/50">
                <input
                  multiple
                  accept="image/*"
                  aria-label="Upload foto pakaian"
                  className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                  type="file"
                  onChange={handleFilesSelected}
                />
                <div className="pointer-events-none">
                  <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[#F1EDEC] text-xl text-[#5E5E5E] transition-transform group-hover:scale-105">
                    <FiImage aria-hidden="true" />
                  </div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1c1b1b]">
                    Tambah Banyak Foto
                  </span>
                  <span className="text-xs text-[#5E5E5E]">
                    JPG atau PNG. AI akan menganalisis satu per satu.
                  </span>
                </div>
              </div>
            </section>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <StatusCount label="Draft" value={drafts.length} />
              <StatusCount label="Diproses" value={summary.analyzing} />
              <StatusCount label="Tersimpan" value={summary.saved} />
            </div>
          </aside>

          <section className="flex min-h-0 flex-col">
            {errorMessage ? (
              <div className="mx-5 mt-5 border border-[#f0c8c8] bg-[#fff7f7] p-4 text-sm text-[#ba1a1a]">
                {errorMessage}
              </div>
            ) : null}

            <div className="grid min-h-0 flex-1 gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_420px]">
              <DraftGrid
                drafts={drafts}
                selectedDraftId={selectedDraftId}
                onRemove={removeDraft}
                onSelect={setSelectedDraftId}
              />

              <DraftEditor
                categories={categories}
                draft={selectedDraft}
                formalityLevels={formalityLevels}
                onChange={updateDraft}
                onToggleOccasion={toggleDraftOccasion}
              />
            </div>

            <div className="sticky bottom-0 z-20 flex flex-col gap-3 border-t border-[#E8E8E4] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#747878]">
                {drafts.length
                  ? `${drafts.length} draft, ${invalidDrafts.length} perlu dilengkapi, ${summary.errors} error`
                  : "Belum ada draft item."}
              </p>
              <button
                className="inline-flex h-12 items-center justify-center gap-2 bg-[#1c1b1b] px-5 text-[11px] font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!canSubmit || unsavedDrafts.length === 0}
                type="button"
                onClick={handleSaveAll}
              >
                {saving ? (
                  <FiLoader className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <FiSave className="size-4" aria-hidden="true" />
                )}
                {saving ? "Menyimpan..." : "Simpan Semua"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function DraftGrid({
  drafts,
  selectedDraftId,
  onRemove,
  onSelect,
}: {
  drafts: ItemDraft[];
  selectedDraftId: string | null;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  if (!drafts.length) {
    return (
      <div className="grid min-h-80 place-items-center border border-[#E8E8E4] bg-[#FAFAF8] p-8 text-center">
        <div>
          <FiImage className="mx-auto mb-3 size-10 text-[#747878]" />
          <p className="text-sm font-semibold text-[#1c1b1b]">
            Belum ada foto
          </p>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-[#747878]">
            Upload beberapa foto dari panel kiri. Setiap foto akan menjadi draft
            item yang bisa direview sebelum disimpan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid content-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
      {drafts.map((draft, index) => {
        const selected = selectedDraftId === draft.id;
        const valid = isDraftValid(draft);
        const queuePosition = getQueuePosition(drafts, index);

        return (
          <article
            className={`group overflow-hidden border bg-white transition-colors ${
              selected
                ? "border-[#1c1b1b]"
                : valid
                  ? "border-[#E8E8E4]"
                  : "border-[#f0c8c8]"
            }`}
            key={draft.id}
          >
            <button
              className="block w-full text-left"
              type="button"
              onClick={() => onSelect(draft.id)}
            >
              <div className="relative aspect-4/3 bg-[#F4F4F0]">
                <img
                  alt={draft.description || `Draft ${index + 1}`}
                  className="h-full w-full object-cover"
                  src={draft.previewUrl}
                />
                <DraftStatusBadge status={draft.status} valid={valid} />
                {draft.status === "queued" || draft.status === "analyzing" ? (
                  <div className="absolute inset-0 grid place-items-center bg-[#1c1b1b]/45 text-white">
                    <div className="flex items-center gap-2 bg-[#1c1b1b]/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em]">
                      <FiLoader className="size-4 animate-spin" aria-hidden="true" />
                      {draft.status === "queued"
                        ? "Menunggu analisis"
                        : `Analisis item ${queuePosition.current} dari ${queuePosition.total}`}
                    </div>
                  </div>
                ) : null}
                {draft.status === "saving" ? (
                  <div className="absolute inset-0 grid place-items-center bg-white/70 text-[#1c1b1b]">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] shadow-sm">
                      <FiLoader className="size-4 animate-spin" aria-hidden="true" />
                      Menyimpan item
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-[#1c1b1b]">
                  {draft.description || `Draft ${index + 1}`}
                </p>
                <p className="mt-1 text-xs text-[#747878]">
                  {getDraftHelperText(draft, queuePosition)}
                </p>
              </div>
            </button>
            <button
              aria-label={`Hapus ${draft.description || `draft ${index + 1}`}`}
              className="mx-3 mb-3 inline-flex h-8 items-center gap-2 border border-[#E8E8E4] px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#ba1a1a] transition-colors hover:border-[#ba1a1a]"
              type="button"
              onClick={() => onRemove(draft.id)}
            >
              <FiTrash2 className="size-3.5" aria-hidden="true" />
              Hapus
            </button>
          </article>
        );
      })}
    </div>
  );
}

function DraftEditor({
  categories,
  draft,
  formalityLevels,
  onChange,
  onToggleOccasion,
}: {
  categories: WardrobeCategory[];
  draft: ItemDraft | undefined;
  formalityLevels: WardrobeFormality[];
  onChange: (id: string, patch: Partial<ItemDraft>) => void;
  onToggleOccasion: (id: string, value: string) => void;
}) {
  if (!draft) {
    return (
      <aside className="border border-[#E8E8E4] bg-white p-5">
        <p className="text-sm font-semibold text-[#1c1b1b]">
          Pilih draft untuk diedit.
        </p>
      </aside>
    );
  }

  const setReadyPatch = (patch: Partial<ItemDraft>) =>
    onChange(draft.id, {
      ...patch,
      status: draft.status === "saved" ? "ready" : draft.status,
    });

  return (
    <aside className="border border-[#E8E8E4] bg-white p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
            Review Draft
          </p>
          <p className="text-sm font-semibold text-[#1c1b1b]">
            {draft.image.name}
          </p>
        </div>
        {draft.status === "queued" || draft.status === "analyzing" ? (
          <FiLoader className="size-5 animate-spin text-[#747878]" />
        ) : null}
      </div>

      {draft.status === "queued" || draft.status === "analyzing" ? (
        <div className="mb-5 border border-[#E8E8E4] bg-[#FAFAF8] p-3 text-xs leading-relaxed text-[#747878]">
          {draft.status === "queued"
            ? "Menunggu giliran analisis. Item lain sedang diproses lebih dulu."
            : "AI sedang membaca foto ini. Hasil kategori, warna, dan deskripsi akan terisi otomatis."}
        </div>
      ) : null}

      {draft.error ? (
        <div className="mb-5 border border-[#f0c8c8] bg-[#fff7f7] p-3 text-xs leading-relaxed text-[#ba1a1a]">
          {draft.error}
        </div>
      ) : null}

      <div className="space-y-5">
        <section>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5E5E5E]">
            Kategori
          </label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((option) => (
              <button
                className={`min-h-11 border px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  draft.category === option
                    ? "border-[#1c1b1b] bg-[#1c1b1b] text-white"
                    : "border-[#E8E8E4] text-[#5E5E5E] hover:bg-[#F7F3F2]"
                }`}
                key={option}
                type="button"
                onClick={() => setReadyPatch({ category: option })}
              >
                {categoryLabels[option] ?? option}
              </button>
            ))}
          </div>
        </section>

        <FormField label="Warna Dominan">
          <input
            className="w-full border border-[#E8E8E4] bg-[#F7F3F2]/30 px-4 py-3 text-sm text-[#1c1b1b] outline-none transition-all placeholder:text-[#5E5E5E]/50 focus:border-[#1c1b1b]"
            placeholder="Contoh: white, navy, black"
            value={draft.dominantColor}
            onChange={(event) =>
              setReadyPatch({ dominantColor: event.target.value })
            }
          />
        </FormField>

        <FormField label="Deskripsi">
          <input
            className="w-full border border-[#E8E8E4] bg-[#F7F3F2]/30 px-4 py-3 text-sm text-[#1c1b1b] outline-none transition-all placeholder:text-[#5E5E5E]/50 focus:border-[#1c1b1b]"
            placeholder="Kosongkan untuk fallback backend"
            value={draft.description}
            onChange={(event) =>
              setReadyPatch({ description: event.target.value })
            }
          />
        </FormField>

        <section>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5E5E5E]">
            Tingkat Formalitas
          </label>
          <div className="flex flex-col overflow-hidden border border-[#E8E8E4]">
            <button
              className={`min-h-11 flex-1 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                draft.formality === ""
                  ? "bg-[#F7F3F2] text-[#1c1b1b]"
                  : "text-[#5E5E5E] hover:bg-[#F7F3F2]"
              }`}
              type="button"
              onClick={() => setReadyPatch({ formality: "" })}
            >
              Tidak diisi
            </button>
            {formalityLevels.map((option) => (
              <button
                className={`min-h-11 flex-1 px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                  draft.formality === option
                    ? "bg-[#1c1b1b] text-white"
                    : "text-[#5E5E5E] hover:bg-[#F7F3F2]"
                }`}
                key={option}
                type="button"
                onClick={() => setReadyPatch({ formality: option })}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5E5E5E]">
            Cocok Untuk
          </label>
          <div className="flex flex-wrap gap-2">
            {presetOccasionOptions.map((option) => {
              const selected = draft.occasions.includes(option);

              return (
                <button
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                    selected
                      ? "border-[#1c1b1b] bg-[#1c1b1b] text-white"
                      : "border-[#E8E8E4] text-[#5E5E5E] hover:border-[#1c1b1b]"
                  }`}
                  key={option}
                  type="button"
                  onClick={() => onToggleOccasion(draft.id, option)}
                >
                  {selected ? (
                    <FiCheck className="mr-1 inline size-3" aria-hidden="true" />
                  ) : null}
                  {occasionLabels[option] ?? option}
                </button>
              );
            })}
            <label className="flex items-center gap-2 border border-[#E8E8E4] bg-[#F7F3F2]/30 px-3 py-2">
              <FiEdit3
                className="size-3.5 shrink-0 text-[#747878]"
                aria-hidden="true"
              />
              <input
                className="min-w-0 flex-1 bg-transparent text-xs text-[#1c1b1b] outline-none placeholder:text-[#9b9d9b]"
                maxLength={60}
                placeholder="Custom, contoh: konser outdoor"
                type="text"
                value={draft.customOccasion}
                onChange={(event) =>
                  setReadyPatch({ customOccasion: event.target.value })
                }
              />
            </label>
          </div>
        </section>
      </div>
    </aside>
  );
}

function FormField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5E5E5E]">
        {label}
      </span>
      {children}
    </label>
  );
}

function StatusCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-[#E8E8E4] bg-white p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-[#1c1b1b]">{value}</p>
    </div>
  );
}

function DraftStatusBadge({
  status,
  valid,
}: {
  status: DraftStatus;
  valid: boolean;
}) {
  const labelByStatus: Record<DraftStatus, string> = {
    queued: "Menunggu",
    analyzing: "Analisis",
    error: valid ? "Siap" : "Lengkapi",
    ready: valid ? "Siap" : "Lengkapi",
    saved: "Tersimpan",
    saving: "Simpan",
  };

  const tone =
    status === "saved"
      ? "bg-[#eef8ef] text-[#2f6f3e]"
      : status === "queued"
        ? "bg-[#f8f5ea] text-[#7a5b12]"
        : status === "analyzing" || status === "saving"
        ? "bg-white text-[#747878]"
        : valid
          ? "bg-[#1c1b1b] text-white"
          : "bg-[#fff7f7] text-[#ba1a1a]";

  return (
    <span
      className={`absolute left-2 top-2 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] ${tone}`}
    >
      {labelByStatus[status]}
    </span>
  );
}

function isDraftValid(draft: ItemDraft) {
  return Boolean(draft.image) && draft.dominantColor.trim().length > 0;
}

function getQueuePosition(drafts: ItemDraft[], index: number) {
  const processableDrafts = drafts.filter(
    (draft) => draft.status === "queued" || draft.status === "analyzing"
  );
  const currentDraft = drafts[index];
  const currentIndex = processableDrafts.findIndex(
    (draft) => draft.id === currentDraft.id
  );

  return {
    current: currentIndex >= 0 ? currentIndex + 1 : 0,
    total: processableDrafts.length,
  };
}

function getDraftHelperText(
  draft: ItemDraft,
  queuePosition: ReturnType<typeof getQueuePosition>
) {
  if (draft.status === "queued") {
    return `Menunggu giliran ${queuePosition.current} dari ${queuePosition.total}`;
  }

  if (draft.status === "analyzing") {
    return `Sedang dianalisis ${queuePosition.current} dari ${queuePosition.total}`;
  }

  if (draft.status === "saving") return "Sedang disimpan";
  if (draft.status === "saved") return "Sudah tersimpan";
  if (draft.status === "error" && draft.error) return draft.error;

  return `${draft.category} ${draft.dominantColor ? `/${draft.dominantColor}` : ""}`;
}
