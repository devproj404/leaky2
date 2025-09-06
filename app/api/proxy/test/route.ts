import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const testUrls = [
    'https://i.imgur.com/sample.jpg',
    'https://postimg.cc/sample.png',
    'https://i.ibb.co/sample.webp',
  ]

  const proxyBaseUrl = request.nextUrl.origin
  
  const testResults = testUrls.map(url => ({
    original: url,
    proxied: `${proxyBaseUrl}/api/proxy/image?url=${encodeURIComponent(url)}`,
  }))

  return NextResponse.json({
    message: 'Image Proxy Test Endpoints',
    proxy_endpoint: `${proxyBaseUrl}/api/proxy/image`,
    test_urls: testResults,
    usage: {
      description: 'To proxy an image, use: /api/proxy/image?url={encoded_image_url}',
      example: `${proxyBaseUrl}/api/proxy/image?url=${encodeURIComponent('https://i.imgur.com/your-image.jpg')}`,
    },
    features: [
      'Bypasses ad-blockers by serving images through your domain',
      'Supports imgur, postimg, imagebin, discord, reddit, and more',
      'Automatic retry with/without proxy',
      'Proper caching headers',
      'Security validation and domain whitelist',
    ],
  })
}