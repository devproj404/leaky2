import { createClient } from "./supabase-server"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Define the content type
export type Content = {
  id: number
  title: string
  description: string
  file_size: string
  views: number
  downloads: number
  image_url: string
  file_url: string
  created_at: string
  updated_at: string
  category_id: number
  slug: string
  is_premium: boolean
  preview_images?: string[]
  gallery?: { image_url: string }[]
  free_link?: string
  premium_link?: string
  download_count?: number
  ranking?: number
  is_published?: boolean
  is_scheduled?: boolean
  publish_at?: string
  category?: {
    name: string
    slug: string
  }
}

// Update the Category type to include content_count
export type Category = {
  id: number
  name: string
  slug: string
  description: string
  image_url: string
  created_at: string
  updated_at: string
  content_count?: number
}

// Define reserved slugs that are not categories
export const RESERVED_SLUGS = ["premium", "shop", "settings", "orders", "admin", "search"]

// Check if a slug is reserved (not a category)
export async function isReservedSlug(slug: string): Promise<boolean> {
  // Special case for admin - always treat as reserved
  if (slug === "admin" || slug.startsWith("admin/")) {
    return true
  }

  return RESERVED_SLUGS.includes(slug)
}

// Get all categories
export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception fetching categories:", error)
    return []
  }
}

// Add a new function to get categories with content count
export async function getCategoriesWithCount(): Promise<Category[]> {
  const supabase = await createClient()

  try {
    // First get all categories
    const { data: categories, error } = await supabase.from("categories").select("*").order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    // For each category, get the count of content items
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        try {
          let query = supabase
            .from("content")
            .select("id", { count: "exact", head: true })
            .eq("category_id", category.id)

          // Apply published filter
          query = addPublishedFilter(query)

          const { count, error: countError } = await query

          if (countError) {
            console.error(`Error fetching content count for category ${category.slug}:`, countError)
            return { ...category, content_count: 0 }
          }

          return { ...category, content_count: count || 0 }
        } catch (error) {
          console.error(`Exception fetching content count for category ${category.slug}:`, error)
          return { ...category, content_count: 0 }
        }
      }),
    )

    return categoriesWithCount
  } catch (error) {
    console.error("Exception in getCategoriesWithCount:", error)
    return []
  }
}

// Get a specific category by slug
export async function getCategory(slug: string): Promise<Category | null> {
  try {
    // If this is a reserved slug, it's not a category
    if (await isReservedSlug(slug)) {
      return null
    }

    const supabase = await createClient()
    const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).single()

    if (error) {
      console.error(`Error fetching category ${slug}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error(`Exception fetching category ${slug}:`, error)
    return null
  }
}

// Filter for published content that respects scheduled dates
function addPublishedFilter(query: any) {
  const currentDate = new Date().toISOString()
  
  return query
    .or(`is_published.eq.true,and(is_scheduled.eq.true,publish_at.lte.${currentDate})`)
    .not("title", "eq", "4654654654") // Explicitly exclude the problematic item
}

// Get content for a specific category with pagination and better error handling
export async function getCategoryContent(
  categorySlug: string,
  filter = "recent",
  page = 1,
  pageSize = 20,
): Promise<Content[]> {
  try {
    // If this is a reserved slug, return empty array
    if (await isReservedSlug(categorySlug)) {
      return []
    }

    const supabase = await createClient()
    const offset = (page - 1) * pageSize

    // Get the category ID first
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single()

    if (categoryError || !category) {
      console.error(`Error fetching category ID for ${categorySlug}:`, categoryError)
      return []
    }

    // Build the query
    let query = supabase.from("content").select("*").eq("category_id", category.id)

    // Apply published filter
    query = addPublishedFilter(query)

    // Apply filters
    switch (filter) {
      case "popular":
        query = query.order("views", { ascending: false })
        break
      case "downloads":
        query = query.order("downloads", { ascending: false })
        break
      case "premium":
        query = query
          .eq("is_premium", true)
          .order("ranking", { ascending: true })
          .order("created_at", { ascending: false })
        break
      case "free":
        query = query
          .eq("is_premium", false)
          .order("ranking", { ascending: true })
          .order("created_at", { ascending: false })
        break
      case "recent":
      default:
        // First sort by ranking, then by creation date for items with no ranking
        query = query.order("ranking", { ascending: true, nullsFirst: false }).order("created_at", { ascending: false })
        break
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1)

    // Execute the query
    const { data, error } = await query

    if (error) {
      console.error(`Error fetching content for category ${categorySlug}:`, error)
      return []
    }

    return data || []
  } catch (error) {
    console.error(`Exception in getCategoryContent for ${categorySlug}:`, error)
    return []
  }
}

// Get content details by category and slug with better error handling and fallbacks
export async function getContentDetail(categorySlug: string, contentSlug: string): Promise<Content | null> {
  try {
    // If this is a reserved slug or starts with admin/, return null immediately
    if (categorySlug === "admin" || categorySlug.startsWith("admin/")) {
      console.log("Admin route detected, skipping content detail fetch")
      return null
    }

    const supabase = await createClient()

    // Log the category slug we're looking for
    console.log(`Fetching content detail for category slug: ${categorySlug}, content slug: ${contentSlug}`)

    // Get the category ID first
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single()

    if (categoryError || !category) {
      console.error(`Error fetching category ID for ${categorySlug}:`, categoryError)
      
      // Try to find the content by slug directly, without filtering by category
      console.log(`Attempting to find content by slug directly: ${contentSlug}`)
      const { data: contentWithoutCategory, error: contentError } = await supabase
        .from("content")
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq("slug", contentSlug)
        .single()
        
      if (contentError || !contentWithoutCategory) {
        console.error(`Error fetching content by slug ${contentSlug}:`, contentError)
        return null
      }
      
      return contentWithoutCategory
    }

    try {
      // First try to get content with gallery and preview_images
      let query = supabase
        .from("content")
        .select(`
                *,
                category:categories(name, slug),
                gallery(image_url),
                preview_images
            `)
        .eq("category_id", category.id)
        .eq("slug", contentSlug)

      // Apply published filter for public viewing
      query = addPublishedFilter(query)

      const { data, error } = await query.single()

      if (!error && data) {
        return data
      }

      // If that fails, try without the gallery relationship
      console.log("Falling back to query without gallery relationship")
      let basicQuery = supabase
        .from("content")
        .select(`
                *,
                category:categories(name, slug),
                preview_images
            `)
        .eq("category_id", category.id)
        .eq("slug", contentSlug)

      // Apply published filter
      basicQuery = addPublishedFilter(basicQuery)

      const { data: basicData, error: basicError } = await basicQuery.single()

      if (basicError) {
        console.error(`Error fetching content ${contentSlug} in category ${categorySlug}:`, basicError)
        return null
      }

      // Add an empty gallery array to maintain type compatibility
      return {
        ...basicData,
        gallery: [],
      }
    } catch (error) {
      console.error(`Error in getContentDetail for ${contentSlug} in category ${categorySlug}:`, error)

      // Last resort: try with minimal fields
      try {
        let minimalQuery = supabase
          .from("content")
          .select(`
                  *,
                  category:categories(name, slug)
              `)
          .eq("category_id", category.id)
          .eq("slug", contentSlug)

        // Apply published filter
        minimalQuery = addPublishedFilter(minimalQuery)

        const { data: minimalData, error: minimalError } = await minimalQuery.single()

        if (minimalError) {
          console.error(`Error fetching minimal content data:`, minimalError)
          return null
        }

        return {
          ...minimalData,
          gallery: [],
          preview_images: [],
        }
      } catch (finalError) {
        console.error(`Final error in getContentDetail:`, finalError)
        return null
      }
    }
  } catch (error) {
    console.error(`Exception in getContentDetail for ${categorySlug}/${contentSlug}:`, error)
    return null
  }
}

// Get most popular content with better error handling
export async function getMostPopularContent(limit: number): Promise<Content[]> {
  try {
    const supabase = await createClient()

    let query = supabase.from("content").select(`
              *,
              category:categories(name, slug)
          `)

    // Apply published filter
    query = addPublishedFilter(query)

    // Apply ordering
    query = query
      .order("ranking", { ascending: true, nullsFirst: false })
      .order("views", { ascending: false })
      .limit(limit)

    const { data, error } = await query

    if (error) {
      console.error("Error fetching most popular content:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception in getMostPopularContent:", error)
    return []
  }
}

// Increment views with better error handling
export async function incrementViews(contentId: number): Promise<void> {
  try {
    const supabase = await createClient()

    try {
      // Call the RPC function to increment views
      const { error } = await supabase.rpc("increment_content_views", { content_id: contentId })

      if (error) {
        console.error("Error incrementing views:", error)

        // Fallback to direct update if RPC fails
        const { data } = await supabase.from("content").select("views").eq("id", contentId).single()
        if (data) {
          await supabase
            .from("content")
            .update({ views: data.views + 1 })
            .eq("id", contentId)
        }
      }
    } catch (error) {
      console.error("Error in incrementViews function:", error)
    }
  } catch (error) {
    console.error("Exception in incrementViews for content", contentId, ":", error)
  }
}

// Fix specific content item's scheduling status with better error handling
export async function fixContentSchedulingStatus(contentId: number): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Fetch the content item
    const { data: content, error: fetchError } = await supabase
      .from("content")
      .select("is_scheduled, publish_at, is_published")
      .eq("id", contentId)
      .single()

    if (fetchError) {
      console.error("Error fetching content:", fetchError)
      return false
    }

    if (!content) {
      console.warn("Content not found with ID:", contentId)
      return false
    }

    let updates: { is_published: boolean; is_scheduled: boolean } = {
      is_published: content.is_published || false,
      is_scheduled: content.is_scheduled || false,
    }

    // If publish_at is in the past, set is_published to true and is_scheduled to false
    if (content.publish_at && new Date(content.publish_at) <= new Date()) {
      updates = {
        is_published: true,
        is_scheduled: false,
      }
    } else if (content.publish_at && new Date(content.publish_at) > new Date()) {
      // If publish_at is in the future, set is_published to false and is_scheduled to true
      updates = {
        is_published: false,
        is_scheduled: true,
      }
    } else {
      // If no publish_at, set is_published to true and is_scheduled to false
      updates = {
        is_published: true,
        is_scheduled: false,
      }
    }

    // Update the content item
    const { error: updateError } = await supabase.from("content").update(updates).eq("id", contentId)

    if (updateError) {
      console.error("Error updating content:", updateError)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in fixContentSchedulingStatus:", error)
    return false
  }
}

// Fix the specific problematic content item with better error handling
export async function fixSpecificContent(): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Fix the problematic content
    const { error } = await supabase
      .from("content")
      .update({
        is_scheduled: true,
        is_published: false,
        file_size: "1 KB", // Set a non-zero file size
      })
      .eq("title", "4654654654")

    if (error) {
      console.error("Error fixing content:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in fixSpecificContent:", error)
    return false
  }
}

// Get a specific content item by slug with better error handling
export async function getContentBySlug(categorySlug: string, contentSlug: string): Promise<Content | null> {
  try {
    // If this is a reserved slug, return null
    if (await isReservedSlug(categorySlug)) {
      return null
    }

    const supabase = await createClient()

    // Get the category ID first
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single()

    if (categoryError || !category) {
      console.error(`Error fetching category ID for ${categorySlug}:`, categoryError)
      return null
    }

    // Get the content
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .eq("category_id", category.id)
      .eq("slug", contentSlug)
      .single()

    if (error) {
      console.error(`Error fetching content ${contentSlug} in category ${categorySlug}:`, error)
      return null
    }

    return data
  } catch (error) {
    console.error(`Exception in getContentBySlug for ${categorySlug}/${contentSlug}:`, error)
    return null
  }
}

// Get featured content for the homepage with better error handling
export async function getFeaturedContent(): Promise<Content[]> {
  try {
    const supabase = await createClient()
    // Sort by ranking first, then by views for items with no ranking
    let query = supabase.from("content").select("*")

    // Apply published filter
    query = addPublishedFilter(query)

    // Apply ordering
    query = query.order("ranking", { ascending: true, nullsFirst: false }).order("views", { ascending: false }).limit(8)

    const { data, error } = await query

    if (error) {
      console.error("Error fetching featured content:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception in getFeaturedContent:", error)
    return []
  }
}

// Get recent content for the homepage with better error handling
export async function getRecentContent(page = 1, limit = 8): Promise<Content[]> {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    // Sort by ranking first, then by creation date for items with no ranking
    let query = supabase.from("content").select("*")

    // Apply published filter
    query = addPublishedFilter(query)

    // Apply ordering and pagination
    query = query
      .order("ranking", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error("Error fetching recent content:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception in getRecentContent:", error)
    return []
  }
}

// Get popular content for the homepage with better error handling
export async function getPopularContent(page = 1, limit = 8): Promise<Content[]> {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    // Sort by ranking first, then by views for items with no ranking
    let query = supabase.from("content").select(`
      *,
      category:categories(name, slug)
    `)

    // Apply published filter
    query = addPublishedFilter(query)

    // Apply ordering and pagination
    query = query
      .order("ranking", { ascending: true, nullsFirst: false })
      .order("views", { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error("Error fetching popular content:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception in getPopularContent:", error)
    return []
  }
}

// Get premium content for the homepage with better error handling
export async function getPremiumContent(page = 1, limit = 8): Promise<Content[]> {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    // Sort by ranking first, then by creation date for items with no ranking
    let query = supabase.from("content").select("*").eq("is_premium", true)

    // Apply published filter
    query = addPublishedFilter(query)

    // Apply ordering and pagination
    query = query
      .order("ranking", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error("Error fetching premium content:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception in getPremiumContent:", error)
    return []
  }
}

// Get free content for the homepage with better error handling
export async function getFreeContent(page = 1, limit = 8): Promise<Content[]> {
  try {
    const supabase = await createClient()
    const offset = (page - 1) * limit

    // Sort by ranking first, then by creation date for items with no ranking
    let query = supabase.from("content").select("*").eq("is_premium", false)

    // Apply published filter
    query = addPublishedFilter(query)

    // Apply ordering and pagination
    query = query
      .order("ranking", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error } = await query

    if (error) {
      console.error("Error fetching free content:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception in getFreeContent:", error)
    return []
  }
}

// Get total content count with better error handling
export async function getContentCount(filter = "recent"): Promise<number> {
  try {
    const supabase = await createClient()

    let query = supabase.from("content").select("*", { count: "exact", head: true })

    // Apply published filter for public counts
    query = addPublishedFilter(query)

    // Apply filters
    if (filter === "premium") {
      query = query.eq("is_premium", true)
    } else if (filter === "free") {
      query = query.eq("is_premium", false)
    }

    const { count, error } = await query

    if (error) {
      console.error("Error fetching content count:", error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error("Exception in getContentCount:", error)
    return 0
  }
}

// Increment view count for a content item with better error handling
export async function incrementViewCount(contentId: number): Promise<void> {
  try {
    const supabase = createClientComponentClient()

    // First get the current view count
    const { data, error } = await supabase.from("content").select("views").eq("id", contentId).single()

    if (error || !data) {
      console.error(`Error fetching view count for content ${contentId}:`, error)
      return
    }

    // Increment the view count
    const { error: updateError } = await supabase
      .from("content")
      .update({ views: data.views + 1 })
      .eq("id", contentId)

    if (updateError) {
      console.error(`Error incrementing view count for content ${contentId}:`, updateError)
    }
  } catch (error) {
    console.error(`Exception in incrementViewCount for content ${contentId}:`, error)
  }
}

// Search content with better error handling
export async function searchContent(query: string): Promise<Content[]> {
  try {
    const supabase = await createClient()

    // Search in title and description
    let searchQuery = supabase.from("content").select("*").or(`title.ilike.%${query}%,description.ilike.%${query}%`)

    // Apply published filter
    searchQuery = addPublishedFilter(searchQuery)

    // Apply ordering
    searchQuery = searchQuery
      .order("ranking", { ascending: true, nullsFirst: false })
      .order("views", { ascending: false })
      .limit(20)

    const { data, error } = await searchQuery

    if (error) {
      console.error(`Error searching content for "${query}":`, error)
      return []
    }

    return data || []
  } catch (error) {
    console.error(`Exception in searchContent for "${query}":`, error)
    return []
  }
}

// Get adjacent content for the content page
export async function getAdjacentContent(
  contentId: number,
  categoryId: number,
): Promise<{ previous: Content | null; next: Content | null }> {
  try {
    const supabase = await createClient()

    // Get previous content
    const { data: previousContent } = await supabase
      .from("content")
      .select("*")
      .eq("category_id", categoryId)
      .lt("id", contentId)
      .order("id", { ascending: false })
      .limit(1)
      .single()

    // Get next content
    const { data: nextContent } = await supabase
      .from("content")
      .select("*")
      .eq("category_id", categoryId)
      .gt("id", contentId)
      .order("id", { ascending: true })
      .limit(1)
      .single()

    return {
      previous: previousContent,
      next: nextContent,
    }
  } catch (error) {
    console.error("Error fetching adjacent content:", error)
    return { previous: null, next: null }
  }
}

// Get category content count for pagination
export async function getCategoryContentCount(
  categorySlug: string,
  filter = "recent",
): Promise<number> {
  try {
    // If this is a reserved slug, return 0
    if (await isReservedSlug(categorySlug)) {
      return 0
    }

    const supabase = await createClient()

    // Get the category ID first
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single()

    if (categoryError || !category) {
      console.error(`Error fetching category ID for ${categorySlug}:`, categoryError)
      return 0
    }

    // Build the count query
    let query = supabase
      .from("content")
      .select("*", { count: "exact", head: true })
      .eq("category_id", category.id)

    // Apply published filter
    query = addPublishedFilter(query)

    // Apply filters based on filter type
    switch (filter) {
      case "premium":
        query = query.eq("is_premium", true)
        break
      case "free":
        query = query.eq("is_premium", false)
        break
    }

    const { count, error } = await query

    if (error) {
      console.error(`Error fetching content count for category ${categorySlug}:`, error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error(`Exception in getCategoryContentCount for ${categorySlug}:`, error)
    return 0
  }
}
