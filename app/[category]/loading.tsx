import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex text-sm text-gray-400 mb-4">
          <Skeleton className="h-4 w-16 bg-pink-900/20" />
          <span className="mx-2">/</span>
          <Skeleton className="h-4 w-24 bg-pink-900/20" />
        </div>

        <Skeleton className="h-9 w-48 bg-pink-900/20 mb-2" />
        <Skeleton className="h-5 w-full max-w-md bg-pink-900/20" />
      </div>

      {/* Filter skeleton */}
      <Skeleton className="h-10 w-full max-w-md bg-pink-900/20 rounded-full mb-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg border border-pink-900/20 bg-gradient-to-b from-black to-black/95"
          >
            <Skeleton className="aspect-[3/4] w-full bg-pink-900/20" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 bg-pink-900/20 mb-2" />
              <Skeleton className="h-4 w-1/2 bg-pink-900/20 mb-3" />
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 rounded bg-pink-900/20" />
                <Skeleton className="h-8 flex-1 rounded bg-pink-900/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
