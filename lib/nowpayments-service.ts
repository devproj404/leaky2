// Client-side NOWPayments service types and utilities
// This file should NOT contain any server-side code or environment variables

// Popular cryptocurrencies with their icons for client-side use
export const popularCurrencies = [
  { id: "btc", name: "Bitcoin", icon: "₿" },
  { id: "eth", name: "Ethereum", icon: "Ξ" },
  { id: "ltc", name: "Litecoin", icon: "Ł" },
  { id: "usdt", name: "Tether", icon: "₮" },
  { id: "bnb", name: "Binance Coin", icon: "BNB" },
  { id: "xrp", name: "XRP", icon: "XRP" },
]

// Network options for multi-chain cryptocurrencies
export const networkOptions = {
  eth: [
    { id: "eth", name: "Ethereum (ERC20)", icon: "Ξ", payment_code: "ETH" },
    { id: "eth_bsc", name: "Binance Smart Chain (BEP20)", icon: "BSC", payment_code: "ETHBSC" },
    { id: "eth_polygon", name: "Polygon", icon: "MATIC", payment_code: "ETHMATIC" },
  ],
  usdt: [
    { id: "usdterc20", name: "Tether (ERC20)", icon: "₮", payment_code: "USDTERC20" },
    { id: "usdttrc20", name: "Tether (TRC20)", icon: "₮", payment_code: "USDTTRC20" },
    { id: "usdtbsc", name: "Tether (BSC)", icon: "₮", payment_code: "USDTBSC" },
  ],
  usdc: [
    { id: "usdcerc20", name: "USD Coin (ERC20)", icon: "USDC", payment_code: "USDCERC20" },
    { id: "usdctrc20", name: "USD Coin (TRC20)", icon: "USDC", payment_code: "USDCTRC20" },
    { id: "usdcbsc", name: "USD Coin (BSC)", icon: "USDC", payment_code: "USDCBSC" },
  ],
}

// Default list of cryptocurrencies to use as fallback
export const defaultCurrencies = [
  { id: "btc", name: "Bitcoin", icon: "₿", enabled: true, payment_code: "BTC" },
  {
    id: "eth",
    name: "Ethereum",
    icon: "Ξ",
    enabled: true,
    has_multiple_networks: true,
    payment_code: "ETH",
    networks: [
      { id: "eth", name: "Ethereum (ERC20)", payment_code: "ETH" },
      { id: "ethbsc", name: "Ethereum (BSC)", payment_code: "ETHBSC" },
    ],
  },
  { id: "ltc", name: "Litecoin", icon: "Ł", enabled: true, payment_code: "LTC" },
  {
    id: "usdt",
    name: "Tether",
    icon: "₮",
    enabled: true,
    has_multiple_networks: true,
    payment_code: "USDTTRC20", // Default to TRC20 as it's usually cheaper
    networks: [
      { id: "usdttrc20", name: "Tether (TRC20)", payment_code: "USDTTRC20" },
      { id: "usdterc20", name: "Tether (ERC20)", payment_code: "USDTERC20" },
      { id: "usdtbsc", name: "Tether (BSC)", payment_code: "USDTBSC" },
    ],
  },
  {
    id: "usdc",
    name: "USD Coin",
    icon: "USDC",
    enabled: true,
    has_multiple_networks: true,
    payment_code: "USDCERC20",
    networks: [
      { id: "usdcerc20", name: "USD Coin (ERC20)", payment_code: "USDCERC20" },
      { id: "usdctrc20", name: "USD Coin (TRC20)", payment_code: "USDCTRC20" },
      { id: "usdcbsc", name: "USD Coin (BSC)", payment_code: "USDCBSC" },
    ],
  },
  { id: "doge", name: "Dogecoin", icon: "Ð", enabled: true, payment_code: "DOGE" },
  { id: "xrp", name: "XRP", icon: "XRP", enabled: true, payment_code: "XRP" },
  { id: "bnb", name: "Binance Coin", icon: "BNB", enabled: true, payment_code: "BNB" },
]

export interface CreatePaymentParams {
  price_amount: number
  price_currency: string
  pay_currency: string
  ipn_callback_url?: string
  order_id?: string
  order_description?: string
  success_url?: string
  cancel_url?: string
  product_type?: string
}

export interface PaymentResponse {
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
  payment_extra_data?: any
}

export interface PaymentStatusResponse {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  actually_paid: number
  pay_currency: string
  order_id?: string
  order_description?: string
  purchase_id?: string
  created_at: string
  updated_at: string
  outcome_amount?: number
  outcome_currency?: string
}

export interface CryptoCurrency {
  id: string
  name: string
  icon?: string
  enabled: boolean
  has_multiple_networks?: boolean
  networks?: CryptoNetwork[]
  payment_code: string
}

export interface CryptoNetwork {
  id: string
  name: string
  payment_code: string
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

// Payment statuses
export enum PaymentStatus {
  WAITING = "waiting",
  CONFIRMING = "confirming",
  CONFIRMED = "confirmed",
  SENDING = "sending",
  PARTIALLY_PAID = "partially_paid",
  FINISHED = "finished",
  FAILED = "failed",
  REFUNDED = "refunded",
  EXPIRED = "expired",
}

// Check if payment is completed
export function isPaymentCompleted(status: string): boolean {
  return [PaymentStatus.FINISHED, PaymentStatus.CONFIRMED, PaymentStatus.SENDING].includes(status as PaymentStatus)
}

// Check if payment is pending
export function isPaymentPending(status: string): boolean {
  return [PaymentStatus.WAITING, PaymentStatus.CONFIRMING, PaymentStatus.PARTIALLY_PAID].includes(
    status as PaymentStatus,
  )
}

// Check if payment failed
export function isPaymentFailed(status: string): boolean {
  return [PaymentStatus.FAILED, PaymentStatus.REFUNDED, PaymentStatus.EXPIRED].includes(status as PaymentStatus)
}

export async function getPaymentStatus(paymentId: string): Promise<PaymentStatusResponse> {
  // This is a placeholder implementation.  The real implementation
  // would fetch the payment status from NOWPayments API.
  // This dummy implementation always returns "waiting".
  return {
    payment_id: paymentId,
    payment_status: "waiting",
    pay_address: "dummy_address",
    price_amount: 100,
    price_currency: "USD",
    pay_amount: 0.001,
    actually_paid: 0,
    pay_currency: "BTC",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}
