import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { deleteProduct } from "../../actions";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-script text-4xl text-leaf">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-olive px-6 py-2.5 text-sm font-semibold text-cream hover:bg-olive-dark"
        >
          + New product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-sage/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-sage bg-sage-light/50 text-xs uppercase tracking-wide text-leaf-dark">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sage/40">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-cream/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-sage-light">
                      {p.images[0] && (
                        <Image src={p.images[0].url} alt="" fill sizes="40px" className="object-cover" />
                      )}
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal/70">{p.category.name}</td>
                <td className="px-4 py-3">{p.inquiryOnly ? "Inquiry" : formatPrice(p.priceCents)}</td>
                <td className="px-4 py-3 text-xs text-charcoal/60">
                  {[p.active ? "active" : "hidden", p.featured && "featured"].filter(Boolean).join(" · ")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="rounded-full bg-sage-light px-4 py-1.5 text-xs font-medium text-leaf-dark hover:bg-sage"
                    >
                      Edit
                    </Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-full px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
