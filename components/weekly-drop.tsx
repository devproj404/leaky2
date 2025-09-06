"use client"

import Link from "next/link"
import { ExternalImage } from "./external-image"

interface WeeklyDropProps {
  thumbnailUrl: string
  link: string
}

export function WeeklyDrop({ thumbnailUrl, link }: WeeklyDropProps) {
  return (
    <Link href={link} target="_blank" rel="noopener noreferrer" className="block group">
      <div className="relative rounded-xl overflow-hidden border border-pink-900/30 hover:border-pink-500/50 transition-all duration-300">
        <div className="relative aspect-[16/9]">
          {thumbnailUrl ? (
            <>
              <ExternalImage src={thumbnailUrl} alt="Weekly Drop" fill className="object-cover" />
              {/* Simple overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-pink-900/20 to-purple-900/20 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Thumbnail</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}