"use client";

import { Bell, MessageSquare, Search, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

interface HeaderProps {
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

interface UserData {
  userId: string;
  email: string;
  phoneNumber: string;
  providerId: string;
  name: string;
  profilePictureUrl: string;
}

export default function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);

  // Get user data from localStorage
  useEffect(() => {
    const getUserData = () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    };

    getUserData();
  }, []);

  // Extract the current page name from the pathname
  const getPageName = () => {
    const path = pathname.split("/")[1];
    if (!path) return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 md:px-6 bg-white">
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-gray-100 md:hidden"
        >
          <Menu className="h-5 w-5 text-gray-500" />
        </button>

        {/* Desktop toggle button */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:block p-2 rounded-md hover:bg-gray-100"
        >
          <Menu className="h-5 w-5 text-gray-500" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>Dashboard</span>
          {pathname !== "/" && pathname !== "/dashboard" && (
            <>
              <span className="mx-2">›</span>
              <span>{getPageName()}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Search - hidden on mobile */}
        <button className="hidden sm:block p-2 rounded-full hover:bg-gray-100">
          <Search className="h-5 w-5 text-gray-500" />
        </button>

        {/* Messages */}
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <MessageSquare className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-teal-500 rounded-full"></span>
        </button>

        {/* Notifications */}
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center">
          <span className="hidden sm:block mr-2 text-sm font-medium">
            {user?.name || "User"}
          </span>
          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
            <img
              src={
                user?.profilePictureUrl || "/placeholder.svg?height=32&width=32"
              }
              alt="Profile"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=32&width=32";
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
