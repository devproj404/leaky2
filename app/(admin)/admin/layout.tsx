"use client"

import type React from "react"
import { AlertTriangle, LayoutDashboard, Users, ShoppingBag, FileText, Folder, Calendar, Package, Monitor } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/content", label: "Content", icon: FileText },
    { href: "/admin/categories", label: "Categories", icon: Folder },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/ads", label: "Ad Slots", icon: Monitor },
    { href: "/admin/weekly-drops", label: "Weekly Drops", icon: Calendar },
    { href: "/admin/reports", label: "Reported Links", icon: AlertTriangle },
  ]

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-gray-800 bg-black py-6">
        <div className="px-6">
          <h1 className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-2xl font-bold text-transparent">
            Admin Panel
          </h1>
          <p className="text-xs text-gray-400">Manage your content and users</p>
        </div>

        <nav className="mt-8 px-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive ? "bg-pink-900/20 text-pink-400" : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors ${
                      isActive ? "text-pink-400" : "text-gray-400 group-hover:text-gray-300"
                    }`}
                  />
                  {item.label}
                  {item.href === "/admin/reports" && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-pink-900/50 text-xs font-semibold text-pink-300">
                      3
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-black p-6">{children}</div>
    </div>
  )
}
