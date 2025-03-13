'use client'

import { useVirtualizer } from '@tanstack/react-virtual'
import { useRef } from 'react'
import { Card } from '@/components/ui/card'
import { LeadResponse } from '@/types/lead'

interface LeadsTableProps {
  data: LeadResponse[]
  isLoading: boolean
}

export function LeadsTable({ data, isLoading }: LeadsTableProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5
  })

  return (
    <Card>
      <div
        ref={parentRef}
        className="h-[600px] overflow-auto"
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const lead = data[virtualItem.index]
            return (
              <div
                key={virtualItem.key}
                data-index={virtualItem.index}
                ref={rowVirtualizer.measureElement}
                className="absolute top-0 left-0 w-full border-b"
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {/* Lead row content */}
                <div className="p-4 flex items-center gap-4">
                  {/* ...lead display content... */}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
