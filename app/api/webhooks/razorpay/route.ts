import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import crypto from 'crypto'
import { PaymentStatus, PayslipMetadata } from '@/types/payroll'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return new Response('Invalid signature', { status: 400 })
    }

    const event = JSON.parse(body)

    // Handle different event types
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentSuccess(event.payload.payment.entity)
        break
      case 'payment.failed':
        await handlePaymentFailure(event.payload.payment.entity)
        break
    }

    return new Response('Webhook processed', { status: 200 })
  } catch (error) {
    console.error('[Webhook] Razorpay error:', error)
    return new Response('Webhook processing failed', { status: 500 })
  }
}

async function handlePaymentSuccess(payment: any) {
  const { notes, id: paymentId } = payment
  const metadata: Prisma.JsonObject = {
    razorpayPaymentId: paymentId,
    paymentStatus: 'SUCCESS',
    updatedAt: new Date().toISOString()
  }

  await prisma.payslip.update({
    where: { id: notes.payslipId },
    data: {
      isPaid: true,
      paidAt: new Date(),
      metadata: metadata as Prisma.InputJsonValue
    }
  })
}

async function handlePaymentFailure(payment: any) {
  const { notes, id: paymentId, error_description } = payment
  const metadata: Prisma.JsonObject = {
    razorpayPaymentId: paymentId,
    paymentStatus: 'FAILED',
    failureReason: error_description,
    updatedAt: new Date().toISOString()
  }

  await prisma.payslip.update({
    where: { id: notes.payslipId },
    data: {
      metadata: metadata as Prisma.InputJsonValue
    }
  })
}
