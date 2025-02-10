'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from "@/hooks/use-session";
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CompanyItem {
  id: number;  // Changed from string to number to match the API
  name: string;
  website: string;
  status: string;
  createdAt: string;
}

interface UserItem {
  id: number;  // Changed from string to number to match the API
  name: string;
  email: string;
  status: string;
  createdAt: string;
  companies: Array<{ name: string }>;
}

interface PendingItems {
  companies: CompanyItem[];
  users: UserItem[];
}

export default function ApprovalsPage() {
  const { data: session } = useSession();
  const [pendingItems, setPendingItems] = useState<PendingItems>({ companies: [], users: [] });
  const [activeTab, setActiveTab] = useState<'companies' | 'users'>('companies');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/approve');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch pending items');
      }

      if (data.success && data.data) {
        setPendingItems(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchPendingItems();
    }
  }, [session, fetchPendingItems]);

  const handleApproval = async (id: number, action: 'approve' | 'reject', type: 'company' | 'user') => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);

      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: Number(id),
          action, 
          type
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process approval');
      }

      setPendingItems({
        companies: data.companies || [],
        users: data.users || []
      });
      
      toast({
        title: 'Success',
        description: data.message,
        duration: 3000,
      });

    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process approval',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render the current tab's items
  const currentItems = activeTab === 'companies' 
    ? pendingItems.companies 
    : pendingItems.users;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pending Approvals</h1>

      <Tabs defaultValue="companies" onValueChange={(value) => setActiveTab(value as 'companies' | 'users')}>
        <TabsList>
          <TabsTrigger value="companies">
            Companies ({pendingItems.companies?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="users">
            Users ({pendingItems.users?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingItems.companies?.map((company: CompanyItem) => (
                  <TableRow key={company.id}>
                    <TableCell>{company.name}</TableCell>
                    <TableCell>{company.website}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{company.status}</Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproval(Number(company.id), 'approve', 'company')}
                        disabled={isLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleApproval(Number(company.id), 'reject', 'company')}
                        disabled={isLoading}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!pendingItems.companies?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No pending companies
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingItems.users?.map((user: UserItem) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.companies?.[0]?.name || 'No company'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.status}</Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApproval(Number(user.id), 'approve', 'user')}
                        disabled={isLoading}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleApproval(Number(user.id), 'reject', 'user')}
                        disabled={isLoading}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!pendingItems.users?.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No pending users
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
