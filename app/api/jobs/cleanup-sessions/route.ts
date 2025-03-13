import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (apiKey !== process.env.CRON_API_KEY) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Delete expired sessions
    const result = await prisma.userSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lte: new Date() } },
          { isValid: false }
        ]
      }
    })

    return new Response(JSON.stringify({ 
      deletedCount: result.count 
    }), { 
      headers: { 'Content-Type': 'application/json' } 
    })
  } catch (error) {
    console.error('Session cleanup error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
