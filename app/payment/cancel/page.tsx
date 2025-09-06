import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentCancelPage() {
  return (
    <div className="container max-w-md mx-auto py-12 px-4 text-center">
      <div className="bg-red-900/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <XCircle className="w-10 h-10 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-gray-400 mb-6">Your payment was cancelled or did not complete. No charges were made.</p>
      <div className="space-y-4">
        <Button asChild className="w-full bg-gradient-to-r from-amber-600 to-amber-500">
          <Link href="/premium">Try Again</Link>
        </Button>
        <Button asChild variant="outline" className="w-full border-gray-700">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}
