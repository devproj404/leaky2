"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Trash2, Edit, Plus } from "lucide-react"
import { getAllWeeklyDrops, createWeeklyDrop, updateWeeklyDrop, deleteWeeklyDrop } from "@/lib/weekly-drop-service"
import type { WeeklyDrop } from "@/lib/weekly-drop-service"

export default function WeeklyDropsPage() {
  const [weeklyDrops, setWeeklyDrops] = useState<WeeklyDrop[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState({
    thumbnail_url: "",
    link: "",
    is_active: false
  })

  const fetchWeeklyDrops = async () => {
    setLoading(true)
    try {
      const drops = await getAllWeeklyDrops()
      setWeeklyDrops(drops)
    } catch (error) {
      console.error("Error fetching weekly drops:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeeklyDrops()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newDrop = await createWeeklyDrop(formData)
      if (newDrop) {
        await fetchWeeklyDrops()
        setFormData({ thumbnail_url: "", link: "", is_active: false })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error("Error creating weekly drop:", error)
    }
  }

  const handleUpdate = async (id: number, updates: Partial<WeeklyDrop>) => {
    try {
      const updated = await updateWeeklyDrop(id, updates)
      if (updated) {
        await fetchWeeklyDrops()
        setIsEditing(null)
      }
    } catch (error) {
      console.error("Error updating weekly drop:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this weekly drop?")) {
      try {
        const success = await deleteWeeklyDrop(id)
        if (success) {
          await fetchWeeklyDrops()
        }
      } catch (error) {
        console.error("Error deleting weekly drop:", error)
      }
    }
  }

  const toggleActive = async (id: number, currentActiveState: boolean) => {
    await handleUpdate(id, { is_active: !currentActiveState })
  }

  if (loading) {
    return <div>Loading weekly drops...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Weekly Drops Management</h1>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Weekly Drop
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Weekly Drop</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  placeholder="/snapchat-collection-banner.png"
                  required
                />
              </div>
              <div>
                <Label htmlFor="link">Link</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="/snapchat-collection"
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Set as Active</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Weekly Drops List */}
      <div className="grid gap-4">
        {weeklyDrops.map((drop) => (
          <Card key={drop.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {drop.thumbnail_url ? (
                    <img
                      src={drop.thumbnail_url}
                      alt="Weekly Drop"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-500 text-xs">No Image</span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg">Weekly Drop #{drop.id}</h3>
                    <p className="text-sm text-blue-600">{drop.link}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={drop.is_active ? "default" : "secondary"}>
                    {drop.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Switch
                    checked={drop.is_active}
                    onCheckedChange={() => toggleActive(drop.id, drop.is_active)}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(drop.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(drop.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {isEditing === drop.id && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div>
                    <Label>Thumbnail URL</Label>
                    <Input
                      defaultValue={drop.thumbnail_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Link</Label>
                    <Input
                      defaultValue={drop.link}
                      onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdate(drop.id, formData)}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(null)}
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

      {weeklyDrops.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No weekly drops found. Create your first one!
          </CardContent>
        </Card>
      )}
    </div>
  )
}