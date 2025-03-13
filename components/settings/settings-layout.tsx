'use client'

import { Button } from "@/components/ui/button"
import { SaveIcon } from "lucide-react"
import { useEffect, useState } from "react"

interface SettingsLayoutProps {
  children: React.ReactNode
  onSave: () => Promise<void>
  isLoading?: boolean
  isDirty?: boolean
}

export function SettingsLayout({ 
  children, 
  onSave, 
  isLoading,
  isDirty = false 
}: SettingsLayoutProps) {
  const [showSaveBar, setShowSaveBar] = useState(false)

  useEffect(() => {
    setShowSaveBar(isDirty)
  }, [isDirty])

  return (
    <div className="relative space-y-6 pb-16">
      {children}
      
      {showSaveBar && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/80 backdrop-blur-sm">
          <div className="container flex h-16 items-center justify-end gap-4">
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={onSave}
              disabled={isLoading}
            >
              {isLoading ? (
                "Saving..."
              ) : (
                <>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
