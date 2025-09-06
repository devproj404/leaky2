import { Loader2 } from "lucide-react"

export default function ContentRankingLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading content ranking...</p>
        </div>
      </div>
    </div>
  )
}
