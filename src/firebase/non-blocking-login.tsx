'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  FirebaseError,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, onError: (error: FirebaseError) => void): void {
  signInAnonymously(authInstance)
    .catch((error: FirebaseError) => {
      onError(error);
    });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, displayName: string | undefined, onError: (error: FirebaseError) => void): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
        if (displayName && userCredential.user) {
            updateProfile(userCredential.user, { displayName });
        }
    })
    .catch((error: FirebaseError) => {
      onError(error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, onError: (error: FirebaseError) => void): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch((error: FirebaseError) => {
        onError(error);
    });
}
