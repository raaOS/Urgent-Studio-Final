
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2, FileJson, KeyRound, Link as LinkIcon, Loader2, Share2, AlertTriangle, HelpCircle } from "lucide-react";
import Link from 'next/link';
import { testGoogleDriveConnection } from '@/services/googleDriveService';

export default function GoogleDriveIntegrationPage() {
    const [isTesting, setIsTesting] = React.useState(false);
    const [testResult, setTestResult] = React.useState<{ success: boolean; message: string; } | null>(null);

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        const result = await testGoogleDriveConnection();
        setTestResult(result);
        setIsTesting(false);
    };

    return (
        <div className="space-y-8">
            <div>
                <Button asChild variant="outline">
                    <Link href="/panel/settings/integrations">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Integrasi
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline mt-4">Integrasi Google Drive</h1>
                <p className="text-muted-foreground">Hubungkan aplikasi ini dengan Google Drive untuk membuat folder proyek klien secara otomatis.</p>
            </div>
            
            <Alert variant="destructive">
                <KeyRound className="h-4 w-4"/>
                <AlertTitle>Penting: Di Mana Harus Mengatur Variabel Ini?</AlertTitle>
                <AlertDescription>
                    Semua variabel di bawah ini <strong>TIDAK</strong> diatur di halaman ini, melainkan di <strong>Environment Variables</strong>.
                    <ul className="list-disc pl-5 mt-2 text-xs">
                        <li><strong>Untuk Pengembangan Lokal:</strong> Masukkan ke dalam file <code className="font-mono bg-background px-1 py-0.5 rounded">.env</code> di direktori utama proyek Anda.</li>
                        <li><strong>Untuk Aplikasi Live (di Vercel):</strong> Masukkan ke dalam menu <strong>Settings &gt; Environment Variables</strong> di dashboard proyek Vercel Anda.</li>
                    </ul>
                     <p className="mt-2 text-xs">Setelah mengatur di file <code className="font-mono bg-background px-1 py-0.5 rounded">.env</code>, Anda harus <strong>me-restart server dev Anda</strong> (tutup terminal lalu jalankan lagi <code className="font-mono bg-background px-1 py-0.5 rounded">npm run dev</code>) agar perubahan terbaca.</p>
                </AlertDescription>
            </Alert>

            {/* CARD PENGUJIAN KONEKSI */}
            <Card>
                <CardHeader>
                    <CardTitle>Langkah Terakhir: Uji Koneksi Anda</CardTitle>
                    <CardDescription>Setelah Anda yakin semua variabel environment sudah diatur, tekan tombol ini untuk memeriksa apakah semuanya berfungsi.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleTestConnection} disabled={isTesting} size="lg">
                        {isTesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <HelpCircle className="mr-2 h-4 w-4"/>}
                        Tes Koneksi Google Drive
                    </Button>
                    {testResult && (
                         <Alert className="mt-4 whitespace-pre-wrap" variant={testResult.success ? 'default' : 'destructive'}>
                            {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                            <AlertTitle>{testResult.success ? 'Berhasil' : 'Gagal'}</AlertTitle>
                            <AlertDescription>
                                {testResult.message}
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>


            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-headline">Panduan Pengaturan (Wajib Ikuti)</h2>

                {/* Step 1 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 1: Aktifkan Google Drive API</CardTitle>
                        <CardDescription>Izinkan proyek Anda untuk berkomunikasi dengan Google Drive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>Buka Google Cloud Console. Di bagian atas halaman, pastikan Anda telah memilih proyek yang benar (proyek yang sama dengan database Firebase Anda).</p>
                        <Button asChild>
                            <a href="https://console.cloud.google.com/apis/library/drive.googleapis.com" target="_blank" rel="noopener noreferrer">
                                Buka Halaman Google Drive API <LinkIcon className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                        <p>Pada halaman tersebut, klik tombol biru **"Enable"** atau **"Aktifkan"**. Jika tombolnya bertuliskan "Manage" atau "Kelola", berarti API sudah aktif dan Anda bisa lanjut ke langkah berikutnya.</p>
                    </CardContent>
                </Card>

                {/* Step 2 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 2: Buat Kunci Akses (Service Account)</CardTitle>
                        <CardDescription>Buat "akun robot" yang akan digunakan aplikasi untuk mengakses Drive atas nama Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>Kunci akses ini sangat rahasia. Jangan pernah membagikannya di tempat umum.</p>
                        <Button asChild variant="secondary">
                            <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" rel="noopener noreferrer">
                                Buka Halaman Service Accounts <LinkIcon className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>Klik **"+ CREATE SERVICE ACCOUNT"** di bagian atas.</li>
                            <li>Beri nama (misal: `urgent-studio-drive-manager`) dan klik **"CREATE AND CONTINUE"**.</li>
                            <li>Pada bagian "Grant this service account access to project", pilih peran **"Editor"** agar bisa membuat folder. Klik **"CONTINUE"**.</li>
                            <li>Lewati langkah ketiga (grant users access) dan klik **"DONE"**.</li>
                            <li>Anda akan kembali ke daftar. Cari akun yang baru Anda buat, klik ikon titik tiga (⋮) di ujung kanan, lalu pilih **"Manage keys"**.</li>
                            <li>Klik **"ADD KEY"** -> **"Create new key"**.</li>
                            <li>Pilih tipe **JSON** dan klik **"CREATE"**. Sebuah file `.json` akan terunduh otomatis. **Simpan file ini baik-baik!**</li>
                        </ol>
                    </CardContent>
                </Card>
                
                {/* Step 3 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 3: Buka & Pahami File JSON Anda</CardTitle>
                        <CardDescription>Buka file JSON yang baru saja Anda unduh dengan Notepad atau TextEditor. Anda akan membutuhkan dua nilai dari file ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <FileJson className="h-4 w-4" />
                            <AlertTitle>Dua Nilai Penting:</AlertTitle>
                            <AlertDescription>
                                <ol className='list-decimal list-inside'>
                                    <li>Cari field `"client_email"`, salin nilainya (misal: `nama-akun@...iam.gserviceaccount.com`).</li>
                                    <li>Cari field `"private_key"`, salin seluruh nilainya, termasuk `-----BEGIN ... KEY-----` dan `-----END ... KEY-----`.</li>
                                </ol>
                            </AlertDescription>
                        </Alert>
                         <Alert variant="destructive">
                            <KeyRound className="h-4 w-4"/>
                            <AlertTitle>Penting: Simpan di Environment Variables</AlertTitle>
                            <AlertDescription>
                                Dua nilai ini harus disimpan di Environment Variables di Vercel atau file `.env` lokal Anda. <strong>Jangan masukkan ke kode!</strong>
                                 <ul className="list-disc pl-5 mt-2 font-mono text-xs">
                                    <li>`GOOGLE_CLIENT_EMAIL`= (isi dengan client_email Anda)</li>
                                    <li>`GOOGLE_PRIVATE_KEY`= (isi dengan private_key Anda)</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>

                {/* Step 4 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 4: Izinkan Akses ke Folder Utama</CardTitle>
                        <CardDescription>Beri tahu Google Drive folder mana yang boleh diakses oleh "akun robot" kita.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>Buat satu folder khusus di Google Drive Anda, misalnya dengan nama **"Urgent Studio Projects"**. Folder ini akan menjadi "rumah" bagi semua folder proyek klien.</li>
                            <li>Buka folder tersebut, klik namanya di bagian atas, lalu pilih **"Share"** -> **"Share"**.</li>
                            <li>Di kolom "Add people and groups", **tempelkan `client_email`** dari Langkah 3.</li>
                            <li>Pastikan perannya adalah **"Editor"**, lalu klik **"Send"**. Abaikan peringatan yang mungkin muncul.</li>
                            <li>Buka folder tersebut lagi, dan lihat URL di browser Anda. Salin ID foldernya. Contoh: `https://.../folders/INI_ADALAH_ID_FOLDER_ANDA`.</li>
                            <li>Simpan ID ini di Environment Variables Vercel/`.env` dengan nama `GOOGLE_DRIVE_FOLDER_ID`.</li>
                        </ol>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
