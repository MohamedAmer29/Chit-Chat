// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chit-chat-92272.firebaseapp.com",
  projectId: "chit-chat-92272",
  storageBucket: "chit-chat-92272.firebasestorage.app",
  messagingSenderId: "921305930763",
  appId: "1:921305930763:web:9a800b3c7b6345a12dbb0e",
};

// Initialize Firebase
// eslint-disable-next-line
initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
