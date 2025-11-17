// cart.js - FULLY MONGODB + YOUR ORIGINAL DESIGN
const token = localStorage.getItem('token');
const API = 'http://localhost:5000/api';

let cart = [], pastPurchases = [], savedForLater = [];

async function fetchCart() {
  if (!token) {
    alert('Please login to view cart');
<<<<<<< HEAD
    window.location.href = '/Login';
=======
    window.location.href = 'Login.html';
>>>>>>> d63683133fafa3ea2269a6cf1cf3a75da1453532
    return;
  }
  const res = await fetch(`${API}/cart`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  cart = data.cart || [];
  pastPurchases = data.pastPurchases || [];
  savedForLater = data.savedForLater || [];
  renderAll();
}

function renderAll() {
  renderSection("cart-items", cart, true);
  renderSection("past-purchases", pastPurchases);
  renderSection("saved-for-later", savedForLater);
  updateTitles();
  updateTotal();
  updateCartBadge();
}

function updateTitles() {
  document.getElementById("cart-items-title").textContent = `Cart Items (${cart.length})`;
  document.getElementById("past-purchases-title").textContent = `Past Purchases (${pastPurchases.length})`;
  document.getElementById("saved-for-later-title").textContent = `Saved for Later (${savedForLater.length})`;
}

function updateTotal() {
  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  document.getElementById("cart-total").textContent = total;
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (badge) {
    const totalQty = cart.reduce((s, i) => s + (i.quantity || 1), 0);
    badge.textContent = totalQty;
  }
}

function renderSection(containerId, items, isCart = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if (!items.length) {
    container.innerHTML = "<p style='text-align:center;color:#999;padding:20px;'>No items</p>";
    return;
  }

  items.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <h4>${item.name}</h4>
      <div class="specs">
        <span>RAM: ${item.ram}</span>
        <span>Storage: ${item.storage}</span>
        <span>Battery: ${item.battery}</span>
        <span>Camera: ${item.camera}</span>
        <span>Display: ${item.display}</span>
      </div>
      <div class="price">₹${(item.price * (item.quantity || 1)).toLocaleString()}</div>
      ${isCart ? `
        <div class="buttons">
          <button class="buy-now" onclick="buyNow(${index})">Buy Now</button>
          <button class="save-later" onclick="saveForLater(${index})">Save for Later</button>
        </div>
      ` : ''}
    `;
    container.appendChild(div);
  });
}

async function buyNow(index) {
  const item = cart[index];
  const res = await fetch(`${API}/cart/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ productId: item._id })
  });
  if (res.ok) fetchCart();
}

async function saveForLater(index) {
  const item = cart[index];
  const res = await fetch(`${API}/cart/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ productId: item._id })
  });
  if (res.ok) fetchCart();
}

document.getElementById("clear-cart").onclick = async () => {
  await fetch(`${API}/cart/clear`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  fetchCart();
};

document.getElementById("checkout-all").onclick = async () => {
  await fetch(`${API}/cart/checkout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  fetchCart();
};

document.addEventListener("DOMContentLoaded", fetchCart);