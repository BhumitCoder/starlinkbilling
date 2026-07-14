import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SETTINGS_COLLECTION = 'settings';
const PAYMENT_DOC = 'payment';

export interface PaymentSettings {
  // Payment QR stored as a base64 data URL so it embeds cleanly in the
  // printed invoice / PDF without any external hosting or CORS issues.
  qrImage: string;
  // Optional caption shown under the QR (e.g. UPI id, bank note).
  note: string;
}

const EMPTY_SETTINGS: PaymentSettings = { qrImage: '', note: '' };

export const getPaymentSettings = async (): Promise<PaymentSettings> => {
  const snap = await getDoc(doc(db, SETTINGS_COLLECTION, PAYMENT_DOC));
  if (!snap.exists()) return { ...EMPTY_SETTINGS };
  const data = snap.data();
  return {
    qrImage: data.qrImage ?? '',
    note: data.note ?? '',
  };
};

export const savePaymentSettings = async (settings: PaymentSettings): Promise<void> => {
  await setDoc(doc(db, SETTINGS_COLLECTION, PAYMENT_DOC), settings, { merge: true });
};
