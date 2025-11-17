// index.js - FULLY PRESERVED ORIGINAL LOGIC + MongoDB Cart + Auth
const container = document.querySelector(".Phonesbackground");
let phoneData = null;
let token = localStorage.getItem('token');

function updateCartBadge() {
  if (!token) return;
  fetch('http://localhost:5000/api/cart', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(data => {
    const badge = document.getElementById("cart-badge");
    if (badge) badge.textContent = data.cart.reduce((s, i) => s + i.quantity, 0);
  });
}

async function addToCart(product) {
  if (!token) {
    alert('Please login first');
<<<<<<< HEAD
    window.location.href = '/login';
=======
    window.location.href = 'Login.html';
>>>>>>> d63683133fafa3ea2269a6cf1cf3a75da1453532
    return;
  }
  const res = await fetch('http://localhost:5000/api/cart/add', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(product)
  });
  if (res.ok) {
    showToast(`${product.name} added to cart ✅`);
    updateCartBadge();
  }
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.cssText = `position:fixed;bottom:20px;right:20px;background:#4caf50;color:white;padding:16px 24px;border-radius:8px;z-index:10000;font-size:15px;box-shadow:0 4px 12px rgba(0,0,0,0.2);`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function renderPhoneCards(phones) {
  container.innerHTML = "";
  if (phones.length === 0) {
    container.innerHTML = `<p style="width:100%;text-align:center;color:#999;padding:60px 20px;font-size:18px;">No phones in this category yet.</p>`;
    return;
  }

  phones.forEach(phone => {
    const card = document.createElement("div");
    card.className = "phonecard";
    Object.entries(phone).forEach(([k, v]) => card.dataset[k] = v); // keep all data-*

    card.innerHTML = `
      <img src="${phone.img}" alt="${phone.name}">
      <div class="phonecard-content">
        <div>
          <div class="phonecard-title">${phone.name}</div>
          <div class="phonecard-details">${phone.details}</div>
          <div class="phonerating">
            <span style="font-size: 22px; font-family: 'Open Sans'; font-weight: 500;">Ratings: </span>
            <span class="star">&#9733;</span><span class="star">&#9733;</span><span class="star">&#9733;</span><span class="star">&#9733;</span><span class="star">&#9733;</span>
          </div>
        </div>
        <button class="phoneto-cart">Add to cart</button>
      </div>
    `;
    container.appendChild(card);
  });

  document.querySelectorAll(".phoneto-cart").forEach(btn => {
    btn.onclick = () => {
      const c = btn.closest(".phonecard");
      addToCart({
        name: c.dataset.name,
        ram: c.dataset.ram,
        storage: c.dataset.storage,
        battery: c.dataset.battery,
        price: parseInt(c.dataset.price),
        img: c.dataset.img,
        processor: c.dataset.processor,
        camera: c.dataset.camera,
        display: c.dataset.display
      });
    };
  });
}

function loadCategory(cat) {
  const phones = phoneData?.categories?.[cat]?.phones || [];
  renderPhoneCards(phones);
}

document.addEventListener("DOMContentLoaded", () => {
  if (token) updateCartBadge();

<<<<<<< HEAD
  fetch("/Phones.json")
=======
  fetch("Phones.json")
>>>>>>> d63683133fafa3ea2269a6cf1cf3a75da1453532
    .then(r => r.json())
    .then(data => {
      phoneData = data;
      loadCategory("all");
    });

  document.querySelectorAll('input[name="category"]').forEach(radio => {
    radio.addEventListener("change", () => loadCategory(radio.id));
  });
});