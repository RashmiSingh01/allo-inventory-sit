import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const w1 = await prisma.warehouse.create({ data: { name: "Delhi", location: "New Delhi" } });
  const w2 = await prisma.warehouse.create({ data: { name: "Mumbai", location: "Mumbai" } });

  const p1 = await prisma.product.create({ data: { name: "Wireless Headphones", price: 4999 } });
  const p2 = await prisma.product.create({ data: { name: "Smart Watch", price: 8999 } });

  await prisma.stockLevel.createMany({
    data: [
      { productId: p1.id, warehouseId: w1.id, totalUnits: 20 },
      { productId: p1.id, warehouseId: w2.id, totalUnits: 1 },
      { productId: p2.id, warehouseId: w1.id, totalUnits: 10 },
      { productId: p2.id, warehouseId: w2.id, totalUnits: 5 },
    ],
  });

  console.log("done");
}

main().catch(console.error).finally(() => prisma.$disconnect());
