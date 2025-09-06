"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, Flame, Crown, Unlock } from "lucide-react"

interface CategoryFiltersProps {
  activeFilter: string
  categorySlug: string
}

export function CategoryFilters({ activeFilter, categorySlug }: CategoryFiltersProps) {
  const router = useRouter()

  const filters = [
    { id: "recent", label: "Recent", icon: Clock },
    { id: "views", label: "Most Views", icon: Flame },
    { id: "premium", label: "Premium", icon: Crown },
    { id: "free", label: "Free", icon: Unlock },
  ]

  const handleFilterChange = (filterId: string) => {
    // If it's the default filter, remove the query param
    if (filterId === "recent") {
      router.push(`/${categorySlug}`)
    } else {
      router.push(`/${categorySlug}?filter=${filterId}`)
    }
  }

  return (
    <div className="flex bg-black border border-pink-900/30 rounded-full p-1 mb-6 overflow-x-auto">
      {filters.map((filter) => {
        const Icon = filter.icon
        return (
          <Button
            key={filter.id}
            variant="ghost"
            size="sm"
            className={`rounded-full text-xs flex items-center gap-1.5 whitespace-nowrap ${
              activeFilter === filter.id
                ? "bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:from-pink-700 hover:to-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => handleFilterChange(filter.id)}
          >
            <Icon className="w-3 h-3" />
            {filter.label}
          </Button>
        )
      })}
    </div>
  )
}
