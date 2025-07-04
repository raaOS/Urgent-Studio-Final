'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FileText, Eye, Sparkles, Wand2, Loader2, AlertCircle, CheckCircle, Info, Lightbulb, Send, ListChecks, Link as LinkIcon, Ruler } from 'lucide-react';
import type { Order, OrderItem, OrderItemStatus, OrderStatus, Brief, AnalyzeBriefComplexityOutput, ExtractDesignElementsOutput } from "@/lib/types";
import { useToast } from '@/hooks/use-toast';
import { Label } from "@/components/ui/label";
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { getOrders, updateOrder } from '@/services/orderService';
import { analyzeBriefComplexity } from '@/ai/flows/analyze-brief-complexity';
import { extractDesignElements } from '@/ai/flows/extract-design-elements';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

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

type SendDraftAction = (orderId: string, fileId: string) => Promise<void>;

const statusBadgeVariant: Record<OrderItemStatus, string> = {
    'Disetujui': 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
    'Revisi': 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
    'Menunggu Respon Klien': 'bg-sky-100 text-sky-800 border-sky-200 hover:bg-sky-200',
    'Dalam Pengerjaan': 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
};


export default function BriefsClient({ 
    initialOrders,
    sendDraftAction, 
}: { 
    initialOrders: Order[];
    sendDraftAction: SendDraftAction;
}) {
  const [orders, setOrders] = React.useState<Order[]>(initialOrders);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [selectedStatus, setSelectedStatus] = React.useState<OrderStatus | ''>('');
  
  const [draftFileId, setDraftFileId] = React.useState('');
  const [isSendingDraft, setIsSendingDraft] = React.useState(false);

  // AI State - now stored per item index
  const [analysisResults, setAnalysisResults] = React.useState<Record<number, AnalyzeBriefComplexityOutput | null>>({});
  const [isAnalyzing, setIsAnalyzing] = React.useState<number | null>(null); // Store index of item being analyzed
  const [creativeIdeas, setCreativeIdeas] = React.useState<Record<number, ExtractDesignElementsOutput | null>>({});
  const [isGeneratingIdeas, setIsGeneratingIdeas] = React.useState<number | null>(null); // Store index of item being generated

  const { toast } = useToast();

  const fetchOrders = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const allOrders = await getOrders();
      const designerOrders = allOrders.filter(o => relevantStatuses.includes(o.status));
      setOrders(designerOrders);
    } catch (e) {
      const error = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Gagal Memuat Ulang Pesanan", description: error, variant: "destructive" });
    } finally {
      setIsLoading(false); 
    }
  }, [toast]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status);
    setAnalysisResults({}); 
    setCreativeIdeas({}); 
    setDraftFileId('');
    setIsAnalyzing(null);
    setIsGeneratingIdeas(null);
    setIsDialogOpen(true);
  };
  
  const handleAnalyzeBrief = async (item: OrderItem, index: number) => {
    if (!selectedOrder || !item.briefs || item.briefs.length === 0) return;
    setIsAnalyzing(index);
    setAnalysisResults(prev => ({ ...prev, [index]: null }));
    try {
        const result = await analyzeBriefComplexity({ 
            designBrief: item.briefs[0].content, // Analyze the initial brief
            driveLink: item.driveLink,
            budgetTier: item.budgetTier,
        });
        setAnalysisResults(prev => ({ ...prev, [index]: result }));
        toast({ title: "Analisis Selesai!", description: `AI telah menganalisis brief untuk ${item.name}.` });
    } catch (error) {
        console.error("Error analyzing brief:", error);
        const description = error instanceof Error ? error.message : "Gagal menganalisis brief. Kesalahan tidak diketahui.";
        toast({ 
            variant: "destructive", 
            title: "Terjadi Kesalahan AI", 
            description: description
        });
    } finally {
        setIsAnalyzing(null);
    }
  };

  const handleGenerateIdeas = async (item: OrderItem, index: number) => {
    if (!selectedOrder || !item.briefs || item.briefs.length === 0) return;
    setIsGeneratingIdeas(index);
    setCreativeIdeas(prev => ({ ...prev, [index]: null }));
    try {
        // Use the latest brief for creative ideas
        const latestBrief = item.briefs[item.briefs.length - 1].content;
        const result = await extractDesignElements({ designBrief: latestBrief });
        setCreativeIdeas(prev => ({ ...prev, [index]: result }));
        toast({ title: "Ide Kreatif Dihasilkan!", description: `AI telah memberikan saran untuk ${item.name}.` });
    } catch (error) {
        console.error("Error generating creative ideas:", error);
        const description = error instanceof Error ? error.message : "Gagal menghasilkan ide. Kesalahan tidak diketahui.";
        toast({ variant: "destructive", title: "Terjadi Kesalahan AI", description: description });
    } finally {
        setIsGeneratingIdeas(null);
    }
  }

  const handleSendDraft = async () => {
      if (!selectedOrder || !selectedOrder.id || !draftFileId) {
          toast({ variant: "destructive", title: "Data Tidak Lengkap", description: "Harap masukkan File ID dari gambar draf." });
          return;
      }
      setIsSendingDraft(true);
      try {
          await sendDraftAction(selectedOrder.id, draftFileId);
          toast({ title: "Draf Terkirim!", description: "Draf desain telah dikirim ke pelanggan via Telegram." });
          setIsDialogOpen(false);
          fetchOrders();
      } catch (e) {
          const error = e instanceof Error ? e.message : "Unknown error";
          toast({ title: "Gagal Mengirim Draf", description: error, variant: "destructive" });
      } finally {
          setIsSendingDraft(false);
      }
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !selectedOrder.id || !selectedStatus) return;
    setIsUpdating(true);
    try {
      await updateOrder(selectedOrder.id, { status: selectedStatus });
      toast({ title: "Status Diperbarui", description: `Status pesanan ${selectedOrder.orderCode} telah diubah.` });
      // Don't close dialog if we just set it to 'Menunggu Pengiriman Draf'
      if (selectedStatus !== 'Menunggu Pengiriman Draf') {
          setIsDialogOpen(false);
      } else {
          // Refresh the order data inside the dialog
          const updatedOrder = await getOrders().then(orders => orders.find(o => o.id === selectedOrder.id));
          if(updatedOrder) setSelectedOrder(updatedOrder);
      }
      fetchOrders();
    } catch (e) {
      const error = e instanceof Error ? e.message : "Unknown error";
      toast({ title: "Gagal Memperbarui Status", description: error, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const isSendDraftState = selectedOrder?.status === 'Menunggu Pengiriman Draf';

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tugas Anda</CardTitle>
          <CardDescription>Berikut adalah pesanan yang ditugaskan kepada Anda. Klik untuk melihat detail.</CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
             <div className="flex justify-center items-center py-10">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
               <p className="ml-2">Memuat ulang...</p>
             </div>
           ) : orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Tidak ada tugas untuk saat ini.</p>
           ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kode Order</TableHead>
                      <TableHead>Klien</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(order => (
                      <TableRow key={order.id || order.orderCode}>
                        <TableCell className="font-code font-semibold">{order.orderCode}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell><Badge variant="secondary">{order.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                            <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Mobile Card List */}
              <div className="md:hidden space-y-4">
                {orders.map(order => (
                  <Card key={order.id || order.orderCode} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-code font-bold">{order.orderCode}</p>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <Badge variant="secondary">{order.status}</Badge>
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => handleViewOrder(order)}>
                      <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                    </Button>
                  </Card>
                ))}
              </div>
            </>
           )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
              <DialogHeader>
                  <DialogTitle>Detail Pesanan: {selectedOrder?.orderCode}</DialogTitle>
                  <DialogDescription>
                      Pelanggan: {selectedOrder?.customerName} ({selectedOrder?.customerTelegram})
                  </DialogDescription>
              </DialogHeader>
              {selectedOrder && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                      <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center'><ListChecks className='h-5 w-5 mr-2'/>Brief, Item & Status</CardTitle>
                                <CardDescription>Status individual dan brief untuk setiap item dalam pesanan ini.</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className='h-[calc(90vh-320px)] pr-4 -mr-4'>
                                <Accordion type="single" collapsible className="w-full space-y-2">
                                  {selectedOrder.items.map((item, index) => (
                                    <AccordionItem value={`item-${index}`} key={index}>
                                      <AccordionTrigger className='border rounded-md px-4 py-3 text-sm hover:no-underline hover:bg-muted/50 data-[state=open]:bg-primary/5 data-[state=open]:border-primary/20 data-[state=open]:rounded-b-none'>
                                        <div className='flex justify-between items-center w-full'>
                                          <div className='text-left'>
                                            <p className='font-bold'>{item.name}</p>
                                            <Badge variant="outline" className='mt-1'>{item.budgetTier}</Badge>
                                          </div>
                                          <Badge className={cn('font-semibold mr-4', statusBadgeVariant[item.itemStatus])}>
                                              {item.itemStatus}
                                          </Badge>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent className="p-4 border border-t-0 rounded-md rounded-t-none border-primary/20 bg-primary/5 space-y-4">
                                        {item.driveLink && <p className="text-sm text-muted-foreground flex items-center gap-2"><LinkIcon className="h-4 w-4"/> <a href={item.driveLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{item.driveLink}</a></p>}
                                        {item.dimensions && <p className="text-sm text-muted-foreground flex items-center gap-2"><Ruler className="h-4 w-4"/> {item.dimensions}</p>}
                                        
                                        {item.briefs && item.briefs.length > 0 ? (
                                            item.briefs.map((brief, briefIndex) => (
                                            <div key={briefIndex} className="relative pl-6">
                                                <div className="absolute left-0 flex flex-col items-center">
                                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                                                        {brief.revisionNumber === 0 ? 'B' : `R${brief.revisionNumber}`}
                                                    </span>
                                                    {item.briefs && briefIndex < item.briefs.length -1 && <div className="h-full w-px bg-border my-1"></div>}
                                                </div>
                                                <p className="font-semibold text-sm">
                                                    {brief.revisionNumber === 0 ? 'Brief Awal' : `Revisi ke-${brief.revisionNumber}`}
                                                    <span className="text-muted-foreground font-normal ml-2 text-xs">{brief.timestamp ? new Date(brief.timestamp).toLocaleString('id-ID') : ''}</span>
                                                </p>
                                                <p className="text-sm whitespace-pre-wrap mt-1">{brief.content}</p>
                                            </div>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground text-sm">Tidak ada brief untuk item ini.</p>
                                        )}
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>
                              </ScrollArea>
                            </CardContent>
                        </Card>
                      </div>

                       <div className="flex flex-col gap-6">
                            {isSendDraftState ? (
                                <Card className="border-primary ring-2 ring-primary">
                                    <CardHeader>
                                        <CardTitle className="flex items-center"><Send className="mr-2 h-5 w-5"/>Kirim Draf ke Klien</CardTitle>
                                        <CardDescription>
                                            Draf sudah selesai. Masukkan ID File Telegram dari gambar lalu kirim ke klien.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fileId">Telegram File ID</Label>
                                            <Input 
                                                id="fileId" 
                                                placeholder="Contoh: AgACAgIAAxkDAA..." 
                                                value={draftFileId}
                                                onChange={(e) => setDraftFileId(e.target.value)}
                                            />
                                        </div>
                                        <Button className="w-full" onClick={handleSendDraft} disabled={isSendingDraft}>
                                            {isSendingDraft ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4"/>}
                                            Kirim Draf Sekarang
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="flex flex-col flex-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center"><Lightbulb className="inline-block mr-2 h-5 w-5 text-amber-500"/>Asisten Kreatif AI</CardTitle>
                                    <CardDescription>Pilih item di bawah untuk mendapatkan saran kreatif dari AI.</CardDescription>
                                </CardHeader>
                                <ScrollArea className="flex-grow p-4 -mt-4">
                                   <Accordion type="single" collapsible className="w-full space-y-2">
                                      {selectedOrder.items.map((item, index) => (
                                        <AccordionItem value={`idea-${index}`} key={`idea-${index}`}>
                                          <AccordionTrigger className='border rounded-md px-4 py-2 text-sm hover:no-underline'>
                                            <div className='font-semibold'>{item.name}</div>
                                          </AccordionTrigger>
                                          <AccordionContent className="p-4 border border-t-0 rounded-b-md space-y-4">
                                            <Button size="sm" className='w-full' onClick={() => handleGenerateIdeas(item, index)} disabled={isGeneratingIdeas === index}>
                                                {isGeneratingIdeas === index ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                                Dapatkan Ide (dari brief terbaru)
                                            </Button>
                                            {isGeneratingIdeas === index && <p className="text-sm text-muted-foreground animate-pulse flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Menghasilkan ide kreatif...</p>}
                                            {creativeIdeas[index] && (
                                                <div className="space-y-4 text-sm mt-4">
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Ringkasan Penting</h4>
                                                        <p className="text-muted-foreground whitespace-pre-wrap">{creativeIdeas[index]!.summary}</p>
                                                    </div>
                                                    <Separator/>
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Saran Palet Warna</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {creativeIdeas[index]!.colorPalette.map(color => (
                                                                <div key={color} className="flex items-center gap-2 border rounded-md p-1 pr-2 bg-background">
                                                                    <div className="h-6 w-6 rounded" style={{ backgroundColor: color }} />
                                                                    <span className="font-mono text-xs">{color.toUpperCase()}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                          </AccordionContent>
                                        </AccordionItem>
                                      ))}
                                   </Accordion>
                                </ScrollArea>
                                </Card>
                            )}
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center"><Sparkles className="inline-block mr-2 h-5 w-5 text-accent"/>Analisis Kesesuaian Brief Awal</CardTitle>
                                    <CardDescription>Pilih item di bawah untuk menganalisis kesesuaian brief awal dengan tier budgetnya.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Accordion type="single" collapsible className="w-full space-y-2">
                                      {selectedOrder.items.map((item, index) => (
                                          <AccordionItem value={`analysis-${index}`} key={`analysis-${index}`}>
                                            <AccordionTrigger className='border rounded-md px-4 py-2 text-sm hover:no-underline'>
                                              <div className='font-semibold'>{item.name}</div>
                                            </AccordionTrigger>
                                            <AccordionContent className="p-4 border border-t-0 rounded-b-md space-y-4">
                                              <Button size="sm" className='w-full' variant="outline" onClick={() => handleAnalyzeBrief(item, index)} disabled={isAnalyzing === index}>
                                                  {isAnalyzing === index ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                                  Analisis Item Ini
                                              </Button>
                                              {isAnalyzing === index && <p className="text-sm text-muted-foreground animate-pulse flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Menganalisis brief...</p>}
                                              {analysisResults[index] && (
                                                  <Alert variant={analysisResults[index]!.isMatch ? 'default' : 'destructive'} className="mt-4">
                                                      {analysisResults[index]!.isMatch ? <CheckCircle className="h-4 w-4"/> : <AlertCircle className="h-4 w-4"/>}
                                                      <AlertTitle className="font-bold">
                                                          {analysisResults[index]!.isMatch ? "Kesesuaian: Cocok" : "Kesesuaian: Tidak Cocok"}
                                                      </AlertTitle>
                                                      <AlertDescription className="space-y-2">
                                                          <div>
                                                              <p className="font-semibold">Alasan:</p>
                                                              <p>{analysisResults[index]!.reasoning}</p>
                                                          </div>
                                                          {analysisResults[index]!.recommendation && (
                                                          <div>
                                                                  <p className="font-semibold">Rekomendasi Upgrade:</p>
                                                                  <Badge>{analysisResults[index]!.recommendation}</Badge>
                                                          </div>
                                                          )}
                                                      </AlertDescription>
                                                  </Alert>
                                              )}
                                            </AccordionContent>
                                          </AccordionItem>
                                      ))}
                                    </Accordion>
                                </CardContent>
                            </Card>
                       </div>
                  </div>
              )}
              <DialogFooter className="mt-auto pt-4 border-t">
                 <div className="w-full flex justify-between items-center">
                    <div className="space-x-2">
                        <Label>Ubah Status Pesanan</Label>
                        <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus)} disabled={isSendDraftState}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Ubah status" />
                            </SelectTrigger>
                            <SelectContent>
                                {relevantStatuses.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-x-2">
                        <DialogClose asChild>
                          <Button variant="outline">Tutup</Button>
                        </DialogClose>
                        <Button onClick={handleUpdateStatus} disabled={isUpdating || isSendDraftState}>
                          {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                          Update Status
                        </Button>
                    </div>
                </div>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
