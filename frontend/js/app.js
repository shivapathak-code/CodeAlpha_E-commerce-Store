// App State
console.log("MY APP JS LOADED");
const state = {
    products: [],
    filteredProducts: [],
    cart: [],
    currentUser: null,
    orders: [],
    currentView: "products",
    selectedProductId: null,
    activeCategory: "All",
    searchQuery: "",
    promoCode: "",
    appliedDiscount: 0,
    isLoadingProducts: false
};

const API_BASE_URL = "http://localhost:5000/api";

const savedUser = JSON.parse(localStorage.getItem("user"));

if (savedUser) {
    state.currentUser = savedUser;
}

// ===================================
// LOAD PRODUCTS FROM API
// ===================================

async function loadProductsFromAPI() {
    try {
        state.isLoadingProducts = true;
        console.log("Loading products from API...");
        
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (!response.ok) {
            throw new Error(`Failed to load products: ${response.statusText}`);
        }
        
        const products = await response.json();
        console.log("Products loaded from API:", products);
        
        state.products = products;
        state.filteredProducts = products;
        
        console.log("State products updated with MongoDB data");
        
    } catch (error) {
        console.error("Error loading products:", error);
        showToast("Failed to load products. Please refresh the page.", "error");
    } finally {
        state.isLoadingProducts = false;
    }
}

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
    await loadProductsFromAPI();
    loadState();
    setupEventListeners();
    switchView("products");
    updateNavUI();
    renderCart();
    
    // Initial display
    filterAndSearchProducts();
});

// Load state from local storage / session
function loadState() {
    state.currentUser =
JSON.parse(localStorage.getItem("user")) || null;
    
    const savedCart = localStorage.getItem("store_cart");
    if (savedCart) {
        state.cart = JSON.parse(savedCart);
        updateCartBadge();
    }
    
    if (state.currentUser) {
        // state.orders = db.getOrders(state.currentUser.username);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Nav Navigation Links
    document.querySelectorAll("[data-view-target]").forEach(element => {
        element.addEventListener("click", (e) => {
            e.preventDefault();
            const target = element.getAttribute("data-view-target");
            
            // Toggle User Dropdown if clicked on profile
            if (target === "profile" && !state.currentUser) {
                openModal("login-modal");
                return;
            }
            switchView(target);
        });
    });

    // Cart Drawer Toggle
    const cartBtn = document.getElementById("cart-btn");
    const closeCartBtn = document.getElementById("close-cart");
    const cartOverlay = document.getElementById("cart-overlay");

    if (cartBtn) {
        cartBtn.addEventListener("click", () => {
            if (cartOverlay) cartOverlay.classList.add("show");
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener("click", () => {
            if (cartOverlay) cartOverlay.classList.remove("show");
        });
    }

    if (cartOverlay) {
        cartOverlay.addEventListener("click", (e) => {
            if (e.target.id === "cart-overlay") {
                cartOverlay.classList.remove("show");
            }
        });
    }

    // User Menu Dropdown Toggle
    const userTrigger = document.getElementById("user-trigger");
    const userDropdown = document.getElementById("user-dropdown");
    
    if (userTrigger) {
        userTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle("show");
        });
    }

    document.addEventListener("click", () => {
        if (userDropdown) userDropdown.classList.remove("show");
    });

    // Logo Click triggers Home (products)
    const logoContainer = document.getElementById("logo-container");
    if (logoContainer) {
        logoContainer.addEventListener("click", () => {
            state.activeCategory = "All";
            state.searchQuery = "";
            const searchInput = document.getElementById("search-input");
            if (searchInput) searchInput.value = "";
            
            document.querySelectorAll(".filter-btn").forEach(btn => {
                if (btn.getAttribute("data-category") === "All") {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
            
            filterAndSearchProducts();
            switchView("products");
        });
    }

    // Filter Buttons
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.activeCategory = btn.getAttribute("data-category");
            filterAndSearchProducts();
        });
    });

    // Search Input
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            state.searchQuery = e.target.value.trim().toLowerCase();
            filterAndSearchProducts();
        });
    }

    // Auth Modals Setup
    const openRegisterBtn = document.getElementById("open-register");
    const openLoginBtn = document.getElementById("open-login");

    if (openRegisterBtn) {
        openRegisterBtn.addEventListener("click", () => {
            closeModal("login-modal");
            openModal("register-modal");
        });
    }

    if (openLoginBtn) {
        openLoginBtn.addEventListener("click", () => {
            closeModal("register-modal");
            openModal("login-modal");
        });
    }

    document.querySelectorAll(".modal-overlay").forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target.classList.contains("modal-overlay")) {
                closeModal(e.target.id);
            }
        });
    });

    // Auth Form Submissions
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLoginSubmit);
    }

    if (registerForm) {
        registerForm.addEventListener("submit", handleRegisterSubmit);
    }

    // Logout Action
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleLogout();
        });
    }

    // Checkout Form Submission
    const checkoutForm = document.getElementById("checkout-form");
    if (checkoutForm) {
        checkoutForm.addEventListener("submit", handleCheckoutSubmit);
    }

    // FAQ search listener
    const faqSearchInput = document.getElementById("faq-search-input");
    if (faqSearchInput) {
        faqSearchInput.addEventListener("input", (e) => {
            renderFAQ(e.target.value.trim());
        });
    }

    // Promo code listener
    const applyPromoBtn = document.getElementById("apply-promo");
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener("click", applyPromoCode);
    }
}

// Route Switcher / SPA controller
function switchView(viewName, params = {}) {
    state.currentView = viewName;
    
    // Hide all view containers
    document.querySelectorAll(".view-container").forEach(view => {
        view.classList.remove("active");
    });
    
    // Close sidebar cart
    document.getElementById("cart-overlay").classList.remove("show");

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Active View rendering or custom logic
    setTimeout(() => {
        const container = document.getElementById(`${viewName}-view`);
        if (container) {
            container.classList.add("active");
        }
        
        if (viewName === "products") {
            // Highlight nav link
            updateActiveNavLink("products");
        } else if (viewName === "about") {
            updateActiveNavLink("about");
        } else if (viewName === "support") {
            renderFAQ();
            updateActiveNavLink("support");
        } else if (viewName === "cart") {
            renderCartPageView();
            updateActiveNavLink("");
        } else if (viewName === "detail") {
            state.selectedProductId = params.productId;
            renderDetailView();
            updateActiveNavLink("");
        } else if (viewName === "checkout") {
            renderCheckoutView();
            updateActiveNavLink("");
        } else if (viewName === "profile") {
            renderProfileView();
            updateActiveNavLink("profile");
        }
        
        lucide.createIcons();
    }, 150);
}

function updateActiveNavLink(viewName) {
    document.querySelectorAll("[data-view-target]").forEach(link => {
        if (link.getAttribute("data-view-target") === viewName) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

// Spotlight Mouse-Tracker for Product Cards
function setupSpotlightListeners() {
    const cards = document.querySelectorAll(".product-card");
    cards.forEach(card => {
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within element
            const y = e.clientY - rect.top;  // y position within element
            
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        });
    });
}

// Product Filtering & Rendering
function filterAndSearchProducts() {
    state.filteredProducts = state.products.filter(product => {
        const matchesCategory = state.activeCategory === "All" || product.category === state.activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(state.searchQuery) ||
                              product.category.toLowerCase().includes(state.searchQuery) ||
                              product.description.toLowerCase().includes(state.searchQuery);
        return matchesCategory && matchesSearch;
    });
    
    renderProductList();
}

function renderProductList() {
    const grid = document.getElementById("products-grid");
    if (!grid) return;
    
    if (state.filteredProducts.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">
                <i data-lucide="search-slash" style="width: 48px; height: 48px; margin-bottom: 12px; color: var(--color-accent);"></i>
                <p style="font-size: 18px; font-weight: 600;">No products match your criteria</p>
                <p style="font-size: 14px;">Try searching for something else or clearing filters.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    grid.innerHTML = state.filteredProducts.map(product => {
        const ratingStars = getStarsHTML(product.rating);
        const badgeHTML = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';
        const catKey = product.category.toLowerCase();
        const catBadgeClass = `category-badge-${catKey}`;
        const catIcons = { 'Electronics': 'cpu', 'Books': 'book-open', 'Clothes': 'shirt', 'Other': 'sparkles' };
        const catIcon = catIcons[product.category] || 'tag';
        
        return `
            <div class="product-card" data-id="${product._id}" data-cat="${product.category}">
                <div class="product-card-img-container">
                    ${badgeHTML}
                    <img class="product-card-img" src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-card-info">
                    <span class="product-card-category ${catBadgeClass}" style="display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:10px; font-size:11px; font-weight:700; border:1px solid; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.08em;">
                        <i data-lucide="${catIcon}" style="width:10px; height:10px;"></i> ${product.category}
                    </span>
                    <h3 class="product-card-title">${product.name}</h3>
                    <div class="product-card-rating">
                        ${ratingStars}
                        <span>(${product.reviewsCount})</span>
                    </div>
                    <div class="product-card-footer">
                        <span class="product-card-price">$${product.price.toFixed(2)}</span>
                        <button class="add-cart-btn" data-add-id="${product._id}">
                            <i data-lucide="shopping-cart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join("");
    
    // Add Click listeners for cards (navigating to detail) and cart buttons
    document.querySelectorAll(".product-card").forEach(card => {
        card.addEventListener("click", (e) => {
            // If clicked on add-to-cart button, don't trigger detail view
            if (e.target.closest(".add-cart-btn")) {
                const productId = e.target.closest(".add-cart-btn").getAttribute("data-add-id");
                addToCart(productId);
                e.stopPropagation();
                return;
            }
            const productId = card.getAttribute("data-id");
            switchView("detail", { productId });
        });
    });
    
    setupSpotlightListeners();
    lucide.createIcons();
}

function getStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
    
    let html = "";
    for (let i = 0; i < fullStars; i++) html += '<i data-lucide="star" style="fill: #ffb700; width: 14px; height: 14px;"></i>';
    if (halfStar) html += '<i data-lucide="star-half" style="fill: #ffb700; width: 14px; height: 14px;"></i>';
    for (let i = 0; i < emptyStars; i++) html += '<i data-lucide="star" style="width: 14px; height: 14px;"></i>';
    
    return html;
}

// Product Detail View Rendering
function renderDetailView() {
    const container = document.getElementById("detail-view");
    if (!container) return;
    
    const product = state.products.find(p => p._id === state.selectedProductId);
    if (!product) {
        container.innerHTML = `<p>Product not found.</p>`;
        return;
    }
    
    const ratingStars = getStarsHTML(product.rating);
    
    // Set up spec rows
    let specsHTML = "";
    if (product.specs && typeof product.specs === 'object') {
        for (const [key, value] of Object.entries(product.specs)) {
            specsHTML += `
                <div class="spec-row">
                    <span class="spec-name">${key}</span>
                    <span class="spec-value">${value}</span>
                </div>
            `;
        }
    }
    
    container.innerHTML = `
        <button class="btn btn-secondary" id="back-to-catalog" style="margin-bottom: var(--space-md);">
            <i data-lucide="arrow-left"></i> Back to Store
        </button>
        <div class="detail-grid">
            <div class="detail-gallery">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="detail-info">
                <span class="detail-category">${product.category}</span>
                <h1 class="detail-title">${product.name}</h1>
                <div class="detail-rating">
                    <span class="detail-rating-stars">${ratingStars}</span>
                    <span>(${product.reviewsCount} customer reviews)</span>
                </div>
                <div class="detail-price">$${product.price.toFixed(2)}</div>
                <p class="detail-desc">${product.description}</p>
                
                <div class="detail-specs">
                    <h4 style="margin-bottom: var(--space-xs); font-family: var(--font-heading);">Product Specifications</h4>
                    ${specsHTML}
                </div>
                
                <div class="detail-actions">
                    <button class="btn btn-primary" id="detail-add-cart" data-id="${product._id}">
                        <i data-lucide="shopping-bag"></i> Add To Cart
                    </button>
                    <button class="btn btn-secondary" id="detail-buy-now" data-id="${product._id}">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Attach buttons
    document.getElementById("back-to-catalog").addEventListener("click", () => {
        switchView("products");
    });
    
    document.getElementById("detail-add-cart").addEventListener("click", () => {
        addToCart(product._id);
    });

    document.getElementById("detail-buy-now").addEventListener("click", () => {
        // Quick checkout: clear cart first, add this item, go to checkout
        state.cart = [{ product, quantity: 1 }];
        saveCartState();
        renderCart();
        switchView("checkout");
    });
}

// Shopping Cart Core Operations
function addToCart(productId) {
    const product = state.products.find(p => p._id === productId);
    if (!product) {
        console.error("Product not found:", productId);
        return;
    }
    
    const existingIndex = state.cart.findIndex(item => item.product._id === productId);
    
    if (existingIndex > -1) {
        state.cart[existingIndex].quantity += 1;
    } else {
        state.cart.push({ product, quantity: 1 });
    }
    
    saveCartState();
    renderCart();
    showToast(`Added ${product.name} to cart`, 'success');
}

function updateCartQty(productId, delta) {
    const index = state.cart.findIndex(item => item.product._id === productId);
    if (index === -1) return;
    
    state.cart[index].quantity += delta;
    
    if (state.cart[index].quantity <= 0) {
        state.cart.splice(index, 1);
    }
    
    saveCartState();
    renderCart();
}

function removeFromCart(productId) {
    const index = state.cart.findIndex(item => item.product._id === productId);
    if (index === -1) return;
    
    const itemName = state.cart[index].product.name;
    state.cart.splice(index, 1);
    
    saveCartState();
    renderCart();
    showToast(`Removed ${itemName} from cart`);
}

function saveCartState() {
    localStorage.setItem("store_cart", JSON.stringify(state.cart));
    updateCartBadge();
}

function updateCartBadge() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll(".cart-count");
    badges.forEach(b => {
        b.textContent = totalItems;
        b.style.display = totalItems > 0 ? "flex" : "none";
    });
}

function renderCart() {
    const container = document.getElementById("cart-items-container");
    if (!container) return;
    
    if (state.cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <i data-lucide="shopping-bag" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;"></i>
                <p>Your shopping bag is empty</p>
                <button class="btn btn-secondary" style="margin-top: 16px; font-size: 13px; padding: 8px 16px;" onclick="switchView('products')">Go Shopping</button>
            </div>
        `;
        document.getElementById("cart-checkout-btn").disabled = true;
        document.getElementById("cart-subtotal").textContent = "$0.00";
        document.getElementById("cart-total").textContent = "$0.00";
        lucide.createIcons();
        return;
    }
    
    document.getElementById("cart-checkout-btn").disabled = false;
    
    container.innerHTML = state.cart.map(item => `
        <div class="cart-item">
            <img class="cart-item-img" src="${item.product.image}" alt="${item.product.name}">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.product.name}</h4>
                <div class="cart-item-price">$${(item.product.price * item.quantity).toFixed(2)}</div>
                <div class="cart-item-qty">
                    <button class="qty-btn" onclick="updateCartQty('${item.product._id}', -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQty('${item.product._id}', 1)">+</button>
                </div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.product._id}')">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
    `).join("");
    
    // Totals calculations
    const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    document.getElementById("cart-subtotal").textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById("cart-total").textContent = `$${subtotal.toFixed(2)}`;
    
    lucide.createIcons();
}

// Checkout View Rendering
function renderCheckoutView() {
    const container = document.getElementById("checkout-view");
    if (!container) return;
    
    if (state.cart.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 0;">
                <i data-lucide="shopping-cart" style="width: 64px; height: 64px; color: var(--color-accent); margin-bottom: var(--space-md);"></i>
                <h2>Cannot proceed to checkout</h2>
                <p style="color: var(--text-muted); margin-bottom: var(--space-md);">Your shopping cart is empty.</p>
                <button class="btn btn-primary" onclick="switchView('products')">Go to Catalog</button>
            </div>
        `;
        lucide.createIcons();
        return;
    }
    
    const itemsReviewHTML = state.cart.map(item => `
        <div class="cart-item" style="margin-bottom: var(--space-xs);">
            <img class="cart-item-img" src="${item.product.image}" alt="${item.product.name}" style="width: 50px; height: 50px;">
            <div class="cart-item-info">
                <h4 class="cart-item-title" style="font-size: 14px;">${item.product.name}</h4>
                <div style="display:flex; justify-content:space-between; font-size:13px; color:var(--text-muted)">
                    <span>Qty: ${item.quantity}</span>
                    <span style="color:var(--color-primary); font-weight:700">$${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
            </div>
        </div>
    `).join("");
    
    const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 150 ? 0.00 : 15.00;
    const tax = subtotal * 0.08; // 8% sales tax
    const total = subtotal + shipping + tax;
    
    // Prefill form if logged in
    const emailVal = state.currentUser ? state.currentUser.email : "";
    const nameVal = state.currentUser ? state.currentUser.fullName : "";
    
    container.innerHTML = `
        <div class="checkout-grid">
            <!-- Left Panel (Order details & shipping) - 61.8% -->
            <div class="checkout-card">
                <h2 style="margin-bottom: var(--space-lg); font-family: var(--font-heading);">Complete Your Order</h2>
                
                <form id="checkout-form">
                    <div class="checkout-section-title">
                        <span>01</span> Contact & Shipping
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="ship-name">Full Name</label>
                            <div class="input-container">
                                <input type="text" id="ship-name" class="form-input" required value="${nameVal}">
                                <i data-lucide="user" class="input-icon"></i>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="ship-email">Email Address</label>
                            <div class="input-container">
                                <input type="email" id="ship-email" class="form-input" required value="${emailVal}">
                                <i data-lucide="mail" class="input-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="ship-address">Shipping Address</label>
                        <div class="input-container">
                            <input type="text" id="ship-address" class="form-input" required placeholder="Street address, apartment, unit">
                            <i data-lucide="map-pin" class="input-icon"></i>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="ship-city">City</label>
                            <div class="input-container">
                                <input type="text" id="ship-city" class="form-input" required>
                                <i data-lucide="building" class="input-icon"></i>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="ship-zip">ZIP / Postal Code</label>
                            <div class="input-container">
                                <input type="text" id="ship-zip" class="form-input" required>
                                <i data-lucide="hash" class="input-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="checkout-section-title" style="margin-top: var(--space-lg);">
                        <span>02</span> Simulated Payment
                    </div>
                    <p style="font-size:13px; color:var(--text-muted); margin-bottom:var(--space-sm)">This is a frontend demonstration. Credit card data is not processed.</p>
                    
                    <div class="form-group">
                        <label class="form-label" for="card-number">Card Number</label>
                        <div class="input-container">
                            <input type="text" id="card-number" class="form-input" required placeholder="4000 1234 5678 9010" pattern="[0-9\\s]{13,19}">
                            <i data-lucide="credit-card" class="input-icon"></i>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="card-expiry">Expiry Date</label>
                            <div class="input-container">
                                <input type="text" id="card-expiry" class="form-input" required placeholder="MM/YY">
                                <i data-lucide="calendar" class="input-icon"></i>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="card-cvc">CVC</label>
                            <div class="input-container">
                                <input type="password" id="card-cvc" class="form-input" required placeholder="***" maxlength="4">
                                <i data-lucide="lock" class="input-icon"></i>
                            </div>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full" style="margin-top: var(--space-md);">
                        <i data-lucide="shield-check"></i> Authorize & Place Order ($${total.toFixed(2)})
                    </button>
                </form>
            </div>
            
            <!-- Right Panel (Order Summary review) - 38.2% -->
            <div class="checkout-card">
                <h3 style="margin-bottom: var(--space-md); font-family: var(--font-heading);">Order Summary</h3>
                <div style="max-height: 250px; overflow-y: auto; margin-bottom: var(--space-md);">
                    ${itemsReviewHTML}
                </div>
                <div class="summary-box">
                    <div class="summary-item">
                        <span>Subtotal</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-item">
                        <span>Est. Shipping</span>
                        <span>${shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <div class="summary-item">
                        <span>Tax (8%)</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div class="summary-item total">
                        <span>Grand Total</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div style="font-size: 12px; color: var(--text-muted); display:flex; align-items:center; gap:8px;">
                    <i data-lucide="shield-check" style="color:var(--color-primary); flex-shrink:0;"></i>
                    <span>Encrypted SSL Connection. Powered by mock Node.js backend.</span>
                </div>
            </div>
        </div>
    `;
    
    // Add form submit listener
    document.getElementById("checkout-form").addEventListener("submit", handleCheckoutSubmit);
    lucide.createIcons();
}

 async function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shipping = subtotal > 150 ? 0.00 : 15.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    const orderData = {
        id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
        date: new Date().toLocaleDateString(),
        user: state.currentUser ? state.currentUser.username : "guest",
        shippingDetails: {
            name: document.getElementById("ship-name").value,
            email: document.getElementById("ship-email").value,
            address: document.getElementById("ship-address").value,
            city: document.getElementById("ship-city").value,
            zip: document.getElementById("ship-zip").value
        },
        items: state.cart.map(item => ({
            id: item.product._id,
            name: item.product.name,
            qty: item.quantity,
            price: item.product.price
        })),
        total: total
    };

    try {
        // Create order via API
        const orderPayload = {
            products: state.cart.map(item => ({
                productId: item.product._id,
                quantity: item.quantity
            })),
            totalAmount: total
        };

        console.log("Sending order payload:", orderPayload);

        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            },
            body: JSON.stringify(orderPayload)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create order");
        }

        const createdOrder = await response.json();
        console.log("Order created successfully:", createdOrder);

        // Refresh user's orders
        if (state.currentUser) {
            const ordersResponse = await fetch(`${API_BASE_URL}/orders`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (ordersResponse.ok) {
                state.orders = await ordersResponse.json();
                console.log("Orders refreshed:", state.orders);
            }
        }

        // Clear Cart
        state.cart = [];
        saveCartState();
        renderCart();

        // Switch to Success page
        renderSuccessView(orderData);
        switchView("success");

    } catch (error) {
        console.error("Error during checkout:", error);
        showToast(`Checkout failed: ${error.message}`, "error");
    }
}

function renderSuccessView(order) {
    const container = document.getElementById("success-view");
    if (!container) return;
    
    container.innerHTML = `
        <div class="success-card">
            <div class="success-icon-container">
                <i data-lucide="check"></i>
            </div>
            <h1 class="success-title">Order Authorized!</h1>
            <p class="success-desc">Thank you for your purchase. Your order <span class="order-id">${order.id}</span> is being processed and will be shipped to your address shortly.</p>
            
            <div style="background:rgba(255,255,255,0.02); border:1px solid var(--border-color); border-radius:8px; padding:16px; margin: 24px 0; text-align:left;">
                <h4 style="margin-bottom:8px; font-family: var(--font-heading);">Delivery Summary</h4>
                <p style="font-size:14px; font-weight:600;">${order.shippingDetails.name}</p>
                <p style="font-size:13px; color:var(--text-muted);">${order.shippingDetails.address}, ${order.shippingDetails.city} - ${order.shippingDetails.zip}</p>
                <div style="display:flex; justify-content:space-between; margin-top:12px; border-top:1px dotted var(--border-color); padding-top:8px;">
                    <span style="font-size:14px; color:var(--text-muted)">Total Paid:</span>
                    <span style="font-size:14px; font-weight:800; color:var(--color-primary)">$${order.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div style="display:flex; justify-content:center; gap: var(--space-md);">
                <button class="btn btn-primary" onclick="switchView('products')">Continue Shopping</button>
                ${state.currentUser ? `<button class="btn btn-secondary" onclick="switchView('profile')">Track Order</button>` : ''}
            </div>
        </div>
    `;
    lucide.createIcons();
}

// User Profile & Order History Rendering
function renderProfileView() {
    const container = document.getElementById("profile-view");
    if (!container) return;
    
    if (!state.currentUser) {
        container.innerHTML = `<p>Please log in to view your profile.</p>`;
        return;
    }
    
    let ordersListHTML = "";
    if (state.orders.length === 0) {
        ordersListHTML = `
            <div style="text-align: center; padding: 40px; border:1px dashed var(--border-color); border-radius:12px; color:var(--text-muted)">
                <i data-lucide="package" style="width:36px; height:36px; opacity:0.4; margin-bottom:8px;"></i>
                <p>No past orders recorded yet.</p>
            </div>
        `;
    } else {
        ordersListHTML = state.orders.map(order => {
            const itemsRowsHTML = order.items.map(item => `
                <div class="order-item-row">
                    <span>${item.name} <span style="color:var(--text-muted)">x${item.qty}</span></span>
                    <span>$${(item.price * item.qty).toFixed(2)}</span>
                </div>
            `).join("");
            
            return `
                <div class="order-card">
                    <div class="order-header">
                        <div>Order ID: <span class="order-id">${order.id}</span></div>
                        <div class="order-date">${order.date}</div>
                    </div>
                    <div class="order-items-summary">
                        ${itemsRowsHTML}
                    </div>
                    <div class="order-footer">
                        <div class="order-status">
                            <span class="order-status-dot"></span>
                            In Transit
                        </div>
                        <div class="order-total">Total: $${order.total.toFixed(2)}</div>
                    </div>
                </div>
            `;
        }).join("");
    }
    
    // Reverse Golden Ratio layout: Left panel narrow (User stats), Right panel wide (Orders)
    container.innerHTML = `
        <div class="profile-grid">
            <!-- Left panel: Account info -->
            <div class="checkout-card" style="position:sticky; top:100px;">
                <div style="text-align:center; padding-bottom:var(--space-md); border-bottom:1px solid var(--border-color); margin-bottom:var(--space-md)">
                    <div style="width:70px; height:70px; border-radius:50%; background:linear-gradient(135deg, var(--color-primary), var(--color-secondary)); display:flex; align-items:center; justify-content:center; color:#000; font-size:28px; font-weight:800; margin:0 auto var(--space-sm); box-shadow:var(--neon-glow-primary)">
                        ${state.currentUser.fullName.charAt(0).toUpperCase()}
                    </div>
                    <h3 style="font-family:var(--font-heading); font-size:22px;">${state.currentUser.fullName}</h3>
                    <p style="color:var(--text-muted); font-size:14px;">@${state.currentUser.username}</p>
                </div>
                
                <div style="display:flex; flex-direction:column; gap:12px; font-size:14px; margin-bottom: var(--space-lg);">
                    <div style="display:flex; justify-content:space-between">
                        <span style="color:var(--text-muted)">Email</span>
                        <span style="font-weight:600">${state.currentUser.email}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between">
                        <span style="color:var(--text-muted)">Total Orders</span>
                        <span style="font-weight:600; color:var(--color-primary)">${state.orders.length}</span>
                    </div>
                </div>
                
                <button class="btn btn-secondary btn-full" id="profile-logout-btn">
                    <i data-lucide="log-out"></i> Log Out
                </button>
            </div>
            
            <!-- Right panel: Order history -->
            <div>
                <h2 style="font-family:var(--font-heading); margin-bottom: var(--space-lg);">Order History</h2>
                <div class="order-history-list">
                    ${ordersListHTML}
                </div>
            </div>
        </div>
    `;
    
    document.getElementById("profile-logout-btn").addEventListener("click", () => {
        handleLogout();
    });
    
    lucide.createIcons();
}

// Authentication Handlers
async function handleRegisterSubmit(e) {
    e.preventDefault();

    const fullName =
        document.getElementById("reg-name").value.trim();

    const username =
        document.getElementById("reg-username").value.trim();

    const email =
        document.getElementById("reg-email").value.trim();

    const password =
        document.getElementById("reg-password").value;

    try {

        const response = await fetch(
            "http://localhost:5000/api/auth/register",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    fullName,
                    username,
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message, "error");
            return;
        }

        showToast(
            "Registration Successful",
            "success"
        );

        closeModal("register-modal");

        e.target.reset();

    } catch (error) {
        console.error(error);
        showToast("Server Error", "error");
    }
}

async function handleLoginSubmit(e) {

    e.preventDefault();

    const email =
    document.getElementById("login-email").value.trim();

    const password =
    document.getElementById("login-password").value;

    try {

        const response =
        await fetch(
        "http://localhost:5000/api/auth/login",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })
        });

        const data =
        await response.json();

        if (!response.ok) {

            showToast(
            data.message,
            "error"
            );

            return;
        }

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        state.currentUser =
        data.user;
        const orderResponse = await fetch(
    "http://localhost:5000/api/orders",
    {
        headers: {
            Authorization: `Bearer ${data.token}`
        }
    }
);

if (orderResponse.ok) {
    state.orders = await orderResponse.json();
}

        updateNavUI();

        closeModal(
        "login-modal"
        );

        showToast(
        "Logged in successfully",
        "success"
        );

        e.target.reset();

    } catch (error) {

        console.log(error);

        showToast(
        "Server Error",
        "error"
        );
    }
}

function handleLogout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("store_cart");

    state.currentUser = null;
    state.orders = [];
    state.cart = [];

    updateNavUI();
    renderCart();

    showToast("Logged Out Successfully");
}

function updateNavUI() {
    const triggerContainer = document.getElementById("user-trigger-container");
    if (!triggerContainer) return;
    
    if (state.currentUser) {
        triggerContainer.innerHTML = `
            <div class="user-menu">
                <button class="user-trigger" id="user-trigger">
                    <i data-lucide="user" style="width:16px; height:16px; color:var(--color-primary)"></i>
                    <span>${state.currentUser.fullName.split(' ')[0]}</span>
                    <i data-lucide="chevron-down" style="width:14px; height:14px;"></i>
                </button>
                <div class="user-dropdown" id="user-dropdown">
                    <a href="#" data-view-target="profile"><i data-lucide="package" style="width:14px; height:14px;"></i> Orders & Profile</a>
                    <button id="logout-btn" style="color:var(--color-accent)"><i data-lucide="log-out" style="width:14px; height:14px;"></i> Log Out</button>
                </div>
            </div>
        `;
    } else {
        triggerContainer.innerHTML = `
            <button class="btn btn-secondary" onclick="openModal('login-modal')" style="padding: 8px 18px; border-radius: 20px; font-size: 14px;">
                <i data-lucide="log-in" style="width:14px; height:14px;"></i> Log In
            </button>
        `;
    }
    
    // Reattach dynamic dropdown listeners since we redrew them
    const userTrigger = document.getElementById("user-trigger");
    const userDropdown = document.getElementById("user-dropdown");
    if (userTrigger) {
        userTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle("show");
        });
    }
    
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Add view listeners on dropdown elements
    document.querySelectorAll("[data-view-target]").forEach(element => {
        element.removeEventListener("click", handleViewNavClick);
        element.addEventListener("click", handleViewNavClick);
    });
    
    lucide.createIcons();
}

function handleViewNavClick(e) {
    e.preventDefault();
    const target = e.currentTarget.getAttribute("data-view-target");
    switchView(target);
}

// Modal Helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add("show");
    modal.style.display = "flex";
    modal.style.opacity = "1";
    modal.style.visibility = "visible";
    modal.style.pointerEvents = "auto";
    document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove("show");
    modal.style.display = "none";
    modal.style.opacity = "0";
    modal.style.visibility = "hidden";
    modal.style.pointerEvents = "none";
    document.body.style.overflow = "";
}

// Toast Controller
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let iconName = "info";
    if (type === "success") iconName = "check-circle-2";
    if (type === "error") iconName = "alert-circle";
    
    toast.innerHTML = `
        <span class="toast-icon"><i data-lucide="${iconName}"></i></span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();
    
    // Slide out and remove
    setTimeout(() => {
        toast.style.animation = "slideInToast 0.3s ease reverse forwards";
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// FAQ Data & Render Logic
const FAQ_DATABASE = [
    {
        question: "How long does shipping take?",
        answer: "Simulated shipping takes 2-4 business days. Real-world shipping depends on backend integration."
    },
    {
        question: "Can I customize the LED light mappings?",
        answer: "Yes! All products are compatible with the Aetheris RGB SDK. You can write custom animations in JavaScript or load layout presets."
    },
    {
        question: "Is payment secure?",
        answer: "Our frontend uses secure SSL mocks. Once linked to your Node.js backend, you can connect Stripe or PayPal."
    },
    {
        question: "What is your return policy?",
        answer: "We offer a 30-day trial on all holographic and mechanical gear."
    },
    {
        question: "Do they support Bluetooth?",
        answer: "Most of our hardware (Spectra keyboard, Aether headphones, Iris visor) comes with dual Bluetooth 5.2/5.3 and wired options."
    }
];

function renderFAQ(searchFilter = "") {
    const container = document.getElementById("faq-accordion-container");
    if (!container) return;
    
    const filteredFAQ = FAQ_DATABASE.filter(item => 
        item.question.toLowerCase().includes(searchFilter.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchFilter.toLowerCase())
    );
    
    if (filteredFAQ.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">No FAQ questions found matching your query.</p>`;
        return;
    }
    
    container.innerHTML = filteredFAQ.map((item, idx) => `
        <div class="faq-item" id="faq-${idx}">
            <button class="faq-header" onclick="toggleFAQItem('faq-${idx}')">
                <span>${item.question}</span>
                <i data-lucide="chevron-down" class="faq-icon"></i>
            </button>
            <div class="faq-body">
                <p>${item.answer}</p>
            </div>
        </div>
    `).join("");
    
    lucide.createIcons();
}

function toggleFAQItem(itemId) {
    const item = document.getElementById(itemId);
    if (!item) return;
    
    const isActive = item.classList.contains("active");
    
    // Close other FAQ items
    document.querySelectorAll(".faq-item").forEach(el => {
        el.classList.remove("active");
    });
    
    if (!isActive) {
        item.classList.add("active");
    }
}

// Full-Page Cart Render Logic
function renderCartPageView() {
    const itemsContainer = document.getElementById("cart-page-items-container");
    if (!itemsContainer) return;
    
    if (state.cart.length === 0) {
        itemsContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <i data-lucide="shopping-bag" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5; margin-left: auto; margin-right: auto;"></i>
                <p>Your shopping cart is empty</p>
                <button class="btn btn-primary" style="margin-top: 16px;" onclick="switchView('products')">Continue Shopping</button>
            </div>
        `;
        document.getElementById("cart-page-checkout-btn").disabled = true;
        document.getElementById("cart-page-subtotal").textContent = "$0.00";
        document.getElementById("cart-page-shipping").textContent = "$0.00";
        document.getElementById("cart-page-tax").textContent = "$0.00";
        document.getElementById("cart-page-total").textContent = "$0.00";
        lucide.createIcons();
        return;
    }
    
    document.getElementById("cart-page-checkout-btn").disabled = false;
    
    itemsContainer.innerHTML = state.cart.map(item => `
        <div class="cart-item" style="margin-bottom: var(--space-md); padding: var(--space-md); flex-direction: row; align-items: center;">
            <img class="cart-item-img" src="${item.product.image}" alt="${item.product.name}" style="width: 90px; height: 90px; border-radius: 12px;">
            <div class="cart-item-info" style="gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <h3 class="cart-item-title" style="font-size: 18px; max-width: 250px;">${item.product.name}</h3>
                    <button class="cart-item-remove" onclick="removeFromCartPage('${item.product._id}')" style="position: static; padding: 0;">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div style="color: var(--text-muted); font-size: 13px;">Category: ${item.product.category}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateCartPageQty('${item.product._id}', -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="updateCartPageQty('${item.product._id}', 1)">+</button>
                    </div>
                    <div class="cart-item-price" style="font-size: 18px;">$${(item.product.price * item.quantity).toFixed(2)}</div>
                </div>
            </div>
        </div>
    `).join("");
    
    calculateAndRenderCartPageTotals();
    lucide.createIcons();
}

function calculateAndRenderCartPageTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const discount = subtotal * state.appliedDiscount;
    const discountedSubtotal = subtotal - discount;
    const shipping = discountedSubtotal > 150 ? 0.00 : 15.00;
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + shipping + tax;
    
    document.getElementById("cart-page-subtotal").innerHTML = state.appliedDiscount > 0 ? 
        `<span style="text-decoration: line-through; color: var(--text-muted); font-size:13px; margin-right:8px;">$${subtotal.toFixed(2)}</span> $${discountedSubtotal.toFixed(2)}` : 
        `$${subtotal.toFixed(2)}`;
        
    document.getElementById("cart-page-shipping").textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
    document.getElementById("cart-page-tax").textContent = `$${tax.toFixed(2)}`;
    document.getElementById("cart-page-total").textContent = `$${total.toFixed(2)}`;
}

function updateCartPageQty(productId, delta) {
    updateCartQty(productId, delta);
    renderCartPageView();
}

// Proxy for removing from page
function removeFromCartPage(productId) {
    removeFromCart(productId);
    renderCartPageView();
}

// Promo code handler
function applyPromoCode() {
    const codeInput = document.getElementById("promo-code");
    if (!codeInput) return;
    
    const code = codeInput.value.trim().toUpperCase();
    if (code === "AETHER10") {
        state.promoCode = code;
        state.appliedDiscount = 0.10; // 10% off
        showToast("Coupon Applied! 10% Discount", "success");
        calculateAndRenderCartPageTotals();
    } else if (code === "") {
        showToast("Please enter a code", "error");
    } else {
        showToast("Invalid promo code", "error");
    }
}
