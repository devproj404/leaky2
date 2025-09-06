import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Loading() {
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
            <Skeleton className="aspect-square rounded-lg bg-pink-900/20" />

            <div className="flex flex-col">
              <Skeleton className="h-10 w-3/4 bg-pink-900/20 mb-2" />

              <Skeleton className="h-5 w-32 bg-pink-900/20 mb-4" />

              <Skeleton className="h-20 w-full bg-pink-900/20 mb-6" />

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Skeleton className="h-20 w-full bg-pink-900/20" />
                <Skeleton className="h-20 w-full bg-pink-900/20" />
              </div>

              <div className="mt-auto">
                <Skeleton className="h-10 w-32 bg-pink-900/20 mb-4" />
                <Skeleton className="h-14 w-full bg-pink-900/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
