"use client"

import { useAuth } from "@/lib/auth-context"
import { Bell, MessageSquare, Search } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Extract the current page name from the pathname
  const getPageName = () => {
    const path = pathname.split("/")[1]
    if (!path) return "Dashboard"
    return path.charAt(0).toUpperCase() + path.slice(1)
  }

  return (
    <header className="h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white">
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>Dashboard</span>
        {pathname !== "/" && pathname !== "/dashboard" && (
          <>
            <span className="mx-2">›</span>
            <span>{getPageName()}</span>
          </>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Search className="h-5 w-5 text-gray-500" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <MessageSquare className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>
        <div className="flex items-center">
          <span className="mr-2 text-sm font-medium">{user?.name || 'User'}</span>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            <img src={user?.avatar || "/placeholder.svg?height=32&width=32"} alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </header>
  )
}

