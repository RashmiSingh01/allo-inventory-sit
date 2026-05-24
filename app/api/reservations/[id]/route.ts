import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: any) {
  const { id } = await params;
  const r = await prisma.reservation.findUnique({
    where: { id },
    include: { product: true, warehouse: true },
  });
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(r);
}
