'use client'

import { useSession } from "@/hooks/use-session"
import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package, LogOut, Package2, Box, ArrowLeftRight, BarChart, ClipboardList, Settings, Users, Building, FileText, ShoppingCart, Truck, Home, Loader2 } from "lucide-react"
import Link from "next/link"
import { signOut } from "@/hooks/use-session";


interface NavItem {
  href: string
  title: string
  icon?: React.ReactNode
  subItems?: NavItem[]
  requiredRole?: ('ADMIN' | 'MANAGER' | 'USER' | 'EMPLOYEE')[]
}

const inventoryNavItems: NavItem[] = [
  {
    href: "/dashboard/inventory",
    title: "Overview",
    icon: <Package className="mr-2 h-4 w-4" />,
  },
  {
    href: "/dashboard/inventory/stock-adjustment",
    title: "Stock Adjustment",
    icon: <Box className="mr-2 h-4 w-4" />,
    requiredRole: ['ADMIN', 'MANAGER']
  },
  {
    href: "/dashboard/inventory/transfers",
    title: "Stock Transfer",
    icon: <ArrowLeftRight className="mr-2 h-4 w-4" />,
    requiredRole: ['ADMIN', 'MANAGER']
  },
  {
    href: "/dashboard/inventory/batches",
    title: "Batch Management",
    icon: <ClipboardList className="mr-2 h-4 w-4" />,
  },
]

const mainNavItems: NavItem[] = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: <Home className="mr-2 h-4 w-4" />,
  },
  {
    href: "/dashboard/inventory",
    title: "Inventory",
    icon: <Package className="mr-2 h-4 w-4" />,
    subItems: inventoryNavItems,
  },
  {
    href: "/dashboard/employees",
    title: "Employees",
    icon: <Package2 className="mr-2 h-4 w-4" />,
  },
  {
    href: "/dashboard/products",
    title: "Products",
    icon: <ShoppingCart className="mr-2 h-4 w-4" />,
  },
  {
    href: "/dashboard/suppliers",
    title: "Suppliers",
    icon: <Truck className="mr-2 h-4 w-4" />,
    requiredRole: ['ADMIN', 'MANAGER'],
  },
  {
    href: "/dashboard/reports",
    title: "Reports",
    icon: <BarChart className="mr-2 h-4 w-4" />,
    requiredRole: ['ADMIN', 'MANAGER'],
  },
  {
    href: "/dashboard/clients",
    title: "Clients",
    icon: <Building className="mr-2 h-4 w-4" />,
    requiredRole: ['ADMIN'],
  },
  {
    href: "/dashboard/settings",
    title: "Settings",
    icon: <Settings className="mr-2 h-4 w-4" />,
    requiredRole: ['ADMIN', 'MANAGER'],
  },
  {
    href: "/employee/dashboard",
    title: "Employee Dashboard",
    icon: <Users className="mr-2 h-4 w-4" />,
    requiredRole: ['EMPLOYEE'],
  },
]

interface DashboardNavProps {
  className?: string
  items?: NavItem[]
}

export function DashboardNav({ className, items = mainNavItems }: DashboardNavProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  const userRole = session?.user?.role as ('ADMIN' | 'MANAGER' | 'USER' | 'EMPLOYEE') || 'USER'

  const filteredItems = items.filter(item => {
    if (!item.requiredRole) return true
    return item.requiredRole.includes(userRole)
  })

  const isActiveLink = (href: string) => {
    if (href === '/dashboard' && pathname === href) return true
    if (href !== '/dashboard' && pathname?.startsWith(href)) return true
    return false
  }

  console.log('Session:', session);

  return (
    <nav className={cn("w-64 min-w-[16rem] max-w-[16rem] border-r bg-background", className)}>
      <ScrollArea className="h-[calc(100vh-4rem)] px-3">
        <div className="mb-4 px-4 py-3 border-b">
          <p className="font-medium">{session?.user?.primaryCompanyName || 'User'}</p> 
          <p className="text-xs text-muted-foreground mt-1 uppercase">{userRole}</p>
        </div>

        <div className="space-y-1">
          {filteredItems.map((item) => (
            <div key={item.href}>
              <Button
                variant={isActiveLink(item.href) ? "secondary" : "ghost"}
                className="w-full justify-start h-9"
                asChild
              >
                <Link href={item.href}>
                  {item.icon}
                  <span className="truncate">{item.title}</span>
                </Link>
              </Button>
              
              {item.subItems && isActiveLink(item.href) && (
                <div className="ml-3 mt-1 space-y-1 border-l-2 border-muted pl-2">
                  {item.subItems
                    .filter(subItem => !subItem.requiredRole || subItem.requiredRole.includes(userRole))
                    .map((subItem) => (
                      <Button
                        key={subItem.href}
                        variant={pathname === subItem.href ? "secondary" : "ghost"}
                        className="w-full justify-start h-8 text-sm"
                        asChild
                      >
                        <Link href={subItem.href}>
                          {subItem.icon}
                          <span className="truncate">{subItem.title}</span>
                        </Link>
                      </Button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-auto px-3 py-2">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </nav>
  )
}