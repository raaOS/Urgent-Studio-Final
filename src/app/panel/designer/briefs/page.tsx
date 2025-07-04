
import { getOrders, sendDraftToClient } from '@/services/orderService';
import BriefsClient from '@/components/panel/briefs-client';
import type { OrderStatus } from '@/lib/types';

const relevantStatuses: OrderStatus[] = [
  'Menunggu Antrian',
  'Dalam Pengerjaan',
  'Menunggu Pengiriman Draf',
  'Menunggu Respon Klien',
  'Menunggu Input Revisi',
  'G-Meet Terjadwal',
  'Selesai',
  'Dibatalkan (Refund Pra-Lunas)',
  'Dibatalkan (Refund Pra-DP)',
  'Dibatalkan (Refund Pasca-Lunas)',
  'Dibatalkan (Refund Pasca-DP)',
];

export default async function DesignerBriefsPage() {
  const allOrders = await getOrders();
  const designerOrders = allOrders.filter(o => relevantStatuses.includes(o.status));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Brief & Status Pesanan</h1>
        <p className="text-muted-foreground">Lihat brief dari klien dan perbarui status pesanan.</p>
      </div>
      <BriefsClient 
        initialOrders={designerOrders} 
        sendDraftAction={sendDraftToClient}
      />
    </div>
  );
}
