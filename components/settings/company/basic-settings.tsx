'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/ui/image-upload"
import { Textarea } from "@/components/ui/textarea"
import { useCompanySettings } from "@/hooks/use-company-settings"

export function CompanyBasicSettings() {
  const { settings, updateSettings, isLoading } = useCompanySettings()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Company Logo</Label>
            <ImageUpload 
              endpoint="imageUploader"
              value={settings?.logo}
              onChange={(url) => updateSettings({ logo: url })}
              className="w-40 h-40"
            />
          </div>
          <div className="grid gap-2">
            <Label>Company Name</Label>
            <Input 
              value={settings?.name}
              onChange={(e) => updateSettings({ name: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={settings?.email}
                onChange={(e) => updateSettings({ email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input 
                type="tel"
                value={settings?.phone}
                onChange={(e) => updateSettings({ phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Website</Label>
              <Input 
                type="url"
                value={settings?.website}
                onChange={(e) => updateSettings({ website: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Tax ID</Label>
              <Input 
                value={settings?.taxId}
                onChange={(e) => updateSettings({ taxId: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Street Address</Label>
            <Input 
              value={settings?.address?.street}
              onChange={(e) => updateSettings({ 
                address: { ...settings?.address, street: e.target.value } 
              })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>City</Label>
              <Input 
                value={settings?.address?.city}
                onChange={(e) => updateSettings({ 
                  address: { ...settings?.address, city: e.target.value } 
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label>State/Province</Label>
              <Input 
                value={settings?.address?.state}
                onChange={(e) => updateSettings({ 
                  address: { ...settings?.address, state: e.target.value } 
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Postal Code</Label>
              <Input 
                value={settings?.address?.postalCode}
                onChange={(e) => updateSettings({ 
                  address: { ...settings?.address, postalCode: e.target.value } 
                })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Country</Label>
              <Input 
                value={settings?.address?.country}
                onChange={(e) => updateSettings({ 
                  address: { ...settings?.address, country: e.target.value } 
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea 
              value={settings?.description}
              onChange={(e) => updateSettings({ description: e.target.value })}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
