'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'

interface CallTimerProps {
  startTime: Date
}

export function CallTimer({ startTime }: CallTimerProps) {
  const [duration, setDuration] = useState('00:00')

  useEffect(() => {
    const updateDuration = () => {
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      const minutes = Math.floor(diffInSeconds / 60)
      const seconds = diffInSeconds % 60
      setDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    // Update immediately and then every second
    updateDuration()
    const interval = setInterval(updateDuration, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  return (
    <span className="text-xs font-mono ml-2">
      {duration}
    </span>
  )
}
