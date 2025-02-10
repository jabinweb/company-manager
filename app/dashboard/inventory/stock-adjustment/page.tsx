'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { StockAdjustmentDialog } from "@/components/inventory/stock-adjustment-dialog"
import { TransactionHistoryDialog } from "@/components/inventory/transaction-history-dialog"
import { AlertsPanel } from "@/components/inventory/alerts-panel"

export default function StockAdjustmentPage() {
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)
  const [products, setProducts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const response = await fetch('/api/inventory')
    if (response.ok) {
      const data = await response.json()
      setProducts(data.data.products)
    }
  }

  return (
    <div className="p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          {/* Stock Adjustment content */}
          <StockAdjustmentDialog
            open={showAdjustmentDialog}
            onOpenChange={setShowAdjustmentDialog}
            products={products}
            onSubmit={async (data) => {
              // Handle adjustment submission
              await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              })
              fetchProducts()
            }}
          />
        </Card>
        <AlertsPanel />
      </div>
    </div>
  )
}
