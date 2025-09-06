"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"

export default function SettingsPage() {
  const { user, signOut, isLoading } = useAuth()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  // Check authentication on component mount
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/?authRequired=true")
    }
  }, [user, isLoading, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  // Redirect to home if not logged in
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg p-6">
          <h1 className="text-2xl font-bold text-white mb-4">Settings</h1>
          <p className="text-gray-300 mb-4">You need to be logged in to access settings.</p>
          <Link
            href="/?authRequired=true"
            className="inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-500 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    )
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Simulate saving settings
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setMessage("Settings saved successfully!")
    setIsSaving(false)

    // Clear message after 3 seconds
    setTimeout(() => setMessage(""), 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Account Settings</h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
          <form onSubmit={handleSaveSettings}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={user.email || ""}
                disabled
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="mt-1 text-sm text-gray-400">Your email cannot be changed</p>
            </div>

            <div className="mb-4">
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                placeholder="Enter your display name"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-pink-600 rounded-md hover:bg-pink-500 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>

            {message && (
              <div className="mt-4 p-3 bg-green-900/50 border border-green-500 text-green-300 rounded-md">
                {message}
              </div>
            )}
          </form>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>
          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="text-white font-medium">Email Notifications</h3>
              <p className="text-gray-400 text-sm">Receive email updates about new content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between py-3 border-t border-gray-700">
            <div>
              <h3 className="text-white font-medium">Dark Mode</h3>
              <p className="text-gray-400 text-sm">Always use dark mode</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pink-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            </label>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Account Actions</h2>
          <div className="space-y-4">
            <button
              onClick={handleSignOut}
              className="w-full inline-flex items-center justify-center h-10 px-4 font-medium text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
