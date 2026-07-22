import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { db } from "@/lib/db";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: "asc" } } },
    }),
    db.category.findMany({
      include: { parent: true },
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-script text-4xl text-leaf">Edit product</h1>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
        <ProductForm
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            parentName: c.parent?.name,
          }))}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            priceCents: product.priceCents,
            inquiryOnly: product.inquiryOnly,
            occasions: product.occasions,
            featured: product.featured,
            active: product.active,
            categoryId: product.categoryId,
            images: product.images.map((i) => ({ url: i.url })),
          }}
        />
      </div>
    </div>
  );
}
