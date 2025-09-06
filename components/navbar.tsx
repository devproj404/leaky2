"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Search,
  Menu,
  User,
  X,
  Grid,
  ShoppingBag,
  FileText,
  ChevronDown,
  ChevronRight,
  Send,
  Loader2,
  Shield,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ExternalImage } from "./external-image"
import type { Content } from "@/lib/content-service"
import { AuthModal } from "./auth-modal"
import { useAuth } from "@/lib/auth-context"
import { UserProfile } from "./user-profile"


// Legal pages data
const legalPages = [
  {
    name: "Terms of Service",
    href: "/legal/tos",
    description: "Rules and guidelines for using the platform",
  },
  {
    name: "Privacy Policy",
    href: "/legal/privacy",
    description: "How we handle and protect your data",
  },
  {
    name: "DMCA",
    href: "/legal/dmca",
    description: "Copyright and content removal procedures",
  },
  {
    name: "Legal Compliance",
    href: "/legal/legal-compliance",
    description: "Our commitment to following regulations",
  },
]

export function Navbar() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Content[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const toggleMobileCategory = (category: string) => {
    if (mobileExpandedCategory === category) {
      setMobileExpandedCategory(null)
    } else {
      setMobileExpandedCategory(category)
    }
  }


  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Search functionality
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true)
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
          const data = await response.json()
          setSearchResults(data.results || [])
          setShowDropdown(true)
        } catch (error) {
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Redirect to search page with query parameter
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowDropdown(false)
      setIsOpen(false) // Close mobile menu if open
    }
  }

  return (
    <>
      <header className="border-b border-pink-900/30 backdrop-blur-sm bg-black/80 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-pink-400 hover:text-pink-300 hover:bg-pink-950/30"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] bg-black border-pink-900/30 p-0">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-pink-900/30">
                      <Link
                        href="/"
                        className="flex items-center gap-2 font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600"
                        onClick={() => setIsOpen(false)}
                      >
                        X
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-pink-400 hover:text-pink-300 hover:bg-pink-950/30"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="p-4 border-b border-pink-900/30">
                      <form onSubmit={handleSearch} className="relative">
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-black border border-pink-900/50 text-gray-200 pl-10 pr-4 py-2 rounded-full w-full focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2">
                          {isSearching ? (
                            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </form>
                      
                      {/* Mobile Search Results */}
                      {(searchResults.length > 0 || isSearching) && searchQuery.trim().length >= 2 && (
                        <div className="mt-4 bg-black/50 border border-pink-900/50 rounded-lg overflow-hidden">
                          {isSearching ? (
                            <div className="p-4 text-center">
                              <Loader2 className="h-5 w-5 text-pink-400 animate-spin mx-auto" />
                              <p className="text-sm text-gray-400 mt-2">Searching...</p>
                            </div>
                          ) : searchResults.length > 0 ? (
                            <div className="py-2 max-h-[300px] overflow-y-auto">
                              {searchResults.slice(0, 5).map((result) => (
                                <Link
                                  key={result.id}
                                  href={`/${result.category?.slug || 'content'}/${result.slug}`}
                                  className="flex items-center gap-3 p-3 hover:bg-pink-950/20 transition-colors border-b border-pink-900/20 last:border-0"
                                  onClick={() => {
                                    setShowDropdown(false)
                                    setIsOpen(false)
                                    setSearchQuery('')
                                  }}
                                >
                                  <div className="w-12 h-12 relative rounded overflow-hidden flex-shrink-0">
                                    <ExternalImage
                                      src={result.image_url || '/placeholder.svg'}
                                      alt={result.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-200 truncate text-sm">{result.title}</h4>
                                    <p className="text-xs text-gray-400 truncate">{result.category?.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                      <span>{result.views?.toLocaleString() || 0} views</span>
                                      {result.is_premium && <span className="text-amber-400">PREMIUM</span>}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center">
                              <p className="text-sm text-gray-400">No results found</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <nav className="flex-1 overflow-auto py-4">
                      <ul className="space-y-1 px-2">
                        <li>
                          <Link
                            href="/"
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:text-pink-400 hover:bg-pink-950/20 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="w-5 h-5 flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4"
                              >
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                              </svg>
                            </span>
                            <span>Home</span>
                          </Link>
                        </li>
                        {/* Trending Link - Mobile */}
                        <li>
                          <Link
                            href="/trending"
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:text-pink-400 hover:bg-pink-950/20 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="w-5 h-5 flex items-center justify-center">
                              <TrendingUp className="w-4 h-4" />
                            </span>
                            <span>Trending</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/categories"
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:text-pink-400 hover:bg-pink-950/20 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="w-5 h-5 flex items-center justify-center">
                              <Grid className="w-4 h-4" />
                            </span>
                            <span>Categories</span>
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/shop"
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:text-pink-400 hover:bg-pink-950/20 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="w-5 h-5 flex items-center justify-center">
                              <ShoppingBag className="w-4 h-4" />
                            </span>
                            <span>Shop</span>
                          </Link>
                        </li>
                        <li>
                          <button
                            className="flex items-center justify-between w-full gap-3 px-3 py-2 rounded-md text-gray-300 hover:text-pink-400 hover:bg-pink-950/20 transition-colors"
                            onClick={() => toggleMobileCategory("legal")}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-5 h-5 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                              </span>
                              <span>TOS & Privacy</span>
                            </div>
                            {mobileExpandedCategory === "legal" ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          {mobileExpandedCategory === "legal" && (
                            <ul className="pl-8 mt-1 space-y-1">
                              {legalPages.map((page) => (
                                <li key={page.name}>
                                  <Link
                                    href={page.href}
                                    className="flex flex-col px-3 py-2 rounded-md text-gray-400 hover:text-pink-400 hover:bg-pink-950/20 transition-colors text-sm"
                                    onClick={() => setIsOpen(false)}
                                  >
                                    <span>{page.name}</span>
                                    <span className="text-xs text-gray-500">{page.description}</span>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                        <li>
                          <Link
                            href="/premium"
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-amber-400 hover:text-amber-300 hover:bg-amber-900/20 transition-colors"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="w-5 h-5 flex items-center justify-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4"
                              >
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </span>
                            <span>Premium</span>
                          </Link>
                        </li>
                        {/* Admin Panel Link - Mobile */}
                        {isAdmin && (
                          <li>
                            <Link
                              href="/admin"
                              className="flex items-center gap-3 px-3 py-2 rounded-md text-green-400 hover:text-green-300 hover:bg-green-900/20 transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              <span className="w-5 h-5 flex items-center justify-center">
                                <Shield className="w-4 h-4" />
                              </span>
                              <span>Admin Panel</span>
                            </Link>
                          </li>
                        )}
                      </ul>
                    </nav>
                    <div className="p-4 border-t border-pink-900/30 space-y-3">
                      <Link
                        href="https://t.me/x"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#0088cc] hover:bg-[#0077b5] text-white py-2 px-4 rounded-md transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        <Send className="w-4 h-4" />
                        <span>Join Telegram</span>
                      </Link>
                      {user ? (
                        <Link
                          href="/profile"
                          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white py-2 px-4 rounded-md transition-colors shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                      ) : (
                        <button
                          className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 text-white py-2 px-4 rounded-md transition-colors shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                          onClick={() => {
                            setIsOpen(false)
                            setIsAuthModalOpen(true)
                          }}
                        >
                          <User className="w-4 h-4" />
                          <span>Member Area</span>
                        </button>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <Link
                href="/"
                className="flex items-center gap-2 font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600"
              >
                X
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link href="/" className="text-sm font-medium hover:text-pink-400 transition">
                  Home
                </Link>
                {/* Trending Link - Desktop */}
                <Link
                  href="/trending"
                  className="text-sm font-medium hover:text-pink-400 transition flex items-center gap-1"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Trending
                </Link>
                <Link href="/categories" className="text-sm font-medium hover:text-pink-400 transition">
                  Categories
                </Link>
                <Link href="/shop" className="text-sm font-medium hover:text-pink-400 transition">
                  Shop
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-1 text-sm font-medium hover:text-pink-400 transition py-4">
                    TOS & Privacy
                    <ChevronDown className="w-4 h-4 opacity-70" />
                  </button>
                  <div className="absolute top-full left-0 pt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-black border border-pink-900/50 rounded-lg shadow-lg shadow-pink-900/20 overflow-hidden">
                      <div className="py-2">
                        {legalPages.map((page) => (
                          <Link
                            key={page.name}
                            href={page.href}
                            className="block px-4 py-3 text-sm text-gray-300 hover:bg-pink-950/30 hover:text-pink-400 transition-colors border-b border-pink-900/20 last:border-0"
                          >
                            <div className="font-medium">{page.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">{page.description}</div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Link href="/premium" className="text-sm font-medium text-amber-400 hover:text-amber-300 transition">
                  Premium
                </Link>
                {/* Admin Panel Link - Desktop */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-green-400 hover:text-green-300 transition flex items-center gap-1"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Panel
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div ref={searchRef} className="relative hidden md:block">
                <form onSubmit={handleSearch} className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchQuery.trim().length >= 2) {
                        setShowDropdown(true)
                      }
                    }}
                    className="bg-black border border-pink-900/50 text-gray-200 pl-10 pr-4 py-2 rounded-full w-[200px] focus:w-[300px] focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500 transition-all duration-300"
                  />
                  <button type="submit" className="absolute left-3">
                    {isSearching ? (
                      <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </form>

                {/* Search Results Dropdown */}
                {showDropdown && (searchResults.length > 0 || isSearching) && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-pink-900/50 rounded-lg shadow-lg shadow-pink-900/20 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <Loader2 className="h-5 w-5 text-pink-400 animate-spin mx-auto" />
                        <p className="text-sm text-gray-400 mt-2">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="py-2">
                        {searchResults.slice(0, 5).map((result) => (
                          <Link
                            key={result.id}
                            href={`/${result.category?.slug || "content"}/${result.slug}`}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-pink-950/30 transition-colors"
                            onClick={() => setShowDropdown(false)}
                          >
                            <div className="w-10 h-10 relative flex-shrink-0 rounded overflow-hidden">
                              <ExternalImage src={result.image_url} alt={result.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-200 truncate">{result.title}</p>
                              <p className="text-xs text-gray-400">
                                {result.category?.name || "Content"} • {result.views} views
                              </p>
                            </div>
                          </Link>
                        ))}
                        {searchResults.length > 5 && (
                          <div className="px-4 py-2 border-t border-pink-900/30">
                            <Link
                              href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                              className="text-sm text-pink-400 hover:text-pink-300 transition-colors flex items-center justify-center gap-1"
                              onClick={() => setShowDropdown(false)}
                            >
                              View all {searchResults.length} results
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-400">No results found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-pink-400 hover:text-pink-300 hover:bg-pink-950/30"
                onClick={() => {
                  // Open mobile menu and focus search
                  setIsOpen(true)
                  // Focus search input after menu opens
                  setTimeout(() => {
                    const mobileSearchInput = document.querySelector('.mobile-search-input') as HTMLInputElement
                    if (mobileSearchInput) {
                      mobileSearchInput.focus()
                    }
                  }, 100)
                }}
              >
                <Search className="h-5 w-5" />
              </Button>

              <Link href="https://t.me/x" target="_blank" rel="noopener noreferrer" className="hidden md:flex">
                <Button
                  size="icon"
                  className="bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-full w-10 h-10 flex items-center justify-center"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </Link>

              {authLoading ? (
                <div className="w-10 h-10 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-pink-400 animate-spin" />
                </div>
              ) : user ? (
                <UserProfile />
              ) : (
                <div className="hidden md:block">
                  <Button
                    className="bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                    onClick={() => setIsAuthModalOpen(true)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Member Area
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
