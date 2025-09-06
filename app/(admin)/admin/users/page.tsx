"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useAuth } from "@/lib/auth-context"
import { ChevronLeft, Users, Search, Trash, Edit, Shield, Crown, UserIcon } from "lucide-react"
import { toast } from "sonner"
import { updateUserPremiumStatus, updateUserAdminStatus } from "@/lib/admin-actions"

export default function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [processingUser, setProcessingUser] = useState<string | null>(null)
  const { user, isAdmin, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Fetch users data
  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true)
        setError(null)

        // Get all profiles with is_premium field
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        console.log("User data with premium status:", data)
        setUsers(data || [])
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && user) {
      fetchUsers()
    }
  }, [authLoading, user, supabase])

  // Handle authentication and authorization
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/")
    }
  }, [authLoading, user, router])

  // Filter users based on search query
  const filteredUsers = users.filter((user: any) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      (user.email && user.email.toLowerCase().includes(query)) ||
      (user.username && user.username.toLowerCase().includes(query)) ||
      (user.full_name && user.full_name.toLowerCase().includes(query))
    )
  })

  // Toggle admin status using server action
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // If trying to remove admin rights, show error and return
      if (currentStatus === true) {
        setError("Admin rights cannot be removed for security reasons.")
        return
      }

      setProcessingUser(userId)
      setError(null)

      // Use server action to update admin status
      const formData = new FormData()
      formData.append("userId", userId)
      formData.append("isAdmin", currentStatus.toString())

      const result = await updateUserAdminStatus(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to update admin status")
      }

      // Update local state
      setUsers(users.map((u: any) => (u.id === userId ? { ...u, is_admin: true } : u)))
      toast.success("User promoted to admin")
    } catch (err: any) {
      console.error("Error updating admin status:", err)
      setError(`Failed to update admin status: ${err.message}`)
      toast.error("Failed to update admin status")
    } finally {
      setProcessingUser(null)
    }
  }

  // Toggle premium status using server action
  const togglePremiumStatus = async (userId: string, isPremium: boolean) => {
    try {
      setProcessingUser(userId)
      setError(null)

      // Use server action to update premium status
      const formData = new FormData()
      formData.append("userId", userId)
      formData.append("isPremium", isPremium.toString())

      const result = await updateUserPremiumStatus(formData)

      if (!result.success) {
        throw new Error(result.error || "Failed to update premium status")
      }

      console.log("Client received updated user:", result.user)

      // Update local state with the verified data from the server
      setUsers(users.map((u: any) => (u.id === userId ? { ...u, is_premium: result.user.is_premium } : u)))

      toast.success(isPremium ? "User downgraded to free" : "User upgraded to premium")
    } catch (err: any) {
      console.error("Error updating premium status:", err)
      setError(`Failed to update premium status: ${err.message}`)
      toast.error("Failed to update premium status")
    } finally {
      setProcessingUser(null)
    }
  }

  // If still loading auth, show loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  // If not admin in production, show unauthorized message
  if (!isAdmin && process.env.NODE_ENV === "production") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Unauthorized Access</h2>
          <p className="text-gray-300 mb-4">You don't have permission to access this page.</p>
          <Link href="/" className="text-pink-500 hover:text-pink-400">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Development mode banner */}
      {!isAdmin && process.env.NODE_ENV !== "production" && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 text-center">
          <p className="text-yellow-500 font-medium">
            ⚠️ Development Mode: Admin features are accessible without admin privileges
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin" className="mr-4 p-2 rounded-full hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold flex items-center">
            <Users className="mr-2" /> User Management
          </h1>
        </div>
        <Link href="/" className="text-sm text-pink-400 hover:text-pink-300">
          View Site
        </Link>
      </div>

      {/* Search bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users by username or name..."
          className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Users table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Joined
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-500"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url || "/placeholder.svg"}
                              alt=""
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-lg font-medium text-gray-300">
                              {(user.username || user.email || "U")[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-200">{user.username || "No username"}</div>
                          <div className="flex items-center mt-1">
                            {user.is_premium ? (
                              <>
                                <Crown className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                                <span className="text-xs text-yellow-500 font-medium">Premium</span>
                              </>
                            ) : (
                              <>
                                <UserIcon className="h-3.5 w-3.5 text-gray-400 mr-1" />
                                <span className="text-xs text-gray-400">Free</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.is_admin ? <Shield className="h-4 w-4 text-pink-500 mr-1" /> : null}
                        <span className="text-sm text-gray-300">{user.is_admin ? "Admin" : "User"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Toggle Admin Status Button */}
                        <button
                          onClick={() => toggleAdminStatus(user.id, user.is_admin)}
                          className={`p-1 rounded-full ${
                            user.is_admin
                              ? "bg-gray-500/10 text-gray-500 cursor-not-allowed"
                              : "bg-green-500/10 hover:bg-green-500/20 text-green-500"
                          }`}
                          disabled={user.is_admin || processingUser === user.id}
                          title={user.is_admin ? "Admin rights cannot be removed" : "Make admin"}
                        >
                          {processingUser === user.id ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-current"></div>
                          ) : (
                            <Shield className="h-5 w-5" />
                          )}
                        </button>

                        {/* Toggle Premium Status Button */}
                        <button
                          onClick={() => togglePremiumStatus(user.id, user.is_premium)}
                          disabled={processingUser === user.id}
                          className={`p-1 rounded-full ${
                            user.is_premium
                              ? "bg-red-500/10 hover:bg-red-500/20 text-red-500"
                              : "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500"
                          }`}
                          title={user.is_premium ? "Remove premium" : "Make premium"}
                        >
                          {processingUser === user.id ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-current"></div>
                          ) : (
                            <Crown className="h-5 w-5" />
                          )}
                        </button>

                        {/* Edit User Button */}
                        <button
                          className="p-1 rounded-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
                          title="Edit user"
                        >
                          <Edit className="h-5 w-5" />
                        </button>

                        {/* Delete User Button */}
                        <button
                          className="p-1 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500"
                          title="Delete user"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
