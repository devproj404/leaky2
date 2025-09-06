import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-black border-t border-pink-900/30 mt-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-pink-glow opacity-20"></div>
      <div className="container mx-auto px-4 py-12 relative z-10">

        <div className="border-t border-pink-900/30 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} X. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 md:mt-0">
            <Link href="/legal/tos" className="text-xs text-gray-500 hover:text-pink-400 transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="text-xs text-gray-500 hover:text-pink-400 transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/legal/dmca" className="text-xs text-gray-500 hover:text-pink-400 transition-colors duration-200">
              DMCA
            </Link>
            <Link href="/legal/legal-compliance" className="text-xs text-gray-500 hover:text-pink-400 transition-colors duration-200">
              Legal Compliance
            </Link>
            <Link href="/contact" className="text-xs text-gray-500 hover:text-pink-400 transition-colors duration-200">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
