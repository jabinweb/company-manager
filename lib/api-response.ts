import { NextResponse } from "next/server"

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export function createApiResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    success: true
  }
}

export function createErrorResponse(error: string | Error, status = 500): NextResponse {
  const message = error instanceof Error ? error.message : error
  console.error(`API Error: ${message}`)
  
  return NextResponse.json({
    success: false,
    error: message,
    details: process.env.NODE_ENV === 'development' ? error : undefined
  }, { status })
}