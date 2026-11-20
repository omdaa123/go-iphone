// Verified baseline specifications transcribed from Apple's official comparison pages.
// Keep this catalog additive: unknown values are intentionally omitted rather than guessed.
const APPLE_SOURCES = {
  iphone: "https://www.apple.com/iphone/compare/",
  ipad: "https://www.apple.com/eg/ipad/compare/",
  mac: "https://www.apple.com/mac/compare/",
  watch: "https://www.apple.com/eg/watch/compare/",
  airpods: "https://www.apple.com/airpods/compare/",
};

const SPECS = {
  "iPhone 17 Pro": { "Chip": "A19 Pro", "Display size": "6.27-inch", "Rear camera system": "48MP Pro Fusion camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 17 Pro Max": { "Chip": "A19 Pro", "Display size": "6.86-inch", "Rear camera system": "48MP Pro Fusion camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone Air": { "Chip": "A19 Pro", "Display size": "6.55-inch", "Rear camera system": "48MP Fusion camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 17": { "Chip": "A19", "Display size": "6.27-inch", "Rear camera system": "48MP Dual Fusion camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 17e": { "Chip": "A19", "Display size": "6.06-inch", "Rear camera system": "48MP Fusion camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 16 Pro": { "Chip": "A18 Pro", "Display size": "6.27-inch", "Rear camera system": "Pro camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 16 Pro Max": { "Chip": "A18 Pro", "Display size": "6.86-inch", "Rear camera system": "Pro camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 16": { "Chip": "A18", "Display size": "6.12-inch", "Rear camera system": "Advanced dual-camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 16 Plus": { "Chip": "A18", "Display size": "6.69-inch", "Rear camera system": "Advanced dual-camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 16e": { "Chip": "A18", "Display size": "6.06-inch", "Rear camera system": "2-in-1 camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 15 Pro": { "Chip": "A17 Pro", "Display size": "6.12-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 15 Pro Max": { "Chip": "A17 Pro", "Display size": "6.69-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 15": { "Chip": "A16 Bionic", "Display size": "6.12-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 15 Plus": { "Chip": "A16 Bionic", "Display size": "6.69-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 14 Pro": { "Chip": "A16 Bionic", "Display size": "6.12-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 14 Pro Max": { "Chip": "A16 Bionic", "Display size": "6.69-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 14": { "Chip": "A15 Bionic", "Display size": "6.06-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 14 Plus": { "Chip": "A15 Bionic", "Display size": "6.68-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 13 Pro": { "Chip": "A15 Bionic", "Display size": "6.06-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 13 Pro Max": { "Chip": "A15 Bionic", "Display size": "6.68-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 13 mini": { "Chip": "A15 Bionic", "Display size": "5.42-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 13": { "Chip": "A15 Bionic", "Display size": "6.06-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone SE (3rd generation)": { "Chip": "A15 Bionic", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 12 Pro": { "Chip": "A14 Bionic", "Display size": "6.06-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 12 Pro Max": { "Chip": "A14 Bionic", "Display size": "6.68-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 12 mini": { "Chip": "A14 Bionic", "Display size": "5.42-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 12": { "Chip": "A14 Bionic", "Display size": "6.06-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 11 Pro": { "Chip": "A13 Bionic", "Display size": "5.85-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 11 Pro Max": { "Chip": "A13 Bionic", "Display size": "6.46-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone 11": { "Chip": "A13 Bionic", "Display size": "6.06-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone SE (2nd generation)": { "Chip": "A13 Bionic", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone XS": { "Chip": "A12 Bionic", "Display size": "5.85-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone XS Max": { "Chip": "A12 Bionic", "Display size": "6.46-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone XR": { "Chip": "A12 Bionic", "Display size": "6.06-inch", "Apple specification source": APPLE_SOURCES.iphone },
  "iPhone X": { "Chip": "A11 Bionic", "Display size": "5.85-inch", "Apple specification source": APPLE_SOURCES.iphone },

  "iPad Pro 13-inch (M5)": { "Chip": "Apple M5", "Display size": "13-inch Ultra Retina XDR (Tandem OLED)", "CPU": "Up to 10-core CPU", "GPU": "10-core GPU", "Neural Engine": "16-core", "Rear camera": "12MP Wide + 10MP Ultra Wide", "Wi-Fi": "Wi-Fi 7", "Bluetooth": "Bluetooth 6", "Apple Pencil": "Apple Pencil Pro", "Apple specification source": APPLE_SOURCES.ipad },
  "iPad Pro 11-inch (M5)": { "Chip": "Apple M5", "Display size": "11-inch Ultra Retina XDR (Tandem OLED)", "CPU": "Up to 10-core CPU", "GPU": "10-core GPU", "Neural Engine": "16-core", "Rear camera": "12MP Wide + 10MP Ultra Wide", "Wi-Fi": "Wi-Fi 7", "Bluetooth": "Bluetooth 6", "Apple Pencil": "Apple Pencil Pro", "Apple specification source": APPLE_SOURCES.ipad },
  "iPad Air 13-inch (M4)": { "Chip": "Apple M4", "Display size": "13-inch Liquid Retina", "CPU": "8-core CPU", "GPU": "9-core GPU", "Neural Engine": "16-core", "Rear camera": "12MP Wide + 10MP Ultra Wide", "Wi-Fi": "Wi-Fi 7", "Bluetooth": "Bluetooth 6", "Apple Pencil": "Apple Pencil Pro", "Apple specification source": APPLE_SOURCES.ipad },
  "iPad Air 11-inch (M4)": { "Chip": "Apple M4", "Display size": "11-inch Liquid Retina", "CPU": "8-core CPU", "GPU": "9-core GPU", "Neural Engine": "16-core", "Rear camera": "12MP Wide + 10MP Ultra Wide", "Wi-Fi": "Wi-Fi 7", "Bluetooth": "Bluetooth 6", "Apple Pencil": "Apple Pencil Pro", "Apple specification source": APPLE_SOURCES.ipad },
  "iPad (A16)": { "Chip": "Apple A16", "Display size": "11-inch Liquid Retina", "CPU": "5-core CPU", "GPU": "4-core GPU", "Neural Engine": "16-core", "Rear camera": "12MP Wide", "Wi-Fi": "Wi-Fi 6", "Bluetooth": "Bluetooth 5.3", "Apple Pencil": "Apple Pencil (USB-C)", "Apple specification source": APPLE_SOURCES.ipad },
  "iPad mini (A20 Pro)": { "Chip": "Apple A20 Pro", "Display size": "8.5-inch", "Apple specification source": APPLE_SOURCES.ipad },

  "Apple Watch Series 12": { "Chip": "S11", "Case sizes": "42mm / 46mm", "Display": "Always-On Retina OLED", "Battery": "Up to 24 hours; up to 38 hours Low Power Mode", "Capacity": "64GB", "Apple specification source": APPLE_SOURCES.watch },
  "Apple Watch Ultra 4": { "Chip": "S11", "Case size": "49mm titanium", "Display": "Always-On Retina", "Connectivity": "GPS + Cellular", "Capacity": "64GB", "Apple specification source": APPLE_SOURCES.watch },
  "Apple Watch SE 3": { "Chip": "S10", "Case sizes": "40mm / 44mm aluminum", "Display": "Always-On Retina OLED", "Battery": "Up to 18 hours", "Capacity": "64GB", "Apple specification source": APPLE_SOURCES.watch },

  "MacBook Neo": { "Chip": "Apple A18 Pro", "Display size": "13-inch class", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Air 13-inch (M5)": { "Chip": "Apple M5", "Display size": "13-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Air 15-inch (M5)": { "Chip": "Apple M5", "Display size": "15-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Pro 14-inch (M5)": { "Chip": "Apple M5", "Display size": "14-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Pro 14-inch (M5 Pro)": { "Chip": "Apple M5 Pro", "Display size": "14-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Pro 14-inch (M5 Max)": { "Chip": "Apple M5 Max", "Display size": "14-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Pro 16-inch (M5 Pro)": { "Chip": "Apple M5 Pro", "Display size": "16-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Pro 16-inch (M5 Max)": { "Chip": "Apple M5 Max", "Display size": "16-inch", "Apple specification source": APPLE_SOURCES.mac },

  "AirPods 5": { "Apple specification source": APPLE_SOURCES.airpods },
  "AirPods 5 with Wireless Charging Case": { "Apple specification source": APPLE_SOURCES.airpods },
  "AirPods 4": { "Chip": "H2", "Listening time": "Up to 5 hours per charge", "Charging case": "Up to 30 hours listening time", "Charging case type": "USB-C", "Apple specification source": APPLE_SOURCES.airpods },
  "AirPods 4 with Active Noise Cancellation": { "Chip": "H2", "Listening time": "Up to 5 hours per charge", "Charging case": "Up to 30 hours listening time", "Active Noise Cancellation": "Yes", "Apple specification source": APPLE_SOURCES.airpods },
  "AirPods Pro 3": { "Chip": "H2", "Listening time": "Up to 8 hours with Active Noise Cancellation", "Charging case": "Up to 24 hours with Active Noise Cancellation", "Heart rate sensing": "During workouts", "Apple specification source": APPLE_SOURCES.airpods },
  "AirPods Pro 2": { "Chip": "H2", "Listening time": "Up to 6 hours with Active Noise Cancellation", "Charging case": "Up to 30 hours with Active Noise Cancellation", "Apple specification source": APPLE_SOURCES.airpods },
  "AirPods Max 2": { "Chip": "H2", "Listening time": "Up to 20 hours with Active Noise Cancellation", "Apple specification source": APPLE_SOURCES.airpods },
};

export function getAppleOfficialSpecs(product) {
  if (!product) return {};
  const name = String(product.name || product.modelName || "").trim();
  return SPECS[name] ? { ...SPECS[name] } : {};
}
