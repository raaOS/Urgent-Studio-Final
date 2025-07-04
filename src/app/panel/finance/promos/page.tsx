
import { getPromos } from '@/services/promoService';
import { getProducts } from '@/services/productService';
import PromosClient from '@/components/panel/promos-client';

export default async function PromosPage() {
  const [promos, products] = await Promise.all([
    getPromos(),
    getProducts()
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Kontrol Promo</h1>
        <p className="text-muted-foreground">
          Kelola promo diskon untuk produk tertentu.
        </p>
      </div>
      <PromosClient initialPromos={promos} products={products} />
    </div>
  );
}
