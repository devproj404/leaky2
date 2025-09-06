import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getPaymentStatus } from "@/lib/nowpayments-server"

export async function GET(request: NextRequest) {
  // Create Supabase client inside the function to avoid build-time initialization
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentId = searchParams.get("id")

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 })
    }

    // Get the payment from the database using admin client
    const { data: payment, error } = await supabaseAdmin
      .from("crypto_payments")
      .select("*")
      .eq("payment_id", paymentId)
      .single()

    if (error || !payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // For development/testing without real payments, return the current status from the database
    if (process.env.NODE_ENV === "development" && process.env.USE_REAL_PAYMENTS !== "true") {
      return NextResponse.json({
        status: payment.payment_status,
        updated_at: payment.updated_at,
      })
    }

    // Get the latest status from NOWPayments
    const paymentStatus = await getPaymentStatus(paymentId)

    // Update the payment status in the database if it has changed
    if (paymentStatus.payment_status !== payment.payment_status) {
      await supabaseAdmin
        .from("crypto_payments")
        .update({
          payment_status: paymentStatus.payment_status,
          updated_at: new Date().toISOString(),
        })
        .eq("payment_id", paymentId)

      // If payment is confirmed or completed, upgrade the user to premium
      if (
        (paymentStatus.payment_status === "confirmed" || paymentStatus.payment_status === "complete") &&
        payment.product_type === "premium"
      ) {
        // Update user's premium status
        await supabaseAdmin
          .from("profiles")
          .update({
            is_premium: true,
            premium_since: new Date().toISOString(),
          })
          .eq("id", payment.user_id)
      }
    }

    return NextResponse.json({
      status: paymentStatus.payment_status,
      updated_at: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to check payment status" }, { status: 500 })
  }
}
