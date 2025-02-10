// next-auth.d.ts
import { User as NextAuthUser } from "next-auth";
import { Prisma } from "@prisma/client";  

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: string;
      status: string;
      employeeId?: string | null;
      primaryCompanyId?: number;
      primaryCompanyName?: string;
      managedCompanyId?: number | null;
      managedCompanyName?: string | null;
      currentCompanyId?: number;
      currentCompanyName?: string;
      employeeCompanyId?: number;
      employeeCompanyName?: string;
      avatar?: string;
      companyId?: string | null;  
      companyName?: string | null; 
      email: string;
      name: string;
      isValid: boolean;
      userCompanies?: {
        id: number;
        name: string;
        status: string;
      }[];
      userCompanyRoles?: any[]; // Adjust the type as per your schema
    };
  }

  interface User {
    id: number;
    email: string;
    name: string;
    role: string;
    status: string;
    employeeId?: string | null;
    primaryCompanyId?: number;
    primaryCompanyName?: string;
    managedCompanyId?: number | null;
    managedCompanyName?: string | null;
    currentCompanyId?: number;
    currentCompanyName?: string;
    employeeCompanyId?: number;
    employeeCompanyName?: string;
    avatar?: string | null;
    companyId?: string | null; 
    companyName?: string | null; 
    userCompanies?: {
      id: number;
      name: string;
      status: "APPROVED" | "PENDING" | "REJECTED";
    }[];
    userCompanyRoles?: any[]; // Adjust the type as per your schema
  }
}
