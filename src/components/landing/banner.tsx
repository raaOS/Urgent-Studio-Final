
'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import type { Banner as BannerType } from '@/lib/types';
import Link from 'next/link';

export function Banner({ banners }: { banners: BannerType[] }) {

  if (banners.length === 0) {
    // Fallback content if no active banners
    return (
      <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden bg-primary/20">
        <Image
          src="https://placehold.co/1200x400.png"
          alt="Banner Standar"
          fill
          className="object-cover"
          data-ai-hint="graphic design studio"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-8">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 font-headline">
            Artisant Design Studio
          </h2>
          <p className="text-white text-lg">
            Solusi desain kreatif untuk semua kebutuhan Anda.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Carousel
      className="w-full"
      opts={{ loop: banners.length > 1 }}
    >
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={banner.id}>
             <Link href={banner.link || '#'} target={banner.link ? '_blank' : '_self'}>
                <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden bg-primary/20">
                <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-cover"
                    data-ai-hint="promotion banner"
                    priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 font-headline">
                    {banner.title}
                    </h2>
                </div>
                </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      {banners.length > 1 && (
        <>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2" />
        </>
      )}
    </Carousel>
  );
}
