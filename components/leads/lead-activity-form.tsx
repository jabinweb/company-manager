'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ActivityType } from '@prisma/client'
import { useToast } from '@/hooks/use-toast'

interface ActivityFormProps {
  leadId: string
  onSuccess?: () => void
}

export function LeadActivityForm({ leadId, onSuccess }: ActivityFormProps) {
  const [type, setType] = useState<ActivityType>(ActivityType.NOTE)
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/leads/${leadId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description, dueDate })
      })

      if (!response.ok) throw new Error('Failed to add activity')

      toast({ title: 'Success', description: 'Activity added successfully' })
      setDescription('')
      setDueDate(undefined)
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add activity',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select value={type} onValueChange={(v) => setType(v as ActivityType)}>
        <SelectTrigger>
          <SelectValue placeholder="Select activity type" />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ActivityType).map((type) => (
            <SelectItem key={type} value={type}>
              {type.replace('_', ' ')}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        placeholder="Activity description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />

      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal w-full",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : "Set due date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button type="submit" disabled={isLoading || !description}>
          {isLoading ? "Adding..." : "Add Activity"}
        </Button>
      </div>
    </form>
  )
}
