import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const encoder = new TextEncoder()

function writeEvent(data: any) {
  return encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create response stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial connection event
          controller.enqueue(writeEvent({
            type: 'connected',
            payload: { userId: session.user.id }
          }))

          // Set up heartbeat
          const heartbeat = setInterval(() => {
            try {
              controller.enqueue(writeEvent({ type: 'ping' }))
            } catch (error) {
              console.error('[SSE] Heartbeat error:', error)
              clearInterval(heartbeat)
            }
          }, 30000)

          // Cleanup on connection close
          req.signal.addEventListener('abort', () => {
            clearInterval(heartbeat)
            controller.close()
          })

        } catch (error) {
          console.error('[SSE] Stream error:', error)
          controller.error(error)
        }
      }
    })

    // Return streamed response with correct headers
    const response = new Response(stream, {
      headers: new Headers({
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-store, no-transform',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none'
      })
    })

    // Important: disable automatic body parsing
    response.headers.set('x-no-parse-body', '1')
    
    return response

  } catch (error) {
    console.error('[SSE] Handler error:', error)
    return Response.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
