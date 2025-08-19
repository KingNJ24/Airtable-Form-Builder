"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus } from "lucide-react"

interface ConditionalRule {
  id: string
  field: string
  operator: string
  value: string
}

interface ConditionalLogicBuilderProps {
  availableFields: Array<{ id: string; name: string; type: string }>
  rules: ConditionalRule[]
  onChange: (rules: ConditionalRule[]) => void
}

const operators = [
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "greater_than", label: "is greater than" },
  { value: "less_than", label: "is less than" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
]

export function ConditionalLogicBuilder({ availableFields, rules, onChange }: ConditionalLogicBuilderProps) {
  const addRule = () => {
    const newRule: ConditionalRule = {
      id: `rule-${Date.now()}`,
      field: "",
      operator: "equals",
      value: "",
    }
    onChange([...rules, newRule])
  }

  const updateRule = (ruleId: string, field: keyof ConditionalRule, value: string) => {
    const updatedRules = rules.map((rule) => (rule.id === ruleId ? { ...rule, [field]: value } : rule))
    onChange(updatedRules)
  }

  const removeRule = (ruleId: string) => {
    const filteredRules = rules.filter((rule) => rule.id !== ruleId)
    onChange(filteredRules)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Conditional Logic</CardTitle>
        <p className="text-sm text-gray-600">Show this field only when certain conditions are met</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">No conditional rules set</p>
            <Button onClick={addRule} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Condition
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Show this field when <strong>all</strong> of the following conditions are met:
            </div>

            {rules.map((rule, index) => (
              <div key={rule.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                  {/* Field Selection */}
                  <div>
                    <Label className="text-xs text-gray-500">Field</Label>
                    <Select value={rule.field} onValueChange={(value) => updateRule(rule.id, "field", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFields.map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Operator Selection */}
                  <div>
                    <Label className="text-xs text-gray-500">Condition</Label>
                    <Select value={rule.operator} onValueChange={(value) => updateRule(rule.id, "operator", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((operator) => (
                          <SelectItem key={operator.value} value={operator.value}>
                            {operator.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Value Input */}
                  <div>
                    <Label className="text-xs text-gray-500">Value</Label>
                    <Input
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, "value", e.target.value)}
                      placeholder="Enter value"
                      disabled={rule.operator === "is_empty" || rule.operator === "is_not_empty"}
                    />
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRule(rule.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button onClick={addRule} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Another Condition
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
