import { getServerSession } from '@/lib/server-session';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { randomUUID } from 'crypto';

// Safe logging utility
function safeLog(message: string, data?: any) {
  try {
    console.log(message, data ? JSON.stringify(data, null, 2) : '');
  } catch (e) {
    console.log(message, 'Data could not be stringified');
  }
}

// Improved error handling utility
function handleError(error: unknown, context: string) {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorDetails = {
    context,
    message: errorMessage,
    timestamp: new Date().toISOString(),
  };

  safeLog(`Inventory Error [${context}]:`, errorDetails);

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma specific errors
    const prismaError = {
      code: error.code,
      message: errorMessage,
      details: errorDetails,
    };

    switch (error.code) {
      case 'P2025':
        return NextResponse.json({ error: prismaError }, { status: 404 });
      case 'P2002':
        return NextResponse.json({ error: prismaError }, { status: 409 });
      default:
        return NextResponse.json({ error: prismaError }, { status: 500 });
    }
  }

  return NextResponse.json(
    { error: errorDetails },
    { status: 500 }
  );
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.currentCompanyId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { productId, quantity, reason, notes, type = 'IN_STOCK' } = await req.json()

    const inventory = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId }
      })

      if (!product) {
        throw new Error('Product not found')
      }

      // Create inventory record
      const record = await tx.inventory.create({
        data: {
          id: randomUUID(),
          type,
          quantity,
          price: product.price,
          productId,
          companyId: session?.user?.currentCompanyId,
          reason,
          ...(notes && { notes }),
          updatedAt: new Date()
        }
      })

      // Update product quantity
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          quantity: {
            increment: quantity
          }
        }
      })

      return {
        inventory: record,
        product: updatedProduct
      }
    })

    return new Response(JSON.stringify(inventory), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return handleError(error, "Failed to create inventory record")
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.currentCompanyId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');

    const [inventoryItems, products] = await Promise.all([
      prisma.inventory.findMany({
        where: {
          companyId: session.user.currentCompanyId,
          ...(productId ? { productId } : {})
        },
        include: {
          Product: {
            select: {
              id: true,
              name: true,
              sku: true,
            }
          },
          Location: {
            select: {
              id: true,
              name: true,
              code: true,
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      !productId ? prisma.product.findMany({
        where: { 
          companyId: session.user.currentCompanyId,
        },
        select: {
          id: true,
          name: true,
          sku: true,
          quantity: true,
          price: true,
          minQuantity: true,
          maxQuantity: true,
          _count: {
            select: {
              Inventory: true
            }
          }
        },
      }) : null
    ]);

    // Process products to include stock status
    const processedProducts = products?.map(product => ({
      ...product,
      stockStatus: {
        isLowStock: typeof product.minQuantity === 'number' && product.quantity <= product.minQuantity,
        isOverStock: typeof product.maxQuantity === 'number' && product.quantity > product.maxQuantity,
      },
      _count: {
        inventory: product._count.Inventory // Match the case from schema
      }
    }));

    return NextResponse.json({
      data: {
        inventory: inventoryItems.map(item => ({
          ...item,
          product: item.Product,
          location: item.Location
        })),
        products: processedProducts || []
      }
    });

  } catch (error) {
    return handleError(error, "Failed to fetch inventory data");
  }
}