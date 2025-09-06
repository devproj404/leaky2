"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/lib/cart-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PremiumPurchase } from "@/components/premium-purchase"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth-modal"

export function CheckoutModal() {
  const { isCheckoutOpen, setIsCheckoutOpen, items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Prevent hydration errors
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Reset payment state when modal closes
  useEffect(() => {
    if (!isCheckoutOpen) {
      setShowPayment(false)
    }
  }, [isCheckoutOpen])

  const handleProceedToPayment = () => {
    if (!user) {
      setIsAuthModalOpen(true)
    } else {
      setShowPayment(true)
    }
  }

  const handlePaymentSuccess = () => {
    setIsCheckoutOpen(false)
    clearCart()
    // You could redirect to a success page or show a success message
  }

  if (!isMounted) {
    return null
  }

  return (
    <>
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{showPayment ? "Payment" : "Checkout"}</DialogTitle>
          </DialogHeader>

          {!showPayment ? (
            <div className="space-y-4">
              <div className="max-h-[40vh] overflow-auto space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b border-gray-800">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${((item.discounted_price || item.price) * item.quantity).toFixed(2)}
                      </p>
                      {item.discounted_price && (
                        <p className="text-xs text-gray-400 line-through">${(item.price * item.quantity).toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600"
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <PremiumPurchase
                amount={subtotal}
                productName={`Order: ${items.map((item) => item.name).join(", ")}`}
                onSuccess={handlePaymentSuccess}
                embedded={true}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}
