"use client"

import { useState } from "react"
import { AlertTriangle, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { reportDeadLink, upvoteDeadLinkReport } from "@/lib/report-actions"
import { toast } from "@/components/ui/use-toast"

interface ReportDeadLinkButtonProps {
  contentId: number
  contentTitle: string
}

export function ReportDeadLinkButton({ contentId, contentTitle }: ReportDeadLinkButtonProps) {
  const [isReporting, setIsReporting] = useState(false)
  const [isUpvoting, setIsUpvoting] = useState(false)
  const [reportData, setReportData] = useState<{
    reportId?: number
    upvotes?: number
    alreadyReported?: boolean
  } | null>(null)

  const handleReport = async () => {
    if (isReporting) return
    setIsReporting(true)

    try {
      const result = await reportDeadLink(contentId, contentTitle)
      
      if (result.success) {
        setReportData({
          reportId: result.reportId,
          upvotes: result.upvotes,
          alreadyReported: result.alreadyReported,
        })
        
        toast({
          title: "Thank you!",
          description: result.message,
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error reporting dead link:", error)
      toast({
        title: "Error",
        description: "There was a problem submitting your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsReporting(false)
    }
  }

  const handleUpvote = async () => {
    if (!reportData?.reportId || isUpvoting) return
    setIsUpvoting(true)

    try {
      const result = await upvoteDeadLinkReport(reportData.reportId)
      
      if (result.success) {
        setReportData({
          ...reportData,
          upvotes: result.upvotes,
        })
        
        toast({
          title: "Thank you!",
          description: result.message,
        })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error("Error upvoting report:", error)
      toast({
        title: "Error",
        description: "There was a problem recording your upvote. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpvoting(false)
    }
  }

  // If already reported, show upvote option
  if (reportData?.alreadyReported) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 border-amber-700/50 bg-amber-900/20 text-amber-400 hover:bg-amber-900/30 hover:text-amber-300"
          onClick={handleUpvote}
          disabled={isUpvoting}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
          <span>Upvote Report ({reportData.upvotes})</span>
        </Button>
        <p className="text-xs text-gray-400">This link has already been reported</p>
      </div>
    )
  }

  // If just reported, show confirmation and upvote count
  if (reportData?.reportId) {
    return (
      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-green-400">Thank you for your report!</p>
        <p className="text-xs text-gray-400">Our team will look into this issue</p>
      </div>
    )
  }

  // Default: show report button
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1 border-red-700/50 bg-red-900/20 text-red-400 hover:bg-red-900/30 hover:text-red-300"
      onClick={handleReport}
      disabled={isReporting}
    >
      <AlertTriangle className="h-3.5 w-3.5" />
      <span>{isReporting ? "Reporting..." : "Report Dead Link"}</span>
    </Button>
  )
}
