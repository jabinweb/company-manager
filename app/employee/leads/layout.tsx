'use client'

import { Suspense, useState, useCallback } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePathname, useRouter } from 'next/navigation'
import { TableSkeleton } from '@/components/table/table-skeleton'

const tabs = [
  { value: 'dashboard', label: 'Dashboard', path: '/employee/leads/dashboard' },
  { value: 'all', label: 'All Leads', path: '/employee/leads' },
  { value: 'active', label: 'Active', path: '/employee/leads/active' },
  { value: 'follow-up', label: 'Follow-ups', path: '/employee/leads/follow-up' }
] as const

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [currentContent, setCurrentContent] = useState(children)

  const handleTabChange = useCallback((value: string) => {
    const tab = tabs.find(t => t.value === value)
    if (!tab) return

    setIsLoading(true)
    setCurrentContent(<TableSkeleton />)

    // Push to new route
    router.push(tab.path, {
      scroll: false
    })
  }, [router])

  // Update content when children change
  if (!isLoading && children !== currentContent) {
    setCurrentContent(children)
  }

  return (
    <div className="space-y-6 p-6">
      <Tabs 
        defaultValue={tabs.find(tab => tab.path === pathname)?.value || 'dashboard'}
        onValueChange={handleTabChange}
      >
        <TabsList>
          {tabs.map(tab => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              disabled={isLoading}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      
      <div className="animate-in fade-in-0 duration-200">
        <Suspense 
          fallback={<TableSkeleton />}
        >
          {currentContent}
        </Suspense>
      </div>
    </div>
  )
}
