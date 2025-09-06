"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Pencil, Trash2, Plus, Save, X, Star, StarOff, Loader2, LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"
import type { Product } from "@/lib/product-service"

export default function AdminProductsPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    discounted_price: null,
    image_url: "",
    size: "",
    count: "",
    featured: false,
    download_link: "", // Added download link field
  })

  const supabase = createClientComponentClient()

  // Check if user is authenticated and admin
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/?authRequired=true")
      return
    }

    if (!isAdmin && process.env.NODE_ENV === "production") {
      router.push("/")
    }
  }, [user, isAdmin, isLoading, router])

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("shop_products")
          .select("*")
          .order("featured", { ascending: false })
          .order("id")

        if (error) {
          throw error
        }

        setProducts(data || [])
      } catch (err: any) {
        console.error("Error fetching products:", err)
        setError(err.message || "Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    if (user && isAdmin) {
      fetchProducts()
    }
  }, [user, isAdmin, supabase])

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product })
  }

  const handleCancelEdit = () => {
    setEditingProduct(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [field]: e.target.value,
      })
    }
  }

  const handleNewProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    let value: string | number | boolean | null = e.target.value

    // Convert price fields to numbers
    if (field === "price" || field === "discounted_price") {
      value = e.target.value === "" ? null : Number.parseFloat(e.target.value)
    }

    setNewProduct({
      ...newProduct,
      [field]: value,
    })
  }

  // Minimum price validation for NOWPayments
  const MINIMUM_PRICE = 5.00
  const validatePrice = (price: number | null | undefined): { isValid: boolean; message?: string } => {
    if (!price || price < MINIMUM_PRICE) {
      return {
        isValid: false,
        message: `Minimum price is $${MINIMUM_PRICE} for crypto payments`
      }
    }
    return { isValid: true }
  }

  const handleToggleFeatured = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("shop_products")
        .update({ featured: !product.featured })
        .eq("id", product.id)

      if (error) {
        throw error
      }

      // Update local state
      setProducts(products.map((p) => (p.id === product.id ? { ...p, featured: !product.featured } : p)))
    } catch (err: any) {
      console.error("Error updating featured status:", err)
      setError(err.message || "Failed to update featured status")
    }
  }

  const handleSaveEdit = async () => {
    if (!editingProduct) return

    // Validate price
    const priceValidation = validatePrice(editingProduct.price)
    if (!priceValidation.isValid) {
      setError(priceValidation.message || "Invalid price")
      return
    }

    // Validate discounted price if it exists
    if (editingProduct.discounted_price) {
      const discountValidation = validatePrice(editingProduct.discounted_price)
      if (!discountValidation.isValid) {
        setError(`Discounted ${discountValidation.message}`)
        return
      }
    }

    try {
      setIsSubmitting(true)
      setError(null) // Clear any previous errors
      const { error } = await supabase
        .from("shop_products")
        .update({
          name: editingProduct.name,
          description: editingProduct.description,
          price: editingProduct.price,
          discounted_price: editingProduct.discounted_price,
          image_url: editingProduct.image_url,
          size: editingProduct.size,
          count: editingProduct.count,
          featured: editingProduct.featured,
          download_link: editingProduct.download_link, // Added download link field
        })
        .eq("id", editingProduct.id)

      if (error) {
        throw error
      }

      // Update local state
      setProducts(products.map((product) => (product.id === editingProduct.id ? editingProduct : product)))
      setEditingProduct(null)
    } catch (err: any) {
      console.error("Error updating product:", err)
      setError(err.message || "Failed to update product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddProduct = async () => {
    // Validate price
    const priceValidation = validatePrice(newProduct.price as number)
    if (!priceValidation.isValid) {
      setError(priceValidation.message || "Invalid price")
      return
    }

    // Validate discounted price if it exists
    if (newProduct.discounted_price) {
      const discountValidation = validatePrice(newProduct.discounted_price as number)
      if (!discountValidation.isValid) {
        setError(`Discounted ${discountValidation.message}`)
        return
      }
    }

    try {
      setIsSubmitting(true)
      setError(null) // Clear any previous errors
      const { data, error } = await supabase
        .from("shop_products")
        .insert({
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          discounted_price: newProduct.discounted_price,
          image_url: newProduct.image_url,
          size: newProduct.size,
          count: newProduct.count,
          featured: newProduct.featured || false,
          download_link: newProduct.download_link, // Added download link field
        })
        .select()

      if (error) {
        throw error
      }

      // Update local state
      setProducts([...(data || []), ...products])
      setShowAddForm(false)
      setNewProduct({
        name: "",
        description: "",
        price: 0,
        discounted_price: null,
        image_url: "",
        size: "",
        count: "",
        featured: false,
        download_link: "", // Reset download link field
      })
    } catch (err: any) {
      console.error("Error adding product:", err)
      setError(err.message || "Failed to add product")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      const { error } = await supabase.from("shop_products").delete().eq("id", id)

      if (error) {
        throw error
      }

      // Update local state
      setProducts(products.filter((product) => product.id !== id))
    } catch (err: any) {
      console.error("Error deleting product:", err)
      setError(err.message || "Failed to delete product")
    }
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

  // If user is not logged in, show login message
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access Required</h1>
          <p className="text-gray-400 mb-6">You need to log in with an admin account to access this page.</p>
          <Button
            onClick={() => router.push("/?authRequired=true")}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
          >
            Log In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Shop Products</h1>
          <p className="text-gray-400 mt-1">Manage your shop products</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/admin")}
            variant="outline"
            className="border-pink-800/40 text-gray-300 hover:bg-pink-950/30"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      {/* Minimum price info banner */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-300">NOWPayments Minimum Price Requirement</h3>
            <p className="mt-1 text-sm text-blue-200">
              All shop products must have a minimum price of <strong>${MINIMUM_PRICE}</strong> to support cryptocurrency payments. 
              This ensures all payment amounts meet the minimum requirements for crypto transactions.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
          <Button
            onClick={() => setError(null)}
            variant="outline"
            className="mt-2 border-red-800/40 text-red-300 hover:bg-red-950/30"
            size="sm"
          >
            Dismiss
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin mr-2" />
          <p className="text-gray-400">Loading products...</p>
        </div>
      ) : (
        <>
          {showAddForm && (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Add New Product</h2>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => handleNewProductChange(e, "name")}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <textarea
                      value={newProduct.description || ""}
                      onChange={(e) => handleNewProductChange(e, "description")}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white h-24"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Price ($) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={MINIMUM_PRICE}
                        value={newProduct.price || ""}
                        onChange={(e) => handleNewProductChange(e, "price")}
                        className={`w-full bg-gray-800 border rounded-md px-3 py-2 text-white ${
                          newProduct.price && (newProduct.price as number) < MINIMUM_PRICE
                            ? 'border-red-500' 
                            : 'border-gray-700'
                        }`}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Minimum ${MINIMUM_PRICE} for crypto payments
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Discounted Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min={MINIMUM_PRICE}
                        value={newProduct.discounted_price || ""}
                        onChange={(e) => handleNewProductChange(e, "discounted_price")}
                        className={`w-full bg-gray-800 border rounded-md px-3 py-2 text-white ${
                          newProduct.discounted_price && (newProduct.discounted_price as number) < MINIMUM_PRICE
                            ? 'border-red-500' 
                            : 'border-gray-700'
                        }`}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Optional, min ${MINIMUM_PRICE} if used
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                    <input
                      type="text"
                      value={newProduct.image_url || ""}
                      onChange={(e) => handleNewProductChange(e, "image_url")}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Download Link <span className="text-gray-500">(Provided after purchase)</span>
                    </label>
                    <input
                      type="text"
                      value={newProduct.download_link || ""}
                      onChange={(e) => handleNewProductChange(e, "download_link")}
                      className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                      placeholder="https://mega.nz/folder/..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Size</label>
                      <input
                        type="text"
                        value={newProduct.size || ""}
                        onChange={(e) => handleNewProductChange(e, "size")}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                        placeholder="e.g. 5GB"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Count</label>
                      <input
                        type="text"
                        value={newProduct.count || ""}
                        onChange={(e) => handleNewProductChange(e, "count")}
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
                        placeholder="e.g. 50+ files"
                      />
                    </div>
                  </div>

                  <div className="flex items-center mt-4">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={newProduct.featured || false}
                      onChange={(e) => setNewProduct({ ...newProduct, featured: e.target.checked })}
                      className="h-4 w-4 text-pink-600 bg-gray-800 border-gray-700 rounded"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                      Featured Product
                    </label>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={() => setShowAddForm(false)}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 mr-2"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddProduct}
                      disabled={
                        isSubmitting || 
                        !newProduct.name || 
                        !newProduct.price ||
                        (newProduct.price as number) < MINIMUM_PRICE ||
                        (newProduct.discounted_price && (newProduct.discounted_price as number) < MINIMUM_PRICE)
                      }
                      className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Add Product
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Size/Count
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Download Link
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        No products found. Add your first product to get started.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-800/30">
                        {editingProduct && editingProduct.id === product.id ? (
                          // Edit mode
                          <>
                            <td className="px-4 py-4">
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editingProduct.name}
                                  onChange={(e) => handleInputChange(e, "name")}
                                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                                />
                                <textarea
                                  value={editingProduct.description || ""}
                                  onChange={(e) => handleInputChange(e, "description")}
                                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm h-20"
                                />
                                <input
                                  type="text"
                                  value={editingProduct.image_url}
                                  onChange={(e) => handleInputChange(e, "image_url")}
                                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                                  placeholder="Image URL"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <span className="text-gray-400 mr-2">$</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min={MINIMUM_PRICE}
                                    value={editingProduct.price}
                                    onChange={(e) =>
                                      setEditingProduct({
                                        ...editingProduct,
                                        price: Number.parseFloat(e.target.value),
                                      })
                                    }
                                    className={`w-full bg-gray-800 border rounded-md px-2 py-1 text-white text-sm ${
                                      editingProduct.price < MINIMUM_PRICE ? 'border-red-500' : 'border-gray-700'
                                    }`}
                                  />
                                </div>
                                <div className="flex items-center">
                                  <span className="text-gray-400 mr-2">Discount: $</span>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min={MINIMUM_PRICE}
                                    value={editingProduct.discounted_price || ""}
                                    onChange={(e) =>
                                      setEditingProduct({
                                        ...editingProduct,
                                        discounted_price: e.target.value ? Number.parseFloat(e.target.value) : null,
                                      })
                                    }
                                    className={`w-full bg-gray-800 border rounded-md px-2 py-1 text-white text-sm ${
                                      editingProduct.discounted_price && editingProduct.discounted_price < MINIMUM_PRICE 
                                        ? 'border-red-500' 
                                        : 'border-gray-700'
                                    }`}
                                  />
                                </div>
                                <p className="text-xs text-gray-400">Min ${MINIMUM_PRICE}</p>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={editingProduct.size}
                                  onChange={(e) => handleInputChange(e, "size")}
                                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                                  placeholder="Size (e.g. 5GB)"
                                />
                                <input
                                  type="text"
                                  value={editingProduct.count}
                                  onChange={(e) => handleInputChange(e, "count")}
                                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                                  placeholder="Count (e.g. 50+ files)"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <input
                                type="text"
                                value={editingProduct.download_link || ""}
                                onChange={(e) => handleInputChange(e, "download_link")}
                                className="w-full bg-gray-800 border border-gray-700 rounded-md px-2 py-1 text-white text-sm"
                                placeholder="https://mega.nz/folder/..."
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={editingProduct.featured}
                                  onChange={(e) =>
                                    setEditingProduct({
                                      ...editingProduct,
                                      featured: e.target.checked,
                                    })
                                  }
                                  className="h-4 w-4 text-pink-600 bg-gray-800 border-gray-700 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-300">Featured</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  onClick={handleSaveEdit}
                                  disabled={
                                    isSubmitting ||
                                    editingProduct.price < MINIMUM_PRICE ||
                                    (editingProduct.discounted_price && editingProduct.discounted_price < MINIMUM_PRICE)
                                  }
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                                >
                                  {isSubmitting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  onClick={handleCancelEdit}
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // View mode
                          <>
                            <td className="px-4 py-4">
                              <div className="flex items-center">
                                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-700">
                                  {product.image_url ? (
                                    <Image
                                      src={product.image_url || "/placeholder.svg"}
                                      alt={product.name}
                                      width={48}
                                      height={48}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-gray-800 flex items-center justify-center text-gray-500">
                                      No img
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-white">{product.name}</div>
                                  <div className="text-xs text-gray-400 line-clamp-1">
                                    {product.description || "No description"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className={`text-sm ${product.price < MINIMUM_PRICE ? 'text-red-400' : 'text-white'}`}>
                                ${product.price.toFixed(2)}
                                {product.price < MINIMUM_PRICE && (
                                  <span className="ml-1 text-xs bg-red-900/50 px-1 rounded">Below min</span>
                                )}
                              </div>
                              {product.discounted_price && (
                                <div className="text-xs">
                                  <span className="text-gray-400 line-through">${product.price.toFixed(2)}</span>{" "}
                                  <span className={`${product.discounted_price < MINIMUM_PRICE ? 'text-red-400' : 'text-green-400'}`}>
                                    ${product.discounted_price.toFixed(2)}
                                    {product.discounted_price < MINIMUM_PRICE && (
                                      <span className="ml-1 text-xs bg-red-900/50 px-1 rounded">Below min</span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm text-white">{product.size}</div>
                              <div className="text-xs text-gray-400">{product.count}</div>
                            </td>
                            <td className="px-4 py-4">
                              {product.download_link ? (
                                <div className="flex items-center text-sm">
                                  <LinkIcon className="h-3 w-3 mr-1 text-green-400" />
                                  <span className="text-green-400">Link available</span>
                                </div>
                              ) : (
                                <div className="text-sm text-gray-500">No download link</div>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <Button
                                onClick={() => handleToggleFeatured(product)}
                                size="sm"
                                variant={product.featured ? "default" : "outline"}
                                className={
                                  product.featured
                                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                                    : "border-gray-700 text-gray-400 hover:bg-gray-800"
                                }
                              >
                                {product.featured ? (
                                  <>
                                    <Star className="h-4 w-4 mr-1" /> Featured
                                  </>
                                ) : (
                                  <>
                                    <StarOff className="h-4 w-4 mr-1" /> Not Featured
                                  </>
                                )}
                              </Button>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  onClick={() => handleEdit(product)}
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-800/40 text-blue-400 hover:bg-blue-900/20"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-800/40 text-red-400 hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
