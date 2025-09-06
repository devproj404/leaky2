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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-xl border border-pink-900/30">
            <Skeleton className="aspect-[4/3] w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${category.slug}`}
          className="group relative overflow-hidden rounded-xl border border-pink-900/30 bg-gradient-to-br from-black to-gray-900/80 hover:border-pink-500/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)] hover:scale-[1.02]"
        >
          {/* Category Thumbnail with Title Overlay */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {category.image_url ? (
              <ExternalImage
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-900/20 to-purple-900/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-pink-600/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-pink-400">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors duration-300" />
            
            {/* Title in Thumbnail */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <h3 className="text-lg font-bold text-white text-center drop-shadow-lg group-hover:text-pink-300 transition-colors line-clamp-2">
                {category.name}
              </h3>
            </div>
            
            {/* Arrow Icon */}
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-gray-300 group-hover:text-pink-400 group-hover:bg-pink-600/20 transition-all duration-300">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
