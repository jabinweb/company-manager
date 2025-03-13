import { Prisma } from '@prisma/client'

// Define base JSON types that match Prisma's expectations
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

// Modify EncryptedData to be JSON compatible
export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
  [key: string]: JsonValue; // Make it compatible with JSON index signature
}

export interface CompanySettings {
  general: {
    companyName?: string
    timezone: string
    dateFormat: string
    currency: string
    language: string
    businessHours: {
      start: string
      end: string
      workingDays: number[]
    }
    logo?: string
    theme: {
      primaryColor: string
      mode: 'light' | 'dark' | 'system'
    }
  }
  payroll: {
    razorpay: {
      enabled: boolean
      keyId?: string
      webhookSecret?: string
      _keyId?: EncryptedData
      _webhookSecret?: EncryptedData
    }
    paymentDay: number
    salaryComponents: {
      basicSalary: boolean
      houseRent: boolean
      transport: boolean
      medical: boolean
      performance: boolean
    }
    taxSettings: {
      enabled: boolean
      rate: number
    }
  }
  notifications: {
    email: {
      enabled: boolean
      templates: Record<string, boolean>
    }
    sms: {
      enabled: boolean
      provider?: string
      templates: Record<string, boolean>
    }
    inApp: {
      enabled: boolean
      categories: Record<string, boolean>
    }
  }
  leads: {
    autoAssignment: boolean
    followUpReminders: boolean
    statusFlow: string[]
    customFields: Array<{
      name: string
      type: string
      required: boolean
    }>
  }
  security: {
    twoFactorAuth: boolean
    passwordPolicy: {
      minLength: number
      requireSpecialChars: boolean
      requireNumbers: boolean
      expiryDays: number
    }
    ipRestrictions: string[]
  }
}

// Make sure StoredRazorpaySettings is JSON compatible
export interface StoredRazorpaySettings {
  enabled: boolean;
  _keyId?: EncryptedData;
  _webhookSecret?: EncryptedData;
  [key: string]: JsonValue | undefined; // Make it compatible with JSON index signature
}

// Update the type to ensure JSON compatibility
export type StoredCompanySettings = {
  [K in keyof CompanySettings]: K extends 'payroll' 
    ? Omit<CompanySettings[K], 'razorpay'> & {
        razorpay: StoredRazorpaySettings;
        [key: string]: JsonValue | StoredRazorpaySettings;
      }
    : CompanySettings[K] & { [key: string]: JsonValue };
} & { [key: string]: JsonValue | Record<string, JsonValue> };

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  general: {
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    language: 'en',
    businessHours: {
      start: '09:00',
      end: '17:00',
      workingDays: [1, 2, 3, 4, 5]
    },
    theme: {
      primaryColor: '#0ea5e9',
      mode: 'system'
    }
  },
  payroll: {
    razorpay: {
      enabled: false
    },
    paymentDay: 1,
    salaryComponents: {
      basicSalary: true,
      houseRent: true,
      transport: true,
      medical: true,
      performance: false
    },
    taxSettings: {
      enabled: true,
      rate: 10
    }
  },
  notifications: {
    email: {
      enabled: true,
      templates: {
        payslip: true,
        taskAssignment: true,
        leaveRequest: true
      }
    },
    sms: {
      enabled: false,
      templates: {}
    },
    inApp: {
      enabled: true,
      categories: {
        tasks: true,
        leads: true,
        payroll: true
      }
    }
  },
  leads: {
    autoAssignment: false,
    followUpReminders: true,
    statusFlow: ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON'],
    customFields: []
  },
  security: {
    twoFactorAuth: false,
    passwordPolicy: {
      minLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      expiryDays: 90
    },
    ipRestrictions: []
  }
}

// Add a type guard
export function isStoredCompanySettings(value: unknown): value is StoredCompanySettings {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Partial<StoredCompanySettings>;
  return (
    obj.general !== undefined &&
    obj.payroll !== undefined &&
    obj.notifications !== undefined &&
    obj.leads !== undefined &&
    obj.security !== undefined
  );
}

// Modify the conversion helpers
export function toStoredSettings(json: Prisma.JsonValue | null): StoredCompanySettings {
  if (!json || typeof json !== 'object' || Array.isArray(json)) {
    return structuredClone(DEFAULT_COMPANY_SETTINGS) as StoredCompanySettings;
  }
  
  // Ensure the object matches our expected structure
  const validated = validateStoredSettings(json as Record<string, unknown>);
  if (!validated) {
    return structuredClone(DEFAULT_COMPANY_SETTINGS) as StoredCompanySettings;
  }
  
  return validated;
}

export function fromStoredSettings(settings: StoredCompanySettings): Prisma.JsonValue {
  // Convert to a plain object that matches Prisma's JSON structure
  return JSON.parse(JSON.stringify(settings)) as Prisma.JsonValue;
}

// Add a proper type validation helper
function validateStoredSettings(obj: Record<string, unknown>): StoredCompanySettings | null {
  try {
    if (
      !obj.general ||
      !obj.payroll ||
      !obj.notifications ||
      !obj.leads ||
      !obj.security
    ) {
      return null;
    }

    // Deep clone and type cast
    const settings = structuredClone(obj) as StoredCompanySettings;

    // Ensure razorpay settings are properly structured
    if (settings.payroll.razorpay) {
      const razorpay = settings.payroll.razorpay as StoredRazorpaySettings;
      if (typeof razorpay.enabled !== 'boolean') {
        razorpay.enabled = false;
      }
    }

    return settings;
  } catch {
    return null;
  }
}
