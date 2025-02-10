import { NextResponse } from 'next/server';

type ErrorResponse = {
  error: string;
  details?: unknown;
};

export function errorResponse(message: string, status = 500, details?: unknown) {
  return NextResponse.json<ErrorResponse>(
    { error: message, details }, 
    { status }
  );
}

export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json<ErrorResponse>(
    { error: message }, 
    { status: 401 }
  );
}

export function badRequestResponse(message: string, details?: unknown) {
  return NextResponse.json<ErrorResponse>(
    { error: message, details }, 
    { status: 400 }
  );
}

export function notFoundResponse(message = 'Not found') {
  return NextResponse.json<ErrorResponse>(
    { error: message }, 
    { status: 404 }
  );
}

export function validationErrorResponse(errors: unknown) {
  return NextResponse.json<ErrorResponse>(
    { error: 'Validation error', details: errors }, 
    { status: 422 }
  );
}
