
import { getCoupons } from '@/services/couponService';
import CouponsClient from '@/components/panel/coupons-client';

export default async function CouponsPage() {
  const coupons = await getCoupons();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Kontrol Kupon</h1>
        <p className="text-muted-foreground">
          Kelola kode kupon diskon untuk pelanggan.
        </p>
      </div>
      <CouponsClient initialCoupons={coupons} />
    </div>
  );
}
