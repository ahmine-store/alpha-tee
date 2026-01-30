// =====================================================
// script.js
// Handles all order submissions & Firebase interaction
// =====================================================

// Import Firestore database instance
import { db } from './firebase.js';

// Firestore helpers
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =====================================================
// SELECT ALL PRODUCT ORDER FORMS
// NOTE: Class name .orderForm MUST match index.html
// =====================================================
const orderForms = document.querySelectorAll(".orderForm");

// Loop through every product order form
orderForms.forEach(form => {

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop page reload

    // -------------------------------------------------
    // READ STATIC PRODUCT DATA (from HTML attributes)
    // -------------------------------------------------
    const product = form.dataset.product;
    const price = form.dataset.price;
    const advance = form.dataset.advance || 0;

    // -------------------------------------------------
    // READ USER INPUT VALUES
    // -------------------------------------------------
    const name = form.querySelector(".name").value.trim();
    const phone = form.querySelector(".phone").value.trim();
    const email = form.querySelector(".email").value.trim();
    const size = form.querySelector(".size").value;
    const address = form.querySelector(".address").value.trim();

    // Quantity field is optional in HTML
    const qtyInput = form.querySelector('input[type="number"]');
    const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

    // Message display element
    const msgEl = form.querySelector(".msg");

    // -------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------
    if (!name || !phone || !email || !size || !address) {
      msgEl.style.color = "red";
      msgEl.textContent = "❌ Please fill all required fields.";
      return;
    }

    // -------------------------------------------------
    // PREPARE ORDER DATA OBJECT
    // (Easy to extend later)
    // -------------------------------------------------
    const orderData = {
      product,
      price: Number(price),
      advance: Number(advance),
      quantity,
      name,
      phone,
      email,
      size,
      address,
      orderType: "single", // future use: bulk / custom
      timestamp: serverTimestamp()
    };

    try {
      // -------------------------------------------------
      // SAVE ORDER TO FIRESTORE
      // Collection name: "orders"
      // -------------------------------------------------
      await addDoc(collection(db, "orders"), orderData);

      // -------------------------------------------------
      // SUCCESS UI FEEDBACK
      // -------------------------------------------------
      msgEl.style.color = "green";
      msgEl.textContent = "✅ Order placed successfully! Our team will contact you shortly.";

      // Reset form after success
      form.reset();

    } catch (error) {
      // -------------------------------------------------
      // ERROR HANDLING
      // -------------------------------------------------
      msgEl.style.color = "red";
      msgEl.textContent = "❌ Order failed. Please try again.";

      console.error("Firestore Error:", error);
    }
  });

});

/* =====================================================
   FUTURE EXTENSIONS (READY STRUCTURE)
   -----------------------------------------------------
   You can safely add:

   1️⃣ Bulk Orders
      - Create form with class .bulkForm
      - Save to collection: "bulk_orders"

   2️⃣ Custom Made Orders
      - Create form with class .customForm
      - Save to collection: "custom_orders"

   3️⃣ WhatsApp Redirect
      - After addDoc(), redirect user to WhatsApp
        with pre-filled order message

   4️⃣ Admin Panel
      - Read data from Firestore
      - Manage orders, status, delivery

   This structure is intentionally clean & scalable.
===================================================== */
