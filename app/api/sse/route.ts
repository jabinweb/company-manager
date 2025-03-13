import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const preferredRegion = 'auto'
export const maxDuration = 60 // 1 minutes

const connections = new Map<string, WritableStreamDefaultWriter<any>>()
const encoder = new TextEncoder()
const HEARTBEAT_INTERVAL = 30000 // 30 seconds

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const userId = session.user.employeeId
    const stream = new TransformStream()
    const writer = stream.writable.getWriter()

    // Send initial connection message
    await writer.write(
      encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
    )

    let isConnected = true
    const heartbeat = setInterval(async () => {
      if (!isConnected) {
        clearInterval(heartbeat)
        return
      }
      try {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ type: 'heartbeat' })}\n\n`)
        )
      } catch {
        isConnected = false
        clearInterval(heartbeat)
      }
    }, HEARTBEAT_INTERVAL)

    // Cleanup on disconnect
    req.signal.addEventListener('abort', () => {
      isConnected = false
      clearInterval(heartbeat)
      writer.close()
    })

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[SSE] Error:', error)
    return new Response('Error', { status: 500 })
  }
}

// Helper to broadcast messages to connected clients
export async function broadcast(message: any, excludeSessionId?: string) {
  const encoder = new TextEncoder()
  const encoded = encoder.encode(`data: ${JSON.stringify(message)}\n\n`)

  // Use Array.from to convert Map entries to array for iteration
  await Promise.all(
    Array.from(connections).map(async ([sessionId, writer]) => {
      if (sessionId !== excludeSessionId) {
        try {
          await writer.write(encoded)
        } catch (error) {
          connections.delete(sessionId)
        }
      }
    })
  )
}

// Clean up on module reload
globalThis.addEventListener?.('beforeunload', () => {
  // Use Array.from for values iteration
  Array.from(connections.values()).forEach(writer => {
    writer.close()
  })
  connections.clear()
})



