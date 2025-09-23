"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Star, Check } from "lucide-react"

interface TrendingFiltersProps {
  initialType: string
}

export function TrendingFilters({ initialType }: TrendingFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const [contentType, setContentType] = useState(initialType)

  const updateFilters = (newType: string) => {
    setContentType(newType)

    startTransition(() => {
      const searchParams = new URLSearchParams()
      if (newType !== "all") searchParams.set("type", newType)

      const query = searchParams.toString()
      const url = query ? `${pathname}?${query}` : pathname

      router.push(url)
    })
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-card border border-border transform -skew-x-3 p-1 w-full max-w-lg mx-auto">
          <Button
            variant="ghost"
            size="sm"
            className={`transform skew-x-3 text-sm flex items-center justify-center gap-2 flex-1 px-8 py-3 transition-all duration-200 ${
              contentType === "all"
                ? "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:transform hover:skew-x-3 shadow-lg shadow-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:backdrop-blur-sm hover:transform hover:skew-x-3"
            }`}
            onClick={() => updateFilters("all")}
            disabled={isPending}
          >
            All
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`transform skew-x-3 text-sm flex items-center justify-center gap-2 flex-1 px-8 py-3 transition-all duration-200 ${
              contentType === "premium"
                ? "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:transform hover:skew-x-3 shadow-lg shadow-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:backdrop-blur-sm hover:transform hover:skew-x-3"
            }`}
            onClick={() => updateFilters("premium")}
            disabled={isPending}
          >
            <span className={`text-sm ${contentType === "premium" ? "text-yellow-400/80 drop-shadow-lg" : "text-yellow-500"}`}>★</span>
            Premium
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`transform skew-x-3 text-sm flex items-center justify-center gap-2 flex-1 px-8 py-3 transition-all duration-200 ${
              contentType === "free"
                ? "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:transform hover:skew-x-3 shadow-lg shadow-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:backdrop-blur-sm hover:transform hover:skew-x-3"
            }`}
            onClick={() => updateFilters("free")}
            disabled={isPending}
          >
            Free
          </Button>
        </div>

        {isPending && (
          <div className="text-xs text-pink-400 animate-pulse flex items-center">
            <svg
              className="animate-spin h-3 w-3 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Updating...
          </div>
        )}
      </div>
    </div>
  )
}
