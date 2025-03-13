'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BasicInfoSection } from "./sections/basic-info"
import { CustomizationSection } from "./sections/customization"
import { NotificationsSection } from "./sections/notifications"
import { PaymentSection } from "./sections/payment"
import { SecuritySection } from "./sections/security"
import { SettingsProvider } from "@/contexts/settings-context"
import { SettingsLayout } from "../settings-layout"
import { useSettings } from "@/contexts/settings-context"
import type { CompanySettings, SettingsUpdatePayload } from '@/types/settings'

export function CompanySettings() {
  return (
    <SettingsProvider>
      <CompanySettingsContent />
    </SettingsProvider>
  )
}

function CompanySettingsContent() {
  const [isDirty, setIsDirty] = useState(false)
  const { updateCompany, updateSettings, isUpdating } = useSettings()
  const [pendingChanges, setPendingChanges] = useState<SettingsUpdatePayload>({})

  const handleSettingsChange = (changes: SettingsUpdatePayload) => {
    setPendingChanges(prev => ({
      company: { ...prev.company, ...changes.company },
      settings: { ...prev.settings, ...changes.settings }
    }))
    setIsDirty(true)
  }

  const handleSave = async () => {
    if (pendingChanges.company) {
      await updateCompany(pendingChanges.company)
    }
    if (pendingChanges.settings) {
      await updateSettings(pendingChanges.settings)
    }
    setIsDirty(false)
    setPendingChanges({})
  }

  return (
    <SettingsLayout 
      onSave={handleSave}
      isLoading={isUpdating}
      isDirty={isDirty}
    >
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="customization">Customization</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <BasicInfoSection onChange={handleSettingsChange} />
        </TabsContent>
        <TabsContent value="customization">
          <CustomizationSection onChange={handleSettingsChange} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationsSection onChange={handleSettingsChange} />
        </TabsContent>
        <TabsContent value="payment">
          <PaymentSection onChange={handleSettingsChange} />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySection onChange={handleSettingsChange} />
        </TabsContent>
      </Tabs>
    </SettingsLayout>
  )
}
