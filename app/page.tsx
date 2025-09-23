"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ContentTabs } from "@/components/content-tabs"
import { AuthModal } from "@/components/auth-modal"
import { useAuth } from "@/lib/auth-context"
import { DebugInfo } from "@/components/debug-info"
import { AdSlotComponent } from "@/components/ad-slot"


export default function Home() {
  const searchParams = useSearchParams()
  const authRequired = searchParams.get("authRequired")
  const authError = searchParams.get("authError")
  const [showAuthModal, setShowAuthModal] = useState(false)
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

  return (
    <>
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Top Ad Slot */}
        <AdSlotComponent placement="homepage-top" className="mb-6" />
        
        {/* Content Tabs - Full width layout */}
        <section aria-labelledby="content-section">
          <ContentTabs showTitle={true} />
        </section>
        
        {/* Bottom Ad Slot */}
        <AdSlotComponent placement="homepage-bottom" className="mt-20" />
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      {showDebug && <DebugInfo />}
    </>
  )
}
