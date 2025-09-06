import { createClient } from "./supabase-server"

// Check if a user has premium access
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  if (!userId) return false

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("profiles").select("is_premium").eq("id", userId).single()

    if (error) {
      console.error("Error checking premium status:", error)
      return false
    }

    return data?.is_premium || false
  } catch (error) {
    console.error("Exception in hasPremiumAccess:", error)
    return false
  }
}

// Get premium users count
export async function getPremiumUsersCount(): Promise<number> {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_premium", true)

    if (error) {
      console.error("Error getting premium users count:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Exception in getPremiumUsersCount:", error)
    return 0
  }
}

// Get premium users
export async function getPremiumUsers(page = 1, limit = 10): Promise<any[]> {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, created_at, premium_since")
      .eq("is_premium", true)
      .order("premium_since", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error getting premium users:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception in getPremiumUsers:", error)
    return []
  }
}
