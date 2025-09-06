import { createClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Global variables to store client instances
let clientSideSupabase: SupabaseClient | null = null
let serverSideSupabase: SupabaseClient | null = null

// Helper function to clean and validate environment variables
const cleanEnvVar = (value: string | undefined): string => {
  if (!value) return ""
  return value.trim().replace(/['"]/g, '')
}

// Create a single supabase client for the entire server-side application
export const createServerSupabaseClient = () => {
  // Use environment variables or fallback to empty strings to prevent crashes
  const supabaseUrl = cleanEnvVar(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseKey = cleanEnvVar(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!supabaseUrl) {
    console.error("Missing Supabase URL environment variable")
    throw new Error("Missing Supabase URL environment variable")
  }

  if (!supabaseKey) {
    console.error("Missing Supabase key environment variable")
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
    console.log("Creating new server-side Supabase client")

    // Custom fetch with timeout
    const fetchWithTimeout = (url: RequestInfo, options: RequestInit = {}) => {
      const controller = new AbortController()
      const { signal } = controller

      // Increase timeout to 30 seconds (was 20)
      const timeout = setTimeout(() => {
        controller.abort()
      }, 30000)

      return fetch(url, {
        ...options,
        signal,
      }).finally(() => {
        clearTimeout(timeout)
      })
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
        poolSize: 10, // Increased from 5 to 10
      },
      realtime: {
        timeout: 20000, // Increased from 10000 to 20000
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
      console.error("Client-side: Missing Supabase environment variables", {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
      })
      throw new Error("Missing Supabase configuration")
    }

    // Validate URL format
    try {
      new URL(supabaseUrl)
    } catch (error) {
      throw new Error(`Invalid Supabase URL: ${supabaseUrl}`)
    }

    console.log("Creating new client-side Supabase client")

    // Custom fetch with timeout
    const fetchWithTimeout = (url: RequestInfo, options: RequestInit = {}) => {
      const controller = new AbortController()
      const { signal } = controller

      // Increase timeout to 30 seconds (was 20)
      const timeout = setTimeout(() => {
        controller.abort()
      }, 30000)

      return fetch(url, {
        ...options,
        signal,
      }).finally(() => {
        clearTimeout(timeout)
      })
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
          poolSize: 10, // Increased from 5 to 10
        },
        realtime: {
          timeout: 20000, // Increased from 10000 to 20000
        },
      })
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      throw error
    }
  }

  return clientSideSupabase
}

// Function to force refresh the Supabase client
export function refreshSupabaseClient(): SupabaseClient {
  console.log("Forcing Supabase client refresh")
  clientSideSupabase = null
  return getSupabaseClient()
}

// Export only the singleton client for direct imports
export const supabaseClient = typeof window !== "undefined" ? getSupabaseClient() : null
