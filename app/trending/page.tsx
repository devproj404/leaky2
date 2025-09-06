import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getPopularContent } from "@/lib/content-service"
import { ContentCard } from "@/components/content-card"
import { TrendingFilters } from "./trending-filters"

export const metadata = {
  title: "Trending Content",
  description: "Discover the most popular and trending content",
}

async function TrendingContent({
  contentType = "all",
}: {
  contentType?: string
}) {
  // Get popular content with a larger limit for the trending page
  const trendingContent = await getPopularContent(1, 24)

  // Filter content based on the selected filters
  const filteredContent = trendingContent.filter((content) => {
    // Filter by content type
    if (contentType === "premium" && !content.is_premium) return false
    if (contentType === "free" && content.is_premium) return false

    return true
  })

  if (filteredContent.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No trending content found for the selected filters.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredContent.map((content) => (
        <ContentCard
          key={content.id}
          id={content.id}
          title={content.title}
          category={content.category?.name || "Uncategorized"}
          categorySlug={content.category?.slug}
          slug={content.slug}
          fileSize={content.file_size || "Unknown"}
          views={content.views || 0}
          imageUrl={content.image_url || ""}
          isPremium={content.is_premium || false}
        />
      ))}
    </div>
  )
}

export default function TrendingPage({
  searchParams,
}: {
  searchParams: { type?: string }
}) {
  const contentType = searchParams.type || "all"

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600">
          Trending Content
        </h1>
        <p className="text-muted-foreground">Discover the most popular and trending content right now</p>
      </div>

      <TrendingFilters initialType={contentType} />

      <Suspense key={contentType} fallback={<TrendingContentSkeleton />}>
        <TrendingContent contentType={contentType} />
      </Suspense>
    </div>
  )
}

function TrendingContentSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array(12)
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
