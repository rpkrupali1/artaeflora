import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { slugify } from "@/lib/slug";

const log = logger.child({ scope: "admin-api" });

// GET  /api/admin/categories — flat list with ids (for building product payloads).
// POST /api/admin/categories — create (no id) or update (with id).

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await db.category.findMany({
    include: { parent: true, _count: { select: { products: true } } },
    orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
  });
  return NextResponse.json({
    categories: categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      parentId: c.parentId,
      parentName: c.parent?.name ?? null,
      sortOrder: c.sortOrder,
      productCount: c._count.products,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id?: string; name?: string; slug?: string; parentId?: string | null; sortOrder?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.id) {
    const existing = await db.category.findUnique({ where: { id: body.id } });
    if (!existing) {
      return NextResponse.json({ error: `No category with id ${body.id}.` }, { status: 404 });
    }
    const updated = await db.category.update({
      where: { id: body.id },
      data: {
        ...(body.name !== undefined ? { name: body.name.trim() } : {}),
        ...(body.slug !== undefined ? { slug: slugify(body.slug) } : {}),
        ...(body.parentId !== undefined ? { parentId: body.parentId } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
      },
    });
    log.info("admin_api.category_updated", { categoryId: updated.id, by: session.email });
    return NextResponse.json({ id: updated.id, slug: updated.slug, updated: true });
  }

  if (!body.name) {
    return NextResponse.json({ error: "name is required to create." }, { status: 400 });
  }
  const created = await db.category.create({
    data: {
      name: body.name.trim(),
      slug: slugify(body.slug || body.name),
      parentId: body.parentId ?? null,
      sortOrder: body.sortOrder ?? 99,
    },
  });
  log.info("admin_api.category_created", { categoryId: created.id, by: session.email });
  return NextResponse.json({ id: created.id, slug: created.slug, created: true }, { status: 201 });
}
