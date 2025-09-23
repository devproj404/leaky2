"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react"
import { ContentCard } from "./content-card"
import type { Content } from "@/lib/content-service"

type TabData = {
  content: Content[]
  currentPage: number
  totalPages: number
  loaded: boolean
}

export function ContentTabs({ showTitle = false }: { showTitle?: boolean }) {
  const [activeTab, setActiveTab] = useState<"premium" | "free">("premium")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [connectionLost, setConnectionLost] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)

  // Cache content for each tab
  const [tabsData, setTabsData] = useState<Record<string, TabData>>({
    recommended: {
      content: [],
      currentPage: 1,
      totalPages: 1,
      loaded: false,
    },
    recent: {
      content: [],
      currentPage: 1,
      totalPages: 1,
      loaded: false,
    },
    popular: {
      content: [],
      currentPage: 1,
      totalPages: 1,
      loaded: false,
    },
    premium: {
      content: [],
      currentPage: 1,
      totalPages: 1,
      loaded: false,
    },
    free: {
      content: [],
      currentPage: 1,
      totalPages: 1,
      loaded: false,
    },
  })

  const itemsPerPage = 12 // Increased for better performance

  // Track retry attempts
  const retryCountRef = useRef(0)
  const maxRetries = 2 // Reduced to 2 to fail faster

  // Get current tab data
  const currentTabData = tabsData[activeTab]
  const { content, currentPage, totalPages } = currentTabData


  // Function to refresh content manually
  const refreshContent = () => {
    setLoading(true)
    setError(null)
    setConnectionLost(false)
    setOfflineMode(false)
    retryCountRef.current = 0

    // Reset loaded state for current tab
    setTabsData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        loaded: false,
      },
    }))

    // Trigger a fetch
    fetchContent()
  }

  // Function to handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return

    setTabsData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        currentPage: page,
      },
    }))

    window.scrollTo({ top: 0, behavior: "smooth" })

    // Fetch content for the new page
    fetchContent(page)
  }


  // Function to fetch content using cached API
  const fetchContent = async (page = currentPage) => {
    // If we're in offline mode, don't try to fetch
    if (offlineMode) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Determine API endpoint based on tab and sort
      let apiUrl = `/api/content/trending?limit=${itemsPerPage}&page=${page}`
      
      // Use different endpoints based on active tab
      if (activeTab === "premium") {
        apiUrl = `/api/content/premium?limit=${itemsPerPage}&page=${page}&sort=newest`
      } else if (activeTab === "free") {
        apiUrl = `/api/content/free?limit=${itemsPerPage}&page=${page}&sort=newest`
      }

      console.log(`Fetching content from cached API: ${apiUrl}`)

      // Fetch from our cached API instead of direct database
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      if (result.content) {
        const contentItems = result.content
        const hasMorePages = contentItems.length === itemsPerPage

        // Calculate total pages based on current page and whether there are more pages
        let calculatedTotalPages = page
        if (hasMorePages) {
          calculatedTotalPages = page + 1
        }

        // Update the tab data
        setTabsData((prev) => ({
          ...prev,
          [activeTab]: {
            ...prev[activeTab],
            content: contentItems,
            totalPages: Math.max(calculatedTotalPages, prev[activeTab].totalPages || 1),
            loaded: true,
          },
        }))

        setConnectionLost(false)
        setOfflineMode(false)

        // Reset retry counter on success
        retryCountRef.current = 0
      } else {
        throw new Error("No content data in API response")
      }
    } catch (error) {
      console.error("Error fetching content from API:", error)
      setError(`Failed to load content. Please try again.`)
      setConnectionLost(true)

      // Retry logic for API failures
      if (
        retryCountRef.current < maxRetries &&
        error instanceof Error &&
        (error.message.includes("fetch") || error.message.includes("API request failed"))
      ) {
        retryCountRef.current += 1
        setError(`Connection issue. Retrying (${retryCountRef.current}/${maxRetries})...`)

        // Simple retry with delay
        setTimeout(() => fetchContent(page), 2000 * retryCountRef.current)
      } else if (retryCountRef.current >= maxRetries) {
        // After max retries, try to load fallback content
        const fallbackLoaded = await loadFallbackContent()
        if (!fallbackLoaded) {
          // If fallback also fails, switch to complete offline mode
          setOfflineMode(true)
          setError("Unable to load content. Please try again later.")
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Fallback function to load minimal content when main query fails
  const loadFallbackContent = async () => {
    try {
      setError("Loading limited content due to connection issues...")

      // Try to get minimal content from trending API (most likely to be cached)
      const fallbackResponse = await fetch(`/api/content/trending?limit=3`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (fallbackResponse.ok) {
        const fallbackResult = await fallbackResponse.json()
        
        if (fallbackResult.content && fallbackResult.content.length > 0) {
          // Update the tab data with minimal content
          setTabsData((prev) => ({
            ...prev,
            [activeTab]: {
              ...prev[activeTab],
              content: fallbackResult.content,
              totalPages: 1,
              loaded: true,
            },
          }))

          setError("Limited content loaded. Some features may be unavailable.")
          setOfflineMode(true)
          return true
        }
      }

      return false
    } catch (error) {
      console.error("Fallback content loading failed:", error)
      return false
    }
  }

  // Handle tab change
  const handleTabChange = (tab: "premium" | "free") => {
    setActiveTab(tab)

    // If tab data is not loaded yet, fetch it
    if (!tabsData[tab].loaded && !offlineMode) {
      fetchContent(tabsData[tab].currentPage)
    }
  }

  // Initial content load only
  useEffect(() => {
    // Start fetching content only if not already loaded and not in offline mode
    if (!tabsData[activeTab].loaded && !offlineMode) {
      fetchContent()
    }

    // No automatic refresh on visibility change or focus
    // No background polling or periodic refreshes
  }, [activeTab]) // Only dependency is activeTab - content refreshes when tab changes

  return (
    <div className="w-full">
      {offlineMode && (
        <div className="bg-amber-900/20 border border-amber-800 text-amber-200 p-4 rounded-lg mb-6">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 mr-2" />
            <p className="font-medium">Database connection unavailable</p>
          </div>
          <p className="mb-2">The site is currently running in offline mode with limited functionality.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 bg-amber-900/30 border-amber-800 text-amber-200 hover:bg-amber-800/50"
            onClick={refreshContent}
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Try Reconnecting
          </Button>
        </div>
      )}

      <div className="mb-6">
        {/* Browse Content Title */}
        {showTitle && (
          <h2 className="text-xl font-bold text-white mb-4">
            Browse Content
          </h2>
        )}
        
        {/* Content Type Filter - Full Width Compact */}
        <div className="flex justify-center">
          <div className="flex bg-card border border-border transform -skew-x-3 p-1 w-full max-w-lg">
          <Button
            variant="ghost"
            size="sm"
            className={`transform skew-x-3 text-sm flex items-center justify-center gap-2 flex-1 px-8 py-3 transition-all duration-200 ${
              activeTab === "premium"
                ? "bg-gradient-to-r from-white/15 via-white/10 to-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:transform hover:skew-x-3 shadow-lg shadow-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:backdrop-blur-sm hover:transform hover:skew-x-3"
            }`}
            onClick={() => handleTabChange("premium")}
            disabled={loading}
          >
            <span className={`text-sm ${activeTab === "premium" ? "text-yellow-400/80 drop-shadow-lg" : "text-yellow-500"}`}>★</span>
            Premium
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`transform skew-x-3 text-sm flex items-center justify-center gap-2 flex-1 px-8 py-3 transition-all duration-200 ${
              activeTab === "free"
                ? "bg-gradient-to-r from-white/15 via-white/10 to-white/5 backdrop-blur-sm border border-white/20 text-white hover:bg-white/15 hover:transform hover:skew-x-3 shadow-lg shadow-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5 hover:backdrop-blur-sm hover:transform hover:skew-x-3"
            }`}
            onClick={() => handleTabChange("free")}
            disabled={loading}
          >
            Free
          </Button>

          {/* Always show refresh button */}
          <Button
            variant="ghost"
            size="sm"
            className="transform skew-x-3 text-sm flex items-center justify-center gap-2 flex-1 px-8 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 hover:backdrop-blur-sm hover:transform hover:skew-x-3 transition-all duration-200"
            onClick={refreshContent}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          </div>
        </div>
      </div>


      {error && !loading && !offlineMode && (
        <div className="bg-red-900/20 border border-red-800 text-red-200 p-4 rounded-lg mb-6">
          <p className="mb-2">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 bg-red-900/30 border-red-800 text-red-200 hover:bg-red-800/50"
            onClick={refreshContent}
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Retry Connection
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
        {content.map((item, index) => (
          <ContentCard
            key={item.id}
            category={item.category?.name || ""}
            title={item.title}
            fileSize={item.file_size}
            imageUrl={item.image_url}
            isPremium={item.is_premium}
            slug={item.slug}
            categorySlug={item.category?.slug || ""}
            priority={index < 6} // Prioritize loading for first 6 images
          />
        ))}
      </div>

      {loading && (
        <div className="mt-4 flex justify-center">
          <div className="inline-flex items-center px-4 py-2 text-sm text-pink-400">
            <svg
              className="animate-spin -ml-1 mr-3 h-4 w-4 text-pink-400"
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
            Loading content...
          </div>
        </div>
      )}

      {!loading && content.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No content found.</p>
        </div>
      )}

      {/* Bottom pagination for all screens */}
      {totalPages > 1 && !loading && !offlineMode && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center bg-card border border-border rounded-full p-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Previous</span>
            </Button>

            <div className="hidden sm:flex items-center">
              {/* Pagination items */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pageNumber = i + 1
                return (
                  <Button
                    key={`page-${pageNumber}`}
                    variant="ghost"
                    size="sm"
                    className={`w-8 h-8 p-0 transition-all duration-200 ${
                      currentPage === pageNumber 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    onClick={() => handlePageChange(pageNumber)}
                    disabled={loading}
                  >
                    {pageNumber}
                  </Button>
                )
              })}
            </div>

            <div className="sm:hidden flex items-center">
              <span className="text-xs text-muted-foreground px-2">
                {currentPage} / {totalPages}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
              <span className="sr-only">Next</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
