import { db } from "@/lib/db";
import { saveSettings } from "../../actions";

const input =
  "w-full rounded-lg border border-sage bg-white px-3 py-2 text-sm focus:border-leaf focus:outline-none";

export default async function AdminSettingsPage() {
  const rows = await db.siteSetting.findMany();
  const s = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  const shippingFlat = (Number.parseInt(s.shippingFlatCents ?? "800", 10) / 100).toFixed(2);
  const threshold = s.freeShippingThresholdCents
    ? (Number.parseInt(s.freeShippingThresholdCents, 10) / 100).toFixed(2)
    : "";

  return (
    <div>
      <h1 className="font-script text-4xl text-leaf">Settings</h1>

      <form action={saveSettings} className="mt-6 max-w-xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
          <h2 className="font-semibold text-charcoal">Announcement bar</h2>
          <p className="mt-1 text-xs text-charcoal/50">The promo pill shown in the site header.</p>
          <div className="mt-4 space-y-3">
            <input
              name="announcementText"
              defaultValue={s.announcementText ?? ""}
              placeholder="e.g. Free local pickup in Naperville, IL"
              className={input}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="announcementEnabled"
                defaultChecked={s.announcementEnabled !== "false"}
                className="accent-leaf"
              />
              Show announcement
            </label>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
          <h2 className="font-semibold text-charcoal">Shipping</h2>
          <p className="mt-1 text-xs text-charcoal/50">
            Flat US rate charged at checkout. Local pickup is always free.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="shippingFlat" className="mb-1 block text-sm font-medium text-leaf-dark">
                Flat rate (USD)
              </label>
              <input
                id="shippingFlat"
                name="shippingFlat"
                type="number"
                step="0.01"
                min="0"
                defaultValue={shippingFlat}
                className={input}
              />
            </div>
            <div>
              <label htmlFor="freeShippingThreshold" className="mb-1 block text-sm font-medium text-leaf-dark">
                Free shipping over (USD)
              </label>
              <input
                id="freeShippingThreshold"
                name="freeShippingThreshold"
                type="number"
                step="0.01"
                min="0"
                defaultValue={threshold}
                placeholder="leave empty to disable"
                className={input}
              />
            </div>
          </div>
        </section>

        <button
          type="submit"
          className="rounded-full bg-olive px-8 py-3 font-semibold text-cream transition-colors hover:bg-olive-dark"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}
