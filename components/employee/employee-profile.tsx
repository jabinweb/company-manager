'use client'

import { useSession } from "@/hooks/use-session"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface EmployeeProfileProps {
  employee: {
    name: string
    email: string
    avatar: string | null
    jobTitle: string
    department: string
    employeeId: string
    dateJoined: string
  } | null
}

export function EmployeeProfile({ employee }: EmployeeProfileProps) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={employee?.avatar || '/avatars/default.png'} 
              alt={employee?.name || 'Employee'} 
            />
            <AvatarFallback>
              {employee?.name?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">{employee?.name}</h2>
            <p className="text-muted-foreground">{employee?.jobTitle}</p>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-semibold">Department</h3>
            <p className="text-muted-foreground">{employee?.department}</p>
          </div>
          <div>
            <h3 className="font-semibold">Employee ID</h3>
            <p className="text-muted-foreground">{employee?.employeeId}</p>
          </div>
          <div>
            <h3 className="font-semibold">Email</h3>
            <p className="text-muted-foreground">{employee?.email}</p>
          </div>
          <div>
            <h3 className="font-semibold">Joined Date</h3>
            <p className="text-muted-foreground">
              {new Date(employee?.dateJoined ?? "").toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
