import Image from "next/image";
import AddGalleryItem from "@/components/admin/AddGalleryItem";
import { db } from "@/lib/db";
import { deleteGalleryItem, saveGalleryItem } from "../../actions";

const input =
  "rounded-lg border border-sage bg-white px-3 py-1.5 text-sm focus:border-leaf focus:outline-none";
const TAGS = ["candles", "paintings", "classes", "events"];

export default async function AdminGalleryPage() {
  const items = await db.galleryItem.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-script text-4xl text-leaf">Gallery</h1>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
        <h2 className="mb-3 font-semibold text-charcoal">Add photo</h2>
        <AddGalleryItem />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sage/50">
            <div className="relative aspect-square bg-sage-light">
              <Image src={item.url} alt={item.caption ?? ""} fill sizes="200px" className="object-cover" />
            </div>
            <div className="space-y-2 p-3 text-xs">
              <form action={saveGalleryItem} className="space-y-2">
                <input type="hidden" name="id" value={item.id} />
                <input type="hidden" name="url" value={item.url} />
                <input name="caption" defaultValue={item.caption ?? ""} placeholder="Caption" className={`${input} w-full`} />
                <div className="flex items-center gap-2">
                  <select name="tag" defaultValue={item.tag} className={input}>
                    {TAGS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input name="sortOrder" type="number" defaultValue={item.sortOrder} className={`${input} w-16`} />
                  <button type="submit" className="rounded-full bg-sage-light px-3 py-1.5 font-medium text-leaf-dark hover:bg-sage">
                    Save
                  </button>
                </div>
              </form>
              <form action={deleteGalleryItem}>
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className="font-medium text-red-700 hover:underline">
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
