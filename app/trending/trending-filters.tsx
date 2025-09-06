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
        <div className="flex bg-black border border-pink-900/30 rounded-full p-1">
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full text-xs flex items-center gap-1.5 ${
              contentType === "all"
                ? "bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:from-pink-700 hover:to-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => updateFilters("all")}
            disabled={isPending}
          >
            <span className="text-xs mr-0.5">All</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full text-xs flex items-center gap-1.5 ${
              contentType === "premium"
                ? "bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:from-pink-700 hover:to-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => updateFilters("premium")}
            disabled={isPending}
          >
            <Star className="h-3 w-3 text-yellow-500" />
            Premium
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full text-xs flex items-center gap-1.5 ${
              contentType === "free"
                ? "bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:from-pink-700 hover:to-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                : "text-gray-400 hover:text-white"
            }`}
            onClick={() => updateFilters("free")}
            disabled={isPending}
          >
            <Check className="h-3 w-3 text-green-500" />
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
