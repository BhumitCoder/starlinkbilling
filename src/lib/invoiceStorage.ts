import { Invoice, InvoiceFormData, InvoiceItem } from '@/types/invoice';
import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

const COLLECTION = 'invoices';
const invoicesRef = collection(db, COLLECTION);

// Generate a stable id for an invoice line item
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

// Convert a Firestore timestamp/value into an ISO string
const toIso = (value: unknown): string => {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value && typeof (value as { toDate?: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  return new Date().toISOString();
};

// Build the persisted invoice payload (with computed totals) from form data
const buildInvoiceData = (formData: InvoiceFormData, invoiceNo: number) => {
  const items: InvoiceItem[] = formData.items.map((item) => ({
    id: generateId(),
    stockId: item.stockId,
    description: item.description,
    pieces: item.pieces,
    weight: item.weight,
    pricePerUnit: item.pricePerUnit,
    total: item.pieces * item.pricePerUnit,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalAmount = subtotal + formData.shippingCharges + formData.otherCharges;
  const advancePayment = formData.advancePayment || 0;
  const balanceDue = totalAmount - advancePayment;

  return {
    invoiceNo,
    date: formData.date,
    terms: formData.terms,
    customerName: formData.customerName,
    customerAddress: formData.customerAddress,
    customerCity: formData.customerCity,
    customerPhone: formData.customerPhone,
    items,
    subtotal,
    shippingCharges: formData.shippingCharges,
    otherCharges: formData.otherCharges,
    totalAmount,
    advancePayment,
    balanceDue,
  };
};

// Map a Firestore document into the frontend Invoice shape
const mapDoc = (snapshot: QueryDocumentSnapshot<DocumentData> | DocumentData, id?: string): Invoice => {
  const data = 'data' in snapshot && typeof snapshot.data === 'function' ? snapshot.data() : snapshot;
  const docId = id ?? ('id' in snapshot ? (snapshot as QueryDocumentSnapshot).id : '');

  return {
    id: docId,
    invoiceNo: data.invoiceNo,
    date: data.date,
    terms: data.terms,
    customerName: data.customerName,
    customerAddress: data.customerAddress,
    customerCity: data.customerCity,
    customerPhone: data.customerPhone,
    items: (data.items ?? []) as InvoiceItem[],
    subtotal: data.subtotal,
    shippingCharges: data.shippingCharges,
    otherCharges: data.otherCharges,
    totalAmount: data.totalAmount,
    advancePayment: data.advancePayment ?? 0,
    balanceDue: data.balanceDue ?? data.totalAmount,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
};

export class InvoiceStorage {
  static async getAll(): Promise<Invoice[]> {
    const snapshot = await getDocs(invoicesRef);
    const invoices = snapshot.docs.map((d) => mapDoc(d));
    return invoices.sort((a, b) => b.invoiceNo - a.invoiceNo);
  }

  static async getById(id: string): Promise<Invoice | null> {
    const snapshot = await getDoc(doc(db, COLLECTION, id));
    if (!snapshot.exists()) return null;
    return mapDoc(snapshot.data(), snapshot.id);
  }

  static async getNextInvoiceNumber(): Promise<number> {
    const invoices = await this.getAll();
    if (invoices.length === 0) return 2636;
    const maxInvoiceNo = Math.max(...invoices.map((inv) => inv.invoiceNo));
    return maxInvoiceNo + 1;
  }

  static async create(formData: InvoiceFormData): Promise<Invoice> {
    const invoiceNo = await this.getNextInvoiceNumber();
    const data = buildInvoiceData(formData, invoiceNo);

    const ref = await addDoc(invoicesRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const now = new Date().toISOString();
    return {
      id: ref.id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
  }

  static async update(id: string, formData: InvoiceFormData): Promise<Invoice | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    // Preserve the original invoice number on update
    const data = buildInvoiceData(formData, existing.invoiceNo);

    await updateDoc(doc(db, COLLECTION, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return {
      id,
      ...data,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
  }

  static async delete(id: string): Promise<boolean> {
    const existing = await getDoc(doc(db, COLLECTION, id));
    if (!existing.exists()) return false;
    await deleteDoc(doc(db, COLLECTION, id));
    return true;
  }

  static async search(query: string): Promise<Invoice[]> {
    const invoices = await this.getAll();
    const lowerQuery = query.toLowerCase();

    return invoices.filter(
      (invoice) =>
        invoice.customerName.toLowerCase().includes(lowerQuery) ||
        invoice.invoiceNo.toString().includes(query) ||
        invoice.customerCity.toLowerCase().includes(lowerQuery),
    );
  }
}
