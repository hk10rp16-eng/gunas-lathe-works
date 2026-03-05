// API Configuration for Guna's Lathe Works & Machining
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : '';

const API_ENDPOINTS = {
    // Auth
    signup: `${API_BASE}/api/auth/signup`,
    login: `${API_BASE}/api/auth/login`,
    verify: `${API_BASE}/api/auth/verify`,
    // Admin Auth (fixed credentials: Gunaadmin001)
    adminLogin: `${API_BASE}/api/admin/login`,
    // Products
    products: `${API_BASE}/api/products`,
    featuredProducts: `${API_BASE}/api/products/featured`,
    searchProducts: `${API_BASE}/api/products/search`,
    // Orders
    orders: `${API_BASE}/api/orders`,
    myOrders: `${API_BASE}/api/orders/my`,
    adminOrders: `${API_BASE}/api/orders/admin/all`,
    // Reviews
    reviews: `${API_BASE}/api/reviews`,
    // Payment
    createPaymentOrder: `${API_BASE}/api/payment/create-order`,
    verifyPayment: `${API_BASE}/api/payment/verify`,
    // Admin
    adminDashboard: `${API_BASE}/api/admin/dashboard`,
    adminUsers: `${API_BASE}/api/admin/users`,
    adminProducts: `${API_BASE}/api/admin/products`,
    adminReviews: `${API_BASE}/api/admin/reviews`,
    // Contact
    contact: `${API_BASE}/api/contact`,
    // Health
    health: `${API_BASE}/api/health`
};

// Shared API request helper
async function apiRequest(url, options = {}) {
    const token = localStorage.getItem('authToken');
    const defaultHeaders = { 'Content-Type': 'application/json' };
    if (token) defaultHeaders['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...(options.headers || {}) }
    });

    const data = await response.json().catch(() => ({ message: response.statusText }));
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
}

// Star rating HTML helper
function renderStars(avg, count = 0) {
    const full = Math.floor(avg);
    const half = avg % 1 >= 0.5;
    let html = '<span class="stars">';
    for (let i = 1; i <= 5; i++) {
        if (i <= full) html += '<span class="star filled">★</span>';
        else if (i === full + 1 && half) html += '<span class="star half">★</span>';
        else html += '<span class="star empty">★</span>';
    }
    html += `</span><span class="rating-count">(${count})</span>`;
    return html;
}

// Format currency
function formatCurrency(amount) {
    return '₹' + Number(amount).toLocaleString('en-IN');
}

// Auth state
function getAuthUser() {
    const userData = localStorage.getItem('userData');
    const token = localStorage.getItem('authToken');
    if (!userData || !token) return null;
    try { return JSON.parse(userData); } catch { return null; }
}

function updateNavAuth() {
    const user = getAuthUser();
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-signup');
    const userInfo = document.querySelector('.user-info');
    const userNameEl = document.getElementById('userName');
    const adminLink = document.getElementById('adminNavLink');

    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (signupBtn) signupBtn.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userNameEl) userNameEl.textContent = user.name.split(' ')[0];
        if (adminLink && user.role === 'admin') adminLink.style.display = 'inline-block';
    }
}

// Cart helpers
function getCart() {
    try { return JSON.parse(localStorage.getItem('cart')) || []; }
    catch { return []; }
}
function saveCart(cart) { localStorage.setItem('cart', JSON.stringify(cart)); }
function getCartCount() { return getCart().reduce((s, i) => s + i.quantity, 0); }
function updateCartBadge() {
    const badge = document.getElementById('cartCount');
    if (badge) badge.textContent = getCartCount();
}
function addToCart(product) {
    const cart = getCart();
    const idx = cart.findIndex(i => i.id === product.id);
    if (idx > -1) cart[idx].quantity++;
    else cart.push({ ...product, quantity: 1 });
    saveCart(cart);
    updateCartBadge();
}

// Toast notification
function showToast(message, type = 'success') {
    const existing = document.getElementById('toastContainer');
    if (existing) existing.remove();
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;';
    const toast = document.createElement('div');
    toast.style.cssText = `background:${type === 'success' ? '#ffa500' : '#e53935'};color:${type === 'success' ? '#000' : '#fff'};padding:12px 20px;border-radius:8px;font-weight:600;box-shadow:0 4px 15px rgba(0,0,0,0.4);margin-bottom:8px;animation:fadeIn 0.3s ease;`;
    toast.textContent = message;
    container.appendChild(toast);
    document.body.appendChild(container);
    setTimeout(() => container.remove(), 3500);
}

// Init on every page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavAuth();
    updateCartBadge();
    // Hamburger menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger?.classList.remove('active');
            navLinks?.classList.remove('active');
        });
    });
    // Cart icon
    const cartIcon = document.getElementById('cartIcon');
    if (cartIcon) {
        cartIcon.style.cursor = 'pointer';
        cartIcon.addEventListener('click', () => { window.location.href = 'cart.html'; });
    }
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        showToast('Logged out successfully');
        setTimeout(() => window.location.href = 'index.html', 1000);
    });
});

// Razorpay key for frontend
const RAZORPAY_KEY = 'rzp_test_RMKz5sso9Q16ay';
