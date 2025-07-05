
'use client';

import { CartProvider } from '@/context/CartContext';
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from '@/components/core/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </ErrorBoundary>
  );
}
