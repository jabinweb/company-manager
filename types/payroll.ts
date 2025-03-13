export type PaymentStatus = 'INITIATED' | 'SUCCESS' | 'FAILED'

export interface PayslipMetadata {
  razorpayOrderId?: string
  razorpayPaymentId?: string
  paymentStatus: PaymentStatus
  failureReason?: string
  [key: string]: any // Allow for additional metadata
}
