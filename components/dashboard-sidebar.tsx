'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/auth-context'

export interface NavItem {
  href: string
  title: string
  icon?: React.ReactNode
}

interface DashboardSidebarProps {
  className?: string
  navItems: NavItem[]
}

export default function DashboardSidebar({ className, navItems }: DashboardSidebarProps) {
  const { data: session, status } = useAuth()
  const userRole = session?.user?.role as ('ADMIN' | 'MANAGER' | 'USER' | 'EMPLOYEE') || 'USER'

  return (
    <nav className={cn("w-64 min-w-[16rem] max-w-[16rem] border-r bg-background hidden lg:block", className)}>
        <div className="mb-4 px-4 py-3 border-b">
          <p className="font-medium">{session?.user?.primaryCompanyName || 'User'}</p> 
          <p className="text-xs text-muted-foreground mt-1 uppercase">{userRole}</p>
        </div>
      <ScrollArea className="h-[calc(100vh-10rem)] px-3 py-3">
        {navItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            className="w-full justify-start h-9 mb-1"
            asChild
          >
            <Link href={item.href}>
              {item.icon}
              <span>{item.title}</span>
            </Link>
          </Button>
        ))}
      </ScrollArea>
    </nav>
  )
}
