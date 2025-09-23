import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Skeleton } from "./ui/skeleton"
import { ExternalImage } from "./external-image"

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image_url?: string
  content_count?: number
}

interface CategoriesSectionProps {
  categories: Category[]
  isLoading?: boolean
}

export function CategoriesSection({ categories, isLoading = false }: CategoriesSectionProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {[...Array(18)].map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-lg border border-border">
            <Skeleton className="aspect-square w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${category.slug}`}
          className="block"
        >
          {/* Category Thumbnail */}
          <div className="relative aspect-square overflow-hidden rounded-lg border border-border bg-card mb-2">
            {category.image_url ? (
              <ExternalImage
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-muted to-accent flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Title below card */}
          <h3 className="text-sm font-medium text-foreground text-center line-clamp-2">
            {category.name}
          </h3>
        </Link>
      ))}
    </div>
  )
}
