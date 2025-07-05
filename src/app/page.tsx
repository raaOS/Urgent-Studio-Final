
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

    // Pengecekan paling awal: apakah konfigurasi Firebase bahkan ada?
    if (!isFirebaseConfigured) {
        console.warn("INFO: Menampilkan produk dari data contoh (mockProducts) karena Firebase tidak terkonfigurasi.");
        const initialProducts = mockProducts.map(p => ({...p}));
        return <HomePageClient initialProducts={initialProducts} isQuotaFull={false} initialBanners={[]} />;
    }

    // Jika konfigurasi ADA, coba hubungi database.
    try {
        const productsPromise = getProducts();
        const capacityPromise = getCapacitySettings();
        const weeklyOrderCountPromise = getWeeklyOrderCount();
        const bannersPromise = getActiveBanners();

        const [initialProducts, capacitySettings, weeklyOrderCount, activeBanners] = await Promise.all([
            productsPromise,
            capacityPromise,
            weeklyOrderCountPromise,
            bannersPromise,
        ]);

        let isQuotaFull = false;
        if (capacitySettings.weekly > 0) {
            isQuotaFull = weeklyOrderCount >= capacitySettings.weekly;
        }
        
        // Fallback jika database sudah ada TAPI kosong
        if (initialProducts.length === 0) {
          console.log("INFO: Database kosong, produk tidak ditemukan. Anda bisa mengisi data contoh dari halaman /panel/owner/products.");
        }

        return <HomePageClient initialProducts={initialProducts} isQuotaFull={isQuotaFull} initialBanners={activeBanners} />;

    } catch (error) {
        const errorMessage = (error as Error)?.message || '';
        const errorCode = (error as { code?: string })?.code || '';

        // Periksa apakah ini adalah error konfigurasi Firestore yang umum.
        if (
            errorMessage.includes('failed-precondition') ||
            errorMessage.includes('database was deleted') ||
            errorMessage.includes('permission-denied') ||
            errorCode === 'failed-precondition'
        ) {
          // Ini adalah error yang diharapkan jika DB belum dibuat. Tampilkan panduan.
          return <FirestoreNotConfiguredError />;
        }

        // Untuk semua error lainnya yang tidak terduga, log dan tampilkan data contoh agar aplikasi tidak crash.
        console.error("Terjadi error tak terduga saat mengambil data halaman utama. Menampilkan data contoh sebagai fallback:", error);
        const initialProducts = mockProducts.map(p => ({...p}));
        return <HomePageClient initialProducts={initialProducts} isQuotaFull={false} initialBanners={[]} />;
    }
}
