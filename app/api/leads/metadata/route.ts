import { NextRequest } from 'next/server';
import { LeadStatus, Priority } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const metadata = {
      statuses: Object.values(LeadStatus).map(status => ({
        label: status.toLowerCase(),
        value: status
      })),
      priorities: Object.values(Priority).map(priority => ({
        label: priority.toLowerCase(),
        value: priority
      })),
      sources: [
        { label: "Website", value: "WEBSITE" },
        { label: "Referral", value: "REFERRAL" },
        { label: "Direct", value: "DIRECT" },
        { label: "Social", value: "SOCIAL" }
      ]
    };

    return new Response(JSON.stringify(metadata), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
