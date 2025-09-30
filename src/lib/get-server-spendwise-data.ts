import 'server-only';

import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import type { Expense, Budget, FuturePlan } from '@/lib/types';
import type { WithId } from '@/firebase/firestore/use-collection';

if (getApps().length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // For local development, this will fall back to GOOGLE_APPLICATION_CREDENTIALS
    // or the gcloud user.
    initializeApp();
  }
}

const db = getFirestore();
const auth = getAuth();

export type InitialData = {
  expenses: WithId<Expense>[];
  budgets: WithId<Budget>[];
  futurePlans: WithId<FuturePlan>[];
};

async function getUid() {
  try {
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) return null;
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    return decodedToken.uid;
  } catch (error) {
    // Session cookie is invalid or expired.
    return null;
  }
}

async function getCollectionData<T>(uid: string, collectionName: string): Promise<WithId<T>[]> {
  const snapshot = await db.collection('users').doc(uid).collection(collectionName).get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithId<T>));
}

export async function getServerSpendWiseData(): Promise<InitialData> {
  const uid = await getUid();

  if (!uid) {
    return { expenses: [], budgets: [], futurePlans: [] };
  }

  try {
    const [expenses, budgets, futurePlans] = await Promise.all([
      getCollectionData<Expense>(uid, 'expenses'),
      getCollectionData<Budget>(uid, 'budgets'),
      getCollectionData<FuturePlan>(uid, 'futurePlans'),
    ]);
    
    return { expenses, budgets, futurePlans };
  } catch (error) {
    console.error("Error fetching data for user", uid, error);
    // In case of error, return empty arrays to avoid breaking the client.
    return { expenses: [], budgets: [], futurePlans: [] };
  }
}
