/**
 * Firebase Admin SDK Configuration
 * Used for server-side Firebase operations (Storage, etc.)
 */

import {
  initializeApp,
  getApps,
  cert,
  type ServiceAccount,
} from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin only once
if (!getApps().length) {
  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")!,
  };

  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
  });
}

export const storage = getStorage();
export const bucket = storage.bucket();
