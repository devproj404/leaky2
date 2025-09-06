import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex flex-col md:flex-row gap-8 container mx-auto px-4 py-8">
      <main className="flex-1">
        {/* Header with breadcrumb */}
        <div className="flex items-center text-sm text-gray-400 mb-4">
          <Skeleton className="h-4 w-16 bg-pink-900/20" />
          <span className="mx-2">/</span>
          <Skeleton className="h-5 w-24 bg-pink-900/20" />
        </div>

        {/* Main content image with title overlay */}
        <Skeleton className="w-full h-[400px] rounded-lg bg-pink-900/20 mb-6" />

        {/* Preview images section */}
        <div className="border-t border-pink-900/30 pt-6 mb-8">
          <Skeleton className="h-7 w-40 bg-pink-900/20 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Skeleton className="aspect-square w-full rounded-lg bg-pink-900/20" />
            <Skeleton className="aspect-square w-full rounded-lg bg-pink-900/20" />
            <Skeleton className="aspect-square w-full rounded-lg bg-pink-900/20" />
          </div>
        </div>

        {/* Download information section */}
        <div className="border-t border-pink-900/30 pt-6 mb-8">
          <Skeleton className="h-7 w-56 bg-pink-900/20 mb-4" />
          <Skeleton className="h-16 w-full rounded-lg bg-pink-900/20 mb-4" />

          <div className="flex flex-wrap gap-4 mb-6">
            <Skeleton className="h-12 w-36 rounded-lg bg-pink-900/20" />
            <Skeleton className="h-12 w-36 rounded-lg bg-pink-900/20" />
          </div>

          <div className="flex gap-4 mb-3">
            <Skeleton className="h-12 flex-1 rounded-lg bg-pink-900/20" />
            <Skeleton className="h-12 flex-1 rounded-lg bg-pink-900/20" />
          </div>

          <div className="text-center">
            <Skeleton className="h-4 w-40 bg-pink-900/20 mx-auto mb-1" />
            <Skeleton className="h-4 w-32 bg-pink-900/20 mx-auto" />
          </div>
        </div>

        {/* Previous post navigation */}
        <div className="border-t border-pink-900/30 pt-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded bg-pink-900/20 flex-shrink-0" />
            <div>
              <Skeleton className="h-3 w-24 bg-pink-900/20 mb-1" />
              <Skeleton className="h-5 w-40 bg-pink-900/20" />
            </div>
          </div>
        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-full md:w-80 shrink-0">
        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-7 w-32 bg-pink-900/20" />
            <Skeleton className="h-4 w-16 bg-pink-900/20" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded bg-pink-900/20" />
            ))}
          </div>
        </div>

        {/* Most popular */}
        <div>
          <Skeleton className="h-7 w-40 bg-pink-900/20 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="w-24 h-24 rounded bg-pink-900/20 flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-full bg-pink-900/20 mb-2" />
                  <Skeleton className="h-3 w-24 bg-pink-900/20 mb-2" />
                  <Skeleton className="h-1 w-full bg-pink-900/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
