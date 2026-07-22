import { db } from "@/lib/db";
import { deleteClass, saveClass } from "../../actions";

const input =
  "w-full rounded-lg border border-sage bg-white px-3 py-2 text-sm focus:border-leaf focus:outline-none";

function ClassFields({
  cls,
}: {
  cls?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    locationType: string;
    scheduleText: string | null;
    priceCents: number | null;
    capacity: number;
    active: boolean;
  };
}) {
  return (
    <>
      {cls && <input type="hidden" name="id" value={cls.id} />}
      {cls && <input type="hidden" name="slug" value={cls.slug} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="title" required defaultValue={cls?.title} placeholder="Class title *" className={input} />
        <select name="locationType" defaultValue={cls?.locationType ?? "STUDIO"} className={input}>
          <option value="STUDIO">At our studio</option>
          <option value="VENUE">At your venue</option>
          <option value="ONLINE">Online</option>
        </select>
      </div>
      <textarea name="description" required rows={2} defaultValue={cls?.description} placeholder="Description *" className={input} />
      <div className="grid gap-3 sm:grid-cols-4">
        <input name="scheduleText" defaultValue={cls?.scheduleText ?? ""} placeholder="Schedule (e.g. Sat 10am)" className={input} />
        <input
          name="price"
          type="number"
          step="0.01"
          min="0"
          defaultValue={cls?.priceCents != null ? (cls.priceCents / 100).toFixed(2) : ""}
          placeholder="Price $"
          className={input}
        />
        <input name="capacity" type="number" min="1" defaultValue={cls?.capacity ?? 10} placeholder="Capacity" className={input} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={cls?.active ?? false} className="accent-leaf" />
          Live on site
        </label>
      </div>
    </>
  );
}

export default async function AdminClassesPage() {
  const classes = await db.class.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-script text-4xl text-leaf">Classes</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Classes marked &quot;Live on site&quot; appear on /classes; otherwise visitors see the
        &quot;coming soon&quot; waitlist.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
        <h2 className="mb-3 font-semibold text-charcoal">Add class</h2>
        <form action={saveClass} className="space-y-3">
          <ClassFields />
          <button type="submit" className="rounded-full bg-olive px-6 py-2 text-sm font-semibold text-cream hover:bg-olive-dark">
            Add class
          </button>
        </form>
      </div>

      <div className="mt-6 space-y-4">
        {classes.map((c) => (
          <div key={c.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
            <form action={saveClass} className="space-y-3">
              <ClassFields cls={c} />
              <div className="flex gap-3">
                <button type="submit" className="rounded-full bg-sage-light px-5 py-2 text-sm font-medium text-leaf-dark hover:bg-sage">
                  Save
                </button>
              </div>
            </form>
            <form action={deleteClass} className="mt-2">
              <input type="hidden" name="id" value={c.id} />
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
