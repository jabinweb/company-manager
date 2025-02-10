'use client'

import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'
import { Button } from '@/components/ui/button'
import { Camera, StopCircle } from 'lucide-react'

interface BarcodeScannerProps {
  onDetected: (result: string) => void
  onError?: (error: Error) => void
}

export function BarcodeScanner({ onDetected, onError }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const codeReader = useRef(new BrowserMultiFormatReader())

  const startScanning = async () => {
    try {
      if (!videoRef.current) return

      setIsScanning(true)
      const videoInputDevices = await codeReader.current.listVideoInputDevices()
      const selectedDevice = videoInputDevices[0]?.deviceId

      if (selectedDevice) {
        await codeReader.current.decodeFromVideoDevice(
          selectedDevice,
          videoRef.current,
          (result, error) => {
            if (result) {
              onDetected(result.getText())
              stopScanning()
            }
            if (error && onError) {
              onError(error)
            }
          }
        )
      }
    } catch (error) {
      if (error instanceof Error && onError) {
        onError(error)
      }
    }
  }

  const stopScanning = () => {
    codeReader.current.reset()
    setIsScanning(false)
  }

  useEffect(() => {
    const currentReader = codeReader.current

    return () => {
      if (currentReader) {
        currentReader.reset()
      }
    }
  }, [onDetected])

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full max-w-sm mx-auto bg-black rounded-lg overflow-hidden">
        <video ref={videoRef} className="w-full h-full object-cover" />
      </div>
      <div className="flex justify-center gap-4">
        {!isScanning ? (
          <Button onClick={startScanning}>
            <Camera className="mr-2 h-4 w-4" />
            Start Scanning
          </Button>
        ) : (
          <Button variant="destructive" onClick={stopScanning}>
            <StopCircle className="mr-2 h-4 w-4" />
            Stop Scanning
          </Button>
        )}
      </div>
    </div>
  )
}
