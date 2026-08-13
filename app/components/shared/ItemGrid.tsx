import { ItemCard } from "~/components/shared/ItemCard";
import type { WardrobeItem } from "~/types/wardrobe";

export function ItemGrid({ items }: { items: WardrobeItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) => (
        <ItemCard item={item} key={item.id} />
      ))}
    </div>
  );
}
