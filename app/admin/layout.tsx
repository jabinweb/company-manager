'use client'

import { useSession } from "@/hooks/use-session"
import { AdminNav } from "@/components/navigation/admin-nav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  return (
    <div className="flex h-screen">
      <AdminNav user={session?.user} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}