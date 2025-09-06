"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

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
  const [imgSrc, setImgSrc] = useState(src || "/placeholder.svg")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [useProxy, setUseProxy] = useState(false)

  useEffect(() => {
    // Reset states when src changes
    setImgSrc(src || "/placeholder.svg")
    setIsLoading(true)
    setError(false)
    setUseProxy(false)

    // Check if src is defined before using includes
    if (src) {
      // Check if the image is from a domain that might need proxying
      const needsProxy = src.includes("pixhost.to") || src.includes("imghost") || src.includes("imagetwist")
      if (needsProxy) {
        setImgSrc(`/api/image-proxy?url=${encodeURIComponent(src)}`)
      }
    } else {
      // If src is undefined, set error state
      setError(true)
      setIsLoading(false)
    }
  }, [src])

  // Function to handle image load error
  const handleError = () => {
    if (src && !useProxy && (src.includes("pixhost.to") || src.includes("imghost") || src.includes("imagetwist"))) {
      // Try using the proxy if direct loading failed
      setUseProxy(true)
      setImgSrc(`/api/image-proxy?url=${encodeURIComponent(src)}`)
    } else {
      setError(true)
      setIsLoading(false)
      // Use a placeholder image when the original fails to load
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
        unoptimized={useProxy} // Skip Next.js optimization for proxied images
      />
    </div>
  )
}
