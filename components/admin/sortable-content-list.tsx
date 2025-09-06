"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Loader2, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExternalImage } from "@/components/external-image"
import { toast } from "@/components/ui/use-toast"

export interface SortableItem {
  id: number
  title: string
  image_url?: string
  category?: {
    name: string
  }
  is_premium?: boolean
  ranking: number
}

interface SortableItemProps {
  item: SortableItem
}

function SortableContentItem({ item }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-black/40 border border-gray-800 rounded-lg mb-2 ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 hover:bg-gray-800/50 rounded"
      >
        <GripVertical className="h-5 w-5 text-gray-500" />
      </div>

      <div className="h-12 w-12 rounded overflow-hidden bg-gray-900 flex-shrink-0">
        {item.image_url ? (
          <ExternalImage
            src={item.image_url}
            alt={item.title}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600 text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex-grow">
        <h4 className="text-sm font-medium text-white">{item.title}</h4>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{item.category?.name || "Unknown category"}</span>
          {item.is_premium && (
            <>
              <span>•</span>
              <span className="text-pink-400">Premium</span>
            </>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 bg-gray-800/50 px-2 py-1 rounded">Rank: {item.ranking}</div>
    </div>
  )
}

interface SortableContentListProps {
  items: SortableItem[]
  onReorder: (items: SortableItem[]) => Promise<void>
}

export function SortableContentList({ items: initialItems, onReorder }: SortableContentListProps) {
  const [items, setItems] = useState<SortableItem[]>(initialItems)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((currentItems) => {
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

  const handleSaveOrder = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await onReorder(items)
      setSuccess("Content order updated successfully!")
      toast({
        title: "Success",
        description: "Content order has been updated",
        variant: "default",
      })

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update content order"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Drag to reorder content</h3>
        <Button
          onClick={handleSaveOrder}
          disabled={isLoading}
          className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            "Save Order"
          )}
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-800/30 rounded-lg flex items-center gap-2 text-red-400 text-sm mb-4">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-900/20 border border-green-800/30 rounded-lg flex items-center gap-2 text-green-400 text-sm mb-4">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-black/20 border border-gray-800 rounded-xl p-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            {items.map((item) => (
              <SortableContentItem key={item.id} item={item} />
            ))}
          </SortableContext>
        </DndContext>

        {items.length === 0 && <div className="text-center py-8 text-gray-500">No content items to sort</div>}
      </div>
    </div>
  )
}
