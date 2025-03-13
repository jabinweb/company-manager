import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TableSkeletonProps {
  columnCount?: number
  rowCount?: number
}

export function TableSkeleton({ columnCount = 5, rowCount = 5 }: TableSkeletonProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columnCount }).map((_, index) => (
            <TableHead key={index}>
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: columnCount }).map((_, colIndex) => (
              <TableCell key={colIndex}>
                <div className="h-4 w-full bg-muted animate-pulse rounded" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function LeadsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-96 bg-muted rounded animate-pulse" />
      </div>
      <div className="rounded-md border">
        <TableSkeleton columnCount={7} rowCount={5} />
      </div>
    </div>
  )
}

export function FullTableSkeleton({ columnCount = 5, rowCount = 5 }: TableSkeletonProps) {
  return (
    <div className="rounded-md border">
      <div className="relative w-full overflow-auto">
        <TableSkeleton columnCount={columnCount} rowCount={rowCount} />
      </div>
    </div>
  )
}
