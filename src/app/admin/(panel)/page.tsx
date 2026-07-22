import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboard() {
  const [orderCount, newOrders, inquiryCount, newInquiries, productCount, recentOrders, recentInquiries] =
    await Promise.all([
      db.order.count(),
      db.order.count({ where: { status: "PAID" } }),
      db.inquiry.count(),
      db.inquiry.count({ where: { handled: false } }),
      db.product.count({ where: { active: true } }),
      db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { items: true } }),
      db.inquiry.findMany({ where: { handled: false }, orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  const stats = [
    { label: "Orders to fulfill", value: newOrders, href: "/admin/orders" },
    { label: "New inquiries", value: newInquiries, href: "/admin/inquiries" },
    { label: "Active products", value: productCount, href: "/admin/products" },
    { label: "Total orders", value: orderCount, href: "/admin/orders" },
    { label: "Total inquiries", value: inquiryCount, href: "/admin/inquiries" },
  ];

  return (
    <div>
      <h1 className="font-script text-4xl text-leaf">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-sage/50 transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-semibold text-leaf">{s.value}</p>
            <p className="mt-1 text-xs text-charcoal/60">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
          <h2 className="font-semibold text-charcoal">Recent orders</h2>
          {recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-charcoal/60">No orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-sage/50 text-sm">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2">
                  <span>
                    {o.customerName ?? "Customer"} · {o.items.length} item(s) ·{" "}
                    <span className={o.status === "PAID" ? "text-olive-dark" : "text-leaf"}>
                      {o.status.toLowerCase()}
                    </span>
                  </span>
                  <span className="font-medium text-leaf">{formatPrice(o.totalCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
          <h2 className="font-semibold text-charcoal">Unhandled inquiries</h2>
          {recentInquiries.length === 0 ? (
            <p className="mt-3 text-sm text-charcoal/60">All caught up 🎉</p>
          ) : (
            <ul className="mt-3 divide-y divide-sage/50 text-sm">
              {recentInquiries.map((i) => (
                <li key={i.id} className="py-2">
                  <span className="rounded-full bg-sage-light px-2 py-0.5 text-xs font-medium text-leaf-dark">
                    {i.type.toLowerCase()}
                  </span>{" "}
                  <span className="font-medium">{i.name}</span>
                  <span className="text-charcoal/60"> — {i.message.slice(0, 60)}…</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
