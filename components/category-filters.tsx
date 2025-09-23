"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, Flame, Crown, Unlock, Loader2 } from "lucide-react"

interface CategoryFiltersProps {
  activeFilter: string
  categorySlug: string
  onFilterChange?: (filterId: string) => void
  loading?: boolean
}

export function CategoryFilters({ activeFilter, categorySlug, onFilterChange, loading = false }: CategoryFiltersProps) {
  const router = useRouter()

  const filters = [
    { id: "recent", label: "Recent", icon: Clock },
    { id: "views", label: "Most Views", icon: Flame },
    { id: "premium", label: "Premium", icon: Crown },
    { id: "free", label: "Free", icon: Unlock },
  ]

  const handleFilterChange = (filterId: string) => {
    if (onFilterChange) {
      onFilterChange(filterId)
    } else {
      // Fallback to router navigation if no custom handler
      if (filterId === "recent") {
        router.push(`/${categorySlug}`)
      } else {
        router.push(`/${categorySlug}?filter=${filterId}`)
      }
    }
  }

  return (
    <div className="grid grid-cols-4 bg-card border border-border rounded-full p-1 mb-6 gap-1">
      {filters.map((filter) => {
        const Icon = filter.icon
        return (
          <Button
            key={filter.id}
            variant="ghost"
            size="sm"
            className={`rounded-full text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all duration-200 flex-1 ${
              activeFilter === filter.id
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            onClick={() => handleFilterChange(filter.id)}
            disabled={loading}
          >
            {loading && activeFilter === filter.id ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Icon className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">{filter.label}</span>
            <span className="sm:hidden">{filter.label.split(' ')[0]}</span>
          </Button>
        )
      })}
    </div>
  )
}
