import type { Metadata } from "next"
import { CategoriesSection } from "@/components/categories-section"
import { createClient } from "@supabase/supabase-js"

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse all content categories",
}

// Fetch categories using admin client for build-time compatibility
async function getCategories() {
  try {
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

    // Get all categories
    const { data: categories, error } = await supabaseAdmin
      .from("categories")
      .select("*")
      .order("name")

    if (error) {
      console.error("Error fetching categories:", error)
      return []
    }

    // For each category, get the count of content items
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        try {
          const { count, error: countError } = await supabaseAdmin
            .from("content")
            .select("id", { count: "exact", head: true })
            .eq("category_id", category.id)
            .eq("is_published", true)

          if (countError) {
            console.error(`Error fetching content count for category ${category.slug}:`, countError)
            return { ...category, content_count: 0 }
          }

          return { ...category, content_count: count || 0 }
        } catch (error) {
          console.error(`Exception fetching content count for category ${category.slug}:`, error)
          return { ...category, content_count: 0 }
        }
      })
    )

    return categoriesWithCount
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Browse All Categories
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover our extensive collection of content across {categories.length} different categories
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <CategoriesSection categories={categories} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No categories found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
