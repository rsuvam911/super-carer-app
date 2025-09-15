"use client";

import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyOtpPage() {
  const { verifyOtp, resendOtp, isLoading } = useAuth();
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get email from URL params or localStorage (fallback for registration flow)
  const urlEmail = searchParams.get("email");
  const storedEmail =
    typeof window !== "undefined"
      ? localStorage.getItem("pendingVerificationEmail")
      : null;
  const email = urlEmail || storedEmail;

  // Check if email exists and show a message if it doesn't
  const [emailMissing, setEmailMissing] = useState(false);

  useEffect(() => {
    // Only run this effect once on component mount
    const checkEmail = () => {
      if (!email) {
        console.log("Email is missing in verify-otp page");
        setEmailMissing(true);
        // Don't immediately redirect, show an error message instead
        setTimeout(() => {
          router.push("/register");
        }, 3000); // Give user 3 seconds to see the error before redirecting to register
      } else {
        console.log("Email found in verify-otp page:", email);
      }
    };

    checkEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && otp) {
      try {
        await verifyOtp(email, otp);
      } catch (error) {
        // Error is handled in auth context
      }
    }
  };

  const handleResendOtp = async () => {
    if (email) {
      setIsResending(true);
      try {
        await resendOtp(email);
      } catch (error) {
        // Error is handled in auth context
      } finally {
        setIsResending(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Verify your account</h1>
        <p className="text-sm text-gray-600 mt-1">
          Registration completed! Please verify your email to continue.
        </p>

        {emailMissing ? (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            <p className="font-medium">Email address is missing!</p>
            <p className="text-sm mt-1">
              Redirecting to registration page in a few seconds...
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mt-2">
              Enter the 6-digit code sent to {email}.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-center block">
                  OTP Code
                </Label>
                <div className="flex justify-center">
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
              </div>
              <Button
                type="submit"
                className="w-full bg-[#00C2CB] hover:bg-[#00a9b1]"
                disabled={isLoading || otp.length < 6}
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-500 mb-2">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOtp}
                disabled={isResending || isLoading}
                className="text-[#00C2CB] border-[#00C2CB] hover:bg-[#00C2CB] hover:text-white"
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
