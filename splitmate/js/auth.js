// ============================================
// SplitMate — Authentication Logic
// ============================================

import {
  auth, db, googleProvider,
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, signOut as firebaseSignOut, onAuthStateChanged,
  sendPasswordResetEmail, doc, setDoc, getDoc, serverTimestamp
} from './firebase-config.js';
import { showToast, setButtonLoading } from './utils.js';

// --- Create/Update User Document in Firestore ---
async function createUserDocument(user, extraData = {}) {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    await setDoc(userRef, {
      name: user.displayName || extraData.name || '',
      email: user.email,
      photoURL: user.photoURL || '',
      role: 'user',
      createdAt: serverTimestamp(),
      lastActive: serverTimestamp()
    });
  } else {
    await setDoc(userRef, { lastActive: serverTimestamp() }, { merge: true });
  }
}

// --- Google Sign In ---
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDocument(result.user);
    showToast('Welcome, ' + result.user.displayName + '!', 'success');
    window.location.href = 'groups.html';
  } catch (error) {
    console.error('Google sign-in error:', error);
    if (error.code === 'auth/popup-closed-by-user') return;
    showToast(getAuthErrorMessage(error.code), 'error');
  }
}

// --- Email Sign In ---
export async function loginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await createUserDocument(result.user);
    showToast('Welcome back!', 'success');
    window.location.href = 'groups.html';
  } catch (error) {
    console.error('Email sign-in error:', error);
    throw error;
  }
}

// --- Email Registration ---
export async function registerWithEmail(name, email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await createUserDocument(result.user, { name });
    showToast('Account created! Welcome, ' + name + '!', 'success');
    window.location.href = 'groups.html';
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// --- Sign Out ---
export async function logout() {
  try {
    await firebaseSignOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    showToast('Error signing out', 'error');
  }
}

// --- Password Reset ---
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    showToast('Password reset email sent!', 'success');
  } catch (error) {
    showToast(getAuthErrorMessage(error.code), 'error');
  }
}

// --- Friendly Error Messages ---
function getAuthErrorMessage(code) {
  const messages = {
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/email-already-in-use': 'Email is already registered',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/invalid-email': 'Invalid email address',
    'auth/too-many-requests': 'Too many attempts. Try again later',
    'auth/network-request-failed': 'Network error. Check your connection',
  };
  return messages[code] || 'Something went wrong. Please try again';
}

// Export for use on pages
export { onAuthStateChanged, auth, getAuthErrorMessage };
