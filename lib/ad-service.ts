import { getSupabaseClient } from "./supabase"

export interface AdSlot {
  id: number
  name: string
  description: string
  image_url: string
  link_url: string
  placement: 'homepage-top' | 'homepage-bottom' | 'content-top' | 'content-bottom'
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
}

export async function getActiveAdsByPlacement(placement: string): Promise<AdSlot[]> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("ad_slots")
      .select("*")
      .eq("placement", placement)
      .eq("is_active", true)
      .order("priority", { ascending: true })

    if (error) {
      console.error("Error fetching ads:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getActiveAdsByPlacement:", error)
    return []
  }
}

export async function getAllAds(): Promise<AdSlot[]> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("ad_slots")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching all ads:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getAllAds:", error)
    return []
  }
}

export async function createAd(ad: Omit<AdSlot, "id" | "created_at" | "updated_at">): Promise<AdSlot | null> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("ad_slots")
      .insert([ad])
      .select()
      .single()

    if (error) {
      console.error("Error creating ad:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in createAd:", error)
    return null
  }
}

export async function updateAd(id: number, updates: Partial<Omit<AdSlot, "id" | "created_at" | "updated_at">>): Promise<AdSlot | null> {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("ad_slots")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating ad:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in updateAd:", error)
    return null
  }
}

export async function deleteAd(id: number): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    
    const { error } = await supabase
      .from("ad_slots")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting ad:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteAd:", error)
    return false
  }
}