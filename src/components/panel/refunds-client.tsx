
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import type { Refund } from '@/lib/types';
import { format } from 'date-fns';
import { Eye } from 'lucide-react';

export default function RefundsClient({ initialRefunds }: { initialRefunds: Refund[] }) {
  const [refunds] = React.useState<Refund[]>(initialRefunds);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredRefunds = refunds.filter(refund => 
    refund.orderCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Refund</CardTitle>
          <CardDescription>
            Total {filteredRefunds.length} dari {refunds.length} refund telah diproses. Klik untuk melihat detail.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-4 mb-6">
                <Input 
                  placeholder="Cari berdasarkan Kode Order..." 
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {filteredRefunds.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                        {searchTerm ? `Tidak ada refund dengan kode order "${searchTerm}"` : "Belum ada refund yang diproses."}
                    </p>
                ) : (
                    filteredRefunds.map((refund) => (
                    <AccordionItem value={refund.id} key={refund.id} className="border-b-0 rounded-md bg-background data-[state=open]:shadow-md">
                        <AccordionTrigger className="border rounded-md px-4 py-3 text-sm hover:no-underline hover:bg-muted/50 data-[state=open]:bg-primary/5 data-[state=open]:border-primary/20 data-[state=open]:rounded-b-none">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                                <div className="text-left">
                                    <span className="font-bold font-code">{refund.orderCode}</span>
                                    <p className="text-xs text-muted-foreground">Rp{refund.refundAmount.toLocaleString('id-ID')}</p>
                                </div>
                            </div>
                            <Eye className="h-5 w-5 text-muted-foreground mr-4" />
                        </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 border border-t-0 rounded-md rounded-t-none border-primary/20 bg-primary/5 space-y-2 text-sm">
                            <p><span className="font-semibold">Alasan:</span> {refund.reason}</p>
                            <p><span className="font-semibold">Diproses oleh:</span> {refund.processedBy}</p>
                            <p><span className="font-semibold">Tanggal Proses:</span> {format(new Date(refund.processedAt), "d MMM yyyy, HH:mm")}</p>
                        </AccordionContent>
                    </AccordionItem>
                    ))
                )}
              </Accordion>
        </CardContent>
      </Card>
  );
}
