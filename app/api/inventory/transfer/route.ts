import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.currentCompanyId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const companyId = session.user.currentCompanyId
    const { productId, sourceLocationId, targetLocationId, quantity, batchNumber } = await request.json()

    // Validate request
    if (!productId || !sourceLocationId || !targetLocationId || !quantity) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Execute transfer in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Check source location inventory
      const sourceInventory = await tx.inventory.findFirst({
        where: {
          productId,
          locationId: sourceLocationId,
          type: 'IN_STOCK',
          companyId
        }
      })

      if (!sourceInventory || sourceInventory.quantity < quantity) {
        throw new Error("Insufficient stock at source location")
      }

      // 1. Create stock transfer record - Fixed casing to match schema
      const stockTransfer = await tx.stockTransfer.create({
        data: {
          id: randomUUID(),
          product: { // Changed from Product to product
            connect: { id: productId }
          },
          sourceLocation: {
            connect: { id: sourceLocationId }
          },
          targetLocation: {
            connect: { id: targetLocationId }
          },
          company: { // Changed from Company to company
            connect: { id: companyId }
          },
          quantity,
          batchNumber,
          updatedAt: new Date()
        },
        include: {
          product: true, // Changed from Product to product
          sourceLocation: true,
          targetLocation: true
        }
      })

      // 2. Create outbound inventory record
      await tx.inventory.create({
        data: {
          id: randomUUID(),
          Product: { // Changed from Product to product
            connect: { id: productId }
          },
          Location: { // Changed from Location to location
            connect: { id: sourceLocationId }
          },
          Company: { // Changed from Company to company
            connect: { id: companyId }
          },
          quantity: -quantity,
          type: 'TRANSFER_OUT',
          reason: 'Stock Transfer',
          price: sourceInventory.price,
          updatedAt: new Date()
        }
      })

      // 3. Create inbound inventory record
      await tx.inventory.create({
        data: {
          id: randomUUID(),
          Product: { // Changed from Product to product
            connect: { id: productId }
          },
          Location: { // Changed from Location to location
            connect: { id: targetLocationId }
          },
          Company: { // Changed from Company to company
            connect: { id: companyId }
          },
          quantity,
          type: 'TRANSFER_IN',
          reason: 'Stock Transfer',
          price: sourceInventory.price,
          updatedAt: new Date()
        }
      })

      return stockTransfer
    })

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Failed to process transfer"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
