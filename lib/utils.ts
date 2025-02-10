import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from "crypto";

// Generate a shorter, readable identifier from the companyId
export function generateShortId(companyId: string): string {
  return crypto.createHash('md5').update(companyId).digest('hex').slice(0, 8);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
