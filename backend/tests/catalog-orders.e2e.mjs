// WARNING: run ONLY against a throwaway/test database — this places real orders.
// Run AFTER security.e2e.mjs on the same fresh DB: API_URL=http://localhost:4058 node tests/catalog-orders.e2e.mjs
const B=process.env.API_URL||"http://localhost:4058";
let pass=0,fail=0; const check=(n,c,x="")=>{c?pass++:fail++;console.log(`${c?"PASS":"FAIL"}  ${n} ${c?"":x}`)};
const post=async(p,b)=>{const r=await fetch(B+p,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(b)});return{status:r.status,data:await r.json()}};
const cat = await (await fetch(B+"/api/catalog")).json();
const bySlug = Object.fromEntries(cat.products.map(p=>[p.slug,p]));
check("catalog returns all 22 imported products", cat.products.length>=22, cat.products.length);
check("variantPricing is in whole EGP (iPhone 14 128GB = 28000)", bySlug["iphone-14"].variantPricing["128GB"]===28000, JSON.stringify(bySlug["iphone-14"].variantPricing));
check("iPhone 17 Pro is a reservation product", bySlug["iphone-17-pro"].salesMode==="reservation" && bySlug["iphone-17-pro"].status==="preorder");
check("recommendation scores + screenSize survived import", !!bySlug["iphone-14"].rec && bySlug["iphone-14"].screenSize===6.1);
check("featured/best-seller collections preserved", cat.products.some(p=>p.collections.includes("best-sellers")) && cat.products.some(p=>p.collections.includes("new-arrivals")));
check("used units exposed with EGP price + battery", cat.deviceUnits.length>=5 && cat.deviceUnits[0].price>1000 && cat.deviceUnits[0].battery>0);
check("hero slides present, product link resolved to real id", cat.heroSlides.length>=3 && cat.heroSlides.some(s=>s.target.view==="product"));
check("siteContent has collections + categoryImages", cat.siteContent.collections.length>=5 && typeof cat.siteContent.categoryImages==="object");

// PRICE TAMPERING
const iph14 = bySlug["iphone-14"];
let r = await post("/api/orders",{name:"Tamper",phone:"01000000001",items:[{productId:iph14.id,storage:"128GB",qty:2,unitPriceCents:1,unitPrice:1,price:1}]});
check("tampered price is ignored: 2 x iPhone 14 128GB = 56000 EGP", r.status===201 && r.data.order.total===56000, JSON.stringify(r.data));
r = await post("/api/orders",{name:"X",phone:"01000000002",items:[{productId:iph14.id,storage:"999GB",qty:1}]});
check("nonexistent configuration rejected (400)", r.status===400, JSON.stringify(r.data));
r = await post("/api/orders",{name:"X",phone:"01000000003",items:[{productId:bySlug["iphone-17-pro"].id,storage:"256GB",qty:1}]});
check("reservation-only product cannot be ordered (400)", r.status===400, JSON.stringify(r.data));
r = await post("/api/orders",{name:"X",phone:"01000000004",items:[{productId:bySlug["iphone-13-pro-max"].id,qty:1}]});
check("used-device product requires choosing a specific unit (400)", r.status===400, JSON.stringify(r.data));
r = await post("/api/orders",{name:"X",phone:"01000000005",items:[{productId:iph14.id,storage:"128GB",qty:9999}]});
check("absurd quantity rejected (400 validation)", r.status===400);

// reservations
r = await post("/api/reservations",{productId:iph14.id,name:"A",phone:"01000000006"});
check("cannot 'reserve' a normal for-sale product (400)", r.status===400, JSON.stringify(r.data));
r = await post("/api/reservations",{productId:bySlug["iphone-17-pro"].id,name:"Sara",phone:"01000000007",storage:"256GB",qty:1,email:""});
check("reservation for pre-order product accepted (201)", r.status===201, JSON.stringify(r.data));

// used unit race on REAL imported unit
const unit = cat.deviceUnits[0];
const results = await Promise.all([1,2,3,4,5,6].map(i=>post("/api/orders",{name:"R"+i,phone:"0100000010"+i,items:[{productId:unit.productId,inventoryUnitId:unit.id,qty:1}]})));
const ok=results.filter(x=>x.status===201), conflict=results.filter(x=>x.status===409);
check(`6 simultaneous buyers, one real used iPhone → 1 wins, 5 rejected (${ok.length}/${conflict.length})`, ok.length===1&&conflict.length===5);
check("winner is charged the DB price, not a client price", ok[0].data.order.total===unit.price, `${ok[0].data.order.total} vs ${unit.price}`);
const cat2 = await (await fetch(B+"/api/catalog")).json();
check("sold unit disappears from storefront catalog", !cat2.deviceUnits.some(u=>u.id===unit.id));

console.log(`\n${pass} passed, ${fail} failed`);
