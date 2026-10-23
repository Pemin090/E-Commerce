import fs from 'fs';
import path from 'path';
import { Product, Order, User, Category, EmailNotification, UserAddress } from '../src/types/index.ts';

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  users: (User & { passwordHash?: string })[];
  categories: Category[];
  notifications: EmailNotification[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'ecommerce-db.json');

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-audio', name: 'Audio & Sound', slug: 'audio', description: 'Studio grade headphones, noise-canceling earbuds, and speakers.', icon: 'Headphones', itemCount: 3 },
  { id: 'cat-laptops', name: 'Laptops & Displays', slug: 'laptops', description: 'High-performance ultrabooks and color-calibrated displays.', icon: 'Laptop', itemCount: 2 },
  { id: 'cat-wearables', name: 'Smart Wearables', slug: 'wearables', description: 'Next-gen fitness trackers, health monitors, and smartwatches.', icon: 'Watch', itemCount: 2 },
  { id: 'cat-cameras', name: 'Cameras & Optics', slug: 'cameras', description: 'Cinematic creator cameras, lenses, and stabilization gear.', icon: 'Camera', itemCount: 2 },
  { id: 'cat-workspace', name: 'Workspace & Desk', slug: 'workspace', description: 'Ergonomic mechanical keyboards, charging docks, and leather accessories.', icon: 'Compass', itemCount: 3 },
];

const INITIAL_USERS: (User & { passwordHash?: string })[] = [
  {
    id: 'user-admin-01',
    name: 'Alex Rivera (Admin)',
    email: 'admin@apexstore.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
    createdAt: '2026-01-15T08:00:00.000Z',
    addresses: [
      {
        id: 'addr-admin-1',
        fullName: 'Alex Rivera',
        street: '742 Evergreen Terrace Suite 400',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94107',
        country: 'United States',
        phone: '+1 (555) 234-5678',
        isDefault: true,
      }
    ]
  },
  {
    id: 'user-customer-01',
    name: 'Sophia Bennett',
    email: 'customer@apexstore.com',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
    createdAt: '2026-02-10T11:20:00.000Z',
    addresses: [
      {
        id: 'addr-cust-1',
        fullName: 'Sophia Bennett',
        street: '350 5th Avenue, Apt 18B',
        city: 'New York',
        state: 'NY',
        zipCode: '10118',
        country: 'United States',
        phone: '+1 (555) 987-6543',
        isDefault: true,
      }
    ]
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Apex SonicPro ANC Wireless Headphones',
    slug: 'apex-sonicpro-anc-headphones',
    description: 'Flagship hybrid active noise cancelling over-ear headphones with custom 45mm beryllium drivers, 55-hour battery life, spatial audio calibration, and ultra-plush memory foam earcups.',
    price: 349.99,
    originalPrice: 399.99,
    category: 'Audio & Sound',
    brand: 'ApexAudio',
    rating: 4.9,
    reviewsCount: 142,
    stock: 28,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    tags: ['Best Seller', 'Spatial Audio', '55h Battery'],
    specs: {
      'Battery Life': 'Up to 55 Hours',
      'Connectivity': 'Bluetooth 5.4, 3.5mm Aux, USB-C lossless',
      'Weight': '265 grams',
      'Noise Cancellation': 'Adaptive Hybrid ANC with Transparency Mode',
      'Codecs': 'LDAC, aptX Adaptive, AAC, SBC'
    },
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'prod-002',
    name: 'PulseBeat Pro True Wireless Earbuds',
    slug: 'pulsebeat-pro-wireless-earbuds',
    description: 'Compact wireless earbuds with deep resonant bass, IPX7 waterproof rating for heavy workouts, multipoint pairing, and wireless MagSafe charging case.',
    price: 179.99,
    originalPrice: 219.99,
    category: 'Audio & Sound',
    brand: 'ApexAudio',
    rating: 4.7,
    reviewsCount: 98,
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    tags: ['IPX7 Waterproof', 'Wireless Charging'],
    specs: {
      'Battery Life': '8h earbuds + 32h case',
      'Water Resistance': 'IPX7 certified',
      'Microphones': '6-mic array with AI wind suppression',
      'Charging': 'USB-C fast charge + Qi Wireless'
    },
    createdAt: '2026-02-01T12:00:00.000Z'
  },
  {
    id: 'prod-003',
    name: 'AeroBook Pro 16 Ultra Laptop',
    slug: 'aerobook-pro-16-ultra',
    description: 'Precision milled aluminum chassis powered by 14-core flagship processor, 32GB LPDDR5X RAM, 1TB Gen4 NVMe, and 120Hz 3.2K Liquid Retina display.',
    price: 1899.99,
    originalPrice: 2099.99,
    category: 'Laptops & Displays',
    brand: 'ApexCompute',
    rating: 4.95,
    reviewsCount: 64,
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    tags: ['Flagship', '120Hz 3.2K', '32GB RAM'],
    specs: {
      'Display': '16.0" 3.2K (3200x2000) 120Hz Mini-LED 1600 nits',
      'Processor': '14-Core Performance Chip',
      'Memory': '32GB Unified LPDDR5X',
      'Storage': '1TB NVMe PCIe 4.0 SSD',
      'Weight': '1.68 kg'
    },
    createdAt: '2026-02-15T09:30:00.000Z'
  },
  {
    id: 'prod-004',
    name: 'QuantumCurve 34" Ultrawide OLED Monitor',
    slug: 'quantumcurve-34-ultrawide-oled',
    description: 'Immersive 1800R curved QD-OLED gaming and creator display with 175Hz refresh rate, 0.03ms response time, and 99.3% DCI-P3 color coverage.',
    price: 899.99,
    originalPrice: 999.99,
    category: 'Laptops & Displays',
    brand: 'ApexCompute',
    rating: 4.8,
    reviewsCount: 41,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    tags: ['QD-OLED', '175Hz', 'Curved'],
    specs: {
      'Resolution': '3440 x 1440 WQHD Ultrawide',
      'Panel': 'Quantum Dot OLED',
      'Ports': 'Thunderbolt 4 (90W PD), HDMI 2.1, DP 1.4, USB Hub',
      'Color Accuracy': 'Delta E < 1.0 Factory Calibrated'
    },
    createdAt: '2026-01-25T14:15:00.000Z'
  },
  {
    id: 'prod-005',
    name: 'ChronoFit Apex Titanium Smartwatch',
    slug: 'chronofit-apex-titanium-smartwatch',
    description: 'Grade 5 aerospace titanium smartwatch with sapphire crystal glass, continuous ECG & SpO2 tracking, dual-frequency GPS, and 14-day battery life.',
    price: 399.99,
    originalPrice: 449.99,
    category: 'Smart Wearables',
    brand: 'ChronoFit',
    rating: 4.88,
    reviewsCount: 119,
    stock: 34,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    tags: ['Grade 5 Titanium', '14-Day Battery', 'ECG Monitor'],
    specs: {
      'Materials': 'Grade 5 Titanium case, Sapphire crystal dial',
      'Battery Life': '14 days typical, 36h multi-band GPS',
      'Water Rating': '10 ATM (100 meters diving)',
      'Sensors': 'ECG, Optical HR, Pulse Oximeter, Barometer, Temp'
    },
    createdAt: '2026-02-18T16:00:00.000Z'
  },
  {
    id: 'prod-006',
    name: 'Aura Vitality Smart Health Ring',
    slug: 'aura-vitality-smart-health-ring',
    description: 'Ultra-lightweight ceramic and titanium ring delivering non-intrusive sleep staging, circadian rhythm analysis, recovery scores, and skin temperature monitoring.',
    price: 289.99,
    category: 'Smart Wearables',
    brand: 'ChronoFit',
    rating: 4.65,
    reviewsCount: 73,
    stock: 22,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    tags: ['Sleep Tracker', 'No Subscription Fee'],
    specs: {
      'Weight': '4 to 6 grams depending on size',
      'Battery': '7 days on single 30-min charge',
      'Sizes': 'US 6 to 13 with sizing kit included',
      'Waterproof': '100m water resistant'
    },
    createdAt: '2026-02-28T08:00:00.000Z'
  },
  {
    id: 'prod-007',
    name: 'Lumix Lumina 4K Cinema Creator Camera',
    slug: 'lumix-lumina-4k-cinema-camera',
    description: 'Compact full-frame mirrorless camera designed for digital storytellers. Uncropped 4K 120p 10-bit internal recording, dual base ISO, active sensor cooling, and AI autofocus.',
    price: 1599.99,
    originalPrice: 1749.99,
    category: 'Cameras & Optics',
    brand: 'Lumix',
    rating: 4.92,
    reviewsCount: 52,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    tags: ['4K 120p', 'Dual Native ISO', 'Full-Frame'],
    specs: {
      'Sensor': '24.2 MP Full-Frame Exmor R CMOS',
      'Video': '4K 120p, 10-bit 4:2:2 All-Intra, ProRes RAW out',
      'Stabilization': '5-axis in-body image stabilization (7.0 stops)',
      'Storage': 'Dual CFexpress Type A / SD UHS-II slots'
    },
    createdAt: '2026-01-10T15:40:00.000Z'
  },
  {
    id: 'prod-008',
    name: 'CarbonFiber Pro 3-Axis Gimbal Stabilizer',
    slug: 'carbonfiber-pro-gimbal-stabilizer',
    description: 'Professional handheld 3-axis stabilizer capable of 4.5kg payload. Automated axis locks, 1.8" OLED touchscreen, carbon fiber build, and LiDAR focus assistance.',
    price: 499.99,
    originalPrice: 549.99,
    category: 'Cameras & Optics',
    brand: 'ApexMotion',
    rating: 4.78,
    reviewsCount: 36,
    stock: 19,
    images: [
      'https://images.unsplash.com/photo-1589872589333-e7a9161a0b36?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1542567455-cd733fb83870?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    tags: ['4.5kg Payload', 'LiDAR Focus Ready'],
    specs: {
      'Payload': '4.5 kg (9.9 lbs)',
      'Run Time': '12 hours with fast recharge',
      'Structure': 'Layered carbon fiber arms',
      'Connectivity': 'Bluetooth 5.1, RSA/NATO ports'
    },
    createdAt: '2026-02-12T11:00:00.000Z'
  },
  {
    id: 'prod-009',
    name: 'ErgoLift Split Mechanical Keyboard',
    slug: 'ergolift-split-mechanical-keyboard',
    description: 'Hot-swappable custom wireless mechanical keyboard with CNC anodized aluminum body, gasket mount design, lubricated linear switches, and programmable rotary dial.',
    price: 219.99,
    category: 'Workspace & Desk',
    brand: 'ApexDesk',
    rating: 4.85,
    reviewsCount: 88,
    stock: 31,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    tags: ['Hot-Swap', 'Gasket Mount', 'CNC Aluminum'],
    specs: {
      'Switches': 'Apex Silent Velvet Linear (Factory Lubed)',
      'Keycaps': 'PBT Dye-sublimated cherry profile',
      'Mounting': 'Poron gasket dampening with poly plate',
      'Battery': '4000mAh (Up to 200 hours without backlight)'
    },
    createdAt: '2026-02-05T09:20:00.000Z'
  },
  {
    id: 'prod-010',
    name: 'MagPeak 3-in-1 Fast Wireless Charging Station',
    slug: 'magpeak-3-in-1-fast-wireless-charger',
    description: 'Sculpted from solid walnut wood and space-gray zinc alloy. Rapid 15W Qi2 certified wireless charging for Phone, Watch, and Earbuds simultaneously.',
    price: 129.99,
    originalPrice: 149.99,
    category: 'Workspace & Desk',
    brand: 'ApexDesk',
    rating: 4.8,
    reviewsCount: 165,
    stock: 58,
    images: [
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: true,
    tags: ['Qi2 15W', 'Solid Walnut', '3-in-1'],
    specs: {
      'Input': 'USB-C PD 45W (Wall adapter included)',
      'Output': '15W MagSafe + 5W Apple Watch + 5W AirPods',
      'Materials': 'Handcrafted American Walnut & Zinc Alloy',
      'Safety': 'Foreign object detection, thermal throttling'
    },
    createdAt: '2026-01-18T13:45:00.000Z'
  },
  {
    id: 'prod-011',
    name: 'Apex Commuter Weatherproof Tech Backpack',
    slug: 'apex-commuter-tech-backpack',
    description: 'Engineered with recycled 840D ballistic nylon, YKK AquaGuard zips, dedicated suspended 16" laptop pocket, hidden passport sleeve, and magnetic fidlock chest buckle.',
    price: 189.99,
    originalPrice: 219.99,
    category: 'Workspace & Desk',
    brand: 'ApexGear',
    rating: 4.91,
    reviewsCount: 112,
    stock: 24,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    tags: ['Weatherproof', '840D Cordura', 'Fidlock Buckle'],
    specs: {
      'Volume': '24 Liters expandable to 28L',
      'Weight': '1.1 kg',
      'Laptop Compartment': 'Suspended false-bottom fits up to 16.2" laptop',
      'Warranty': 'Lifetime craftsmanship warranty'
    },
    createdAt: '2026-02-14T10:10:00.000Z'
  },
  {
    id: 'prod-012',
    name: 'StudioCore Pro Hi-Res Desktop DAC & Amp',
    slug: 'studiocore-pro-desktop-dac-amp',
    description: 'Dual ESS Sabre ES9038PRO reference DAC chips with fully balanced THX AAA headphone amplifier delivering pristine sound transparency with zero background noise.',
    price: 449.99,
    category: 'Audio & Sound',
    brand: 'ApexAudio',
    rating: 4.96,
    reviewsCount: 47,
    stock: 6,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1000&q=80'
    ],
    featured: false,
    tags: ['Dual ESS Sabre', 'Balanced XLR', 'THX AAA'],
    specs: {
      'Outputs': '4-pin Balanced XLR, 4.4mm Pentaconn, 6.35mm Single-ended',
      'Resolution': '32-bit / 768kHz PCM, DSD512 native',
      'Output Power': 'Up to 6000mW @ 32 ohms',
      'Signal-to-Noise': '132 dB'
    },
    createdAt: '2026-02-22T17:30:00.000Z'
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'ORD-98421',
    customerId: 'user-customer-01',
    customerEmail: 'customer@apexstore.com',
    customerName: 'Sophia Bennett',
    shippingAddress: INITIAL_USERS[1].addresses![0],
    items: [
      {
        productId: 'prod-001',
        name: 'Apex SonicPro ANC Wireless Headphones',
        price: 349.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
      },
      {
        productId: 'prod-010',
        name: 'MagPeak 3-in-1 Fast Wireless Charging Station',
        price: 129.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=600&q=80'
      }
    ],
    pricing: {
      subtotal: 479.98,
      discount: 47.99,
      couponCode: 'SAVE10',
      shipping: 0,
      tax: 38.88,
      total: 470.87
    },
    payment: {
      method: 'credit_card',
      status: 'completed',
      transactionId: 'TXN-98421-9981',
      cardLast4: '4242',
      cardBrand: 'Visa'
    },
    status: 'shipped',
    tracking: {
      carrier: 'FedEx Express',
      trackingNumber: 'FX-884920194US',
      estimatedDelivery: 'Tomorrow by 4:00 PM',
      events: [
        {
          status: 'placed',
          title: 'Order Placed & Payment Authorized',
          description: 'Payment of $470.87 verified via Visa ending in 4242.',
          timestamp: '2026-10-21T09:15:00.000Z'
        },
        {
          status: 'processing',
          title: 'Packed at Apex Fulfillment Center',
          description: 'Items inspected, serial numbers verified, and secured with eco-cushioning.',
          timestamp: '2026-10-21T14:30:00.000Z',
          location: 'Newark, NJ Distribution Hub'
        },
        {
          status: 'shipped',
          title: 'Departed Carrier Facility',
          description: 'Package accepted by FedEx Express. In transit to destination sorting facility.',
          timestamp: '2026-10-22T08:45:00.000Z',
          location: 'Queens, NY Carrier Facility'
        }
      ]
    },
    emailSent: true,
    createdAt: '2026-10-21T09:15:00.000Z',
    updatedAt: '2026-10-22T08:45:00.000Z'
  },
  {
    id: 'ord-1002',
    orderNumber: 'ORD-97510',
    customerId: 'user-customer-01',
    customerEmail: 'customer@apexstore.com',
    customerName: 'Sophia Bennett',
    shippingAddress: INITIAL_USERS[1].addresses![0],
    items: [
      {
        productId: 'prod-005',
        name: 'ChronoFit Apex Titanium Smartwatch',
        price: 399.99,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
      }
    ],
    pricing: {
      subtotal: 399.99,
      discount: 0,
      shipping: 0,
      tax: 32.00,
      total: 431.99
    },
    payment: {
      method: 'apple_pay',
      status: 'completed',
      transactionId: 'TXN-97510-7731'
    },
    status: 'delivered',
    tracking: {
      carrier: 'UPS Ground',
      trackingNumber: '1Z9999999999999999',
      estimatedDelivery: 'Delivered',
      events: [
        {
          status: 'placed',
          title: 'Order Received',
          description: 'Payment authorized with Apple Pay.',
          timestamp: '2026-10-15T10:00:00.000Z'
        },
        {
          status: 'processing',
          title: 'Assembled and Quality Checked',
          description: 'Serial and warranty registered.',
          timestamp: '2026-10-15T15:20:00.000Z'
        },
        {
          status: 'shipped',
          title: 'Carrier Hand-off',
          description: 'Handed off to UPS.',
          timestamp: '2026-10-16T09:00:00.000Z'
        },
        {
          status: 'delivered',
          title: 'Delivered to Front Door',
          description: 'Signed by recipient: S. Bennett',
          timestamp: '2026-10-18T13:22:00.000Z',
          location: 'New York, NY'
        }
      ]
    },
    emailSent: true,
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-18T13:22:00.000Z'
  }
];

const INITIAL_NOTIFICATIONS: EmailNotification[] = [
  {
    id: 'notif-001',
    toEmail: 'customer@apexstore.com',
    subject: 'Order Confirmation: #ORD-98421 has been received',
    type: 'order_placed',
    orderId: 'ord-1001',
    orderNumber: 'ORD-98421',
    timestamp: '2026-10-21T09:15:30.000Z',
    read: true,
    bodyHtml: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #4f46e5;">Thank you for your order, Sophia!</h2>
        <p>We've received your order <strong>#ORD-98421</strong> and our fulfillment center is preparing your items.</p>
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h4 style="margin-top: 0;">Order Summary</h4>
          <p>• Apex SonicPro ANC Wireless Headphones (x1) - $349.99</p>
          <p>• MagPeak 3-in-1 Fast Wireless Charging Station (x1) - $129.99</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0;"/>
          <p><strong>Total Paid: $470.87</strong> (Visa ending in 4242)</p>
        </div>
        <p>You can track your package anytime from your ApexStore account or using the Order Tracker.</p>
      </div>
    `
  },
  {
    id: 'notif-002',
    toEmail: 'customer@apexstore.com',
    subject: 'Your order #ORD-98421 is on its way with FedEx Express!',
    type: 'order_shipped',
    orderId: 'ord-1001',
    orderNumber: 'ORD-98421',
    timestamp: '2026-10-22T08:45:10.000Z',
    read: false,
    bodyHtml: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #059669;">Your ApexStore package has shipped!</h2>
        <p>Great news! FedEx Express has picked up order <strong>#ORD-98421</strong>.</p>
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Tracking Number:</strong> FX-884920194US</p>
          <p style="margin: 4px 0 0;"><strong>Carrier:</strong> FedEx Express</p>
          <p style="margin: 4px 0 0;"><strong>Estimated Delivery:</strong> Tomorrow by 4:00 PM</p>
        </div>
      </div>
    `
  }
];

class DatabaseEngine {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadOrInit();
  }

  private loadOrInit(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.products && parsed.orders && parsed.users) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing defaults:', err);
    }

    const initial: DatabaseSchema = {
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      users: INITIAL_USERS,
      notifications: INITIAL_NOTIFICATIONS,
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file to disk:', err);
    }
  }

  public resetToDefault(): DatabaseSchema {
    this.data = {
      categories: JSON.parse(JSON.stringify(INITIAL_CATEGORIES)),
      products: JSON.parse(JSON.stringify(INITIAL_PRODUCTS)),
      orders: JSON.parse(JSON.stringify(INITIAL_ORDERS)),
      users: JSON.parse(JSON.stringify(INITIAL_USERS)),
      notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS)),
    };
    this.saveData();
    return this.data;
  }

  // --- Products ---
  public getProducts(filter?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sort?: string;
  }): Product[] {
    let list = [...this.data.products];

    if (filter?.search) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filter?.category && filter.category !== 'all') {
      const catLower = filter.category.toLowerCase();
      list = list.filter(p => p.category.toLowerCase() === catLower || p.category.toLowerCase().includes(catLower));
    }

    if (filter?.minPrice !== undefined && !isNaN(filter.minPrice)) {
      list = list.filter(p => p.price >= filter.minPrice!);
    }

    if (filter?.maxPrice !== undefined && !isNaN(filter.maxPrice)) {
      list = list.filter(p => p.price <= filter.maxPrice!);
    }

    if (filter?.inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    if (filter?.sort) {
      switch (filter.sort) {
        case 'price-asc':
          list.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          list.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          list.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'popular':
        default:
          list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.reviewsCount - a.reviewsCount);
          break;
      }
    }

    return list;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id || p.slug === id);
  }

  public createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.products.unshift(newProduct);
    this.updateCategoryCounts();
    this.saveData();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.products[idx] = {
      ...this.data.products[idx],
      ...updates,
      id: this.data.products[idx].id, // prevent overwriting ID
    };
    this.updateCategoryCounts();
    this.saveData();
    return this.data.products[idx];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    const deleted = this.data.products.length < initialLen;
    if (deleted) {
      this.updateCategoryCounts();
      this.saveData();
    }
    return deleted;
  }

  private updateCategoryCounts() {
    this.data.categories.forEach(cat => {
      cat.itemCount = this.data.products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase()).length;
    });
  }

  // --- Categories ---
  public getCategories(): Category[] {
    this.updateCategoryCounts();
    return this.data.categories;
  }

  // --- Orders ---
  public getOrders(customerId?: string, status?: string): Order[] {
    let orders = [...this.data.orders];
    if (customerId) {
      orders = orders.filter(o => o.customerId === customerId);
    }
    if (status && status !== 'all') {
      orders = orders.filter(o => o.status === status);
    }
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return orders;
  }

  public getOrderById(idOrNumber: string): Order | undefined {
    return this.data.orders.find(o => o.id === idOrNumber || o.orderNumber.toLowerCase() === idOrNumber.toLowerCase());
  }

  public createOrder(orderInput: {
    customerId: string;
    customerEmail: string;
    customerName: string;
    shippingAddress: UserAddress;
    items: Order['items'];
    pricing: Order['pricing'];
    paymentMethod: 'credit_card' | 'paypal' | 'apple_pay';
    cardLast4?: string;
    cardBrand?: string;
  }): { order: Order; notification: EmailNotification } {
    // Validate stock and decrement
    for (const item of orderInput.items) {
      const prod = this.getProductById(item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date().toISOString();

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      customerId: orderInput.customerId,
      customerEmail: orderInput.customerEmail,
      customerName: orderInput.customerName,
      shippingAddress: orderInput.shippingAddress,
      items: orderInput.items,
      pricing: orderInput.pricing,
      payment: {
        method: orderInput.paymentMethod,
        status: 'completed',
        transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        cardLast4: orderInput.cardLast4 || '4242',
        cardBrand: orderInput.cardBrand || 'Visa',
      },
      status: 'placed',
      tracking: {
        carrier: 'Standard Delivery',
        trackingNumber: `APX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        estimatedDelivery: '3-5 business days',
        events: [
          {
            status: 'placed',
            title: 'Order Confirmed & Payment Verified',
            description: `Payment of $${orderInput.pricing.total.toFixed(2)} received via ${orderInput.paymentMethod.replace('_', ' ').toUpperCase()}.`,
            timestamp: now,
          }
        ]
      },
      emailSent: true,
      createdAt: now,
      updatedAt: now,
    };

    this.data.orders.unshift(order);

    // Auto-create confirmation email notification
    const notification: EmailNotification = {
      id: `notif-${Date.now()}`,
      toEmail: order.customerEmail,
      subject: `Order Confirmation: ${order.orderNumber} placed successfully!`,
      type: 'order_placed',
      orderId: order.id,
      orderNumber: order.orderNumber,
      timestamp: now,
      read: false,
      bodyHtml: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; padding: 20px;">
          <h2 style="color: #4f46e5; margin-bottom: 8px;">Order Confirmed: ${order.orderNumber}</h2>
          <p>Hi ${order.customerName},</p>
          <p>Thank you for choosing ApexStore! Your payment has been authorized and your items are now queued for fulfillment.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 16px; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Items Ordered</h3>
            ${order.items.map(it => `
              <div style="display: flex; justify-content: space-between; margin: 10px 0;">
                <span>${it.name} (x${it.quantity})</span>
                <strong>$${(it.price * it.quantity).toFixed(2)}</strong>
              </div>
            `).join('')}
            <div style="border-top: 1px dashed #cbd5e1; margin-top: 14px; padding-top: 12px;">
              <div style="display: flex; justify-content: space-between;"><span>Subtotal:</span><span>$${order.pricing.subtotal.toFixed(2)}</span></div>
              ${order.pricing.discount > 0 ? `<div style="display: flex; justify-content: space-between; color: #16a34a;"><span>Discount (${order.pricing.couponCode || 'Promo'}):</span><span>-$${order.pricing.discount.toFixed(2)}</span></div>` : ''}
              <div style="display: flex; justify-content: space-between;"><span>Estimated Tax:</span><span>$${order.pricing.tax.toFixed(2)}</span></div>
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; margin-top: 8px;"><span>Total:</span><span>$${order.pricing.total.toFixed(2)}</span></div>
            </div>
          </div>
          <div style="background: #f1f5f9; border-radius: 8px; padding: 14px; font-size: 14px;">
            <strong>Shipping to:</strong><br/>
            ${order.shippingAddress.fullName}<br/>
            ${order.shippingAddress.street}<br/>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}
          </div>
        </div>
      `,
    };

    this.data.notifications.unshift(notification);
    this.saveData();

    return { order, notification };
  }

  public updateOrderStatus(
    orderId: string,
    newStatus: Order['status'],
    trackingUpdate?: { carrier?: string; trackingNumber?: string; note?: string; location?: string }
  ): Order | null {
    const order = this.data.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    const now = new Date().toISOString();
    order.status = newStatus;
    order.updatedAt = now;

    if (trackingUpdate?.carrier) order.tracking.carrier = trackingUpdate.carrier;
    if (trackingUpdate?.trackingNumber) order.tracking.trackingNumber = trackingUpdate.trackingNumber;

    const eventTitleMap: Record<Order['status'], string> = {
      placed: 'Order Placed',
      processing: 'Order Being Processed & Packed',
      shipped: 'Order Shipped with Carrier',
      delivered: 'Package Successfully Delivered',
      cancelled: 'Order Cancelled & Refund Issued',
    };

    const newEvent = {
      status: newStatus,
      title: eventTitleMap[newStatus],
      description: trackingUpdate?.note || `Order status updated to ${newStatus}.`,
      timestamp: now,
      location: trackingUpdate?.location || 'Apex Hub',
    };

    order.tracking.events.push(newEvent);

    // Send status notification email
    const statusNotification: EmailNotification = {
      id: `notif-${Date.now()}`,
      toEmail: order.customerEmail,
      subject: `Order Update: ${order.orderNumber} is now ${newStatus.toUpperCase()}`,
      type: newStatus === 'shipped' ? 'order_shipped' : newStatus === 'delivered' ? 'order_delivered' : 'order_placed',
      orderId: order.id,
      orderNumber: order.orderNumber,
      timestamp: now,
      read: false,
      bodyHtml: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a; padding: 20px;">
          <h2 style="color: #4f46e5;">Update on your order #${order.orderNumber}</h2>
          <p>Your order status has changed to: <strong>${newStatus.toUpperCase()}</strong></p>
          <p>${trackingUpdate?.note || `Your order has progressed to ${newStatus}.`}</p>
          ${order.tracking.trackingNumber ? `
            <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Carrier:</strong> ${order.tracking.carrier || 'Standard'}</p>
              <p style="margin: 4px 0 0;"><strong>Tracking Number:</strong> ${order.tracking.trackingNumber}</p>
            </div>
          ` : ''}
        </div>
      `,
    };

    this.data.notifications.unshift(statusNotification);
    this.saveData();
    return order;
  }

  // --- Users & Auth ---
  public getUsers(): User[] {
    return this.data.users.map(({ passwordHash, ...rest }) => rest);
  }

  public getUserByEmail(email: string): (User & { passwordHash?: string }) | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    const user = this.data.users.find(u => u.id === id);
    if (!user) return undefined;
    const { passwordHash, ...rest } = user;
    return rest;
  }

  public registerUser(name: string, email: string, role: User['role'] = 'customer'): User {
    const existing = this.getUserByEmail(email);
    if (existing) {
      const { passwordHash, ...rest } = existing;
      return rest;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?auto=format&fit=crop&w=200&q=80`,
      createdAt: new Date().toISOString(),
      addresses: [],
    };

    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  // --- Notifications ---
  public getNotifications(email?: string): EmailNotification[] {
    if (!email) return this.data.notifications;
    return this.data.notifications.filter(n => n.toEmail.toLowerCase() === email.toLowerCase());
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.saveData();
      return true;
    }
    return false;
  }

  // --- Admin Stats ---
  public getAdminStats(): any {
    const totalRevenue = this.data.orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.pricing.total, 0);

    const totalOrders = this.data.orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const lowStockCount = this.data.products.filter(p => p.stock <= 10).length;

    // Sales by Category
    const categoryMap: Record<string, { count: number; revenue: number }> = {};
    for (const order of this.data.orders) {
      if (order.status === 'cancelled') continue;
      for (const item of order.items) {
        const prod = this.getProductById(item.productId);
        const cat = prod?.category || 'General';
        if (!categoryMap[cat]) categoryMap[cat] = { count: 0, revenue: 0 };
        categoryMap[cat].count += item.quantity;
        categoryMap[cat].revenue += item.price * item.quantity;
      }
    }

    const salesByCategory = Object.entries(categoryMap).map(([category, val]) => ({
      category,
      count: val.count,
      revenue: Math.round(val.revenue * 100) / 100,
    }));

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalProducts: this.data.products.length,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      lowStockCount,
      recentOrders: this.data.orders.slice(0, 5),
      salesByCategory,
    };
  }

  public getRawDump() {
    return this.data;
  }
}

export const db = new DatabaseEngine();
