export interface SalaryStructure {
  basicSalary: number;
  houseRent: number;
  transport: number;
  medicalAllowance: number;
  taxDeduction: number;
  otherDeductions: number;
}

export interface EmployeeSalaryHistory {
  id: string;
  employeeId: string;
  basicSalary: number;
  houseRent: number;
  transport: number;
  medicalAllowance: number;
  taxDeduction: number;
  otherDeductions: number;
  effectiveFrom: Date;
  createdAt: Date;
  updatedAt: Date;
}
