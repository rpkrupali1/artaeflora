import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { slugify } from "@/lib/slug";

const log = logger.child({ scope: "admin-api" });

// GET  /api/admin/products — ALL products, including inactive (admin view).
// POST /api/admin/products — create or update a product via JSON.
//   Update when `id` is given; otherwise create. See openapi.yaml for the schema.

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const products = await db.product.findMany({
    include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
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
      active: p.active,
      categoryId: p.categoryId,
      categoryName: p.category.name,
      images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  });
}

type ProductBody = {
  id?: string;
  name?: string;
  slug?: string;
  description?: string;
  priceCents?: number | null;
  inquiryOnly?: boolean;
  occasions?: string[];
  featured?: boolean;
  active?: boolean;
  categoryId?: string;
  categorySlug?: string;
  images?: { url: string; alt?: string }[];
};

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: ProductBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Resolve category by id or slug.
  let categoryId = body.categoryId;
  if (!categoryId && body.categorySlug) {
    const cat = await db.category.findUnique({ where: { slug: body.categorySlug } });
    if (!cat) {
      return NextResponse.json({ error: `Unknown categorySlug: ${body.categorySlug}` }, { status: 400 });
    }
    categoryId = cat.id;
  }

  const inquiryOnly = body.inquiryOnly ?? false;
  if (!inquiryOnly && body.priceCents != null && (!Number.isInteger(body.priceCents) || body.priceCents < 0)) {
    return NextResponse.json({ error: "priceCents must be a non-negative integer (cents)." }, { status: 400 });
  }

  const data = {
    ...(body.name !== undefined ? { name: body.name.trim() } : {}),
    ...(body.description !== undefined ? { description: body.description.trim() } : {}),
    priceCents: inquiryOnly ? null : (body.priceCents ?? null),
    inquiryOnly,
    ...(body.occasions !== undefined ? { occasions: body.occasions.join(",") } : {}),
    ...(body.featured !== undefined ? { featured: body.featured } : {}),
    ...(body.active !== undefined ? { active: body.active } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  if (body.id) {
    const existing = await db.product.findUnique({ where: { id: body.id } });
    if (!existing) {
      return NextResponse.json({ error: `No product with id ${body.id}.` }, { status: 404 });
    }
    const updated = await db.product.update({
      where: { id: body.id },
      data: {
        ...data,
        ...(body.slug ? { slug: slugify(body.slug) } : {}),
      },
    });
    if (body.images) {
      await db.productImage.deleteMany({ where: { productId: updated.id } });
      if (body.images.length) {
        await db.productImage.createMany({
          data: body.images.map((img, i) => ({
            productId: updated.id,
            url: img.url,
            alt: img.alt ?? updated.name,
            sortOrder: i,
          })),
        });
      }
    }
    log.info("admin_api.product_updated", { productId: updated.id, by: session.email });
    return NextResponse.json({ id: updated.id, slug: updated.slug, updated: true });
  }

  if (!body.name || !body.description || !categoryId) {
    return NextResponse.json(
      { error: "name, description, and categoryId (or categorySlug) are required to create." },
      { status: 400 }
    );
  }
  const created = await db.product.create({
    data: {
      name: body.name.trim(),
      slug: slugify(body.slug || body.name),
      description: body.description.trim(),
      priceCents: inquiryOnly ? null : (body.priceCents ?? null),
      inquiryOnly,
      occasions: (body.occasions ?? []).join(","),
      featured: body.featured ?? false,
      active: body.active ?? true,
      categoryId,
      images: {
        create: (body.images ?? []).map((img, i) => ({
          url: img.url,
          alt: img.alt ?? body.name!,
          sortOrder: i,
        })),
      },
    },
  });
  log.info("admin_api.product_created", { productId: created.id, by: session.email });
  return NextResponse.json({ id: created.id, slug: created.slug, created: true }, { status: 201 });
}
