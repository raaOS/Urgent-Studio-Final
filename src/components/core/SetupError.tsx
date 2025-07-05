import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, KeyRound } from 'lucide-react';

export function FirestoreNotConfiguredError() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'PROYEK_ANDA';
  
  return (
    <div className="container mx-auto max-w-4xl py-12">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-xl font-bold">Langkah Wajib: Aktifkan Database Firestore</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p className="font-bold">Error terdeteksi: `FAILED_PRECONDITION: ...database was deleted`</p>
          <p>
            Jangan panik, ini adalah error yang paling umum terjadi saat setup awal. Ini berarti aplikasi Anda **berhasil terhubung** ke proyek Firebase (`{projectId}`), tetapi layanan database di dalamnya **belum diaktifkan**.
          </p>
          
          <div className="p-4 bg-background rounded-md border border-destructive/20 text-destructive-foreground">
            <p className="font-semibold mb-2">Solusi Utama: Buat Database</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Buka <strong>Firebase Console</strong> untuk proyek Anda.</li>
              <li>Di menu sebelah kiri, klik <strong>Build &gt; Firestore Database</strong>.</li>
              <li>Klik tombol besar berwarna biru <strong>"Create database"</strong>.</li>
              <li>Pilih lokasi server (misal: `nam5 (us-central)`). Klik <strong>Next</strong>.</li>
              <li>
                Pilih <strong>Start in test mode</strong>. Ini akan membuat aturan keamanan yang mengizinkan baca/tulis selama pengembangan.
              </li>
              <li>Klik <strong>Enable</strong>. Tunggu beberapa saat hingga database Anda siap, lalu muat ulang halaman ini.</li>
            </ol>
          </div>

          <div className="p-4 bg-amber-100 rounded-md border border-amber-300 text-amber-900">
             <div className="flex items-start gap-3">
                 <KeyRound className="h-5 w-5 mt-1 text-amber-700"/>
                 <div>
                    <p className="font-bold">Bantuan! Tombol "Create Database" Tidak Bisa Diklik?</p>
                    <p className="text-sm mt-1">
                      Ini hampir selalu disebabkan oleh masalah **izin (permissions)**. Akun Anda kemungkinan hanya memiliki peran sebagai **"Viewer"**. Anda memerlukan peran **"Editor"** atau **"Owner"** untuk bisa membuat database.
                    </p>
                    <p className="text-sm mt-3 font-semibold">Cara Memeriksa & Memperbaiki:</p>
                    <ol className="list-decimal list-inside space-y-1.5 text-sm mt-2">
                        <li>Buka halaman <a href="https://console.cloud.google.com/iam-admin/iam" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Google Cloud IAM</a>.</li>
                        <li>Pastikan proyek yang benar (`{projectId}`) sudah terpilih di bagian atas halaman.</li>
                        <li>Cari alamat email Anda di dalam daftar dan lihat kolom "Role".</li>
                        <li>Jika tertulis "Viewer", **hubungi orang yang memberikan Anda akses ke proyek ini dan minta mereka untuk mengubah peran Anda menjadi "Editor".**</li>
                    </ol>
                 </div>
             </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
