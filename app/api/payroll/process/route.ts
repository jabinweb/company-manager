import { NextRequest } from 'next/server'
import { getServerSession } from '@/lib/server-session'
import { prisma } from '@/lib/prisma'
import { createPayrollPayment } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session?.user?.role !== 'ADMIN') {
      return new Response('Unauthorized', { status: 401 })
    }

    const { payslipId } = await req.json()

    const payslip = await prisma.payslip.findUnique({
      where: { id: payslipId },
      include: {
        Employee: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!payslip) {
      return new Response('Payslip not found', { status: 404 })
    }

    const payment = await createPayrollPayment({
      employeeId: payslip.employeeId,
      amount: payslip.netSalary,
      currency: 'INR', // Default to INR for Razorpay
      description: `Salary payment for ${payslip.Employee.name} - ${payslip.month}/${payslip.year}`,
      payslipId: payslip.id
    })

    // Update payslip with payment details
    await prisma.payslip.update({
      where: { id: payslipId },
      data: {
        updatedAt: new Date(),
        metadata: {
          razorpayOrderId: payment.id,
          paymentStatus: 'INITIATED'
        }
      }
    })

    return new Response(JSON.stringify(payment), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('[API] Process payroll error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
