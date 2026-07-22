import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { setOrderStatus } from "../../actions";

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-script text-4xl text-leaf">Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-charcoal/60">No orders yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-charcoal">
                    {o.customerName ?? "Customer"}{" "}
                    <span
                      className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        o.status === "FULFILLED"
                          ? "bg-sage-light text-leaf-dark"
                          : "bg-daisy/40 text-charcoal"
                      }`}
                    >
                      {o.status.toLowerCase()}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-charcoal/60">
                    {o.createdAt.toLocaleString("en-US")} · {o.fulfillment === "SHIPPING" ? "Ship" : "Local pickup"}
                    {o.customerEmail && <> · {o.customerEmail}</>}
                    {o.customerPhone && <> · {o.customerPhone}</>}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-leaf">{formatPrice(o.totalCents)}</p>
                  {o.shippingCents > 0 && (
                    <p className="text-xs text-charcoal/50">incl. {formatPrice(o.shippingCents)} shipping</p>
                  )}
                </div>
              </div>

              <ul className="mt-4 space-y-1 border-t border-sage/50 pt-3 text-sm">
                {o.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.productName} × {item.quantity}</span>
                    <span className="text-charcoal/60">{formatPrice(item.unitPriceCents * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              {o.shippingAddress && (
                <p className="mt-3 whitespace-pre-line rounded-lg bg-sage-light/50 p-3 text-xs text-charcoal/80">
                  {o.shippingAddress}
                </p>
              )}

              <form action={setOrderStatus} className="mt-4">
                <input type="hidden" name="id" value={o.id} />
                <input type="hidden" name="status" value={o.status === "PAID" ? "FULFILLED" : "PAID"} />
                <button
                  type="submit"
                  className="rounded-full bg-sage-light px-5 py-2 text-xs font-medium text-leaf-dark hover:bg-sage"
                >
                  {o.status === "PAID" ? "Mark fulfilled" : "Mark as paid (undo)"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
