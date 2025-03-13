'use client'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 p-6 pb-16">
      {/* <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your company preferences and system settings.
        </p>
      </div> */}
      {/* <Separator /> */}
        <div className="flex-1">{children}</div>
    </div>
  )
}
