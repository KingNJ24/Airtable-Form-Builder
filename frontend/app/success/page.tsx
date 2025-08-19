"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const [formName, setFormName] = useState<string | null>(null)

  useEffect(() => {
    const form = searchParams.get("form")
    setFormName(form)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Form Submitted Successfully!</CardTitle>
          <CardDescription className="text-gray-600">
            {formName ? (
              <>
                Your response to <strong>"{formName}"</strong> has been recorded successfully.
              </>
            ) : (
              "Your form response has been recorded successfully."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                Thank you for your submission! We've received your information and will process it accordingly.
              </p>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p>What happens next?</p>
              <ul className="text-left space-y-1 pl-4">
                <li>• Your response has been saved to the connected Airtable base</li>
                <li>• You may receive a confirmation email shortly</li>
                <li>• Our team will review your submission if required</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
            <Button
              onClick={() => window.history.back()}
              variant="default"
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">Need help? Contact our support team or visit our help center.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
