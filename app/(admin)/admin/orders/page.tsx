"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Loader2, Search, ExternalLink, RefreshCw, CheckCircle, Clock, XCircle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

type CryptoPayment = {
  id: number
  user_id: string
  product_id?: number
  product_type: string
  amount: number
  currency: string
  payment_id: string
  payment_status: string
  created_at: string
  updated_at: string
  order_id?: number
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAuth()
  const [cryptoPayments, setCryptoPayments] = useState<CryptoPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const supabase = createClientComponentClient()

  // Check if user is authenticated and admin
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push("/?authRequired=true")
      return
    }

    if (!isAdmin) {
      router.push("/")
    }
  }, [user, isAdmin, isLoading, router])

  // Fetch crypto payments
  useEffect(() => {
    async function fetchPayments() {
      try {
        setLoading(true)

        // Directly fetch crypto payments
        const { data: cryptoData, error: cryptoError } = await supabase
          .from("crypto_payments")
          .select("*")
          .order("created_at", { ascending: false })

        if (cryptoError) {
          setError(`Failed to load payments: ${cryptoError.message}`)
        } else {
          setCryptoPayments(cryptoData || [])
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data")
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    }

    if (user && isAdmin) {
      fetchPayments()
    }
  }, [user, isAdmin, supabase, refreshing])

  const handleRefresh = () => {
    setRefreshing(true)
  }

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredCryptoPayments = cryptoPayments.filter(
    (payment) =>
      payment.product_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.currency?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    if (status === "confirmed" || status === "finished") {
      return <CheckCircle className="h-4 w-4 text-green-400 mr-1.5" />
    } else if (status === "waiting") {
      return <Clock className="h-4 w-4 text-yellow-400 mr-1.5" />
    } else {
      return <XCircle className="h-4 w-4 text-red-400 mr-1.5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // If still loading auth, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // If user is not logged in, show login message
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Admin Access Required</h1>
          <p className="text-gray-400 mb-6">You need to log in with an admin account to access this page.</p>
          <Button
            onClick={() => router.push("/?authRequired=true")}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
          >
            Log In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Cryptocurrency Payments</h1>
          <p className="text-gray-400">View and manage all cryptocurrency transactions</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/admin")}
            variant="outline"
            className="border-pink-800/40 text-gray-300 hover:bg-pink-950/30"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
          >
            {refreshing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
          <Button
            onClick={() => setError(null)}
            variant="outline"
            className="mt-2 border-red-800/40 text-red-300 hover:bg-red-950/30"
            size="sm"
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 focus:outline-none"
          />
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {filteredCryptoPayments.length} payment{filteredCryptoPayments.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-pink-500 animate-spin mr-2" />
          <p className="text-gray-400">Loading payments...</p>
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
          {filteredCryptoPayments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800/50 mb-4">
                <Search className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No payments found</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {searchTerm
                  ? "No payments match your search criteria. Try adjusting your search terms."
                  : "There are no cryptocurrency payments in the system yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/70 border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Payment Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredCryptoPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-white">#{payment.id}</span>
                            <Badge variant="secondary" className="ml-2 bg-gray-800 text-gray-300">
                              {formatDate(payment.created_at)}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-1 group">
                            <div className="text-xs text-gray-400 truncate max-w-[180px] group-hover:text-gray-300">
                              {payment.payment_id}
                            </div>
                            <button
                              onClick={() => copyToClipboard(payment.payment_id, payment.id)}
                              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Copy payment ID"
                            >
                              {copiedId === payment.id ? (
                                <span className="text-xs text-green-400">Copied!</span>
                              ) : (
                                <Copy className="h-3 w-3 text-gray-500 hover:text-gray-300" />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white truncate max-w-[150px]" title={payment.user_id}>
                          {payment.user_id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">
                          {payment.product_type === "premium" ? (
                            <Badge className="bg-gradient-to-r from-pink-600 to-purple-600 text-white border-0">
                              Premium Membership
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-gray-700 text-gray-300">
                              Shop Product #{payment.product_id}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white">${payment.amount.toFixed(2)}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{payment.currency.toUpperCase()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className={`flex items-center text-sm font-medium ${
                            payment.payment_status === "confirmed" || payment.payment_status === "finished"
                              ? "text-green-400"
                              : payment.payment_status === "waiting"
                                ? "text-yellow-400"
                                : "text-red-400"
                          }`}
                        >
                          {getStatusIcon(payment.payment_status)}
                          <span className="capitalize">{payment.payment_status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/payment/${payment.payment_id}`} target="_blank">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4 mr-1.5" /> View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
