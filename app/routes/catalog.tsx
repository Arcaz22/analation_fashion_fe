import { Link } from "react-router";
import { useState } from "react";

import { AppShell } from "~/components/layouts/AppShell";
import { ItemGrid } from "~/components/shared/ItemGrid";
import { useWardrobeItems } from "~/hooks/useWardrobe";
import type { WardrobeCategory } from "~/types/wardrobe";

const categories = [
  { label: "Semua", value: "all" },
  { label: "Atasan", value: "top" },
  { label: "Bawahan", value: "bottom" },
  { label: "Outer", value: "outer" },
  { label: "Alas kaki", value: "footwear" },
  { label: "Aksesori", value: "accessory" },
] as const;

type CategoryFilter = (typeof categories)[number]["value"];

export default function CatalogPage() {
  const [category, setCategory] = useState<CategoryFilter>("all");
  const selectedCategory =
    category === "all" ? undefined : (category as WardrobeCategory);
  const itemsQuery = useWardrobeItems(selectedCategory);
  const items = itemsQuery.data?.data ?? [];

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-10 md:py-10">
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-semibold leading-tight text-[#1c1b1b]">
              Koleksi Pakaian
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-[#747878]">
              Kelola dan atur lemari pakaian digital Anda.
            </p>
          </div>
          <Link
            className="inline-flex h-12 items-center justify-center bg-[#1c1b1b] px-5 text-sm font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-90"
            to="/catalog/new"
          >
            Tambah Item Baru
          </Link>
        </div>

        <div className="mb-6 border border-[#E2DDD3] bg-[#F4F1EA] p-4">
          <p className="text-sm leading-relaxed text-[#1c1b1b]">
            Tambahkan minimal 1 atasan, 1 bawahan, dan 1 sepatu agar AI dapat menyusun rekomendasi outfit yang optimal.
          </p>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto border-b border-[#E8E8E4] pb-4">
          {categories.map((option) => (
            <button
              className={`h-10 shrink-0 border px-4 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
                category === option.value
                  ? "border-[#1c1b1b] bg-[#1c1b1b] text-white"
                  : "border-[#E8E8E4] bg-white text-[#747878] hover:border-[#1c1b1b] hover:text-[#1c1b1b]"
              }`}
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {itemsQuery.isLoading ? (
          <div className="grid min-h-72 place-items-center border border-[#E8E8E4] bg-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#747878]">
              Memuat koleksi...
            </p>
          </div>
        ) : itemsQuery.isError ? (
          <div className="border border-[#f0c8c8] bg-[#fff7f7] p-5">
            <p className="text-sm font-semibold text-[#ba1a1a]">
              Koleksi tidak bisa dimuat.
            </p>
            <p className="mt-1 text-sm text-[#747878]">
              Periksa koneksi API lalu coba lagi.
            </p>
          </div>
        ) : items.length > 0 ? (
          <ItemGrid items={items} />
        ) : (
          <div className="grid min-h-72 place-items-center border border-[#E8E8E4] bg-white p-8 text-center">
            <div>
              <p className="text-sm font-semibold text-[#1c1b1b]">
                Belum ada item di kategori ini.
              </p>
              <Link
                className="mt-4 inline-flex h-11 items-center justify-center bg-[#1c1b1b] px-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
                to="/catalog/new"
              >
                Tambah Item
              </Link>
            </div>
          </div>
        )}
      </main>
    </AppShell>
  );
}
