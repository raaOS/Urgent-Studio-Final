
import { getProducts } from '@/services/productService';
import { mockProducts } from '@/lib/data';
import type { Banner, Product } from '@/lib/types';
import HomePageClient from '@/app/home-page-client';
import { getCapacitySettings } from '@/services/capacityService';
import { getWeeklyOrderCount } from '@/services/orderService';
import { getActiveBanners } from '@/services/bannerService';
import { isFirebaseConfigured } from '@/lib/firebase';

// Revalidate data at most every 5 minutes
export const revalidate = 300; 

export default async function Page() {
  let initialProducts: Product[] = [];
  let isQuotaFull = false;
  let activeBanners: Banner[] = [];

  try {
    // Pilar 2: Pertahanan Terhadap Kegagalan Eksternal. Semua pemanggilan data dibungkus try...catch.
    const productsPromise = getProducts();
    const capacityPromise = getCapacitySettings();
    const weeklyOrderCountPromise = getWeeklyOrderCount();
    const bannersPromise = getActiveBanners();

    const [dbProducts, capacitySettings, weeklyOrderCount, banners] = await Promise.all([
      productsPromise,
      capacityPromise,
      weeklyOrderCountPromise,
      bannersPromise,
    ]);

    activeBanners = banners;

    if (dbProducts.length > 0) {
        initialProducts = dbProducts;
    } else {
        // Fallback jika database kosong atau tidak terkonfigurasi
        if (!isFirebaseConfigured) {
          console.warn("INFO: Menampilkan produk dari data contoh (mockProducts) karena Firebase tidak terkonfigurasi.");
        }
        initialProducts = mockProducts.map(p => ({...p}));
    }

    // --- Real-time Quota Calculation (Optimized) ---
    if (capacitySettings.weekly > 0) {
      if (weeklyOrderCount >= capacitySettings.weekly) {
        isQuotaFull = true;
      }
    }
    // --- End Quota Calculation ---

  } catch (error) {
    console.warn("Gagal mengambil data dari server, menampilkan data contoh sebagai fallback:", error);
    // Jika terjadi error, aplikasi tidak crash, tapi menggunakan data cadangan.
    initialProducts = mockProducts.map(p => ({...p}));
    isQuotaFull = false; // Default to not full on error
    activeBanners = []; // Default to empty on error
  }
  
  return <HomePageClient initialProducts={initialProducts} isQuotaFull={isQuotaFull} initialBanners={activeBanners} />;
}
