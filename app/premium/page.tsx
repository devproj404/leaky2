import type { Metadata } from "next"
import { PremiumPurchaseWrapper } from "@/components/premium-purchase-wrapper"

export const metadata: Metadata = {
  title: "Premium Membership",
  description: "Upgrade to premium for exclusive content and features",
}

export default function PremiumPage() {
  return (
    <main className="container max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-amber-600 text-transparent bg-clip-text">
          Upgrade to Premium
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Get unlimited access to all premium content, exclusive features, and priority support.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Free Account</h2>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">✓</span>
              <span>Limited access to content</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">✓</span>
              <span>Basic features</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">✓</span>
              <span>Standard support</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">✗</span>
              <span className="text-gray-500">No exclusive content</span>
            </li>
            <li className="flex items-start">
              <span className="text-gray-500 mr-2">✗</span>
              <span className="text-gray-500">No priority support</span>
            </li>
          </ul>
          <div className="text-center text-xl font-bold mb-4">$0</div>
          <button
            disabled
            className="w-full py-2 px-4 bg-gray-800 text-gray-400 rounded-lg border border-gray-700 cursor-not-allowed"
          >
            Current Plan
          </button>
        </div>

        <div className="bg-gradient-to-b from-amber-900/20 to-black border border-amber-500/30 rounded-xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
          <h2 className="text-xl font-bold text-amber-400 mb-4">Premium Account</h2>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="text-amber-400 mr-2">✓</span>
              <span>Unlimited access to all content</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-400 mr-2">✓</span>
              <span>Exclusive premium-only content</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-400 mr-2">✓</span>
              <span>Early access to new releases</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-400 mr-2">✓</span>
              <span>Priority support</span>
            </li>
            <li className="flex items-start">
              <span className="text-amber-400 mr-2">✓</span>
              <span>Lifetime access</span>
            </li>
          </ul>
          <div className="text-center text-xl font-bold text-amber-400 mb-4">$99.99</div>
          <PremiumPurchaseWrapper />
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-2">What does "lifetime access" mean?</h3>
            <p className="text-gray-400">
              Lifetime access means you'll have access to all premium content and features for as long as our service
              exists, with no recurring payments.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-2">Can I cancel my premium membership?</h3>
            <p className="text-gray-400">
              Since premium is a one-time payment, there's nothing to cancel. You'll maintain access to all premium
              features permanently.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4">
            <h3 className="font-bold mb-2">How do I get support if I have issues?</h3>
            <p className="text-gray-400">
              Premium members receive priority support. Simply contact us through the support section in your account
              settings.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
