"use client"

import type React from "react"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { ExternalImage } from "./external-image"

interface ImageViewerProps {
  images: string[]
  initialIndex?: number
  onClose: () => void
  isOpen: boolean
}

export function ImageViewer({ images, initialIndex = 0, onClose, isOpen }: ImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  if (!isOpen) return null

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose()
    if (e.key === "ArrowLeft") handlePrevious()
    if (e.key === "ArrowRight") handleNext()
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button */}
      <button className="absolute top-4 right-4 text-white/70 hover:text-white z-10" onClick={onClose}>
        <X className="w-8 h-8" />
      </button>

      {/* Navigation buttons */}
      <button
        className="absolute left-4 text-white/70 hover:text-white z-10 p-2 rounded-full bg-black/50"
        onClick={(e) => {
          e.stopPropagation()
          handlePrevious()
        }}
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        className="absolute right-4 text-white/70 hover:text-white z-10 p-2 rounded-full bg-black/50"
        onClick={(e) => {
          e.stopPropagation()
          handleNext()
        }}
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      {/* Image container */}
      <div
        className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          <ExternalImage
            src={images[currentIndex]}
            alt={`Full size image ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Image counter */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/70 bg-black/50 px-4 py-2 rounded-full">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  )
}
