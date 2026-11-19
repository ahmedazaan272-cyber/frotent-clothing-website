const whatsappNumber = "923709315821";
const cartStorageKey = "rumais-cart";
const cart = JSON.parse(window.sessionStorage.getItem(cartStorageKey) || "[]");

const emailjsConfig = {
  publicKey: "YOUR_EMAILJS_PUBLIC_KEY",
  serviceId: "YOUR_EMAILJS_SERVICE_ID",
  templateId: "YOUR_EMAILJS_TEMPLATE_ID",
};

if (window.emailjs && emailjsConfig.publicKey !== "YOUR_EMAILJS_PUBLIC_KEY") {
  emailjs.init(emailjsConfig.publicKey);
}

const cartCount = document.querySelector("#cart-count");
const cartCountSummary = document.querySelector("#cart-count-summary");
const cartItems = document.querySelector("#cart-items");
const cartTotal = document.querySelector("#cart-total");
const emptyCartMessage = document.querySelector("#empty-cart-message");
const checkoutButton = document.querySelector("#checkout-button");
const siteHeader = document.querySelector(".site-header");
const updateHeaderScroll = () => {
  if (siteHeader) siteHeader.classList.toggle("is-scrolled", window.scrollY > 16);
};
window.addEventListener("scroll", updateHeaderScroll, { passive: true });
updateHeaderScroll();
const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector("#primary-navigation");
const productCarousel = document.querySelector(".product-carousel");
const productDetailsRoute = document.querySelector("#product-details-route");
const productDetailsContent = document.querySelector("#product-details-content");
const productCards = [...document.querySelectorAll(".product-track .product-card")];
const searchToggle = document.querySelector(".search-toggle");
const searchArea = document.querySelector(".search-area");
const searchForm = document.querySelector("#product-search-form");
const searchInput = document.querySelector("#product-search");
const searchClear = document.querySelector(".search-clear");
const searchSuggestions = document.querySelector("#search-suggestions");
const minimumSearchLength = 2;
const normalizeSearchText = (value) =>
  value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");

function getProductFromLocation() {
  const queryProduct = new URLSearchParams(window.location.search).get("product");
  const legacyMatch = window.location.hash.match(/^#\/product\/([a-z0-9-]+)$/i);
  const productId = queryProduct || (legacyMatch && legacyMatch[1]);
  return productCards.find((card) => card.id.replace(/-product$/, "") === productId) || null;
}

function navigateToProduct(productId) {
  const url = new URL(window.location.href);
  url.searchParams.set("product", productId);
  url.hash = "";
  window.history.pushState({}, "", url);
  updateProductRoute();
}

function renderProductDetails(card) {
  const name = card.querySelector("h3").textContent.trim();
  const category = card.dataset.category;
  const price = Number(card.dataset.price);
  const image = card.querySelector(".product-image img");
  const options = JSON.parse(card.dataset.options);
  const escapeHTML = (value) =>
    String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[character]);
  const backHref = window.location.pathname.endsWith("product.html")
    ? "index.html#collections"
    : "#collections";
  const optionMarkup = options.map(({ label, choices }) => `
    <fieldset class="product-option-group" data-option-group="${escapeHTML(label)}">
      <legend>${escapeHTML(label)}</legend>
      <div class="product-choice-list">
        ${choices.map((choice) => `<button class="product-choice" type="button" data-detail-choice="${escapeHTML(choice)}" aria-pressed="false">${escapeHTML(choice)}</button>`).join("")}
      </div>
    </fieldset>
  `).join("");

  document.title = `${name} | RUMAIS`;
  productDetailsContent.innerHTML = `
    <section class="product-details" aria-labelledby="product-details-title">
      <nav class="product-breadcrumbs" aria-label="Breadcrumb">
        <a class="product-back-link" href="${backHref}"><span aria-hidden="true">←</span> Back to shop</a><span aria-hidden="true">/</span>
        <span aria-current="page">${escapeHTML(name)}</span>
      </nav>
      <div class="product-details-layout">
        <div class="product-gallery">
          <div class="product-gallery-main"><img src="${escapeHTML(image.getAttribute("src"))}" alt="${escapeHTML(name)} product image">${card.dataset.sample ? '<span class="sample-badge">SAMPLE</span>' : ""}</div>
          <div class="product-gallery-thumbnails" aria-label="Product images">
            <span class="product-gallery-count">1 image available</span>
          </div>
        </div>
        <div class="product-details-copy">
          <p class="eyebrow">${escapeHTML(category)}</p>
          <h1 id="product-details-title">${escapeHTML(name)}</h1>
          <p class="product-details-price">Rs. ${formatPrice(price)} <span>Demo price</span></p>
          <p class="product-details-description">A detailed description is not available for this listing. Contact us if you need more information before ordering.</p>
          ${card.dataset.sample ? '<p class="product-sample-notice">This is a sample listing.</p>' : ""}
          <div class="product-attributes" aria-label="Product sizes and colors">
            <p><strong>Sizes</strong><span>S, M, L, XL</span></p>
            <p><strong>Colors</strong><span>As shown</span></p>
          </div>
          <div class="product-detail-options">${optionMarkup}</div>
          <p class="product-size-note">Sizes and colors are not specified for this listing. The options above are the available ordering choices.</p>
          <div class="product-quantity">
            <span>Quantity</span>
            <div class="quantity-control" aria-label="Product quantity">
              <button type="button" data-quantity-change="-1" aria-label="Decrease quantity" disabled>−</button>
              <output aria-live="polite">1</output>
              <button type="button" data-quantity-change="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <p class="product-validation" role="alert" hidden></p>
          <p class="product-success" role="status" hidden></p>
<div class="product-purchase-actions">
            <button class="product-add-button" type="button" data-add-product>Add to Bag</button>
          </div>
          <div class="product-information">
            <details><summary>Product information</summary><p>Choose from the ${options.map(({ label }) => escapeHTML(label.toLocaleLowerCase())).join(" and ")} options above. The listed price is a demo price.</p></details>
            <details><summary>Shipping &amp; returns</summary><p>Delivery, shipping and return details are not listed. Please <a href="https://wa.me/${whatsappNumber}" target="_blank" rel="noopener noreferrer">contact us on WhatsApp</a> to confirm before ordering.</p></details>
          </div>
        </div>
      </div>
    </section>
  `;
  productDetailsContent.dataset.quantity = "1";
  productDetailsContent.dataset.selectedOptions = "{}";
}

function updateProductRoute() {
  const activeProduct = getProductFromLocation();
  document.querySelectorAll("main > section").forEach((section) => {
    section.hidden = Boolean(activeProduct) && section !== productDetailsRoute;
  });
  productDetailsRoute.hidden = !activeProduct;
  if (activeProduct) {
    renderProductDetails(activeProduct);
    window.scrollTo({ top: 0, behavior: "auto" });
  } else {
    if (window.location.pathname.endsWith("product.html")) {
      window.location.replace("index.html");
      return;
    }
    document.title = "RUMAIS | Women's Clothing";
    const targetId = window.location.hash.slice(1);
    if (targetId) {
      window.requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView());
    }
  }
}

window.addEventListener("hashchange", updateProductRoute);
window.addEventListener("popstate", updateProductRoute);
document.querySelector(".product-track")?.addEventListener("click", (event) => {
  const card = event.target.closest(".product-card");
  if (!card) return;
  event.preventDefault();
  const productId = card.id.replace(/-product$/, "");
  window.location.assign(`product.html?product=${encodeURIComponent(productId)}`);
});
productDetailsContent.addEventListener("click", (event) => {
  const backLink = event.target.closest(".product-back-link");
  if (!backLink) return;
  const href = backLink.getAttribute("href") || "";
  if (!href.startsWith("#")) return;
  event.preventDefault();
  const url = new URL(window.location.href);
  url.searchParams.delete("product");
  url.hash = "collections";
  window.history.pushState({}, "", url);
  updateProductRoute();
});
updateProductRoute();

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute(
    "aria-label",
    isExpanded ? "Open navigation menu" : "Close navigation menu"
  );
  primaryNavigation.classList.toggle("is-open", !isExpanded);
});

const navDropdown = document.querySelector(".nav-dropdown");
const navDropdownToggle = document.querySelector(".nav-dropdown-toggle");
navDropdownToggle?.addEventListener("click", (event) => {
  if (window.innerWidth <= 650) {
    event.preventDefault();
    navDropdown?.classList.toggle("is-open");
    const expanded = navDropdown?.classList.contains("is-open");
    navDropdownToggle.setAttribute("aria-expanded", String(Boolean(expanded)));
  }
});

primaryNavigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    primaryNavigation.classList.remove("is-open");
    navDropdown?.classList.remove("is-open");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !searchForm.hidden) {
    searchForm.hidden = true;
    searchInput.value = "";
    searchToggle.setAttribute("aria-expanded", "false");
    searchToggle.setAttribute("aria-label", "Open product search");
    searchForm.requestSubmit();
    searchToggle.focus();
  }

  if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    primaryNavigation.classList.remove("is-open");
    menuToggle.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!getProductFromLocation() || event.defaultPrevented) return;
  const link = event.target.closest('a[href^="#"]');
  if (!link || link.classList.contains("product-back-link")) return;
  const targetId = link.getAttribute("href").slice(1);
  if (!targetId) return;
  event.preventDefault();
  const url = new URL(window.location.href);
  url.searchParams.delete("product");
  url.hash = targetId;
  window.history.pushState({}, "", url);
  updateProductRoute();
});

if (productCarousel) {
  const viewport = productCarousel.querySelector(".product-viewport");
  const track = productCarousel.querySelector(".product-track");
  const status = productCarousel.querySelector(".carousel-status");
  const noResults = productCarousel.querySelector(".no-search-results");
  const pauseButton = productCarousel.querySelector(".carousel-pause");
  const cards = [...track.children];
  const searchProducts = cards.map((card, index) => {
    const options = JSON.parse(card.dataset.options)
      .map(({ label, choices }) => `${label} ${choices.join(" ")}`)
      .join(" ");
    const name = card.querySelector("h3").textContent.trim();
    const category = card.dataset.category;
    const price = card.dataset.price;
    const image = card.querySelector(".product-image img");
    return {
      card,
      index,
      id: card.id.replace(/-product$/, ""),
      name,
      category,
      price: Number(price),
      image: image.src,
      imageAlt: image.alt,
      searchText: normalizeSearchText(`${name} ${category} ${options}`),
    };
  });
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let startIndex = 0;
  let visibleCards = 3;
  let isPaused = false;
  let isInteracting = false;
  let filteredCards = cards;
  const initialCategory = new URLSearchParams(window.location.search).get("category");
  if (initialCategory) {
    filteredCards = cards.filter((card) =>
      (card.dataset.category || "").toLowerCase().startsWith(initialCategory.toLowerCase())
    );
  }
  let suggestions = [];
  let activeSuggestionIndex = -1;

  function updateCarousel() {
    visibleCards = window.innerWidth <= 900 ? 2 : 3;
    startIndex = Math.min(startIndex, Math.max(0, filteredCards.length - visibleCards));
    cards.forEach((card) => {
      card.hidden = !filteredCards.includes(card);
    });
    noResults.hidden = filteredCards.length > 0;
    const activeCard = filteredCards[startIndex];
    const offset = activeCard ? activeCard.offsetLeft : 0;
    track.style.transform = `translateX(-${offset}px)`;
    status.textContent = filteredCards.length
      ? `Showing products ${startIndex + 1}–${Math.min(startIndex + visibleCards, filteredCards.length)} of ${filteredCards.length}`
      : "No matching products";
    productCarousel.classList.toggle("has-no-results", filteredCards.length === 0);
    pauseButton.textContent = isPaused ? "Play" : "Pause";
    pauseButton.setAttribute(
      "aria-label",
      isPaused ? "Resume automatic product carousel" : "Pause automatic product carousel"
    );
  }

  function moveCarousel(direction) {
    if (filteredCards.length === 0) return;
    const lastStartIndex = Math.max(0, filteredCards.length - visibleCards);
    startIndex = (startIndex + direction + lastStartIndex + 1) % (lastStartIndex + 1);
    updateCarousel();
  }

  function closeSuggestions() {
    suggestions = [];
    activeSuggestionIndex = -1;
    searchSuggestions.hidden = true;
    searchSuggestions.replaceChildren();
    searchInput.setAttribute("aria-expanded", "false");
    searchInput.removeAttribute("aria-activedescendant");
  }

  function selectSuggestion(product) {
    searchInput.value = "";
    searchClear.hidden = true;
    closeSuggestions();
    searchForm.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
    searchToggle.setAttribute("aria-label", "Open product search");
    filteredCards = cards;
    startIndex = Math.min(product.index, Math.max(0, cards.length - visibleCards));
    updateCarousel();
    window.location.assign(`product.html?product=${encodeURIComponent(product.id)}`);
  }

  function updateSuggestions() {
    const query = normalizeSearchText(searchInput.value);
    searchClear.hidden = query.length === 0;
    closeSuggestions();

    if (query.length < minimumSearchLength) return;

    suggestions = searchProducts
      .filter((product) => product.searchText.includes(query))
      .slice(0, 6);
    searchSuggestions.replaceChildren();
    searchSuggestions.hidden = false;
    searchInput.setAttribute("aria-expanded", "true");

    if (suggestions.length === 0) {
      const message = document.createElement("li");
      message.className = "search-empty";
      message.setAttribute("role", "status");
      message.textContent = "No products found";
      searchSuggestions.append(message);
      return;
    }

    suggestions.forEach((product, index) => {
      const item = document.createElement("li");
      item.setAttribute("role", "presentation");
      const link = document.createElement("a");
      link.className = "search-suggestion";
      link.href = `?product=${encodeURIComponent(product.id)}`;
      link.id = `search-suggestion-${index}`;
      link.setAttribute("role", "option");
      link.setAttribute("aria-selected", "false");

      const image = document.createElement("img");
      image.src = product.image;
      image.alt = "";
      image.setAttribute("aria-hidden", "true");

      const details = document.createElement("span");
      details.className = "search-suggestion-details";
      const name = document.createElement("span");
      name.className = "search-suggestion-name";
      name.textContent = product.name;
      const category = document.createElement("span");
      category.className = "search-suggestion-category";
      category.textContent = product.category;
      details.append(name, category);

      const price = document.createElement("span");
      price.className = "search-suggestion-price";
      price.textContent = `Rs. ${product.price.toLocaleString("en-PK")}`;

      link.append(image, details, price);
      link.addEventListener("click", (event) => {
        event.preventDefault();
        selectSuggestion(product);
      });
      item.append(link);
      searchSuggestions.append(item);
    });
  }

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchToggle.click();
    }
  });

  searchToggle.addEventListener("click", () => {
    const shouldOpen = searchForm.hidden;
    searchForm.hidden = !shouldOpen;
    searchToggle.setAttribute("aria-expanded", String(shouldOpen));
    searchToggle.setAttribute("aria-label", shouldOpen ? "Close product search" : "Open product search");
    if (shouldOpen) {
      searchInput.focus();
    } else {
      searchInput.value = "";
      searchClear.hidden = true;
      closeSuggestions();
      searchForm.requestSubmit();
    }
  });
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = normalizeSearchText(searchInput.value);
    filteredCards = searchProducts
      .filter((product) => product.searchText.includes(query))
      .map((product) => product.card);
    startIndex = 0;
    updateCarousel();
    closeSuggestions();
  });
  searchInput.addEventListener("input", updateSuggestions);
  searchInput.addEventListener("keydown", (event) => {
    if (!searchSuggestions.hidden && suggestions.length > 0 && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      activeSuggestionIndex = direction > 0
        ? (activeSuggestionIndex + 1) % suggestions.length
        : (activeSuggestionIndex <= 0 ? suggestions.length - 1 : activeSuggestionIndex - 1);
      [...searchSuggestions.querySelectorAll('[role="option"]')].forEach((option, index) => {
        const isActive = index === activeSuggestionIndex;
        option.setAttribute("aria-selected", String(isActive));
        option.classList.toggle("is-active", isActive);
      });
      searchInput.setAttribute("aria-activedescendant", `search-suggestion-${activeSuggestionIndex}`);
    } else if (event.key === "Enter" && activeSuggestionIndex >= 0 && suggestions[activeSuggestionIndex]) {
      event.preventDefault();
      selectSuggestion(suggestions[activeSuggestionIndex]);
    } else if (event.key === "Escape" && !searchSuggestions.hidden) {
      event.preventDefault();
      event.stopPropagation();
      closeSuggestions();
    }
  });
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    searchInput.focus();
    closeSuggestions();
    searchClear.hidden = true;
    searchForm.requestSubmit();
  });
  document.addEventListener("pointerdown", (event) => {
    if (!searchArea.contains(event.target) && !searchToggle.contains(event.target)) {
      closeSuggestions();
    }
  });

  productCarousel.querySelector(".carousel-previous").addEventListener("click", () => moveCarousel(-1));
  productCarousel.querySelector(".carousel-next").addEventListener("click", () => moveCarousel(1));
  pauseButton.addEventListener("click", () => {
    isPaused = !isPaused;
    updateCarousel();
  });
  productCarousel.addEventListener("mouseenter", () => { isInteracting = true; });
  productCarousel.addEventListener("mouseleave", () => { isInteracting = false; });
  productCarousel.addEventListener("focusin", () => { isInteracting = true; });
  productCarousel.addEventListener("focusout", (event) => {
    if (!productCarousel.contains(event.relatedTarget)) {
      isInteracting = false;
    }
  });
  window.addEventListener("resize", updateCarousel);
  motionPreference.addEventListener("change", updateCarousel);
  document.addEventListener("visibilitychange", updateCarousel);
  updateCarousel();
  window.setInterval(() => {
    if (!isPaused && !isInteracting && !motionPreference.matches && !document.hidden) {
      moveCarousel(1);
    }
  }, 4500);
}

function formatPrice(price) {
  return price.toLocaleString("en-PK");
}

function renderCart() {
  window.sessionStorage.setItem(cartStorageKey, JSON.stringify(cart));
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  cartCount.textContent = itemCount;
  cartCount.setAttribute("aria-label", `Cart, ${itemCount} items`);
  cartCountSummary.textContent = itemCount;
  cartTotal.textContent = formatPrice(totalPrice);
  emptyCartMessage.hidden = cart.length > 0;

  cartItems.querySelectorAll(".cart-item").forEach((item) => item.remove());

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const description = document.createElement("p");
    const selectedOptions = Object.entries(item.options)
      .map(([label, value]) => `${label}: ${value}`)
      .join(" · ");
    description.textContent = `${item.name} — ${selectedOptions} — Rs. ${formatPrice(item.price)} × ${item.quantity}`;

    const controls = document.createElement("div");
    controls.className = "cart-item-controls";

    const decreaseButton = document.createElement("button");
    decreaseButton.type = "button";
    decreaseButton.textContent = "−";
    decreaseButton.setAttribute("aria-label", `Remove one ${item.name}`);
    decreaseButton.addEventListener("click", () => changeQuantity(item.key, -1));

    const quantity = document.createElement("span");
    quantity.textContent = item.quantity;
    quantity.setAttribute("aria-label", "Quantity");

    const increaseButton = document.createElement("button");
    increaseButton.type = "button";
    increaseButton.textContent = "+";
    increaseButton.setAttribute("aria-label", `Add one ${item.name}`);
    increaseButton.addEventListener("click", () => changeQuantity(item.key, 1));

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => removeItem(item.key));

    controls.append(decreaseButton, quantity, increaseButton, removeButton);
    row.append(description, controls);
    cartItems.append(row);
  });
}

function addItem(name, price, options, quantity = 1, image = "") {
  const key = `${name}:${JSON.stringify(options)}`;
  const existingItem = cart.find((item) => item.key === key);

  if (existingItem) {
    existingItem.quantity += quantity;
    if (image && !existingItem.image) existingItem.image = image;
  } else {
    cart.push({ key, name, price, options, quantity, image });
  }

  renderCart();
}

function changeQuantity(key, change) {
  const item = cart.find((cartItem) => cartItem.key === key);

  if (!item) {
    return;
  }

  item.quantity += change;

  if (item.quantity <= 0) {
    removeItem(key);
    return;
  }

  renderCart();
}

function removeItem(key) {
  const itemIndex = cart.findIndex((cartItem) => cartItem.key === key);

  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
    renderCart();
  }
}

productDetailsContent.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.hasAttribute("data-detail-choice")) {
    const group = button.closest("[data-option-group]");
    const selectedOptions = JSON.parse(productDetailsContent.dataset.selectedOptions);
    selectedOptions[group.dataset.optionGroup] = button.dataset.detailChoice;
    productDetailsContent.dataset.selectedOptions = JSON.stringify(selectedOptions);
    group.querySelectorAll("[data-detail-choice]").forEach((choice) => {
      const selected = choice === button;
      choice.classList.toggle("is-selected", selected);
      choice.setAttribute("aria-pressed", String(selected));
    });
    productDetailsContent.querySelector(".product-validation").hidden = true;
    productDetailsContent.querySelector(".product-success").hidden = true;
    return;
  }

  if (button.hasAttribute("data-quantity-change")) {
    const output = productDetailsContent.querySelector(".quantity-control output");
    const quantity = Math.max(1, Number(productDetailsContent.dataset.quantity) + Number(button.dataset.quantityChange));
    productDetailsContent.dataset.quantity = String(quantity);
    output.value = quantity;
    output.textContent = quantity;
    productDetailsContent.querySelector('[data-quantity-change="-1"]').disabled = quantity === 1;
    return;
  }

  if (!button.hasAttribute("data-add-product") && !button.hasAttribute("data-order-product")) return;

  const card = getProductFromLocation();
  if (!card) return;
  const choices = JSON.parse(productDetailsContent.dataset.selectedOptions);
  const optionGroups = [...productDetailsContent.querySelectorAll("[data-option-group]")];
  const missingOptions = optionGroups
    .map((group) => group.dataset.optionGroup)
    .filter((label) => !choices[label]);
  const validation = productDetailsContent.querySelector(".product-validation");
  const success = productDetailsContent.querySelector(".product-success");
  if (missingOptions.length) {
    validation.textContent = `Please select ${missingOptions.join(" and ")} before continuing.`;
    validation.hidden = false;
    success.hidden = true;
    return;
  }

  const quantity = Number(productDetailsContent.dataset.quantity);
  const name = card.querySelector("h3").textContent.trim();
  const price = Number(card.dataset.price);
  validation.hidden = true;
  if (button.hasAttribute("data-add-product")) {
    const productImage = card.querySelector(".product-image img");
    addItem(name, price, choices, quantity, productImage ? productImage.getAttribute("src") || "" : "");
    success.textContent = `${quantity} × ${name} added to your bag.`;
    success.hidden = false;
    return;
  }

  if (!/^\d{10,15}$/.test(whatsappNumber)) {
    alert("Add the store's WhatsApp number in script.js before placing orders.");
    return;
  }

});

checkoutButton && checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Add a product to your cart before ordering.");
    return;
  }

  if (!/^\d{10,15}$/.test(whatsappNumber)) {
    alert("Add the store's WhatsApp number in script.js before placing orders.");
    return;
  }

  const orderLines = cart.map(
    (item) =>
      `${item.name} (${Object.entries(item.options)
        .map(([label, value]) => `${label}: ${value}`)
        .join(", ")}) x ${item.quantity} — Rs. ${formatPrice(item.price * item.quantity)}`
  );
  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const message = [
    "Hello, I would like to place an order:",
    ...orderLines,
    `Total: Rs. ${formatPrice(totalPrice)}`,
  ].join("\n");
  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
});

renderCart();
let orderModal = null;
let isSubmittingOrder = false;
let currentOrderProduct = null;
let currentOrderOptions = {};
let activeOrderForm = null;

function getOrderUnitPrice() {
  return currentOrderProduct ? Number(currentOrderProduct.dataset.price) : 0;
}

function clearFieldError(field) {
  if (!field) return;
  const scope = field.form || activeOrderForm || orderModal || document;
  const error = scope.querySelector(`[data-error-for="${field.name}"]`);
  if (error) {
    error.textContent = "";
    error.hidden = true;
  }
  field.removeAttribute("aria-invalid");
}

function showFieldError(field, text) {
  if (!field) return;
  const scope = field.form || activeOrderForm || orderModal || document;
  const error = scope.querySelector(`[data-error-for="${field.name}"]`);
  if (error) {
    error.textContent = text;
    error.hidden = false;
  }
  field.setAttribute("aria-invalid", "true");
}

function updateOrderTotal() {
  const form = activeOrderForm || (orderModal ? orderModal.querySelector("#order-form") : document.querySelector("#order-form") || document.querySelector("#email-order-form"));
  if (!form) return;
  const quantityField = form.querySelector("#order-quantity");
  const quantity = Math.max(1, Number(quantityField?.value) || 1);
  const unitPrice = getOrderUnitPrice();
  const totalField = form.querySelector("#order-total");
  if (totalField) totalField.value = `Rs. ${formatPrice(unitPrice * quantity)}`;
}
function ensureOrderModal() {
  if (orderModal) return orderModal;
  orderModal = document.createElement("div");
  orderModal.className = "order-modal";
  orderModal.id = "order-modal";
  orderModal.hidden = true;
  orderModal.innerHTML = `
    <div class="order-modal-backdrop" data-order-close></div>
    <div class="order-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="order-modal-title">
      <button class="order-modal-close" type="button" data-order-close aria-label="Close order form">×</button>
      <p class="eyebrow">SECURE ORDER REQUEST</p>
      <h2 id="order-modal-title">Place Your Order</h2>
      <p class="order-modal-product" id="order-modal-product"></p>
      <form id="order-form" novalidate>
        <div class="order-form-grid">
          <div class="order-field">
            <label for="order-name">Full Name</label>
            <input id="order-name" name="customer_name" type="text" required autocomplete="name">
            <span class="field-error" data-error-for="customer_name" hidden></span>
          </div>
          <div class="order-field">
            <label for="order-email">Email Address</label>
            <input id="order-email" name="customer_email" type="email" required autocomplete="email">
            <span class="field-error" data-error-for="customer_email" hidden></span>
          </div>
          <div class="order-field">
            <label for="order-phone">Phone Number</label>
            <input id="order-phone" name="customer_phone" type="tel" required autocomplete="tel" inputmode="tel">
            <span class="field-error" data-error-for="customer_phone" hidden></span>
          </div>
          <div class="order-field">
            <label for="order-city">City</label>
            <input id="order-city" name="city" type="text" required autocomplete="address-level2">
            <span class="field-error" data-error-for="city" hidden></span>
          </div>
          <div class="order-field order-field-full">
            <label for="order-address">Complete Delivery Address</label>
            <textarea id="order-address" name="delivery_address" required rows="3" autocomplete="street-address"></textarea>
            <span class="field-error" data-error-for="delivery_address" hidden></span>
          </div>
          <div class="order-field">
            <label for="order-product">Product</label>
            <input id="order-product" name="product_name" type="text" readonly>
          </div>
          <div class="order-field">
            <label for="order-size">Selected Size</label>
            <select id="order-size" name="product_size" required>
              <option value="">Select size</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
            <span class="field-error" data-error-for="product_size" hidden></span>
          </div>
          <div class="order-field">
            <label for="order-quantity">Quantity</label>
            <input id="order-quantity" name="quantity" type="number" min="1" step="1" required>
            <span class="field-error" data-error-for="quantity" hidden></span>
          </div>
          <div class="order-field">
            <label for="order-total">Total Price</label>
            <input id="order-total" name="total_price" type="text" readonly>
          </div>
        </div>
        <div class="order-form-actions">
          <button type="button" class="order-cancel-button" data-order-close>Cancel</button>
          <button type="submit" class="order-submit-button">Place Order</button>
        </div>
        <p class="order-form-message" role="status" hidden></p>
      </form>
    </div>
  `;
  document.body.append(orderModal);

  orderModal.querySelectorAll("[data-order-close]").forEach((element) => {
    element.addEventListener("click", closeOrderModal);
  });

  const form = orderModal.querySelector("#order-form");
  form.addEventListener("submit", submitOrderForm);
  form.querySelector("#order-quantity").addEventListener("input", updateOrderTotal);
  form.querySelector("#order-size").addEventListener("change", (event) => clearFieldError(event.target));
  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => {
      clearFieldError(field);
      if (field.id === "order-quantity") updateOrderTotal();
    });
  });

  return orderModal;
}
function openOrderModal(card, choices, quantity) {
  ensureOrderModal();
  currentOrderProduct = card;
  currentOrderOptions = choices || {};
  const name = card.querySelector("h3").textContent.trim();
  const price = Number(card.dataset.price);
  const form = orderModal.querySelector("#order-form");
  activeOrderForm = form;
  form.reset();
  form.querySelector("#order-product").value = name;
  form.querySelector("#order-quantity").value = Math.max(1, Number(quantity) || 1);
  form.querySelector("#order-size").value = "";
  orderModal.dataset.selectedOptions = JSON.stringify(choices || {});
  const optionSummary = Object.entries(choices || {})
    .map(([label, value]) => `${label}: ${value}`)
    .join(", ");
  orderModal.querySelector("#order-modal-product").textContent = `${name} — Rs. ${formatPrice(price)}${optionSummary ? ` · ${optionSummary}` : ""}`;
  const message = orderModal.querySelector(".order-form-message");
  message.hidden = true;
  message.textContent = "";
  message.className = "order-form-message";
  updateOrderTotal();
  orderModal.hidden = false;
  document.body.classList.add("order-modal-open");
  orderModal.querySelector("#order-name").focus();
}

function closeOrderModal() {
  if (!orderModal || orderModal.hidden) return;
  if (isSubmittingOrder) return;
  orderModal.hidden = true;
  document.body.classList.remove("order-modal-open");
  currentOrderProduct = null;
}

async function processEmailOrder(form, message, submitButton, closeModal) {
  const nameField = form.querySelector("#order-name");
  const emailField = form.querySelector("#order-email");
  const phoneField = form.querySelector("#order-phone");
  const cityField = form.querySelector("#order-city");
  const addressField = form.querySelector("#order-address");
  const sizeField = form.querySelector("#order-size");
  const quantityField = form.querySelector("#order-quantity");

  const name = nameField.value.trim();
  const email = emailField.value.trim();
  const phone = phoneField.value.trim();
  const city = cityField.value.trim();
  const address = addressField.value.trim();
  const size = sizeField.value;
  const quantity = Math.max(1, Number(quantityField.value) || 1);

  let isValid = true;

  if (name.length < 2) {
    showFieldError(nameField, "Please enter your full name.");
    isValid = false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError(emailField, "Please enter a valid email address.");
    isValid = false;
  }
  if (!/^[+]?[\d\s-]{10,16}$/.test(phone)) {
    showFieldError(phoneField, "Please enter a valid phone number.");
    isValid = false;
  }
  if (city.length < 2) {
    showFieldError(cityField, "Please enter your city.");
    isValid = false;
  }
  if (address.length < 8) {
    showFieldError(addressField, "Please enter your complete delivery address.");
    isValid = false;
  }
  if (!size) {
    showFieldError(sizeField, "Please select a size.");
    isValid = false;
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    showFieldError(quantityField, "Quantity must be at least 1.");
    isValid = false;
  }

  if (!isValid) {
    message.textContent = "Please correct the highlighted fields and try again.";
    message.className = "order-form-message is-error";
    message.hidden = false;
    return;
  }

  message.hidden = true;
  message.textContent = "";
  message.className = "order-form-message";

  const unitPrice = getOrderUnitPrice();
  const totalPrice = unitPrice * quantity;
  const selectedOptions = currentOrderOptions || {};
  const optionSummary = Object.entries(selectedOptions)
    .map(([label, value]) => `${label}: ${value}`)
    .join(", ");
  const orderNumber = `RUMAIS-${Date.now().toString(36).toUpperCase()}`;

  const templateParams = {
    to_email: "rubailjames6@gmail.com",
    reply_to: email,
    order_number: orderNumber,
    customer_name: name,
    customer_email: email,
    customer_phone: phone,
    delivery_address: address,
    city: city,
    product_name: form.querySelector("#order-product").value,
    product_size: size,
    quantity: quantity,
    unit_price: `Rs. ${formatPrice(unitPrice)}`,
    total_price: `Rs. ${formatPrice(totalPrice)}`,
    selected_options: optionSummary || "None",
    order_date: new Date().toLocaleString(),
  };

  isSubmittingOrder = true;
  submitButton.disabled = true;
  submitButton.textContent = "Sending order...";

  let timeoutId = null;
  try {
    const emailJsConfigured =
      window.emailjs &&
      emailjsConfig.publicKey !== "YOUR_EMAILJS_PUBLIC_KEY" &&
      emailjsConfig.serviceId !== "YOUR_EMAILJS_SERVICE_ID" &&
      emailjsConfig.templateId !== "YOUR_EMAILJS_TEMPLATE_ID";

    if (emailJsConfigured) {
      await emailjs.send(
        emailjsConfig.serviceId,
        emailjsConfig.templateId,
        templateParams,
        emailjsConfig.publicKey
      );
    } else {
      const controller = new AbortController();
      timeoutId = window.setTimeout(() => controller.abort(), 12000);
      const response = await fetch("https://formsubmit.co/ajax/rubailjames6@gmail.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          ...templateParams,
          _subject: `New RUMAIS Order - ${orderNumber}`,
          _template: "table",
          _captcha: "false",
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Email delivery service is not configured.");
      }

      const result = await response.json().catch(() => ({}));
      if (result.success !== "true" && result.success !== true) {
        throw new Error(result.message || "Email delivery failed.");
      }
    }

    message.textContent = `Order ${orderNumber} placed successfully. We will contact you soon.`;
    message.className = "order-form-message is-success";
    message.hidden = false;
    const orderedProductName = form.querySelector("#order-product").value;
    form.reset();
    if (closeModal) {
      setTimeout(closeOrderModal, 3500);
    } else if (currentOrderProduct) {
      form.querySelector("#order-product").value = orderedProductName || currentOrderProduct.name || "";
      const qty = Math.max(1, Number(currentOrderProduct.quantity) || 1);
      form.querySelector("#order-quantity").value = qty;
      form.querySelector("#order-size").value = "";
      updateOrderTotal();
    }
  } catch (error) {
    console.error("Order email failed:", error);
    const detail = error && error.message ? ` (${error.message})` : "";
    message.textContent = `Sorry, your order could not be sent automatically${detail}. Your email app will open as a backup.`;
    message.className = "order-form-message is-error";
    message.hidden = false;

    const mailtoSubject = encodeURIComponent(`New RUMAIS Order - ${orderNumber}`);
    const mailtoBody = encodeURIComponent(
      Object.entries(templateParams)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")
    );
    window.location.href = `mailto:rubailjames6@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
    isSubmittingOrder = false;
    submitButton.disabled = false;
    submitButton.textContent = "Place Order";
  }
}

async function submitOrderForm(event) {
  event.preventDefault();
  if (isSubmittingOrder || !orderModal) return;

  const form = event.currentTarget;
  const message = orderModal.querySelector(".order-form-message");
  const submitButton = form.querySelector(".order-submit-button");

  await processEmailOrder(form, message, submitButton, true);
}

async function submitEmailOrderPage(event) {
  event.preventDefault();
  if (isSubmittingOrder) return;

  const form = event.currentTarget;
  const message = document.querySelector(".order-form-message");
  const submitButton = form.querySelector(".order-submit-button");

  await processEmailOrder(form, message, submitButton, false);
}

function initEmailOrderPage() {
  const form = document.querySelector("#email-order-form");
  if (!form) return;

  activeOrderForm = form;
  const emptyState = document.querySelector("#email-order-empty");
  const layout = document.querySelector("#email-order-layout");
  const productAside = document.querySelector("#email-order-product");

  const params = new URLSearchParams(window.location.search);
  let raw = sessionStorage.getItem("rumais-email-order-product");
  if (!raw && params.has("name")) {
    raw = JSON.stringify({
      name: params.get("name"),
      price: Number(params.get("price")) || 0,
      image: params.get("image") || "",
      quantity: Number(params.get("quantity")) || 1,
      options: (() => {
        try { return JSON.parse(params.get("options") || "{}"); } catch { return {}; }
      })(),
    });
  }
  if (!raw) {
    if (emptyState) emptyState.hidden = false;
    if (layout) layout.hidden = true;
    return;
  }

  let product = null;
  try {
    product = JSON.parse(raw);
  } catch (error) {
    product = null;
  }

  if (!product) {
    if (emptyState) emptyState.hidden = false;
    if (layout) layout.hidden = true;
    return;
  }

  currentOrderProduct = {
    dataset: { price: String(product.price) },
    name: product.name,
    quantity: product.quantity,
  };
  currentOrderOptions = product.options || {};

  if (emptyState) emptyState.hidden = true;
  if (layout) layout.hidden = false;

  const optionSummary = Object.entries(currentOrderOptions)
    .map(([label, value]) => `${escapeHTML(label)}: ${escapeHTML(value)}`)
    .join(", ");

  if (productAside) {
    productAside.innerHTML = `
      <div class="email-order-product-card">
        ${product.image ? `<img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">` : ""}
        <h2>${escapeHTML(product.name)}</h2>
        <p class="email-order-price">Rs. ${formatPrice(product.price)}</p>
        ${optionSummary ? `<p class="email-order-options">${optionSummary}</p>` : ""}
      </div>
    `;
  }

  form.querySelector("#order-product").value = product.name;
  form.querySelector("#order-quantity").value = Math.max(1, Number(product.quantity) || 1);
  form.querySelector("#order-size").value = "";
  updateOrderTotal();

  form.addEventListener("submit", submitEmailOrderPage);
  const quantityField = form.querySelector("#order-quantity");
  if (quantityField) quantityField.addEventListener("input", updateOrderTotal);

  form.querySelectorAll("input, select, textarea").forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
    field.addEventListener("change", () => clearFieldError(field));
  });
}

initEmailOrderPage();

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && orderModal && !orderModal.hidden) {
    closeOrderModal();
  }
});
