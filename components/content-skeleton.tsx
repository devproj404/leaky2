export function ContentSkeleton({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-muted rounded-lg overflow-hidden">
            {/* Image skeleton */}
            <div className="aspect-[3/4] bg-muted-foreground/20"></div>
            
            {/* Content skeleton */}
            <div className="p-3 space-y-2">
              {/* Category badge skeleton */}
              <div className="h-4 bg-muted-foreground/20 rounded w-16"></div>
              
              {/* Title skeleton */}
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
              
              {/* File size skeleton */}
              <div className="h-3 bg-muted-foreground/20 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export function PreviewGallerySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-muted rounded-lg border border-border h-[200px]"></div>
        </div>
      ))}
    </div>
  )
}