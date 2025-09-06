"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function AuthRedirectHandler() {
  const { user, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const redirectTo = searchParams.get("redirectTo")

  useEffect(() => {
    // Only handle redirects when auth state is fully loaded and we have a redirectTo parameter
    if (!isLoading && redirectTo && user) {
      // If user is authenticated and we have a redirectTo, navigate there
      router.push(redirectTo)
    }
  }, [isLoading, redirectTo, user, router])

  // This component doesn't render anything visible
  return null
}
