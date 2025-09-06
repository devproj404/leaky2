"use client"

import type React from "react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Download } from "lucide-react"
import { PremiumAccessModal } from "./premium-access-modal"
import { ExternalImage } from "./external-image"
import { useAuth } from "@/lib/auth-context"
import { incrementDownloads } from "@/lib/actions"

interface ContentCardProps {
  category: string
  title: string
  fileSize: string
  views: number
  imageUrl: string
  priority?: boolean
  isPremium?: boolean
  slug?: string
  categorySlug?: string
  id?: number
  platform?: string
}

export function ContentCard({
  category,
  title,
  fileSize,
  views,
  imageUrl,
  priority = false,
  isPremium = false,
  slug,
  categorySlug,
  id,
  platform,
}: ContentCardProps) {
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { isPremium: userHasPremium, isAdmin } = useAuth() // Get premium status and admin status from auth context
  const pathname = usePathname() // Get current route

  // Generate a slug from the title if one isn't provided
  const contentSlug =
    slug ||
    title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")

  // Generate the category path
  const categoryPath =
    categorySlug ||
    category
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")

  // Build the content URL
  const contentUrl = `/${categoryPath}/${contentSlug}`

  // Check if this is the teen packs category - check multiple variations
  const normalizedCategory = category
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
  const isTeenPacks =
    normalizedCategory === "teen-packs" ||
    categoryPath === "teen-packs" ||
    categorySlug === "teen-packs" ||
    category.toLowerCase().includes("teen") ||
    (categorySlug && categorySlug.toLowerCase().includes("teen"))

  // Check if we're on the teen packs category page
  const isTeenPacksPage = pathname === "/teen-packs" || pathname?.startsWith("/teen-packs/")

  // Only use the special style when both conditions are met: teen packs content AND on teen packs page
  const useSpecialStyle = isTeenPacks && isTeenPacksPage

  // Determine platform badge color
  const getPlatformBadgeColor = (platform?: string) => {
    if (!platform) return "bg-pink-600"

    const platformLower = platform.toLowerCase()
    if (platformLower.includes("snap")) return "bg-pink-500"
    if (platformLower.includes("onlyfans")) return "bg-pink-600"
    if (platformLower.includes("teen")) return "bg-fuchsia-600"
    if (platformLower.includes("leak")) return "bg-fuchsia-500"
    return "bg-pink-600"
  }

  // Determine platform name to display
  const getPlatformName = () => {
    if (platform) return platform
    if (title.toLowerCase().includes("snapchat") || title.toLowerCase().includes("snap")) return "SnapWins"
    if (title.toLowerCase().includes("onlyfans")) return "OnlyFans"
    if (title.toLowerCase().includes("teen")) return "NudeLeakTeens"
    return category
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Only show premium modal if content is premium AND user doesn't have premium AND user is not admin
    if (isPremium && !userHasPremium && !isAdmin) {
      e.preventDefault()
      setIsPremiumModalOpen(true)
    }
  }

  const handleDownload = async (e: React.MouseEvent) => {
    if (isDownloading || !id) return

    // If premium content and user doesn't have premium and user is not admin, show modal instead
    if (isPremium && !userHasPremium && !isAdmin) {
      e.preventDefault()
      setIsPremiumModalOpen(true)
      return
    }

    e.preventDefault()
    setIsDownloading(true)

    try {
      // Track the download
      await incrementDownloads(id)
      console.log(`Tracked download for content ID: ${id}`)

      // After tracking, navigate to the content page
      window.location.href = contentUrl
    } catch (error) {
      console.error("Error tracking download:", error)
      // Still navigate to content page even if tracking fails
      window.location.href = contentUrl
    }
  }

  // If it's a teen packs card AND we're on the teen packs page, use the weekly drop style
  if (useSpecialStyle) {
    return (
      <>
        <div className="relative group rounded-xl overflow-hidden border border-pink-900/30 hover:border-pink-500/50 transition-all duration-300">
          {/* Background image with overlay */}
          <div className="relative aspect-[16/9]">
            <ExternalImage
              src={imageUrl || "/placeholder.svg?height=400&width=300&query=content"}
              alt={title}
              fill
              priority={priority}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Platform badge - positioned top left */}
            <div className="absolute top-3 left-3 z-20">
              <span
                className={`px-3 py-1 text-xs font-medium ${getPlatformBadgeColor(platform)} text-white rounded-md shadow-md`}
              >
                {getPlatformName()}
              </span>
            </div>

            {/* Premium badge - positioned top right */}
            {isPremium && (
              <div className="absolute top-3 right-3 z-20">
                <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-md shadow-md">
                  PREMIUM
                </span>
              </div>
            )}

            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-between p-4 text-center pt-12">
              {/* Title */}
              <div className="text-2xl md:text-3xl font-bold text-white">{title}</div>

              {/* Subtitle with arrows */}
              <div className="text-indigo-300 font-medium">» {category} «</div>

              {/* Stats bar */}
              <div className="bg-indigo-500 text-white px-4 py-1 rounded-md font-medium text-sm md:text-base w-auto">
                {title} | {views.toLocaleString()} views
              </div>
            </div>
          </div>

          {/* Download button */}
          <div className="bg-black p-3">
            <Link
              href={contentUrl}
              onClick={handleDownload}
              className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white py-2 px-4 rounded text-sm transition-colors duration-300 shadow-[0_0_10px_rgba(236,72,153,0.3)] ${isDownloading ? "opacity-75 cursor-wait" : ""}`}
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? "Processing..." : "Download Now"}</span>
            </Link>
          </div>
        </div>

        <PremiumAccessModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} title={title} />
      </>
    )
  }

  // Regular card style for other categories or teen packs on main page
  return (
    <>
      <div className="relative group overflow-hidden rounded-lg border border-pink-900/20 bg-gradient-to-b from-black to-black/95">
        <Link href={contentUrl} className="block" onClick={handleCardClick}>
          <div className="relative aspect-[3/4] overflow-hidden">
            <ExternalImage
              src={imageUrl || "/placeholder.svg?height=400&width=300&query=content"}
              alt={title}
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 group-hover:scale-110 opacity-80 group-hover:opacity-100"
            />


            {/* Platform badge - positioned top left */}
            <div className="absolute top-3 left-3 z-20">
              <span
                className={`px-3 py-1 text-xs font-medium ${getPlatformBadgeColor(platform)} text-white rounded-md shadow-md`}
              >
                {getPlatformName()}
              </span>
            </div>

            {/* Premium badge - positioned top right */}
            {isPremium && (
              <div className="absolute top-3 right-3 z-20">
                <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-md shadow-md">
                  PREMIUM
                </span>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
              <h3 className="text-sm sm:text-lg font-bold text-white mb-1 group-hover:text-pink-300 transition-colors line-clamp-2">
                {title}
              </h3>
              <div className="flex items-center text-xs text-gray-400 mb-2 sm:mb-3">
                <span>{views.toLocaleString()} views</span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      <PremiumAccessModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} title={title} />
    </>
  )
}
