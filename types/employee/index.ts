import { EmployeeRole, EmployeeStatus, EmploymentType } from '../enums';

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface EmployeeData {
  id: string;
  userId: number | null;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  address: Address;
  jobTitle: string;
  department: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  companyId: number;
  managerId?: string;
  userManagerId?: number;
  isApproved: boolean;
  avatar?: string;
  dateJoined: Date;
  createdAt: Date;
  updatedAt: Date;
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
