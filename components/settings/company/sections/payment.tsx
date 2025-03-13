'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useSettings } from "@/contexts/settings-context"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import type { SettingsUpdatePayload } from '@/types/settings'

interface RazorpaySettings {
  enabled: boolean;
  mode: 'test' | 'live';
  credentials: {
    test: { keyId: string; keySecret: string; webhookSecret: string; };
    live: { keyId: string; keySecret: string; webhookSecret: string; };
  };
}

interface LocalSettings {
  integrations: {
    razorpay: RazorpaySettings;
  };
}

interface PaymentSectionProps {
  onChange?: (changes: SettingsUpdatePayload) => void;
}

export function PaymentSection({ onChange }: PaymentSectionProps) {
  const { settings } = useSettings()
  const [localSettings, setLocalSettings] = useState<LocalSettings>({
    integrations: {
      razorpay: {
        enabled: false,
        mode: 'test',
        credentials: {
          test: { keyId: '', keySecret: '', webhookSecret: '' },
          live: { keyId: '', keySecret: '', webhookSecret: '' }
        }
      }
    }
  })

  // Sync with server settings
  useEffect(() => {
    if (settings?.integrations?.razorpay) {
      setLocalSettings(prev => ({
        ...prev,
        integrations: {
          razorpay: settings.integrations.razorpay
        }
      }))
    }
  }, [settings?.integrations?.razorpay])

  const handleRazorpayUpdate = (field: string, value: any) => {
    const currentMode = localSettings.integrations.razorpay.mode

    // Handle credential updates differently
    if (['keyId', 'keySecret', 'webhookSecret'].includes(field)) {
      const updatedRazorpay = {
        ...localSettings.integrations.razorpay,
        credentials: {
          ...localSettings.integrations.razorpay.credentials,
          [currentMode]: {
            ...localSettings.integrations.razorpay.credentials[currentMode],
            [field]: value
          }
        }
      }
      
      setLocalSettings(prev => ({
        ...prev,
        integrations: { razorpay: updatedRazorpay }
      }))

      onChange?.({
        settings: {
          integrations: { razorpay: updatedRazorpay }
        }
      })
      return
    }

    // Handle other updates (enabled, mode)
    const updatedRazorpay = {
      ...localSettings.integrations.razorpay,
      [field]: value
    }

    setLocalSettings(prev => ({
      ...prev,
      integrations: { razorpay: updatedRazorpay }
    }))

    onChange?.({
      settings: {
        integrations: { razorpay: updatedRazorpay }
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Razorpay Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable Razorpay</Label>
            <Switch 
              checked={localSettings.integrations.razorpay.enabled}
              onCheckedChange={(checked) => handleRazorpayUpdate('enabled', checked)}
            />
          </div>

          {localSettings.integrations.razorpay.enabled && (
            <>
              <div className="grid gap-2">
                <Label>Mode</Label>
                <Select 
                  value={localSettings.integrations.razorpay.mode}
                  onValueChange={(value: 'test' | 'live') => handleRazorpayUpdate('mode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test Mode</SelectItem>
                    <SelectItem value="live">Live Mode</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Key ID ({localSettings.integrations.razorpay.mode})</Label>
                  <Input 
                    type="password"
                    value={localSettings.integrations.razorpay.credentials[localSettings.integrations.razorpay.mode].keyId}
                    onChange={(e) => handleRazorpayUpdate('keyId', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Key Secret ({localSettings.integrations.razorpay.mode})</Label>
                  <Input 
                    type="password"
                    value={localSettings.integrations.razorpay.credentials[localSettings.integrations.razorpay.mode].keySecret}
                    onChange={(e) => handleRazorpayUpdate('keySecret', e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Webhook Secret ({localSettings.integrations.razorpay.mode})</Label>
                  <Input 
                    type="password"
                    value={localSettings.integrations.razorpay.credentials[localSettings.integrations.razorpay.mode].webhookSecret}
                    onChange={(e) => handleRazorpayUpdate('webhookSecret', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
