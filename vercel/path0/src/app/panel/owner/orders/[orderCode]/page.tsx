
import * as React from 'react';
import type { Order, Brief } from '@/lib/types';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, MessageSquare, Briefcase, FileText, CheckCircle, Clock, Hash, Link as LinkIcon, Edit, Ruler } from 'lucide-react';
import Link from 'next/link';
import { getOrderByCode } from '@/services/orderService';

type OrderDetailPageProps = {
  params: {
    orderCode: string;
  };
};

// This is now a server component that fetches real data
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const order = await getOrderByCode(params.orderCode);

  // Pilar 1: Pertahanan Terhadap Data Kosong. Jika pesanan tidak ada, tampilkan halaman 404.
  if (!order) {
    notFound();
  }

  const subtotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const ppn = (subtotal - (order.couponDiscount || 0)) * 0.10; // PPN calculated after discount
  const handlingFee = 5000;


  return (
    <div className="space-y-8">
        <div>
            <Button asChild variant="outline">
                <Link href="/panel/owner/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Daftar Pesanan
                </Link>
            </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Detail Pesanan</span>
                            <Badge variant="secondary" className="text-lg font-code">{order.orderCode}</Badge>
                        </CardTitle>
                        <CardDescription>Dibuat pada {order.createdAt ? new Date(order.createdAt).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Tanggal tidak tersedia'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {order.items.map((item, index) => (
                                <li key={index} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold">{item.name || 'Produk tidak ditemukan'}</p>
                                        <p className="text-sm text-muted-foreground">Jumlah: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold">Rp{(item.price * item.quantity).toLocaleString('id-ID')}</p>
                                </li>
                            ))}
                        </ul>
                        <Separator className="my-4" />
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>Rp{subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            {order.couponDiscount && order.couponDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="font-semibold">Diskon ({order.couponCode})</span>
                                    <span>-Rp{order.couponDiscount.toLocaleString('id-ID')}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">PPN (10%)</span>
                                <span>Rp{ppn.toLocaleString('id-ID')}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Biaya Penanganan</span>
                                <span>Rp{handlingFee.toLocaleString('id-ID')}</span>
                            </div>
                            <Separator className="my-2" />
                             <div className="flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>Rp{order.totalAmount.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-primary">
                                <span>Dibayar ({order.paymentMethod})</span>
                                <span>Rp{order.amountPaid.toLocaleString('id-ID')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><FileText className="mr-2 h-5 w-5"/>Brief & Revisi per Item</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                       {order.items.map((item, itemIndex) => (
                           <div key={itemIndex}>
                               <h4 className="font-bold text-lg font-headline">{item.name} <Badge variant="outline">{item.budgetTier}</Badge></h4>
                               {item.driveLink && <p className="text-sm text-muted-foreground flex items-center gap-2 mt-2"><LinkIcon className="h-4 w-4"/> <a href={item.driveLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{item.driveLink}</a></p>}
                               {item.dimensions && <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Ruler className="h-4 w-4"/> {item.dimensions}</p>}
                               <div className="mt-4 space-y-4">
                                {item.briefs && item.briefs.length > 0 ? item.briefs.map((brief, briefIndex) => (
                                    <div key={briefIndex} className="relative pl-8">
                                        <div className="absolute left-0 flex flex-col items-center">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                                                {brief.revisionNumber === 0 ? 'B' : `R${brief.revisionNumber}`}
                                            </span>
                                            {item.briefs && briefIndex < item.briefs.length -1 && <div className="h-full w-px bg-border my-1"></div>}
                                        </div>
                                        <p className="font-semibold text-sm">
                                            {brief.revisionNumber === 0 ? 'Brief Awal' : `Revisi ke-${brief.revisionNumber}`}
                                            <span className="text-muted-foreground font-normal ml-2 text-xs">{brief.timestamp ? new Date(brief.timestamp).toLocaleString('id-ID') : ''}</span>
                                        </p>
                                        <p className="text-muted-foreground whitespace-pre-wrap mt-1">{brief.content}</p>
                                    </div>
                                )) : <p className="text-muted-foreground text-sm pl-8">Tidak ada brief untuk item ini.</p>}
                               </div>
                               {itemIndex < order.items.length - 1 && <Separator className="mt-6" />}
                           </div>
                       ))}
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6 sticky top-24">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5"/>Informasi Klien</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-muted-foreground flex items-center gap-2"><MessageSquare className="h-4 w-4"/> {order.customerTelegram}</p>
                        {order.telegramChatId && (
                            <p className="text-muted-foreground flex items-center gap-2 font-code"><Hash className="h-4 w-4"/> {order.telegramChatId}</p>
                        )}
                        <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                            <a href={`https://t.me/${(order.customerTelegram || '').replace('@','')}`} target="_blank" rel="noopener noreferrer">Hubungi via Telegram</a>
                        </Button>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Briefcase className="mr-2 h-5 w-5"/>Status & Progres</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                             {order.status === 'Selesai' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <Clock className="h-5 w-5 text-amber-500" />}
                            <span className="font-semibold">{order.status}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Update terakhir: {new Date(order.updatedAt).toLocaleString('id-ID')}
                        </div>
                         {order.queue && <div className="text-sm">
                            <p className="font-medium">Antrian</p>
                            <p className="text-muted-foreground">Minggu ke-{order.queue.week}, Posisi {order.queue.position} dari {order.queue.total}</p>
                        </div>}
                        {order.driveFolderUrl && <div className="text-sm">
                            <p className="font-medium">Link Google Drive</p>
                            <a href={order.driveFolderUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                {order.driveFolderUrl}
                            </a>
                        </div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
