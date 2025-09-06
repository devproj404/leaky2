import { Loader2 } from "lucide-react"

export default function LegalLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar skeleton */}
        <div className="md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="h-8 w-40 bg-gray-800 rounded mb-4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-gray-800 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Main Content skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-pink-500 animate-spin mb-4" />
            <p className="text-gray-400">Loading legal information...</p>
          </div>
        </div>
      </div>
    </div>
  )
} 