
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
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import type { Coupon } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getCoupons, addCoupon, updateCoupon, deleteCoupon } from '@/services/couponService';

export default function CouponsClient({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const [coupons, setCoupons] = React.useState<Coupon[]>(initialCoupons);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCoupon, setEditingCoupon] = React.useState<Coupon | null>(null);
  const [formState, setFormState] = React.useState<Partial<Coupon>>({});
  const { toast } = useToast();

  const fetchCoupons = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCoupons = await getCoupons();
      setCoupons(fetchedCoupons);
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Gagal Memuat Ulang Kupon', description: error, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (isDialogOpen) {
      setFormState(editingCoupon ? { ...editingCoupon } : {
        code: '',
        name: '',
        discountPercentage: 0,
        isActive: true,
        image: 'https://placehold.co/300x150.png',
      });
    }
  }, [isDialogOpen, editingCoupon]);
  
  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingCoupon(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (couponId: string) => {
    if(!confirm("Apakah Anda yakin ingin menghapus kupon ini?")) return;
    try {
      await deleteCoupon(couponId);
      toast({ title: 'Kupon Dihapus' });
      fetchCoupons();
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Gagal Menghapus', description: error, variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if(!formState.code || !formState.name) {
      toast({ title: 'Kode dan Nama Kupon wajib diisi', variant: 'destructive'});
      return;
    }
    setIsSaving(true);
    try {
      const couponData = {
        code: formState.code.toUpperCase(),
        name: formState.name,
        discountPercentage: Number(formState.discountPercentage) || 0,
        image: formState.image || 'https://placehold.co/300x150.png',
        isActive: formState.isActive ?? false,
      };

      if (editingCoupon && editingCoupon.id) {
        await updateCoupon(editingCoupon.id, couponData);
        toast({ title: 'Kupon Diperbarui' });
      } else {
        await addCoupon(couponData);
        toast({ title: 'Kupon Ditambahkan' });
      }
      setIsDialogOpen(false);
      setEditingCoupon(null);
      fetchCoupons();
    } catch (e) {
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
            <CardTitle>Daftar Kupon</CardTitle>
            <CardDescription>
              Total {coupons.length} kupon terdaftar. Klik untuk melihat detail.
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Kupon
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
                {coupons.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Belum ada kupon yang ditambahkan.</p>
                ) : (
                  coupons.map((coupon) => (
                    <AccordionItem value={coupon.id} key={coupon.id} className="border-b-0 rounded-md bg-background data-[state=open]:shadow-md">
                      <AccordionTrigger className="border rounded-md px-4 py-3 text-sm hover:no-underline hover:bg-muted/50 data-[state=open]:bg-primary/5 data-[state=open]:border-primary/20 data-[state=open]:rounded-b-none">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-4">
                                <div className="text-left">
                                    <span className="font-bold font-code">{coupon.code}</span>
                                    <p className="text-xs text-muted-foreground">{coupon.name}</p>
                                </div>
                            </div>
                            <Eye className="h-5 w-5 text-muted-foreground mr-4" />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 border border-t-0 rounded-md rounded-t-none border-primary/20 bg-primary/5 space-y-4">
                          <div className="space-y-2 text-sm">
                              <p><span className="font-semibold">Diskon:</span> {coupon.discountPercentage}%</p>
                              <p><span className="font-semibold">Status:</span> 
                                  {coupon.isActive ? (
                                      <Badge variant="default">Aktif</Badge>
                                  ) : (
                                      <Badge variant="secondary">Tidak Aktif</Badge>
                                  )}
                              </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Ubah
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDelete(coupon.id)}>
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
            {editingCoupon ? 'Ubah Kupon' : 'Tambah Kupon Baru'}
          </DialogTitle>
          <DialogDescription>
            Isi detail kupon di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="code">Kode Kupon</Label>
            <Input
              id="code"
              name="code"
              className="font-code"
              value={formState.code || ''}
              onChange={(e) => setFormState({...formState, code: e.target.value.toUpperCase()})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kupon</Label>
            <Input
              id="name"
              name="name"
              value={formState.name || ''}
              onChange={(e) => setFormState({...formState, name: e.target.value})}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discountPercentage">Persentase Diskon</Label>
            <Input
              id="discountPercentage"
              name="discountPercentage"
              type="number"
              value={formState.discountPercentage || ''}
              onChange={(e) => setFormState({...formState, discountPercentage: Number(e.target.value)})}
              required
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="isActive" 
              name="isActive" 
              checked={formState.isActive ?? true}
              onCheckedChange={(checked) => setFormState({...formState, isActive: checked})}
            />
            <Label htmlFor="isActive">Aktifkan Kupon</Label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
