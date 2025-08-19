"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Eye, Plus, X } from "lucide-react"
import Link from "next/link"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"

interface Base { id: string; name: string }
interface Table { id: string; name: string; fields?: any[] }

interface FormField {
  id: string
  name: string
  type: string
  label: string
  required: boolean
  options?: string[]
  conditionalLogic?: { showIf: string; operator: string; value: string }
}


// Mock fallback data (used if backend API is unavailable or unauthorized)
const mockBases: Base[] = [
  { id: "base1", name: "Customer Management" },
  { id: "base2", name: "Event Planning" },
  { id: "base3", name: "Product Catalog" },
]

const mockTables: Record<string, Table[]> = {
  base1: [
    { id: "table1", name: "Customers" },
    { id: "table2", name: "Orders" },
  ],
  base2: [
    { id: "table3", name: "Events" },
    { id: "table4", name: "Attendees" },
  ],
  base3: [
    { id: "table5", name: "Products" },
    { id: "table6", name: "Categories" },
  ],
}

const mockFields: Record<string, any[]> = {
  table1: [
    { id: "field1", name: "Name", type: "singleLineText", required: true },
    { id: "field2", name: "Email", type: "email", required: true },
    { id: "field3", name: "Phone", type: "phoneNumber", required: false },
    { id: "field4", name: "Company", type: "singleLineText", required: false },
    { id: "field5", name: "Industry", type: "singleSelect", required: false, options: ["Tech","Healthcare","Finance","Retail"] },
    { id: "field6", name: "Interests", type: "multipleSelect", required: false, options: ["Product Updates","Events","Newsletter","Support"] },
    { id: "field7", name: "Comments", type: "multilineText", required: false },
  ],
}

export default function FormBuilderPage() {
  const router = useRouter()
  const [formTitle, setFormTitle] = useState("Untitled Form")

  const [bases, setBases] = useState<Base[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [availableFields, setAvailableFields] = useState<any[]>([])

  const [selectedBase, setSelectedBase] = useState("")
  const [selectedTable, setSelectedTable] = useState("")
  const [selectedFields, setSelectedFields] = useState<FormField[]>([])

  // Load bases with backend -> fallback to mock on error/empty
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch('/airtable/bases')
        const list = Array.isArray(data?.bases) && data.bases.length > 0 ? data.bases : mockBases
        setBases(list)
      } catch (_) {
        setBases(mockBases)
      }
    })()
  }, [])

  // Load tables when base selected -> fallback to mock
  useEffect(() => {
    if (!selectedBase) { setTables([]); setSelectedTable(""); setAvailableFields([]); return }
    (async () => {
      try {
        const data = await apiFetch(`/airtable/tables?baseId=${encodeURIComponent(selectedBase)}`)
        const list = Array.isArray(data?.tables) && data.tables.length > 0 ? data.tables : (mockTables[selectedBase] || [])
        setTables(list)
      } catch (_) {
        setTables(mockTables[selectedBase] || [])
      }
    })()
  }, [selectedBase])

  // Load fields when table selected -> fallback to mock
  useEffect(() => {
    if (!selectedBase || !selectedTable) { setAvailableFields([]); return }
    (async () => {
      try {
        const data = await apiFetch(`/airtable/fields?baseId=${encodeURIComponent(selectedBase)}&tableId=${encodeURIComponent(selectedTable)}`)
        const raw = Array.isArray(data?.fields) && data.fields.length > 0 ? data.fields : (mockFields[selectedTable] || [])
        const fields = raw.map((f: any) => {
          let options: string[] | undefined
          if ((f.type === 'singleSelect' || f.type === 'multipleSelect') && f.options?.choices) {
            options = (f.options.choices || []).map((c: any) => c?.name).filter(Boolean)
          } else if (Array.isArray(f.options)) {
            options = f.options
          }
          return { id: f.id, name: f.name, type: f.type, required: !!f.required, options }
        })
        setAvailableFields(fields)
      } catch (_) {
        const raw = mockFields[selectedTable] || []
        const fields = raw.map((f: any) => ({ id: f.id, name: f.name, type: f.type, required: !!f.required, options: f.options }))
        setAvailableFields(fields)
      }
    })()
  }, [selectedBase, selectedTable])

  const addField = (field: any) => {
    const newField: FormField = {
      id: field.id,
      name: field.name,
      type: field.type,
      label: field.name,
      required: field.required,
      options: field.options,
    }
    setSelectedFields([...selectedFields, newField])
  }

  const removeField = (fieldId: string) => {
    setSelectedFields(selectedFields.filter((f) => f.id !== fieldId))
  }

  const updateFieldLabel = (fieldId: string, label: string) => {
    setSelectedFields(selectedFields.map((f) => (f.id === fieldId ? { ...f, label } : f)))
  }

  const updateFieldRequired = (fieldId: string, required: boolean) => {
    setSelectedFields(selectedFields.map((f) => (f.id === fieldId ? { ...f, required } : f)))
  }

  const renderFieldPreview = (field: FormField) => {
    switch (field.type) {
      case "singleLineText":
      case "email":
      case "phoneNumber":
        return (
          <div className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input placeholder={`Enter ${field.label.toLowerCase()}`} />
          </div>
        )
      case "multilineText":
        return (
          <div className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea placeholder={`Enter ${field.label.toLowerCase()}`} />
          </div>
        )
      case "singleSelect":
        return (
          <div className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Select>
              <SelectTrigger>
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
          </div>
        )
      case "multipleSelect":
        return (
          <div className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox id={option} />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            <Input placeholder={`Enter ${field.label.toLowerCase()}`} />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
                <p className="text-gray-600">Create dynamic forms from your Airtable data</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={async () => {
                  try {
                    const body = {
                      name: formTitle,
                      baseId: selectedBase,
                      tableId: selectedTable,
                      fields: selectedFields.map(f => ({
                        airtableFieldId: f.id,
                        label: f.label,
                        type: f.type,
                        required: f.required,
                        options: f.options,
                      })),
                      logic: {},
                    };
                    const res = await apiFetch('/forms/create', { method: 'POST', body: JSON.stringify(body) });
                    const id = res?.id || res?.form?._id;
                    if (id) router.push(`/form/${id}`);
                  } catch (e: any) {
                    alert(e.message || 'Failed to save form');
                  }
                }}
                disabled={!selectedBase || !selectedTable || selectedFields.length === 0}
              >
                Save Form
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="formTitle">Form Title</Label>
                    <Input id="formTitle" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Enter form title" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">1</span>
                  Select Airtable Base
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedBase} onValueChange={setSelectedBase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an Airtable base" />
                  </SelectTrigger>
                  <SelectContent>
                    {bases.map((base) => (
                      <SelectItem key={base.id} value={base.id}>{base.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedBase && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">2</span>
                    Select Table
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            )}

            {selectedTable && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm mr-2">3</span>
                    Configure Form Fields
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Available Fields</h4>
                    <div className="space-y-2">
                      {availableFields
                        .filter((field: any) => !selectedFields.find((sf: FormField) => sf.id === field.id))
                        .map((field: any) => (
                          <div key={field.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <span className="font-medium">{field.name}</span>
                              <Badge variant="secondary" className="ml-2">{field.type}</Badge>
                            </div>
                            <Button size="sm" onClick={() => addField(field)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>

                  {selectedFields.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Form Fields</h4>
                      <div className="space-y-4">
                        {selectedFields.map((field, index) => (
                          <Card key={field.id}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <span className="font-medium">Field {index + 1}</span>
                                <Button size="sm" variant="ghost" onClick={() => removeField(field.id)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <Label>Field Label</Label>
                                  <Input value={field.label} onChange={(e) => updateFieldLabel(field.id, e.target.value)} />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox checked={field.required} onCheckedChange={(checked) => updateFieldRequired(field.id, checked as boolean)} />
                                  <Label>Required field</Label>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:sticky lg:top-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  Live Preview
                </CardTitle>
                <CardDescription>See how your form will look to users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 p-4 border rounded-lg bg-white">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{formTitle}</h2>
                    <p className="text-gray-600">Fill out this form to submit your information.</p>
                  </div>

                  {selectedFields.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Add fields to see the preview</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedFields.map((field) => (
                        <div key={field.id}>{renderFieldPreview(field)}</div>
                      ))}
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Submit Form</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
