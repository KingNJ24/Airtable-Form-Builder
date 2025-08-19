"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { apiFetch } from "@/lib/api"

interface FormField {
  id: string
  name: string
  type: string
  label: string
  required: boolean
  options?: string[]
  conditionalLogic?: {
    showIf: string
    operator: string
    value: string
  }
}

interface FormConfig {
  id: string
  title: string
  description: string
  fields: FormField[]
}

// Mock form configurations
const mockFormConfigs: Record<string, FormConfig> = {
  "1": {
    id: "1",
    title: "Customer Feedback Survey",
    description: "Help us improve our services by sharing your feedback",
    fields: [
      {
        id: "name",
        name: "name",
        type: "singleLineText",
        label: "Full Name",
        required: true,
      },
      {
        id: "email",
        name: "email",
        type: "email",
        label: "Email Address",
        required: true,
      },
      {
        id: "rating",
        name: "rating",
        type: "singleSelect",
        label: "Overall Rating",
        required: true,
        options: ["Excellent", "Good", "Average", "Poor"],
      },
      {
        id: "recommend",
        name: "recommend",
        type: "singleSelect",
        label: "Would you recommend us?",
        required: true,
        options: ["Yes", "No", "Maybe"],
      },
      {
        id: "improvement",
        name: "improvement",
        type: "multilineText",
        label: "What can we improve?",
        required: false,
        conditionalLogic: {
          showIf: "rating",
          operator: "equals",
          value: "Poor",
        },
      },
      {
        id: "referral",
        name: "referral",
        type: "singleLineText",
        label: "How did you hear about us?",
        required: false,
        conditionalLogic: {
          showIf: "recommend",
          operator: "equals",
          value: "Yes",
        },
      },
      {
        id: "services",
        name: "services",
        type: "multipleSelect",
        label: "Which services have you used?",
        required: false,
        options: ["Consulting", "Development", "Support", "Training"],
      },
      {
        id: "comments",
        name: "comments",
        type: "multilineText",
        label: "Additional Comments",
        required: false,
      },
    ],
  },
  "2": {
    id: "2",
    title: "Event Registration Form",
    description: "Register for our upcoming event",
    fields: [
      {
        id: "name",
        name: "name",
        type: "singleLineText",
        label: "Full Name",
        required: true,
      },
      {
        id: "email",
        name: "email",
        type: "email",
        label: "Email Address",
        required: true,
      },
      {
        id: "company",
        name: "company",
        type: "singleLineText",
        label: "Company",
        required: false,
      },
      {
        id: "attendance",
        name: "attendance",
        type: "singleSelect",
        label: "Attendance Type",
        required: true,
        options: ["In-Person", "Virtual"],
      },
      {
        id: "dietary",
        name: "dietary",
        type: "multilineText",
        label: "Dietary Restrictions",
        required: false,
        conditionalLogic: {
          showIf: "attendance",
          operator: "equals",
          value: "In-Person",
        },
      },
    ],
  },
}

export default function FormViewerPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFormConfig = async () => {
      setIsLoading(true)
      try {
        const data = await apiFetch(`/forms/${id}`)
        const config: FormConfig = {
          id: data._id,
          title: data.name,
          description: data.description || "",
          fields: (data.fields || []).map((f: any) => ({
            id: f.airtableFieldId || f.label,
            name: f.airtableFieldId || f.label,
            type: f.type || 'singleLineText',
            label: f.label || f.airtableFieldId,
            required: !!f.required,
            options: Array.isArray(f.options) ? f.options : undefined,
          }))
        }
        setFormConfig(config)
      } catch (error) {
        console.error("Error fetching form config:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFormConfig()
  }, [id])

  const shouldShowField = (field: FormField): boolean => {
    if (!field.conditionalLogic) return true

    const { showIf, operator, value } = field.conditionalLogic
    const fieldValue = formData[showIf]

    switch (operator) {
      case "equals":
        return fieldValue === value
      case "not_equals":
        return fieldValue !== value
      case "contains":
        return fieldValue && fieldValue.includes(value)
      default:
        return true
    }
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }))
    }
  }

  const handleMultiSelectChange = (fieldId: string, option: string, checked: boolean) => {
    const currentValues = formData[fieldId] || []
    const newValues = checked ? [...currentValues, option] : currentValues.filter((v: string) => v !== option)
    handleInputChange(fieldId, newValues)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    formConfig?.fields.forEach((field) => {
      if (field.required && shouldShowField(field)) {
        const value = formData[field.id]
        if (!value || (Array.isArray(value) && value.length === 0)) {
          newErrors[field.id] = `${field.label} is required`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await apiFetch(`/responses/${id}`, { method: 'POST', body: JSON.stringify(formData) })
      router.push(`/success?form=${formConfig?.title}`)
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("There was an error submitting the form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) return null

    const hasError = !!errors[field.id]

    switch (field.type) {
      case "singleLineText":
      case "email":
      case "phoneNumber":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={field.id}
              type={field.type === "email" ? "email" : field.type === "phoneNumber" ? "tel" : "text"}
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className={hasError ? "border-red-500" : ""}
            />
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        )

      case "multilineText":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={formData[field.id] || ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={`Enter ${field.label.toLowerCase()}`}
              className={hasError ? "border-red-500" : ""}
              rows={4}
            />
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        )

      case "singleSelect":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select value={formData[field.id] || ""} onValueChange={(value) => handleInputChange(field.id, value)}>
              <SelectTrigger className={hasError ? "border-red-500" : ""}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        )

      case "multipleSelect":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className={`space-y-2 p-3 border rounded-md ${hasError ? "border-red-500" : "border-gray-200"}`}>
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.id}-${option}`}
                    checked={(formData[field.id] || []).includes(option)}
                    onCheckedChange={(checked) => handleMultiSelectChange(field.id, option, checked as boolean)}
                  />
                  <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>
            {hasError && <p className="text-sm text-red-500">{errors[field.id]}</p>}
          </div>
        )

      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (!formConfig) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Form Not Found</h2>
            <p className="text-gray-600 mb-4">The form you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{formConfig.title}</CardTitle>
            <CardDescription>{formConfig.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formConfig.fields.map((field) => renderField(field))}

              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>Please fix the errors above before submitting.</AlertDescription>
                </Alert>
              )}

              <div className="pt-4">
                <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Form"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
