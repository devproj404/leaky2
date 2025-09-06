import { createServerSupabaseClient } from "./supabase"

export type Profile = {
  id: string
  username: string | null
  bio: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
  is_premium?: boolean
  is_admin?: boolean
}

export type UserDownload = {
  id: number
  user_id: string
  content_id: number
  created_at: string
  content?: any
}

export type Subscription = {
  id: number
  user_id: string
  status: "active" | "canceled" | "expired"
  plan_type: string
  starts_at: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Get a user's profile by their ID
 */
export async function getProfileById(userId: string): Promise<Profile | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

/**
 * Get a user's download history
 */
export async function getUserDownloads(userId: string, limit = 5): Promise<UserDownload[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("user_downloads")
    .select(`
      *,
      content:content_id(
        id, 
        title, 
        slug, 
        image_url, 
        file_size,
        category:category_id(id, name, slug)
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching user downloads:", error)
    return []
  }

  return data || []
}

/**
 * Get a user's active subscription
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .single()

  if (error) {
    if (error.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.error("Error fetching user subscription:", error)
    }
    return null
  }

  return data
}

/**
 * Check if a user has premium status
 */
export async function isUserPremium(userId: string): Promise<boolean> {
  const profile = await getProfileById(userId)
  return !!profile?.is_premium
}

/**
 * Track a content download for a user
 */
export async function trackUserDownload(userId: string, contentId: number): Promise<void> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase.from("user_downloads").insert({
    user_id: userId,
    content_id: contentId,
  })

  if (error) {
    console.error("Error tracking user download:", error)
    throw new Error("Failed to track download")
  }
}

/**
 * Update a user's profile
 */
export async function updateUserProfile(
  userId: string,
  profileData: Partial<Profile>,
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createServerSupabaseClient()

  const { error } = await supabase
    .from("profiles")
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

/**
 * Set a user's premium status
 */
export async function setUserPremiumStatus(
  userId: string,
  isPremium: boolean,
): Promise<{ success: boolean; error: string | null }> {
  return updateUserProfile(userId, { is_premium: isPremium })
}
