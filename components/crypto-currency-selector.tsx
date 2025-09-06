"use client"

import { useState, useEffect } from "react"
import { Search, ArrowRight, Shield, Loader2 } from "lucide-react"
import type { CryptoCurrency, CryptoNetwork } from "@/lib/nowpayments-service"

interface CryptoCurrencySelectorProps {
  onCurrencySelect: (currency: CryptoCurrency) => void
  onNetworkSelect: (network: CryptoNetwork) => void
  onBack?: () => void
  isLoading?: boolean
  error?: string | null
  step: 'currency' | 'network'
  selectedCurrency?: CryptoCurrency | null
  availableCurrencies: CryptoCurrency[]
}

export function CryptoCurrencySelector({
  onCurrencySelect,
  onNetworkSelect,
  onBack,
  isLoading = false,
  error = null,
  step,
  selectedCurrency,
  availableCurrencies
}: CryptoCurrencySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Get cryptocurrency icon and color
  const getCryptoIcon = (currency: CryptoCurrency) => {
    const name = currency.name.toLowerCase()
    const id = currency.id.toLowerCase()
    
    if (name.includes('bitcoin') || id.includes('btc')) {
      return { icon: '₿', color: 'bg-orange-500', textColor: 'text-orange-400' }
    }
    if (name.includes('ethereum') || id.includes('eth')) {
      return { icon: 'Ξ', color: 'bg-blue-500', textColor: 'text-blue-400' }
    }
    if (name.includes('litecoin') || id.includes('ltc')) {
      return { icon: 'Ł', color: 'bg-gray-400', textColor: 'text-gray-400' }
    }
    if (name.includes('tether') || id.includes('usdt')) {
      return { icon: '₮', color: 'bg-green-500', textColor: 'text-green-400' }
    }
    if (name.includes('usdc') || name.includes('usd coin')) {
      return { icon: '$', color: 'bg-blue-600', textColor: 'text-blue-400' }
    }
    if (name.includes('binance') || id.includes('bnb')) {
      return { icon: 'B', color: 'bg-yellow-500', textColor: 'text-yellow-400' }
    }
    if (name.includes('cardano') || id.includes('ada')) {
      return { icon: '₳', color: 'bg-blue-400', textColor: 'text-blue-400' }
    }
    if (name.includes('dogecoin') || id.includes('doge')) {
      return { icon: 'Ð', color: 'bg-yellow-400', textColor: 'text-yellow-400' }
    }
    // Default
    return { 
      icon: currency.icon || currency.name.charAt(0).toUpperCase(), 
      color: 'bg-gradient-to-br from-pink-500 to-purple-600', 
      textColor: 'text-pink-400' 
    }
  }

  // Filter cryptocurrencies based on search term
  const filteredCurrencies = availableCurrencies.filter(currency => 
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Clear search when step changes
  useEffect(() => {
    if (step === 'network') {
      setSearchTerm("")
    }
  }, [step])

  if (step === 'currency') {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white mb-1">Choose Cryptocurrency</h3>
          <p className="text-xs text-gray-400">Select your preferred payment method</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-gray-500/70 focus:bg-gray-800/70 transition-colors text-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Compact Currency Grid */}
        <div className="max-h-64 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-2">
            {filteredCurrencies.map((currency) => {
              const { icon, color } = getCryptoIcon(currency)
              return (
                <button
                  key={currency.id}
                  onClick={() => onCurrencySelect(currency)}
                  disabled={!currency.enabled || isLoading}
                  className={`group relative overflow-hidden rounded-lg p-3 transition-all duration-200 ${
                    currency.enabled && !isLoading
                      ? "bg-gray-800/60 hover:bg-gray-700/80 border border-gray-600/40 hover:border-gray-500/60"
                      : "bg-gray-900/40 border border-gray-800/40 cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {icon}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-medium text-white text-sm leading-tight truncate">
                        {currency.name}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide truncate">
                        {currency.id}
                      </div>
                    </div>
                  </div>
                  
                  {currency.enabled && !isLoading && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </div>
                  )}
                  
                  {!currency.enabled && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          
          {filteredCurrencies.length === 0 && searchTerm && (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">No cryptocurrencies found for "{searchTerm}"</p>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-300">Secure & Anonymous</p>
              <p className="text-xs text-blue-200/70 mt-0.5">Payments processed through encrypted gateway</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'network' && selectedCurrency) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white mb-1">Select Network</h3>
          <p className="text-xs text-gray-400">Choose network for {selectedCurrency.name}</p>
        </div>

        <div className="space-y-2">
          {selectedCurrency.networks?.map((network) => {
            const { icon, color } = getCryptoIcon(selectedCurrency)
            return (
              <button
                key={network.id}
                onClick={() => onNetworkSelect(network)}
                disabled={isLoading}
                className="group w-full flex items-center justify-between p-3 bg-gray-800/60 hover:bg-gray-700/80 border border-gray-600/40 hover:border-gray-500/60 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                    {icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white text-sm leading-tight">
                      {network.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {selectedCurrency.name} Network
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-green-500/20 rounded-full">
                    <span className="text-xs text-green-300 font-medium">Available</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
                </div>
              </button>
            )
          })}
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to cryptocurrency selection
          </button>
        )}
      </div>
    )
  }

  return null
}