import { NextRequest } from "next/server"
import { getServerSession } from '@/lib/server-session'
import { prisma } from "@/lib/prisma"
import PDFDocument from 'pdfkit'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    const session = await getServerSession()
    if (!session?.user?.employeeId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const id = (await params).id
    const payslip = await prisma.payslip.findFirst({
      where: {
        id,
        employeeId: session.user.employeeId,
      },
      include: {
        Employee: true
      }
    })

    if (!payslip) {
      return new Response(JSON.stringify({ error: "Payslip not found" }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const doc = new PDFDocument()
    const chunks: Buffer[] = []

    return new Promise<Response>((resolve, reject) => {
      // Handle document errors
      doc.on('error', reject)

      // Collect data chunks
      doc.on('data', chunks.push.bind(chunks))

      // When document is done being written
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="payslip-${payslip.month}-${payslip.year}.pdf"`,
            'Content-Length': pdfBuffer.length.toString()
          }
        }))
      })

      // Generate PDF content
      generatePayslipPDF(doc, payslip)
    }).catch(error => {
      console.error("PDF Generation error:", error)
      return new Response(JSON.stringify({ error: "Failed to generate PDF" }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    })

  } catch (error) {
    console.error("Error downloading payslip:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

function generatePayslipPDF(doc: PDFKit.PDFDocument, payslip: any) {
  // Company Header
  doc.fontSize(20).text('Company Name', { align: 'center' })
  doc.moveDown()

  // Payslip Header
  doc.fontSize(16).text('PAYSLIP', { align: 'center' })
  doc.moveDown()

  // Employee Details
  doc.fontSize(12)
  doc.text(`Employee Name: ${payslip.Employee.name}`)
  doc.text(`Employee ID: ${payslip.Employee.employeeId}`)
  doc.text(`Month: ${payslip.month}/${payslip.year}`)
  doc.moveDown()

  // Salary Details
  doc.text('Earnings:', { underline: true })
  doc.text(`Basic Salary: $${payslip.basicSalary.toFixed(2)}`)
  doc.text(`Allowances: $${payslip.additions.toFixed(2)}`)
  doc.moveDown()

  doc.text('Deductions:', { underline: true })
  doc.text(`Total Deductions: $${payslip.deductions.toFixed(2)}`)
  doc.moveDown()

  // Net Salary
  doc.fontSize(14)
  doc.text(`Net Salary: $${payslip.netSalary.toFixed(2)}`, { underline: true })
  
  // Payment Status
  doc.moveDown()
  doc.fontSize(12)
  doc.text(`Payment Status: ${payslip.isPaid ? 'Paid' : 'Pending'}`)
  if (payslip.paidAt) {
    doc.text(`Paid on: ${new Date(payslip.paidAt).toLocaleDateString()}`)
  }

  // Footer
  doc.moveDown(2)
  doc.fontSize(10)
  doc.text('This is a computer generated document.', { align: 'center' })
  
  doc.end()
}
