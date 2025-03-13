'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/contexts/settings-context"
import type { CompanySettings, SettingsUpdatePayload } from '@/types/settings'

interface NotificationsSectionProps {
  onChange?: (changes: SettingsUpdatePayload) => void;
}

export function NotificationsSection({ onChange }: NotificationsSectionProps) {
  const { settings } = useSettings()

  const handleChange = (path: string[], value: any) => {
    const update = path.reduceRight((acc, key) => ({ [key]: acc }), value)
    onChange?.({
      settings: {
        notifications: update
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Email Notifications</Label>
            <Switch 
              checked={settings?.notifications?.email?.enabled}
              onCheckedChange={(checked) => handleChange(['email', 'enabled'], checked)}
            />
          </div>
          {settings?.notifications?.email?.enabled && (
            <div className="ml-6 space-y-2">
              {Object.entries(settings?.notifications?.email?.templates || {}).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                  <Switch 
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      handleChange(['email', 'templates', key], checked)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>In-App Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable In-App Notifications</Label>
            <Switch 
              checked={settings?.notifications?.inApp?.enabled}
              onCheckedChange={(checked) => handleChange(['inApp', 'enabled'], checked)}
            />
          </div>
          {settings?.notifications?.inApp?.enabled && (
            <div className="ml-6 space-y-2">
              {Object.entries(settings?.notifications?.inApp?.categories || {}).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="capitalize">{key}</Label>
                  <Switch 
                    checked={enabled}
                    onCheckedChange={(checked) => 
                      handleChange(['inApp', 'categories', key], checked)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
