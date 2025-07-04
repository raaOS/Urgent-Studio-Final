
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
import { Switch } from '@/components/ui/switch';
import { PlusCircle, Pencil, Trash2, Eye, Loader2 } from 'lucide-react';
import type { Banner } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { getBanners, addBanner, updateBanner, deleteBanner } from '@/services/bannerService';

export default function BannersClient({ initialBanners }: { initialBanners: Banner[] }) {
  const [banners, setBanners] = React.useState<Banner[]>(initialBanners);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingBanner, setEditingBanner] = React.useState<Banner | null>(null);
  const [formState, setFormState] = React.useState<Partial<Banner>>({});
  const { toast } = useToast();

  const fetchBanners = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedBanners = await getBanners();
      setBanners(fetchedBanners);
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Gagal Memuat Ulang Banner', description: error, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (isDialogOpen) {
      setFormState(editingBanner ? { ...editingBanner } : {
        title: '',
        link: '',
        image: 'https://placehold.co/1200x400.png',
        isActive: true,
      });
    }
  }, [isDialogOpen, editingBanner]);

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingBanner(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (bannerId: string) => {
    if(!confirm("Apakah Anda yakin ingin menghapus banner ini?")) return;
    try {
      await deleteBanner(bannerId);
      toast({ title: 'Banner Dihapus', description: 'Banner telah berhasil dihapus.' });
      fetchBanners();
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown error';
      toast({ title: 'Gagal Menghapus', description: error, variant: 'destructive' });
    }
  };

  const handleSave = async () => {
    if(!formState.title) {
      toast({ title: 'Judul tidak boleh kosong', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      const bannerData = {
        title: formState.title,
        link: formState.link || '',
        image: formState.image || 'https://placehold.co/1200x400.png',
        isActive: formState.isActive ?? false,
      };

      if (editingBanner && editingBanner.id) {
        await updateBanner(editingBanner.id, bannerData);
        toast({ title: 'Banner Diperbarui' });
      } else {
        await addBanner(bannerData);
        toast({ title: 'Banner Ditambahkan' });
      }
      setIsDialogOpen(false);
      setEditingBanner(null);
      fetchBanners();
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
            <CardTitle>Daftar Banner</CardTitle>
            <CardDescription>
              Total {banners.length} banner terdaftar. Klik untuk melihat detail.
            </CardDescription>
          </div>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" /> Tambah Banner
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
              {banners.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Belum ada banner yang ditambahkan.</p>
              ) : (
                  banners.map((banner) => (
                  <AccordionItem value={banner.id} key={banner.id} className="border-b-0 rounded-md bg-background data-[state=open]:shadow-md">
                      <AccordionTrigger className="border rounded-md px-4 py-3 text-sm hover:no-underline hover:bg-muted/50 data-[state=open]:bg-primary/5 data-[state=open]:border-primary/20 data-[state=open]:rounded-b-none">
                      <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                          <Image
                              src={banner.image}
                              alt={banner.title}
                              width={120}
                              height={40}
                              className="rounded-md object-cover"
                              data-ai-hint="promotion banner"
                          />
                          <div className="text-left">
                              <span className="font-bold">{banner.title}</span>
                              <p className="text-xs text-muted-foreground mt-1">
                              {banner.isActive ? (
                                  <Badge variant="default">Aktif</Badge>
                              ) : (
                                  <Badge variant="secondary">Tidak Aktif</Badge>
                              )}
                              </p>
                          </div>
                          </div>
                          <Eye className="h-5 w-5 text-muted-foreground mr-4" />
                      </div>
                      </AccordionTrigger>
                      <AccordionContent className="p-4 border border-t-0 rounded-md rounded-t-none border-primary/20 bg-primary/5 space-y-4">
                          <p className="text-sm"><span className="font-semibold">Link Tujuan:</span> {banner.link || '-'}</p>
                          <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(banner)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDelete(banner.id)}>
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
            {editingBanner ? 'Edit Banner' : 'Tambah Banner Baru'}
          </DialogTitle>
          <DialogDescription>
            Isi detail banner di bawah ini.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Banner</Label>
            <Input
              id="title"
              name="title"
              value={formState.title || ''}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link Tujuan (opsional)</Label>
            <Input
              id="link"
              name="link"
              value={formState.link || ''}
              onChange={(e) => setFormState({ ...formState, link: e.target.value })}
              placeholder="/#products"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">URL Gambar</Label>
            <Input
              id="image"
              name="image"
              value={formState.image || ''}
              onChange={(e) => setFormState({ ...formState, image: e.target.value })}
              placeholder="https://placehold.co/1200x400.png"
              required
            />
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Switch 
              id="isActive" 
              name="isActive" 
              checked={formState.isActive ?? true}
              onCheckedChange={(checked) => setFormState({ ...formState, isActive: checked })}
            />
            <Label htmlFor="isActive">Aktifkan Banner</Label>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Batal
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
