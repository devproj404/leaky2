"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { getSupabaseClient, refreshSupabaseClient } from "./connection-manager"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isPremium: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any; data: any }>
  signOut: () => Promise<void>
  upgradeToPremium: (paymentDetails: PaymentDetails) => Promise<{ success: boolean; error?: string }>
  refreshSession: () => Promise<void>
  authError: string | null
}

type PaymentDetails = {
  amount: number
  paymentMethod: string
  transactionId: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Create a profile for a user if it doesn't exist
const createProfileIfNeeded = async (supabase: any, userId: string) => {
  try {
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    // If no profile exists, create one
    if (profileError && profileError.code === "PGRST116") {
      // Use RPC to create profile to bypass RLS
      const { error: insertError } = await supabase.rpc("create_user_profile", {
        user_id: userId,
        username_val: `user_${userId.substring(0, 8)}`,
        timestamp_val: new Date().toISOString(),
      })

      // Fallback to direct insert if RPC fails
      if (insertError) {
        const { error: directInsertError } = await supabase.from("profiles").insert({
          id: userId,
          username: `user_${userId.substring(0, 8)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_premium: false,
          is_admin: false,
        })
      }
    }
  } catch (error) {
    // Silent error in production
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Use a ref to store the Supabase client to ensure it's only created once
  const supabaseRef = useRef(getSupabaseClient())
  const supabase = supabaseRef.current

  // Check if user has admin status
  const checkAdminStatus = useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).single()

        if (error) {
          return false
        }

        return !!data?.is_admin
      } catch (error) {
        return false
      }
    },
    [supabase],
  )

  // Refresh session manually with retry logic
  const refreshSession = async () => {
    try {
      setAuthError(null)
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setAuthError("Failed to refresh session. Please try again.")
        return
      }

      if (data?.session) {
        setSession(data.session)
        setUser(data.session.user)

        // Check premium status
        if (data.session.user) {
          const premium = await checkPremiumStatus(data.session.user.id)
          setIsPremium(premium)

          // Check admin status
          const admin = await checkAdminStatus(data.session.user.id)
          setIsAdmin(admin)
        }
      }

      // Reset retry count on success
      setRetryCount(0)
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again.")

      // Implement retry logic
      if (retryCount < 3) {
        setRetryCount((prev) => prev + 1)
        // Refresh the Supabase client before retrying
        supabaseRef.current = refreshSupabaseClient()
        setTimeout(refreshSession, 1000 * (retryCount + 1)) // Exponential backoff
      }
    }
  }

  // Check if user has premium status with better error handling
  const checkPremiumStatus = useCallback(
    async (userId: string) => {
      try {
        // First check the profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("is_premium")
          .eq("id", userId)
          .single()

        if (!profileError && profileData?.is_premium) {
          return true
        }

        // If not found in profiles or not premium, check premium_purchases
        const { data: purchaseData, error: purchaseError } = await supabase
          .from("premium_purchases")
          .select("id")
          .eq("user_id", userId)
          .limit(1)

        if (!purchaseError && purchaseData && purchaseData.length > 0) {
          // If we found a purchase but the profile isn't marked as premium, update it
          const { error: updateError } = await supabase.from("profiles").update({ is_premium: true }).eq("id", userId)

          return true
        }

        return false
      } catch (error) {
        return false
      }
    },
    [supabase],
  )

  // Initialize auth state with better error handling and retry logic
  useEffect(() => {
    if (authInitialized) return

    let mounted = true
    let authListener: any = null

    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        setAuthError(null)

        // Get the current session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          if (mounted) {
            setIsLoading(false)
            setAuthError("Failed to initialize authentication. Please refresh the page.")
          }
          return
        }

        const currentSession = sessionData?.session

        if (currentSession && mounted) {
          setSession(currentSession)
          setUser(currentSession.user)

          // Create profile if needed
          await createProfileIfNeeded(supabase, currentSession.user.id)

          // Check premium status
          const premium = await checkPremiumStatus(currentSession.user.id)
          if (mounted) setIsPremium(premium)

          // Check admin status
          const admin = await checkAdminStatus(currentSession.user.id)
          if (mounted) setIsAdmin(admin)
        }

        // Set up auth state change listener
        const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (mounted) {
            if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
              if (newSession) {
                setSession(newSession)
                setUser(newSession.user)

                // Create profile if needed
                await createProfileIfNeeded(supabase, newSession.user.id)

                // Check premium status
                const premium = await checkPremiumStatus(newSession.user.id)
                if (mounted) setIsPremium(premium)

                // Check admin status
                const admin = await checkAdminStatus(newSession.user.id)
                if (mounted) setIsAdmin(admin)
              }
            } else if (event === "SIGNED_OUT") {
              setSession(null)
              setUser(null)
              setIsPremium(false)
              setIsAdmin(false)
            }
          }
        })

        authListener = data
        setAuthInitialized(true)
      } catch (error) {
        if (mounted) {
          setAuthError("An unexpected error occurred during authentication initialization.")
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe()
      }
    }
  }, [checkPremiumStatus, checkAdminStatus, supabase, authInitialized])

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setAuthError(null)

      // Validate inputs before sending to Supabase
      if (!email || !password) {
        return { error: { message: "Email and password are required" } }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setAuthError(`Sign in failed: ${error.message}`)
        return { error }
      }

      if (data?.user) {
        // Create profile if needed
        await createProfileIfNeeded(supabase, data.user.id)

        // Force refresh the session
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session) {
          setSession(sessionData.session)
          setUser(sessionData.session.user)

          // Check admin status
          const admin = await checkAdminStatus(data.user.id)
          setIsAdmin(admin)
        }
      }

      return { error: null }
    } catch (error: any) {
      setAuthError("An unexpected error occurred during sign in.")
      return { error }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata = {}) => {
    try {
      setIsLoading(true)
      setAuthError(null)

      // Validate inputs before sending to Supabase
      if (!email || !password) {
        return { data: null, error: { message: "Email and password are required" } }
      }

      // First register the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setAuthError(`Sign up failed: ${error.message}`)
        return { data: null, error }
      }

      // If registration is successful, immediately sign them in regardless of email confirmation
      if (data.user) {
        // Sign in the user right after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setAuthError(`Auto sign-in failed: ${signInError.message}`)
          return { data, error: signInError }
        }

        // Create profile if needed
        await createProfileIfNeeded(supabase, data.user.id)
      }

      return { data, error: null }
    } catch (error) {
      setAuthError("An unexpected error occurred during sign up.")
      return { data: null, error }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true)
      setAuthError(null)
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setIsPremium(false)
      setIsAdmin(false)
    } catch (error) {
      setAuthError("Failed to sign out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Upgrade to premium
  const upgradeToPremium = async (paymentDetails: PaymentDetails) => {
    if (!user) {
      return { success: false, error: "You must be logged in to upgrade to premium" }
    }

    try {
      // Call the RPC function to record the premium purchase
      const { data, error } = await supabase.rpc("record_premium_purchase", {
        user_id: user.id,
        amount: paymentDetails.amount,
        payment_method: paymentDetails.paymentMethod,
        transaction_id: paymentDetails.transactionId,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Update the profile to mark as premium
      const { error: profileError } = await supabase.from("profiles").update({ is_premium: true }).eq("id", user.id)

      // Update local state
      setIsPremium(true)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "An error occurred during upgrade" }
    }
  }

  const value = {
    user,
    session,
    isLoading,
    isPremium,
    isAdmin,
    signIn,
    signUp,
    signOut,
    upgradeToPremium,
    refreshSession,
    authError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
