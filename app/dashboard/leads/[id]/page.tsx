'use client'

import { useParams } from 'next/navigation'
import { useLead } from '@/hooks/use-lead'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LeadTimeline } from '@/components/leads/lead-timeline'
import { LeadActions } from '@/components/leads/lead-actions'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Globe, Mail, Phone } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { LeadDocuments } from '@/components/leads/lead-documents'

export default function LeadDetailsPage() {
  const params = useParams()
  const { data: lead, isLoading } = useLead(params.id as string)

  if (isLoading) {
    return (
      <div className="container py-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-8 w-24" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <Skeleton className="h-[600px] w-full" />
          </div>
          <div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Lead Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The lead you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Button asChild variant="outline">
            <Link href="/dashboard/leads">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const contactMethods = [
    { icon: Mail, value: lead.email, href: `mailto:${lead.email}` },
    { icon: Phone, value: lead.phone, href: `tel:${lead.phone}` },
    { icon: Globe, value: lead.website, href: lead.website },
    { 
      icon: Calendar, 
      value: lead.lastContactedAt ? `Last Contact: ${formatDate(lead.lastContactedAt)}` : 'No contact yet',
      href: null 
    }
  ]

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/leads">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leads
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{lead.title}</h1>
            <p className="text-sm text-muted-foreground">Created {formatDate(lead.createdAt)}</p>
          </div>
        </div>
        <LeadActions lead={lead} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activities">
                Activities
                {lead._count?.activities > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {lead._count.activities}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="documents">
                Documents
                {lead._count?.documents > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {lead._count.documents}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {contactMethods.map(({ icon: Icon, value, href }, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        {href ? (
                          <a 
                            href={href} 
                            className="text-blue-600 hover:underline"
                            target={href.startsWith('http') ? '_blank' : undefined}
                            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {value || 'N/A'}
                          </a>
                        ) : (
                          <span>{value || 'N/A'}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Lead Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Value</label>
                      <p className="text-2xl font-semibold">
                        {lead.value ? formatCurrency(lead.value) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Source</label>
                      <p>{lead.source}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="mt-1 whitespace-pre-wrap">{lead.description || 'No description provided'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Requirements</label>
                    <p className="mt-1 whitespace-pre-wrap">{lead.requirements || 'No requirements specified'}</p>
                  </div>

                  {lead.notes && (
                    <div>
                      <label className="text-sm font-medium">Notes</label>
                      <p className="mt-1 whitespace-pre-wrap">{lead.notes}</p>
                    </div>
                  )}

                  {lead.tags && lead.tags.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Tags</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {lead.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activities">
              <LeadTimeline activities={lead.activities} />
            </TabsContent>

            <TabsContent value="documents">
              <LeadDocuments documents={lead.documents} leadId={lead.id} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Badge className="mt-2 block w-full text-center py-1" variant={
                  lead.status === 'WON' ? 'default' :
                  lead.status === 'LOST' ? 'destructive' :
                  'secondary'
                }>
                  {lead.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Badge className="mt-2 block w-full text-center py-1" variant={
                  lead.priority === 'URGENT' ? 'destructive' :
                  lead.priority === 'HIGH' ? 'destructive' :
                  lead.priority === 'MEDIUM' ? 'default' :
                  'secondary'
                }>
                  {lead.priority}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Assigned To</label>
                <div className="flex items-center gap-2 p-4 rounded-lg border">
                  <Avatar>
                    <AvatarImage src={lead.assignedTo.avatar || ''} />
                    <AvatarFallback>{lead.assignedTo.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{lead.assignedTo.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.assignedTo.email}</p>
                  </div>
                </div>
              </div>

              {lead.nextFollowUp && (
                <div>
                  <label className="text-sm font-medium">Next Follow-up</label>
                  <p className="mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(lead.nextFollowUp)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
