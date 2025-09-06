import { OrdersSkeleton } from "@/components/orders-skeleton"

export default function OrdersLoading() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <OrdersSkeleton />
    </div>
  )
}
