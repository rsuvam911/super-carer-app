"use client"

import { useAuth } from "@/lib/auth-context"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Define auth routes that don't require authentication
  const isAuthRoute = (path: string) => {
    return path.startsWith('/login') ||
      path.startsWith('/register') ||
      path.startsWith('/verify-otp');
  }

  useEffect(() => {
    // Skip auth check for auth routes
    if (isAuthRoute(pathname)) {
      return;
    }

    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router, pathname])

  // If we're on an auth page, don't show the dashboard layout
  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  )
}

// Import these components here to avoid circular dependencies
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
