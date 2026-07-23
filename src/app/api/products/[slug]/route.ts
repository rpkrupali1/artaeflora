import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products/{slug} — public detail for one active product.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const p = await db.product.findUnique({
    where: { slug },
    include: {
      category: { include: { parent: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!p || !p.active) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json({
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
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  });
}
