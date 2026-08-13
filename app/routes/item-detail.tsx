import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiEdit2,
  FiSave,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { Link, useNavigate, useParams } from "react-router";

import { AppShell } from "~/components/layouts/AppShell";
import {
  useDeleteWardrobeItem,
  useUpdateWardrobeItem,
  useWardrobeItem,
  useWardrobeMetadata,
} from "~/hooks/useWardrobe";
import type {
  UpdateWardrobeItemPayload,
  WardrobeCategory,
  WardrobeFormality,
  WardrobeStatus,
} from "~/types/wardrobe";

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='960' viewBox='0 0 720 960'%3E%3Crect width='720' height='960' fill='%23F4F4F0'/%3E%3Cpath d='M278 207h164l42 70 86 30-40 132-58-15v329H248V424l-58 15-40-132 86-30 42-70Z' fill='%23E1DED7'/%3E%3Cpath d='M302 207c12 24 31 37 58 37s46-13 58-37' fill='none' stroke='%23C4C7C7' stroke-width='18' stroke-linecap='round'/%3E%3C/svg%3E";

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

const defaultStatuses: WardrobeStatus[] = [
  "active",
  "archived",
  "laundry",
  "unavailable",
];

const occasionOptions = [
  "santai",
  "kuliah",
  "kerja",
  "olahraga",
  "formal-event",
];

export default function ItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const itemQuery = useWardrobeItem(itemId);
  const metadataQuery = useWardrobeMetadata();
  const updateItem = useUpdateWardrobeItem();
  const deleteItem = useDeleteWardrobeItem();
  const item = itemQuery.data?.data;
  const metadata = metadataQuery.data?.data;
  const categories = metadata?.categories?.length
    ? metadata.categories
    : defaultCategories;
  const formalityLevels = metadata?.formality_levels?.length
    ? metadata.formality_levels
    : defaultFormalityLevels;
  const statuses = metadata?.statuses?.length ? metadata.statuses : defaultStatuses;
  const [isEditing, setIsEditing] = useState(false);
  const [category, setCategory] = useState<WardrobeCategory>("top");
  const [dominantColor, setDominantColor] = useState("");
  const [description, setDescription] = useState("");
  const [formality, setFormality] = useState<WardrobeFormality>("casual");
  const [occasionTags, setOccasionTags] = useState("");
  const [status, setStatus] = useState<WardrobeStatus>("active");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;

    setCategory(item.category);
    setDominantColor(item.dominant_color);
    setDescription(item.description);
    setFormality(item.formality_level);
    setOccasionTags(item.occasion_tags.join(", "));
    setStatus(item.status);
    setErrorMessage(null);
  }, [item]);

  const parsedOccasionTags = useMemo(
    () =>
      occasionTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [occasionTags]
  );

  const updatePayload = useMemo<UpdateWardrobeItemPayload>(() => {
    if (!item) return {};

    const payload: UpdateWardrobeItemPayload = {};
    const nextDominantColor = dominantColor.trim();
    const nextDescription = description.trim();

    if (category !== item.category) payload.category = category;
    if (nextDominantColor !== item.dominant_color) {
      payload.dominant_color = nextDominantColor;
    }
    if (nextDescription !== item.description) {
      payload.description = nextDescription;
    }
    if (formality !== item.formality_level) {
      payload.formality_level = formality;
    }
    if (parsedOccasionTags.join("|") !== item.occasion_tags.join("|")) {
      payload.occasion_tags = parsedOccasionTags;
    }
    if (status !== item.status) payload.status = status;

    return payload;
  }, [
    category,
    description,
    dominantColor,
    formality,
    item,
    parsedOccasionTags,
    status,
  ]);

  const hasChanges = Object.keys(updatePayload).length > 0;
  const canSubmit =
    dominantColor.trim().length > 0 &&
    description.trim().length > 0 &&
    hasChanges &&
    !updateItem.isPending;

  async function handleDelete() {
    if (!item) return;

    const confirmed = window.confirm(
      `Hapus "${item.description}" dari koleksi?`
    );

    if (!confirmed) return;

    await deleteItem.mutateAsync(item.id);
    navigate("/catalog");
  }

  function handleCancelEdit() {
    if (!item) return;

    setCategory(item.category);
    setDominantColor(item.dominant_color);
    setDescription(item.description);
    setFormality(item.formality_level);
    setOccasionTags(item.occasion_tags.join(", "));
    setStatus(item.status);
    setErrorMessage(null);
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    if (!item) return;

    if (!dominantColor.trim() || !description.trim()) {
      setErrorMessage("Warna dominan dan deskripsi wajib diisi.");
      return;
    }

    if (!hasChanges) {
      setIsEditing(false);
      return;
    }

    try {
      await updateItem.mutateAsync({
        itemId: item.id,
        payload: updatePayload,
      });
      setIsEditing(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Item belum bisa diperbarui. Coba lagi.";
      setErrorMessage(message);
    }
  }

  function toggleOccasion(value: string) {
    const currentTags = parsedOccasionTags;
    const nextTags = currentTags.includes(value)
      ? currentTags.filter((tag) => tag !== value)
      : [...currentTags, value];

    setOccasionTags(nextTags.join(", "));
  }

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-10 md:py-12">
        <Link
          className="mb-6 inline-flex text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878] transition-colors hover:text-[#1c1b1b]"
          to="/catalog"
        >
          <FiArrowLeft className="mr-2 size-4" aria-hidden="true" />
          Kembali ke Koleksi
        </Link>

        {itemQuery.isLoading ? (
          <div className="h-96 animate-pulse bg-white" />
        ) : itemQuery.isError || !item ? (
          <section className="border border-[#E8E8E4] bg-white p-6">
            <p className="text-lg font-semibold text-[#1c1b1b]">
              Item tidak bisa dimuat.
            </p>
          </section>
        ) : (
          <section className="grid gap-8 md:grid-cols-[minmax(0,420px)_1fr]">
            <div className="aspect-3/4 overflow-hidden bg-[#F4F4F0]">
              <img
                alt={item.description}
                className="h-full w-full object-cover"
                src={item.image_url || item.thumbnail_url || fallbackImage}
              />
            </div>

            <div className="min-w-0">
              {isEditing ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#747878]">
                        Edit Item
                      </p>
                      <h1 className="text-3xl font-semibold leading-tight text-[#1c1b1b]">
                        {item.description}
                      </h1>
                    </div>
                    <button
                      aria-label="Batal edit"
                      className="grid size-10 shrink-0 place-items-center rounded-full text-[#747878] transition-colors hover:bg-[#F7F3F2] hover:text-[#1c1b1b]"
                      type="button"
                      onClick={handleCancelEdit}
                    >
                      <FiX aria-hidden="true" />
                    </button>
                  </div>

                  {errorMessage ? (
                    <div className="border border-[#f0c8c8] bg-[#fff7f7] p-4 text-sm text-[#ba1a1a]">
                      {errorMessage}
                    </div>
                  ) : null}

                  <section>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5E5E5E]">
                      Kategori
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                      {categories.map((option) => (
                        <button
                          className={`min-h-12 border px-2 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                            category === option
                              ? "border-[#1c1b1b] bg-[#1c1b1b] text-white"
                              : "border-[#E8E8E4] text-[#5E5E5E] hover:bg-[#F7F3F2]"
                          }`}
                          key={option}
                          type="button"
                          onClick={() => setCategory(option)}
                        >
                          {categoryLabels[option] ?? option}
                        </button>
                      ))}
                    </div>
                  </section>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Warna Dominan">
                      <input
                        className="w-full border border-[#E8E8E4] bg-[#F7F3F2]/30 px-4 py-3 text-sm text-[#1c1b1b] outline-none transition-all focus:border-[#1c1b1b]"
                        placeholder="Contoh: black, navy"
                        value={dominantColor}
                        onChange={(event) =>
                          setDominantColor(event.target.value)
                        }
                      />
                    </FormField>

                    <FormField label="Status">
                      <select
                        className="h-11.5 w-full border border-[#E8E8E4] bg-[#F7F3F2]/30 px-4 text-sm font-semibold text-[#1c1b1b] outline-none transition-all focus:border-[#1c1b1b]"
                        value={status}
                        onChange={(event) =>
                          setStatus(event.target.value as WardrobeStatus)
                        }
                      >
                        {statuses.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <FormField label="Deskripsi">
                    <textarea
                      className="min-h-24 w-full resize-y border border-[#E8E8E4] bg-[#F7F3F2]/30 px-4 py-3 text-sm text-[#1c1b1b] outline-none transition-all focus:border-[#1c1b1b]"
                      placeholder="Contoh: navy straight pants"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                    />
                  </FormField>

                  <section>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5E5E5E]">
                      Formalitas
                    </label>
                    <div className="flex flex-col overflow-hidden border border-[#E8E8E4] sm:flex-row">
                      {formalityLevels.map((option) => (
                        <button
                          className={`min-h-12 flex-1 px-2 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                            formality === option
                              ? "bg-[#1c1b1b] text-white"
                              : "text-[#5E5E5E] hover:bg-[#F7F3F2]"
                          }`}
                          key={option}
                          type="button"
                          onClick={() => setFormality(option)}
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
                    <p className="mb-3 text-xs leading-relaxed text-[#747878]">
                      Pilih satu atau lebih occasion jika relevan.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {occasionOptions.map((option) => {
                        const selected = parsedOccasionTags.includes(option);

                        return (
                          <button
                            className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                              selected
                                ? "border-[#1c1b1b] bg-[#1c1b1b] text-white"
                                : "border-[#E8E8E4] text-[#5E5E5E] hover:border-[#1c1b1b]"
                            }`}
                            key={option}
                            type="button"
                            onClick={() => toggleOccasion(option)}
                          >
                            {selected ? (
                              <FiCheck
                                className="mr-1 inline size-3"
                                aria-hidden="true"
                              />
                            ) : null}
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      className="inline-flex h-12 items-center justify-center gap-2 bg-[#1c1b1b] px-5 text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={!canSubmit}
                      type="submit"
                    >
                      {!updateItem.isPending ? (
                        <FiSave className="size-4" aria-hidden="true" />
                      ) : null}
                      {updateItem.isPending ? "Menyimpan..." : "Simpan"}
                    </button>
                    <button
                      className="h-12 border border-[#E8E8E4] px-5 text-sm font-semibold uppercase tracking-widest text-[#747878] transition-colors hover:border-[#1c1b1b] hover:text-[#1c1b1b]"
                      type="button"
                      onClick={handleCancelEdit}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#747878]">
                    {item.category}
                  </p>
                  <h1 className="text-3xl font-semibold leading-tight text-[#1c1b1b]">
                    {item.description}
                  </h1>

                  <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                    <Detail label="Warna" value={item.dominant_color} />
                    <Detail label="Formalitas" value={item.formality_level} />
                    <Detail label="Status" value={item.status} />
                    <Detail
                      label="Occasion"
                      value={
                        item.occasion_tags?.length
                          ? item.occasion_tags.join(", ")
                          : "-"
                      }
                    />
                    {item.width && item.height ? (
                      <Detail
                        label="Dimensi"
                        value={`${item.width} x ${item.height}`}
                      />
                    ) : null}
                    {item.size_bytes ? (
                      <Detail
                        label="Ukuran File"
                        value={`${Math.round(item.size_bytes / 1024)} KB`}
                      />
                    ) : null}
                  </dl>

                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <button
                      className="inline-flex h-12 items-center justify-center gap-2 border border-[#1c1b1b] bg-[#1c1b1b] px-5 text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
                      type="button"
                      onClick={() => setIsEditing(true)}
                    >
                      <FiEdit2 className="size-4" aria-hidden="true" />
                      Edit Item
                    </button>
                    <button
                      className="inline-flex h-12 items-center justify-center gap-2 border border-[#ba1a1a] px-5 text-sm font-semibold uppercase tracking-widest text-[#ba1a1a] transition-colors hover:bg-[#fff3f3] disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={deleteItem.isPending}
                      type="button"
                      onClick={handleDelete}
                    >
                      {!deleteItem.isPending ? (
                        <FiTrash2 className="size-4" aria-hidden="true" />
                      ) : null}
                      {deleteItem.isPending ? "Menghapus..." : "Hapus Item"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>
        )}
      </main>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-[#E8E8E4] bg-white p-4">
      <dt className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
        {label}
      </dt>
      <dd className="text-sm font-semibold text-[#1c1b1b]">{value}</dd>
    </div>
  );
}

function FormField({
  children,
  label,
}: {
  children: React.ReactNode;
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
