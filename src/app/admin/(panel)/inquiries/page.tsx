import Link from "next/link";
import { db } from "@/lib/db";
import { setInquiryHandled } from "../../actions";

const TYPES = ["ALL", "PAINTING", "EVENT", "CLASS", "GENERAL"] as const;

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const filter = TYPES.includes((type ?? "") as (typeof TYPES)[number]) ? type : undefined;

  const inquiries = await db.inquiry.findMany({
    where: filter && filter !== "ALL" ? { type: filter } : {},
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <h1 className="font-script text-4xl text-leaf">Inquiries</h1>

      <div className="mt-4 flex gap-2">
        {TYPES.map((t) => (
          <Link
            key={t}
            href={t === "ALL" ? "/admin/inquiries" : `/admin/inquiries?type=${t}`}
            className={`rounded-full px-4 py-1.5 text-xs font-medium ${
              (filter ?? "ALL") === t ? "bg-leaf text-cream" : "bg-sage-light text-leaf-dark hover:bg-sage"
            }`}
          >
            {t.toLowerCase()}
          </Link>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <p className="mt-6 text-sm text-charcoal/60">No inquiries here.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {inquiries.map((q) => (
            <div
              key={q.id}
              className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ${
                q.handled ? "opacity-60 ring-sage/30" : "ring-sage/50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-sage-light px-2.5 py-0.5 text-xs font-medium text-leaf-dark">
                    {q.type.toLowerCase()}
                  </span>
                  <span className="ml-2 font-semibold text-charcoal">{q.name}</span>
                  <p className="mt-1 text-xs text-charcoal/60">
                    {q.createdAt.toLocaleString("en-US")} ·{" "}
                    <a href={`mailto:${q.email}`} className="text-leaf hover:underline">{q.email}</a>
                    {q.phone && <> · {q.phone}</>}
                  </p>
                </div>
                <form action={setInquiryHandled}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="handled" value={q.handled ? "false" : "true"} />
                  <button
                    type="submit"
                    className="rounded-full bg-sage-light px-4 py-1.5 text-xs font-medium text-leaf-dark hover:bg-sage"
                  >
                    {q.handled ? "Mark unhandled" : "Mark handled"}
                  </button>
                </form>
              </div>
              <p className="mt-3 text-sm leading-6 text-charcoal/85">{q.message}</p>
              {q.details && (
                <p className="mt-2 rounded-lg bg-sage-light/50 px-3 py-2 text-xs text-charcoal/70">{q.details}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
