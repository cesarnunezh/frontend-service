// App.js
import React, { useEffect, useMemo, useState } from "react";

const runtimeConfig = window.__APP_CONFIG__ || {};
const API_ORDERS =
  runtimeConfig.API_ORDERS ||
  process.env.REACT_APP_API_ORDERS ||
  "http://localhost:8050";
const API_PRODUCTS =
  runtimeConfig.API_PRODUCTS ||
  process.env.REACT_APP_API_PRODUCTS ||
  "http://localhost:8070";
const CART_STORAGE_KEY = "devops_cart_items";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=900&q=60";

const CATEGORIES = [
  { key: "all", label: "All items" },
  { key: "audio", label: "Audio" },
  { key: "wearables", label: "Wearables" },
  { key: "input", label: "Input devices" },
  { key: "displays", label: "Displays" },
  { key: "components", label: "Components" },
];

function money(n) {
  return `$${Number(n).toLocaleString()}`;
}

export default function App() {
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [orderError, setOrderError] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCartItems(parsed);
      }
    } catch {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      setLoadError("");
      try {
        const res = await fetch(`${API_PRODUCTS}/products`);
        if (!res.ok) {
          throw new Error(`Products request failed: ${res.status}`);
        }
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.items;
        if (!Array.isArray(list)) {
          throw new Error("Unexpected products payload");
        }
        const normalized = list.map((p) => ({
          id: p.id,
          title: p.name || p.title || "Unnamed Product",
          price: Number(p.price) || 0,
          cat: p.category || p.cat || "all",
          img: p.image || p.img || FALLBACK_IMAGE,
          desc: p.description || p.desc || "",
          badge: p.badge || "",
        }));
        setProducts(normalized);
      } catch (err) {
        setLoadError(err.message || "Failed to load products...");
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  function handleAddToCart(product) {
    setOrderError("");
    setCheckoutMessage("");
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: product.price,
          img: product.img,
          qty: 1,
        },
      ];
    });
  }

  function incrementQty(productId) {
    setCheckoutMessage("");
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, qty: item.qty + 1 } : item
      )
    );
  }

  function decrementQty(productId) {
    setCheckoutMessage("");
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === productId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function removeFromCart(productId) {
    setCheckoutMessage("");
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }

  async function handleCheckout() {
    if (!cartItems.length || isCheckingOut) {
      return;
    }

    setOrderError("");
    setCheckoutMessage("");
    setIsCheckingOut(true);

    const successIds = [];
    const failedItems = [];

    for (const item of cartItems) {
      try {
        const res = await fetch(`${API_ORDERS}/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: item.id,
            quantity: item.qty,
          }),
        });

        if (!res.ok) {
          throw new Error(`status ${res.status}`);
        }
        successIds.push(item.id);
      } catch (err) {
        failedItems.push({
          id: item.id,
          title: item.title,
          error: err.message || "request failed",
        });
      }
    }

    if (failedItems.length === 0) {
      setCartItems([]);
      setCheckoutMessage("Checkout complete. Orders saved.");
    } else {
      setCartItems((prev) => prev.filter((item) => !successIds.includes(item.id)));
      const failedNames = failedItems.map((item) => item.title).join(", ");
      setOrderError(`Some orders failed: ${failedNames}`);
    }

    setIsCheckingOut(false);
  }

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.qty, 0),
    [cartItems]
  );

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return products.filter((p) => {
      const okTab = tab === "all" ? true : p.cat === tab;
      const okQ = !ql ? true : `${p.title} ${p.desc}`.toLowerCase().includes(ql);
      return okTab && okQ;
    });
  }, [products, tab, q]);

  const sorted = useMemo(() => {
    const items = [...filtered];

    return items.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.price - b.price;
      }
      return b.price - a.price;
    });
  }, [filtered, sortOrder]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-blue-600 text-white">
                <span className="text-sm font-black">UC</span>
              </div>
              <div className="text-lg font-extrabold tracking-tight">
                <a href="/">Final Project</a>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-64 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-600/20"
                placeholder="Search your product..."
              />
            </div>

            <button
              type="button"
              className="relative rounded-lg border border-slate-200 p-2 hover:border-blue-600/40"
              aria-label="cart"
              onClick={() => setIsCartOpen(true)}
            >
              🛒
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-blue-600 text-[10px] text-white">
                {cartCount}
              </span>
            </button>

            <div className="h-9 w-9 rounded-full bg-slate-200" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-6xl px-4">
        <section className="py-8">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950">
            <div className="min-h-[120px] bg-cover bg-right">
              <div className="flex min-h-[120px] flex-col justify-center gap-6 px-8 py-10 md:px-14">
                <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight text-white md:text-5xl">
                  DevOps eCommerce
                </h1>

                <p className="max-w-md text-slate-300">
                  Engineered for creators. Powered by next-gen architecture.
                </p>
              </div>
            </div>

            <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-cyan-300 to-transparent opacity-60" />
          </div>
        </section>

        {/* Tabs */}
        <section className="flex items-center justify-between border-y border-slate-200 bg-white/60 py-4">
          <div className="flex gap-8 overflow-x-auto whitespace-nowrap px-1 text-xs font-semibold tracking-widest">
            {CATEGORIES.map((t) => {
              const active = t.key === tab;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={
                    active
                      ? "border-b-2 border-blue-600 pb-2 text-blue-600"
                      : "pb-2 text-slate-500 hover:text-blue-600"
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
          <div className="hidden md:flex items-center gap-2 pr-2 text-[10px] font-semibold tracking-widest text-slate-500">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="rounded border border-slate-200 px-2 py-1 text-xs"
            >
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </section>

        {/* Products */}
        <section className="py-12">
          {loadingProducts ? (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Loading products from `product-service`...
            </div>
          ) : null}

          {loadError ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {loadError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sorted.map((p) => (
              <div
                key={p.id}
                className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-600/40"
              >
                <div className="relative mb-5 aspect-square overflow-hidden rounded-xl bg-slate-100">
                  <img
                    src={p.img}
                    alt={p.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  {p.badge ? (
                    <span className="absolute left-3 top-3 rounded-md border border-blue-600/20 bg-blue-600/10 px-2 py-1 text-[10px] font-semibold tracking-widest text-blue-700">
                      {p.badge.toUpperCase()}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold">{p.title}</h3>
                    <span className="text-sm font-bold text-blue-600">
                      {money(p.price)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">{p.desc}</p>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(p)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-xs font-bold tracking-widest text-white hover:bg-blue-600"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <button
              type="button"
              className="rounded-lg border border-slate-300 px-10 py-3 text-xs font-semibold tracking-[0.22em] text-slate-900 hover:border-blue-600/40"
            >
              FETCH MORE DATA
            </button>
          </div>
        </section>
      </main>

      {/* Cart Sidebar */}
      {isCartOpen ? (
        <div className="fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            aria-label="Close cart"
            onClick={() => setIsCartOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-extrabold tracking-widest text-slate-900">
                CART ({cartCount})
              </h2>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:border-blue-600 hover:text-blue-600"
              >
                CLOSE
              </button>
            </div>

            <div className="flex h-[calc(100%-170px)] flex-col gap-3 overflow-y-auto pr-1">
              {cartItems.length === 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Your cart is empty.
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex gap-3">
                      <img
                        src={item.img}
                        alt={item.title}
                        className="h-16 w-16 rounded object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{money(item.price)} each</p>
                        <p className="text-xs font-semibold text-slate-700">
                          Line total: {money(item.price * item.qty)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decrementQty(item.id)}
                          className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-blue-600"
                        >
                          -
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => incrementQty(item.id)}
                          className="rounded border border-slate-200 px-2 py-1 text-xs hover:border-blue-600"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs font-semibold text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {orderError ? (
              <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
                {orderError}
              </div>
            ) : null}

            {checkoutMessage ? (
              <div className="mt-4 rounded border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                {checkoutMessage}
              </div>
            ) : null}

            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="mb-3 flex items-center justify-between text-sm font-semibold">
                <span>Subtotal</span>
                <span>{money(cartSubtotal)}</span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                disabled={!cartItems.length || isCheckingOut}
                className="w-full rounded-lg bg-slate-900 py-3 text-xs font-bold tracking-widest text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCheckingOut ? "CHECKING OUT..." : "CHECKOUT"}
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {/* Newsletter */}
      <section className="relative mt-6 bg-slate-950 px-4 py-20 text-center">
        <div className="absolute inset-0 bg-blue-600/5" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            JOIN THE ECOSYSTEM
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-300">
            Early access to firmware updates, beta launches, and drops.
          </p>

          <div className="mx-auto mt-10 flex max-w-lg overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <input
              className="w-full bg-transparent px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500"
              placeholder="admin@neural-link.io"
              type="email"
            />
            <button className="bg-blue-600 px-6 text-xs font-bold tracking-widest text-white hover:bg-blue-600/90">
              CONNECT
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-14 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-md bg-blue-600 text-white">
                <span className="text-xs font-black">V</span>
              </div>
              <div className="text-base font-extrabold tracking-tight">
                VORTEX
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              PRECISION. PERFORMANCE. PARADIGM SHIFT.
              <br />
              EST. 2024. TOKYO - SF - LONDON
            </p>
          </div>

          <div>
            <div className="mb-4 text-[10px] font-bold tracking-[0.3em] text-slate-400">
              SYSTEMS
            </div>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a className="hover:text-blue-600" href="#systems">Neural Core Laptops</a></li>
              <li><a className="hover:text-blue-600" href="#systems">Quantum Desktop</a></li>
              <li><a className="hover:text-blue-600" href="#systems">Symmetry Tablets</a></li>
              <li><a className="hover:text-blue-600" href="#systems">Accessories</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-4 text-[10px] font-bold tracking-[0.3em] text-slate-400">
              RESOURCES
            </div>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a className="hover:text-blue-600" href="#resources">Developer API</a></li>
              <li><a className="hover:text-blue-600" href="#resources">Support Wiki</a></li>
              <li><a className="hover:text-blue-600" href="#resources">Firmware Repo</a></li>
              <li><a className="hover:text-blue-600" href="#resources">Logistics</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-4 text-[10px] font-bold tracking-[0.3em] text-slate-400">
              SOCIAL
            </div>
            <div className="flex gap-3">
              {["*", "#", "@"].map((x, i) => (
                <a
                  key={i}
                  href="#social"
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-blue-600/40 hover:text-blue-600"
                >
                  {x}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 md:flex-row">
            <p className="text-[10px] font-semibold tracking-widest text-slate-400">
              (c) 2024 VORTEX TECHNOLOGIES. ROOT ACCESS GRANTED.
            </p>
            <div className="flex gap-6 text-[10px] font-semibold tracking-widest text-slate-400">
              <a className="hover:text-blue-600" href="#protocol">PROTOCOL</a>
              <a className="hover:text-blue-600" href="#directives">DIRECTIVES</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
