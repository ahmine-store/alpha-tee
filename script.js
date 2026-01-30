// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
  appId: "1:455463891032:web:f1c585d34e81c026a99a2d",
  measurementId: "G-Z9Z710XZEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);