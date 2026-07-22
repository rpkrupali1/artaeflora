import { db } from "@/lib/db";
import { deleteCategory, saveCategory } from "../../actions";

const input =
  "rounded-lg border border-sage bg-white px-3 py-1.5 text-sm focus:border-leaf focus:outline-none";

export default async function AdminCategoriesPage() {
  const categories = await db.category.findMany({
    include: { parent: true, _count: { select: { products: true, children: true } } },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });
  const parents = categories.filter((c) => !c.parentId);

  return (
    <div>
      <h1 className="font-script text-4xl text-leaf">Categories</h1>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
        <h2 className="font-semibold text-charcoal">Add category</h2>
        <form action={saveCategory} className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="new-name" className="mb-1 block text-xs font-medium text-leaf-dark">Name</label>
            <input id="new-name" name="name" required className={input} placeholder="e.g. Wall Art" />
          </div>
          <div>
            <label htmlFor="new-parent" className="mb-1 block text-xs font-medium text-leaf-dark">Parent (optional)</label>
            <select id="new-parent" name="parentId" defaultValue="" className={input}>
              <option value="">— top level —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="new-sort" className="mb-1 block text-xs font-medium text-leaf-dark">Sort</label>
            <input id="new-sort" name="sortOrder" type="number" defaultValue={99} className={`${input} w-20`} />
          </div>
          <button type="submit" className="rounded-full bg-olive px-5 py-2 text-sm font-semibold text-cream hover:bg-olive-dark">
            Add
          </button>
        </form>
      </div>

      <div className="mt-6 space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sage/50">
            <form action={saveCategory} className="flex flex-1 flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="slug" value={c.slug} />
              <input type="hidden" name="parentId" value={c.parentId ?? ""} />
              <input name="name" defaultValue={c.name} className={`${input} w-44`} />
              <input name="sortOrder" type="number" defaultValue={c.sortOrder} className={`${input} w-20`} />
              <span className="text-xs text-charcoal/50">
                {c.parent ? `sub of ${c.parent.name} · ` : ""}
                {c._count.products} product(s)
              </span>
              <button type="submit" className="rounded-full bg-sage-light px-4 py-1.5 text-xs font-medium text-leaf-dark hover:bg-sage">
                Save
              </button>
            </form>
            <form action={deleteCategory}>
              <input type="hidden" name="id" value={c.id} />
              <button
                type="submit"
                disabled={c._count.products > 0 || c._count.children > 0}
                title={c._count.products > 0 || c._count.children > 0 ? "Move products/subcategories out first" : "Delete"}
                className="rounded-full px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Delete
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
