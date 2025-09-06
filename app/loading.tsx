import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content Area - Takes up most of the space */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-7 w-24 bg-pink-900/20" />
          </div>

          <div className="mb-6">
            <Skeleton className="h-10 w-full max-w-md bg-pink-900/20 rounded-full mb-6" />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="relative aspect-[3/4] rounded-lg border border-pink-900/20 bg-black/50 animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Skeleton className="h-10 w-32 bg-pink-900/20 rounded-full" />
          </div>
        </div>

        {/* Sidebar - Contains featured banners and weekly drops */}
        <div className="lg:w-80 space-y-6">
          {/* Featured Banners */}
          <div className="space-y-4">
            {[...Array(2)].map((_, index) => (
              <Skeleton key={`banner-${index}`} className="h-40 w-full bg-pink-900/20 rounded-lg" />
            ))}
          </div>

          {/* Weekly Drop */}
          <div>
            <Skeleton className="h-7 w-32 bg-pink-900/20 mb-4" />
            <Skeleton className="h-40 w-full bg-pink-900/20 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  )
}
