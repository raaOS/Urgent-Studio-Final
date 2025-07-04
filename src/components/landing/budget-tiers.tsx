'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TierName = 'Kaki Lima' | 'UMKM' | 'E-Commerce';

const tiers: { name: TierName; description: string; image: string; hint: string; }[] = [
  {
    name: "Kaki Lima",
    description: "Desain cepat dan terjangkau untuk kebutuhan esensial. Fokus pada kecepatan dan fungsionalitas dasar.",
    image: "https://placehold.co/600x400.png",
    hint: "street food cart"
  },
  {
    name: "UMKM",
    description: "Paket seimbang untuk bisnis yang sedang berkembang. Kualitas visual yang lebih baik dengan beberapa opsi.",
    image: "https://placehold.co/600x400.png",
    hint: "small business storefront"
  },
  {
    name: "E-Commerce",
    description: "Solusi branding komprehensif untuk kehadiran online yang kuat dan profesional di pasar.",
    image: "https://placehold.co/600x400.png",
    hint: "modern online store"
  }
];

interface BudgetTiersProps {
  selectedTier: TierName;
  onSelectTier: (tierName: TierName) => void;
}

export function BudgetTiers({ selectedTier, onSelectTier }: BudgetTiersProps) {
  return (
    <div className="text-center">
      <h2 className="text-3xl md:text-4xl font-bold font-headline">Pilih Level Kebutuhan Anda</h2>
      <p className="text-muted-foreground mt-2 text-lg max-w-2xl mx-auto">
        Pilihan Anda akan menyesuaikan harga produk di bawah secara otomatis.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
        {tiers.map((tier) => (
          <Card 
            key={tier.name} 
            onClick={() => onSelectTier(tier.name)}
            className={cn(
              "flex flex-col text-left transform hover:scale-105 transition-all duration-300 cursor-pointer",
              selectedTier === tier.name ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"
            )}
          >
            <CardHeader className="p-0">
              <div className="relative aspect-video">
                <Image
                  src={tier.image}
                  alt={tier.name}
                  fill
                  className="object-cover rounded-t-lg"
                  data-ai-hint={tier.hint}
                />
              </div>
              <div className="p-6 pb-2">
                <CardTitle className="font-headline text-2xl">{tier.name}</CardTitle>
                <CardDescription className="mt-2 min-h-[4rem]">{tier.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col justify-end p-6 pt-2">
               <p className="text-sm font-semibold text-primary">
                 {selectedTier === tier.name ? 'Terpilih' : 'Pilih Level Ini'}
               </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
