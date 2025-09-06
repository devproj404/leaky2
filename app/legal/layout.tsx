"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const legalPages = [
  {
    name: "Terms of Service",
    href: "/legal/tos",
    description: "Rules and guidelines for using the platform",
  },
  {
    name: "Privacy Policy",
    href: "/legal/privacy",
    description: "How we handle and protect your data",
  },
  {
    name: "DMCA",
    href: "/legal/dmca",
    description: "Copyright and content removal procedures",
  },
  {
    name: "Legal Compliance",
    href: "/legal/legal-compliance",
    description: "Our commitment to following regulations",
  },
]

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="md:w-64 flex-shrink-0">
          <div className="sticky top-24">
            <h2 className="text-xl font-bold mb-4">Legal Information</h2>
            <nav className="space-y-2">
              {legalPages.map((page) => (
                <LegalNavLink 
                  key={page.href} 
                  href={page.href} 
                  name={page.name} 
                  description={page.description} 
                />
              ))}
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="prose prose-invert max-w-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function LegalNavLink({ 
  href, 
  name, 
  description 
}: { 
  href: string; 
  name: string; 
  description: string 
}) {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <Link
      href={href}
      className={cn(
        "block p-3 rounded-lg transition-colors",
        isActive
          ? "bg-pink-900/20 border border-pink-800/30 text-pink-300"
          : "hover:bg-gray-800/50 text-gray-300 hover:text-white"
      )}
    >
      <div className="font-medium">{name}</div>
      <div className="text-xs text-gray-400 mt-1">{description}</div>
    </Link>
  )
} 