const cartStorageKey = "rumais-cart";
const shippingCost = 180;
const businessEmail = "rubailjames6@gmail.com";

let cart = [];
let isSubmittingOrder = false;
let discountAmount = 0;
function formatPrice(price) {
  return Number(price || 0).toLocaleString("en-PK");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>\"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function getCart() {
  try {
    return JSON.parse(window.sessionStorage.getItem(cartStorageKey) || "[]");
  } catch (error) {
    return [];
  }
}

function showError(fieldName, message) {
  const error = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (error) {
    error.textContent = message;
    error.hidden = !message;
  }
  const input = document.querySelector(`#checkout-${fieldName}`) || document.querySelector(`[name="${fieldName}"]`);
  if (input) input.classList.toggle("is-invalid", Boolean(message));
}

function clearErrors() {
  document.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
    error.hidden = true;
  });
  document.querySelectorAll(".is-invalid").forEach((input) => input.classList.remove("is-invalid"));
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function validatePhone(value) {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("92") ? digits.slice(2) : digits;
  return /^3\d{9}$/.test(normalized);
}

function getFormValues() {
  return {
    email: document.getElementById("checkout-email").value.trim(),
    firstName: document.getElementById("checkout-first-name").value.trim(),
    lastName: document.getElementById("checkout-last-name").value.trim(),
    country: document.getElementById("checkout-country").value.trim(),
    city: document.getElementById("checkout-city").value.trim(),
    address: document.getElementById("checkout-address").value.trim(),
    postalCode: document.getElementById("checkout-postal").value.trim(),
    phone: document.getElementById("checkout-phone").value.trim(),
    saveInfo: document.getElementById("checkout-save-info").checked,
  };
}

function validateForm(showMessages = false) {
  clearErrors();
  const values = getFormValues();
  let isValid = true;

  if (!values.email) {
    if (showMessages) showError("email", "Email address is required.");
    isValid = false;
  } else if (!validateEmail(values.email)) {
    if (showMessages) showError("email", "Please enter a valid email address.");
    isValid = false;
  }

  if (!values.firstName) {
    if (showMessages) showError("firstName", "First name is required.");
    isValid = false;
  }

  if (!values.city) {
    if (showMessages) showError("city", "Please select a valid delivery city.");
    isValid = false;
  }

  if (!values.address) {
    if (showMessages) showError("address", "Complete delivery address is required.");
    isValid = false;
  } else if (values.address.length < 8) {
    if (showMessages) showError("address", "Please enter your complete delivery address.");
    isValid = false;
  }

  if (!values.phone) {
    if (showMessages) showError("phone", "Phone number is required.");
    isValid = false;
  } else if (!validatePhone(values.phone)) {
    if (showMessages) showError("phone", "Please enter a valid Pakistani phone number.");
    isValid = false;
  }

  return isValid;
}
function updateSubmitButton() {
  const button = document.getElementById("place-order-button");
  if (!button) return;
  button.disabled = isSubmittingOrder || cart.length === 0;
}

function renderCartItems() {
  const container = document.getElementById("checkout-items");
  const empty = document.getElementById("checkout-empty");
  if (!container) return;

  container.innerHTML = "";
  if (cart.length === 0) {
    if (empty) empty.hidden = false;
    updateTotals();
    updateSubmitButton();
    return;
  }
  if (empty) empty.hidden = true;

  cart.forEach((item) => {
    const row = document.createElement("article");
    row.className = "checkout-item";

    const image = item.image
      ? `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}">`
      : `<div class="checkout-item-image-placeholder" aria-hidden="true"></div>`;

    const options = Object.entries(item.options || {})
      .map(([label, value]) => `${escapeHTML(label)}: ${escapeHTML(value)}`)
      .join(" · ");

    row.innerHTML = `
      <div class="checkout-item-image">${image}</div>
      <div class="checkout-item-details">
        <h3>${escapeHTML(item.name)}</h3>
        ${options ? `<p class="checkout-item-options">${options}</p>` : ""}
        <p class="checkout-item-meta">Qty ${item.quantity} × Rs. ${formatPrice(item.price)}</p>
      </div>
      <strong class="checkout-item-price">Rs. ${formatPrice(item.price * item.quantity)}</strong>
    `;
    container.appendChild(row);
  });

  updateTotals();
  updateSubmitButton();
}

function updateTotals() {
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal + shippingCost - discountAmount);

  const subtotalElement = document.getElementById("checkout-subtotal");
  const shippingElement = document.getElementById("checkout-shipping");
  const discountElement = document.getElementById("checkout-discount");
  const totalElement = document.getElementById("checkout-total");

  if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
  if (shippingElement) shippingElement.textContent = formatPrice(shippingCost);
  if (discountElement) discountElement.textContent = formatPrice(discountAmount);
  if (totalElement) totalElement.textContent = formatPrice(total);
}
function showMessage(text, type) {
  const message = document.getElementById("checkout-message");
  if (!message) return;
  message.textContent = text;
  message.className = `checkout-message is-${type}`;
  message.hidden = false;
}

function normalizePhone(value) {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("92") ? digits.slice(2) : digits;
  return `+92${normalized}`;
}

async function placeOrder(event) {
  event.preventDefault();
  if (isSubmittingOrder) return;

  const form = event.currentTarget;
  const button = document.getElementById("place-order-button");
  const values = getFormValues();

  if (cart.length === 0) {
    showMessage("Your cart is empty. Add a product before placing an order.", "error");
    return;
  }

  if (!validateForm(true)) {
    if (!values.city) {
      window.alert("Please select a valid delivery city before continuing.");
    }
    showMessage("Please correct the highlighted fields and try again.", "error");
    return;
  }

  isSubmittingOrder = true;
  button.disabled = true;
  button.textContent = "Placing order...";

  const orderNumber = `RUMAIS-${Date.now().toString(36).toUpperCase()}`;
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const total = Math.max(0, subtotal + shippingCost - discountAmount);
  const orderItems = cart
    .map((item) => {
      const options = Object.entries(item.options || {})
        .map(([label, value]) => `${label}: ${value}`)
        .join(", ");
      return `${item.name} | Qty: ${item.quantity} | Price: Rs. ${formatPrice(item.price)} | Options: ${options || "None"}`;
    })
    .join("\n");

  const templateParams = {
    to_email: businessEmail,
    reply_to: values.email,
    order_number: orderNumber,
    customer_name: `${values.firstName} ${values.lastName}`.trim(),
    customer_email: values.email,
    customer_phone: normalizePhone(values.phone),
    delivery_address: values.address,
    city: values.city,
    country: values.country,
    postal_code: values.postalCode || "Not provided",
    product_summary: orderItems,
    subtotal: `Rs. ${formatPrice(subtotal)}`,
    shipping: `Rs. ${formatPrice(shippingCost)}`,
    discount: `Rs. ${formatPrice(discountAmount)}`,
    total: `Rs. ${formatPrice(total)}`,
    payment_method: "Cash on Delivery",
    save_info: values.saveInfo ? "Yes" : "No",
    order_date: new Date().toLocaleString(),
  };

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${businessEmail}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
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

    window.sessionStorage.removeItem(cartStorageKey);
    window.location.href = `order-success.html?order=${encodeURIComponent(orderNumber)}`;
  } catch (error) {
    console.error("Order email failed:", error);

    // FormSubmit's normal form POST works even when the AJAX request is blocked
    // by CORS, ad blockers, or file:// origins. It also lets FormSubmit perform
    // its own validation/activation flow before redirecting back.
    try {
      const fallbackForm = document.createElement("form");
      fallbackForm.method = "POST";
      fallbackForm.action = `https://formsubmit.co/${businessEmail}`;
      fallbackForm.style.display = "none";

      const addField = (name, value) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value || "");
        fallbackForm.appendChild(input);
      };

      Object.entries(templateParams).forEach(([name, value]) => addField(name, value));
      addField("_subject", `New RUMAIS Order - ${orderNumber}`);
      addField("_template", "table");
      addField("_captcha", "false");

      const successUrl = new URL("order-success.html", window.location.href);
      successUrl.searchParams.set("order", orderNumber);
      addField("_next", successUrl.href);

      document.body.appendChild(fallbackForm);
      fallbackForm.submit();
      return;
    } catch (fallbackError) {
      console.error("FormSubmit fallback failed:", fallbackError);
    }

    const detail = error && error.message ? ` (${error.message})` : "";
    showMessage(`Sorry, your order could not be sent automatically${detail}. This can happen if the page is opened directly from a file, an ad blocker is active, or FormSubmit is not activated yet. Your email app will open as a backup.`, "error");

    const mailtoSubject = encodeURIComponent(`New RUMAIS Order - ${orderNumber}`);
    const mailtoBody = encodeURIComponent(
      Object.entries(templateParams)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")
    );
    window.location.href = `mailto:${businessEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;
  } finally {
    window.clearTimeout(timeoutId);
    isSubmittingOrder = false;
    button.textContent = "Place Order";
    updateSubmitButton();
  }
}
function initCheckout() {
  cart = getCart();
  renderCartItems();

  const form = document.getElementById("checkout-form");
  if (form) {
    form.addEventListener("submit", placeOrder);
    form.querySelectorAll("input, select, textarea").forEach((element) => {
      element.addEventListener("input", () => {
        validateForm(false);
        updateSubmitButton();
      });
      element.addEventListener("change", () => {
        validateForm(false);
        updateSubmitButton();
      });
    });
  }

  const applyDiscount = document.getElementById("apply-discount");
  if (applyDiscount) {
    applyDiscount.addEventListener("click", () => {
      const input = document.getElementById("discount-code");
      const message = document.getElementById("discount-message");
      const code = input ? input.value.trim() : "";

      if (!code) {
        if (message) {
          message.textContent = "Enter a discount code.";
          message.hidden = false;
          message.className = "discount-message is-error";
        }
        return;
      }

      discountAmount = 0;
      updateTotals();
      if (message) {
        message.textContent = "This discount code is not valid.";
        message.hidden = false;
        message.className = "discount-message is-error";
      }
    });
  }

  validateForm(false);
  updateSubmitButton();
}

document.addEventListener("DOMContentLoaded", initCheckout);