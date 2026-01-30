// =====================================================
// firebase.js
// Central Firebase configuration & database exports
// =====================================================

// Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Firestore database
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =====================================================
// FIREBASE CONFIGURATION
// (Do NOT share publicly in production apps)
// =====================================================
const firebaseConfig = {
  apiKey: "AIzaSyCZX2N-hoZNL8V-xnzBuSOBmqYKITGwmhg",
  authDomain: "slim-alpha-tee.firebaseapp.com",
  projectId: "slim-alpha-tee",
  storageBucket: "slim-alpha-tee.firebasestorage.app",
  messagingSenderId: "368415138960",
  appId: "1:368415138960:web:70490781c2f3e9fd556415"
};

// =====================================================
// INITIALIZE FIREBASE APP
// =====================================================
const app = initializeApp(firebaseConfig);

// =====================================================
// INITIALIZE FIRESTORE DATABASE
// =====================================================
export const db = getFirestore(app);

/*
=====================================================
FIRESTORE COLLECTION DESIGN (IMPORTANT)
-----------------------------------------------------

Your Firestore will now logically look like this:

📂 orders
   └── Single product orders (Alpha-Black-Tee, etc)

📂 bulk_orders
   └── Bulk inquiries (minimum 40 pcs)

📂 custom_orders
   └── Made-on-demand / customization requests

📂 products (optional future use)
   └── Product definitions, prices, stock

Each document stores:
- orderType (single / bulk / custom)
- productName
- color (if applicable)
- quantity
- customer details
- timestamp

firebase.js ONLY provides db access.
Actual data routing happens in script.js.
=====================================================
*/
