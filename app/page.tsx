"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { FeaturedBanner } from "@/components/featured-banner"
import { WeeklyDrop } from "@/components/weekly-drop"
import { ContentTabs } from "@/components/content-tabs"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { DebugInfo } from "@/components/debug-info"
import { AdSlotComponent } from "@/components/ad-slot"
import { getSupabaseClient } from "@/lib/supabase"

// Featured banners data - keeping this as UI configuration
const featuredBanners = [
  {
    title: "OUR TELEGRAM",
    subtitle: "@X",
    color: "blue" as const,
    ctaText: "JOIN NOW",
  },
  // Community Forum banner removed from here
]

// Fallback weekly drop data
const fallbackWeeklyDrop = {
  thumbnailUrl: "/snapchat-collection-banner.png",
  link: "/snapchat-collection",
}

export default function Home() {
  const searchParams = useSearchParams()
  const authRequired = searchParams.get("authRequired")
  const authError = searchParams.get("authError")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [weeklyDrop, setWeeklyDrop] = useState<any>(null)
  const { isLoading } = useAuth()
  const [showDebug] = useState(true) // Set to true to always show debug tool

  useEffect(() => {
    if (authRequired === "true") {
      setShowAuthModal(true)
    }

    // Show auth modal with error if there was an auth error
    if (authError) {
      setShowAuthModal(true)
      console.error("Authentication error:", authError)
    }
  }, [authRequired, authError])

  // Fetch weekly drop from database
  useEffect(() => {
    const fetchWeeklyDrop = async () => {
      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from("weekly_drops")
          .select("*")
          .eq("is_active", true)
          .limit(1)
          .single()
        
        if (data && !error) {
          setWeeklyDrop(data)
        }
      } catch (error) {
        console.error("Error fetching weekly drop:", error)
        // Will use fallback data
      }
    }

    fetchWeeklyDrop()
  }, [])

  return (
    <>
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Top Ad Slot */}
        <AdSlotComponent placement="homepage-top" className="mb-6" />
        
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Main Content Area - Takes up most of the space */}
          <div className="flex-1">
            {/* Categories Section - Added above ContentTabs */}

            {/* Content Tabs - Load immediately without waiting for auth */}
            <section aria-labelledby="content-section">
              <h2 id="content-section" className="text-xl font-bold mb-6">
                Browse Content
              </h2>
              <ContentTabs />
              {/* Removed "Load More" button since we now have pagination */}
            </section>
          </div>

          {/* Sidebar - Contains featured banners and weekly drops */}
          <div className="lg:w-80 space-y-4 lg:space-y-6 order-first lg:order-last">
            {/* Featured Banners */}
            <section aria-labelledby="featured-section">
              <h2 id="featured-section" className="sr-only">
                Featured Content
              </h2>
              <div className="space-y-4">
                {featuredBanners.map((banner, index) => (
                  <FeaturedBanner
                    key={`banner-${index}`}
                    title={banner.title}
                    subtitle={banner.subtitle}
                    color={banner.color}
                    ctaText={banner.ctaText}
                  />
                ))}
              </div>
            </section>

            {/* Weekly Drop - Now with the new style */}
            <section aria-labelledby="weekly-drops-section">
              <h2 id="weekly-drops-section" className="text-lg lg:text-xl font-bold mb-3 lg:mb-4">
                Weekly drop
              </h2>
              <WeeklyDrop
                thumbnailUrl={weeklyDrop?.thumbnail_url || fallbackWeeklyDrop.thumbnailUrl}
                link={weeklyDrop?.link || fallbackWeeklyDrop.link}
              />
            </section>
          </div>
        </div>
        
        {/* Bottom Ad Slot */}
        <AdSlotComponent placement="homepage-bottom" className="mt-20" />
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {showDebug && <DebugInfo />}
    </>
  )
}
