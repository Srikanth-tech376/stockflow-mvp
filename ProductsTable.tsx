import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// POST /api/products/:id/adjust  { delta: number, note?: string }
// Lets the list/detail page bump quantity up or down without opening the full edit form.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product || product.organizationId !== session.organizationId) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const delta = Number(body?.delta);
  if (!Number.isFinite(delta) || delta === 0) {
    return NextResponse.json({ error: "Provide a non-zero delta." }, { status: 400 });
  }

  const newQty = product.quantityOnHand + delta;
  if (newQty < 0) {
    return NextResponse.json({ error: "Quantity can't go below zero." }, { status: 400 });
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { quantityOnHand: newQty, lastUpdatedBy: session.email },
  });

  return NextResponse.json({ product: updated });
}
