'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, PackageOpen, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { InventoryAlert } from '@/types/inventory'

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])

  useEffect(() => {
    async function fetchAlerts() {
      const response = await fetch('/api/inventory/alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts([...data.data.lowStock, ...data.data.expiringSoon])
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Inventory Alerts</h3>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Alert key={`${alert.type}-${alert.product.id}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              {alert.type === 'LOW_STOCK' ? (
                <PackageOpen className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              {alert.product.name}
              <Badge variant={alert.type === 'LOW_STOCK' ? 'destructive' : 'secondary'}>
                {alert.type === 'LOW_STOCK' ? 'Low Stock' : 'Expiring Soon'}
              </Badge>
            </AlertTitle>
            <AlertDescription>
              {alert.type === 'LOW_STOCK' ? (
                `Current quantity (${alert.currentQuantity}) is below minimum (${alert.threshold})`
              ) : (
                `Expires ${formatDistanceToNow(new Date(alert.expiryDate!), { addSuffix: true })}`
              )}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    </Card>
  )
}
