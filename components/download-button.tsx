"use client"

import { useState } from "react"
import Image from "next/image"
import { incrementDownloads } from "@/lib/actions"
import { PremiumAccessModal } from "./premium-access-modal"
import { getSupabaseClient } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

interface DownloadButtonProps {
  contentId: number
  downloadUrl: string | null
  type: "free" | "premium"
  title?: string
}

export function DownloadButton({ contentId, downloadUrl, type, title = "Content" }: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const { isPremium, isAdmin } = useAuth() // Get premium status and admin status from auth context

  const handleDownload = async () => {
    if (!downloadUrl) return

    // For premium content, check if user has access (admins bypass premium requirements)
    if (type === "premium" && !isPremium && !isAdmin) {
      setShowPremiumModal(true)
      return
    }

    setIsLoading(true)

    try {
      // Ensure contentId is a valid number
      if (!contentId || isNaN(contentId)) {
        console.error("Invalid content ID:", contentId)
        throw new Error("Invalid content ID")
      }

      // Increment the download count
      await incrementDownloads(contentId)

      // Track the download for the current user if logged in
      const supabase = getSupabaseClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        // Insert into user_downloads table
        await supabase.from("user_downloads").insert({
          user_id: session.user.id,
          content_id: contentId,
        })
      }

      // Open the download link in a new tab
      window.open(downloadUrl, "_blank")
    } catch (error) {
      console.error("Failed to track download:", error)
      // Still open the download link even if tracking fails
      window.open(downloadUrl, "_blank")
    } finally {
      setIsLoading(false)
    }
  }

  const isFree = type === "free"

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={!downloadUrl || isLoading}
        className={`flex-1 flex items-center justify-center gap-2 ${
          isFree
            ? "bg-gradient-to-r from-pink-500 to-pink-400 hover:from-pink-600 hover:to-pink-500 shadow-sm hover:shadow-pink-500/20"
            : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-sm hover:shadow-amber-500/20"
        } text-white text-center py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          !downloadUrl ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {isFree ? (
          <div className="w-5 h-5 relative">
            <Image src="/mega-logo-red.png" alt="Mega" width={20} height={20} className="object-contain" />
          </div>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-amber-400"
          >
            <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"></path>
          </svg>
        )}
        {isLoading ? "Processing..." : isFree ? "Free Download" : "Premium Download"}
      </button>

      {/* Premium Access Modal */}
      <PremiumAccessModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} title={title} />
    </>
  )
}
