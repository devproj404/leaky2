import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  // Add logging to help with debugging
  console.log("Auth callback received with code:", code ? "Present" : "Missing")

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        // Log more details about the error
        console.log("Error details:", {
          code: error.code,
          message: error.message,
          status: error.status,
        })

        // Redirect to error page or home with error parameter
        return NextResponse.redirect(
          new URL(`/?authError=${encodeURIComponent(error.message || "Unknown error")}`, request.url),
        )
      }

      console.log("Session exchange successful, user authenticated:", data.session ? "Yes" : "No")
    } catch (err) {
      console.error("Exception during code exchange:", err)
      return NextResponse.redirect(new URL("/?authError=exchange_failed", request.url))
    }
  } else {
    console.warn("No code parameter found in callback URL")
    return NextResponse.redirect(new URL("/?authError=no_code", request.url))
  }

  // Get the intended redirect URL from the state parameter or default to profile
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/profile"

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
