import { NextResponse } from 'next/server'
import { getCacheStats, testRedisConnection } from '@/lib/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await getCacheStats()
    
    return NextResponse.json({
      status: 'ok',
      redis: {
        connected: stats.connected,
        info: stats.info || null,
      },
      upstash: {
        enabled: !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN),
        url_configured: !!process.env.UPSTASH_REDIS_REST_URL,
        token_configured: !!process.env.UPSTASH_REDIS_REST_TOKEN,
      },
      environment: {
        node_env: process.env.NODE_ENV,
        redis_url_set: !!process.env.REDIS_URL,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cache status check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      redis: {
        connected: false,
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

// Test cache functionality
export async function POST() {
  try {
    console.log('Testing Redis connection...')
    const connected = await testRedisConnection()
    
    if (!connected) {
      return NextResponse.json({
        status: 'error',
        message: 'Redis connection failed',
        connected: false,
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'Redis connection test successful',
      connected: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Cache test failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'Cache test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      connected: false,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}