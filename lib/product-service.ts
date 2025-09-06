import { createServerSupabaseClient } from "./supabase"

export type Product = {
  id: number
  name: string
  description: string | null
  price: number
  discounted_price: number | null
  rating: number
  image_url: string
  size: string
  count: string
  featured: boolean
  download_link?: string // Added download link field
  created_at: string
  updated_at: string
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from("shop_products")
    .select("*")
    .order("featured", { ascending: false })
    .order("id")

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data || []
}

export async function getFeaturedProducts(limit = 2): Promise<Product[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("shop_products").select("*").eq("featured", true).limit(limit)

  if (error) {
    console.error("Error fetching featured products:", error)
    return []
  }

  return data || []
}

export async function getProductById(id: number): Promise<Product | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.from("shop_products").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching product with ID ${id}:`, error)
    return null
  }

  return data
}
