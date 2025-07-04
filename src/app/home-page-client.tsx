
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShoppingCart, X, AlertCircle, Plus, Check, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import type { Product, SuggestBriefImprovementOutput, Banner as BannerType } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';

import { Banner } from '@/components/landing/banner';
import { OrderTracker } from '@/components/landing/order-tracker';
import { BudgetTiers } from '@/components/landing/budget-tiers';
import { ProductCarousel } from '@/components/landing/product-carousel';
import { CouponTicket } from '@/components/landing/coupon-ticket';
import { MobileNav } from '@/components/landing/mobile-nav';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { suggestBriefImprovement } from '@/ai/flows/suggest-brief-improvement';

const tierMap: { [key: string]: 'kakiLima' | 'umkm' | 'ecommerce' } = {
  'Kaki Lima': 'kakiLima',
  'UMKM': 'umkm',
  'E-Commerce': 'ecommerce',
};

const MIN_BRIEF_WORDS = 10; // Reduced for easier testing

export default function HomePageClient({ 
  initialProducts,
  isQuotaFull,
  initialBanners,
}: { 
  initialProducts: Product[],
  isQuotaFull: boolean,
  initialBanners: BannerType[],
}) {
  const { toast } = useToast();
  const { cart, removeFromCart, cartSubtotal, totalItems, addToCart } = useCart();
  
  const [products] = React.useState<Product[]>(initialProducts);
  const [selectedTier, setSelectedTier] = React.useState<'Kaki Lima' | 'UMKM' | 'E-Commerce'>('Kaki Lima');

  // State for the centralized brief dialog
  const [productForBrief, setProductForBrief] = React.useState<Product | null>(null);
  const [brief, setBrief] = React.useState('');
  const [driveLink, setDriveLink] = React.useState('');
  const [dimensions, setDimensions] = React.useState('');
  
  // State for validation & AI
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isBriefTouched, setIsBriefTouched] = React.useState(false);
  const [briefWordCount, setBriefWordCount] = React.useState(0);
  const [analysisResult, setAnalysisResult] = React.useState<SuggestBriefImprovementOutput | null>(null);
  const [isAnalysisDialogOpen, setIsAnalysisDialogOpen] = React.useState(false);


  // Get original category order
  const productCategories = [...new Set(products.map(p => p.category))];

  const groupedProducts = React.useMemo(() => {
    const tierKey = tierMap[selectedTier] || 'kakiLima';

    const adjustedProducts = products
      .map(product => ({
        ...product,
        price: product.prices[tierKey] || product.prices.kakiLima,
      }));
    
    return adjustedProducts.reduce((acc, product) => {
      const category = product.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {} as { [key: string]: Product[] });

  }, [products, selectedTier]);
  
  const hasProducts = products.length > 0;

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Tersalin!",
      description: `Kode kupon ${code} berhasil disalin.`,
    });
  };

  // Derived validation states
  const isBriefValidForSubmission = briefWordCount >= MIN_BRIEF_WORDS;
  const showBriefError = isBriefTouched && !isBriefValidForSubmission;


  const handleBriefDialogChange = (open: boolean) => {
      if (!open) {
        setProductForBrief(null);
        // Reset all state when closing the dialog
        setBrief('');
        setDriveLink('');
        setDimensions('');
        setBriefWordCount(0);
        setIsBriefTouched(false);
        setAnalysisResult(null);
        setIsProcessing(false);
      }
  }

  const handleAddToCart = async () => {
    if (!productForBrief || !isBriefValidForSubmission) {
        setIsBriefTouched(true); // Trigger validation feedback
        toast({ variant: "destructive", title: "Brief Terlalu Singkat", description: `Tolong tulis brief minimal ${MIN_BRIEF_WORDS} kata.`});
        return;
    }

    setIsProcessing(true);
    try {
        // --- MANDATORY AI CHECK ---
        const result = await suggestBriefImprovement({
            designBrief: brief,
            budgetTier: selectedTier,
            driveLink: driveLink,
        });

        if (result.isMatch) {
            // If match, add to cart and close dialog
            addToCart(productForBrief, selectedTier, { brief, driveLink, dimensions });
            handleBriefDialogChange(false); // Close and reset dialog
        } else {
            // If not a match, show the analysis dialog
            setAnalysisResult(result);
            setIsAnalysisDialogOpen(true);
        }
    } catch (error) {
        console.error("Error analyzing brief:", error);
        toast({ variant: "destructive", title: "Gagal Menganalisis", description: "Terjadi kesalahan pada server AI. Silakan coba lagi."});
    } finally {
        setIsProcessing(false);
    }
  }
  
  const handleBriefBlur = () => setIsBriefTouched(true);

  return (
    <>
    <Sheet>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold font-headline">Urgent Studio</span>
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <SheetTrigger asChild>
                <Button>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Keranjang ({totalItems})
                    {cart.length > 0 && <span className="ml-2 font-bold">Rp{cartSubtotal.toLocaleString('id-ID')}</span>}
                </Button>
              </SheetTrigger>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          
          <section className="container mx-auto px-4 md:px-6 py-12">
             <Banner banners={initialBanners} />
          </section>

          <section className="container mx-auto px-4 md:px-6 pb-12 md:pb-20">
            <BudgetTiers selectedTier={selectedTier} onSelectTier={setSelectedTier} />
          </section>
          
          <section className="container mx-auto px-4 md:px-6 pb-12 md:pb-20">
            <OrderTracker />
          </section>

          <section id="products" className="bg-muted/30 py-12 md:py-20">
            <div className="container mx-auto px-4 md:px-6">
              {isQuotaFull && (
                  <Alert variant="destructive" className="mb-8">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Kuota Order Penuh!</AlertTitle>
                      <AlertDescription>
                      Mohon maaf, antrian desain untuk minggu ini sudah penuh. Silakan coba lagi minggu depan. Tombol order dinonaktifkan sementara.
                      </AlertDescription>
                  </Alert>
              )}
                
              {hasProducts ? (
                <div className="space-y-8">
                  {productCategories.map(category => {
                      const categoryProducts = groupedProducts[category];
                      if (!categoryProducts || categoryProducts.length === 0) return null;

                      return (
                          <ProductCarousel
                              key={category}
                              category={category}
                              products={categoryProducts}
                              isQuotaFull={isQuotaFull}
                              onAddToCart={setProductForBrief}
                          />
                      );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                    <p>Tidak ada produk untuk ditampilkan saat ini.</p>
                </div>
              )}

            </div>
          </section>
          
          <section className="container mx-auto px-4 md:px-6 py-12 md:py-20">
            <CouponTicket onCopy={copyCoupon}/>
          </section>

        </main>
        
        <SheetContent className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
              <SheetTitle>Keranjang Belanja</SheetTitle>
          </SheetHeader>
          
          {cart.length === 0 ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center">
                  <ShoppingCart className="h-20 w-20 text-muted-foreground/30 mb-4"/>
                  <h3 className="text-xl font-semibold">Keranjang Anda Kosong</h3>
                  <p className="text-muted-foreground">Tambahkan beberapa produk untuk memulai.</p>
                  <Button variant="outline" className="mt-4" asChild>
                      <Link href="/#products">Jelajahi Produk</Link>
                  </Button>
              </div>
          ) : (
              <ScrollArea className="flex-grow my-4 pr-6 -mr-6">
                  <div className="space-y-4">
                      {cart.map(item => (
                          <div key={item.id} className="flex items-start gap-4">
                              <Image src={item.product.image} data-ai-hint={item.product.hint} alt={item.product.name} width={80} height={80} className="rounded-md object-cover"/>
                              <div className="flex-grow">
                                  <h4 className="font-semibold">{item.product.name}</h4>
                                  <p className="text-sm text-muted-foreground">Rp{(item.product.price || 0).toLocaleString('id-ID')}</p>
                                  <p className="text-xs text-muted-foreground mt-2">Brief &amp; link diisi.</p>
                              </div>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive h-8 w-8" onClick={() => removeFromCart(item.id)}>
                                  <X className="h-4 w-4"/>
                              </Button>
                          </div>
                      ))}
                  </div>
              </ScrollArea>
          )}

          <SheetFooter className="mt-auto pt-4 border-t">
              <div className="w-full space-y-4">
                  <div className="flex justify-between font-bold text-lg">
                      <span>Subtotal</span>
                      <span>Rp{cartSubtotal.toLocaleString('id-ID')}</span>
                  </div>
                  <Button className="w-full h-12 text-lg" asChild disabled={cart.length === 0}>
                      <Link href="/checkout">Lanjut ke Checkout</Link>
                  </Button>
              </div>
          </SheetFooter>
        </SheetContent>

        <MobileNav />

        <Dialog open={!!productForBrief} onOpenChange={handleBriefDialogChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Detail untuk: {productForBrief?.name}</DialogTitle>
                    <DialogDescription>
                        Isi informasi di bawah ini untuk membantu desainer kami.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor={`brief-${productForBrief?.id}`}>
                            Brief Desain ({selectedTier}) <span className="text-destructive">*</span>
                        </Label>
                        <Textarea 
                            id={`brief-${productForBrief?.id}`}
                            placeholder="Tulis dengan jelas! Desain kamu mau seperti apa? Jelaskan detail seperti warna, tulisan, dan gaya yang diinginkan."
                            value={brief}
                            onBlur={handleBriefBlur}
                            onChange={(e) => {
                                setBrief(e.target.value);
                                setBriefWordCount(e.target.value.split(/\s+/).filter(Boolean).length);
                            }}
                            className={cn({'border-destructive bg-destructive/10 focus-visible:ring-destructive': showBriefError})}
                        />
                         <div className="flex justify-between items-center text-xs">
                           {showBriefError ? (
                                <p className="text-destructive font-medium">
                                    Minimal {MIN_BRIEF_WORDS} kata.
                                </p>
                            ) : (
                                <p className="text-muted-foreground">
                                    Brief akan divalidasi oleh AI.
                                </p>
                            )}
                            <div className={cn(
                                "flex items-center gap-1 font-medium tabular-nums",
                                showBriefError ? 'text-destructive' : 'text-muted-foreground',
                                isBriefValidForSubmission && 'text-green-600'
                            )}>
                                {isBriefValidForSubmission && <Check className="h-4 w-4" />}
                                <span>
                                    {briefWordCount}/{MIN_BRIEF_WORDS} kata
                                </span>
                            </div>
                        </div>
                    </div>
                    {selectedTier !== 'Kaki Lima' && (
                    <div className="space-y-2">
                        <Label htmlFor={`driveLink-${productForBrief?.id}`}>
                            Link Google Drive (Opsional)
                        </Label>
                        <p className="text-xs text-muted-foreground -mt-1.5">
                            Berisi logo atau aset tambahan untuk desain.
                        </p>
                         <Input 
                            id={`driveLink-${productForBrief?.id}`}
                            placeholder="Contoh: drive.google.com/..." 
                            value={driveLink}
                            onChange={(e) => setDriveLink(e.target.value)}
                        />
                    </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor={`dimensions-${productForBrief?.id}`}>Ukuran (Opsional)</Label>
                        <Input 
                            id={`dimensions-${productForBrief?.id}`}
                            placeholder="Contoh: 1080x1080px atau 10x15cm" 
                            value={dimensions}
                            onChange={(e) => setDimensions(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="sm:justify-end">
                    <div className="flex gap-2">
                        <Button type="button" variant="ghost" onClick={() => handleBriefDialogChange(false)}>Batal</Button>
                        <Button type="button" onClick={handleAddToCart} disabled={!isBriefValidForSubmission || isProcessing}>
                           {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                           Tambahkan ke Keranjang
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </Sheet>
    
    <AlertDialog open={isAnalysisDialogOpen} onOpenChange={setIsAnalysisDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    {analysisResult?.isMatch 
                        ? "✅ Brief Sesuai!" 
                        : "⚠️ Brief Belum Sesuai"}
                </AlertDialogTitle>
                <AlertDialogDescription asChild>
                    {analysisResult?.isMatch ? (
                        <span>Brief Anda sudah cocok dengan tier budget yang dipilih. Anda bisa langsung melanjutkan pesanan.</span>
                        ) : (
                            <div className='space-y-3 pt-2 text-foreground'>
                                <p>Brief Anda belum sesuai dengan tier <span className='font-bold'>{selectedTier}</span> yang dipilih. Agar bisa melanjutkan, mohon perbaiki brief Anda.</p>
                                <div className='p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm space-y-2'>
                                    <p className='font-semibold'>Alasan:</p>
                                    <p>{analysisResult?.reasoning}</p>
                                    <p className='font-semibold pt-2'>Saran Perbaikan:</p>
                                    <p>{analysisResult?.suggestion}</p>
                                </div>
                            </div>
                        )
                    }
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => setIsAnalysisDialogOpen(false)}>
                    Saya Mengerti
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
