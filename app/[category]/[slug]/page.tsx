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
  const { data: popularContent = [] } = await supabaseAdmin
    .from("content")
    .select(`
      id, title, slug, image_url, views,
      category:categories(name, slug)
    `)
    .eq("is_published", true)
    .order("views", { ascending: false })
    .limit(6)

  const { data: products = [] } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("is_published", true)
    .limit(3)

  const { data: categories = [] } = await supabaseAdmin
    .from("categories")
    .select("*")
    .order("name")
    .limit(10)

  // Function to render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3 h-3 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}`} />
        ))}
      </div>
    )
  }

  // Get preview images from the content
  // Use preview_images if available, otherwise fall back to gallery images
  // If neither is available, use the main image
  const previewImages =
    content.preview_images && Array.isArray(content.preview_images) && content.preview_images.length > 0
      ? content.preview_images
      : content.gallery && Array.isArray(content.gallery) && content.gallery.length > 0
        ? content.gallery.map((item) => item.image_url)
        : [content.image_url]

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
        {/* Categories section - ADDED HERE */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Categories</h3>
          <div className="bg-black/30 border border-pink-900/30 rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  className="bg-black/50 hover:bg-pink-900/30 text-white px-3 py-1 rounded-full text-sm transition-colors border border-pink-900/30"
                >
                  {category.name}
                </Link>
              ))}
            </div>
            <div className="mt-3 text-right">
              <Link href="/categories" className="text-pink-400 hover:text-pink-300 text-sm">
                View all
              </Link>
            </div>
          </div>
        </div>

        {/* Most popular - now using real data */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Most popular</h3>
          <div>
            {popularContent.map((item) => (
              <Link key={item.id} href={`/${item.category?.slug}/${item.slug}`} className="block group">
                <div className="rounded-lg border border-pink-900/30 bg-black overflow-hidden transition-all hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <ExternalImage
                      src={item.image_url || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover transition-all duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-60"></div>
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-medium bg-pink-600 text-white rounded backdrop-blur-sm">
                        {item.category?.name}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <div className="text-xs text-white bg-black/50 px-2 py-1 rounded-sm">
                        {item.views.toLocaleString()} views
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-gray-200 group-hover:text-pink-400 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <div className="w-full h-1 bg-gray-800 mt-2">
                      <div className="h-full bg-pink-500" style={{ width: `${(item.views / 10000) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Products - now using real data */}
        <div>
          <h3 className="text-xl font-bold mb-4 text-gray-100">Products</h3>
          <div className="space-y-4">
            {products.map((product) => (
              <Link key={product.id} href={`/shop/product/${product.id}`} className="block">
                <div className="bg-black border border-pink-900/30 rounded-lg overflow-hidden hover:border-pink-500/50 transition-all duration-300">
                  <div className="flex">
                    <div className="w-1/2 relative h-[100px] overflow-hidden">
                      <Image
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="w-1/2 p-2 flex flex-col justify-between">
                      {product.featured && (
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-lg font-bold text-gray-200">VIP</div>
                          <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                            <span className="text-white text-xs">+</span>
                          </div>
                        </div>
                      )}
                      <div className="mb-1">
                        <div className="text-lg font-bold text-gray-200 truncate">{product.name.split(" ")[0]}</div>
                        <div className="text-sm text-amber-400">COLLECTION</div>
                      </div>
                      <div className="bg-amber-500/20 text-amber-400 text-xs px-2 py-1 rounded text-center mt-auto border border-amber-500/30">
                        {product.size} • {product.count}
                      </div>
                    </div>
                  </div>
                  <div className="p-2 border-t border-pink-900/30">
                    <h4 className="text-sm font-medium text-gray-200 mb-1 line-clamp-1">{product.name}</h4>
                    {product.rating > 0 && <div className="mb-1">{renderStarRating(product.rating)}</div>}
                    <div className="flex items-center">
                      {product.discounted_price ? (
                        <>
                          <span className="text-gray-400 line-through text-sm mr-2">${product.price.toFixed(2)}</span>
                          <span className="text-lg font-bold text-pink-400">
                            ${product.discounted_price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-pink-400">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </aside>
      </div>
      
      {/* Bottom Ad Slot */}
      <AdSlotComponent placement="content-bottom" className="mt-6" />
    </div>
  )
}
