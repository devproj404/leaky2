"use server"

import { createClient } from "./supabase-server"

// Define the report types
export type Report = {
  id: number
  content_id: number
  user_id: string | null
  content_title: string
  status: "pending" | "resolved" | "rejected"
  report_type: string
  upvotes: number
  created_at: string
  updated_at: string
}

/**
 * Gets all link reports
 */
export async function getLinkReports() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("link_reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching link reports:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getLinkReports:", error)
    return []
  }
}

/**
 * Updates a link report status
 */
export async function updateReportStatus(reportId: number, status: "pending" | "resolved" | "rejected") {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from("link_reports")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reportId)

    if (error) {
      console.error("Error updating report status:", error)
      return {
        success: false,
        message: "Failed to update report status",
      }
    }

    return {
      success: true,
      message: `Report marked as ${status}`,
    }
  } catch (error) {
    console.error("Error in updateReportStatus:", error)
    return {
      success: false,
      message: "An error occurred while updating the report",
    }
  }
}

/**
 * Deletes a link report
 */
export async function deleteReport(reportId: number) {
  try {
    const supabase = await createClient()

    // First delete any upvotes associated with this report
    const { error: upvotesError } = await supabase
      .from("link_report_upvotes")
      .delete()
      .eq("report_id", reportId)

    if (upvotesError) {
      console.error("Error deleting report upvotes:", upvotesError)
    }

    // Then delete the report itself
    const { error } = await supabase
      .from("link_reports")
      .delete()
      .eq("id", reportId)

    if (error) {
      console.error("Error deleting report:", error)
      return { 
        success: false, 
        message: "Failed to delete report" 
      }
    }

    return { 
      success: true, 
      message: "Report deleted successfully" 
    }
  } catch (error) {
    console.error("Error in deleteReport:", error)
    return { 
      success: false, 
      message: "An error occurred while deleting the report" 
    }
  }
}
