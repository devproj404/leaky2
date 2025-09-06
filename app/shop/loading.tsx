import { Skeleton } from "@/components/ui/skeleton"

export default function ShopLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Skeleton className="h-9 w-64 bg-pink-900/20 mx-auto mb-2" />
          <Skeleton className="h-5 w-full max-w-md bg-pink-900/20 mx-auto" />
        </div>

        <Skeleton className="h-24 w-full bg-pink-900/20 rounded-lg mb-8" />

        <Skeleton className="h-5 w-40 bg-pink-900/20 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-black border border-pink-900/30 rounded-lg overflow-hidden">
              <Skeleton className="h-48 w-full bg-pink-900/20" />
              <div className="p-4">
                <Skeleton className="h-6 w-3/4 bg-pink-900/20 mb-2" />
                <Skeleton className="h-4 w-full bg-pink-900/20 mb-3" />
                <Skeleton className="h-4 w-24 bg-pink-900/20 mb-3" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-16 bg-pink-900/20" />
                  <Skeleton className="h-8 w-20 bg-pink-900/20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
