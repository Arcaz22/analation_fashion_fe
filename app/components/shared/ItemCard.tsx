import { Link } from "react-router";

import type { WardrobeItem } from "~/types/wardrobe";

const statusLabels: Record<WardrobeItem["status"], string> = {
  active: "Aktif",
  archived: "Arsip",
  laundry: "Laundry",
  unavailable: "Tidak Tersedia",
};

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='960' viewBox='0 0 720 960'%3E%3Crect width='720' height='960' fill='%23F4F4F0'/%3E%3Cpath d='M278 207h164l42 70 86 30-40 132-58-15v329H248V424l-58 15-40-132 86-30 42-70Z' fill='%23E1DED7'/%3E%3Cpath d='M302 207c12 24 31 37 58 37s46-13 58-37' fill='none' stroke='%23C4C7C7' stroke-width='18' stroke-linecap='round'/%3E%3C/svg%3E";

export function ItemCard({ item }: { item: WardrobeItem }) {
  const muted = item.status !== "active";
  const imageUrl = item.thumbnail_url || item.image_url || fallbackImage;
  const color = item.dominant_color || "Tidak diketahui";

  return (
    <article className="group min-w-0">
      <Link
        aria-label={`Buka detail ${item.description}`}
        className="block"
        to={`/catalog/${item.id}`}
      >
        <div className="relative aspect-3/4 overflow-hidden bg-[#F4F4F0]">
          <img
            alt={item.description}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              muted ? "opacity-55 group-hover:opacity-75" : ""
            }`}
            decoding="async"
            loading="lazy"
            src={imageUrl}
          />
          <div className="absolute right-3 top-3 border border-[#E8E8E4] bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#1c1b1b] shadow-sm backdrop-blur">
            {statusLabels[item.status]}
          </div>
        </div>

        <div className="mt-3 min-w-0 px-1">
          <h3 className="truncate text-sm font-semibold text-[#1c1b1b]">
            {item.description}
          </h3>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="truncate border border-[#E8E8E4] px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-[#747878]">
              {item.formality_level}
            </span>
            <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#747878]">
              <span className="truncate">{color}</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
