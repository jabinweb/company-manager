import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { encryptSensitiveData } from '@/lib/encryption'
import { validateSettings } from '@/lib/validations/settings'
import type { SettingsUpdateAction } from '@/types/settings'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.companyId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get both company data and settings
    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
      select: {
        id: true,
        name: true,
        logo: true,
        email: true,
        phone: true,
        website: true,
        settings: true
      }
    })

    // Separate response structure
    const response = {
      company: {
        id: company?.id,
        name: company?.name,
        logo: company?.logo,
        email: company?.email,
        phone: company?.phone,
        website: company?.website,
      },
      settings: company?.settings || {}
    }

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[API] Settings error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.companyId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { company: companyData, settings: settingsData } = await req.json()

    // Update company and settings separately
    const company = await prisma.company.update({
      where: { id: session.user.companyId },
      data: {
        ...(companyData && {
          name: companyData.name,
          logo: companyData.logo,
          email: companyData.email,
          phone: companyData.phone,
          website: companyData.website,
        }),
        ...(settingsData && { settings: settingsData })
      },
      select: {
        id: true,
        name: true,
        logo: true,
        email: true,
        phone: true,
        website: true,
        settings: true
      }
    })

    // Return the same structure as GET
    const response = {
      company: {
        id: company.id,
        name: company.name,
        logo: company.logo,
        email: company.email,
        phone: company.phone,
        website: company.website,
      },
      settings: company.settings || {}
    }

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[API] Settings update error:', error)
    return new Response(
      JSON.stringify({ 
        message: error instanceof Error ? error.message : 'Internal Server Error' 
      }), 
      { 
        status: error instanceof Error ? 400 : 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
