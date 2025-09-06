"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit, Plus, ExternalLink } from "lucide-react"
import { getAllAds, createAd, updateAd, deleteAd } from "@/lib/ad-service"
import type { AdSlot } from "@/lib/ad-service"
import { ImageInput } from "@/components/image-input"
import { ExternalImage } from "@/components/external-image"

const PLACEMENT_OPTIONS = [
  { value: "homepage-top", label: "Homepage - Top" },
  { value: "homepage-bottom", label: "Homepage - Bottom" },
  { value: "content-top", label: "Content Pages - Top" },
  { value: "content-bottom", label: "Content Pages - Bottom" },
]

export default function AdSlotsPage() {
  const [ads, setAds] = useState<AdSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    link_url: "",
    placement: "homepage-top",
    is_active: false,
    priority: 1
  })
  const [editFormData, setEditFormData] = useState<Partial<AdSlot>>({})

  const fetchAds = async () => {
    setLoading(true)
    try {
      const allAds = await getAllAds()
      setAds(allAds)
    } catch (error) {
      console.error("Error fetching ads:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newAd = await createAd(formData)
      if (newAd) {
        await fetchAds()
        setFormData({
          name: "",
          description: "",
          image_url: "",
          link_url: "",
          placement: "homepage-top",
          is_active: false,
          priority: 1
        })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error("Error creating ad:", error)
    }
  }

  const startEditing = (ad: AdSlot) => {
    setIsEditing(ad.id)
    setEditFormData({
      name: ad.name,
      description: ad.description,
      image_url: ad.image_url,
      link_url: ad.link_url,
      placement: ad.placement,
      is_active: ad.is_active,
      priority: ad.priority
    })
  }

  const handleUpdate = async (id: number) => {
    try {
      // Only send the changed fields, but ensure we have the complete object
      const currentAd = ads.find(ad => ad.id === id)
      if (!currentAd) return

      const updates = {
        name: editFormData.name ?? currentAd.name,
        description: editFormData.description ?? currentAd.description,
        image_url: editFormData.image_url ?? currentAd.image_url,
        link_url: editFormData.link_url ?? currentAd.link_url,
        placement: editFormData.placement ?? currentAd.placement,
        is_active: editFormData.is_active ?? currentAd.is_active,
        priority: editFormData.priority ?? currentAd.priority
      }

      const updated = await updateAd(id, updates)
      if (updated) {
        await fetchAds()
        setIsEditing(null)
        setEditFormData({})
      }
    } catch (error) {
      console.error("Error updating ad:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this ad?")) {
      try {
        const success = await deleteAd(id)
        if (success) {
          await fetchAds()
        }
      } catch (error) {
        console.error("Error deleting ad:", error)
      }
    }
  }

  const toggleActive = async (id: number, currentActiveState: boolean) => {
    try {
      const updated = await updateAd(id, { is_active: !currentActiveState })
      if (updated) {
        await fetchAds()
      }
    } catch (error) {
      console.error("Error toggling ad status:", error)
    }
  }

  const getPlacementLabel = (placement: string) => {
    return PLACEMENT_OPTIONS.find(opt => opt.value === placement)?.label || placement
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Loading ads...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ad Slots Management</h1>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Ad Slot
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Ad Slot</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Ad Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Homepage Banner Ad"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="placement">Placement</Label>
                  <Select value={formData.placement} onValueChange={(value) => setFormData(prev => ({ ...prev, placement: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select placement" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLACEMENT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this ad"
                  rows={2}
                />
              </div>

              <ImageInput
                label="Ad Image URL"
                value={formData.image_url}
                onChange={(value) => setFormData(prev => ({ ...prev, image_url: value }))}
                placeholder="https://imgur.com/your-ad-banner.jpg"
                required
              />

              <div>
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                  placeholder="https://example.com/landing-page"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Set as Active</Label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Ad Slot</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ads List */}
      <div className="grid gap-4">
        {ads.map((ad) => (
          <Card key={ad.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative flex-shrink-0 w-24 h-16">
                  {ad.image_url ? (
                    <ExternalImage
                      src={ad.image_url}
                      alt={ad.name}
                      fill
                      className="object-cover rounded border"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded border flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No Image</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg text-white">{ad.name}</h3>
                      <p className="text-sm text-gray-400 mb-2">{ad.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{getPlacementLabel(ad.placement)}</Badge>
                        <Badge variant={ad.is_active ? "default" : "secondary"}>
                          {ad.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <span className="text-xs text-gray-500">Priority: {ad.priority}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <ExternalLink className="w-3 h-3" />
                        <a href={ad.link_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 truncate">
                          {ad.link_url}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ad.is_active}
                        onCheckedChange={() => toggleActive(ad.id, ad.is_active)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditing(ad)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(ad.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {isEditing === ad.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Ad Name</Label>
                      <Input
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Placement</Label>
                      <Select value={editFormData.placement} onValueChange={(value) => setEditFormData(prev => ({ ...prev, placement: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLACEMENT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editFormData.description || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <ImageInput
                    label="Ad Image URL"
                    value={editFormData.image_url || ''}
                    onChange={(value) => setEditFormData(prev => ({ ...prev, image_url: value }))}
                    placeholder="https://imgur.com/your-ad-banner.jpg"
                  />

                  <div>
                    <Label>Link URL</Label>
                    <Input
                      value={editFormData.link_url || ''}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, link_url: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={editFormData.priority || 1}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(ad.id)}
                    >
                      Save Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(null)
                        setEditFormData({})
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {ads.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No ad slots found. Create your first one!
          </CardContent>
        </Card>
      )}
    </div>
  )
}