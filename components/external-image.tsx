"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getProxiedImageUrl, shouldProxyImage } from "@/lib/image-proxy"

interface ExternalImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  priority?: boolean
}

export function ExternalImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  priority = false,
}: ExternalImageProps) {
  const [imgSrc, setImgSrc] = useState(() => {
    if (!src) return "/placeholder.svg"
    return shouldProxyImage(src) ? getProxiedImageUrl(src) : src
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isProxied, setIsProxied] = useState(() => shouldProxyImage(src))

  useEffect(() => {
    if (!src) {
      setError(true)
      setIsLoading(false)
      setImgSrc("/placeholder.svg")
      return
    }

    // Reset states when src changes
    setIsLoading(true)
    setError(false)
    setRetryCount(0)
    
    // Determine if we should proxy this image
    const needsProxying = shouldProxyImage(src)
    setIsProxied(needsProxying)
    
    // Set the appropriate image source
    if (needsProxying) {
      setImgSrc(getProxiedImageUrl(src))
      console.log(`[ExternalImage] Using proxy for: ${src}`)
    } else {
      setImgSrc(src)
    }
  }, [src])

  // Function to handle image load error with intelligent retry
  const handleError = () => {
    console.warn(`[ExternalImage] Failed to load image: ${imgSrc}`)
    
    if (!src) {
      setError(true)
      setIsLoading(false)
      return
    }

    // First retry: try direct URL if we were using proxy
    if (isProxied && retryCount === 0) {
      console.log(`[ExternalImage] Retrying with direct URL: ${src}`)
      setRetryCount(1)
      setImgSrc(src)
      setIsProxied(false)
      return
    }
    
    // Second retry: try proxy if we were using direct URL
    if (!isProxied && retryCount === 0 && shouldProxyImage(src)) {
      console.log(`[ExternalImage] Retrying with proxy: ${src}`)
      setRetryCount(1)
      setImgSrc(getProxiedImageUrl(src))
      setIsProxied(true)
      return
    }
    
    // Final fallback: show placeholder
    console.error(`[ExternalImage] All retry attempts failed for: ${src}`)
    setError(true)
    setIsLoading(false)
    setImgSrc("/placeholder.svg")
  }

  return (
    <div className={`relative ${className}`} style={fill ? { width: "100%", height: "100%" } : {}}>
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 animate-pulse flex items-center justify-center">
          <span className="sr-only">Loading...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <p className="text-xs text-gray-400 text-center px-2">Image could not be loaded</p>
        </div>
      )}

      <Image
        src={imgSrc || "/placeholder.svg"}
        alt={alt}
        width={fill ? undefined : width || 500}
        height={fill ? undefined : height || 500}
        fill={fill}
        className={`${isLoading ? "opacity-0" : "opacity-100"} transition-opacity duration-300 ${className}`}
        onLoad={() => setIsLoading(false)}
        onError={handleError}
        priority={priority}
        unoptimized={isProxied} // Skip Next.js optimization for proxied images
      />
    </div>
  )
}
