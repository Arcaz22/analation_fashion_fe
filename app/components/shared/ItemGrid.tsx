import { type CatalogItem, ItemCard } from "~/components/shared/ItemCard";

export function ItemGrid({ items }: { items: CatalogItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      <button
        className="group grid aspect-[3/4] min-h-60 place-items-center border-2 border-dashed border-[#C4C7C7] bg-white/50 p-5 text-center transition-colors hover:border-[#1c1b1b] hover:bg-white"
        type="button"
      >
        <span>
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-[#F1EDEC] text-2xl text-[#1c1b1b] transition-colors group-hover:bg-[#1c1b1b] group-hover:text-white">
            +
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878] group-hover:text-[#1c1b1b]">
            Tambah Item
          </span>
        </span>
      </button>

      {items.map((item) => (
        <ItemCard item={item} key={item.id} />
      ))}
    </div>
  );
}
