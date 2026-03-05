// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close menu when clicking a link
navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, initializing slider...');

    // Hero Slider Functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.indicator');
    const totalSlides = slides.length;
    let autoSlideInterval;

    console.log('Slides found:', totalSlides);
    console.log('Indicators found:', indicators.length);

    function showSlide(index) {
        if (totalSlides === 0) return;

        console.log('Showing slide:', index);

        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(indicator => indicator.classList.remove('active'));

        slides[index].classList.add('active');
        indicators[index].classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        console.log('Next slide:', currentSlide);
        showSlide(currentSlide);
    }

    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        console.log('Previous slide:', currentSlide);
        showSlide(currentSlide);
    }

    function startAutoSlide() {
        if (totalSlides > 1) {
            console.log('Starting auto-slide');
            autoSlideInterval = setInterval(nextSlide, 5000);
        }
    }

    function stopAutoSlide() {
        console.log('Stopping auto-slide');
        clearInterval(autoSlideInterval);
    }

    if (totalSlides > 0) {
        console.log('Initializing slider controls...');

        const nextBtn = document.getElementById('nextSlide');
        const prevBtn = document.getElementById('prevSlide');

        nextBtn?.addEventListener('click', () => {
            console.log('Next button clicked');
            stopAutoSlide();
            nextSlide();
            startAutoSlide();
        });

        prevBtn?.addEventListener('click', () => {
            console.log('Previous button clicked');
            stopAutoSlide();
            prevSlide();
            startAutoSlide();
        });

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                console.log('Indicator clicked:', index);
                stopAutoSlide();
                currentSlide = index;
                showSlide(currentSlide);
                startAutoSlide();
            });
        });

        const heroContactBtn = document.getElementById('heroContactBtn');
        heroContactBtn?.addEventListener('click', () => {
            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
        });

        startAutoSlide();

        const heroSection = document.querySelector('.hero-section');
        heroSection?.addEventListener('mouseenter', stopAutoSlide);
        heroSection?.addEventListener('mouseleave', startAutoSlide);

        console.log('Slider initialized successfully!');
    } else {
        console.error('No slides found!');
    }
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');

console.log('Contact form found:', contactForm);

contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log('Contact form submitted');

    const submitBtn = contactForm.querySelector('.btn-submit');
    const originalText = submitBtn.textContent;

    try {
        submitBtn.textContent = 'SENDING...';
        submitBtn.disabled = true;

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        console.log('Sending contact form data:', formData);

        if (typeof apiRequest === 'undefined') {
            throw new Error('apiRequest function not found. Make sure config.js is loaded.');
        }

        const response = await apiRequest(API_ENDPOINTS.contact, {
            method: 'POST',
            body: JSON.stringify(formData)
        });

        console.log('Contact form response:', response);

        alert(response.message || 'Thank you for contacting us! We will get back to you soon.');
        contactForm.reset();
    } catch (error) {
        console.error('Contact form error:', error);
        alert(error.message || 'Failed to send message. Please try again.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Login Form Handling
const loginForm = document.getElementById('loginForm');

console.log('Login form found:', loginForm);

loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log('Login form submitted');

    const submitBtn = loginForm.querySelector('.btn-auth-submit');
    const originalText = submitBtn.textContent;

    try {
        submitBtn.textContent = 'LOGGING IN...';
        submitBtn.disabled = true;

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        console.log('Attempting login for:', email);

        if (typeof apiRequest === 'undefined') {
            throw new Error('apiRequest function not found. Make sure config.js is loaded.');
        }

        if (typeof API_ENDPOINTS === 'undefined') {
            throw new Error('API_ENDPOINTS not found. Make sure config.js is loaded.');
        }

        const response = await apiRequest(API_ENDPOINTS.login, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        console.log('Login response:', response);

        // Store token and user data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));

        alert('Login successful! Welcome back.');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed. Please check your credentials.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Signup Form Handling
const signupForm = document.getElementById('signupForm');

signupForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = signupForm.querySelector('.btn-auth-submit');
    const originalText = submitBtn.textContent;

    try {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const phone = document.getElementById('signupPhone').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match. Please try again.');
            return;
        }

        // Password strength check
        if (password.length < 6) {
            alert('Password must be at least 6 characters long.');
            return;
        }

        submitBtn.textContent = 'CREATING ACCOUNT...';
        submitBtn.disabled = true;

        const response = await apiRequest(API_ENDPOINTS.signup, {
            method: 'POST',
            body: JSON.stringify({ name, email, password, phone })
        });

        // Store token and user data
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userData', JSON.stringify(response.user));

        alert('Account created successfully! Welcome to Guna\'s Lathe Works.');
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message || 'Signup failed. Please try again.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});

// Check if user is logged in on page load
window.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (token && userData) {
        // Verify token with backend
        try {
            await apiRequest(API_ENDPOINTS.verify);

            // Token is valid - update navbar
            const authButtons = document.querySelector('.auth-buttons');
            const userInfo = document.querySelector('.user-info');
            const userName = document.getElementById('userName');

            if (authButtons && userInfo && userName) {
                // Hide login/signup buttons
                const loginBtn = document.querySelector('.btn-login');
                const signupBtn = document.querySelector('.btn-signup');
                if (loginBtn) loginBtn.style.display = 'none';
                if (signupBtn) signupBtn.style.display = 'none';

                // Show user info
                userName.textContent = userData.name;
                userInfo.style.display = 'flex';
            }
        } catch (error) {
            // Token is invalid - clear storage
            console.error('Token verification failed:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
        }
    }
});

// Logout Handling
const logoutBtn = document.getElementById('logoutBtn');

logoutBtn?.addEventListener('click', () => {
    // Clear user data and token
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');

    // Show message and redirect
    alert('You have been logged out successfully.');
    window.location.href = 'index.html';
});

// --- Shopping Cart Logic ---
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const billingSection = document.getElementById('billingSection');
const generateBillBtn = document.getElementById('generateBillBtn');

function updateCartUI() {
    // Update badge count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;

    // Always save to localStorage immediately
    localStorage.setItem('cart', JSON.stringify(cart));

    // If no cart container on current page, just return
    if (!cartItemsContainer) return;

    // Render items
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        if (checkoutBtn) checkoutBtn.classList.add('disabled');
        if (cartTotal) cartTotal.textContent = '₹0';
        return;
    }

    if (checkoutBtn) checkoutBtn.classList.remove('disabled');

    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn minus-btn" data-index="${index}">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn plus-btn" data-index="${index}">+</button>
                    <span class="cart-item-remove" data-index="${index}">Remove</span>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    if (cartTotal) cartTotal.textContent = `₹${total}`;
}

// Navigate to Cart Page
cartIcon?.addEventListener('click', () => {
    const isCartPage = window.location.pathname.endsWith('cart.html');
    if (!isCartPage) {
        window.location.href = 'cart.html';
    }
});

// For backward compatibility if any old modals still exist
closeCart?.addEventListener('click', () => {
    if (cartModal) {
        cartModal.classList.remove('open');
        setTimeout(() => cartModal.style.display = 'none', 300);
    }
});

// Event delegation for cart actions (plus, minus, remove)
cartItemsContainer?.addEventListener('click', (e) => {
    const index = e.target.getAttribute('data-index');
    if (index === null) return;

    if (e.target.classList.contains('plus-btn')) {
        cart[index].quantity += 1;
    } else if (e.target.classList.contains('minus-btn')) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        }
    } else if (e.target.classList.contains('cart-item-remove')) {
        cart.splice(index, 1);
    }

    updateCartUI();
});


// Checkout & Invoice Generation
checkoutBtn?.addEventListener('click', async () => {
    if (checkoutBtn.classList.contains('disabled') || cart.length === 0) return;

    const token = localStorage.getItem('authToken');
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!token || !userData) {
        alert('Please login to checkout.');
        window.location.href = 'login.html';
        return;
    }

    const originalText = checkoutBtn.textContent;
    checkoutBtn.textContent = 'Processing Checkout...';
    checkoutBtn.classList.add('disabled');

    try {
        const response = await fetch(API_ENDPOINTS.checkout || 'http://localhost:5000/api/orders/checkout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cartInfo: cart })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Checkout failed');
        }

        // Check if response is a file (PDF)
        const blob = await response.blob();

        // Create an invisible link to download the PDF
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Invoice_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);

        alert('Checkout completed successfully! Your invoice has been downloaded.');

        // Clear Cart
        cart = [];
        updateCartUI();

    } catch (error) {
        console.error('Checkout error:', error);
        alert(error.message || 'An error occurred during checkout.');
    } finally {
        checkoutBtn.textContent = originalText;
        checkoutBtn.classList.remove('disabled');
    }
});

// Initialize Cart UI and Buttons on load
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();

    // Add to Cart Button Handling
    const orderButtons = document.querySelectorAll('.add-to-cart-btn');

    orderButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const productName = e.target.getAttribute('data-product');
            const productPrice = parseInt(e.target.getAttribute('data-price'));
            const productImage = e.target.getAttribute('data-image');

            // Check if item already in cart
            const existingItemIndex = cart.findIndex(item => item.name === productName);

            if (existingItemIndex > -1) {
                cart[existingItemIndex].quantity += 1;
            } else {
                cart.push({
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }

            updateCartUI();

            // Navigate to cart page immediately
            window.location.href = 'cart.html';
        });
    });
});
