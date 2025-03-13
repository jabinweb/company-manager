'use client'

import { useState } from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from './data-table-pagination'
import { DataTableToolbar } from './data-table-toolbar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TableSkeleton } from './table-skeleton'

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  isLoading?: boolean
  searchableColumn?: string // Changed from keyof TData to string
  filterableColumns?: {
    [key: string]: {
      title: string
      options: { label: string; value: string }[]
    }
  }
  onFiltersChange?: (filters: { [key: string]: string[] }) => void
  onSearch?: (searchTerm: string) => void
}

export function DataTable<TData>({ 
  columns, 
  data,
  isLoading = false,
  searchableColumn,
  filterableColumns,
  onFiltersChange,
  onSearch
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: (updater) => {
      // Handle both function and value updates
      const newFilters = typeof updater === 'function' 
        ? updater(columnFilters) 
        : updater;
      
      setColumnFilters(newFilters)

      if (onFiltersChange) {
        const activeFilters: { [key: string]: string[] } = {}
        newFilters.forEach(filter => {
          const value = filter.value
          if (typeof value === 'string') {
            activeFilters[filter.id] = [value]
          } else if (Array.isArray(value)) {
            activeFilters[filter.id] = value
          }
        })
        onFiltersChange(activeFilters)
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const handleFilterChange = (columnId: string, selectedValues: string[]) => {
    const newFilters = {
      ...table.getState().columnFilters.reduce((acc, filter) => ({
        ...acc,
        [filter.id]: filter.value
      }), {}),
      [columnId]: selectedValues
    }
    
    onFiltersChange?.(newFilters)
  }

  if (isLoading) {
    return <TableSkeleton columnCount={columns.length} />
  }

  return (
    <div className='space-y-4'>
      <DataTableToolbar 
        table={table}
        filterableColumns={filterableColumns}
        searchableColumn={searchableColumn}
        onSearch={onSearch}
      />
      <ScrollArea className="h-[calc(100vh-17rem)]">
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
      <DataTablePagination table={table} />
    </div>
  )
}
