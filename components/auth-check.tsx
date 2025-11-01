"use client";

import { useAuth } from "@/lib/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Define auth routes that don't require authentication
  const isAuthRoute = (path: string) => {
    return (
      path.startsWith("/login") ||
      path.startsWith("/register") ||
      path.startsWith("/verify-otp")
    );
  };

  // Check if we're on mobile and handle sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // On mobile, start with sidebar closed
      if (mobile) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    // Skip auth check for auth routes
    if (isAuthRoute(pathname)) {
      return;
    }

    // If not loading and no user, redirect to login
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router, pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // If we're on an auth page, don't show the dashboard layout
  if (isAuthRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <div
        className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
          !isMobile && !sidebarOpen ? "ml-0" : ""
        }`}
      >
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Import these components here to avoid circular dependencies
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
