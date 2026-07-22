import ProductForm from "@/components/admin/ProductForm";
import { db } from "@/lib/db";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    include: { parent: true },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <div>
      <h1 className="font-script text-4xl text-leaf">New product</h1>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-sage/50">
        <ProductForm
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            parentName: c.parent?.name,
          }))}
        />
      </div>
    </div>
  );
}
