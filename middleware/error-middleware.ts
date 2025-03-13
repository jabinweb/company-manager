import { NextResponse } from 'next/server';

export function handleApiError(error: unknown) {
  console.error('[API Error]:', error);
  
  return NextResponse.json(
    { 
      success: false, 
      error: 'Internal server error' 
    },
    { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}
