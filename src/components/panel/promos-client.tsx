
'use client';

import * as React from 'react';
import Image from 'next/image';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { PlusCircle, Pencil, Trash2, CalendarIcon, Eye, Loader2 } from 'lucide-react';
import type { Promo, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { getPromos, addPromo, updatePromo, deletePromo } from '@/services/promoService';

export default function PromosClient({ initialPromos, products }: { initialPromos: Promo[], products: Product[] }) {
  const [promos, setPromos] = React.useState<Promo[]>(initialPromos);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPromo, setEditingPromo] = React.useState<Promo | null>(null);
  const [formState, setFormState] = React.useState<Partial<Promo>>({});
  const { toast } = useToast();

  const fetchPromos = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedPromos = await getPromos();
      setPromos(fetchedPromos);
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Gagal Memuat Ulang Promo', description: error, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (isDialogOpen) {
      setFormState(editingPromo ? { 
        ...editingPromo,
        startDate: editingPromo.startDate ? new Date(editingPromo.startDate) : undefined,
        endDate: editingPromo.endDate ? new Date(editingPromo.endDate) : undefined,
       } : {
        name: '',
        productId: '',
        discountPercentage: 0,
        startDate: undefined,
        endDate: undefined,
        image: 'https://placehold.co/300x150.png',
      });
    }
  }, [isDialogOpen, editingPromo]);

  const handleEdit = (promo: Promo) => {
    setEditingPromo(promo);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingPromo(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (promoId: string) => {
    if(!confirm("Apakah Anda yakin ingin menghapus promo ini?")) return;
    try {
      await deletePromo(promoId);
      toast({ title: 'Promo Dihapus' });
      fetchPromos();
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Gagal Menghapus', description: error, variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if (!formState.name || !formState.productId || !formState.startDate || !formState.endDate) {
        toast({ variant: "destructive", title: "Gagal", description: "Harap isi semua field yang wajib diisi." });
        return;
    }
    setIsSaving(true);
    try {
      const promoData: Omit<Promo, 'id'> = {
        name: formState.name,
        productId: formState.productId,
        discountPercentage: Number(formState.discountPercentage) || 0,
        startDate: formState.startDate,
        endDate: formState.endDate,
        image: formState.image || 'https://placehold.co/300x150.png',
      };

      if (editingPromo && editingPromo.id) {
        await updatePromo(editingPromo.id, promoData);
        toast({ title: 'Promo Diperbarui' });
      } else {
        await addPromo(promoData);
        toast({ title: 'Promo Ditambahkan' });
      }
      setIsDialogOpen(false);
      setEditingPromo(null);
      fetchPromos();
    } catch(e) {
      const error = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Gagal Menyimpan', description: error, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Daftar Promo</CardTitle>
            <CardDescription>
              Total {promos.length} promo terdaftar. Klik untuk melihat detail.
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Promo
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Memuat ulang data...</p>
            </div>
          ) : (
           <Accordion type="single" collapsible className="w-full space-y-2">
              {promos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Belum ada promo yang ditambahkan.</p>
              ) : (
                promos.map((promo) => (
                  <AccordionItem value={promo.id} key={promo.id} className="border-b-0 rounded-md bg-background data-[state=open]:shadow-md">
                    <AccordionTrigger className="border rounded-md px-4 py-3 text-sm hover:no-underline hover:bg-muted/50 data-[state=open]:bg-primary/5 data-[state=open]:border-primary/20 data-[state=open]:rounded-b-none">
                      <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                              <Image
                                src={promo.image}
                                alt={promo.name}
                                width={80}
                                height={40}
                                className="rounded-md object-cover"
                                data-ai-hint="promotion design"
                              />
                              <div className="text-left">
                                  <span className="font-bold">{promo.name}</span>
                                  <p className="text-xs text-muted-foreground">Diskon {promo.discountPercentage}%</p>
                              </div>
                          </div>
                          <Eye className="h-5 w-5 text-muted-foreground mr-4" />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border border-t-0 rounded-md rounded-t-none border-primary/20 bg-primary/5 space-y-4">
                        <div className="space-y-2 text-sm">
                            <p><span className="font-semibold">Produk:</span> {products.find(p => p.id === promo.productId)?.name || 'N/A'}</p>
                            <p><span className="font-semibold">Periode:</span> {format(new Date(promo.startDate), "d MMM yyyy")} - {format(new Date(promo.endDate), "d MMM yyyy")}</p>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="outline" size="sm" onClick={() => handleEdit(promo)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Ubah
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(promo.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Hapus
                            </Button>
                        </div>
                    </AccordionContent>
                  </AccordionItem>
                ))
              )}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? 'Ubah Promo' : 'Tambah Promo Baru'}
            </DialogTitle>
            <DialogDescription>
              Isi detail promo di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Promo</Label>
              <Input
                id="name"
                value={formState.name || ''}
                onChange={(e) => setFormState({...formState, name: e.target.value})}
                required
              />
            </div>

             <div className="space-y-2">
              <Label htmlFor="productId">Produk</Label>
               <Select
                  value={formState.productId}
                  onValueChange={(value) => setFormState({...formState, productId: value})}
               >
                  <SelectTrigger>
                      <SelectValue placeholder="Pilih Produk" />
                  </SelectTrigger>
                  <SelectContent>
                      {products.map(product => (
                          <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="discountPercentage">Persentase Diskon (%)</Label>
              <Input
                id="discountPercentage"
                type="number"
                value={formState.discountPercentage || ''}
                onChange={(e) => setFormState({...formState, discountPercentage: Number(e.target.value)})}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>Tanggal Mulai</Label>
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button
                              variant={"outline"}
                              className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formState.startDate && "text-muted-foreground"
                              )}
                          >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formState.startDate ? format(formState.startDate, "PPP") : <span>Pilih tanggal</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                          <Calendar
                              mode="single"
                              selected={formState.startDate}
                              onSelect={(date) => setFormState({...formState, startDate: date})}
                              initialFocus
                          />
                      </PopoverContent>
                  </Popover>
              </div>
               <div className="space-y-2">
                  <Label>Tanggal Berakhir</Label>
                  <Popover>
                      <PopoverTrigger asChild>
                          <Button
                              variant={"outline"}
                              className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formState.endDate && "text-muted-foreground"
                              )}
                          >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formState.endDate ? format(formState.endDate, "PPP") : <span>Pilih tanggal</span>}
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                          <Calendar
                              mode="single"
                              selected={formState.endDate}
                              onSelect={(date) => setFormState({...formState, endDate: date})}
                              initialFocus
                          />
                      </PopoverContent>
                  </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL Gambar</Label>
              <Input
                id="image"
                value={formState.image || ''}
                onChange={(e) => setFormState({...formState, image: e.target.value})}
                placeholder="https://placehold.co/300x150.png"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin"/>}
              Simpan
            </Button>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
