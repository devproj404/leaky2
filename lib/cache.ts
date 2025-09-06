import { Redis } from '@upstash/redis'

// Initialize Redis client with environment variables (optional for build-time)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
})

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  VERY_SHORT: 60,      // 1 minute - for frequently changing data
  SHORT: 300,          // 5 minutes - for content that changes regularly
  MEDIUM: 900,         // 15 minutes - for semi-static content
  LONG: 1800,          // 30 minutes - for relatively static content
  VERY_LONG: 3600,     // 1 hour - for very static content
  DAILY: 86400,        // 24 hours - for rarely changing data
} as const

// Generic cache wrapper function
export async function getCached<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL.SHORT
): Promise<T> {
  try {
    // Skip cache if Redis is not configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return await fetchFn()
    }
    
    // Try to get data from cache
    const cached = await redis.get(key)
    
    if (cached !== null) {
      return cached as T
    }
    
    // If not in cache, fetch data
    const data = await fetchFn()
    
    // Store in cache with TTL
    await redis.setex(key, ttl, JSON.stringify(data))
    
    return data
  } catch (error) {
    // If cache fails, still return the fetched data
    return await fetchFn()
  }
}

// Batch cache operations
export async function getCachedBatch<T>(
  requests: Array<{
    key: string
    fetchFn: () => Promise<T>
    ttl?: number
  }>
): Promise<T[]> {
  try {
    // Skip cache if Redis is not configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return Promise.all(requests.map(req => req.fetchFn()))
    }
    // Get all keys at once
    const keys = requests.map(r => r.key)
    const cached = await redis.mget<T[]>(...keys)
    
    const results: T[] = []
    const uncachedRequests: Array<{
      index: number
      key: string
      fetchFn: () => Promise<T>
      ttl: number
    }> = []
    
    // Identify which items need to be fetched
    for (let i = 0; i < requests.length; i++) {
      if (cached[i] !== null) {
        console.log(`Batch cache HIT for key: ${requests[i].key}`)
        results[i] = cached[i] as T
      } else {
        console.log(`Batch cache MISS for key: ${requests[i].key}`)
        uncachedRequests.push({
          index: i,
          key: requests[i].key,
          fetchFn: requests[i].fetchFn,
          ttl: requests[i].ttl || CACHE_TTL.SHORT
        })
      }
    }
    
    // Fetch uncached data in parallel
    const uncachedResults = await Promise.all(
      uncachedRequests.map(req => req.fetchFn())
    )
    
    // Store uncached results and update results array
    const cachePromises: Promise<void>[] = []
    for (let i = 0; i < uncachedRequests.length; i++) {
      const req = uncachedRequests[i]
      const data = uncachedResults[i]
      results[req.index] = data
      
      // Store in cache asynchronously
      cachePromises.push(
        redis.setex(req.key, req.ttl, JSON.stringify(data)).catch(console.error)
      )
    }
    
    // Wait for all cache operations to complete (but don't block response)
    Promise.all(cachePromises).catch(console.error)
    
    return results
  } catch (error) {
    console.error('Batch cache error:', error)
    
    // Fallback to individual fetches
    return Promise.all(requests.map(req => req.fetchFn()))
  }
}

// Delete cache entries
export async function deleteCache(key: string): Promise<void> {
  try {
    // Skip if Redis is not configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return
    }
    
    await redis.del(key)
    console.log(`Cache DELETED for key: ${key}`)
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error)
  }
}

// Delete multiple cache entries by pattern
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    // Skip if Redis is not configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return
    }
    
    // Note: This is a simple implementation. For production, you might want to use SCAN
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
      console.log(`Cache DELETED ${keys.length} keys matching pattern: ${pattern}`)
    }
  } catch (error) {
    console.error(`Cache pattern delete error for pattern ${pattern}:`, error)
  }
}

// Cache key generators for consistent naming
export const cacheKeys = {
  // Content related
  content: {
    trending: (limit: number) => `content:trending:limit:${limit}`,
    category: (slug: string, page: number, sort: string) => `content:category:${slug}:page:${page}:sort:${sort}`,
    detail: (categorySlug: string, contentSlug: string) => `content:detail:${categorySlug}:${contentSlug}`,
    search: (query: string, page: number) => `content:search:${query}:page:${page}`,
    popular: (limit: number) => `content:popular:limit:${limit}`,
    recent: (limit: number) => `content:recent:limit:${limit}`,
    premium: (limit: number) => `content:premium:limit:${limit}`,
    free: (limit: number) => `content:free:limit:${limit}`,
  },
  // Categories related
  categories: {
    all: () => `categories:all`,
    withCounts: () => `categories:with-counts`,
    single: (slug: string) => `categories:single:${slug}`,
    contentCount: (slug: string, filter: string) => `categories:content-count:${slug}:${filter}`,
  },
  // System related
  system: {
    weeklyDrop: () => `system:weekly-drop:active`,
    ads: (placement: string) => `system:ads:${placement}`,
  }
} as const

// Helper to check Redis connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    // Skip if Redis is not configured
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return false
    }
    
    const result = await redis.ping()
    console.log('Redis connection test:', result)
    return result === 'PONG'
  } catch (error) {
    console.error('Redis connection failed:', error)
    return false
  }
}

// Cache statistics
export async function getCacheStats(): Promise<{
  connected: boolean
  info?: any
}> {
  try {
    const connected = await testRedisConnection()
    if (!connected) {
      return { connected: false }
    }
    
    // Get Redis info (if available)
    try {
      const info = await redis.info()
      return { connected: true, info }
    } catch {
      return { connected: true }
    }
  } catch (error) {
    console.error('Failed to get cache stats:', error)
    return { connected: false }
  }
}