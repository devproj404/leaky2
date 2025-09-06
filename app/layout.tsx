import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/lib/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VicePleasure - Premium Content",
  description: "Access premium content and exclusive collections",
  generator: "ChaosLabs",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <style>{`
          /* Hide any debug panels */
          div[style*="position: fixed"][style*="bottom: 0"][style*="left: 0"],
          div[style*="position:fixed"][style*="bottom:0"][style*="left:0"],
          div[style*="position: fixed"][style*="bottom: 1rem"][style*="left: 1rem"],
          div[style*="position:fixed"][style*="bottom:1rem"][style*="left:1rem"] {
            display: none !important;
          }
        `}</style>
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
