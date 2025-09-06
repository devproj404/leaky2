import { CategoriesSection } from "@/components/categories-section"
import { Skeleton } from "@/components/ui/skeleton"

export default function CategoriesLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-128 mx-auto" />
        </div>


        {/* Categories Grid Skeleton */}
        <CategoriesSection categories={[]} isLoading={true} />
      </div>
    </div>
  )
}
