// Server-side NOWPayments API service
// This file should only be imported in server components or API routes

// Use environment variables safely on the server side only
const API_KEY = process.env.NOWPAYMENTS_API_KEY || ""
const API_URL = "https://api.nowpayments.io/v1"
const SANDBOX_URL = "https://api-sandbox.nowpayments.io/v1"

// Use sandbox for testing if no API key is provided
const baseUrl = API_KEY ? API_URL : SANDBOX_URL

import { defaultCurrencies, type CryptoCurrency, type PaymentStatusResponse } from "./nowpayments-service"

// Define the payment request interface
interface PaymentRequest {
  price_amount: number
  price_currency: string
  pay_currency: string
  order_id?: string
  order_description?: string
  ipn_callback_url?: string
  success_url?: string
  cancel_url?: string
}

// Define the payment response interface
interface PaymentResponse {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id?: string
  order_description?: string
  ipn_callback_url?: string
  created_at?: string
  updated_at?: string
  purchase_id?: string
}

// Currency name mapping for common cryptocurrencies
const currencyNameMap: Record<string, string> = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  LTC: "Litecoin",
  USDT: "Tether",
  USDC: "USD Coin",
  XRP: "XRP",
  BNB: "Binance Coin",
  DOGE: "Dogecoin",
  SOL: "Solana",
  MATIC: "Polygon",
  ADA: "Cardano",
  DOT: "Polkadot",
  AVAX: "Avalanche",
}

// Currency icon mapping
const currencyIconMap: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  LTC: "Ł",
  USDT: "₮",
  USDC: "USDC",
  XRP: "XRP",
  BNB: "BNB",
  DOGE: "Ð",
  SOL: "SOL",
  MATIC: "MATIC",
  ADA: "ADA",
  DOT: "DOT",
  AVAX: "AVAX",
}

// Network mapping for multi-chain cryptocurrencies
const networkMap: Record<string, { baseCurrency: string; network: string }> = {
  USDTTRC20: { baseCurrency: "USDT", network: "TRC20" },
  USDTERC20: { baseCurrency: "USDT", network: "ERC20" },
  USDTBSC: { baseCurrency: "USDT", network: "BSC" },
  USDCBSC: { baseCurrency: "USDC", network: "BSC" },
  USDCERC20: { baseCurrency: "USDC", network: "ERC20" },
  USDCTRC20: { baseCurrency: "USDC", network: "TRC20" },
}

// Get the base URL for the application
function getBaseUrl() {
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || "http://localhost:3000"
}

// Group currencies by their base currency
function groupCurrenciesByBase(currencies: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {}

  currencies.forEach((currency) => {
    // Check if this is a network-specific currency
    if (networkMap[currency]) {
      const { baseCurrency } = networkMap[currency]
      if (!grouped[baseCurrency]) {
        grouped[baseCurrency] = []
      }
      grouped[baseCurrency].push(currency)
    } else {
      // This is a base currency
      if (!grouped[currency]) {
        grouped[currency] = [currency]
      }
    }
  })

  return grouped
}

// Get available cryptocurrencies
export async function getAvailableCurrencies(): Promise<CryptoCurrency[]> {
  try {
    // For development/testing, return mock data
    if (process.env.NODE_ENV === "development" && !process.env.USE_REAL_PAYMENTS) {
      return defaultCurrencies
    }

    // Use the correct API endpoint
    const response = await fetch(`${baseUrl}/merchant/coins`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY || "sandbox",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch (e) {
        throw new Error(`Server error: ${response.status}. Response: ${errorText.substring(0, 100)}...`)
      }

      throw new Error(errorData.message || `Server error: ${response.status}`)
    }

    const data = await response.json()

    // Check if the response has the expected structure with selectedCurrencies
    if (!data || !Array.isArray(data.selectedCurrencies)) {
      return defaultCurrencies
    }

    // Filter out USDP from the selected currencies
    const filteredCurrencies = data.selectedCurrencies.filter((currency: string) => currency !== "USDP")

    // Group currencies by their base currency
    const groupedCurrencies = groupCurrenciesByBase(filteredCurrencies)

    // Map the response to our format
    const result: CryptoCurrency[] = []

    Object.entries(groupedCurrencies).forEach(([baseCurrency, networks]) => {
      // Get the base currency name and icon
      const name = currencyNameMap[baseCurrency] || baseCurrency
      const icon = currencyIconMap[baseCurrency] || baseCurrency.substring(0, 1)

      // If there's only one network or it's the base currency itself, add it directly
      if (networks.length === 1 && networks[0] === baseCurrency) {
        result.push({
          id: baseCurrency.toLowerCase(),
          name,
          icon,
          enabled: true,
          has_multiple_networks: false,
          payment_code: baseCurrency, // The actual code to use for payment
        })
      } else {
        // This currency has multiple networks
        result.push({
          id: baseCurrency.toLowerCase(),
          name,
          icon,
          enabled: true,
          has_multiple_networks: true,
          networks: networks.map((network) => {
            if (network === baseCurrency) {
              return {
                id: network.toLowerCase(),
                name: `${name} (Default)`,
                payment_code: network,
              }
            } else if (networkMap[network]) {
              return {
                id: network.toLowerCase(),
                name: `${name} (${networkMap[network].network})`,
                payment_code: network,
              }
            } else {
              return {
                id: network.toLowerCase(),
                name: network,
                payment_code: network,
              }
            }
          }),
          payment_code: networks[0], // Default to the first network
        })
      }
    })

    return result
  } catch (error) {
    // Return default currencies as fallback
    return defaultCurrencies
  }
}

// Create a payment with NOWPayments
export async function createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
  // Check if we're using real payments or sandbox
  const useRealPayments = process.env.USE_REAL_PAYMENTS === "true"

  // Get the API key
  const apiKey = process.env.NOWPAYMENTS_API_KEY
  if (!apiKey) {
    throw new Error("NOWPAYMENTS_API_KEY is not set")
  }

  try {
    // If using sandbox, return a mock payment
    if (!useRealPayments) {
      return createMockPayment(paymentRequest)
    }

    // Create the payment with NOWPayments
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

    // Add callback URLs if not provided
    const fullPaymentRequest = {
      ...paymentRequest,
      ipn_callback_url: paymentRequest.ipn_callback_url || `${baseUrl}/api/payments/webhook`,
      success_url: paymentRequest.success_url || `${baseUrl}/payment/success`,
      cancel_url: paymentRequest.cancel_url || `${baseUrl}/payment/cancel`,
    }

    // Make the API request to NOWPayments
    const response = await fetch("https://api.nowpayments.io/v1/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(fullPaymentRequest),
    })

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text()

      try {
        const errorJson = JSON.parse(errorText)
        throw new Error(`NOWPayments API error: ${errorJson.message || errorJson.error || response.statusText}`)
      } catch (e) {
        throw new Error(`NOWPayments API error: ${response.status} ${errorText || response.statusText}`)
      }
    }

    // Parse the response
    const payment = await response.json()
    return payment
  } catch (error: any) {
    throw error
  }
}

// Create a mock payment for testing
function createMockPayment(paymentRequest: PaymentRequest): PaymentResponse {
  const paymentId = `sandbox_${Date.now()}`
  const createdAt = new Date().toISOString()

  return {
    payment_id: paymentId,
    payment_status: "waiting",
    pay_address: "0x1234567890abcdef1234567890abcdef12345678",
    price_amount: paymentRequest.price_amount,
    price_currency: paymentRequest.price_currency,
    pay_amount: paymentRequest.price_amount * 0.00005, // Mock conversion rate
    pay_currency: paymentRequest.pay_currency,
    order_id: paymentRequest.order_id,
    order_description: paymentRequest.order_description,
    ipn_callback_url: paymentRequest.ipn_callback_url,
    created_at: createdAt,
    updated_at: createdAt,
    purchase_id: `purchase_${Date.now()}`,
  }
}

// Get payment status
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  try {
    const response = await fetch(`${baseUrl}/payment/${paymentId}`, {
      method: "GET",
      headers: {
        "x-api-key": API_KEY || "sandbox",
      },
    })

    const responseText = await response.text()

    let paymentData
    try {
      paymentData = JSON.parse(responseText)
    } catch (e) {
      throw new Error(`Failed to parse payment status response: ${responseText.substring(0, 100)}...`)
    }

    if (!response.ok) {
      throw new Error(paymentData.message || `Server error: ${response.status}`)
    }

    return paymentData
  } catch (error) {
    throw error
  }
}
