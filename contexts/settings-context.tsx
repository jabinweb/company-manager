'use client'

import { createContext, useContext } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import type { CompanySettings, SettingsUpdateAction } from '@/types/settings'

interface SettingsContextType {
  company: {
    id: number;
    name: string;
    logo?: string;
    email?: string;
    phone?: string;
    website?: string;
    description?: string;
  } | null;
  settings: CompanySettings | null;
  isLoading: boolean;
  updateCompany: (data: Partial<SettingsContextType['company']>) => Promise<void>;
  updateSettings: (update: SettingsUpdateAction) => Promise<void>;
  isUpdating: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data = await res.json()
      
      // Initialize integrations structure if it doesn't exist
      return {
        company: data.company || {},
        settings: {
          ...data.settings,
          integrations: {
            razorpay: {
              enabled: false,
              mode: 'test',
              credentials: {
                test: { keyId: '', keySecret: '', webhookSecret: '' },
                live: { keyId: '', keySecret: '', webhookSecret: '' }
              },
              ...(data.settings?.integrations?.razorpay || {})
            },
            ...(data.settings?.integrations || {})
          }
        }
      }
    }
  })

  const mutation = useMutation({
    mutationFn: async ({ company, settings }: { company?: any, settings?: any }) => {
      console.log('Mutation received:', { company, settings })
      const res = await fetch('/api/dashboard/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, settings })
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to update settings')
      }
      return res.json()
    },
    onSuccess: (data) => {
      console.log('Mutation success:', data)
      queryClient.setQueryData(['settings'], data)
      toast({
        title: "Success",
        description: "Settings updated successfully"
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      })
    }
  })

  return (
    <SettingsContext.Provider value={{
      company: data?.company || null,
      settings: data?.settings || null,
      isLoading,
      updateCompany: (companyData) => mutation.mutateAsync({ company: companyData }),
      updateSettings: (settingsData) => mutation.mutateAsync({ settings: settingsData }),
      isUpdating: mutation.isPending
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}
