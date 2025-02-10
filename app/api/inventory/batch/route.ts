import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.currentCompanyId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { batchNumber, serialNumber, quantity, expiryDate, productId, locationId } = await req.json()

    const batch = await prisma.batchItem.create({
      data: {
        id: randomUUID(),
        batchNumber,
        serialNumber,
        quantity,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        productId,
        locationId,
        updatedAt: new Date(),
        Location: {
          connect: { id: locationId }
        },
        Product: {
          connect: { id: productId }
        }
      }
    })

    return new Response(JSON.stringify(batch), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Batch creation error:', error)
    return new Response(JSON.stringify({
      error: 'Failed to create batch',
      details: error instanceof Error ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const locationId = searchParams.get('locationId')

    const batches = await prisma.batchItem.findMany({
      where: {
        ...(productId && { productId }),
        ...(locationId && { locationId }),
      },
      include: {
        Product: true, // Changed from product to Product
        Location: true, // Changed from location to Location
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return new Response(JSON.stringify({ data: batches }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: "Failed to fetch batches",
      details: error instanceof Error ? error.message : undefined
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
