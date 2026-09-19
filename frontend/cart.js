// =============================================
// cart.js — FULLSTACK VERSION
// =============================================

const API = '/api';

function getSessionId() {
  let sid = localStorage.getItem('eshopSessionId');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substr(2, 12) + Date.now();
    localStorage.setItem('eshopSessionId', sid);
  }
  return sid;
}

async function api(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-Session-Id': getSessionId(),
    ...(options.headers || {})
  };
  const res = await fetch(API + endpoint, { ...options, headers });
  return res.json();
}

let allProducts = [];
let cartItems = [];

async function loadProducts() {
  try { allProducts = await api('/products'); }
  catch (e) { console.error('Load products failed:', e); }
}

async function loadCart() {
  try { cartItems = await api('/cart'); }
  catch (e) { cartItems = []; }
}

function renderProductCards(containerId, categoryFilter = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let filtered = allProducts;
  if (categoryFilter && categoryFilter !== 'all') {
    filtered = allProducts.filter(p => p.category === categoryFilter);
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:20px;color:#888;">No products found.</p>';
    return;
  }

  container.innerHTML = filtered.map(p => `
    <article class="product-card">
      <div class="product-image">${p.emoji}</div>
      <h3>${p.name}</h3>
      <p class="product-price">₱${p.price}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
        <button class="add-to-cart" data-id="${p.id}">Add to Cart</button>
        <button class="remove-from-cart" data-id="${p.id}">Remove</button>
      </div>
    </article>
  `).join('');
}

async function addToCart(productId) {
  await api('/cart', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity: 1 })
  });
  await loadCart();
  renderCart();
  updateBadge();
}

async function removeFromCart(productId) {
  const item = cartItems.find(i => i.product_id === productId);
  if (!item) return;

  if (item.quantity > 1) {
    await api('/cart/' + item.id, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: item.quantity - 1 })
    });
  } else {
    await api('/cart/' + item.id, { method: 'DELETE' });
  }
  await loadCart();
  renderCart();
  updateBadge();
}

function refreshAllProductDisplays() {
  if (document.getElementById('all-products-grid')) {
    renderProductCards('all-products-grid', 'all');
  }
  if (document.getElementById('category-products')) {
    renderProductCards('category-products', window.currentCategory || 'all');
  }
}

function updateBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  const total = cartItems.reduce((s, i) => s + i.quantity, 0);
  badge.innerText = total;
}

function renderCart() {
  const tbody = document.getElementById('cartItems');
  if (!tbody) return;

  if (cartItems.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-cart-message">Your cart is empty.</td></tr>';
    const g = document.getElementById('grandTotal');
    if (g) g.innerText = '₱0.00';
    return;
  }

  let grandTotal = 0;
  tbody.innerHTML = cartItems.map(item => {
    const itemTotal = item.price * item.quantity;
    grandTotal += itemTotal;
    return `
      <tr class="cart-row">
        <td class="cart-cell">${item.name}</td>
        <td class="cart-cell text-center">₱${item.price}</td>
        <td class="cart-cell text-center">
          <button class="qty-btn" data-cart-id="${item.id}" data-action="decrease">-</button>
          ${item.quantity}
          <button class="qty-btn" data-cart-id="${item.id}" data-action="increase">+</button>
        </td>
        <td class="cart-cell text-center">₱${itemTotal}</td>
        <td class="cart-cell text-center">
          <button class="remove-btn" data-cart-id="${item.id}">Remove</button>
        </td>
      </tr>
    `;
  }).join('');

  const g = document.getElementById('grandTotal');
  if (g) g.innerText = '₱' + grandTotal.toFixed(2);
}

function filterProducts(category) {
  window.currentCategory = category;
  renderProductCards('category-products', category);
}

document.addEventListener('click', async function(e) {
  const t = e.target;

  if (t.classList.contains('add-to-cart')) {
    await addToCart(parseInt(t.dataset.id));
    alert('Product added to cart!');
  }

  if (t.classList.contains('remove-from-cart')) {
    await removeFromCart(parseInt(t.dataset.id));
    alert('Product removed from cart.');
  }

  if (t.classList.contains('qty-btn')) {
    const cartId = t.dataset.cartId;
    const action = t.dataset.action;
    const item = cartItems.find(i => i.id == cartId);
    if (!item) return;
    const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;

    if (newQty < 1) {
      await api('/cart/' + cartId, { method: 'DELETE' });
    } else {
      await api('/cart/' + cartId, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: newQty })
      });
    }
    await loadCart();
    renderCart();
    updateBadge();
  }

  if (t.classList.contains('remove-btn')) {
    await api('/cart/' + t.dataset.cartId, { method: 'DELETE' });
    await loadCart();
    renderCart();
    updateBadge();
  }

  if (t.id === 'buyButton') {
    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    const result = await api('/checkout', { method: 'POST' });
    if (result.error) {
      alert('Error: ' + result.error);
      return;
    }
    alert('Salamat! Total: ₱' + result.total);
    await loadCart();
    renderCart();
    updateBadge();
  }
});

document.addEventListener('DOMContentLoaded', async function() {
  await loadProducts();
  await loadCart();
  renderCart();
  updateBadge();
  refreshAllProductDisplays();
});