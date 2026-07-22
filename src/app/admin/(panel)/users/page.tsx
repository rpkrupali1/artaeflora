import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAdminUser, deleteAdminUser, updateAdminPassword } from "../../actions";

const input =
  "rounded-lg border border-sage bg-white px-3 py-2 text-sm focus:border-leaf focus:outline-none";

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  const users = await db.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="font-script text-4xl text-leaf">Admin users</h1>
      <p className="mt-1 text-sm text-charcoal/60">
        Everyone who can sign in to this panel. Passwords must be at least 10 characters.
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
        <h2 className="mb-3 font-semibold text-charcoal">Add admin</h2>
        <form action={createAdminUser} className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="new-email" className="mb-1 block text-xs font-medium text-leaf-dark">Email</label>
            <input id="new-email" name="email" type="email" required className={input} placeholder="ishna@example.com" />
          </div>
          <div>
            <label htmlFor="new-name" className="mb-1 block text-xs font-medium text-leaf-dark">Name</label>
            <input id="new-name" name="name" className={input} placeholder="Ishna" />
          </div>
          <div>
            <label htmlFor="new-password" className="mb-1 block text-xs font-medium text-leaf-dark">Password (10+ chars)</label>
            <input id="new-password" name="password" type="password" required minLength={10} className={input} />
          </div>
          <button type="submit" className="rounded-full bg-olive px-6 py-2 text-sm font-semibold text-cream hover:bg-olive-dark">
            Add admin
          </button>
        </form>
      </div>

      <div className="mt-6 space-y-3">
        {users.map((u) => {
          const isSelf = u.email === session?.email;
          const isLast = users.length <= 1;
          return (
            <div key={u.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sage/50">
              <div className="min-w-48">
                <p className="font-medium text-charcoal">
                  {u.name ?? u.email}
                  {isSelf && <span className="ml-2 rounded-full bg-sage-light px-2 py-0.5 text-xs text-leaf-dark">you</span>}
                </p>
                <p className="text-xs text-charcoal/60">{u.email} · added {u.createdAt.toLocaleDateString("en-US")}</p>
              </div>
              <form action={updateAdminPassword} className="flex flex-1 flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={u.id} />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={10}
                  placeholder="New password"
                  className={input}
                />
                <button type="submit" className="rounded-full bg-sage-light px-4 py-2 text-xs font-medium text-leaf-dark hover:bg-sage">
                  Change password
                </button>
              </form>
              <form action={deleteAdminUser}>
                <input type="hidden" name="id" value={u.id} />
                <button
                  type="submit"
                  disabled={isSelf || isLast}
                  title={isSelf ? "You can't delete your own login" : isLast ? "At least one admin must remain" : "Remove"}
                  className="rounded-full px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
