
import { getBanners } from '@/services/bannerService';
import BannersClient from '@/components/panel/banners-client';

export default async function BannersPage() {
  const banners = await getBanners();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Kontrol Banner</h1>
        <p className="text-muted-foreground">
          Kelola banner promosi yang tampil di halaman utama.
        </p>
      </div>
      <BannersClient initialBanners={banners} />
    </div>
  );
}
