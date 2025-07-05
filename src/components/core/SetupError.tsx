import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, AlertTriangle } from 'lucide-react';

export function FirestoreNotConfiguredError() {
  return (
    <div className="container mx-auto max-w-3xl py-12">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-xl font-bold">Konfigurasi Firebase Belum Lengkap!</AlertTitle>
        <AlertDescription className="mt-2 space-y-4">
          <p className="font-bold">Error terdeteksi: `FAILED_PRECONDITION: database was deleted`</p>
          <p>
            Ini adalah error yang sangat umum dan mudah diperbaiki. Artinya, aplikasi Anda **berhasil terhubung** ke proyek Firebase, tetapi layanan database (Firestore) di dalamnya **belum diaktifkan**. Ini adalah langkah wajib.
          </p>
          <div className="p-4 bg-background rounded-md border border-destructive/20 text-destructive-foreground">
            <p className="font-semibold mb-2">Langkah-langkah untuk memperbaiki:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Buka <strong>Firebase Console</strong> dan pilih proyek Anda (`artisant-5dmih`).</li>
              <li>Di menu sebelah kiri, klik <strong>Build &gt; Firestore Database</strong>.</li>
              <li>Klik tombol besar berwarna biru <strong>"Create database"</strong>.</li>
              <li>Pilih lokasi server (misal: `nam5 (us-central)`). Klik <strong>Next</strong>.</li>
              <li>
                Pilih <strong>Start in test mode</strong>. Ini akan membuat aturan keamanan yang mengizinkan baca/tulis selama pengembangan.
                <div className="text-xs mt-1 pl-4 text-destructive-foreground/80">
                  (Peringatan: Aturan ini harus diamankan sebelum aplikasi live. Kita akan membahasnya nanti.)
                </div>
              </li>
              <li>Klik <strong>Enable</strong>. Tunggu beberapa saat hingga database Anda siap.</li>
            </ol>
          </div>
          <p className="font-semibold pt-2">Setelah database dibuat, silakan muat ulang halaman ini.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
