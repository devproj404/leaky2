"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { X, Bitcoin, ChevronRight, Loader2, MessageCircle, DollarSign, Zap, Shield, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { CryptoCurrencySelector } from "@/components/crypto-currency-selector"
import type { CryptoCurrency, CryptoNetwork } from "@/lib/nowpayments-service"

interface Product {
  id: number
  name: string
  price: number
  discounted_price: number | null
  image_url?: string
}

interface BuyNowButtonProps {
  product: Product
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  fullWidth?: boolean
}

export function BuyNowButton({
  product,
  variant = "default",
  size = "default",
  className = "",
  fullWidth = false,
}: BuyNowButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<"initial" | "currency" | "network" | "processing">("initial")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Crypto payment states
  const [availableCurrencies, setAvailableCurrencies] = useState<CryptoCurrency[]>([])
  const [selectedCurrency, setSelectedCurrency] = useState<CryptoCurrency | null>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<CryptoNetwork | null>(null)

  const price = product.discounted_price || product.price

  const handleBuyNow = () => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    setIsCheckoutOpen(true)
    setCheckoutStep("initial")
    setError(null)
  }

  const handleSelectCrypto = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/payments/currencies", {
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch available cryptocurrencies")
      }

      const data = await response.json()
      setAvailableCurrencies(data)
      setCheckoutStep("currency")
    } catch (err: any) {
      console.error("Error fetching currencies:", err)
      setError(err.message || "Failed to load available cryptocurrencies")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCurrencySelect = (currency: CryptoCurrency) => {
    setSelectedCurrency(currency)

    if (currency.has_multiple_networks && currency.networks && currency.networks.length > 0) {
      setCheckoutStep("network")
    } else {
      createPayment(currency.payment_code)
    }
  }

  const handleNetworkSelect = (network: CryptoNetwork) => {
    setSelectedNetwork(network)
    createPayment(network.payment_code)
  }

  const createPayment = async (paymentCode: string) => {
    setCheckoutStep("processing")
    setIsLoading(true)
    setError(null)

    try {
      if (!user?.id) {
        throw new Error("User ID is missing. Please log in again.")
      }

      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currency: paymentCode,
          userId: user.id,
          productId: product.id,
          productType: "shop",
          amount: price,
        }),
        credentials: "include",
      })

      const responseText = await response.text()

      let paymentData
      try {
        paymentData = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse payment response:", responseText)
        throw new Error(`Failed to parse payment response: ${responseText.substring(0, 100)}...`)
      }

      if (!response.ok) {
        throw new Error(paymentData.error || `Server error: ${response.status}`)
      }

      // Close modal and redirect to payment page
      setIsCheckoutOpen(false)

      if (paymentData.redirect_url) {
        router.push(paymentData.redirect_url)
      } else if (paymentData.payment_id) {
        router.push(`/payment/${paymentData.payment_id}`)
      } else {
        throw new Error("No payment ID or redirect URL returned")
      }
    } catch (err: any) {
      console.error("Error processing crypto payment:", err)
      setError(err.message || "An unexpected error occurred")
      setCheckoutStep("initial")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTelegramPayment = () => {
    // Here you would implement the logic to redirect to Telegram or show Telegram contact info
    window.open("https://t.me/GoldenDragonTeam", "_blank")
    setIsCheckoutOpen(false)
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={`${className} ${fullWidth ? "w-full" : ""}`}
        onClick={handleBuyNow}
      >
        Buy Now
      </Button>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-gradient-to-b from-gray-950 to-black border border-gray-700/50 shadow-2xl"  style={{ maxHeight: '85vh' }}>
          <DialogTitle className="sr-only">Complete Your Purchase</DialogTitle>
          <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
            <h2 className="text-xl font-bold text-white">Complete Your Purchase</h2>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="bg-gray-900 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">{product.name}</h3>
                  <p className="text-sm text-gray-400">Price</p>
                </div>
                <div className="text-xl font-bold">${price.toFixed(2)}</div>
              </div>
            </div>

            {checkoutStep === "initial" && (
              <>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">Choose Payment Method</h3>
                  <p className="text-sm text-gray-400">Select how you'd like to complete your purchase</p>
                </div>

                <div className="space-y-4">
                  <button
                    className="group relative overflow-hidden w-full rounded-xl p-6 bg-gradient-to-r from-orange-600/80 to-yellow-600/80 hover:from-orange-500/90 hover:to-yellow-500/90 border border-orange-500/50 hover:border-orange-400/70 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={handleSelectCrypto}
                    disabled={isLoading}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                          {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <Bitcoin className="w-6 h-6" />
                          )}
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-white text-lg leading-tight">
                            Cryptocurrency
                          </div>
                          <div className="text-sm text-orange-100/80">
                            Bitcoin, Ethereum, USDT & more
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1 bg-green-500/30 rounded-full">
                          <Shield className="w-3 h-3 text-green-300" />
                          <span className="text-xs text-green-200 font-medium">Secure</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-orange-200 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </button>

                  <button
                    className="group relative overflow-hidden w-full rounded-xl p-6 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500/90 hover:to-purple-500/90 border border-blue-500/50 hover:border-blue-400/70 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
                    onClick={handleTelegramPayment}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                          <MessageCircle className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-white text-lg leading-tight">
                            Telegram Payment
                          </div>
                          <div className="text-sm text-blue-100/80">
                            Direct contact with our team
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/30 rounded-full">
                          <Zap className="w-3 h-3 text-blue-300" />
                          <span className="text-xs text-blue-200 font-medium">Fast</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-blue-200 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-gray-800/20 to-gray-700/20 border border-gray-600/30 rounded-lg">
                  <p className="text-xs text-gray-400 text-center leading-relaxed">
                    By purchasing, you agree to our <span className="text-gray-300">Terms of Service</span> and <span className="text-gray-300">Privacy Policy</span>.
                    <br />
                    <span className="text-gray-300">Lifetime access</span> means as long as our service exists.
                  </p>
                </div>
              </>
            )}

            {(checkoutStep === "currency" || checkoutStep === "network") && (
              <CryptoCurrencySelector
                onCurrencySelect={handleCurrencySelect}
                onNetworkSelect={handleNetworkSelect}
                onBack={() => setCheckoutStep("currency")}
                isLoading={isLoading}
                error={error}
                step={checkoutStep}
                selectedCurrency={selectedCurrency}
                availableCurrencies={availableCurrencies}
              />
            )}


            {checkoutStep === "processing" && (
              <div className="text-center py-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Loader2 className="h-10 w-10 animate-spin text-white" />
                  </div>
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Processing Your Payment</h3>
                <p className="text-sm text-gray-400 mb-4">Setting up your secure cryptocurrency payment...</p>
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
