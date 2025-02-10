interface DismissedNotification {
  id: string
  dismissedAt: number
}

const DISMISSED_KEY = 'dismissed_notifications'
const EXPIRY_DAYS = 30 // Notifications are dismissed for 30 days

export function getDismissedNotifications(): string[] {
  if (typeof window === 'undefined') return []
  
  const dismissed = localStorage.getItem(DISMISSED_KEY)
  if (!dismissed) return []

  const dismissedItems: DismissedNotification[] = JSON.parse(dismissed)
  const now = Date.now()
  const validItems = dismissedItems.filter(item => {
    const age = now - item.dismissedAt
    return age < EXPIRY_DAYS * 24 * 60 * 60 * 1000
  })

  // Clean up expired items
  if (validItems.length !== dismissedItems.length) {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(validItems))
  }

  return validItems.map(item => item.id)
}

export function addDismissedNotification(id: string) {
  const dismissed = localStorage.getItem(DISMISSED_KEY)
  const dismissedItems: DismissedNotification[] = dismissed ? JSON.parse(dismissed) : []
  
  if (!dismissedItems.some(item => item.id === id)) {
    dismissedItems.push({
      id,
      dismissedAt: Date.now()
    })
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissedItems))
  }
}

export function isDismissed(id: string): boolean {
  return getDismissedNotifications().includes(id)
}
