import Link from "next/link"

export const metadata = {
  title: "Legal Information",
  description: "Legal documents and policies",
}

export default function LegalIndex() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Legal Information</h1>
      
      <p className="text-gray-300 mb-8">
        Welcome to our legal information center. Here you can find all the legal documents and policies that govern the use of our platform.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/legal/tos" className="block p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-pink-800/30 transition-colors">
          <h2 className="text-xl font-semibold text-pink-400 mb-2">Terms of Service</h2>
          <p className="text-gray-400 text-sm">Rules and guidelines for using the platform</p>
        </Link>
        
        <Link href="/legal/privacy" className="block p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-pink-800/30 transition-colors">
          <h2 className="text-xl font-semibold text-pink-400 mb-2">Privacy Policy</h2>
          <p className="text-gray-400 text-sm">How we handle and protect your data</p>
        </Link>
        
        <Link href="/legal/dmca" className="block p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-pink-800/30 transition-colors">
          <h2 className="text-xl font-semibold text-pink-400 mb-2">DMCA Policy</h2>
          <p className="text-gray-400 text-sm">Copyright and content removal procedures</p>
        </Link>
        
        <Link href="/legal/legal-compliance" className="block p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-pink-800/30 transition-colors">
          <h2 className="text-xl font-semibold text-pink-400 mb-2">Legal Compliance</h2>
          <p className="text-gray-400 text-sm">Our commitment to following regulations</p>
        </Link>
        
        <Link href="/legal/partner" className="block p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-pink-800/30 transition-colors">
          <h2 className="text-xl font-semibold text-pink-400 mb-2">Partner With Us</h2>
          <p className="text-gray-400 text-sm">Join our network of partners and content creators</p>
        </Link>
        
        <Link href="/legal/advertise" className="block p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-pink-800/30 transition-colors">
          <h2 className="text-xl font-semibold text-pink-400 mb-2">Advertise With Us</h2>
          <p className="text-gray-400 text-sm">Reach our engaged audience with targeted advertising</p>
        </Link>
        
        <Link href="/legal/2257" className="block p-6 bg-gray-900/50 border border-gray-800 rounded-lg hover:border-pink-800/30 transition-colors">
          <h2 className="text-xl font-semibold text-pink-400 mb-2">18 USC 2257 Compliance</h2>
          <p className="text-gray-400 text-sm">Age verification and record keeping compliance</p>
        </Link>
      </div>
      
      <div className="mt-10 pt-6 border-t border-gray-800">
        <p className="text-sm text-gray-400">
          If you have any questions about our legal policies, please <Link href="/contact" className="text-pink-400 hover:text-pink-300">contact us</Link>.
        </p>
      </div>
    </div>
  )
} 