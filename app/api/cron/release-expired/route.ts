import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const expired = await prisma.reservation.findMany({
    where: { status: "PENDING", expiresAt: { lt: new Date() } },
  });

  for (const r of expired) {
    await prisma.$transaction([
      prisma.stockLevel.updateMany({
        where: { productId: r.productId, warehouseId: r.warehouseId },
        data: { reservedUnits: { decrement: r.quantity } },
      }),
      prisma.reservation.update({ where: { id: r.id }, data: { status: "RELEASED" } }),
    ]);
  }

  return NextResponse.json({ released: expired.length });
}
