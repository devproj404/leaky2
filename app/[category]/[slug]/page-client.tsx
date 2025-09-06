"use client"

import { useState } from "react"
import { Maximize2 } from "lucide-react"
import { ExternalImage } from "@/components/external-image"
import { ImageViewer } from "@/components/image-viewer"

interface PreviewGalleryProps {
  images: string[]
  title: string
}

export function PreviewGallery({ images, title }: PreviewGalleryProps) {
  const [viewerOpen, setViewerOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const openViewer = (index: number) => {
    setSelectedImageIndex(index)
    setViewerOpen(true)
  }

  return (
    <>
      {/* Main preview gallery */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="relative bg-black/40 rounded-lg overflow-hidden border border-pink-900/30 hover:border-pink-500/50 transition-all group cursor-pointer"
            onClick={() => openViewer(index)}
          >
            {/* Image container with fixed height but object-contain to show full image */}
            <div className="relative h-[200px] w-full">
              <ExternalImage
                src={imageUrl || "/placeholder.svg"}
                alt={`${title} preview ${index + 1}`}
                fill
                className="object-contain p-1"
              />
            </div>

            {/* Overlay with zoom icon on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
              <Maximize2 className="w-8 h-8 text-white opacity-80" />
            </div>
          </div>
        ))}
      </div>

      {/* Full-size preview option */}
      <div className="mt-4 text-right">
        <button
          onClick={() => openViewer(0)}
          className="inline-flex items-center text-pink-400 hover:text-pink-300 text-sm font-medium"
        >
          <Maximize2 className="w-4 h-4 mr-1" />
          View full-size images
        </button>
      </div>

      {/* Image viewer modal */}
      <ImageViewer
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
      />
    </>
  )
}
