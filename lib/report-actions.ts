"use server"

import { createClient } from "./supabase-server"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

/**
 * Reports a dead link for a specific content
 */
export async function reportDeadLink(contentId: number, contentTitle: string) {
  const supabase = await createClient()

  // Get user session if available
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id || null

  // Generate a session ID for anonymous users
  const cookieStore = await cookies()
  let sessionId = cookieStore.get("report_session_id")?.value
  if (!sessionId) {
    sessionId = uuidv4()
    try {
      cookieStore.set("report_session_id", sessionId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
        sameSite: "lax",
      })
    } catch (error) {
      console.error("Error setting cookie:", error)
    }
  }

  try {
    // Check if there's an existing report for this content
    const { data: existingReport } = await supabase
      .from("link_reports")
      .select("id, upvotes")
      .eq("content_id", contentId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingReport) {
      // Return the existing report
      return {
        success: true,
        reportId: existingReport.id,
        upvotes: existingReport.upvotes,
        message: "This link has already been reported",
        alreadyReported: true,
      }
    }

    // Insert new report
    const { data: newReport, error } = await supabase
      .from("link_reports")
      .insert({
        content_id: contentId,
        user_id: userId,
        content_title: contentTitle,
        status: "pending",
        report_type: "dead_link",
        upvotes: 0,
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error inserting report:", error)
      throw error
    }

    return {
      success: true,
      reportId: newReport.id,
      upvotes: 0,
      message: "Thank you for reporting this issue",
      alreadyReported: false,
    }
  } catch (error) {
    console.error("Error reporting dead link:", error)
    return {
      success: false,
      message: "There was a problem submitting your report",
    }
  }
}

/**
 * Upvotes a dead link report
 */
export async function upvoteDeadLinkReport(reportId: number) {
  const supabase = await createClient()

  // Get user session if available
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id || null

  // Get or create session ID for anonymous users
  const cookieStore = await cookies()
  let sessionId = cookieStore.get("report_session_id")?.value
  if (!sessionId) {
    sessionId = uuidv4()
    try {
      cookieStore.set("report_session_id", sessionId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
        sameSite: "lax",
      })
    } catch (error) {
      console.error("Error setting cookie:", error)
    }
  }

  try {
    // Check if user already upvoted this report
    const { data: existingUpvote } = await supabase
      .from("link_report_upvotes")
      .select("id")
      .eq("report_id", reportId)
      .eq(userId ? "user_id" : "session_id", userId || sessionId)
      .maybeSingle()

    if (existingUpvote) {
      return {
        success: false,
        message: "You have already upvoted this report",
      }
    }

    // Begin a transaction
    const { error: transactionError } = await supabase.rpc("upvote_report", {
      p_report_id: reportId,
      p_user_id: userId,
      p_session_id: userId ? null : sessionId,
    })

    if (transactionError) {
      // Fallback if RPC fails
      console.warn("RPC upvote_report failed, falling back to direct updates:", transactionError)

      // Insert upvote record
      await supabase.from("link_report_upvotes").insert({
        report_id: reportId,
        user_id: userId,
        session_id: userId ? null : sessionId,
      })

      // Increment upvote count
      await supabase
        .from("link_reports")
        .update({
          upvotes: supabase.rpc("increment", { row_id: reportId, table_name: "link_reports", column_name: "upvotes" }),
        })
        .eq("id", reportId)
    }

    // Get updated upvote count
    const { data: updatedReport } = await supabase.from("link_reports").select("upvotes").eq("id", reportId).single()

    return {
      success: true,
      upvotes: updatedReport?.upvotes || 0,
      message: "Upvote recorded successfully",
    }
  } catch (error) {
    console.error("Error upvoting report:", error)
    return {
      success: false,
      message: "There was a problem recording your upvote",
    }
  }
}
