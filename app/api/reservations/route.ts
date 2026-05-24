import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, warehouseId, quantity } = body;

  if (!productId || !warehouseId || !quantity) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const rows = await tx.$executeRaw`
        UPDATE "StockLevel"
        SET "reservedUnits" = "reservedUnits" + ${quantity}
        WHERE "productId" = ${productId}
          AND "warehouseId" = ${warehouseId}
          AND ("totalUnits" - "reservedUnits") >= ${quantity}
      `;

      if (rows === 0) throw new Error("NO_STOCK");

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      return tx.reservation.create({
        data: { productId, warehouseId, quantity, expiresAt },
        include: {
          product: true,
          warehouse: true,
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e: any) {
    if (e.message === "NO_STOCK") {
      return NextResponse.json({ error: "not enough stock" }, { status: 409 });
    }
    return NextResponse.json({ error: "something went wrong" }, { status: 500 });
  }
}
