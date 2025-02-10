'use client'

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Users, Briefcase, Package, FolderGit2 } from "lucide-react";

interface DashboardStats {
  employees: number;
  clients: number;
  products: number;
  projects: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    async function fetchStats() {
      if (!session?.user?.primaryCompanyId) return;
      
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    }

    fetchStats();
  }, [session]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Users className="h-10 w-10 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Employees</p>
              <p className="text-2xl font-bold">{stats?.employees ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Briefcase className="h-10 w-10 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Clients</p>
              <p className="text-2xl font-bold">{stats?.clients ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Package className="h-10 w-10 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Products</p>
              <p className="text-2xl font-bold">{stats?.products ?? 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <FolderGit2 className="h-10 w-10 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Projects</p>
              <p className="text-2xl font-bold">{stats?.projects ?? 0}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
