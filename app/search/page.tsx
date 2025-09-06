import { Suspense } from "react"
import { Search } from "lucide-react"
import { ContentCard } from "@/components/content-card"
import { createServerSupabaseClient } from "@/lib/supabase"
import type { Content } from "@/lib/content-service"

interface SearchPageProps {
  searchParams: { q?: string }
}

async function searchContent(query: string): Promise<Content[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("content")
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error searching content:", error)
    return []
  }

  return data || []
}

async function SearchResults({ query }: { query: string }) {
  const results = await searchContent(query)

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-900/20 mb-4">
          <Search className="w-8 h-8 text-pink-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No results found</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          We couldn't find any content matching "{query}". Try different keywords or browse our categories.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {results.map((content) => (
        <ContentCard
          key={content.id}
          category={content.category?.name || ""}
          title={content.title}
          fileSize={content.file_size}
          views={content.views}
          imageUrl={content.image_url}
          isPremium={content.is_premium}
          slug={content.slug}
          categorySlug={content.category?.slug || ""}
        />
      ))}
    </div>
  )
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{query ? `Search results for "${query}"` : "Search"}</h1>
        <p className="text-gray-400">
          {query ? "Browse the matching content below" : "Enter a search term in the search bar to find content"}
        </p>
      </div>

      {!query ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-900/20 mb-4">
            <Search className="w-8 h-8 text-pink-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Search for content</h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Use the search bar at the top of the page to find content by title, description, or category.
          </p>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div
                  key={index}
                  className="relative aspect-[3/4] rounded-lg border border-pink-900/20 bg-black/50 animate-pulse"
                ></div>
              ))}
            </div>
          }
        >
          <SearchResults query={query} />
        </Suspense>
      )}
    </main>
  )
}
