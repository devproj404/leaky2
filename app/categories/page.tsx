import type { Metadata } from "next"
import { CategoriesSection } from "@/components/categories-section"

export const metadata: Metadata = {
  title: "All Categories",
  description: "Browse all content categories",
}

// Fetch categories from cached API
async function getCategories() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/categories/with-counts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Enable caching for build time
      next: { revalidate: 1800 } // 30 minutes
    })

    if (!response.ok) {
      console.error('Failed to fetch categories:', response.statusText)
      return []
    }

    const data = await response.json()
    return data.categories || []
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
