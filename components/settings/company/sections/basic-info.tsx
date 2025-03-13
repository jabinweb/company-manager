'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/ui/image-upload"
import { useSettings } from "@/contexts/settings-context"
import type { SettingsUpdatePayload } from '@/types/settings'

interface BasicInfoSectionProps {
  onChange?: (changes: SettingsUpdatePayload) => void;
}

export function BasicInfoSection({ onChange }: BasicInfoSectionProps) {
  const { company, updateCompany, isUpdating } = useSettings()
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    email: '',
    phone: '',
    website: '',
    description: ''
  })

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        logo: company.logo || '',
        email: company.email || '',
        phone: company.phone || '',
        website: company.website || '',
        description: company.description || ''
      })
    }
  }, [company])

  const handleChange = (key: string, value: string) => {
    const newData = {
      ...formData,
      [key]: value
    }
    setFormData(newData)
    onChange?.({ company: newData })
  }

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
              value={formData.logo}
              onChange={(url) => handleChange('logo', url)}
              className="w-40 h-40"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Company Name</Label>
              <Input 
                placeholder="Enter company name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                disabled={isUpdating}
              />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input 
                type="email"
                placeholder="company@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                disabled={isUpdating}
              />
            </div>
            <div className="grid gap-2">
              <Label>Phone</Label>
              <Input 
                type="tel"
                placeholder="+1 234 567 8900"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={isUpdating}
              />
            </div>
            <div className="grid gap-2">
              <Label>Website</Label>
              <Input 
                type="url"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                disabled={isUpdating}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
