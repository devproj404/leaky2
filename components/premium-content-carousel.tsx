"use client"

import { useEffect, useState } from "react"
import AutoScroll from "embla-carousel-auto-scroll"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Diamond } from "lucide-react"
import Link from "next/link"
import { getSupabaseClient } from "@/lib/supabase"
import { ExternalImage } from "./external-image"

import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

interface PremiumContent {
  id: number
  title: string
  description: string | null
  category_id: number
  image_url: string
  category_name: string
  category_slug: string
  slug: string
}

export function PremiumContentCarousel() {
  const [premiumContent, setPremiumContent] = useState<PremiumContent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPremiumContent() {
      try {
        const supabase = getSupabaseClient()

        const { data, error } = await supabase
          .from("content")
          .select(`
            id,
            title,
            description,
            category_id,
            image_url,
            slug,
            category:categories(name, slug)
          `)
          .eq("is_premium", true)
          .limit(8)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching premium content:", error)
          return
        }

        // Transform the data to match the expected format
        const formattedData = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || "Exclusive premium content",
          category_id: item.category_id,
          image_url: item.image_url,
          category_name: item.category?.name || "PREMIUM",
          category_slug: item.category?.slug || "premium",
          slug: item.slug,
        }))

        setPremiumContent(formattedData)
      } catch (error) {
        console.error("Error in fetchPremiumContent:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPremiumContent()
  }, [])

  // Fallback to mock data if no premium content is found
  const mockPremiumContent = [
    {
      id: 1,
      category_name: "ONLYFANS",
      title: "Premium Collection",
      description: "Exclusive premium content",
      image_url: "/neon-cyberpunk-city.png",
      category_slug: "onlyfans",
      slug: "premium-collection",
    },
    {
      id: 2,
      category_name: "AMATEURS",
      title: "Beach Collection",
      description: "Summer exclusive content",
      image_url: "/beach-sunset-photography.png",
      category_slug: "amateurs",
      slug: "beach-collection",
    },
    {
      id: 3,
      category_name: "NUDELEAKTEENS",
      title: "Summer Collection",
      description: "Hot summer content",
      image_url: "/enchanted-valley.png",
      category_slug: "nudeleakteens",
      slug: "summer-collection",
    },
    {
      id: 4,
      category_name: "TEENWINS",
      title: "Party Collection",
      description: "Exclusive party content",
      image_url: "/dark-mountain-landscape.png",
      category_slug: "teenwins",
      slug: "party-collection",
    },
  ]

  // Use real data if available, otherwise use mock data
  const displayContent = premiumContent.length > 0 ? premiumContent : mockPremiumContent

  return (
    <section className="py-16 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-pink-glow opacity-20"></div>
      <div className="container relative z-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Badge className="mb-6 inline-flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-400">
            <Diamond className="h-4 w-4" />
            Premium Content
          </Badge>
          <h2 className="mb-6 text-pretty text-3xl font-bold tracking-tight lg:text-4xl">
            Exclusive <span className="text-amber-400">Premium</span> Collections
          </h2>
          <p className="mb-10 text-lg text-gray-400">
            Get instant access to our premium collections with high-quality content updated weekly. Upgrade to premium
            for unlimited access to all exclusive content.
          </p>
        </div>

        <div className="pt-8">
          <div className="relative mx-auto flex items-center justify-center overflow-hidden">
            <Carousel
              opts={{
                loop: true,
                align: "start",
              }}
              plugins={[
                AutoScroll({
                  playOnInit: true,
                  stopOnInteraction: false,
                  speed: 0.7,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {loading
                  ? // Loading skeletons
                    Array.from({ length: 4 }).map((_, index) => (
                      <CarouselItem
                        key={`skeleton-${index}`}
                        className="basis-full pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                      >
                        <div className="flex flex-col rounded-xl border border-pink-900/30 bg-black overflow-hidden h-[280px] animate-pulse">
                          <div className="relative h-48 w-full bg-pink-900/20"></div>
                          <div className="p-4 space-y-2">
                            <div className="h-4 bg-pink-900/20 rounded w-3/4"></div>
                            <div className="h-3 bg-pink-900/20 rounded w-1/2"></div>
                          </div>
                        </div>
                      </CarouselItem>
                    ))
                  : // Real content
                    displayContent.map((content) => (
                      <CarouselItem key={content.id} className="basis-full pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                        <Link
                          href={`/${content.category_slug}/${content.slug}`}
                          className="group flex flex-col rounded-xl border border-pink-900/30 bg-black overflow-hidden transition-all hover:border-pink-500/50 hover:shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                        >
                          <div className="relative h-48 w-full overflow-hidden">
                            {content.image_url.startsWith("/") ? (
                              <Image
                                src={content.image_url || "/placeholder.svg"}
                                alt={content.title}
                                fill
                                className="object-cover transition-all duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <ExternalImage
                                src={content.image_url}
                                alt={content.title}
                                fill
                                className="object-cover transition-all duration-500 group-hover:scale-110"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-60"></div>
                            <div className="absolute top-3 left-3">
                              <span className="px-2 py-1 text-xs font-medium bg-pink-600 text-white rounded backdrop-blur-sm">
                                {content.category_name}
                              </span>
                            </div>
                            <div className="absolute top-3 right-3">
                              <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                                PREMIUM
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-bold text-gray-200 group-hover:text-pink-400 transition-colors">
                              {content.title}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">{content.description}</p>
                          </div>
                        </Link>
                      </CarouselItem>
                    ))}
              </CarouselContent>
            </Carousel>
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent"></div>
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent"></div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            className="group bg-black border-pink-900/50 text-gray-300 hover:bg-pink-950/20 hover:text-pink-400 hover:border-pink-500/50"
            size="lg"
            asChild
          >
            <Link href="/premium">
              View all premium content
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
