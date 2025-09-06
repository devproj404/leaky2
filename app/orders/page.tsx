"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { OrderHistory } from "@/components/order-history"
import { OrdersSkeleton } from "@/components/orders-skeleton"
import { getUserOrders, type Order } from "@/lib/order-service"

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreatingTable, setIsCreatingTable] = useState(false)

  useEffect(() => {
    // If authentication check is complete and user is not logged in, show sign-in message
    if (!isLoading && !user) {
      console.log("User not authenticated, showing sign-in message")
    }
  }, [isLoading, user, router])

  // Function to ensure orders table exists
  const ensureOrdersTable = async () => {
    try {
      setIsCreatingTable(true)
      const response = await fetch("/api/admin/ensure-orders-table")
      const data = await response.json()

      if (data.success) {
        console.log("Orders table created or already exists")
        // Reload orders after table creation
        loadOrders()
      } else {
        console.error("Failed to create orders table:", data.error)
        setError("Failed to create orders table. Please try again later.")
      }
    } catch (error) {
      console.error("Error ensuring orders table:", error)
      setError("Failed to create orders table. Please try again later.")
    } finally {
      setIsCreatingTable(false)
    }
  }

  // Function to load orders
  const loadOrders = async () => {
    if (user) {
      try {
        console.log("Fetching orders for user:", user.id)
        setIsLoadingOrders(true)
        setError(null)
        const userOrders = await getUserOrders(user.id)
        console.log("Fetched orders:", userOrders.length)
        setOrders(userOrders)
      } catch (error: any) {
        console.error("Error fetching orders:", error)

        // Check if the error is because the orders table doesn't exist
        if (error.message && error.message.includes("relation") && error.message.includes("does not exist")) {
          setError("The orders table doesn't exist yet. Click the button below to create it.")
        } else {
          setError("Failed to load your orders. Please try again later.")
        }
      } finally {
        setIsLoadingOrders(false)
      }
    }
  }

  useEffect(() => {
    if (user) {
      loadOrders()
    } else if (!isLoading) {
      setIsLoadingOrders(false)
    }
  }, [user, isLoading])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <OrdersSkeleton />
      </div>
    )
  }

  // Show sign-in message if not authenticated
  if (!user) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="text-gray-400 mb-6">Please sign in to view your order history.</p>
          <a
            href="/?authRequired=true"
            className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      {isLoadingOrders ? (
        <OrdersSkeleton />
      ) : error ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <p className="text-gray-400 mb-4">{error}</p>
          {error.includes("orders table doesn't exist") ? (
            <button
              onClick={ensureOrdersTable}
              disabled={isCreatingTable}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {isCreatingTable ? "Creating Table..." : "Create Orders Table"}
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          )}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">No Orders Found</h2>
          <p className="text-gray-400 mb-6">You haven't placed any orders yet.</p>
          <a
            href="/shop"
            className="inline-block bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Browse Shop
          </a>
        </div>
      ) : (
        <OrderHistory orders={orders} />
      )}
    </div>
  )
}
