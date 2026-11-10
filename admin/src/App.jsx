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
  useEffect(() => {
    let active = true; setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (visibility !== "all") params.set("visibility", visibility);
    request(`/products?${params}`).then(d => { if (active) setItems(d.products || []); })
      .catch(e => onError(e.message)).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, visibility, refresh, onError]);
  return <>
    <div className="page-heading"><div><div className="eyebrow">CATALOGUE</div><h1>Products</h1><p>Manage your product catalogue and visibility.</p></div><button className="btn secondary" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={15}/> Refresh</button></div>
    <section className="panel">
      <div className="toolbar"><div className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products…"/></div><select value={visibility} onChange={e => setVisibility(e.target.value)}><option value="all">All visibility</option><option value="published">Published</option><option value="draft">Draft</option><option value="hidden">Hidden</option></select><span className="results-count">{items.length} products</span></div>
      {loading ? <div className="loading-panel"><span className="spinner"/> Loading products…</div> : items.length ? <div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>TYPE</th><th>PRICE FROM</th><th>VISIBILITY</th><th>UPDATED</th></tr></thead><tbody>{items.map(p => <tr key={p.id}><td><div className="product-cell">{p.image_url ? <img src={p.image_url} alt="" /> : <div className="product-avatar"><Smartphone size={17}/></div>}<div><b>{p.name}</b><span className="subline">{p.slug || p.id}</span></div></div></td><td>{titleCase(p.category_key)}</td><td>{titleCase(p.product_type)}</td><td>{p.from_price_cents == null ? "—" : money(p.from_price_cents)}</td><td><span className={`status ${p.visibility}`}>{p.visibility}</span></td><td>{date(p.updated_at)}</td></tr>)}</tbody></table></div> : <EmptyState icon={Package} title="No products found" detail="Add products through the catalogue API or your product workflow. This view will show them automatically."/>}
    </section>
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
  const showError = useCallback(message => { setError(message); window.setTimeout(() => setError(""), 5000); }, []);

  useEffect(() => {
    let active = true;
    request("/auth/me").then(d => { if (active) setUser(d.user); })
      .catch(async e => {
        if (e.status === 401) {
          try { await request("/auth/refresh", { method: "POST" }); const d = await request("/auth/me"); if (active) setUser(d.user); }
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
  if (!user) return <Login onLogin={setUser}/>;

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
      <header className="topbar"><div className="topbar-left"><button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={19}/></button><span className="breadcrumb">GO iPhone <ChevronRight size={13}/> <b>{pageTitle}</b></span></div><div className="topbar-right"><span className="live-dot"/> <span className="environment">LIVE STORE</span><span className="topbar-divider"/><button className="icon-btn" title="Help"><CircleHelp size={18}/></button><a className="icon-btn" href="https://go-iphone-storefront1.vercel.app/" target="_blank" rel="noreferrer" title="Open storefront"><ExternalLink size={17}/></a></div></header>
      <div className="content-area">
        {error && <div className="toast error"><AlertTriangle size={16}/>{error}<button onClick={() => setError("")}><X size={14}/></button></div>}
        {page === "dashboard" && <Dashboard stats={stats} loading={statsLoading} onRefresh={loadStats} onNavigate={navigate}/>}
        {page === "products" && <Products onError={showError}/>}
        {page === "orders" && <Orders onError={showError}/>}
        {!["dashboard","products","orders"].includes(page) && <Placeholder id={page} onNavigate={navigate}/>}
        <footer className="app-footer"><span>© {new Date().getFullYear()} GO iPhone</span><span>Admin workspace <i/> Built for your store</span></footer>
      </div>
    </main>
  </div>;
}
