import { NextResponse } from "next/server"
import { getAvailableCurrencies } from "@/lib/nowpayments-server"

export async function GET() {
  try {
    const currencies = await getAvailableCurrencies()
    return NextResponse.json(currencies)
  } catch (error: any) {
    console.error("Error fetching available currencies:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch available currencies" }, { status: 500 })
  }
}
