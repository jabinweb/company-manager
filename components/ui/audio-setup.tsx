'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Volume2, VolumeX } from 'lucide-react'
import { audioService } from '@/lib/audio-service'

export function AudioSetup() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [audioPermission, setAudioPermission] = useState<'granted' | 'denied' | 'pending'>('pending')

  // Check if audio needs permission/initialization
  useEffect(() => {
    const checkAudioPermission = async () => {
      try {
        // Try playing a silent audio to check permissions
        const audio = new Audio()
        await audio.play()
        audio.pause()
        setAudioPermission('granted')
        setShowPrompt(false)
      } catch (error) {
        console.log('[AudioSetup] Audio permission needed')
        setAudioPermission('denied')
        setShowPrompt(true)
      }
    }

    checkAudioPermission()
  }, [])

  const handleEnableAudio = useCallback(async () => {
    try {
      // Initialize audio service
      await audioService.prepare()
      
      // Play a short test sound
      await audioService.playRingtone()
      setTimeout(() => audioService.stopRingtone(), 500)
      
      setAudioPermission('granted')
      setShowPrompt(false)
      
      console.log('[AudioSetup] Audio enabled successfully')
    } catch (error) {
      console.error('[AudioSetup] Failed to enable audio:', error)
      setAudioPermission('denied')
    }
  }, [])

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-4">
        {audioPermission === 'denied' ? (
          <VolumeX className="h-5 w-5 text-red-500" />
        ) : (
          <Volume2 className="h-5 w-5 text-blue-500 animate-pulse" />
        )}
        <div className="flex flex-col">
          <p className="text-sm font-medium">
            {audioPermission === 'denied' 
              ? 'Audio permission required for calls'
              : 'Enable audio for incoming calls?'
            }
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click to enable audio notifications
          </p>
        </div>
        <Button
          size="sm"
          variant={audioPermission === 'denied' ? 'destructive' : 'default'}
          onClick={handleEnableAudio}
          className="ml-2"
        >
          Enable Audio
        </Button>
      </div>
    </div>
  )
}
