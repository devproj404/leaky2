"use client"

import { useTransition } from "react"
import { updateReportStatus, deleteReport } from "@/lib/admin-report-actions"
import { Button } from "@/components/ui/button"

interface ReportActionButtonsProps {
  reportId: number
  currentStatus: string
}

export function ReportActionButtons({ reportId, currentStatus }: ReportActionButtonsProps) {
  const [isPending, startTransition] = useTransition()

  const handleUpdateStatus = (status: "pending" | "resolved" | "rejected") => {
    startTransition(async () => {
      await updateReportStatus(reportId, status)
      window.location.reload() // Simple way to refresh the page after action
    })
  }

  const handleDeleteReport = () => {
    startTransition(async () => {
      await deleteReport(reportId)
      window.location.reload() // Simple way to refresh the page after action
    })
  }

  return (
    <div className="flex justify-end gap-2">
      <Button
        onClick={() => handleUpdateStatus("resolved")}
        disabled={isPending || currentStatus === "resolved"}
        size="sm"
        variant="outline"
        className="border-green-700/50 bg-green-900/20 text-green-400 hover:bg-green-900/30 hover:text-green-300"
      >
        Mark Fixed
      </Button>
      <Button
        onClick={() => handleUpdateStatus("rejected")}
        disabled={isPending || currentStatus === "rejected"}
        size="sm"
        variant="outline"
        className="border-red-700/50 bg-red-900/20 text-red-400 hover:bg-red-900/30 hover:text-red-300"
      >
        Reject
      </Button>
      <Button
        onClick={handleDeleteReport}
        disabled={isPending}
        size="sm"
        variant="outline"
        className="border-gray-700 text-gray-300 hover:bg-gray-800"
      >
        Delete
      </Button>
    </div>
  )
}
