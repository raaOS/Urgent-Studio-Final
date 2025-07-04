
'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Pencil, Trash2, ChevronLeft, ChevronRight, Eye, Loader2, Check } from 'lucide-react';
import type { Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { getProducts, addProduct, updateProduct, deleteProduct } from '@/services/productService';

const ITEMS_PER_PAGE = 5;
const productCategories = ['Konten Digital', 'Branding & Cetak', 'Promosi Outdoor'];

export default function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [formState, setFormState] = React.useState<Partial<Product>>({});
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const fetchProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Failed to re-fetch products:", error);
      toast({ variant: "destructive", title: "Gagal memuat ulang produk", description: "Terjadi kesalahan saat mengambil data." });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (isDialogOpen) {
      setFormState(editingProduct ? { ...editingProduct } : {
        name: '',
        description: '',
        prices: { kakiLima: 0, umkm: 0, ecommerce: 0 },
        category: '',
        image: 'https://placehold.co/300x300.png',
        hint: 'product',
      });
    }
  }, [isDialogOpen, editingProduct]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast({
      title: "ID Produk Tersalin",
      description: "ID produk berhasil disalin ke clipboard.",
    });
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const currentProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return;
    try {
      await deleteProduct(productId);
      fetchProducts();
      toast({ title: 'Produk Dihapus', description: 'Produk telah berhasil dihapus dari daftar.' });
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast({ variant: "destructive", title: "Gagal Menghapus", description: errorMessage });
    }
  };

  const handleSave = async () => {
    if (!formState.name || !formState.category || !formState.prices) {
        toast({ variant: "destructive", title: "Gagal", description: "Nama, Kategori, dan semua Harga wajib diisi." });
        return;
    }
    setIsSaving(true);
    try {
        const productData = {
          name: formState.name,
          description: formState.description || '',
          prices: {
            kakiLima: Number(formState.prices.kakiLima) || 0,
            umkm: Number(formState.prices.umkm) || 0,
            ecommerce: Number(formState.prices.ecommerce) || 0,
          },
          category: formState.category,
          image: formState.image || 'https://placehold.co/300x300.png',
          hint: formState.hint || 'product',
        };

        if (editingProduct && editingProduct.id) {
            await updateProduct(editingProduct.id, productData);
            toast({ title: 'Produk Diperbarui', description: 'Detail produk telah disimpan.' });
        } else {
            await addProduct(productData);
            toast({ title: 'Produk Ditambahkan', description: 'Produk baru telah dibuat.' });
        }
        setIsDialogOpen(false);
        setEditingProduct(null);
        fetchProducts();
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        toast({ variant: "destructive", title: "Gagal Menyimpan", description: errorMessage });
    } finally {
        setIsSaving(false);
    }
  };

  return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Daftar Produk</CardTitle>
              <CardDescription>
                Total {products.length} produk terdaftar. Klik untuk melihat detail.
              </CardDescription>
            </div>
            <DialogTrigger asChild>
            <Button onClick={handleAddNew} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Produk
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
                {currentProducts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Belum ada produk yang ditambahkan.</p>
                ) : (
                    currentProducts.map((product) => (
                        <AccordionItem value={product.id} key={product.id} className="border-b-0 rounded-md bg-background data-[state=open]:shadow-md">
                        <AccordionTrigger className="border rounded-md px-4 py-3 text-sm hover:no-underline hover:bg-muted/50 data-[state=open]:bg-primary/5 data-[state=open]:border-primary/20 data-[state=open]:rounded-b-none">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-4">
                                    <Image
                                    src={product.image}
                                    alt={product.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md object-cover"
                                    data-ai-hint={product.hint}
                                    />
                                    <div className="text-left">
                                        <span className="font-bold">{product.name}</span>
                                        <p className="text-xs text-muted-foreground">Rp{(product.price || product.prices.kakiLima || 0).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                <Eye className="h-5 w-5 text-muted-foreground mr-4" />
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-4 border border-t-0 rounded-md rounded-t-none border-primary/20 bg-primary/5 space-y-4">
                            <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-1">
                                    <span className="font-semibold">ID Produk:</span>
                                    <Badge
                                        variant="outline"
                                        className="font-code text-xs cursor-pointer flex items-center gap-1.5"
                                        onClick={(e) => { e.stopPropagation(); handleCopyId(product.id);}}
                                    >
                                        {product.id}
                                        {copiedId === product.id && <Check className="h-3 w-3 text-green-500" />}
                                    </Badge>
                                </p>
                                <p><span className="font-semibold">Kategori:</span> <Badge variant="secondary">{product.category}</Badge></p>
                                <p><span className="font-semibold">Deskripsi:</span> {product.description}</p>
                                <div className="pt-2">
                                    <p className="font-semibold mb-2">Harga:</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center rounded-md bg-background/50 p-2 border">
                                        <div>
                                            <p className="text-xs text-muted-foreground">Kaki Lima</p>
                                            <p className="font-bold">Rp{(product.prices.kakiLima || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">UMKM</p>
                                            <p className="font-bold">Rp{(product.prices.umkm || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">E-Commerce</p>
                                            <p className="font-bold">Rp{(product.prices.ecommerce || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Ubah
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
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
          {totalPages > 1 && (
            <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                    Halaman {currentPage} dari {totalPages}
                </span>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2"/>
                                Sebelumnya
                            </Button>
                        </PaginationItem>
                        <PaginationItem>
                            <Button
                                variant="outline"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                            >
                                Selanjutnya
                                <ChevronRight className="h-4 w-4 ml-2"/>
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </CardFooter>
          )}
        </Card>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Ubah Produk' : 'Tambah Produk Baru'}
            </DialogTitle>
            <DialogDescription>
              Isi detail produk di bawah ini. Perubahan akan langsung terlihat di halaman depan.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                value={formState.name || ''}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formState.description || ''}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                required
              />
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="priceKakiLima">Harga (Kaki Lima)</Label>
                    <Input
                        id="priceKakiLima"
                        type="number"
                        value={formState.prices?.kakiLima || ''}
                        onChange={(e) => setFormState({ ...formState, prices: { ...formState.prices!, kakiLima: Number(e.target.value) } })}
                        required
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="priceUmkm">Harga (UMKM)</Label>
                    <Input
                        id="priceUmkm"
                        type="number"
                        value={formState.prices?.umkm || ''}
                        onChange={(e) => setFormState({ ...formState, prices: { ...formState.prices!, umkm: Number(e.target.value) } })}
                        required
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="priceEcommerce">Harga (E-Commerce)</Label>
                    <Input
                        id="priceEcommerce"
                        type="number"
                        value={formState.prices?.ecommerce || ''}
                        onChange={(e) => setFormState({ ...formState, prices: { ...formState.prices!, ecommerce: Number(e.target.value) } })}
                        required
                    />
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formState.category}
                onValueChange={(value) => setFormState({ ...formState, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">URL Gambar</Label>
              <Input
                id="image"
                value={formState.image || ''}
                onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                placeholder="https://placehold.co/600x600.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hint">Petunjuk AI untuk Gambar (maks 2 kata)</Label>
              <Input
                id="hint"
                value={formState.hint || ''}
                onChange={(e) => setFormState({ ...formState, hint: e.target.value })}
                placeholder="e.g. abstract logo"
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
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}
