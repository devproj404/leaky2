import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getCached, CACHE_TTL } from '@/lib/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    
    const categorySlug = resolvedParams.slug.toLowerCase()
    const filter = searchParams.get('filter') || 'recent'
    const limitParam = searchParams.get('limit')
    const pageParam = searchParams.get('page')
    
    const limit = limitParam ? parseInt(limitParam, 10) : 20
    const page = pageParam ? parseInt(pageParam, 10) : 1

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    if (page < 1) {
      return NextResponse.json(
        { error: 'Page must be >= 1' },
        { status: 400 }
      )
    }

    // Create cache key for category content
    const cacheKey = `category:${categorySlug}:filter:${filter}:page:${page}:limit:${limit}`

    // Use cache for category content
    const data = await getCached(
      cacheKey,
      async () => {
        console.log(`Fetching category content from database (category: ${categorySlug}, filter: ${filter}, page: ${page}, limit: ${limit})`)
        
        const supabase = await createClient()
        const offset = (page - 1) * limit

        // First get category info
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name, slug, description, image_url')
          .eq('slug', categorySlug)
          .single()

        if (categoryError || !categoryData) {
          console.error('Category not found:', categoryError)
          return { 
            error: 'Category not found',
            category: null,
            content: [],
            total_items: 0
          }
        }

        // Build content query based on filter
        let contentQuery = supabase
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
          .eq('category_id', categoryData.id)
          // Apply published filter
          .or(`is_published.eq.true,and(is_scheduled.eq.true,publish_at.lte.${new Date().toISOString()})`)
          .not('title', 'eq', '4654654654') // Exclude problematic content

        // Apply sorting based on filter
        switch (filter) {
          case 'popular':
          case 'most-viewed':
            contentQuery = contentQuery.order('views', { ascending: false })
            break
          case 'premium':
            contentQuery = contentQuery
              .eq('is_premium', true)
              .order('created_at', { ascending: false })
            break
          case 'free':
            contentQuery = contentQuery
              .eq('is_premium', false)
              .order('created_at', { ascending: false })
            break
          case 'recent':
          default:
            contentQuery = contentQuery.order('created_at', { ascending: false })
            break
        }

        // Apply pagination
        contentQuery = contentQuery.range(offset, offset + limit - 1)

        const { data: contentData, error: contentError } = await contentQuery

        if (contentError) {
          console.error('Database error fetching category content:', contentError)
          throw new Error(`Database error: ${contentError.message}`)
        }

        // Get total count for the same filter (for pagination)
        let countQuery = supabase
          .from('content')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', categoryData.id)
          .or(`is_published.eq.true,and(is_scheduled.eq.true,publish_at.lte.${new Date().toISOString()})`)
          .not('title', 'eq', '4654654654')

        // Apply same filter to count query
        if (filter === 'premium') {
          countQuery = countQuery.eq('is_premium', true)
        } else if (filter === 'free') {
          countQuery = countQuery.eq('is_premium', false)
        }

        const { count, error: countError } = await countQuery

        if (countError) {
          console.error('Error getting content count:', countError)
        }

        return {
          category: categoryData,
          content: contentData || [],
          total_items: count || 0,
          page,
          limit,
          filter,
          cached_at: new Date().toISOString(),
          cache_key: cacheKey,
        }
      },
      CACHE_TTL.SHORT // 5 minutes cache
    )

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in category content API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch category content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}