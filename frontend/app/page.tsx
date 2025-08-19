"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { API_BASE } from "@/lib/api"

export default function LoginPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Form Builder</CardTitle>
          <CardDescription className="text-gray-600">
            Create dynamic forms connected to your Airtable bases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <a href={`${API_BASE}/auth/login`}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium">
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Login with Airtable
            </Button>
          </a>

          <div className="text-center text-sm text-gray-500">
            <p>Connect your Airtable account to start building forms</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
