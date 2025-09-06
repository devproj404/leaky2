import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Star, ArrowLeft } from "lucide-react"
import { getProductById } from "@/lib/product-service"
import { BuyNowButton } from "@/components/buy-now-button"

export default async function ProductPage({ params }: { params: { id: string } }) {
  const productId = Number.parseInt(params.id)

  if (isNaN(productId)) {
    notFound()
  }

  const product = await getProductById(productId)

  if (!product) {
    notFound()
  }

  // Function to render star rating
  const renderStarRating = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < rating ? "text-amber-400 fill-amber-400" : "text-gray-400"}`} />
        ))}
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center text-sm text-gray-400 hover:text-pink-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Link>
        </div>

        <div className="bg-black border border-pink-900/30 rounded-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            <div className="relative aspect-square rounded-lg overflow-hidden border border-pink-900/20">
              <Image
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {product.featured && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-1 text-xs font-bold bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    FEATURED
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              <div className="flex items-center gap-2 mb-4">
                {renderStarRating(product.rating)}
                <span className="text-sm text-gray-400">({product.rating}/5)</span>
              </div>

              <p className="text-gray-300 mb-6">{product.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black/30 p-4 rounded-lg border border-pink-900/20">
                  <div className="text-sm text-gray-400 mb-1">Size</div>
                  <div className="text-lg font-medium">{product.size}</div>
                </div>
                <div className="bg-black/30 p-4 rounded-lg border border-pink-900/20">
                  <div className="text-sm text-gray-400 mb-1">Content</div>
                  <div className="text-lg font-medium">{product.count}</div>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex items-center gap-3 mb-4">
                  {product.discounted_price ? (
                    <>
                      <span className="text-gray-400 line-through text-lg">${product.price.toFixed(2)}</span>
                      <span className="text-3xl font-bold text-pink-400">${product.discounted_price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-pink-400">${product.price.toFixed(2)}</span>
                  )}
                </div>

                <BuyNowButton
                  product={product}
                  className={`w-full py-6 text-lg ${
                    product.featured
                      ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      : "bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                  }`}
                  fullWidth
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
