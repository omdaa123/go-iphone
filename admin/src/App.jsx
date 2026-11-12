import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, Box, Boxes, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Command, CreditCard, ExternalLink,
  Eye, FileText, Gauge, Image, LayoutDashboard, LogOut, Menu, Package,
  Plus, RefreshCw, Search, Settings, ShieldCheck, ShoppingBag, ShoppingCart,
  SlidersHorizontal, Sparkles, Users, X, AlertTriangle, CheckCircle2,
  Clock3, Smartphone, Layers3
} from "lucide-react";

const API = "/admin";
const money = (cents = 0) => new Intl.NumberFormat("en-EG", {
  style: "currency", currency: "EGP", maximumFractionDigits: 0
}).format(Number(cents || 0) / 100);
const date = (value) => value ? new Date(value).toLocaleDateString("en-GB", {
  day: "2-digit", month: "short", year: "numeric"
}) : "—";
const titleCase = (value = "") => String(value).replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());

async function request(path, options = {}) {
  const method = String(options.method || "GET").toUpperCase();
  if (import.meta.env.DEV && method !== "GET" && !path.startsWith("/auth/")) {
    throw new Error("Local preview is read-only. Changes are blocked to protect your live store.");
  }
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

const navGroups = [
  { label: "OVERVIEW", items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { label: "COMMERCE", items: [
    { id: "products", label: "Products", icon: Package },
    { id: "inventory", label: "Inventory", icon: Boxes },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "reservations", label: "Reservations", icon: Clock3 },
    { id: "customers", label: "Customers", icon: Users },
  ]},
  { label: "STORE EXPERIENCE", items: [
    { id: "homepage", label: "Homepage Builder", icon: Layers3 },
    { id: "design", label: "Design Studio", icon: Sparkles },
    { id: "media", label: "Media Library", icon: Image },
    { id: "collections", label: "Collections", icon: ShoppingBag },
  ]},
  { label: "SYSTEM", items: [
    { id: "team", label: "Team & Access", icon: ShieldCheck },
    { id: "settings", label: "Settings", icon: Settings },
  ]},
];


async function compressImage(file) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Could not process this image.")), "image/webp", 0.82));
  if (blob.size > 8 * 1024 * 1024) throw new Error("Image is too large after compression (8MB maximum).");
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(blob);
  });
}

function Brand() {
  return <div className="brand"><div className="brand-mark">G</div><div><b>GO iPhone</b><span>COMMERCE CONTROL</span></div></div>;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("credentials");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      if (step === "credentials") {
        const data = await request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
        if (data.totpRequired) setStep("totp");
        else onLogin(data.user);
      } else {
        const data = await request("/auth/totp-verify", { method: "POST", body: JSON.stringify({ code }) });
        onLogin(data.user);
      }
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return <main className="login-shell">
    <div className="login-glow" />
    <div className="login-card">
      <Brand />
      <div className="login-kicker">SECURE ADMIN PORTAL</div>
      <h1>{step === "credentials" ? "Welcome back." : "Verify it's you."}</h1>
      <p className="muted">{step === "credentials" ? "Sign in to manage your store operations." : "Enter the 6-digit code from your authenticator app."}</p>
      <form onSubmit={submit} className="login-form">
        {step === "credentials" ? <>
          <label>Email address<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@goiphone.com" /></label>
          <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" /></label>
        </> : <label>Authentication code<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" /></label>}
        {error && <div className="alert error"><AlertTriangle size={16}/>{error}</div>}
        <button className="btn primary full" disabled={busy}>{busy ? "Please wait…" : step === "credentials" ? "Sign in" : "Verify & continue"}</button>
        {step === "totp" && <button type="button" className="text-btn" onClick={() => { setStep("credentials"); setCode(""); setError(""); }}>Back to sign in</button>}
      </form>
      <div className="login-foot"><ShieldCheck size={15}/> Protected by encrypted sessions and role-based access</div>
    </div>
    <div className="login-bottom">GO IPHONE <span>·</span> ADMINISTRATION</div>
  </main>;
}


function TwoFactorSetup({ onComplete, onError }) {
  const [setup, setSetup] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    request("/auth/totp-setup", { method: "POST" })
      .then(setSetup)
      .catch(e => onError(e.message))
      .finally(() => setLoading(false));
  }, [onError]);
  async function confirm(event) {
    event.preventDefault(); setBusy(true);
    try {
      await request("/auth/totp-confirm", { method: "POST", body: JSON.stringify({ code }) });
      onComplete();
    } catch (e) { onError(e.message); }
    finally { setBusy(false); }
  }
  return <main className="login-shell"><div className="login-glow"/>
    <div className="login-card"><Brand/><div className="login-kicker">ACCOUNT SECURITY</div>
      <h1>Secure your account.</h1>
      <p className="muted">Two-factor authentication is required for this role. Scan the QR code with an authenticator app, then enter the current 6-digit code.</p>
      {loading ? <div className="loading-panel"><span className="spinner"/>Preparing secure setup…</div> : setup ? <form className="login-form" onSubmit={confirm}>
        <div className="qr-wrap"><img src={setup.qrDataUrl} alt="Authenticator setup QR code"/><span>Scan with Google Authenticator, 1Password, or another TOTP app.</span></div>
        <div className="secret-box"><span>MANUAL SETUP KEY</span><code>{setup.secret}</code></div>
        <label>6-digit verification code<input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000"/></label>
        <button className="btn primary full" disabled={busy || code.length !== 6}>{busy ? "Verifying…" : "Enable two-factor authentication"}</button>
      </form> : <div className="alert error">Could not start two-factor setup. Refresh and sign in again.</div>}
      <div className="login-foot"><ShieldCheck size={15}/> Your account cannot access store data until setup is complete.</div>
    </div><div className="login-bottom">GO IPHONE <span>·</span> ACCOUNT SECURITY</div>
  </main>;
}

function StatCard({ label, value, detail, icon: Icon, tone = "blue" }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={`stat-icon ${tone}`}><Icon size={18}/></span></div><strong>{value}</strong><div className="stat-detail">{detail}</div></div>;
}

function EmptyState({ icon: Icon = Box, title, detail }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={22}/></div><b>{title}</b><p>{detail}</p></div>;
}

function Dashboard({ stats, loading, onRefresh, onNavigate }) {
  const orders = stats?.orders || {};
  const products = stats?.products || {};
  const units = stats?.units || {};
  const totalProducts = Object.values(products).reduce((a, b) => a + Number(b || 0), 0);
  const totalOrders = Object.values(orders).reduce((a, b) => a + Number(b || 0), 0);
  const totalUnits = Object.values(units).reduce((a, b) => a + Number(b || 0), 0);
  const lowStock = stats?.lowStock || [];
  return <>
    <div className="page-heading"><div><div className="eyebrow">OVERVIEW</div><h1>Dashboard</h1><p>Your store, at a glance.</p></div><button className="btn secondary" onClick={onRefresh}><RefreshCw size={15}/> Refresh</button></div>
    {loading ? <div className="loading-panel"><span className="spinner"/> Loading store data…</div> : <div className="stats-grid">
      <StatCard label="Total products" value={totalProducts.toLocaleString()} detail={`${products.published || 0} published · ${products.draft || 0} drafts`} icon={Package}/>
      <StatCard label="Total orders" value={totalOrders.toLocaleString()} detail={`${orders.New || 0} new orders`} icon={ShoppingCart} tone="violet"/>
      <StatCard label="Inventory units" value={totalUnits.toLocaleString()} detail={`${units.available || 0} available right now`} icon={Boxes} tone="green"/>
      <StatCard label="Gross revenue" value={stats?.revenueCents == null ? "—" : money(stats.revenueCents)} detail="Excludes cancelled orders" icon={CreditCard} tone="amber"/>
    </div>}
    <div className="dashboard-grid">
      <section className="panel"><div className="panel-head"><div><h2>Recent orders</h2><p>Latest customer activity</p></div><button className="link-btn" onClick={() => onNavigate("orders")}>View all <ChevronRight size={14}/></button></div>
        {(stats?.recentOrders || []).length ? <div className="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>STATUS</th><th className="right">TOTAL</th></tr></thead><tbody>{stats.recentOrders.map(o => <tr key={o.id}><td className="mono">#{String(o.id).slice(-7).toUpperCase()}</td><td>{o.customer_name || "Guest"}</td><td>{date(o.created_at)}</td><td><span className={`status ${String(o.status).toLowerCase()}`}>{o.status}</span></td><td className="right">{money(o.total_cents)}</td></tr>)}</tbody></table></div> : <EmptyState icon={ShoppingCart} title="No orders yet" detail="New customer orders will appear here."/>}
      </section>
      <section className="panel"><div className="panel-head"><div><h2>Stock watch</h2><p>Products with 3 or fewer units</p></div><span className="count-pill">{lowStock.length} alerts</span></div>
        {lowStock.length ? <div className="stock-list">{lowStock.map((item, i) => <div className="stock-row" key={item.product_id + i}><div className="product-avatar"><Smartphone size={17}/></div><div className="stock-name"><b>{item.name}</b><span>{item.storage || "Standard variant"}</span></div><span className={`stock-qty ${Number(item.stock_qty) === 0 ? "danger" : ""}`}>{item.stock_qty} left</span></div>)}</div> : <EmptyState icon={CheckCircle2} title="Stock looks healthy" detail="No low-stock variants were reported."/>}
      </section>
    </div>
    <section className="quick-actions"><div><div className="eyebrow">QUICK ACCESS</div><h2>Keep things moving.</h2></div><button onClick={() => onNavigate("products")}><Plus size={17}/> Manage products</button><button onClick={() => onNavigate("orders")}><ShoppingCart size={17}/> Review orders</button><button onClick={() => onNavigate("inventory")}><Boxes size={17}/> Check inventory</button></section>
  </>;
}

function Products({ onError }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [refresh, setRefresh] = useState(0);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [media, setMedia] = useState([]);
  const [collections, setCollections] = useState([]);
  const [collectionIds, setCollectionIds] = useState([]);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [primaryImageMediaId, setPrimaryImageMediaId] = useState("");
  const [galleryMediaIds, setGalleryMediaIds] = useState([]);
  const empty = { name: "", categoryKey: "iphone", productType: "smartphone", tagline: "", visibility: "draft", salesMode: "for_sale", availability: "in_stock", variants: [{ storage: "", color: "", price: "", stockQty: "" }] };
  const [form, setForm] = useState(empty);
  useEffect(() => {
    let active = true;
    request("/collections").then(d => { if (active) setCollections(d.collections || []); }).catch(e => onError(e.message));
    return () => { active = false; };
  }, [onError]);
  useEffect(() => {
    let active = true; setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (visibility !== "all") params.set("visibility", visibility);
    request(`/products?${params}`).then(d => { if (active) setItems(d.products || []); })
      .catch(e => onError(e.message)).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, visibility, refresh, onError]);
  function startNew() { setEditing("new"); setForm(empty); setPrimaryImageMediaId(""); setGalleryMediaIds([]); setCollectionIds([]); }
  async function startEdit(id) {
    try {
      const d = await request(`/products/${id}`), p = d.product;
      await loadMedia();
      setPrimaryImageMediaId(d.primaryImage?.id || ""); setGalleryMediaIds(d.gallery.map(x => x.id));
      setCollectionIds(d.collectionIds || []);
      setForm({ name: p.name || "", slug: p.slug || "", categoryKey: p.category_key, productType: p.product_type, tagline: p.tagline || "", visibility: p.visibility, salesMode: p.sales_mode, availability: p.availability, variants: d.variants.length ? d.variants.map(v => ({ storage: v.storage || "", color: v.color || "", price: String(Number(v.price_cents) / 100), stockQty: v.stock_qty == null ? "" : String(v.stock_qty) })) : [{ storage: "", color: "", price: "", stockQty: "" }] });
      setEditing(id);
    } catch (e) { onError(e.message); }
  }
  async function loadMedia() { try { const d = await request("/media"); setMedia(d.media || []); } catch (e) { onError(e.message); } }
  async function uploadMedia(file) { if (!file) return; setUploading(true); try { const dataUrl = await compressImage(file); const d = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "product" }) }); setMedia(current => [d.media, ...current]); setPrimaryImageMediaId(d.media.id); } catch (e) { onError(e.message); } finally { setUploading(false); } }
  function addVariant() { setForm(f => ({ ...f, variants: [...f.variants, { storage: "", color: "", price: "", stockQty: "" }] })); }
  function changeVariant(index, key, value) { setForm(f => ({ ...f, variants: f.variants.map((v, i) => i === index ? { ...v, [key]: value } : v) })); }
  async function removeProduct() {
    try { await request(`/products/${deleteId}`, { method: "DELETE" }); setDeleteId(""); setRefresh(v => v + 1); }
    catch (e) { onError(e.message); }
  }
  async function save(event) {
    event.preventDefault(); setSaving(true);
    const variants = form.variants.filter(v => v.price !== "").map(v => ({ storage: v.storage || null, color: v.color || null, priceCents: Math.round(Number(v.price) * 100), stockQty: v.stockQty === "" ? null : Number(v.stockQty) }));
    const payload = { primaryImageMediaId: primaryImageMediaId || null, galleryMediaIds, collectionIds, name: form.name.trim(), categoryKey: form.categoryKey, productType: form.productType.trim(), tagline: form.tagline || null, visibility: form.visibility, salesMode: form.salesMode, availability: form.availability, variants };
    if (form.slug) payload.slug = form.slug;
    try {
      await request(editing === "new" ? "/products" : `/products/${editing}`, { method: editing === "new" ? "POST" : "PATCH", body: JSON.stringify(payload) });
      setEditing(null); setRefresh(v => v + 1);
    } catch (e) { onError(e.message); } finally { setSaving(false); }
  }
  return <>
    <div className="page-heading"><div><div className="eyebrow">CATALOGUE</div><h1>Products</h1><p>Manage your product catalogue and visibility.</p></div><div className="heading-actions"><button className="btn secondary" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={15}/> Refresh</button><button className="btn primary" onClick={startNew}><Plus size={15}/> Add product</button></div></div>
    <section className="panel">
      <div className="toolbar"><div className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products…"/></div><select value={visibility} onChange={e => setVisibility(e.target.value)}><option value="all">All visibility</option><option value="published">Published</option><option value="draft">Draft</option><option value="hidden">Hidden</option></select><span className="results-count">{items.length} products</span></div>
      {loading ? <div className="loading-panel"><span className="spinner"/> Loading products…</div> : items.length ? <div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>TYPE</th><th>PRICE FROM</th><th>VISIBILITY</th><th>UPDATED</th><th>ACTIONS</th></tr></thead><tbody>{items.map(p => <tr key={p.id}><td><div className="product-cell">{p.image_url ? <img src={p.image_url} alt="" /> : <div className="product-avatar"><Smartphone size={17}/></div>}<div><b>{p.name}</b><span className="subline">{p.slug || p.id}</span></div></div></td><td>{titleCase(p.category_key)}</td><td>{titleCase(p.product_type)}</td><td>{p.from_price_cents == null ? "—" : money(p.from_price_cents)}</td><td><span className={`status ${p.visibility}`}>{p.visibility}</span></td><td>{date(p.updated_at)}</td><td><div className="row-actions"><button className="btn secondary small" onClick={() => startEdit(p.id)}>Edit</button><button className="btn danger small" onClick={() => setDeleteId(p.id)}>Delete</button></div></td></tr>)}</tbody></table></div> : <EmptyState icon={Package} title="No products found" detail="Add your first product to start building the catalogue."/>}
    </section>
    {editing && <div className="modal-backdrop"><form className="editor-modal" onSubmit={save}>
      <div className="modal-head"><div><div className="eyebrow">CATALOGUE</div><h2>{editing === "new" ? "Add product" : "Edit product"}</h2></div><button type="button" className="icon-btn" onClick={() => setEditing(null)}><X size={19}/></button></div>
      <div className="editor-grid">
        <label className="field-wide">Product name<input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}/></label>
        <label>Category<select value={form.categoryKey} onChange={e => setForm(f => ({ ...f, categoryKey: e.target.value }))}>{["iphone","ipad","mac","watch","airpods","apple-accessory","other-accessory"].map(k => <option key={k} value={k}>{titleCase(k)}</option>)}</select></label>
        <label>Product type<input required value={form.productType} onChange={e => setForm(f => ({ ...f, productType: e.target.value }))}/></label>
        <label className="field-wide">Description<input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}/></label>
        <label>Sales mode<select value={form.salesMode} onChange={e => setForm(f => ({ ...f, salesMode: e.target.value }))}><option value="for_sale">For sale</option><option value="reservation">Reservation</option></select></label>
        <label>Availability<select value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option><option value="coming_soon">Coming soon</option><option value="preorder">Pre-order</option></select></label>
        <label>Visibility<select value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}><option value="draft">Draft</option><option value="published">Published</option><option value="hidden">Hidden</option></select></label>
      </div>
      <section className="collection-selector"><div><h3>Homepage collections</h3><p>Choose which storefront sections should feature this product.</p></div><div className="collection-check-grid">{collections.map(collection => <label key={collection.id} className="collection-check"><input type="checkbox" checked={collectionIds.includes(collection.id)} onChange={e => setCollectionIds(ids => e.target.checked ? [...ids, collection.id] : ids.filter(id => id !== collection.id))}/><span><b>{collection.name}</b>{collection.is_system && <small>Built-in</small>}</span></label>)}</div></section>
      <div className="image-manager"><div><h3>Product images</h3><p>Choose the main product photo and optional gallery images.</p></div><div className="image-manager-actions"><button type="button" className="btn secondary small" onClick={() => { loadMedia(); setMediaOpen(true); }}><Image size={14}/> Choose from library</button><label className="btn secondary small upload-label">{uploading ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e => uploadMedia(e.target.files?.[0])}/></label></div>{primaryImageMediaId && <div className="selected-image"><img src={media.find(m => m.id === primaryImageMediaId)?.url || ""} alt="Selected primary product"/> <span>Main image selected</span><button type="button" className="text-btn" onClick={() => setPrimaryImageMediaId("")}>Remove</button></div>}</div>
      {mediaOpen && <div className="media-picker-backdrop"><div className="media-picker"><div className="modal-head"><div><div className="eyebrow">MEDIA LIBRARY</div><h2>Choose product images</h2></div><button type="button" className="icon-btn" onClick={() => setMediaOpen(false)}><X size={18}/></button></div>{media.length ? <div className="media-picker-grid">{media.map(m => <div key={m.id} className={primaryImageMediaId === m.id || galleryMediaIds.includes(m.id) ? "media-choice selected" : "media-choice"}><img src={m.url} alt={m.file_name || "Store media"}/><span>{m.file_name || "Image"}</span><div className="media-choice-actions"><button type="button" onClick={() => setPrimaryImageMediaId(m.id)}>{primaryImageMediaId === m.id ? "Main image ✓" : "Set main"}</button><button type="button" onClick={() => setGalleryMediaIds(ids => ids.includes(m.id) ? ids.filter(id => id !== m.id) : [...ids, m.id])}>{galleryMediaIds.includes(m.id) ? "Remove gallery" : "Add to gallery"}</button></div></div>)}</div> : <p className="muted">No images uploaded yet. Upload an image to get started.</p>}<div className="modal-foot"><button type="button" className="btn secondary" onClick={() => setMediaOpen(false)}>Done</button></div></div></div>}
      <div className="variant-heading"><div><h3>Pricing & variants</h3><p>Enter prices in Egyptian pounds. Add every storage and color option.</p></div><button type="button" className="btn secondary small" onClick={addVariant}><Plus size={13}/> Add variant</button></div>
      {form.variants.map((v, i) => <div className="variant-row" key={i}>
        <label>Storage<input value={v.storage} onChange={e => changeVariant(i, "storage", e.target.value)}/></label>
        <label>Color<input value={v.color} onChange={e => changeVariant(i, "color", e.target.value)}/></label>
        <label>Price (EGP)<input type="number" min="0" step="0.01" required value={v.price} onChange={e => changeVariant(i, "price", e.target.value)}/></label>
        <label>Stock qty<input type="number" min="0" step="1" value={v.stockQty} onChange={e => changeVariant(i, "stockQty", e.target.value)}/></label>
        <button type="button" className="icon-btn danger-icon" title="Remove variant" disabled={form.variants.length === 1} onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, j) => j !== i) }))}><X size={15}/></button>
      </div>)}
      <div className="modal-foot"><button type="button" className="btn secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save product"}</button></div>
    </form></div>}
    {deleteId && <div className="modal-backdrop"><div className="confirm-modal"><div className="eyebrow">CONFIRM ACTION</div><h2>Delete this product?</h2><p>This permanently removes the product and its linked variants and inventory units.</p><div className="modal-foot"><button className="btn secondary" onClick={() => setDeleteId("")}>Cancel</button><button className="btn danger" onClick={removeProduct}>Delete product</button></div></div></div>}
  </>;
}

function Orders({ onError }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState("");
  const [refresh, setRefresh] = useState(0);
  const load = useCallback(() => {
    setLoading(true);
    request("/orders").then(d => setItems(d.orders || [])).catch(e => onError(e.message)).finally(() => setLoading(false));
  }, [onError]);
  useEffect(() => { load(); }, [load, refresh]);
  const visible = useMemo(() => filter === "all" ? items : items.filter(o => o.status === filter), [items, filter]);
  async function updateStatus(order, status) {
    setBusyId(order.id);
    try {
      await request(`/orders/${order.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setItems(current => current.map(o => o.id === order.id ? { ...o, status } : o));
    } catch (e) { onError(e.message); }
    finally { setBusyId(""); }
  }
  return <>
    <div className="page-heading"><div><div className="eyebrow">COMMERCE</div><h1>Orders</h1><p>Track and process customer orders.</p></div><button className="btn secondary" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={15}/> Refresh</button></div>
    <section className="panel"><div className="toolbar"><div className="filter-tabs">{["all","New","Confirmed","Preparing","Ready","Completed","Cancelled"].map(s => <button key={s} className={filter === s ? "selected" : ""} onClick={() => setFilter(s)}>{s === "all" ? "All orders" : s}</button>)}</div><span className="results-count">{visible.length} orders</span></div>
      {loading ? <div className="loading-panel"><span className="spinner"/> Loading orders…</div> : visible.length ? <div className="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>DATE</th><th>PAYMENT</th><th>STATUS</th><th className="right">TOTAL</th></tr></thead><tbody>{visible.map(o => <tr key={o.id}><td className="mono">#{String(o.id).slice(-7).toUpperCase()}</td><td><b>{o.customer_name || "Guest"}</b><span className="subline">{o.customer_phone || ""}</span></td><td>{(o.items || []).length || 0}</td><td>{date(o.created_at)}</td><td><span className={`status ${String(o.payment_status || "pending").toLowerCase()}`}>{o.payment_status || "pending"}</span></td><td><select className="status-select" disabled={busyId === o.id} value={o.status} onChange={e => updateStatus(o, e.target.value)}>{["New","Confirmed","Preparing","Ready","Completed","Cancelled"].map(s => <option key={s}>{s}</option>)}</select></td><td className="right">{money(o.total_cents)}</td></tr>)}</tbody></table></div> : <EmptyState icon={ShoppingCart} title="No orders here" detail="Orders will appear here as customers check out."/>}
    </section>
  </>;
}


function MediaLibrary({ onError }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [deleting, setDeleting] = useState("");
  const [query, setQuery] = useState("");
  const [usageFilter, setUsageFilter] = useState("all");
  const localPreview = import.meta.env.DEV;
  useEffect(() => { let active = true; request("/media").then(d => { if(active) setItems(d.media || []); }).catch(e => onError(e.message)).finally(() => { if(active) setLoading(false); }); return () => { active = false; }; }, [refresh, onError]);

  async function uploadFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true);
    let completed = 0;
    const failures = [];
    for (const file of files) {
      setUploadProgress(`Uploading ${completed + 1} of ${files.length}: ${file.name}`);
      try {
        const dataUrl = await compressImage(file);
        const d = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "store" }) });
        setItems(current => [d.media, ...current]);
      } catch (e) { failures.push(`${file.name}: ${e.message}`); }
      completed += 1;
    }
    setUploading(false);
    setUploadProgress("");
    if (failures.length) onError(`${completed - failures.length} uploaded; ${failures.length} failed. ${failures[0]}`);
  }

  async function remove(id) {
    try { await request(`/media/${id}`, { method: "DELETE" }); setItems(list => list.filter(x => x.id !== id)); setDeleting(""); }
    catch (e) { onError(e.message); }
  }

  const usageTags = [...new Set(items.map(item => item.usage_tag || "uncategorized"))].sort();
  const filtered = items.filter(item => {
    const name = String(item.file_name || "").toLowerCase();
    const tag = String(item.usage_tag || "uncategorized").toLowerCase();
    const matchesQuery = !query.trim() || name.includes(query.trim().toLowerCase()) || tag.includes(query.trim().toLowerCase());
    return matchesQuery && (usageFilter === "all" || tag === usageFilter);
  });

  return <>
    <div className="page-heading"><div><div className="eyebrow">STORE EXPERIENCE</div><h1>Media Library</h1><p>Upload, search and organize product photography and store assets.</p></div><label className="btn primary upload-label">{uploading ? "Uploading…" : <><Plus size={15}/> Upload images</>}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading || localPreview} onChange={e => { uploadFiles(e.target.files); e.target.value = ""; }}/></label></div>
    {localPreview && <div className="design-safety-note"><ShieldCheck size={17}/><div><b>Safe local preview</b><span>Uploads and deletes are disabled in development so this workspace cannot change live store media.</span></div></div>}
    <section className="panel">
      <div className="panel-head"><div><h2>All media <span className="count-pill">{items.length} assets</span></h2><p>Images are compressed before upload. Maximum 8MB per image.</p></div><button className="btn secondary" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={14}/> Refresh</button></div>
      {uploadProgress && <div className="media-upload-progress"><span className="spinner"/>{uploadProgress}</div>}
      <div className="media-toolbar"><div className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search file names or tags…"/></div><select value={usageFilter} onChange={e => setUsageFilter(e.target.value)}><option value="all">All asset types</option>{usageTags.map(tag => <option key={tag} value={tag}>{titleCase(tag)}</option>)}</select><span className="results-count">{filtered.length} shown</span></div>
      {loading ? <div className="loading-panel"><span className="spinner"/> Loading media…</div> : filtered.length ? <div className="media-library-grid">{filtered.map(m => <article className="media-card" key={m.id}><img src={m.url} alt={m.file_name || "Store asset"}/><div><b title={m.file_name}>{m.file_name || "Image asset"}</b><span>{m.usage_tag || "Uncategorized"} · {Math.max(1, Math.round((m.bytes || 0) / 1024))} KB</span><button className="text-btn danger-text" disabled={localPreview} onClick={() => setDeleting(m.id)}>Delete asset</button></div></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Image size={22}/></div><b>{items.length ? "No matching assets" : "Your media library is empty"}</b><p>{items.length ? "Try another search or asset type." : "Upload your first product image to get started."}</p></div>}
    </section>
    {deleting && <div className="modal-backdrop"><div className="confirm-modal"><h2>Delete this image?</h2><p>If this image is used by a product or category, the database may prevent deletion or clear its reference.</p><div className="modal-foot"><button className="btn secondary" onClick={() => setDeleting("")}>Cancel</button><button className="btn danger" onClick={() => remove(deleting)}>Delete image</button></div></div></div>}
  </>;
}


function HomepageBuilder({ onError }) {
  const blank = { eyebrow: "GO IPHONE", title: "", subtitle: "", badge: "", ctaText: "Shop now", linkCategoryKey: "iphone", linkProductId: "", imageMediaId: "", mobileImageMediaId: "", active: true, durationMs: 6500 };
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [siteContent, setSiteContent] = useState({
    homepageLayout: [
      { id: "hero", label: "Hero banner", visible: true, order: 0 },
      { id: "categories", label: "Categories", visible: true, order: 1 },
      { id: "collections", label: "Product collections", visible: true, order: 2 },
      { id: "tools", label: "Tools", visible: true, order: 3 },
      { id: "trust", label: "Trust", visible: true, order: 4 },
    ],
    toolsSection: { visible: true, eyebrow: "Tools", title: "Not sure which to choose?" },
    trustSection: { visible: true, points: [
      { id: "warranty", title: "Every device warrantied", desc: "New and certified pre-owned devices each ship with a Go iPhone warranty.", visible: true },
      { id: "battery", title: "Battery health disclosed", desc: "Pre-owned battery health and condition are graded and shown before you buy.", visible: true },
      { id: "grading", title: "Individually graded", desc: "Each pre-owned unit is inspected on its own, not sold by a generic condition tier.", visible: true },
      { id: "delivery", title: "Cash on delivery", desc: "Pay when your order arrives, anywhere we deliver.", visible: true },
    ] },
  });
  const [categoryMediaTarget, setCategoryMediaTarget] = useState("");
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [mediaTarget, setMediaTarget] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all([request("/hero-slides"), request("/media"), request("/categories"), request("/site-content")]);
      setSlides(results[0].heroSlides || []);
      setMedia(results[1].media || []);
      setCategories(results[2].categories || []);
      const saved = results[3].siteContent || {};
      setSiteContent(current => ({
        ...current,
        ...saved,
        homepageLayout: Array.isArray(saved.homepageLayout) ? saved.homepageLayout : current.homepageLayout,
        toolsSection: { ...current.toolsSection, ...(saved.toolsSection || {}) },
        trustSection: { ...current.trustSection, ...(saved.trustSection || {}), points: Array.isArray(saved.trustSection?.points) ? saved.trustSection.points : current.trustSection.points },
      }));
    } catch (e) { onError(e.message); }
    finally { setLoading(false); }
  }, [onError]);
  useEffect(() => { load(); }, [load, refresh]);
  function updateHomepageLayout(id, patch) {
    setSiteContent(current => ({ ...current, homepageLayout: current.homepageLayout.map(item => item.id === id ? { ...item, ...patch } : item) }));
  }
  function moveHomepageSection(index, direction) {
    setSiteContent(current => {
      const items = [...current.homepageLayout].sort((a, b) => a.order - b.order);
      const target = index + direction;
      if (target < 0 || target >= items.length) return current;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...current, homepageLayout: items.map((item, i) => ({ ...item, order: i })) };
    });
  }
  async function saveSiteSection(section, data) {
    setSaving(true);
    try {
      await request("/site-content/" + section, { method: "PUT", body: JSON.stringify(data) });
      setSiteContent(current => ({ ...current, [section]: data }));
    } catch (e) { onError(e.message); }
    finally { setSaving(false); }
  }
  function updateTrustPoint(index, key, value) {
    setSiteContent(current => ({ ...current, trustSection: { ...current.trustSection, points: current.trustSection.points.map((point, i) => i === index ? { ...point, [key]: value } : point) } }));
  }
  async function uploadToolsImage(file, key) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const d = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "tools" }) });
      setMedia(list => [d.media, ...list]);
      setSiteContent(current => ({ ...current, toolsSection: { ...current.toolsSection, [key]: d.media.url } }));
    } catch (e) { onError(e.message); }
    finally { setUploading(false); }
  }
  async function uploadTrustImage(file, index) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const d = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "trust" }) });
      setMedia(list => [d.media, ...list]);
      updateTrustPoint(index, "image", d.media.url);
    } catch (e) { onError(e.message); }
    finally { setUploading(false); }
  }
  function startNew() { setForm({ ...blank }); setEditing("new"); }
  function startEdit(slide) {
    setForm({
      eyebrow: slide.eyebrow || "", title: slide.title || "", subtitle: slide.subtitle || "",
      badge: slide.badge || "", ctaText: slide.cta_text || "", linkCategoryKey: slide.link_category_key || "iphone",
      linkProductId: slide.link_product_id || "", imageMediaId: slide.image_media_id || "",
      mobileImageMediaId: slide.mobile_image_media_id || "", active: slide.active !== false,
      durationMs: Number(slide.duration_ms || 6500),
    });
    setEditing(slide.id);
  }
  async function upload(file, target) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const d = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "hero" }) });
      setMedia(list => [d.media, ...list]);
      setForm(f => ({ ...f, [target]: d.media.id }));
    } catch (e) { onError(e.message); }
    finally { setUploading(false); }
  }
  async function assignCategoryImage(key, imageMediaId) {
    try {
      const d = await request(`/categories/${encodeURIComponent(key)}/image`, {
        method: "PATCH", body: JSON.stringify({ imageMediaId: imageMediaId || null }),
      });
      setCategories(list => list.map(category => category.key === key
        ? { ...category, image_media_id: imageMediaId || null, image_url: media.find(m => m.id === imageMediaId)?.url || null }
        : category));
      setCategoryMediaTarget("");
    } catch (e) { onError(e.message); }
  }
  async function uploadCategoryImage(file, key) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const d = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "category" }) });
      setMedia(list => [d.media, ...list]);
      await assignCategoryImage(key, d.media.id);
    } catch (e) { onError(e.message); }
    finally { setUploading(false); }
  }
  async function save(event) {
    event.preventDefault(); setSaving(true);
    const payload = {
      eyebrow: form.eyebrow || null, title: form.title.trim(), subtitle: form.subtitle || null,
      badge: form.badge || null, ctaText: form.ctaText || null,
      linkCategoryKey: form.linkCategoryKey || null, linkProductId: form.linkProductId || null,
      imageMediaId: form.imageMediaId || null, mobileImageMediaId: form.mobileImageMediaId || null,
      active: form.active, durationMs: Number(form.durationMs),
    };
    try {
      await request(editing === "new" ? "/hero-slides" : "/hero-slides/" + editing, {
        method: editing === "new" ? "POST" : "PATCH", body: JSON.stringify(payload),
      });
      setEditing(null); setRefresh(v => v + 1);
    } catch (e) { onError(e.message); }
    finally { setSaving(false); }
  }
  async function remove(id) {
    if (!window.confirm("Delete this hero slide? This cannot be undone.")) return;
    try { await request("/hero-slides/" + id, { method: "DELETE" }); setSlides(list => list.filter(x => x.id !== id)); }
    catch (e) { onError(e.message); }
  }
  async function move(index, direction) {
    const next = [...slides]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSlides(next);
    try { await request("/hero-slides/reorder", { method: "POST", body: JSON.stringify({ orderedIds: next.map(x => x.id) }) }); }
    catch (e) { onError(e.message); load(); }
  }
  const selectedImage = id => media.find(m => m.id === id)?.url || "";
  return <>
    <div className="page-heading"><div><div className="eyebrow">STORE EXPERIENCE</div><h1>Homepage Builder</h1><p>Manage the images and banners customers see across your storefront.</p></div><div className="heading-actions"><button className="btn secondary" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={15}/> Refresh</button><button className="btn primary" onClick={startNew}><Plus size={15}/> Add hero slide</button></div></div>
    <div className="homepage-commandbar">
      <div className="homepage-commandbar-copy"><span className="homepage-kicker">STORE EXPERIENCE / CONTENT CONTROL</span><h2>Shape the first impression.</h2><p>Build, organize and refine every section of your storefront from one workspace.</p></div>
      <div className="homepage-commandbar-status"><span className="homepage-status-dot"/><div><b>Storefront connected</b><small>Content workspace</small></div></div>
    </div>
    <div className="homepage-metrics">
      <div><span>HERO SLIDES</span><b>{slides.length}</b><small>{slides.filter(slide => slide.active).length} currently visible</small></div>
      <div><span>SHOPPING CATEGORIES</span><b>{categories.length}</b><small>Category image controls</small></div>
      <div><span>PAGE SECTIONS</span><b>{siteContent.homepageLayout.length}</b><small>{siteContent.homepageLayout.filter(item => item.visible !== false).length} enabled on homepage</small></div>
      <div><span>MEDIA ASSETS</span><b>{media.length}</b><small>Available in your library</small></div>
    </div>
    <nav className="homepage-tabs" aria-label="Homepage builder sections">
      {[["overview","Hero & banners"],["layout","Page structure"],["categories","Category visuals"],["content","Content & trust"]].map(([id,label],index)=><button type="button" key={id} className={activeTab===id?"active":""} onClick={()=>setActiveTab(id)}><span>0{index+1}</span>{label}</button>)}
    </nav>
    {activeTab === "layout" && <section className="panel homepage-editor-panel" style={{ marginBottom: 24 }}>
      <div className="panel-head"><div><h2>Homepage sections</h2><p>Edit the Tools and Trust content shown below your product collections.</p></div></div>
      <div style={{ padding: 22, display: "grid", gap: 24 }}>
        <div>
          <div className="row-actions" style={{ justifyContent: "space-between", marginBottom: 14 }}>
            <div><h3>Homepage section order</h3><p className="muted">Show, hide, and reorder the main homepage blocks.</p></div>
            <button className="btn primary" disabled={saving} onClick={() => saveSiteSection("homepageLayout", siteContent.homepageLayout)}>{saving ? "Saving…" : "Save layout"}</button>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {[...siteContent.homepageLayout].sort((a, b) => a.order - b.order).map((item, index) => (
              <div key={item.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 14px" }}>
                <label className="homepage-toggle"><input type="checkbox" checked={item.visible !== false} onChange={e => updateHomepageLayout(item.id, { visible: e.target.checked })}/><b>{item.label}</b></label>
                <div className="row-actions">
                  <button type="button" className="btn secondary small" disabled={index === 0} onClick={() => moveHomepageSection(index, -1)}>↑</button>
                  <button type="button" className="btn secondary small" disabled={index === siteContent.homepageLayout.length - 1} onClick={() => moveHomepageSection(index, 1)}>↓</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>}
    {activeTab === "categories" && <section className="category-image-manager">
      <div className="panel-head"><div><h2>Category images <span className="count-pill">{categories.length}</span></h2><p>Choose the image shown for each shopping category across the storefront.</p></div></div>
      {loading ? <div className="loading-panel"><span className="spinner"/> Loading categories…</div> : <div className="category-image-grid">
        {categories.map(category => <article className="category-image-card" key={category.key}>
          <div className="category-image-preview">{category.image_url ? <img src={category.image_url} alt={category.label}/> : <div><Image size={24}/><span>No category image</span></div>}</div>
          <div className="category-image-details"><b>{category.label}</b><span>{category.key}</span></div>
          <div className="category-image-actions">
            <label className="btn secondary small upload-label">{uploading ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e => uploadCategoryImage(e.target.files?.[0], category.key)}/></label>
            <button type="button" className="btn secondary small" onClick={() => setCategoryMediaTarget(categoryMediaTarget === category.key ? "" : category.key)}>Choose from library</button>
            {category.image_url && <button type="button" className="text-btn danger-text" onClick={() => assignCategoryImage(category.key, null)}>Remove</button>}
          </div>
          {categoryMediaTarget === category.key && <div className="category-media-picker">
            {media.length ? media.map(item => <button type="button" key={item.id} className={category.image_media_id === item.id ? "selected" : ""} onClick={() => assignCategoryImage(category.key, item.id)}><img src={item.url} alt={item.file_name || "Store image"}/><span>{item.file_name || "Image"}</span></button>) : <span className="muted">Upload an image to the media library first.</span>}
          </div>}
        </article>)}
      </div>}
    </section>}
    {activeTab === "overview" && <section className="homepage-slides homepage-slides-workspace">
      <div className="panel-head"><div><h2>Hero slides <span className="count-pill">{slides.length}</span></h2><p>Desktop and mobile imagery, headline, CTA and visibility.</p></div></div>
      {loading ? <div className="loading-panel"><span className="spinner"/> Loading homepage content…</div> : slides.length ? <div className="hero-slide-list">{slides.map((slide, index) => <article className="hero-slide-card" key={slide.id}>
        <div className="hero-slide-preview">{slide.image_url ? <img src={slide.image_url} alt=""/> : <div className="hero-preview-empty"><Image size={27}/><span>No desktop image</span></div>}<span className={slide.active ? "hero-state active" : "hero-state"}>{slide.active ? "LIVE" : "HIDDEN"}</span><span className="hero-order">#{index + 1}</span></div>
        <div className="hero-slide-info"><div className="eyebrow">{slide.eyebrow || "GO IPHONE"}</div><h3>{slide.title}</h3><p>{slide.subtitle || "No supporting text added."}</p><div className="hero-slide-meta"><span>{slide.cta_text || "No CTA"}</span><span>{Math.round(Number(slide.duration_ms || 6500) / 100) / 10}s duration</span><span>{slide.mobile_image_url ? "Mobile image set" : "No mobile image"}</span></div></div>
        <div className="hero-slide-actions"><button className="btn secondary small" disabled={index === 0} onClick={() => move(index, -1)} title="Move up"><ArrowUpRight size={14}/></button><button className="btn secondary small" disabled={index === slides.length - 1} onClick={() => move(index, 1)} title="Move down"><ArrowDownRight size={14}/></button><button className="btn secondary small" onClick={() => startEdit(slide)}>Edit</button><button className="btn danger small" onClick={() => remove(slide.id)}>Delete</button></div>
      </article>)}</div> : <EmptyState icon={Image} title="No custom hero slides yet" detail="Your storefront is still showing its default hero. Add a slide whenever you are ready to publish your own banner."/>}
    </section>}
    {activeTab === "content" && <section className="homepage-content-workspace">
      <div className="panel homepage-content-card"><div className="panel-head"><div><h2>Tools section</h2><p>Shape the guided shopping experience and comparison tools.</p></div><label className="homepage-toggle"><input type="checkbox" checked={siteContent.toolsSection.visible !== false} onChange={e => setSiteContent(c => ({ ...c, toolsSection: { ...c.toolsSection, visible: e.target.checked } }))}/> Show section</label></div>
        <div className="editor-grid"><label>Small heading<input value={siteContent.toolsSection.eyebrow || ""} onChange={e => setSiteContent(c => ({ ...c, toolsSection: { ...c.toolsSection, eyebrow: e.target.value } }))}/></label><label>Main heading<input value={siteContent.toolsSection.title || ""} onChange={e => setSiteContent(c => ({ ...c, toolsSection: { ...c.toolsSection, title: e.target.value } }))}/></label></div>
        <div className="homepage-content-image-grid">{[{key:"recommendationImage",title:"Find your perfect device"},{key:"comparisonImage",title:"Compare devices"}].map(item=><div className="homepage-content-image" key={item.key}><b>{item.title}</b><label className="btn secondary small upload-label">{uploading?"Uploading…":"Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e=>{uploadToolsImage(e.target.files?.[0],item.key);e.target.value="";}}/></label>{siteContent.toolsSection[item.key] && <img src={siteContent.toolsSection[item.key]} alt=""/>}</div>)}</div>
        <div className="modal-foot"><button className="btn primary" disabled={saving} onClick={()=>saveSiteSection("toolsSection",siteContent.toolsSection)}>{saving?"Saving…":"Save Tools section"}</button></div>
      </div>
      <div className="panel homepage-content-card"><div className="panel-head"><div><h2>Trust & reassurance</h2><p>Give shoppers clear reasons to buy with confidence.</p></div><label className="homepage-toggle"><input type="checkbox" checked={siteContent.trustSection.visible !== false} onChange={e=>setSiteContent(c=>({...c,trustSection:{...c.trustSection,visible:e.target.checked}}))}/> Show section</label></div>
        <div className="homepage-trust-grid">{siteContent.trustSection.points.map((point,index)=><article className="homepage-trust-item" key={point.id||index}><label className="homepage-toggle"><input type="checkbox" checked={point.visible!==false} onChange={e=>updateTrustPoint(index,"visible",e.target.checked)}/> Visible</label><label>Title<input value={point.title||""} onChange={e=>updateTrustPoint(index,"title",e.target.value)}/></label><label>Description<textarea rows="3" value={point.desc||""} onChange={e=>updateTrustPoint(index,"desc",e.target.value)}/></label><label className="btn secondary small upload-label">{uploading?"Uploading…":"Upload icon / image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e=>{uploadTrustImage(e.target.files?.[0],index);e.target.value="";}}/></label>{point.image&&<img src={point.image} alt=""/>}</article>)}</div>
        <div className="modal-foot"><button className="btn primary" disabled={saving} onClick={()=>saveSiteSection("trustSection",siteContent.trustSection)}>{saving?"Saving…":"Save trust content"}</button></div>
      </div>
    </section>}
    {editing && <div className="modal-backdrop"><form className="editor-modal homepage-editor" onSubmit={save}>
      <div className="modal-head"><div><div className="eyebrow">HOMEPAGE BUILDER</div><h2>{editing === "new" ? "Create hero slide" : "Edit hero slide"}</h2></div><button type="button" className="icon-btn" onClick={() => setEditing(null)}><X size={19}/></button></div>
      <div className="editor-grid">
        <label>Eyebrow<input maxLength={100} value={form.eyebrow} onChange={e => setForm(f => ({ ...f, eyebrow: e.target.value }))} placeholder="GO IPHONE"/></label>
        <label>Badge (optional)<input maxLength={50} value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="New arrival"/></label>
        <label className="field-wide">Main headline<input required maxLength={200} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Your next favorite starts here."/></label>
        <label className="field-wide">Supporting text<input maxLength={300} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="A short line that introduces this collection."/></label>
        <label>Button label<input maxLength={50} value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="Shop now"/></label>
        <label>Button destination<select value={form.linkCategoryKey} onChange={e => setForm(f => ({ ...f, linkCategoryKey: e.target.value }))}>{["iphone","ipad","mac","watch","airpods","apple-accessory","other-accessory"].map(k => <option key={k} value={k}>{titleCase(k)}</option>)}</select></label>
        <label>Slide duration (milliseconds)<input type="number" min="2000" max="30000" step="500" value={form.durationMs} onChange={e => setForm(f => ({ ...f, durationMs: e.target.value }))}/></label>
        <label className="homepage-toggle"><input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}/> Publish this slide on the storefront</label>
      </div>
      <div className="homepage-image-fields">
        {["imageMediaId","mobileImageMediaId"].map((key, i) => <div className="homepage-image-field" key={key}><div><b>{i ? "Mobile banner" : "Desktop banner"}</b><span>{i ? "Optional image optimized for phones." : "Recommended wide landscape image."}</span></div>{selectedImage(form[key]) ? <img src={selectedImage(form[key])} alt={i ? "Mobile banner" : "Desktop banner"}/> : <div className="homepage-image-empty"><Image size={20}/><span>No image selected</span></div>}<div className="homepage-image-buttons"><label className="btn secondary small upload-label">{uploading ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e => upload(e.target.files?.[0], key)}/></label><button type="button" className="btn secondary small" onClick={() => setMediaTarget(mediaTarget === key ? "" : key)}>Choose from library</button>{form[key] && <button type="button" className="text-btn danger-text" onClick={() => setForm(f => ({ ...f, [key]: "" }))}>Remove</button>}</div>{mediaTarget === key && <div className="homepage-media-grid">{media.map(m => <button type="button" key={m.id} className={form[key] === m.id ? "selected" : ""} onClick={() => { setForm(f => ({ ...f, [key]: m.id })); setMediaTarget(""); }}><img src={m.url} alt={m.file_name || "Media"}/><span>{m.file_name || "Image"}</span></button>)}</div>}</div>)}
      </div>
      <div className="modal-foot"><button type="button" className="btn secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn primary" disabled={saving || uploading || !form.title.trim()}>{saving ? "Saving…" : editing === "new" ? "Create slide" : "Save changes"}</button></div>
    </form></div>}
  </>;
}


function CollectionsManager({ onError }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", description: "" });
  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await request("/collections"); setItems(d.collections || []); }
    catch (e) { onError(e.message); }
    finally { setLoading(false); }
  }, [onError]);
  useEffect(() => { load(); }, [load, refresh]);
  function startNew() { setForm({ id: "", name: "", description: "" }); setEditing("new"); }
  function startEdit(item) { setForm({ id: item.id, name: item.name || "", description: item.description || "" }); setEditing(item.id); }
  async function save(event) {
    event.preventDefault(); setSaving(true);
    try {
      if (editing === "new") {
        await request("/collections", { method: "POST", body: JSON.stringify({
          id: form.id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""),
          name: form.name.trim(), description: form.description.trim() || null,
        }) });
      } else {
        await request("/collections/" + encodeURIComponent(editing), { method: "PATCH", body: JSON.stringify({
          name: form.name.trim(), description: form.description.trim() || null,
        }) });
      }
      setEditing(null); setRefresh(v => v + 1);
    } catch (e) { onError(e.message); }
    finally { setSaving(false); }
  }
  async function toggleVisible(item) {
    try {
      await request("/collections/" + encodeURIComponent(item.id), { method: "PATCH", body: JSON.stringify({ visible: item.visible === false }) });
      setItems(list => list.map(x => x.id === item.id ? { ...x, visible: item.visible === false } : x));
    } catch (e) { onError(e.message); }
  }
  async function move(index, direction) {
    const next = [...items]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setItems(next);
    try {
      await Promise.all(next.map((item, order) => request("/collections/" + encodeURIComponent(item.id), {
        method: "PATCH", body: JSON.stringify({ sortOrder: order }),
      })));
    } catch (e) { onError(e.message); load(); }
  }
  async function remove(item) {
    if (item.is_system) return;
    if (!window.confirm("Delete collection \"" + item.name + "\"? Products will lose this collection tag.")) return;
    try { await request("/collections/" + encodeURIComponent(item.id), { method: "DELETE" }); setItems(list => list.filter(x => x.id !== item.id)); }
    catch (e) { onError(e.message); }
  }
  return <>
    <div className="page-heading"><div><div className="eyebrow">STORE EXPERIENCE</div><h1>Collections</h1><p>Build and organize the product sections that appear across your storefront.</p></div><div className="heading-actions"><button className="btn secondary" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={15}/> Refresh</button><button className="btn primary" onClick={startNew}><Plus size={15}/> New collection</button></div></div>
    <div className="homepage-intro"><div className="homepage-intro-icon"><ShoppingBag size={22}/></div><div><b>Merchandising sections</b><p>Collections group products into storefront sections. Add products to a collection from the product editor, then control its title and visibility here.</p></div><span className="homepage-live"><i/> Store connected</span></div>
    <section className="panel">
      <div className="panel-head"><div><h2>All collections <span className="count-pill">{items.length}</span></h2><p>Use the arrows to change display order. Built-in collections are protected from deletion.</p></div></div>
      {loading ? <div className="loading-panel"><span className="spinner"/> Loading collections…</div> : items.length ? <div className="collection-admin-list">{items.map((item, index) => <article className="collection-admin-row" key={item.id}>
        <div className="collection-admin-order"><button className="btn secondary small" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move collection up"><ArrowUpRight size={14}/></button><button className="btn secondary small" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label="Move collection down"><ArrowDownRight size={14}/></button></div>
        <div className="collection-admin-info"><div><b>{item.name}</b>{item.is_system && <span className="count-pill">Built-in</span>}</div><span>{item.description || item.id}</span></div>
        <div className="collection-admin-count"><b>{Number(item.product_count || 0)}</b><span>products</span></div>
        <span className={item.visible === false ? "status hidden" : "status published"}>{item.visible === false ? "Hidden" : "Visible"}</span>
        <div className="row-actions"><button className="btn secondary small" onClick={() => startEdit(item)}>Edit</button><button className="btn secondary small" onClick={() => toggleVisible(item)}>{item.visible === false ? "Show" : "Hide"}</button>{!item.is_system && <button className="btn danger small" onClick={() => remove(item)}>Delete</button>}</div>
      </article>)}</div> : <EmptyState icon={ShoppingBag} title="No collections yet" detail="Create your first collection to build a custom product section."/>}
    </section>
    {editing && <div className="modal-backdrop"><form className="editor-modal" onSubmit={save}>
      <div className="modal-head"><div><div className="eyebrow">MERCHANDISING</div><h2>{editing === "new" ? "Create collection" : "Edit collection"}</h2></div><button type="button" className="icon-btn" onClick={() => setEditing(null)}><X size={19}/></button></div>
      <div className="editor-grid">
        {editing === "new" && <label className="field-wide">Collection ID<input required pattern="[a-z0-9-]+" value={form.id} onChange={e => setForm(f => ({ ...f, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))} placeholder="e.g. student-deals"/><span className="field-hint">Use lowercase letters, numbers and hyphens. This ID is permanent.</span></label>}
        <label className="field-wide">Section title<input required maxLength={100} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Student deals"/></label>
        <label className="field-wide">Description (optional)<textarea maxLength={300} rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="A short internal description for this collection"/></label>
      </div>
      <div className="modal-foot"><button type="button" className="btn secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn primary" disabled={saving}>{saving ? "Saving…" : editing === "new" ? "Create collection" : "Save changes"}</button></div>
    </form></div>}
  </>;
}


const DESIGN_DEFAULTS = {
  preset: "signature",
  colors: { ink: "#111110", paper: "#FAFAF8", stone: "#F0EEE9", line: "#E3E0D9", graphite: "#706C64", mist: "#9C978D", brass: "#AD8642", brassSoft: "#D2B060", brassDeep: "#8E6F34" },
  fontFamily: "Inter",
  radius: "12",
};
const DESIGN_PRESETS = {
  signature: { label: "Signature", description: "Warm premium minimal", colors: DESIGN_DEFAULTS.colors, fontFamily: "Inter", radius: "12" },
  midnight: { label: "Midnight", description: "Dark flagship aesthetic", colors: { ink: "#F5F4F0", paper: "#111318", stone: "#1B1F27", line: "#303642", graphite: "#B8BECA", mist: "#858D9B", brass: "#D6AD62", brassSoft: "#E8CB91", brassDeep: "#B68B43" }, fontFamily: "Inter", radius: "12" },
  titanium: { label: "Titanium", description: "Cool modern technology", colors: { ink: "#20252B", paper: "#F4F6F7", stone: "#E8ECEF", line: "#D5DCE1", graphite: "#65717C", mist: "#9AA5AE", brass: "#647D91", brassSoft: "#A8BAC7", brassDeep: "#496174" }, fontFamily: "Inter", radius: "10" },
  editorial: { label: "Editorial", description: "Refined editorial luxury", colors: { ink: "#25221E", paper: "#FBF8F2", stone: "#F0E9DE", line: "#E3D8C8", graphite: "#74695C", mist: "#A99B89", brass: "#9A6945", brassSoft: "#C69A72", brassDeep: "#795034" }, fontFamily: "Georgia", radius: "6" },
};
const DESIGN_FIELDS = [
  ["ink","Primary text","Main headings and important labels"],
  ["paper","Page background","Main storefront canvas"],
  ["stone","Section surface","Cards and highlighted sections"],
  ["line","Borders","Dividers and subtle outlines"],
  ["graphite","Secondary text","Descriptions and supporting copy"],
  ["mist","Muted details","Captions and low-emphasis labels"],
  ["brass","Brand accent","Links, highlights and small details"],
  ["brassSoft","Soft accent","Subtle accent surfaces"],
  ["brassDeep","Deep accent","Hover and emphasis states"],
];
function DesignStudio({ onError }) {
  const [design, setDesign] = useState(DESIGN_DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const localPreview = import.meta.env.DEV;
  useEffect(() => {
    request("/site-content").then(({ siteContent = {} }) => {
      const current = siteContent.designSystem || {};
      setDesign({ ...DESIGN_DEFAULTS, ...current, colors: { ...DESIGN_DEFAULTS.colors, ...(current.colors || {}) } });
    }).catch(e => onError(e.message)).finally(() => setLoading(false));
  }, [onError]);
  function applyPreset(key) {
    const preset = DESIGN_PRESETS[key];
    if (preset) { setDesign({ preset: key, colors: { ...preset.colors }, fontFamily: preset.fontFamily, radius: preset.radius }); setSaved(false); }
  }
  function updateColor(key, value) {
    setDesign(current => ({ ...current, preset: "custom", colors: { ...current.colors, [key]: value } }));
    setSaved(false);
  }
  async function save() {
    if (localPreview) return;
    setSaving(true); setSaved(false);
    try { await request("/site-content/designSystem", { method: "PUT", body: JSON.stringify(design) }); setSaved(true); }
    catch (e) { onError(e.message); }
    finally { setSaving(false); }
  }
  function reset() { setDesign({ ...DESIGN_DEFAULTS, colors: { ...DESIGN_DEFAULTS.colors } }); setSaved(false); }
  const c = design.colors;
  const radius = (design.radius || "12") + "px";
  return <>
    <div className="page-heading design-heading">
      <div><div className="eyebrow">STORE EXPERIENCE / VISUAL IDENTITY</div><h1>Design Studio</h1><p>Build a consistent visual identity for every part of your storefront.</p></div>
      <div className="heading-actions"><button className="btn secondary" onClick={reset}><RefreshCw size={15}/> Reset</button><button className="btn primary" onClick={save} disabled={loading || saving || localPreview}>{localPreview ? <><Eye size={15}/> Preview mode</> : saving ? "Saving…" : saved ? <><CheckCircle2 size={15}/> Saved</> : "Save design system"}</button></div>
    </div>
    {localPreview && <div className="design-safety-note"><ShieldCheck size={17}/><div><b>Safe local preview</b><span>Your local workspace can read the current theme, but saving is disabled so test changes cannot overwrite live store settings.</span></div></div>}
    {loading ? <div className="loading-panel"><span className="spinner"/> Loading your design system…</div> : <>
      <div className="design-workspace">
        <div className="design-controls">
          <section className="panel design-panel">
            <div className="design-section-heading"><div><span className="design-step">01 / DIRECTION</span><h2>Choose your visual direction</h2><p>Start with a curated foundation. Every preset can be customized.</p></div><span className="count-pill">4 PRESETS</span></div>
            <div className="design-presets">
              {Object.entries(DESIGN_PRESETS).map(([key,preset]) => <button key={key} type="button" className={"design-preset "+(design.preset===key?"selected":"")} onClick={() => applyPreset(key)}>
                <span className="design-preset-swatches">{[preset.colors.ink,preset.colors.paper,preset.colors.stone,preset.colors.brass].map((color,i)=><i key={i} style={{background:color}}/>)}</span>
                <span className="design-preset-copy"><b>{preset.label}</b><small>{preset.description}</small></span>
                {design.preset===key && <CheckCircle2 size={17}/>}
              </button>)}
            </div>
          </section>
          <section className="panel design-panel">
            <div className="design-section-heading"><div><span className="design-step">02 / COLOR</span><h2>Color system</h2><p>Fine-tune the complete palette with precise color values.</p></div><span className="count-pill">{design.preset==="custom"?"CUSTOM":"TOKENS"}</span></div>
            <div className="design-color-grid">
              {DESIGN_FIELDS.map(([key,label,hint])=><label className="design-color-field" key={key}>
                <span className="design-color-chip" style={{background:c[key]}}/>
                <span className="design-color-copy"><b>{label}</b><small>{hint}</small><code>{c[key]}</code></span>
                <input aria-label={label} type="color" value={c[key]} onChange={e=>updateColor(key,e.target.value)}/>
              </label>)}
            </div>
          </section>
          <section className="panel design-panel">
            <div className="design-section-heading"><div><span className="design-step">03 / DETAILS</span><h2>Typography & shape</h2><p>Set the tone of the storefront’s text and components.</p></div></div>
            <div className="design-detail-grid">
              <label className="design-setting"><span>Typography family</span><select value={design.fontFamily} onChange={e=>{setDesign(d=>({...d,fontFamily:e.target.value,preset:"custom"}));setSaved(false);}}><option value="Inter">Inter — Modern and clean</option><option value="Arial">Arial — Universal clarity</option><option value="Georgia">Georgia — Editorial character</option></select></label>
              <label className="design-setting"><span>Corner style</span><select value={design.radius || "12"} onChange={e=>{setDesign(d=>({...d,radius:e.target.value,preset:"custom"}));setSaved(false);}}><option value="6">Sharp — 6px</option><option value="10">Balanced — 10px</option><option value="12">Soft — 12px</option><option value="18">Rounded — 18px</option></select></label>
            </div>
            <div className="design-type-sample" style={{fontFamily:design.fontFamily}}><span>THE GO IPHONE TYPE SYSTEM</span><strong>Technology, beautifully chosen.</strong><p>Clear information. Thoughtful details. A premium shopping experience.</p></div>
          </section>
        </div>
        <aside className="design-preview-column">
          <section className="panel design-preview-panel">
            <div className="design-section-heading"><div><span className="design-step">LIVE CANVAS</span><h2>Storefront preview</h2><p>Updates instantly as you edit.</p></div><span className="design-live-label"><i/> LIVE</span></div>
            <div className="design-browser" style={{background:c.paper,color:c.ink,fontFamily:design.fontFamily}}>
              <div className="design-browser-top"><span/><span/><span/><small>goiphone.store</small></div>
              <div className="design-store-header" style={{borderColor:c.line}}><b>GO<span style={{color:c.brass}}>.</span>IPHONE</b><div><i/> <i/> <i/></div></div>
              <div className="design-hero" style={{background:c.stone,borderRadius:radius}}>
                <span style={{color:c.brass}}>THE NEW STANDARD</span><h3>Find your next<br/>favorite device.</h3><p style={{color:c.graphite}}>Carefully selected technology, made simple.</p><button style={{background:c.ink,color:c.paper,borderRadius:radius}}>Explore products <span>↗</span></button>
              </div>
              <div className="design-featured"><div><span style={{color:c.brass}}>CURATED FOR YOU</span><b>Featured collection</b></div><small style={{color:c.graphite}}>VIEW ALL ↗</small></div>
              <div className="design-product-grid">
                {[0,1].map(i=><div className="design-product-card" key={i} style={{borderColor:c.line,borderRadius:radius}}><div className="design-product-image" style={{background:c.stone,color:c.mist}}><Smartphone size={i?39:46}/></div><div><span style={{color:c.graphite}}>IPHONE · 256 GB</span><b>{i?"iPhone Pro":"iPhone Pro Max"}</b><strong>From EGP 00,000</strong></div></div>)}
              </div>
              <div className="design-preview-footer" style={{borderColor:c.line,color:c.graphite}}>GO IPHONE <span style={{color:c.brass}}>●</span> PREMIUM TECHNOLOGY</div>
            </div>
            <div className="design-preview-legend"><span><i style={{background:c.ink}}/> Text</span><span><i style={{background:c.paper,border:"1px solid "+c.line}}/> Background</span><span><i style={{background:c.brass}}/> Accent</span></div>
          </section>
          <section className="design-tip-card"><Sparkles size={18}/><div><b>One identity, every touchpoint</b><p>Use the same palette and typography across banners, product cards, buttons and content sections to keep the store recognizable.</p></div></section>
        </aside>
      </div>
    </>}
  </>;
}

function Placeholder({ id, onNavigate }) {
  const content = {
    inventory: ["Inventory", "Track individual devices, stock levels and availability.", Boxes, "Inventory workspace is next in the build."],
    reservations: ["Reservations", "Manage customer requests and product reservations.", Clock3, "Reservation management is being prepared."],
    customers: ["Customers", "Understand your customers and their order history.", Users, "Customer profiles are not exposed by the current admin API yet."],
    homepage: ["Homepage Builder", "Control the sections and content customers see first.", Layers3, "The homepage content API will be connected in this module."],
    design: ["Design Studio", "Manage storefront presentation and visual settings.", Sparkles, "Design controls will be added after the content model is mapped."],
    media: ["Media Library", "Organize product photography and store assets.", Image, "Media upload and browsing will be connected here."],
    collections: ["Collections", "Group products into curated shopping experiences.", ShoppingBag, "Collection editing will be connected in the next module."],
    team: ["Team & Access", "Manage admin users, roles and permissions.", ShieldCheck, "Access is enforced by the backend. The management interface is not connected yet."],
    settings: ["Settings", "Manage store-wide configuration and preferences.", Settings, "Store settings will be mapped before enabling edits."],
  }[id] || ["Workspace", "Manage your store.", Box, "This module is not available yet."];
  const Icon = content[2];
  return <><div className="page-heading"><div><div className="eyebrow">WORKSPACE</div><h1>{content[0]}</h1><p>{content[1]}</p></div></div><section className="panel placeholder-panel"><div className="placeholder-art"><div className="placeholder-orbit orbit-one"/><div className="placeholder-orbit orbit-two"/><div className="placeholder-icon"><Icon size={30}/></div><Sparkles className="spark spark-one" size={17}/><div className="spark spark-two">✦</div></div><div className="eyebrow">MODULE IN PROGRESS</div><h2>{content[0]} workspace</h2><p>{content[3]}</p><button className="btn secondary" onClick={() => onNavigate("dashboard")}><ChevronLeft size={15}/> Back to dashboard</button></section></>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [securityReady, setSecurityReady] = useState(false);
  const showError = useCallback(message => { setError(message); window.setTimeout(() => setError(""), 5000); }, []);

  const handleLogin = useCallback(async () => {
    try {
      const data = await request("/auth/me");
      setUser(data.user);
      setSecurityReady(!data.user.twoFactorRequired);
    } catch (e) { showError(e.message); }
  }, [showError]);
  const finishSecuritySetup = useCallback(async () => {
    try {
      const data = await request("/auth/me");
      setUser(data.user);
      setSecurityReady(true);
    } catch (e) { showError(e.message); }
  }, [showError]);

  useEffect(() => {
    let active = true;
    request("/auth/me").then(d => { if (active) { setUser(d.user); setSecurityReady(!d.user.twoFactorRequired); } })
      .catch(async e => {
        if (e.status === 401) {
          try { await request("/auth/refresh", { method: "POST" }); const d = await request("/auth/me"); if (active) { setUser(d.user); setSecurityReady(!d.user.twoFactorRequired); } }
          catch { /* Login screen is the expected signed-out state. */ }
        } else if (active) showError(e.message);
      }).finally(() => { if (active) setChecking(false); });
    return () => { active = false; };
  }, [showError]);

  const loadStats = useCallback(() => {
    setStatsLoading(true);
    request("/stats").then(setStats).catch(e => showError(e.message)).finally(() => setStatsLoading(false));
  }, [showError]);
  useEffect(() => { if (user && page === "dashboard") loadStats(); }, [user, page, loadStats]);

  async function logout() {
    try { await request("/auth/logout", { method: "POST" }); } catch { /* Clear local state regardless. */ }
    setUser(null); setStats(null); setPage("dashboard");
  }
  function navigate(id) { setPage(id); setSidebarOpen(false); setError(""); }

  if (checking) return <div className="boot-screen"><div className="brand-mark">G</div><span className="spinner"/>Preparing your workspace…</div>;
  if (!user) return <Login onLogin={handleLogin}/>;
  if (!securityReady || user.twoFactorRequired) return <TwoFactorSetup onComplete={finishSecuritySetup} onError={showError}/>;

  const pageTitle = [...navGroups.flatMap(g => g.items)].find(i => i.id === page)?.label || "Dashboard";
  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-brand"><Brand/><button className="icon-btn mobile-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button></div>
      <div className="store-switch"><div className="store-icon">G</div><div><b>GO iPhone Store</b><span>Production workspace</span></div><ChevronDown size={15}/></div>
      <nav>{navGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${page === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}><Icon size={17}/><span>{item.label}</span>{item.id === "orders" && stats?.orders?.New > 0 && <i className="nav-badge">{stats.orders.New}</i>}</button>; })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="secure-note"><ShieldCheck size={16}/><div><b>Secure workspace</b><span>Role-based access enabled</span></div></div><div className="user-card"><div className="user-avatar">{(user.email || "A").slice(0,1).toUpperCase()}</div><div className="user-info"><b>{user.email}</b><span>{titleCase(user.role)}</span></div><button className="icon-btn" title="Sign out" onClick={logout}><LogOut size={16}/></button></div></div>
    </aside>
    {sidebarOpen && <button className="mobile-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close menu"/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={19}/></button><span className="breadcrumb">GO iPhone <ChevronRight size={13}/> <b>{pageTitle}</b></span></div><div className="topbar-right"><span className={`live-dot ${import.meta.env.DEV ? "preview-dot" : ""}`}/> <span className="environment">{import.meta.env.DEV ? "READ-ONLY PREVIEW" : "LIVE STORE"}</span><span className="topbar-divider"/><button className="icon-btn" title="Help"><CircleHelp size={18}/></button><a className="icon-btn" href="https://go-iphone-storefront1.vercel.app/" target="_blank" rel="noreferrer" title="Open storefront"><ExternalLink size={17}/></a></div></header>
      <div className="content-area">
        {error && <div className="toast error"><AlertTriangle size={16}/>{error}<button onClick={() => setError("")}><X size={14}/></button></div>}
        {page === "dashboard" && <Dashboard stats={stats} loading={statsLoading} onRefresh={loadStats} onNavigate={navigate}/>}
        {page === "products" && <Products onError={showError}/>}
        {page === "orders" && <Orders onError={showError}/>}
        {page === "media" && <MediaLibrary onError={showError}/>}
        {page === "homepage" && <HomepageBuilder onError={showError}/>}
        {page === "collections" && <CollectionsManager onError={showError}/>}
        {page === "design" && <DesignStudio onError={showError}/>}
        {!["dashboard","products","orders","media","homepage","collections","design"].includes(page) && <Placeholder id={page} onNavigate={navigate}/>}
        <footer className="app-footer"><span>© {new Date().getFullYear()} GO iPhone</span><span>Admin workspace <i/> Built for your store</span></footer>
      </div>
    </main>
  </div>;
}
