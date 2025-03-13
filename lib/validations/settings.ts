import * as z from "zod"

export const passwordPolicySchema = z.object({
  minLength: z.number().min(8),
  requireSpecialChars: z.boolean(),
  requireNumbers: z.boolean(),
  expiryDays: z.number().min(0)
})

export const securitySettingsSchema = z.object({
  twoFactorAuth: z.boolean(),
  passwordPolicy: passwordPolicySchema,
  sessionTimeout: z.number().min(5)
})

export const razorpayCredentialsSchema = z.object({
  keyId: z.string().min(1, "Key ID is required"),
  keySecret: z.string().min(1, "Key Secret is required"),
  webhookSecret: z.string().min(1, "Webhook Secret is required")
})

export const razorpaySettingsSchema = z.object({
  enabled: z.boolean(),
  mode: z.enum(['test', 'live']),
  credentials: z.object({
    test: razorpayCredentialsSchema.optional(),
    live: razorpayCredentialsSchema.optional()
  })
})

export const paymentSettingsSchema = z.object({
  razorpay: razorpaySettingsSchema,
})

export async function validateSettings(settings: any) {
  if (settings.security) {
    await securitySettingsSchema.parseAsync(settings.security)
  }
  if (settings.payments) {
    await paymentSettingsSchema.parseAsync(settings.payments)
  }
  return true
}
