"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Environment variables
const ENABLE_SOCIAL_LOGIN = process.env.NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN === "true"
const ENABLE_REGISTRATION = process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === "true"
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Super Carer App"

export default function LoginPage() {
  const { login, isLoading, error: authError, clearError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      await login(email, password)
    } catch (err) {
      // Error is handled by the auth context
    }
  }

  const handleSocialLogin = async (provider: "google" | "facebook" | "apple") => {
    clearError()

    try {
      await login(email, password)
    } catch (err) {
      // Error is handled by the auth context
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Log in to your account</h1>
        <p className="text-gray-500 mt-2">Welcome back to {APP_NAME}! Please enter your details.</p>
      </div>

      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="text-sm text-[#00C2CB] hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full bg-[#00C2CB] hover:bg-[#00a9b1]" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      {ENABLE_SOCIAL_LOGIN && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              disabled={isLoading}
              className="flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("facebook")}
              disabled={isLoading}
              className="flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" />
              </svg>
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("apple")}
              disabled={isLoading}
              className="flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.7023 0C15.0734 0.0807095 13.2241 1.14664 12.1538 2.5C11.1979 3.70845 10.4419 5.42143 10.8799 7.0915C12.6484 7.13248 14.4465 6.03105 15.4829 4.65789C16.4388 3.37519 17.1045 1.68333 16.7023 0Z" />
                <path d="M21.4347 8.19648C19.9961 6.39395 17.9363 5.39742 16.0034 5.39742C13.4996 5.39742 12.4636 6.67722 10.6513 6.67722C8.78956 6.67722 7.33517 5.40032 5.20079 5.40032C3.66829 5.40032 1.97932 6.10902 0.81601 7.60105C-0.81934 9.76027 -0.78001 14.0733 2.47044 18.8042C3.56377 20.4132 5.0182 22.2157 6.91646 22.2506C8.57456 22.2826 9.02838 21.0552 11.1598 21.0378C13.2913 21.0203 13.7161 22.2855 15.3713 22.2506C17.2695 22.2157 18.8979 20.1232 19.9913 18.5142C20.7762 17.3897 21.0836 16.8274 21.7382 15.4513C17.8073 13.8423 17.0224 8.54135 21.4347 8.19648Z" />
              </svg>
              Apple
            </Button>
          </div>
        </>
      )}

      {ENABLE_REGISTRATION && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-[#00C2CB] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
