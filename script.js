// =====================================================
// script.js
// Handles all order submissions, Firebase & WhatsApp
// =====================================================

// 🔹 Import Firestore database instance
import { db } from "./firebase.js";

// 🔹 Firestore helpers
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =====================================================
// SELECT ALL ORDER FORMS
// (Single product, Bulk, Custom – all use .orderForm)
// =====================================================
const orderForms = document.querySelectorAll(".orderForm");

// =====================================================
// LOOP THROUGH EACH FORM
// =====================================================
orderForms.forEach((form) => {

  // Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Stop page reload

    // -------------------------------------------------
    // READ PRODUCT / FORM META DATA
    // -------------------------------------------------
    const product = form.dataset.product || "N/A";
    const price = Number(form.dataset.price) || 0;   // unit price
    const advance = Number(form.dataset.advance) || 0;
    const orderType = form.dataset.type || "single"; 
    // single | bulk | custom

    // -------------------------------------------------
    // READ USER INPUTS
    // -------------------------------------------------
    const name = form.querySelector(".name")?.value.trim();
    const phone = form.querySelector(".phone")?.value.trim();
    const email = form.querySelector(".email")?.value.trim();
    const size = form.querySelector(".size")?.value || "N/A";
    const address = form.querySelector(".address")?.value.trim();

    // Quantity (default = 1)
    const qtyInput = form.querySelector(".quantity");
    const quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

    // Total price calculation
    const totalPrice = price * quantity;

    // Message element for user feedback
    const msgEl = form.querySelector(".msg");

    // -------------------------------------------------
    // BASIC VALIDATION
    // -------------------------------------------------
    if (!name || !phone || !email || !address) {
      if (msgEl) {
        msgEl.style.color = "red";
        msgEl.textContent = "❌ Please fill all required fields.";
      }
      return;
    }

    // -------------------------------------------------
    // PREPARE ORDER DATA FOR FIREBASE
    // -------------------------------------------------
    const orderData = {
      product,
      price,         // unit price
      totalPrice,    // price × quantity
      advance,
      quantity,
      name,
      phone,
      email,
      size,
      address,
      orderType,
      createdAt: serverTimestamp()
    };

    try {
      // -------------------------------------------------
      // SAVE TO FIRESTORE
      // -------------------------------------------------
      await addDoc(collection(db, "orders"), orderData);

      // -------------------------------------------------
      // SUCCESS MESSAGE ON WEBSITE
      // -------------------------------------------------
      if (msgEl) {
        msgEl.style.color = "limegreen";
        msgEl.textContent =
          "✅ Your order has been placed successfully! We’ll contact you shortly on WhatsApp.";
      }

      // -------------------------------------------------
      // 📱 WHATSAPP AUTO MESSAGE
      // -------------------------------------------------
      const whatsappNumber = "923302540909"; // AHMINE STORE

      const whatsappMessage = `
*Order – AHMINE STORE*

Name: ${name}
Phone: ${phone}
Email: ${email}

Product: ${product}
Size: ${size}
📦 Quantity: ${quantity}
Unit Price: Rs. ${price}
💰 Total Price: Rs. ${totalPrice}
Advance: Rs. ${advance}

📍 Address:
${address}

Order Type: ${orderType.toUpperCase()}

At SADAPAY account: 03302540909 (Muhammad Ahmed) Send Advance RS.500 to confirm your order, ensuring it is reserved. AHMINE INDUSTRY (Registered & Verified by FBR and SCCI), exporting since 2019. Check out our craftsmanship on IG: @ahmine_manufacturer.
`;

      const whatsappURL =
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      // Open WhatsApp after 1.5s so user sees success message
      setTimeout(() => {
        window.open(whatsappURL, "_blank");
      }, 1500);

      // Reset form to default values
      form.reset();
      if (qtyInput) qtyInput.value = 1; // reset quantity to default 1

    } catch (error) {
      // -------------------------------------------------
      // ERROR MESSAGE
      // -------------------------------------------------
      if (msgEl) {
        msgEl.style.color = "red";
        msgEl.textContent =
          "❌ Error placing order. Please try again.";
      }

      console.error("Firestore Error:", error);
    }
  });

});
