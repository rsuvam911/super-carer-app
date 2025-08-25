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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

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

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, userRole, isLoading } = useAuth();

  const roleKey = resolveRoleKey(userRole);

  // Don't render sidebar if role is not determined yet or invalid
  if (isLoading || !roleKey) {
    return (
      <div className="w-64 h-full bg-[#1a2352] text-white flex items-center justify-center">
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
    <div className="w-64 h-full bg-[#1a2352] text-white flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <div className="w-40 h-24 flex items-center justify-center">
              <Image
                src="/super-carer-app-logo.svg"
                alt="Super Carer App Logo"
                width={160}
                height={96}
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Home / Primary */}
        <div className="px-3 py-2">
          <p className="text-xs text-gray-400 px-3 mb-2">Home</p>
          <nav className="space-y-1">
            {filterByRole(homeLinks).map(({ href, label, icon: Icon }) => {
              const fullHref = `${base}${href}`;
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={fullHref}
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${
                    active
                      ? "bg-[#00C2CB]/20 text-[#00C2CB]"
                      : "text-gray-300 hover:bg-[#2a3366]"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Management */}
        <div className="px-3 py-2 mt-6">
          <p className="text-xs text-gray-400 px-3 mb-2">Management</p>
          <nav className="space-y-1">
            {filterByRole(managementLinks).map(
              ({ href, label, icon: Icon }) => {
                const fullHref = `${base}${href}`;
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={fullHref}
                    className={`flex items-center px-3 py-2 rounded-md text-sm ${
                      active
                        ? "bg-[#00C2CB]/20 text-[#00C2CB]"
                        : "text-gray-300 hover:bg-[#2a3366]"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {label}
                  </Link>
                );
              }
            )}
          </nav>
        </div>

        {/* System */}
        <div className="px-3 py-2 mt-6">
          <p className="text-xs text-gray-400 px-3 mb-2">System</p>
          <nav className="space-y-1">
            {filterByRole(systemLinks).map(({ href, label, icon: Icon }) => {
              const fullHref = `${base}${href}`;
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={fullHref}
                  className={`flex items-center px-3 py-2 rounded-md text-sm ${
                    active
                      ? "bg-[#00C2CB]/20 text-[#00C2CB]"
                      : "text-gray-300 hover:bg-[#2a3366]"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="mt-auto px-3 py-6">
          <button
            onClick={logout}
            className="flex items-center px-3 py-2 w-full rounded-md text-sm text-gray-300 hover:bg-[#2a3366]"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
