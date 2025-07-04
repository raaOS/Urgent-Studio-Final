
'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, CreditCard, Tag, Info, AlertCircle, Terminal, CheckCircle2, Send, Loader2, PartyPopper, Copy } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Order, Coupon } from '@/lib/types';
import { createOrder, getWeeklyOrderCount } from '@/services/orderService';
import { getProductsByIds } from '@/services/productService';
import { getCouponByCode } from '@/services/couponService';
import { useToast } from '@/hooks/use-toast';
import { getCapacitySettings } from '@/services/capacityService';

function generateOrderCode() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    return `ORD-${year}${month}${day}-${randomSuffix}`;
}

export default function CheckoutPage() {
    const { cart, cartSubtotal } = useCart();
    const { toast } = useToast();

    // Form State
    const [name, setName] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [telegram, setTelegram] = React.useState('');
    
    // Coupon State
    const [couponCode, setCouponCode] = React.useState('');
    const [appliedCoupon, setAppliedCoupon] = React.useState<Coupon | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);
    const [couponMessage, setCouponMessage] = React.useState({ type: '', text: '' });
    
    // Bot Info State
    const [botUsername, setBotUsername] = React.useState<string | null>(null);
    const [isBotInfoLoading, setIsBotInfoLoading] = React.useState(true);

    // Flow State
    const [paymentMethod, setPaymentMethod] = React.useState('lunas');
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [orderPlaced, setOrderPlaced] = React.useState(false);
    const [placedOrderCode, setPlacedOrderCode] = React.useState('');
    const [isCopied, setIsCopied] = React.useState(false);
    
    // Persist and retrieve coupon from localStorage
    React.useEffect(() => {
        const savedCoupon = localStorage.getItem('appliedCouponCode');
        if (savedCoupon && !appliedCoupon) {
            setCouponCode(savedCoupon);
            // Re-validate and apply the coupon silently
            getCouponByCode(savedCoupon).then(validCoupon => {
                if (validCoupon) {
                    setAppliedCoupon(validCoupon);
                } else {
                    localStorage.removeItem('appliedCouponCode');
                }
            });
        }
    }, [appliedCoupon]);
    
    React.useEffect(() => {
        const fetchBotInfo = async () => {
            setIsBotInfoLoading(true);
            try {
                const response = await fetch('/api/bot-info');
                if (response.ok) {
                    const data = await response.json();
                    setBotUsername(data.username);
                } else { setBotUsername(null); }
            } catch (error) { setBotUsername(null); } 
            finally { setIsBotInfoLoading(false); }
        };
        fetchBotInfo();
    }, []);

    const subtotal = cartSubtotal;
    const bankFee = 5000;
    const discount = appliedCoupon ? subtotal * (appliedCoupon.discountPercentage / 100) : 0;
    const taxableAmount = subtotal - discount;
    const ppn = taxableAmount * 0.10;
    const total = taxableAmount + ppn + bankFee;
    const amountToPay = paymentMethod === 'dp50' ? total / 2 : total;

    const handleApplyCoupon = async () => {
        if (!couponCode) {
            setCouponMessage({ type: 'error', text: 'Masukkan kode kupon.' });
            return;
        }
        setIsApplyingCoupon(true);
        setCouponMessage({ type: '', text: '' });
        try {
            const validCoupon = await getCouponByCode(couponCode);
            if (validCoupon) {
                setAppliedCoupon(validCoupon);
                setCouponMessage({ type: 'success', text: `Kupon ${validCoupon.code} diterapkan!` });
                localStorage.setItem('appliedCouponCode', validCoupon.code); // Save to localStorage
                toast({ title: "Kupon Berhasil Diterapkan!", description: `Anda mendapat diskon ${validCoupon.discountPercentage}%.` });
            } else {
                setAppliedCoupon(null);
                setCouponMessage({ type: 'error', text: 'Kode kupon tidak valid atau sudah tidak aktif.' });
                localStorage.removeItem('appliedCouponCode');
            }
        } catch (error) {
            setAppliedCoupon(null);
            setCouponMessage({ type: 'error', text: 'Gagal memvalidasi kupon.' });
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleCreateOrder = async () => {
        // --- PRE-FLIGHT CHECKS ---
        if (!name || !telegram) {
            toast({ variant: 'destructive', title: 'Informasi Tidak Lengkap', description: 'Nama Lengkap dan Username Telegram wajib diisi.' });
            return;
        }
        if (cart.length === 0) {
            toast({ variant: 'destructive', title: 'Keranjang Kosong', description: 'Tidak bisa membuat pesanan dengan keranjang kosong.' });
            return;
        }
        
        setIsProcessing(true);

        try {
            // 1. Quota Validation: Re-check quota at the moment of truth
            const [capacitySettings, weeklyOrderCount] = await Promise.all([
                getCapacitySettings(),
                getWeeklyOrderCount(),
            ]);

            if (capacitySettings.weekly > 0 && weeklyOrderCount >= capacitySettings.weekly) {
                toast({ variant: "destructive", title: "Kuota Penuh!", description: "Mohon maaf, kuota pesanan minggu ini sudah penuh saat Anda akan checkout." });
                setIsProcessing(false);
                return;
            }

            // 2. Price Validation: Re-check prices
            const productIdsInCart = cart.map(item => item.product.id);
            const freshProducts = await getProductsByIds(productIdsInCart);
            
            let priceMismatch = false;
            const validatedCartItems = cart.map(cartItem => {
                const freshProduct = freshProducts.find(p => p.id === cartItem.product.id);
                if (!freshProduct || freshProduct.prices[cartItem.budgetTier] !== cartItem.product.price) {
                    priceMismatch = true;
                }
                // Return item with potentially updated price
                return { ...cartItem, product: { ...cartItem.product, price: freshProduct?.prices[cartItem.budgetTier] || cartItem.product.price } };
            });

            if (priceMismatch) {
                toast({ variant: "destructive", title: "Harga Berubah!", description: "Beberapa harga item di keranjang Anda telah berubah. Mohon periksa kembali." });
                // Note: A more advanced implementation would update the cart state here and let the user confirm.
                setIsProcessing(false);
                return;
            }

            // --- ALL CHECKS PASSED, PROCEED TO CREATE ORDER ---
            const newOrderCode = generateOrderCode();

            const orderData: Omit<Order, 'id'> = {
                orderCode: newOrderCode,
                customerName: name,
                customerTelegram: telegram,
                customerPhone: phone,
                items: validatedCartItems.map(item => ({
                    productId: item.product.id,
                    name: item.product.name,
                    quantity: 1,
                    price: item.product.price || 0,
                    itemStatus: 'Dalam Pengerjaan',
                    budgetTier: item.budgetTier,
                    briefs: [{ content: item.brief, timestamp: new Date(), revisionNumber: 0 }],
                    driveLink: item.driveLink,
                    dimensions: item.dimensions,
                })),
                totalAmount: total,
                amountPaid: 0,
                paymentMethod: paymentMethod === 'lunas' ? 'LUNAS' : 'DP 50%',
                status: 'Menunggu Pembayaran',
                createdAt: new Date(),
                updatedAt: new Date(),
                couponCode: appliedCoupon?.code,
                couponDiscount: discount > 0 ? discount : undefined,
            };

            await createOrder(orderData);
            setPlacedOrderCode(newOrderCode);
            setOrderPlaced(true);
            localStorage.setItem('lastOrderCode', newOrderCode); // Save for order tracker
            localStorage.removeItem('appliedCouponCode'); // Clear used coupon
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            toast({ variant: 'destructive', title: 'Gagal Membuat Pesanan', description: `Terjadi kesalahan. ${errorMessage}` });
        } finally {
            setIsProcessing(false);
        }
    };


    const handleCopyCommand = () => {
        if (!botUsername || !placedOrderCode) return;
        const command = `/start ${placedOrderCode}`;
        navigator.clipboard.writeText(command);
        setIsCopied(true);
        toast({ title: "Perintah Disalin!", description: "Anda bisa paste di chat bot Telegram." });
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="bg-background border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Toko
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold font-headline text-primary">Checkout</h1>
                    <div className="w-24 hidden sm:block"/>
                </div>
            </header>

            <main className="container mx-auto px-4 md:px-6 py-8">
                {orderPlaced ? (
                     <div className="text-center">
                        <Card className="max-w-2xl mx-auto animate-in fade-in-50 duration-500">
                        <CardHeader>
                            <PartyPopper className="h-16 w-16 mx-auto text-accent" />
                            <CardTitle className="text-3xl font-headline mt-4">Pesanan Diterima!</CardTitle>
                            <CardDescription className="text-lg">
                            Dua langkah terakhir untuk menyelesaikan pesanan Anda.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 text-left">
                           <div>
                                <h3 className="font-bold text-lg mb-2">1. Lakukan Pembayaran</h3>
                                <div className="p-4 bg-muted rounded-md border text-sm space-y-2">
                                    <p>Silakan lakukan pembayaran sejumlah: <strong className="text-primary text-xl">Rp{amountToPay.toLocaleString('id-ID')}</strong></p>
                                    <Separator/>
                                    <p className="font-semibold">BCA: 1234567890 (a.n. Urgent Studio)</p>
                                    <p className="font-semibold">Gopay/QRIS: (Link atau gambar QRIS Anda di sini)</p>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-lg mb-2">2. Konfirmasi via Telegram (Wajib)</h3>
                                <Alert>
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle>Kirim Bukti Transfer & Terima Update</AlertTitle>
                                    <AlertDescription>
                                        Ini adalah satu-satunya cara bagi kami untuk memverifikasi pembayaran Anda dan mengirimkan semua update progres, file revisi, dan hasil akhir.
                                    </AlertDescription>
                                </Alert>
                            </div>
                            
                            {isBotInfoLoading ? (
                                <div className="h-14 w-full rounded-md bg-muted animate-pulse" />
                            ) : botUsername ? (
                                <>
                                 <Button asChild className="w-full h-14 text-lg">
                                    <a href={`https://t.me/${botUsername}?start=${placedOrderCode}`} target="_blank" rel="noopener noreferrer">
                                        <Send className="mr-2 h-5 w-5" /> Buka Telegram & Konfirmasi
                                    </a>
                                 </Button>
                                 <div className="text-center text-sm text-muted-foreground">
                                    <p>Atau, jika tombol tidak bekerja:</p>
                                    <p>1. Cari bot <strong className="text-foreground">@{botUsername}</strong> di Telegram.</p>
                                    <p>2. Kirim pesan berikut ke bot:</p>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <code className="bg-muted-foreground/20 text-foreground font-semibold font-code px-3 py-1.5 rounded-md">{`/start ${placedOrderCode}`}</code>
                                        <Button variant="outline" size="icon" onClick={handleCopyCommand}>
                                            {isCopied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                 </div>
                                </>
                            ) : (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Gagal Memuat Info Bot</AlertTitle>
                                    <AlertDescription>
                                        Tidak dapat memuat tombol konfirmasi otomatis. Silakan hubungi admin kami secara manual.
                                    </AlertDescription>
                                </Alert>
                            )}

                        </CardContent>
                        <CardFooter>
                            <p className="text-xs text-muted-foreground mx-auto">
                            Kode Order Anda: <span className="font-bold font-code">{placedOrderCode}</span>
                            </p>
                        </CardFooter>
                        </Card>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Pemesan</CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Lengkap <span className="text-destructive">*</span></Label>
                                        <Input id="name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Nomor HP Aktif</Label>
                                        <Input id="phone" type="tel" placeholder="081234567890" value={phone} onChange={e => setPhone(e.target.value)} />
                                    </div>
                                    <div className="space-y-2 col-span-full">
                                        <Label htmlFor="telegram">Username Telegram <span className="text-destructive">*</span></Label>
                                        <Input id="telegram" placeholder="@johndoe" value={telegram} onChange={e => setTelegram(e.target.value)} required/>
                                        <p className="text-xs text-muted-foreground">Kami akan menghubungi Anda via Telegram untuk semua progres pesanan.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Metode Pembayaran</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Label htmlFor="dp50" className="flex flex-col items-start space-y-2 border rounded-md p-4 cursor-pointer hover:bg-accent/50 has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary transition-colors">
                                            <div className="flex items-center w-full justify-between">
                                                <span className="font-bold">DP 50%</span>
                                                <RadioGroupItem value="dp50" id="dp50" />
                                            </div>
                                            <p className="text-sm text-muted-foreground">Bayar setengah sekarang, sisanya setelah desain disetujui.</p>
                                        </Label>
                                        <Label htmlFor="lunas" className="flex flex-col items-start space-y-2 border rounded-md p-4 cursor-pointer hover:bg-accent/50 has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary transition-colors">
                                            <div className="flex items-center w-full justify-between">
                                                <span className="font-bold">Bayar Lunas</span>
                                                <RadioGroupItem value="lunas" id="lunas" />
                                            </div>
                                            <p className="text-sm text-muted-foreground">Bayar penuh sekarang dan dapatkan prioritas antrian.</p>
                                        </Label>
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        </div>
                        
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ringkasan Pesanan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {cart.length === 0 ? (
                                        <p className='text-muted-foreground text-center'>Keranjang Anda kosong.</p>
                                    ) : (
                                        cart.map(item => (
                                        <div key={item.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <Image src={item.product.image} data-ai-hint={item.product.hint} alt={item.product.name} width={48} height={48} className="rounded-md" />
                                                <div>
                                                    <p className="font-semibold">{item.product.name}</p>
                                                    <p className="text-sm text-muted-foreground">1 x Rp{(item.product.price || 0).toLocaleString('id-ID')}</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-right">Rp{(item.product.price || 0).toLocaleString('id-ID')}</p>
                                        </div>
                                    )))}
                                    {cart.length > 0 && (
                                        <>
                                            <Separator />
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Subtotal</span>
                                                    <span>Rp{subtotal.toLocaleString('id-ID')}</span>
                                                </div>
                                                {appliedCoupon && (
                                                    <div className="flex justify-between text-green-600 font-semibold">
                                                        <span>Diskon ({appliedCoupon.code})</span>
                                                        <span>-Rp{discount.toLocaleString('id-ID')}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">PPN (10%)</span>
                                                    <span>Rp{ppn.toLocaleString('id-ID')}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">Biaya Penanganan</span>
                                                    <span>Rp{bankFee.toLocaleString('id-ID')}</span>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between font-bold text-lg">
                                                <span>Total</span>
                                                <span>Rp{total.toLocaleString('id-ID')}</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg text-primary">
                                                <span>{paymentMethod === 'dp50' ? 'DP 50% Dibayar' : 'Total Dibayar'}</span>
                                                <span>Rp{amountToPay.toLocaleString('id-ID')}</span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                                <CardFooter className="flex-col items-start gap-2">
                                    <Label htmlFor="coupon">Kode Kupon</Label>
                                    <div className="flex w-full gap-2">
                                        <Input id="coupon" placeholder="Contoh: ARTISANT15" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} disabled={!!appliedCoupon} />
                                        <Button onClick={handleApplyCoupon} disabled={isApplyingCoupon || !!appliedCoupon}>
                                            {isApplyingCoupon && <Loader2 className="h-4 w-4 animate-spin" />}
                                            {appliedCoupon ? 'OK' : 'Pakai'}
                                        </Button>
                                    </div>
                                    {couponMessage.text && <p className={`text-xs font-medium ${couponMessage.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>{couponMessage.text}</p>}
                                </CardFooter>
                            </Card>

                            <Button className="w-full h-12 text-lg" disabled={cart.length === 0 || isProcessing} onClick={handleCreateOrder}>
                                {isProcessing ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : (
                                    <CreditCard className="mr-2 h-5 w-5" />
                                )}
                                Lanjut & Buat Pesanan
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
