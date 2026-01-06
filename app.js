// Adaptive e-commerce demo
// Session-only state (no cookies / no server storage)

document.addEventListener("DOMContentLoaded", function () {
  const body = document.body;

  // --- DOM references ---

  const appRoot = document.getElementById("app");

  // Header / navigation
  const navCatalogueBtn = document.getElementById("nav-catalogue");
  const openSearchBtn = document.getElementById("open-search");
  const searchSection = document.getElementById("search-section");
  const searchInput = document.getElementById("search-input");
  const scrollToProductsBtn = document.getElementById("scroll-to-products");

  // Cart
  const cartOpenBtn = document.getElementById("cart-open");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartCloseBtn = document.getElementById("cart-close");
  const cartItemsEl = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartClearBtn = document.getElementById("cart-clear");
  const cartCheckoutBtn = document.getElementById("cart-checkout");
  const cartCountBadge = document.getElementById("cart-count");

  // Filters
  const filterCategorySelect = document.getElementById("filter-category");
  const filterPowerSelect = document.getElementById("filter-power");
  const filterPriceSelect = document.getElementById("filter-price");
  const filtersResetBtn = document.getElementById("filters-reset");
  const catalogueSection = document.getElementById("catalogue");

  // Config drawer
  const configToggleBtn = document.getElementById("config-toggle");
  const configDrawer = document.getElementById("config-drawer");
  const configCloseBtn = document.getElementById("config-close");
  const cfgTheme = document.getElementById("cfg-theme");
  const cfgDensity = document.getElementById("cfg-density");
  const cfgColumns = document.getElementById("cfg-columns");
  const cfgReading = document.getElementById("cfg-reading");
  const cfgDyslexic = document.getElementById("cfg-dyslexic");
  const cfgCursor = document.getElementById("cfg-cursor");
  const cfgApply = document.getElementById("cfg-apply");
  const cfgOpenOnboarding = document.getElementById("cfg-open-onboarding");
  const cfgSummary = document.getElementById("config-summary");
  const cfgColumnsHint = document.getElementById("cfg-columns-hint");

  // Onboarding popup
  const onboardingBackdrop = document.getElementById("onboarding-backdrop");
  const onboardingForm = document.getElementById("onboarding-form");
  const onboardingSkipBtn = document.getElementById("onboarding-skip");
  const onboardingStartBtn = document.getElementById("onboarding-start");
  const onboardingReading = document.getElementById("onboarding-reading");
  const onboardingDyslexic = document.getElementById("onboarding-dyslexic");

  // Carousel
  const carouselTrack = document.querySelector(".carousel-track");
  const carouselPrevBtn = document.getElementById("carousel-prev");
  const carouselNextBtn = document.getElementById("carousel-next");
  const carouselToggleBtn = document.getElementById("carousel-toggle");
  const announceBar = document.getElementById("announce-bar");

  // Cursor ring
  let cursorRingEl = null;
  let cursorMoveHandler = null;

  // Carousel state
  let carouselIndex = 0;
  let carouselAutoplayTimer = null;

  // --- State & storage ---

  const STORAGE_KEY = "adaptiveShop_state_v4";

  const defaultState = {
    search: "",
    cart: [],
    filterCategory: "any",
    filterPower: "any",
    filterPrice: "any",
    sort: "featured",
    ui: {
      theme: body.classList.contains("theme-colorful")
        ? "theme-colorful"
        : body.classList.contains("theme-light")
        ? "theme-light"
        : "theme-dark",
      density: body.classList.contains("layout-compact")
        ? "layout-compact"
        : "layout-spacious",
      maxColumns: 3,
      readingMode: false,
      dyslexicMode: false,
      cursorHighlight: false,
      preset: "focus",
      autoplay: true
    }
  };

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return JSON.parse(JSON.stringify(defaultState));
      }
      const parsed = JSON.parse(raw);
      const state = JSON.parse(JSON.stringify(defaultState));

      if (typeof parsed.search === "string") state.search = parsed.search;
      if (Array.isArray(parsed.cart)) state.cart = parsed.cart;
      if (typeof parsed.filterCategory === "string")
        state.filterCategory = parsed.filterCategory;
      if (typeof parsed.filterPower === "string")
        state.filterPower = parsed.filterPower;
      if (typeof parsed.filterPrice === "string")
        state.filterPrice = parsed.filterPrice;
      if (typeof parsed.sort === "string") state.sort = parsed.sort;

      if (parsed.ui && typeof parsed.ui === "object") {
        state.ui = Object.assign({}, state.ui, parsed.ui);
      }

      return state;
    } catch {
      return JSON.parse(JSON.stringify(defaultState));
    }
  }

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // sessionStorage might be blocked; ignore
    }
  }

  let state = loadState();

  // --- Products data ---

  const PRODUCTS = [
    {
      id: "p1",
      title: "Noise-Canceling Headphones",
      desc: "Focus on your work while the outside world fades away.",
      price: 129,
      category: "Audio",
      power: "battery",
      image:
        "https://images.pexels.com/photos/373945/pexels-photo-373945.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: "p2",
      title: "Mechanical Keyboard",
      desc: "Low-profile keys with a satisfying but quiet click.",
      price: 89,
      category: "Accessories",
      power: "electric",
      image:
        "https://images.pexels.com/photos/4612460/pexels-photo-4612460.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: "p3",
      title: "Wireless Mouse",
      desc: "Comfortable shape, precise sensor, long battery life.",
      price: 49,
      category: "Accessories",
      power: "battery",
      image:
        "https://images.pexels.com/photos/2265487/pexels-photo-2265487.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: "p4",
      title: "OLED Smartphone",
      desc: "A bright screen that makes dark mode look great.",
      price: 699,
      category: "Phones",
      power: "battery",
      image:
        "https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: "p5",
      title: "Smartwatch",
      desc: "Subtle notifications and step tracking on your wrist.",
      price: 199,
      category: "Wearables",
      power: "battery",
      image:
        "https://images.pexels.com/photos/2774065/pexels-photo-2774065.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: "p6",
      title: "Ultralight Laptop",
      desc: "Portable power for design, code, and browsing.",
      price: 999,
      category: "Computers",
      power: "electric",
      image:
        "https://images.pexels.com/photos/789822/pexels-photo-789822.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: "p7",
      title: "Mirrorless Camera",
      desc: "Capture your products and projects in sharp detail.",
      price: 899,
      category: "Cameras",
      power: "battery",
      image:
        "https://images.pexels.com/photos/274973/pexels-photo-274973.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: "p8",
      title: "Gaming Headset",
      desc: "Directional sound and a clear microphone for calls.",
      price: 119,
      category: "Gaming",
      power: "electric",
      image:
        "https://images.pexels.com/photos/845434/pexels-photo-845434.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: "p9",
      title: "Smart Desk Lamp",
      desc: "Adjustable brightness to match your workspace.",
      price: 59,
      category: "Home",
      power: "electric",
      image:
        "https://images.pexels.com/photos/842950/pexels-photo-842950.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: "p10",
      title: "LED Strip Lights",
      desc: "Add soft background glow behind your monitor.",
      price: 39,
      category: "Home",
      power: "electric",
      image:
        "https://images.pexels.com/photos/1248583/pexels-photo-1248583.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: "p11",
      title: '27" IPS Monitor',
      desc: "Clear, colour-accurate display for work and play.",
      price: 249,
      category: "Displays",
      power: "electric",
      image:
        "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800"
    },
    {
      id: "p12",
      title: "Adjustable Laptop Stand",
      desc: "Raise your laptop to eye level for better posture.",
      price: 39,
      category: "Accessories",
      power: "manual",
      image:
        "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800"
    }
  ];

  // --- Helpers ---

  function formatPrice(value) {
    return "€" + value.toFixed(2);
  }

  function findProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
  }

  function getFilteredProducts() {
    const q = (state.search || "").trim().toLowerCase();
    let items = PRODUCTS.slice();

    if (q) {
      items = items.filter(function (p) {
        const text =
          (p.title + " " + p.desc + " " + p.category).toLowerCase();
        return text.indexOf(q) !== -1;
      });
    }

    if (state.filterCategory && state.filterCategory !== "any") {
      items = items.filter(function (p) {
        return p.category === state.filterCategory;
      });
    }

    if (state.filterPower && state.filterPower !== "any") {
      items = items.filter(function (p) {
        return p.power === state.filterPower;
      });
    }

    if (state.filterPrice && state.filterPrice !== "any") {
      items = items.filter(function (p) {
        if (state.filterPrice === "under-50") return p.price < 50;
        if (state.filterPrice === "50-200")
          return p.price >= 50 && p.price <= 200;
        if (state.filterPrice === "200-plus") return p.price > 200;
        return true;
      });
    }

    if (state.sort === "price-asc") {
      items.sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (state.sort === "price-desc") {
      items.sort(function (a, b) {
        return b.price - a.price;
      });
    } else if (state.sort === "category") {
      items.sort(function (a, b) {
        if (a.category === b.category) {
          return a.title.localeCompare(b.title);
        }
        return a.category.localeCompare(b.category);
      });
    }
    return items;
  }

  // --- Catalogue rendering ---

  function renderCatalogue() {
    if (!appRoot) return;

    const products = getFilteredProducts();
    appRoot.innerHTML = "";

    const wrapper = document.createElement("section");
    wrapper.className = "catalogue-section card-shell";

    const header = document.createElement("div");
    header.className = "section-header";
    header.innerHTML =
      '<div>' +
      '<h2 class="section-title">Catalogue</h2>' +
      '<p class="section-subtitle">' +
      (state.search
        ? "Filtered view of items that match your search and filters."
        : "Browse everything available in this demo shop.") +
      "</p>" +
      "</div>" +
      '<div class="section-controls">' +
      '<span class="small-hint">' +
      products.length +
      " item" +
      (products.length === 1 ? "" : "s") +
      "</span>" +
      '<label class="visually-hidden" for="sort-select">Sort products</label>' +
      '<select id="sort-select">' +
      '<option value="featured">Featured order</option>' +
      '<option value="category">Category (A–Z)</option>' +
      '<option value="price-asc">Price: Low to High</option>' +
      '<option value="price-desc">Price: High to Low</option>' +
      "</select>" +
      "</div>";

    wrapper.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "product-grid";

    products.forEach(function (p) {
      const card = document.createElement("article");
      card.className = "product-card";
      card.setAttribute("data-product-id", p.id);
      card.innerHTML =
        '<img src="' +
        p.image +
        '" alt="' +
        p.title +
        '" class="product-image" />' +
        '<h3 class="product-title">' +
        p.title +
        "</h3>" +
        '<p class="product-desc small-hint">' +
        p.desc +
        "</p>" +
        '<div class="product-footer">' +
        '<span class="price">' +
        formatPrice(p.price) +
        "</span>" +
        '<button class="btn small primary" type="button" data-add-id="' +
        p.id +
        '">Add to cart</button>' +
        "</div>";
      grid.appendChild(card);
    });

    wrapper.appendChild(grid);
    appRoot.appendChild(wrapper);

    const sortSelect = wrapper.querySelector("#sort-select");
    if (sortSelect) {
      sortSelect.value = state.sort || "featured";
      sortSelect.addEventListener("change", function (e) {
        state.sort = e.target.value || "featured";
        saveState();
        renderCatalogue();
      });
    }
  }

  // --- Cart helpers ---

  function getCartEntry(id) {
    for (var i = 0; i < state.cart.length; i++) {
      if (state.cart[i].id === id) return state.cart[i];
    }
    return null;
  }

  function addToCart(id) {
    const product = findProduct(id);
    if (!product) return;

    const existing = getCartEntry(id);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({ id: id, qty: 1 });
    }
    saveState();
    updateCartUI();
  }

  function updateCartQty(id, delta) {
    const entry = getCartEntry(id);
    if (!entry) return;
    entry.qty += delta;
    if (entry.qty <= 0) {
      state.cart = state.cart.filter(function (item) {
        return item.id !== id;
      });
    }
    saveState();
    updateCartUI();
  }

  function clearCart() {
    state.cart = [];
    saveState();
    updateCartUI();
  }

  function updateCartUI() {
    if (cartCountBadge) {
      const count = state.cart.reduce(function (sum, item) {
        return sum + (item.qty || 0);
      }, 0);
      cartCountBadge.textContent = String(count);
    }

    if (!cartItemsEl || !cartTotalEl) return;

    cartItemsEl.innerHTML = "";
    if (state.cart.length === 0) {
      cartItemsEl.innerHTML =
        '<p class="small-hint">Your cart is empty.</p>';
      cartTotalEl.textContent = formatPrice(0);
      if (cartCheckoutBtn) {
        cartCheckoutBtn.disabled = true;
      }
      return;
    }

    let total = 0;
    state.cart.forEach(function (entry) {
      const product = findProduct(entry.id);
      if (!product) return;
      total += product.price * entry.qty;

      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML =
        '<img src="' +
        product.image +
        '" alt="' +
        product.title +
        '" class="cart-thumb" />' +
        '<div class="cart-meta">' +
        "<h4>" +
        product.title +
        "</h4>" +
        '<span>' +
        formatPrice(product.price) +
        " · " +
        product.category +
        "</span>" +
        "</div>" +
        '<div class="cart-qty">' +
        '<button type="button" class="qty-btn" data-id="' +
        product.id +
        '" data-action="dec">−</button>' +
        "<span>" +
        entry.qty +
        "</span>" +
        '<button type="button" class="qty-btn" data-id="' +
        product.id +
        '" data-action="inc">+</button>' +
        "</div>";
      cartItemsEl.appendChild(row);
    });

    cartTotalEl.textContent = formatPrice(total);
    if (cartCheckoutBtn) {
      cartCheckoutBtn.disabled = total <= 0;
    }
  }

  function openCart() {
    if (!cartOverlay) return;
    cartOverlay.classList.remove("hidden");
    cartOverlay.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    if (!cartOverlay) return;
    cartOverlay.classList.add("hidden");
    cartOverlay.setAttribute("aria-hidden", "true");
  }

  // --- UI helpers / presets ---

  function enableCursorRing() {
    if (cursorRingEl) return;
    cursorRingEl = document.createElement("div");
    cursorRingEl.className = "cursor-ring";
    document.body.appendChild(cursorRingEl);

    cursorMoveHandler = function (event) {
      cursorRingEl.style.left = event.clientX + "px";
      cursorRingEl.style.top = event.clientY + "px";
    };
    document.addEventListener("mousemove", cursorMoveHandler);
  }

  function disableCursorRing() {
    if (!cursorRingEl) return;
    document.removeEventListener("mousemove", cursorMoveHandler);
    cursorMoveHandler = null;
    cursorRingEl.parentNode.removeChild(cursorRingEl);
    cursorRingEl = null;
  }

  function clearPresetClasses() {
    const presetClasses = [
      "preset-focus",
      "preset-minimal",
      "preset-colorful",
      "preset-calm",
      "preset-touch",
      "preset-power",
      "preset-senior",
      "preset-retail",
      "preset-mono",
      "low-motion"
    ];
    presetClasses.forEach(function (cls) {
      body.classList.remove(cls);
    });
  }

  function applyUiState() {
    const themeClasses = ["theme-light", "theme-dark", "theme-colorful"];
    themeClasses.forEach(function (cls) {
      body.classList.remove(cls);
    });
    body.classList.remove(
      "layout-spacious",
      "layout-compact",
      "reading-mode",
      "dyslexic-mode",
      "cursor-highlight",
      "mode-mono",
      "cols-2",
      "cols-3"
    );
    clearPresetClasses();

    // Theme
    if (state.ui.preset === "mono") {
      body.classList.add("mode-mono");
      body.classList.add("theme-dark");
    } else if (state.ui.theme) {
      body.classList.add(state.ui.theme);
    }

    // Density
    if (state.ui.density) {
      body.classList.add(state.ui.density);
    }

    // Reading / dyslexic / cursor
    if (state.ui.readingMode) {
      body.classList.add("reading-mode");
    }

    if (state.ui.dyslexicMode) {
      body.classList.add("dyslexic-mode");
    }

    if (state.ui.cursorHighlight) {
      body.classList.add("cursor-highlight");
      enableCursorRing();
    } else {
      body.classList.remove("cursor-highlight");
      disableCursorRing();
    }

    // Columns
    if (state.ui.maxColumns === 2) {
      body.classList.add("cols-2");
    } else {
      body.classList.add("cols-3");
    }

    // Per-preset layout classes (none for grid – so it can't touch rest layout)
    switch (state.ui.preset) {
      case "focus":
        body.classList.add("preset-focus");
        break;
      case "minimal":
        body.classList.add("preset-minimal");
        break;
      case "colorful":
        body.classList.add("preset-colorful");
        break;
      case "calm":
        body.classList.add("preset-calm", "low-motion");
        break;
      case "touch":
        body.classList.add("preset-touch");
        break;
      case "power":
        body.classList.add("preset-power");
        break;
      case "senior":
        body.classList.add("preset-senior", "low-motion");
        break;
      case "retail":
        body.classList.add("preset-retail");
        break;
      case "mono":
        body.classList.add("preset-mono");
        break;
      case "grid":
        // intentionally no preset-grid class; grid is columns-only
        break;
      default:
        break;
    }

    updateConfigControlsFromState();
    refreshCarouselAutoplay();
  }

  function updateConfigControlsFromState() {
    if (cfgTheme) {
      cfgTheme.value = state.ui.theme || "theme-light";
    }
    if (cfgDensity) {
      cfgDensity.value = state.ui.density || "layout-spacious";
    }
    if (cfgColumns) {
      cfgColumns.value = String(state.ui.maxColumns || 3);
    }
    if (cfgReading) {
      cfgReading.checked = !!state.ui.readingMode;
    }
    if (cfgDyslexic) {
      cfgDyslexic.checked = !!state.ui.dyslexicMode;
    }
    if (cfgCursor) {
      cfgCursor.checked = !!state.ui.cursorHighlight;
    }

    if (cfgSummary) {
      var summary =
        "Theme: " +
        (state.ui.preset === "mono"
          ? "High contrast"
          : state.ui.theme === "theme-light"
          ? "Light"
          : state.ui.theme === "theme-colorful"
          ? "Colorful"
          : "Dark") +
        " · Density: " +
        (state.ui.density === "layout-compact" ? "Compact" : "Spacious") +
        " · Columns: " +
        state.ui.maxColumns +
        " · Reading mode: " +
        (state.ui.readingMode ? "on" : "off");
      cfgSummary.textContent = summary;
    }

    if (cfgColumnsHint) {
      if (state.ui.preset !== "custom") {
        cfgColumnsHint.textContent =
          "Preset “" +
          state.ui.preset +
          "” controls layout. Choose Custom in popup to fully unlock.";
      } else {
        cfgColumnsHint.textContent = "";
      }
    }

    if (state.ui.preset !== "custom") {
      if (cfgColumns) cfgColumns.disabled = true;
      if (cfgDensity) cfgDensity.disabled = true;
    } else {
      if (cfgColumns) cfgColumns.disabled = false;
      if (cfgDensity) cfgDensity.disabled = false;
    }
  }

  function applyPreset(presetName) {
    state.ui.preset = presetName;

    // Reset some toggles to a known baseline first
    state.ui.cursorHighlight = false;
    state.ui.readingMode = false;
    state.ui.dyslexicMode = false;

    if (presetName === "focus") {
      state.ui.theme = "theme-dark";
      state.ui.density = "layout-spacious";
      state.ui.maxColumns = 2;
      state.ui.autoplay = true;
      state.ui.cursorHighlight = true;
    } else if (presetName === "grid") {
      // GRID PRESET: only affect catalogue items & cards (columns / reading mode)
      state.ui.maxColumns = 3;
      state.ui.readingMode = false;
      // leave theme, density, autoplay exactly as they were
    } else if (presetName === "minimal") {
      state.ui.theme = "theme-light";
      state.ui.density = "layout-spacious";
      state.ui.maxColumns = 2;
      state.ui.autoplay = false;
      state.ui.readingMode = true;
    } else if (presetName === "colorful") {
      state.ui.theme = "theme-colorful";
      state.ui.density = "layout-compact";
      state.ui.maxColumns = 3;
      state.ui.autoplay = true;
    } else if (presetName === "calm") {
      state.ui.theme = "theme-dark";
      state.ui.density = "layout-spacious";
      state.ui.maxColumns = 2;
      state.ui.autoplay = false;
      state.ui.readingMode = true;
    } else if (presetName === "touch") {
      state.ui.theme = "theme-light";
      state.ui.density = "layout-spacious";
      state.ui.maxColumns = 2;
      state.ui.autoplay = true;
    } else if (presetName === "power") {
      state.ui.theme = "theme-light";
      state.ui.density = "layout-compact";
      state.ui.maxColumns = 3;
      state.ui.autoplay = true;
    } else if (presetName === "senior") {
      state.ui.theme = "theme-light";
      state.ui.density = "layout-spacious";
      state.ui.maxColumns = 2;
      state.ui.autoplay = false;
      state.ui.readingMode = true;
      state.ui.dyslexicMode = true;
    } else if (presetName === "retail") {
      state.ui.theme = "theme-colorful";
      state.ui.density = "layout-compact";
      state.ui.maxColumns = 3;
      state.ui.autoplay = true;
    } else if (presetName === "mono") {
      state.ui.theme = "theme-dark";
      state.ui.density = "layout-spacious";
      state.ui.maxColumns = 2;
      state.ui.autoplay = true;
    } else if (presetName === "custom") {
      // no-op; user will tweak via panel
    }

    saveState();
    applyUiState();
  }

  // --- Carousel logic ---

  function getCarouselSlides() {
    if (!carouselTrack) return [];
    return Array.prototype.slice.call(
      carouselTrack.querySelectorAll(".carousel-slide")
    );
  }

  function updateCarouselPosition() {
    const slides = getCarouselSlides();
    const count = slides.length;
    if (!carouselTrack || count === 0) return;

    if (carouselIndex < 0) carouselIndex = count - 1;
    if (carouselIndex >= count) carouselIndex = 0;

    const offset = -carouselIndex * 100;
    carouselTrack.style.transform = "translateX(" + offset + "%)";
  }

  function nextSlide() {
    carouselIndex += 1;
    updateCarouselPosition();
  }

  function prevSlide() {
    carouselIndex -= 1;
    updateCarouselPosition();
  }

  function clearCarouselTimer() {
    if (carouselAutoplayTimer != null) {
      window.clearInterval(carouselAutoplayTimer);
      carouselAutoplayTimer = null;
    }
  }

  function refreshCarouselAutoplay() {
    clearCarouselTimer();

    if (!carouselToggleBtn) return;

    if (state.ui.preset === "minimal") {
      // Minimal preset: no autoplay at all
      carouselToggleBtn.disabled = true;
      carouselToggleBtn.setAttribute("aria-disabled", "true");
      carouselToggleBtn.setAttribute("aria-pressed", "false");
      carouselToggleBtn.textContent = "▶";
      if (announceBar) {
        announceBar.classList.remove("announce-scroll");
      }
      return;
    }

    carouselToggleBtn.disabled = false;
    carouselToggleBtn.removeAttribute("aria-disabled");

    if (state.ui.autoplay) {
      carouselToggleBtn.setAttribute("aria-pressed", "true");
      carouselToggleBtn.textContent = "⏸";
      if (announceBar) {
        announceBar.classList.add("announce-scroll");
      }
      carouselAutoplayTimer = window.setInterval(function () {
        nextSlide();
      }, 6000);
    } else {
      carouselToggleBtn.setAttribute("aria-pressed", "false");
      carouselToggleBtn.textContent = "▶";
      if (announceBar) {
        announceBar.classList.remove("announce-scroll");
      }
    }
  }

  function toggleCarouselAutoplay() {
    if (state.ui.preset === "minimal") {
      return;
    }
    state.ui.autoplay = !state.ui.autoplay;
    saveState();
    refreshCarouselAutoplay();
  }

  // --- Filters & search sync ---

  function syncFilterControlsFromState() {
    if (filterCategorySelect) {
      filterCategorySelect.value = state.filterCategory || "any";
    }
    if (filterPowerSelect) {
      filterPowerSelect.value = state.filterPower || "any";
    }
    if (filterPriceSelect) {
      filterPriceSelect.value = state.filterPrice || "any";
    }
  }

  // --- Onboarding popup controls ---

  function hideOnboarding() {
    if (!onboardingBackdrop) return;
    onboardingBackdrop.classList.add("hidden");
    onboardingBackdrop.setAttribute("aria-hidden", "true");
  }

  function showOnboarding() {
    if (!onboardingBackdrop) return;
    onboardingBackdrop.classList.remove("hidden");
    onboardingBackdrop.setAttribute("aria-hidden", "false");
  }

  function handleOnboardingFinish() {
    if (!onboardingForm) {
      hideOnboarding();
      return;
    }
    const checked = onboardingForm.querySelector(
      'input[name="preset"]:checked'
    );
    const presetValue = checked ? checked.value : "focus";

    applyPreset(presetValue);

    const gridLikePresets = ["grid", "power", "retail"];

    if (onboardingReading && onboardingReading.checked) {
      if (gridLikePresets.indexOf(presetValue) === -1) {
        state.ui.readingMode = true;
      }
    }

    if (onboardingDyslexic) {
      state.ui.dyslexicMode =
        onboardingDyslexic.checked || state.ui.dyslexicMode;
    }

    saveState();
    applyUiState();
    hideOnboarding();
  }

  // --- Hash-based navigation (categories / products) ---

  function handleHashNavigation() {
    const hash = window.location.hash || "";
    if (!hash) return;

    if (hash.indexOf("#category:") === 0) {
      const raw = decodeURIComponent(hash.slice(10));
      if (raw) {
        state.filterCategory = raw;
        saveState();
        syncFilterControlsFromState();
        renderCatalogue();
        if (catalogueSection) {
          catalogueSection.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else if (hash === "#catalogue") {
      if (catalogueSection) {
        catalogueSection.scrollIntoView({ behavior: "smooth" });
      }
    } else if (hash.indexOf("#product:") === 0) {
      const id = hash.slice(9);
      if (id) {
        openProductModal(id);
      }
    }
  }

  // --- Quick view modal ---

  function openProductModal(productId) {
    const product = findProduct(productId);
    if (!product) return;

    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    backdrop.innerHTML =
      '<div class="modal-card" role="dialog" aria-modal="true">' +
      '<div class="modal-grid">' +
      '<div>' +
      '<img src="' +
      product.image +
      '" alt="' +
      product.title +
      '" />' +
      "</div>" +
      "<div>" +
      "<h2>" +
      product.title +
      "</h2>" +
      '<p class="small-hint">' +
      product.desc +
      "</p>" +
      "<p><strong>" +
      formatPrice(product.price) +
      "</strong></p>" +
      '<div style="display:flex;gap:0.5rem;margin-top:0.5rem;flex-wrap:wrap;">' +
      '<button type="button" class="btn primary" data-modal-add-id="' +
      product.id +
      '">Add to cart</button>' +
      '<button type="button" class="btn ghost small" data-modal-close="1">Close</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";

    function closeModal() {
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
      if (window.location.hash.indexOf("#product:") === 0) {
        history.replaceState(
          "",
          document.title,
          window.location.pathname + window.location.search
        );
      }
    }

    backdrop.addEventListener("click", function (e) {
      const target = e.target;
      if (
        target.getAttribute &&
        target.getAttribute("data-modal-close") === "1"
      ) {
        closeModal();
        return;
      }
      if (target === backdrop) {
        closeModal();
        return;
      }
      const addBtn = target.closest
        ? target.closest("[data-modal-add-id]")
        : null;
      if (addBtn) {
        const id = addBtn.getAttribute("data-modal-add-id");
        if (id) {
          addToCart(id);
        }
        closeModal();
      }
    });

    document.body.appendChild(backdrop);
  }

  // --- Event wiring ---

  // Live search
  if (searchInput) {
    searchInput.value = state.search || "";
    searchInput.addEventListener("input", function (e) {
      state.search = e.target.value || "";
      saveState();
      renderCatalogue();
    });
  }

  // Show / hide search bar
  if (openSearchBtn && searchSection) {
    openSearchBtn.addEventListener("click", function () {
      const isHidden = searchSection.classList.contains("hidden");
      searchSection.classList.toggle("hidden", !isHidden);
      if (isHidden && searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  // Scroll to catalogue
  if (scrollToProductsBtn && catalogueSection) {
    scrollToProductsBtn.addEventListener("click", function () {
      catalogueSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Nav catalogue button (smooth scroll)
  if (navCatalogueBtn && catalogueSection) {
    navCatalogueBtn.addEventListener("click", function (e) {
      e.preventDefault();
      catalogueSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Catalogue "Add to cart" & quick view
  if (appRoot) {
    appRoot.addEventListener("click", function (e) {
      const target = e.target;

      const addBtn =
        target && target.closest
          ? target.closest("[data-add-id]")
          : null;
      if (addBtn) {
        const id = addBtn.getAttribute("data-add-id");
        if (id) addToCart(id);
        return;
      }

      const card =
        target && target.closest
          ? target.closest(".product-card")
          : null;
      if (card && card.getAttribute("data-product-id")) {
        const productId = card.getAttribute("data-product-id");
        openProductModal(productId);
      }
    });
  }

  // Cart open / close
  if (cartOpenBtn) {
    cartOpenBtn.addEventListener("click", openCart);
  }
  if (cartCloseBtn) {
    cartCloseBtn.addEventListener("click", closeCart);
  }
  if (cartOverlay) {
    cartOverlay.addEventListener("click", function (e) {
      if (e.target === cartOverlay) {
        closeCart();
      }
    });
  }

  // Cart quantity controls
  if (cartItemsEl) {
    cartItemsEl.addEventListener("click", function (e) {
      const target = e.target;
      const btn =
        target && target.closest ? target.closest(".qty-btn") : null;
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");
      if (!id || !action) return;
      if (action === "inc") updateCartQty(id, 1);
      if (action === "dec") updateCartQty(id, -1);
    });
  }

  if (cartClearBtn) {
    cartClearBtn.addEventListener("click", clearCart);
  }

  // Config drawer
  function openConfigDrawer() {
    if (!configDrawer) return;
    configDrawer.classList.remove("hidden");
    configDrawer.classList.add("open");
    configDrawer.setAttribute("aria-hidden", "false");
    updateConfigControlsFromState();
  }

  function closeConfigDrawer() {
    if (!configDrawer) return;
    configDrawer.classList.remove("open");
    configDrawer.classList.add("hidden");
    configDrawer.setAttribute("aria-hidden", "true");
  }

  if (configToggleBtn) {
    configToggleBtn.addEventListener("click", openConfigDrawer);
  }
  if (configCloseBtn) {
    configCloseBtn.addEventListener("click", closeConfigDrawer);
  }

  if (cfgApply) {
    cfgApply.addEventListener("click", function () {
      if (cfgTheme) {
        state.ui.theme = cfgTheme.value || "theme-light";
      }
      if (cfgDensity) {
        state.ui.density = cfgDensity.value || "layout-spacious";
      }
      if (cfgColumns) {
        var cols = parseInt(cfgColumns.value, 10);
        state.ui.maxColumns = cols === 2 ? 2 : 3;
      }
      if (cfgReading) {
        state.ui.readingMode = !!cfgReading.checked;
      }
      if (cfgDyslexic) {
        state.ui.dyslexicMode = !!cfgDyslexic.checked;
      }
      if (cfgCursor) {
        state.ui.cursorHighlight = !!cfgCursor.checked;
      }
      state.ui.preset = "custom";
      saveState();
      applyUiState();
    });
  }

  if (cfgOpenOnboarding) {
    cfgOpenOnboarding.addEventListener("click", function () {
      showOnboarding();
    });
  }

  // Filters
  syncFilterControlsFromState();

  if (filterCategorySelect) {
    filterCategorySelect.addEventListener("change", function (e) {
      state.filterCategory = e.target.value || "any";
      saveState();
      renderCatalogue();
    });
  }

  if (filterPowerSelect) {
    filterPowerSelect.addEventListener("change", function (e) {
      state.filterPower = e.target.value || "any";
      saveState();
      renderCatalogue();
    });
  }

  if (filterPriceSelect) {
    filterPriceSelect.addEventListener("change", function (e) {
      state.filterPrice = e.target.value || "any";
      saveState();
      renderCatalogue();
    });
  }

  if (filtersResetBtn) {
    filtersResetBtn.addEventListener("click", function () {
      state.filterCategory = "any";
      state.filterPower = "any";
      state.filterPrice = "any";
      saveState();
      syncFilterControlsFromState();
      renderCatalogue();
    });
  }

  // Onboarding buttons – fixes "stuck at popup"
  if (onboardingSkipBtn) {
    onboardingSkipBtn.addEventListener("click", function () {
      handleOnboardingFinish();
    });
  }
  if (onboardingStartBtn) {
    onboardingStartBtn.addEventListener("click", function () {
      handleOnboardingFinish();
    });
  }

  // Carousel controls
  if (carouselPrevBtn) {
    carouselPrevBtn.addEventListener("click", function () {
      prevSlide();
    });
  }
  if (carouselNextBtn) {
    carouselNextBtn.addEventListener("click", function () {
      nextSlide();
    });
  }
  if (carouselToggleBtn) {
    carouselToggleBtn.addEventListener("click", function () {
      toggleCarouselAutoplay();
    });
  }

  // Hash navigation (categories / products from hero + nav)
  window.addEventListener("hashchange", handleHashNavigation);

  // --- Initial render / setup ---

  applyUiState();
  renderCatalogue();
  updateCartUI();
  updateCarouselPosition();
  handleHashNavigation();
});
