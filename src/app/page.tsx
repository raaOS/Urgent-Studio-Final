
import { getProducts } from '@/services/productService';
import { mockProducts } from '@/lib/data';
import type { Banner, Product } from '@/lib/types';
import HomePageClient from '@/app/home-page-client';
import { getCapacitySettings } from '@/services/capacityService';
import { getWeeklyOrderCount } from '@/services/orderService';
import { getActiveBanners } from '@/services/bannerService';
import { isFirebaseConfigured } from '@/lib/firebase';
import { FirestoreNotConfiguredError } from '@/components/core/SetupError';

// Revalidate data at most every 5 minutes
export const revalidate = 300; 

export default async function Page() {

  // Pilar 1: Pertahanan Terhadap Error Konfigurasi.
  // Jika terjadi error 'database deleted', tampilkan panduan yang jelas.
  try {
    const productsPromise = getProducts();
    const capacityPromise = getCapacitySettings();
    const weeklyOrderCountPromise = getWeeklyOrderCount();
    const bannersPromise = getActiveBanners();

    let [initialProducts, capacitySettings, weeklyOrderCount, activeBanners] = await Promise.all([
      productsPromise,
      capacityPromise,
      weeklyOrderCountPromise,
      bannersPromise,
    ]);

    let isQuotaFull = false;
    if (capacitySettings.weekly > 0) {
      if (weeklyOrderCount >= capacitySettings.weekly) {
        isQuotaFull = true;
      }
    }
    
    // Fallback jika database sudah ada TAPI kosong
    if (initialProducts.length === 0 && isFirebaseConfigured) {
      console.log("INFO: Database kosong, produk tidak ditemukan. Anda bisa mengisi data contoh dari halaman /panel/owner/products.");
    } else if (initialProducts.length === 0 && !isFirebaseConfigured) {
      console.warn("INFO: Menampilkan produk dari data contoh (mockProducts) karena Firebase tidak terkonfigurasi.");
      initialProducts = mockProducts.map(p => ({...p}));
    }

    return <HomePageClient initialProducts={initialProducts} isQuotaFull={isQuotaFull} initialBanners={activeBanners} />;

  } catch (error) {
    // Periksa apakah error ini adalah error spesifik 'database deleted' dari Firestore.
    if (error instanceof Error && (error.message.includes('failed-precondition') || error.message.includes('database was deleted') || error.message.includes('permission-denied'))) {
      return <FirestoreNotConfiguredError />;
    }

    // Untuk semua error lainnya, log dan tampilkan data contoh agar aplikasi tidak crash.
    console.error("Terjadi error tak terduga saat mengambil data halaman utama. Menampilkan data contoh sebagai fallback:", error);
    const initialProducts = mockProducts.map(p => ({...p}));
    const isQuotaFull = false;
    const activeBanners: Banner[] = [];
    return <HomePageClient initialProducts={initialProducts} isQuotaFull={isQuotaFull} initialBanners={activeBanners} />;
  }
}
