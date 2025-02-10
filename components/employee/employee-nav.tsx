import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  UserCircle,
  Clock,
  Calendar,
  FileText,
  CheckSquare,
  Bell,
} from "lucide-react"

const routes = [
  {
    href: "/employee/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/employee/profile",
    label: "Profile",
    icon: UserCircle,
  },
  {
    href: "/employee/attendance",
    label: "Attendance",
    icon: Clock,
  },
  {
    href: "/employee/leave",
    label: "Leave",
    icon: Calendar,
  },
  {
    href: "/employee/payslips",
    label: "Payslips",
    icon: FileText,
  },
  {
    href: "/employee/tasks",
    label: "Tasks",
    icon: CheckSquare,
  },
  {
    href: "/employee/announcements",
    label: "Announcements",
    icon: Bell,
  },
]

export function EmployeeNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 hover:text-gray-900",
            pathname === route.href
              ? "bg-gray-100 text-gray-900"
              : "text-gray-600"
          )}
        >
          <route.icon className="mr-3 h-5 w-5" />
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
