import { Suspense } from "react"
import ContentBrowser from "@/components/content-browser"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Browse All Content",
  description: "Browse all content including premium items",
}

export default function BrowsePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Content Browser</h1>
      <p className="text-muted-foreground mb-8">Browse all available content including premium items</p>

      <Suspense fallback={<ContentBrowserSkeleton />}>
        <ContentBrowser />
      </Suspense>
    </div>
  )
}

function ContentBrowserSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="rounded-lg border overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
    </div>
  )
}
