import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createPayment } from "@/lib/nowpayments-server"

// Create a direct Supabase client with admin privileges
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

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { currency, userId, productType = "premium", amount } = body

    // Validate required fields
    if (!currency) {
      return NextResponse.json({ error: "Currency is required" }, { status: 400 })
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Verify the user exists using admin client
    // Check if userId looks like a username (not UUID format)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)
    
    const { data: user, error: userError } = isUUID 
      ? await supabaseAdmin.from("profiles").select("id").eq("id", userId).single()
      : await supabaseAdmin.from("profiles").select("id").eq("username", userId).single()

    if (userError) {
      return NextResponse.json({ error: `User verification failed: ${userError.message}` }, { status: 400 })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Set the price amount based on the product type
    // If it's a shop product, use the amount from the request
    // Otherwise, use the default premium price
    const priceAmount = productType === "shop" && amount ? Number.parseFloat(amount.toString()) : 99.99

    // Use actual user ID from database
    const actualUserId = user.id
    
    // Create the payment request
    const paymentRequest = {
      price_amount: priceAmount,
      price_currency: "usd",
      pay_currency: currency,
      order_description: productType === "shop" ? "Shop Purchase" : "Premium Membership",
      order_id: `order_${actualUserId.substring(0, 8)}_${Date.now()}`,
    }

    // Create the payment with NOWPayments
    const payment = await createPayment(paymentRequest)

    if (!payment || !payment.payment_id) {
      return NextResponse.json({ error: "Failed to create payment" }, { status: 500 })
    }

    // Store the payment in the database
    try {
      // Insert the payment record with all required fields
      const paymentRecord = {
        payment_id: payment.payment_id,
        user_id: actualUserId,
        amount: priceAmount,
        currency: currency,
        status: "pending",
        payment_status: payment.payment_status || "waiting",
        price_amount: payment.price_amount,
        price_currency: payment.price_currency,
        pay_amount: payment.pay_amount,
        pay_currency: payment.pay_currency,
        pay_address: payment.pay_address,
        product_type: productType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log("Storing payment record:", paymentRecord)

      const { error: dbError } = await supabaseAdmin.from("crypto_payments").insert(paymentRecord)

      if (dbError) {
        console.error("Error inserting full payment record:", dbError)
        
        // If there's an error, try with minimal required fields
        const minimalRecord = {
          payment_id: payment.payment_id,
          user_id: actualUserId,
          amount: priceAmount,
          currency: currency,
          status: "pending",
          created_at: new Date().toISOString(),
        }

        console.log("Trying with minimal record:", minimalRecord)
        
        const { error: retryError } = await supabaseAdmin.from("crypto_payments").insert(minimalRecord)

        if (retryError) {
          console.error("Error inserting minimal payment record:", retryError)
          return NextResponse.json(
            { error: `Error storing payment in database: ${retryError.message}` },
            { status: 500 },
          )
        }
      }

      // Return the payment details
      return NextResponse.json({
        payment_id: payment.payment_id,
        status: "success",
        redirect_url: `/payment/${payment.payment_id}`,
      })
    } catch (dbError: any) {
      console.error("Exception storing payment:", dbError)
      return NextResponse.json({ error: `Error storing payment in database: ${dbError.message}` }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Payment creation error:", error)
    return NextResponse.json({ error: error.message || "Failed to process payment" }, { status: 500 })
  }
}
