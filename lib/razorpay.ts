import Razorpay from 'razorpay'
import { prisma } from '@/lib/prisma'

export const getRazorpayInstance = async (companyId: number) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { settings: true }
  })

  const settings = company?.settings as any

  if (!settings?.payroll?.razorpay?.enabled) {
    throw new Error('Razorpay is not enabled for this company')
  }

  return new Razorpay({
    key_id: settings.payroll.razorpay.keyId,
    key_secret: settings.payroll.razorpay.webhookSecret,
  })
}

export interface PayrollPayment {
  employeeId: string
  amount: number
  currency: string
  description: string
  payslipId: string
}

export const createPayrollPayment = async (payment: PayrollPayment) => {
  try {
    const order = await razorpay.orders.create({
      amount: payment.amount * 100, // Razorpay expects amount in paise
      currency: payment.currency,
      notes: {
        employeeId: payment.employeeId,
        payslipId: payment.payslipId,
        description: payment.description
      }
    })

    return order
  } catch (error) {
    console.error('Razorpay order creation failed:', error)
    throw new Error('Failed to initiate payment')
  }
}
