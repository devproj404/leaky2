/**
 * Image Proxy Utilities
 * 
 * Provides functions to proxy external images through our domain
 * to bypass ad blockers and improve loading reliability.
 */

// List of image hosting domains that should be proxied
const PROXY_DOMAINS = [
  'imgur.com',
  'i.imgur.com',
  'postimg.cc',
  'i.postimg.cc',
  'imagebin.ca',
  'i.ibb.co',
  'cdn.discordapp.com',
  'media.discordapp.net',
  'i.redd.it',
  'preview.redd.it',
  'external-preview.redd.it',
]

/**
 * Check if a URL should be proxied through our image proxy
 */
export function shouldProxyImage(url: string): boolean {
  if (!url || typeof url !== 'string') return false
  
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    return PROXY_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

/**
 * Generate a proxied image URL through our image proxy API
 */
export function getProxiedImageUrl(originalUrl: string, baseUrl?: string): string {
  if (!originalUrl || typeof originalUrl !== 'string') {
    return originalUrl
  }
  
  // If it doesn't need proxying, return as-is
  if (!shouldProxyImage(originalUrl)) {
    return originalUrl
  }
  
  try {
    const proxyBaseUrl = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
    const encodedUrl = encodeURIComponent(originalUrl)
    
    return `${proxyBaseUrl}/api/proxy/image?url=${encodedUrl}`
  } catch (error) {
    console.warn('[Image Proxy] Error generating proxy URL:', error)
    return originalUrl
  }
}

/**
 * Get the original URL from a proxied URL
 */
export function getOriginalImageUrl(proxiedUrl: string): string {
  try {
    const url = new URL(proxiedUrl)
    if (url.pathname === '/api/proxy/image') {
      return decodeURIComponent(url.searchParams.get('url') || '')
    }
    return proxiedUrl
  } catch {
    return proxiedUrl
  }
}

/**
 * Optimize image URL with parameters (width, height, quality)
 */
export function optimizeImageUrl(url: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: string
}): string {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    // Apply optimizations based on the hosting service
    if (hostname.includes('imgur.com')) {
      // Imgur supports format suffixes
      if (options?.width && options?.height) {
        // Remove existing format suffix and add new one
        const pathWithoutFormat = urlObj.pathname.replace(/\.(jpg|png|gif|webp)$/i, '')
        const format = options.format || 'webp'
        urlObj.pathname = `${pathWithoutFormat}${options.width}x${options.height}.${format}`
      }
    } else if (hostname.includes('unsplash.com')) {
      // Unsplash supports query parameters
      if (options?.width) urlObj.searchParams.set('w', options.width.toString())
      if (options?.height) urlObj.searchParams.set('h', options.height.toString())
      if (options?.quality) urlObj.searchParams.set('q', options.quality.toString())
      if (options?.format) urlObj.searchParams.set('fm', options.format)
    }
    
    return urlObj.toString()
  } catch {
    return url
  }
}

/**
 * Create multiple size variants of an image URL
 */
export function createImageVariants(url: string): {
  original: string
  thumbnail: string
  medium: string
  large: string
} {
  return {
    original: url,
    thumbnail: optimizeImageUrl(url, { width: 150, height: 150, quality: 80 }),
    medium: optimizeImageUrl(url, { width: 400, height: 400, quality: 85 }),
    large: optimizeImageUrl(url, { width: 800, height: 800, quality: 90 }),
  }
}

/**
 * Validate image URL format and accessibility
 */
export async function validateImageUrl(url: string): Promise<{
  valid: boolean
  error?: string
  contentType?: string
  size?: number
}> {
  try {
    const response = await fetch(`/api/proxy/image?url=${encodeURIComponent(url)}`, {
      method: 'HEAD',
    })
    
    if (!response.ok) {
      return {
        valid: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      }
    }
    
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const contentLength = response.headers.get('content-length')
    
    // Accept any content type - some CDNs don't set proper headers
    
    return {
      valid: true,
      contentType,
      size: contentLength ? parseInt(contentLength, 10) : undefined,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}