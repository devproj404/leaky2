import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-pink-glow opacity-20"></div>
      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Top section with logo and navigation */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-pink-600"
            >
              X
            </Link>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-3">
            <Link href="/" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
              Home
            </Link>
            <Link href="/trending" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
              Trending
            </Link>
            <Link href="/categories" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
              Categories
            </Link>
            <Link href="/shop" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
              Shop
            </Link>
            <Link href="/premium" className="text-sm text-amber-400 hover:text-amber-300 transition-colors duration-200">
              Premium
            </Link>
            <Link href="/contact" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
              Contact
            </Link>
            <Link href="/legal/tos" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/legal/dmca" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
              DMCA
            </Link>
            <Link href="/legal/partner" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
              Partner
            </Link>
            <Link href="/legal/advertise" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
              Advertise
            </Link>
            <Link href="/legal/2257" className="text-sm text-foreground hover:text-primary transition-colors duration-200">
              2257 Compliance
            </Link>
          </nav>
        </div>
        
        {/* Bottom section with copyright */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} X. All rights reserved.</p>
          <p className="text-sm text-muted-foreground mt-2 md:mt-0">All models appearing on this website are 18 years or older.</p>
        </div>
      </div>
    </footer>
  )
}
