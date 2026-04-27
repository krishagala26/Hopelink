// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCm9loFcn_nAtp6u4jtjYbm8xIuR_IYbos",
  authDomain: "hopelink-9b45a.firebaseapp.com",
  projectId: "hopelink-9b45a",
  storageBucket: "hopelink-9b45a.firebasestorage.app",
  messagingSenderId: "348407876289",
  appId: "1:348407876289:web:aeda6f10423ae260e92240",
  measurementId: "G-NTZEVH2KD6"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);