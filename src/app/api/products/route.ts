import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";

// GET /api/products?category=<slug>&occasion=<name>&q=<search>
// Public read API — returns exactly what the shop shows (active products only).

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const category = params.get("category") ?? undefined;
  const occasion = params.get("occasion") ?? undefined;
  const q = params.get("q") ?? undefined;

  // A parent category includes its subcategories, same as the shop page.
  let categoryIds: string[] | undefined;
  if (category) {
    const selected = await db.category.findUnique({
      where: { slug: category },
      include: { children: true },
    });
    if (!selected) {
      return NextResponse.json({ error: `Unknown category slug: ${category}` }, { status: 404 });
    }
    categoryIds = [selected.id, ...selected.children.map((c) => c.id)];
  }

  const products = await db.product.findMany({
    where: {
      active: true,
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
      ...(occasion ? { occasions: { contains: occasion } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { occasions: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      category: { include: { parent: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({
    count: products.length,
    products: products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      priceCents: p.priceCents,
      inquiryOnly: p.inquiryOnly,
      occasions: p.occasions.split(",").filter(Boolean),
      featured: p.featured,
      category: {
        id: p.category.id,
        slug: p.category.slug,
        name: p.category.name,
        parent: p.category.parent
          ? { id: p.category.parent.id, slug: p.category.parent.slug, name: p.category.parent.name }
          : null,
      },
      images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
    })),
  });
}
