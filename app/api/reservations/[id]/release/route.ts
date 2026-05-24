import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: any) {
  const { id } = await params;
  const r = await prisma.reservation.findUnique({ where: { id } });

  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (r.status !== "PENDING") return NextResponse.json(r);

  const updated = await prisma.$transaction([
    prisma.stockLevel.updateMany({
      where: { productId: r.productId, warehouseId: r.warehouseId },
      data: { reservedUnits: { decrement: r.quantity } },
    }),
    prisma.reservation.update({ where: { id }, data: { status: "RELEASED" } }),
  ]);

  return NextResponse.json(updated[1]);
}
