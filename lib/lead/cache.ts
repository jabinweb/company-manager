export class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly TTL: number

  constructor(ttlSeconds = 30) {
    this.TTL = ttlSeconds * 1000
    setInterval(() => this.cleanup(), 60000)
  }

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  private cleanup() {
    const now = Date.now()
    // Use forEach instead of for...of
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > this.TTL) {
        this.cache.delete(key)
      }
    })
  }
}

export const leadsCache = new MemoryCache(30)
