import { Loader2 } from "lucide-react"

export default function AdminAnalyticsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center">
        <Loader2 className="h-10 w-10 text-pink-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-lg">Loading analytics dashboard...</p>
      </div>
    </div>
  )
}
