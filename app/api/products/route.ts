import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      stockLevels: { include: { warehouse: true } },
    },
  });

  const data = products.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stockLevels.map((s: any) => ({
      warehouseId: s.warehouseId,
      warehouseName: s.warehouse.name,
      available: s.totalUnits - s.reservedUnits,
    })),
  }));

  return NextResponse.json(data);
}
