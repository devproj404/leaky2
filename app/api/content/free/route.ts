import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getCached, cacheKeys, CACHE_TTL } from '@/lib/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const pageParam = searchParams.get('page')
    const sortParam = searchParams.get('sort')
    
    const limit = limitParam ? parseInt(limitParam, 10) : 12
    const page = pageParam ? parseInt(pageParam, 10) : 1
    const sort = sortParam || 'newest'

    // Validate parameters
    if (limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 50' },
        { status: 400 }
      )
    }

    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be >= 1' },
        { status: 400 }
      )
    }

    // Create cache key for free content
    const cacheKey = `content:free:page:${page}:limit:${limit}:sort:${sort}`

    // Use cache for free content
    const data = await getCached(
      cacheKey,
      async () => {
        // Fetching free content from database
        
        const supabase = await createClient()
        const offset = (page - 1) * limit
        
        // Optimized query - only fetch needed fields
        let query = supabase
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
          // Filter for free content only
          .eq('is_premium', false)
          // Apply published filter
          .or(`is_published.eq.true,and(is_scheduled.eq.true,publish_at.lte.${new Date().toISOString()})`)
          .not('title', 'eq', '4654654654') // Exclude problematic content

        // Apply sorting
        switch (sort) {
          case 'views':
          case 'most-viewed':
            query = query.order('views', { ascending: false })
            break
          case 'newest':
          default:
            query = query.order('created_at', { ascending: false })
            break
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1)

        const { data, error } = await query

        if (error) {
          // Database error fetching free content
          throw new Error(`Database error: ${error.message}`)
        }

        return {
          content: data || [],
          page,
          limit,
          sort,
          total_items: data?.length || 0,
          cached_at: new Date().toISOString(),
          cache_key: cacheKey,
        }
      },
      CACHE_TTL.SHORT // 5 minutes cache
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in free content API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch free content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}