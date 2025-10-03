'use client';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from 'firebase/auth';


/** Initiate email/password sign-up (blocking). */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  try {
    const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
    return userCredential;
  } catch (error) {
    throw error;
  }
}

/** Initiate email/password sign-in (blocking). */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<UserCredential> {
  try {
    const userCredential = await signInWithEmailAndPassword(authInstance, email, password);
    return userCredential;
  } catch (error) {
    throw error;
  }
}

/** Initiate Google sign-in (blocking). */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<UserCredential> {
  const provider = new GoogleAuthProvider();
  try {
    const userCredential = await signInWithPopup(authInstance, provider);
    return userCredential;
  } catch (error) {
    // The promise is rejected with a Firebase error.
    // The calling function should handle this.
    throw error;
  }
}
