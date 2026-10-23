import { Product, Order, Category, User, EmailNotification, AdminStats } from '../types/index.ts';

const BASE_URL = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network request failed' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Products
  async getProducts(params?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
  }): Promise<{ products: Product[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.minPrice !== undefined) query.append('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) query.append('maxPrice', params.maxPrice.toString());
    if (params?.inStock) query.append('inStock', 'true');
    if (params?.sort) query.append('sort', params.sort);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ products: Product[]; count: number }>(`/products${qs}`);
  },

  async getProduct(id: string): Promise<{ product: Product }> {
    return request<{ product: Product }>(`/products/${id}`);
  },

  async createProduct(data: Partial<Product>): Promise<{ product: Product }> {
    return request<{ product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ product: Product }> {
    return request<{ product: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProduct(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    return request<{ categories: Category[] }>('/categories');
  },

  // Orders
  async getOrders(params?: { customerId?: string; status?: string }): Promise<{ orders: Order[]; count: number }> {
    const query = new URLSearchParams();
    if (params?.customerId) query.append('customerId', params.customerId);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{ orders: Order[]; count: number }>(`/orders${qs}`);
  },

  async getOrder(id: string): Promise<{ order: Order }> {
    return request<{ order: Order }>(`/orders/${id}`);
  },

  async createOrder(data: {
    customerId: string;
    customerEmail: string;
    customerName: string;
    shippingAddress: any;
    items: any[];
    pricing: any;
    paymentMethod: string;
    cardLast4?: string;
    cardBrand?: string;
  }): Promise<{ order: Order; notification: EmailNotification }> {
    return request<{ order: Order; notification: EmailNotification }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateOrderStatus(
    id: string,
    data: { status: string; carrier?: string; trackingNumber?: string; note?: string; location?: string }
  ): Promise<{ order: Order }> {
    return request<{ order: Order }>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Auth
  async login(email: string): Promise<{ user: User; token: string }> {
    return request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async register(name: string, email: string, role: string = 'customer'): Promise<{ user: User; token: string }> {
    return request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, role }),
    });
  },

  async getUsers(): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/auth/users');
  },

  // Notifications
  async getNotifications(email?: string): Promise<{ notifications: EmailNotification[] }> {
    const qs = email ? `?email=${encodeURIComponent(email)}` : '';
    return request<{ notifications: EmailNotification[] }>(`/notifications${qs}`);
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  // Admin Stats
  async getAdminStats(): Promise<{ stats: AdminStats }> {
    return request<{ stats: AdminStats }>('/admin/stats');
  },

  // Raw Database Inspector
  async getRawDb(): Promise<{ data: any }> {
    return request<{ data: any }>('/db/export');
  },

  async resetDatabase(): Promise<{ message: string; data: any }> {
    return request<{ message: string; data: any }>('/db/reset', {
      method: 'POST',
    });
  },
};
