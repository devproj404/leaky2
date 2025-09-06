"use client"

import { useState, useEffect } from "react"
import { ExternalImage } from "./external-image"
import { validateImageUrl, getProxiedImageUrl } from "@/lib/image-proxy"

interface ImageInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export function ImageInput({
  label,
  value,
  onChange,
  placeholder = "Enter image URL (imgur, postimg, etc.)",
  required = false,
  className = "",
}: ImageInputProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validation, setValidation] = useState<{
    valid?: boolean
    error?: string
    contentType?: string
    size?: number
  } | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Validate image URL when value changes
  useEffect(() => {
    if (!value || !value.trim()) {
      setValidation(null)
      setShowPreview(false)
      return
    }

    const validateUrl = async () => {
      setIsValidating(true)
      try {
        const result = await validateImageUrl(value.trim())
        setValidation(result)
        setShowPreview(result.valid)
      } catch (error) {
        setValidation({
          valid: false,
          error: error instanceof Error ? error.message : 'Validation failed',
        })
        setShowPreview(false)
      } finally {
        setIsValidating(false)
      }
    }

    // Debounce validation
    const timeoutId = setTimeout(validateUrl, 500)
    return () => clearTimeout(timeoutId)
  }, [value])

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label and Input */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        
        <div className="relative">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            required={required}
          />
          
          {/* Validation Indicator */}
          <div className="absolute right-3 top-2.5 flex items-center">
            {isValidating && (
              <div className="w-5 h-5 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            )}
            {!isValidating && validation?.valid === true && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            {!isValidating && validation?.valid === false && (
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation Message */}
      {validation && (
        <div className={`text-sm ${validation.valid ? 'text-green-400' : 'text-red-400'}`}>
          {validation.valid ? (
            <div className="flex items-center gap-2">
              <span>✓ Valid image</span>
              {validation.contentType && (
                <span className="text-gray-400">({validation.contentType})</span>
              )}
              {validation.size && (
                <span className="text-gray-400">• {formatFileSize(validation.size)}</span>
              )}
            </div>
          ) : (
            <span>⚠ {validation.error}</span>
          )}
        </div>
      )}

      {/* Image Preview */}
      {showPreview && validation?.valid && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Preview:</span>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-pink-400 hover:text-pink-300"
            >
              Hide Preview
            </button>
          </div>
          
          <div className="relative w-full max-w-md h-48 bg-background border border-input rounded-md overflow-hidden">
            <ExternalImage
              src={value}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Proxy Info */}
          <div className="text-xs text-gray-400 space-y-1">
            <div>Original URL: <span className="text-pink-300 break-all">{value}</span></div>
            <div>Proxied URL: <span className="text-green-300 break-all">{getProxiedImageUrl(value)}</span></div>
          </div>
        </div>
      )}

      {/* Common Image Hosting Instructions */}
      <div className="text-xs text-gray-400">
        <p>Supported image hosts: Imgur, PostImg, ImageBin, Discord CDN, Reddit, and more.</p>
        <p>For best ad-blocker compatibility, avoid direct CDN links when possible.</p>
      </div>
    </div>
  )
}