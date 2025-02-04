import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBti2VSjp9Kwl8x4qGRYe902KfNeAIlGV4",
  authDomain: "finalproject-21bf1.firebaseapp.com",
  projectId: "finalproject-21bf1",
  storageBucket: "finalproject-21bf1.firebasestorage.app",
  messagingSenderId: "959615515746",
  appId: "1:959615515746:web:075d0f157478dbcbe1253b",
  measurementId: "G-LHC53TNB00",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  storage,
};
