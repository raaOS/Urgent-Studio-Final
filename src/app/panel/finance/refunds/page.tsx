
import { getRefunds } from '@/services/refundService';
import RefundsClient from '@/components/panel/refunds-client';

export default async function RefundsPage() {
  const refunds = await getRefunds();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Manajemen Refund</h1>
        <p className="text-muted-foreground">
          Lihat riwayat refund yang telah diproses.
        </p>
      </div>
      <RefundsClient initialRefunds={refunds} />
    </div>
  );
}
