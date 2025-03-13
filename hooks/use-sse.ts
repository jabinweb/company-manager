'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from './use-session'
import type { MessageAPIPayload } from '@/types/messages'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected'

interface SSEOptions {
  url?: string
  onMessage?: (event: MessageEvent) => void
  onError?: (error: Event) => void
  retry?: boolean
  retryInterval?: number
  maxRetries?: number
}

interface SSEHookReturn {
  status: ConnectionStatus
  send: (message: any) => void
  addHandler: (type: string, handler: (data: any) => void) => void
}

export function useSSE(options: SSEOptions = {}): SSEHookReturn {
  const { data: session } = useSession()
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const eventSourceRef = useRef<EventSource | null>(null)
  const handlersRef = useRef<Record<string, (data: any) => void>>({})
  const messageQueueRef = useRef<MessageAPIPayload[]>([])
  const retryTimeoutRef = useRef<NodeJS.Timeout>()

  const send = useCallback((message: MessageAPIPayload) => {
    if (status === 'connected') {
      fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      }).catch(error => {
        console.error('[SSE] Send error:', error)
        messageQueueRef.current.push(message)
      })
    } else {
      messageQueueRef.current.push(message)
    }
  }, [status])

  const connect = useCallback(() => {
    if (!session?.token) return

    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }

      setStatus('connecting')
      const source = new EventSource(`/api/sse?token=${session.token}`)
      eventSourceRef.current = source

      source.onopen = () => {
        setStatus('connected')
        // Process queued messages
        while (messageQueueRef.current.length > 0) {
          const msg = messageQueueRef.current.shift()
          if (msg) send(msg)
        }
      }

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handlersRef.current[data.type]?.(data)
          options.onMessage?.(event)
        } catch (error) {
          console.error('[SSE] Message error:', error)
        }
      }

      source.onerror = () => {
        source.close()
        setStatus('disconnected')
        retryTimeoutRef.current = setTimeout(connect, 3000)
      }
    } catch (error) {
      console.error('[SSE] Connect error:', error)
      setStatus('disconnected')
    }
  }, [session?.token, options.onMessage, send])

  useEffect(() => {
    if (session?.token) {
      connect()
    }
    return () => {
      retryTimeoutRef.current && clearTimeout(retryTimeoutRef.current)
      eventSourceRef.current?.close()
    }
  }, [connect, session?.token])

  const addHandler = useCallback((type: string, handler: (data: any) => void) => {
    handlersRef.current[type] = handler
  }, [])

  return {
    status,
    send,
    addHandler
  }
}



