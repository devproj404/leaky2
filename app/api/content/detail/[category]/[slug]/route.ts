import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getCached, CACHE_TTL } from '@/lib/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string; slug: string }> }
) {
  try {
    const resolvedParams = await params
    const categorySlug = resolvedParams.category.toLowerCase()
    const contentSlug = resolvedParams.slug.toLowerCase()

    // Create cache key for content detail
    const cacheKey = `content:detail:${categorySlug}:${contentSlug}`

    // Use cache for content detail
    const data = await getCached(
      cacheKey,
      async () => {
        // Fetching content detail from database
        
        const supabase = await createClient()

        // Get the main content with category info
        const { data: content, error: contentError } = await supabase
          .from('content')
          .select(`
            *,
            category:categories(id, name, slug)
          `)
          .eq('slug', contentSlug)
          .single()

        if (contentError || !content) {
          // Content not found
          return { 
            error: 'Content not found',
            content: null,
            previousContent: null,
            nextContent: null
          }
        }

        // Verify the content belongs to the correct category
        if (content.category?.slug !== categorySlug) {
          // Content category mismatch
          return { 
            error: 'Content not found in this category',
            content: null,
            previousContent: null,
            nextContent: null
          }
        }

        // Get previous content (from all categories, ordered by ID)
        const { data: previousContent } = await supabase
          .from('content')
          .select('id, title, slug, image_url, category:categories(name, slug)')
          .lt('id', content.id)
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle()

        // Get next content (from all categories, ordered by ID)
        const { data: nextContent } = await supabase
          .from('content')
          .select('id, title, slug, image_url, category:categories(name, slug)')
          .gt('id', content.id)
          .order('id', { ascending: true })
          .limit(1)
          .maybeSingle()

        return {
          content,
          previousContent,
          nextContent,
          cached_at: new Date().toISOString(),
          cache_key: cacheKey,
        }
      },
      CACHE_TTL.MEDIUM // 15 minutes cache for content detail
    )

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in content detail API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch content detail',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}