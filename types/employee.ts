import { EmployeeRole, EmployeeStatus, EmploymentType } from './enums'
import type { SalaryStructure } from './salary'

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface EmployeeData {
  id: string;  // Changed from number to string to match Prisma's ID type
  name: string;
  email: string;
  phone: string;
  address: Address;
  jobTitle: string;
  department: string;
  dateJoined: Date;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  salary?: SalaryStructure;
  avatar?: string | null;
  managerId?: string;  // Changed from number to string
}

export interface EmployeeRegistrationData {
  name: string;
  email: string;
  password: string;
  company: string;
}

export interface EmployeeProfile extends Omit<EmployeeData, 'address' | 'userId' | 'managerId' | 'userManagerId'> {
  company: string;
}

// Re-export enums
export { EmployeeRole, EmployeeStatus, EmploymentType }
