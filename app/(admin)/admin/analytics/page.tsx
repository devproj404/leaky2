"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, LineChart, PieChart, ArrowLeft, Loader2, AlertTriangle, Users, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Types for analytics data
type AnalyticsData = {
  totalUsers: number
  totalContent: number
  totalViews: number
  topContent: ContentAnalytics[]
  contentByCategory: CategoryAnalytics[]
  userGrowth: UserGrowthData[]
}

type ContentAnalytics = {
  id: number
  title: string
  views: number
  category: string
}

type CategoryAnalytics = {
  name: string
  count: number
}

type UserGrowthData = {
  date: string
  count: number
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { user, isAdmin, isLoading } = useAuth()
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalContent: 0,
    totalViews: 0,
    topContent: [],
    contentByCategory: [],
    userGrowth: [],
  })

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user) return

      setIsLoadingData(true)
      setError(null)

      try {
        const supabase = createClientComponentClient()

        // Fetch total users count
        const { count: userCount, error: userError } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })

        if (userError) throw new Error(`Error fetching user count: ${userError.message}`)

        // Fetch total content count
        const { count: contentCount, error: contentError } = await supabase
          .from("content")
          .select("*", { count: "exact", head: true })

        if (contentError) throw new Error(`Error fetching content count: ${contentError.message}`)

        // Fetch total views
        const { data: viewsData, error: viewsError } = await supabase.from("content").select("views")

        if (viewsError) throw new Error(`Error fetching views data: ${viewsError.message}`)

        const totalViews = viewsData?.reduce((sum, item) => sum + (item.views || 0), 0) || 0

        // Fetch top content - removed downloads column
        const { data: topContent, error: topContentError } = await supabase
          .from("content")
          .select(`
            id,
            title,
            views,
            categories:category_id(name)
          `)
          .order("views", { ascending: false })
          .limit(5)

        if (topContentError) throw new Error(`Error fetching top content: ${topContentError.message}`)

        // Fetch content by category
        const { data: categories, error: categoriesError } = await supabase.from("categories").select(`
            name,
            content:content(count)
          `)

        if (categoriesError) throw new Error(`Error fetching categories: ${categoriesError.message}`)

        const contentByCategory =
          categories?.map((category) => ({
            name: category.name,
            count: category.content?.length || 0,
          })) || []

        // Format top content data - removed downloads
        const formattedTopContent =
          topContent?.map((item) => ({
            id: item.id,
            title: item.title,
            views: item.views || 0,
            category: item.categories?.name || "Uncategorized",
          })) || []

        // Set the analytics data
        setAnalyticsData({
          totalUsers: userCount || 0,
          totalContent: contentCount || 0,
          totalViews,
          topContent: formattedTopContent,
          contentByCategory,
          userGrowth: [], // We'll leave this empty for now as it requires more complex queries
        })
      } catch (err: any) {
        console.error("Error fetching analytics data:", err)
        setError(err.message || "Failed to load analytics data")
      } finally {
        setIsLoadingData(false)
      }
    }

    if (user && !isLoading) {
      fetchAnalyticsData()
    }
  }, [user, isLoading])

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
          <p className="text-gray-400">Loading analytics...</p>
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
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-pink-500" />
              Analytics Dashboard
            </h1>
          </div>
          <p className="text-gray-400 mt-1">View site statistics and performance metrics</p>
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

      {isLoadingData ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-pink-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading analytics data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button
              onClick={() => {
                setIsLoadingData(true)
                setError(null)
                setTimeout(() => {
                  const fetchData = async () => {
                    try {
                      // Reload the page to refetch data
                      window.location.reload()
                    } catch (err: any) {
                      setError(err.message || "Failed to load analytics data")
                      setIsLoadingData(false)
                    }
                  }
                  fetchData()
                }, 500)
              }}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/20 border border-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content Analytics</TabsTrigger>
            <TabsTrigger value="users">User Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-black to-pink-950/30 border border-pink-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-pink-400" />
                    Total Users
                  </CardTitle>
                  <CardDescription>Registered users on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{analyticsData.totalUsers.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-black to-purple-950/30 border border-purple-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-400" />
                    Content Views
                  </CardTitle>
                  <CardDescription>Total views across all content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{analyticsData.totalViews.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-black to-blue-950/30 border border-blue-900/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    Total Content
                  </CardTitle>
                  <CardDescription>Items available on the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-white">{analyticsData.totalContent.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-black to-gray-900 border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Top Performing Content</CardTitle>
                <CardDescription>Most viewed content on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topContent.length > 0 ? (
                    analyticsData.topContent.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">{item.views.toLocaleString()} views</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No content data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card className="bg-gradient-to-br from-black to-gray-900 border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Most Viewed Content</CardTitle>
                <CardDescription>Top performing content by views</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topContent.length > 0 ? (
                    analyticsData.topContent.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-0"
                      >
                        <div>
                          <p className="font-medium text-white">{item.title}</p>
                          <p className="text-sm text-gray-400">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">{item.views.toLocaleString()} views</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No content data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-black to-gray-900 border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Content by Category</CardTitle>
                <CardDescription>Distribution of content across categories</CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData.contentByCategory.length > 0 ? (
                  <div className="space-y-4">
                    {analyticsData.contentByCategory.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-gray-800 pb-3 last:border-0"
                      >
                        <p className="font-medium text-white">{category.name}</p>
                        <p className="font-medium text-white">{category.count} items</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No category data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-black to-gray-900 border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">User Overview</CardTitle>
                  <CardDescription>Basic user statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                      <p className="text-gray-400">Total Users</p>
                      <p className="font-medium text-white">{analyticsData.totalUsers.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400">Average Content Views per User</p>
                      <p className="font-medium text-white">
                        {analyticsData.totalUsers > 0
                          ? Math.round(analyticsData.totalViews / analyticsData.totalUsers).toLocaleString()
                          : "0"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-black to-gray-900 border border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">User Growth</CardTitle>
                  <CardDescription>New users over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <LineChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>User growth data not available yet</p>
                      <p className="text-sm mt-2">This feature is coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-black to-gray-900 border border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">User Engagement</CardTitle>
                <CardDescription>Content interaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Detailed engagement metrics coming soon</p>
                    <p className="text-sm mt-2">We're working on collecting more detailed user data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
