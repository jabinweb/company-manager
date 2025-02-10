import { getServerSession } from '@/lib/server-session'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.primaryCompanyId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const resolvedParams = await params;
    const productId = resolvedParams.id;

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        companyId: session.user.currentCompanyId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        quantity: true,
        sku: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!product) {
      return new NextResponse(
        JSON.stringify({ error: "Product not found" }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new NextResponse(
      JSON.stringify(product),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch product" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.primaryCompanyId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const resolvedParams = await params;
    const productId = resolvedParams.id;

    await prisma.product.delete({
      where: {
        id: productId,
        companyId: session.user.currentCompanyId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete product" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.primaryCompanyId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const resolvedParams = await params;
    const productId = resolvedParams.id;
    const data = await request.json();

    const product = await prisma.product.update({
      where: {
        id: productId,
        companyId: session.user.currentCompanyId,
      },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        quantity: data.quantity,
        sku: data.sku,
        imageUrl: data.imageUrl,
      },
    });

    return new NextResponse(
      JSON.stringify(product),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to update product" }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
