'use client'

import { cn } from "@/lib/utils";
import { Building2, Users, ShieldCheck, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/hooks/use-session";

const routes = [
  {
    label: 'Companies',
    icon: Building2,
    href: '/admin/companies',
    color: 'text-blue-500',
  },
  {
    label: 'Users',
    icon: Users,
    href: '/admin/users',
    color: 'text-green-500',
  },
  {
    label: 'Approvals',
    icon: ShieldCheck,
    href: '/admin/approvals',
    color: 'text-purple-500',
  },
];

interface AdminNavProps {
  user: any;
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white border-r">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">
          Admin Panel
        </h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <button
              key={route.href}
              onClick={() => router.push(route.href)}
              className={cn(
                "w-full flex justify-start items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-gray-100",
                pathname === route.href
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-500"
              )}
            >
              <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
              {route.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-auto px-3 py-2">
        <button
          onClick={() => signOut()}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-500 rounded-lg hover:bg-gray-100"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
}
