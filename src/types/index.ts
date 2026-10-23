export type UserRole = 'admin' | 'customer';

export interface UserAddress {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  addresses?: UserAddress[];
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  images: string[];
  featured?: boolean;
  tags?: string[];
  specs?: Record<string, string>;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderTrackingEvent {
  status: OrderStatus;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderPricing {
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
}

export interface OrderPayment {
  method: 'credit_card' | 'paypal' | 'apple_pay';
  status: 'pending' | 'completed' | 'failed';
  transactionId: string;
  cardLast4?: string;
  cardBrand?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  shippingAddress: UserAddress;
  items: OrderItem[];
  pricing: OrderPricing;
  payment: OrderPayment;
  status: OrderStatus;
  tracking: {
    carrier?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    events: OrderTrackingEvent[];
  };
  emailSent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailNotification {
  id: string;
  toEmail: string;
  subject: string;
  bodyHtml: string;
  type: 'order_placed' | 'order_shipped' | 'order_delivered' | 'order_cancelled';
  orderId: string;
  orderNumber: string;
  timestamp: string;
  read: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  itemCount: number;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  lowStockCount: number;
  recentOrders: Order[];
  salesByCategory: { category: string; count: number; revenue: number }[];
}
