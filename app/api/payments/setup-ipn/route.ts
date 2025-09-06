import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

// This endpoint helps configure the IPN URL in the NOWPayments dashboard
export async function GET(request: NextRequest) {
  try {
    // Get the Supabase client
    const supabase = createClient()

    // Check if user is admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get the base URL for the application
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    const ipnUrl = `${baseUrl}/api/payments/webhook`

    return NextResponse.json({
      ipn_callback_url: ipnUrl,
      instructions: [
        "1. Log in to your NOWPayments dashboard",
        "2. Go to Store Settings",
        "3. Set the IPN callback URL to the value above",
        "4. Copy your IPN Secret Key and add it to your environment variables as NOWPAYMENTS_IPN_SECRET",
      ],
    })
  } catch (error: any) {
    console.error("Error generating IPN setup info:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
