import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const org = await prisma.organization.findUnique({ where: { id: session.organizationId } });
  return NextResponse.json({ defaultLowStockThreshold: org?.defaultLowStockThreshold ?? 5 });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const value = Number(body?.defaultLowStockThreshold);
  if (!Number.isFinite(value) || value < 0) {
    return NextResponse.json({ error: "Threshold must be a non-negative number." }, { status: 400 });
  }

  const org = await prisma.organization.update({
    where: { id: session.organizationId },
    data: { defaultLowStockThreshold: Math.floor(value) },
  });

  return NextResponse.json({ defaultLowStockThreshold: org.defaultLowStockThreshold });
}
