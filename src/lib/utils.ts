import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format an invoice number as a professional zero-padded string (e.g. 1 -> "0001").
export function formatInvoiceNo(invoiceNo: number): string {
  return invoiceNo.toString().padStart(4, '0');
}
