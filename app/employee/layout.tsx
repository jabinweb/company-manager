'use client'

import { useEffect } from 'react'
import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { TopBar } from '@/components/navigation/top-bar'
import { NAV_ITEMS } from '@/components/navigation/nav-items'

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/employee/login')
      return
    }

    if (session.user?.role !== 'EMPLOYEE') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  // Always show children, but conditionally render sidebar and topbar
  return (
    <div className="flex h-screen">
      {session?.user?.role === 'EMPLOYEE' && (
        <DashboardSidebar navItems={NAV_ITEMS.EMPLOYEE} />
      )}
      <div className="flex-1 flex flex-col">
        {session?.user?.role === 'EMPLOYEE' && (
          <TopBar 
            userRole="EMPLOYEE"
            title="Employee Dashboard"
            showMessages={true}
            navigationItems={NAV_ITEMS.EMPLOYEE.map(item => ({
              href: item.href,
              label: item.title,
              icon: item.icon
            }))}
          />
        )}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
