import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getCached, CACHE_TTL } from '@/lib/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const popularLimit = parseInt(searchParams.get('popular_limit') || '6', 10)
    const productsLimit = parseInt(searchParams.get('products_limit') || '3', 10)
    const categoriesLimit = parseInt(searchParams.get('categories_limit') || '10', 10)

    // Create cache key for sidebar data
    const cacheKey = `sidebar:popular:${popularLimit}:products:${productsLimit}:categories:${categoriesLimit}`

    // Use cache for sidebar data
    const data = await getCached(
      cacheKey,
      async () => {
        // Fetching sidebar data from database
        
        const supabase = await createClient()

        // Get most popular content
        const { data: popularContent, error: popularError } = await supabase
          .from('content')
          .select(`
            id,
            title,
            views,
            image_url,
            slug,
            is_premium,
            category:categories(name, slug)
          `)
          .or(`is_published.eq.true,and(is_scheduled.eq.true,publish_at.lte.${new Date().toISOString()})`)
          .not('title', 'eq', '4654654654')
          .order('views', { ascending: false })
          .limit(popularLimit)

        if (popularError) {
          // Error fetching popular content
        }

        // Get featured products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price,
            discounted_price,
            image_url,
            featured,
            rating,
            size,
            count
          `)
          .eq('featured', true)
          .order('created_at', { ascending: false })
          .limit(productsLimit)

        if (productsError) {
          // Error fetching products
        }

        // Get categories (from our cached API or direct query)
        const { data: categories, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug, description, image_url')
          .order('name')
          .limit(categoriesLimit)

        if (categoriesError) {
          // Error fetching categories
        }

        return {
          popular_content: popularContent || [],
          products: products || [],
          categories: categories || [],
          cached_at: new Date().toISOString(),
          cache_key: cacheKey,
        }
      },
      CACHE_TTL.MEDIUM // 15 minutes cache for sidebar content
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in sidebar API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch sidebar data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}