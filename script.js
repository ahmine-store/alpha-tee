import { db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const orderForms = document.querySelectorAll(".orderForm");
const multiOrderForm = document.querySelector(".multiOrderForm");
const heroSlider = document.querySelector(".hero-slider");

const SHIPPING_PER_ORDER = 290;
const FREE_SHIPPING_THRESHOLD = 3;
const DEFAULT_ADVANCE = 500;
const WHATSAPP_NUMBER = "923302540909";

const PRICES = {
  "Poly Lycra": 2199,
  "Cotton Jersey": 1849
};

initHeroSlider(heroSlider);

orderForms.forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const product = form.dataset.product || "N/A";
    const price = Number(form.dataset.price) || 0;
    const advance = Number(form.dataset.advance) || DEFAULT_ADVANCE;
    const orderType = form.dataset.type || "single";
    const fabric = form.dataset.fabric || "Standard";

    const name = form.querySelector(".name")?.value.trim();
    const phone = form.querySelector(".phone")?.value.trim();
    const email = form.querySelector(".email")?.value.trim();
    const size = form.querySelector(".size")?.value || "N/A";
    const address = form.querySelector(".address")?.value.trim();

    const qtyInput = form.querySelector(".quantity");
    let quantity = qtyInput ? parseInt(qtyInput.value, 10) : 1;
    quantity = Number.isNaN(quantity) || quantity < 1 ? 1 : quantity;

    const msgEl = form.querySelector(".msg");

    if (!isCustomerInfoValid({ name, phone, email, address })) {
      showMessage(msgEl, "Please fill all required fields with valid data.", "error");
      return;
    }

    const shipping = quantity >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PER_ORDER;
    const subtotal = price * quantity;
    const totalPrice = subtotal + shipping;

    const orderData = {
      product,
      fabric,
      price,
      quantity,
      subtotal,
      shipping,
      totalPrice,
      advance,
      name,
      phone,
      email,
      size,
      address,
      orderType,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "orders"), orderData);

      showMessage(msgEl, "Order placed successfully. Redirecting to WhatsApp...", "success");

      const whatsappMessage =
`AHMINE STORE - NEW ORDER

Name: ${name}
Phone: ${phone}
Email: ${email}
Address: ${address}

Item: ${product}
Fabric: ${fabric}
Size: ${size}
Quantity: ${quantity}

Unit Price: Rs ${price}
Subtotal: Rs ${subtotal}
Shipping: Rs ${shipping}
Total Cost: Rs ${totalPrice}

Send 500 RS Advance at SADAPAY (0330-2540909)
And send screenshot of the payment here.`;

      openWhatsApp(whatsappMessage);

      form.reset();
      if (qtyInput) qtyInput.value = 1;
    } catch (error) {
      console.error("Firestore Error:", error);
      showMessage(msgEl, "Error placing order. Please try again.", "error");
    }
  });
});

if (multiOrderForm) {
  const itemsWrap = multiOrderForm.querySelector(".multi-items");
  const addItemBtn = multiOrderForm.querySelector(".add-item-btn");

  addItemRow(itemsWrap);

  addItemBtn?.addEventListener("click", () => {
    addItemRow(itemsWrap);
    updateTotals(multiOrderForm);
  });

  multiOrderForm.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.classList.contains("remove-item-btn")) {
      return;
    }

    updateTotals(multiOrderForm);
  });

  multiOrderForm.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (!target.classList.contains("remove-item-btn")) return;

    const rows = multiOrderForm.querySelectorAll(".multi-item-row");
    if (rows.length <= 1) return;

    target.closest(".multi-item-row")?.remove();
    updateTotals(multiOrderForm);
  });

  multiOrderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = multiOrderForm.querySelector(".name")?.value.trim();
    const phone = multiOrderForm.querySelector(".phone")?.value.trim();
    const email = multiOrderForm.querySelector(".email")?.value.trim();
    const address = multiOrderForm.querySelector(".address")?.value.trim();
    const msgEl = multiOrderForm.querySelector(".msg");
    const advance = Number(multiOrderForm.dataset.advance) || DEFAULT_ADVANCE;

    if (!isCustomerInfoValid({ name, phone, email, address })) {
      showMessage(msgEl, "Please fill all required fields with valid data.", "error");
      return;
    }

    const itemRows = [...multiOrderForm.querySelectorAll(".multi-item-row")];
    const items = itemRows.map((row) => getItemFromRow(row));
    const invalidItem = items.find((item) => !item.color || !item.fabric || !item.size || item.quantity < 1);

    if (invalidItem) {
      showMessage(msgEl, "Please select color, fabric, size, and quantity for all items.", "error");
      return;
    }

    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shipping = totalQty >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PER_ORDER;
    const totalPrice = subtotal + shipping;

    const orderData = {
      name,
      phone,
      email,
      address,
      orderType: "multiple",
      items,
      totalQty,
      subtotal,
      shipping,
      totalPrice,
      advance,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "orders"), orderData);

      const itemsText = items
        .map((item, index) =>
          `${index + 1}. ${item.color} Tee | ${item.fabric} | Size ${item.size} | Qty ${item.quantity} | Rs ${item.lineTotal}`)
        .join("\n");

      const whatsappMessage =
`AHMINE STORE - MULTIPLE ITEM ORDER

Name: ${name}
Phone: ${phone}
Email: ${email}
Address: ${address}

Items:
${itemsText}

Subtotal: Rs ${subtotal}
Shipping: Rs ${shipping}
Total Cost: Rs ${totalPrice}

Send 500 RS Advance at SADAPAY (0330-2540909)
And send screenshot of the payment here.`;

      openWhatsApp(whatsappMessage);
      showMessage(msgEl, "Multiple-item order placed. WhatsApp opening...", "success");

      multiOrderForm.reset();
      itemsWrap.innerHTML = "";
      addItemRow(itemsWrap);
      updateTotals(multiOrderForm);
    } catch (error) {
      console.error("Firestore Error:", error);
      showMessage(msgEl, "Error placing order. Please try again.", "error");
    }
  });

  updateTotals(multiOrderForm);
}

function addItemRow(itemsWrap) {
  if (!itemsWrap) return;

  const row = document.createElement("div");
  row.className = "multi-item-row";
  row.innerHTML =
`<div class="multi-item-grid">
  <select class="item-color" required>
    <option value="">Color</option>
    <option>White</option>
    <option>Meroon</option>
    <option>Black</option>
  </select>
  <select class="item-fabric" required>
    <option value="">Fabric</option>
    <option>Poly Lycra</option>
    <option>Cotton Jersey</option>
  </select>
  <select class="item-size" required>
    <option value="">Size</option>
    <option>S</option>
    <option>M</option>
    <option>L</option>
    <option>XL</option>
    <option>XXL</option>
  </select>
  <input type="number" min="1" value="1" class="item-qty" placeholder="Qty" required>
</div>
<p class="line-total">Item Total: Rs 0</p>
<button type="button" class="remove-item-btn">Remove Item</button>`;

  itemsWrap.appendChild(row);
}

function getItemFromRow(row) {
  const color = row.querySelector(".item-color")?.value || "";
  const fabric = row.querySelector(".item-fabric")?.value || "";
  const size = row.querySelector(".item-size")?.value || "";
  let quantity = parseInt(row.querySelector(".item-qty")?.value || "1", 10);
  quantity = Number.isNaN(quantity) || quantity < 1 ? 1 : quantity;

  const unitPrice = PRICES[fabric] || 0;
  const lineTotal = unitPrice * quantity;

  return { color, fabric, size, quantity, unitPrice, lineTotal };
}

function updateTotals(form) {
  const rows = [...form.querySelectorAll(".multi-item-row")];
  const items = rows.map((row) => {
    const item = getItemFromRow(row);
    const lineEl = row.querySelector(".line-total");
    if (lineEl) lineEl.textContent = `Item Total: Rs ${item.lineTotal}`;
    return item;
  });

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = totalQty >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PER_ORDER;
  const finalTotal = subtotal + shipping;

  const subtotalEl = form.querySelector(".subtotal");
  const shippingEl = form.querySelector(".shipping");
  const totalEl = form.querySelector(".final-total");

  if (subtotalEl) subtotalEl.textContent = `Rs ${subtotal}`;
  if (shippingEl) shippingEl.textContent = `Rs ${shipping}`;
  if (totalEl) totalEl.textContent = `Rs ${finalTotal}`;
}

function isCustomerInfoValid({ name, phone, email, address }) {
  if (!name || !phone || !email || !address) return false;
  if (!/^03\d{9}$/.test(phone)) return false;
  return true;
}

function openWhatsApp(message) {
  const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  setTimeout(() => {
    window.open(whatsappURL, "_blank");
  }, 800);
}

function showMessage(element, text, type) {
  if (!element) return;

  element.textContent = text;
  element.classList.remove("success", "error");
  element.classList.add(type === "success" ? "success" : "error");
}

function initHeroSlider(slider) {
  if (!slider) return;

  const track = slider.querySelector(".hero-slides");
  const slides = [...slider.querySelectorAll(".hero-banner")];
  const dots = [...slider.querySelectorAll(".hero-dot")];
  const prevBtn = slider.querySelector(".hero-control.prev");
  const nextBtn = slider.querySelector(".hero-control.next");

  if (!track || !slides.length) return;

  let currentIndex = 0;
  const AUTO_MS = 4500;
  let timerId;

  const showSlide = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  };

  const startAuto = () => {
    stopAuto();
    timerId = setInterval(() => {
      showSlide(currentIndex + 1);
    }, AUTO_MS);
  };

  const stopAuto = () => {
    if (!timerId) return;
    clearInterval(timerId);
    timerId = undefined;
  };

  prevBtn?.addEventListener("click", () => {
    showSlide(currentIndex - 1);
    startAuto();
  });

  nextBtn?.addEventListener("click", () => {
    showSlide(currentIndex + 1);
    startAuto();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startAuto();
    });
  });

  slider.addEventListener("mouseenter", stopAuto);
  slider.addEventListener("mouseleave", startAuto);

  showSlide(0);
  startAuto();
}
