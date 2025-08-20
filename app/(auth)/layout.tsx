import Image from "next/image"
import type React from "react"

// Environment variables
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Super Carer App"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left side - Logo and branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a2352] flex-col justify-center items-center p-12">
        <div className="max-w-md">
          <Image
            src="/super-carer-app-logo.svg"
            alt="Super Carer App Logo"
            width={300}
            height={180}
            priority
            className="mb-8"
          />
          <h1 className="text-3xl font-bold text-white mb-4">Welcome to {APP_NAME}</h1>
          <p className="text-gray-300 mb-6">
            The complete platform for care providers to manage clients, bookings, and payments.
          </p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#1d2a63] p-4 rounded-lg">
              <h3 className="text-[#00C2CB] font-medium mb-2">Client Management</h3>
              <p className="text-gray-300 text-sm">Easily manage all your clients in one place</p>
            </div>
            <div className="bg-[#1d2a63] p-4 rounded-lg">
              <h3 className="text-[#00C2CB] font-medium mb-2">Booking System</h3>
              <p className="text-gray-300 text-sm">Schedule and track all your appointments</p>
            </div>
            <div className="bg-[#1d2a63] p-4 rounded-lg">
              <h3 className="text-[#00C2CB] font-medium mb-2">Payment Processing</h3>
              <p className="text-gray-300 text-sm">Manage invoices and get paid faster</p>
            </div>
            <div className="bg-[#1d2a63] p-4 rounded-lg">
              <h3 className="text-[#00C2CB] font-medium mb-2">Performance Analytics</h3>
              <p className="text-gray-300 text-sm">Track your business growth with detailed reports</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
