'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/contexts/settings-context"
import { type CompanySettings, type SettingsUpdatePayload } from '@/types/settings'

interface SecuritySectionProps {
  onChange?: (changes: SettingsUpdatePayload) => void;
}

export function SecuritySection({ onChange }: SecuritySectionProps) {
  const { settings } = useSettings()

  const handleChange = (field: string, value: any) => {
    onChange?.({
      settings: {
        security: {
          twoFactorAuth: settings?.security?.twoFactorAuth ?? false,
          passwordPolicy: settings?.security?.passwordPolicy ?? {
            minLength: 8,
            requireSpecialChars: false,
            requireNumbers: false,
            expiryDays: 90
          },
          sessionTimeout: settings?.security?.sessionTimeout ?? 30,
          [field]: value
        }
      }
    })
  }

  const handlePasswordPolicyUpdate = (field: keyof CompanySettings['security']['passwordPolicy'], value: any) => {
    onChange?.({
      settings: {
        security: {
          twoFactorAuth: settings?.security?.twoFactorAuth ?? false,
          passwordPolicy: {
            minLength: settings?.security?.passwordPolicy?.minLength ?? 8,
            requireSpecialChars: settings?.security?.passwordPolicy?.requireSpecialChars ?? false,
            requireNumbers: settings?.security?.passwordPolicy?.requireNumbers ?? false,
            expiryDays: settings?.security?.passwordPolicy?.expiryDays ?? 90,
            [field]: value
          },
          sessionTimeout: settings?.security?.sessionTimeout ?? 30
        }
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Require 2FA for all users</Label>
            <Switch 
              checked={settings?.security?.twoFactorAuth}
              onCheckedChange={(checked) => handleChange('twoFactorAuth', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Minimum Password Length</Label>
            <Input 
              type="number"
              min={8}
              value={settings?.security?.passwordPolicy?.minLength}
              onChange={(e) => handlePasswordPolicyUpdate('minLength', parseInt(e.target.value))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Require Special Characters</Label>
            <Switch 
              checked={settings?.security?.passwordPolicy?.requireSpecialChars}
              onCheckedChange={(checked) => handlePasswordPolicyUpdate('requireSpecialChars', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>Require Numbers</Label>
            <Switch 
              checked={settings?.security?.passwordPolicy?.requireNumbers}
              onCheckedChange={(checked) => handlePasswordPolicyUpdate('requireNumbers', checked)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Password Expiry (Days)</Label>
            <Input 
              type="number"
              min={0}
              value={settings?.security?.passwordPolicy?.expiryDays}
              onChange={(e) => handlePasswordPolicyUpdate('expiryDays', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Label>Session Timeout (Minutes)</Label>
            <Input 
              type="number"
              min={5}
              value={settings?.security?.sessionTimeout}
              onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
