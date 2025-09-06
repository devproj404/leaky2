"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Mail, Lock, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, signUp } = useAuth()

  // Handle visibility with animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Lock body scroll
      document.body.style.overflow = "hidden"
    } else {
      // Unlock body scroll
      document.body.style.overflow = ""
      // Delay hiding to allow animation
      const timer = setTimeout(() => {
        setIsVisible(false)
        // Reset form state when modal is closed
        setEmail("")
        setPassword("")
        setName("")
        setError(null)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Update the handleLogin function to properly validate inputs
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate inputs
    if (!email.trim()) {
      setError("Email is required")
      setIsLoading(false)
      return
    }

    if (!password) {
      setError("Password is required")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signIn(email.trim(), password)
      if (error) {
        setError(error.message || "Failed to sign in")
      } else {
        onClose()
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  // Update the handleSignup function to properly validate inputs
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate inputs
    if (!name.trim()) {
      setError("Name is required")
      setIsLoading(false)
      return
    }

    if (!email.trim()) {
      setError("Email is required")
      setIsLoading(false)
      return
    }

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await signUp(email.trim(), password, { full_name: name.trim() })
      if (error) {
        setError(error.message || "Failed to create account")
      } else {
        setError(null)
        // Show success message or switch to login mode
        setMode("login")
        setEmail("")
        setPassword("")
        setName("")
        alert("Check your email for the confirmation link!")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during signup")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible && !isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClose}
    >
      <div
        className={`bg-[#121212] border border-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-auto transition-all duration-300 transform ${
          isOpen ? "scale-100" : "scale-95"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-800"
            aria-label="Close"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-sm">{error}</div>
          )}

          {mode === "login" ? (
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#1a1a1a] border border-gray-700 text-gray-200 pl-10 pr-4 py-2.5 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                    Password
                  </label>
                  <a href="#" className="text-sm text-pink-400 hover:text-pink-300">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#1a1a1a] border border-gray-700 text-gray-200 pl-10 pr-4 py-2.5 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-700 bg-[#1a1a1a] text-pink-500 focus:ring-pink-500"
                  disabled={isLoading}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <Button
                type="submit"
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSignup}>
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-[#1a1a1a] border border-gray-700 text-gray-200 pl-10 pr-4 py-2.5 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#1a1a1a] border border-gray-700 text-gray-200 pl-10 pr-4 py-2.5 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Enter your email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="signup-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#1a1a1a] border border-gray-700 text-gray-200 pl-10 pr-4 py-2.5 rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Create a password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-gray-700 bg-[#1a1a1a] text-pink-500 focus:ring-pink-500"
                    disabled={isLoading}
                  />
                </div>
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                  I agree to the{" "}
                  <a href="/tos" className="text-pink-400 hover:text-pink-300">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-pink-400 hover:text-pink-300">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">
              {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            </span>{" "}
            <button
              type="button"
              className="text-pink-400 hover:text-pink-300 font-medium"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              disabled={isLoading}
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
