import { useMemo, useState } from "react";

import { AppShell } from "~/components/layouts/AppShell";
import { ItemGrid } from "~/components/shared/ItemGrid";
import type { CatalogItem } from "~/components/shared/ItemCard";

const catalogItems: CatalogItem[] = [
  {
    id: "item_001",
    category: "top",
    color: "White",
    colorHex: "#FFFFFF",
    description: "Classic Oxford Shirt",
    formality: "smart-casual",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0v2R8DEleTFYeCjRuWczYeGbvmvK2xJUgXkNaxhEeclldUIzs-h5qi8yDkZnIOUfFb1Dt4PNUvaA6jmwoQHHd6L3Tpsk7borXM0vVjV4roRi_hvMTKt5RpTDEvDc2g-0WhpqAuCkeKPhK7MB788kknAnrHXQ-GhkUNwQxMczP2adgKNWyAYGAaq2WgWWjtTkOVo9vQrO0zMOBeCIEkbai34r5dNBqwfrbZVE1Ud10z8NpoQngNHcdJw",
    status: "active",
  },
  {
    id: "item_002",
    category: "bottom",
    color: "Navy",
    colorHex: "#1c1c2b",
    description: "Tailored Wool Trouser",
    formality: "formal",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDzUzCP6Tabp4HnJIIURfSXgqCAy890nub73EzsLfxGFHusBYR3_YbOelzh15A7DVK4u5Up-zLKisbk7Hy4K3id10aFtOp3HA0MEsiVIEWivBe-FQOcMd8KFEjUZbkrzzzNuHIKWmPVU1W2I3855TMzQfoKjUuVInMU3ioOX9raVt0vI7cSlXh8pFmCkIaGeFVUnYQHp4hHsgqbeaf2MULUd-je0yWNxWnCNq-ZGA8iwVQkl2sObHqHBg",
    status: "active",
  },
  {
    id: "item_003",
    category: "top",
    color: "Beige",
    colorHex: "#d2b48c",
    description: "Cashmere Crewneck",
    formality: "casual",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAroIvnVjzPNFRquK1FmBvM9VcUwGlaNIZPqFNupwSNvPiwCM28V8szxaQd1R7owTWt6DUZ-hWryxpbIX0ZLWNOpQhD1W_oowIm-mG7oRvavvCvazw2i5mEKCkgjKViwzy-mRLkjds8bVzaSIIo-oMoQEFTwBhHCGEqWxAWOHdeNPzskGmRTISWTnj40wbV8HP7uXsbJMLY7FaJZC2QOB99gxR1zeTRV9hxiqGMJF7BnlUcZcvXcnv3KQ",
    status: "laundry",
  },
  {
    id: "item_004",
    category: "outer",
    color: "Charcoal",
    colorHex: "#343434",
    description: "Relaxed Linen Blazer",
    formality: "smart-casual",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCiycdZJmbJQirmPTCVfpGIf__BSYFAE2N2bcKD0sUU-cwFk4u3aahLa2An0Oe9tnpj-jz1Dupe0SUeHPJSoA-PoH6lZ08-P4QlQvmK-Kz1q4RL-Kiw73pMiUbd3KkourwXffzrd-bitlyylQn-P5brTje23dPvk3O4n77-PArptY-UDb6gGEYISekNnNpfD-is4URnAs9-5M5_xiHzrB1Scqee0TtC2J9h2DcHHE-5k1Rk6lWUjGisFg",
    status: "active",
  },
  {
    id: "item_005",
    category: "footwear",
    color: "Black",
    colorHex: "#111111",
    description: "Leather Loafers",
    formality: "formal",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCK8XZgKjvxyQZb_Kbv-cl0pBVQGZHc_N_v3OBf5JEhpEqyP2YFs4q3Xw-mrfeFF95t1St8L5E9hotX9_7SpRnK2cLHkaYFDRoJ3mO4tlR9DjE7TbKbeqKssqTK7Tu1T2ZCX39bG1LXFzWWEa9vAK4V6voD6GbnFWlHRy3atBWLnwSx7qF8RygFiIwR5seZTx-TQsTHj3ycBfop_Z9quYjLDNXfOBmHA-iTVJraidyi7MgXOIss1LPNVg",
    status: "active",
  },
  {
    id: "item_006",
    category: "accessory",
    color: "Brown",
    colorHex: "#6f4e37",
    description: "Textured Leather Belt",
    formality: "smart-casual",
    imageUrl:
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=80",
    status: "archived",
  },
];

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

  const filteredItems = useMemo(() => {
    if (category === "all") return catalogItems;
    return catalogItems.filter((item) => item.category === category);
  }, [category]);

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
          <button
            className="h-12 bg-[#1c1b1b] px-5 text-sm font-semibold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90"
            type="button"
          >
            Tambah Item Baru
          </button>
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

        <ItemGrid items={filteredItems} />
      </main>
    </AppShell>
  );
}
