import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// List of allowed image hosting domains for security
const ALLOWED_DOMAINS = [
  'imgur.com',
  'i.imgur.com',
  'postimg.cc',
  'i.postimg.cc',
  'imagebin.ca',
  'i.ibb.co',
  'github.com',
  'raw.githubusercontent.com',
  'unsplash.com',
  'images.unsplash.com',
  'cdn.discordapp.com',
  'media.discordapp.net',
  'i.redd.it',
  'preview.redd.it',
  'external-preview.redd.it',
  'gdrive.com',
  'drive.google.com',
  'lh3.googleusercontent.com',
  'lh4.googleusercontent.com',
  'lh5.googleusercontent.com',
  'lh6.googleusercontent.com',
]

// Cache headers for different content types
const CACHE_HEADERS = {
  'image/jpeg': 'public, max-age=86400, s-maxage=31536000', // 1 day / 1 year
  'image/png': 'public, max-age=86400, s-maxage=31536000',
  'image/gif': 'public, max-age=86400, s-maxage=31536000',
  'image/webp': 'public, max-age=86400, s-maxage=31536000',
  'image/svg+xml': 'public, max-age=3600, s-maxage=86400', // 1 hour / 1 day
}

function isAllowedDomain(url: string): boolean {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    
    return ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // Remove tracking parameters and clean the URL
    const cleanParams = new URLSearchParams()
    urlObj.searchParams.forEach((value, key) => {
      // Keep only essential image parameters
      if (['w', 'h', 'width', 'height', 'format', 'quality', 'fit', 'fm'].includes(key.toLowerCase())) {
        cleanParams.set(key, value)
      }
    })
    
    urlObj.search = cleanParams.toString()
    return urlObj.toString()
  } catch {
    return url
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing url parameter' },
        { status: 400 }
      )
    }
    
    // Validate the domain
    if (!isAllowedDomain(imageUrl)) {
      return NextResponse.json(
        { error: 'Domain not allowed' },
        { status: 403 }
      )
    }
    
    // Sanitize the URL
    const sanitizedUrl = sanitizeUrl(imageUrl)
    
    // Create request headers that mimic a browser
    const headers = new Headers()
    headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    headers.set('Accept', 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8')
    headers.set('Accept-Language', 'en-US,en;q=0.9')
    headers.set('Cache-Control', 'no-cache')
    headers.set('Referer', 'https://www.google.com/')
    
    // Add specific headers for imgur
    if (sanitizedUrl.includes('imgur.com')) {
      headers.set('Authorization', 'Client-ID 546c25a59c58ad7')
    }
    
    console.log(`[Image Proxy] Fetching: ${sanitizedUrl}`)
    
    // Fetch the image with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
    
    const response = await fetch(sanitizedUrl, {
      headers,
      signal: controller.signal,
      redirect: 'follow',
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      console.error(`[Image Proxy] Failed to fetch ${sanitizedUrl}: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      )
    }
    
    // Get content type (but don't validate - some CDNs don't set proper headers)
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    
    // Get the image data
    const imageData = await response.arrayBuffer()
    
    // Create response with proper caching headers
    const proxyResponse = new NextResponse(imageData, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': CACHE_HEADERS[contentType as keyof typeof CACHE_HEADERS] || 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-Image-Proxy': 'true',
        'X-Original-URL': sanitizedUrl,
      },
    })
    
    console.log(`[Image Proxy] Successfully proxied ${sanitizedUrl} (${contentType})`)
    return proxyResponse
    
  } catch (error) {
    console.error('[Image Proxy] Error:', error)
    
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache',
    },
  })
}