
'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import type { Product } from '@/lib/types';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

type ProductCardProps = {
    product: Product;
    isQuotaFull?: boolean;
    onAddToCart: (product: Product) => void;
};

export function ProductCard({ product, isQuotaFull, onAddToCart }: ProductCardProps) {
    const price = product.price || product.prices.kakiLima;
    
    return (
      <Card className="overflow-hidden group flex flex-col h-full">
        <Dialog>
          <DialogTrigger asChild>
            <div className="relative aspect-square overflow-hidden cursor-pointer">
              <Image src={product.image} data-ai-hint={product.hint} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
            </div>
          </DialogTrigger>
          <DialogContent className="p-0 max-w-3xl">
            <VisuallyHidden>
              <DialogHeader>
                <DialogTitle>{product.name}</DialogTitle>
                <DialogDescription>{product.description}</DialogDescription>
              </DialogHeader>
            </VisuallyHidden>
             <Image src={product.image} data-ai-hint={product.hint} alt={product.name} width={1000} height={1000} className="rounded-lg w-full h-auto"/>
          </DialogContent>
        </Dialog>
        
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg font-headline">{product.name}</h3>
            <div className="my-2">
              <p className="text-xl font-bold text-primary">Rp{price.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <Button 
            className="w-full mt-4" 
            disabled={isQuotaFull}
            onClick={() => onAddToCart(product)}
          >
              {isQuotaFull ? 'Kuota Penuh' : (
                  <>
                      <Plus className="h-4 w-4 mr-2" /> Tambahkan
                  </>
              )}
          </Button>
        </CardContent>
      </Card>
    );
  };

    
