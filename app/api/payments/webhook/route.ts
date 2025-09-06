import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { isPaymentCompleted } from "@/lib/nowpayments-service"
import crypto from "crypto"

// Function to verify NOWPayments IPN signature
function verifyIPNSignature(signature: string | null, payload: string, secret: string): boolean {
  if (!signature) return false

  // Create HMAC using the IPN secret
  const hmac = crypto.createHmac("sha512", secret)
  hmac.update(payload)
  const calculatedSignature = hmac.digest("hex")

  // Compare signatures
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature))
}

// IPN (Instant Payment Notification) webhook handler
export async function POST(request: NextRequest) {
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text()
    const body = JSON.parse(rawBody)

    console.log("Received IPN webhook:", JSON.stringify(body))

    // Verify the IPN signature in production
    if (process.env.NODE_ENV === "production") {
      const signature = request.headers.get("x-nowpayments-sig")
      const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET || ""

      if (!verifyIPNSignature(signature, rawBody, ipnSecret)) {
        console.error("Invalid IPN signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    // Validate webhook data
    if (!body.payment_id || !body.payment_status) {
      console.error("Invalid IPN data received:", body)
      return NextResponse.json({ error: "Invalid webhook data" }, { status: 400 })
    }

    // Get the Supabase client
    const supabase = createClient()

    // Find the payment in our database
    const { data: existingPayment, error: fetchError } = await supabase
      .from("crypto_payments")
      .select("*")
      .eq("payment_id", body.payment_id)
      .single()

    if (fetchError) {
      console.error("Payment not found in database:", body.payment_id)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Update payment status in database
    const { data: payment, error: updateError } = await supabase
      .from("crypto_payments")
      .update({
        payment_status: body.payment_status,
        pay_amount: body.pay_amount || existingPayment.pay_amount,
        actually_paid: body.actually_paid || existingPayment.actually_paid,
        updated_at: new Date().toISOString(),
      })
      .eq("payment_id", body.payment_id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating payment status from webhook:", updateError)
      return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 })
    }

    // If payment is completed, upgrade user to premium
    if (isPaymentCompleted(body.payment_status) && payment.product_type === "premium") {
      console.log(`Processing completed payment ${payment.payment_id} for user ${payment.user_id}`)

      // Get user from payment record
      const { data: user, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", payment.user_id)
        .single()

      if (userError) {
        console.error("Error fetching user for premium upgrade:", userError)
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (!user.is_premium) {
        // Update user to premium
        const { error: upgradeError } = await supabase
          .from("profiles")
          .update({
            is_premium: true,
            premium_since: new Date().toISOString(),
          })
          .eq("id", payment.user_id)

        if (upgradeError) {
          console.error("Error upgrading user to premium:", upgradeError)
          return NextResponse.json({ error: "Failed to upgrade user" }, { status: 500 })
        }

        // Add to premium_purchases table
        await supabase.from("premium_purchases").insert({
          user_id: payment.user_id,
          amount: payment.price_amount,
          payment_method: "crypto",
          transaction_id: payment.payment_id,
        })

        console.log(`[SERVER] Added premium purchase record for user ${payment.user_id}`)
        console.log(`[SERVER] Full payment details:`, payment)

        console.log(`Successfully upgraded user ${payment.user_id} to premium`)
      } else {
        console.log(`User ${payment.user_id} is already premium`)
      }
    }

    // Return success response
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error processing IPN webhook:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
