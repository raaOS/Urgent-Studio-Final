
'use client';

import * as React from 'react';
import type { Product, CartItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, budgetTier: 'Kaki Lima' | 'UMKM' | 'E-Commerce', details: { brief: string; driveLink: string; dimensions: string }) => void;
  removeFromCart: (cartItemId: string) => void;
  cartSubtotal: number;
  totalItems: number;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const { toast } = useToast();

  const addToCart = (product: Product, budgetTier: 'Kaki Lima' | 'UMKM' | 'E-Commerce', details: { brief: string; driveLink: string; dimensions: string }) => {
    const newItem: CartItem = {
      id: `${product.id}-${Date.now()}`, // Create a unique ID for each cart instance
      product: {
        ...product,
        price: product.price // Ensure the adjusted price is carried over
      },
      budgetTier: budgetTier,
      ...details,
    };
    
    setCart(prevCart => [...prevCart, newItem]);

    toast({
      title: "Sukses!",
      description: `${product.name} (${budgetTier}) telah ditambahkan ke keranjang.`,
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(cart.filter(item => item.id !== cartItemId));
    toast({
        title: "Item Dihapus",
        description: "Item telah dihapus dari keranjang Anda.",
        variant: "destructive"
    });
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price || 0), 0);
  const totalItems = cart.length;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartSubtotal, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = React.useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
