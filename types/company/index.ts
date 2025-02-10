import { CompanyStatus } from '../enums';

export interface Company {
  id: number;
  name: string;
  website: string;
  status: CompanyStatus;
  adminId?: string;
  logo?: string;
  createdAt: Date;
}

export interface CompanySearchResult {
  id: number;
  name: string;
}

export interface CompanyResponse {
  companies: CompanySearchResult[];
}
