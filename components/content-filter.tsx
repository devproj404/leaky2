"use client"

import { useState } from "react"
import { Clock, Star, Check, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ContentFilterProps {
  onFilterChange: (filters: ContentFilters) => void
  initialFilters?: ContentFilters
}

export interface ContentFilters {
  showPremium: boolean
  showFree: boolean
  sortBy: "recommended" | "recent" | "most-views"
}

export function ContentFilter({ onFilterChange, initialFilters }: ContentFilterProps) {
  const [filters, setFilters] = useState<ContentFilters>(
    initialFilters || {
      showPremium: true,
      showFree: true,
      sortBy: "recommended",
    },
  )

  const handleSortChange = (sortBy: ContentFilters["sortBy"]) => {
    const newFilters = { ...filters, sortBy }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleTypeChange = (type: "premium" | "free") => {
    const key = type === "premium" ? "showPremium" : "showFree"
    const newFilters = { ...filters, [key]: !filters[key] }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleRefresh = () => {
    const defaultFilters = {
      showPremium: true,
      showFree: true,
      sortBy: "recommended",
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6 items-center">
      <h2 className="text-lg font-semibold mr-2">Recommended</h2>

      <div className="flex flex-wrap gap-2">
        {/* Sort options */}
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1.5 ${
            filters.sortBy === "recommended" ? "text-purple-500" : "text-gray-400"
          }`}
          onClick={() => handleSortChange("recommended")}
        >
          <span
            className={`w-2 h-2 rounded-full ${filters.sortBy === "recommended" ? "bg-purple-500" : "bg-transparent"}`}
          ></span>
          Recommended
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1.5 ${filters.sortBy === "recent" ? "text-purple-500" : "text-gray-400"}`}
          onClick={() => handleSortChange("recent")}
        >
          <Clock className="h-4 w-4" />
          Recent
        </Button>

        <Button
          variant={filters.sortBy === "most-views" ? "default" : "ghost"}
          size="sm"
          className={`flex items-center gap-1.5 ${
            filters.sortBy === "most-views" ? "bg-pink-600 text-white" : "text-gray-400"
          }`}
          onClick={() => handleSortChange("most-views")}
        >
          <Star className="h-4 w-4" />
          Most Views
        </Button>

        {/* Content type filters */}
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1.5 ${filters.showPremium ? "text-yellow-500" : "text-gray-400"}`}
          onClick={() => handleTypeChange("premium")}
        >
          <Star className="h-4 w-4" />
          Premium
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1.5 ${filters.showFree ? "text-green-500" : "text-gray-400"}`}
          onClick={() => handleTypeChange("free")}
        >
          <Check className="h-4 w-4" />
          Free
        </Button>

        {/* Refresh button */}
        <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-gray-400" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>
  )
}
