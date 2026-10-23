import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types/index.ts';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedColor?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  couponCode: string;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  shipping: number;
  tax: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('apex_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('apex_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity: number = 1, selectedColor?: string) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock, existing.quantity + quantity);
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity), selectedColor }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev =>
      prev.map(item => {
        if (item.product.id === productId) {
          const validQty = Math.min(item.product.stock, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Discount calculation
  let discount = 0;
  if (appliedCoupon === 'SAVE10') {
    discount = subtotal * 0.10;
  } else if (appliedCoupon === 'APEX20') {
    discount = Math.min(subtotal, 20.00);
  } else if (appliedCoupon === 'FREESHIP') {
    discount = 0; // handled in shipping
  }

  // Shipping: free over $100 or if coupon FREESHIP
  const shipping = subtotal === 0 || subtotal >= 100 || appliedCoupon === 'FREESHIP' ? 0 : 15.00;
  // Tax: 8% on net subtotal
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Math.round(taxableAmount * 0.08 * 100) / 100;
  const total = Math.max(0, taxableAmount + shipping + tax);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (clean === 'SAVE10') {
      setAppliedCoupon('SAVE10');
      return { success: true, message: 'Coupon applied: 10% discount on order!' };
    }
    if (clean === 'APEX20') {
      setAppliedCoupon('APEX20');
      return { success: true, message: 'Coupon applied: $20 discount!' };
    }
    if (clean === 'FREESHIP') {
      setAppliedCoupon('FREESHIP');
      return { success: true, message: 'Coupon applied: Free shipping activated!' };
    }
    return { success: false, message: 'Invalid coupon code. Try SAVE10, APEX20, or FREESHIP' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        discount,
        couponCode: appliedCoupon || '',
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        shipping,
        tax,
        total,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
