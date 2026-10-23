import express, { Request, Response } from 'express';
import { db } from './db.ts';

export const apiRouter = express();

apiRouter.use(express.json());

// --- Products API ---
apiRouter.get('/products', (req: Request, res: Response) => {
  try {
    const { search, category, minPrice, maxPrice, inStock, sort } = req.query;
    const products = db.getProducts({
      search: typeof search === 'string' ? search : undefined,
      category: typeof category === 'string' ? category : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStockOnly: inStock === 'true',
      sort: typeof sort === 'string' ? sort : undefined,
    });
    res.json({ success: true, count: products.length, products });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/products/:id', (req: Request, res: Response) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/products', (req: Request, res: Response) => {
  try {
    const { name, description, price, category, brand, stock, images, specs, tags, featured, originalPrice } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ success: false, error: 'Name, price, and category are required' });
    }
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct = db.createProduct({
      name,
      slug,
      description: description || '',
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      brand: brand || 'ApexStore',
      rating: 5.0,
      reviewsCount: 1,
      stock: Number(stock) || 0,
      images: Array.isArray(images) && images.length ? images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80'],
      specs: specs || {},
      tags: tags || [],
      featured: Boolean(featured),
    });
    res.status(201).json({ success: true, product: newProduct });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.put('/products/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.delete('/products/:id', (req: Request, res: Response) => {
  try {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Categories API ---
apiRouter.get('/categories', (_req: Request, res: Response) => {
  try {
    const categories = db.getCategories();
    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Orders API ---
apiRouter.get('/orders', (req: Request, res: Response) => {
  try {
    const { customerId, status } = req.query;
    const orders = db.getOrders(
      typeof customerId === 'string' ? customerId : undefined,
      typeof status === 'string' ? status : undefined
    );
    res.json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  try {
    const order = db.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const {
      customerId,
      customerEmail,
      customerName,
      shippingAddress,
      items,
      pricing,
      paymentMethod,
      cardLast4,
      cardBrand,
    } = req.body;

    if (!items || !items.length || !pricing || !shippingAddress) {
      return res.status(400).json({ success: false, error: 'Missing required order fields' });
    }

    const { order, notification } = db.createOrder({
      customerId: customerId || 'user-customer-01',
      customerEmail: customerEmail || 'customer@apexstore.com',
      customerName: customerName || 'Valued Customer',
      shippingAddress,
      items,
      pricing,
      paymentMethod: paymentMethod || 'credit_card',
      cardLast4,
      cardBrand,
    });

    res.status(201).json({ success: true, order, notification });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.patch('/orders/:id/status', (req: Request, res: Response) => {
  try {
    const { status, carrier, trackingNumber, note, location } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const updatedOrder = db.updateOrderStatus(req.params.id, status, {
      carrier,
      trackingNumber,
      note,
      location,
    });

    if (!updatedOrder) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Auth API ---
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid user credentials' });
    }

    const { passwordHash, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
      token: `apex-token-${safeUser.id}-${Date.now()}`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    const user = db.registerUser(name, email, role || 'customer');
    res.status(201).json({
      success: true,
      user,
      token: `apex-token-${user.id}-${Date.now()}`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.get('/auth/users', (_req: Request, res: Response) => {
  try {
    const users = db.getUsers();
    res.json({ success: true, users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Notifications API ---
apiRouter.get('/notifications', (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    const notifications = db.getNotifications(typeof email === 'string' ? email : undefined);
    res.json({ success: true, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.patch('/notifications/:id/read', (req: Request, res: Response) => {
  try {
    const ok = db.markNotificationAsRead(req.params.id);
    res.json({ success: ok });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Admin Stats ---
apiRouter.get('/admin/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getAdminStats();
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- DB Tools (Developer inspection) ---
apiRouter.get('/db/export', (_req: Request, res: Response) => {
  try {
    const data = db.getRawDump();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

apiRouter.post('/db/reset', (_req: Request, res: Response) => {
  try {
    const data = db.resetToDefault();
    res.json({ success: true, message: 'Database reset to default seed', data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});
