import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/db";

const db = createPrismaClient();

async function main() {
  // --- Admin user -----------------------------------------------------
  const adminEmail = process.env.ADMIN_EMAIL ?? "artaeflora@gmail.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "ChangeMe@ArtaeFlora1";
  await db.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      name: "Krupali",
    },
  });

  // --- Categories -----------------------------------------------------
  const categoryDefs = [
    { slug: "candles", name: "Candles" },
    { slug: "clay-flowers", name: "Clay Flowers" },
    { slug: "candle-holders", name: "Candle Holders" },
    { slug: "bonsais", name: "Bonsais" },
    { slug: "mugs", name: "Mugs" },
    { slug: "jewelry", name: "Jewelry" },
    { slug: "magnets", name: "Magnets" },
    { slug: "miniatures", name: "Miniatures" },
  ];
  const categories: Record<string, string> = {};
  for (const [i, c] of categoryDefs.entries()) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, sortOrder: i },
      create: { ...c, sortOrder: i },
    });
    categories[c.slug] = row.id;
  }

  // Candle subcategories
  for (const [i, c] of [
    { slug: "scented-candles", name: "Scented" },
    { slug: "decorative-candles", name: "Decorative" },
    { slug: "festive-candles", name: "Festive" },
  ].entries()) {
    const row = await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { ...c, sortOrder: i, parentId: categories["candles"] },
    });
    categories[c.slug] = row.id;
  }

  // --- Products ---------------------------------------------------------
  const products = [
    {
      slug: "lavender-soy-candle",
      name: "Lavender Soy Candle",
      description:
        "Hand-poured soy candle with calming lavender. Burns 30+ hours. A soft, soothing gift for any occasion.",
      priceCents: 1800,
      category: "scented-candles",
      occasions: "Birthdays,Christmas",
      featured: true,
      image: "/products/candles.png",
    },
    {
      slug: "diya-festive-candle-set",
      name: "Diya Festive Candle Set (4)",
      description:
        "Set of four hand-decorated diya-style candles — a warm handmade touch for Diwali night.",
      priceCents: 2400,
      category: "festive-candles",
      occasions: "Diwali",
      featured: true,
      image: "/products/candles.png",
    },
    {
      slug: "rose-pillar-candle",
      name: "Rose Pillar Candle",
      description:
        "Sculpted rose pillar candle, hand-tinted. Almost too pretty to burn.",
      priceCents: 1500,
      category: "decorative-candles",
      occasions: "Weddings,Birthdays",
      image: "/products/candles.png",
    },
    {
      slug: "clay-daisy-bouquet",
      name: "Clay Daisy Bouquet",
      description:
        "Natural-looking daisies sculpted petal by petal from air-dry clay. They never wilt — a keepsake bouquet.",
      priceCents: 4500,
      category: "clay-flowers",
      occasions: "Birthdays,Weddings",
      featured: true,
      image: "/products/clay-flowers.png",
    },
    {
      slug: "lotus-tealight-holder",
      name: "Lotus Tealight Holder",
      description:
        "Hand-built clay lotus that cradles a tealight — glows beautifully on a festive evening.",
      priceCents: 2200,
      category: "candle-holders",
      occasions: "Diwali,Christmas",
      image: "/products/candle-holders.png",
    },
    {
      slug: "mini-clay-bonsai",
      name: "Mini Clay Bonsai",
      description:
        "A tiny sculpted bonsai that needs no watering. Desk-friendly calm, handmade to order.",
      priceCents: 3800,
      category: "bonsais",
      occasions: "Corporate Gifts,Birthdays",
      image: "/products/bonsais.png",
    },
    {
      slug: "daisy-coffee-mug",
      name: "Hand-Painted Daisy Mug",
      description:
        "Ceramic mug hand-painted with the ArtaeFlora daisy. Dishwasher-safe sealed finish.",
      priceCents: 2000,
      category: "mugs",
      occasions: "Birthdays,Corporate Gifts",
      image: "/products/mugs.png",
    },
    {
      slug: "clay-flower-earrings",
      name: "Clay Flower Earrings",
      description:
        "Featherweight floral earrings sculpted from polymer clay. Hypoallergenic hooks.",
      priceCents: 1600,
      category: "jewelry",
      occasions: "Birthdays,Rakhi",
      image: "/products/jewelry.png",
    },
    {
      slug: "fridge-magnet-daisies",
      name: "Daisy Fridge Magnets (3)",
      description:
        "Trio of cheerful clay daisy magnets — small gift, big smile.",
      priceCents: 1200,
      category: "magnets",
      occasions: "Birthdays,Rakhi,Christmas",
      image: "/products/magnets.png",
    },
    {
      slug: "miniature-garden-scene",
      name: "Miniature Garden Scene",
      description:
        "A tiny handcrafted garden in a dish — clay flowers, pebble path, endless charm. Made to order; tell us your story and we'll sculpt it in.",
      priceCents: null,
      inquiryOnly: true,
      category: "miniatures",
      occasions: "Weddings,Corporate Gifts",
      image: "/products/miniatures.png",
    },
  ];

  for (const p of products) {
    const { category, image, ...data } = p;
    const row = await db.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...data,
        inquiryOnly: p.inquiryOnly ?? false,
        categoryId: categories[category],
      },
    });
    const existing = await db.productImage.count({ where: { productId: row.id } });
    if (existing === 0) {
      await db.productImage.create({
        data: { productId: row.id, url: image, alt: p.name, sortOrder: 0 },
      });
    }
  }

  // --- Sample class (inactive => /classes shows "coming soon") ---------
  await db.class.upsert({
    where: { slug: "clay-flower-basics" },
    update: {},
    create: {
      slug: "clay-flower-basics",
      title: "Clay Flower Basics",
      description:
        "A relaxed 2-hour workshop: sculpt your first clay daisy and take it home. All materials included. Max 10 people.",
      locationType: "STUDIO",
      scheduleText: "Schedule coming soon",
      priceCents: 4500,
      capacity: 10,
      active: false,
    },
  });

  // --- Gallery ----------------------------------------------------------
  if ((await db.galleryItem.count()) === 0) {
    await db.galleryItem.createMany({
      data: [
        { url: "/hero/slide-1.jpg", caption: "Handmade clay daisies", tag: "paintings", sortOrder: 0 },
        { url: "/hero/slide-2.jpg", caption: "Clay daisy close-up", tag: "paintings", sortOrder: 1 },
        { url: "/products/candles.png", caption: "Candle collection", tag: "candles", sortOrder: 2 },
      ],
    });
  }

  // --- Hero slides --------------------------------------------------------
  if ((await db.heroSlide.count()) === 0) {
    await db.heroSlide.createMany({
      data: [
        { mediaType: "IMAGE", url: "/hero/slide-1.jpg", caption: "Handmade clay daisies", sortOrder: 0 },
        { mediaType: "IMAGE", url: "/hero/slide-2.jpg", caption: "Sculpted petal by petal", sortOrder: 1 },
      ],
    });
  }

  // --- Site settings --------------------------------------------------------
  const settings: Record<string, string> = {
    announcementText:
      "Free local pickup in Naperville, IL · Custom orders open for Rakhi & Diwali",
    announcementEnabled: "true",
    // Flat US shipping in cents; admin-editable (step 5). Phase 2: live
    // carrier rates via Shippo.
    shippingFlatCents: "800",
    // Free shipping at/above this subtotal (cents); empty string = disabled.
    freeShippingThresholdCents: "",
  };
  for (const [key, value] of Object.entries(settings)) {
    await db.siteSetting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  const counts = {
    admins: await db.adminUser.count(),
    categories: await db.category.count(),
    products: await db.product.count(),
    images: await db.productImage.count(),
    classes: await db.class.count(),
    gallery: await db.galleryItem.count(),
    heroSlides: await db.heroSlide.count(),
    settings: await db.siteSetting.count(),
  };
  console.log("Seed complete:", counts);
  console.log(`Admin login: ${adminEmail} (password: the ADMIN_PASSWORD you set, or the default in prisma/seed.ts — change it!)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
