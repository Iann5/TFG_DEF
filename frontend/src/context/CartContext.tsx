import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ProductoRaw } from '../types/producto';
import { useAuth } from './AuthContext';

export interface PackCartItem {
  id: number;
  titulo: string;
  imagen?: string;
  precioOriginal: number;
  precioOferta: number | null;
  stock?: number;
}

export interface CartItem {
  tipo: 'producto' | 'pack';
  producto?: ProductoRaw;
  pack?: PackCartItem;
  cantidad: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (producto: ProductoRaw, cantidad?: number) => void;
  addPackToCart: (pack: PackCartItem, cantidad?: number) => void;
  removeFromCart: (id: number, tipo?: CartItem['tipo']) => void;
  updateQuantity: (id: number, cantidad: number, tipo?: CartItem['tipo']) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth();

  const getCartKey = () => {
    const user = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'guest';
    return `tattoo_cart_${user}`;
  };

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(getCartKey());
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Escuchar a los cambios de sesión (login/logout de AuthContext) para repintar/restaurar el carrito correcto
  useEffect(() => {
    const saved = localStorage.getItem(getCartKey());
    if (saved) {
      try {
        setCart(JSON.parse(saved));
        return;
      } catch (e) { /* silent fail */ }
    }
    setCart([]);
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(cart));
  }, [cart, isLoggedIn]);

  const getItemId = (item: CartItem): number => {
    if (item.tipo === 'producto') return item.producto?.id ?? -1;
    return item.pack?.id ?? -1;
  };

  const getUnitPrice = (item: CartItem): number => {
    if (item.tipo === 'producto') {
      const p = item.producto;
      if (!p) return 0;
      return p.precioOferta ?? p.precio_oferta ?? p.precioOriginal ?? p.precio_original ?? 0;
    }
    const pk = item.pack;
    if (!pk) return 0;
    return pk.precioOferta ?? pk.precioOriginal ?? 0;
  };

  const getStockLimit = (item: CartItem): number | null => {
    if (item.tipo === 'producto') {
      const p: any = item.producto;
      const raw = p?.stock;
      return typeof raw === 'number' ? raw : null;
    }
    const raw = item.pack?.stock;
    return typeof raw === 'number' ? raw : null;
  };

  const clampQuantity = (desired: number, stockLimit: number | null): number => {
    if (desired <= 0) return 0;
    if (stockLimit === null) return desired;
    return Math.max(0, Math.min(desired, stockLimit));
  };

  const addToCart = (producto: ProductoRaw, cantidad: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.tipo === 'producto' && item.producto?.id === producto.id);
      const stockLimit = typeof (producto as any).stock === 'number' ? (producto as any).stock : null;
      if (existing) {
        return prev.map(item =>
          item.tipo === 'producto' && item.producto?.id === producto.id
            ? { ...item, cantidad: clampQuantity(item.cantidad + cantidad, stockLimit) }
            : item
        );
      }
      const nuevaCantidad = clampQuantity(cantidad, stockLimit);
      if (nuevaCantidad <= 0) return prev;
      return [...prev, { tipo: 'producto', producto, cantidad: nuevaCantidad }];
    });
  };

  const addPackToCart = (pack: PackCartItem, cantidad: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.tipo === 'pack' && item.pack?.id === pack.id);
      const stockLimit = typeof pack.stock === 'number' ? pack.stock : null;
      if (existing) {
        return prev.map(item =>
          item.tipo === 'pack' && item.pack?.id === pack.id
            ? { ...item, cantidad: clampQuantity(item.cantidad + cantidad, stockLimit) }
            : item
        );
      }
      const nuevaCantidad = clampQuantity(cantidad, stockLimit);
      if (nuevaCantidad <= 0) return prev;
      return [...prev, { tipo: 'pack', pack, cantidad: nuevaCantidad }];
    });
  };

  const removeFromCart = (id: number, tipo: CartItem['tipo'] = 'producto') => {
    setCart(prev => prev.filter(item => !(item.tipo === tipo && getItemId(item) === id)));
  };

  const updateQuantity = (id: number, cantidad: number, tipo: CartItem['tipo'] = 'producto') => {
    if (cantidad <= 0) {
      removeFromCart(id, tipo);
      return;
    }
    setCart(prev => prev.map(item => {
      if (!(item.tipo === tipo && getItemId(item) === id)) return item;
      const stockLimit = getStockLimit(item);
      return { ...item, cantidad: clampQuantity(cantidad, stockLimit) };
    }));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + getUnitPrice(item) * item.cantidad, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, addPackToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
