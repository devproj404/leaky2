import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getCached, cacheKeys, CACHE_TTL } from '@/lib/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 12

    // Validate limit
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      )
    }

    // Use cache for trending content
    const data = await getCached(
      cacheKeys.content.trending(limit),
      async () => {
        // Fetching trending content from database
        
        const supabase = await createClient()
        
        // Optimized query - only fetch needed fields
        const { data, error } = await supabase
          .from('content')
          .select(`
            id,
            title,
            views,
            file_size,
            image_url,
            slug,
            is_premium,
            created_at,
            category:categories(name, slug)
          `)
          // Apply published filter
          .or(`is_published.eq.true,and(is_scheduled.eq.true,publish_at.lte.${new Date().toISOString()})`)
          .not('title', 'eq', '4654654654') // Exclude problematic content
          .order('views', { ascending: false })
          .limit(limit)

        if (error) {
          // Database error fetching trending content
          throw new Error(`Database error: ${error.message}`)
        }

        return {
          content: data || [],
          cached_at: new Date().toISOString(),
          cache_key: cacheKeys.content.trending(limit),
        }
      },
      CACHE_TTL.SHORT // 5 minutes cache
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in trending content API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch trending content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}