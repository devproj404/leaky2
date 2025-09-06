import type { Metadata } from "next"
import { getProducts } from "@/lib/product-service"
import ShopPageClient from "./page-client"

export const metadata: Metadata = {
  title: "Shop - Premium Content",
  description: "Browse and purchase premium content collections.",
}

function getMockProducts() {
  return [
    {
      id: 1,
      name: "Premium Collection Bundle",
      description: "Get access to our most popular premium content",
      price: 99.99,
      discounted_price: 79.99,
      rating: 5,
      image_url: "/vip-access-collection-preview.png",
      size: "50GB",
      count: "500+ files",
      featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Exclusive Content Pack",
      description: "Exclusive content not available anywhere else",
      price: 49.99,
      discounted_price: null,
      rating: 4,
      image_url: "/generic-content-collection.png",
      size: "25GB",
      count: "250+ files",
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 3,
      name: "TikTok Collection",
      description: "Popular content from TikTok creators",
      price: 39.99,
      discounted_price: 29.99,
      rating: 4,
      image_url: "/tiktok-collection-preview.png",
      size: "20GB",
      count: "200+ files",
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 4,
      name: "Snapchat Premium",
      description: "Exclusive Snapchat content collection",
      price: 59.99,
      discounted_price: null,
      rating: 5,
      image_url: "/snapwins-collection-preview.png",
      size: "30GB",
      count: "300+ files",
      featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]
}

export default async function ShopPage() {
  // Fetch products from the database
  let products = []
  let isUsingMockData = false
  let errorMessage = null

  try {
    console.log("Fetching products from database...")
    products = await getProducts()
    console.log(`Fetched ${products.length} products from database`)

    if (products.length === 0) {
      console.log("No products found in database, using mock data")
      isUsingMockData = true
      products = getMockProducts()
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    errorMessage = error instanceof Error ? error.message : "Unknown error"
    isUsingMockData = true
    products = getMockProducts()
  }

  return <ShopPageClient 
    initialProducts={products} 
    isUsingMockData={isUsingMockData} 
    errorMessage={errorMessage} 
  />
}
