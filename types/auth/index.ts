import { Role, UserStatus } from '../enums';

export interface AuthToken {
  id: number;
  employeeId?: string;
  email: string;
  role: Role;
  companyId: number;
  status: UserStatus;
  iat?: number;
  exp?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
  token?: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  employeeId?: string;
  companyId: number;
}
