'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import type { NotificationSettings } from '@/types/settings'

const notificationsFormSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  inventoryAlerts: z.boolean(),
  lowStockAlerts: z.boolean(),
  orderUpdates: z.boolean(),
  securityAlerts: z.boolean(),
})

interface NotificationsFormProps {
  settings?: NotificationSettings
  onSubmit: (data: NotificationSettings) => Promise<void>
}

export function NotificationsForm({ settings, onSubmit }: NotificationsFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const form = useForm<NotificationSettings>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      emailNotifications: settings?.emailNotifications ?? false,
      pushNotifications: settings?.pushNotifications ?? false,
      inventoryAlerts: settings?.inventoryAlerts ?? false,
      lowStockAlerts: settings?.lowStockAlerts ?? false,
      orderUpdates: settings?.orderUpdates ?? false,
      securityAlerts: settings?.securityAlerts ?? false,
    }
  })

  const handleSubmit = async (data: NotificationSettings) => {
    setIsSaving(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-4">
          {Object.keys(notificationsFormSchema.shape).map((key) => (
            <FormField
              key={key}
              control={form.control}
              name={key as keyof NotificationSettings}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </FormLabel>
                    <FormDescription>
                      Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>

        <Button type="submit" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </form>
    </Form>
  )
}