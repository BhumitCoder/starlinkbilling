export interface InvoiceItem {
  id: string;
  stockId: string;
  description: string;
  pieces: number;
  weight: number;
  pricePerUnit: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNo: number;
  date: string;
  terms: string;
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  shippingCharges: number;
  otherCharges: number;
  totalAmount: number;
  advancePayment: number;
  balanceDue: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFormData {
  date: string;
  terms: string;
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerPhone: string;
  items: Omit<InvoiceItem, 'id' | 'total'>[];
  shippingCharges: number;
  otherCharges: number;
  advancePayment: number;
}