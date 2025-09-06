"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/lib/auth-context"
import {
  Plus,
  Loader2,
  Trash2,
  Pencil,
  AlertTriangle,
  CheckCircle,
  FileText,
  ChevronLeft,
  Link as LinkIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { ExternalImage } from "@/components/external-image"

interface Category {
  id: number
  name: string
  slug: string
  description: string
  image_url: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [showAddEditDialog, setShowAddEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push("/?authRequired=true")
      return
    }
    if (!isAdmin && process.env.NODE_ENV === "production") {
      router.push("/")
    } else {
      fetchCategories()
    }
  }, [user, isAdmin, isLoading, router])

  const fetchCategories = async () => {
    setIsLoadingCategories(true)
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")
      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      setError("Failed to load categories.")
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
  }

  const handleOpenAddDialog = () => {
    setCurrentCategory({ name: "", slug: "", description: "", image_url: "" })
    setShowAddEditDialog(true)
  }

  const handleOpenEditDialog = (category: Category) => {
    setCurrentCategory(category)
    setShowAddEditDialog(true)
  }

  const handleOpenDeleteDialog = (category: Category) => {
    setCurrentCategory(category)
    setShowDeleteDialog(true)
  }

  const handleSaveCategory = async () => {
    if (!currentCategory || !currentCategory.name) return
    setIsSubmitting(true)

    const isEditing = currentCategory.id !== undefined

    const categoryData = {
      name: currentCategory.name,
      slug: currentCategory.slug || generateSlug(currentCategory.name),
      description: currentCategory.description,
      image_url: currentCategory.image_url,
    }

    try {
      let error
      if (isEditing) {
        const { error: updateError } = await supabase
          .from("categories")
          .update(categoryData)
          .eq("id", currentCategory.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase.from("categories").insert([categoryData])
        error = insertError
      }

      if (error) throw error

      toast({
        title: "Success",
        description: `Category ${isEditing ? "updated" : "added"} successfully.`,
      })
      setShowAddEditDialog(false)
      fetchCategories()
    } catch (err) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "add"} category.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCategory = async () => {
    if (!currentCategory || !currentCategory.id) return
    setIsSubmitting(true)
    try {
      const { error } = await supabase.from("categories").delete().eq("id", currentCategory.id)
      if (error) throw error
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      })
      setShowDeleteDialog(false)
      fetchCategories()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete category. It might be in use.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || isLoadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-pink-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-full hover:bg-gray-800/50 transition-colors">
            <ChevronLeft className="h-5 w-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-pink-500 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Manage Categories
            </h1>
          </div>
        </div>
        <Button onClick={handleOpenAddDialog} className="bg-pink-600 hover:bg-pink-700">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="bg-black/40 border border-gray-800 rounded-xl">
        <div className="grid grid-cols-1 divide-y divide-gray-800">
          {categories.map((category) => (
            <div key={category.id} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full">
                <div className="w-24 h-16 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0">
                  {category.image_url ? (
                    <ExternalImage src={category.image_url} alt={category.name} width={96} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-white">{category.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-2">{category.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <LinkIcon className="h-3 w-3" />
                    <span>/{category.slug}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(category)} className="border-gray-700 text-gray-300">
                  <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleOpenDeleteDialog(category)} className="border-gray-700 text-gray-300 hover:bg-red-900/40 hover:border-red-700">
                  <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showAddEditDialog} onOpenChange={setShowAddEditDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{currentCategory?.id ? "Edit" : "Add"} Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Category Name"
              value={currentCategory?.name || ""}
              onChange={(e) =>
                setCurrentCategory({ ...currentCategory, name: e.target.value, slug: generateSlug(e.target.value) })
              }
              className="bg-black/60 border-gray-800"
            />
            <Input
              placeholder="Category Slug"
              value={currentCategory?.slug || ""}
              onChange={(e) => setCurrentCategory({ ...currentCategory, slug: e.target.value })}
              className="bg-black/60 border-gray-800"
            />
            <Textarea
              placeholder="Category Description"
              value={currentCategory?.description || ""}
              onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
              className="bg-black/60 border-gray-800"
            />
            <Input
              placeholder="Image URL"
              value={currentCategory?.image_url || ""}
              onChange={(e) => setCurrentCategory({ ...currentCategory, image_url: e.target.value })}
              className="bg-black/60 border-gray-800"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEditDialog(false)} className="border-gray-700">Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={isSubmitting} className="bg-pink-600 hover:bg-pink-700">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p>Are you sure you want to delete the category "{currentCategory?.name}"?</p>
            <p className="text-sm text-gray-500">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-gray-700">Cancel</Button>
            <Button onClick={handleDeleteCategory} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 