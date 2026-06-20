// ============================================
// SplitMate — Firebase Configuration
// ============================================
// INSTRUCTIONS: Replace the placeholder values below with your
// Firebase project config from:
// Firebase Console → Project Settings → General → Your apps → Config
// ============================================

const firebaseConfig = {
  apiKey: "AIzaSyD9_gVPWDRMwzIpRUfKbjGeGDp90JlTAa8",
  authDomain: "splitmate-7d5e4.firebaseapp.com",
  projectId: "splitmate-7d5e4",
  storageBucket: "splitmate-7d5e4.firebasestorage.app",
  messagingSenderId: "90616396559",
  appId: "1:90616396559:web:26dadad55f4f3dde931c7a",
  measurementId: "G-JKFC9GR8BT"
};

// --- Firebase SDK Imports & Init ---
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,
         createUserWithEmailAndPassword, updateProfile, signOut, onAuthStateChanged,
         sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp,
         collection, query, where, getDocs, orderBy, limit,
         updateDoc, deleteDoc, arrayUnion, arrayRemove, increment,
         writeBatch, Timestamp, onSnapshot, addDoc } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export {
  app, auth, db, googleProvider,
  // Auth
  signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  updateProfile, signOut, onAuthStateChanged, sendPasswordResetEmail,
  GoogleAuthProvider,
  // Firestore
  doc, setDoc, getDoc, serverTimestamp, collection, query, where,
  getDocs, orderBy, limit, updateDoc, deleteDoc,
  arrayUnion, arrayRemove, increment, writeBatch, Timestamp,
  onSnapshot, addDoc
};
