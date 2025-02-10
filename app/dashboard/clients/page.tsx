'use client'

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Mail, Briefcase } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  companyId: string;
}

export default function ClientsPage() {
  const { data: session, status } = useSession();

  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    async function fetchClients() {
      if (!session?.user?.primaryCompanyId) return;

      const response = await fetch(`/api/clients?companyId=${session.user.currentCompanyId}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data);
      }
    }

    fetchClients();
  }, [session]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }  

  if (!session?.user?.primaryCompanyId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <Card className="p-6 text-center">
          <p className="text-gray-500">No company associated with this account.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-2">Manage your company&apos;s clients</p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button className="transition-all hover:scale-105 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length > 0 ? (
          clients.map((client) => (
            <Card 
              key={client.id}
              className="p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border border-gray-200 rounded-lg"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg leading-none text-gray-900">
                      {client.name}
                    </h3>
                    <div className="flex items-center mt-2 text-gray-500">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {/* {client.status} */}
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center text-gray-500 mb-2">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span className="text-sm">Company ID: {client.companyId}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-6 col-span-full text-center border border-gray-200 rounded-lg">
            <p className="text-gray-500">No clients found. Add your first client!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
