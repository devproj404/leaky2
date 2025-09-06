import { createClient } from "@supabase/supabase-js"
import { redirect } from "next/navigation"
import { CryptoPayment } from "@/components/crypto-payment"

export default async function PaymentPage({ params }: { params: { id: string } }) {
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
  const { id } = params

  if (!id) {
    console.error("[SERVER] Payment ID is missing in params")
    redirect("/payment/not-found")
  }

  try {
    // Get the payment details with detailed error logging
    console.log(`[SERVER] Fetching payment with ID: ${id}`)
    const { data: payment, error } = await supabaseAdmin
      .from("crypto_payments")
      .select("*")
      .eq("payment_id", id)
      .single()

    if (error) {
      console.error(`[SERVER] Error fetching payment: ${error.message}`, error)
      redirect("/payment/not-found")
    }

    if (!payment) {
      console.error(`[SERVER] Payment not found for ID: ${id}`)
      redirect("/payment/not-found")
    }

    // Always render the payment page with the payment details
    // This removes the session check that was causing problems
    console.log(`[SERVER] Successfully found payment ${id}`)
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center text-white">Complete Your Payment</h1>
          <CryptoPayment payment={payment} />
        </div>
      </div>
    )
  } catch (error: any) {
    console.error(`[SERVER] Unexpected error in payment page: ${error.message}`, error)
    redirect("/payment/not-found")
  }
}
