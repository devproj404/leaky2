import { NextRequest, NextResponse } from 'next/server'
import { getCachedBatch, cacheKeys, CACHE_TTL } from '@/lib/cache'
import { createClient } from '@/lib/supabase-server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type BatchRequest = {
  id: string
  type: 'trending' | 'categories' | 'weekly-drop' | 'ads'
  params?: {
    limit?: number
    placement?: string
  }
}

type BatchResponse = {
  id: string
  data?: any
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const requests: BatchRequest[] = body.requests

    if (!Array.isArray(requests) || requests.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected { requests: [...] }' },
        { status: 400 }
      )
    }

    if (requests.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 requests per batch' },
        { status: 400 }
      )
    }

    console.log(`Processing batch request with ${requests.length} items`)

    // Prepare batch cache requests
    const cacheRequests = requests.map(req => ({
      key: getCacheKey(req),
      fetchFn: () => fetchData(req),
      ttl: getCacheTTL(req.type),
    }))

    // Execute batch cache lookup
    const results = await getCachedBatch(cacheRequests)

    // Format response
    const response: BatchResponse[] = results.map((data, index) => ({
      id: requests[index].id,
      data,
    }))

    return NextResponse.json({
      results: response,
      cached_at: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error in batch API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process batch request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function getCacheKey(req: BatchRequest): string {
  switch (req.type) {
    case 'trending':
      return cacheKeys.content.trending(req.params?.limit || 12)
    case 'categories':
      return cacheKeys.categories.withCounts()
    case 'weekly-drop':
      return cacheKeys.system.weeklyDrop()
    case 'ads':
      return cacheKeys.system.ads(req.params?.placement || 'homepage-top')
    default:
      return `batch:${req.type}:${JSON.stringify(req.params)}`
  }
}

function getCacheTTL(type: string): number {
  switch (type) {
    case 'trending':
      return CACHE_TTL.SHORT // 5 minutes
    case 'categories':
      return CACHE_TTL.LONG // 30 minutes
    case 'weekly-drop':
      return CACHE_TTL.MEDIUM // 15 minutes
    case 'ads':
      return CACHE_TTL.MEDIUM // 15 minutes
    default:
      return CACHE_TTL.SHORT
  }
}

async function fetchData(req: BatchRequest): Promise<any> {
  const supabase = await createClient()

  switch (req.type) {
    case 'trending': {
      const limit = req.params?.limit || 12
      const { data, error } = await supabase
        .from('content')
        .select(`
          id, title, views, file_size, image_url, slug, is_premium, created_at,
          category:categories(name, slug)
        `)
        .or(`is_published.eq.true,and(is_scheduled.eq.true,publish_at.lte.${new Date().toISOString()})`)
        .not('title', 'eq', '4654654654')
        .order('views', { ascending: false })
        .limit(limit)

      if (error) throw new Error(`Trending content error: ${error.message}`)
      return { content: data || [], type: 'trending' }
    }

    case 'categories': {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw new Error(`Categories error: ${error.message}`)
      
      // Get content counts for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          try {
            const { count } = await supabase
              .from('content')
              .select('id', { count: 'exact', head: true })
              .eq('category_id', category.id)
              .or(`is_published.eq.true,and(is_scheduled.eq.true,publish_at.lte.${new Date().toISOString()})`)
              .not('title', 'eq', '4654654654')
            
            return { ...category, content_count: count || 0 }
          } catch {
            return { ...category, content_count: 0 }
          }
        })
      )

      return { categories: categoriesWithCounts, type: 'categories' }
    }

    case 'weekly-drop': {
      const { data, error } = await supabase
        .from('weekly_drops')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new Error(`Weekly drop error: ${error.message}`)
      }

      return { weekly_drop: data, type: 'weekly-drop' }
    }

    case 'ads': {
      const placement = req.params?.placement || 'homepage-top'
      const { data, error } = await supabase
        .from('ad_slots')
        .select('*')
        .eq('placement', placement)
        .eq('is_active', true)
        .order('priority', { ascending: true })

      if (error) throw new Error(`Ads error: ${error.message}`)
      return { ads: data || [], placement, type: 'ads' }
    }

    default:
      throw new Error(`Unknown request type: ${req.type}`)
  }
}