'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSettings } from "@/contexts/settings-context"
import type { CompanySettings, SettingsUpdatePayload } from '@/types/settings'

type ThemeMode = 'light' | 'dark' | 'system';

interface CustomizationSectionProps {
  onChange?: (changes: SettingsUpdatePayload) => void;
}

export function CustomizationSection({ onChange }: CustomizationSectionProps) {
  const { settings } = useSettings()
  
  const handleUpdate = (field: keyof CompanySettings['customization'], value: any) => {
    const currentCustomization = {
      theme: {
        primaryColor: settings?.customization?.theme?.primaryColor ?? '#0ea5e9',
        mode: (settings?.customization?.theme?.mode ?? 'system') as ThemeMode
      },
      dateFormat: settings?.customization?.dateFormat ?? 'YYYY-MM-DD',
      timezone: settings?.customization?.timezone ?? 'UTC',
      language: settings?.customization?.language ?? 'en'
    }

    onChange?.({
      settings: {
        customization: {
          ...currentCustomization,
          [field]: value
        }
      }
    })
  }

  const handleThemeUpdate = (updates: { primaryColor?: string; mode?: ThemeMode }) => {
    const currentTheme = {
      primaryColor: settings?.customization?.theme?.primaryColor ?? '#0ea5e9',
      mode: (settings?.customization?.theme?.mode ?? 'system') as ThemeMode
    }

    onChange?.({
      settings: {
        customization: {
          theme: {
            ...currentTheme,
            ...updates
          },
          dateFormat: settings?.customization?.dateFormat ?? 'YYYY-MM-DD',
          timezone: settings?.customization?.timezone ?? 'UTC',
          language: settings?.customization?.language ?? 'en'
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Primary Color</Label>
            <Input 
              type="color"
              value={settings?.customization?.theme?.primaryColor ?? '#0ea5e9'}
              onChange={(e) => handleThemeUpdate({ primaryColor: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Theme Mode</Label>
            <Select 
              value={settings?.customization?.theme?.mode ?? 'system'}
              onValueChange={(value: ThemeMode) => handleThemeUpdate({ mode: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Date Format</Label>
            <Select 
              value={settings?.customization?.dateFormat}
              onValueChange={(value) => handleUpdate('dateFormat', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Language</Label>
            <Select 
              value={settings?.customization?.language}
              onValueChange={(value) => handleUpdate('language', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Timezone</Label>
            <Select 
              value={settings?.customization?.timezone}
              onValueChange={(value) => handleUpdate('timezone', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
