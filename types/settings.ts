export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  inventoryAlerts: boolean
  lowStockAlerts: boolean
  orderUpdates: boolean
  securityAlerts: boolean
}

export interface UserSettings {
  notifications: NotificationSettings
  theme: 'light' | 'dark' | 'system'
  language: string
}
