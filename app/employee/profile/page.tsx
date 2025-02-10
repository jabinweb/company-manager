'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProfileCard } from "@/components/employee/profile-card"
import { Loader2, PencilIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface EmployeeProfile {
  id: string
  name: string
  email: string
  phone: string
  jobTitle: string
  department: string
  dateJoined: string
  role: string
  employmentType: string
  status: string
  avatar?: string
  address: Address | null
  company: {
    id: number
    name: string // Add this field
    status: string
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/employee/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')
      const data = await response.json()
      setProfile(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not load profile data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: Address | null) => {
    if (!address) return 'No address provided'
    
    return (
      <>
        {address.street}, {address.city}
        <br />
        {address.state}, {address.zipCode}
        <br />
        {address.country}
      </>
    )
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
  if (!profile) return null

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Button variant="outline" size="sm">
          <PencilIcon className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6">
        <ProfileCard 
          {...profile} 
          companyName={profile.company.name} // Add this prop
        />

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{profile.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">
                {formatAddress(profile.address)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{profile.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date Joined</p>
              <p className="font-medium">{new Date(profile.dateJoined).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Employment Type</p>
              <p className="font-medium">{profile.employmentType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium">{profile.role}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
