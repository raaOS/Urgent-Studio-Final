
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, Info, AlertTriangle, Send, Loader2 } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, differenceInDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { sendRemindersToStalledOrders } from '@/services/orderService';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const STALE_ORDER_THRESHOLD_DAYS = 3;
const AT_RISK_STATUSES: OrderStatus[] = [
  'Menunggu Pembayaran',
  'Menunggu Konfirmasi',
  'Menunggu Respon Klien',
  'Menunggu Input Revisi',
  'G-Meet Terjadwal'
];

function OrderList({ orders }: { orders: Order[] }) {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Info className="mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-semibold">Tidak Ada Pesanan</h3>
        <p className="mt-1 text-sm">Tidak ada pesanan untuk ditampilkan di kategori ini.</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kode Order</TableHead>
              <TableHead>Klien</TableHead>
              <TableHead>Update Terakhir</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const daysSinceUpdate = differenceInDays(new Date(), new Date(order.updatedAt));
              const isAtRisk = AT_RISK_STATUSES.includes(order.status) && daysSinceUpdate >= STALE_ORDER_THRESHOLD_DAYS;
              return (
                <TableRow key={order.id || order.orderCode} className={isAtRisk ? "bg-amber-50" : ""}>
                  <TableCell className="font-code font-semibold">{order.orderCode}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {hasMounted ? (
                        <span>{format(new Date(order.updatedAt), "d MMM yyyy", { locale: idLocale })}</span>
                      ) : (
                        <Skeleton className="h-4 w-24" />
                      )}
                       {isAtRisk && (
                         <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> macet {daysSinceUpdate} hari</span>
                       )}
                    </div>
                  </TableCell>
                  <TableCell>Rp{order.totalAmount.toLocaleString('id-ID')}</TableCell>
                  <TableCell><Badge variant={order.status === 'Selesai' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/panel/owner/orders/${order.orderCode}`}>
                        <Eye className="mr-2 h-3 w-3" /> Detail
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-4">
        {orders.map((order) => {
          const daysSinceUpdate = differenceInDays(new Date(), new Date(order.updatedAt));
          const isAtRisk = AT_RISK_STATUSES.includes(order.status) && daysSinceUpdate >= STALE_ORDER_THRESHOLD_DAYS;
          return (
            <Card key={order.id || order.orderCode} className={`p-4 ${isAtRisk ? "bg-amber-50 border-amber-200" : ""}`}>
              {isAtRisk && (
                <div className="text-xs text-amber-700 font-bold flex items-center gap-1.5 mb-2 pb-2 border-b border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  Butuh Perhatian (Macet {daysSinceUpdate} hari)
                </div>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-code font-bold">{order.orderCode}</p>
                  <p className="text-sm text-muted-foreground">{order.customerName}</p>
                </div>
                <Badge variant={order.status === 'Selesai' ? 'default' : 'secondary'}>{order.status}</Badge>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between items-center text-sm">
                <div className="text-muted-foreground">
                  {hasMounted ? (
                    `Update: ${format(new Date(order.updatedAt), "d MMMM yyyy", { locale: idLocale })}`
                  ) : (
                    <Skeleton className="h-4 w-32" />
                  )}
                </div>
                <div className="font-semibold">
                  Rp{order.totalAmount.toLocaleString('id-ID')}
                </div>
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href={`/panel/owner/orders/${order.orderCode}`}>Lihat Detail Lengkap</Link>
              </Button>
            </Card>
          )
        })}
      </div>
    </>
  );
}

export default function OrderDashboard({ initialOrders }: { initialOrders: Order[] }) {
  const { toast } = useToast();
  const [isSendingReminders, setIsSendingReminders] = React.useState(false);

  const sortedOrders = React.useMemo(() => 
    [...initialOrders].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
  }), [initialOrders]);

  const atRiskOrders = React.useMemo(() => 
    sortedOrders.filter(order => {
    const daysSinceUpdate = differenceInDays(new Date(), new Date(order.updatedAt));
    return AT_RISK_STATUSES.includes(order.status) && daysSinceUpdate >= STALE_ORDER_THRESHOLD_DAYS;
  }), [sortedOrders]);

  const handleSendReminders = async () => {
    setIsSendingReminders(true);
    try {
      const result = await sendRemindersToStalledOrders();
      if (result.success) {
        toast({
          title: "Sukses!",
          description: `${result.remindersSent} pengingat telah dikirim ke pelanggan.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Gagal Mengirim",
          description: result.error || "Terjadi kesalahan yang tidak diketahui.",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsSendingReminders(false);
    }
  };

  return (
    <Tabs defaultValue="all">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="all">Semua Pesanan ({sortedOrders.length})</TabsTrigger>
        <TabsTrigger value="at-risk" className="flex items-center gap-2">
          Butuh Perhatian <AlertTriangle className="h-4 w-4 text-amber-500"/> ({atRiskOrders.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Semua Pesanan</CardTitle>
            <CardDescription>
              Menampilkan {sortedOrders.length} pesanan terbaru berdasarkan update terakhir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderList orders={sortedOrders} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="at-risk" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span>Pesanan Butuh Perhatian</span>
              <Button onClick={handleSendReminders} disabled={isSendingReminders || atRiskOrders.length === 0}>
                {isSendingReminders ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                Kirim Pengingat ke Semua ({atRiskOrders.length})
              </Button>
            </CardTitle>
            <CardDescription>
              Pesanan berikut tidak ada progres selama lebih dari {STALE_ORDER_THRESHOLD_DAYS} hari. Klik tombol di atas untuk mengirim pengingat otomatis ke semua pelanggan dalam daftar ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrderList orders={atRiskOrders} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
