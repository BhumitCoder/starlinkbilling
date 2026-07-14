import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const PAYMENT_DOC = 'payment';

export interface PaymentSettings {
  // Payment QR 1 stored as a base64 data URL so it embeds cleanly in the
  // printed invoice / PDF without any external hosting or CORS issues.
  qrImage: string;
  // Optional caption shown under QR 1 (e.g. UPI id, bank note).
  note: string;
  // Second payment QR (e.g. a different bank / wallet).
  qrImage2: string;
  // Optional caption shown under QR 2.
  note2: string;
}

const EMPTY_SETTINGS: PaymentSettings = { qrImage: '', note: '', qrImage2: '', note2: '' };

export const getPaymentSettings = async (): Promise<PaymentSettings> => {
  const snap = await getDoc(doc(db, SETTINGS_COLLECTION, PAYMENT_DOC));
  if (!snap.exists()) return { ...EMPTY_SETTINGS };
  const data = snap.data();
  return {
    qrImage: data.qrImage ?? '',
    note: data.note ?? '',
    qrImage2: data.qrImage2 ?? '',
    note2: data.note2 ?? '',
  };
};

export const savePaymentSettings = async (settings: PaymentSettings): Promise<void> => {
  await setDoc(doc(db, SETTINGS_COLLECTION, PAYMENT_DOC), settings, { merge: true });
};
