// Connection manager to handle multiple tabs and prevent database overload
import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Simple in-memory cache
type CacheEntry = {
  data: any
  timestamp: number
}

const cache: Record<string, CacheEntry> = {}
const CACHE_TTL = 60000 // 1 minute cache TTL

// Queue for managing concurrent requests
type QueuedRequest = {
  execute: () => Promise<any>
  resolve: (value: any) => void
  reject: (reason: any) => void
  priority: number
  timestamp: number
}

const requestQueue: QueuedRequest[] = []
let isProcessingQueue = false
const MAX_CONCURRENT_REQUESTS = 5
let activeRequests = 0

// Process the request queue
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0 || activeRequests >= MAX_CONCURRENT_REQUESTS) {
    return
  }

  isProcessingQueue = true

  try {
    // Sort queue by priority (higher number = higher priority)
    requestQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority
      }
      // If same priority, use FIFO
      return a.timestamp - b.timestamp
    })

    while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
      const request = requestQueue.shift()
      if (!request) continue

      activeRequests++

      // Execute the request
      try {
        const result = await request.execute()
        request.resolve(result)
      } catch (error) {
        request.reject(error)
      } finally {
        activeRequests--
      }
    }
  } finally {
    isProcessingQueue = false

    // If there are more requests and capacity, process them
    if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
      setTimeout(processQueue, 0)
    }
  }
}

// Add a request to the queue
function queueRequest<T>(execute: () => Promise<T>, priority = 0): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      execute,
      resolve,
      reject,
      priority,
      timestamp: Date.now(),
    })

    // Start processing the queue if not already
    if (!isProcessingQueue) {
      processQueue()
    }
  })
}

// Cache management
export function getCachedData(key: string): any | null {
  const entry = cache[key]
  if (!entry) return null

  // Check if cache entry is still valid
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    delete cache[key]
    return null
  }

  return entry.data
}

export function setCachedData(key: string, data: any): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
  }
}

export function clearCache(): void {
  Object.keys(cache).forEach((key) => {
    delete cache[key]
  })
}

// Helper function to clean and validate environment variables
const cleanEnvVar = (value: string | undefined): string => {
  if (!value) return ""
  return value.trim().replace(/['"]/g, '')
}

// Supabase client with connection management
let clientSideSupabase: SupabaseClient | null = null
let serverSideSupabase: SupabaseClient | null = null

// Create a single supabase client for the entire server-side application
export const createServerSupabaseClient = () => {
  // Use environment variables or fallback to empty strings to prevent crashes
  const supabaseUrl = cleanEnvVar(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseKey = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!supabaseUrl) {
    throw new Error("Missing Supabase URL environment variable")
  }

  if (!supabaseKey) {
    throw new Error("Missing Supabase key environment variable")
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch (error) {
    throw new Error(`Invalid Supabase URL: ${supabaseUrl}`)
  }

  // Use the singleton pattern for server-side as well
  if (!serverSideSupabase) {
    // Custom fetch with timeout and retry
    const fetchWithTimeout = (url: RequestInfo, options: RequestInit = {}) => {
      return queueRequest(() => {
        const controller = new AbortController()
        const { signal } = controller

        // Set a timeout of 30 seconds
        const timeout = setTimeout(() => {
          controller.abort()
        }, 30000)

        return fetch(url, {
          ...options,
          signal,
        }).finally(() => {
          clearTimeout(timeout)
        })
      }, 1) // Server requests get priority 1
    }

    serverSideSupabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: { "x-application-name": "vicepleasure-app" },
        fetch: fetchWithTimeout,
      },
      db: {
        schema: "public",
        poolSize: 15, // Increased pool size for server
      },
      realtime: {
        timeout: 20000,
      },
    })
  }

  return serverSideSupabase
}

// Get a Supabase client (singleton pattern)
export function getSupabaseClient(): SupabaseClient {
  // For server-side rendering
  if (typeof window === "undefined") {
    return createServerSupabaseClient()
  }

  // Create new client if needed
  if (!clientSideSupabase) {
    const supabaseUrl = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const supabaseAnonKey = cleanEnvVar(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration")
    }

    // Validate URL format
    try {
      new URL(supabaseUrl)
    } catch (error) {
      throw new Error(`Invalid Supabase URL: ${supabaseUrl}`)
    }

    // Custom fetch with timeout and retry
    const fetchWithTimeout = (url: RequestInfo, options: RequestInit = {}) => {
      return queueRequest(() => {
        const controller = new AbortController()
        const { signal } = controller

        // Set a timeout of 30 seconds
        const timeout = setTimeout(() => {
          controller.abort()
        }, 30000)

        return fetch(url, {
          ...options,
          signal,
        }).finally(() => {
          clearTimeout(timeout)
        })
      }, 0) // Client requests get normal priority
    }

    try {
      clientSideSupabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: "supabase-auth",
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: { "x-application-name": "vicepleasure-app" },
          fetch: fetchWithTimeout,
        },
        db: {
          schema: "public",
          poolSize: 10,
        },
        realtime: {
          timeout: 20000,
        },
      })
    } catch (error) {
      throw error
    }
  }

  return clientSideSupabase
}

// Execute a database query with caching and queue management
export async function executeQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: {
    ttl?: number
    priority?: number
    bypassCache?: boolean
  } = {},
): Promise<T> {
  const { ttl = CACHE_TTL, priority = 0, bypassCache = false } = options

  // Check cache first unless bypassing
  if (!bypassCache) {
    const cachedData = getCachedData(queryKey)
    if (cachedData !== null) {
      return cachedData
    }
  }

  // Queue the request
  const result = await queueRequest(queryFn, priority)

  // Cache the result
  setCachedData(queryKey, result)

  return result
}

// Function to force refresh the Supabase client
export function refreshSupabaseClient(): SupabaseClient {
  clientSideSupabase = null
  return getSupabaseClient()
}

// Export only the singleton client for direct imports
export const supabaseClient = typeof window !== "undefined" ? getSupabaseClient() : null
