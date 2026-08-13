import type { OutfitSet } from "~/types/outfit";

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='720' height='960' viewBox='0 0 720 960'%3E%3Crect width='720' height='960' fill='%23F4F4F0'/%3E%3Cpath d='M278 207h164l42 70 86 30-40 132-58-15v329H248V424l-58 15-40-132 86-30 42-70Z' fill='%23E1DED7'/%3E%3Cpath d='M302 207c12 24 31 37 58 37s46-13 58-37' fill='none' stroke='%23C4C7C7' stroke-width='18' stroke-linecap='round'/%3E%3C/svg%3E";

const outfitSlots = [
  { key: "top", label: "Atasan" },
  { key: "bottom", label: "Bawahan" },
  { key: "outer", label: "Outer" },
  { key: "footwear", label: "Sepatu" },
] as const;

export function OutfitCard({ outfit }: { outfit: OutfitSet }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {outfitSlots.map((slot) => {
        const item = outfit[slot.key];

        return (
          <article
            className="min-w-0 overflow-hidden border border-[#E8E8E4] bg-white"
            key={slot.key}
          >
            <div className="aspect-[4/3] bg-[#F4F4F0]">
              {item ? (
                <img
                  alt={item.description ?? slot.label}
                  className="h-full w-full object-cover"
                  src={item.thumbnail_url || item.image_url || fallbackImage}
                />
              ) : (
                <div className="grid h-full place-items-center p-5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
                  Tidak memakai {slot.label}
                </div>
              )}
            </div>
            <div className="p-4">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#747878]">
                {slot.label}
              </p>
              <h3 className="truncate text-sm font-semibold text-[#1c1b1b]">
                {item?.description ?? "-"}
              </h3>
              {item?.dominant_color ? (
                <p className="mt-1 text-xs text-[#747878]">
                  {item.dominant_color}
                </p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
