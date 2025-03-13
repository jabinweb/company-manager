export interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  inventoryAlerts: boolean
  lowStockAlerts: boolean
  orderUpdates: boolean
  securityAlerts: boolean
}

export interface UserSettings {
  notifications: NotificationSettings
  theme: 'light' | 'dark' | 'system'
  language: string
}

export interface CompanyData {
  id?: number;
  name: string;
  logo?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
}

export interface CompanySettings {
  customization: {
    theme: {
      primaryColor: string;
      mode: 'light' | 'dark' | 'system';
    };
    dateFormat: string;
    timezone: string;
    language: string;
  };
  notifications: {
    email: {
      enabled: boolean;
      templates: Record<string, boolean>;
    };
    sms: {
      enabled: boolean;
      templates: Record<string, boolean>;
    };
    inApp: {
      enabled: boolean;
      categories: Record<string, boolean>;
    };
  };
  integrations: {
    razorpay: {
      enabled: boolean;
      mode: 'test' | 'live';
      credentials: {
        test: {
          keyId: string;
          keySecret: string;
          webhookSecret: string;
        };
        live: {
          keyId: string;
          keySecret: string;
          webhookSecret: string;
        };
      };
    };
  };
  security: {
    twoFactorAuth: boolean;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      expiryDays: number;
    };
    sessionTimeout: number;
  };
}

export interface SettingsUpdatePayload {
  company?: DeepPartial<CompanyData>;
  settings?: DeepPartial<CompanySettings>;
}

export type SettingsUpdateAction = DeepPartial<CompanySettings>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
