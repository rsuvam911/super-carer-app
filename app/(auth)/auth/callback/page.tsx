"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { handleOAuthCallback } = useAuth()

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Get the code and state from the URL
        const code = searchParams.get("code")
        const state = searchParams.get("state")
        const provider = searchParams.get("provider") || "unknown"

        if (!code || !state) {
          throw new Error("Missing required parameters")
        }

        // Process the callback
        await handleOAuthCallback(code, state, provider)
        
        // The handleOAuthCallback function will redirect to the dashboard or original page
      } catch (err: any) {
        console.error("Error processing OAuth callback:", err)
        setError(err.message || "Authentication failed. Please try again.")
      }
    }

    processCallback()
  }, [searchParams, handleOAuthCallback, router])

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Processing your login...</h1>
        
        {error ? (
          <>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-[#00C2CB] text-white rounded-md hover:bg-[#00a9b1]"
            >
              Back to Login
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00C2CB]"></div>
            <p className="mt-4 text-gray-500">Please wait while we complete your authentication...</p>
          </div>
        )}
      </div>
    </div>
  )
}
