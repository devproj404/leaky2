"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Crown, CreditCard, Check, AlertCircle, Loader2, LogIn, Bitcoin } from "lucide-react"
import { useRouter } from "next/navigation"
import { AuthModal } from "./auth-modal"
import type { CryptoCurrency, CryptoNetwork } from "@/lib/nowpayments-service"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { CryptoCurrencySelector } from "./crypto-currency-selector"

// Mock payment processing - in a real app, you'd integrate with Stripe, PayPal, etc.
const processMockPayment = async (): Promise<{ success: boolean; transactionId: string }> => {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Simulate successful payment 95% of the time
  const success = Math.random() > 0.05

  return {
    success,
    transactionId: success ? `txn_${Math.random().toString(36).substring(2, 15)}` : "",
  }
}

interface PremiumPurchaseProps {
  overridePremium?: boolean
  showPaymentOptions?: boolean
}

export function PremiumPurchase({ overridePremium, showPaymentOptions = true }: PremiumPurchaseProps) {
  const { user, session, isPremium: authIsPremium, upgradeToPremium } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"credit_card" | "crypto">(
    showPaymentOptions ? "credit_card" : "crypto",
  )

  // Crypto payment flow states
  const [isCurrencyDialogOpen, setIsCurrencyDialogOpen] = useState(false)
  const [availableCurrencies, setAvailableCurrencies] = useState<CryptoCurrency[]>([])
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency | null>(null)
  const [cryptoStep, setCryptoStep] = useState<'currency' | 'network'>('currency')

  // When showPaymentOptions changes, default to crypto if options are hidden
  useEffect(() => {
    if (!showPaymentOptions) {
      setPaymentMethod("crypto")
    }
  }, [showPaymentOptions])

  // Use the override value if provided, otherwise use the value from auth context
  const isPremium = overridePremium !== undefined ? overridePremium : authIsPremium

  // Premium price
  const premiumPrice = 99.99

  // Fetch available currencies
  const fetchCurrencies = async () => {
    setIsLoadingCurrencies(true)
    setError(null)

    try {
      const response = await fetch("/api/payments/currencies", {
        credentials: "include", // Include cookies for auth
      })

      if (!response.ok) {
        throw new Error("Failed to fetch available cryptocurrencies")
      }

      const data = await response.json()
      console.log("Available currencies:", data)
      setAvailableCurrencies(data)
    } catch (err: any) {
      console.error("Error fetching currencies:", err)
      setError(err.message || "Failed to load available cryptocurrencies")
    } finally {
      setIsLoadingCurrencies(false)
    }
  }

  const handleCreditCardPurchase = async () => {
    if (!user) {
      // Show login modal instead of error message
      setIsAuthModalOpen(true)
      return
    }

    if (isPremium) {
      setError("You already have premium access")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Process payment (mock)
      const { success, transactionId } = await processMockPayment()

      if (!success) {
        setError("Payment processing failed. Please try again.")
        setIsProcessing(false)
        return
      }

      // Record purchase and upgrade user to premium
      const result = await upgradeToPremium({
        amount: premiumPrice,
        paymentMethod: "credit_card",
        transactionId,
      })

      if (!result.success) {
        setError(result.error || "Failed to upgrade account. Please contact support.")
        return
      }

      // Show success message
      setSuccess(true)

      // Redirect to profile page after a delay
      setTimeout(() => {
        router.push("/profile")
        router.refresh()
      }, 2000)
    } catch (err: any) {
      console.error("Error processing premium purchase:", err)
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCryptoPurchase = async () => {
    // Clear any previous errors
    setError(null)

    // Check if user is logged in
    if (!user || !session) {
      console.log("User not authenticated, showing login modal")
      setIsAuthModalOpen(true)
      return
    }

    if (isPremium) {
      setError("You already have premium access")
      return
    }

    // Fetch available currencies and open the currency selection dialog
    await fetchCurrencies()
    setIsCurrencyDialogOpen(true)
  }

  const handleCurrencySelect = (currency: CryptoCurrency) => {
    setSelectedCurrency(currency)

    // If the currency has multiple networks, show network selection
    if (currency.has_multiple_networks && currency.networks && currency.networks.length > 0) {
      setCryptoStep('network')
    } else {
      // Otherwise, proceed with the payment using the default network
      createPayment(currency.payment_code)
    }
  }

  const handleNetworkSelect = (network: CryptoNetwork) => {
    // Proceed with payment using the selected network
    createPayment(network.payment_code)
  }

  const handleBackToCurrency = () => {
    setCryptoStep('currency')
    setSelectedCurrency(null)
  }

  const createPayment = async (paymentCode: string) => {
    setIsProcessing(true)
    setError(null)
    setIsCurrencyDialogOpen(false) // Close dialog when processing

    try {
      console.log("Creating payment with currency code:", paymentCode)
      console.log("User ID:", user?.id)

      if (!user?.id) {
        throw new Error("User ID is missing. Please log in again.")
      }

      // Create crypto payment
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency: paymentCode,
          userId: user.id,
          productType: "premium",
        }),
        credentials: "include", // Use include to ensure cookies are sent
      })

      const responseText = await response.text()
      console.log("Raw response from payment API:", responseText)

      let paymentData
      try {
        paymentData = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse payment response:", responseText)
        throw new Error(`Failed to parse payment response: ${responseText.substring(0, 100)}...`)
      }

      if (!response.ok) {
        console.error("Error response from payment API:", paymentData)
        throw new Error(paymentData.error || `Server error: ${response.status}`)
      }

      console.log("Payment created successfully:", paymentData)

      // Redirect to payment page
      if (paymentData.redirect_url) {
        router.push(paymentData.redirect_url)
      } else if (paymentData.payment_id) {
        router.push(`/payment/${paymentData.payment_id}`)
      } else {
        throw new Error("No payment ID or redirect URL returned")
      }
    } catch (err: any) {
      console.error("Error processing crypto payment:", err)

      // Check if the error is authentication-related
      if (err.message.includes("Authentication required") || err.message.includes("401")) {
        setError("Please log in to continue with your purchase")
        setIsAuthModalOpen(true)
      } else {
        setError(err.message || "An unexpected error occurred")
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePurchase = () => {
    // Always clear previous errors when starting a new purchase
    setError(null)

    if (paymentMethod === "credit_card") {
      handleCreditCardPurchase()
    } else {
      handleCryptoPurchase()
    }
  }

  // Handle auth modal close - attempt purchase again if user is now logged in
  const handleAuthModalClose = () => {
    setIsAuthModalOpen(false)

    // If user is now logged in after closing the modal, try the purchase again
    if (user) {
      setTimeout(() => {
        handlePurchase()
      }, 500) // Small delay to ensure auth state is fully updated
    }
  }

  if (isPremium) {
    return (
      <div className="bg-gradient-to-b from-amber-900/30 to-black border border-amber-500/50 rounded-xl p-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.2)]">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Crown className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-amber-400 mb-2">You're a Premium Member!</h3>
        <p className="text-gray-300 mb-4">You already have lifetime access to all premium content and features.</p>
        <Button
          onClick={() => router.push("/premium-content")}
          className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]"
        >
          Browse Premium Content
        </Button>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-2 text-red-200 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-900/20 border border-green-800 rounded-lg flex items-center gap-2 text-green-200 text-sm">
          <Check className="w-5 h-5 flex-shrink-0" />
          <span>Successfully upgraded to premium! Redirecting to your profile...</span>
        </div>
      )}

      {/* Payment method selection - only show if showPaymentOptions is true */}
      {showPaymentOptions && (
        <div className="mb-4">
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setPaymentMethod("credit_card")}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                paymentMethod === "credit_card"
                  ? "bg-pink-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Credit Card</span>
            </button>
            <button
              onClick={() => setPaymentMethod("crypto")}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                paymentMethod === "crypto" ? "bg-amber-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Bitcoin className="w-4 h-4" />
              <span>Crypto</span>
            </button>
          </div>
        </div>
      )}

      <Button
        onClick={handlePurchase}
        disabled={isProcessing || success}
        className={`w-full py-3 ${
          !showPaymentOptions || paymentMethod === "crypto"
            ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            : "bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
        }`}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : !user ? (
          <>
            <LogIn className="mr-2 h-4 w-4" />
            Login to Upgrade
          </>
        ) : (
          <>
            {!showPaymentOptions || paymentMethod === "crypto" ? (
              <Bitcoin className="mr-2 h-4 w-4" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Upgrade Now - ${premiumPrice}
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        By upgrading, you agree to our Terms of Service and Privacy Policy. Lifetime access means as long as our service
        exists.
      </p>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={handleAuthModalClose} />

      {/* Cryptocurrency Selection Dialog */}
      <Dialog open={isCurrencyDialogOpen} onOpenChange={(open) => {
        setIsCurrencyDialogOpen(open)
        if (!open) {
          setCryptoStep('currency')
          setSelectedCurrency(null)
        }
      }}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-gradient-to-b from-gray-950 to-black border border-gray-700/50 shadow-2xl" style={{ maxHeight: '85vh' }}>
          <DialogTitle className="sr-only">Choose Your Cryptocurrency</DialogTitle>
          <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
            <h2 className="text-xl font-bold text-white">Premium Membership - ${premiumPrice}</h2>
            <p className="text-gray-400 text-sm mt-1">Choose your preferred payment method</p>
          </div>

          <div className="p-6">
            {isLoadingCurrencies ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                <p className="ml-3 text-gray-400">Loading currencies...</p>
              </div>
            ) : (
              <CryptoCurrencySelector
                onCurrencySelect={handleCurrencySelect}
                onNetworkSelect={handleNetworkSelect}
                onBack={handleBackToCurrency}
                isLoading={isProcessing}
                error={error}
                step={cryptoStep}
                selectedCurrency={selectedCurrency}
                availableCurrencies={availableCurrencies}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
