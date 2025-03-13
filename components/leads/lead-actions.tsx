import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Lead, LeadStatus } from '@/types/lead'
import { 
  MoreHorizontal, 
  PhoneCall, 
  Mail, 
  Calendar, 
  Edit, 
  UserPlus, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface LeadActionsProps {
  lead: Lead
}

export function LeadActions({ lead }: LeadActionsProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleStatusChange = async (status: LeadStatus) => {
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!response.ok) throw new Error('Failed to update status')

      toast({
        title: 'Success',
        description: `Lead marked as ${status.toLowerCase()}`
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update lead status',
        variant: 'destructive'
      })
    }
  }

  const handleConvertToClient = async () => {
    try {
      const response = await fetch(`/api/leads/${lead.id}/convert`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to convert lead')

      toast({
        title: 'Success',
        description: 'Lead converted to client successfully'
      })

      router.push('/dashboard/clients')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to convert lead to client',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="outline">
        <PhoneCall className="h-4 w-4 mr-2" />
        Call
      </Button>
      <Button size="sm" variant="outline">
        <Mail className="h-4 w-4 mr-2" />
        Email
      </Button>
      <Button size="sm" variant="outline">
        <Calendar className="h-4 w-4 mr-2" />
        Schedule
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => router.push(`/dashboard/leads/${lead.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Lead
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onSelect={() => handleStatusChange(LeadStatus.QUALIFIED)}>
            <Clock className="h-4 w-4 mr-2" />
            Mark as Qualified
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={() => handleStatusChange(LeadStatus.WON)}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Won
          </DropdownMenuItem>
          
          <DropdownMenuItem onSelect={() => handleStatusChange(LeadStatus.LOST)}>
            <XCircle className="h-4 w-4 mr-2" />
            Mark as Lost
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onSelect={handleConvertToClient}>
            <UserPlus className="h-4 w-4 mr-2" />
            Convert to Client
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
