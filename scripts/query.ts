// Query playground — edit freely, then run:  npm run db:query
// Docs: https://www.prisma.io/docs/orm/prisma-client/queries

import { createPrismaClient } from "../src/lib/db";

const db = createPrismaClient();

async function main() {
  // 1) Simple list
  const products = await db.product.findMany();
  console.log(`\n--- all products (${products.length}) ---`);
  console.table(
    products.map((p) => ({
      name: p.name,
      price: p.priceCents ? `$${(p.priceCents / 100).toFixed(2)}` : "inquiry",
      occasions: p.occasions,
    }))
  );

  // 2) Filter + join: featured products with their category and images
  const featured = await db.product.findMany({
    where: { featured: true, active: true },
    include: { category: true, images: true },
  });
  console.log("--- featured, with relations ---");
  for (const p of featured) {
    console.log(`${p.name}  [${p.category.name}]  images: ${p.images.map((i) => i.url).join(", ")}`);
  }

  // 3) Search: products tagged for Diwali
  const diwali = await db.product.findMany({
    where: { occasions: { contains: "Diwali" } },
  });
  console.log("\n--- Diwali gifts ---", diwali.map((p) => p.name));

  // 4) Aggregation
  const stats = await db.product.aggregate({
    _count: true,
    _avg: { priceCents: true },
    _max: { priceCents: true },
  });
  console.log("\n--- stats ---", {
    count: stats._count,
    avg: `$${((stats._avg.priceCents ?? 0) / 100).toFixed(2)}`,
    max: `$${((stats._max.priceCents ?? 0) / 100).toFixed(2)}`,
  });

  // 5) Raw SQL when you want it.
  // Postgres gotcha: Prisma creates case-sensitive table/column names,
  // so raw SQL must quote them ("Category", "categoryId") — unquoted
  // identifiers get folded to lowercase and won't match.
  const raw = await db.$queryRaw`
    SELECT c.name AS category, COUNT(p.id)::int AS products
    FROM "Category" c LEFT JOIN "Product" p ON p."categoryId" = c.id
    GROUP BY c.name ORDER BY products DESC`;
  console.log("\n--- raw SQL: products per category ---");
  console.table(raw);

  // 6) Writes — uncomment to try (then check in Prisma Studio!)
  // const created = await db.product.create({
  //   data: {
  //     name: "Test Candle",
  //     slug: "test-candle",
  //     description: "Created from the query playground",
  //     priceCents: 999,
  //     category: { connect: { slug: "candles" } },
  //   },
  // });
  // console.log("created:", created.id);
  // await db.product.delete({ where: { slug: "test-candle" } });
  // console.log("…and deleted again");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
