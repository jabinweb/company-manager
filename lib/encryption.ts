import crypto from 'crypto'

const DEFAULT_KEY = '0'.repeat(64) // Fallback for development
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || DEFAULT_KEY

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  console.warn('Warning: ENCRYPTION_KEY should be a 64-character hex string')
}

const ALGORITHM = 'aes-256-gcm'

export function encrypt(text: string): { encrypted: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: cipher.getAuthTag().toString('hex')
  }
}

export function decrypt(encrypted: string, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  )
  decipher.setAuthTag(Buffer.from(tag, 'hex'))
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export function encryptSensitiveData(data: any): any {
  if (!data) return data

  const encryptField = (text: string) => {
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: cipher.getAuthTag().toString('hex')
    }
  }

  // Handle sensitive fields in payment settings
  if (data.payments?.razorpay?.keyId) {
    data.payments.razorpay._keyId = encryptField(data.payments.razorpay.keyId)
    delete data.payments.razorpay.keyId
  }
  if (data.payments?.razorpay?.webhookSecret) {
    data.payments.razorpay._webhookSecret = encryptField(data.payments.razorpay.webhookSecret)
    delete data.payments.razorpay.webhookSecret
  }
  if (data.payments?.stripe?.secretKey) {
    data.payments.stripe._secretKey = encryptField(data.payments.stripe.secretKey)
    delete data.payments.stripe.secretKey
  }
  if (data.payments?.stripe?.webhookSecret) {
    data.payments.stripe._webhookSecret = encryptField(data.payments.stripe.webhookSecret)
    delete data.payments.stripe.webhookSecret
  }

  return data
}
