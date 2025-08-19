import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface MultiSelectFieldProps {
  id: string
  label: string
  value: string[]
  onChange: (value: string[]) => void
  options: string[]
  required?: boolean
  error?: string
  disabled?: boolean
}

export function MultiSelectField({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  disabled = false,
}: MultiSelectFieldProps) {
  const handleOptionChange = (option: string, checked: boolean) => {
    const newValue = checked ? [...value, option] : value.filter((v) => v !== option)
    onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Label>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className={`space-y-2 p-3 border rounded-md ${error ? "border-red-500" : "border-gray-200"}`}>
        {options.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${id}-${option}`}
              checked={value.includes(option)}
              onCheckedChange={(checked) => handleOptionChange(option, checked as boolean)}
              disabled={disabled}
            />
            <Label htmlFor={`${id}-${option}`}>{option}</Label>
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
