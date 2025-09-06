"use server"

import { createServerSupabaseClient } from "./supabase"
import { revalidatePath } from "next/cache"

/**
 * Update a user's premium status
 */
export async function updateUserPremiumStatus(formData: FormData) {
  try {
    const userId = formData.get("userId") as string
    const isPremium = formData.get("isPremium") === "true"

    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    // Use server-side Supabase client with service role key
    const supabase = createServerSupabaseClient()

    // Update the user's premium status
    const { error } = await supabase
      .from("profiles")
      .update({
        is_premium: !isPremium,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Server action error updating premium status:", error)
      return { success: false, error: error.message }
    }

    // Verify the update
    const { data, error: fetchError } = await supabase.from("profiles").select("is_premium").eq("id", userId).single()

    if (fetchError) {
      console.error("Error verifying premium status update:", fetchError)
      return { success: false, error: "Update may have failed: " + fetchError.message }
    }

    console.log("Server action - Updated profile:", data)

    // Revalidate the admin users page
    revalidatePath("/admin/users")

    return {
      success: true,
      error: null,
      user: data,
    }
  } catch (error: any) {
    console.error("Unexpected error in updateUserPremiumStatus:", error)
    return { success: false, error: error.message }
  }
}

/**
 * Update a user's admin status
 */
export async function updateUserAdminStatus(formData: FormData) {
  try {
    const userId = formData.get("userId") as string
    const isAdmin = formData.get("isAdmin") === "true"

    if (!userId) {
      return { success: false, error: "User ID is required" }
    }

    // Don't allow removing admin rights
    if (isAdmin) {
      return { success: false, error: "Admin rights cannot be removed for security reasons" }
    }

    // Use server-side Supabase client with service role key
    const supabase = createServerSupabaseClient()

    // Update the user's admin status
    const { error } = await supabase
      .from("profiles")
      .update({
        is_admin: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("Server action error updating admin status:", error)
      return { success: false, error: error.message }
    }

    // Revalidate the admin users page
    revalidatePath("/admin/users")

    return { success: true, error: null }
  } catch (error: any) {
    console.error("Unexpected error in updateUserAdminStatus:", error)
    return { success: false, error: error.message }
  }
}
