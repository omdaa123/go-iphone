import { Children, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, Box, Boxes, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Command, CreditCard, ExternalLink,
  Eye, FileText, Gauge, Image, LayoutDashboard, LogOut, Menu, Package,
  Plus, RefreshCw, Search, Settings, ShieldCheck, ShoppingBag, ShoppingCart,
  SlidersHorizontal, Sparkles, Users, X, AlertTriangle, CheckCircle2,
  Clock3, Smartphone, Layers3, Monitor
, ArrowRight , ArrowLeft , Pencil } from "lucide-react";

function CustomSelect({value,onChange,children,...props}) {
  const options=Children.toArray(children).filter(child=>child?.type==="option").map(child=>String(child.props.value??child.props.children));
  const [customMode,setCustomMode]=useState(Boolean(value)&&!options.includes(String(value)));
  return <><select {...props} value={customMode?"__custom__":value} onChange={e=>{if(e.target.value==="__custom__"){setCustomMode(true);onChange({target:{value:""}});}else{setCustomMode(false);onChange(e);}}}>{children}<option value="__custom__">Custom — enter another value</option></select>{customMode&&<input value={value} onChange={e=>onChange({target:{value:e.target.value}})} placeholder="Enter your custom value" style={{marginTop:8}}/>}</>;
}

function CustomModelField({label,value,onChange,options,placeholder}) {
  const [custom,setCustom]=useState(Boolean(value)&&!options.includes(value));
  return <label className="field-wide">{label}<select required value={custom?"__custom__":value} onChange={e=>{if(e.target.value==="__custom__"){setCustom(true);onChange("");}else{setCustom(false);onChange(e.target.value);}}}><option value="">Select model…</option>{options.map(v=><option key={v} value={v}>{v}</option>)}<option value="__custom__">Custom — not listed</option></select>{custom&&<input required value={value==="Custom"?"":value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Enter custom model / edition"} style={{marginTop:8}}/>}</label>;
}

const DEVICE_COLOR_HEX = {
  "Black":"#252525","White":"#f4f2ed","Blue":"#4d78a8","Pink":"#e6a9b5","Green":"#6f8871","Yellow":"#e8cf65","Purple":"#a99ac8","Red":"#c93d43","Midnight":"#252936","Starlight":"#e8dfcf","Silver":"#c8c9c9","Space Gray":"#777a7d","Space Grey":"#777a7d","Space Black":"#333333","Natural Titanium":"#a99f91","Desert Titanium":"#c7a58b","Black Titanium":"#393a3c","White Titanium":"#e3e0d9","Blue Titanium":"#596b80","Gold":"#c9ad7b","Rose Gold":"#d7b2a5","Jet Black":"#202020","Sky Blue":"#a8c8d8","Cosmic Orange":"#df713d","Deep Blue":"#334b70","Cloud White":"#f1eee8","Lavender":"#b9a6d5","Sage":"#a8b7a0","Mist Blue":"#a9c2d2","Light Gold":"#d6c6a3","Graphite":"#55585b","Stainless Steel":"#bfc2c4","Natural":"#b4a99a","Silver Aluminum":"#c9cacc","Ultramarine":"#4e5eb8","Teal":"#5c9a91","Coral":"#f18d78","Product Red":"#c93d43","(PRODUCT)RED":"#c93d43","Midnight Green":"#40564b","Pacific Blue":"#4b718d","Sierra Blue":"#9bbbd3","Alpine Green":"#526b58","Deep Purple":"#59456e","Gold Stainless Steel":"#c9ad7b","Silver Stainless Steel":"#c8c9c9","Graphite Stainless Steel":"#55585b","Orange":"#df713d","Indigo":"#40558a","Blush":"#dca7a4","Citrus":"#d4c76d","Glacier":"#b8c8d5","Burgundy":"#6d2638","Night Sky":"#26364a","Star White":"#f3f0e9","Soft Pink":"#e8b8bd","Dark Bronze":"#665044","Light Gold":"#d8c29c","Radiant Gold":"#d1ad70","Pearl White":"#f1eee7","Night Blue":"#25384e","Slate":"#777b83"
};
const DEVICE_MODEL_COLORS = {
  iphone: {
    "iPhone X":["Silver","Space Gray"],"iPhone XS":["Silver","Space Gray","Gold"],"iPhone XS Max":["Silver","Space Gray","Gold"],
    "iPhone XR":["Black","White","Blue","Yellow","Coral","(PRODUCT)RED"],
    "iPhone 11":["Purple","Green","Yellow","Black","White","(PRODUCT)RED"],
    "iPhone 11 Pro":["Midnight Green","Space Gray","Silver","Gold"],"iPhone 11 Pro Max":["Midnight Green","Space Gray","Silver","Gold"],
    "iPhone SE (2nd generation)":["Black","White","(PRODUCT)RED"],
    "iPhone 12 mini":["Black","White","(PRODUCT)RED","Green","Blue","Purple"],"iPhone 12":["Black","White","(PRODUCT)RED","Green","Blue","Purple"],
    "iPhone 12 Pro":["Graphite","Silver","Gold","Pacific Blue"],"iPhone 12 Pro Max":["Graphite","Silver","Gold","Pacific Blue"],
    "iPhone 13 mini":["(PRODUCT)RED","Starlight","Midnight","Blue","Pink","Green"],"iPhone 13":["(PRODUCT)RED","Starlight","Midnight","Blue","Pink","Green"],
    "iPhone 13 Pro":["Graphite","Gold","Silver","Sierra Blue","Alpine Green"],"iPhone 13 Pro Max":["Graphite","Gold","Silver","Sierra Blue","Alpine Green"],
    "iPhone SE (3rd generation)":["Midnight","Starlight","(PRODUCT)RED"],
    "iPhone 14":["Midnight","Starlight","(PRODUCT)RED","Blue","Purple","Yellow"],"iPhone 14 Plus":["Midnight","Starlight","(PRODUCT)RED","Blue","Purple","Yellow"],
    "iPhone 14 Pro":["Space Black","Silver","Gold","Deep Purple"],"iPhone 14 Pro Max":["Space Black","Silver","Gold","Deep Purple"],
    "iPhone 15":["Black","Blue","Green","Yellow","Pink"],"iPhone 15 Plus":["Black","Blue","Green","Yellow","Pink"],
    "iPhone 15 Pro":["Black Titanium","White Titanium","Blue Titanium","Natural Titanium"],"iPhone 15 Pro Max":["Black Titanium","White Titanium","Blue Titanium","Natural Titanium"],
    "iPhone 16":["Black","White","Pink","Teal","Ultramarine"],"iPhone 16 Plus":["Black","White","Pink","Teal","Ultramarine"],
    "iPhone 16 Pro":["Black Titanium","White Titanium","Natural Titanium","Desert Titanium"],"iPhone 16 Pro Max":["Black Titanium","White Titanium","Natural Titanium","Desert Titanium"],
    "iPhone 16e":["Black","White"],"iPhone 17":["Black","White","Mist Blue","Sage","Lavender"],
    "iPhone 17 Pro":["Silver","Cosmic Orange","Deep Blue"],"iPhone 17 Pro Max":["Silver","Cosmic Orange","Deep Blue"],
    "iPhone Air":["Sky Blue","Light Gold","Cloud White","Space Black"],"iPhone 17e":["Black","White","Soft Pink"],"iPhone 18 Pro":["Black","Silver","Glacier","Burgundy"],"iPhone 18 Pro Max":["Black","Silver","Glacier","Burgundy"],"iPhone Duo":["Night Sky","Star White"]
  },
  ipad: {
    "iPad Pro 13-inch (M5)":["Space Black","Silver"],"iPad Pro 11-inch (M5)":["Space Black","Silver"],
    "iPad Pro 13-inch (M4)":["Space Black","Silver"],"iPad Pro 11-inch (M4)":["Space Black","Silver"],
    "iPad Air 13-inch (M4)":["Blue","Purple","Starlight","Space Gray"],"iPad Air 11-inch (M4)":["Blue","Purple","Starlight","Space Gray"],
    "iPad Air 13-inch (M3)":["Space Gray","Starlight","Blue","Purple"],"iPad Air 11-inch (M3)":["Space Gray","Starlight","Blue","Purple"],
    "iPad Air 13-inch (M2)":["Space Gray","Starlight","Blue","Purple"],"iPad Air 11-inch (M2)":["Space Gray","Starlight","Blue","Purple"],
    "iPad mini (A20 Pro)":["Space Gray","Blue","Purple","Starlight"],"iPad mini (A17 Pro)":["Space Gray","Blue","Purple","Starlight"],
    "iPad (A16)":["Silver","Blue","Pink","Yellow"],"iPad (10th generation)":["Silver","Blue","Pink","Yellow"],
    "iPad Air (5th generation)":["Space Gray","Starlight","Pink","Purple","Blue"],"iPad mini (6th generation)":["Space Gray","Pink","Purple","Starlight"],
    "iPad Air (4th generation)":["Space Gray","Silver","Rose Gold","Green","Sky Blue"],"iPad (9th generation)":["Space Gray","Silver"],
    "iPad mini (5th generation)":["Space Gray","Silver","Gold"],"iPad Pro 12.9-inch (6th generation)":["Space Gray","Silver"],"iPad Pro 11-inch (4th generation)":["Space Gray","Silver"],"iPad Pro 12.9-inch (5th generation)":["Space Gray","Silver"],"iPad Pro 11-inch (3rd generation)":["Space Gray","Silver"],"iPad Pro 12.9-inch (4th generation)":["Space Gray","Silver"],"iPad Pro 11-inch (2nd generation)":["Space Gray","Silver"],"iPad Air (3rd generation)":["Silver","Space Gray","Gold"],"iPad (8th generation)":["Silver","Space Gray","Gold"],"iPad mini 4":["Silver","Space Gray","Gold"],"iPad Pro 12.9-inch (3rd generation)":["Space Gray","Silver"],"iPad Pro 11-inch (1st generation)":["Space Gray","Silver"],"iPad (7th generation)":["Silver","Space Gray","Gold"],"iPad Air 2":["Silver","Space Gray","Gold"],"iPad Pro 10.5-inch":["Silver","Space Gray","Gold","Rose Gold"],"iPad Pro 9.7-inch":["Silver","Space Gray","Gold","Rose Gold"]
  },
  mac: {
    "MacBook Neo":["Indigo","Blush","Citrus","Silver"],
    "MacBook Air 13-inch (M5)":["Sky Blue","Midnight","Starlight","Silver"],"MacBook Air 15-inch (M5)":["Sky Blue","Midnight","Starlight","Silver"],
    "MacBook Air 13-inch (M4)":["Sky Blue","Midnight","Starlight","Silver"],"MacBook Air 15-inch (M4)":["Sky Blue","Midnight","Starlight","Silver"],
    "MacBook Air 13-inch (M3)":["Midnight","Starlight","Space Gray","Silver"],"MacBook Air 15-inch (M3)":["Midnight","Starlight","Space Gray","Silver"],
    "MacBook Air 13-inch (M2)":["Midnight","Starlight","Space Gray","Silver"],"MacBook Air 15-inch (M2)":["Midnight","Starlight","Space Gray","Silver"],
    "MacBook Air 13-inch (M1)":["Space Gray","Silver","Gold"],
    "MacBook Pro 14-inch (M5)":["Space Black","Silver"],"MacBook Pro 14-inch (M5 Pro)":["Space Black","Silver"],"MacBook Pro 14-inch (M5 Max)":["Space Black","Silver"],
    "MacBook Pro 16-inch (M5 Pro)":["Space Black","Silver"],"MacBook Pro 16-inch (M5 Max)":["Space Black","Silver"],
    "MacBook Pro 14-inch (M4)":["Space Black","Silver"],"MacBook Pro 16-inch (M4)":["Space Black","Silver"],
    "MacBook Pro 14-inch (M3)":["Space Black","Silver"],"MacBook Pro 16-inch (M3)":["Space Black","Silver"],
    "MacBook Pro 14-inch (M2 Pro)":["Space Gray","Silver"],"MacBook Pro 16-inch (M2 Pro)":["Space Gray","Silver"],"MacBook Pro 13-inch (M2)":["Space Gray","Silver"],"MacBook Pro 13-inch (M1)":["Space Gray","Silver"],"MacBook Pro 14-inch (M1 Pro)":["Space Gray","Silver"],"MacBook Pro 16-inch (M1 Pro)":["Space Gray","Silver"],"iMac 24-inch (M6, two ports)":["Blue","Purple","Pink","Orange","Yellow","Green","Silver"],"iMac 24-inch (M6, four ports)":["Blue","Purple","Pink","Orange","Yellow","Green","Silver"],"iMac 24-inch":["Blue","Purple","Pink","Orange","Yellow","Green","Silver"],"Mac mini (M6)":["Silver"],"Mac mini (M5 Pro)":["Silver"],"Mac mini":["Silver"],"Mac Studio (M5 Max)":["Silver"],"Mac Studio (M5 Ultra)":["Silver"],"Mac Studio":["Silver"],"Mac Pro":["Silver"]
  },
  airpods: {
    "AirPods 5":["White"],"AirPods 5 with Wireless Charging Case":["White"],"AirPods 4":["White"],"AirPods 4 with Active Noise Cancellation":["White"],
    "AirPods Pro 3":["White"],"AirPods Pro 2":["White"],"AirPods Max 2":["Midnight","Starlight","Blue","Purple","Orange"],
    "AirPods Max":["Midnight","Starlight","Blue","Purple","Orange"],"AirPods Max (Lightning)":["Space Gray","Silver","Sky Blue","Green","Pink"],
    "AirPods (3rd generation) with MagSafe Charging Case":["White"],"AirPods (3rd generation) with Lightning Charging Case":["White"],"AirPods (2nd generation)":["White"]
  }
};
function appleModelGroupKey(category, model, condition) {
  const slug = value => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const modelKey = slug(model).slice(0, 72) || "custom-model";
  if (condition !== "New") return `apple-used-${category}-${modelKey}-${Math.random().toString(36).slice(2, 9)}`.slice(0, 120);
  return `apple-${category}-${modelKey}-new`.slice(0, 120);
}
function ColorPickerField({label,value,onChange,options=[],allowCustom=true}) {
  const [custom,setCustom]=useState(false);
  const choices=[...new Set(options.filter(Boolean))];
  return <div className="field-wide color-picker-field">
    <label>{label}<select value={choices.includes(value)?value:(value?"__custom__":"")} onChange={e=>{if(e.target.value==="__custom__"){setCustom(true);onChange("");}else{setCustom(false);onChange(e.target.value);}}}>
      <option value="">Choose a color…</option>{choices.map(color=><option key={color} value={color}>{color}</option>)}{allowCustom&&<option value="__custom__">Custom color…</option>}
    </select></label>
    {choices.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:10}}>{choices.map(color=><button type="button" key={color} title={color} aria-label={color} onClick={()=>{setCustom(false);onChange(color);}} style={{display:"flex",alignItems:"center",gap:7,padding:"7px 10px",borderRadius:24,border:value===color?"2px solid var(--accent, #6b7280)":"1px solid var(--border, #ddd)",background:"transparent",cursor:"pointer"}}><span style={{display:"inline-block",width:22,height:22,borderRadius:"50%",background:DEVICE_COLOR_HEX[color]||"#999",border:"1px solid rgba(0,0,0,.18)",boxShadow:value===color?"0 0 0 2px var(--surface, white) inset":"none"}}/><small>{color}</small></button>)}</div>}
    {(custom||Boolean(value&&!choices.includes(value)))&&<input value={value} onChange={e=>onChange(e.target.value)} placeholder="Enter custom color name" />}
  </div>;
}

const API = (import.meta.env.VITE_API_URL || "/admin").replace(/\/$/, "");
const PREVIEW_STOREFRONT_URL = import.meta.env.DEV ? "http://127.0.0.1:5174/?adminPreview=1" : `${import.meta.env.VITE_STOREFRONT_URL || "https://go-iphone-storefront1.vercel.app"}/?adminPreview=1`;
const money = (cents = 0) => new Intl.NumberFormat("en-EG", {
  style: "currency", currency: "EGP", maximumFractionDigits: 0
}).format(Number(cents || 0) / 100);
const date = (value) => value ? new Date(value).toLocaleDateString("en-GB", {
  day: "2-digit", month: "short", year: "numeric"
}) : "—";
const titleCase = (value = "") => String(value).replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
const IPHONE_MODELS = ["iPhone X","iPhone XS","iPhone XS Max","iPhone XR","iPhone 11","iPhone 11 Pro","iPhone 11 Pro Max","iPhone SE (2nd generation)","iPhone 12 mini","iPhone 12","iPhone 12 Pro","iPhone 12 Pro Max","iPhone 13 mini","iPhone 13","iPhone 13 Pro","iPhone 13 Pro Max","iPhone SE (3rd generation)","iPhone 14","iPhone 14 Plus","iPhone 14 Pro","iPhone 14 Pro Max","iPhone 15","iPhone 15 Plus","iPhone 15 Pro","iPhone 15 Pro Max","iPhone 16","iPhone 16 Plus","iPhone 16 Pro","iPhone 16 Pro Max","iPhone 16e","iPhone 17","iPhone 17 Pro","iPhone 17 Pro Max","iPhone Air","iPhone 17e","iPhone 18 Pro","iPhone 18 Pro Max","iPhone Duo"];
const IPAD_MODELS = ["iPad Pro 13-inch (M5)","iPad Pro 11-inch (M5)","iPad Air 13-inch (M4)","iPad Air 11-inch (M4)","iPad (A16)","iPad mini (A20 Pro)","iPad mini (A17 Pro)","iPad Pro 13-inch (M4)","iPad Pro 11-inch (M4)","iPad Air 13-inch (M3)","iPad Air 11-inch (M3)","iPad Air 13-inch (M2)","iPad Air 11-inch (M2)","iPad Pro 12.9-inch (6th generation)","iPad Pro 11-inch (4th generation)","iPad (10th generation)","iPad Air (5th generation)","iPad mini (6th generation)","iPad Pro 12.9-inch (5th generation)","iPad Pro 11-inch (3rd generation)","iPad Air (4th generation)","iPad (9th generation)","iPad mini (5th generation)","iPad Pro 12.9-inch (4th generation)","iPad Pro 11-inch (2nd generation)","iPad Air (3rd generation)","iPad (8th generation)","iPad mini 4","iPad Pro 12.9-inch (3rd generation)","iPad Pro 11-inch (1st generation)","iPad (7th generation)","iPad Air 2","iPad Pro 10.5-inch","iPad Pro 9.7-inch"];
const MAC_MODELS = ["MacBook Neo","MacBook Air 13-inch (M5)","MacBook Air 15-inch (M5)","MacBook Pro 14-inch (M5)","MacBook Pro 14-inch (M5 Pro)","MacBook Pro 14-inch (M5 Max)","MacBook Pro 16-inch (M5 Pro)","MacBook Pro 16-inch (M5 Max)","iMac 24-inch (M6, two ports)","iMac 24-inch (M6, four ports)","Mac mini (M6)","Mac mini (M5 Pro)","Mac Studio (M5 Max)","Mac Studio (M5 Ultra)","MacBook Air 13-inch (M4)","MacBook Air 15-inch (M4)","MacBook Pro 14-inch (M4)","MacBook Pro 16-inch (M4)","MacBook Air 13-inch (M3)","MacBook Air 15-inch (M3)","MacBook Pro 14-inch (M3)","MacBook Pro 16-inch (M3)","MacBook Air 13-inch (M2)","MacBook Air 15-inch (M2)","MacBook Pro 13-inch (M2)","MacBook Pro 14-inch (M2 Pro)","MacBook Pro 16-inch (M2 Pro)","MacBook Air 13-inch (M1)","MacBook Pro 13-inch (M1)","MacBook Pro 14-inch (M1 Pro)","MacBook Pro 16-inch (M1 Pro)","iMac 24-inch","Mac mini","Mac Studio","Mac Pro"];
const IPAD_SCREEN_SIZES = ["7.9-inch","8.3-inch","8.5-inch","9.7-inch","10.2-inch","10.5-inch","10.9-inch","11-inch","12.9-inch","13-inch"];
const IPAD_STORAGE = ["16GB","32GB","64GB","128GB","256GB","512GB","1TB","2TB"];
const MAC_STORAGE = ["128GB","256GB","512GB","1TB","2TB","4TB","8TB"];
const MAC_MEMORY = ["8GB","12GB","16GB","18GB","24GB","32GB","36GB","48GB","64GB","96GB","128GB","192GB","256GB","Other / custom"];
const AIRPODS_MODELS = ["AirPods 5","AirPods 5 with Wireless Charging Case","AirPods 4","AirPods 4 with Active Noise Cancellation","AirPods Pro 3","AirPods Pro 2","AirPods Max 2","AirPods Max","AirPods (3rd generation) with MagSafe Charging Case","AirPods (3rd generation) with Lightning Charging Case","AirPods (2nd generation)"];

const OTHER_DEVICE_FIELD_SETS = {
  smartphone: [{key:"brand",label:"Brand"},{key:"model",label:"Model"},{key:"ram",label:"RAM"},{key:"network",label:"Network / SIM support"},{key:"color",label:"Color (optional)"}],
  smartwatch: [{key:"brand",label:"Brand"},{key:"model",label:"Model"},{key:"caseSize",label:"Case size"},{key:"connectivity",label:"Connectivity"},{key:"material",label:"Case material"},{key:"color",label:"Color (optional)"}],
  tablet: [{key:"brand",label:"Brand"},{key:"model",label:"Model"},{key:"screenSize",label:"Screen size"},{key:"processor",label:"Chip / Processor"},{key:"connectivity",label:"Connectivity"},{key:"color",label:"Color (optional)"}],
  speakers: [{key:"brand",label:"Brand"},{key:"model",label:"Model"},{key:"speakerType",label:"Speaker type"},{key:"outputPower",label:"Output power (W)"},{key:"connectivity",label:"Connectivity"},{key:"waterproof",label:"Waterproof rating"},{key:"color",label:"Color (optional)"}],
  headphones: [{key:"brand",label:"Brand"},{key:"model",label:"Model"},{key:"headphoneType",label:"Headphone type"},{key:"connectivity",label:"Connectivity"},{key:"noiseCancellation",label:"Noise cancellation"},{key:"microphone",label:"Microphone"},{key:"color",label:"Color (optional)"}],
  "other-electronics": [{key:"brand",label:"Brand"},{key:"model",label:"Model"},{key:"deviceType",label:"Device type"},{key:"connectivity",label:"Connectivity"},{key:"keyFeature",label:"Main features"},{key:"color",label:"Color (optional)"}]
};

const WATCH_MODELS = [
  { name:"Apple Watch Series 12", year:2026, sizes:["42mm","46mm"], materials:["Aluminum","Titanium","Ceramic"], connectivity:["GPS","GPS + Cellular"], connectivityByMaterial:{Aluminum:["GPS","GPS + Cellular"],Titanium:["GPS + Cellular"],Ceramic:["GPS + Cellular"]}, colorsByMaterial:{Aluminum:["Dark Bronze","Light Gold","Black","Space Gray"],Titanium:["Radiant Gold","Natural"],Ceramic:["Pearl White","Night Blue"]}, colors:["Dark Bronze","Light Gold","Black","Space Gray","Radiant Gold","Natural","Pearl White","Night Blue"], display:"Always-On Retina", chip:"S11", capacity:"64GB" },
  { name:"Apple Watch Ultra 4", year:2026, sizes:["49mm"], materials:["Titanium"], connectivity:["GPS + Cellular"], colors:["Natural","Black"], display:"Always-On Retina", chip:"S11", capacity:"64GB" },
  { name:"Apple Watch SE 3", year:2025, sizes:["40mm","44mm"], materials:["Aluminum"], connectivity:["GPS","GPS + Cellular"], colors:["Midnight","Starlight"], display:"Always-On Retina", chip:"S10", capacity:"64GB" },
  { name:"Apple Watch Series 11", year:2025, sizes:["42mm","46mm"], materials:["Aluminum","Titanium"], connectivity:["GPS","GPS + Cellular"], connectivityByMaterial:{Aluminum:["GPS","GPS + Cellular"],Titanium:["GPS + Cellular"]}, colorsByMaterial:{Aluminum:["Rose Gold","Silver","Space Gray","Jet Black"],Titanium:["Gold","Natural","Slate"]}, colors:["Rose Gold","Silver","Space Gray","Jet Black","Gold","Natural","Slate"], display:"Always-On Retina", chip:"S10", capacity:"64GB" },
  { name:"Apple Watch Ultra 3", year:2025, sizes:["49mm"], materials:["Titanium"], connectivity:["GPS + Cellular"], colors:["Natural","Black"], display:"Always-On Retina", chip:"S10", capacity:"64GB" },
  { name:"Apple Watch Series 10", year:2024, sizes:["42mm","46mm"], materials:["Aluminum","Titanium"], connectivity:["GPS","GPS + Cellular"], connectivityByMaterial:{Aluminum:["GPS","GPS + Cellular"],Titanium:["GPS + Cellular"]}, colorsByMaterial:{Aluminum:["Jet Black","Rose Gold","Silver"],Titanium:["Natural","Gold","Slate"]}, colors:["Jet Black","Rose Gold","Silver","Natural","Gold","Slate"], display:"Always-On Retina", chip:"S10", capacity:"64GB" },
  { name:"Apple Watch Ultra 2", year:2023, sizes:["49mm"], materials:["Titanium"], connectivity:["GPS + Cellular"], colors:["Natural","Black"], display:"Always-On Retina", chip:"S9", capacity:"64GB" },
  { name:"Apple Watch Series 9", year:2023, sizes:["41mm","45mm"], materials:["Aluminum","Stainless Steel"], connectivity:["GPS","GPS + Cellular"], connectivityByMaterial:{Aluminum:["GPS","GPS + Cellular"],"Stainless Steel":["GPS + Cellular"]}, colorsByMaterial:{Aluminum:["Midnight","Starlight","Silver","Pink","(PRODUCT)RED"],"Stainless Steel":["Gold","Silver","Graphite"]}, colors:["Midnight","Starlight","Silver","Pink","(PRODUCT)RED","Gold","Graphite"], display:"Always-On Retina", chip:"S9", capacity:"64GB" },
  { name:"Apple Watch Ultra", year:2022, sizes:["49mm"], materials:["Titanium"], connectivity:["GPS + Cellular"], colors:["Natural Titanium"], display:"Always-On Retina", chip:"S8", capacity:"32GB" },
  { name:"Apple Watch Series 8", year:2022, sizes:["41mm","45mm"], materials:["Aluminum","Stainless Steel"], connectivity:["GPS","GPS + Cellular"], connectivityByMaterial:{Aluminum:["GPS","GPS + Cellular"],"Stainless Steel":["GPS + Cellular"]}, colorsByMaterial:{Aluminum:["Midnight","Starlight","Silver","(PRODUCT)RED"],"Stainless Steel":["Gold","Silver","Graphite"]}, colors:["Midnight","Starlight","Silver","(PRODUCT)RED","Gold","Graphite"], display:"Always-On Retina", chip:"S8", capacity:"32GB" },
  { name:"Apple Watch Series 7", year:2021, sizes:["41mm","45mm"], materials:["Aluminum","Stainless Steel","Titanium"], connectivity:["GPS","GPS + Cellular"], connectivityByMaterial:{Aluminum:["GPS","GPS + Cellular"],"Stainless Steel":["GPS + Cellular"],Titanium:["GPS + Cellular"]}, colorsByMaterial:{Aluminum:["Midnight","Starlight","Green","Blue","(PRODUCT)RED"],"Stainless Steel":["Silver","Graphite","Gold"],Titanium:["Natural","Space Black"]}, colors:["Midnight","Starlight","Green","Blue","(PRODUCT)RED","Silver","Graphite","Gold","Natural","Space Black"], display:"Always-On Retina", chip:"S7", capacity:"32GB" },
  { name:"Apple Watch SE (2nd generation)", year:2022, sizes:["40mm","44mm"], materials:["Aluminum"], connectivity:["GPS","GPS + Cellular"], colors:["Midnight","Starlight","Silver"], display:"Retina", chip:"S8", capacity:"32GB" },
  { name:"Apple Watch Series 6", year:2020, sizes:["40mm","44mm"], materials:["Aluminum","Stainless Steel","Titanium"], connectivity:["GPS","GPS + Cellular"], connectivityByMaterial:{Aluminum:["GPS","GPS + Cellular"],"Stainless Steel":["GPS + Cellular"],Titanium:["GPS + Cellular"]}, colorsByMaterial:{Aluminum:["Space Gray","Silver","Gold","Blue","(PRODUCT)RED"],"Stainless Steel":["Graphite","Gold"],Titanium:["Natural","Space Black"]}, colors:["Space Gray","Silver","Gold","Blue","(PRODUCT)RED","Graphite","Natural","Space Black"], display:"Always-On Retina", chip:"S6", capacity:"32GB" },
  { name:"Apple Watch SE (1st generation)", year:2020, sizes:["40mm","44mm"], materials:["Aluminum"], connectivity:["GPS","GPS + Cellular"], colors:["Space Gray","Silver","Gold"], display:"Retina", chip:"S5", capacity:"32GB" },
  { name:"Apple Watch Series 5", year:2019, sizes:["40mm","44mm"], materials:["Aluminum","Stainless Steel","Titanium","Ceramic"], connectivity:["GPS","GPS + Cellular"], connectivityByMaterial:{Aluminum:["GPS","GPS + Cellular"],"Stainless Steel":["GPS + Cellular"],Titanium:["GPS + Cellular"],Ceramic:["GPS + Cellular"]}, colorsByMaterial:{Aluminum:["Space Gray","Silver","Gold"],"Stainless Steel":["Silver","Gold","Space Black"],Titanium:["Natural","Space Black"],Ceramic:["White"]}, colors:["Space Gray","Silver","Gold","White","Natural","Space Black"], display:"Always-On Retina", chip:"S5", capacity:"32GB" },
  { name:"Apple Watch Series 4", year:2018, sizes:["40mm","44mm"], materials:["Aluminum","Stainless Steel"], connectivity:["GPS","GPS + Cellular"], connectivityByMaterial:{Aluminum:["GPS","GPS + Cellular"],"Stainless Steel":["GPS + Cellular"]}, colorsByMaterial:{Aluminum:["Silver","Gold","Space Gray"],"Stainless Steel":["Gold","Silver","Space Black"]}, colors:["Silver","Gold","Space Gray","Gold","Space Black"], display:"Retina", chip:"S4", capacity:"16GB" },
  { name:"Apple Watch Series 3", year:2017, sizes:["38mm","42mm"], materials:["Aluminum","Stainless Steel","Ceramic"], connectivity:["GPS","GPS + Cellular"], connectivityByMaterial:{Aluminum:["GPS","GPS + Cellular"],"Stainless Steel":["GPS + Cellular"],Ceramic:["GPS + Cellular"]}, colorsByMaterial:{Aluminum:["Silver","Space Gray","Gold"],"Stainless Steel":["Silver Stainless Steel","Space Black Stainless Steel"],Ceramic:["White Ceramic","Gray Ceramic"]}, colors:["Silver","Space Gray","Gold","White Ceramic","Gray Ceramic"], display:"Retina", chip:"S3", capacity:"8GB / 16GB (by version)" },
  { name:"Apple Watch Series 2", year:2016, sizes:["38mm","42mm"], materials:["Aluminum","Stainless Steel","Ceramic"], connectivity:["GPS"], colors:["Silver","Space Gray","Gold","Rose Gold","White Ceramic","Black Ceramic"], display:"Retina", chip:"S2", capacity:"8GB" },
  { name:"Apple Watch Series 1", year:2016, sizes:["38mm","42mm"], materials:["Aluminum"], connectivity:["iPhone-connected"], colors:["Silver","Space Gray","Gold","Rose Gold"], display:"Retina", chip:"S1P", capacity:"8GB" },
  { name:"Apple Watch (1st generation)", year:2015, sizes:["38mm","42mm"], materials:["Stainless Steel","18-karat Gold"], connectivity:["GPS (iPhone-connected)"], colors:["Stainless Steel","Space Black Stainless Steel","18-karat Yellow Gold","18-karat Rose Gold"], display:"Retina", chip:"S1", capacity:"8GB" }
];


const WATCH_TECH_SPECS = {
  "Apple Watch Series 12": {displayType:"Always-On Retina LTPO3 OLED",brightness:"2000 nits peak / 1 nit minimum",resolution:{"42mm":"374 × 446 px","46mm":"416 × 496 px"},water:"50 metres",dust:"IP6X",battery:"Up to 24 hours; Low Power Mode up to 38 hours",glass:"Ceramic Shield 2 (aluminium); sapphire crystal (titanium / ceramic)",gps:"L1 precision GPS",wireless:"Wi‑Fi 4 (2.4/5GHz), Bluetooth 5.3, 2nd-gen Ultra Wideband",sensors:"Electrical heart sensor (2nd gen), optical heart sensor, blood oxygen, temperature, compass, always-on altimeter, high-g accelerometer, gyroscope, ambient light, depth gauge (6m), water temperature",dimensions:{"42mm":"42 × 37 × 9.7 mm","46mm":"46 × 40 × 9.7 mm"},dimensionsByMaterial:{Ceramic:{"42mm":"43 × 37 × 9.85 mm","46mm":"47 × 41 × 9.85 mm"}},features:"ECG, blood oxygen, sleep score, sleep apnea and hypertension notifications, temperature sensing, depth and water-temperature sensing, crash and fall detection",displayArea:{"42mm":"970 mm²","46mm":"1196 mm²"},weight:{"42mm":"Aluminium GPS 32.2g; GPS + Cellular 31.5g; titanium 36.5g; ceramic 41.7–42.8g","46mm":"Aluminium GPS 39.5g; GPS + Cellular 38.6g; titanium 44.9g; ceramic 51.3–52.9g"},wristFit:{"42mm":"130–200 mm","46mm":"140–245 mm"},charging:"Fast charge: up to 80% in about 30 minutes",compatibility:"iPhone 11 or later with iOS 27 or later",audio:"Speaker, microphone with Voice Isolation, media playback"},
  "Apple Watch Ultra 4": {displayType:"Always-On Retina LTPO3 OLED",brightness:"3000 nits peak / 1 nit minimum",resolution:{"49mm":"422 × 514 px"},water:"100 metres; recreational diving to 40m",dust:"IP6X",battery:"Up to 50 hours; Low Power Mode up to 84 hours",glass:"Flat sapphire crystal",gps:"Precision dual-frequency GPS",wireless:"Wi‑Fi 4 (2.4/5GHz), Bluetooth 5.3, 2nd-gen Ultra Wideband, cellular",sensors:"Electrical and optical heart sensors, blood oxygen, temperature, compass, always-on altimeter, high-g accelerometer, gyroscope, ambient light, depth gauge, water temperature",dimensions:{"49mm":"49 × 44 × 12 mm"},features:"Advanced outdoor workouts, Action button, siren, satellite safety features, depth gauge, 40m recreational diving, ECG, blood oxygen, sleep and hypertension notifications",displayArea:{"49mm":"1245 mm²"},weight:{"49mm":"63.0g natural titanium; 63.1g black titanium"},wristFit:{"49mm":"130–210 mm"},charging:"Fast charge: up to 80% in about 45 minutes",compatibility:"iPhone 11 or later with iOS 27 or later",audio:"Three-microphone array, dual speakers, siren"},
  "Apple Watch SE 3": {displayType:"Retina OLED, Always-On",brightness:"1000 nits peak",resolution:{"40mm":"324 × 394 px","44mm":"368 × 448 px"},water:"50 metres",dust:"Not rated IP6X",battery:"Up to 18 hours; Low Power Mode up to 32 hours",glass:"Ion‑X glass",gps:"GPS / GPS + Cellular by variant",wireless:"Wi‑Fi 4, Bluetooth 5.3, 2nd-gen Ultra Wideband",sensors:"Optical heart sensor, temperature, compass, always-on altimeter, accelerometer, gyroscope, ambient light",weight:{"40mm":"GPS 26.3g; GPS + Cellular 26.4g","44mm":"GPS 32.9g; GPS + Cellular 33.0g"},wristFit:{"40mm":"130–200 mm","44mm":"140–245 mm"},features:"Always-On display, temperature sensing, crash detection, fall detection, sleep stages and sleep apnea notifications",compatibility:"iPhone 11 or later with iOS 26 or later",charging:"Fast charging supported",audio:"Speaker and microphone",displayArea:{"40mm":"759 mm²","44mm":"977 mm²"}},
  "Apple Watch Series 11": {displayType:"Always-On Retina OLED",brightness:"2000 nits peak / 1 nit minimum",water:"50 metres",dust:"IP6X",battery:"Up to 24 hours; Low Power Mode up to 38 hours",glass:"Ion‑X (aluminium); sapphire crystal (titanium)",gps:"L1 precision GPS",wireless:"Wi‑Fi 4, Bluetooth 5.3, 2nd-gen Ultra Wideband",sensors:"Electrical and optical heart sensors, blood oxygen, temperature, compass, always-on altimeter, accelerometer, gyroscope, ambient light",resolution:{"42mm":"374 × 446 px","46mm":"416 × 496 px"},dimensions:{"42mm":"42 × 36 × 9.7 mm","46mm":"46 × 39 × 9.7 mm"},weight:{"42mm":"Aluminium GPS 30.3g; GPS + Cellular 29.7g; titanium 34.6g","46mm":"Aluminium GPS 37.8g; GPS + Cellular 36.9g; titanium 43.1g"},wristFit:{"42mm":"130–200 mm","46mm":"140–245 mm"},features:"ECG, blood oxygen, temperature, sleep apnea notifications, sleep score, hypertension notifications, crash and fall detection",compatibility:"iPhone 11 or later with iOS 26 or later",charging:"Fast charge supported",audio:"Speaker and microphone",displayArea:{"42mm":"970 mm²","46mm":"1196 mm²"}},
  "Apple Watch Ultra 3": {displayType:"Always-On Retina OLED, wide-angle LTPO3",brightness:"3000 nits peak / 1 nit minimum",water:"100 metres; recreational diving to 40m",dust:"IP6X",battery:"Up to 42 hours; Low Power Mode up to 72 hours",glass:"Flat sapphire crystal",gps:"Precision dual-frequency GPS",wireless:"Wi‑Fi 4, Bluetooth 5.3, 2nd-gen Ultra Wideband, satellite and cellular features",sensors:"Electrical and optical heart sensors, blood oxygen, temperature, compass, always-on altimeter, accelerometer, gyroscope, ambient light, depth gauge, water temperature",resolution:{"49mm":"422 × 514 px"},dimensions:{"49mm":"49 × 44 × 12 mm"},features:"Satellite emergency features, depth gauge, 40m recreational diving, dual-frequency GPS, Action button, siren, ECG, blood oxygen and temperature",weight:{"49mm":"61.6g natural titanium; 61.8g black titanium"},wristFit:{"49mm":"130–210 mm"},compatibility:"iPhone 11 or later with iOS 26 or later",audio:"Three-microphone array, dual speakers, siren",charging:"Fast charge supported",displayArea:{"49mm":"1245 mm²"}},
  "Apple Watch Series 10": {displayType:"Always-On Retina OLED, wide-angle LTPO3",brightness:"2000 nits peak / 1 nit minimum",water:"50 metres",dust:"IP6X",battery:"Up to 18 hours; Low Power Mode up to 36 hours",glass:"Ion‑X (aluminium); sapphire crystal (titanium)",gps:"L1 precision GPS",wireless:"Wi‑Fi 4, Bluetooth 5.3, 2nd-gen Ultra Wideband",sensors:"Electrical and optical heart sensors, blood oxygen, temperature, compass, altimeter, accelerometer, gyroscope, ambient light, depth gauge, water temperature",resolution:{"42mm":"374 × 446 px","46mm":"416 × 496 px"},dimensions:{"42mm":"42 × 36 × 9.7 mm","46mm":"46 × 39 × 9.7 mm"},features:"ECG, blood oxygen, temperature, sleep apnea notifications, depth gauge (6m), water temperature sensor, crash and fall detection",displayArea:{"42mm":"989 mm²","46mm":"1220 mm²"},charging:"Fast charging supported",audio:"Speaker and microphone"},
  "Apple Watch Ultra 2": {displayType:"Always-On Retina OLED",brightness:"3000 nits peak",water:"100 metres; recreational diving to 40m",dust:"IP6X",battery:"Up to 36 hours; Low Power Mode up to 72 hours",glass:"Flat sapphire crystal",gps:"Precision dual-frequency GPS",wireless:"Wi‑Fi 4, Bluetooth 5.3, 2nd-gen Ultra Wideband",sensors:"Electrical and optical heart sensors, blood oxygen, temperature, compass, altimeter, accelerometer, gyroscope, ambient light, depth gauge, water temperature",resolution:{"49mm":"410 × 502 px"},dimensions:{"49mm":"49 × 44 × 14.4 mm"},features:"Action button, siren, dual-frequency GPS, depth gauge, 40m recreational diving, ECG, blood oxygen and temperature",displayArea:{"49mm":"1185 mm²"},wristFit:{"49mm":"130–210 mm"},charging:"Fast charging supported",audio:"Dual speakers, three-microphone array, siren"},
  "Apple Watch Series 9": {displayType:"Always-On Retina OLED",brightness:"2000 nits peak",water:"50 metres",dust:"IP6X",battery:"Up to 18 hours; Low Power Mode up to 36 hours",glass:"Ion‑X (aluminium); sapphire crystal (stainless steel)",gps:"L1 GPS",wireless:"Wi‑Fi 4, Bluetooth 5.3, 2nd-gen Ultra Wideband",sensors:"Electrical and optical heart sensors, temperature, compass, altimeter, accelerometer, gyroscope, ambient light",resolution:{"41mm":"352 × 430 px","45mm":"396 × 484 px"},dimensions:{"41mm":"41 × 35 × 10.7 mm","45mm":"45 × 38 × 10.7 mm"},features:"ECG, blood oxygen, temperature, crash detection, fall detection, double tap gesture, on-device Siri",displayArea:{"41mm":"904 mm²","45mm":"1143 mm²"}},
  "Apple Watch Ultra": {displayType:"Always-On Retina OLED",brightness:"2000 nits peak",water:"100 metres; recreational diving to 40m",dust:"IP6X",battery:"Up to 36 hours; Low Power Mode up to 60 hours",glass:"Flat sapphire crystal",gps:"Precision dual-frequency GPS",wireless:"Wi‑Fi 4, Bluetooth 5.3, Ultra Wideband",sensors:"Electrical and optical heart sensors, blood oxygen, temperature, compass, altimeter, accelerometer, gyroscope, ambient light, depth gauge, water temperature",resolution:{"49mm":"410 × 502 px"},dimensions:{"49mm":"49 × 44 × 14.4 mm"},features:"Action button, siren, dual-frequency GPS, depth gauge, 40m recreational diving, ECG, blood oxygen and temperature",displayArea:{"49mm":"1185 mm²"}},
  "Apple Watch Series 8": {displayType:"Always-On Retina OLED",brightness:"1000 nits peak",water:"50 metres",dust:"IP6X",battery:"Up to 18 hours",glass:"Ion‑X (aluminium); sapphire crystal (stainless steel)",gps:"GPS / GPS + Cellular by variant",wireless:"Wi‑Fi 4, Bluetooth 5.0, Ultra Wideband (U1)",sensors:"Electrical and optical heart sensors, temperature, compass, altimeter, accelerometer, gyroscope, ambient light",resolution:{"41mm":"352 × 430 px","45mm":"396 × 484 px"},dimensions:{"41mm":"41 × 35 × 10.7 mm","45mm":"45 × 38 × 10.7 mm"},features:"ECG, blood oxygen, temperature, crash detection, fall detection, cycle tracking retrospective ovulation estimates",displayArea:{"41mm":"904 mm²","45mm":"1143 mm²"}},
  "Apple Watch Series 7": {displayType:"Always-On Retina OLED",brightness:"1000 nits peak",water:"50 metres",dust:"IP6X",battery:"Up to 18 hours",glass:"Ion‑X (aluminium); sapphire crystal (stainless steel / titanium)",gps:"GPS / GPS + Cellular by variant",wireless:"Wi‑Fi 4, Bluetooth 5.0, Ultra Wideband (U1)",sensors:"Electrical and optical heart sensors, blood oxygen, compass, altimeter, accelerometer, gyroscope, ambient light",resolution:{"41mm":"352 × 430 px","45mm":"396 × 484 px"},dimensions:{"41mm":"41 × 35 × 10.7 mm","45mm":"45 × 38 × 10.7 mm"},features:"ECG, blood oxygen, fall detection, compass, always-on altimeter, fast charging",displayArea:{"41mm":"904 mm²","45mm":"1143 mm²"}},
  "Apple Watch SE (2nd generation)": {displayType:"Retina OLED",brightness:"1000 nits peak",water:"50 metres",battery:"Up to 18 hours",glass:"Ion‑X glass",gps:"GPS / GPS + Cellular by variant",wireless:"Wi‑Fi 4, Bluetooth 5.3",sensors:"Optical heart sensor, compass, altimeter, accelerometer, gyroscope, ambient light",resolution:{"40mm":"324 × 394 px","44mm":"368 × 448 px"},dimensions:{"40mm":"40 × 34 × 10.7 mm","44mm":"44 × 38 × 10.7 mm"},features:"Crash detection, fall detection, high/low heart-rate notifications, irregular rhythm notifications, sleep stages",displayArea:{"40mm":"759 mm²","44mm":"977 mm²"}},
  "Apple Watch Series 6": {displayType:"Always-On Retina OLED",brightness:"1000 nits peak",water:"50 metres",battery:"Up to 18 hours",glass:"Ion‑X (aluminium); sapphire crystal (stainless steel / titanium)",gps:"GPS / GPS + Cellular by variant",wireless:"Wi‑Fi 4, Bluetooth 5.0, Ultra Wideband (U1)",sensors:"Electrical and optical heart sensors, blood oxygen, compass, altimeter, accelerometer, gyroscope, ambient light",resolution:{"40mm":"324 × 394 px","44mm":"368 × 448 px"},dimensions:{"40mm":"40 × 34 × 10.7 mm","44mm":"44 × 38 × 10.7 mm"},features:"ECG, blood oxygen, always-on altimeter, compass, always-on display",displayArea:{"40mm":"759 mm²","44mm":"977 mm²"}},
  "Apple Watch SE (1st generation)": {displayType:"Retina OLED",brightness:"1000 nits peak",water:"50 metres",battery:"Up to 18 hours",glass:"Ion‑X glass",gps:"GPS / GPS + Cellular by variant",wireless:"Wi‑Fi 4, Bluetooth 5.0",sensors:"Optical heart sensor, compass, altimeter, accelerometer, gyroscope, ambient light",resolution:{"40mm":"324 × 394 px","44mm":"368 × 448 px"},dimensions:{"40mm":"40 × 34 × 10.7 mm","44mm":"44 × 38 × 10.7 mm"},features:"Fall detection, high/low heart-rate notifications, irregular rhythm notifications, compass and altimeter",displayArea:{"40mm":"759 mm²","44mm":"977 mm²"}},
  "Apple Watch Series 5": {displayType:"Always-On Retina OLED",brightness:"1000 nits peak",water:"50 metres",battery:"Up to 18 hours",glass:"Ion‑X (aluminium); sapphire crystal (stainless steel / titanium / ceramic)",gps:"GPS / GPS + Cellular by variant",wireless:"Wi‑Fi 4, Bluetooth 5.0",sensors:"Electrical and optical heart sensors, compass, altimeter, accelerometer, gyroscope, ambient light",resolution:{"40mm":"324 × 394 px","44mm":"368 × 448 px"},dimensions:{"40mm":"40 × 34 × 10.7 mm","44mm":"44 × 38 × 10.7 mm"},features:"Always-On display, ECG, compass, fall detection, noise monitoring",displayArea:{"40mm":"759 mm²","44mm":"977 mm²"}},
  "Apple Watch Series 4": {displayType:"Retina OLED",brightness:"1000 nits peak",water:"50 metres",battery:"Up to 18 hours",glass:"Ion‑X (aluminium); sapphire crystal (stainless steel)",gps:"GPS / GPS + Cellular by variant",wireless:"Wi‑Fi 4, Bluetooth 5.0",sensors:"Electrical and optical heart sensors, barometric altimeter, accelerometer, gyroscope, ambient light",resolution:{"40mm":"324 × 394 px","44mm":"368 × 448 px"},dimensions:{"40mm":"40 × 34 × 10.7 mm","44mm":"44 × 38 × 10.7 mm"},features:"ECG, fall detection, optical heart sensor, Digital Crown with haptic feedback",displayArea:{"40mm":"759 mm²","44mm":"977 mm²"}},
  "Apple Watch Series 3": {displayType:"Retina OLED",brightness:"1000 nits peak",water:"50 metres",battery:"Up to 18 hours",glass:"Ion‑X (aluminium); sapphire crystal (stainless steel / ceramic)",gps:"GPS / GPS + Cellular by variant",wireless:"Wi‑Fi 2.4GHz, Bluetooth 4.2",sensors:"Optical heart sensor, barometric altimeter, accelerometer, gyroscope",resolution:{"38mm":"272 × 340 px","42mm":"312 × 390 px"},dimensions:{"38mm":"38.6 × 33.3 × 11.4 mm","42mm":"42.5 × 36.4 × 11.4 mm"},features:"Optical heart-rate monitoring, GPS, swim tracking, emergency SOS",displayArea:{"38mm":"563 mm²","42mm":"740 mm²"}},
  "Apple Watch Series 2": {displayType:"Retina OLED",brightness:"1000 nits peak",water:"50 metres",battery:"Up to 18 hours",glass:"Ion‑X (aluminium); sapphire crystal (stainless steel / ceramic)",gps:"Built-in GPS",wireless:"Wi‑Fi 2.4GHz, Bluetooth 4.0",sensors:"Second-generation optical heart sensor, accelerometer, gyroscope",resolution:{"38mm":"272 × 340 px","42mm":"312 × 390 px"},dimensions:{"38mm":"38.6 × 33.3 × 11.4 mm","42mm":"42.5 × 36.4 × 11.4 mm"},features:"Built-in GPS, swim tracking, water-resistant design, second-generation optical heart sensor",displayArea:{"38mm":"563 mm²","42mm":"740 mm²"}},
  "Apple Watch Series 1": {displayType:"Retina OLED",brightness:"450 nits",water:"Splash-resistant; not intended for swimming",battery:"Up to 18 hours",glass:"Ion‑X glass",gps:"iPhone-assisted GPS",wireless:"Wi‑Fi 2.4GHz, Bluetooth 4.2",sensors:"Optical heart sensor, accelerometer, gyroscope",resolution:{"38mm":"272 × 340 px","42mm":"312 × 390 px"},dimensions:{"38mm":"38.6 × 33.3 × 10.5 mm","42mm":"42.5 × 36.4 × 10.5 mm"},features:"Activity tracking, heart-rate monitoring, notifications and iPhone-connected GPS",displayArea:{"38mm":"563 mm²","42mm":"740 mm²"}},
  "Apple Watch (1st generation)": {displayType:"Retina OLED",brightness:"450 nits",water:"Splash-resistant; not intended for swimming",battery:"Up to 18 hours",glass:"Sapphire crystal",gps:"iPhone-assisted GPS",wireless:"Bluetooth 4.0",sensors:"Heart rate sensor, accelerometer, gyroscope",resolution:{"38mm":"272 × 340 px","42mm":"312 × 390 px"},dimensions:{"38mm":"38.6 × 33.3 × 10.5 mm","42mm":"42.5 × 36.4 × 10.5 mm"},features:"Activity tracking, heart-rate sensor, notifications, Force Touch",displayArea:{"38mm":"563 mm²","42mm":"740 mm²"}}
};
const WATCH_HERMES_COLORS = {
  "Apple Watch Series 12":["Silver Titanium","Radiant Gold Titanium"],
  "Apple Watch Series 11":["Silver Titanium"],
  "Apple Watch Ultra 3":["Natural Titanium","Black Titanium"],
  "Apple Watch Ultra 2":["Natural Titanium","Black Titanium"],
  "Apple Watch Series 9":["Silver Stainless Steel","Space Black Stainless Steel"],
  "Apple Watch Series 6":["Silver Stainless Steel","Space Black Stainless Steel"],
  "Apple Watch Series 5":["Silver Stainless Steel","Space Black Stainless Steel"],
  "Apple Watch Series 4":["Silver Stainless Steel","Space Black Stainless Steel"],
  "Apple Watch Series 2":["Stainless Steel","Space Black Stainless Steel"],
  "Apple Watch (1st generation)":["Stainless Steel","Space Black Stainless Steel"]
};
const WATCH_EDITIONS = {
  hermes:["Apple Watch Series 12","Apple Watch Series 11","Apple Watch Ultra 3","Apple Watch Ultra 2","Apple Watch Series 9","Apple Watch Series 6","Apple Watch Series 5","Apple Watch Series 4","Apple Watch Series 2","Apple Watch (1st generation)"],
  nike:["Apple Watch Series 12","Apple Watch SE 3","Apple Watch Series 11","Apple Watch Series 7","Apple Watch Series 6","Apple Watch Series 5","Apple Watch Series 4","Apple Watch Series 3","Apple Watch Series 2"]
};

// Actual display diagonal, in inches, mapped to the selected case size.
// Values follow Apple's published display resolutions / pixel density by generation.
const WATCH_SCREEN_INCHES = {
  "Apple Watch Series 12": {"42mm":"1.77″","46mm":"1.96″"},
  "Apple Watch Ultra 4": {"49mm":"2.00″"},
  "Apple Watch SE 3": {"40mm":"1.57″","44mm":"1.73″"},
  "Apple Watch Series 11": {"42mm":"1.77″","46mm":"1.96″"},
  "Apple Watch Ultra 3": {"49mm":"2.00″"},
  "Apple Watch Series 10": {"42mm":"1.77″","46mm":"1.96″"},
  "Apple Watch Ultra 2": {"49mm":"1.93″"},
  "Apple Watch Series 9": {"41mm":"1.69″","45mm":"1.90″"},
  "Apple Watch Ultra": {"49mm":"1.93″"},
  "Apple Watch Series 8": {"41mm":"1.69″","45mm":"1.90″"},
  "Apple Watch Series 7": {"41mm":"1.69″","45mm":"1.90″"},
  "Apple Watch SE (2nd generation)": {"40mm":"1.57″","44mm":"1.78″"},
  "Apple Watch Series 6": {"40mm":"1.57″","44mm":"1.78″"},
  "Apple Watch SE (1st generation)": {"40mm":"1.57″","44mm":"1.78″"},
  "Apple Watch Series 5": {"40mm":"1.57″","44mm":"1.78″"},
  "Apple Watch Series 4": {"40mm":"1.57″","44mm":"1.78″"},
  "Apple Watch Series 3": {"38mm":"1.32″","42mm":"1.50″"},
  "Apple Watch Series 2": {"38mm":"1.32″","42mm":"1.50″"},
  "Apple Watch Series 1": {"38mm":"1.32″","42mm":"1.50″"},
  "Apple Watch (1st generation)": {"38mm":"1.32″","42mm":"1.50″"}
};
let authRefreshPromise = null;

async function request(path, options = {}, retryAfterRefresh = true) {
  const method = String(options.method || "GET").toUpperCase();
  if (import.meta.env.DEV && method !== "GET" && !path.startsWith("/auth/") && !((method === "POST" && (path === "/media" || path === "/media/video")) || (method === "DELETE" && /^\/media\/[0-9a-f-]+$/i.test(path)))) {
    throw new Error("Local preview is read-only. Changes are blocked to protect your live store.");
  }
  const response = await fetch(`${API}${path}`, {
    credentials: "include",
    ...options,
    headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
  });

  // The server session cookie expires after 15 minutes. Refresh it once and
  // retry the original request so edits do not randomly fail in long admin sessions.
  if (response.status === 401 && retryAfterRefresh && !path.startsWith("/auth/")) {
    try {
      if (!authRefreshPromise) {
        authRefreshPromise = fetch(`${API}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        }).then(async refreshResponse => {
          if (!refreshResponse.ok) throw new Error("Admin session expired. Please sign in again.");
          return true;
        }).finally(() => { authRefreshPromise = null; });
      }
      await authRefreshPromise;
      return request(path, options, false);
    } catch {
      // Preserve the original 401 below; the app's normal auth handling can sign out.
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return data;
}

const navGroups = [
  { label: "OVERVIEW", items: [{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard.view" }] },
  { label: "COMMERCE", items: [
    { id: "products", label: "Products", icon: Package, permission: "products.write" },
    { id: "inventory", label: "Inventory", icon: Boxes, permission: "inventory.write" },
    { id: "orders", label: "Orders", icon: ShoppingCart, permission: "orders.write" },
    { id: "reservations", label: "Reservations", icon: Clock3, permission: "reservations.write" },
    { id: "customers", label: "Customers", icon: Users, permission: "orders.write" },
  ]},
  { label: "STORE EXPERIENCE", items: [
    { id: "homepage", label: "Live", icon: Layers3, permission: "cms.write" },
    { id: "media", label: "Media Library", icon: Image, permission: "media.write" },
    { id: "collections", label: "Collections", icon: ShoppingBag, permission: "cms.write" },
  ]},
  { label: "SYSTEM", items: [
    { id: "team", label: "Team & Access", icon: ShieldCheck, permission: "admin.manage" },
    { id: "settings", label: "Settings", icon: Settings, permission: "settings.write" },
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

function Dashboard({ stats, loading, onRefresh, onNavigate, permissions = {} }) {
  const canSeeSales = !!permissions["dashboard.sales.view"];
  const orders = stats?.orders || {};
  const products = stats?.products || {};
  const units = stats?.units || {};
  const reservations = stats?.reservations || {};
  const lowStock = stats?.lowStock || [];
  const recentOrders = stats?.recentOrders || [];
  const recentReservations = stats?.recentReservations || [];
  const totalOrders = Object.values(orders).reduce((a,b)=>a+Number(b||0),0);
  const totalProducts = Object.values(products).reduce((a,b)=>a+Number(b||0),0);
  const availableUnits = Number(units.available||0);
  const newOrders = Number(orders.New||0);
  const pendingReservations = Number(reservations.Pending||reservations.New||0);
  const activeOrders = ["New","Confirmed","Preparing","Ready"].reduce((sum,key)=>sum+Number(orders[key]||0),0);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-EG",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  const tasks = [
    ...(permissions["orders.write"] ? [{id:"orders",icon:ShoppingCart,tone:"gold",title:"Process new orders",detail:newOrders?newOrders+" orders are waiting for your team":"Review order progress and customer updates",count:newOrders,cta:"Open orders",urgent:newOrders>0}] : []),
    ...(permissions["reservations.write"] ? [{id:"reservations",icon:Clock3,tone:"violet",title:"Confirm reservations",detail:pendingReservations?pendingReservations+" reservations need a response":"Check reservation requests and availability",count:pendingReservations,cta:"Open reservations",urgent:pendingReservations>0}] : []),
    ...(permissions["inventory.write"] ? [{id:"inventory",icon:Boxes,tone:"red",title:"Resolve stock alerts",detail:lowStock.length?lowStock.length+" products have 3 units or fewer":"Review stock levels before they run out",count:lowStock.length,cta:"Check inventory",urgent:lowStock.length>0}] : []),
    ...(permissions["orders.write"] ? [{id:"customers",icon:Users,tone:"blue",title:"Look after customers",detail:"Review customer profiles, notes and purchase history",cta:"Open customers"}] : [])
  ];
  return <>
    <section className="dashboard-welcome">
      <div className="dashboard-welcome-copy">
        <div className="dashboard-kicker"><span className="dashboard-kicker-dot"/> GO IPHONE · STORE OPERATIONS</div>
        <h1>{greeting}. Let's get things moving.</h1>
        <p>Your daily workspace for orders, reservations, stock and customers.</p>
        <div className="dashboard-date"><Clock3 size={16}/>{today}</div>
      </div>
      <div className="dashboard-welcome-actions">
        <span className="dashboard-live-label"><i/> STORE OVERVIEW</span>
        <button className="btn dashboard-refresh" onClick={onRefresh} disabled={loading}><RefreshCw size={17} className={loading?"dashboard-spin":""}/>{loading?"Updating…":"Refresh dashboard"}</button>
      </div>
      <div className="dashboard-welcome-mark">GO</div>
    </section>
    {loading ? <div className="loading-panel"><span className="spinner"/> Loading your store workspace…</div> : <>
      <section className="dashboard-kpi-grid">
        {canSeeSales && <article className="dashboard-kpi-card revenue"><div className="dashboard-kpi-top"><span>TOTAL SALES</span><span className="dashboard-kpi-icon"><CreditCard size={21}/></span></div><strong>{stats?.revenueCents==null?"—":money(stats.revenueCents)}</strong><div className="dashboard-kpi-foot"><span className="dashboard-kpi-indicator">All non-cancelled orders</span><small>Lifetime total</small></div></article>}
        {canSeeSales && <article className="dashboard-kpi-card orders"><div className="dashboard-kpi-top"><span>ORDERS</span><span className="dashboard-kpi-icon"><ShoppingCart size={21}/></span></div><strong>{totalOrders.toLocaleString()}</strong><div className="dashboard-kpi-foot"><span className="dashboard-kpi-indicator">{newOrders} new</span><small>{activeOrders} active</small></div></article>}
        <article className="dashboard-kpi-card catalog"><div className="dashboard-kpi-top"><span>PRODUCTS</span><span className="dashboard-kpi-icon"><Package size={21}/></span></div><strong>{totalProducts.toLocaleString()}</strong><div className="dashboard-kpi-foot"><span className="dashboard-kpi-indicator">{Number(products.published||0)} published</span><small>{Number(products.draft||0)} drafts</small></div></article>
        <article className="dashboard-kpi-card inventory"><div className="dashboard-kpi-top"><span>AVAILABLE STOCK</span><span className="dashboard-kpi-icon"><Boxes size={21}/></span></div><strong>{availableUnits.toLocaleString()}</strong><div className="dashboard-kpi-foot"><span className="dashboard-kpi-indicator">{lowStock.length} stock alerts</span><small>Units available</small></div></article>
      </section>
      <section className="dashboard-work-queue">
        <div className="dashboard-section-title"><div><span className="dashboard-section-kicker">YOUR TEAM'S WORKLIST</span><h2>What needs attention?</h2><p>Choose a task to go directly to the right workspace.</p></div><span className="dashboard-section-status"><i/> LIVE COUNTS</span></div>
        <div className="dashboard-task-grid">{tasks.map(task=>{const Icon=task.icon;return <button key={task.id} className={`dashboard-task-card ${task.urgent?"is-urgent":""}`} onClick={()=>onNavigate(task.id)}><span className={`dashboard-task-icon ${task.tone}`}><Icon size={23}/></span><span className="dashboard-task-body"><b>{task.title}</b><small>{task.detail}</small><em>{task.cta} <ArrowRight size={15}/></em></span>{task.count!==undefined&&<strong className="dashboard-task-count">{task.count}</strong>}</button>})}</div>
      </section>
      <section className="dashboard-shortcuts">
        <div><span className="dashboard-section-kicker">QUICK ACCESS</span><h2>Get straight to work</h2></div>
        <div className="dashboard-shortcut-actions">
          {permissions["products.write"] && <button onClick={()=>onNavigate("products")}><Plus size={19}/> Add product</button>}
          {permissions["orders.write"] && <button onClick={()=>onNavigate("orders")}><ShoppingCart size={19}/> All orders</button>}
          {permissions["inventory.write"] && <button onClick={()=>onNavigate("inventory")}><Boxes size={19}/> Manage stock</button>}
          {permissions["orders.write"] && <button onClick={()=>onNavigate("customers")}><Users size={19}/> Customers</button>}
          {permissions["cms.write"] && <button onClick={()=>onNavigate("homepage")}><Monitor size={19}/> Edit storefront</button>}
        </div>
      </section>
      <div className="dashboard-grid dashboard-detail-grid">
        {canSeeSales && <section className="panel dashboard-orders-panel"><div className="panel-head"><div><span className="dashboard-panel-kicker">LATEST CUSTOMER ACTIVITY</span><h2>Recent orders</h2><p>Latest purchases received by your store.</p></div><button className="link-btn" onClick={()=>onNavigate("orders")}>View all orders <ChevronRight size={17}/></button></div>
          {recentOrders.length?<div className="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>DATE</th><th>STATUS</th><th className="right">TOTAL</th></tr></thead><tbody>{recentOrders.map(o=><tr key={o.id}><td className="mono">#{String(o.id).slice(-7).toUpperCase()}</td><td>{o.customer_name||"Guest"}</td><td>{date(o.created_at)}</td><td><span className={`status ${String(o.status).toLowerCase()}`}>{o.status}</span></td><td className="right">{money(o.total_cents)}</td></tr>)}</tbody></table></div>:<EmptyState icon={ShoppingCart} title="No orders to show yet" detail="New orders will appear here as soon as customers place them."/>}
        </section>}
        {permissions["reservations.write"] && <section className="panel dashboard-reservations-panel"><div className="panel-head"><div><span className="dashboard-panel-kicker">PRODUCT RESERVATIONS</span><h2>Recent reservations</h2><p>Keep customer requests moving.</p></div><button className="link-btn" onClick={()=>onNavigate("reservations")}>View all <ChevronRight size={17}/></button></div>
          {recentReservations.length?<div className="dashboard-reservation-list">{recentReservations.map(r=><div className="dashboard-reservation-row" key={r.id}><span className="dashboard-reservation-icon"><Clock3 size={19}/></span><span className="dashboard-reservation-info"><b>{r.customer_name||"Customer"}</b><small>{r.product_name||"Product"} · {date(r.created_at)}</small></span><span className={`status ${String(r.status).toLowerCase()}`}>{r.status}</span></div>)}</div>:<EmptyState icon={Clock3} title="No reservations to review" detail="New product reservation requests will show up here."/>}
        </section>}
        {permissions["inventory.write"] && <section className="panel dashboard-stock-panel"><div className="panel-head"><div><span className="dashboard-panel-kicker">STOCK CONTROL</span><h2>Low stock alerts</h2><p>Prioritise products running low.</p></div><span className={`dashboard-alert-count ${lowStock.length?"has-alerts":""}`}>{lowStock.length} alerts</span></div>
          {lowStock.length?<div className="stock-list">{lowStock.slice(0,8).map((item,i)=><div className="stock-row" key={item.product_id+"-"+i}><div className="product-avatar"><Smartphone size={19}/></div><div className="stock-name"><b>{item.name}</b><span>{item.storage||"Product variant"}</span></div><span className={`stock-qty ${Number(item.stock_qty)===0?"danger":""}`}>{item.stock_qty} left</span></div>)}</div>:<EmptyState icon={CheckCircle2} title="Stock levels look good" detail="No variants at or below the low-stock threshold."/>}
          <button className="dashboard-panel-action" onClick={()=>onNavigate("inventory")}>Open inventory <ArrowRight size={16}/></button>
        </section>}
      </div>
    </>}
  </>;
}

function Products({ onError }) {
  const [storeCategories,setStoreCategories]=useState([]);
  const [items, setItems] = useState([]);
  const [groupCandidates, setGroupCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [refresh, setRefresh] = useState(0);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [media, setMedia] = useState([]);
  const [collectionIds, setCollectionIds] = useState([]);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [localImagePreviews, setLocalImagePreviews] = useState([]);
  const [primaryImageMediaId, setPrimaryImageMediaId] = useState("");
  const [galleryMediaIds, setGalleryMediaIds] = useState([]);
  const empty = { name: "", modelGroupKey: "", categoryKey: "iphone", productType: "smartphone", tagline: "", visibility: "draft", salesMode: "for_sale", availability: "in_stock", variants: [{ storage: "", color: "", price: "", stockQty: "" }] };
  const [form, setForm] = useState(empty);
  const [iphoneModel, setIphoneModel] = useState("");
  const [iphoneCondition, setIphoneCondition] = useState("New");
  const [iphoneStorage, setIphoneStorage] = useState("128GB");
  const [iphoneColor, setIphoneColor] = useState("");
  const [iphoneRegion, setIphoneRegion] = useState("");
  const [iphoneSim, setIphoneSim] = useState("Physical SIM + eSIM");
  const [iphoneBattery, setIphoneBattery] = useState("");
  const [iphoneGrade, setIphoneGrade] = useState("Like New");
  const [iphoneNotes, setIphoneNotes] = useState("");
  const [iphonePrice, setIphonePrice] = useState("");
  const [iphoneSku, setIphoneSku] = useState("");
  const [iphoneStep, setIphoneStep] = useState(1);
  const [watchModel, setWatchModel] = useState("");
  const [watchSize, setWatchSize] = useState("42mm");
  const [watchConnectivity, setWatchConnectivity] = useState("GPS");
  const [watchMaterial, setWatchMaterial] = useState("Aluminum");
  const [watchColor, setWatchColor] = useState("");
  const [watchModelNumber, setWatchModelNumber] = useState("");
  const [watchEdition, setWatchEdition] = useState("Standard");
  const [watchBand, setWatchBand] = useState("");
  const [watchCondition, setWatchCondition] = useState("New");
  const [watchBattery, setWatchBattery] = useState("");
  const [watchGrade, setWatchGrade] = useState("Like New");
  const [watchNotes, setWatchNotes] = useState("");
  const [watchPrice, setWatchPrice] = useState("");
  const [watchSku, setWatchSku] = useState("");
  const [watchStep, setWatchStep] = useState(1);
  const [ipadStep,setIpadStep]=useState(1),[ipadModel,setIpadModel]=useState(""),[ipadScreen,setIpadScreen]=useState("11-inch"),[ipadChip,setIpadChip]=useState(""),[ipadStorage,setIpadStorage]=useState("128GB"),[ipadConnectivity,setIpadConnectivity]=useState("Wi-Fi"),[ipadColor,setIpadColor]=useState(""),[ipadPencil,setIpadPencil]=useState(""),[ipadKeyboard,setIpadKeyboard]=useState(""),[ipadCondition,setIpadCondition]=useState("New"),[ipadBattery,setIpadBattery]=useState(""),[ipadGrade,setIpadGrade]=useState("Like New"),[ipadNotes,setIpadNotes]=useState(""),[ipadPrice,setIpadPrice]=useState(""),[ipadSku,setIpadSku]=useState("");
  const [macStep,setMacStep]=useState(1),[macModel,setMacModel]=useState(""),[macScreen,setMacScreen]=useState(""),[macChip,setMacChip]=useState(""),[macCpu,setMacCpu]=useState(""),[macGpu,setMacGpu]=useState(""),[macMemory,setMacMemory]=useState("16GB"),[macStorage,setMacStorage]=useState("512GB"),[macColor,setMacColor]=useState(""),[macKeyboard,setMacKeyboard]=useState("English"),[macCondition,setMacCondition]=useState("New"),[macBattery,setMacBattery]=useState(""),[macCycles,setMacCycles]=useState(""),[macGrade,setMacGrade]=useState("Like New"),[macNotes,setMacNotes]=useState(""),[macPrice,setMacPrice]=useState(""),[macSku,setMacSku]=useState("");
  const [airpodsModel,setAirpodsModel]=useState(""),[airpodsGeneration,setAirpodsGeneration]=useState(""),[airpodsConnectivity,setAirpodsConnectivity]=useState("Bluetooth"),[airpodsCase,setAirpodsCase]=useState("Wireless Charging Case"),[airpodsColor,setAirpodsColor]=useState("White"),[airpodsCondition,setAirpodsCondition]=useState("New"),[airpodsBattery,setAirpodsBattery]=useState(""),[airpodsGrade,setAirpodsGrade]=useState("Like New"),[airpodsNotes,setAirpodsNotes]=useState(""),[airpodsPrice,setAirpodsPrice]=useState(""),[airpodsSku,setAirpodsSku]=useState("");
  const [customSpecs,setCustomSpecs]=useState("");
  const [otherDeviceSubcategory,setOtherDeviceSubcategory]=useState("");
  const [otherDeviceCondition,setOtherDeviceCondition]=useState("New");
  const [otherDeviceAnswers,setOtherDeviceAnswers]=useState({});
  const [otherDeviceBattery,setOtherDeviceBattery]=useState("");
  const [otherDeviceGrade,setOtherDeviceGrade]=useState("Like New");
  const [otherDeviceUsageNotes,setOtherDeviceUsageNotes]=useState("");
  const selectedWatchModel = WATCH_MODELS.find(model => model.name === watchModel);
  const watchConnectivityOptions = selectedWatchModel?.connectivityByMaterial?.[watchMaterial] || selectedWatchModel?.connectivity || [];
  const watchColorOptions = watchEdition === "Hermès" ? (WATCH_HERMES_COLORS[watchModel] || selectedWatchModel?.colorsByMaterial?.[watchMaterial] || selectedWatchModel?.colors || []) : selectedWatchModel?.colorsByMaterial?.[watchMaterial] || selectedWatchModel?.colors || [];
  const watchMaterialOptions = watchEdition === "Hermès" ? (selectedWatchModel?.materials?.includes("Titanium") ? ["Titanium"] : selectedWatchModel?.materials?.includes("Stainless Steel") ? ["Stainless Steel"] : selectedWatchModel?.materials || []) : selectedWatchModel?.materials || [];
  const watchTech = WATCH_TECH_SPECS[watchModel] || {};
  const watchEditionOptions = ["Standard", ...(WATCH_EDITIONS.hermes.includes(watchModel) ? ["Hermès"] : []), ...(WATCH_EDITIONS.nike.includes(watchModel) ? ["Nike band"] : [])];

  useEffect(() => { let active=true; request("/categories").then(d=>{if(active)setStoreCategories(d.categories||[]);}).catch(e=>onError(e.message)); return ()=>{active=false;}; },[onError]);
  const isOtherDevicesCategory = form.categoryKey === "other-devices" || storeCategories.some(c=>c.key===form.categoryKey && c.parent_key==="other-devices");

  useEffect(() => {
    let active = true; setLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (visibility !== "all") params.set("visibility", visibility);
    request(`/products?${params}`).then(d => { if (active) setItems(d.products || []); })
      .catch(e => onError(e.message)).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, visibility, refresh, onError]);
  function startNew() {
    request("/products").then(d => setGroupCandidates(d.products || [])).catch(e => onError(e.message));
    setEditing("new"); setForm(empty); setPrimaryImageMediaId(""); setGalleryMediaIds([]); setCollectionIds([]);
    setIphoneModel(""); setIphoneCondition("New"); setIphoneStorage("128GB"); setIphoneColor("");
    setIphoneRegion(""); setIphoneSim("Physical SIM + eSIM"); setIphoneBattery("");
    setIphoneGrade("Like New"); setIphoneNotes(""); setIphonePrice(""); setIphoneSku(""); setIphoneStep(1);
    setWatchModel(""); setWatchSize("42mm"); setWatchConnectivity("GPS"); setWatchMaterial("Aluminum"); setWatchColor(""); setWatchModelNumber(""); setWatchEdition("Standard"); setWatchBand("");
    setWatchCondition("New"); setWatchBattery(""); setWatchGrade("Like New"); setWatchNotes(""); setWatchPrice(""); setWatchSku(""); setWatchStep(1);
    setIpadStep(1);setIpadModel("");setIpadScreen("11-inch");setIpadChip("");setIpadStorage("128GB");setIpadConnectivity("Wi-Fi");setIpadColor("");setIpadPencil("");setIpadKeyboard("");setIpadCondition("New");setIpadBattery("");setIpadGrade("Like New");setIpadNotes("");setIpadPrice("");setIpadSku("");
    setMacStep(1);setMacModel("");setMacScreen("");setMacChip("");setMacCpu("");setMacGpu("");setMacMemory("16GB");setMacStorage("512GB");setMacColor("");setMacKeyboard("English");setMacCondition("New");setMacBattery("");setMacCycles("");setMacGrade("Like New");setMacNotes("");setMacPrice("");setMacSku("");
    setAirpodsModel("");setAirpodsGeneration("");setAirpodsConnectivity("Bluetooth");setAirpodsCase("Wireless Charging Case");setAirpodsColor("White");setAirpodsCondition("New");setAirpodsBattery("");setAirpodsGrade("Like New");setAirpodsNotes("");setAirpodsPrice("");setAirpodsSku("");setCustomSpecs("");setOtherDeviceSubcategory("");setOtherDeviceCondition("New");setOtherDeviceAnswers({});setOtherDeviceBattery("");setOtherDeviceGrade("Like New");setOtherDeviceUsageNotes("");
  }
  async function startEdit(id) {
    try {
      const [d, catalog] = await Promise.all([request(`/products/${id}`), request("/products")]);
      const p = d.product;
      setGroupCandidates(catalog.products || []);
      await loadMedia();
      setPrimaryImageMediaId(d.primaryImage?.id || ""); setGalleryMediaIds(d.gallery.map(x => x.id));
      setCollectionIds(d.collectionIds || []);
      setForm({ name: p.name || "", slug: p.slug || "", modelGroupKey: p.model_group_key || "", categoryKey: p.category_key, productType: p.product_type, tagline: p.tagline || "", visibility: p.visibility, salesMode: p.sales_mode, availability: p.availability, variants: d.variants.length ? d.variants.map(v => ({ storage: v.storage || "", color: v.color || "", price: String(Number(v.price_cents) / 100), stockQty: v.stock_qty == null ? "" : String(v.stock_qty) })) : [{ storage: "", color: "", price: "", stockQty: "" }] });
      setEditing(id);
    } catch (e) { onError(e.message); }
  }
  async function loadMedia() { try { const d = await request("/media"); setMedia(d.media || []); } catch (e) { onError(e.message); } }
  async function uploadMedia(fileList) {
    const files = Array.from(fileList || []).filter(Boolean);
    if (!files.length) return;
    const invalid = files.find(file => !["image/jpeg", "image/png", "image/webp", "image/gif"].includes((file.type || "").toLowerCase()));
    if (invalid) { setImageUploadError(`"${invalid.name}" is not a supported image. Choose JPG, PNG, WebP or GIF.`); return; }
    const previews = files.map(file => ({ id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`, name: file.name, url: URL.createObjectURL(file) }));
    setLocalImagePreviews(current => [...current, ...previews]);
    setImageUploadError("");
    setUploading(true);
    try {
      const hadPrimaryImage = Boolean(primaryImageMediaId);
      const uploaded = [];
      for (const file of files) {
        const dataUrl = await compressImage(file);
        const d = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "product" }) });
        if (!d?.media?.id || !d.media.url) throw new Error("The server did not return a valid uploaded image. Please try again.");
        uploaded.push(d.media);
      }
      setMedia(current => [...uploaded, ...current]);
      if (!hadPrimaryImage && uploaded[0]) setPrimaryImageMediaId(uploaded[0].id);
      setGalleryMediaIds(current => [...new Set([...current, ...uploaded.slice(hadPrimaryImage ? 0 : 1).map(item => item.id)])]);
      setLocalImagePreviews(current => current.filter(item => !previews.some(preview => preview.id === item.id)));
      previews.forEach(item => URL.revokeObjectURL(item.url));
    } catch (e) {
      const message = e?.message || "Image upload failed. Please try again.";
      setImageUploadError(message);
      onError(message);
    } finally { setUploading(false); }
  }
  function addVariant() { setForm(f => ({ ...f, variants: [...f.variants, { storage: "", color: "", price: "", stockQty: "" }] })); }
  function changeVariant(index, key, value) { setForm(f => ({ ...f, variants: f.variants.map((v, i) => i === index ? { ...v, [key]: value } : v) })); }
  function parseCustomSpecs() { return Object.fromEntries(customSpecs.split("\n").map(line=>line.trim()).filter(Boolean).map(line=>{const i=line.indexOf(":");return i>0?[line.slice(0,i).trim(),line.slice(i+1).trim()]:[line,"Custom value"];})); }
  async function removeProduct() {
    try { await request(`/products/${deleteId}`, { method: "DELETE" }); setDeleteId(""); setRefresh(v => v + 1); }
    catch (e) { onError(e.message); }
  }
  async function save(event) {
    event.preventDefault();
    if (editing === "new" && form.categoryKey === "watch") {
      if (!watchModel.trim() || !watchPrice || (watchCondition === "New" && !watchColor)) { onError("Choose the Apple Watch model, its official finish and selling price."); return; }
      if (watchCondition === "Used" && watchBattery !== "" && (Number(watchBattery) < 1 || Number(watchBattery) > 100)) { onError("Battery health must be between 1 and 100."); return; }
      setSaving(true);
      try {
        const name = watchModel.trim();
        const watchSpec = WATCH_MODELS.find(model => model.name === name);
        if (!watchSpec) { onError("Choose a valid Apple Watch model from the catalog."); return; }
        const created = await request("/products", { method: "POST", body: JSON.stringify({
          name, modelGroupKey: appleModelGroupKey("watch", name, watchCondition), categoryKey: "watch", productType: "smartwatch", tagline: form.tagline || null,
          specs: { Model: name, Condition: watchCondition, "Model number": watchModelNumber || "Not recorded", Collection: watchEdition, "Release year": String(watchSpec.year), "Case size": watchSize, Connectivity: watchConnectivity, "Case material": watchMaterial, Color: watchColor, Display: watchTech.displayType || watchSpec.display, "Peak brightness": watchTech.brightness || "Not specified", Resolution: watchTech.resolution?.[watchSize] || "See exact model number", "Display area": watchTech.displayArea?.[watchSize] || null, Chip: watchSpec.chip, Capacity: watchSpec.capacity, Battery: watchTech.battery || "See exact model", Charging: watchTech.charging || null, "Water resistance": watchTech.water || "Check exact model", "Dust resistance": watchTech.dust || "Not specified", Glass: watchTech.glass || "Varies by case material", Weight: watchTech.weight?.[watchSize] || null, "Wrist fit": watchTech.wristFit?.[watchSize] || null, Dimensions: watchTech.dimensionsByMaterial?.[watchMaterial]?.[watchSize] || watchTech.dimensions?.[watchSize] || null, GPS: watchTech.gps || "GPS / GPS + Cellular by variant", Wireless: watchTech.wireless || "See exact model", Compatibility: watchTech.compatibility || null, Audio: watchTech.audio || null, Sensors: watchTech.sensors || "See exact model", "Key features": watchTech.features || null, ...(watchBand ? { "Band style": watchBand } : {}), ...parseCustomSpecs() },
          storageOptions: [watchSize], colors: [watchColor], meta: { modelName: name, modelNumber: watchModelNumber || null, bandCollection: watchEdition, releaseYear: watchSpec.year, caseSize: watchSize, connectivity: watchConnectivity, caseMaterial: watchMaterial, color: watchColor, display: watchTech.displayType || watchSpec.display, brightness: watchTech.brightness || null, resolution: watchTech.resolution?.[watchSize] || null, chip: watchSpec.chip, capacity: watchSpec.capacity, waterResistance: watchTech.water || null, dustResistance: watchTech.dust || null, batteryLife: watchTech.battery || null, glass: watchTech.glass || null, gps: watchTech.gps || null, wireless: watchTech.wireless || null, sensors: watchTech.sensors || null, dimensions: watchTech.dimensionsByMaterial?.[watchMaterial]?.[watchSize] || watchTech.dimensions?.[watchSize] || null, displayArea: watchTech.displayArea?.[watchSize] || null, weight: watchTech.weight?.[watchSize] || null, wristFit: watchTech.wristFit?.[watchSize] || null, charging: watchTech.charging || null, compatibility: watchTech.compatibility || null, audio: watchTech.audio || null, features: watchTech.features || null, ...(watchBand ? { bandStyle: watchBand } : {}) },
          hasUnits: true, visibility: form.visibility, salesMode: form.salesMode, availability: "in_stock",
          variants: [], primaryImageMediaId: primaryImageMediaId || null, galleryMediaIds, collectionIds
        }) });
        await request("/products/" + created.product.id + "/units", { method: "POST", body: JSON.stringify({
          storage: watchSize, color: [watchMaterial, watchColor].filter(Boolean).join(" · "), batteryPct: watchCondition === "New" || watchBattery === "" ? null : Number(watchBattery),
          condition: watchCondition === "New" ? "New" : watchGrade, sku: watchSku || null,
          priceCents: Math.round(Number(watchPrice) * 100), warranty: null,
          notes: [watchEdition !== "Standard" ? `${watchEdition} collection` : null, watchBand || null, watchCondition === "New" ? null : watchNotes].filter(Boolean).join(" · ") || null
        }) });
        setEditing(null); setRefresh(v => v + 1);
      } catch (e) { onError(e.message); }
      finally { setSaving(false); }
      return;
    }
    if (editing === "new" && form.categoryKey === "ipad") {
      if (!ipadModel || !ipadPrice || (ipadCondition === "New" && !ipadColor)) { onError("Choose an iPad model, its official finish and selling price."); return; }
      if (ipadCondition==="Used" && ipadBattery!=="" && (Number(ipadBattery)<1 || Number(ipadBattery)>100)) { onError("Battery health must be between 1 and 100."); return; }
      setSaving(true); try {
        const created=await request("/products",{method:"POST",body:JSON.stringify({name:ipadModel,modelGroupKey:appleModelGroupKey("ipad",ipadModel,ipadCondition),categoryKey:"ipad",productType:"tablet",tagline:form.tagline||null,specs:{Model:ipadModel,Condition:ipadCondition,"Display size":ipadScreen,Chip:ipadChip||"Not recorded",Storage:ipadStorage,Connectivity:ipadConnectivity,Color:ipadColor||"Not specified","Apple Pencil":ipadPencil||"Not specified",Keyboard:ipadKeyboard||"Not specified",...parseCustomSpecs()},storageOptions:[ipadStorage],colors:ipadColor?[ipadColor]:[],meta:{modelName:ipadModel,screenSize:ipadScreen,chip:ipadChip||null,connectivity:ipadConnectivity,color:ipadColor||null,pencilSupport:ipadPencil||null,keyboard:ipadKeyboard||null},hasUnits:true,visibility:form.visibility,salesMode:form.salesMode,availability:"in_stock",variants:[],primaryImageMediaId:primaryImageMediaId||null,galleryMediaIds,collectionIds})});
        await request("/products/"+created.product.id+"/units",{method:"POST",body:JSON.stringify({storage:ipadStorage,color:[ipadColor,ipadConnectivity].filter(Boolean).join(" · "),batteryPct:ipadCondition==="New"||ipadBattery===""?null:Number(ipadBattery),condition:ipadCondition==="New"?"New":ipadGrade,sku:ipadSku||null,priceCents:Math.round(Number(ipadPrice)*100),warranty:null,notes:[ipadPencil?"Pencil: "+ipadPencil:null,ipadKeyboard?"Keyboard: "+ipadKeyboard:null,ipadCondition==="Used"?ipadNotes:null].filter(Boolean).join(" · ")||null})});
        setEditing(null);setRefresh(v=>v+1);
      } catch(e){onError(e.message);} finally{setSaving(false);} return;
    }
    if (editing === "new" && form.categoryKey === "mac") {
      if (!macModel || !macPrice || (macCondition === "New" && !macColor)) { onError("Choose a Mac model, its official finish and selling price."); return; }
      if (macCondition==="Used" && macBattery!=="" && (Number(macBattery)<1 || Number(macBattery)>100)) { onError("Battery health must be between 1 and 100."); return; }
      setSaving(true); try {
        const desktop=/^(iMac|Mac mini|Mac Studio|Mac Pro)/.test(macModel);
        const created=await request("/products",{method:"POST",body:JSON.stringify({name:macModel,modelGroupKey:appleModelGroupKey("mac",macModel,macCondition),categoryKey:"mac",productType:desktop?"desktop-computer":"laptop",tagline:form.tagline||null,specs:{Model:macModel,Condition:macCondition,"Display size":macScreen||"Not applicable / not recorded",Chip:macChip||"Not recorded",CPU:macCpu||"Not recorded",GPU:macGpu||"Not recorded",Memory:macMemory,Storage:macStorage,Color:macColor||"Not specified","Keyboard layout":macKeyboard,"Battery cycles":macCycles||"Not recorded",...parseCustomSpecs()},storageOptions:[macStorage],colors:macColor?[macColor]:[],meta:{modelName:macModel,screenSize:macScreen||null,chip:macChip||null,cpu:macCpu||null,gpu:macGpu||null,unifiedMemory:macMemory,storage:macStorage,color:macColor||null,keyboardLayout:macKeyboard,batteryCycles:macCycles||null},hasUnits:true,visibility:form.visibility,salesMode:form.salesMode,availability:"in_stock",variants:[],primaryImageMediaId:primaryImageMediaId||null,galleryMediaIds,collectionIds})});
        await request("/products/"+created.product.id+"/units",{method:"POST",body:JSON.stringify({storage:macStorage,color:macColor||null,batteryPct:macCondition==="New"||macBattery===""?null:Number(macBattery),condition:macCondition==="New"?"New":macGrade,sku:macSku||null,priceCents:Math.round(Number(macPrice)*100),warranty:null,notes:[macChip?"Chip: "+macChip:null,macMemory?"Memory: "+macMemory:null,macCycles?"Battery cycles: "+macCycles:null,macCondition==="Used"?macNotes:null].filter(Boolean).join(" · ")||null})});
        setEditing(null);setRefresh(v=>v+1);
      } catch(e){onError(e.message);} finally{setSaving(false);} return;
    }
    if (editing === "new" && form.categoryKey === "airpods") {
      if (!airpodsModel.trim() || !airpodsPrice || (airpodsCondition === "New" && !airpodsColor)) { onError("Choose an AirPods model, its official finish and selling price."); return; }
      if (airpodsCondition === "Used" && airpodsBattery !== "" && (Number(airpodsBattery)<1 || Number(airpodsBattery)>100)) { onError("Battery health must be between 1 and 100."); return; }
      setSaving(true); try {
        const name=airpodsModel.trim();
        const created=await request("/products",{method:"POST",body:JSON.stringify({name,modelGroupKey:form.modelGroupKey?.trim()||appleModelGroupKey("airpods",name,airpodsCondition),categoryKey:"airpods",productType:"wireless-earbuds",tagline:form.tagline||null,specs:{Model:name,Condition:airpodsCondition,Generation:airpodsGeneration||"Not specified",Connectivity:airpodsConnectivity,"Charging case":airpodsCase,Color:airpodsColor,...parseCustomSpecs()},storageOptions:[],colors:airpodsColor?[airpodsColor]:[],meta:{modelName:name,generation:airpodsGeneration||null,connectivity:airpodsConnectivity,chargingCase:airpodsCase,color:airpodsColor},hasUnits:true,visibility:form.visibility,salesMode:form.salesMode,availability:"in_stock",variants:[],primaryImageMediaId:primaryImageMediaId||null,galleryMediaIds,collectionIds})});
        await request("/products/"+created.product.id+"/units",{method:"POST",body:JSON.stringify({storage:airpodsGeneration||null,color:airpodsColor||null,batteryPct:airpodsCondition==="New"||airpodsBattery===""?null:Number(airpodsBattery),condition:airpodsCondition==="New"?"New":airpodsGrade,sku:airpodsSku||null,priceCents:Math.round(Number(airpodsPrice)*100),warranty:null,notes:[airpodsConnectivity,airpodsCase,airpodsCondition==="Used"?airpodsNotes:null].filter(Boolean).join(" · ")||null})});
        setEditing(null);setRefresh(v=>v+1);
      } catch(e){onError(e.message);} finally{setSaving(false);} return;
    }
    if (editing === "new" && form.categoryKey === "iphone") {
      if (!iphoneModel || !iphonePrice || (iphoneCondition === "New" && !iphoneColor)) { onError("Choose an iPhone model, its official finish and selling price."); return; }
      setSaving(true);
      try {
        const created = await request("/products", { method: "POST", body: JSON.stringify({
          name: iphoneModel, modelGroupKey: appleModelGroupKey("iphone", iphoneModel, iphoneCondition), categoryKey: "iphone", productType: "smartphone", tagline: form.tagline || null,
          specs: { Model: iphoneModel, Condition: iphoneCondition, Color: iphoneColor || "Not specified", ...(iphoneCondition === "Used" ? { "Condition grade": iphoneGrade } : {}), ...(iphoneRegion ? { "Regional version": iphoneRegion } : {}), "SIM configuration": iphoneSim, ...parseCustomSpecs() },
          storageOptions: [iphoneStorage], colors: iphoneColor ? [iphoneColor] : [],
          meta: { modelName: iphoneModel, ...(iphoneRegion ? { regionalVersion: iphoneRegion } : {}), simConfiguration: iphoneSim },
          hasUnits: true, visibility: form.visibility, salesMode: form.salesMode, availability: "in_stock",
          variants: [], primaryImageMediaId: primaryImageMediaId || null, galleryMediaIds, collectionIds
        }) });
        await request("/products/" + created.product.id + "/units", { method: "POST", body: JSON.stringify({
          storage: iphoneStorage, color: iphoneColor || null,
          batteryPct: iphoneCondition === "New" || iphoneBattery === "" ? null : Number(iphoneBattery),
          condition: iphoneCondition === "New" ? "New" : iphoneGrade,
          sku: iphoneSku || null, priceCents: Math.round(Number(iphonePrice) * 100),
          warranty: null, notes: iphoneCondition === "New" ? null : iphoneNotes || null
        }) });
        setEditing(null); setRefresh(v => v + 1);
      } catch (e) { onError(e.message); }
      finally { setSaving(false); }
      return;
    }
    setSaving(true);
    const variants = form.variants.filter(v => v.price !== "").map(v => ({ storage: v.storage || null, color: v.color || null, priceCents: Math.round(Number(v.price) * 100), stockQty: v.stockQty === "" ? null : Number(v.stockQty) }));
    const otherDeviceSpecs = Object.fromEntries((OTHER_DEVICE_FIELD_SETS[form.productType] || OTHER_DEVICE_FIELD_SETS["other-electronics"]).filter(field => String(otherDeviceAnswers[field.key] || "").trim()).map(field => [field.label, String(otherDeviceAnswers[field.key]).trim()]));
    if (isOtherDevicesCategory && otherDeviceCondition === "Used") {
      otherDeviceSpecs["Battery health / runtime"] = otherDeviceBattery || "Not recorded";
      otherDeviceSpecs["Condition grade"] = otherDeviceGrade;
      otherDeviceSpecs["Defects / repairs / usage notes"] = otherDeviceUsageNotes || "None reported";
    }
    const payload = { modelGroupKey: form.modelGroupKey?.trim() || null, primaryImageMediaId: primaryImageMediaId || null, galleryMediaIds, collectionIds, specs: { ...parseCustomSpecs(), ...(isOtherDevicesCategory ? { Condition: otherDeviceCondition, ...otherDeviceSpecs, ...(otherDeviceSubcategory ? { "Product subcategory": otherDeviceSubcategory } : {}) } : {}) }, name: form.name.trim(), categoryKey: form.categoryKey, productType: form.productType.trim(), tagline: form.tagline || null, visibility: form.visibility, salesMode: form.salesMode, availability: form.availability, variants };
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
      {loading ? <div className="loading-panel"><span className="spinner"/> Loading products…</div> : items.length ? <div className="table-wrap"><table><thead><tr><th>PRODUCT</th><th>CATEGORY</th><th>TYPE</th><th>PRICE FROM</th><th>VISIBILITY</th><th>UPDATED</th><th>ACTIONS</th></tr></thead><tbody>{items.map(p => <tr key={p.id}><td><div className="product-cell">{p.image_url ? <img src={p.image_url} alt="" /> : <div className="product-avatar"><Smartphone size={17}/></div>}<div><b>{p.name}</b>{(p.specs?.Color || p.specs?.Colour || p.colors?.[0]) && <span className="subline">Color: {p.specs?.Color || p.specs?.Colour || p.colors?.[0]}</span>}<span className="subline">{p.slug || p.id}</span></div></div></td><td>{titleCase(p.category_key)}</td><td>{titleCase(p.product_type)}</td><td>{p.from_price_cents == null ? "—" : money(p.from_price_cents)}</td><td><span className={`status ${p.visibility}`}>{p.visibility}</span></td><td>{date(p.updated_at)}</td><td><div className="row-actions"><button className="btn secondary small" onClick={() => startEdit(p.id)}>Edit</button><button className="btn danger small" onClick={() => setDeleteId(p.id)}>Delete</button></div></td></tr>)}</tbody></table></div> : <EmptyState icon={Package} title="No products found" detail="Add your first product to start building the catalogue."/>}
    </section>
    {editing && <div className="modal-backdrop"><form className="editor-modal" onSubmit={save}>
      <div className="modal-head"><div><div className="eyebrow">CATALOGUE</div><h2>{editing === "new" ? "Add product" : "Edit product"}</h2></div><button type="button" className="icon-btn" onClick={() => setEditing(null)}><X size={19}/></button></div>
      {editing === "new" && <label className="field-wide product-category-choice">Product category<select value={form.categoryKey} onChange={e => { const next=storeCategories.find(c=>c.key===e.target.value); setForm(f=>({...f,categoryKey:e.target.value,productType:next?.parent_key==="other-devices"?next.key:f.productType})); }}><option value="">Choose a category…</option>{storeCategories.filter(c=>!c.parent_key).map(parent=><optgroup key={parent.key} label={parent.label}>{<option value={parent.key}>{parent.label}</option>}{storeCategories.filter(c=>c.parent_key===parent.key).map(child=><option key={child.key} value={child.key}>↳ {child.label}</option>)}</optgroup>)}</select></label>}
      {editing === "new" && form.categoryKey === "iphone" && <section className="iphone-wizard">
        <div className="iphone-wizard-steps"><span className={iphoneStep===1?"active":""}>01 · Model</span><span className={iphoneStep===2?"active":""}>02 · Version</span><span className={iphoneStep===3?"active":""}>03 · Condition & price</span></div>
        {iphoneStep===1 && <div className="editor-grid"><CustomModelField label="Choose iPhone model" value={iphoneModel} onChange={v=>{setIphoneModel(v);setIphoneColor(DEVICE_MODEL_COLORS.iphone[v]?.[0]||"");}} options={IPHONE_MODELS} placeholder="Enter any iPhone model or edition"/><p className="field-wide muted">Choose the exact model, starting from iPhone X.</p></div>}
        {iphoneStep===2 && <div className="editor-grid">
          <label>Storage<CustomSelect value={iphoneStorage} onChange={e=>setIphoneStorage(e.target.value)}>{["64GB","128GB","256GB","512GB","1TB","2TB"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label>
          <label>Country / region (optional)<CustomSelect value={iphoneRegion} onChange={e=>setIphoneRegion(e.target.value)}><option value="">Not specified</option>{["International","USA","China / Hong Kong","Japan","Middle East"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label>
          <label>SIM configuration<CustomSelect value={iphoneSim} onChange={e=>setIphoneSim(e.target.value)}>{["Physical SIM + eSIM","Dual physical SIM","eSIM only","Dual eSIM","Physical SIM only","Verify from model number"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label>
          <p className="field-wide muted">SIM support varies by region and exact model number. Confirm the physical device before saving.</p>
        </div>}
        {iphoneStep===3 && <div className="editor-grid">
          <label>Device condition<CustomSelect value={iphoneCondition} onChange={e=>{const condition=e.target.value;setIphoneCondition(condition);setIphoneColor(condition==="New"?(DEVICE_MODEL_COLORS.iphone[iphoneModel]||[])[0]||"": "");}}><option>New</option><option>Used</option></CustomSelect></label>
          {iphoneCondition==="New" ? <ColorPickerField label="Official Apple finish" value={iphoneColor} onChange={setIphoneColor} options={DEVICE_MODEL_COLORS.iphone[iphoneModel]||[]} allowCustom={false}/> : <label>Actual device color<input value={iphoneColor} onChange={e=>setIphoneColor(e.target.value)} placeholder="Enter the device's actual color"/></label>}
          {iphoneCondition==="Used" && <>
            <label>Battery health (%)<input type="number" min="1" max="100" value={iphoneBattery} onChange={e=>setIphoneBattery(e.target.value)} placeholder="e.g. 88"/></label>
            <label>Condition grade<CustomSelect value={iphoneGrade} onChange={e=>setIphoneGrade(e.target.value)}>{["Like New","Excellent","Good","Fair"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label>
            <label className="field-wide">Defects / repairs / notes<input value={iphoneNotes} onChange={e=>setIphoneNotes(e.target.value)} placeholder="Scratches, replaced parts, repairs…"/></label>
          </>}
          <label>Selling price (EGP)<input type="number" min="0" step="0.01" required value={iphonePrice} onChange={e=>setIphonePrice(e.target.value)}/></label>
          <label>SKU (optional)<input value={iphoneSku} onChange={e=>setIphoneSku(e.target.value)}/></label>
          <label>Visibility<CustomSelect value={form.visibility} onChange={e=>setForm(f=>({...f,visibility:e.target.value}))}><option value="draft">Draft</option><option value="published">Published</option><option value="hidden">Hidden</option></CustomSelect></label>
        </div>}
        <div className="modal-foot"><button type="button" className="btn secondary" onClick={()=>iphoneStep===1?setEditing(null):setIphoneStep(v=>v-1)}>{iphoneStep===1?"Cancel":"Back"}</button>{iphoneStep<3?<button type="button" className="btn primary" disabled={iphoneStep===1&&!iphoneModel} onClick={()=>setIphoneStep(v=>v+1)}>Continue <ArrowRight size={14}/></button>:<button type="submit" className="btn primary" disabled={saving}>{saving?"Creating…":"Create product & stock unit"}</button>}</div>
      </section>}
      {editing === "new" && form.categoryKey === "watch" && <section className="iphone-wizard watch-wizard">
        <div className="iphone-wizard-steps"><span className={watchStep===1?"active":""}>01 · Model</span><span className={watchStep===2?"active":""}>02 · Configuration</span><span className={watchStep===3?"active":""}>03 · Condition & price</span></div>
        {watchStep===1 && <div className="editor-grid">
           <CustomModelField label="Apple Watch model" value={watchModel} onChange={v=>{setWatchModel(v);const model=WATCH_MODELS.find(x=>x.name===v);if(model){const material=model.materials[0];setWatchSize(model.sizes[0]);setWatchMaterial(material);setWatchConnectivity((model.connectivityByMaterial?.[material]||model.connectivity)[0]);setWatchColor((model.colorsByMaterial?.[material]||model.colors)[0]);setWatchEdition("Standard");}}} options={WATCH_MODELS.map(model=>model.name)} placeholder="Enter any Watch model or edition"/>
           {watchModel && <div className="field-wide watch-model-summary"><b>{WATCH_MODELS.find(x=>x.name===watchModel)?.display}</b><span>Chip {WATCH_MODELS.find(x=>x.name===watchModel)?.chip} · {WATCH_MODELS.find(x=>x.name===watchModel)?.capacity} · Introduced {WATCH_MODELS.find(x=>x.name===watchModel)?.year}</span><small>Options below are filtered to this model.</small></div>}
         </div>}
         {watchStep===2 && <div className="editor-grid">
            <label>Case size<CustomSelect value={watchSize} onChange={e=>setWatchSize(e.target.value)}>{["38mm","40mm","41mm","42mm","44mm","45mm","46mm","49mm"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label>
            <label>Connectivity<CustomSelect value={watchConnectivity} onChange={e=>setWatchConnectivity(e.target.value)}>{watchConnectivityOptions.map(v=><option key={v}>{v}</option>)}</CustomSelect></label>
            <label>Case material<CustomSelect value={watchMaterial} onChange={e=>{const material=e.target.value;setWatchMaterial(material);setWatchConnectivity((selectedWatchModel?.connectivityByMaterial?.[material]||selectedWatchModel?.connectivity||[])[0]||"");setWatchColor((selectedWatchModel?.colorsByMaterial?.[material]||selectedWatchModel?.colors||[])[0]||"");}}>{watchMaterialOptions.map(v=><option key={v}>{v}</option>)}</CustomSelect></label>
            <label>Special collection / band<CustomSelect value={watchEdition} onChange={e=>{const edition=e.target.value;setWatchEdition(edition);if(edition==="Hermès"&&selectedWatchModel){const material=selectedWatchModel.materials.includes("Titanium")?"Titanium":selectedWatchModel.materials.includes("Stainless Steel")?"Stainless Steel":selectedWatchModel.materials[0];setWatchMaterial(material);setWatchConnectivity((selectedWatchModel.connectivityByMaterial?.[material]||selectedWatchModel.connectivity)[0]);setWatchColor((WATCH_HERMES_COLORS[watchModel] || selectedWatchModel.colorsByMaterial?.[material] || selectedWatchModel.colors)[0]);}}}>{watchEditionOptions.map(v=><option key={v}>{v}</option>)}</CustomSelect></label>
            <label>Band style / size<input value={watchBand} onChange={e=>setWatchBand(e.target.value)} placeholder={watchEdition==="Hermès"?"e.g. Grand H / Single Tour / Double Tour":watchEdition==="Nike band"?"e.g. Nike Sport Band / Nike Sport Loop":"e.g. Sport Band / M-L"}/></label>
            <label>Model number (optional)<input value={watchModelNumber} onChange={e=>setWatchModelNumber(e.target.value.trim().toUpperCase())} placeholder="e.g. A3335 / A3452"/></label>
            <div className="field-wide watch-spec-panel"><strong>Technical specifications · {watchModel}</strong><div className="watch-spec-grid">
              {[
                ["Collection",watchEdition],["Display",watchTech.displayType||selectedWatchModel?.display],["Screen size",WATCH_SCREEN_INCHES[watchModel]?.[watchSize]],["Brightness",watchTech.brightness],["Resolution",watchTech.resolution?.[watchSize]||"Check model number"],["Display area",watchTech.displayArea?.[watchSize]],["Chip",selectedWatchModel?.chip],["Storage",selectedWatchModel?.capacity],["Battery",watchTech.battery],["Charging",watchTech.charging],["Water resistance",watchTech.water],["Dust resistance",watchTech.dust],["Glass",watchTech.glass],["Case material",watchMaterial],["Colour",watchColor],["Weight",watchTech.weight?.[watchSize]],["Wrist fit",watchTech.wristFit?.[watchSize]],["Dimensions",watchTech.dimensionsByMaterial?.[watchMaterial]?.[watchSize]||watchTech.dimensions?.[watchSize]],["GPS",watchTech.gps],["Wireless",watchTech.wireless],["Compatibility",watchTech.compatibility],["Audio",watchTech.audio],["Sensors",watchTech.sensors],["Key features",watchTech.features]
              ].filter(([,v])=>v).map(([k,v])=><div key={k}><small>{k}</small><span>{v}</span></div>)}
            </div><p>Battery figures are Apple's estimates. Actual performance depends on settings, network and usage. Confirm regional model number for cellular bands and exact compatibility.</p></div>
          </div>}
          {watchStep===3 && <div className="editor-grid">
          <label>Device condition<CustomSelect value={watchCondition} onChange={e=>{const condition=e.target.value;setWatchCondition(condition);setWatchColor(condition==="New"?(watchColorOptions[0]||""):"");}}><option>New</option><option>Used</option></CustomSelect></label>
          {watchCondition==="New" ? <ColorPickerField label="Official Apple finish" value={watchColor} onChange={setWatchColor} options={watchColorOptions} allowCustom={false}/> : <label>Actual device color<input value={watchColor} onChange={e=>setWatchColor(e.target.value)} placeholder="Enter the device's actual color"/></label>}
          {watchCondition==="Used" && <><label>Battery health (%)<input type="number" min="1" max="100" value={watchBattery} onChange={e=>setWatchBattery(e.target.value)} placeholder="e.g. 92"/></label><label>Condition grade<CustomSelect value={watchGrade} onChange={e=>setWatchGrade(e.target.value)}>{["Like New","Excellent","Good","Fair"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label><label className="field-wide">Defects / repairs / notes<input value={watchNotes} onChange={e=>setWatchNotes(e.target.value)} placeholder="Scratches, replaced parts, repairs…"/></label></>}
          <label>Selling price (EGP)<input type="number" min="0" step="0.01" required value={watchPrice} onChange={e=>setWatchPrice(e.target.value)}/></label>
          <label>SKU (optional)<input value={watchSku} onChange={e=>setWatchSku(e.target.value)}/></label>
          <label>Visibility<CustomSelect value={form.visibility} onChange={e=>setForm(f=>({...f,visibility:e.target.value}))}><option value="draft">Draft</option><option value="published">Published</option><option value="hidden">Hidden</option></CustomSelect></label>
        </div>}
        <div className="modal-foot"><button type="button" className="btn secondary" onClick={()=>watchStep===1?setEditing(null):setWatchStep(v=>v-1)}>{watchStep===1?"Cancel":"Back"}</button>{watchStep<3?<button type="button" className="btn primary" disabled={watchStep===1&&!watchModel.trim()} onClick={()=>setWatchStep(v=>v+1)}>Continue <ArrowRight size={14}/></button>:<button type="submit" className="btn primary" disabled={saving}>{saving?"Creating…":"Create Apple Watch & stock unit"}</button>}</div>
      </section>}
      {editing==="new" && form.categoryKey==="ipad" && <section className="iphone-wizard watch-wizard">
        <div className="iphone-wizard-steps"><span className={ipadStep===1?"active":""}>01 · Model</span><span className={ipadStep===2?"active":""}>02 · Configuration</span><span className={ipadStep===3?"active":""}>03 · Condition & price</span></div>
        {ipadStep===1 && <div className="editor-grid"><CustomModelField label="iPad model" value={ipadModel} onChange={v=>{setIpadModel(v);setIpadColor(DEVICE_MODEL_COLORS.ipad[v]?.[0]||"");}} options={IPAD_MODELS} placeholder="Enter any iPad model or generation"/><label>Display size<CustomSelect value={ipadScreen} onChange={e=>setIpadScreen(e.target.value)}>{IPAD_SCREEN_SIZES.map(v=><option key={v}>{v}</option>)}</CustomSelect></label><label>Chip<input value={ipadChip} onChange={e=>setIpadChip(e.target.value)} placeholder="e.g. M5 / M4 / A16"/></label><p className="field-wide muted">Confirm chip and display size from the exact device model when needed.</p></div>}
        {ipadStep===2 && <div className="editor-grid"><label>Storage<CustomSelect value={ipadStorage} onChange={e=>setIpadStorage(e.target.value)}>{IPAD_STORAGE.map(v=><option key={v}>{v}</option>)}</CustomSelect></label><label>Connectivity<CustomSelect value={ipadConnectivity} onChange={e=>setIpadConnectivity(e.target.value)}>{["Wi-Fi","Wi-Fi + Cellular"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label><label>Apple Pencil support<input value={ipadPencil} onChange={e=>setIpadPencil(e.target.value)} placeholder="e.g. Apple Pencil Pro / USB-C"/></label><label>Keyboard / accessory<input value={ipadKeyboard} onChange={e=>setIpadKeyboard(e.target.value)} placeholder="e.g. Magic Keyboard / none"/></label><p className="field-wide muted">Pencil and keyboard compatibility varies by generation.</p></div>}
        {ipadStep===3 && <div className="editor-grid"><label>Condition<CustomSelect value={ipadCondition} onChange={e=>{const condition=e.target.value;setIpadCondition(condition);setIpadColor(condition==="New"?(DEVICE_MODEL_COLORS.ipad[ipadModel]||[])[0]||"": "");}}><option>New</option><option>Used</option></CustomSelect></label>{ipadCondition==="New" ? <ColorPickerField label="Official Apple finish" value={ipadColor} onChange={setIpadColor} options={DEVICE_MODEL_COLORS.ipad[ipadModel]||[]} allowCustom={false}/> : <label>Actual device color<input value={ipadColor} onChange={e=>setIpadColor(e.target.value)} placeholder="Enter the device's actual color"/></label>}{ipadCondition==="Used" && <><label>Battery health (%)<input type="number" min="1" max="100" value={ipadBattery} onChange={e=>setIpadBattery(e.target.value)}/></label><label>Grade<CustomSelect value={ipadGrade} onChange={e=>setIpadGrade(e.target.value)}>{["Like New","Excellent","Good","Fair"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label><label className="field-wide">Defects / repairs / notes<input value={ipadNotes} onChange={e=>setIpadNotes(e.target.value)} placeholder="Scratches, replaced parts, repairs…"/></label></>}<label>Selling price (EGP)<input type="number" min="0" step="0.01" required value={ipadPrice} onChange={e=>setIpadPrice(e.target.value)}/></label><label>SKU (optional)<input value={ipadSku} onChange={e=>setIpadSku(e.target.value)}/></label><label>Visibility<CustomSelect value={form.visibility} onChange={e=>setForm(f=>({...f,visibility:e.target.value}))}><option value="draft">Draft</option><option value="published">Published</option><option value="hidden">Hidden</option></CustomSelect></label></div>}
        <div className="modal-foot"><button type="button" className="btn secondary" onClick={()=>ipadStep===1?setEditing(null):setIpadStep(v=>v-1)}>{ipadStep===1?"Cancel":"Back"}</button>{ipadStep<3?<button type="button" className="btn primary" disabled={ipadStep===1&&!ipadModel} onClick={()=>setIpadStep(v=>v+1)}>Continue <ArrowRight size={14}/></button>:<button type="submit" className="btn primary" disabled={saving}>{saving?"Creating…":"Create iPad & stock unit"}</button>}</div>
      </section>}
      {editing==="new" && form.categoryKey==="mac" && <section className="iphone-wizard watch-wizard">
        <div className="iphone-wizard-steps"><span className={macStep===1?"active":""}>01 · Model</span><span className={macStep===2?"active":""}>02 · Configuration</span><span className={macStep===3?"active":""}>03 · Condition & price</span></div>
        {macStep===1 && <div className="editor-grid"><CustomModelField label="Mac model" value={macModel} onChange={v=>{setMacModel(v);setMacColor(DEVICE_MODEL_COLORS.mac[v]?.[0]||"");}} options={MAC_MODELS} placeholder="Enter any Mac model or configuration"/><label>Display size<input value={macScreen} onChange={e=>setMacScreen(e.target.value)} placeholder="e.g. 13.6-inch / None"/></label><label>Apple chip / processor<input value={macChip} onChange={e=>setMacChip(e.target.value)} placeholder="e.g. M5 Pro / M4 / Intel Core i7"/></label><label>CPU details<input value={macCpu} onChange={e=>setMacCpu(e.target.value)} placeholder="e.g. 12-core CPU"/></label><label>GPU details<input value={macGpu} onChange={e=>setMacGpu(e.target.value)} placeholder="e.g. 16-core GPU"/></label></div>}
        {macStep===2 && <div className="editor-grid"><label>Unified memory / RAM<CustomSelect value={macMemory} onChange={e=>setMacMemory(e.target.value)}>{MAC_MEMORY.map(v=><option key={v}>{v}</option>)}</CustomSelect></label><label>Storage<CustomSelect value={macStorage} onChange={e=>setMacStorage(e.target.value)}>{MAC_STORAGE.map(v=><option key={v}>{v}</option>)}</CustomSelect></label><label>Keyboard layout<CustomSelect value={macKeyboard} onChange={e=>setMacKeyboard(e.target.value)}>{["English","Arabic / English","Arabic","Other / not specified"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label><p className="field-wide muted">For desktop Macs, enter display size as None and specify included accessories in notes.</p></div>}
        {macStep===3 && <div className="editor-grid"><label>Condition<CustomSelect value={macCondition} onChange={e=>{const condition=e.target.value;setMacCondition(condition);setMacColor(condition==="New"?(DEVICE_MODEL_COLORS.mac[macModel]||[])[0]||"": "");}}><option>New</option><option>Used</option></CustomSelect></label>{macCondition==="New" ? <ColorPickerField label="Official Apple finish" value={macColor} onChange={setMacColor} options={DEVICE_MODEL_COLORS.mac[macModel]||[]} allowCustom={false}/> : <label>Actual device color<input value={macColor} onChange={e=>setMacColor(e.target.value)} placeholder="Enter the device's actual color"/></label>}{macCondition==="Used" && <><label>Battery health (%)<input type="number" min="1" max="100" value={macBattery} onChange={e=>setMacBattery(e.target.value)}/></label><label>Battery cycle count<input type="number" min="0" value={macCycles} onChange={e=>setMacCycles(e.target.value)}/></label><label>Grade<CustomSelect value={macGrade} onChange={e=>setMacGrade(e.target.value)}>{["Like New","Excellent","Good","Fair"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label><label className="field-wide">Defects / repairs / accessories<input value={macNotes} onChange={e=>setMacNotes(e.target.value)} placeholder="Repairs, scratches, charger, box…"/></label></>}<label>Selling price (EGP)<input type="number" min="0" step="0.01" required value={macPrice} onChange={e=>setMacPrice(e.target.value)}/></label><label>SKU (optional)<input value={macSku} onChange={e=>setMacSku(e.target.value)}/></label><label>Visibility<CustomSelect value={form.visibility} onChange={e=>setForm(f=>({...f,visibility:e.target.value}))}><option value="draft">Draft</option><option value="published">Published</option><option value="hidden">Hidden</option></CustomSelect></label></div>}
        <div className="modal-foot"><button type="button" className="btn secondary" onClick={()=>macStep===1?setEditing(null):setMacStep(v=>v-1)}>{macStep===1?"Cancel":"Back"}</button>{macStep<3?<button type="button" className="btn primary" disabled={macStep===1&&!macModel} onClick={()=>setMacStep(v=>v+1)}>Continue <ArrowRight size={14}/></button>:<button type="submit" className="btn primary" disabled={saving}>{saving?"Creating…":"Create Mac & stock unit"}</button>}</div>
      </section>}
      {editing==="new" && form.categoryKey==="airpods" && <section className="iphone-wizard watch-wizard">
        <div className="iphone-wizard-steps"><span className="active">01 · Model</span><span>02 · Configuration</span><span>03 · Condition & price</span></div>
        <div className="editor-grid">
          <CustomModelField label="AirPods model" value={airpodsModel} onChange={v=>{setAirpodsModel(v);setAirpodsColor(DEVICE_MODEL_COLORS.airpods[v]?.[0]||"White");}} options={AIRPODS_MODELS} placeholder="Enter any AirPods model or edition"/>
          <label>Generation / variant<input value={airpodsGeneration} onChange={e=>setAirpodsGeneration(e.target.value)} placeholder="e.g. USB-C / 2024 / Axxxx"/></label>
          <label>Connectivity<input value={airpodsConnectivity} onChange={e=>setAirpodsConnectivity(e.target.value)} placeholder="Bluetooth / custom"/></label>
          <label>Charging case<CustomSelect value={airpodsCase} onChange={e=>setAirpodsCase(e.target.value)}>{["Lightning Charging Case","USB-C Charging Case","Wireless Charging Case","MagSafe Charging Case","Smart Case","No case / replacement"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label>
          <label>Condition<CustomSelect value={airpodsCondition} onChange={e=>{const condition=e.target.value;setAirpodsCondition(condition);setAirpodsColor(condition==="New"?(DEVICE_MODEL_COLORS.airpods[airpodsModel]||["White"])[0]||"":"");}}><option>New</option><option>Used</option></CustomSelect></label>
          {airpodsCondition==="New" ? <ColorPickerField label="Official Apple finish" value={airpodsColor} onChange={setAirpodsColor} options={DEVICE_MODEL_COLORS.airpods[airpodsModel]||["White"]} allowCustom={false}/> : <label>Actual device color<input value={airpodsColor} onChange={e=>setAirpodsColor(e.target.value)} placeholder="Enter the device's actual color"/></label>}
          {airpodsCondition==="Used" && <><label>Battery health (%)<input type="number" min="1" max="100" value={airpodsBattery} onChange={e=>setAirpodsBattery(e.target.value)} placeholder="e.g. 90"/></label><label>Grade<CustomSelect value={airpodsGrade} onChange={e=>setAirpodsGrade(e.target.value)}>{["Like New","Excellent","Good","Fair"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label><label className="field-wide">Defects / repairs / notes<input value={airpodsNotes} onChange={e=>setAirpodsNotes(e.target.value)} placeholder="Battery, case, replaced parts…"/></label></>}
          <label>Selling price (EGP)<input type="number" min="0" step="0.01" required value={airpodsPrice} onChange={e=>setAirpodsPrice(e.target.value)}/></label><label>SKU (optional)<input value={airpodsSku} onChange={e=>setAirpodsSku(e.target.value)}/></label><label>Visibility<CustomSelect value={form.visibility} onChange={e=>setForm(f=>({...f,visibility:e.target.value}))}><option value="draft">Draft</option><option value="published">Published</option><option value="hidden">Hidden</option></CustomSelect></label>
          <label className="field-wide">Product description<textarea rows={3} value={form.tagline} onChange={e=>setForm(f=>({...f,tagline:e.target.value}))} placeholder="Describe the sound, comfort, noise cancellation and everyday experience…"/></label>
          <label className="field-wide">Additional product details & specifications<textarea rows={5} value={customSpecs} onChange={e=>setCustomSpecs(e.target.value)} placeholder={"Add one detail per line using Field: Value\nActive Noise Cancellation: Yes\nAdaptive Audio: Yes\nSpatial Audio: Personalized with dynamic head tracking\nBattery life: Up to 6 hours listening time\nWater resistance: IP54"} /><small className="muted">These details are saved in the product Specifications section. Add only information confirmed for the exact AirPods model.</small></label>
        </div>
        <div className="modal-foot"><button type="button" className="btn secondary" onClick={()=>setEditing(null)}>Cancel</button><button type="submit" className="btn primary" disabled={saving}>{saving?"Creating…":"Create AirPods & stock unit"}</button></div>
      </section>}
      {!(editing === "new" && ["iphone","watch","ipad","mac","airpods"].includes(form.categoryKey)) && <div className="editor-grid">
        <label className="field-wide">Product name<input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}/></label>
        <label className="field-wide">Link to an existing color family<select value={form.modelGroupKey || ""} onChange={e => setForm(f => ({ ...f, modelGroupKey: e.target.value }))}><option value="">No manual link / use automatic grouping</option>{groupCandidates.filter(p => p.id !== editing && p.category_key === form.categoryKey && p.model_group_key).filter((p, i, all) => all.findIndex(x => x.model_group_key === p.model_group_key) === i).map(p => <option key={p.model_group_key} value={p.model_group_key}>{p.name} · {p.specs?.Color || p.specs?.Colour || p.colors?.[0] || "Color family"}</option>)}</select><small className="muted">Choose an existing product family to link this separate color record. Its own price, stock, SKU and images remain independent.</small></label>
        <label className="field-wide">Color group key (optional)<input value={form.modelGroupKey || ""} onChange={e => setForm(f => ({ ...f, modelGroupKey: e.target.value }))} placeholder="Example: apple-iphone-17-pro-new"/><small className="muted">Use the same key for products of the same model in different colors. The storefront will show one card with color swatches.</small></label>
        {editing !== "new" && <label>Category<select value={form.categoryKey} onChange={e => setForm(f => ({ ...f, categoryKey: e.target.value, modelGroupKey: "" }))}>{["iphone","watch","ipad","mac","airpods","apple-accessory","other-accessory","other-devices"].map(k => <option key={k} value={k}>{titleCase(k)}</option>)}</select></label>}
        {isOtherDevicesCategory ? <section className="field-wide other-device-builder"><div className="eyebrow">OTHER DEVICES</div><h3>Choose device category</h3><p className="muted">Choose the product branch, then select whether the item is new or used. You can add any technical details below.</p><label>Device branch<CustomSelect value={form.productType} onChange={e => { setForm(f => ({ ...f, productType: e.target.value, variants: [{storage:"",color:"",price:"",stockQty:""}] })); setOtherDeviceSubcategory(""); setOtherDeviceAnswers({}); }}><option value="smartphone">Smartphones</option><option value="smartwatch">Smart Watches</option><option value="tablet">Tablets</option><option value="speakers">Speakers</option><option value="headphones">Headphones</option><option value="other-electronics">Other Electronics</option></CustomSelect></label>{form.productType === "other-electronics" && <label>Electronics type<CustomSelect value={otherDeviceSubcategory} onChange={e => setOtherDeviceSubcategory(e.target.value)}><option value="">Choose a subcategory</option><option value="other-electronics">Other Electronics</option></CustomSelect></label>}<label>Condition<CustomSelect value={otherDeviceCondition} onChange={e=>{setOtherDeviceCondition(e.target.value);setOtherDeviceBattery("");setOtherDeviceGrade("Like New");setOtherDeviceUsageNotes("");}}><option value="New">New</option><option value="Used">Used</option></CustomSelect></label><p className="muted">The questions below adapt automatically to the selected device branch.</p></section> : <label>Product type<input required value={form.productType} onChange={e => setForm(f => ({ ...f, productType: e.target.value }))}/></label>}
        <label className="field-wide">Description{isOtherDevicesCategory ? <textarea rows={2} value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Write a short description of this product…"/> : <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}/>}</label>
        <label>Sales mode<CustomSelect value={form.salesMode} onChange={e => setForm(f => ({ ...f, salesMode: e.target.value }))}><option value="for_sale">For sale</option><option value="reservation">Reservation</option></CustomSelect></label>
        <label>Availability<CustomSelect value={form.availability} onChange={e => setForm(f => ({ ...f, availability: e.target.value }))}><option value="in_stock">In stock</option><option value="out_of_stock">Out of stock</option><option value="coming_soon">Coming soon</option><option value="preorder">Pre-order</option></CustomSelect></label>
        <label>Visibility<CustomSelect value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}><option value="draft">Draft</option><option value="published">Published</option><option value="hidden">Hidden</option></CustomSelect></label>
      </div>}
      {editing==="new" && (isOtherDevicesCategory ? <section className="field-wide other-device-specs" style={{margin:"14px 0"}}><div className="eyebrow">DEVICE SPECIFICATIONS</div><h3>{titleCase(form.productType)} details</h3><p className="muted">Fill in the specifications for this device. Only the relevant questions for the selected branch are shown.</p><div className="editor-grid">{(OTHER_DEVICE_FIELD_SETS[form.productType] || OTHER_DEVICE_FIELD_SETS["other-electronics"]).map(field=><label key={field.key}>{field.label}<input value={otherDeviceAnswers[field.key] || ""} onChange={e=>setOtherDeviceAnswers(current=>({...current,[field.key]:e.target.value}))} placeholder={"Enter "+field.label.toLowerCase()}/></label>)}</div>{otherDeviceCondition==="Used" && <><div className="eyebrow" style={{marginTop:18}}>USED DEVICE CONDITION</div><h3>Usage & condition details</h3><p className="muted">These extra questions appear only for used devices.</p><div className="editor-grid"><label>Battery health / runtime<input value={otherDeviceBattery} onChange={e=>setOtherDeviceBattery(e.target.value)} placeholder="e.g. 90% or up to 8 hours"/></label><label>Condition grade<CustomSelect value={otherDeviceGrade} onChange={e=>setOtherDeviceGrade(e.target.value)}>{["Like New","Excellent","Good","Fair"].map(v=><option key={v}>{v}</option>)}</CustomSelect></label><label className="field-wide">Defects / repairs / usage notes<textarea rows={2} value={otherDeviceUsageNotes} onChange={e=>setOtherDeviceUsageNotes(e.target.value)} placeholder="Describe scratches, faults, replaced parts, battery issues or previous repairs…"/></label></div></>}</section> : <label className="field-wide" style={{display:"block",margin:"14px 0"}}>Custom specifications · any field<textarea rows={4} value={customSpecs} onChange={e=>setCustomSpecs(e.target.value)} placeholder={"Write one custom field per line, in this format:\nScreen size: 10.9-inch\nProcessor: A17 Pro\nColor: Starlight\nCharging port: USB-C"} style={{width:"100%",marginTop:8}}/><small className="muted">Any value you enter here is saved with the product and overrides the matching standard specification. Use “Field: Value” on each line.</small></label>)}
      <div className="image-manager"><div><h3>Product images</h3><p>Choose the main product photo and optional gallery images.</p></div><div className="image-manager-actions"><button type="button" className="btn secondary small" onClick={() => { loadMedia(); setMediaOpen(true); }}><Image size={14}/> Choose from library</button><label className="btn secondary small upload-label">{uploading ? "Uploading…" : "Upload images"}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e => { uploadMedia(e.target.files); e.target.value = ""; }}/></label></div>{imageUploadError && <div className="alert error" role="alert"><AlertTriangle size={16}/>{imageUploadError}</div>}{localImagePreviews.length > 0 && <div className="selected-image-list">{localImagePreviews.map(image => <div className="selected-image" key={image.id}><img src={image.url} alt={image.name}/><span>{uploading ? "Uploading…" : "Upload failed — choose again"}</span></div>)}</div>}{(primaryImageMediaId || galleryMediaIds.length > 0) && <div className="selected-image-list">
        {[...(primaryImageMediaId ? [{ id: primaryImageMediaId, main: true }] : []), ...galleryMediaIds.filter(id => id !== primaryImageMediaId).map(id => ({ id, main: false }))].map(image => {
          const asset = media.find(m => m.id === image.id);
          return <div className="selected-image" key={image.id}><img src={asset?.url || ""} alt={asset?.file_name || "Product image"}/><span>{image.main ? "Main image" : "Gallery image"}</span>{!image.main && <button type="button" className="text-btn" onClick={() => setGalleryMediaIds(ids => ids.filter(id => id !== image.id))}>Remove</button>}{image.main && <button type="button" className="text-btn" onClick={() => { setPrimaryImageMediaId(""); }}>Remove</button>}</div>;
        })}
      </div>}</div>
      {mediaOpen && <div className="media-picker-backdrop"><div className="media-picker"><div className="modal-head"><div><div className="eyebrow">MEDIA LIBRARY</div><h2>Choose product images</h2></div><button type="button" className="icon-btn" onClick={() => setMediaOpen(false)}><X size={18}/></button></div>{media.length ? <div className="media-picker-grid">{media.map(m => <div key={m.id} className={primaryImageMediaId === m.id || galleryMediaIds.includes(m.id) ? "media-choice selected" : "media-choice"}><img src={m.url} alt={m.file_name || "Store media"}/><span>{m.file_name || "Image"}</span><div className="media-choice-actions"><button type="button" onClick={() => setPrimaryImageMediaId(m.id)}>{primaryImageMediaId === m.id ? "Main image ✓" : "Set main"}</button><button type="button" onClick={() => setGalleryMediaIds(ids => ids.includes(m.id) ? ids.filter(id => id !== m.id) : [...ids, m.id])}>{galleryMediaIds.includes(m.id) ? "Remove gallery" : "Add to gallery"}</button></div></div>)}</div> : <p className="muted">No images uploaded yet. Upload an image to get started.</p>}<div className="modal-foot"><button type="button" className="btn secondary" onClick={() => setMediaOpen(false)}>Done</button></div></div></div>}
      {!(editing === "new" && ["iphone","watch","ipad","mac","airpods"].includes(form.categoryKey)) && <>
      <div className="variant-heading"><div><h3>Pricing & variants</h3><p>Enter prices in Egyptian pounds. Add every storage and color option.</p></div><button type="button" className="btn secondary small" onClick={addVariant}><Plus size={13}/> Add variant</button></div>
      {form.variants.map((v, i) => <div className="variant-row" key={i}>
        <label>Storage<input value={v.storage} onChange={e => changeVariant(i, "storage", e.target.value)}/></label>
        <label>Color<input value={v.color} onChange={e => changeVariant(i, "color", e.target.value)}/></label>
        <label>Price (EGP)<input type="number" min="0" step="0.01" required value={v.price} onChange={e => changeVariant(i, "price", e.target.value)}/></label>
        <label>Stock qty<input type="number" min="0" step="1" value={v.stockQty} onChange={e => changeVariant(i, "stockQty", e.target.value)}/></label>
        <button type="button" className="icon-btn danger-icon" title="Remove variant" disabled={form.variants.length === 1} onClick={() => setForm(f => ({ ...f, variants: f.variants.filter((_, j) => j !== i) }))}><X size={15}/></button>
      </div>)}
      </>}
      {!(editing === "new" && ["iphone","watch","ipad","mac"].includes(form.categoryKey)) && <div className="modal-foot"><button type="button" className="btn secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn primary" disabled={saving}>{saving ? "Saving…" : "Save product"}</button></div>}
    </form></div>}
    {deleteId && <div className="modal-backdrop"><div className="confirm-modal"><div className="eyebrow">CONFIRM ACTION</div><h2>Delete this product?</h2><p>This permanently removes the product and its linked variants and inventory units.</p><div className="modal-foot"><button className="btn secondary" onClick={() => setDeleteId("")}>Cancel</button><button className="btn danger" onClick={removeProduct}>Delete product</button></div></div></div>}
  </>;
}

function Orders({ onError }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState("");
  const [paymentBusyId, setPaymentBusyId] = useState("");
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
  async function updatePaymentStatus(order, paymentStatus) {
    setPaymentBusyId(order.id);
    try {
      await request(`/orders/${order.id}/payment-status`, { method: "PATCH", body: JSON.stringify({ paymentStatus }) });
      setItems(current => current.map(o => o.id === order.id ? { ...o, payment_status: paymentStatus } : o));
    } catch (e) { onError(e.message); }
    finally { setPaymentBusyId(""); }
  }
  return <>
    <div className="page-heading"><div><div className="eyebrow">COMMERCE</div><h1>Orders</h1><p>Track and process customer orders.</p></div><button className="btn secondary" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={15}/> Refresh</button></div>
    <section className="panel"><div className="toolbar"><div className="filter-tabs">{["all","New","Confirmed","Preparing","Ready","Completed","Cancelled"].map(s => <button key={s} className={filter === s ? "selected" : ""} onClick={() => setFilter(s)}>{s === "all" ? "All orders" : s}</button>)}</div><span className="results-count">{visible.length} orders</span></div>
      {loading ? <div className="loading-panel"><span className="spinner"/> Loading orders…</div> : visible.length ? <div className="table-wrap"><table><thead><tr><th>ORDER</th><th>CUSTOMER</th><th>ITEMS</th><th>DATE</th><th>PAYMENT</th><th>STATUS</th><th className="right">TOTAL</th></tr></thead><tbody>{visible.map(o => <tr key={o.id}><td className="mono">#{String(o.id).slice(-7).toUpperCase()}</td><td><b>{o.customer_name || "Guest"}</b><span className="subline">{o.phone || ""}</span></td><td>{(o.items || []).length || 0}</td><td>{date(o.created_at)}</td><td><select className="status-select" disabled={paymentBusyId === o.id} value={o.payment_status || "pending"} onChange={e => updatePaymentStatus(o, e.target.value)}>{["pending","paid","failed","refunded","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}</select></td><td><select className="status-select" disabled={busyId === o.id} value={o.status} onChange={e => updateStatus(o, e.target.value)}>{(o.status === "Completed" || o.status === "Cancelled" ? [o.status] : ["New","Confirmed","Preparing","Ready","Completed","Cancelled"]).map(s => <option key={s}>{s}</option>)}</select></td><td className="right">{money(o.total_cents)}</td></tr>)}</tbody></table></div> : <EmptyState icon={ShoppingCart} title="No orders here" detail="Orders will appear here as customers check out."/>}
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
        let d;
        if (file.type.startsWith("video/")) {
          if (file.size > 50 * 1024 * 1024) throw new Error("Video too large (max 50MB).");
          d = await request("/media/video", { method: "POST", body: file, headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) } });
        } else {
          const dataUrl = await compressImage(file);
          d = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "store" }) });
        }
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
    <div className="page-heading"><div><div className="eyebrow">STORE EXPERIENCE</div><h1>Media Library</h1><p>Upload, search and organize product photography and store assets.</p></div><label className="btn primary upload-label">{uploading ? "Uploading…" : <><Plus size={15}/> Upload media</>}<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" disabled={uploading} onChange={e => { uploadFiles(e.target.files); e.target.value = ""; }}/></label></div>
    {localPreview && <div className="design-safety-note"><ShieldCheck size={17}/><div><b>Safe local preview</b><span>Image and video uploads are enabled for testing ImageKit. Deleting media is enabled for testing. All other store changes remain blocked in local preview.</span></div></div>}
    <section className="panel">
      <div className="panel-head"><div><h2>All media <span className="count-pill">{items.length} assets</span></h2><p>Images are compressed before upload (8MB max); videos: MP4, WebM, or MOV (50MB max).</p></div><button className="btn secondary" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={14}/> Refresh</button></div>
      {uploadProgress && <div className="media-upload-progress"><span className="spinner"/>{uploadProgress}</div>}
      <div className="media-toolbar"><div className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search file names or tags…"/></div><select value={usageFilter} onChange={e => setUsageFilter(e.target.value)}><option value="all">All asset types</option>{usageTags.map(tag => <option key={tag} value={tag}>{titleCase(tag)}</option>)}</select><span className="results-count">{filtered.length} shown</span></div>
      {loading ? <div className="loading-panel"><span className="spinner"/> Loading media…</div> : filtered.length ? <div className="media-library-grid">{filtered.map(m => <article className="media-card" key={m.id}>{m.usage_tag === "video" || /\\.(mp4|webm|mov)(?:$|\\?)/i.test(m.url) ? <video src={m.url} controls preload="metadata"/> : <img src={m.url} alt={m.file_name || "Store asset"}/>}<div><b title={m.file_name}>{m.file_name || "Image asset"}</b><span>{m.usage_tag || "Uncategorized"} · {Math.max(1, Math.round((m.bytes || 0) / 1024))} KB</span><button className="text-btn danger-text" onClick={() => setDeleting(m.id)}>Delete asset</button></div></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Image size={22}/></div><b>{items.length ? "No matching assets" : "Your media library is empty"}</b><p>{items.length ? "Try another search or asset type." : "Upload your first product image to get started."}</p></div>}
    </section>
    {deleting && <div className="modal-backdrop"><div className="confirm-modal"><h2>Delete this media file?</h2><p>If this image is used by a product or category, the database may prevent deletion or clear its reference.</p><div className="modal-foot"><button className="btn secondary" onClick={() => setDeleting("")}>Cancel</button><button className="btn danger" onClick={() => remove(deleting)}>Delete file</button></div></div></div>}
  </>;
}


function HomepageBuilder({ onError }) {
  const blank = { eyebrow: "GO IPHONE", title: "", subtitle: "", badge: "", ctaText: "Shop now", linkCategoryKey: "iphone", linkProductId: "", imageMediaId: "", mobileImageMediaId: "", videoUrl: "", mobileVideoUrl: "", active: true, durationMs: 6500 };
  const [slides, setSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [siteContent, setSiteContent] = useState({
    homepageLayout: [
      { id: "hero", type: "hero", label: "Hero banner", visible: true, order: 0 },
      { id: "categories", type: "categories", label: "Categories", visible: true, order: 1 },
      { id: "collection-featured", type: "product-collection", collectionId: "featured", label: "Featured", visible: true, order: 2 },
      { id: "collection-new-arrivals", type: "product-collection", collectionId: "new-arrivals", label: "New Arrivals", visible: true, order: 3 },
      { id: "collection-best-sellers", type: "product-collection", collectionId: "best-sellers", label: "Best Sellers", visible: true, order: 4 },
      { id: "collection-certified-refurbished", type: "product-collection", collectionId: "certified-refurbished", label: "Certified Pre-Owned", visible: true, order: 5 },
      { id: "tools", type: "tools", label: "Tools", visible: true, order: 6 },
      { id: "trust", type: "trust", label: "Trust", visible: true, order: 7 },
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
  const [heroMediaOpen, setHeroMediaOpen] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState("canvas");
  const [previewMode, setPreviewMode] = useState("");
  const previewFrameRef = useRef(null);
  const [draggedSection, setDraggedSection] = useState("");
  const [layoutHistory, setLayoutHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [canvasViewport, setCanvasViewport] = useState("desktop");
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [addSectionAfterId, setAddSectionAfterId] = useState("");
  const [liveCollectionId, setLiveCollectionId] = useState("best-sellers");
  const [liveCategoryKey, setLiveCategoryKey] = useState("");
  const [editingHomepageCollectionId, setEditingHomepageCollectionId] = useState("best-sellers");
  const [layoutDirty, setLayoutDirty] = useState(false);
  function expandProductCollectionSections(layout, rows = []) {
    const builtIns=[{id:"featured",name:"Featured"},{id:"new-arrivals",name:"New Arrivals"},{id:"best-sellers",name:"Best Sellers"},{id:"certified-refurbished",name:"Certified Pre-Owned"}];
    const all=[...builtIns,...rows.filter(row=>!builtIns.some(base=>base.id===row.id)).map(row=>({id:row.id,name:row.name||row.title||row.id}))];
    const source=Array.isArray(layout)?layout:[];
    const expanded=[];
    source.forEach(item=>{
      if((item.type||item.id)!=="collections"){expanded.push(item);return;}
      all.forEach((collection,index)=>expanded.push({id:"collection-"+collection.id,type:"product-collection",collectionId:collection.id,label:collection.name,visible:true,order:(item.order??0)+index/100}));
    });
    all.forEach(collection=>{
      if(!expanded.some(item=>item.type==="product-collection"&&item.collectionId===collection.id)){
        expanded.push({id:"collection-"+collection.id,type:"product-collection",collectionId:collection.id,label:collection.name,visible:true,order:expanded.length});
      }
    });
    const unique=expanded.filter((item,index,list)=>item.type!=="product-collection"||list.findIndex(candidate=>candidate.type==="product-collection"&&candidate.collectionId===item.collectionId)===index);
    return unique.map((item,index)=>({...item,order:index}));
  }
  function commitLayout(nextLayout) {
    const snapshot = nextLayout.map(item => ({ ...item }));
    setSiteContent(current => ({ ...current, homepageLayout: snapshot }));
    setLayoutDirty(true);
    setLayoutHistory(history => [...history.slice(0, historyIndex + 1), snapshot].slice(-30));
    setHistoryIndex(index => Math.min(index + 1, 29));
  }
  function undoLayout() {
    if (historyIndex <= 0) return;
    const nextIndex = historyIndex - 1;
    setHistoryIndex(nextIndex);
    setSiteContent(current => ({ ...current, homepageLayout: layoutHistory[nextIndex].map(item => ({ ...item })) }));
  }
  function redoLayout() {
    if (historyIndex < 0 || historyIndex >= layoutHistory.length - 1) return;
    const nextIndex = historyIndex + 1;
    setHistoryIndex(nextIndex);
    setSiteContent(current => ({ ...current, homepageLayout: layoutHistory[nextIndex].map(item => ({ ...item })) }));
  }
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all([request("/hero-slides"), request("/media"), request("/categories"), request("/site-content"), request("/collections"), request("/products")]);
      setSlides(results[0].heroSlides || []);
      setMedia(results[1].media || []);
      setCategories(results[2].categories || []);
      setCollections(results[4].collections || []);
      setProducts(results[5].products || []);
      const saved = results[3].siteContent || {};
      setSiteContent(current => ({
        ...current,
        ...saved,
        homepageLayout: Array.isArray(saved.homepageLayout) ? expandProductCollectionSections(saved.homepageLayout, results[4].collections || []) : expandProductCollectionSections(current.homepageLayout, results[4].collections || []),
        toolsSection: { ...current.toolsSection, ...(saved.toolsSection || {}) },
        trustSection: { ...current.trustSection, ...(saved.trustSection || {}), points: Array.isArray(saved.trustSection?.points) ? saved.trustSection.points : current.trustSection.points },
      }));
      const initialLayout = Array.isArray(saved.homepageLayout) ? expandProductCollectionSections(saved.homepageLayout, results[4].collections || []) : expandProductCollectionSections(siteContent.homepageLayout, results[4].collections || []);
      setLayoutHistory([initialLayout.map(item => ({ ...item }))]);
      setHistoryIndex(0);
    } catch (e) { onError(e.message); }
    finally { setLoading(false); }
  }, [onError]);
  useEffect(() => { load(); }, [load, refresh]);
  function updateHomepageLayout(id, patch) {
    const items = siteContent.homepageLayout.map(item => item.id === id ? { ...item, ...patch } : item);
    commitLayout(items);
  }
  const sectionPresets = [
    {type:"hero",label:"Hero banner",group:"Store essentials"},{type:"categories",label:"Shop categories",group:"Store essentials"},{type:"tools",label:"Shopping tools",group:"Store essentials"},{type:"trust",label:"Trust & benefits",group:"Store essentials"},
    {type:"announcement",label:"Announcement bar",group:"Content & marketing"},{type:"image-text",label:"Image with text",group:"Content & marketing"},{type:"promo-banners",label:"Promotional banner grid",group:"Content & marketing"},{type:"featured-product",label:"Featured product",group:"Content & marketing"},{type:"testimonials",label:"Customer testimonials",group:"Content & marketing"},{type:"rich-text",label:"Rich text / story",group:"Content & marketing"}
  ];
  function addHomepageSection(type, afterId = "") {
    const preset=sectionPresets.find(x=>x.type===type); if(!preset)return;
    const item={...preset,id:type+"-"+Date.now(),visible:true,order:0,title:"New "+preset.label,description:"Add your message here.",eyebrow:"GO IPHONE",ctaText:"Explore now",imageUrl:"",backgroundColor:"#f5f3ef",textColor:"#20242b",paddingY:64,linkCategoryKey:"iphone",testimonials:[{quote:"Excellent experience from start to finish.",name:"A happy customer"}]};
    const items=[...siteContent.homepageLayout].sort((a,b)=>(a.order??0)-(b.order??0));
    const targetIndex=afterId?items.findIndex(x=>x.id===afterId):-1;
    items.splice(targetIndex>=0?targetIndex+1:items.length,0,item);
    commitLayout(items.map((entry,index)=>({...entry,order:index})));
    setSelectedSectionId(item.id);
    setShowSectionPicker(false);
  }
  function openSectionPicker(afterId = "") { setAddSectionAfterId(afterId); setShowSectionPicker(true); }
  function removeHomepageSection(id) {
    const target=siteContent.homepageLayout.find(item=>item.id===id);
    if(!target || !window.confirm(`Remove “${target.label||target.title||target.id}” from the homepage?`)) return;
    commitLayout(siteContent.homepageLayout.filter(item=>item.id!==id).map((item,index)=>({...item,order:index})));
    setSelectedSectionId(current=>current===id?"":current);
  }
  function updateSelectedSection(patch) { const items=siteContent.homepageLayout.map(x=>x.id===selectedSectionId?{...x,...patch}:x); commitLayout(items); }
  function moveHomepageSection(index, direction) {
    const items = [...siteContent.homepageLayout].sort((a, b) => a.order - b.order);
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    commitLayout(items.map((item, i) => ({ ...item, order: i })));
  }
  function duplicateHomepageSection(item) {
    const copy = { ...item, id: item.id + "-copy-" + Date.now(), type: item.type || item.id, label: (item.label || item.id) + " copy", order: siteContent.homepageLayout.length, visible: false };
    commitLayout([...siteContent.homepageLayout, copy]);
  }
  function dropHomepageSection(targetId) {
    if (!draggedSection || draggedSection === targetId) return;
    const items = [...siteContent.homepageLayout].sort((a, b) => a.order - b.order);
    const from = items.findIndex(item => item.id === draggedSection);
    const to = items.findIndex(item => item.id === targetId);
    if (from < 0 || to < 0) return;
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);
    commitLayout(items.map((item, i) => ({ ...item, order: i })));
    setDraggedSection("");
  }
  async function saveHeroSchedule(slideId, key, value) {
    const schedules = { ...(siteContent.heroSlideSchedules || {}), [slideId]: { ...(siteContent.heroSlideSchedules?.[slideId] || {}), [key]: value || null } };
    setSiteContent(current => ({ ...current, heroSlideSchedules: schedules }));
    await saveSiteSection("heroSlideSchedules", schedules);
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
  async function uploadToolCardImage(file, sectionKey) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const d = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "tools-card" }) });
      setMedia(list => [d.media, ...list]);
      setSiteContent(current => ({ ...current, [sectionKey]: { ...(current[sectionKey] || {}), image: d.media.url } }));
    } catch (e) { onError(e.message); }
    finally { setUploading(false); }
  }
  async function uploadSectionImage(file) {
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const result = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "homepage-section" }) });
      setMedia(list => [result.media, ...list]);
      updateSelectedSection({ imageUrl: result.media.url });
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
  function startNew() { setHeroUploadError(""); setForm({ ...blank }); setEditing("new"); }
  function startEdit(slide) {
    setHeroUploadError("");
    setForm({
      eyebrow: slide.eyebrow || "", title: slide.title || "", subtitle: slide.subtitle || "",
      badge: slide.badge || "", ctaText: slide.cta_text || "", linkCategoryKey: slide.link_category_key || "iphone",
      linkProductId: slide.link_product_id || "", imageMediaId: slide.image_media_id || "",
      mobileImageMediaId: slide.mobile_image_media_id || "", videoUrl: slide.video_url || "",
      mobileVideoUrl: slide.mobile_video_url || "", active: slide.active !== false,
      durationMs: Number(slide.duration_ms || 6500),
    });
    setEditing(slide.id);
  }
  async function upload(file, target) {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes((file.type || "").toLowerCase())) {
      const message = "Choose a JPG, PNG, WebP or GIF image.";
      setHeroUploadError(message); onError(message); return;
    }
    setHeroUploadError("");
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const d = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "hero" }) });
      if (!d?.media?.id || !d.media.url) throw new Error("The server did not return a valid uploaded image. Please try again.");
      setMedia(list => [d.media, ...list.filter(item => item.id !== d.media.id)]);
      setForm(f => ({ ...f, [target]: d.media.id }));
    } catch (e) {
      const message = e?.message || "Hero image upload failed. Please try again.";
      setHeroUploadError(message); onError(message);
    } finally { setUploading(false); }
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
    event.preventDefault();
    if (!form.title.trim()) { setHeroUploadError("Please enter a main headline before creating the slide."); return; }
    setHeroUploadError("");
    setSaving(true);
    const payload = {
      eyebrow: form.eyebrow || null, title: form.title.trim(), subtitle: form.subtitle || null,
      badge: form.badge || null, ctaText: form.ctaText || null,
      linkCategoryKey: form.linkCategoryKey || null, linkProductId: form.linkProductId || null,
      imageMediaId: form.imageMediaId || null, mobileImageMediaId: form.mobileImageMediaId || null,
      videoUrl: form.videoUrl.trim() || null, mobileVideoUrl: form.mobileVideoUrl.trim() || null,
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
  function sendPreviewDraft() {
    const frame = previewFrameRef.current;
    if (!frame?.contentWindow) return;
    const draftSlides = slides.map(slide => ({
      id: slide.id, eyebrow: slide.eyebrow || "", title: slide.title || "",
      sub: slide.subtitle || "", cta: slide.cta_text || "Shop now",
      badge: slide.badge || "", active: slide.active !== false,
      duration: Number(slide.duration_ms || 6500),
      image: selectedImage(slide.image_media_id) || slide.image_url || "",
      mobileImage: selectedImage(slide.mobile_image_media_id) || slide.mobile_image_url || "",
      video: slide.video_url || "", mobileVideo: slide.mobile_video_url || "",
      target: slide.link_product_id
        ? { view: "product", params: { id: slide.link_product_id } }
        : { view: "catalog", params: { category: slide.link_category_key || "iphone" } },
    }));
    frame.contentWindow.postMessage({
      type: "GO_IPHONE_ADMIN_PREVIEW",
      payload: { siteContent, heroSlides: draftSlides },
    }, new URL(PREVIEW_STOREFRONT_URL).origin);
  }
  useEffect(() => {
    if (previewMode) {
      const timer = window.setTimeout(sendPreviewDraft, 500);
      return () => window.clearTimeout(timer);
    }
  }, [previewMode, siteContent, slides, media]);
  useEffect(() => {
    if (activeTab !== "canvas") return;
    const timer = window.setTimeout(sendPreviewDraft, 450);
    return () => window.clearTimeout(timer);
  }, [activeTab, siteContent, slides, media]);
  useEffect(() => {
    if (!layoutDirty || loading) return;
    const timer = window.setTimeout(async () => {
      setSaving(true);
      try { await request("/site-content/homepageLayout", { method: "PUT", body: JSON.stringify(siteContent.homepageLayout) }); setLayoutDirty(false); }
      catch (e) { onError("Auto-save failed: " + e.message); }
      finally { setSaving(false); }
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [layoutDirty, loading, siteContent.homepageLayout, onError]);
  useEffect(() => {
    const receiveCanvasAction = event => {
      if (event.origin !== new URL(PREVIEW_STOREFRONT_URL).origin) return;
      if (event.data?.type === "GO_IPHONE_SELECT_SECTION") {
        setSelectedSectionId(event.data.sectionId || "");
      }
      if (event.data?.type === "GO_IPHONE_ADD_SECTION_AFTER") {
        openSectionPicker(event.data.afterId || "");
      }
      if (event.data?.type === "GO_IPHONE_REMOVE_SECTION") {
        removeHomepageSection(event.data.sectionId || "");
      }
      if (event.data?.type === "GO_IPHONE_REORDER_SECTION") {
        const { fromId, toId } = event.data;
        if (!fromId || !toId || fromId === toId) return;
        const items = [...siteContent.homepageLayout].sort((x,y)=>x.order-y.order);
        const from = items.findIndex(x=>x.id===fromId), to = items.findIndex(x=>x.id===toId);
        if (from < 0 || to < 0) return;
        const [moved] = items.splice(from,1);
        items.splice(to,0,moved);
        commitLayout(items.map((item,index)=>({...item,order:index})));
      }
    };
    window.addEventListener("message", receiveCanvasAction);
    return () => window.removeEventListener("message", receiveCanvasAction);
  }, [siteContent.homepageLayout, layoutHistory, historyIndex]);
  return <>
    <div className="page-heading"><div><div className="eyebrow">STORE EXPERIENCE</div><h1>Visual Store Editor</h1><p>Build and edit your storefront from one live workspace — sections, content and visual identity together.</p></div><div className="heading-actions"><button className="btn secondary" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={15}/> Refresh</button><button className="btn primary" onClick={startNew}><Plus size={15}/> Add hero slide</button></div></div>
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
      {[["canvas","Live canvas"],["overview","Hero & banners"],["categories","Category visuals"],["content","Content & trust"]].map(([id,label],index)=><button type="button" key={id} className={activeTab===id?"active":""} onClick={()=>{setActiveTab(id);if(id==="canvas")request("/collections").then(d=>setCollections(d.collections||[])).catch(e=>onError(e.message));}}><span>{String(index+1).padStart(2,"0")}</span>{label}</button>)}
    </nav>

    {activeTab === "canvas" && <section className="panel visual-canvas-panel">
      <div className="visual-canvas-toolbar"><div><span className="eyebrow">LIVE STOREFRONT / VISUAL EDITOR</span><h2>Click any section to edit it</h2><p>Choose a section in the storefront preview, or drag sections to reorder them.</p></div><div className="row-actions"><button type="button" className={canvasViewport==="desktop"?"btn primary small":"btn secondary small"} onClick={()=>setCanvasViewport("desktop")}><Monitor size={14}/> Desktop</button><button type="button" className={canvasViewport==="mobile"?"btn primary small":"btn secondary small"} onClick={()=>setCanvasViewport("mobile")}><Smartphone size={14}/> Mobile</button><button type="button" className="btn secondary small" onClick={undoLayout} disabled={historyIndex<=0} title="Undo"><ArrowLeft size={14}/> Undo</button><button type="button" className="btn secondary small" onClick={redoLayout} disabled={historyIndex<0||historyIndex>=layoutHistory.length-1} title="Redo"><ArrowRight size={14}/> Redo</button><button type="button" className="btn secondary small" onClick={()=>openSectionPicker("")}><Plus size={14}/> Add section</button><button type="button" className="btn secondary small" onClick={sendPreviewDraft}><RefreshCw size={14}/> Refresh preview</button><button type="button" className="btn primary small" disabled={saving} onClick={()=>saveSiteSection("homepageLayout",siteContent.homepageLayout).then(()=>setLayoutDirty(false))}>{saving?"Saving…":"Save changes"}</button></div></div>
      <div className="visual-canvas-stage">
        <div className="visual-canvas-frame"><div className="visual-canvas-scaled" style={{width:canvasViewport==="mobile"?408:"100%",maxWidth:canvasViewport==="mobile"?"none":"100%",margin:"0 auto",flexShrink:0}}><iframe ref={previewFrameRef} title="Live editable GO iPhone storefront" src={PREVIEW_STOREFRONT_URL} onLoad={sendPreviewDraft} style={{width:canvasViewport==="mobile"?408:"100%",maxWidth:canvasViewport==="mobile"?"none":"100%",flexShrink:0,height:"78vh",minHeight:620,border:canvasViewport==="mobile"?"9px solid #202938":"0",borderRadius:canvasViewport==="mobile"?30:10,background:"#fff",boxShadow:"0 12px 45px rgba(15,23,42,.12)"}} /></div></div>
        <aside className="visual-canvas-inspector">
          {(() => {
            const selected=siteContent.homepageLayout.find(x=>x.id===selectedSectionId);
            if(!selected) return <div className="visual-inspector-empty"><Sparkles size={22}/><b>Select a section</b><p>Click any block in the storefront preview to edit its content and appearance here.</p><button type="button" className="btn primary small" onClick={()=>openSectionPicker("")}><Plus size={14}/> Add section</button></div>;
            const field=(label,key,placeholder="")=><label>{label}<input value={selected[key]||""} placeholder={placeholder} onChange={e=>updateSelectedSection({[key]:e.target.value})}/></label>;
            return <div className="visual-inspector-fields">
              <div className="visual-inspector-heading"><div><span className="eyebrow">SELECTED SECTION</span><h3>{selected.label||selected.type||selected.id}</h3></div><button type="button" className="icon-btn" title="Clear selection" onClick={()=>setSelectedSectionId("")}><X size={16}/></button></div>
              <div className="inspector-section-meta">
                <span className="inspector-type-chip">{titleCase(selected.type||selected.id)}</span>
                <label className="homepage-toggle"><input type="checkbox" checked={selected.visible!==false} onChange={e=>updateSelectedSection({visible:e.target.checked})}/> Section visible</label>
              </div>
              {!(["tools","trust","collections","product-collection"].includes(selected.type||selected.id)) && <details className="inspector-group" open>
                <summary><span><b>Content</b><small>Names, headings and messaging</small></span><ChevronDown size={16}/></summary>
                <div className="inspector-group-body">
                  {field("Section name","label","Section name")}
                  {field("Eyebrow","eyebrow","Small overline")}
                  {field("Heading","title","Section heading")}
                  <label>Description<textarea rows="3" value={selected.description||""} onChange={e=>updateSelectedSection({description:e.target.value})}/></label>
                </div>
              </details>}
              {(selected.id==="categories" || selected.type==="categories") && (() => {
                const config=siteContent.shopCategoriesSection||{};
                const shown=categories.filter(c=>!c.parent_key&&!c.parentKey&&c.key!=="other-accessory"&&(c.key==="apple-accessory"||(!["accessories"].includes(String(c.key||"").toLowerCase())&&!/accessor(?:y|ies)/i.test(String(c.label||""))))); if(!shown.some(c=>c.key==="apple-accessory")) shown.push({key:"apple-accessory",label:"Apple Accessories"});
                const categoryOrder=Array.isArray(config.order)?config.order:[];
                const ordered=[...shown].sort((a,b)=>{const ai=categoryOrder.indexOf(a.key),bi=categoryOrder.indexOf(b.key);return (ai<0?999:ai)-(bi<0?999:bi);});
                const activeKey=shown.some(c=>c.key===liveCategoryKey)?liveCategoryKey:(shown[0]?.key||"");
                const cards=config.cards||{};
                const card=cards[activeKey]||{};
                const patch=next=>setSiteContent(current=>({...current,shopCategoriesSection:{...(current.shopCategoriesSection||{}),...next}}));
                const patchCard=next=>setSiteContent(current=>({...current,shopCategoriesSection:{...(current.shopCategoriesSection||{}),cards:{...(current.shopCategoriesSection?.cards||{}),[activeKey]:{...(current.shopCategoriesSection?.cards?.[activeKey]||{}),...next}}}}));
                const moveCategory=(key,direction)=>{const list=[...ordered];const index=list.findIndex(x=>x.key===key),target=index+direction;if(index<0||target<0||target>=list.length)return;[list[index],list[target]]=[list[target],list[index]];patch({order:list.map(x=>x.key)});};
                const uploadCategoryCard=async(file)=>{if(!file||!activeKey)return;setUploading(true);try{const dataUrl=await compressImage(file);const d=await request("/media",{method:"POST",body:JSON.stringify({dataUrl,fileName:file.name,usageTag:"shop-category"})});setMedia(list=>[d.media,...list]);patchCard({imageUrl:d.media.url});}catch(e){onError(e.message);}finally{setUploading(false);}};
                const save=()=>saveSiteSection("shopCategoriesSection",siteContent.shopCategoriesSection||{});
                return <div className="live-collection-inspector category-live-editor">
                  <div className="live-collection-inspector-title"><b>Shop by category · Full section control</b><small>Every setting below is connected to the actual storefront category grid. Changes appear in the live preview.</small></div>
                  <details className="inspector-group" open><summary><span><b>Section content</b><small>Heading and supporting copy</small></span><ChevronDown size={16}/></summary><div className="inspector-group-body">
                    <label>Eyebrow<input value={config.eyebrow??"EXPLORE"} onChange={e=>patch({eyebrow:e.target.value})}/></label>
                    <label>Heading<input value={config.title??"Shop by category"} onChange={e=>patch({title:e.target.value})}/></label>
                    <label>Description<textarea rows="2" value={config.description||""} onChange={e=>patch({description:e.target.value})}/></label>
                    <label>Section background<input type="color" value={config.backgroundColor||"#ffffff"} onChange={e=>patch({backgroundColor:e.target.value})}/></label>
                    <label>Text color<input type="color" value={config.textColor||"#20242b"} onChange={e=>patch({textColor:e.target.value})}/></label>
                  </div></details>
                  <details className="inspector-group" open><summary><span><b>Grid & card design</b><small>Responsive layout, dimensions and image treatment</small></span><ChevronDown size={16}/></summary><div className="inspector-group-body">
                    <label>Desktop columns <b>{config.columns??4}</b><input type="range" min="2" max="6" value={config.columns??4} onChange={e=>patch({columns:Number(e.target.value)})}/></label>
                    <label>Card height <b>{config.cardHeight??240}px</b><input type="range" min="140" max="420" step="10" value={config.cardHeight??240} onChange={e=>patch({cardHeight:Number(e.target.value)})}/></label>
                    <label>Grid gap <b>{config.gap??16}px</b><input type="range" min="4" max="36" value={config.gap??16} onChange={e=>patch({gap:Number(e.target.value)})}/></label>
                    <label>Card radius <b>{config.cardRadius??4}px</b><input type="range" min="0" max="36" value={config.cardRadius??4} onChange={e=>patch({cardRadius:Number(e.target.value)})}/></label>
                    <label>Section spacing <b>{config.paddingY??80}px</b><input type="range" min="16" max="160" value={config.paddingY??80} onChange={e=>patch({paddingY:Number(e.target.value)})}/></label>
                    <label>Image fit<select value={config.imageFit||"cover"} onChange={e=>patch({imageFit:e.target.value})}><option value="cover">Cover</option><option value="contain">Contain</option></select></label>
                    <label>Text placement<select value={config.textPlacement||"bottom"} onChange={e=>patch({textPlacement:e.target.value})}><option value="bottom">Bottom</option><option value="top">Top</option><option value="center">Center</option></select></label>
                    <label className="homepage-toggle"><input type="checkbox" checked={config.showOverlay!==false} onChange={e=>patch({showOverlay:e.target.checked})}/> Show image overlay</label>
                    <label>Overlay strength <b>{config.overlayOpacity??35}%</b><input type="range" min="0" max="85" value={config.overlayOpacity??35} onChange={e=>patch({overlayOpacity:Number(e.target.value)})}/></label>
                  </div></details>
                  <details className="inspector-group" open><summary><span><b>Category cards</b><small>Visibility, order, title and individual image for each card</small></span><ChevronDown size={16}/></summary><div className="inspector-group-body">
                    <label>Choose category<select value={activeKey} onChange={e=>setLiveCategoryKey(e.target.value)}>{ordered.map(item=><option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
                    <div className="live-collection-order">{ordered.map((item,index)=><div className={item.key===activeKey?"live-collection-order-row active":"live-collection-order-row"} key={item.key}><button type="button" className="text-btn" onClick={()=>setLiveCategoryKey(item.key)}>{index+1}. {cards[item.key]?.label||item.label} {cards[item.key]?.visible===false?"(Hidden)":""}</button><span className="live-collection-order-actions"><button type="button" className="icon-btn" disabled={!index} onClick={()=>moveCategory(item.key,-1)}>↑</button><button type="button" className="icon-btn" disabled={index===ordered.length-1} onClick={()=>moveCategory(item.key,1)}>↓</button></span></div>)}</div>
                    <label className="homepage-toggle"><input type="checkbox" checked={card.visible!==false} onChange={e=>patchCard({visible:e.target.checked})}/> Show this category</label>
                    <label>Card title<input value={card.label??shown.find(x=>x.key===activeKey)?.label??""} onChange={e=>patchCard({label:e.target.value})}/></label>
                    <label>Card width<select value={card.wide===false?"standard":"wide"} onChange={e=>patchCard({wide:e.target.value==="wide"})}><option value="wide">Wide card</option><option value="standard">Standard card</option></select></label>
                    <label>Card background<input type="color" value={card.backgroundColor||"#f5f3ef"} onChange={e=>patchCard({backgroundColor:e.target.value})}/></label>
                    <label>Card title color<input type="color" value={card.textColor||"#ffffff"} onChange={e=>patchCard({textColor:e.target.value})}/></label>
                    <label>Image fit<select value={card.imageFit||"inherit"} onChange={e=>patchCard({imageFit:e.target.value})}><option value="inherit">Use section setting</option><option value="cover">Cover</option><option value="contain">Contain</option></select></label>
                    <label>Image URL<input value={card.imageUrl||""} placeholder="Use category default image" onChange={e=>patchCard({imageUrl:e.target.value})}/></label>
                    <label className="btn secondary small upload-label">{uploading?"Uploading…":"Upload category image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e=>{uploadCategoryCard(e.target.files?.[0]);e.target.value="";}}/></label>
                    {card.imageUrl&&<img src={card.imageUrl} alt="" style={{width:"100%",height:110,objectFit:"cover",borderRadius:9}}/>}
                    <button type="button" className="btn secondary small" onClick={()=>patchCard({label:null,imageUrl:null})}>Reset card overrides</button>
                  </div></details>
                  <button type="button" className="btn primary small" disabled={saving} onClick={save}>{saving?"Saving…":"Save Shop by category design"}</button>
                </div>;
              })()}
              {(selected.type==="product-collection" || selected.id==="collections") && (() => {
                const builtIns=[{id:"featured",name:"Featured"},{id:"new-arrivals",name:"New Arrivals"},{id:"best-sellers",name:"Best Sellers"},{id:"certified-refurbished",name:"Certified Pre-Owned"}];
                const collectionItems=[...builtIns,...collections.filter(c=>!builtIns.some(b=>b.id===c.id))];
                const defaultOrder=new Map(collectionItems.map((item,index)=>[item.id,index]));
                const orderedItems=[...collectionItems].sort((a,b)=>
                  Number(siteContent.collectionDetails?.[a.id]?.homepageOrder ?? defaultOrder.get(a.id))-
                  Number(siteContent.collectionDetails?.[b.id]?.homepageOrder ?? defaultOrder.get(b.id))
                );
                const activeId=selected.collectionId || (collectionItems[0]?.id||"");
                const config=siteContent.collectionDetails?.[activeId]||{};
                const updateConfig=patch=>setSiteContent(current=>({...current,collectionDetails:{...(current.collectionDetails||{}),[activeId]:{...(current.collectionDetails?.[activeId]||{}),...patch}}}));
                const moveCollection=(id,direction)=>{
                  const index=orderedItems.findIndex(item=>item.id===id);
                  const target=index+direction;
                  if(index<0||target<0||target>=orderedItems.length)return;
                  const next=[...orderedItems];[next[index],next[target]]=[next[target],next[index]];
                  setSiteContent(current=>({...current,collectionDetails:{...(current.collectionDetails||{}),...Object.fromEntries(next.map((item,position)=>[item.id,{...(current.collectionDetails?.[item.id]||{}),homepageOrder:position}]))}}));
                };
                const saveConfig=async()=>{await saveSiteSection("collectionDetails",siteContent.collectionDetails||{});};
                return <div className="live-collection-inspector">
                  <div className="collection-section-editor-heading">
                    <span className="collection-section-editor-icon"><Sparkles size={18}/></span>
                    <div><b>{collectionItems.find(item=>item.id===activeId)?.name || config.name || activeId}</b><small>Independent collection section · Edit its design and product presentation below.</small></div>
                  </div>
                  {activeId==="certified-refurbished" && <details className="inspector-group" open><summary><span><b>Certified pre-owned · Full section design</b><small>All content and product presentation settings</small></span><ChevronDown size={16}/></summary><div className="inspector-group-body">
                    <label>Eyebrow<input value={config.eyebrow??"CERTIFIED PRE-OWNED"} onChange={e=>updateConfig({eyebrow:e.target.value})}/></label>
                    <label>Main headline<textarea rows="3" value={config.heroTitle??"Carefully checked. Clearly graded. Honestly priced."} onChange={e=>updateConfig({heroTitle:e.target.value})}/></label>
                    <label>Intro description<textarea rows="4" value={config.heroDescription??"Every unit is individually inspected — battery health, cosmetic condition, and storage are disclosed upfront, backed by a Go iPhone warranty."} onChange={e=>updateConfig({heroDescription:e.target.value})}/></label>
                    <label>Button text<input value={config.ctaText??"Browse certified pre-owned"} onChange={e=>updateConfig({ctaText:e.target.value})}/></label>
                    <label>Button destination<select value={config.ctaCategory||"iphone"} onChange={e=>updateConfig({ctaCategory:e.target.value})}>{categories.filter(x=>!x.parent_key&&!x.parentKey).map(x=><option key={x.key} value={x.key}>{x.label}</option>)}</select></label>
                    <label>Heading font<select value={config.headingFont||"inherit"} onChange={e=>updateConfig({headingFont:e.target.value})}><option value="inherit">Store default</option><option value="Inter, sans-serif">Inter</option><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="'Trebuchet MS', sans-serif">Trebuchet</option></select></label>
                    <label>Heading size <b>{config.headingSize??40}px</b><input type="range" min="24" max="64" value={config.headingSize??40} onChange={e=>updateConfig({headingSize:Number(e.target.value)})}/></label>
                    <label>Heading weight<select value={config.headingWeight||"700"} onChange={e=>updateConfig({headingWeight:e.target.value})}><option value="500">Medium</option><option value="600">Semi-bold</option><option value="700">Bold</option><option value="800">Extra bold</option></select></label>
                    <label>Products shown <b>{config.productLimit??8}</b><input type="range" min="2" max="24" value={config.productLimit??8} onChange={e=>updateConfig({productLimit:Number(e.target.value)})}/></label>
                    <label>Product layout<select value={config.productsLayout||"grid"} onChange={e=>updateConfig({productsLayout:e.target.value})}><option value="grid">Grid</option><option value="rail">Horizontal slider</option></select></label>
                    <label>Desktop product columns <b>{config.productColumns??2}</b><input type="range" min="2" max="5" value={config.productColumns??2} onChange={e=>updateConfig({productColumns:Number(e.target.value)})}/></label>
                    <label>Section background<input type="color" value={config.sectionBackground||"#f5f3ef"} onChange={e=>updateConfig({sectionBackground:e.target.value})}/></label>
                    <label>Heading and body color<input type="color" value={config.headingColor||"#20242b"} onChange={e=>updateConfig({headingColor:e.target.value,bodyColor:e.target.value})}/></label>
                    <label>Accent color<input type="color" value={config.accentColor||"#ad8642"} onChange={e=>updateConfig({accentColor:e.target.value})}/></label>
                    <label>Section spacing <b>{config.sectionPadding??80}px</b><input type="range" min="20" max="180" value={config.sectionPadding??80} onChange={e=>updateConfig({sectionPadding:Number(e.target.value)})}/></label>
                    <label>Product card radius <b>{config.cardRadius??16}px</b><input type="range" min="0" max="32" value={config.cardRadius??16} onChange={e=>updateConfig({cardRadius:Number(e.target.value)})}/></label>
                    <label>Intro column width<select value={config.introWidth||"narrow"} onChange={e=>updateConfig({introWidth:e.target.value})}><option value="narrow">Narrow</option><option value="balanced">Balanced</option><option value="wide">Wide</option></select></label>
                  </div></details>}
                  {activeId==="featured" && <details className="inspector-group" open><summary><span><b>Featured section design</b><small>Every control here updates the Featured storefront block</small></span><ChevronDown size={16}/></summary><div className="inspector-group-body">
                    <label>Featured product<select value={config.featuredProductId||""} onChange={e=>updateConfig({featuredProductId:e.target.value||null})}><option value="">Automatic (first Featured iPhone)</option>{products.map(product=><option key={product.id} value={product.id}>{product.name}</option>)}</select></label>
                    <small className="field-help">Choose exactly which product appears in the Featured section.</small>
                    <label>Eyebrow<input value={config.eyebrow??"Featured"} onChange={e=>updateConfig({eyebrow:e.target.value})}/></label>
                    <label>Featured headline<input value={config.featuredTitle||""} placeholder="Use product name" onChange={e=>updateConfig({featuredTitle:e.target.value})}/></label>
                    <label>Description<textarea rows="3" value={config.storeDescription||""} placeholder="Use product specifications" onChange={e=>updateConfig({storeDescription:e.target.value})}/></label>
                    <label>Button text<input value={config.ctaText||""} placeholder="View product" onChange={e=>updateConfig({ctaText:e.target.value})}/></label>
                    <label>Heading font<select value={config.headingFont||"inherit"} onChange={e=>updateConfig({headingFont:e.target.value})}><option value="inherit">Store default</option><option value="Inter, sans-serif">Inter</option><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option></select></label>
                    <label>Heading size <b>{config.headingSize??42}px</b><input type="range" min="24" max="64" value={config.headingSize??42} onChange={e=>updateConfig({headingSize:Number(e.target.value)})}/></label>
                    <label>Heading weight<select value={config.headingWeight||"700"} onChange={e=>updateConfig({headingWeight:e.target.value})}><option value="500">Medium</option><option value="600">Semi-bold</option><option value="700">Bold</option><option value="800">Extra bold</option></select></label>
                    <label>Image zoom <b>{config.featuredImageZoom??100}%</b><input type="range" min="70" max="180" value={config.featuredImageZoom??100} onChange={e=>updateConfig({featuredImageZoom:Number(e.target.value)})}/></label>
                    <label>Image horizontal position <b>{config.featuredImageX??50}%</b><input type="range" min="0" max="100" value={config.featuredImageX??50} onChange={e=>updateConfig({featuredImageX:Number(e.target.value)})}/></label>
                    <label>Image vertical position <b>{config.featuredImageY??50}%</b><input type="range" min="0" max="100" value={config.featuredImageY??50} onChange={e=>updateConfig({featuredImageY:Number(e.target.value)})}/></label>
                    <label>Section background<input type="color" value={config.sectionBackground||"#ffffff"} onChange={e=>updateConfig({sectionBackground:e.target.value})}/></label>
                    <label>Text color<input type="color" value={config.headingColor||"#20242b"} onChange={e=>updateConfig({headingColor:e.target.value})}/></label>
                    <label>Button accent<input type="color" value={config.accentColor||"#20242b"} onChange={e=>updateConfig({accentColor:e.target.value})}/></label>
                    <label>Section spacing <b>{config.sectionPadding??64}px</b><input type="range" min="20" max="160" value={config.sectionPadding??64} onChange={e=>updateConfig({sectionPadding:Number(e.target.value)})}/></label>
                  </div></details>}
                  {activeId!=="certified-refurbished" && activeId!=="featured" && <>
                    <label>Collection heading<input value={config.name||collectionItems.find(c=>c.id===activeId)?.name||""} onChange={e=>updateConfig({name:e.target.value})}/></label>
                    <label>Description<input value={config.storeDescription||""} onChange={e=>updateConfig({storeDescription:e.target.value})} placeholder="Short description"/></label>
                    <label>Font family<select value={config.headingFont||"inherit"} onChange={e=>updateConfig({headingFont:e.target.value})}><option value="inherit">Store default</option><option value="Inter, sans-serif">Inter</option><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="'Trebuchet MS', sans-serif">Trebuchet</option><option value="'Times New Roman', serif">Times New Roman</option></select></label>
                    <label>Font size <b>{config.headingSize||32}px</b><input type="range" min="20" max="56" value={config.headingSize||32} onChange={e=>updateConfig({headingSize:Number(e.target.value)})}/></label>
                    <label>Font weight<select value={config.headingWeight||"700"} onChange={e=>updateConfig({headingWeight:e.target.value})}><option value="500">Medium</option><option value="600">Semi-bold</option><option value="700">Bold</option><option value="800">Extra bold</option></select></label>
                    <label>Products layout<select value={config.productsLayout||"default"} onChange={e=>updateConfig({productsLayout:e.target.value})}><option value="default">Automatic</option><option value="grid">Grid</option><option value="rail">Slider</option></select></label>
                    <div className="visual-color-fields"><label>Background<input type="color" value={config.sectionBackground||"#ffffff"} onChange={e=>updateConfig({sectionBackground:e.target.value})}/></label><label>Heading color<input type="color" value={config.headingColor||"#20242b"} onChange={e=>updateConfig({headingColor:e.target.value})}/></label><label>Accent color<input type="color" value={config.accentColor||"#ad8642"} onChange={e=>updateConfig({accentColor:e.target.value})}/></label></div>
                    <label>Card radius <b>{config.cardRadius??16}px</b><input type="range" min="0" max="32" value={config.cardRadius??16} onChange={e=>updateConfig({cardRadius:Number(e.target.value)})}/></label>
                  </>}
                  <button type="button" className="btn primary small" disabled={saving} onClick={saveConfig}>{saving?"Saving…":"Save collection design"}</button>
                </div>;
              })()}
              {(selected.id==="tools" || selected.type==="tools") && (() => {
                const tools=siteContent.toolsSection||{};
                const cards=[{key:"recommendationSection",label:"Find your perfect device",fallback:{title:"Find your perfect device",description:"Answer a few questions and discover the right device for you.",cta:"Get a recommendation",visible:true}},{key:"comparisonSection",label:"Compare devices",fallback:{title:"Compare devices",description:"See the differences side by side before you decide.",cta:"Compare now",visible:true}}];
                const patchTools=patch=>setSiteContent(current=>({...current,toolsSection:{...(current.toolsSection||{}),...patch}}));
                const patchCard=(key,patch)=>setSiteContent(current=>({...current,[key]:{...(current[key]||{}),...patch}}));
                return <div className="live-collection-inspector">
                  <div className="live-collection-inspector-title"><b>Tools section — every element</b><small>Edit the section heading, each tool card, its image, text, button and visibility.</small></div>
                  <label className="homepage-toggle"><input type="checkbox" checked={tools.visible!==false} onChange={e=>patchTools({visible:e.target.checked})}/> Show entire Tools section</label>
                  <label>Small heading<input value={tools.eyebrow||"Tools"} onChange={e=>patchTools({eyebrow:e.target.value})}/></label>
                  <label>Main heading<input value={tools.title||"Not sure which to choose?"} onChange={e=>patchTools({title:e.target.value})}/></label>
                  <label>Section background<input type="color" value={tools.backgroundColor||"#ffffff"} onChange={e=>patchTools({backgroundColor:e.target.value})}/></label>
                  <label>Section top/bottom spacing <b>{tools.paddingY??96}px</b><input type="range" min="24" max="180" value={tools.paddingY??96} onChange={e=>patchTools({paddingY:Number(e.target.value)})}/></label>
                  {cards.map(card=>{const data={...card.fallback,...(siteContent[card.key]||{})};return <div className="panel homepage-content-card" key={card.key}>
                    <div className="panel-head"><div><b>{card.label}</b><small>Individual card settings</small></div><label className="homepage-toggle"><input type="checkbox" checked={data.visible!==false} onChange={e=>patchCard(card.key,{visible:e.target.checked})}/> Visible</label></div>
                    <label>Card eyebrow<input value={data.eyebrow|| (card.key==="recommendationSection"?"Guided shopping":"Side by side")} onChange={e=>patchCard(card.key,{eyebrow:e.target.value})}/></label>
                    <label>Card title<input value={data.title||""} onChange={e=>patchCard(card.key,{title:e.target.value})}/></label>
                    <label>Card description<textarea rows="3" value={data.description||""} onChange={e=>patchCard(card.key,{description:e.target.value})}/></label>
                    <label>Button text<input value={data.cta||""} onChange={e=>patchCard(card.key,{cta:e.target.value})}/></label>
                    <label>Card image URL<input value={data.image||""} onChange={e=>patchCard(card.key,{image:e.target.value})} placeholder="https://…"/></label>
                    <label>Upload card image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e=>{uploadToolCardImage(e.target.files?.[0],card.key);e.target.value="";}}/></label>
                    {data.image&&<img src={data.image} alt="" style={{width:"100%",maxHeight:130,objectFit:"cover",borderRadius:10}}/>}
                    <button type="button" className="btn secondary small" disabled={saving} onClick={()=>saveSiteSection(card.key,siteContent[card.key]||card.fallback)}>Save this card</button>
                  </div>})}
                  <button type="button" className="btn primary small" disabled={saving} onClick={()=>saveSiteSection("toolsSection",siteContent.toolsSection||{})}>{saving?"Saving…":"Save Tools section settings"}</button>
                </div>;
              })()}
              {(selected.id==="trust" || selected.type==="trust") && (() => {
                const trust=siteContent.trustSection||{points:[]};
                const points=Array.isArray(trust.points)?trust.points:[];
                const patchTrust=patch=>setSiteContent(current=>({...current,trustSection:{...(current.trustSection||{}),...patch}}));
                const patchPoint=(index,patch)=>patchTrust({points:points.map((point,i)=>i===index?{...point,...patch}:point)});
                const movePoint=(index,direction)=>{const next=[...points],to=index+direction;if(to<0||to>=next.length)return;[next[index],next[to]]=[next[to],next[index]];patchTrust({points:next});};
                const addPoint=()=>patchTrust({points:[...points,{id:"trust-"+Date.now(),title:"New benefit",desc:"Describe this benefit to your customers.",visible:true}]});
                const removePoint=index=>patchTrust({points:points.filter((_,i)=>i!==index)});
                return <div className="live-collection-inspector">
                  <div className="live-collection-inspector-title"><b>Trust section — every point</b><small>Edit, add, remove, reorder and show/hide each trust item independently.</small></div>
                  <label className="homepage-toggle"><input type="checkbox" checked={trust.visible!==false} onChange={e=>patchTrust({visible:e.target.checked})}/> Show entire Trust section</label>
                  <label>Section background<input type="color" value={trust.backgroundColor||"#ffffff"} onChange={e=>patchTrust({backgroundColor:e.target.value})}/></label>
                  <label>Text color<input type="color" value={trust.textColor||"#20242b"} onChange={e=>patchTrust({textColor:e.target.value})}/></label>
                  <label>Top/bottom spacing <b>{trust.paddingY??80}px</b><input type="range" min="20" max="180" value={trust.paddingY??80} onChange={e=>patchTrust({paddingY:Number(e.target.value)})}/></label>
                  {points.map((point,index)=><div className="panel homepage-content-card" key={point.id||index}>
                    <div className="panel-head"><div><b>Trust point {index+1}</b><small>{point.id||"Custom item"}</small></div><label className="homepage-toggle"><input type="checkbox" checked={point.visible!==false} onChange={e=>patchPoint(index,{visible:e.target.checked})}/> Visible</label></div>
                    <label>Title<input value={point.title||""} onChange={e=>patchPoint(index,{title:e.target.value})}/></label>
                    <label>Description<textarea rows="3" value={point.desc||""} onChange={e=>patchPoint(index,{desc:e.target.value})}/></label>
                    <label>Icon / image URL<input value={point.image||""} onChange={e=>patchPoint(index,{image:e.target.value})} placeholder="Optional image URL"/></label>
                    <label>Upload icon or image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e=>{uploadTrustImage(e.target.files?.[0],index);e.target.value="";}}/></label>
                    {point.image&&<img src={point.image} alt="" style={{width:54,height:54,objectFit:"contain"}}/>}
                    <div className="row-actions"><button type="button" className="btn secondary small" disabled={index===0} onClick={()=>movePoint(index,-1)}>Move up</button><button type="button" className="btn secondary small" disabled={index===points.length-1} onClick={()=>movePoint(index,1)}>Move down</button><button type="button" className="btn danger small" onClick={()=>removePoint(index)}>Delete point</button></div>
                  </div>)}
                  <button type="button" className="btn secondary small" onClick={addPoint}><Plus size={14}/> Add trust point</button>
                  <button type="button" className="btn primary small" disabled={saving} onClick={()=>saveSiteSection("trustSection",siteContent.trustSection||{})}>{saving?"Saving…":"Save Trust section"}</button>
                </div>;
              })()}
              {!(["tools","trust","collections"].includes(selected.type||selected.id)) && <details className="inspector-group">
                <summary><span><b>Buttons & destination</b><small>Actions and where customers go</small></span><ChevronDown size={16}/></summary>
                <div className="inspector-group-body">
                  {field("Button text","ctaText","Explore now")}
                  {field("Button URL","buttonUrl","/catalog")}
                  {field("Category destination","linkCategoryKey","iphone")}
                </div>
              </details>}
              {!(["tools","trust","collections"].includes(selected.type||selected.id)) && <details className="inspector-group">
                <summary><span><b>Layout & appearance</b><small>Images, spacing, colors and structure</small></span><ChevronDown size={16}/></summary>
                <div className="inspector-group-body">
                  {field("Image URL","imageUrl","https://…")}
                  <label className="btn secondary small upload-label">{uploading?"Uploading…":"Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e=>{uploadSectionImage(e.target.files?.[0]);e.target.value="";}}/></label>
                  <label>Layout<select value={selected.layout||"grid"} onChange={e=>updateSelectedSection({layout:e.target.value})}><option value="grid">Grid</option><option value="centered">Centered</option><option value="split">Split</option><option value="rail">Horizontal rail</option></select></label>
                  <label>Image position<select value={selected.imagePosition||"left"} onChange={e=>updateSelectedSection({imagePosition:e.target.value})}><option value="left">Left</option><option value="right">Right</option></select></label>
                  <label>Columns<input type="number" min="1" max="4" value={selected.columns||3} onChange={e=>updateSelectedSection({columns:Math.max(1,Math.min(4,Number(e.target.value)||1))})}/></label>
                  <label>Section spacing<input type="number" min="0" max="180" value={selected.paddingY??64} onChange={e=>updateSelectedSection({paddingY:Math.max(0,Math.min(180,Number(e.target.value)||0))})}/></label>
                  <div className="visual-color-fields"><label>Background<input type="color" value={selected.backgroundColor||"#f5f3ef"} onChange={e=>updateSelectedSection({backgroundColor:e.target.value})}/></label><label>Text<input type="color" value={selected.textColor||"#20242b"} onChange={e=>updateSelectedSection({textColor:e.target.value})}/></label></div>
                </div>
              </details>}
              <div className="inspector-danger-zone"><div><b>Section actions</b><small>Duplicate or remove this section from the homepage.</small></div><div className="row-actions"><button type="button" className="btn secondary small" onClick={()=>duplicateHomepageSection(selected)}>Duplicate</button><button type="button" className="btn danger small" onClick={()=>removeHomepageSection(selected.id)}>Remove</button></div></div>
            </div>;
          })()}
        </aside>
      </div>
      <div className="visual-canvas-footnote"><span><i/> Live draft preview</span><span>Click to select · Drag to reorder · Changes auto-save to your live store</span></div>
      <LiveBrandAndFooterEditor onError={onError} previewFrameRef={previewFrameRef}/>
    </section>}
    {showSectionPicker && <div className="modal-backdrop" onClick={()=>setShowSectionPicker(false)}>
      <div className="editor-modal section-picker-modal" onClick={e=>e.stopPropagation()} style={{width:"min(820px,96vw)",maxHeight:"88vh",overflow:"auto"}}>
        <div className="modal-head"><div><div className="eyebrow">LIVE STORE BUILDER</div><h2>Choose a section to add</h2><p className="muted">Pick a ready-made layout. You can customize its text, images, colors and spacing after adding it.</p></div><button type="button" className="icon-btn" onClick={()=>setShowSectionPicker(false)}><X size={18}/></button></div>
        {["Store essentials","Content & marketing"].map(group=><div key={group} style={{marginTop:18}}><h3 style={{marginBottom:10}}>{group}</h3><div className="section-picker-grid">{sectionPresets.filter(p=>p.group===group).map(p=><button type="button" key={p.type} className="section-picker-option" onClick={()=>addHomepageSection(p.type,addSectionAfterId)}><span className="section-picker-icon"><Plus size={18}/></span><b>{p.label}</b><small>{p.type==="hero"?"Large visual introduction":p.type==="categories"?"Show shopping departments":p.type==="collections"?"Highlight product groups":p.type==="tools"?"Comparison and recommendation tools":p.type==="trust"?"Warranty, delivery and reassurance":p.type==="announcement"?"Short promotional message":p.type==="image-text"?"Editorial image and copy":p.type==="promo-banners"?"Multiple campaign cards":p.type==="featured-product"?"Spotlight one product":p.type==="testimonials"?"Customer reviews and quotes":"Flexible text and call to action"}</small></button>)}</div></div>)}
      </div>
    </div>}
    {previewMode && <div className="modal-backdrop" onClick={() => setPreviewMode("")}>
      <div className="editor-modal" onClick={e => e.stopPropagation()} style={{ width: "min(1500px,98vw)", height: "94vh", maxHeight: "94vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="modal-head" style={{ flexShrink: 0 }}>
          <div><div className="eyebrow">REAL STOREFRONT PREVIEW</div><h2>Unpublished draft · {previewMode === "mobile" ? "Mobile" : "Desktop"}</h2></div>
          <div className="row-actions">
            <button type="button" className="btn secondary small" onClick={() => setPreviewMode("desktop")}>Desktop</button>
            <button type="button" className="btn secondary small" onClick={() => setPreviewMode("mobile")}>Mobile</button>
            <button type="button" className="icon-btn" onClick={() => setPreviewMode("")}><X size={18}/></button>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center", overflow: "auto", background: "#e5e7eb", padding: 12 }}>
          <iframe ref={previewFrameRef} title="GO iPhone real storefront preview" src={PREVIEW_STOREFRONT_URL} onLoad={sendPreviewDraft} style={{ width: previewMode === "mobile" ? 390 : "100%", maxWidth: "100%", height: "100%", minHeight: 500, border: previewMode === "mobile" ? "8px solid #202938" : "0", borderRadius: previewMode === "mobile" ? 28 : 8, background: "#fff" }} />
        </div>
        <p className="muted" style={{ padding: "8px 14px", margin: 0, flexShrink: 0 }}>This is the actual storefront with your unsaved draft applied. Preview mode blocks checkout and reservation submissions and does not publish changes.</p>
      </div>
    </div>}
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
        <div className="hero-slide-preview">{slide.video_url ? <video src={slide.video_url} muted playsInline preload="metadata"/> : slide.image_url ? <img src={slide.image_url} alt=""/> : <div className="hero-preview-empty"><Image size={27}/><span>No desktop media</span></div>}<span className={slide.active ? "hero-state active" : "hero-state"}>{slide.active ? "LIVE" : "HIDDEN"}</span><span className="hero-order">#{index + 1}</span></div>
        <div className="hero-slide-info"><div className="eyebrow">{slide.eyebrow || "GO IPHONE"}</div><h3>{slide.title}</h3><p>{slide.subtitle || "No supporting text added."}</p><div className="hero-slide-meta"><span>{slide.cta_text || "No CTA"}</span><span>{Math.round(Number(slide.duration_ms || 6500) / 100) / 10}s duration</span><span>{slide.mobile_image_url ? "Mobile image set" : "No mobile image"}</span></div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          <label style={{ display: "grid", gap: 4, fontSize: 11 }}>Banner starts<input type="datetime-local" value={siteContent.heroSlideSchedules?.[slide.id]?.publishAt ? new Date(siteContent.heroSlideSchedules[slide.id].publishAt).toISOString().slice(0,16) : ""} onChange={e => setSiteContent(current => ({ ...current, heroSlideSchedules: { ...(current.heroSlideSchedules || {}), [slide.id]: { ...(current.heroSlideSchedules?.[slide.id] || {}), publishAt: e.target.value ? new Date(e.target.value).toISOString() : null } } }))}/></label>
          <label style={{ display: "grid", gap: 4, fontSize: 11 }}>Banner ends<input type="datetime-local" value={siteContent.heroSlideSchedules?.[slide.id]?.unpublishAt ? new Date(siteContent.heroSlideSchedules[slide.id].unpublishAt).toISOString().slice(0,16) : ""} onChange={e => setSiteContent(current => ({ ...current, heroSlideSchedules: { ...(current.heroSlideSchedules || {}), [slide.id]: { ...(current.heroSlideSchedules?.[slide.id] || {}), unpublishAt: e.target.value ? new Date(e.target.value).toISOString() : null } } }))}/></label>
          <button type="button" className="btn secondary small" onClick={() => saveSiteSection("heroSlideSchedules", siteContent.heroSlideSchedules || {})}>Save banner schedule</button>
        </div></div>
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
        <div className="homepage-image-field field-wide"><div><b>Desktop video (optional)</b><span>Paste a direct MP4 or WebM URL. Video takes priority over the desktop image.</span></div><input type="url" value={form.videoUrl} onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))} placeholder="https://cdn.example.com/hero.mp4"/></div>
        <div className="homepage-image-field field-wide"><div><b>Mobile video (optional)</b><span>Optional smaller video for phones. Leave blank to reuse the desktop video.</span></div><input type="url" value={form.mobileVideoUrl} onChange={e => setForm(f => ({ ...f, mobileVideoUrl: e.target.value }))} placeholder="https://cdn.example.com/hero-mobile.mp4"/></div>
        {["imageMediaId","mobileImageMediaId"].map((key, i) => <div className="homepage-image-field" key={key}><div><b>{i ? "Mobile banner" : "Desktop banner"}</b><span>{i ? "Optional image optimized for phones." : "Recommended wide landscape image."}</span></div>{selectedImage(form[key]) ? <img src={selectedImage(form[key])} alt={i ? "Mobile banner" : "Desktop banner"}/> : <div className="homepage-image-empty"><Image size={20}/><span>No image selected</span></div>}<div className="homepage-image-buttons"><label className="btn secondary small upload-label">{uploading ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e => { upload(e.target.files?.[0], key); e.target.value = ""; }}/></label><button type="button" className="btn secondary small" onClick={() => { setMediaTarget(key); setHeroMediaOpen(true); }}>Choose from library</button>{form[key] && <button type="button" className="text-btn danger-text" onClick={() => setForm(f => ({ ...f, [key]: "" }))}>Remove</button>}</div></div>)}
      </div>
      {heroUploadError && <div className="alert error" role="alert"><AlertTriangle size={16}/>{heroUploadError}</div>}
      <div className="modal-foot"><button type="button" className="btn secondary" onClick={() => setEditing(null)}>Cancel</button><button className="btn primary" disabled={saving || uploading}>{saving ? "Saving…" : uploading ? "Uploading image…" : editing === "new" ? "Create slide" : "Save changes"}</button></div>
    </form></div>}
    {heroMediaOpen && <div className="media-picker-backdrop"><div className="media-picker"><div className="modal-head"><div><div className="eyebrow">MEDIA LIBRARY</div><h2>Choose hero image</h2></div><button type="button" className="icon-btn" onClick={() => setHeroMediaOpen(false)}><X size={18}/></button></div>{media.length ? <div className="media-picker-grid">{media.filter(m => m.usage_tag !== "video").map(m => <button type="button" key={m.id} className={form[mediaTarget] === m.id ? "media-choice selected" : "media-choice"} onClick={() => { setForm(f => ({ ...f, [mediaTarget]: m.id })); setHeroMediaOpen(false); setMediaTarget(""); setHeroUploadError(""); }}><img src={m.url} alt={m.file_name || "Store media"}/><span>{m.file_name || "Image"}</span><small>{m.usage_tag || "Image"}</small></button>)}</div> : <p className="muted">No images uploaded yet. Upload an image to get started.</p>}<div className="modal-foot"><button type="button" className="btn secondary" onClick={() => setHeroMediaOpen(false)}>Done</button></div></div></div>}
  </>;
}


function StoreCategoriesManager({ onError }) {
  const [categories,setCategories]=useState([]);
  const [products,setProducts]=useState([]);
  const [selectedKey,setSelectedKey]=useState("");
  const [pickerOpen,setPickerOpen]=useState(false);
  const [query,setQuery]=useState("");
  const [savingId,setSavingId]=useState("");
  const [loading,setLoading]=useState(true);
  const [refresh,setRefresh]=useState(0);
  const [creating,setCreating]=useState(false);
  const [newLabel,setNewLabel]=useState("");
  const [parentKey,setParentKey]=useState("");
  const [creatingBusy,setCreatingBusy]=useState(false);
  const [editingCategory,setEditingCategory]=useState(false);
  const [editLabel,setEditLabel]=useState("");
  const [editParentKey,setEditParentKey]=useState("");
  const [editBusy,setEditBusy]=useState(false);
  const selected=categories.find(c=>c.key===selectedKey);
  const label=c=>c.name||c.label||c.title||titleCase(c.key);
  const roots=categories.filter(c=>!c.parent_key);
  const childrenOf=key=>categories.filter(c=>c.parent_key===key);
  const load=useCallback(async()=>{setLoading(true);try{const [a,b]=await Promise.all([request("/categories"),request("/products")]);setCategories(a.categories||[]);setProducts(b.products||[]);}catch(e){onError(e.message);}finally{setLoading(false);}},[onError]);
  useEffect(()=>{load();},[load,refresh]);
  const assigned=products.filter(p=>p.category_key===selectedKey);
  const candidates=products.filter(p=>p.category_key!==selectedKey&&(!query.trim()||[p.name,p.category_key].some(v=>String(v||"").toLowerCase().includes(query.toLowerCase()))));
  async function move(p,key){setSavingId(p.id);try{await request("/products/"+encodeURIComponent(p.id),{method:"PATCH",body:JSON.stringify({categoryKey:key})});setProducts(list=>list.map(x=>x.id===p.id?{...x,category_key:key}:x));}catch(e){onError(e.message);}finally{setSavingId("");}}
  async function createCategory(event){
    event.preventDefault();
    const labelText=newLabel.trim();
    const key=labelText.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || `category-${Date.now()}`;
    setCreatingBusy(true);
    try{
      await request("/categories",{method:"POST",body:JSON.stringify({key,label:labelText,parentKey:parentKey||null})});
      setNewLabel("");setParentKey("");setCreating(false);setRefresh(v=>v+1);
    }catch(e){onError(e.message);}
    finally{setCreatingBusy(false);}
  }
  function openCategoryEdit(){
    if(!selected)return;
    setEditLabel(label(selected));
    setEditParentKey(selected.parent_key||"");
    setEditingCategory(true);
  }
  async function saveCategoryEdit(event){
    event.preventDefault();
    if(!selected)return;
    setEditBusy(true);
    try{
      await request("/categories/"+encodeURIComponent(selected.key),{method:"PATCH",body:JSON.stringify({label:editLabel.trim(),parentKey:editParentKey||null})});
      setEditingCategory(false);setRefresh(v=>v+1);
    }catch(e){onError(e.message);}
    finally{setEditBusy(false);}
  }
  async function deleteCategory(){
    if(!selected)return;
    if(!window.confirm("Delete "+label(selected)+"? Categories with products or subcategories cannot be deleted."))return;
    try{
      await request("/categories/"+encodeURIComponent(selected.key),{method:"DELETE"});
      setSelectedKey("");setRefresh(v=>v+1);
    }catch(e){onError(e.message);}
  }
  const productCount=key=>products.filter(p=>p.category_key===key).length;
  const totalBranches=roots.reduce((n,c)=>n+childrenOf(c.key).length,0);
  return <>
    <div className="page-heading store-categories-heading">
      <div><div className="eyebrow">STORE EXPERIENCE / CATALOG STRUCTURE</div><h1>Store Categories</h1><p>Organize your storefront into clear departments and branches.</p></div>
      <div className="heading-actions"><button className="btn secondary" onClick={()=>setRefresh(v=>v+1)}><RefreshCw size={15}/> Refresh</button><button className="btn primary" onClick={()=>{setParentKey(selected?.key||"");setCreating(true);}}><Plus size={15}/> Add Category</button></div>
    </div>
    {!selected ? <>
      <section className="store-category-overview">
        <div className="store-category-stat"><span>MAIN DEPARTMENTS</span><strong>{roots.length}</strong><small>Top-level categories</small></div>
        <div className="store-category-stat"><span>SUBCATEGORIES</span><strong>{totalBranches}</strong><small>Organized branches</small></div>
        <div className="store-category-stat"><span>CATALOG PRODUCTS</span><strong>{products.length}</strong><small>Across all categories</small></div>
      </section>
      <section className="store-category-library">
        <div className="store-category-section-head"><div><div className="eyebrow">YOUR STOREFRONT</div><h2>Departments</h2><p>Select a department to manage its branches and products.</p></div><span className="store-category-count">{roots.length} departments</span></div>
        {loading?<div className="loading-panel">Loading categories…</div>:roots.length===0?<div className="store-category-empty"><Package size={28}/><b>No departments yet</b><span>Create your first main category to get started.</span></div>:<div className="store-category-grid">
          {roots.map((c,index)=><article className="store-category-card" key={c.key}>
            <button type="button" className="store-category-main" onClick={()=>setSelectedKey(c.key)}>
              <div className="store-category-main-copy"><div className="eyebrow">MAIN DEPARTMENT <span className="store-category-heading-rule"/></div><h3>{label(c)}</h3><p>{productCount(c.key)} products <i/> {childrenOf(c.key).length} branches</p></div>
              <span className="store-category-open"><ArrowRight size={17}/></span>
            </button>
            <div className="store-category-branches">
              <div className="store-category-branches-head"><span>BRANCHES</span><button type="button" onClick={()=>{setParentKey(c.key);setCreating(true);}}><Plus size={13}/> Add branch</button></div>
              {childrenOf(c.key).length?childrenOf(c.key).map(child=><button type="button" className="store-category-branch" key={child.key} onClick={()=>setSelectedKey(child.key)}><span className="store-category-branch-dot"/><span>{label(child)}</span><small>{productCount(child.key)} products</small><ChevronRight size={15}/></button>):<div className="store-category-no-branches">No branches added yet</div>}
            </div>
          </article>)}
        </div>}
      </section>
    </>:<>
      <div className="store-category-detail-top"><div><button className="text-btn" onClick={()=>{setSelectedKey(selected.parent_key||"");setPickerOpen(false);}}><ArrowLeft size={15}/> {selected.parent_key?label(categories.find(c=>c.key===selected.parent_key)||{key:""}):"All departments"}</button><div className="eyebrow">CATEGORY WORKSPACE</div><h1>{label(selected)}</h1><p>Manage products and subcategories in this department.</p></div><div className="store-category-detail-actions"><div className="store-category-stat compact"><span>ASSIGNED PRODUCTS</span><strong>{assigned.length}</strong></div><button className="btn secondary" onClick={openCategoryEdit}><Pencil size={14}/> Edit category</button><button className="btn secondary" onClick={deleteCategory}>Delete</button><button className="btn primary" onClick={()=>setPickerOpen(true)}><Plus size={15}/> Move products here</button></div></div>
      {childrenOf(selectedKey).length>0&&<section className="store-category-library store-category-subpanel"><div className="store-category-section-head"><div><div className="eyebrow">NESTED STRUCTURE</div><h2>Subcategories</h2><p>Open a branch to view and manage its products.</p></div><span className="store-category-count">{childrenOf(selectedKey).length} branches</span></div><div className="store-category-subgrid">{childrenOf(selectedKey).map(child=><button className="store-category-subcard" key={child.key} onClick={()=>setSelectedKey(child.key)}><span className="store-category-branch-dot"/><span><b>{label(child)}</b><small>{productCount(child.key)} products</small></span><ChevronRight size={17}/></button>)}</div></section>}
      <section className="panel collection-products-panel store-category-products"><div className="panel-head"><div><h2>Products <span>({assigned.length})</span></h2><p>Products currently assigned to this category.</p></div></div>{assigned.length===0?<div className="store-category-empty"><Package size={26}/><b>No products in this category</b><span>Move existing products here to organize your catalog.</span></div>:<div className="collection-assigned-grid">{assigned.map(p=><article className="collection-assigned-product" key={p.id}>{p.image_url?<img src={p.image_url} alt=""/>:<div className="product-avatar"><Smartphone size={20}/></div>}<div><b>{p.name}</b><small>{titleCase(p.product_type)}</small></div><select value={p.category_key} disabled={savingId===p.id} onChange={e=>move(p,e.target.value)}>{categories.map(c=><option key={c.key} value={c.key}>{c.parent_key?"↳ ":""}{label(c)}</option>)}</select></article>)}</div>}</section>
      {pickerOpen&&<div className="modal-backdrop collection-picker-backdrop"><section className="editor-modal collection-picker-modal"><div className="modal-head"><div><h2>Move products to {label(selected)}</h2><p>Choose products to add to this category.</p></div><button className="icon-btn" onClick={()=>setPickerOpen(false)}><X size={19}/></button></div><div className="collection-picker-search"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products…"/></div><div className="collection-picker-list">{candidates.map(p=><article className="collection-picker-product" key={p.id}><div><b>{p.name}</b><small>Currently: {titleCase(p.category_key)}</small></div><button className="btn secondary small" disabled={savingId===p.id} onClick={()=>move(p,selectedKey)}>{savingId===p.id?"Moving…":"Move here"}</button></article>)}</div><div className="modal-foot"><button className="btn primary" onClick={()=>setPickerOpen(false)}>Done</button></div></section></div>}
    </>}
    {editingCategory&&selected&&<div className="modal-backdrop"><form className="editor-modal" onSubmit={saveCategoryEdit}><div className="modal-head"><div><div className="eyebrow">STORE CATALOG</div><h2>Edit category</h2></div><button type="button" className="icon-btn" onClick={()=>setEditingCategory(false)}><X size={19}/></button></div><div className="editor-grid"><label className="field-wide">Category name<input required minLength={2} maxLength={80} value={editLabel} onChange={e=>setEditLabel(e.target.value)}/></label><label className="field-wide">Parent category<select value={editParentKey} onChange={e=>setEditParentKey(e.target.value)}><option value="">Main category (no parent)</option>{roots.filter(c=>c.key!==selected.key).map(c=><option key={c.key} value={c.key}>{label(c)}</option>)}</select></label></div><div className="modal-foot"><button type="button" className="btn secondary" onClick={()=>setEditingCategory(false)}>Cancel</button><button className="btn primary" disabled={editBusy||!editLabel.trim()}>{editBusy?"Saving…":"Save category"}</button></div></form></div>}
    {creating&&<div className="modal-backdrop"><form className="editor-modal" onSubmit={createCategory}><div className="modal-head"><div><div className="eyebrow">STORE CATALOG</div><h2>Add store category</h2><p>Create a main department or add a branch to an existing one.</p></div><button type="button" className="icon-btn" onClick={()=>setCreating(false)}><X size={19}/></button></div><div className="editor-grid"><label className="field-wide">Category name<input required minLength={2} maxLength={80} autoFocus value={newLabel} onChange={e=>setNewLabel(e.target.value)} placeholder="e.g. Speakers"/></label><label className="field-wide">Parent category<select value={parentKey} onChange={e=>setParentKey(e.target.value)}><option value="">Main category (no parent)</option>{roots.map(c=><option key={c.key} value={c.key}>{label(c)}</option>)}</select><small className="field-hint">Choose a parent to create a nested branch.</small></label></div><div className="modal-foot"><button type="button" className="btn secondary" onClick={()=>setCreating(false)}>Cancel</button><button className="btn primary" disabled={creatingBusy||!newLabel.trim()}>{creatingBusy?"Creating…":"Create category"}</button></div></form></div>}
  </>;
}

function CollectionsManager({ onError }) {
  const [activeArea, setActiveArea] = useState("categories");
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [assigned, setAssigned] = useState([]);
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [productQuery, setProductQuery] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: "", name: "", description: "" });
  const selected = items.find(item => item.id === selectedId);
  const visibleItems = items.filter(item => {
    const matchesQuery = !query.trim() || [item.name, item.id, item.description].some(value => String(value || "").toLowerCase().includes(query.trim().toLowerCase()));
    return matchesQuery;
  });
  const filteredProducts = products.filter(p => !productQuery.trim() || [p.name,p.category_key,p.product_type].some(v => String(v || "").toLowerCase().includes(productQuery.toLowerCase())));
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [collectionData, contentData, productData] = await Promise.all([request("/collections"), request("/site-content"), request("/products")]);
      setItems(collectionData.collections || []);
      setDetails(contentData.siteContent?.collectionDetails || {});
      setProducts(productData.products || []);
    } catch (e) { onError(e.message); }
    finally { setLoading(false); }
  }, [onError]);
  useEffect(() => { load(); }, [load, refresh]);
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    setProductsLoading(true);
    Promise.all([request("/collections/" + encodeURIComponent(selectedId) + "/products"), request("/site-content")])
      .then(([d, content]) => {
        if (!active) return;
        setAssigned((d.products || []).map(p => p.id));
        setDetails(content.siteContent?.collectionDetails || {});
      })
      .catch(e => onError(e.message))
      .finally(() => { if (active) setProductsLoading(false); });
    return () => { active = false; };
  }, [selectedId, refresh, onError]);
  function startNew() { setForm({ id: "", name: "", description: "" }); setEditing("new"); }
  function startEdit(item) { setForm({ id: item.id, name: item.name || "", description: item.description || "" }); setEditing(item.id); }
  async function save(event) {
    event.preventDefault(); setSaving(true);
    try {
      if (editing === "new") {
        await request("/collections", { method: "POST", body: JSON.stringify({ id: form.id.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, ""), name: form.name.trim(), description: form.description.trim() || null }) });
      } else {
        await request("/collections/" + encodeURIComponent(editing), { method: "PATCH", body: JSON.stringify({ name: form.name.trim(), description: form.description.trim() || null }) });
      }
      setEditing(null); setRefresh(v => v + 1);
    } catch (e) { onError(e.message); }
    finally { setSaving(false); }
  }
  async function saveProducts() {
    if (!selected) return;
    setSaving(true);
    try {
      await request("/collections/" + encodeURIComponent(selected.id) + "/products", { method: "PUT", body: JSON.stringify({ productIds: assigned }) });
      setItems(list => list.map(item => item.id === selected.id ? { ...item, product_count: assigned.length } : item));
    } catch (e) { onError(e.message); }
    finally { setSaving(false); }
  }
  async function saveDetails(patch) {
    const next = { ...details, [selected.id]: { ...(details[selected.id] || {}), ...patch } };
    setDetails(next);
    setSaving(true);
    try { await request("/site-content/collectionDetails", { method: "PUT", body: JSON.stringify(next) }); }
    catch (e) { onError(e.message); }
    finally { setSaving(false); }
  }
  async function uploadCover(file) {
    if (!file || !selected) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      const result = await request("/media", { method: "POST", body: JSON.stringify({ dataUrl, fileName: file.name, usageTag: "collection" }) });
      await saveDetails({ imageUrl: result.media.url });
    } catch (e) { onError(e.message); }
    finally { setUploading(false); }
  }
  async function remove(item) {
    if (item.is_system) return;
    if (!window.confirm("Delete collection \"" + item.name + "\"? Products will lose this collection tag.")) return;
    try { await request("/collections/" + encodeURIComponent(item.id), { method: "DELETE" }); setItems(list => list.filter(x => x.id !== item.id)); if (selectedId === item.id) setSelectedId(""); }
    catch (e) { onError(e.message); }
  }
  const selectedDetails = selected ? (details[selected.id] || {}) : {};
  const assignedProducts = products.filter(p => assigned.includes(p.id));
  const availableProducts = filteredProducts.filter(p => !assigned.includes(p.id));
  return <>
    <div className="collections-area-tabs"><button className={activeArea==="categories"?"active":""} onClick={()=>setActiveArea("categories")}>Store Categories</button><button className={activeArea==="collections"?"active":""} onClick={()=>setActiveArea("collections")}>Custom Collections</button></div>
    {activeArea==="categories" ? <StoreCategoriesManager onError={onError}/> : <>
    {!selected ? <>
      <div className="page-heading"><div><div className="eyebrow">STORE EXPERIENCE / MERCHANDISING</div><h1>Collections</h1><p>Create curated product groups, then open any collection to add exactly the products you want.</p></div><div className="heading-actions"><button className="btn secondary" onClick={() => setRefresh(v => v + 1)}><RefreshCw size={15}/> Refresh</button><button className="btn primary" onClick={startNew}><Plus size={15}/> New collection</button></div></div>
      <div className="collection-overview-grid"><div className="collection-overview-card"><span>Total collections</span><b>{items.length}</b><small>Curated product groups</small></div><div className="collection-overview-card"><span>Product assignments</span><b>{items.reduce((sum,x)=>sum+Number(x.product_count||0),0)}</b><small>Across all groups</small></div><div className="collection-overview-card"><span>Visible on store</span><b>{items.filter(x=>x.visible!==false && details[x.id]?.homepageVisible!==false).length}</b><small>Managed in Homepage Builder</small></div><div className="collection-overview-card"><span>Hidden</span><b>{items.filter(x=>x.visible===false || details[x.id]?.homepageVisible===false).length}</b><small>Managed in Homepage Builder</small></div></div>
      <section className="panel collections-library-panel">
        <div className="panel-head"><div><h2>Your collections <span className="count-pill">{items.length}</span></h2><p>Click a collection card to open it and manage its products.</p></div><div className="collection-library-search"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a collection…"/></div></div></div>
        {loading ? <div className="loading-panel"><span className="spinner"/> Loading collections…</div> : visibleItems.length ? <div className="collection-library-grid">{visibleItems.map(item=><article className="collection-library-card" key={item.id}>
          <button type="button" className="collection-library-open" onClick={()=>{setSelectedId(item.id);setProductQuery("");}}>
            <div className="collection-library-cover">{details[item.id]?.imageUrl?<img src={details[item.id].imageUrl} alt=""/>:<div><ShoppingBag size={28}/></div>}<span className="collection-library-arrow"><ArrowRight size={17}/></span></div>
            <div className="collection-library-card-body"><div className="collection-library-title"><h3>{item.name}</h3>{item.is_system&&<span className="count-pill">Built-in</span>}</div><p>{item.description||"Build a curated group of products."}</p><div className="collection-library-meta"><span><Package size={14}/>{Number(item.product_count||0)} products</span><span className={item.visible===false?"collection-state-off":"collection-state-on"}>{item.visible===false?"Disabled":"Active"}</span></div></div>
          </button>
          <div className="collection-library-actions"><button className="btn secondary small" onClick={()=>startEdit(item)}>Edit details</button>{!item.is_system&&<button className="text-btn danger-text" onClick={()=>remove(item)}>Delete</button>}</div>
        </article>)}</div> : <div className="collection-library-empty"><ShoppingBag size={30}/><b>No collections found</b><span>Create a collection or change your search.</span></div>}
      </section>
    </> : <>
      <div className="page-heading collection-open-heading"><div><button className="text-btn collection-back-button" onClick={()=>{setSelectedId("");setShowProductPicker(false);}}><ArrowLeft size={16}/> All collections</button><div className="eyebrow">COLLECTION WORKSPACE</div><h1>{selected.name}</h1><p>{selected.id} · {assignedProducts.length} products assigned</p></div><div className="heading-actions"><button className="btn secondary" onClick={()=>startEdit(selected)}><Pencil size={15}/> Edit collection</button><button className="btn primary" onClick={()=>setShowProductPicker(true)}><Plus size={15}/> Add products</button></div></div>
      <div className="collection-detail-layout">
        <section className="panel collection-settings-panel">
          <div className="panel-head"><div><h2>Collection details</h2><p>Set the image and description shoppers will see.</p></div></div>
          <div className="collection-cover-editor">{selectedDetails.imageUrl?<img src={selectedDetails.imageUrl} alt={selected.name}/>:<div className="collection-cover-placeholder"><Image size={28}/><span>No collection cover yet</span></div>}<div><b>Collection cover</b><p>Upload a cover image for this collection.</p><label className="btn secondary small upload-label">{uploading?"Uploading…":"Upload cover image"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={e=>{uploadCover(e.target.files?.[0]);e.target.value="";}}/></label>{selectedDetails.imageUrl&&<button className="text-btn danger-text" onClick={()=>saveDetails({imageUrl:null})}>Remove cover</button>}</div></div>
          <label className="collection-description-field">Storefront description<textarea rows="4" maxLength={300} value={selectedDetails.storeDescription??selected.description??""} onChange={e=>setDetails(d=>({...d,[selected.id]:{...(d[selected.id]||{}),storeDescription:e.target.value}}))} placeholder="Describe what shoppers will find in this collection."/></label>
          <div className="collection-style-editor">
            <div className="collection-style-heading"><div><b>Collection appearance</b><small>Customize this collection independently. Changes won't affect other collections.</small></div><span className="count-pill">DESIGN</span></div>
            <div className="collection-style-grid">
              <label>Heading font<select value={selectedDetails.headingFont||"inherit"} onChange={e=>saveDetails({headingFont:e.target.value})}><option value="inherit">Store default</option><option value="Inter, sans-serif">Inter</option><option value="Arial, sans-serif">Arial</option><option value="Georgia, serif">Georgia</option><option value="'Trebuchet MS', sans-serif">Trebuchet</option><option value="'Times New Roman', serif">Times New Roman</option></select></label>
              <label>Heading size <strong>{selectedDetails.headingSize||32}px</strong><input type="range" min="20" max="56" step="1" value={selectedDetails.headingSize||32} onChange={e=>setDetails(d=>({...d,[selected.id]:{...(d[selected.id]||{}),headingSize:Number(e.target.value)}}))} onMouseUp={e=>saveDetails({headingSize:Number(e.currentTarget.value)})} onTouchEnd={e=>saveDetails({headingSize:Number(e.currentTarget.value)})}/></label>
              <label>Heading weight<select value={selectedDetails.headingWeight||"700"} onChange={e=>saveDetails({headingWeight:e.target.value})}><option value="500">Medium</option><option value="600">Semi-bold</option><option value="700">Bold</option><option value="800">Extra bold</option></select></label>
              <label>Products layout<select value={selectedDetails.productsLayout||"default"} onChange={e=>saveDetails({productsLayout:e.target.value})}><option value="default">Automatic</option><option value="grid">Product grid</option><option value="rail">Horizontal slider</option></select></label>
              <label>Section background<input type="color" value={selectedDetails.sectionBackground||"#ffffff"} onChange={e=>saveDetails({sectionBackground:e.target.value})}/></label>
              <label>Heading & text color<input type="color" value={selectedDetails.headingColor||"#20242b"} onChange={e=>saveDetails({headingColor:e.target.value})}/></label>
              <label>Accent color<input type="color" value={selectedDetails.accentColor||"#ad8642"} onChange={e=>saveDetails({accentColor:e.target.value})}/></label>
              <label>Card corner radius <strong>{selectedDetails.cardRadius??16}px</strong><input type="range" min="0" max="32" step="1" value={selectedDetails.cardRadius??16} onChange={e=>setDetails(d=>({...d,[selected.id]:{...(d[selected.id]||{}),cardRadius:Number(e.target.value)}}))} onMouseUp={e=>saveDetails({cardRadius:Number(e.currentTarget.value)})} onTouchEnd={e=>saveDetails({cardRadius:Number(e.currentTarget.value)})}/></label>
            </div>
            <div className="collection-style-actions"><button type="button" className="btn secondary small" onClick={()=>saveDetails({headingFont:"inherit",headingSize:32,headingWeight:"700",productsLayout:"default",sectionBackground:"#ffffff",headingColor:"#20242b",accentColor:"#ad8642",cardRadius:16})}>Reset appearance</button><span className="muted">Each collection has its own typography and colors.</span></div>
          </div>
          <div className="collection-settings-footer"><span className="muted">Homepage visibility and order are managed in Homepage Builder.</span><button className="btn secondary" onClick={()=>saveDetails({storeDescription:selectedDetails.storeDescription??selected.description??""})} disabled={saving}>{saving?"Saving…":"Save description"}</button></div>
        </section>
        <section className="panel collection-products-panel">
          <div className="panel-head"><div><h2>Products <span className="count-pill">{assignedProducts.length}</span></h2><p>Add products to this collection or remove products you no longer want.</p></div><button className="btn primary" onClick={()=>setShowProductPicker(true)}><Plus size={15}/> Add products</button></div>
          {productsLoading?<div className="loading-panel"><span className="spinner"/> Loading products…</div>:assignedProducts.length ? <div className="collection-assigned-grid">{assignedProducts.map(p=><article className="collection-assigned-product" key={p.id}>{p.image_url?<img src={p.image_url} alt=""/>:<div className="product-avatar"><Smartphone size={20}/></div>}<div><b>{p.name}</b><small>{titleCase(p.category_key)} · {p.visibility}</small></div><button className="collection-remove-product" title="Remove from collection" onClick={()=>setAssigned(ids=>ids.filter(id=>id!==p.id))}><X size={17}/></button></article>)}</div>:<div className="collection-products-empty"><div><Package size={30}/></div><h3>This collection is empty</h3><p>Add products from your catalog to start building this collection.</p><button className="btn primary" onClick={()=>setShowProductPicker(true)}><Plus size={15}/> Add first products</button></div>}
          <div className="collection-save-bar"><span>{assignedProducts.length} products selected · Changes are not saved yet</span><button className="btn primary" onClick={saveProducts} disabled={saving||productsLoading}>{saving?"Saving…":"Save products"}</button></div>
        </section>
      </div>
      {showProductPicker&&<div className="modal-backdrop collection-picker-backdrop"><section className="editor-modal collection-picker-modal"><div className="modal-head"><div><div className="eyebrow">PRODUCT CATALOG</div><h2>Add products to {selected.name}</h2><p>Select products from your store catalog. You can add more than one.</p></div><button type="button" className="icon-btn" onClick={()=>setShowProductPicker(false)}><X size={19}/></button></div><div className="collection-picker-search"><div className="search-box"><Search size={16}/><input autoFocus value={productQuery} onChange={e=>setProductQuery(e.target.value)} placeholder="Search by product name or category…"/></div><span>{assignedProducts.length} already added</span></div>{productsLoading?<div className="loading-panel"><span className="spinner"/> Loading products…</div>:<div className="collection-picker-list">{availableProducts.map(p=><article className="collection-picker-product" key={p.id}>{p.image_url?<img src={p.image_url} alt=""/>:<div className="product-avatar"><Smartphone size={19}/></div>}<div><b>{p.name}</b><small>{titleCase(p.category_key)} · {p.visibility}</small></div><button className="btn secondary small" onClick={()=>setAssigned(ids=>[...ids,p.id])}><Plus size={14}/> Add</button></article>)}{!availableProducts.length&&<div className="collection-picker-empty">{products.length===assigned.length?"All catalog products are already in this collection.":"No matching products found."}</div>}</div>}<div className="modal-foot"><span className="muted">{assignedProducts.length} products selected</span><button className="btn primary" onClick={()=>setShowProductPicker(false)}>Done</button></div></section></div>}
    </>}
    {editing&&<div className="modal-backdrop"><form className="editor-modal" onSubmit={save}><div className="modal-head"><div><div className="eyebrow">MERCHANDISING</div><h2>{editing==="new"?"Create collection":"Edit collection"}</h2></div><button type="button" className="icon-btn" onClick={()=>setEditing(null)}><X size={19}/></button></div><div className="editor-grid">{editing==="new"&&<label className="field-wide">Collection ID<input required pattern="[a-z0-9-]+" value={form.id} onChange={e=>setForm(f=>({...f,id:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-")}))} placeholder="e.g. student-deals"/><span className="field-hint">Lowercase letters, numbers and hyphens.</span></label>}<label className="field-wide">Collection name<input required maxLength={100} value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></label><label className="field-wide">Internal description<input maxLength={300} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/></label></div><div className="modal-foot"><button type="button" className="btn secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="btn primary" disabled={saving}>{saving?"Saving…":editing==="new"?"Create collection":"Save changes"}</button></div></form></div>}
    </>}
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
  const [realPreviewMode, setRealPreviewMode] = useState("");
  const previewFrameRef = useRef(null);
  function sendDesignPreview() {
    const frame = previewFrameRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({
      type: "GO_IPHONE_ADMIN_PREVIEW",
      payload: { siteContent: { designSystem: design } },
    }, new URL(PREVIEW_STOREFRONT_URL).origin);
  }
  useEffect(() => {
    if (!realPreviewMode) return;
    const timer = window.setTimeout(sendDesignPreview, 350);
    return () => window.clearTimeout(timer);
  }, [realPreviewMode, design]);
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
      <div className="heading-actions"><button className="btn secondary" onClick={() => setRealPreviewMode("desktop")}><Eye size={15}/> Real storefront preview</button><button className="btn secondary" onClick={reset}><RefreshCw size={15}/> Reset</button><button className="btn primary" onClick={save} disabled={loading || saving || localPreview}>{localPreview ? <><Eye size={15}/> Preview mode</> : saving ? "Saving…" : saved ? <><CheckCircle2 size={15}/> Saved</> : "Save design system"}</button></div>
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
    {realPreviewMode && <div className="modal-backdrop" onClick={() => setRealPreviewMode("")}>
      <div className="editor-modal" onClick={e => e.stopPropagation()} style={{ width: "min(1500px,98vw)", height: "94vh", maxHeight: "94vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className="modal-head" style={{ flexShrink: 0 }}>
          <div><div className="eyebrow">REAL STOREFRONT PREVIEW</div><h2>Design draft · {realPreviewMode === "mobile" ? "Mobile" : "Desktop"}</h2></div>
          <div className="row-actions">
            <button type="button" className="btn secondary small" onClick={() => setRealPreviewMode("desktop")}>Desktop</button>
            <button type="button" className="btn secondary small" onClick={() => setRealPreviewMode("mobile")}>Mobile</button>
            <button type="button" className="icon-btn" onClick={() => setRealPreviewMode("")}><X size={18}/></button>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 0, display: "flex", justifyContent: "center", overflow: "auto", background: "#e5e7eb", padding: 12 }}>
          <iframe ref={previewFrameRef} title="GO iPhone design system live preview" src={PREVIEW_STOREFRONT_URL} onLoad={sendDesignPreview} style={{ width: realPreviewMode === "mobile" ? 390 : "100%", maxWidth: "100%", height: "100%", minHeight: 500, border: realPreviewMode === "mobile" ? "8px solid #202938" : "0", borderRadius: realPreviewMode === "mobile" ? 28 : 8, background: "#fff" }} />
        </div>
        <p className="muted" style={{ padding: "8px 14px", margin: 0, flexShrink: 0 }}>Actual storefront with your unsaved colors, typography and corner style applied. Preview does not save or publish changes.</p>
      </div>
    </div>}
  </>;
}



function LiveBrandAndFooterEditor({ onError, previewFrameRef }) {
  const [design,setDesign]=useState(DESIGN_DEFAULTS);
  const [footer,setFooter]=useState({description:"A premium independent retailer for Apple devices — new and certified pre-owned.",groups:[{id:"shop",title:"Shop",links:[{label:"iPhone",category:"iphone"},{label:"iPad",category:"ipad"},{label:"Mac",category:"mac"},{label:"Watch",category:"watch"},{label:"AirPods",category:"airpods"}]},{id:"tools",title:"Tools",links:[{label:"Find your perfect device",action:"recommend"},{label:"Compare devices",action:"compare"}]},{id:"store",title:"Store",links:[{label:"Alexandria, Egypt",textOnly:true},{label:"Cash on delivery available",textOnly:true}]}],copyright:"© {year} Go iPhone. Not affiliated with Apple Inc."});
  const [loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[savedPart,setSavedPart]=useState("");
  useEffect(()=>{const frame=previewFrameRef?.current;if(!frame?.contentWindow)return;frame.contentWindow.postMessage({type:"GO_IPHONE_ADMIN_PREVIEW",payload:{siteContent:{designSystem:design,footerSection:footer}}},new URL(PREVIEW_STOREFRONT_URL).origin);},[design,footer,previewFrameRef]);
  useEffect(()=>{request("/site-content").then(({siteContent={}})=>{const d=siteContent.designSystem||{};setDesign({...DESIGN_DEFAULTS,...d,colors:{...DESIGN_DEFAULTS.colors,...(d.colors||{})}});if(siteContent.footerSection)setFooter(f=>({...f,...siteContent.footerSection}));}).catch(e=>onError(e.message)).finally(()=>setLoading(false));},[onError]);
  const updateDesign=(patch)=>{setDesign(d=>({...d,...patch,preset:"custom"}));setSavedPart("");};
  const updateColor=(key,value)=>{setDesign(d=>({...d,preset:"custom",colors:{...d.colors,[key]:value}}));setSavedPart("");};
  const changeFooter=(updater)=>{setFooter(updater);setSavedPart("");};
  const savePart=async(key,value)=>{if(import.meta.env.DEV){onError("Local preview is read-only. Save this change from the connected live admin.");return;}setSaving(true);setSavedPart("");try{await request("/site-content/"+key,{method:"PUT",body:JSON.stringify(value)});setSavedPart(key);}catch(e){onError(e.message);}finally{setSaving(false);}};
  const patchGroup=(index,patch)=>changeFooter(f=>({...f,groups:f.groups.map((g,i)=>i===index?{...g,...patch}:g)}));
  const patchLink=(gi,li,patch)=>changeFooter(f=>({...f,groups:f.groups.map((g,i)=>i===gi?{...g,links:g.links.map((l,j)=>j===li?{...l,...patch}:l)}:g)}));
  const moveGroup=(index,delta)=>changeFooter(f=>{const groups=[...f.groups],next=index+delta;if(next<0||next>=groups.length)return f;[groups[index],groups[next]]=[groups[next],groups[index]];return {...f,groups};});
  const moveLink=(groupIndex,linkIndex,delta)=>changeFooter(f=>({...f,groups:f.groups.map((g,i)=>{if(i!==groupIndex)return g;const links=[...g.links],next=linkIndex+delta;if(next<0||next>=links.length)return g;[links[linkIndex],links[next]]=[links[next],links[linkIndex]];return {...g,links};})}));
  return <div className="live-brand-footer-editor">
    <section className="panel">
      <div className="panel-head"><div><span className="eyebrow">LIVE CANVAS / BRAND IDENTITY</span><h2>Brand design</h2><p>Control the storefront palette, typography and component shape from the same workspace.</p></div></div>
      {loading?<div className="loading-panel">Loading brand settings…</div>:<>
        <div className="design-presets">{Object.entries(DESIGN_PRESETS).map(([key,p])=><button type="button" key={key} className={"design-preset "+(design.preset===key?"selected":"")} onClick={()=>{setDesign({preset:key,colors:{...p.colors},fontFamily:p.fontFamily,radius:p.radius});setSavedPart("");}}><span className="design-preset-swatches">{[p.colors.ink,p.colors.paper,p.colors.stone,p.colors.brass].map((v,i)=><i key={i} style={{background:v}}/>)}</span><span className="design-preset-copy"><b>{p.label}</b><small>{p.description}</small></span></button>)}</div>
        <div className="design-color-grid">{DESIGN_FIELDS.map(([key,label,hint])=><label className="design-color-field" key={key}><span className="design-color-chip" style={{background:design.colors[key]}}/><span className="design-color-copy"><b>{label}</b><small>{hint}</small><code>{design.colors[key]}</code></span><input type="color" value={design.colors[key]} onChange={e=>updateColor(key,e.target.value)}/></label>)}</div>
        <div className="design-detail-grid"><label className="design-setting"><span>Typography family</span><select value={design.fontFamily} onChange={e=>updateDesign({fontFamily:e.target.value})}><option value="Inter">Inter</option><option value="Arial">Arial</option><option value="Georgia">Georgia</option></select></label><label className="design-setting"><span>Corner style</span><select value={design.radius||"12"} onChange={e=>updateDesign({radius:e.target.value})}><option value="6">Sharp · 6px</option><option value="10">Balanced · 10px</option><option value="12">Soft · 12px</option><option value="18">Rounded · 18px</option></select></label></div>
        <div className="modal-foot"><button className="btn primary" disabled={saving} onClick={()=>savePart("designSystem",design)}>{saving?"Saving…":savedPart==="designSystem"?"Saved ✓":"Save brand design"}</button></div>
      </>}
    </section>
    <section className="panel live-footer-editor">
      <div className="live-footer-hero"><div className="live-footer-hero-icon"><LayoutDashboard size={21}/></div><div><span className="eyebrow">STORE EXPERIENCE / FOOTER BUILDER</span><h2>Footer Studio</h2><p>Build a polished store footer, organize navigation columns and manage every destination from one place.</p></div><div className="live-footer-count"><b>{footer.groups.length}</b><span>Navigation columns</span></div></div>
      <div className="live-footer-description-card"><div><b>Brand introduction</b><small>A short description that appears with your store identity in the footer.</small></div><label><span>Store description</span><textarea rows="3" value={footer.description||""} onChange={e=>changeFooter(f=>({...f,description:e.target.value}))} placeholder="A concise introduction to your store and what makes it special."/></label></div>
      {footer.groups.map((group,gi)=><div className="live-footer-group" key={group.id||gi}>
        <div className="live-footer-group-kicker"><span> NAVIGATION COLUMN {String(gi+1).padStart(2,"0")}</span><b>{group.links.length} {group.links.length===1?"link":"links"}</b></div>
        <div className="live-footer-group-head"><label><span>Column heading</span><input value={group.title||""} onChange={e=>changeFooter(f=>({...f,groups:f.groups.map((g,i)=>i===gi?{...g,title:e.target.value}:g)}))}/></label><div className="row-actions"><button type="button" className="icon-btn" title="Move column left" aria-label="Move column left" disabled={gi===0} onClick={()=>moveGroup(gi,-1)}>←</button><button type="button" className="icon-btn" title="Move column right" aria-label="Move column right" disabled={gi===footer.groups.length-1} onClick={()=>moveGroup(gi,1)}>→</button><button type="button" className="btn danger small" onClick={()=>changeFooter(f=>({...f,groups:f.groups.filter((_,i)=>i!==gi)}))}>Remove column</button></div></div>
        {group.links.map((link,li)=><div className="live-footer-link-row" key={li}>
          <div className="live-footer-link-index">{String(li+1).padStart(2,"0")}</div><label><span>Link label</span><input value={link.label||""} onChange={e=>patchLink(gi,li,{label:e.target.value})}/></label>
          <label>Destination<select value={link.action|| (link.category?"category:"+link.category : link.url?"url":"text")} onChange={e=>{const v=e.target.value;patchLink(gi,li,{action:v==="recommend"||v==="compare"?v:undefined,category:v.startsWith("category:")?v.slice(9):undefined,url:v==="url"?(link.url||""):undefined,textOnly:v==="text"});}}><option value="text">Text only</option><option value="recommend">Device finder</option><option value="compare">Compare devices</option>{["iphone","ipad","mac","watch","airpods","apple-accessory","other-accessory"].map(k=><option key={k} value={"category:"+k}>Category: {titleCase(k)}</option>)}<option value="url">Custom URL</option></select></label>
          {(link.url!==undefined||link.action==="url")&&<label>URL<input value={link.url||""} placeholder="https://…" onChange={e=>patchLink(gi,li,{url:e.target.value,action:"url"})}/></label>}
          <div className="row-actions"><button type="button" className="icon-btn" title="Move link up" aria-label="Move link up" disabled={li===0} onClick={()=>moveLink(gi,li,-1)}>↑</button><button type="button" className="icon-btn" title="Move link down" aria-label="Move link down" disabled={li===group.links.length-1} onClick={()=>moveLink(gi,li,1)}>↓</button><button type="button" className="icon-btn" title="Remove link" aria-label="Remove link" onClick={()=>changeFooter(f=>({...f,groups:f.groups.map((g,i)=>i===gi?{...g,links:g.links.filter((_,j)=>j!==li)}:g)}))}><X size={15}/></button></div>
        </div>)}
        <button type="button" className="btn secondary small" onClick={()=>changeFooter(f=>({...f,groups:f.groups.map((g,i)=>i===gi?{...g,links:[...g.links,{label:"New link",textOnly:true}]}:g)}))}><Plus size={13}/> Add link</button>
      </div>)}
      <button type="button" className="btn secondary small" onClick={()=>changeFooter(f=>({...f,groups:[...f.groups,{id:"column-"+Date.now(),title:"New column",links:[]}]}))}><Plus size={13}/> Add footer column</button>
      <div className="live-footer-copyright-card"><div><b>Legal & copyright</b><small>Keep your footer signature and year up to date.</small></div><label className="live-footer-copyright"><span>Bottom copyright text</span><input value={footer.copyright||""} onChange={e=>changeFooter(f=>({...f,copyright:e.target.value}))}/><small>Use {"{year}"} to insert the current year automatically.</small></label></div>
      <div className="live-footer-savebar"><div><b>Ready to publish your footer?</b><small>Changes are saved to the live storefront footer.</small></div><button className="btn primary" disabled={saving} onClick={()=>savePart("footerSection",footer)}>{saving?"Saving…":savedPart==="footerSection"?"Saved ✓":"Save footer changes"}</button></div>
    </section>
  </div>;
}

function Inventory({ onError }) {
  const [products,setProducts]=useState([]),[units,setUnits]=useState([]),[loading,setLoading]=useState(true),[query,setQuery]=useState(""),[status,setStatus]=useState("all"),[refresh,setRefresh]=useState(0),[editing,setEditing]=useState(null),[saving,setSaving]=useState(false);
  const emptyReport={battery:{status:"not-checked",type:"unknown"},display:{status:"not-checked",type:"unknown"},camera:{status:"not-checked",type:"unknown"},housing:{status:"not-checked",type:"unknown"},other:{status:"not-checked",type:"unknown"},tests:{faceId:"not-checked",touchId:"not-checked",cameras:"not-checked",speakers:"not-checked",microphone:"not-checked",wifi:"not-checked",bluetooth:"not-checked",charging:"not-checked"},cosmetic:"not-graded",cosmeticNotes:""};
  const [form,setForm]=useState({storage:"",color:"",batteryPct:"",condition:"New",sku:"",price:"",warranty:"",notes:"",conditionReport:emptyReport});
  const [editingUnitId,setEditingUnitId]=useState("");
  const localPreview=import.meta.env.DEV;
  const load=useCallback(async()=>{setLoading(true);try{const d=await request("/products");const list=d.products||[];setProducts(list);const grouped=await Promise.all(list.map(async p=>{const x=await request("/products/"+p.id+"/units");return (x.units||[]).map(u=>({...u,product_name:p.name,product_image:p.image_url}));}));setUnits(grouped.flat());}catch(e){onError(e.message);}finally{setLoading(false);}},[onError]);
  useEffect(()=>{load();},[load,refresh]);
  const visible=units.filter(u=>(!query.trim()||[u.product_name,u.storage,u.color,u.sku].join(" ").toLowerCase().includes(query.trim().toLowerCase()))&&(status==="all"||u.status===status));
  const count=s=>units.filter(u=>u.status===s).length;
  function add(productId){setEditingUnitId("");setForm({storage:"",color:"",batteryPct:"",condition:"New",sku:"",price:"",warranty:"",notes:"",conditionReport:{...emptyReport,battery:{...emptyReport.battery},display:{...emptyReport.display},camera:{...emptyReport.camera},housing:{...emptyReport.housing},other:{...emptyReport.other},tests:{...emptyReport.tests}}});setEditing(productId);}
  function editUnit(u){setEditingUnitId(u.id);setForm({storage:u.storage||"",color:u.color||"",batteryPct:u.battery_pct??"",condition:u.condition||"Used",sku:u.sku||"",price:u.price_cents==null?"":String(Number(u.price_cents)/100),warranty:u.warranty||"",notes:u.notes||"",conditionReport:{...emptyReport,...(u.condition_report||{}),tests:{...emptyReport.tests,...(u.condition_report?.tests||{})}}});setEditing(u.product_id);}
  async function save(e){e.preventDefault();setSaving(true);try{const payload={storage:form.storage||null,color:form.color||null,batteryPct:form.batteryPct===""?null:Number(form.batteryPct),condition:form.condition,sku:form.sku||null,priceCents:Math.round(Number(form.price)*100),warranty:form.warranty||null,notes:form.notes||null,conditionReport:form.conditionReport};await request("/products/"+editing+"/units"+(editingUnitId?"/"+editingUnitId:""),{method:editingUnitId?"PATCH":"POST",body:JSON.stringify(payload)});setEditing(null);setEditingUnitId("");setRefresh(v=>v+1);}catch(e){onError(e.message);}finally{setSaving(false);}}
  async function change(u,next){try{await request("/products/"+u.product_id+"/units/"+u.id+"/status",{method:"PATCH",body:JSON.stringify({status:next})});setUnits(xs=>xs.map(x=>x.id===u.id?{...x,status:next}:x));}catch(e){onError(e.message);}}
  return <><div className="page-heading"><div><div className="eyebrow">COMMERCE / OPERATIONS</div><h1>Inventory</h1><p>Track every physical device, its condition, battery health and availability.</p></div><button className="btn secondary" onClick={()=>setRefresh(v=>v+1)}><RefreshCw size={15}/> Refresh stock</button></div>
  {localPreview&&<div className="design-safety-note"><ShieldCheck size={17}/><div><b>Read-only local preview</b><span>Stock changes are blocked here to protect live inventory.</span></div></div>}
  <div className="inventory-metrics"><div><span>ALL UNITS</span><b>{units.length}</b></div><div className="available"><span>AVAILABLE</span><b>{count("available")}</b></div><div className="reserved"><span>RESERVED</span><b>{count("reserved")}</b></div><div className="sold"><span>SOLD</span><b>{count("sold")}</b></div></div>
  <section className="panel"><div className="toolbar"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search product, storage, color or SKU…"/></div><select value={status} onChange={e=>setStatus(e.target.value)}><option value="all">All statuses</option><option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option></select><span className="results-count">{visible.length} units</span></div>
  {loading?<div className="loading-panel"><span className="spinner"/> Loading individual inventory…</div>:visible.length?<div className="table-wrap"><table><thead><tr><th>DEVICE</th><th>STORAGE / COLOR</th><th>BATTERY</th><th>CONDITION</th><th>SKU</th><th>PRICE</th><th>STATUS</th></tr></thead><tbody>{visible.map(u=><tr key={u.id}><td><div className="product-cell">{u.product_image?<img src={u.product_image} alt=""/>:<div className="product-avatar"><Smartphone size={17}/></div>}<b>{u.product_name}</b></div></td><td>{[u.storage,u.color].filter(Boolean).join(" · ")||"—"}</td><td>{u.battery_pct==null?"—":u.battery_pct+"%"}</td><td>{u.condition||"—"}</td><td className="mono">{u.sku||"—"}</td><td>{money(u.price_cents)}</td><td><div className="flex items-center gap-2"><select className="status-select" disabled={localPreview} value={u.status} onChange={e=>change(u,e.target.value)}><option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option></select><button type="button" className="btn secondary small" disabled={localPreview} onClick={()=>editUnit(u)}>Edit</button></div></td></tr>)}</tbody></table></div>:<EmptyState icon={Boxes} title="No inventory units found" detail="Add individual devices to products to track each unit separately."/>}</section>
  <section className="panel inventory-add-panel"><div className="panel-head"><div><h2>Add a physical device</h2><p>Create a trackable unit linked to a product.</p></div></div><div className="inventory-product-picks">{products.map(p=><div className="inventory-product-pick" key={p.id}><b>{p.name}</b><button className="btn secondary small" disabled={localPreview} onClick={()=>add(p.id)}><Plus size={13}/> Add unit</button></div>)}</div></section>
  {editing&&<div className="modal-backdrop"><form className="editor-modal" onSubmit={save}><div className="modal-head"><div><div className="eyebrow">INVENTORY UNIT</div><h2>{editingUnitId?"Edit device details":"Add device details"}</h2></div><button type="button" className="icon-btn" onClick={()=>setEditing(null)}><X size={18}/></button></div><div className="editor-grid">
  <label>Storage<input value={form.storage} onChange={e=>setForm(f=>({...f,storage:e.target.value}))} placeholder="256GB"/></label><label>Color<input value={form.color} onChange={e=>setForm(f=>({...f,color:e.target.value}))}/></label>
  <label>Battery health (%)<input type="number" min="0" max="100" value={form.batteryPct} onChange={e=>setForm(f=>({...f,batteryPct:e.target.value}))}/></label><label>Condition<select value={form.condition} onChange={e=>setForm(f=>({...f,condition:e.target.value}))}><option>New</option><option>Like New</option><option>Excellent</option><option>Good</option><option>Fair</option></select></label>
  {form.condition!=="New"&&<div className="field-wide" style={{borderTop:"1px solid var(--border)",paddingTop:14,marginTop:8}}><h3>Device inspection</h3><p className="muted">Record the actual condition of this exact unit. Unknown or untested parts stay clearly marked.</p>
  <div className="editor-grid">
  {["battery","display","camera","housing","other"].map(part=><React.Fragment key={part}><label>{({battery:"Battery",display:"Display / screen",camera:"Camera",housing:"Housing",other:"Other parts"})[part]} status<select value={form.conditionReport[part]?.status||"not-checked"} onChange={e=>setForm(f=>({...f,conditionReport:{...f.conditionReport,[part]:{...f.conditionReport[part],status:e.target.value}}}))}><option value="not-checked">Not checked</option><option value="original">Original – not replaced</option><option value="replaced">Replaced</option><option value="issue">Has an issue</option></select></label><label>{({battery:"Battery",display:"Screen",camera:"Camera",housing:"Housing",other:"Other"})[part]} part type<select value={form.conditionReport[part]?.type||"unknown"} onChange={e=>setForm(f=>({...f,conditionReport:{...f.conditionReport,[part]:{...f.conditionReport[part],type:e.target.value}}}))}><option value="unknown">Unknown / unverified</option><option value="genuine-new">Genuine Apple – new</option><option value="genuine-used">Genuine Apple – used</option><option value="aftermarket">Aftermarket / third-party</option><option value="not-applicable">Not applicable</option></select></label></React.Fragment>)}
  <label>Cosmetic grade<select value={form.conditionReport.cosmetic||"not-graded"} onChange={e=>setForm(f=>({...f,conditionReport:{...f.conditionReport,cosmetic:e.target.value}}))}><option value="not-graded">Not graded</option><option value="like-new">Like new</option><option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option></select></label>
  <label>Cosmetic notes<input value={form.conditionReport.cosmeticNotes||""} onChange={e=>setForm(f=>({...f,conditionReport:{...f.conditionReport,cosmeticNotes:e.target.value}}))} placeholder="Small scratches on frame…"/></label>
  </div><h4 style={{marginTop:14}}>Functional tests</h4><div className="editor-grid">{Object.entries({faceId:"Face ID",touchId:"Touch ID",cameras:"Cameras",speakers:"Speakers",microphone:"Microphone",wifi:"Wi-Fi",bluetooth:"Bluetooth",charging:"Charging port"}).map(([key,label])=><label key={key}>{label}<select value={form.conditionReport.tests?.[key]||"not-checked"} onChange={e=>setForm(f=>({...f,conditionReport:{...f.conditionReport,tests:{...f.conditionReport.tests,[key]:e.target.value}}}))}><option value="not-checked">Not tested</option><option value="pass">Working</option><option value="fail">Issue found</option><option value="not-applicable">N/A</option></select></label>)}</div></div>}
  <label>SKU / Serial<input value={form.sku} onChange={e=>setForm(f=>({...f,sku:e.target.value}))}/></label><label>Price (EGP)<input type="number" min="0" step="0.01" required value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}/></label><label>Warranty<input value={form.warranty} onChange={e=>setForm(f=>({...f,warranty:e.target.value}))}/></label><label className="field-wide">Internal notes<input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/></label>
  </div><div className="modal-foot"><button type="button" className="btn secondary" onClick={()=>setEditing(null)}>Cancel</button><button className="btn primary" disabled={saving}>{saving?"Saving…":editingUnitId?"Save device details":"Create inventory unit"}</button></div></form></div>}</>;
}

function Reservations({ onError }) {
  const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[filter,setFilter]=useState("all"),[refresh,setRefresh]=useState(0),[busyId,setBusyId]=useState("");
  const localPreview=import.meta.env.DEV;
  const load=useCallback(()=>{setLoading(true);request("/reservations").then(d=>setItems(d.reservations||[])).catch(e=>onError(e.message)).finally(()=>setLoading(false));},[onError]);
  useEffect(()=>{load();},[load,refresh]);
  const visible=filter==="all"?items:items.filter(r=>r.status===filter);
  async function update(item,next){setBusyId(item.id);try{await request("/reservations/"+item.id+"/status",{method:"PATCH",body:JSON.stringify({status:next})});setItems(xs=>xs.map(r=>r.id===item.id?{...r,status:next}:r));}catch(e){onError(e.message);}finally{setBusyId("");}}
  const count=s=>items.filter(r=>r.status===s).length;
  return <><div className="page-heading"><div><div className="eyebrow">COMMERCE / CUSTOMER REQUESTS</div><h1>Reservations</h1><p>Follow up on device requests and move each reservation through its lifecycle.</p></div><button className="btn secondary" onClick={()=>setRefresh(v=>v+1)}><RefreshCw size={15}/> Refresh</button></div>
  {localPreview&&<div className="design-safety-note"><ShieldCheck size={17}/><div><b>Read-only local preview</b><span>Status changes are disabled in this local workspace.</span></div></div>}
  <div className="inventory-metrics"><div><span>TOTAL REQUESTS</span><b>{items.length}</b></div><div className="reserved"><span>NEW</span><b>{count("New")}</b></div><div className="available"><span>CONFIRMED</span><b>{count("Confirmed")}</b></div><div className="sold"><span>COMPLETED</span><b>{count("Completed")}</b></div></div>
  <section className="panel"><div className="toolbar"><div className="filter-tabs">{["all","New","Contacted","Confirmed","Ready","Completed","Cancelled"].map(s=><button key={s} className={filter===s?"selected":""} onClick={()=>setFilter(s)}>{s==="all"?"All requests":s}</button>)}</div><span className="results-count">{visible.length} requests</span></div>
  {loading?<div className="loading-panel"><span className="spinner"/> Loading reservations…</div>:visible.length?<div className="table-wrap"><table><thead><tr><th>REQUEST</th><th>CUSTOMER</th><th>PHONE</th><th>PRODUCT</th><th>DATE</th><th>STATUS</th></tr></thead><tbody>{visible.map(r=><tr key={r.id}><td className="mono">#{String(r.id).slice(-7).toUpperCase()}</td><td><b>{r.customer_name||"—"}</b></td><td>{r.customer_phone||"—"}</td><td>{r.product_name||"—"}</td><td>{date(r.created_at)}</td><td><select className="status-select" disabled={localPreview||busyId===r.id} value={r.status} onChange={e=>update(r,e.target.value)}>{["New","Contacted","Confirmed","Ready","Completed","Cancelled"].map(s=><option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div>:<EmptyState icon={Clock3} title="No reservations found" detail="Customer reservation requests will appear here."/>}</section></>;
}


function CustomersPage({ onError }) {
  const [items,setItems]=useState([]), [loading,setLoading]=useState(true), [query,setQuery]=useState(""), [selected,setSelected]=useState(null), [profile,setProfile]=useState(null), [refresh,setRefresh]=useState(0), [filter,setFilter]=useState("all"), [saving,setSaving]=useState(false), [draft,setDraft]=useState({notes:"",tags:"",segment:"Regular"});
  useEffect(()=>{let active=true;setLoading(true);request("/customers").then(d=>{if(active)setItems(d.customers||[]);}).catch(e=>onError(e.message)).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[refresh,onError]);
  const visible=useMemo(()=>{const q=query.trim().toLowerCase();return items.filter(c=>{const matches=!q||[c.name,c.phone,c.email,c.city,...(c.tags||[])].some(v=>String(v||"").toLowerCase().includes(q));const segment=filter==="all"||(filter==="buyers"&&Number(c.orders_count)>0)||(filter==="reserved"&&Number(c.reservations_count)>0)||(filter==="vip"&&String(c.segment||"").toLowerCase()==="vip")||(filter==="new"&&Number(c.orders_count)===0&&Number(c.reservations_count)<=1);return matches&&segment;});},[items,query,filter]);
  const spend=items.reduce((n,c)=>n+Number(c.total_spent_cents||0),0);
  const buyers=items.filter(c=>Number(c.orders_count)>0).length;
  const openProfile=async customer=>{setSelected(customer);setProfile(null);setDraft({notes:customer.notes||"",tags:(customer.tags||[]).join(", "),segment:customer.segment||"Regular"});try{const d=await request("/customers/"+encodeURIComponent(customer.id));setProfile(d);}catch(e){onError(e.message);}};
  async function saveProfile(){if(!selected)return;setSaving(true);try{const d=await request("/customers/"+encodeURIComponent(selected.id)+"/profile",{method:"PATCH",body:JSON.stringify({notes:draft.notes,tags:draft.tags.split(",").map(x=>x.trim()).filter(Boolean).slice(0,12),segment:draft.segment})});setItems(list=>list.map(c=>c.id===selected.id?{...c,...d.customer}:c));setSelected(c=>({...c,...d.customer}));setDraft({notes:d.customer.notes||"",tags:(d.customer.tags||[]).join(", "),segment:d.customer.segment||"Regular"});}catch(e){onError(e.message);}finally{setSaving(false);}}
  function exportCsv(){const headers=["Name","Phone","Email","City","Orders","Reservations","Total spent EGP","Segment","Tags","Last activity"];const rows=visible.map(c=>[c.name,c.phone,c.email,c.city,c.orders_count,c.reservations_count,(Number(c.total_spent_cents||0)/100).toFixed(2),c.segment,(c.tags||[]).join("; "),c.last_activity]);const csv=[headers,...rows].map(row=>row.map(v=>'"'+String(v??"").replaceAll('"','""')+'"').join(",")).join("\r\n");const blob=new Blob(["\\uFEFF",csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="go-iphone-customers.csv";a.click();URL.revokeObjectURL(url);}
  const whatsapp=selected?.phone? "https://wa.me/"+String(selected.phone).replace(/\\D/g,"") : "";
  return <>
    <div className="page-heading customers-heading"><div><div className="eyebrow">CUSTOMER RELATIONSHIPS</div><h1>Customers</h1><p>Customer directory, purchase history and relationship management in one workspace.</p></div><div className="customers-heading-actions"><button className="btn secondary" onClick={()=>setRefresh(v=>v+1)}><RefreshCw size={15}/> Refresh</button><button className="btn primary" onClick={exportCsv} disabled={!visible.length}><ArrowDownRight size={15}/> Export CSV</button></div></div>
    <div className="customer-kpi-grid"><div className="customer-kpi"><span>TOTAL CUSTOMERS</span><b>{items.length}</b><small>Unique customer contacts</small></div><div className="customer-kpi"><span>BUYING CUSTOMERS</span><b>{buyers}</b><small>{items.length?Math.round(buyers/items.length*100):0}% of customer base</small></div><div className="customer-kpi"><span>RESERVATIONS</span><b>{items.reduce((n,c)=>n+Number(c.reservations_count||0),0)}</b><small>Across all customers</small></div><div className="customer-kpi"><span>LIFETIME SALES</span><b>{money(spend)}</b><small>Excludes cancelled orders</small></div></div>
    <section className="panel customers-workspace"><div className="customers-toolbar"><div className="customers-search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search customers by name, phone, email, city or tag…"/></div><div className="customer-filter-tabs">{[["all","All"],["buyers","Buyers"],["reserved","Reserved"],["vip","VIP"],["new","New contacts"]].map(([key,label])=><button key={key} className={filter===key?"selected":""} onClick={()=>setFilter(key)}>{label}</button>)}</div><span className="results-count">{visible.length} customers</span></div>
      {loading?<div className="loading-panel"><span className="spinner"/> Loading customer records…</div>:visible.length?<div className="table-wrap"><table className="customers-table"><thead><tr><th>CUSTOMER</th><th>CONTACT</th><th>ACTIVITY</th><th>LIFETIME VALUE</th><th>SEGMENT</th><th>LAST ACTIVE</th><th></th></tr></thead><tbody>{visible.map(c=><tr key={c.id} onClick={()=>openProfile(c)}><td><b>{c.name||"Customer"}</b><span className="subline">{[c.city,c.address].filter(Boolean).join(" · ")||"Location not provided"}</span></td><td><b>{c.phone||"—"}</b><span className="subline">{c.email||"No email"}</span></td><td><span className="customer-activity-count">{c.orders_count||0} orders</span><span className="subline">{c.reservations_count||0} reservations</span></td><td><b>{money(c.total_spent_cents)}</b></td><td><span className={"customer-segment "+String(c.segment||"Regular").toLowerCase().replaceAll(" ","-")}>{c.segment||"Regular"}</span>{(c.tags||[]).length>0&&<span className="subline">{c.tags.slice(0,2).join(" · ")}</span>}</td><td>{date(c.last_activity)}</td><td><ChevronRight size={17}/></td></tr>)}</tbody></table></div>:<EmptyState icon={Users} title={query?"No matching customers":"No customers yet"} detail={query?"Try another search or filter.":"Customers will appear automatically when they place an order or reserve a device."}/>}
    </section>
    {selected&&<div className="modal-backdrop customer-profile-backdrop" onClick={()=>{setSelected(null);setProfile(null);}}><section className="editor-modal customer-profile-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><div className="eyebrow">CUSTOMER PROFILE</div><h2>{selected.name||"Customer"}</h2><p>{selected.city||"Location not provided"} · Customer since {date(selected.first_activity||selected.last_activity)}</p></div><button className="icon-btn" onClick={()=>{setSelected(null);setProfile(null);}}><X size={18}/></button></div>
      <div className="customer-profile-stats"><div><small>ORDERS</small><b>{selected.orders_count||0}</b></div><div><small>RESERVATIONS</small><b>{selected.reservations_count||0}</b></div><div><small>LIFETIME SPEND</small><b>{money(selected.total_spent_cents)}</b></div></div>
      <div className="customer-profile-columns"><div className="customer-profile-main"><section className="customer-detail-card"><h3>Contact details</h3><div className="customer-contact-grid"><div><small>PHONE</small><b>{selected.phone||"—"}</b></div><div><small>EMAIL</small><b>{selected.email||"—"}</b></div><div><small>CITY</small><b>{selected.city||"—"}</b></div><div><small>ADDRESS</small><b>{selected.address||"—"}</b></div></div>{whatsapp&&<a className="btn secondary customer-whatsapp" href={whatsapp} target="_blank" rel="noreferrer"><ExternalLink size={15}/> Open WhatsApp</a>}</section>
      <section className="customer-detail-card"><h3>Purchase & reservation history</h3>{!profile?<div className="loading-panel"><span className="spinner"/> Loading activity…</div>:<div className="customer-timeline">{[...(profile.orders||[]).map(x=>({...x,kind:"Order",when:x.created_at})),...(profile.reservations||[]).map(x=>({...x,kind:"Reservation",when:x.created_at}))].sort((a,b)=>new Date(b.when)-new Date(a.when)).map((x,i)=><div className="customer-timeline-item" key={x.kind+"-"+x.id}><span className="customer-timeline-dot"/><div><div className="customer-timeline-top"><b>{x.kind} · {String(x.id).slice(-7).toUpperCase()}</b><small>{date(x.when)}</small></div><p>{x.kind==="Order"?money(x.total_cents):x.product_name||"Product reservation"} <span className="status">{x.status}</span></p>{x.kind==="Order"&&<small>{(x.items||[]).map(it=>(it.productName||it.variant_label||"Item")+" × "+it.qty).join(", ")}</small>}</div></div>)}{!(profile.orders||[]).length&&!(profile.reservations||[]).length&&<p className="muted">No activity found.</p>}</div>}</section></div>
      <aside className="customer-profile-side"><section className="customer-detail-card"><h3>Relationship management</h3><label>Customer segment<select value={draft.segment} onChange={e=>setDraft(d=>({...d,segment:e.target.value}))}><option>Regular</option><option>VIP</option><option>Wholesale</option><option>At Risk</option><option>New</option></select></label><label>Tags <small>Separate tags with commas</small><input value={draft.tags} onChange={e=>setDraft(d=>({...d,tags:e.target.value}))} placeholder="iPhone buyer, Repeat customer"/></label><label>Private notes<textarea rows={5} value={draft.notes} onChange={e=>setDraft(d=>({...d,notes:e.target.value}))} placeholder="Preferences, follow-up notes, service history…"/></label><button className="btn primary customer-save-profile" disabled={saving} onClick={saveProfile}>{saving?"Saving…":"Save customer profile"}</button></section><p className="customer-privacy-note">Notes, tags and segments are internal admin information and are not shown to shoppers.</p></aside></div>
      <div className="modal-foot"><button className="btn secondary" onClick={()=>{setSelected(null);setProfile(null);}}>Close profile</button></div></section></div>}
  </>;
}

function TeamAccessPage({ user, onError }) {
  const [users,setUsers]=useState([]),[loading,setLoading]=useState(true),[refresh,setRefresh]=useState(0),[creating,setCreating]=useState(false),[saving,setSaving]=useState(false);
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[role,setRole]=useState("DASHBOARD");
  const roleLabels={OWNER:"Super Admin",FULL_ACCESS_NO_DASHBOARD:"Full Access – No Dashboard",DASHBOARD:"Dashboard Viewer",CATALOG:"Products & Design Manager"};
  const load=useCallback(()=>{setLoading(true);request("/users").then(d=>setUsers(d.adminUsers||[])).catch(e=>onError(e.message)).finally(()=>setLoading(false));},[onError]);
  useEffect(()=>{load();},[load,refresh]);
  async function createMember(e){e.preventDefault();setSaving(true);try{await request("/users",{method:"POST",body:JSON.stringify({email,password,role})});setEmail("");setPassword("");setRole("DASHBOARD");setCreating(false);setRefresh(v=>v+1);}catch(err){onError(err.message);}finally{setSaving(false);}}
  async function changeRole(member,nextRole){try{await request("/users/"+member.id+"/role",{method:"PATCH",body:JSON.stringify({role:nextRole})});setUsers(list=>list.map(u=>u.id===member.id?{...u,role:nextRole}:u));}catch(e){onError(e.message);}}
  async function toggleActive(member){const isActive=!member.is_active;try{await request("/users/"+member.id+"/active",{method:"PATCH",body:JSON.stringify({isActive})});setUsers(list=>list.map(u=>u.id===member.id?{...u,is_active:isActive}:u));}catch(e){onError(e.message);}}
  return <>
    <div className="page-heading"><div><div className="eyebrow">SECURITY & PERMISSIONS</div><h1>Team & Access</h1><p>Four access levels with separate dashboard and store-management permissions.</p></div><button className="btn primary" onClick={()=>setCreating(v=>!v)}><Plus size={15}/> Add team member</button></div>
    <div className="editor-grid" style={{marginBottom:20}}>{["OWNER","FULL_ACCESS_NO_DASHBOARD","DASHBOARD","CATALOG"].map((key,i)=><section className="panel" key={key} style={{padding:20}}><div className="eyebrow">ROLE 0{i+1}</div><h2 style={{margin:"8px 0"}}>{roleLabels[key]}</h2><p className="muted" style={{fontSize:13,margin:0}}>{key==="OWNER"?"All permissions, including Dashboard and full team administration.":key==="FULL_ACCESS_NO_DASHBOARD"?"Full store and team management access. Dashboard and its sales overview are completely hidden.":key==="DASHBOARD"?"Can view the Dashboard and sales overview only. No store editing or management.":"Can add and edit products and manage storefront design, collections and media. Dashboard, orders, customers and sales are hidden."}</p></section>)}</div>
    <section className="panel"><div className="panel-head"><div><h2>Team members</h2><p>{users.length} accounts · role-based access</p></div><button className="btn secondary small" onClick={()=>setRefresh(v=>v+1)}><RefreshCw size={14}/> Refresh</button></div>
      {loading?<div className="loading-panel"><span className="spinner"/> Loading team…</div>:users.length?<div className="table-wrap"><table><thead><tr><th>MEMBER</th><th>ROLE</th><th>2-STEP VERIFICATION</th><th>LAST LOGIN</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>{users.map(m=><tr key={m.id}><td><b>{m.email}</b><span className="subline">Added {date(m.created_at)}</span></td><td><select className="status-select" disabled={m.id===user?.id||m.role==="OWNER"||!m.is_active} value={m.role} onChange={e=>changeRole(m,e.target.value)}>{(m.role==="OWNER"?["OWNER"]:["FULL_ACCESS_NO_DASHBOARD","DASHBOARD","CATALOG"]).map(v=><option key={v} value={v}>{roleLabels[v]}</option>)}</select></td><td><span className={m.totp_enabled?"status paid":"status pending"}>{m.totp_enabled?"Enabled":"Not enabled"}</span></td><td>{date(m.last_login_at)}</td><td><span className={m.is_active?"status paid":"status cancelled"}>{m.is_active?"Active":"Inactive"}</span></td><td><button className="btn secondary small" disabled={m.id===user?.id} onClick={()=>toggleActive(m)}>{m.is_active?"Deactivate":"Reactivate"}</button></td></tr>)}</tbody></table></div>:<EmptyState icon={ShieldCheck} title="No team members" detail="Admin accounts will appear here."/>}
    </section>
    {creating&&<div className="modal-backdrop"><form className="editor-modal" onSubmit={createMember}><div className="modal-head"><div><div className="eyebrow">TEAM INVITATION</div><h2>Add team member</h2></div><button type="button" className="icon-btn" onClick={()=>setCreating(false)}><X size={18}/></button></div><div className="editor-grid"><label className="field-wide">Email address<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="teammate@company.com"/></label><label className="field-wide">Temporary password<input type="password" required minLength={12} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 12 characters"/></label><label className="field-wide">Access role<select value={role} onChange={e=>setRole(e.target.value)}>{["OWNER","FULL_ACCESS_NO_DASHBOARD","DASHBOARD","CATALOG"].filter(v=>v!=="OWNER"||user?.role==="OWNER").map(v=><option key={v} value={v}>{roleLabels[v]}</option>)}</select></label></div><p className="muted" style={{fontSize:12}}>Share the temporary password securely. The new member should change it after signing in.</p><div className="modal-foot"><button type="button" className="btn secondary" onClick={()=>setCreating(false)}>Cancel</button><button className="btn primary" disabled={saving}>{saving?"Creating…":"Create account"}</button></div></form></div>}
  </>;
}
function SettingsPage({ onError }) {
  const defaults={
    store_profile:{storeName:"GO iPhone",tagline:"Discover your next favorite.",currency:"EGP",timezone:"Africa/Cairo"},
    store_contact:{email:"",phone:"",whatsapp:"",address:"",city:""},
    store_fulfillment:{deliveryEnabled:true,deliveryNote:"Cash on delivery",deliveryAreas:"",estimatedDelivery:""},
    store_checkout:{cashOnDelivery:true,bankTransfer:false,onlinePayments:false,orderNotes:true}
  };
  const labels={store_profile:"Store identity",store_contact:"Contact information",store_fulfillment:"Delivery & fulfilment",store_checkout:"Checkout & payments"};
  const [values,setValues]=useState(defaults),[loading,setLoading]=useState(true),[saving,setSaving]=useState(""),[saved,setSaved]=useState(""),[refresh,setRefresh]=useState(0);
  const localPreview=import.meta.env.DEV;
  useEffect(()=>{let active=true;request("/settings").then(d=>{if(!active)return;setValues(v=>Object.fromEntries(Object.keys(defaults).map(k=>[k,{...defaults[k],...(d.settings?.[k]||{})}])));}).catch(e=>onError(e.message)).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[refresh,onError]);
  function change(group,key,value){setValues(v=>({...v,[group]:{...v[group],[key]:value}}));setSaved("");}
  async function save(group){setSaving(group);setSaved("");try{await request("/settings/"+group,{method:"PUT",body:JSON.stringify(values[group])});setSaved(group);}catch(e){onError(e.message);}finally{setSaving("");}}
  const input=(group,key,label,type="text",hint="")=><label>{label}<input type={type} value={values[group][key]??""} onChange={e=>change(group,key,e.target.value)} placeholder={hint}/></label>;
  const toggle=(group,key,label)=><label className="settings-toggle"><span>{label}</span><input type="checkbox" checked={!!values[group][key]} onChange={e=>change(group,key,e.target.checked)}/></label>;
  return <>
    <div className="page-heading"><div><div className="eyebrow">STORE CONFIGURATION</div><h1>Settings</h1><p>Manage your store identity, contact details, delivery and checkout preferences.</p></div><button className="btn secondary" onClick={()=>setRefresh(v=>v+1)}><RefreshCw size={15}/> Reload</button></div>
    <div className="design-safety-note"><ShieldCheck size={17}/><div><b>Storefront integration still pending</b><span>These settings are saved in the backend, but the current storefront does not yet apply the store profile, contact, delivery or checkout groups. Checkout currently supports cash on delivery only; no online payment gateway or automated shipping integration is connected.</span></div></div>
    {localPreview&&<div className="design-safety-note"><ShieldCheck size={17}/><div><b>Read-only local preview</b><span>Settings can be reviewed here. Saving is enabled in the live admin workspace.</span></div></div>}
    {loading?<div className="loading-panel"><span className="spinner"/> Loading settings…</div>:Object.keys(defaults).map(group=><section className="panel" key={group} style={{marginBottom:18}}><div className="panel-head"><div><h2>{labels[group]}</h2><p>Changes are saved securely to your store configuration.</p></div><button className="btn primary small" disabled={localPreview||saving===group} onClick={()=>save(group)}>{saving===group?"Saving…":saved===group?"Saved ✓":"Save changes"}</button></div>
      <div className="editor-grid">{group==="store_profile"?<>{input(group,"storeName","Store name")}{input(group,"tagline","Store tagline")}{input(group,"currency","Currency code")}{input(group,"timezone","Time zone")}</>:group==="store_contact"?<>{input(group,"email","Support email","email")}{input(group,"phone","Phone number","tel")}{input(group,"whatsapp","WhatsApp number","tel")}{input(group,"city","City")}{input(group,"address","Business address")}</>:group==="store_fulfillment"?<>{toggle(group,"deliveryEnabled","Enable delivery")}{input(group,"deliveryNote","Delivery method / note")}{input(group,"deliveryAreas","Delivery areas","text","e.g. All Egypt")}{input(group,"estimatedDelivery","Estimated delivery time","text","e.g. 1–3 business days")}</>:<>{toggle(group,"cashOnDelivery","Cash on delivery")}{toggle(group,"bankTransfer","Bank transfer")}{toggle(group,"onlinePayments","Online payments")}{toggle(group,"orderNotes","Allow customer order notes")}</>}</div></section>)}
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
  useEffect(() => { if (user && page === "dashboard" && user.permissions?.["dashboard.view"]) loadStats(); }, [user, page, loadStats]);

  async function logout() {
    try { await request("/auth/logout", { method: "POST" }); } catch { /* Clear local state regardless. */ }
    setUser(null); setStats(null); setPage("dashboard");
  }
  if (checking) return <div className="boot-screen"><div className="brand-mark">G</div><span className="spinner"/>Preparing your workspace…</div>;
  if (!user) return <Login onLogin={handleLogin}/>;
  if (!securityReady || user.twoFactorRequired) return <TwoFactorSetup onComplete={finishSecuritySetup} onError={showError}/>;

  const permissions = user?.permissions || {};
  const visibleNavGroups = navGroups.map(group=>({...group,items:group.items.filter(item=>permissions[item.permission])})).filter(group=>group.items.length);
  const allowedPageIds = new Set(visibleNavGroups.flatMap(group=>group.items.map(item=>item.id)));
  const activePage = allowedPageIds.has(page) ? page : ([...allowedPageIds][0] || "");
  function navigate(id) { if (!allowedPageIds.has(id)) { setError("You do not have permission to open this section."); setPage([...allowedPageIds][0] || ""); } else { setPage(id); setError(""); } setSidebarOpen(false); }
  const pageTitle = [...visibleNavGroups.flatMap(g => g.items)].find(i => i.id === activePage)?.label || "Workspace";
  return <div className="app-shell">
    <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
      <div className="sidebar-brand"><Brand/><button className="icon-btn mobile-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button></div>
      <div className="store-switch"><div className="store-icon">G</div><div><b>GO iPhone Store</b><span>Production workspace</span></div><ChevronDown size={15}/></div>
      <nav>{visibleNavGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item => { const Icon = item.icon; return <button key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""}`} onClick={() => navigate(item.id)}><Icon size={17}/><span>{item.label}</span>{item.id === "orders" && stats?.orders?.New > 0 && <i className="nav-badge">{stats.orders.New}</i>}</button>; })}</div>)}</nav>
      <div className="sidebar-bottom"><div className="secure-note"><ShieldCheck size={16}/><div><b>Secure workspace</b><span>Role-based access enabled</span></div></div><div className="user-card"><div className="user-avatar">{(user.email || "A").slice(0,1).toUpperCase()}</div><div className="user-info"><b>{user.email}</b><span>{titleCase(user.role)}</span></div><button className="icon-btn" title="Sign out" onClick={logout}><LogOut size={16}/></button></div></div>
    </aside>
    {sidebarOpen && <button className="mobile-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Close menu"/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(true)}><Menu size={19}/></button><span className="breadcrumb">GO iPhone <ChevronRight size={13}/> <b>{pageTitle}</b></span></div><div className="topbar-right"><span className={`live-dot ${import.meta.env.DEV ? "preview-dot" : ""}`}/> <span className="environment">{import.meta.env.DEV ? "READ-ONLY PREVIEW" : "LIVE STORE"}</span><span className="topbar-divider"/><button className="icon-btn" title="Help"><CircleHelp size={18}/></button><a className="icon-btn" href="https://go-iphone-storefront1.vercel.app/" target="_blank" rel="noreferrer" title="Open storefront"><ExternalLink size={17}/></a></div></header>
      <div className="content-area">
        {error && <div className="toast error"><AlertTriangle size={16}/>{error}<button onClick={() => setError("")}><X size={14}/></button></div>}
        {activePage === "dashboard" && <Dashboard stats={stats} loading={statsLoading} onRefresh={loadStats} onNavigate={navigate} permissions={permissions}/>}
        {activePage === "products" && <Products onError={showError}/>}
        {activePage === "orders" && <Orders onError={showError}/>}
        {activePage === "inventory" && <Inventory onError={showError}/>}
        {activePage === "reservations" && <Reservations onError={showError}/>}
        {activePage === "customers" && <CustomersPage onError={showError}/>}
        {activePage === "team" && <TeamAccessPage user={user} onError={showError}/>}
        {activePage === "settings" && <SettingsPage onError={showError}/>}
        {activePage === "media" && <MediaLibrary onError={showError}/>}
        {activePage === "homepage" && <HomepageBuilder onError={showError}/>}
        {activePage === "collections" && <CollectionsManager onError={showError}/>}
        
        {!["dashboard","products","orders","inventory","reservations","customers","team","settings","media","homepage","collections"].includes(activePage) && <Placeholder id={activePage} onNavigate={navigate}/>}
        <footer className="app-footer"><span>© {new Date().getFullYear()} GO iPhone</span><span>Admin workspace <i/> Built for your store</span></footer>
      </div>
    </main>
  </div>;
}
