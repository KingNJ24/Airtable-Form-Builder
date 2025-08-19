"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Calendar, Users } from "lucide-react"
import Link from "next/link"
import { API_BASE, apiFetch } from "@/lib/api"

export default function DashboardPage() {
  const [forms, setForms] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/forms')
        setForms(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Failed to load forms', e)
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your dynamic forms</p>
            </div>
            <div className="flex items-center gap-2">
              <a href={`${API_BASE}/auth/login`}>
                <Button variant="outline">Connect Airtable</Button>
              </a>
              <Link href="/form-builder">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Form
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Forms</p>
                  <p className="text-2xl font-bold text-gray-900">{forms.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {forms.reduce((sum, form) => sum + (Number(form?.responses) || 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Forms</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {forms.filter((form) => form.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Forms</h2>
          </div>

          <div className="grid gap-6">
            {forms.map((form) => (
              <Card key={form._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{form.name || 'Untitled'}</CardTitle>
                      <CardDescription className="mt-1">{new Date(form.updatedAt || Date.now()).toLocaleString()}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          form.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {form.status}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-6 text-sm text-gray-600">
                      <span>{Number(form?.responses) || 0} responses</span>
                      <span>Modified {new Date(form?.updatedAt || form?.createdAt || Date.now()).toLocaleString()}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/form/${form._id}`}>
                        <Button variant="outline" size="sm">
                          View Form
                        </Button>
                      </Link>
                      <Link href={`/form-builder?edit=${form._id}`}>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
