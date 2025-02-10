'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from '@/hooks/use-session'
import { Button } from '@/components/ui/button'
import { UserPlus, Upload } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import { columns, type Employee } from "./columns"
import { DataTable } from "@/components/table/data-table"

interface Metadata {
  departments: { label: string; value: string }[];
  statuses: { label: string; value: string }[];
  employmentTypes: { label: string; value: string }[];
}

export default function EmployeesPage() {
  const { data: session } = useSession()
  const companyId = session?.user?.primaryCompanyId

  const [employees, setEmployees] = useState<Employee[]>([])
  const [filterOptions, setFilterOptions] = useState<Metadata | null>(null)
  const [isLoading, setIsLoading] = useState(false) // Changed initial state to false
  const [activeFilters, setActiveFilters] = useState<{
    departments?: string[],
    statuses?: string[]
  }>({})

  // Move fetch functions outside of component or into custom hooks if needed
  const fetchEmployees = useCallback(async (filters?: { departments?: string[], statuses?: string[] }) => {
    if (!companyId) return []
    
    const params = new URLSearchParams()
    filters?.departments?.forEach(dept => params.append('department', dept))
    filters?.statuses?.forEach(status => params.append('status', status))

    const response = await fetch(`/api/employees?${params}`)
    const data = await response.json()      
    
    if (!response.ok) throw new Error(data.error)
    return data
  }, [companyId])

  const fetchMetadata = useCallback(async () => {
    if (!companyId) return null
    
    const cached = sessionStorage.getItem('employeeMetadata')
    if (cached) {
      return JSON.parse(cached)
    }

    const response = await fetch('/api/employees/metadata')
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    
    sessionStorage.setItem('employeeMetadata', JSON.stringify(data))
    return data
  }, [companyId])

  // Initial data fetch
  useEffect(() => {
    if (!companyId) return

    let mounted = true
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        const [employeesData, metadataData] = await Promise.all([
          fetchEmployees({}),
          fetchMetadata()
        ])
        
        if (!mounted) return
        
        setEmployees(employeesData)
        if (metadataData) setFilterOptions(metadataData)
      } catch (error) {
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load initial data"
          })
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadInitialData()
    return () => { mounted = false }
  }, [companyId, fetchEmployees, fetchMetadata])

  // Handle filter changes
  useEffect(() => {
    if (!companyId || !Object.keys(activeFilters).length) return

    let mounted = true
    const loadFilteredData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchEmployees(activeFilters)
        if (mounted) setEmployees(data)
      } catch (error) {
        if (mounted) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to apply filters"
          })
        }
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    loadFilteredData()
    return () => { mounted = false }
  }, [activeFilters, companyId, fetchEmployees])

  // Memoize handlers and computed values
  const handleFiltersChange = useCallback((filters: { departments?: string[], statuses?: string[] }) => {
    setActiveFilters(filters)
  }, [])

  const filterableColumns = useMemo(() => ({
    status: {
      title: "Status",
      options: filterOptions?.statuses || []
    },
    department: {
      title: "Department",
      options: filterOptions?.departments || []
    }
  }), [filterOptions])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <div className="flex gap-3">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Employees
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import Employees
          </Button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={employees}
        isLoading={isLoading}
        searchableColumn="name"
        filterableColumns={filterableColumns}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  )
}