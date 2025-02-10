import { getServerSession } from '@/lib/server-session'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { Prisma } from "@prisma/client";

const handleError = (error: unknown, defaultMessage: string) => {
  console.error(error);
  return new NextResponse(
    JSON.stringify({ 
      error: defaultMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }),
    { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession()
    console.log('Session:', session);
    
    if (!session?.user?.primaryCompanyId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("size") ?? "10")));
    const search = searchParams.get("search") ?? "";
    const category = searchParams.get("category");

    const skip = (page - 1) * limit;

    let where: Prisma.ProductWhereInput = { 
      companyId: session.user.currentCompanyId,
      ...(category && category !== 'All' ? { category } : {})
    };

    if (search) {
      where = {
        ...where,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    try {
      const [products, total, categories] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
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
          },
        }),
        prisma.product.count({ where }),
        prisma.product.findMany({
          where: { 
            companyId: session.user.currentCompanyId,
            category: { not: '' }
          },
          distinct: ['category'],
          select: { category: true },
          orderBy: { category: 'asc' }
        })
      ]);

      const responseData = {
        products,
        total,
        pages: Math.ceil(total / limit),
        metadata: {
          categories: categories.map(c => c.category)
        }
      };

      return new NextResponse(
        JSON.stringify(responseData),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      return handleError(dbError, "Database operation failed");
    }
  } catch (error) {
    return handleError(error, "Request processing failed");
  }
}

export async function POST(req: Request) {
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

    const data = await req.json().catch(() => {
      throw new Error("Invalid JSON in request body");
    });

    if (!data.name || !data.category || !data.sku) {
      return new NextResponse(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    try {
      const product = await prisma.product.create({
        data: {
          ...data,
          companyId: session.user.currentCompanyId,
        },
      }).catch(error => {
        throw new Error(`Failed to create product: ${error.message}`);
      });

      return new NextResponse(
        JSON.stringify(product),
        { 
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    } catch (dbError) {
      return handleError(dbError, "Failed to create product");
    }
  } catch (error) {
    return handleError(error, "Request processing failed");
  }
}

