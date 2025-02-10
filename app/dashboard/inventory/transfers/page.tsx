'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { StockTransfer, Location } from "@/types/inventory"
import { BarcodeScanner } from "@/components/inventory/barcode-scanner"

export default function StockTransferPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [transfer, setTransfer] = useState<Partial<StockTransfer>>({})
  const [showScanner, setShowScanner] = useState(false)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/locations')
      if (!response.ok) throw new Error('Failed to fetch locations')
      const data = await response.json()
      setLocations(data.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load locations"
      })
    }
  }

  const handleTransfer = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/inventory/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transfer),
      })

      if (!response.ok) throw new Error('Transfer failed')

      toast({
        title: "Success",
        description: "Stock transfer completed successfully"
      })
      
      setTransfer({})
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete stock transfer"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Stock Transfer</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <form onSubmit={(e) => { e.preventDefault(); handleTransfer(); }} className="space-y-4">
            {/* Form content */}
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Processing..." : "Transfer Stock"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Scan Product</h2>
          {showScanner ? (
            <BarcodeScanner
              onDetected={(result) => {
                setTransfer(prev => ({ ...prev, productId: result }))
                setShowScanner(false)
              }}
              onError={(error) => {
                toast({
                  variant: "destructive",
                  title: "Scanner Error",
                  description: error.message
                })
              }}
            />
          ) : (
            <Button onClick={() => setShowScanner(true)} className="w-full">
              Start Scanner
            </Button>
          )}
        </Card>
      </div>
    </div>
  )
}
