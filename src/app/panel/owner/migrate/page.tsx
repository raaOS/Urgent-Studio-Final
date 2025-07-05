
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, ArrowRight, Loader2, AlertTriangle, PartyPopper, Info } from 'lucide-react';
import { migrateProductsFromOldProject, migrateOtherDataFromOldProject } from '@/services/migrationService';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function MigrationPage() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isOtherLoading, setIsOtherLoading] = React.useState(false);
    const [result, setResult] = React.useState<{ status: 'success' | 'error' | 'info'; message: string; details?: string } | null>(null);
    const { toast } = useToast();

    const handleProductMigration = async () => {
        setIsLoading(true);
        setResult(null);
        try {
            const migrationResult = await migrateProductsFromOldProject();
            if (migrationResult.success) {
                if (migrationResult.count === 0 && migrationResult.error) {
                    setResult({ status: 'info', message: migrationResult.error });
                    toast({ title: "Informasi Migrasi Produk", description: migrationResult.error, duration: 5000 });
                } else {
                    const successMessage = `Migrasi Produk Selesai! ${migrationResult.count} produk berhasil disalin.`;
                    setResult({ status: 'success', message: successMessage });
                    toast({ title: "Migrasi Produk Berhasil!", description: "Silakan refresh halaman Kontrol Produk untuk melihatnya.", duration: 5000 });
                }
            } else {
                throw new Error(migrationResult.error);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
            setResult({ status: 'error', message: message });
            toast({ variant: 'destructive', title: "Gagal Migrasi Produk", description: message, duration: 9000 });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtherDataMigration = async () => {
        setIsOtherLoading(true);
        setResult(null);
        try {
            const migrationResult = await migrateOtherDataFromOldProject();
            if (migrationResult.success) {
                const details = Object.entries(migrationResult.results)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(', ');
                const total = Object.values(migrationResult.results).reduce((sum, count) => sum + count, 0);

                if (total === 0) {
                     setResult({ status: 'info', message: "Tidak ada data lain (orders, users, coupons, dll) yang ditemukan untuk dimigrasi." });
                    toast({ title: "Informasi Migrasi", description: "Tidak ada data lain yang ditemukan.", duration: 5000 });
                } else {
                    const successMessage = `Migrasi Data Lain Selesai! Total ${total} dokumen berhasil disalin.`;
                    setResult({ status: 'success', message: successMessage, details: `Detail: ${details}` });
                    toast({ title: "Migrasi Data Lain Berhasil!", description: `Detail: ${details}`, duration: 5000 });
                }
            } else {
                throw new Error(migrationResult.error);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
            setResult({ status: 'error', message: message });
            toast({ variant: 'destructive', title: "Gagal Migrasi Data Lain", description: message, duration: 9000 });
        } finally {
            setIsOtherLoading(false);
        }
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold font-headline">Alat Migrasi Data Firestore</h1>
                <p className="text-muted-foreground">Pindahkan data dari proyek Firebase lama ke proyek saat ini.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Proses Migrasi</CardTitle>
                    <CardDescription>Alat ini akan membaca koleksi dari database lama dan menyalinnya ke database proyek saat ini.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Penting! Baca Sebelum Melanjutkan</AlertTitle>
                        <AlertDescription>
                           <ul className="list-disc pl-5 space-y-1">
                               <li>Pastikan Anda sudah mengatur variabel `OLD_FIREBASE_API_KEY` di file `.env` dengan benar.</li>
                               <li>Setiap tombol hanya perlu ditekan **SATU KALI SAJA**. Menjalankannya beberapa kali dapat menyebabkan **duplikasi data**.</li>
                           </ul>
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4">
                    <Button onClick={handleProductMigration} disabled={isLoading || isOtherLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                        Migrasi Data Produk
                    </Button>
                    <Button onClick={handleOtherDataMigration} disabled={isLoading || isOtherLoading}>
                        {isOtherLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
                        Migrasi Data Lain (Order, User, Kupon, dll)
                    </Button>
                </CardFooter>
            </Card>

            {result && (
                <Alert 
                    variant={result.status === 'error' ? 'destructive' : 'default'} 
                    className={
                        result.status === 'success' ? 'border-green-500 bg-green-50' : 
                        result.status === 'info' ? 'border-sky-500 bg-sky-50' : ''
                    }
                >
                    {result.status === 'success' ? <PartyPopper className="h-4 w-4" /> : 
                     result.status === 'info' ? <Info className="h-4 w-4" /> : 
                     <AlertTriangle className="h-4 w-4" />}
                    <AlertTitle>
                        {result.status === 'success' ? "Sukses!" : 
                         result.status === 'info' ? "Informasi" : 
                         "Error!"}
                    </AlertTitle>
                    <AlertDescription>
                        <p>{result.message}</p>
                        {result.details && <p className='mt-2 text-xs font-mono'>{result.details}</p>}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
