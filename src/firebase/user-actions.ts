'use client';

import { getFirestore, doc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { setDocumentNonBlocking } from './non-blocking-updates';
import { initializeFirebase } from '.';

export function createUserDocument(user: User) {
  if (!user) return;

  const { firestore } = initializeFirebase();
  const userDocRef = doc(firestore, 'users', user.uid);

  const userData = {
    email: user.email,
    displayName: user.displayName,
    createdAt: new Date().toISOString(),
  };

  // Use non-blocking write
  setDocumentNonBlocking(userDocRef, userData, { merge: true });
}
