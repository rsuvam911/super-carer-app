"use client"

import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function VerifyOtpPage() {
  const { verifyOtp, isLoading } = useAuth()
  const [otp, setOtp] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  // Check if email exists and show a message if it doesn't
  const [emailMissing, setEmailMissing] = useState(false)

  useEffect(() => {
    // Only run this effect once on component mount
    const checkEmail = () => {
      if (!email) {
        console.log("Email is missing in verify-otp page");
        setEmailMissing(true);
        // Don't immediately redirect, show an error message instead
        setTimeout(() => {
          router.push("/login");
        }, 3000); // Give user 3 seconds to see the error before redirecting
      } else {
        console.log("Email found in verify-otp page:", email);
      }
    };

    checkEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && otp) {
      try {
        await verifyOtp(email, otp)
      } catch (error) {
        // Error is handled in auth context
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Verify your account</h1>

        {emailMissing ? (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            <p className="font-medium">Email address is missing!</p>
            <p className="text-sm mt-1">Redirecting to login page in a few seconds...</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mt-2">Enter the 6-digit code sent to {email}.</p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-2 text-center">
                <Label htmlFor="otp">OTP Code</Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                type="submit"
                className="w-full bg-[#00C2CB] hover:bg-[#00a9b1]"
                disabled={isLoading || otp.length < 6}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
