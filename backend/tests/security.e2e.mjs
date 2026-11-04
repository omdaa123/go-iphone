// WARNING: run ONLY against a throwaway/test database — this creates users, orders and products.
// Suite order on ONE fresh DB (migrate + seed + seed:catalog), server started with REQUIRE_2FA=false: admin-api, then security (turns on 2FA for the owner), then catalog-orders.
import { authenticator } from "otplib";
const B = process.env.API_URL || "http://localhost:4058";
const jar = (name) => ({ name, cookies: {} });
async function call(j, method, path, body) {
  const cookie = Object.entries(j.cookies).map(([k,v])=>`${k}=${v}`).join("; ");
  const r = await fetch(B+path, { method, headers: { "content-type":"application/json", ...(cookie?{cookie}:{}) }, body: body?JSON.stringify(body):undefined });
  for (const c of r.headers.getSetCookie?.() || []) { const [kv] = c.split(";"); const [k,v]=kv.split("="); if (/Max-Age=0|Expires=Thu, 01 Jan 1970/.test(c)) delete j.cookies[k]; else j.cookies[k]=v; }
  let data; try { data = await r.json(); } catch { data = null; }
  return { status: r.status, data };
}
let pass=0, fail=0;
const check=(name,cond,extra="")=>{ cond?pass++:fail++; console.log(`${cond?"PASS":"FAIL"}  ${name} ${cond?"":extra}`); };

const owner = jar("owner");
let r = await call(owner,"POST","/admin/auth/login",{email:"owner@test.com",password:"wrong-password-123"});
check("wrong password rejected (401)", r.status===401);
r = await call(owner,"POST","/admin/auth/login",{email:"owner@test.com",password:"a-very-long-test-password-1"});
check("correct password logs in", r.status===200 && owner.cookies.gi_session);

// create product + unit
r = await call(owner,"POST","/admin/products",{categoryKey:"iphone",productType:"iphone",name:"iPhone 13 Pro Max",hasUnits:true,visibility:"draft",variants:[],collectionIds:["best-sellers"]});
check("OWNER can create product", r.status===201, JSON.stringify(r.data));
const pid = r.data.product.id;
r = await call(owner,"POST",`/admin/products/${pid}/units`,{storage:"256GB",color:"Sierra Blue",batteryPct:91,condition:"Excellent",priceCents:3600000,warranty:"3 months"});
check("OWNER can add used unit", r.status===201, JSON.stringify(r.data));
const uid = r.data.unit.id;

// visibility
r = await call(jar("anon"),"GET","/api/catalog");
check("DRAFT product NOT visible on public storefront API", r.status===200 && !r.data.products.some(p=>p.id===pid));
await call(owner,"PATCH",`/admin/products/${pid}`,{visibility:"published"});
r = await call(jar("anon"),"GET","/api/catalog");
check("after publishing, product IS visible publicly", r.data.products.some(p=>p.id===pid));

// RBAC: create STAFF + CONTENT users
r = await call(owner,"POST","/admin/users",{email:"staff@test.com",password:"staff-password-long-1",role:"STAFF"});
check("OWNER can create STAFF user", r.status===201, JSON.stringify(r.data));
await call(owner,"POST","/admin/users",{email:"content@test.com",password:"content-password-long-1",role:"CONTENT"});
const staff = jar("staff");
await call(staff,"POST","/admin/auth/login",{email:"staff@test.com",password:"staff-password-long-1"});
r = await call(staff,"DELETE",`/admin/products/${pid}`);
check("STAFF cannot DELETE product (403, enforced by API)", r.status===403);
r = await call(staff,"PATCH",`/admin/products/${pid}`,{name:"hacked"});
check("STAFF cannot edit product (403)", r.status===403);
r = await call(staff,"GET","/admin/users");
check("STAFF cannot list admin users (403)", r.status===403);
r = await call(staff,"POST","/admin/users",{email:"evil@test.com",password:"evil-password-long-1",role:"OWNER"});
check("STAFF cannot create an OWNER (403)", r.status===403);
r = await call(staff,"GET","/admin/orders");
check("STAFF CAN read orders (200)", r.status===200);
const content = jar("content");
await call(content,"POST","/admin/auth/login",{email:"content@test.com",password:"content-password-long-1"});
r = await call(content,"PUT","/admin/site-content/announcement",{text:"Hi",visible:true});
check("CONTENT role can edit CMS (200)", r.status===200, JSON.stringify(r.data));
r = await call(content,"GET","/admin/orders".replace("orders","orders"));
r = await call(content,"PATCH","/admin/orders/00000000-0000-0000-0000-000000000000/status",{status:"Completed"});
check("CONTENT cannot change orders (403)", r.status===403);
r = await call(jar("anon"),"PATCH",`/admin/products/${pid}`,{name:"x"});
check("anonymous cannot edit product (401)", r.status===401);

// DOUBLE-SALE RACE: 5 simultaneous orders for the SAME used unit
const mk = (i)=>call(jar("c"+i),"POST","/api/orders",{name:"Cust "+i,phone:"0100000000"+i,items:[{productId:pid,inventoryUnitId:uid,unitPriceCents:3600000,qty:1}]});
const results = await Promise.all([0,1,2,3,4].map(mk));
const created = results.filter(x=>x.status===201).length, conflicts = results.filter(x=>x.status===409).length;
check(`5 simultaneous buyers, same used phone → exactly 1 order created (got ${created} created, ${conflicts} rejected)`, created===1 && conflicts===4);
r = await call(owner,"GET",`/admin/products/${pid}/units`);
check("unit is now 'sold' in DB (set server-side)", r.data.units[0].status==="sold");
r = await call(jar("anon"),"GET","/api/catalog");
check("sold unit no longer exposed to storefront", !r.data.deviceUnits.some(u=>u.id===uid));
r = await call(owner,"GET","/admin/orders");
check("order visible in Admin → Orders", r.data.orders.length>=1);

// 2FA
r = await call(owner,"POST","/admin/auth/totp-setup");
check("2FA setup returns QR + secret", r.status===200 && r.data.qrDataUrl?.startsWith("data:image/png"));
const secret = r.data.secret;
r = await call(owner,"POST","/admin/auth/totp-confirm",{code:"000000"});
check("2FA confirm rejects wrong code", r.status===400);
r = await call(owner,"POST","/admin/auth/totp-confirm",{code:authenticator.generate(secret)});
check("2FA confirm accepts valid code", r.status===200);
const owner2 = jar("owner2");
r = await call(owner2,"POST","/admin/auth/login",{email:"owner@test.com",password:"a-very-long-test-password-1"});
check("after enabling 2FA, password alone does NOT grant a session", r.data?.totpRequired===true && !owner2.cookies.gi_session);
r = await call(owner2,"GET","/admin/products");
check("…and admin API still rejects them (401)", r.status===401);
r = await call(owner2,"POST","/admin/auth/totp-verify",{code:"123456"});
check("wrong 2FA code rejected", r.status===401);
r = await call(owner2,"POST","/admin/auth/totp-verify",{code:authenticator.generate(secret)});
check("correct 2FA code grants session", r.status===200 && owner2.cookies.gi_session);

// refresh rotation + logout revocation
const old = owner2.cookies.gi_session;
r = await call(owner2,"POST","/admin/auth/refresh");
check("refresh rotates session id", r.status===200 && owner2.cookies.gi_session!==old);
const stale = jar("stale"); stale.cookies.gi_session = old;
r = await call(stale,"GET","/admin/products");
check("old (rotated-out) session id is revoked/unusable", r.status===401);
await call(owner2,"POST","/admin/auth/logout");
r = await call(owner2,"GET","/admin/products");
check("after logout, session is dead", r.status===401);

// deactivate user revokes sessions immediately
r = await call(owner,"GET","/admin/users");
const staffId = r.data.adminUsers.find(u=>u.email==="staff@test.com").id;
await call(owner,"POST",`/admin/users/${staffId}/deactivate`);
r = await call(staff,"GET","/admin/orders");
check("deactivated admin's live session stops working immediately", r.status===401);

// brute force lockout
const bf = jar("bf");
let last; for (let i=0;i<7;i++) last = await call(bf,"POST","/admin/auth/login",{email:"content@test.com",password:"bad-bad-bad-"+i});
check("repeated bad passwords → account locked (423) / rate-limited", last.status===423 || last.status===429, "status="+last.status);
r = await call(bf,"POST","/admin/auth/login",{email:"content@test.com",password:"content-password-long-1"});
check("locked account rejects even the CORRECT password", r.status===423 || r.status===429, "status="+r.status);

// validation / injection attempts
r = await call(owner,"POST","/admin/products",{categoryKey:"iphone'; DROP TABLE products;--",productType:"x",name:"x"});
check("SQL-injection-style input does not break anything (FK/validation rejects)", r.status>=400);
r = await call(jar("anon"),"GET","/api/catalog");
check("products table still intact after injection attempts", r.status===200 && r.data.products.length>=22);

console.log(`\n${pass} passed, ${fail} failed`);
