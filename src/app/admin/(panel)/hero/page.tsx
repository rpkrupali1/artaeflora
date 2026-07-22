import Image from "next/image";
import AddHeroSlide from "@/components/admin/AddHeroSlide";
import { db } from "@/lib/db";
import { deleteHeroSlide, saveHeroSlide } from "../../actions";

const input =
  "rounded-lg border border-sage bg-white px-3 py-1.5 text-sm focus:border-leaf focus:outline-none";

export default async function AdminHeroPage() {
  const slides = await db.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-script text-4xl text-leaf">Hero slides</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        The home-page banner rotates through active slides (images, GIFs, or short muted
        videos). Keep videos under ~15 seconds for fast loading.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
        <h2 className="mb-3 font-semibold text-charcoal">Add slide</h2>
        <AddHeroSlide />
      </div>

      <div className="mt-6 space-y-4">
        {slides.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sage/50">
            {s.mediaType === "VIDEO" ? (
              <video src={s.url} muted loop autoPlay className="h-20 w-32 rounded-xl object-cover" />
            ) : (
              <div className="relative h-20 w-32 overflow-hidden rounded-xl bg-sage-light">
                <Image src={s.url} alt={s.caption ?? ""} fill sizes="128px" className="object-cover" />
              </div>
            )}
            <form action={saveHeroSlide} className="flex flex-1 flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={s.id} />
              <input type="hidden" name="url" value={s.url} />
              <input type="hidden" name="mediaType" value={s.mediaType} />
              <input name="caption" defaultValue={s.caption ?? ""} placeholder="Caption" className={input} />
              <input name="sortOrder" type="number" defaultValue={s.sortOrder} className={`${input} w-20`} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="active" defaultChecked={s.active} className="accent-leaf" />
                Active
              </label>
              <span className="text-xs text-charcoal/40">{s.mediaType.toLowerCase()}</span>
              <button type="submit" className="rounded-full bg-sage-light px-4 py-1.5 text-xs font-medium text-leaf-dark hover:bg-sage">
                Save
              </button>
            </form>
            <form action={deleteHeroSlide}>
              <input type="hidden" name="id" value={s.id} />
              <button type="submit" className="rounded-full px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
