"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

// Every action re-checks the session — hidden UI is never the only guard.

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function dollarsToCents(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim().replace(/^\$/, "");
  if (!s) return null;
  const n = Number.parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
}

// ---------- Products ------------------------------------------------------

export async function saveProduct(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  const inquiryOnly = formData.get("inquiryOnly") === "on";
  const images: { url: string; alt?: string }[] = JSON.parse(
    String(formData.get("imagesJson") ?? "[]")
  );

  const data = {
    name,
    slug,
    description: String(formData.get("description") ?? "").trim(),
    priceCents: inquiryOnly ? null : dollarsToCents(formData.get("price")),
    inquiryOnly,
    occasions: formData.getAll("occasions").map(String).join(","),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    categoryId: String(formData.get("categoryId") ?? ""),
  };

  if (id) {
    await db.product.update({ where: { id }, data });
    await db.productImage.deleteMany({ where: { productId: id } });
    if (images.length) {
      await db.productImage.createMany({
        data: images.map((img, i) => ({
          productId: id,
          url: img.url,
          alt: img.alt ?? name,
          sortOrder: i,
        })),
      });
    }
  } else {
    await db.product.create({
      data: {
        ...data,
        images: {
          create: images.map((img, i) => ({
            url: img.url,
            alt: img.alt ?? name,
            sortOrder: i,
          })),
        },
      },
    });
  }

  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await db.product.delete({ where: { id } });
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}

// ---------- Categories ----------------------------------------------------

export async function saveCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  const parentIdRaw = String(formData.get("parentId") ?? "");
  const data = {
    name,
    slug: slugify(String(formData.get("slug") ?? "").trim() || name),
    parentId: parentIdRaw || null,
    sortOrder: Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
  };
  if (id) {
    await db.category.update({ where: { id }, data });
  } else {
    await db.category.create({ data });
  }
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
}

export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const inUse = await db.product.count({ where: { categoryId: id } });
  const children = await db.category.count({ where: { parentId: id } });
  if (inUse > 0 || children > 0) return; // refuse to orphan products/subcategories
  await db.category.delete({ where: { id } });
  revalidatePath("/shop");
  revalidatePath("/admin/categories");
}

// ---------- Classes -------------------------------------------------------

export async function saveClass(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  const data = {
    title,
    slug: slugify(String(formData.get("slug") ?? "").trim() || title),
    description: String(formData.get("description") ?? "").trim(),
    locationType: ["STUDIO", "VENUE", "ONLINE"].includes(String(formData.get("locationType")))
      ? String(formData.get("locationType"))
      : "STUDIO",
    scheduleText: String(formData.get("scheduleText") ?? "").trim() || null,
    priceCents: dollarsToCents(formData.get("price")),
    capacity: Number.parseInt(String(formData.get("capacity") ?? "10"), 10) || 10,
    active: formData.get("active") === "on",
  };
  if (id) {
    await db.class.update({ where: { id }, data });
  } else {
    await db.class.create({ data });
  }
  revalidatePath("/classes");
  revalidatePath("/admin/classes");
}

export async function deleteClass(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await db.class.delete({ where: { id } });
  revalidatePath("/classes");
  revalidatePath("/admin/classes");
}

// ---------- Gallery -------------------------------------------------------

export async function saveGalleryItem(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;
  const data = {
    url,
    caption: String(formData.get("caption") ?? "").trim() || null,
    tag: String(formData.get("tag") ?? "candles"),
    sortOrder: Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
  };
  if (id) {
    await db.galleryItem.update({ where: { id }, data });
  } else {
    await db.galleryItem.create({ data });
  }
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryItem(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await db.galleryItem.delete({ where: { id } });
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

// ---------- Hero slides ---------------------------------------------------

export async function saveHeroSlide(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const url = String(formData.get("url") ?? "").trim();
  if (!url) return;
  const data = {
    url,
    mediaType: String(formData.get("mediaType")) === "VIDEO" ? "VIDEO" : "IMAGE",
    caption: String(formData.get("caption") ?? "").trim() || null,
    sortOrder: Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
    active: formData.get("active") === "on",
  };
  if (id) {
    await db.heroSlide.update({ where: { id }, data });
  } else {
    await db.heroSlide.create({ data });
  }
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

export async function deleteHeroSlide(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await db.heroSlide.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/hero");
}

// ---------- Site settings -------------------------------------------------

export async function saveSettings(formData: FormData): Promise<void> {
  await requireAdmin();
  const entries: Record<string, string> = {
    announcementText: String(formData.get("announcementText") ?? "").trim(),
    announcementEnabled: formData.get("announcementEnabled") === "on" ? "true" : "false",
    shippingFlatCents: String(dollarsToCents(formData.get("shippingFlat")) ?? 800),
    freeShippingThresholdCents: (() => {
      const cents = dollarsToCents(formData.get("freeShippingThreshold"));
      return cents === null ? "" : String(cents);
    })(),
  };
  for (const [key, value] of Object.entries(entries)) {
    await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}

// ---------- Admin users -----------------------------------------------------

export async function createAdminUser(formData: FormData): Promise<void> {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 10) return;
  await db.adminUser.upsert({
    where: { email },
    update: {},
    create: { email, name: name || null, passwordHash: await bcrypt.hash(password, 12) },
  });
  revalidatePath("/admin/users");
}

export async function updateAdminPassword(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!id || password.length < 10) return;
  await db.adminUser.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(password, 12) },
  });
  revalidatePath("/admin/users");
}

export async function deleteAdminUser(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const target = await db.adminUser.findUnique({ where: { id } });
  const total = await db.adminUser.count();
  // Never delete yourself or the last remaining admin.
  if (!target || target.email === session.email || total <= 1) return;
  await db.adminUser.delete({ where: { id } });
  revalidatePath("/admin/users");
}

// ---------- Orders & inquiries --------------------------------------------

export async function setOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (id && ["PAID", "FULFILLED"].includes(status)) {
    await db.order.update({ where: { id }, data: { status } });
  }
  revalidatePath("/admin/orders");
}

export async function setInquiryHandled(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const handled = String(formData.get("handled")) === "true";
  if (id) await db.inquiry.update({ where: { id }, data: { handled } });
  revalidatePath("/admin/inquiries");
}
