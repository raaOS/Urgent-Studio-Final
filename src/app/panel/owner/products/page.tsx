
import { getProducts } from '@/services/productService';
import ProductsClient from '@/components/panel/products-client';

export default async function ProductsPage() {
  const products = await getProducts();
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Kontrol Produk</h1>
        <p className="text-muted-foreground">
          Kelola produk desain yang akan tampil di halaman utama.
        </p>
      </div>
      <ProductsClient initialProducts={products} />
    </div>
  );
}
