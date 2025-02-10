'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  ClipboardList,
  Clock,
  DollarSign,
  Bell,
  Settings,
  User
} from 'lucide-react'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/employee',
  },
  {
    label: 'Profile',
    icon: User,
    href: '/employee/profile',
  },
  {
    label: 'Tasks',
    icon: ClipboardList,
    href: '/employee/tasks',
  },
  {
    label: 'Attendance',
    icon: Clock,
    href: '/employee/attendance',
  },
  {
    label: 'Leave',
    icon: Calendar,
    href: '/employee/leave',
  },
  {
    label: 'Payroll',
    icon: DollarSign,
    href: '/employee/payroll',
  },
  {
    label: 'Notifications',
    icon: Bell,
    href: '/employee/notifications',
  }
]

export function EmployeeSidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white border-r">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">
          Employee Portal
        </h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100",
                pathname === route.href ? "bg-gray-100 text-gray-900" : ""
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
