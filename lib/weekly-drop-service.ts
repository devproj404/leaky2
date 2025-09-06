import { getSupabaseClient } from "./supabase"

export interface WeeklyDrop {
  id: number
  thumbnail_url: string
  link: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getActiveWeeklyDrop(): Promise<WeeklyDrop | null> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("weekly_drops")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching active weekly drop:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getActiveWeeklyDrop:", error)
    return null
  }
}

export async function getAllWeeklyDrops(): Promise<WeeklyDrop[]> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("weekly_drops")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching weekly drops:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllWeeklyDrops:", error)
    return []
  }
}

export async function createWeeklyDrop(weeklyDrop: Omit<WeeklyDrop, "id" | "created_at" | "updated_at">): Promise<WeeklyDrop | null> {
  try {
    const supabase = getSupabaseClient()

    // If this is being set as active, deactivate all other weekly drops
    if (weeklyDrop.is_active) {
      await supabase
        .from("weekly_drops")
        .update({ is_active: false })
        .eq("is_active", true)
    }
    
    const { data, error } = await supabase
      .from("weekly_drops")
      .insert([weeklyDrop])
      .select()
      .single()

    if (error) {
      console.error("Error creating weekly drop:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createWeeklyDrop:", error)
    return null
  }
}

export async function updateWeeklyDrop(id: number, updates: Partial<Omit<WeeklyDrop, "id" | "created_at" | "updated_at">>): Promise<WeeklyDrop | null> {
  try {
    const supabase = getSupabaseClient()

    // If this is being set as active, deactivate all other weekly drops
    if (updates.is_active) {
      await supabase
        .from("weekly_drops")
        .update({ is_active: false })
        .eq("is_active", true)
        .neq("id", id)
    }
    
    const { data, error } = await supabase
      .from("weekly_drops")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating weekly drop:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in updateWeeklyDrop:", error)
    return null
  }
}

export async function deleteWeeklyDrop(id: number): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase
      .from("weekly_drops")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting weekly drop:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteWeeklyDrop:", error)
    return false
  }
}