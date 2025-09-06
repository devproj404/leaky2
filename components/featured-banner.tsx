import Link from "next/link"

interface FeaturedBannerProps {
  title: string
  subtitle: string
  color: "blue" | "pink" | "hot-pink"
  ctaText?: string
}

export function FeaturedBanner({ title, subtitle, color, ctaText }: FeaturedBannerProps) {
  const getBgColor = () => {
    switch (color) {
      case "blue":
        return "bg-gradient-to-br from-blue-900/40 to-black border border-blue-900/50"
      case "pink":
        return "bg-gradient-to-br from-pink-900/40 to-black border border-pink-900/50"
      case "hot-pink":
        return "bg-gradient-to-br from-rose-900/40 to-black border border-rose-900/50"
      default:
        return "bg-gradient-to-br from-gray-800/40 to-black border border-gray-800/50"
    }
  }

  const getAccentColor = () => {
    switch (color) {
      case "blue":
        return "text-blue-400"
      case "pink":
        return "text-pink-400"
      case "hot-pink":
        return "text-rose-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <Link href="#" className="block group">
      <div
        className={`${getBgColor()} p-6 rounded-lg h-full flex flex-col justify-center items-center text-center min-h-[180px] backdrop-blur-sm transition duration-300 group-hover:border-opacity-100 relative overflow-hidden`}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-pink-glow transition-opacity duration-500"></div>
        <div className="relative z-10">
          <h3 className={`${getAccentColor()} text-lg font-bold mb-2`}>{title}</h3>
          <p className="text-sm text-gray-300 mb-4">{subtitle}</p>
          {ctaText && (
            <span className="text-xs font-medium px-3 py-1 bg-black/50 border border-pink-900/50 rounded-full group-hover:bg-pink-900/20 transition">
              {ctaText}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
