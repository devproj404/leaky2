import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getCached, cacheKeys, CACHE_TTL } from '@/lib/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Use cache for categories with counts
    const data = await getCached(
      cacheKeys.categories.withCounts(),
      async () => {
        console.log('Fetching categories with counts from database')
        
        const supabase = await createClient()
        
        // Optimized single query instead of N+1
        // This joins categories with content and counts in one query
        const { data: categoriesData, error } = await supabase
          .from('categories')
          .select(`
            *,
            content_count:content(count)
          `)
          .order('name')
        
        if (error) {
          console.error('Database error fetching categories:', error)
          throw new Error(`Database error: ${error.message}`)
        }

        // Process the data to get proper counts
        const categories = categoriesData?.map(category => {
          // Extract count from the nested content_count array
          const contentCount = Array.isArray(category.content_count) 
            ? category.content_count.length 
            : 0
          
          return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            image_url: category.image_url,
            created_at: category.created_at,
            updated_at: category.updated_at,
            content_count: contentCount,
          }
        }) || []

        // Alternative approach with more accurate count (using RPC if available)
        try {
          // Try to get more accurate counts with published filter
          const categoriesWithAccurateCounts = await Promise.all(
            categories.map(async (category) => {
              try {
                const { count, error: countError } = await supabase
                  .from('content')
                  .select('id', { count: 'exact', head: true })
                  .eq('category_id', category.id)
                  .or(`is_published.eq.true,and(is_scheduled.eq.true,publish_at.lte.${new Date().toISOString()})`)
                  .not('title', 'eq', '4654654654')
                
                if (countError) {
                  console.warn(`Error getting count for category ${category.slug}:`, countError)
                  return category // Return with original count
                }
                
                return {
                  ...category,
                  content_count: count || 0,
                }
              } catch (error) {
                console.warn(`Exception getting count for category ${category.slug}:`, error)
                return category // Return with original count
              }
            })
          )

          return {
            categories: categoriesWithAccurateCounts,
            total: categoriesWithAccurateCounts.length,
            cached_at: new Date().toISOString(),
            cache_key: cacheKeys.categories.withCounts(),
          }
        } catch (error) {
          console.warn('Failed to get accurate counts, using basic counts:', error)
          
          return {
            categories,
            total: categories.length,
            cached_at: new Date().toISOString(),
            cache_key: cacheKeys.categories.withCounts(),
          }
        }
      },
      CACHE_TTL.LONG // 30 minutes cache - categories don't change often
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in categories with counts API:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch categories with counts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}