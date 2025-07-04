
'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Search, Loader2, Frown, CheckCircle2, Clock } from 'lucide-react';
import type { Order } from '@/lib/types';
import { Badge } from '../ui/badge';
import { getOrderByCode } from '@/services/orderService';

export function OrderTracker() {
  const [orderCode, setOrderCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [foundOrder, setFoundOrder] = React.useState<Order | null | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  React.useEffect(() => {
    // On component mount, check localStorage for a recently placed order code
    const lastOrderCode = localStorage.getItem('lastOrderCode');
    if (lastOrderCode) {
      setOrderCode(lastOrderCode);
      // Optional: Automatically trigger the search
      // handleTrackOrder(lastOrderCode); 
    }
  }, []);

  const handleTrackOrder = async (code?: string) => {
    const codeToTrack = code || orderCode;
    if (!codeToTrack) return;

    setIsLoading(true);
    setFoundOrder(undefined); // Reset previous result
    setIsDialogOpen(true);
    
    try {
      const order = await getOrderByCode(codeToTrack.trim());
      setFoundOrder(order);
    } catch (error) {
      console.error("Error tracking order:", error);
      setFoundOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold mb-2 font-headline text-primary">
            Lacak Pesanan Anda
          </h3>
          <p className="text-muted-foreground mb-4">
            Masukkan kode order untuk melihat status antrian dan progres desain Anda.
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Contoh: ORD-20240715-12345"
              className="font-code"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleTrackOrder()}
            />
            <Button onClick={() => handleTrackOrder()} disabled={isLoading || !orderCode}>
              {isLoading && !isDialogOpen ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Lacak
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Status Pesanan</DialogTitle>
                <DialogDescription>
                    Berikut adalah detail progres untuk pesanan <span className="font-bold font-code">{orderCode}</span>.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 min-h-[150px] flex items-center justify-center">
                {isLoading ? (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary"/>
                    <p className="mt-2 text-muted-foreground">Mencari pesanan...</p>
                  </div>
                ) : foundOrder === null ? (
                    <div className="text-center py-8">
                        <Frown className="h-16 w-16 mx-auto text-destructive"/>
                        <p className="mt-4 font-semibold text-lg">Pesanan Tidak Ditemukan</p>
                        <p className="text-muted-foreground">Pastikan kode yang Anda masukkan sudah benar.</p>
                    </div>
                ) : foundOrder ? (
                     <div className="space-y-4 w-full">
                        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted">
                           {foundOrder.status === 'Selesai' ? <CheckCircle2 className="h-8 w-8 text-green-500" /> : <Clock className="h-8 w-8 text-amber-500" />}
                           <div>
                                <p className="text-sm text-muted-foreground">Status Saat Ini</p>
                                <p className="font-bold text-lg">{foundOrder.status}</p>
                           </div>
                        </div>
                        {foundOrder.queue && (
                          <div className="space-y-2">
                            <p className="font-semibold">Detail Antrian:</p>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Minggu ke-</span>
                                <Badge>{foundOrder.queue.week}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Posisi</span>
                                <Badge>{foundOrder.queue.position} dari {foundOrder.queue.total}</Badge>
                            </div>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground pt-4">Kami akan menghubungi Anda via Telegram untuk setiap progres penting. Terima kasih telah bersabar.</p>
                    </div>
                ) : null}
            </div>
          </DialogContent>
      </Dialog>
    </>
  );
}
