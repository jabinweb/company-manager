'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "@/hooks/use-session";
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ActionButtons } from '@/components/ActionButtons';
import { EditCompanyDialog } from '@/components/companies/edit-company-dialog';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';

interface Company {
  id: number;
  name: string;
  website: string;
  status: string;
  createdAt: string;
  admin?: {
    name: string;
    email: string;
  };
  employees?: Array<{
    id: string;
    name: string;
    email: string;
    status: string;
  }>;
}

interface ApiResponse {
  success: boolean;
  data: Company[];
  message?: string;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Changed initial state to false
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Add initial load state
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/companies');
      
      if (!response.ok) {
        throw new Error('Failed to fetch companies');
      }
      
      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch companies');
      }
      
      setCompanies(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch companies');
      setCompanies([]);
    } finally {
      setIsInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleEdit = async (companyId: string) => {
    // Implement edit functionality
    console.log('Edit company:', companyId);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
      const response = await fetch(`/api/admin/companies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete company');

      toast({
        title: "Success",
        description: "Company deleted successfully"
      });

      // Refresh companies list
      fetchCompanies();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete company",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (companyId: string, newStatus: string) => {
    const response = await fetch(`/api/admin/companies/${companyId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (response.ok) {
      setCompanies(companies.map(company => 
        company.id === Number(companyId) ? { ...company, status: newStatus } : company
      ));
    }
  };

  // Render loading state only during initial load
  if (isInitialLoad) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Companies Management</h1>

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Employees</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No companies found
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.website}</TableCell>
                  <TableCell>
                    <Badge variant={company.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {company.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {company.admin ? (
                      <div>
                        <div>{company.admin.name}</div>
                        <div className="text-sm text-gray-500">{company.admin.email}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">No admin assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.employees?.length || 0} employees
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(company.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <EditCompanyDialog 
                        company={company}
                        onUpdate={fetchCompanies}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(company.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
