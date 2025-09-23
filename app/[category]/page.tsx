import { notFound } from "next/navigation"
import Link from "next/link"
import { CategoryContent } from "@/components/category-content"
import { PopularCarousel } from "@/components/popular-carousel"
import { createClient } from "@supabase/supabase-js"

// Define static routes that should never be handled by this dynamic route
const STATIC_ROUTES = ["shop", "premium", "settings", "orders", "search", "admin", "favicon.ico"]

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ filter?: string; page?: string }>
}) {
  // Await params before using its properties
  const resolvedParams = await params
  
  // Await searchParams before using its properties
  const resolvedSearchParams = await searchParams
  
  // Normalize the category
  const categorySlug = resolvedParams.category.toLowerCase()

  // Immediately return notFound for static routes to prevent handling them
  if (STATIC_ROUTES.includes(categorySlug)) {
    console.log(`Static route "/${categorySlug}" detected in [category] route, showing 404`)
    return notFound()
  }

  try {
    // Get the active filter and page from search params
    const activeFilter = resolvedSearchParams.filter || "recent"
    const currentPage = parseInt(resolvedSearchParams.page || "1", 10)
    const pageSize = 20

    // Create admin client that doesn't use cookies
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get the category
    const { data: category, error: categoryError } = await supabaseAdmin
      .from("categories")
      .select("*")
      .eq("slug", categorySlug)
      .single()
    
    if (categoryError || !category) {
      console.log(`Category not found for slug: ${categorySlug}`)
      return notFound()
    }

    // Get content for the category
    const offset = (currentPage - 1) * pageSize
    let contentQuery = supabaseAdmin
      .from("content")
      .select(`
        *,
        category:categories(name, slug)
      `)
      .eq("category_id", category.id)
      .eq("is_published", true)

    // Apply filtering based on filter type
    if (activeFilter === "premium") {
      contentQuery = contentQuery.eq("is_premium", true)
    } else if (activeFilter === "free") {
      contentQuery = contentQuery.eq("is_premium", false)
    }

    // Apply sorting based on filter
    if (activeFilter === "views") {
      contentQuery = contentQuery.order("views", { ascending: false })
    } else if (activeFilter === "premium" || activeFilter === "free") {
      // For premium/free filters, sort by newest first
      contentQuery = contentQuery.order("created_at", { ascending: false })
    } else {
      // Default: recent (newest first)
      contentQuery = contentQuery.order("created_at", { ascending: false })
    }

    const { data: categoryContent, error: contentError } = await contentQuery
      .range(offset, offset + pageSize - 1)

    if (contentError) {
      console.error(`Error fetching content for category ${categorySlug}:`, contentError)
      return notFound()
    }

    // Get total count with same filtering
    let countQuery = supabaseAdmin
      .from("content")
      .select("id", { count: "exact", head: true })
      .eq("category_id", category.id)
      .eq("is_published", true)

    // Apply same filtering to count query
    if (activeFilter === "premium") {
      countQuery = countQuery.eq("is_premium", true)
    } else if (activeFilter === "free") {
      countQuery = countQuery.eq("is_premium", false)
    }

    const { count: totalItems, error: countError } = await countQuery

    if (countError) {
      console.error(`Error getting count for category ${categorySlug}:`, countError)
    }

    const totalPages = Math.ceil((totalItems || 0) / pageSize)
    const hasNextPage = currentPage < totalPages
    const hasPrevPage = currentPage > 1

    // Get sidebar data for categories and popular content
    const { data: popularContentData } = await supabaseAdmin
      .from("content")
      .select(`
        id, title, slug, image_url, views,
        category:categories(name, slug)
      `)
      .eq("is_published", true)
      .order("views", { ascending: false })
      .limit(6)

    // Get all categories first
    const { data: allCategories } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("name")

    // Get content count for each category and sort by count
    let categoriesWithCount = []
    if (allCategories) {
      categoriesWithCount = await Promise.all(
        allCategories.map(async (category) => {
          const { count } = await supabaseAdmin
            .from("content")
            .select("id", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("is_published", true)
          
          return {
            ...category,
            content_count: count || 0
          }
        })
      )
      
      // Sort by content count descending and take top 6
      categoriesWithCount.sort((a, b) => b.content_count - a.content_count)
      categoriesWithCount = categoriesWithCount.slice(0, 6)
    }

    // Ensure arrays are never null
    const popularContent = popularContentData || []
    const categories = categoriesWithCount || []

    // Check if this is the teen packs category
    const isTeenPacks =
      categorySlug === "teen-packs" ||
      category.name.toLowerCase().includes("teen") ||
      category.slug.toLowerCase().includes("teen")

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <nav className="flex text-sm text-muted-foreground mb-4">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-primary capitalize">{category.name}</span>
          </nav>

          <h1 className="text-3xl font-bold text-foreground mb-2 capitalize">{category.name}</h1>
          <p className="text-muted-foreground">
            {category.description || `Browse the latest content in the ${category.name.toLowerCase()} category.`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <main className="flex-1">
            <CategoryContent
              category={category}
              categorySlug={categorySlug}
              activeFilter={activeFilter}
              categoryContent={categoryContent}
              isTeenPacks={isTeenPacks}
              totalPages={totalPages}
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              totalItems={totalItems || 0}
            />
          </main>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            {/* Categories section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Categories</h3>
                <Link href="/categories" className="text-primary hover:text-primary/80 text-sm">
                  View all categories
                </Link>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex flex-wrap gap-2">
                  {(categories || []).map((category) => (
                    <Link
                      key={category.id}
                      href={`/${category.slug}`}
                      className="inline-flex items-center gap-1 bg-accent hover:bg-muted text-foreground px-3 py-2 rounded-full text-sm transition-colors border border-border"
                    >
                      <span>{category.name}</span>
                      <span className="text-primary text-xs">
                        ({category.content_count})
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Most popular section */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Most popular</h3>
              <PopularCarousel items={popularContent || []} autoplayDelay={6000} />
            </div>
          </aside>
        </div>
      </div>
    )
  } catch (error) {
    console.error(`Error in CategoryPage for ${categorySlug}:`, error)
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">We couldn't load this category. Please try again later.</p>
          <Link href="/" className="text-primary hover:text-primary/80">
            Return to Home
          </Link>
        </div>
      </main>
    )
  }
}
