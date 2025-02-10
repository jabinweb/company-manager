import { TableCell, TableRow } from "@/components/ui/table"

interface TableSkeletonProps {
  columnCount: number
  rowCount?: number
}

export function TableSkeleton({ columnCount, rowCount = 5 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i} className="animate-pulse">
          {Array.from({ length: columnCount }).map((_, j) => (
            <TableCell key={j}>
              <div className="h-6 bg-gray-200 rounded-md dark:bg-gray-700" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}
