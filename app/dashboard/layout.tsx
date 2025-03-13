'use client'
import { useSession } from '@/hooks/use-session'
import DashboardSidebar from '@/components/dashboard-sidebar'
import { TopBar } from "@/components/navigation/top-bar"
import { NAV_ITEMS } from '@/components/navigation/nav-items'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/loading'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Check session and redirect if needed
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Don't render anything while checking auth
  if (!session?.user) {
    return null
  }

  const navItems = session.user.role === 'SUPER_ADMIN' ? NAV_ITEMS.SUPER_ADMIN : NAV_ITEMS.ADMIN
  const title = session.user.role === 'SUPER_ADMIN' ? 'Super Admin Dashboard' : 'Admin Dashboard'

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar navItems={navItems} />
      <div className="flex-1 flex flex-col px-6">
        <TopBar 
          userRole={session.user.role}
          title={title}
          showMessages={false}
          navigationItems={navItems.map(item => ({
            href: item.href,
            label: item.title,
            icon: item.icon
          }))}
      />
      <main className="flex-1">
        <ScrollArea className="h-[calc(100vh-5rem)] overflow-y-auto">
          {children}
        </ScrollArea>
      </main>
      </div>
    </div>
  )
}