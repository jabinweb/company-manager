'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Plus, History, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StockAdjustmentDialog } from "@/components/inventory/stock-adjustment-dialog"
import { TransactionHistoryDialog } from "@/components/inventory/transaction-history-dialog"
import { toast } from '@/hooks/use-toast'
import type { Product } from '@/types/inventory'

interface StockLevel extends Pick<Product, 'id' | 'name' | 'sku' | 'quantity' | 'price' | 'minQuantity' | 'maxQuantity'> {
  _count: {
    inventory: number
  },
  stockStatus: {
    isLowStock: boolean,
    isOverStock: boolean,
  }
}

interface InventoryTransaction {
  id: string
  type: 'IN' | 'OUT'
  quantity: number
  price: number
  reason: string
  notes?: string
  createdAt: string
  product: Pick<Product, 'id' | 'name' | 'sku'>
}

interface InventoryData {
  data: {
    products: StockLevel[]
    inventory: InventoryTransaction[]
  }
}

export default function InventoryPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const [inventoryData, setInventoryData] = useState<InventoryData>({
    data: {
      products: [],
      inventory: []
    }
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false)
  const [showHistoryDialog, setShowHistoryDialog] = useState(false)

  useEffect(() => {
    fetchInventory()
  }, [session])

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/inventory')
      if (!response.ok) throw new Error('Failed to fetch inventory')
      
      const data = await response.json()
      setInventoryData(data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch inventory"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredStockLevels = inventoryData.data.products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleStockAdjustment = async (data: {
    productId: string
    type: 'IN' | 'OUT'
    quantity: number
    reason: string
    notes?: string
  }) => {
    try {
      const response = await fetch('/api/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update inventory')

      toast({
        title: "Success",
        description: "Inventory updated successfully"
      })
      
      fetchInventory()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update inventory"
      })
      throw error // Re-throw to be handled by the dialog
    }
  }

  const stats = {
    totalProducts: inventoryData.data.products.length,
    totalValue: inventoryData.data.products.reduce((acc, p) => acc + (p.price * p.quantity), 0),
    lowStock: inventoryData.data.products.filter(p => p.stockStatus.isLowStock).length,
    overStock: inventoryData.data.products.filter(p => p.stockStatus.isOverStock).length
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Total Products</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.totalProducts}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm font-medium">Low Stock Items</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.lowStock}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Over Stock Items</span>
          </div>
          <p className="text-2xl font-bold mt-2">{stats.overStock}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium">Total Value</span>
          </div>
          <p className="text-2xl font-bold mt-2">${stats.totalValue.toFixed(2)}</p>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product name or SKU"
              className="pl-8 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setShowAdjustmentDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Stock Adjustment
            </Button>
            <Button variant="outline" onClick={() => setShowHistoryDialog(true)}>
              <History className="h-4 w-4 mr-2" />
              Transaction History
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Transactions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredStockLevels.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No products found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStockLevels.map((product) => (
                    <TableRow 
                      key={product.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => router.push(`/dashboard/inventory/products/${product.id}`)}
                    >
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            product.quantity <= product.minQuantity 
                              ? "destructive" 
                              : product.quantity >= (product.maxQuantity || Infinity)
                              ? "outline"
                              : "default"
                          }>
                            {product.quantity}
                          </Badge>
                          {product.quantity <= product.minQuantity && (
                            <span className="text-xs text-red-500">Low Stock</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>${(product.quantity * product.price).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          product.stockStatus.isLowStock
                            ? "destructive"
                            : product.stockStatus.isOverStock
                            ? "outline"
                            : "default"
                        }>
                          {product.stockStatus.isLowStock
                            ? "Low Stock"
                            : product.stockStatus.isOverStock
                            ? "Over Stock"
                            : "In Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>{product._count.inventory} transactions</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
        <div>
        </div>
      </div>

      <StockAdjustmentDialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog}
        products={inventoryData.data.products}
        onSubmit={handleStockAdjustment}
      />

      <TransactionHistoryDialog
        open={showHistoryDialog}
        onOpenChange={setShowHistoryDialog}
        transactions={inventoryData.data.inventory}
      />
    </div>
  )
}