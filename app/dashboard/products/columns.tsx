'use client'

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ActionButtons } from "@/components/ActionButtons"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export type Product = {
  id: string
  name: string
  description: string
  price: number
  category: string
  quantity: number
  sku: string
  imageUrl: string
  createdAt: string
}

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableColumnFilter: true,
    enableSorting: true,
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={product.imageUrl || `https://avatar.vercel.sh/${product.name}`} 
              alt={product.name}
            />
            <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <Link 
            href={`/dashboard/products/${product.id}`}
            className="font-medium hover:underline text-blue-600"
          >
            {product.name}
          </Link>
        </div>
      )
    },
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "category",
    header: "Category",
    enableColumnFilter: true,
    enableSorting: true,
    filterFn: (row, id, filterValues: string[]) => {
      const value = row.getValue(id) as string
      return filterValues.length === 0 ? true : filterValues.includes(value)
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => `$${row.getValue<number>("price").toFixed(2)}`,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const quantity = row.getValue<number>("quantity")
      return (
        <Badge variant={quantity > 0 ? "default" : "destructive"}>
          {quantity > 0 ? `${quantity} in stock` : "Out of stock"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.getValue<string>("createdAt")).toLocaleDateString(),
  },
  {
    id: "actions",
    cell: ({ row }) => <RowActions product={row.original} />
  }
]

function RowActions({ product }: { product: Product }) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to delete product');
      
      toast({
        title: "Success",
        description: "Product deleted successfully"
      });
      
      // Refresh the page
      router.refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete product"
      });
    }
  };

  return (
    <ActionButtons
      onView={() => router.push(`/dashboard/products/${product.id}`)}
      onEdit={() => router.push(`/dashboard/products/${product.id}/edit`)}
      onDelete={handleDelete}
    />
  );
}
