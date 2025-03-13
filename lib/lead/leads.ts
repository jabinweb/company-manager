import { prisma } from "@/lib/prisma"
import { LeadStatus } from "@prisma/client"

export async function updateLeadStatus(
  leadId: string, 
  status: LeadStatus,
  userId: string
) {
  const lead = await prisma.lead.update({
    where: { id: leadId },
    data: { 
      status,
      activities: {
        create: {
          type: 'NOTE',
          description: `Status updated to ${status}`,
          employeeId: userId
        }
      }
    },
    include: {
      assignedTo: true,
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      }
    }
  })

  return lead
}

export async function convertLeadToClient(leadId: string, userId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId }
  })

  if (!lead) throw new Error("Lead not found")

  const client = await prisma.$transaction(async (tx) => {
    // Create client
    const client = await tx.client.create({
      data: {
        id: crypto.randomUUID(),
        name: lead.contactName,
        email: lead.email || '',
        phone: lead.phone || '',
        contact: lead.contactName,
        address: { street: '', city: '', country: '' },
        companyId: lead.companyId
      }
    })

    // Update lead
    await tx.lead.update({
      where: { id: leadId },
      data: {
        status: 'WON',
        convertedClientId: client.id,
        convertedAt: new Date(),
        activities: {
          create: {
            type: 'NOTE',
            description: 'Lead converted to client',
            employeeId: userId
          }
        }
      }
    })

    return client
  })

  return client
}
