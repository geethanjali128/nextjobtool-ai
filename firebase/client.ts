// Import the functions you need from the SDKs you need

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBg9kXP78qg8Q0UJN3wU0xshWcfNyBeQAU",
  authDomain: "nextjobtool-ai.firebaseapp.com",
  projectId: "nextjobtool-ai",
  storageBucket: "nextjobtool-ai.firebasestorage.app",
  messagingSenderId: "489068884437",
  appId: "1:489068884437:web:1826c6de5d2bb2cb6ccd5c",
  measurementId: "G-MFHCSYF92Z",
};

// Initialize Firebase

const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

export const db = getFirestore(app);
