'use client'

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import type { BatchItem } from "@/types/inventory"

export default function BatchesPage() {
  const [batches, setBatches] = useState<BatchItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    try {
      const response = await fetch('/api/inventory/batch')
      if (!response.ok) throw new Error('Failed to fetch batches')
      const data = await response.json()
      setBatches(data.data)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch batches"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredBatches = batches.filter(batch =>
    batch.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Batch Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              className="pl-8 w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Batch
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {/* Table content */}
      </Card>
    </div>
  )
}
