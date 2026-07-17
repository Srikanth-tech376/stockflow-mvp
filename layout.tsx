import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function loadOwnedProduct(id: string, organizationId: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.organizationId !== organizationId) return null;
  return product;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const product = await loadOwnedProduct(params.id, session.organizationId);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  return NextResponse.json({ product });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const existing = await loadOwnedProduct(params.id, session.organizationId);
  if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? existing.name).trim();
  const sku = (body?.sku ?? existing.sku).trim();

  if (!name) return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  if (!sku) return NextResponse.json({ error: "SKU is required." }, { status: 400 });

  if (sku !== existing.sku) {
    const dupe = await prisma.product.findUnique({
      where: { organizationId_sku: { organizationId: session.organizationId, sku } },
    });
    if (dupe) {
      return NextResponse.json({ error: "That SKU is already in use in your organization." }, { status: 409 });
    }
  }

  const product = await prisma.product.update({
    where: { id: existing.id },
    data: {
      name,
      sku,
      description: body?.description ?? existing.description,
      quantityOnHand: body?.quantityOnHand === undefined ? existing.quantityOnHand : +body.quantityOnHand,
      costPrice: body?.costPrice === "" || body?.costPrice == null ? null : +body.costPrice,
      sellingPrice: body?.sellingPrice === "" || body?.sellingPrice == null ? null : +body.sellingPrice,
      lowStockThreshold:
        body?.lowStockThreshold === "" || body?.lowStockThreshold == null
          ? null
          : +body.lowStockThreshold,
      lastUpdatedBy: session.email,
    },
  });

  return NextResponse.json({ product });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const existing = await loadOwnedProduct(params.id, session.organizationId);
  if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  await prisma.product.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
