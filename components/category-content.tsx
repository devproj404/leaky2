"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CategoryFilters } from "./category-filters"
import { ContentCard } from "./content-card"
import { ContentSkeleton } from "./content-skeleton"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface CategoryContentProps {
  category: any
  categorySlug: string
  activeFilter: string
  categoryContent: any[]
  isTeenPacks: boolean
  totalPages: number
  currentPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  totalItems: number
}

export function CategoryContent({
  category,
  categorySlug,
  activeFilter,
  categoryContent,
  isTeenPacks,
  totalPages,
  currentPage,
  hasNextPage,
  hasPrevPage,
  totalItems
}: CategoryContentProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleFilterChange = (filterId: string) => {
    startTransition(() => {
      if (filterId === "recent") {
        router.push(`/${categorySlug}`)
      } else {
        router.push(`/${categorySlug}?filter=${filterId}`)
      }
    })
  }

  return (
    <>
      {/* Filter component with loading state */}
      <CategoryFilters 
        activeFilter={activeFilter} 
        categorySlug={categorySlug}
        onFilterChange={handleFilterChange}
        loading={isPending}
      />

      {/* Content grid with skeleton loading */}
      <div
        className={`grid grid-cols-1 ${isTeenPacks ? "sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"} mt-6`}
      >
        {isPending ? (
          <ContentSkeleton count={isTeenPacks ? 9 : 12} />
        ) : categoryContent.length > 0 ? (
          categoryContent.map((content) => (
            <ContentCard
              key={content.id}
              category={category.name}
              title={content.title}
              fileSize={content.file_size}
              imageUrl={content.image_url}
              isPremium={content.is_premium}
              slug={content.slug}
              categorySlug={category.slug}
              id={content.id}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">No content found for the selected filter.</p>
            <Link href={`/${categorySlug}`} className="text-primary hover:text-primary/80 mt-2 inline-block">
              Clear filters
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isPending && totalPages > 1 && (
        <div className="mt-12">
          {/* Mobile pagination info */}
          <div className="text-center text-sm text-muted-foreground mb-4 sm:hidden">
            Page {currentPage} of {totalPages} ({totalItems} total items)
          </div>
          
          <div className="flex items-center justify-between">
            {/* Desktop pagination info */}
            <div className="hidden sm:block text-sm text-muted-foreground">
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
    </>
  )
}