"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  Loader2,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Pencil,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ImageIcon,
  LinkIcon,
  Info,
  GripVertical,
  MoveVertical,
  Calendar,
  FileIcon,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ExternalImage } from "@/components/external-image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"
import { KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

// Update the ContentItem interface to include scheduling fields
interface ContentItem {
  id: number
  title: string
  slug: string
  description: string
  file_size: string
  views?: number
  downloads?: number
  image_url: string
  file_url?: string
  created_at: string
  updated_at: string
  category_id: number
  is_premium: boolean
  preview_images?: string[]
  ranking?: number
  free_link?: string
  premium_link?: string
  is_scheduled?: boolean
  publish_at?: string
  is_published?: boolean
  category?: {
    id: number
    name: string
    slug: string
    description: string
  }
}

// Add this interface after the ContentItem interface
interface SortableContentItemProps {
  item: ContentItem
  isRankingMode: boolean
  onEdit: (item: ContentItem) => void
  onDelete: (item: ContentItem) => void
  onView: (item: ContentItem) => void
}

// Add this component after the existing interfaces
function SortableContentItem({ item, isRankingMode, onEdit, onDelete, onView }: SortableContentItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = isRankingMode
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
      }
    : {}

  // Determine content status based on scheduling and publication status
  const getContentStatus = () => {
    if (item.is_scheduled) {
      return {
        label: "Scheduled",
        className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      }
    } else if (item.is_published) {
      return {
        label: "Published",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
      }
    } else {
      return {
        label: "Draft",
        className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      }
    }
  }

  const status = getContentStatus()

  return (
    <div
      ref={isRankingMode ? setNodeRef : undefined}
      style={style}
      className={`bg-black/40 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {isRankingMode && (
          <div
            {...attributes}
            {...listeners}
            className="flex items-center justify-center cursor-grab active:cursor-grabbing p-2 hover:bg-gray-800/50 rounded"
          >
            <GripVertical className="h-5 w-5 text-gray-500" />
          </div>
        )}

        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
          {item.image_url ? (
            <ExternalImage
              src={item.image_url}
              alt={item.title}
              width={192}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <ImageIcon className="h-8 w-8 text-gray-600" />
            </div>
          )}
        </div>

        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium text-white">{item.title}</h3>
                <Badge className={`${status.className} text-xs`}>{status.label}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="capitalize">{item.category?.name || "Unknown"}</span>
                <span>•</span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
                {item.is_premium && (
                  <>
                    <span>•</span>
                    <span className="text-pink-400">Premium</span>
                  </>
                )}
                {isRankingMode && (
                  <>
                    <span>•</span>
                    <span className="text-cyan-400">Rank: {item.ranking || 0}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isRankingMode && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-800 hover:border-blue-700 hover:bg-blue-900/20 text-gray-300"
                    onClick={() => onEdit(item)}
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-800 hover:border-red-700 hover:bg-red-900/20 text-gray-300"
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-800 hover:border-green-700 hover:bg-green-900/20 text-gray-300"
                    onClick={() => onView(item)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                  </Button>
                </>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              <span className="truncate max-w-[200px]">{item.slug}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileIcon className="h-3 w-3" />
              <span>{item.file_size}</span>
            </div>
            <div>Downloads: {item.downloads || 0}</div>
            {item.preview_images && item.preview_images.length > 0 && (
              <div className="flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                <span>{item.preview_images.length} preview images</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface Category {
  id: number
  name: string
  slug: string
  description: string
}

// Add this utility function after the imports and before the interfaces
const cleanupPreviewUrls = (urls: string[]): string[] => {
  return urls
    .map(url => {
      if (!url || !url.trim()) return null
      const cleaned = extractImageUrlsFromBBCode(url.trim())
      return cleaned.length > 0 ? cleaned[0] : (url.trim().startsWith('http') ? url.trim() : null)
    })
    .filter((url): url is string => url !== null)
}

const transformPixhostUrl = (url: string): string => {
  // Transform pixhost URLs: change t1 to img1 and thumbs to images
  if (url.includes('pixhost.to')) {
    return url
      // Handle various pixhost URL patterns
      .replace(/https?:\/\/t1\.pixhost\.to\/thumbs\//g, 'https://img1.pixhost.to/images/')
      .replace(/\/\/t1\.pixhost\.to\/thumbs\//g, '//img1.pixhost.to/images/')
      .replace(/t1\.pixhost\.to\/thumbs/g, 'img1.pixhost.to/images')
      // Handle cases where there might be different subdomains
      .replace(/\/t(\d+)\.pixhost\.to\/thumbs\//g, '/img$1.pixhost.to/images/')
      .replace(/t(\d+)\.pixhost\.to\/thumbs/g, 'img$1.pixhost.to/images')
  }
  return url
}

const extractImageUrlsFromBBCode = (bbcodeText: string): string[] => {
  const urls: string[] = []
  
  // First, try to extract URLs from [img] BBCode tags
  const imgRegex = /\[img\](.*?)\[\/img\]/g
  let match
  
  while ((match = imgRegex.exec(bbcodeText)) !== null) {
    if (match[1] && match[1].trim()) {
      const transformedUrl = transformPixhostUrl(match[1].trim())
      urls.push(transformedUrl)
    }
  }
  
  // Second, try to extract URLs from [url] BBCode tags (like pixhost show URLs)
  const urlRegex = /\[url=(.*?)\]/g
  while ((match = urlRegex.exec(bbcodeText)) !== null) {
    if (match[1] && match[1].trim()) {
      const url = match[1].trim()
      // Convert pixhost show URLs to image URLs
      if (url.includes('pixhost.to/show/')) {
        // Extract the image ID and convert to image URL
        const showMatch = url.match(/pixhost\.to\/show\/(\d+)\/([^\/\]]+)/)
        if (showMatch) {
          const [, folderId, filename] = showMatch
          const imageUrl = `https://img1.pixhost.to/images/${folderId}/${filename}`
          const transformedUrl = transformPixhostUrl(imageUrl)
          urls.push(transformedUrl)
        }
      } else if (url.includes('pixhost.to') || url.startsWith('http://') || url.startsWith('https://')) {
        // For other URLs, apply transformation and add
        const transformedUrl = transformPixhostUrl(url)
        urls.push(transformedUrl)
      }
    }
  }
  
  // Also check for standalone [url] tags without = (like [url]https://example.com[/url])
  const standaloneUrlRegex = /\[url\](.*?)\[\/url\]/g
  while ((match = standaloneUrlRegex.exec(bbcodeText)) !== null) {
    if (match[1] && match[1].trim()) {
      const url = match[1].trim()
      if (url.includes('pixhost.to/show/')) {
        // Convert pixhost show URLs to image URLs
        const showMatch = url.match(/pixhost\.to\/show\/(\d+)\/([^\/\]]+)/)
        if (showMatch) {
          const [, folderId, filename] = showMatch
          const imageUrl = `https://img1.pixhost.to/images/${folderId}/${filename}`
          const transformedUrl = transformPixhostUrl(imageUrl)
          urls.push(transformedUrl)
        }
      } else if (url.includes('pixhost.to') || url.startsWith('http://') || url.startsWith('https://')) {
        const transformedUrl = transformPixhostUrl(url)
        urls.push(transformedUrl)
      }
    }
  }
  
  // If no BBCode tags found, try to extract plain URLs (one per line or space-separated)
  if (urls.length === 0) {
    const lines = bbcodeText.split(/[\n\r]+/)
    for (const line of lines) {
      const trimmed = line.trim()
      // Check if line looks like a URL
      if (trimmed && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('pixhost.to'))) {
        // Handle pixhost show URLs
        if (trimmed.includes('pixhost.to/show/')) {
          const showMatch = trimmed.match(/pixhost\.to\/show\/(\d+)\/([^\/\s]+)/)
          if (showMatch) {
            const [, folderId, filename] = showMatch
            const imageUrl = `https://img1.pixhost.to/images/${folderId}/${filename}`
            const transformedUrl = transformPixhostUrl(imageUrl)
            urls.push(transformedUrl)
          }
        } else {
          const transformedUrl = transformPixhostUrl(trimmed)
          urls.push(transformedUrl)
        }
      }
    }
  }
  
  // Also try to extract space-separated URLs from a single line
  if (urls.length === 0) {
    const spaceUrls = bbcodeText.split(/\s+/).filter(part => 
      part.trim() && (part.startsWith('http://') || part.startsWith('https://') || part.includes('pixhost.to'))
    )
    for (const url of spaceUrls) {
      if (url.includes('pixhost.to/show/')) {
        const showMatch = url.match(/pixhost\.to\/show\/(\d+)\/([^\/\s]+)/)
        if (showMatch) {
          const [, folderId, filename] = showMatch
          const imageUrl = `https://img1.pixhost.to/images/${folderId}/${filename}`
          const transformedUrl = transformPixhostUrl(imageUrl)
          urls.push(transformedUrl)
        }
      } else {
        const transformedUrl = transformPixhostUrl(url.trim())
        urls.push(transformedUrl)
      }
    }
  }

  // Remove duplicates
  return [...new Set(urls)]
}

export default function ContentManagementPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAuth()
  const [content, setContent] = useState<ContentItem[]>([])
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([])
  const [isLoadingContent, setIsLoadingContent] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("ranking")
  const [categories, setCategories] = useState<Category[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentItem, setCurrentItem] = useState<ContentItem | null>(null)
  const [formStatus, setFormStatus] = useState<{
    loading: boolean
    success?: string
    error?: string
  }>({
    loading: false,
  })
  const [error, setError] = useState<string | null>(null)

  const [newContent, setNewContent] = useState({
    title: "",
    slug: "",
    category: "",
    description: "",
    image_url: "",
    download_url: "",
    free_link: "",
    premium_link: "",
    file_size: "0 KB", // Default file size
    is_premium: false,
    preview_images: [] as string[],
    is_scheduled: false,
    publish_at: "",
    is_published: true,
  })

  // Add these state variables inside the ContentManagementPage component
  const [isRankingMode, setIsRankingMode] = useState(false)
  const [isSavingRanking, setIsSavingRanking] = useState(false)
  const [rankingSuccess, setRankingSuccess] = useState<string | null>(null)
  const [rankingError, setRankingError] = useState<string | null>(null)
  const [selectedScheduledContent, setSelectedScheduledContent] = useState<string[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [bulkImageInput, setBulkImageInput] = useState("")
  const [editBulkImageInput, setEditBulkImageInput] = useState("")

  // Add this function inside the ContentManagementPage component
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Add this function inside the ContentManagementPage component
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setFilteredContent((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id)
        const newIndex = currentItems.findIndex((item) => item.id === over.id)

        // Create a new array with the updated order
        const newItems = arrayMove(currentItems, oldIndex, newIndex)

        // Update the ranking values based on the new positions
        return newItems.map((item, index) => ({
          ...item,
          ranking: index + 1,
        }))
      })
    }
  }

  // Add this function inside the ContentManagementPage component
  const handleSaveRanking = async () => {
    setIsSavingRanking(true)
    setRankingError(null)
    setRankingSuccess(null)

    try {
      const supabase = createClientComponentClient()

      // Prepare the items for the API
      const items = filteredContent.map((item, index) => ({
        id: item.id,
        ranking: index + 1,
      }))

      // Update rankings in the database
      const updates = items.map(({ id, ranking }) => {
        return supabase.from("content").update({ ranking }).eq("id", id)
      })

      await Promise.all(updates)

      setRankingSuccess("Content order updated successfully!")
      toast({
        title: "Success",
        description: "Content order has been updated",
        variant: "default",
      })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setRankingSuccess(null)
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update content order"
      setRankingError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSavingRanking(false)
    }
  }

  const handlePublishScheduled = async () => {
    setIsPublishing(true)
    try {
      const response = await fetch("/api/admin/publish-scheduled", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentIds: selectedScheduledContent.length > 0 ? selectedScheduledContent : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to publish scheduled content")
      }

      toast({
        title: "Success",
        description: `Published ${result.publishedCount} scheduled content items`,
      })

      // Refresh content list
      await fetchContent()
      // Clear selection after publishing
      setSelectedScheduledContent([])
    } catch (error) {
      console.error("Error publishing scheduled content:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to publish scheduled content",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  // Check if user is authenticated and admin
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/?authRequired=true")
      return
    }

    // In development, allow access even if not admin
    if (!isAdmin && process.env.NODE_ENV === "production") {
      router.push("/")
    } else {
      fetchContent().catch((err) => {
        console.error("Error in fetchContent:", err)
        setError("Failed to load content. Please try again later.")
        setIsLoadingContent(false)
      })
    }
  }, [user, isAdmin, isLoading, router])

  // Add these variables at the top of the component
  const maxFetchRetries = 3
  const [fetchRetryCount, setFetchRetryCount] = useState(0)

  // Update the fetchContent function to include retry logic
  const fetchContent = async () => {
    setIsLoadingContent(true)
    setIsRefreshing(true)
    try {
      const supabase = createClientComponentClient()

      // Fetch categories first
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name, slug, description")

      if (categoriesError) {
        throw new Error(`Error fetching categories: ${categoriesError.message}`)
      }

      // Fetch content with category information - use * to get all available columns
      // Add a timeout promise
      const contentPromise = supabase
        .from("content")
        .select(`
        *,
        category:categories(id, name, slug, description)
      `)
        .order("created_at", { ascending: false })

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Content query timed out")), 10000) // Reduced timeout to 10 seconds
      })

      const { data: contentData, error: contentError } = await Promise.race([
        contentPromise,
        timeoutPromise.then(() => ({ data: null, error: new Error("Query timed out") })),
      ])

      if (contentError) {
        throw new Error(`Error fetching content: ${contentError.message}`)
      }

      // Extract unique categories
      setCategories(categoriesData || [])

      // Format the content data with default values for missing columns
      const formattedContent =
        contentData?.map((item) => ({
          ...item,
          preview_images: item.preview_images || [],
        })) || []

      setContent(formattedContent)
      setFilteredContent(formattedContent)
      setFetchRetryCount(0) // Reset retry count on success
    } catch (error) {
      console.error("Error fetching content:", error)

      // Implement retry logic
      if (fetchRetryCount < maxFetchRetries) {
        setFetchRetryCount((prev) => prev + 1)
        const retryDelay = Math.pow(2, fetchRetryCount) * 1000 // Exponential backoff

        toast({
          title: "Connection issue",
          description: `Retrying in ${retryDelay / 1000} seconds...`,
          variant: "destructive",
        })

        setTimeout(() => {
          fetchContent()
        }, retryDelay)
      } else {
        toast({
          title: "Error",
          description: "Failed to load content after multiple attempts. Please try again later.",
          variant: "destructive",
        })
        setError("Database connection timeout. Please try again later.")
      }

      throw error // Re-throw to be caught by the caller
    } finally {
      setIsLoadingContent(false)
      setIsRefreshing(false)
    }
  }

  // Add this function after fetchContent
  const fetchContentFallback = async () => {
    setIsLoadingContent(true)
    try {
      const supabase = createClientComponentClient()

      // Fetch a limited set of content
      const { data: contentData, error: contentError } = await supabase
        .from("content")
        .select(`
        id, title, description, file_size, image_url, is_premium, slug, is_scheduled, is_published, created_at,
        category:categories(id, name, slug)
      `)
        .order("created_at", { ascending: false })
        .limit(10) // Fetch only 10 items

      if (contentError) {
        throw new Error(`Error fetching limited content: ${contentError.message}`)
      }

      // Format the content data
      const formattedContent =
        contentData?.map((item) => ({
          ...item,
          preview_images: [],
        })) || []

      setContent(formattedContent as any)
      setFilteredContent(formattedContent as any)

      toast({
        title: "Limited content loaded",
        description: "Only showing recent content due to connection issues.",
        variant: "destructive",
      })
    } catch (finalError) {
      console.error("Even fallback content fetch failed:", finalError)
      setError("Unable to load content. Please try again later.")
    } finally {
      setIsLoadingContent(false)
    }
  }

  // Apply filters and sorting
  useEffect(() => {
    if (!content || content.length === 0) return

    let filtered = [...content]

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category?.slug === categoryFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      switch (statusFilter) {
        case "published":
          filtered = filtered.filter((item) => item.is_published && !item.is_scheduled)
          break
        case "scheduled":
          filtered = filtered.filter((item) => item.is_scheduled)
          break
        case "draft":
          filtered = filtered.filter((item) => !item.is_published && !item.is_scheduled)
          break
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category?.name?.toLowerCase().includes(query),
      )
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
      case "title-asc":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "title-desc":
        filtered.sort((a, b) => b.title.localeCompare(a.title))
        break
      case "downloads":
        filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
        break
      case "ranking":
      default:
        filtered.sort((a, b) => {
          // Sort by ranking first (nulls last)
          const rankA = a.ranking ?? Number.MAX_SAFE_INTEGER
          const rankB = b.ranking ?? Number.MAX_SAFE_INTEGER

          if (rankA !== rankB) {
            return rankA - rankB
          }

          // If rankings are equal, sort by creation date (newest first)
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        break
    }

    setFilteredContent(filtered)
  }, [content, categoryFilter, statusFilter, searchQuery, sortBy])

  // Find the handleAddContent function and replace it with this updated version
  // that removes fields that might not exist in the database schema

  // Replace the handleAddContent function with this implementation
  const handleAddContent = async () => {
    setFormStatus({ loading: true })

    try {
      // Validate required fields
      if (!newContent.title || !newContent.category) {
        throw new Error("Title and category are required")
      }

      const supabase = createClientComponentClient()

      // Find the category ID from the selected category slug
      const selectedCategory = categories.find((cat) => cat.slug === newContent.category)
      if (!selectedCategory) {
        throw new Error("Selected category not found")
      }

      // Get the highest ranking in the category to place the new content at the end
      const { data: highestRanked, error: rankError } = await supabase
        .from("content")
        .select("ranking")
        .eq("category_id", selectedCategory.id)
        .order("ranking", { ascending: false })
        .limit(1)
        .single()

      const nextRank = highestRanked?.ranking ? highestRanked.ranking + 1 : 1

      // Prepare the content data - include all necessary fields
      const contentData = {
        title: newContent.title,
        slug: newContent.slug || generateSlug(newContent.title),
        description: newContent.description,
        image_url: newContent.image_url,
        free_link: newContent.free_link,
        premium_link: newContent.premium_link,
        file_size: newContent.file_size, // Remove the default "0 KB"
        category_id: selectedCategory.id,
        is_premium: newContent.is_premium,
        preview_images: newContent.preview_images.filter((url) => url),
        ranking: nextRank, // Set the new content at the end of the list
        is_scheduled: newContent.is_scheduled,
        is_published: newContent.is_scheduled ? false : newContent.is_published,
        publish_at: newContent.is_scheduled && newContent.publish_at ? (() => {
          // Create a date object from the local datetime string
          const localDate = new Date(newContent.publish_at + ':00')
          // Convert to UTC for storage
          return localDate.toISOString()
        })() : null,
      }

      // Insert the new content
      const { data, error } = await supabase.from("content").insert(contentData).select()

      if (error) {
        throw new Error(`Error adding content: ${error.message}`)
      }

      // Refresh the content list
      await fetchContent()

      // Reset form
      setNewContent({
        title: "",
        slug: "",
        category: "",
        description: "",
        image_url: "",
        download_url: "",
        free_link: "",
        premium_link: "",
        file_size: "0 KB",
        is_premium: false,
        preview_images: [],
        is_scheduled: false,
        publish_at: "",
        is_published: true,
      })

      setFormStatus({
        loading: false,
        success: "Content added successfully!",
      })

      // Close dialog after a delay
      setTimeout(() => {
        setShowAddDialog(false)
        setFormStatus({ loading: false })
      }, 1500)
    } catch (error) {
      console.error("Error adding content:", error)
      setFormStatus({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to add content. Please try again.",
      })
    }
  }

  // Also update the handleEditContent function to avoid the same issue

  // Replace the handleEditContent function with this implementation
  const handleEditContent = async () => {
    if (!currentItem) return

    setFormStatus({ loading: true })

    try {
      const supabase = createClientComponentClient()

      // Find the category ID from the selected category slug
      let categoryId = currentItem.category_id
      if (typeof currentItem.category === "string") {
        const selectedCategory = categories.find((cat) => cat.slug === currentItem.category as any)
        if (!selectedCategory) {
          throw new Error("Selected category not found")
        }
        categoryId = selectedCategory.id
      }

      // Prepare the content data - include all necessary fields
      const contentData = {
        title: currentItem.title,
        slug: currentItem.slug,
        description: currentItem.description,
        image_url: currentItem.image_url,
        free_link: currentItem.free_link,
        premium_link: currentItem.premium_link,
        file_size: currentItem.file_size, // Remove the default "0 KB"
        category_id: categoryId,
        is_premium: currentItem.is_premium,
        preview_images: currentItem.preview_images?.filter((url) => url) || [],
        updated_at: new Date().toISOString(),
        is_scheduled: currentItem.is_scheduled,
        is_published: currentItem.is_scheduled ? false : currentItem.is_published,
        publish_at: currentItem.is_scheduled && currentItem.publish_at ? (() => {
          // Create a date object from the local datetime string
          const localDate = new Date(currentItem.publish_at + ':00')
          // Convert to UTC for storage
          return localDate.toISOString()
        })() : null,
      }

      // Update the content
      const { error } = await supabase.from("content").update(contentData).eq("id", currentItem.id)

      if (error) {
        throw new Error(`Error updating content: ${error.message}`)
      }

      // Refresh the content list
      await fetchContent()

      setFormStatus({
        loading: false,
        success: "Content updated successfully!",
      })

      // Close dialog after a delay
      setTimeout(() => {
        setShowEditDialog(false)
        setFormStatus({ loading: false })
      }, 1500)
    } catch (error) {
      console.error("Error updating content:", error)
      setFormStatus({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to update content. Please try again.",
      })
    }
  }

  // Replace the handleDeleteContent function with this implementation
  const handleDeleteContent = async () => {
    if (!currentItem) return

    setFormStatus({ loading: true })

    try {
      const supabase = createClientComponentClient()

      // Delete the content
      const { error } = await supabase.from("content").delete().eq("id", currentItem.id)

      if (error) {
        throw new Error(`Error deleting content: ${error.message}`)
      }

      // Refresh the content list
      await fetchContent()

      setFormStatus({
        loading: false,
        success: "Content deleted successfully!",
      })

      // Close dialog after a delay
      setTimeout(() => {
        setShowDeleteDialog(false)
        setFormStatus({ loading: false })
      }, 1500)
    } catch (error) {
      console.error("Error deleting content:", error)
      setFormStatus({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to delete content. Please try again.",
      })
    }
  }

  // Add a new function to fix content status
  // Add this function after handleDeleteContent

  const handleFixContentStatus = async (contentId: number) => {
    try {
      setIsLoadingContent(true)

      const response = await fetch("/api/admin/fix-content-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to fix content status")
      }

      // Refresh content list
      await fetchContent()
      toast({
        title: "Success",
        description: "Content status fixed successfully",
      })
    } catch (error) {
      console.error("Error fixing content status:", error)
      toast({
        title: "Error",
        description: `Failed to fix content status: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsLoadingContent(false)
    }
  }

  // Add this function to handle selection toggling
  const toggleContentSelection = (contentId: string) => {
    setSelectedScheduledContent((prev) =>
      prev.includes(contentId) ? prev.filter((id) => id !== contentId) : [...prev, contentId],
    )
  }

  // Replace the existing publishScheduledContent function with this one
  const publishScheduledContent = async () => {
    setIsPublishing(true)
    try {
      const supabase = createClientComponentClient()

      // Check if Supabase is properly initialized
      if (!supabase) {
        throw new Error("Failed to initialize Supabase client")
      }

      const response = await fetch("/api/admin/publish-scheduled", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentIds: selectedScheduledContent.length > 0 ? selectedScheduledContent : undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to publish scheduled content")
      }

      toast({
        title: "Success",
        description: `Published ${result.publishedCount} scheduled content items`,
      })

      // Refresh content list
      fetchContent()
      // Clear selection after publishing
      setSelectedScheduledContent([])
    } catch (error) {
      console.error("Error publishing scheduled content:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to publish scheduled content",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  }

  // Format date for input field
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    
    // Get the local date and time components for display
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    // Return in format YYYY-MM-DDThh:mm (local time)
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // If still loading auth, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // If there's an error, show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="p-2 rounded-full hover:bg-gray-800/50 transition-colors">
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text flex items-center gap-2">
              <FileText className="h-6 w-6 text-pink-500" />
              Content Management
            </h1>
          </div>
        </div>

        <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-red-300 mb-2">Error Loading Content</h3>
          <p className="text-red-400 mb-6">{error}</p>
          <Button
            onClick={() => {
              setError(null)
              fetchContent().catch((err) => {
                console.error("Error in fetchContent retry:", err)
                setError("Failed to load content. Please try again later.")
              })
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const [addFormData, setAddFormData] = useState({
    is_scheduled: false,
  })

  const [editFormData, setEditFormData] = useState({
    is_scheduled: false,
  })

  const scheduledCount = content.filter((item) => item.is_scheduled).length

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const sensorsToUse = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Update the useEffect to use the fallback
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/?authRequired=true")
      return
    }

    // In development, allow access even if not admin
    if (!isAdmin && process.env.NODE_ENV === "production") {
      router.push("/")
    } else {
      fetchContent().catch((err) => {
        console.error("Error in fetchContent:", err)
        if (err.message.includes("timeout") || err.message.includes("connection")) {
          // Try the fallback approach
          fetchContentFallback()
        } else {
          setError("Failed to load content. Please try again later.")
          setIsLoadingContent(false)
        }
      })
    }
  }, [user, isAdmin, isLoading, router])

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-full hover:bg-gray-800/50 transition-colors">
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-pink-500 flex items-center gap-2">
              <FileText className="h-6 w-6 text-pink-500" />
              Content Management
            </h1>
            <p className="text-gray-400 text-sm">Manage all content on your site</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => fetchContent()}
            disabled={isRefreshing}
            className="bg-gray-700 hover:bg-gray-600 text-white"
          >
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>

          <Button
            onClick={publishScheduledContent}
            disabled={isPublishing || scheduledCount === 0}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Publish {selectedScheduledContent.length > 0 ? `Selected (${selectedScheduledContent.length})` : "All"}{" "}
                Scheduled
              </>
            )}
          </Button>

          <Button onClick={() => {
            setShowAddDialog(true)
            setBulkImageInput("")
          }} className="bg-pink-600 hover:bg-pink-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Add New Content
          </Button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="bg-black/40 border border-gray-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-grow">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                  disabled={isRankingMode}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isRankingMode}>
                <SelectTrigger className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isRankingMode}>
                <SelectTrigger className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <Select value={sortBy} onValueChange={setSortBy} disabled={isRankingMode}>
                <SelectTrigger className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="ranking">By Ranking</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                  <SelectItem value="downloads">Most Downloads</SelectItem>
                  <SelectItem value="scheduled">Scheduled Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2 md:justify-end">
            <div className="flex items-center space-x-2">
              <Switch id="ranking-mode" checked={isRankingMode} onCheckedChange={setIsRankingMode} />
              <Label htmlFor="ranking-mode" className="text-gray-300 cursor-pointer">
                Ranking Mode
              </Label>
            </div>

            {isRankingMode && (
              <Button
                onClick={handleSaveRanking}
                disabled={isSavingRanking}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
              >
                {isSavingRanking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <MoveVertical className="mr-2 h-4 w-4" /> Save Order
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {rankingSuccess && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-800/30 rounded-lg flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>{rankingSuccess}</span>
          </div>
        )}

        {rankingError && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>{rankingError}</span>
          </div>
        )}

        {isRankingMode && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg flex items-center gap-2 text-blue-400 text-sm">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>Drag items to reorder them. The order will be saved when you click "Save Order".</span>
          </div>
        )}
      </div>

      {/* Content list */}
      {isLoadingContent ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
        </div>
      ) : filteredContent.length === 0 ? (
        <div className="bg-black/40 border border-gray-800 rounded-xl p-8 text-center">
          <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No content found</h3>
          <p className="text-gray-500 mb-6">No content matches your current filters.</p>
          <Button
            onClick={() => {
              setSearchQuery("")
              setCategoryFilter("all")
              setStatusFilter("all")
              setSortBy("ranking")
            }}
            variant="outline"
            className="border-gray-700 text-gray-300"
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredContent.map((item) => (
            <div
              key={item.id}
              className={`bg-black/40 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-all ${item.is_scheduled ? "border-amber-700/50 bg-amber-950/10" : ""}`}
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 relative">
                  {item.is_scheduled && (
                    <div className="absolute top-0 left-0 z-10">
                      <Checkbox
                        checked={selectedScheduledContent.includes(item.id.toString())}
                        onCheckedChange={() => toggleContentSelection(item.id.toString())}
                        aria-label={`Select ${item.title}`}
                        className="m-2 bg-black/50"
                      />
                    </div>
                  )}
                  {item.image_url ? (
                    <ExternalImage
                      src={item.image_url}
                      alt={item.title}
                      width={192}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <ImageIcon className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                </div>

                <div className="flex-grow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-white">{item.title}</h3>
                        {item.is_scheduled && (
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                            Scheduled
                          </Badge>
                        )}
                        {item.is_published && !item.is_scheduled && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Published
                          </Badge>
                        )}
                        {!item.is_published && !item.is_scheduled && (
                          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30 text-xs">Draft</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span className="capitalize">{item.category?.name || "Unknown"}</span>
                        <span>•</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        {item.is_premium && (
                          <>
                            <span>•</span>
                            <span className="text-pink-400">Premium</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-800 hover:border-blue-700 hover:bg-blue-900/20 text-gray-300"
                        onClick={() => {
                          setCurrentItem(item)
                          setShowEditDialog(true)
                          setEditBulkImageInput("")
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-800 hover:border-red-700 hover:bg-red-900/20 text-gray-300"
                        onClick={() => {
                          setCurrentItem(item)
                          setShowDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-800 hover:border-green-700 hover:bg-green-900/20 text-gray-300"
                        onClick={() => {
                          // Implement view functionality
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" /> View
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-400 mb-3 line-clamp-2">{item.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <LinkIcon className="h-3 w-3" />
                      <span className="truncate max-w-[200px]">{item.slug}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileIcon className="h-3 w-3" />
                      <span>{item.file_size}</span>
                    </div>
                    <div>Downloads: {item.downloads || 0}</div>
                    {item.preview_images && item.preview_images.length > 0 && (
                      <div className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        <span>{item.preview_images.length} preview images</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Content Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open)
        if (!open) {
          setBulkImageInput("")
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Content</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="bg-black/50 border border-gray-800">
              <TabsTrigger value="details" className="data-[state=active]:bg-pink-900/20">
                Basic Details
              </TabsTrigger>
              <TabsTrigger value="media" className="data-[state=active]:bg-pink-900/20">
                Media & Downloads
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-pink-900/20">
                Preview Images
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-pink-900/20">
                Settings
              </TabsTrigger>
              <TabsTrigger value="scheduling" className="data-[state=active]:bg-pink-900/20">
                Scheduling
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newContent.title}
                  onChange={(e) => {
                    setNewContent({
                      ...newContent,
                      title: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }}
                  placeholder="Enter content title"
                  className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={newContent.slug}
                  onChange={(e) => setNewContent({ ...newContent, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                  className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newContent.category}
                  onValueChange={(value) => setNewContent({ ...newContent, category: value })}
                >
                  <SelectTrigger
                    id="category"
                    className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-800">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newContent.description}
                  onChange={(e) => setNewContent({ ...newContent, description: e.target.value })}
                  placeholder="Enter content description"
                  className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300 min-h-[100px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image_url"
                    value={newContent.image_url}
                    onChange={(e) => setNewContent({ ...newContent, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300 flex-grow"
                  />
                  <Button variant="outline" className="border-gray-800 text-gray-300">
                    <ImageIcon className="h-4 w-4 mr-2" /> Browse
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="free_download_url">Free Download URL</Label>
                <Input
                  id="free_download_url"
                  value={newContent.free_link || ""}
                  onChange={(e) => setNewContent({ ...newContent, free_link: e.target.value })}
                  placeholder="https://example.com/free-download.zip"
                  className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="premium_download_url">Premium Download URL</Label>
                <Input
                  id="premium_download_url"
                  value={newContent.premium_link || ""}
                  onChange={(e) => setNewContent({ ...newContent, premium_link: e.target.value })}
                  placeholder="https://example.com/premium-download.zip"
                  className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                />
              </div>

              {newContent.image_url && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
                  <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-900">
                    <ExternalImage
                      src={newContent.image_url}
                      alt="Preview"
                      width={300}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Preview Images</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setNewContent({
                          ...newContent,
                          preview_images: [...newContent.preview_images, ""],
                        })
                      }}
                      className="border-gray-800 text-gray-300"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Image
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const urls = extractImageUrlsFromBBCode(bulkImageInput)
                        if (urls.length > 0) {
                          setNewContent({
                            ...newContent,
                            preview_images: [...newContent.preview_images, ...urls],
                          })
                          setBulkImageInput("")
                          toast({
                            title: "Success",
                            description: `Added ${urls.length} image(s) from BBCode (pixhost URLs auto-transformed)`,
                            variant: "default",
                          })
                        } else {
                          toast({
                            title: "No images found",
                            description: "No valid image URLs found in the BBCode",
                            variant: "destructive",
                          })
                        }
                      }}
                      disabled={!bulkImageInput.trim()}
                      className="border-gray-800 text-gray-300"
                    >
                      <LinkIcon className="h-3.5 w-3.5 mr-1" /> Add from BBCode
                      {bulkImageInput.trim() && (
                        <span className="ml-1 text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                          {extractImageUrlsFromBBCode(bulkImageInput).length}
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const transformedUrls = newContent.preview_images.map(transformPixhostUrl)
                        const changedCount = newContent.preview_images.filter((url, index) => url !== transformedUrls[index]).length
                        
                        if (changedCount > 0) {
                          setNewContent({
                            ...newContent,
                            preview_images: transformedUrls,
                          })
                          toast({
                            title: "Success",
                            description: `Transformed ${changedCount} pixhost URL(s) (t1→img1, thumbs→images)`,
                            variant: "default",
                          })
                        } else {
                          toast({
                            title: "No changes needed",
                            description: "No pixhost URLs found that need transformation",
                            variant: "default",
                          })
                        }
                      }}
                      disabled={newContent.preview_images.length === 0}
                      className="border-gray-800 text-gray-300"
                    >
                      🔧 Fix Pixhost URLs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const cleanedUrls = cleanupPreviewUrls(newContent.preview_images)
                        const removedCount = newContent.preview_images.length - cleanedUrls.length
                        
                        setNewContent({
                          ...newContent,
                          preview_images: cleanedUrls,
                        })
                        toast({
                          title: "URLs Cleaned",
                          description: `Processed all URLs. ${removedCount > 0 ? `Removed ${removedCount} invalid URLs.` : 'All URLs are valid.'}`,
                          variant: "default",
                        })
                      }}
                      disabled={newContent.preview_images.length === 0}
                      className="border-gray-800 text-gray-300"
                    >
                      🧹 Clean URLs
                    </Button>
                  </div>
                </div>

                {/* Bulk Image Input */}
                <div className="space-y-2">
                  <Label htmlFor="bulk-image-input" className="text-sm text-gray-400">
                    Paste image URLs, pixhost show URLs, or BBCode (one per line or space-separated)
                  </Label>
                  <Textarea
                    id="bulk-image-input"
                    value={bulkImageInput}
                    onChange={(e) => setBulkImageInput(e.target.value)}
                    placeholder="https://img1.pixhost.to/images/7987/632058135_leakybabes-com-vip_8_1.jpg&#10;https://img1.pixhost.to/images/7987/632058136_leakybabes-com-vip_3.jpg&#10;&#10;Or paste BBCode:&#10;[url=https://pixhost.to/show/8530/638452633_leakybabes.jpg]&#10;[url]https://pixhost.to/show/8530/638452633_leakybabes.jpg[/url]&#10;[url=https://pixhost.to/show/7688/628334976_png-1.png][img]https://img1.pixhost.to/images/7688/628334976_png-1.png[/img][/url]"
                    className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300 min-h-[80px]"
                  />
                  
                  {/* Real-time URL detection preview */}
                  {bulkImageInput.trim() && (
                    <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ImageIcon className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-blue-400 font-medium">
                          Detected URLs: {extractImageUrlsFromBBCode(bulkImageInput).length}
                        </span>
                      </div>
                      {extractImageUrlsFromBBCode(bulkImageInput).length > 0 ? (
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {extractImageUrlsFromBBCode(bulkImageInput).slice(0, 6).map((url, index) => (
                            <div key={index} className="text-xs text-gray-400 truncate">
                              {index + 1}. {url}
                            </div>
                          ))}
                          {extractImageUrlsFromBBCode(bulkImageInput).length > 6 && (
                            <div className="text-xs text-gray-500">
                              ... and {extractImageUrlsFromBBCode(bulkImageInput).length - 6} more
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500">
                          No valid image URLs detected. Try pasting URLs starting with http:// or https://
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {newContent.preview_images.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-gray-800 rounded-lg">
                    <ImageIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500">No preview images added</p>
                    <p className="text-xs text-gray-600 mt-1">Add preview images to showcase your content</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newContent.preview_images.map((url, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...newContent.preview_images]
                            let inputValue = e.target.value
                            
                            // Auto-transform URLs as they're typed
                            if (inputValue.trim()) {
                              const extracted = extractImageUrlsFromBBCode(inputValue)
                              if (extracted.length > 0) {
                                inputValue = extracted[0] // Use the first extracted URL
                              }
                            }
                            
                            newUrls[index] = inputValue
                            setNewContent({
                              ...newContent,
                              preview_images: newUrls,
                            })
                          }}
                          placeholder="https://example.com/preview-image.jpg or [url]...[/url] or pixhost show URL"
                          className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300 flex-grow"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newUrls = [...newContent.preview_images]
                            newUrls.splice(index, 1)
                            setNewContent({
                              ...newContent,
                              preview_images: newUrls,
                            })
                          }}
                          className="border-gray-800 hover:border-red-700 hover:bg-red-900/20 text-gray-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {newContent.preview_images.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-400 mb-3">Preview Images Gallery:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {newContent.preview_images
                      .filter((url) => url)
                      .map((url, index) => (
                        <div
                          key={index}
                          className="aspect-video rounded-lg overflow-hidden bg-gray-900 border border-gray-800"
                        >
                          <ExternalImage
                            src={url && (url.startsWith('http://') || url.startsWith('https://')) ? url : "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            width={200}
                            height={120}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="premium">Premium Content</Label>
                  <p className="text-sm text-gray-400">Require premium subscription to access</p>
                </div>
                <Switch
                  id="premium"
                  checked={newContent.is_premium}
                  onCheckedChange={(checked) => setNewContent({ ...newContent, is_premium: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="scheduling" className="space-y-4 mt-4">
              {/* Scheduling section */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_scheduled"
                    checked={newContent.is_scheduled || false}
                    onCheckedChange={(checked) => setNewContent({ ...newContent, is_scheduled: checked === true })}
                  />
                  <label
                    htmlFor="is_scheduled"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Schedule for later
                  </label>
                </div>
              </div>

              {newContent.is_scheduled && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="publish_at">Publish Date</Label>
                  <Input
                    id="publish_at"
                    type="datetime-local"
                    value={formatDateForInput(newContent.publish_at)}
                    onChange={(e) => setNewContent({ ...newContent, publish_at: e.target.value })}
                    className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                  />
                  <p className="text-xs text-amber-400 mt-1">
                    Content will be hidden until this date and time
                  </p>
                </div>
              )}

              {!newContent.is_scheduled && (
                <div className="flex items-center justify-between mt-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="published">Publish Now</Label>
                    <p className="text-sm text-gray-400">Make content visible immediately</p>
                  </div>
                  <Switch
                    id="published"
                    checked={newContent.is_published}
                    onCheckedChange={(checked) => setNewContent({ ...newContent, is_published: checked })}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>

          {formStatus.success && (
            <div className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{formStatus.success}</span>
            </div>
          )}

          {formStatus.error && (
            <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{formStatus.error}</span>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-gray-700 text-gray-300">
              Cancel
            </Button>
            <Button
              onClick={handleAddContent}
              disabled={formStatus.loading || !newContent.title || !newContent.category}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
            >
              {formStatus.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Add Content"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open)
        if (!open) {
          setEditBulkImageInput("")
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Content</DialogTitle>
          </DialogHeader>

          {currentItem && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="bg-black/50 border border-gray-800">
                <TabsTrigger value="details" className="data-[state=active]:bg-pink-900/20">
                  Basic Details
                </TabsTrigger>
                <TabsTrigger value="media" className="data-[state=active]:bg-pink-900/20">
                  Media & Downloads
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-pink-900/20">
                  Preview Images
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-pink-900/20">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="scheduling" className="data-[state=active]:bg-pink-900/20">
                  Scheduling
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={currentItem.title}
                    onChange={(e) => setCurrentItem({ ...currentItem, title: e.target.value })}
                    className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-slug">Slug</Label>
                  <Input
                    id="edit-slug"
                    value={currentItem.slug}
                    onChange={(e) => setCurrentItem({ ...currentItem, slug: e.target.value })}
                    className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={typeof currentItem.category === "object" ? currentItem.category.slug : currentItem.category}
                    onValueChange={(value) => setCurrentItem({ ...currentItem, category: value as any })}
                  >
                    <SelectTrigger
                      id="edit-category"
                      className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                    >
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-800">
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={currentItem.description}
                    onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                    className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300 min-h-[100px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="media" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-image-url">Image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-image-url"
                      value={currentItem.image_url}
                      onChange={(e) => setCurrentItem({ ...currentItem, image_url: e.target.value })}
                      className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300 flex-grow"
                    />
                    <Button variant="outline" className="border-gray-800 text-gray-300">
                      <ImageIcon className="h-4 w-4 mr-2" /> Browse
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-free-download-url">Free Download URL</Label>
                  <Input
                    id="edit-free-download-url"
                    value={currentItem.free_link || ""}
                    onChange={(e) => setCurrentItem({ ...currentItem, free_link: e.target.value })}
                    placeholder="https://example.com/free-download.zip"
                    className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-premium-download-url">Premium Download URL</Label>
                  <Input
                    id="edit-premium-download-url"
                    value={currentItem.premium_link || ""}
                    onChange={(e) => setCurrentItem({ ...currentItem, premium_link: e.target.value })}
                    placeholder="https://example.com/premium-download.zip"
                    className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                  />
                </div>

                {currentItem.image_url && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400 mb-2">Image Preview:</p>
                    <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-900">
                      <ExternalImage
                        src={currentItem.image_url}
                        alt="Preview"
                        width={300}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Preview Images</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentItem({
                            ...currentItem,
                            preview_images: [...(currentItem.preview_images || []), ""],
                          })
                        }}
                        className="border-gray-800 text-gray-300"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add Image
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const urls = extractImageUrlsFromBBCode(editBulkImageInput)
                          if (urls.length > 0) {
                            setCurrentItem({
                              ...currentItem,
                              preview_images: [...(currentItem.preview_images || []), ...urls],
                            })
                            setEditBulkImageInput("")
                            toast({
                              title: "Success",
                              description: `Added ${urls.length} image(s) from BBCode (pixhost URLs auto-transformed)`,
                              variant: "default",
                            })
                          } else {
                            toast({
                              title: "No images found",
                              description: "No valid image URLs found in the BBCode",
                              variant: "destructive",
                            })
                          }
                        }}
                        disabled={!editBulkImageInput.trim()}
                        className="border-gray-800 text-gray-300"
                      >
                        <LinkIcon className="h-3.5 w-3.5 mr-1" /> Add from BBCode
                        {editBulkImageInput.trim() && (
                          <span className="ml-1 text-xs bg-gray-700 px-1.5 py-0.5 rounded">
                            {extractImageUrlsFromBBCode(editBulkImageInput).length}
                          </span>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const transformedUrls = (currentItem.preview_images || []).map(transformPixhostUrl)
                          const changedCount = (currentItem.preview_images || []).filter((url, index) => url !== transformedUrls[index]).length
                          
                          if (changedCount > 0) {
                            setCurrentItem({
                              ...currentItem,
                              preview_images: transformedUrls,
                            })
                            toast({
                              title: "Success",
                              description: `Transformed ${changedCount} pixhost URL(s) (t1→img1, thumbs→images)`,
                              variant: "default",
                            })
                          } else {
                            toast({
                              title: "No changes needed",
                              description: "No pixhost URLs found that need transformation",
                              variant: "default",
                            })
                          }
                        }}
                        disabled={!currentItem.preview_images || currentItem.preview_images.length === 0}
                        className="border-gray-800 text-gray-300"
                      >
                        🔧 Fix Pixhost URLs
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const cleanedUrls = cleanupPreviewUrls(currentItem.preview_images || [])
                          const removedCount = (currentItem.preview_images || []).length - cleanedUrls.length
                          
                          setCurrentItem({
                            ...currentItem,
                            preview_images: cleanedUrls,
                          })
                          toast({
                            title: "URLs Cleaned",
                            description: `Processed all URLs. ${removedCount > 0 ? `Removed ${removedCount} invalid URLs.` : 'All URLs are valid.'}`,
                            variant: "default",
                          })
                        }}
                        disabled={!currentItem.preview_images || currentItem.preview_images.length === 0}
                        className="border-gray-800 text-gray-300"
                      >
                        🧹 Clean URLs
                      </Button>
                    </div>
                  </div>

                  {/* Bulk Image Input for Edit */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-bulk-image-input" className="text-sm text-gray-400">
                      Paste image URLs, pixhost show URLs, or BBCode (one per line or space-separated)
                    </Label>
                    <Textarea
                      id="edit-bulk-image-input"
                      value={editBulkImageInput}
                      onChange={(e) => setEditBulkImageInput(e.target.value)}
                      placeholder="https://img1.pixhost.to/images/7987/632058135_leakybabes-com-vip_8_1.jpg&#10;https://img1.pixhost.to/images/7987/632058136_leakybabes-com-vip_3.jpg&#10;&#10;Or paste BBCode:&#10;[url=https://pixhost.to/show/8530/638452633_leakybabes.jpg]&#10;[url]https://pixhost.to/show/8530/638452633_leakybabes.jpg[/url]&#10;[url=https://pixhost.to/show/7688/628334976_png-1.png][img]https://img1.pixhost.to/images/7688/628334976_png-1.png[/img][/url]"
                      className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300 min-h-[80px]"
                    />
                    
                    {/* Real-time URL detection preview */}
                    {editBulkImageInput.trim() && (
                      <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <ImageIcon className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-blue-400 font-medium">
                            Detected URLs: {extractImageUrlsFromBBCode(editBulkImageInput).length}
                          </span>
                        </div>
                        {extractImageUrlsFromBBCode(editBulkImageInput).length > 0 ? (
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {extractImageUrlsFromBBCode(editBulkImageInput).slice(0, 6).map((url, index) => (
                              <div key={index} className="text-xs text-gray-400 truncate">
                                {index + 1}. {url}
                              </div>
                            ))}
                            {extractImageUrlsFromBBCode(editBulkImageInput).length > 6 && (
                              <div className="text-xs text-gray-500">
                                ... and {extractImageUrlsFromBBCode(editBulkImageInput).length - 6} more
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            No valid image URLs detected. Try pasting URLs starting with http:// or https://
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {!currentItem.preview_images || currentItem.preview_images.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-800 rounded-lg">
                      <ImageIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500">No preview images added</p>
                      <p className="text-xs text-gray-600 mt-1">Add preview images to showcase your content</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentItem.preview_images.map((url, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={url}
                            onChange={(e) => {
                              const newUrls = [...(currentItem.preview_images || [])]
                              let inputValue = e.target.value
                              
                              // Auto-transform URLs as they're typed
                              if (inputValue.trim()) {
                                const extracted = extractImageUrlsFromBBCode(inputValue)
                                if (extracted.length > 0) {
                                  inputValue = extracted[0] // Use the first extracted URL
                                }
                              }
                              
                              newUrls[index] = inputValue
                              setCurrentItem({
                                ...currentItem,
                                preview_images: newUrls,
                              })
                            }}
                            placeholder="https://example.com/preview-image.jpg or [url]...[/url] or pixhost show URL"
                            className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300 flex-grow"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newUrls = [...(currentItem.preview_images || [])]
                              newUrls.splice(index, 1)
                              setCurrentItem({
                                ...currentItem,
                                preview_images: newUrls,
                              })
                            }}
                            className="border-gray-800 hover:border-red-700 hover:bg-red-900/20 text-gray-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {currentItem.preview_images && currentItem.preview_images.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm text-gray-400 mb-3">Preview Images Gallery:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {currentItem.preview_images
                        .filter((url) => url)
                        .map((url, index) => (
                          <div
                            key={index}
                            className="aspect-video rounded-lg overflow-hidden bg-gray-900 border border-gray-800"
                          >
                            <ExternalImage
                              src={url && (url.startsWith('http://') || url.startsWith('https://')) ? url : "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              width={200}
                              height={120}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="edit-premium">Premium Content</Label>
                    <p className="text-sm text-gray-400">Require premium subscription to access</p>
                  </div>
                  <Switch
                    id="edit-premium"
                    checked={currentItem.is_premium}
                    onCheckedChange={(checked) => setCurrentItem({ ...currentItem, is_premium: checked })}
                  />
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-2">Content Statistics:</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Downloads</p>
                      <p className="text-lg font-medium text-white">{currentItem.downloads || 0}</p>
                    </div>
                    <div className="bg-black/40 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Created</p>
                      <p className="text-sm font-medium text-white">
                        {new Date(currentItem.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="scheduling" className="space-y-4 mt-4">
                {/* Scheduling section */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit_is_scheduled"
                      checked={currentItem.is_scheduled || false}
                      onCheckedChange={(checked) => setCurrentItem({ ...currentItem, is_scheduled: checked === true })}
                    />
                    <label
                      htmlFor="edit_is_scheduled"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Schedule for later
                    </label>
                  </div>
                </div>

                {currentItem.is_scheduled && (
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="edit_publish_at">Publish Date</Label>
                    <Input
                      id="edit_publish_at"
                      type="datetime-local"
                      value={formatDateForInput(currentItem.publish_at)}
                      onChange={(e) => setCurrentItem({ ...currentItem, publish_at: e.target.value })}
                      className="bg-black/60 border-gray-800 focus:border-pink-700 text-gray-300"
                    />
                    <p className="text-xs text-amber-400 mt-1">
                      Content will be hidden until this date and time
                    </p>
                  </div>
                )}

                {!currentItem.is_scheduled && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="edit-published">Publish Now</Label>
                      <p className="text-sm text-gray-400">Make content visible immediately</p>
                    </div>
                    <Switch
                      id="edit-published"
                      checked={currentItem.is_published}
                      onCheckedChange={(checked) => setCurrentItem({ ...currentItem, is_published: checked })}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {formStatus.success && (
            <div className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{formStatus.success}</span>
            </div>
          )}

          {formStatus.error && (
            <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{formStatus.error}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditContent}
              disabled={formStatus.loading || !currentItem?.title || !currentItem?.category}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              {formStatus.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Update Content"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Delete Content</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <p className="text-center text-gray-300 mb-2">Are you sure you want to delete this content?</p>
            <p className="text-center text-gray-400 text-sm">
              <strong>{currentItem?.title}</strong>
            </p>
            <p className="text-center text-red-400 text-sm mt-4">This action cannot be undone.</p>
          </div>

          {formStatus.success && (
            <div className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg flex items-center gap-2 text-green-400 text-sm">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{formStatus.success}</span>
            </div>
          )}

          {formStatus.error && (
            <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <span>{formStatus.error}</span>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              className="border-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteContent}
              disabled={formStatus.loading}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              {formStatus.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete Content"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
