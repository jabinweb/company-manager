'use client'

import { useState } from 'react'
import { useSession } from '@/hooks/use-session'
import { useRouter } from 'next/navigation'
import { 
  Search,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Menu,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { ScrollArea } from '../ui/scroll-area'
import { NotificationsPanel } from '@/components/notifications/notifications-panel'
import Link from 'next/link'
import { QuickActions } from './quick-actions'

interface TopBarProps {
  showSearch?: boolean
  showNotifications?: boolean
  showMessages?: boolean
  onSearch?: (query: string) => void
  title?: string | React.ReactNode
  mobileMenu?: React.ReactNode
  userRole: string
  menuItems?: {
    label: string
    icon: React.ReactNode
    onClick: () => void
  }[]
  navigationItems?: {
    href: string
    label: string
    icon: React.ReactNode
  }[]
  profileOptions?: {
    label: string
    icon: React.ReactNode
    onClick: () => void
  }[]
}

export function TopBar({
  showSearch = true,
  showNotifications = true,
  showMessages = true,
  onSearch,
  title,
  userRole,
  navigationItems = [],
  profileOptions = [],
}: TopBarProps) {
  const router = useRouter()
  const { data: session, logout } = useSession()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const defaultProfileOptions = [
    {
      label: 'Profile',
      icon: <User className="mr-2 h-4 w-4" />,
      onClick: () => router.push(`/${userRole?.toLowerCase()}/profile`)
    },
    {
      label: 'Settings',
      icon: <Settings className="mr-2 h-4 w-4" />,
      onClick: () => router.push(`/${userRole?.toLowerCase()}/settings`)
    },
    {
      label: 'Log out',
      icon: <LogOut className="mr-2 h-4 w-4" />,
      onClick: () => logout()
    }
  ]

  const allProfileOptions = [...profileOptions, ...defaultProfileOptions]

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        {/* Mobile Menu with custom items */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Hello, {session?.user?.name}</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
              {navigationItems.map((item, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start mb-1"
                  asChild
                >
                  <Link href={item.href}>
                    {item.icon}
                    {item.label}
                  </Link>
                </Button>
              ))}
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Title/Logo */}
        <div className="hidden md:flex ml-4">
          <h2 className="text-lg font-semibold">
            Hello, {session?.user?.name}
          </h2>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {/* Search */}
          {showSearch && (
            <div className={cn(
              "transition-all duration-300",
              isSearchOpen ? "w-full md:w-1/2" : "w-auto"
            )}>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className={cn(
                    "pl-8",
                    isSearchOpen ? "w-full" : "w-[150px] md:w-[250px]"
                  )}
                  onFocus={() => setIsSearchOpen(true)}
                  onBlur={() => setIsSearchOpen(false)}
                  onChange={(e) => onSearch?.(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Quick Actions - only show for admin/manager */}
          {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
            <QuickActions />
          )}

          {/* Notifications */}
          {showNotifications && <NotificationsPanel userRole={userRole} />}

          {/* Messages */}
          {showMessages && (
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
          )}

          {/* Customizable Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage ref={session?.user?.avatar as React.LegacyRef<HTMLImageElement>} alt={session?.user?.name} />
                  <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {allProfileOptions.map((option, index) => (
                  <DropdownMenuItem key={index} onClick={option.onClick}>
                    {option.icon}
                    {option.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
