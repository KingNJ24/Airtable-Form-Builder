"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TextInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: "text" | "email" | "tel" | "url"
  error?: string
  disabled?: boolean
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  error,
  disabled = false,
}: TextInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || `Enter ${label.toLowerCase()}`}
        className={error ? "border-red-500" : ""}
        disabled={disabled}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
