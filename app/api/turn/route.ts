import { NextRequest } from 'next/server';
import { getServerSession } from '@/lib/server-session';
import { createHash } from 'crypto';

// TURN credentials generation
const TURN_SECRET = process.env.TURN_SECRET || 'your-secret-key';
const CREDENTIAL_TTL = 86400; // 24 hours

function generateCredentials(username: string) {
  const timestamp = Math.floor(Date.now()/1000) + CREDENTIAL_TTL;
  const hashContent = `${timestamp}:${username}:${TURN_SECRET}`;
  const credential = createHash('sha1').update(hashContent).digest('hex');
  
  const isProduction = process.env.VERCEL_ENV === 'production';
  const host = process.env.TURN_SERVER_HOST;
  const port = process.env.TURN_SERVER_PORT;
  
  return {
    username: `${timestamp}:${username}`,
    credential,
    ttl: CREDENTIAL_TTL,
    urls: [
      `turn:${host}:${port}?transport=tcp`,
      `turns:${host}:${port}?transport=tcp`
    ]
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.employeeId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const credentials = generateCredentials(session.user.employeeId);
    
    return new Response(JSON.stringify({
      iceServers: [
        {
          urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302'
          ]
        },
        credentials
      ]
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('[TURN] Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
