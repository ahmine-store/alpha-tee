// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAGbe2-9rgN9vQ_OFW_vo7mtj0gh7TZRds",
  authDomain: "ahmine-store.firebaseapp.com",
  projectId: "ahmine-store",
  storageBucket: "ahmine-store.firebasestorage.app",
  messagingSenderId: "455463891032",
  appId: "1:455463891032:web:228fbc595a5e2e5ca99a2d",
  //measurementId: "G-JQHN1D5H3M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);