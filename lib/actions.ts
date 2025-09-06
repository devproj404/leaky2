"use server"

import { createClient } from "./supabase-server"

/**
 * Increments the download count for a specific content item
 * @param contentId The ID of the content to increment downloads for
 */
export async function incrementDownloads(contentId: number): Promise<void> {
  const supabase = await createClient()

  // Make sure contentId is a valid number
  if (!contentId || isNaN(contentId)) {
    console.error("Invalid content ID provided to incrementDownloads:", contentId)
    return
  }

  try {
    // First, try to use the RPC function if it exists
    const { error: rpcError } = await supabase.rpc("increment_content_downloads", {
      content_id: contentId,
    })

    // If RPC fails, fall back to direct update
    if (rpcError) {
      console.warn("RPC increment_content_downloads failed, falling back to direct update:", rpcError)

      // Get current download count
      const { data: content, error: fetchError } = await supabase
        .from("content")
        .select("downloads, download_count")
        .eq("id", contentId)
        .single()

      if (fetchError) {
        console.error("Error fetching content download count:", fetchError)
        return
      }

      // Increment both downloads and download_count
      const { error: updateError } = await supabase
        .from("content")
        .update({ 
          downloads: (content?.downloads || 0) + 1,
          download_count: (content?.download_count || 0) + 1 
        })
        .eq("id", contentId)

      if (updateError) {
        console.error("Error updating content download count:", updateError)
      } else {
        console.log(`Successfully incremented downloads for content ID ${contentId} using direct update`)
      }
    } else {
      console.log(`Successfully incremented downloads for content ID ${contentId} using RPC`)
    }
  } catch (error) {
    console.error("Exception in incrementDownloads:", error)
  }
}
