"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, AlertTriangle, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SortableContentList, type SortableItem } from "@/components/admin/sortable-content-list"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function ContentRankingPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAuth()
  const [content, setContent] = useState<SortableItem[]>([])
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  // Check if user is authenticated and admin
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/?authRequired=true")
      return
    }

    // In development, allow access even if not admin
    if (!isAdmin && process.env.NODE_ENV === "production") {
      router.push("/")
    } else {
      fetchCategories()
      fetchContent()
    }
  }, [user, isAdmin, isLoading, router])

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from("categories").select("id, name, slug").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      console.error("Error fetching categories:", err)
    }
  }

  // Fetch content with ranking
  const fetchContent = async () => {
    setIsLoadingContent(true)
    setError(null)

    try {
      const supabase = createClientComponentClient()

      let query = supabase
        .from("content")
        .select(`
          id, 
          title, 
          image_url, 
          is_premium, 
          ranking,
          category:categories(id, name, slug)
        `)
        .order("ranking", { ascending: true })

      // Apply category filter if not "all"
      if (categoryFilter !== "all") {
        // Get the category ID first
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", categoryFilter)
          .single()

        if (categoryData) {
          query = query.eq("category_id", categoryData.id)
        }
      }

      const { data, error } = await query

      if (error) throw error

      // Format the data for the sortable list
      const formattedContent =
        data?.map((item, index) => ({
          id: item.id,
          title: item.title,
          image_url: item.image_url,
          category: item.category,
          is_premium: item.is_premium,
          ranking: item.ranking || index + 1,
        })) || []

      // Sort by ranking
      formattedContent.sort((a, b) => a.ranking - b.ranking)

      setContent(formattedContent)
    } catch (err) {
      console.error("Error fetching content:", err)
      setError("Failed to load content. Please try again.")
    } finally {
      setIsLoadingContent(false)
    }
  }

  // Handle reordering of content
  const handleReorder = async (reorderedItems: SortableItem[]) => {
    try {
      const response = await fetch("/api/admin/update-ranking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: reorderedItems.map((item, index) => ({
            id: item.id,
            ranking: index + 1,
          })),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update content order")
      }

      // Refresh content after successful update
      await fetchContent()
    } catch (err) {
      console.error("Error updating content order:", err)
      throw err
    }
  }

  // If still loading auth, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/content" className="p-2 rounded-full hover:bg-gray-800/50 transition-colors">
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text">
              Content Ranking
            </h1>
            <p className="text-gray-400 text-sm">Drag and drop to change the display order of content</p>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="bg-black/40 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select
            value={categoryFilter}
            onValueChange={(value) => {
              setCategoryFilter(value)
              // Fetch content with the new filter
              setTimeout(() => fetchContent(), 100)
            }}
          >
            <SelectTrigger className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300 w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-800">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.slug} value={category.slug}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={fetchContent} className="ml-2 border-gray-700 text-gray-300">
            Refresh
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <Button onClick={fetchContent} className="mt-2 bg-red-600 hover:bg-red-700 text-white">
            Try Again
          </Button>
        </div>
      )}

      {/* Content list */}
      {isLoadingContent ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
        </div>
      ) : (
        <SortableContentList items={content} onReorder={handleReorder} />
      )}
    </div>
  )
}
