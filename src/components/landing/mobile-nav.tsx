'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function MobileNav() {
    const { totalItems } = useCart();
    return (
        <div className="md:hidden fixed bottom-4 right-4 z-50 flex flex-col gap-3">
            <Button size="icon" className="rounded-full shadow-lg h-14 w-14" asChild>
                <Link href="/checkout">
                  <ShoppingCart/>
                  {totalItems > 0 && <Badge className="absolute -top-1 -right-1 h-6 w-6 justify-center" variant="destructive">{totalItems}</Badge>}
                </Link>
            </Button>
        </div>
    );
}
