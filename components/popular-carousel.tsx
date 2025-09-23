"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ExternalImage } from "./external-image"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"

interface PopularItem {
  id: string
  title: string
  slug: string
  image_url: string
  views: number
  category?: {
    name: string
    slug: string
  }
}

interface PopularCarouselProps {
  items: PopularItem[]
  autoplayDelay?: number
}

export function PopularCarousel({ items, autoplayDelay = 6000 }: PopularCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const totalItems = items.length

  // Reset to first item if items change
  useEffect(() => {
    setCurrentIndex(0)
    setProgress(0)
  }, [items])

  // Auto-advance functionality
  useEffect(() => {
    if (!isPlaying || totalItems <= 1) return

    // Clear existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)

    // Reset progress when starting new cycle
    setProgress(0)

    // Simple interval for advancing slides
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % totalItems)
      setProgress(0)
    }, autoplayDelay)

    // Progress bar update (60fps for smooth animation)
    const progressUpdateRate = 16 // ~60fps
    const progressIncrement = (progressUpdateRate / autoplayDelay) * 100

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + progressIncrement
        return newProgress >= 100 ? 100 : newProgress
      })
    }, progressUpdateRate)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [isPlaying, currentIndex, totalItems, autoplayDelay])

  // Navigation functions
  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalItems)
    setProgress(0)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalItems) % totalItems)
    setProgress(0)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setProgress(0)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (isPlaying) {
      setProgress(0)
    }
  }

  // Handle empty items
  if (!items || items.length === 0) {
    return (
      <div className="bg-black/30 border border-pink-900/30 rounded-lg p-8 text-center">
        <p className="text-gray-400">No popular content available</p>
      </div>
    )
  }

  const currentItem = items[currentIndex]

  return (
    <div className="relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-500 ease-out hover:border-primary/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]">
      {/* Main Content */}
      <Link href={`/${currentItem.category?.slug}/${currentItem.slug}`} className="block group">
        <div className="relative aspect-[3/4] w-full overflow-hidden">
          <ExternalImage
            src={currentItem.image_url || "/placeholder.svg"}
            alt={currentItem.title}
            fill
            className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-60"></div>
          
          {/* Category badge */}
          <div className="absolute top-2 right-2">
            <span className="px-2 py-1 text-xs font-medium bg-pink-600 text-white rounded backdrop-blur-sm">
              {currentItem.category?.name}
            </span>
          </div>
          

          {/* Navigation controls */}
          {totalItems > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  goToPrevious()
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out"
                aria-label="Previous item"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault()
                  goToNext()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out"
                aria-label="Next item"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Play/Pause button */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  togglePlayPause()
                }}
                className="absolute top-2 left-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out"
                aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </Link>

      {/* Content info */}
      <div className="p-3">
        <Link href={`/${currentItem.category?.slug}/${currentItem.slug}`}>
          <h4 className="font-medium text-card-foreground hover:text-primary transition-colors duration-300 ease-out line-clamp-1 mb-1">
            {currentItem.title}
          </h4>
        </Link>
        
        {/* Views count */}
        <div className="text-xs text-muted-foreground mb-2">
          {currentItem.views.toLocaleString()} views
        </div>
        
        {/* Progress bar */}
        {totalItems > 1 && (
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-150 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>


    </div>
  )
}