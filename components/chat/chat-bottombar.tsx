'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { ChatInput } from './chat-input'
import { Paperclip, Mic, CornerDownLeft, MicOff } from 'lucide-react'
import { EmojiPicker } from './emoji-picker'
import type { SpeechRecognition } from '@/types/speech-recognition'

interface ChatBottombarProps {
  onSend: (content: string) => void
  onTyping?: () => void
  disabled?: boolean
  isMobile?: boolean
  receiverId: string
}

export default function ChatBottombar({ onSend, onTyping, disabled, isMobile, receiverId }: ChatBottombarProps) {
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join('')
          
          setInput(transcript)
          onTyping?.()
        }
      }
    }
  }, [onTyping])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || disabled) return

    const content = input.trim()
    setInput('')
    setIsListening(false)
    recognitionRef.current?.stop()
    inputRef.current?.focus()

    try {
      await onSend(content)
      onTyping?.() // Notify typing after successful send
    } catch (error) {
      console.error('[ChatBottombar] Send failed:', error)
      // Could show error toast here
    }
  }, [input, disabled, onSend, onTyping])

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop()
    } else {
      recognitionRef.current?.start()
    }
    setIsListening(!isListening)
  }, [isListening])

  // Add typing notification on input
  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    onTyping?.()
  }, [onTyping])

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="icon" disabled={disabled}>
          <Paperclip className="h-5 w-5" />
        </Button>

        <EmojiPicker
          onChange={(emoji) => {
            setInput(prev => prev + emoji)
            onTyping?.()
          }}
          // disabled={disabled}
        />

        <ChatInput
          ref={inputRef}
          value={input}
          onChange={handleInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              formRef.current?.requestSubmit()
            }
          }}
          placeholder={isListening ? "Listening..." : "Type a message..."}
          className="flex-1"
          disabled={disabled}
        />

        <Button 
          type="button"
          variant={isListening ? "default" : "ghost"}
          size="icon"
          onClick={toggleListening}
          disabled={disabled}
          className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>

        <Button 
          type="submit" 
          size="icon"
          disabled={!input.trim() || disabled}
        >
          <CornerDownLeft className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}