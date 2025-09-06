"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Eye, ThumbsUp, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ExternalImage } from "@/components/external-image"

type Content = {
  id: number
  title: string
  description: string
  image_url: string
  is_premium: boolean
  views: number
  likes: number
  download_count: number
  slug: string
  category_id: number
  category_name?: string
}

export default function ContentBrowser() {
  const [content, setContent] = useState<Content[]>([])
  const [categories, setCategories] = useState<{ [key: number]: string }>({})
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user, isPremium, isAdmin } = useAuth()

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories from cached API
        const categoriesResponse = await fetch('/api/categories/with-counts', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        
        if (categoriesResponse.ok) {
          const categoriesResult = await categoriesResponse.json()
          const categoriesMap = categoriesResult.categories?.reduce(
            (acc: { [key: number]: string }, cat: any) => {
              acc[cat.id] = cat.name
              return acc
            },
            {} as { [key: number]: string },
          ) || {}
          setCategories(categoriesMap)
        }

        // Fetch content from cached API (trending by default)
        const contentResponse = await fetch('/api/content/trending?limit=50&sort=newest', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
        
        if (contentResponse.ok) {
          const contentResult = await contentResponse.json()
          if (contentResult.content) {
            setContent(contentResult.content)
          }
        }
      } catch (error) {
        console.error("Error fetching content:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleContentClick = (slug: string, categoryId: number) => {
    const categorySlug = categories[categoryId]?.toLowerCase().replace(/\s+/g, "-")
    if (categorySlug) {
      router.push(`/${categorySlug}/${slug}`)
    }
  }

  if (loading) return <p>Loading content...</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((item) => (
        <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative aspect-video overflow-hidden">
            <ExternalImage
              src={item.image_url}
              alt={item.title}
              width={400}
              height={225}
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
            {item.is_premium && (
              <div className="absolute top-2 right-2">
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Premium
                </Badge>
              </div>
            )}
          </div>

          <CardHeader className="pb-2">
            <CardTitle className="line-clamp-1">{item.title}</CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-2">
              {item.description || "No description available"}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {item.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4" /> {item.likes || 0}
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-4 w-4" /> {item.download_count || 0}
              </span>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button onClick={() => handleContentClick(item.slug, item.category_id)} variant="default">
              View Details
            </Button>

            {item.is_premium && !isPremium && !isAdmin && (
              <Button variant="outline" size="sm">
                <Lock className="h-4 w-4 mr-1" /> Unlock
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}

      {content.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground">No content available</p>
        </div>
      )}
    </div>
  )
}
