import { notFound } from "next/navigation"
import Link from "next/link"
import { ContentCard } from "@/components/content-card"
import { CategoryFilters } from "@/components/category-filters"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Define static routes that should never be handled by this dynamic route
const STATIC_ROUTES = ["shop", "premium", "settings", "orders", "search", "admin", "favicon.ico"]

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ filter?: string; page?: string }>
}) {
  // Await params before using its properties
  const resolvedParams = await params
  
  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams
  
  // Normalize the category
  const categorySlug = resolvedParams.category.toLowerCase()

  // Immediately return notFound for static routes to prevent handling them
  if (STATIC_ROUTES.includes(categorySlug)) {
    console.log(`Static route "/${categorySlug}" detected in [category] route, showing 404`)
    return notFound()
  }

  try {
    // Get the active filter and page from search params
    const activeFilter = resolvedSearchParams.filter || "recent"
    const currentPage = parseInt(resolvedSearchParams.page || "1", 10)
    const pageSize = 20

    // Fetch category data and content from cached API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const apiUrl = `${baseUrl}/api/categories/${categorySlug}?filter=${activeFilter}&page=${currentPage}&limit=${pageSize}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      // Enable caching for build time
      next: { revalidate: 300 } // 5 minutes
    })

    if (!response.ok) {
      console.log(`Category API failed for slug: ${categorySlug} (${response.status})`)
      return notFound()
    }

    const data = await response.json()
    
    if (data.error || !data.category) {
      console.log(`Category not found for slug: ${categorySlug}`)
      return notFound()
    }

    const category = data.category
    const categoryContent = data.content
    const totalItems = data.total_items
    const totalPages = Math.ceil(totalItems / pageSize)
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1

    // Check if this is the teen packs category
    const isTeenPacks =
      categorySlug === "teen-packs" ||
      category.name.toLowerCase().includes("teen") ||
      category.slug.toLowerCase().includes("teen")

    return (
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <nav className="flex text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-pink-400 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-pink-400 capitalize">{category.name}</span>
          </nav>

          <h1 className="text-3xl font-bold text-white mb-2 capitalize">{category.name}</h1>
          <p className="text-gray-400">
            {category.description || `Browse the latest content in the ${category.name.toLowerCase()} category.`}
          </p>
        </div>

        {/* Add the filter component */}
        <CategoryFilters activeFilter={activeFilter} categorySlug={categorySlug} />

        {/* Use different grid layout for teen packs */}
        <div
          className={`grid grid-cols-1 ${isTeenPacks ? "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"} mt-6`}
        >
          {categoryContent.length > 0 ? (
            categoryContent.map((content) => (
              <ContentCard
                key={content.id}
                category={category.name}
                title={content.title}
                fileSize={content.file_size}
                views={content.views}
                imageUrl={content.image_url}
                isPremium={content.is_premium}
                slug={content.slug}
                categorySlug={category.slug}
                id={content.id}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 text-lg">No content found for the selected filter.</p>
              <Link href={`/${categorySlug}`} className="text-pink-400 hover:text-pink-300 mt-2 inline-block">
                Clear filters
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            {/* Mobile pagination info */}
            <div className="text-center text-sm text-gray-400 mb-4 sm:hidden">
              Page {currentPage} of {totalPages} ({totalItems} total items)
            </div>
            
            <div className="flex items-center justify-between">
              {/* Desktop pagination info */}
              <div className="hidden sm:block text-sm text-gray-400">
                Page {currentPage} of {totalPages} ({totalItems} total items)
              </div>
              
              {/* Mobile: Only show prev/next */}
              <div className="flex items-center gap-2 sm:hidden mx-auto">
                {hasPrevPage ? (
                  <Link
                    href={`/${categorySlug}?${new URLSearchParams({
                      ...(activeFilter !== 'recent' && { filter: activeFilter }),
                      page: (currentPage - 1).toString(),
                    }).toString()}`}
                  >
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                )}

                {hasNextPage ? (
                  <Link
                    href={`/${categorySlug}?${new URLSearchParams({
                      ...(activeFilter !== 'recent' && { filter: activeFilter }),
                      page: (currentPage + 1).toString(),
                    }).toString()}`}
                  >
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              {/* Desktop: Full pagination */}
              <div className="hidden sm:flex items-center gap-2">
                {hasPrevPage ? (
                  <Link
                    href={`/${categorySlug}?${new URLSearchParams({
                      ...(activeFilter !== 'recent' && { filter: activeFilter }),
                      page: (currentPage - 1).toString(),
                    }).toString()}`}
                  >
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                )}

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const maxVisible = 5
                    const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
                    const endPage = Math.min(totalPages, startPage + maxVisible - 1)
                    const adjustedStartPage = Math.max(1, endPage - maxVisible + 1)
                    
                    return Array.from({ length: endPage - adjustedStartPage + 1 }, (_, i) => {
                      const pageNumber = adjustedStartPage + i
                      
                      return (
                        <Link
                          key={pageNumber}
                          href={`/${categorySlug}?${new URLSearchParams({
                            ...(activeFilter !== 'recent' && { filter: activeFilter }),
                            ...(pageNumber !== 1 && { page: pageNumber.toString() }),
                          }).toString()}`}
                        >
                          <Button
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm"
                            className="w-10 h-10 p-0"
                          >
                            {pageNumber}
                          </Button>
                        </Link>
                      )
                    })
                  })()}
                </div>

                {hasNextPage ? (
                  <Link
                    href={`/${categorySlug}?${new URLSearchParams({
                      ...(activeFilter !== 'recent' && { filter: activeFilter }),
                      page: (currentPage + 1).toString(),
                    }).toString()}`}
                  >
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="flex items-center gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    )
  } catch (error) {
    console.error(`Error in CategoryPage for ${categorySlug}:`, error)
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-white mb-4">Something went wrong</h1>
          <p className="text-gray-400 mb-6">We couldn't load this category. Please try again later.</p>
          <Link href="/" className="text-pink-400 hover:text-pink-300">
            Return to Home
          </Link>
        </div>
      </main>
    )
  }
}
