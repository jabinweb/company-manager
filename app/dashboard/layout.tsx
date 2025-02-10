'use client'

import { useSession } from '@/hooks/use-session'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { TopBar } from "@/components/navigation/top-bar"
import { NAV_ITEMS } from '@/components/navigation/nav-items'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const user = session?.user

  // if (status === 'loading') {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
  //     </div>
  //   )
  // }

  if (!user) {
    // Handle no user state - could redirect to login or show error
    return null
  }

  const navItems = user.role === 'SUPER_ADMIN' ? NAV_ITEMS.SUPER_ADMIN : NAV_ITEMS.ADMIN
  const title = user.role === 'SUPER_ADMIN' ? 'Super Admin Dashboard' : 'Admin Dashboard'

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar navItems={navItems} />
      <div className="flex-1 flex flex-col">
        <TopBar 
          userRole={user.role}
          title={title}
          showMessages={false}
          navigationItems={navItems.map(item => ({
            href: item.href,
            label: item.title,
            icon: item.icon
          }))}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}