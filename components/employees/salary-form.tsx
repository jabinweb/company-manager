'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import type { SalaryStructure } from '@/types/salary'

interface SalaryFormProps {
  employeeId: string; 
  onSuccess?: () => void
  initialData?: Partial<SalaryStructure>
}

export function SalaryForm({ employeeId, onSuccess, initialData }: SalaryFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<SalaryStructure>({
    basicSalary: 0,
    houseRent: 0,
    transport: 0,
    medicalAllowance: 0,
    taxDeduction: 0,
    otherDeductions: 0
  })

  useEffect(() => {
    async function fetchCurrentSalary() {
      try {
        const res = await fetch(`/api/employees/${employeeId}/salary`)
        if (res.ok) {
          const data = await res.json()
          if (data) {
            console.log('Fetched salary data:', data)
            setFormData({
              basicSalary: data.basicSalary || 0,
              houseRent: data.houseRent || 0,
              transport: data.transport || 0,
              medicalAllowance: data.medicalAllowance || 0,
              taxDeduction: data.taxDeduction || 0,
              otherDeductions: data.otherDeductions || 0
            })
          }
        }
      } catch (error) {
        console.error('Error fetching salary:', error)
      }
    }

    fetchCurrentSalary()
  }, [employeeId])

  const handleSubmit = async () => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/employees/${employeeId}/salary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) throw new Error('Failed to update salary')
      
      toast({
        title: "Success",
        description: "Salary updated successfully"
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update salary",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Structure</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Basic Salary</Label>
            <Input 
              type="number"
              value={formData.basicSalary}
              onChange={e => setFormData(prev => ({ ...prev, basicSalary: Number(e.target.value) }))}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label>House Rent</Label>
            <Input 
              type="number"
              value={formData.houseRent}
              onChange={e => setFormData(prev => ({ ...prev, houseRent: Number(e.target.value) }))}
              disabled={isLoading}
            />
          </div>
          {/* Add other fields similarly */}
        </div>
        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Salary"}
        </Button>
      </CardContent>
    </Card>
  )
}
