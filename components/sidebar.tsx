"use client";

import { useAuth } from "@/lib/auth-context";
import {
  Calendar,
  Clock,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

// Helper to normalize role values coming from auth-context/localStorage
// auth-context may set "client" or "care-provider"; middleware uses "care-provider"
// For routing, we only need to choose between "/client" and "/provider" prefixes.
function resolveRoleKey(role: string | null): "client" | "provider" | null {
  if (!role) return null;
  const compact = role.toLowerCase().replace(/\s+/g, "-");
  if (compact.includes("client")) return "client";
  if (compact.includes("provider") || compact.includes("care"))
    return "provider";
  return null;
}

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { logout, userRole, isLoading } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  const roleKey = resolveRoleKey(userRole);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Don't render sidebar if role is not determined yet or invalid
  if (isLoading || !roleKey) {
    return (
      <div
        className={`${
          isMobile ? "fixed inset-0 z-50" : "w-64"
        } h-full bg-white border-r border-gray-200 flex items-center justify-center`}
      >
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const base = `/${roleKey}`; // "/client" or "/provider"

  type NavItem = {
    href: string; // path relative to base, e.g. "/dashboard"
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: Array<"client" | "provider">;
  };

  const homeLinks: NavItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["client", "provider"],
    },
    { href: "/clients", label: "Clients", icon: Users, roles: ["provider"] },
    {
      href: "/bookings",
      label: "Booking",
      icon: Calendar,
      roles: ["client", "provider"],
    },
    {
      href: "/invoices",
      label: "Invoices",
      icon: FileText,
      roles: ["client", "provider"],
    },
    {
      href: "/chats",
      label: "Chats",
      icon: MessageSquare,
      roles: ["client", "provider"],
    },
  ];

  const managementLinks: NavItem[] = [
    {
      href: "/availability",
      label: "Availability",
      icon: Clock,
      roles: ["provider"],
    },
    {
      href: "/payment",
      label: "Payment",
      icon: CreditCard,
      roles: ["client", "provider"],
    },
    {
      href: "/ratings",
      label: "Ratings & Reviews",
      icon: Star,
      roles: ["provider"],
    },
  ];

  const systemLinks: NavItem[] = [
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      roles: ["client", "provider"],
    },
  ];

  const filterByRole = (items: NavItem[]) =>
    items.filter((i) => roleKey && i.roles.includes(roleKey));
  const isActive = (relPath: string) =>
    pathname.startsWith(`${base}${relPath}`);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        ${
          isMobile
            ? `fixed left-0 top-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : `${
                isOpen ? "w-64" : "w-16"
              } transition-all duration-300 ease-in-out`
        }
        bg-white border-r border-gray-200 text-gray-800 flex flex-col shadow-lg
      `}
      >
        {/* Header with logo and close button */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {(isOpen || isMobile) && (
              <div className="flex items-center justify-center flex-1">
                <div className="relative">
                  <div className="w-32 h-20 flex items-center justify-center">
                    <Image
                      src="/care_logo.png"
                      alt="Super Carer App Logo"
                      width={128}
                      height={80}
                    />
                  </div>
                </div>
              </div>
            )}
            {isMobile && (
              <button
                onClick={onToggle}
                className="p-2 rounded-md hover:bg-gray-100 ml-2"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Home / Primary */}
          <div className="px-3 py-4">
            {(isOpen || isMobile) && (
              <p className="text-xs text-gray-500 px-3 mb-3 font-medium uppercase tracking-wider">
                Home
              </p>
            )}
            <nav className="space-y-1">
              {filterByRole(homeLinks).map(({ href, label, icon: Icon }) => {
                const fullHref = `${base}${href}`;
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={fullHref}
                    onClick={isMobile ? onToggle : undefined}
                    className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                      active
                        ? "bg-blue-50 text-teal-600 border-r-2 border-teal-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-teal-900"
                    }`}
                    title={!isOpen && !isMobile ? label : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isOpen || isMobile ? "mr-3" : "mx-auto"
                      }`}
                    />
                    {(isOpen || isMobile) && label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Management */}
          <div className="px-3 py-2">
            {(isOpen || isMobile) && (
              <p className="text-xs text-gray-500 px-3 mb-3 font-medium uppercase tracking-wider">
                Management
              </p>
            )}
            <nav className="space-y-1">
              {filterByRole(managementLinks).map(
                ({ href, label, icon: Icon }) => {
                  const fullHref = `${base}${href}`;
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={fullHref}
                      onClick={isMobile ? onToggle : undefined}
                      className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                        active
                          ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      title={!isOpen && !isMobile ? label : undefined}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          isOpen || isMobile ? "mr-3" : "mx-auto"
                        }`}
                      />
                      {(isOpen || isMobile) && label}
                    </Link>
                  );
                }
              )}
            </nav>
          </div>

          {/* System */}
          <div className="px-3 py-2">
            {(isOpen || isMobile) && (
              <p className="text-xs text-gray-500 px-3 mb-3 font-medium uppercase tracking-wider">
                System
              </p>
            )}
            <nav className="space-y-1">
              {filterByRole(systemLinks).map(({ href, label, icon: Icon }) => {
                const fullHref = `${base}${href}`;
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={fullHref}
                    onClick={isMobile ? onToggle : undefined}
                    className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                    title={!isOpen && !isMobile ? label : undefined}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isOpen || isMobile ? "mr-3" : "mx-auto"
                      }`}
                    />
                    {(isOpen || isMobile) && label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout */}
          <div className="mt-auto px-3 py-6">
            <button
              onClick={logout}
              className={`flex items-center px-3 py-2 w-full rounded-md text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                !isOpen && !isMobile ? "justify-center" : ""
              }`}
              title={!isOpen && !isMobile ? "Log Out" : undefined}
            >
              <LogOut
                className={`h-5 w-5 ${isOpen || isMobile ? "mr-3" : ""}`}
              />
              {(isOpen || isMobile) && "Log Out"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
