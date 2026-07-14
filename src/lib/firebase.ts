import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBse5vfsARbl8k6ub9Mir6qs-CsPdaNuGU',
  authDomain: 'starlinkjewels109.firebaseapp.com',
  projectId: 'starlinkjewels109',
  storageBucket: 'starlinkjewels109.firebasestorage.app',
  messagingSenderId: '192385163202',
  appId: '1:192385163202:web:6499e21aa7c34cd9e7c05b',
  measurementId: 'G-FFTQZDHDDM',
};

// Initialize Firebase app
export const app = initializeApp(firebaseConfig);

// Firestore instance bound to the named database "billing"
export const db = getFirestore(app, 'billing');
