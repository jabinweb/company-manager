import { Role, UserStatus, CompanyStatus } from '@prisma/client'
import type { JWTPayload as JoseJWTPayload } from 'jose'

// Re-export Prisma enums
export { Role, UserStatus, CompanyStatus }

export type UserRole = Role // Map UserRole to Prisma Role enum

// Shared interfaces
export interface CompanyRelation {
  id: number;
  name: string;
  status: CompanyStatus;  // Ensure this is using Prisma's CompanyStatus enum
}

export interface CompanyRole {
  role: Role;
  companyId: number;
  companyName: string;
}

// Add these new types
export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export interface ValidationIssue {
  path: (string | number)[]; 
  message: string;
}

export interface LoginResponse {
  success: boolean;
  error?: string;
  token?: string;
  user?: User;
  redirectTo?: string;
  issues?: ValidationIssue[];  // Add this for validation errors
}

// Base payload interface extending Jose's JWT payload
export interface BasePayload extends JoseJWTPayload {
  [key: string]: unknown;
  id: number;
  userId: number;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  sessionId: string;
  isValid: boolean;
  companyId: number;
  currentCompanyId?: number;
  currentCompanyName?: string;
  primaryCompanyId?: number;
  primaryCompanyName?: string;
  employeeId?: string;
  userCompanies: CompanyRelation[];
  userCompanyRoles: CompanyRole[];
}

// Main interfaces using the base payload
export type JWTPayload = BasePayload

// Rest of interfaces
export interface User {
  id: number;
  userId: number
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  isValid: boolean;
  companyId?: number;
  currentCompanyId?: number;
  currentCompanyName?: string;
  primaryCompanyId?: number;
  primaryCompanyName?: string;
  employeeId?: string;
  managedCompanyId?: number;
  managedCompanyName?: string;
  employeeCompanyId?: number;
  employeeCompanyName?: string;
  avatar?: string; // Make sure avatar exists in User interface
  expiresAt?: number; // Add this field
  userCompanies: CompanyRelation[];
  userCompanyRoles: CompanyRole[];
}

export interface Session {
  token: string;
  user: User;
  expires?: string;
  expiresAt?: number;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  companyName: string;
  website: string;
}

export type LoginFormData = {
  email: string
  password: string
  isEmployee?: boolean
}

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  companyId: number;
  currentCompanyId?: number;
  currentCompanyName?: string;
  primaryCompanyId?: number;
  primaryCompanyName?: string;
  employeeId?: string;
  userCompanies: Array<{
    id: number;
    name: string;
    status: CompanyStatus;
  }>;
  userCompanyRoles: Array<{
    role: string;
    companyId: number;
    companyName: string;
  }>;
}

// JWT Token payload including session info
export interface TokenPayload extends SessionUser {
  sessionId: string;
  isValid: boolean;
  exp?: number;
  iat?: number;
  [key: string]: unknown; // Allow additional JWT fields
}
