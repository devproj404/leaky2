"use client"

import { useState, useEffect } from "react"
import { X, Crown } from "lucide-react"
import Link from "next/link"

interface PremiumAccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
}

export function PremiumAccessModal({ isOpen, onClose, title }: PremiumAccessModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Lock body scroll
      document.body.style.overflow = "hidden"
    } else {
      // Unlock body scroll
      document.body.style.overflow = ""
      // Delay hiding to allow animation
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-gradient-to-b from-gray-900 to-black border border-pink-900/50 rounded-lg shadow-lg max-w-md w-full p-6 transition-all duration-300 transform ${
          isOpen ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Premium Content</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6 text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-gray-300 mb-2">
            <span className="text-amber-400 font-semibold">{title}</span> is premium content.
          </p>
          <p className="text-gray-400 text-sm">
            Upgrade to premium to access this and all other exclusive content on our platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-black border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded transition-colors text-sm font-medium"
          >
            Return
          </button>
          <Link
            href="/premium"
            className="flex-1 py-2 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white rounded shadow-[0_0_10px_rgba(245,158,11,0.2)] hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all text-center text-sm font-medium"
          >
            Get Premium
          </Link>
        </div>
      </div>
    </div>
  )
}
