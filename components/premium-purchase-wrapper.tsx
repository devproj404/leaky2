"use client"

import { useState } from "react"
import { PremiumPurchase } from "./premium-purchase"
import { useAuth } from "@/lib/auth-context"

export function PremiumPurchaseWrapper() {
  const { user, isPremium } = useAuth()
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)

  return (
    <div className="max-w-md mx-auto">
      <PremiumPurchase showPaymentOptions={false} />
    </div>
  )
}
