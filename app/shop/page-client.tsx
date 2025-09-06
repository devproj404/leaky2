"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Star, AlertCircle } from "lucide-react"
import { BuyNowButton } from "@/components/buy-now-button"
import type { Product } from "@/lib/product-service"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-gray-400"}`} />
      ))}
    </div>
  )
}

export default function ShopPageClient({ initialProducts, isUsingMockData, errorMessage }: { 
  initialProducts: Product[]
  isUsingMockData: boolean
  errorMessage: string | null
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("latest")

  // Filter and sort products when search query or sort option changes
  useEffect(() => {
    let result = [...products]
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          (product.description && product.description.toLowerCase().includes(query))
      )
    }
    
    // Apply sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => {
          const priceA = a.discounted_price !== null ? a.discounted_price : a.price
          const priceB = b.discounted_price !== null ? b.discounted_price : b.price
          return priceA - priceB
        })
        break
      case "price-high":
        result.sort((a, b) => {
          const priceA = a.discounted_price !== null ? a.discounted_price : a.price
          const priceB = b.discounted_price !== null ? b.discounted_price : b.price
          return priceB - priceA
        })
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "size":
        // Sort by size (assuming size is in format like "50GB", "25GB", etc.)
        result.sort((a, b) => {
          const sizeA = parseInt(a.size.replace(/[^0-9]/g, "")) || 0
          const sizeB = parseInt(b.size.replace(/[^0-9]/g, "")) || 0
          return sizeB - sizeA
        })
        break
      case "latest":
      default:
        // Assuming newer products have higher IDs or using created_at
        result.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime()
          const dateB = new Date(b.created_at).getTime()
          return dateB - dateA
        })
    }
    
    setFilteredProducts(result)
  }, [products, searchQuery, sortBy])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Premium Content Shop</h1>
          <p className="text-gray-400">Browse our exclusive collections and premium content packages</p>
        </div>

        {isUsingMockData && (
          <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-500">Using Demo Data</h3>
              <p className="text-gray-300 text-sm">
                The shop is currently displaying demo products because we couldn't connect to the database.
                {errorMessage && <span className="block mt-1 text-gray-400 text-xs">Error: {errorMessage}</span>}
              </p>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-pink-900/20 to-black p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-auto flex-1">
              <input
                type="text"
                placeholder="Search in the shop..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="bg-black/60 border border-pink-900/50 text-gray-200 pl-10 pr-4 py-2 rounded-full w-full focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <div className="w-full md:w-auto relative">
              <select 
                className="bg-black/60 border border-pink-900/50 text-gray-200 px-4 py-2 rounded-full w-full md:w-auto focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 appearance-none pr-8"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="latest">Sort by latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="size">Largest Size</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <p className="text-gray-400 mb-6">
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'result' : 'results'}
          {searchQuery && ` for "${searchQuery}"`}
        </p>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-900/50 mb-4">
              <Search className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">No products found</h3>
            <p className="text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`bg-black border ${
                  product.featured ? "border-amber-500/50" : "border-pink-900/30"
                } rounded-lg overflow-hidden group hover:border-pink-500/50 transition-all duration-300 relative`}
              >
                {product.featured && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                      FEATURED
                    </span>
                  </div>
                )}

                <Link href={`/shop/product/${product.id}`}>
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-60"></div>
                    <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 rounded text-xs font-medium">
                      {product.count} • {product.size}
                    </div>
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/shop/product/${product.id}`}>
                    <h3 className="text-lg font-bold mb-1 group-hover:text-pink-400 transition-colors">{product.name}</h3>
                  </Link>
                  <p className="text-gray-400 text-sm mb-2">{product.description || "No description available"}</p>

                  <div className="flex items-center mb-3">
                    <StarRating rating={product.rating} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {product.discounted_price ? (
                        <>
                          <span className="text-gray-400 line-through text-sm">${product.price.toFixed(2)}</span>
                          <span className="text-xl font-bold text-pink-400">${product.discounted_price.toFixed(2)}</span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-pink-400">${product.price.toFixed(2)}</span>
                      )}
                    </div>

                    <BuyNowButton
                      product={product}
                      size="sm"
                      className={`${
                        product.featured
                          ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                          : "bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.2)]"
                      }`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
} 