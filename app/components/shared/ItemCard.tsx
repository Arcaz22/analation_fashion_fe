export interface CatalogItem {
  id: string;
  category: "top" | "bottom" | "outer" | "footwear" | "accessory";
  color: string;
  colorHex: string;
  description: string;
  formality: "casual" | "smart-casual" | "formal";
  imageUrl: string;
  status: "active" | "laundry" | "archived";
}

const statusLabels: Record<CatalogItem["status"], string> = {
  active: "Aktif",
  laundry: "Laundry",
  archived: "Arsip",
};

export function ItemCard({ item }: { item: CatalogItem }) {
  const muted = item.status !== "active";

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F4F4F0]">
        <img
          alt={item.description}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
            muted ? "opacity-55 group-hover:opacity-75" : ""
          }`}
          src={item.imageUrl}
        />
        <div className="absolute right-3 top-3 border border-[#E8E8E4] bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#1c1b1b] shadow-sm backdrop-blur">
          {statusLabels[item.status]}
        </div>
        <div className="absolute inset-x-0 bottom-4 flex translate-y-2 justify-center gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            className="grid size-10 place-items-center bg-white text-sm font-semibold text-[#1c1b1b] shadow-lg transition-colors hover:bg-[#F1EDEC]"
            title="Edit item"
            type="button"
          >
            Edit
          </button>
          <button
            className="grid size-10 place-items-center bg-white text-sm font-semibold text-[#ba1a1a] shadow-lg transition-colors hover:bg-[#fff3f3]"
            title="Arsip item"
            type="button"
          >
            Arsip
          </button>
        </div>
      </div>

      <div className="mt-3 min-w-0 px-1">
        <h3 className="truncate text-sm font-semibold text-[#1c1b1b]">
          {item.description}
        </h3>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="truncate border border-[#E8E8E4] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#747878]">
            {item.formality}
          </span>
          <span className="flex min-w-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#747878]">
            <span
              className="size-3 shrink-0 border border-[#E8E8E4]"
              style={{ backgroundColor: item.colorHex }}
            />
            <span className="truncate">{item.color}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
