"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, Copy, ExternalLink, AlertCircle, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { QRCodeSVG } from "qrcode.react"

interface Payment {
  payment_id: string
  pay_address: string
  pay_amount: number
  pay_currency: string
  price_amount: number
  price_currency: string
  payment_status: string
  created_at: string
}

export function CryptoPayment({ payment }: { payment: Payment }) {
  const router = useRouter()
  const [status, setStatus] = useState(payment.payment_status)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(3600) // 1 hour in seconds (60 * 60)
  const [copied, setCopied] = useState(false)

  // Format the payment amount with appropriate decimal places
  const formattedAmount = payment.pay_amount.toFixed(
    payment.pay_currency === "btc" ? 8 : payment.pay_currency === "eth" ? 6 : 4,
  )

  // Check payment status periodically
  useEffect(() => {
    if (status === "confirmed" || status === "complete" || status === "finished") {
      return
    }

    const checkStatus = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/payments/status?id=${payment.payment_id}`, {
          credentials: "include", // Include cookies for authentication
        })

        if (!response.ok) {
          // Don't throw an error, just log it and continue
          console.error("Error checking payment status:", response.statusText)
          setError(`Status check error: ${response.status}. Will retry...`)
          setIsLoading(false)
          return
        }

        const data = await response.json()
        setStatus(data.payment_status || data.status)
        setError(null) // Clear any previous errors

        if (
          data.payment_status === "confirmed" ||
          data.payment_status === "complete" ||
          data.payment_status === "finished"
        ) {
          // Redirect to success page after a delay
          setTimeout(() => {
            router.push("/payment/success")
          }, 3000)
        }
      } catch (err) {
        console.error("Error checking payment status:", err)
        // Don't set error state to avoid showing error messages to user
      } finally {
        setIsLoading(false)
      }
    }

    // Check immediately and then every 30 seconds
    checkStatus()
    const interval = setInterval(checkStatus, 30000)

    return () => clearInterval(interval)
  }, [payment.payment_id, router, status])

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || status === "confirmed" || status === "complete" || status === "finished") {
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown, status])

  // Format countdown time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Copy address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy:", err)
      })
  }

  // Get payment status display
  const getStatusDisplay = () => {
    switch (status) {
      case "waiting":
        return {
          icon: <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />,
          text: "Waiting for Payment",
          description: "Please send the exact amount to the address below.",
          color: "text-amber-500",
        }
      case "confirming":
        return {
          icon: <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />,
          text: "Confirming Payment",
          description: "Your transaction is being confirmed on the blockchain.",
          color: "text-blue-500",
        }
      case "confirmed":
      case "complete":
      case "finished":
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          text: "Payment Successful",
          description: "Your payment has been confirmed. Redirecting to success page...",
          color: "text-green-500",
        }
      case "partially_paid":
        return {
          icon: <AlertCircle className="w-6 h-6 text-amber-500" />,
          text: "Partially Paid",
          description: "You've sent a partial payment. Please send the remaining amount.",
          color: "text-amber-500",
        }
      case "failed":
      case "refunded":
      case "expired":
        return {
          icon: <AlertCircle className="w-6 h-6 text-red-500" />,
          text: "Payment Failed",
          description: "Your payment has failed or expired. Redirecting to cancel page...",
          color: "text-red-500",
        }
      default:
        return {
          icon: <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />,
          text: "Processing",
          description: "Your payment is being processed.",
          color: "text-gray-500",
        }
    }
  }

  const statusDisplay = getStatusDisplay()

  return (
    <Card className="border border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950 shadow-xl">
      <CardHeader className="border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 pb-6">
        <div className="flex items-center justify-center mb-3">
          {statusDisplay.icon}
          <CardTitle className={`ml-2 ${statusDisplay.color} text-2xl`}>{statusDisplay.text}</CardTitle>
        </div>
        <CardDescription className="text-center text-gray-300 text-base">{statusDisplay.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {error && <div className="bg-red-900/20 border border-red-800 rounded p-3 text-red-200 text-sm">{error}</div>}

        {(status === "waiting" || status === "partially_paid") && (
          <>
            {/* Status Information Panel */}
            <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-300 mb-1">Payment Status: Waiting</h3>
                  <p className="text-xs text-blue-200/80 leading-relaxed">
                    Your payment address has been generated. Send the exact amount shown below to complete your purchase. 
                    The transaction will appear on the blockchain once you send the payment.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="bg-white p-3 rounded-lg shadow-lg">
                <QRCodeSVG
                  value={`${payment.pay_currency}:${payment.pay_address}?amount=${payment.pay_amount}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-5 shadow-inner">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-700">
                <span className="text-gray-300 text-sm font-medium">Amount to send:</span>
                <span className="font-mono font-bold text-lg text-white">
                  {formattedAmount} {payment.pay_currency.toUpperCase()}
                </span>
              </div>
              <div className="mb-4">
                <label className="text-gray-300 text-sm font-medium block mb-2">Payment Address:</label>
                <div className="flex items-center">
                  <div className="bg-gray-700 rounded-l p-3 flex-1 font-mono text-sm overflow-hidden text-ellipsis text-gray-100">
                    {payment.pay_address}
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => copyToClipboard(payment.pay_address)}
                    className="rounded-l-none h-[46px] bg-gray-600 hover:bg-gray-500"
                    title="Copy to clipboard"
                  >
                    {copied ? <CheckCircle className="h-5 w-5 text-green-400" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-center mt-6 mb-2">
                <Clock className="h-5 w-5 text-amber-400 mr-2" />
                <div className="text-center text-amber-400 text-base font-medium">
                  Time remaining: <span className="font-mono">{formatTime(countdown)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-amber-700/30 rounded-lg p-5 text-sm text-amber-200 shadow-md">
              <p className="font-semibold mb-3 text-amber-100 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" /> Important:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-1">
                <li>
                  Send <strong>exactly</strong> {formattedAmount} {payment.pay_currency.toUpperCase()}
                </li>
                <li>Only send {payment.pay_currency.toUpperCase()} to this address</li>
                <li>Payment will expire in {formatTime(countdown)} if not completed</li>
                <li>Transaction may take a few minutes to confirm</li>
                <li className="text-blue-200">
                  <strong>Tracking:</strong> Use "View Address" to see if payment has been sent
                </li>
              </ul>
            </div>
          </>
        )}

        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsLoading(true)
              fetch(`/api/payments/status?id=${payment.payment_id}`, {
                credentials: "include", // Include cookies for authentication
              })
                .then((res) => res.json())
                .then((data) => {
                  setStatus(data.payment_status || data.status)
                  setIsLoading(false)
                })
                .catch((err) => {
                  console.error("Error checking status:", err)
                  setIsLoading(false)
                })
            }}
            disabled={isLoading}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-700 h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Checking Status...
              </>
            ) : (
              <>
                <Loader2 className="mr-2 h-5 w-5" />
                Check Payment Status
              </>
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 pb-4 px-6">
        <Button
          variant="outline"
          onClick={() => router.push("/premium")}
          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            // Determine the block explorer URL based on the currency and payment status
            let explorerUrl = ""
            let currency = payment.pay_currency.toLowerCase()
            
            // Generate appropriate explorer URLs based on currency
            if (currency.includes("btc") || currency === "bitcoin") {
              explorerUrl = `https://www.blockchain.com/explorer/addresses/btc/${payment.pay_address}`
            } else if (currency.includes("eth") || currency === "ethereum") {
              explorerUrl = `https://etherscan.io/address/${payment.pay_address}`
            } else if (currency.includes("ltc") || currency === "litecoin") {
              explorerUrl = `https://blockchair.com/litecoin/address/${payment.pay_address}`
            } else if (currency.includes("doge") || currency === "dogecoin") {
              explorerUrl = `https://blockchair.com/dogecoin/address/${payment.pay_address}`
            } else if (currency.includes("usdt") && currency.includes("trc20")) {
              explorerUrl = `https://tronscan.org/#/address/${payment.pay_address}`
            } else if (currency.includes("usdt") && currency.includes("erc20")) {
              explorerUrl = `https://etherscan.io/token/0xdac17f958d2ee523a2206206994597c13d831ec7?a=${payment.pay_address}`
            } else if (currency.includes("bnb")) {
              explorerUrl = `https://bscscan.com/address/${payment.pay_address}`
            } else if (currency.includes("xrp")) {
              explorerUrl = `https://xrpscan.com/account/${payment.pay_address}`
            } else {
              // Fallback to Blockchair for other currencies
              explorerUrl = `https://blockchair.com/search?q=${payment.pay_address}`
            }

            window.open(explorerUrl, "_blank")
          }}
          className="bg-blue-600 hover:bg-blue-700"
          title={
            status === "waiting" 
              ? "View payment address on blockchain explorer. Transactions will appear here once payment is sent."
              : "View transactions for this address on blockchain explorer"
          }
        >
          <ExternalLink className="w-4 h-4 mr-2" />
{status === "waiting" ? "View Payment Address" : "Track Transaction"}
        </Button>
      </CardFooter>
    </Card>
  )
}
