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
    if (!src || (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('/') && !src.startsWith('data:'))) {
      return "/placeholder.svg"
    }
    return shouldProxyImage(src) ? getProxiedImageUrl(src) : src
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isProxied, setIsProxied] = useState(() => shouldProxyImage(src))

  useEffect(() => {
    if (!src || (!src.startsWith('http://') && !src.startsWith('https://') && !src.startsWith('/') && !src.startsWith('data:'))) {
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
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ExternalImage] Using proxy for: ${src}`)
      }
    } else {
      setImgSrc(src)
    }
  }, [src])

  // Function to handle image load error with intelligent retry
  const handleError = () => {
    try {
      // Suppress excessive logging for common failures
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[ExternalImage] Failed to load image: ${imgSrc}`)
      }
      
      if (!src) {
        setError(true)
        setIsLoading(false)
        return
      }

      // Limit retry attempts to prevent infinite loops
      if (retryCount >= 2) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[ExternalImage] Max retries exceeded for: ${src}`)
        }
        setError(true)
        setIsLoading(false)
        setImgSrc("/placeholder.svg")
        return
      }

      // First retry: try direct URL if we were using proxy
      if (isProxied && retryCount === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ExternalImage] Retrying with direct URL: ${src}`)
        }
        setRetryCount(1)
        setImgSrc(src)
        setIsProxied(false)
        return
      }
      
      // Second retry: try proxy if we were using direct URL
      if (!isProxied && retryCount <= 1 && shouldProxyImage(src)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ExternalImage] Retrying with proxy: ${src}`)
        }
        setRetryCount(prev => prev + 1)
        setImgSrc(getProxiedImageUrl(src))
        setIsProxied(true)
        return
      }
      
      // Final fallback: show placeholder
      setError(true)
      setIsLoading(false)
      setImgSrc("/placeholder.svg")
    } catch (handleErrorException) {
      // Ultimate fallback for any errors in error handling
      console.warn('[ExternalImage] Error in handleError:', handleErrorException)
      setError(true)
      setIsLoading(false)
      setImgSrc("/placeholder.svg")
    }
  }

  return (
    <div className={`relative ${className}`} style={fill ? { width: "100%", height: "100%" } : {}}>
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 animate-pulse flex items-center justify-center">
          <span className="sr-only">Loading...</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-gray-800/60 border border-gray-700 rounded flex flex-col items-center justify-center">
          <svg className="w-6 h-6 text-gray-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-xs text-gray-400 text-center px-2">Failed to load</p>
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
