'use client'

import { useEffect, useState } from "react";
import { useSession } from "@/hooks/use-session";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Clock,
  Building,
  UserCircle,
  AlertCircle,
  ChevronLeft
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { EditEmployeeDialog } from './edit-employee-dialog'
import { toast } from "@/hooks/use-toast"
import { SalaryForm } from '@/components/employees/salary-form'
import { EmployeeData, EmploymentType, EmployeeStatus } from '@/types/employee'

interface Metadata {
  employmentTypes: string[];
  employeeStatuses: string[];
}

export default function EmployeePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Get id from params and ensure it's a string
  const { id } = useParams() as { id: string }

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchEmployee() {
      if (status === "loading") return;

      try {
        const response = await fetch(`/api/employees/${id}`);
        if (!response.ok) throw new Error('Failed to fetch employee');
        
        const data = await response.json();
        setEmployee(data);
        
        // Set metadata using enums
        setMetadata({
          employmentTypes: Object.values(EmploymentType),
          employeeStatuses: Object.values(EmployeeStatus)
        });

      } catch (error) {
        console.error("Failed to fetch employee:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch employee details"
        });
      } finally {
        setLoading(false);
      }
    }

    fetchEmployee();
  }, [session, id, status, router]);

  const handleStatusUpdate = async (field: 'status' | 'employmentType', value: EmployeeStatus | EmploymentType) => {
    if (!employee) return;

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...employee,
          [field]: value,
          updatedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) throw new Error('Failed to update employee');

      const updatedEmployee = await response.json();
      setEmployee(updatedEmployee);
      toast({
        title: "Success",
        description: "Employee status updated successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update employee"
      });
    }
  };

  if (status === "loading" || loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>;
  }

  if (!employee) {
    return <div className="flex flex-col items-center justify-center min-h-screen">
      <h3 className="text-xl font-semibold">Employee not found</h3>
      <Link href="/dashboard/employees" className="mt-4 text-blue-600 hover:underline">
        Back to Employees
      </Link>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/employees" 
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Employees
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
              <p className="text-gray-500">{employee.jobTitle}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Done' : 'Edit Status'}
              </Button>
              <EditEmployeeDialog 
                employee={employee} 
                onUpdate={(updatedEmployee) => setEmployee(updatedEmployee)} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Personal Info */}
          <div className="col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <UserCircle className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">{employee.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{employee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{employee.phone}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Address</p>
                      <p className="font-medium">{employee.address.street}</p>
                      <p className="font-medium">
                        {`${employee.address.city}, ${employee.address.state} ${employee.address.zipCode}`}
                      </p>
                      <p className="font-medium">{employee.address.country}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Employment Details */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Employment Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Job Title</p>
                      <p className="font-medium">{employee.jobTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Building className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{employee.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Date Joined</p>
                      <p className="font-medium">
                        {new Date(employee.dateJoined).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <SalaryForm 
              employeeId={id} 
              initialData={employee.salary}
            />
          </div>

          {/* Right Column - Status & Quick Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Status</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Employment Type</p>
                  {isEditing ? (
                    <Select
                      value={employee.employmentType}
                      onValueChange={(value) => handleStatusUpdate('employmentType', value as EmploymentType)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(EmploymentType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="text-sm">
                      {employee.employmentType?.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-500 mb-2">Current Status</p>
                  {isEditing ? (
                    <Select
                      value={employee.status}
                      onValueChange={(value) => handleStatusUpdate('status', value as EmployeeStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(EmployeeStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge 
                      className={
                        employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                        employee.status === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }
                    >
                      {employee.status?.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  View Time Logs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}