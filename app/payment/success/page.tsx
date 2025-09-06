import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  return (
    <div className="container max-w-md mx-auto py-12 px-4 text-center">
      <div className="bg-green-900/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-gray-400 mb-6">
        Your payment has been confirmed and your account has been upgraded to premium.
      </p>
      <div className="space-y-4">
        <Button asChild className="w-full bg-gradient-to-r from-amber-600 to-amber-500">
          <Link href="/premium-content">Browse Premium Content</Link>
        </Button>
        <Button asChild variant="outline" className="w-full border-gray-700">
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}
