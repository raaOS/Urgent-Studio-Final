
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle2, FileJson, KeyRound, Link as LinkIcon, Loader2, Share2, AlertTriangle } from "lucide-react";
import Link from 'next/link';

export default function GoogleDriveIntegrationPage() {
    const [credentials, setCredentials] = React.useState({
        client_email: '',
        private_key: '',
        target_folder_id: '',
    });
    const [isSaving, setIsSaving] = React.useState(false);
    
    // Placeholder for save logic
    const handleSave = () => {
        setIsSaving(true);
        console.log("Menyimpan kredensial (mode prototipe):", credentials);
        // Di aplikasi nyata, ini akan memanggil server action untuk menyimpan ke Vercel.
        setTimeout(() => setIsSaving(false), 2000);
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

            <Card>
                <CardHeader>
                    <CardTitle>Status Saat Ini</CardTitle>
                </CardHeader>
                <CardContent>
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Belum Terhubung</AlertTitle>
                        <AlertDescription>
                            Integrasi Google Drive belum aktif. Ikuti langkah-langkah di bawah untuk mengaktifkannya.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold font-headline">Panduan Pengaturan (Super Detail)</h2>

                {/* Step 1 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 1: Aktifkan Google Drive API</CardTitle>
                        <CardDescription>Izinkan proyek Anda untuk berkomunikasi dengan Google Drive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>Buka Google Cloud Console. Di bagian atas halaman, pastikan Anda telah memilih proyek yang benar, yaitu proyek yang sedang Anda kerjakan saat ini (misalnya, yang bernama <strong>database urgent studio</strong> di gambar Anda).</p>
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
                        <CardTitle>Langkah 3: Masukkan Kunci Akses ke Sini</CardTitle>
                        <CardDescription>Buka file JSON yang baru saja Anda unduh dengan Notepad atau TextEditor, lalu salin isinya ke kolom di bawah.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <FileJson className="h-4 w-4" />
                            <AlertTitle>Buka file .json Anda</AlertTitle>
                            <AlertDescription>
                                Anda akan melihat konten seperti `&#123; "type": "service_account", ... &#125;`. Salin nilai dari field `client_email` dan `private_key`.
                            </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                            <Label htmlFor="client_email">Client Email</Label>
                            <Input 
                                id="client_email" 
                                placeholder="nama-akun@nama-proyek.iam.gserviceaccount.com" 
                                value={credentials.client_email}
                                onChange={(e) => setCredentials(prev => ({...prev, client_email: e.target.value}))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="private_key">Private Key</Label>
                            <Textarea 
                                id="private_key" 
                                placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n" 
                                className="font-code h-32"
                                value={credentials.private_key}
                                onChange={(e) => setCredentials(prev => ({...prev, private_key: e.target.value}))}
                            />
                        </div>
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
                        </ol>
                        <div className="space-y-2 pt-2">
                            <Label htmlFor="target_folder_id">Target Folder ID</Label>
                            <Input 
                                id="target_folder_id" 
                                placeholder="Salin ID folder dari URL Google Drive di sini"
                                value={credentials.target_folder_id}
                                onChange={(e) => setCredentials(prev => ({...prev, target_folder_id: e.target.value}))}
                            />
                        </div>
                    </CardContent>
                </Card>

                 {/* Step 5 */}
                <Card>
                    <CardHeader>
                        <CardTitle>Langkah 5: Simpan dan Selesai</CardTitle>
                        <CardDescription>Langkah terakhir adalah menyimpan semua konfigurasi ini secara aman.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <KeyRound className="h-4 w-4"/>
                            <AlertTitle>Penting: Simpan di Environment Variables</AlertTitle>
                            <AlertDescription>
                                Sebenarnya, kredensial ini harus disimpan di Environment Variables di Vercel, bukan di database. Halaman ini hanya untuk memandu Anda. Setelah ini, Anda harus menambahkan `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, dan `GOOGLE_DRIVE_FOLDER_ID` ke Vercel.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <Button size="lg" onClick={handleSave} disabled={isSaving}>
                             {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle2 className="mr-2 h-4 w-4"/>}
                            Simpan Konfigurasi
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
