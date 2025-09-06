"use client"

import { useState } from "react"
import Image from "next/image"
import { format } from "date-fns"
import { Loader2, ChevronDown, ChevronUp, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Order } from "@/lib/order-service"

interface OrderHistoryProps {
  orders: Order[]
  isLoading: boolean
}

export function OrderHistory({ orders, isLoading }: OrderHistoryProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null)

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "pending":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "failed":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-pink-500 animate-spin mr-2" />
        <p className="text-gray-400">Loading your orders...</p>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-800 rounded-lg bg-gray-900/50">
        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-800 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No Orders Yet</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          You haven't made any purchases yet. Check out our shop to find premium content collections.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-gray-800 rounded-lg overflow-hidden bg-gray-900/50 transition-all duration-200"
        >
          <div
            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer hover:bg-gray-800/30"
            onClick={() => toggleOrderDetails(order.id)}
          >
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
                {order.product_image ? (
                  <Image
                    src={order.product_image || "/placeholder.svg"}
                    alt={order.product_name}
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-600">No img</div>
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-white font-medium">{order.product_name}</h3>
                <p className="text-sm text-gray-400">
                  {format(new Date(order.created_at), "MMM d, yyyy")} · ${order.amount.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="flex items-center mt-4 sm:mt-0">
              <Badge variant="outline" className={`mr-3 ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
              {expandedOrderId === order.id ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>

          {expandedOrderId === order.id && (
            <div className="px-4 pb-4 border-t border-gray-800 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Order Details</h4>
                  <div className="bg-black/30 rounded-lg p-3 border border-gray-800">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Order ID</div>
                      <div className="text-gray-300">{order.id}</div>
                      <div className="text-gray-500">Payment Method</div>
                      <div className="text-gray-300">{order.payment_method}</div>
                      <div className="text-gray-500">Transaction ID</div>
                      <div className="text-gray-300 break-all">{order.transaction_id || "N/A"}</div>
                      <div className="text-gray-500">Date</div>
                      <div className="text-gray-300">{format(new Date(order.created_at), "PPP")}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Product Information</h4>
                  <div className="bg-black/30 rounded-lg p-3 border border-gray-800">
                    {order.product ? (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">Size</div>
                        <div className="text-gray-300">{order.product.size}</div>
                        <div className="text-gray-500">Content</div>
                        <div className="text-gray-300">{order.product.count}</div>
                        {order.status === "completed" && order.product.download_link && (
                          <>
                            <div className="text-gray-500">Download</div>
                            <div className="text-gray-300">
                              <a
                                href={order.product.download_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-pink-400 hover:text-pink-300"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Access Content
                              </a>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">No additional product details available</div>
                    )}
                  </div>

                  {order.status === "completed" && order.product?.download_link && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        className="w-full border-pink-800/40 text-pink-400 hover:bg-pink-950/30"
                        onClick={() => window.open(order.product?.download_link, "_blank")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Collection
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
