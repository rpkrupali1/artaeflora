import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/categories — public category tree with active-product counts.

export async function GET() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: { where: { active: true } } } } },
      },
      _count: { select: { products: { where: { active: true } } } },
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      productCount:
        c._count.products + c.children.reduce((sum, ch) => sum + ch._count.products, 0),
      subcategories: c.children.map((ch) => ({
        id: ch.id,
        slug: ch.slug,
        name: ch.name,
        productCount: ch._count.products,
      })),
    })),
  });
}
