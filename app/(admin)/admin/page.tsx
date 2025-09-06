"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Shield, Users, FileText, ShoppingBag, Loader2, AlertTriangle, BarChart3, Package, Calendar, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAuth()

  // Check if user is authenticated and admin
  useEffect(() => {
    // If auth is still loading, wait
    if (isLoading) return

    // If user is not logged in, redirect to login
    if (!user) {
      router.push("/?authRequired=true")
      return
    }

    // In production, if user is not admin, redirect to home
    if (!isAdmin && process.env.NODE_ENV === "production") {
      router.push("/")
    }
  }, [user, isAdmin, isLoading, router])

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

  // Development mode banner for non-admin users
  const showDevModeBanner = process.env.NODE_ENV === "development" && !isAdmin

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {showDevModeBanner && (
        <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/20 border border-amber-500/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-amber-400 font-medium">Development Mode</p>
              <p className="text-gray-300 text-sm">
                You're viewing the admin panel in development mode. In production, only users with admin privileges can
                access this page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text flex items-center gap-2">
            <Shield className="h-8 w-8 text-pink-500" />
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Manage your site content, users, and settings</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-pink-800/40 text-gray-300 hover:bg-pink-950/30"
          >
            View Site
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/content" className="group">
          <div className="bg-gradient-to-br from-black to-pink-950/30 border border-pink-900/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-pink-900/20 hover:border-pink-800/50 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-400 group-hover:bg-pink-500/20 transition-all">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-pink-300 transition-colors">Content</h2>
            </div>
            <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
              Manage site content and categories
            </p>
            <div className="text-pink-400 group-hover:text-pink-300 flex items-center transition-all">
              Manage Content <span className="ml-1 group-hover:ml-2 transition-all">→</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/users" className="group">
          <div className="bg-gradient-to-br from-black to-blue-950/30 border border-blue-900/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-blue-900/20 hover:border-blue-800/50 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-all">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">Users</h2>
            </div>
            <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
              Manage user accounts and permissions
            </p>
            <div className="text-blue-400 group-hover:text-blue-300 flex items-center transition-all">
              Manage Users <span className="ml-1 group-hover:ml-2 transition-all">→</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/products" className="group">
          <div className="bg-gradient-to-br from-black to-purple-950/30 border border-purple-900/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-purple-900/20 hover:border-purple-800/50 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-all">
                <Package className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors">Products</h2>
            </div>
            <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
              Manage shop products and pricing
            </p>
            <div className="text-purple-400 group-hover:text-purple-300 flex items-center transition-all">
              Manage Products <span className="ml-1 group-hover:ml-2 transition-all">→</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/orders" className="group">
          <div className="bg-gradient-to-br from-black to-green-950/30 border border-green-900/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-green-900/20 hover:border-green-800/50 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400 group-hover:bg-green-500/20 transition-all">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-green-300 transition-colors">Orders</h2>
            </div>
            <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
              View and manage customer orders and payments
            </p>
            <div className="text-green-400 group-hover:text-green-300 flex items-center transition-all">
              View Orders <span className="ml-1 group-hover:ml-2 transition-all">→</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/ads" className="group">
          <div className="bg-gradient-to-br from-black to-orange-950/30 border border-orange-900/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-orange-900/20 hover:border-orange-800/50 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20 transition-all">
                <Monitor className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors">Ad Slots</h2>
            </div>
            <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
              Manage custom advertisement placements
            </p>
            <div className="text-orange-400 group-hover:text-orange-300 flex items-center transition-all">
              Manage Ads <span className="ml-1 group-hover:ml-2 transition-all">→</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/weekly-drops" className="group">
          <div className="bg-gradient-to-br from-black to-indigo-950/30 border border-indigo-900/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-indigo-900/20 hover:border-indigo-800/50 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 transition-all">
                <Calendar className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">Weekly Drops</h2>
            </div>
            <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
              Manage weekly featured content drops
            </p>
            <div className="text-indigo-400 group-hover:text-indigo-300 flex items-center transition-all">
              Manage Drops <span className="ml-1 group-hover:ml-2 transition-all">→</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/analytics" className="group">
          <div className="bg-gradient-to-br from-black to-amber-950/30 border border-amber-900/50 p-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-amber-900/20 hover:border-amber-800/50 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-all">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors">Analytics</h2>
            </div>
            <p className="text-gray-400 mb-4 group-hover:text-gray-300 transition-colors">
              View site statistics and performance
            </p>
            <div className="text-amber-400 group-hover:text-amber-300 flex items-center transition-all">
              View Analytics <span className="ml-1 group-hover:ml-2 transition-all">→</span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
