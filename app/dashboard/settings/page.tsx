'use client'

import { useSession } from '@/hooks/use-session'
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/settings/profile-form"
import { CompanyForm } from "@/components/settings/company-form"
import { SecurityForm } from "@/components/settings/security-form"
import { NotificationsForm } from "@/components/settings/notifications-form"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import type { UserSettings } from '@/types/settings'

interface Company {
  id: number
  name: string
  website: string
  logo?: string | null
}

interface ApiResponse {
  companies: Company[]
  userSettings: UserSettings
}

export default function SettingsPage() { 
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)

  useEffect(() => {
    if (!session?.user) {
      router.push('/login')
      return
    }
    
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        if (!response.ok) {
          throw new Error('Failed to fetch settings')
        }

        const data: ApiResponse = await response.json()
        setCompanies(data.companies)
        setUserSettings(data.userSettings)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load settings"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings() 
  }, [session?.user, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>
      <Separator />
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start border-b">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="profile">
            <Card className="p-6">
              <ProfileForm 
                user={session?.user}
                onSubmit={async (data) => {
                  try {
                    const response = await fetch('/api/settings/profile', {
                      method: 'PATCH',
                      body: JSON.stringify(data)
                    })
                    if (!response.ok) throw new Error('Failed to update profile')
                    await update()
                    toast({ title: "Profile updated" })
                  } catch (error) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "Failed to update profile"
                    })
                  }
                }}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="company">
            {companies.map((company) => (
              <Card key={company.id} className="p-6 mb-4">
                <CompanyForm 
                  company={company}
                  onSubmit={async (data) => {
                    try {
                      const response = await fetch(`/api/settings/company/${company.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                      })
                      if (!response.ok) throw new Error('Failed to update company')
                      setCompanies((prev) =>
                        prev.map((c) => (c.id === company.id ? { ...c, ...data } : c))
                      )
                      toast({ title: "Company settings updated" })
                    } catch (error) {
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to update company settings"
                      })
                    }
                  }}
                />
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="security">
            <Card className="p-6">
              <SecurityForm
                onSubmit={async (data) => {
                  try {
                    const response = await fetch('/api/settings/security', {
                      method: 'POST',
                      body: JSON.stringify(data)
                    })
                    if (!response.ok) throw new Error('Failed to update security settings')
                    toast({ title: "Security settings updated" })
                  } catch (error) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "Failed to update security settings"
                    })
                  }
                }}
              />
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="p-6">
              <NotificationsForm
                settings={userSettings?.notifications}
                onSubmit={async (data) => {
                  try {
                    const response = await fetch('/api/settings/notifications', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    })
                    if (!response.ok) throw new Error('Failed to update notifications')
                    
                    setUserSettings(prev => prev ? {
                      ...prev,
                      notifications: data
                    } : null)
                    
                    toast({ title: "Notification settings updated" })
                  } catch (error) {
                    toast({
                      variant: "destructive",
                      title: "Error",
                      description: "Failed to update notification settings"
                    })
                  }
                }}
              />
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
