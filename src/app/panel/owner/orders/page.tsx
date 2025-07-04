
import * as React from 'react';
import { getOrders } from '@/services/orderService';
import OrderDashboard from '@/components/panel/order-dashboard';

export default async function OrdersPage() {
  const allOrders = await getOrders();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Kontrol Pesanan</h1>
        <p className="text-muted-foreground">Kelola semua pesanan yang masuk ke sistem. Klik untuk melihat detail.</p>
      </div>
      <OrderDashboard initialOrders={allOrders} />
    </div>
  );
}
