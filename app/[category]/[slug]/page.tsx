import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Eye, Calendar, Download, Star, ArrowLeft, ArrowRight } from "lucide-react"
import { incrementViews } from "@/lib/content-service"
import { DownloadButton } from "@/components/download-button"
import { ExternalImage } from "@/components/external-image"
import { ReportDeadLinkButton } from "@/components/report-dead-link-button"
import { AdSlotComponent } from "@/components/ad-slot"
import { PreviewGallery } from "./page-client"
import { PopularCarousel } from "@/components/popular-carousel"
import { ScrollToTop } from "@/components/scroll-to-top"
import { createClient } from "@supabase/supabase-js"

export default async function ContentPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  // Await params before using its properties
  const resolvedParams = await params
  
  // Normalize the category and slug
  const categorySlug = resolvedParams.category.toLowerCase()
  const contentSlug = resolvedParams.slug.toLowerCase()

  // Check if this is an admin route and return 404 if it is
  if (categorySlug === "admin" || categorySlug.startsWith("admin/")) {
    console.log("Admin route detected in [category]/[slug] dynamic route, showing 404")
    notFound()
  }

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

  // Get content detail with admin client
  const { data: content, error: contentError } = await supabaseAdmin
    .from("content")
    .select(`
      *,
      category:categories(name, slug)
    `)
    .eq("slug", contentSlug)
    .eq("is_published", true)
    .single()

  if (contentError || !content) {
    notFound()
  }

  // Verify the category matches
  if (content.category?.slug !== categorySlug) {
    notFound()
  }

  // Get previous content
  const { data: previousContent } = await supabaseAdmin
    .from("content")
    .select(`
      id, title, slug, image_url,
      category:categories(slug)
    `)
    .eq("category_id", content.category_id)
    .eq("is_published", true)
    .lt("created_at", content.created_at)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  // Get next content
  const { data: nextContent } = await supabaseAdmin
    .from("content")
    .select(`
      id, title, slug, image_url,
      category:categories(slug)
    `)
    .eq("category_id", content.category_id)
    .eq("is_published", true)
    .gt("created_at", content.created_at)
    .order("created_at", { ascending: true })
    .limit(1)
    .single()

  // Increment view count (keep this as server action)
  await incrementViews(content.id)

  // Get sidebar data directly with admin client
  const { data: popularContentData } = await supabaseAdmin
    .from("content")
    .select(`
      id, title, slug, image_url, views,
      category:categories(name, slug)
    `)
    .eq("is_published", true)
    .order("views", { ascending: false })
    .limit(6)

  // Advanced Related Content Algorithm
  // 1. Same category (70% weight)
  const { data: sameCategoryContent } = await supabaseAdmin
    .from("content")
    .select(`
      id, title, slug, image_url, views, created_at,
      category:categories(name, slug)
    `)
    .eq("category_id", content.category_id)
    .eq("is_published", true)
    .neq("id", content.id)
    .order("views", { ascending: false })
    .limit(8)

  // 2. Similar view count range (20% weight)
  const viewRange = Math.max(1, Math.floor(content.views * 0.1)) // 10% range
  const { data: similarViewsContent } = await supabaseAdmin
    .from("content")
    .select(`
      id, title, slug, image_url, views, created_at,
      category:categories(name, slug)
    `)
    .eq("is_published", true)
    .neq("id", content.id)
    .neq("category_id", content.category_id)
    .gte("views", content.views - viewRange)
    .lte("views", content.views + viewRange)
    .order("views", { ascending: false })
    .limit(4)

  // 3. Recent trending (10% weight)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: recentTrendingContent } = await supabaseAdmin
    .from("content")
    .select(`
      id, title, slug, image_url, views, created_at,
      category:categories(name, slug)
    `)
    .eq("is_published", true)
    .neq("id", content.id)
    .gte("created_at", thirtyDaysAgo.toISOString())
    .order("views", { ascending: false })
    .limit(4)

  // Smart algorithm to combine and rank related content
  const relatedContentMap = new Map()
  
  // Add same category content (highest priority)
  sameCategoryContent?.forEach((item, index) => {
    const score = (8 - index) * 0.7 + (item.views / 1000) * 0.3
    relatedContentMap.set(item.id, { ...item, score })
  })
  
  // Add similar views content (medium priority)
  similarViewsContent?.forEach((item, index) => {
    if (!relatedContentMap.has(item.id)) {
      const score = (4 - index) * 0.2 + (item.views / 1000) * 0.2
      relatedContentMap.set(item.id, { ...item, score })
    }
  })
  
  // Add recent trending content (lower priority)
  recentTrendingContent?.forEach((item, index) => {
    if (!relatedContentMap.has(item.id)) {
      const daysOld = Math.max(1, (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const recencyBonus = Math.max(0, (30 - daysOld) / 30)
      const score = (4 - index) * 0.1 + recencyBonus * 0.15
      relatedContentMap.set(item.id, { ...item, score })
    }
  })
  
  // Sort by score and take top 8
  const relatedContent = Array.from(relatedContentMap.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)

  const { data: productsData } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_published", true)
    .limit(3)

  // Get all categories first for sidebar
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
  const products = productsData || []
  const categories = categoriesWithCount || []

  // Function to render star rating
  const renderStarRating = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          className={`w-3 h-3 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} 
        />
      )
    }
    return <div className="flex">{stars}</div>
  }

  // Get preview images from the content
  // Use preview_images if available, otherwise fall back to gallery images
  // If neither is available, use the main image
  const previewImages =
    content.preview_images && Array.isArray(content.preview_images) && content.preview_images.length > 0
      ? content.preview_images
      : content.gallery && Array.isArray(content.gallery) && content.gallery.length > 0
        ? content.gallery.map((item) => item?.image_url).filter(Boolean)
        : [content.image_url].filter(Boolean)

  // Ensure download_count has a default value if it's missing
  const downloadCount = content.download_count || 0

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Top Ad Slot */}
      <AdSlotComponent placement="content-top" className="mb-6" />
      
      <div className="flex flex-col md:flex-row gap-6">
        <main className="flex-1">
          {/* Header with breadcrumb */}
          <div className="flex items-center text-sm text-gray-400 mb-4">
          <Link href="/" className="hover:text-pink-400 transition-colors">
            HOME
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/${categorySlug}`} className="hover:text-pink-400 transition-colors uppercase">
            <span className="bg-pink-600 text-white px-2 py-0.5 rounded text-xs">{content.category?.name}</span>
          </Link>
        </div>

        {/* Main content image with title overlay */}
        <div className="relative w-full h-[300px] rounded-lg overflow-hidden mb-6">
          <ExternalImage
            src={content.image_url || "/placeholder.svg"}
            alt={content.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{content.title}</h1>
            <div className="flex items-center text-gray-300 text-sm">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(content.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="mx-3">•</span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {content.views.toLocaleString()} views
              </span>
            </div>
          </div>
        </div>

        {/* IMPROVED Preview images section */}
        <div className="border-t border-pink-900/30 pt-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Preview images</h2>
          <PreviewGallery images={previewImages} title={content.title} />
        </div>

        {/* Download information section */}
        <div className="border-t border-pink-900/30 pt-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Download information</h2>
          <div className="bg-black/30 p-4 rounded-lg mb-4">
            <p className="text-gray-300">
              You will get access to the Mega link for free, you need to watch 30 seconds of advertising.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="bg-black/20 px-6 py-3 rounded-lg flex items-center gap-2">
              <Download className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{downloadCount} downloads</span>
            </div>
            <div className="bg-black/20 px-6 py-3 rounded-lg flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">{content.views.toLocaleString()} views</span>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <DownloadButton
              contentId={content.id}
              downloadUrl={content.free_link || "#"}
              type="free"
              title={content.title}
            />
            <DownloadButton
              contentId={content.id}
              downloadUrl={content.premium_link || "#"}
              type="premium"
              title={content.title}
            />
          </div>
          <ReportDeadLinkButton contentId={content.id} contentTitle={content.title} />

          {/* Simple Previous/Next Post Navigation */}
          <div className="flex border border-pink-900/30 rounded-lg overflow-hidden mt-6">
            <Link
              href={previousContent && previousContent.category ? 
                `/${typeof previousContent.category === 'object' && 'slug' in previousContent.category ? 
                  previousContent.category.slug : categorySlug}/${previousContent.slug}` : 
                `/${categorySlug}`}
              className="flex items-center p-3 bg-black/20 hover:bg-black/30 transition-colors w-1/2 border-r border-pink-900/30"
            >
              {previousContent ? (
                <>
                  <div className="relative w-10 h-10 rounded overflow-hidden mr-3">
                    <ExternalImage
                      src={previousContent.image_url || "/placeholder.svg"}
                      alt={previousContent.title || "Previous post"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <ArrowLeft className="w-4 h-4 mr-1" /> PREVIOUS POST
                    </div>
                    <div className="text-sm text-white">{previousContent.title}</div>
                  </div>
                </>
              ) : (
                <div className="flex items-center">
                  <ArrowLeft className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-300">Back to category</span>
                </div>
              )}
            </Link>

            <Link
              href={nextContent && nextContent.category ? 
                `/${typeof nextContent.category === 'object' && 'slug' in nextContent.category ? 
                  nextContent.category.slug : categorySlug}/${nextContent.slug}` : 
                `/${categorySlug}`}
              className="flex items-center justify-end p-3 bg-black/20 hover:bg-black/30 transition-colors w-1/2"
            >
              {nextContent ? (
                <>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 flex items-center justify-end">
                      NEXT POST <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                    <div className="text-sm text-white">{nextContent.title}</div>
                  </div>
                  <div className="relative w-10 h-10 rounded overflow-hidden ml-3">
                    <ExternalImage
                      src={nextContent.image_url || "/placeholder.svg"}
                      alt={nextContent.title || "Next post"}
                      fill
                      className="object-cover"
                    />
                  </div>
                </>
              ) : (
                <div className="flex items-center">
                  <span className="text-gray-300">Back to category</span>
                  <ArrowRight className="w-4 h-4 ml-2 text-gray-400" />
                </div>
              )}
            </Link>
          </div>
        </div>
      </main>

      {/* Sidebar */}
      <aside className="w-full md:w-80 shrink-0">
        {/* Categories section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Categories</h3>
            <Link href="/categories" className="text-pink-400 hover:text-pink-300 text-sm">
              View all categories
            </Link>
          </div>
          <div className="bg-black/30 border border-pink-900/30 rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              {(categories || []).map((category) => (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  className="inline-flex items-center gap-1 bg-black/50 hover:bg-pink-900/30 text-white px-3 py-2 rounded-full text-sm transition-colors border border-pink-900/30"
                >
                  <span>{category.name}</span>
                  <span className="text-pink-400 text-xs">
                    ({category.content_count})
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Most popular - now using carousel */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Most popular</h3>
          <PopularCarousel items={popularContent || []} autoplayDelay={6000} />
        </div>

      </aside>
      </div>

      {/* Related Content Section - Advanced Algorithm */}
      {relatedContent.length > 0 && (
        <div className="mt-12 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">You might also like</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {relatedContent.map((item, index) => (
              <Link
                key={item.id}
                href={`/${item.category?.slug}/${item.slug}`}
                className="group block relative"
              >
                <div className="relative overflow-hidden rounded-xl border border-pink-900/30 bg-black transition-all duration-300 hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:scale-[1.02]">
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <ExternalImage
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-60"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 text-xs font-semibold bg-pink-600/90 text-white rounded-full border border-pink-500/30">
                        {item.category?.name}
                      </span>
                    </div>
                    
                    {/* Quality Score Indicator */}
                    {index < 3 && (
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center space-x-1 bg-amber-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                          <span>Hot</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Views Counter */}
                    <div className="absolute bottom-3 right-3">
                      <div className="flex items-center space-x-1 bg-black/70 text-gray-300 px-2.5 py-1 rounded-full text-xs">
                        <Eye className="w-3 h-3" />
                        <span>{item.views.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {/* Hover Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-pink-600/90 rounded-full flex items-center justify-center border-2 border-white/30">
                        <svg className="w-5 h-5 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white group-hover:text-pink-300 transition-colors duration-300 line-clamp-2 text-sm leading-tight mb-2">
                      {item.title}
                    </h3>
                    
                    {/* Engagement Metrics */}
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </span>
                      
                      {/* Quality Score Bar */}
                      <div className="flex items-center space-x-2">
                        <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, (item.score / 10) * 100)}%` }}
                          />
                        </div>
                        <span className="text-pink-400 font-medium">{Math.round((item.score / 10) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {/* Load More Button */}
          <div className="text-center mt-8">
            <Link
              href={`/${content.category?.slug}`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105"
            >
              <span>Explore More in {content.category?.name}</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      )}
      
      {/* Bottom Ad Slot */}
      <AdSlotComponent placement="content-bottom" className="mt-6" />

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </div>
  )
}
