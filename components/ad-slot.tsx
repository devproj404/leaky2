"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalImage } from "./external-image"
import { getActiveAdsByPlacement } from "@/lib/ad-service"
import type { AdSlot } from "@/lib/ad-service"

interface AdSlotProps {
  placement: 'homepage-top' | 'homepage-bottom' | 'content-top' | 'content-bottom'
  className?: string
}

export function AdSlotComponent({ placement, className = "" }: AdSlotProps) {
  const [ads, setAds] = useState<AdSlot[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const activeAds = await getActiveAdsByPlacement(placement)
        setAds(activeAds)
      } catch (error) {
        console.error("Error fetching ads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAds()
  }, [placement])

  if (loading || ads.length === 0) {
    return null
  }

  // Show only the first ad (highest priority)
  const ad = ads[0]

  return (
    <div className={`ad-slot ${className}`}>
      <Link
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group max-w-md mx-auto"
      >
        <div className="relative overflow-hidden rounded-lg border border-pink-900/30 hover:border-pink-500/50 transition-all duration-300 shadow-lg hover:shadow-pink-900/20">
          <div className="relative aspect-[700/180]"> {/* Original banner ratio - similar to signature/banner */}
            {ad.image_url ? (
              <>
                <ExternalImage
                  src={ad.image_url}
                  alt={ad.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                
                {/* Optional ad label */}
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 text-xs bg-black/60 text-white rounded">
                    Ad
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-pink-900/20 to-purple-900/20 flex items-center justify-center">
                <span className="text-gray-400 text-sm">{ad.name}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}