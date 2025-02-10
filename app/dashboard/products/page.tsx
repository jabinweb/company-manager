'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { DataTable } from '@/components/table/data-table'
import { columns, type Product } from './columns'

export default function ProductsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const companyId = session?.user?.primaryCompanyId

  const [products, setProducts] = useState<Product[]>([])
  const [filterOptions, setFilterOptions] = useState<{
    categories: { label: string; value: string }[]
  }>({ categories: [] })
  const [isLoading, setIsLoading] = useState(true)

  // Move async operation to useEffect
  useEffect(() => {
    let mounted = true

    const fetchProducts = async () => {
      if (!companyId) return

      try {
        setIsLoading(true)
        const response = await fetch('/api/products')
        const data = await response.json()
        
        if (!response.ok) throw new Error(data.error || 'Failed to fetch products')
        if (!mounted) return

        // Update states only if component is still mounted
        setProducts(data.products)
        
        const uniqueCategories = Array.from(
          new Set(data.products.map((p: Product) => p.category))
        ).filter((cat): cat is string => Boolean(cat))
        
        setFilterOptions({
          categories: uniqueCategories.map(cat => ({
            label: cat,
            value: cat
          }))
        })
      } catch (error) {
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch products"
          })
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProducts()

    // Cleanup function to prevent state updates after unmount
    return () => {
      mounted = false
    }
  }, [companyId])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => router.push('/dashboard/products/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        isLoading={isLoading}
        searchableColumn="name"
        filterableColumns={{
          category: {
            title: "Category",
            options: filterOptions.categories
          }
        }}
      />
    </div>
  )
}
