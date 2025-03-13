'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useQuery, useMutation } from '@tanstack/react-query'

export function PayrollSettings() {
  const { toast } = useToast()
  const { data: settings, isLoading } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      return res.json()
    }
  })

  const mutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const res = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      })
      if (!res.ok) throw new Error('Failed to update settings')
      return res.json()
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Payroll settings have been updated successfully."
      })
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save payroll settings."
      })
    }
  })

  const handleSaveSettings = async () => {
    mutation.mutate({
      payroll: {
        razorpay: {
          enabled: isRazorpayEnabled,
          keyId: razorpayKey,
          webhookSecret: webhookSecret
        }
      }
    })
  }

  // Initialize state from settings
  const [isRazorpayEnabled, setIsRazorpayEnabled] = useState(
    settings?.payroll?.razorpay?.enabled ?? false
  )
  const [razorpayKey, setRazorpayKey] = useState(
    settings?.payroll?.razorpay?.keyId ?? ''
  )
  const [webhookSecret, setWebhookSecret] = useState(
    settings?.payroll?.razorpay?.webhookSecret ?? ''
  )

  return (
    <div className="grid gap-6">
      {/* Payment Gateway */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Gateway</CardTitle>
          <CardDescription>
            Configure Razorpay payment gateway for processing payroll payments
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Razorpay</Label>
              <p className="text-sm text-muted-foreground">
                Process salary payments using Razorpay
              </p>
            </div>
            <Switch
              checked={isRazorpayEnabled}
              onCheckedChange={setIsRazorpayEnabled}
            />
          </div>
          
          {isRazorpayEnabled && (
            <>
              <div className="grid gap-2">
                <Label>Razorpay Key ID</Label>
                <Input
                  type="password"
                  placeholder="rzp_live_..."
                  value={razorpayKey}
                  onChange={(e) => setRazorpayKey(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Webhook URL</Label>
                <Input
                  readOnly
                  value={`${window.location.origin}/api/webhooks/razorpay`}
                />
                <p className="text-sm text-muted-foreground">
                  Add this URL in your Razorpay Dashboard → Settings → Webhooks
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Changes */}
      <Button size="lg" onClick={handleSaveSettings}>
        Save Changes
      </Button>
    </div>
  )
}
