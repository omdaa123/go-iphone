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

  "iPad Pro 13-inch (M5)": { "Chip": "Apple M5", "Display": "13-inch Ultra Retina XDR Tandem OLED, 2752 × 2064, 264 ppi, ProMotion up to 120Hz", "CPU": "9-core (256/512GB) or 10-core (1/2TB)", "GPU": "10-core", "Neural Engine": "16-core", "Rear camera": "12MP Wide", "Front camera": "12MP landscape Center Stage", "Wi-Fi": "Wi-Fi 7", "Bluetooth": "Bluetooth 6", "Apple Pencil": "Apple Pencil Pro / Apple Pencil (USB-C)", "Storage": "256GB, 512GB, 1TB, 2TB", "Battery": "Up to 10 hours Wi-Fi web/video", "Apple specification source": "https://support.apple.com/en-us/125407" },
  "iPad Pro 11-inch (M5)": { "Chip": "Apple M5", "Display": "11-inch Ultra Retina XDR Tandem OLED, 2420 × 1668, 264 ppi, ProMotion up to 120Hz", "CPU": "9-core (256/512GB) or 10-core (1/2TB)", "GPU": "10-core", "Neural Engine": "16-core", "Rear camera": "12MP Wide", "Front camera": "12MP landscape Center Stage", "Wi-Fi": "Wi-Fi 7", "Bluetooth": "Bluetooth 6", "Apple Pencil": "Apple Pencil Pro / Apple Pencil (USB-C)", "Storage": "256GB, 512GB, 1TB, 2TB", "Battery": "Up to 10 hours Wi-Fi web/video", "Apple specification source": "https://support.apple.com/en-us/125406" },
  "iPad Air 13-inch (M4)": { "Chip": "Apple M4", "Display": "13-inch Liquid Retina, 2732 × 2048, 264 ppi, 600 nits", "CPU": "8-core", "GPU": "9-core", "Neural Engine": "16-core", "Unified memory": "12GB", "Rear camera": "12MP Wide", "Front camera": "12MP landscape Center Stage", "Wi-Fi": "Wi-Fi 7", "Bluetooth": "Bluetooth 6", "Apple Pencil": "Apple Pencil Pro / Apple Pencil (USB-C)", "Storage": "128GB, 256GB, 512GB, 1TB", "Battery": "Up to 10 hours Wi-Fi web/video", "Apple specification source": "https://support.apple.com/en-eg/126472" },
  "iPad Air 11-inch (M4)": { "Chip": "Apple M4", "Display": "11-inch Liquid Retina, 2360 × 1640, 264 ppi, 500 nits", "CPU": "8-core", "GPU": "9-core", "Neural Engine": "16-core", "Unified memory": "12GB", "Rear camera": "12MP Wide", "Front camera": "12MP landscape Center Stage", "Wi-Fi": "Wi-Fi 7", "Bluetooth": "Bluetooth 6", "Apple Pencil": "Apple Pencil Pro / Apple Pencil (USB-C)", "Storage": "128GB, 256GB, 512GB, 1TB", "Battery": "Up to 10 hours Wi-Fi web/video", "Apple specification source": "https://support.apple.com/en-eg/126471" },
  "iPad (A16)": { "Chip": "Apple A16", "Display": "10.86-inch Liquid Retina, 2360 × 1640, 264 ppi, True Tone, 500 nits", "CPU": "5-core", "GPU": "4-core", "Neural Engine": "16-core", "Rear camera": "12MP Wide", "Front camera": "12MP landscape Center Stage", "Wi-Fi": "Wi-Fi 6", "Bluetooth": "Bluetooth 5.3", "Apple Pencil": "Apple Pencil (USB-C) / Apple Pencil (1st generation with adapter)", "Storage": "128GB, 256GB, 512GB", "Apple specification source": "https://support.apple.com/en-us/122240" },
  "iPad mini (A20 Pro)": { "Chip": "Apple A20 Pro", "Display size": "8.5-inch", "Apple specification source": APPLE_SOURCES.ipad },

  "Apple Watch Series 12": { "Chip": "S11 SiP, dual-core 64-bit, 4-core Neural Engine", "Case sizes": "42mm / 46mm", "Display": "Always-On Retina OLED LTPO3, 326 ppi, up to 2,000 nits", "Battery": "Up to 24 hours; up to 38 hours Low Power Mode", "Capacity": "64GB", "Connectivity": "GPS; optional 5G/LTE Cellular", "Water resistance": "50m swimproof; IP6X dust resistance", "Apple specification source": "https://support.apple.com/en-mide/148589" },
  "Apple Watch Ultra 4": { "Chip": "S11 SiP, dual-core 64-bit, 4-core Neural Engine", "Case size": "49mm Grade 5 titanium", "Display": "Always-On Retina LTPO3 OLED, 326 ppi, up to 3,000 nits", "Battery": "Up to 50 hours; up to 84 hours Low Power Mode", "Connectivity": "GPS + Cellular, satellite connectivity", "Capacity": "64GB", "Water resistance": "100m; IP6X dust resistance; diving to 40m", "Apple specification source": "https://support.apple.com/en-mide/148758" },
  "Apple Watch SE 3": { "Chip": "S10 SiP, dual-core 64-bit, 4-core Neural Engine", "Case sizes": "40mm / 44mm aluminum", "Display": "Always-On Retina OLED LTPO, 326 ppi, up to 1,000 nits", "Battery": "Up to 18 hours; up to 32 hours Low Power Mode", "Capacity": "64GB", "Apple specification source": "https://support.apple.com/en-gb/125094" },

  "MacBook Neo": { "Chip": "Apple A18 Pro", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Air 13-inch (M5)": { "Chip": "Apple M5", "Display size": "13-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Air 15-inch (M5)": { "Chip": "Apple M5", "Display size": "15-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Pro 14-inch (M5)": { "Chip": "Apple M5", "Display size": "14-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Pro 14-inch (M5 Pro)": { "Chip": "Apple M5 Pro", "Display size": "14-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Pro 14-inch (M5 Max)": { "Chip": "Apple M5 Max", "Display size": "14-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Pro 16-inch (M5 Pro)": { "Chip": "Apple M5 Pro", "Display size": "16-inch", "Apple specification source": APPLE_SOURCES.mac },
  "MacBook Pro 16-inch (M5 Max)": { "Chip": "Apple M5 Max", "Display size": "16-inch", "Apple specification source": APPLE_SOURCES.mac },

  "AirPods 5": { "Chip": "H2 headphone chip", "Audio": "Active Noise Cancellation, Adaptive Audio, Transparency, Personalized Spatial Audio", "Listening time": "Up to 4 hours with ANC; up to 6 hours with noise control off", "Charging case": "USB-C; up to 20 hours with ANC", "Water resistance": "IP57", "Bluetooth": "Bluetooth 5.3", "Apple specification source": "https://support.apple.com/en-euro/148759" },
  "AirPods 5 with Wireless Charging Case": { "Chip": "H2 headphone chip", "Audio": "Active Noise Cancellation, Adaptive Audio, Transparency, Personalized Spatial Audio", "Listening time": "Up to 5 hours with ANC; up to 7 hours with noise control off", "Charging case": "USB-C, Qi and Apple Watch charger; up to 22 hours with ANC", "Water resistance": "IP57", "Bluetooth": "Bluetooth 5.3", "Apple specification source": "https://support.apple.com/en-us/148760" },
  "AirPods 4": { "Chip": "H2 headphone chip", "Audio": "Personalized Spatial Audio with dynamic head tracking, Adaptive EQ, Voice Isolation", "Listening time": "Up to 5 hours", "Charging case": "USB-C; up to 30 hours total listening time", "Water resistance": "IP54", "Bluetooth": "Bluetooth 5.3", "Apple specification source": "https://support.apple.com/en-us/121203" },
  "AirPods 4 with Active Noise Cancellation": { "Chip": "H2 headphone chip", "Audio": "Active Noise Cancellation, Adaptive Audio, Transparency, Personalized Spatial Audio with dynamic head tracking", "Listening time": "Up to 4 hours with ANC; up to 5 hours with noise control off", "Charging case": "USB-C with speaker; up to 20 hours with ANC / 30 hours with noise control off", "Water resistance": "IP54", "Bluetooth": "Bluetooth 5.3", "Apple specification source": "https://support.apple.com/en-eg/121204" },
  "AirPods Pro 3": { "Chip": "H2 headphone chip", "Audio": "Active Noise Cancellation, Adaptive Audio, Transparency, Personalized Spatial Audio with dynamic head tracking", "Listening time": "Up to 8 hours with ANC", "Charging case": "Up to 24 hours with ANC", "Water resistance": "IP57", "Heart rate sensing": "During workouts", "Apple specification source": "https://support.apple.com/en-eg/125135" },
  "AirPods Pro 2": { "Chip": "H2", "Listening time": "Up to 6 hours with Active Noise Cancellation", "Charging case": "Up to 30 hours with Active Noise Cancellation", "Apple specification source": APPLE_SOURCES.airpods },
  "AirPods Max 2": { "Chip": "H2 headphone chip in each ear cup", "Audio": "Active Noise Cancellation, Adaptive Audio, Transparency, Personalized Spatial Audio, lossless audio via USB-C", "Listening time": "Up to 20 hours with ANC", "Microphones": "Nine total", "Weight": "386.2g", "Apple specification source": "https://support.apple.com/en-md/126620" },

  "iPhone 18 Pro": { "Chip": "A20 Pro", "Display": "6.3-inch Super Retina XDR OLED, 2622 × 1206, 460 ppi, ProMotion up to 120Hz", "Camera": "Apple Pro camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Storage": "256GB, 512GB, 1TB, 2TB", "Apple specification source": "https://support.apple.com/en-euro/148590" },
  "iPhone 18 Pro Max": { "Chip": "A20 Pro", "Display": "6.9-inch Super Retina XDR OLED, 2868 × 1320, 460 ppi, ProMotion up to 120Hz", "Camera": "Apple Pro camera system", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Storage": "256GB, 512GB, 1TB, 2TB", "Apple specification source": "https://support.apple.com/en-asia/148591" },
  "iPhone Duo": { "Chip": "A20 Pro", "Display": "7.6-inch inner folding OLED + 5.4-inch outer OLED, both Super Retina XDR", "Camera": "48MP Dual Fusion camera system", "Battery": "Up to 24 hours typical use", "Water resistance": "IP68 (up to 6m for 30 minutes)", "Storage": "256GB, 512GB, 1TB, 2TB", "Connectivity": "Wi-Fi 7, Bluetooth 6, dual eSIM", "Apple specification source": "https://support.apple.com/en-us/148588" },

  "iPad mini (A20 Pro)": { "Chip": "Apple A20 Pro", "Display": "8.5-inch Super Retina XDR OLED, 2316 × 1512, 326 ppi", "CPU": "5-core (128/256GB) or 6-core (512GB)", "GPU": "7-core", "Neural Engine": "16-core (dual on 512GB)", "Rear camera": "12MP Wide", "Apple Pencil": "Apple Pencil Pro / Apple Pencil (USB-C)", "Water resistance": "IP67", "Storage": "128GB, 256GB, 512GB", "Apple specification source": "https://support.apple.com/en-us/149482" },

  "Apple Watch Series 11": { "Chip": "S10 SiP, dual-core 64-bit, 4-core Neural Engine", "Case sizes": "42mm / 46mm", "Display": "Always-On Retina LTPO OLED, 326 ppi, up to 2,000 nits", "Battery": "Up to 24 hours; up to 38 hours Low Power Mode", "Capacity": "64GB", "Apple specification source": "https://support.apple.com/en-eg/125093" },
  "Apple Watch Ultra 3": { "Chip": "S10 SiP, dual-core 64-bit, 4-core Neural Engine", "Case size": "49mm Grade 5 titanium", "Display": "Always-On Retina LTPO OLED, 326 ppi, up to 3,000 nits", "Battery": "Up to 42 hours; up to 72 hours Low Power Mode", "Connectivity": "GPS + Cellular", "Capacity": "64GB", "Water resistance": "100m; IP6X dust resistance; diving to 40m", "Apple specification source": "https://support.apple.com/en-gb/125095" },
  "Apple Watch Series 10": { "Chip": "S10 SiP, dual-core 64-bit, 4-core Neural Engine", "Case sizes": "42mm / 46mm", "Display": "Always-On Retina LTPO3 OLED, 326 ppi, up to 2,000 nits", "Battery": "Up to 18 hours; up to 36 hours Low Power Mode", "Capacity": "64GB", "Apple specification source": "https://support.apple.com/en-gb/121202" },
  "Apple Watch Ultra 2": { "Chip": "S9 SiP, dual-core 64-bit, 4-core Neural Engine", "Case size": "49mm titanium", "Display": "Always-On Retina LTPO2 OLED, 326 ppi, up to 3,000 nits", "Battery": "Up to 36 hours; up to 72 hours Low Power Mode", "Capacity": "64GB", "Connectivity": "GPS + Cellular", "Water resistance": "100m; IP6X dust resistance; diving to 40m", "Apple specification source": "https://support.apple.com/en-eg/111832" },
  "Apple Watch Series 9": { "Chip": "S9 SiP, dual-core 64-bit, 4-core Neural Engine", "Case sizes": "41mm / 45mm", "Display": "Always-On Retina LTPO OLED, 326 ppi, up to 2,000 nits", "Battery": "Up to 18 hours", "Capacity": "64GB", "Apple specification source": "https://support.apple.com/en-us/111833" },

  "MacBook Neo": { "Chip": "Apple A18 Pro, 6-core CPU, 5-core GPU, 16-core Neural Engine", "Display": "13-inch Liquid Retina, 2408 × 1506, 219 ppi, 500 nits", "Memory": "8GB unified memory", "Storage": "256GB or 512GB SSD", "Battery": "Up to 16 hours video streaming; up to 11 hours wireless web", "Apple specification source": "https://support.apple.com/en-eg/126322" },
  "MacBook Air 13-inch (M5)": { "Chip": "Apple M5, 10-core CPU, 8-core or 10-core GPU, 16-core Neural Engine", "Display": "13.6-inch Liquid Retina, 2560 × 1664, 224 ppi, 500 nits", "Memory": "16GB unified memory, configurable to 24GB or 32GB", "Storage": "512GB SSD, configurable to 1TB, 2TB or 4TB", "Battery": "Up to 18 hours video streaming; up to 15 hours wireless web", "Wireless": "Wi-Fi 7, Bluetooth 6", "Apple specification source": "https://support.apple.com/en-eg/126320" },
  "MacBook Air 15-inch (M5)": { "Chip": "Apple M5, 10-core CPU, 10-core GPU, 16-core Neural Engine", "Display": "15.3-inch Liquid Retina, 2880 × 1864, 224 ppi, 500 nits", "Memory": "16GB unified memory, configurable to 24GB or 32GB", "Storage": "512GB SSD, configurable to 1TB, 2TB or 4TB", "Battery": "Up to 18 hours video streaming; up to 15 hours wireless web", "Wireless": "Wi-Fi 7, Bluetooth 6", "Apple specification source": "https://support.apple.com/en-eg/126321" },
  "MacBook Pro 14-inch (M5)": { "Chip": "Apple M5, 10-core CPU, 10-core GPU, 16-core Neural Engine", "Display": "14.2-inch Liquid Retina XDR, 3024 × 1964, 254 ppi, ProMotion up to 120Hz", "Memory": "16GB, 24GB or 32GB unified memory", "Storage": "512GB or 1TB SSD, configurable to 4TB", "Battery": "Up to 24 hours video streaming; up to 16 hours wireless web", "Apple specification source": "https://support.apple.com/en-eg/125405" },
  "MacBook Pro 14-inch (M5 Pro)": { "Chip": "Apple M5 Pro, 15-core or 18-core CPU, 16-core or 20-core GPU", "Display": "14.2-inch Liquid Retina XDR, 3024 × 1964, 254 ppi, ProMotion up to 120Hz", "Memory": "24GB unified memory, configurable up to 128GB depending on chip", "Storage": "512GB SSD or higher, configurable by chip", "Apple specification source": "https://support.apple.com/en-gb/126318" },
  "MacBook Pro 14-inch (M5 Max)": { "Chip": "Apple M5 Max, 18-core CPU, 32-core or 40-core GPU", "Display": "14.2-inch Liquid Retina XDR, 3024 × 1964, 254 ppi, ProMotion up to 120Hz", "Memory": "36GB unified memory, configurable up to 128GB", "Storage": "1TB SSD or higher, configurable by chip", "Apple specification source": "https://support.apple.com/en-gb/126318" },
  "MacBook Pro 16-inch (M5 Pro)": { "Chip": "Apple M5 Pro, 18-core CPU, 20-core GPU, 16-core Neural Engine", "Display": "16.2-inch Liquid Retina XDR, 3456 × 2234, 254 ppi, ProMotion up to 120Hz", "Memory": "24GB unified memory, configurable to 36GB, 48GB or 64GB", "Storage": "2TB SSD, configurable to 4TB or 8TB", "Apple specification source": "https://support.apple.com/en-gb/126319" },
  "MacBook Pro 16-inch (M5 Max)": { "Chip": "Apple M5 Max, 18-core CPU, 32-core or 40-core GPU, 16-core Neural Engine", "Display": "16.2-inch Liquid Retina XDR, 3456 × 2234, 254 ppi, ProMotion up to 120Hz", "Memory": "36GB unified memory, configurable to 48GB, 64GB or 128GB", "Storage": "2TB SSD, configurable to 4TB or 8TB", "Apple specification source": "https://support.apple.com/en-gb/126319" },
  "Mac mini (M6)": { "Chip": "Apple M6, 12-core CPU, 12-core GPU, dual 16-core Neural Engine", "Memory": "16GB unified memory, configurable to 24GB or 32GB", "Storage": "256GB SSD, configurable to 2TB", "Wireless": "Wi-Fi 7, Bluetooth 6", "Apple specification source": "https://support.apple.com/en-gb/128108" },
  "Mac mini (M5 Pro)": { "Chip": "Apple M5 Pro, 15-core CPU, 16-core GPU, 16-core Neural Engine", "Memory": "24GB unified memory, configurable to 48GB or 64GB", "Storage": "512GB SSD, configurable to 8TB", "Wireless": "Wi-Fi 7, Bluetooth 6", "Apple specification source": "https://support.apple.com/en-gb/128108" },
  "Mac Studio (M5 Max)": { "Chip": "Apple M5 Max, 18-core CPU, 32-core or 40-core GPU, 16-core Neural Engine", "Memory": "36GB unified memory, configurable to 128GB", "Storage": "512GB SSD, configurable to 8TB", "Wireless": "Wi-Fi 7, Bluetooth 6", "Ports": "Thunderbolt 5, USB-A, HDMI 2.1, 10Gb Ethernet, SDXC", "Apple specification source": "https://support.apple.com/en-us/128107" },
  "Mac Studio (M5 Ultra)": { "Chip": "Apple M5 Ultra, 30-core CPU, 64-core GPU, 32-core Neural Engine", "Memory": "96GB unified memory, configurable to 512GB", "Storage": "1TB SSD, configurable to 16TB", "Wireless": "Wi-Fi 7, Bluetooth 6", "Ports": "Thunderbolt 5, USB-A, HDMI 2.1, 10Gb Ethernet, SDXC", "Apple specification source": "https://support.apple.com/en-us/128107" },
};

export function getAppleOfficialSpecs(product) {
  if (!product) return {};
  const name = String(product.name || product.modelName || "").trim();
  return SPECS[name] ? { ...SPECS[name] } : {};
}

export function getAppleOfficialDescription(product) {
  const specs = getAppleOfficialSpecs(product);
  if (!Object.keys(specs).length) return "";
  const preferred = ["Chip", "Display", "Display size", "Camera", "Rear camera", "Audio", "Case sizes", "Case size", "Battery"];
  const values = preferred.map(key => specs[key]).filter(value => typeof value === "string" && value.trim());
  return [...new Set(values)].slice(0, 4).join(" · ");
}
