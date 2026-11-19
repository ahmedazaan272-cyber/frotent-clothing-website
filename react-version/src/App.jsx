import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const WHATSAPP_NUMBER = "923709315821";
const MINIMUM_SEARCH_LENGTH = 2;

function normalizeSearchText(value) {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

function productCardId(productId) {
  return productId === "khaddar" ? "khaddar-product" : `${productId}-product`;
}

const products = [
  {
    id: "khaddar",
    category: "Khaddar",
    name: "Winter Khaddar Suit",
    price: 4500,
    image: "/images/img1.jpg",
    art: "khaddar",
    detail: "A WINTER CLASSIC",
    phrase: <>Soft<br />structure</>,
    options: [
      { label: "Set", choices: ["2-Piece — Shirt + Dupatta", "3-Piece — Shirt + Dupatta + Trouser"] },
      { label: "Fabric length", choices: ["Standard", "Extra length"] },
    ],
  },
  {
    id: "velvet",
    category: "Velvet",
    name: "Classic Velvet Suit",
    price: 6000,
    image: "/images/img3.jpg",
    art: "velvet",
    detail: "A LITTLE MORE LUXE",
    phrase: <>Evening<br />in velvet</>,
    options: [
      { label: "Set", choices: ["2-Piece — Shirt + Dupatta", "3-Piece — Shirt + Dupatta + Trouser"] },
      { label: "Fabric length", choices: ["Standard", "Extra length"] },
    ],
  },
  {
    id: "shawls",
    category: "Shawls",
    name: "Embroidered Shawl",
    price: 3500,
    image: "/images/img2.jpg",
    art: "shawls",
    detail: "SOFTNESS, WOVEN IN",
    phrase: <>Drape<br />your story</>,
    options: [
      { label: "Shawl length", choices: ["Standard — 2.5 m", "Long — 2.75 m"] },
    ],
  },
  {
    id: "khaddar-sample",
    category: "Khaddar · Sample",
    name: "Embroidered Khaddar Suit",
    price: 5200,
    image: "/images/img1.jpg",
    art: "khaddar",
    detail: "DEMO PRODUCT",
    sample: true,
    options: [
      { label: "Set", choices: ["2-Piece — Shirt + Dupatta", "3-Piece — Shirt + Dupatta + Trouser"] },
      { label: "Fabric length", choices: ["Standard", "Extra length"] },
    ],
  },
  {
    id: "velvet-sample",
    category: "Velvet · Sample",
    name: "Velvet Formal Set",
    price: 6800,
    image: "/images/img3.jpg",
    art: "velvet",
    detail: "DEMO PRODUCT",
    sample: true,
    options: [
      { label: "Set", choices: ["2-Piece — Shirt + Dupatta", "3-Piece — Shirt + Dupatta + Trouser"] },
      { label: "Fabric length", choices: ["Standard", "Extra length"] },
    ],
  },
  {
    id: "shawls-sample",
    category: "Shawls · Sample",
    name: "Winter Embroidered Shawl",
    price: 2800,
    image: "/images/img2.jpg",
    art: "shawls",
    detail: "DEMO PRODUCT",
    sample: true,
    options: [
      { label: "Shawl length", choices: ["Standard — 2.5 m", "Long — 2.75 m"] },
    ],
  },
];

function productIdFromLocation(location) {
  const legacyMatch = location.hash.match(/^#\/product\/([a-z0-9-]+)$/i);
  const productId = new URLSearchParams(location.search).get("product") || (legacyMatch && legacyMatch[1]);
  return productId && products.some((product) => product.id === productId) ? productId : null;
}

function formatPrice(price) {
  return price.toLocaleString("en-PK");
}

function ProductCard({ product }) {
  return (
    <a
      className={`product-card ${product.art}-card`}
      id={productCardId(product.id)}
      href={`?product=${encodeURIComponent(product.id)}`}
      onClick={(event) => {
        event.preventDefault();
        window.location.assign(event.currentTarget.href);
      }}
      aria-label={`${product.name}, Rs. ${formatPrice(product.price)}. View product details`}
    >
      <span className="product-image">
        <img src={product.image} alt={`${product.name} product`} />
        {product.sample && <span className="sample-badge">SAMPLE</span>}
      </span>
      <span className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <h3>{product.name}</h3>
        <span className="product-card-price">Rs. {formatPrice(product.price)}</span>
      </span>
    </a>
  );
}

function ProductDetails({ product, onAdd, onOrderNow, onBackToShop }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [validationMessage, setValidationMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const gallery = [product.image];
  const missingOptions = product.options.filter(({ label }) => !selectedOptions[label]);

  function validateSelection() {
    if (missingOptions.length > 0) {
      setSuccessMessage("");
      setValidationMessage(`Please select ${missingOptions.map(({ label }) => label).join(" and ")} before continuing.`);
      return false;
    }
    setValidationMessage("");
    return true;
  }

  function addToBag() {
    if (!validateSelection()) return;
    onAdd(product, selectedOptions, quantity);
    setSuccessMessage(`${quantity} × ${product.name} added to your bag.`);
  }

  function orderNow() {
    if (!validateSelection()) return;
    onOrderNow(product, selectedOptions, quantity);
  }

  return (
    <section className="product-details" aria-labelledby="product-details-title">
      <nav className="product-breadcrumbs" aria-label="Breadcrumb">
        <a
          className="product-back-link"
          href="#collections"
          onClick={(event) => {
            event.preventDefault();
            onBackToShop();
          }}
        >
          <span aria-hidden="true">←</span> Back to shop
        </a><span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>
      <div className="product-details-layout">
        <div className="product-gallery">
          <div className="product-gallery-main">
            <img src={gallery[selectedImage]} alt={`${product.name} product view`} />
            {product.sample && <span className="sample-badge">SAMPLE</span>}
          </div>
          <div className="product-gallery-thumbnails" aria-label="Product images">
            {gallery.map((image, index) => (
              <button
                className={`product-thumbnail${selectedImage === index ? " is-selected" : ""}`}
                key={image}
                type="button"
                aria-label={`Show product image ${index + 1}`}
                aria-pressed={selectedImage === index}
                onClick={() => setSelectedImage(index)}
              >
                <img src={image} alt="" />
              </button>
            ))}
            <span className="product-gallery-count">{gallery.length} image{gallery.length === 1 ? "" : "s"} available</span>
          </div>
        </div>
        <div className="product-details-copy">
          <p className="eyebrow">{product.category}</p>
          <h1 id="product-details-title">{product.name}</h1>
          <p className="product-details-price">Rs. {formatPrice(product.price)} <span>Demo price</span></p>
          <p className="product-details-description">
            A detailed description is not available for this listing. Contact us if you need more information before ordering.
          </p>
          {product.sample && <p className="product-sample-notice">This is a sample listing.</p>}
          <div className="product-attributes" aria-label="Product sizes and colors">
            <p><strong>Sizes</strong><span>Not specified</span></p>
            <p><strong>Colors</strong><span>Not specified</span></p>
          </div>
          <div className="product-detail-options">
            {product.options.map(({ label, choices }) => (
              <fieldset className="product-option-group" key={label}>
                <legend>{label}</legend>
                <div className="product-choice-list">
                  {choices.map((choice) => (
                    <button
                      className={`product-choice${selectedOptions[label] === choice ? " is-selected" : ""}`}
                      key={choice}
                      type="button"
                      aria-pressed={selectedOptions[label] === choice}
                      onClick={() => {
                        setSelectedOptions((current) => ({ ...current, [label]: choice }));
                        setValidationMessage("");
                        setSuccessMessage("");
                      }}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="product-quantity">
            <span>Quantity</span>
            <div className="quantity-control" aria-label="Product quantity">
              <button type="button" aria-label="Decrease quantity" disabled={quantity <= 1} onClick={() => setQuantity((current) => Math.max(1, current - 1))}>−</button>
              <output aria-live="polite">{quantity}</output>
              <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((current) => current + 1)}>+</button>
            </div>
          </div>
          {validationMessage && <p className="product-validation" role="alert">{validationMessage}</p>}
          {successMessage && <p className="product-success" role="status">{successMessage}</p>}
          <div className="product-purchase-actions">
            <button className="product-add-button" type="button" onClick={addToBag}>Add to Bag</button>
            <button className="product-order-button" type="button" onClick={orderNow}>Buy Now · WhatsApp</button>
          </div>
          <p className="product-size-note">
            Sizes and colors are not specified for this listing. The options shown above are the available ordering choices.
          </p>
          <div className="product-information">
            <details>
              <summary>Product information</summary>
              <p>Choose from the {product.options.map(({ label }) => label.toLocaleLowerCase()).join(" and ")} options shown above. The listed price is a demo price.</p>
            </details>
            <details>
              <summary>Shipping &amp; returns</summary>
              <p>Delivery, shipping and return details are not listed. Please <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">contact us on WhatsApp</a> to confirm before ordering.</p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}

function App() {
  const [cart, setCart] = useState(() =>
    JSON.parse(window.sessionStorage.getItem("rumais-cart") || "[]")
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [carouselStart, setCarouselStart] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [carouselInteracting, setCarouselInteracting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const carouselTrackRef = useRef(null);
  const searchAreaRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchToggleRef = useRef(null);
  const menuToggleRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState("");
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [activeProductId, setActiveProductId] = useState(() => productIdFromLocation(window.location));
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const normalizedSearchTerm = normalizeSearchText(searchTerm);
  const searchSuggestions = useMemo(() => {
    if (normalizedSearchTerm.length < MINIMUM_SEARCH_LENGTH) return [];
    return products
      .filter((product) => {
        const attributes = product.options
          .map(({ label, choices }) => `${label} ${choices.join(" ")}`)
          .join(" ");
        const searchable = normalizeSearchText(
          `${product.name} ${product.category} ${product.detail} ${attributes}`
        );
        return searchable.includes(normalizedSearchTerm);
      })
      .slice(0, 6);
  }, [normalizedSearchTerm]);
  const filteredProducts = useMemo(() => {
    const query = normalizeSearchText(submittedSearchTerm);
    return query
      ? products.filter((product) =>
          normalizeSearchText(
            `${product.name} ${product.category} ${product.detail} ${product.options
              .map(({ label, choices }) => `${label} ${choices.join(" ")}`)
              .join(" ")}`
          ).includes(query)
        )
      : products;
  }, [submittedSearchTerm]);
  const activeProduct = products.find((product) => product.id === activeProductId) ?? null;

  useEffect(() => {
    window.sessionStorage.setItem("rumais-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    function syncProductRoute() {
      const nextProductId = productIdFromLocation(window.location);
      setActiveProductId(nextProductId);
      if (nextProductId) {
        window.scrollTo({ top: 0, behavior: "auto" });
      } else {
        const targetId = window.location.hash.slice(1);
        window.requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView());
      }
    }
    window.addEventListener("hashchange", syncProductRoute);
    window.addEventListener("popstate", syncProductRoute);
    return () => {
      window.removeEventListener("hashchange", syncProductRoute);
      window.removeEventListener("popstate", syncProductRoute);
    };
  }, []);

  useEffect(() => {
    if (!activeProduct) return undefined;
    function handleDetailSectionLink(event) {
      if (event.defaultPrevented) return;
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const targetId = link.getAttribute("href").slice(1);
      if (!targetId) return;
      event.preventDefault();
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.delete("product");
      nextUrl.hash = targetId;
      window.history.pushState({}, "", nextUrl);
      setActiveProductId(null);
      window.requestAnimationFrame(() => document.getElementById(targetId)?.scrollIntoView());
    }
    document.addEventListener("click", handleDetailSectionLink);
    return () => document.removeEventListener("click", handleDetailSectionLink);
  }, [activeProduct]);

  function navigateToProduct(productId) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("product", productId);
    nextUrl.hash = "";
    window.history.pushState({}, "", nextUrl);
    setActiveProductId(productId);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function navigateToShop() {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("product");
    nextUrl.hash = "collections";
    window.history.pushState({}, "", nextUrl);
    setActiveProductId(null);
    window.requestAnimationFrame(() => document.getElementById("collections")?.scrollIntoView());
  }

  useEffect(() => {
    document.title = activeProduct
      ? `${activeProduct.name} | RUMAIS`
      : "RUMAIS | Women's Winter Collection";
  }, [activeProduct]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateLayout = () => {
      const width = window.innerWidth;
      setVisibleCards(width <= 560 ? 1 : width <= 900 ? 2 : 3);
      setPrefersReducedMotion(motionPreference.matches);
    };
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateLayout();
    updateVisibility();
    window.addEventListener("resize", updateLayout);
    motionPreference.addEventListener("change", updateLayout);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      window.removeEventListener("resize", updateLayout);
      motionPreference.removeEventListener("change", updateLayout);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    setCarouselStart((current) => Math.min(current, Math.max(0, filteredProducts.length - visibleCards)));
  }, [filteredProducts.length, visibleCards]);

  useLayoutEffect(() => {
    const track = carouselTrackRef.current;
    const activeCard = track?.children[carouselStart];
    if (track && activeCard) {
      track.style.transform = `translateX(-${activeCard.offsetLeft}px)`;
    }
  }, [carouselStart, visibleCards]);

  useEffect(() => {
    if (
      carouselPaused ||
      carouselInteracting ||
      prefersReducedMotion ||
      !pageVisible ||
      filteredProducts.length === 0
    ) return undefined;
    const lastStartIndex = Math.max(0, filteredProducts.length - visibleCards);
    const timer = window.setInterval(() => {
      setCarouselStart((current) => current >= lastStartIndex ? 0 : current + 1);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [carouselPaused, carouselInteracting, prefersReducedMotion, pageVisible, visibleCards, filteredProducts.length]);

  useEffect(() => {
    function closeOverlays(event) {
      if (event.key === "Escape") {
        if (suggestionsOpen) {
          setSuggestionsOpen(false);
          setActiveSuggestionIndex(-1);
        } else if (searchOpen) {
          setSearchOpen(false);
          setSearchTerm("");
          setSubmittedSearchTerm("");
          setActiveSuggestionIndex(-1);
          searchToggleRef.current?.focus();
        }
        if (menuOpen) {
          setMenuOpen(false);
          menuToggleRef.current?.focus();
        }
      }
    }
    document.addEventListener("keydown", closeOverlays);
    return () => document.removeEventListener("keydown", closeOverlays);
  }, [menuOpen, searchOpen, suggestionsOpen]);

  useEffect(() => {
    function closeSuggestionsOutside(event) {
      if (
        !searchAreaRef.current?.contains(event.target) &&
        !searchToggleRef.current?.contains(event.target)
      ) {
        setSuggestionsOpen(false);
        setActiveSuggestionIndex(-1);
      }
    }
    document.addEventListener("pointerdown", closeSuggestionsOutside);
    return () => document.removeEventListener("pointerdown", closeSuggestionsOutside);
  }, []);

  function selectSearchSuggestion(product) {
    setSubmittedSearchTerm("");
    setSearchTerm("");
    setSuggestionsOpen(false);
    setActiveSuggestionIndex(-1);
    setSearchOpen(false);
    window.location.assign(`?product=${encodeURIComponent(product.id)}`);
  }

  function moveCarousel(direction) {
    const lastStartIndex = Math.max(0, filteredProducts.length - visibleCards);
    setCarouselStart((current) => (current + direction + lastStartIndex + 1) % (lastStartIndex + 1));
  }

  function addProduct(product, options, quantity = 1) {
    const selectedOptions = Object.fromEntries(
      product.options.map(({ label }) => [label, options[label]])
    );
    const key = JSON.stringify([product.id, selectedOptions]);
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.key === key);
      if (existing) {
        return currentCart.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...currentCart, { ...product, key, selectedOptions, quantity }];
    });
  }

  function orderProductOnWhatsApp(product, options, quantity) {
    const selected = Object.entries(options)
      .map(([label, value]) => `${label}: ${value}`)
      .join(", ");
    const message = [
      "Hello, I would like to place an order:",
      `${product.name} (${selected}) x ${quantity} — Rs. ${formatPrice(product.price * quantity)}`,
      `Total: Rs. ${formatPrice(product.price * quantity)}`,
    ].join("\n");
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function changeQuantity(itemKey, change) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.key === itemKey ? { ...item, quantity: item.quantity + change } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeProduct(itemKey) {
    setCart((currentCart) => currentCart.filter((item) => item.key !== itemKey));
  }

  function orderOnWhatsApp() {
    if (cart.length === 0) {
      window.alert("Add a product to your cart before ordering.");
      return;
    }

    const lines = cart.map(
      (item) => {
        const options = Object.entries(item.selectedOptions)
          .map(([label, value]) => `${label}: ${value}`)
          .join(", ");
        return `${item.name} (${options}) x ${item.quantity} — Rs. ${formatPrice(item.price * item.quantity)}`;
      }
    );
    const message = [
      "Hello, I would like to place an order:",
      ...lines,
      `Total: Rs. ${formatPrice(total)}`,
    ].join("\n");
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      <div className="announcement-bar">
        <p>THE WINTER EDIT <span aria-hidden="true">·</span> KHADDAR, VELVET &amp; SHAWLS</p>
      </div>
      <header className="site-header">
        <a className="brand" href="#home" aria-label="RUMAIS home">
          <img className="brand-logo" src="/images/logo.jpg" alt="" />
          <span>RUMAIS</span>
        </a>
        <nav className={`primary-nav${menuOpen ? " is-open" : ""}`} id="primary-navigation" aria-label="Main navigation">
          <a className="active" href="#collections" onClick={() => setMenuOpen(false)}>Shop</a>
          <a href="#new-arrivals" onClick={() => setMenuOpen(false)}>New Arrivals</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <div className="header-actions">
          <a className="header-whatsapp" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
            WhatsApp <span aria-hidden="true">↗</span>
          </a>
          <button
            className="search-toggle"
            ref={searchToggleRef}
            type="button"
            aria-label={searchOpen ? "Close product search" : "Open product search"}
            aria-expanded={searchOpen}
            aria-controls="product-search-form"
            onClick={() => {
              setSearchOpen((open) => !open);
              if (searchOpen) {
                setSearchTerm("");
                setSubmittedSearchTerm("");
                setCarouselStart(0);
                setSuggestionsOpen(false);
                setActiveSuggestionIndex(-1);
              }
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>
          </button>
          <a className="nav-cart" href="#cart" aria-label={`Cart, ${itemCount} items`}>
            <svg className="cart-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/></svg>
            <span className="cart-label">Cart</span>
            <span className="cart-count">{itemCount}</span>
          </a>
          <button
            className="menu-toggle"
            ref={menuToggleRef}
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span></span><span></span><span></span>
          </button>
        </div>
        <div className="search-area" ref={searchAreaRef}>
          <form
            className="header-search-form"
            id="product-search-form"
            role="search"
            hidden={!searchOpen}
            onSubmit={(event) => {
              event.preventDefault();
              setSubmittedSearchTerm(searchTerm);
              setCarouselStart(0);
              setSuggestionsOpen(false);
              setActiveSuggestionIndex(-1);
            }}
          >
            <label className="visually-hidden" htmlFor="product-search">Search products</label>
            <input
              id="product-search"
              ref={searchInputRef}
              type="search"
              placeholder="Search the collection"
              autoComplete="off"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={suggestionsOpen && normalizedSearchTerm.length >= MINIMUM_SEARCH_LENGTH}
              aria-activedescendant={activeSuggestionIndex >= 0 ? `search-option-${searchSuggestions[activeSuggestionIndex]?.id}` : undefined}
              value={searchTerm}
              onChange={(event) => {
                const value = event.target.value;
                setSearchTerm(value);
                setSuggestionsOpen(normalizeSearchText(value).length >= MINIMUM_SEARCH_LENGTH);
                setActiveSuggestionIndex(-1);
              }}
              onKeyDown={(event) => {
                const canNavigateSuggestions =
                  suggestionsOpen &&
                  normalizedSearchTerm.length >= MINIMUM_SEARCH_LENGTH &&
                  searchSuggestions.length > 0;
                if (event.key === "Escape" && suggestionsOpen) {
                  event.stopPropagation();
                  setSuggestionsOpen(false);
                  setActiveSuggestionIndex(-1);
                } else if (canNavigateSuggestions && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                  event.preventDefault();
                  const direction = event.key === "ArrowDown" ? 1 : -1;
                  setActiveSuggestionIndex((current) =>
                    direction > 0
                      ? (current + 1) % searchSuggestions.length
                      : (current <= 0 ? searchSuggestions.length - 1 : current - 1)
                  );
                } else if (event.key === "Enter" && activeSuggestionIndex >= 0 && searchSuggestions[activeSuggestionIndex]) {
                  event.preventDefault();
                  selectSearchSuggestion(searchSuggestions[activeSuggestionIndex]);
                }
              }}
            />
            <button
              className="search-clear"
              type="button"
              aria-label="Clear search"
              hidden={!searchTerm}
              onClick={() => {
                setSearchTerm("");
                setSubmittedSearchTerm("");
                setSuggestionsOpen(false);
                setActiveSuggestionIndex(-1);
                setCarouselStart(0);
                searchInputRef.current?.focus();
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 6 12 12M18 6 6 18" /></svg>
            </button>
            <button className="search-submit" type="submit">Search</button>
          </form>
          <ul
            className="search-suggestions"
            id="search-suggestions"
            role="listbox"
            aria-label="Product suggestions"
            hidden={!suggestionsOpen || normalizedSearchTerm.length < MINIMUM_SEARCH_LENGTH}
          >
            {searchSuggestions.length > 0 ? searchSuggestions.map((product, index) => (
              <li key={product.id} role="presentation">
                <button
                  className={`search-suggestion${activeSuggestionIndex === index ? " is-active" : ""}`}
                  id={`search-option-${product.id}`}
                  type="button"
                  role="option"
                  aria-selected={activeSuggestionIndex === index}
                  onMouseEnter={() => setActiveSuggestionIndex(index)}
                  onClick={() => selectSearchSuggestion(product)}
                >
                  <img src={product.image} alt="" aria-hidden="true" />
                  <span className="search-suggestion-details">
                    <span className="search-suggestion-name">{product.name}</span>
                    <span className="search-suggestion-category">{product.category}</span>
                  </span>
                  <span className="search-suggestion-price">Rs. {formatPrice(product.price)}</span>
                </button>
              </li>
            )) : (
              <li className="search-empty" role="status">No products found</li>
            )}
          </ul>
        </div>
      </header>

      <main>
        {activeProduct ? (
          <ProductDetails
            key={activeProduct.id}
            product={activeProduct}
            onAdd={addProduct}
            onOrderNow={orderProductOnWhatsApp}
            onBackToShop={navigateToShop}
          />
        ) : <>
        <section className="hero" id="home">
          <div className="hero-copy">
            <div className="hero-badge-pill">
              <span className="hero-pill-dot" aria-hidden="true" />
              <span className="hero-pill-label">THE WINTER EDIT · 2026</span>
              <span className="hero-pill-tag">NEW</span>
            </div>
            <h1>Tradition,<br />made <em>personal.</em></h1>
            <p className="hero-description">
              Discover unstitched Khaddar, luxurious velvet and handcrafted shawls curated for the season.
            </p>
            <div className="hero-actions">
              <a className="primary-link hero-primary-btn" href="#collections">
                <span>Shop the collection</span>
                <span aria-hidden="true">↗</span>
              </a>
              <a
                className="hero-whatsapp-btn"
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello RUMAIS, I'd like to inquire about the Winter Collection.")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3 20.4l1.3-4.9a8.4 8.4 0 1 1 16.2-3.8Z" />
                  <path d="M8.5 8.2c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4-.1.6.5.9 1.2 1.6 2.1 2.1.2.1.4.1.6-.1l.7-.8c.2-.2.4-.3.7-.2l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.2-.7 1.6-.5.4-1.2.7-2 .5-1-.2-2.2-.7-3.7-2-.9-.8-1.6-1.8-2-2.8-.4-1.1-.3-2 .2-2.7Z" />
                </svg>
                <span>Order on WhatsApp</span>
              </a>
            </div>
            <div className="hero-highlights">
              <div className="hero-highlight-item">
                <span className="highlight-bullet">✦</span>
                <span>Pure Unstitched Fabrics</span>
              </div>
              <div className="hero-highlight-item">
                <span className="highlight-bullet">✦</span>
                <span>Cash on Delivery</span>
              </div>
              <div className="hero-highlight-item">
                <span className="highlight-bullet">✦</span>
                <span>WhatsApp Assistance</span>
              </div>
            </div>
          </div>
          <div className="hero-art-wrapper">
            <div className="hero-art">
              <img className="hero-photo" src="/images/winter-collection.jpg?v=6" alt="Model wearing an elegant dark green outfit with an embroidered shawl" width="460" height="460" loading="eager" fetchPriority="high" decoding="async" />
              <div className="hero-image-badge">
                <span className="hero-image-badge-label">CURATED DROP</span>
                <span className="hero-image-badge-title">Khaddar, Velvet &amp; Shawls</span>
              </div>
            </div>
          </div>
        </section>

        <section className="new-arrivals" id="new-arrivals" aria-labelledby="new-arrivals-heading">
          <div className="new-arrivals-image">
            <img src="/images/img1.jpg" alt="Featured beige embroidered outfit from the RUMAIS collection" />
            <span>JUST LANDED · WINTER 2026</span>
          </div>
          <div className="new-arrivals-copy">
            <p className="eyebrow">THE LATEST EDIT</p>
            <h2 id="new-arrivals-heading">New season.<br /><em>New favourites.</em></h2>
            <p>Meet our latest unstitched Khaddar edit—thoughtful details and a rich winter palette, ready for your wardrobe.</p>
            <a className="primary-link" href="#khaddar-product">Discover the edit <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="collections" id="collections">
          <div className="section-heading">
            <div><p className="eyebrow">CURATED FOR THE SEASON</p><h2>Find your <em>favourite.</em></h2></div>
            <p>Beautiful fabrics, ready for the way you wear them.</p>
          </div>
          <div
            className="product-carousel"
            role="region"
            aria-label="Product collection carousel"
            onMouseEnter={() => setCarouselInteracting(true)}
            onMouseLeave={() => setCarouselInteracting(false)}
            onFocusCapture={() => setCarouselInteracting(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setCarouselInteracting(false);
            }}
          >
            <div className={`product-viewport${filteredProducts.length === 0 ? " no-products" : ""}`}>
              <div className="product-track" ref={carouselTrackRef}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="carousel-arrows" aria-label="Browse products">
                <button className="carousel-button carousel-previous" type="button" aria-label="Show previous products" onClick={() => moveCarousel(-1)}>←</button>
                <button className="carousel-button carousel-next" type="button" aria-label="Show next products" onClick={() => moveCarousel(1)}>→</button>
              </div>
              {filteredProducts.length === 0 && (
                <p className="no-search-results">No products found. Try a different search.</p>
              )}
            </div>
            <div className="carousel-controls">
              <p className="carousel-status" aria-live="polite">
                {filteredProducts.length === 0
                  ? "No matching products"
                  : `Showing products ${carouselStart + 1}–${Math.min(carouselStart + visibleCards, filteredProducts.length)} of ${filteredProducts.length}`}
              </p>
              <button
                className="carousel-button carousel-pause"
                type="button"
                aria-label={carouselPaused ? "Resume automatic product carousel" : "Pause automatic product carousel"}
                onClick={() => setCarouselPaused((paused) => !paused)}
              >
                {carouselPaused ? "Play" : "Pause"}
              </button>
            </div>
          </div>
        </section>

        <section className="cart" id="cart" aria-labelledby="cart-heading">
          <div className="cart-heading">
            <div><p className="eyebrow">YOUR PICKS</p><h2 id="cart-heading">Your cart</h2></div>
            <p>{itemCount} items</p>
          </div>
          {cart.length === 0 ? (
            <p className="empty-cart-message">Your cart is waiting for something lovely.</p>
          ) : (
            <div className="cart-items" aria-live="polite">
              {cart.map((item) => (
                <div className="cart-item" key={item.key}>
                  <p>{item.name} — {Object.values(item.selectedOptions).join(" · ")} — Rs. {formatPrice(item.price * item.quantity)}</p>
                  <div className="cart-item-controls">
                    <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => changeQuantity(item.key, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button type="button" aria-label={`Add one ${item.name}`} onClick={() => changeQuantity(item.key, 1)}>+</button>
                    <button type="button" onClick={() => removeProduct(item.key)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="cart-checkout">
            <p className="cart-total">Subtotal <strong>Rs. {formatPrice(total)}</strong></p>
            <button id="checkout-button" type="button" onClick={orderOnWhatsApp}>
              Continue on WhatsApp <span aria-hidden="true">↗</span>
            </button>
          </div>
          <p className="checkout-note">Your order details will open in WhatsApp for confirmation.</p>
        </section>

        <section className="contact" id="contact">
          <div className="contact-copy">
            <p className="eyebrow"><span aria-hidden="true"></span> PERSONAL SHOPPING HELP</p>
            <h2>Let's find something <em>you'll love.</em></h2>
            <p className="contact-description">Need help choosing a fabric or placing an order? We're just a message away.</p>
          </div>
          <div className="contact-action">
            <a className="contact-link" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3 20.4l1.3-4.9a8.4 8.4 0 1 1 16.2-3.8Z" />
                <path d="M8.5 8.2c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4-.1.6.5.9 1.2 1.6 2.1 2.1.2.1.4.1.6-.1l.7-.8c.2-.2.4-.3.7-.2l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.2-.7 1.6-.5.4-1.2.7-2 .5-1-.2-2.2-.7-3.7-2-.9-.8-1.6-1.8-2-2.8-.4-1.1-.3-2 .2-2.7Z" />
              </svg>
              <span>Message us on WhatsApp</span>
              <span className="contact-arrow" aria-hidden="true">↗</span>
            </a>
            <p className="contact-number">+92 319 522 8202</p>
          </div>
        </section>
        </>}
      </main>

      <footer>
        <div className="footer-main">
          <div className="footer-brand-block">
            <a className="brand footer-brand" href="#home" aria-label="RUMAIS home">
              <img className="brand-logo" src="/images/logo.jpg" alt="" />
              <span>RUMAIS</span>
            </a>
            <p>Unstitched essentials in Khaddar, velvet and shawls.</p>
          </div>
          <nav className="footer-nav" aria-label="Footer navigation">
            <a href="#collections">Shop the collection</a>
            <a href="#new-arrivals">New arrivals</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="social-links" aria-label="Social media">
            <a href="https://www.instagram.com/itx_azaan_10/" target="_blank" rel="noreferrer" aria-label="Visit RUMAIS on Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" className="social-dot" /></svg>
              <span>Instagram</span><span className="social-arrow" aria-hidden="true">↗</span>
            </a>
            <a href="https://www.facebook.com/azaan.ahmad.186590" target="_blank" rel="noreferrer" aria-label="Visit RUMAIS on Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14 21v-8h3l.5-4H14V7c0-1.2.4-2 2-2h1.7V1.4c-.8-.1-1.8-.2-3-.2-3 0-5 1.8-5 5.2V9H7v4h2.7v8H14Z" /></svg>
              <span>Facebook</span><span className="social-arrow" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <div className="footer-bottom"><p>© 2026 RUMAIS</p><a href="#home">Back to top ↑</a></div>
      </footer>
      <a
        className="floating-whatsapp"
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Order easily on WhatsApp"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M20.5 11.7a8.4 8.4 0 0 1-12.4 7.4L3 20.4l1.3-4.9a8.4 8.4 0 1 1 16.2-3.8Z" />
          <path d="M8.5 8.2c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4-.1.6.5.9 1.2 1.6 2.1 2.1.2.1.4.1.6-.1l.7-.8c.2-.2.4-.3.7-.2l1.6.8c.3.1.4.3.4.5 0 .4-.2 1.2-.7 1.6-.5.4-1.2.7-2 .5-1-.2-2.2-.7-3.7-2-.9-.8-1.6-1.8-2-2.8-.4-1.1-.3-2 .2-2.7Z" />
        </svg>
        <span>Order on WhatsApp</span>
      </a>
    </>
  );
}

export default App;
