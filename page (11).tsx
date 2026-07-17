import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/products?q=search-term
// Lists products scoped to the caller's organization only.
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const products = await prisma.product.findMany({
    where: {
      organizationId: session.organizationId,
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { sku: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

// POST /api/products — create a product for the caller's organization.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = (body?.name || "").trim();
  const sku = (body?.sku || "").trim();

  if (!name) return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  if (!sku) return NextResponse.json({ error: "SKU is required." }, { status: 400 });

  const dupe = await prisma.product.findUnique({
    where: { organizationId_sku: { organizationId: session.organizationId, sku } },
  });
  if (dupe) {
    return NextResponse.json({ error: "That SKU is already in use in your organization." }, { status: 409 });
  }

  const product = await prisma.product.create({
    data: {
      organizationId: session.organizationId,
      name,
      sku,
      description: body?.description || null,
      quantityOnHand: Number.isFinite(+body?.quantityOnHand) ? +body.quantityOnHand : 0,
      costPrice: body?.costPrice === "" || body?.costPrice == null ? null : +body.costPrice,
      sellingPrice: body?.sellingPrice === "" || body?.sellingPrice == null ? null : +body.sellingPrice,
      lowStockThreshold:
        body?.lowStockThreshold === "" || body?.lowStockThreshold == null
          ? null
          : +body.lowStockThreshold,
      lastUpdatedBy: session.email,
    },
  });

  return NextResponse.json({ product }, { status: 201 });
}
