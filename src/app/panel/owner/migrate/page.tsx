
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Database, ArrowRight, Loader2, AlertTriangle, PartyPopper } from 'lucide-react';
import { migrateProductsFromOldProject } from '@/services/migrationService';
import { useToast } from '@/hooks/use-toast';

export default function MigrationPage() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [result, setResult] = React.useState<{ status: 'success' | 'error'; message: string } | null>(null);
    const { toast } = useToast();

    const handleMigration = async () => {
        if (!confirm("Apakah Anda yakin ingin memulai migrasi? Ini akan menyalin semua produk dari database lama ke database saat ini. Produk yang sudah ada dengan nama yang sama mungkin akan terduplikasi.")) {
            return;
        }
        setIsLoading(true);
        setResult(null);
        try {
            const migrationResult = await migrateProductsFromOldProject();
            if (migrationResult.success) {
                setResult({ status: 'success', message: `Migrasi Selesai! ${migrationResult.count} produk berhasil disalin.` });
                toast({ title: "Migrasi Berhasil!", description: `${migrationResult.count} produk telah disalin ke database baru.` });
            } else {
                throw new Error(migrationResult.error);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
            setResult({ status: 'error', message: message });
            toast({ variant: 'destructive', title: "Gagal Migrasi", description: message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold font-headline">Alat Migrasi Data Firestore</h1>
                <p className="text-muted-foreground">Pindahkan data produk dari proyek Firebase lama ke proyek saat ini.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Proses Migrasi Produk</CardTitle>
                    <CardDescription>Alat ini akan membaca koleksi `products` dari database lama dan menyalinnya ke database proyek saat ini.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-center gap-4 text-center">
                        <div className="p-4 border rounded-lg bg-muted text-center">
                            <p className="font-semibold">Database Lama</p>
                            <p className="text-sm font-code text-muted-foreground">ID: {'database-urgent-studio'}</p>
                        </div>
                        <ArrowRight className="h-8 w-8 text-primary" />
                         <div className="p-4 border-2 border-primary rounded-lg bg-primary/10 text-center">
                            <p className="font-semibold">Database Saat Ini</p>
                            <p className="text-sm font-code text-muted-foreground">ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</p>
                        </div>
                    </div>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Perhatian!</AlertTitle>
                        <AlertDescription>
                           Pastikan Anda sudah mengatur variabel `OLD_FIREBASE_API_KEY` di file `.env` Anda dengan API Key dari proyek lama. Jika belum, migrasi akan gagal.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleMigration} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Mulai Migrasi Data Produk
                    </Button>
                </CardFooter>
            </Card>

            {result && (
                <Alert variant={result.status === 'success' ? 'default' : 'destructive'} className={result.status === 'success' ? 'border-green-500 bg-green-50' : ''}>
                    {result.status === 'success' ? <PartyPopper className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    <AlertTitle>{result.status === 'success' ? "Sukses!" : "Error!"}</AlertTitle>
                    <AlertDescription>{result.message}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
