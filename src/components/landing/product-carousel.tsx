

'use client';

import * as React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Product } from '@/lib/types';
import { ProductCard } from '@/components/landing/product-card';

interface ProductCarouselProps {
  category: string;
  products: Product[];
  isQuotaFull: boolean;
  onAddToCart: (product: Product) => void;
}

export function ProductCarousel({ category, products, isQuotaFull, onAddToCart }: ProductCarouselProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="text-2xl md:text-3xl font-bold font-headline mb-4 animated-gradient-text inline-block">
        {category}
      </h3>
      <Carousel
        opts={{
          align: 'start',
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {products.map((product) => (
            <CarouselItem key={product.id} className="pl-4 basis-[75%] sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <ProductCard
                product={product}
                isQuotaFull={isQuotaFull}
                onAddToCart={onAddToCart}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 hidden md:flex z-10" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex z-10" />
      </Carousel>
    </section>
  );
}
