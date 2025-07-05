# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## 🚀 PENTING: Konfigurasi Awal (Langkah Pertama!)

Sebelum menjalankan aplikasi, Anda **WAJIB** mengatur variabel lingkungan (environment variables). Ini adalah kunci rahasia yang dibutuhkan aplikasi untuk terhubung ke Firebase, AI, dan Telegram.

1.  **Buka file `.env`** yang ada di direktori utama proyek Anda.
2.  **Hapus tanda `#`** dari setiap baris.
3.  **Isi semua nilainya** sesuai dengan instruksi yang ada di dalam file tersebut.

Aplikasi tidak akan berfungsi dengan benar jika langkah ini dilewati.

---

## ⚠️ PENTING #2: Mengatasi Error Kritis (Database Tidak Ada atau Terkunci)

Jika Anda melihat error `FAILED_PRECONDITION: ...database was deleted` atau `PERMISSION_DENIED` di log server, ini masalah konfigurasi Firebase yang umum. **Aplikasi ini dirancang untuk menampilkan halaman error yang jelas jika masalah ini terjadi.**

### Penyebab & Solusi Utama
Error `database was deleted` hampir selalu berarti Anda belum **membuat database** di dalam proyek Firebase Anda. Ikuti langkah-langkah ini:

1.  Buka **Firebase Console** dan pilih proyek Anda.
2.  Di menu sebelah kiri, klik **Build > Firestore Database**.
3.  Klik tombol besar **"Create database"** atau **"Add database"**.
4.  Pilih lokasi server (misal: `nam5 (us-central)`). Klik **Next**.
5.  Pilih **Start in test mode**. Ini akan membuat aturan keamanan yang mengizinkan baca/tulis selama pengembangan.
6.  Klik **Enable**. Tunggu beberapa saat hingga database Anda siap.

### Bantuan! Tombol "Create Database" Tidak Bisa Diklik atau Error?
Jika Anda tidak bisa mengklik tombol "Create database" atau mendapatkan error saat melakukannya (seperti yang terlihat pada gambar Anda), ini hampir selalu disebabkan oleh masalah **izin (permissions)** pada akun Google Anda untuk proyek ini.

**Solusi:** Anda harus memastikan akun Anda memiliki peran sebagai **"Owner"** atau **"Editor"**.
1.  Buka [Google Cloud Console IAM Page](https://console.cloud.google.com/iam-admin/iam).
2.  Pastikan proyek yang benar sudah terpilih di bagian atas halaman.
3.  Cari alamat email Anda di dalam daftar.
4.  Lihat kolom **"Role"**. Jika tertulis **"Viewer"**, Anda tidak akan bisa membuat database.
5.  **Jika Anda bukan "Owner", hubungi orang yang memberikan Anda akses ke proyek ini dan minta mereka untuk mengubah peran Anda menjadi "Editor".**

Setelah peran Anda diubah, kembali ke Firebase Console dan ulangi langkah-langkah di atas.

### Error `PERMISSION_DENIED` Setelah Database Dibuat
Jika Anda kemudian mendapatkan error `PERMISSION_DENIED`, itu berarti aturan keamanannya salah. Pastikan isinya seperti ini di tab **Rules**:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
Klik **Publish**.

**Peringatan:** Aturan ini membuat data Anda bisa diakses oleh siapa saja. Ini aman untuk pengembangan, tetapi **WAJIB** diamankan sebelum aplikasi Anda diluncurkan ke publik. [Pelajari cara mengamankan data Anda di sini.](https://firebase.google.com/docs/firestore/security/get-started)

---

## 🗄️ PENTING #3: Panduan Memindahkan Data Firestore (Migrasi)

Anda baru saja mengubah koneksi aplikasi ke proyek Firebase yang baru. Namun, **data (seperti produk, pesanan, pengguna) tidak ikut pindah secara otomatis**. Aplikasi Anda sekarang terhubung ke database yang kemungkinan besar masih kosong di proyek `artisant-5dmih`.

Untuk memindahkan data dari proyek lama ke proyek baru, ikuti panduan ini.

**Opsi 1: Rekreasi Manual (Direkomendasikan Jika Data Sedikit)**

Jika Anda baru memiliki beberapa produk atau pengguna, cara termudah dan tercepat adalah dengan membuatnya kembali secara manual melalui **Panel Admin** Anda.

1.  Pastikan Anda sudah menyelesaikan **PENTING #2** dan database Anda sudah aktif.
2.  Jalankan aplikasi secara lokal (`npm run dev`).
3.  Buka `/panel/owner/products`, `/panel/owner/users`, dll.
4.  Buat ulang semua produk, pengguna, kupon, dan banner yang Anda butuhkan. Data ini akan langsung tersimpan di database proyek `artisant-5dmih` yang baru.

**Opsi 2: Ekspor & Impor Otomatis (Untuk Data Banyak)**

Metode ini lebih teknis tetapi dapat memindahkan semua data sekaligus. Anda memerlukan [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install) terpasang di komputer Anda.

**Peringatan:** Proses ini memerlukan akun Firebase dengan paket **Blaze (Pay-as-you-go)**. Namun, biasanya tidak akan ada biaya jika penggunaan Anda masih di bawah kuota gratis.

#### Langkah 1: Ekspor Data dari Proyek LAMA

1.  Buka terminal atau command prompt Anda.
2.  Atur `gcloud` untuk menunjuk ke proyek **LAMA** Anda (ganti `<ID_PROYEK_LAMA>`):
    ```bash
    gcloud config set project <ID_PROYEK_LAMA>
    ```
3.  Buat bucket penyimpanan untuk backup (pastikan lokasi bucket sama dengan lokasi Firestore Anda, misal: `nam1` atau `asia-southeast2`):
    ```bash
    gsutil mb -p <ID_PROYEK_LAMA> -l <LOKASI_FIRESTORE> gs://<ID_PROYEK_LAMA>.appspot.com
    ```
4.  Jalankan perintah ekspor. Ini akan menyimpan semua data Firestore Anda ke dalam bucket:
    ```bash
    gcloud firestore export gs://<ID_PROYEK_LAMA>.appspot.com/firestore-backup
    ```

#### Langkah 2: Impor Data ke Proyek BARU

1.  Pastikan proyek BARU Anda (`artisant-5dmih`) sudah memiliki **database Firestore yang aktif**. Jika belum, ikuti **PENTING #2**.
2.  Atur `gcloud` untuk menunjuk ke proyek **BARU** Anda:
    ```bash
    gcloud config set project artisant-5dmih
    ```
3.  Jalankan perintah impor. Ini akan menyalin data dari bucket proyek lama ke Firestore proyek baru Anda:
    ```bash
    gcloud firestore import gs://<ID_PROYEK_LAMA>.appspot.com/firestore-backup
    ```

Setelah proses impor selesai, database di proyek `artisant-5dmih` Anda akan berisi data yang sama persis dengan proyek lama Anda.

---

## 🛡️ PENTING #4: Strategi Anti-Gagal (Backup Data Anda!)

Kekhawatiran Anda bahwa "jika terjadi crack, hilang semua" sangatlah wajar. Ini adalah pemikiran yang bagus tentang manajemen risiko. Mari kita perjelas bagaimana sistem ini dirancang untuk mencegah hal tersebut.

Penting untuk dipahami bahwa **Kode Aplikasi** dan **Data Database** adalah dua hal yang terpisah:
1.  **Kode Aplikasi (di Vercel):** Ini adalah "mesin" aplikasi Anda. Jika ada bug atau "crack" pada kode, kita bisa dengan mudah kembali ke versi sebelumnya yang stabil. Kode tidak akan hilang.
2.  **Data Database (di Firebase):** Ini adalah aset Anda yang paling berharga (data produk, pesanan, pengguna). **Data ini tidak akan hilang hanya karena kode aplikasi error.**

Risiko sebenarnya bukanlah pada kode yang "crack", tetapi pada keamanan dan integritas data itu sendiri. Oleh karena itu, langkah paling penting yang bisa Anda lakukan adalah **melakukan backup data secara rutin.**

**Cara Melakukan Backup:**

Anda bisa menggunakan fitur ekspor bawaan dari Google Cloud untuk menyimpan seluruh salinan database Firestore Anda. Proses ini sama persis dengan proses migrasi yang sudah dijelaskan di atas.

1.  **Ikuti langkah-langkah di bagian "Langkah 1: Ekspor Data dari Proyek LAMA"** pada panduan migrasi di atas.
2.  Gunakan ID proyek Anda saat ini (`artisant-5dmih`) sebagai sumbernya.
3.  Simpan file hasil ekspor tersebut di tempat yang aman.

Lakukan ini secara berkala (misalnya, setiap minggu) untuk memastikan Anda selalu punya salinan data yang aman.

---

## 📝 Checklist Kualitas Proyek

Setiap kali perintah `CEK` digunakan, AI akan melakukan tinjauan berdasarkan poin-poin berikut untuk memastikan aplikasi andal dan profesional.

### Pilar 1: Konfigurasi & Struktur Dasar
**✅ 1. Struktur Proyek & File:** Memastikan struktur folder `src/app` sudah benar, file utama ada, dan tidak ada file aneh atau kosong.
**✅ 2. Variabel Rahasia (.env):** Memverifikasi bahwa semua kunci API (`Firebase`, `Google AI`, `Telegram`) diterima dengan benar oleh aplikasi.
**✅ 3. Setup Firebase:** Memeriksa kode inisialisasi Firebase di `src/lib/firebase.ts`. (Anda harus memastikan service diaktifkan di Firebase Console).
**✅ 4. Dependensi & Package:** Meninjau `package.json` untuk memastikan semua pustaka yang diperlukan ada dan tidak ada yang berlebihan.

### Pilar 2: Keamanan & Logika
**✅ 5. Integritas Kontrak Data & Alur (Anti Celah Logika):** Memeriksa apakah data yang dikirimkan antara fungsi (misalnya dari UI ke AI) sudah lengkap sesuai dengan "aturan" atau skema yang didefinisikan. Mencegah bug di mana sebuah fungsi tidak menerima semua data yang dibutuhkannya untuk bekerja dengan benar.
**✅ 6. Logika & Keamanan Kode:** Memastikan kunci API tidak terekspos di sisi klien, input divalidasi, dan `try/catch` digunakan untuk menangani error.
**✅ 7. Kesehatan & Keterbacaan Kode:** Memeriksa kualitas kode, kejelasan nama variabel/fungsi, dan menghapus kode yang tidak terpakai untuk mengurangi bug.

### Pilar 3: Pengalaman Pengguna (UX) & Data
**✅ 8. UI & Responsif:** Memeriksa kode komponen untuk memastikan penggunaan kelas Tailwind yang benar untuk tata letak responsif di berbagai perangkat.
**✅ 9. Penanganan Status & Alur (Anti Bingung):** Memeriksa apakah ada indikator `loading`, tombol `disabled` saat proses, pesan untuk `data kosong`, dan notifikasi `toast` untuk feedback.
**✅ 10. Pemrograman Defensif (Anti 404 & Anti Crash):** Memeriksa penanganan untuk data yang tidak ada (`notFound`) dan array kosong untuk mencegah aplikasi crash.
**✅ 11. Kode Anti-Mock (Anti Data Palsu):** Memastikan semua data utama berasal dari `services` yang terhubung ke Firestore, bukan dari data contoh yang di-hardcode.

### Pilar 4: Fungsionalitas & Pengujian
**✅ 12. Build & Testing:** Memeriksa kode untuk potensi masalah yang dapat menyebabkan `npm run build` gagal.
**✅ 13. Fungsionalitas Utama:** Memastikan semua logika inti (Pesanan, Produk, Panel Admin, Telegram, AI) terhubung dengan benar secara internal.

---

## Troubleshooting

### `npm run dev` atau Perintah `firebase` Gagal

Jika Anda melihat error seperti `npm error Missing script: "dev"` atau `Error: firebase use must be run from a Firebase project directory.`, itu berarti Anda berada di direktori yang salah di terminal Anda.

**Solusi:** Anda harus terlebih dahulu menggunakan perintah `cd` (change directory) untuk menavigasi ke dalam folder utama proyek Anda sebelum dapat menjalankan perintah `npm` atau `firebase`.

---

## Arsitektur & Migrasi Data

Aplikasi ini dirancang agar mudah dipindahkan (portabel). Tampilan antarmuka (UI) sengaja dipisahkan dari logika pengambilan data.

### Lapisan Layanan (Service Layer)

Semua kode yang berhubungan dengan database (seperti mengambil atau menyimpan data) ditempatkan di dalam direktori `src/services/`.

Sebagai contoh, `src/services/productService.ts` bertanggung jawab penuh untuk semua operasi yang berkaitan dengan data produk.

### Cara Migrasi ke Database Lain

Untuk berpindah dari Firebase ke penyedia database lain (misalnya Supabase, Vercel Postgres, atau REST API Anda sendiri), Anda **hanya perlu mengubah isi dari file-file di dalam folder `src/services/`**.

Anda tidak perlu merombak seluruh kode tampilan (UI) aplikasi. Cukup perbarui logika di dalam file layanan agar terhubung ke database baru Anda, dan seluruh aplikasi akan beradaptasi secara otomatis.

### ⚡️ Strategi Caching & Performa (Anti Lambat)
Aplikasi ini tidak menghubungi database setiap kali ada pengunjung baru. Kita menggunakan fitur canggih dari Next.js bernama **Time-based Revalidation**.

-   **Bagaimana Caranya?** Di file `src/app/page.tsx`, Anda akan melihat baris kode `export const revalidate = 300;`.
-   **Artinya Apa?** Ini memberitahu server untuk mengambil data dari database (produk, banner, dll.) **hanya satu kali setiap 5 menit (300 detik)**.
-   **Hasilnya:** Jika ada 100 pengunjung dalam 5 menit, hanya pengunjung pertama yang memicu koneksi database. 99 pengunjung lainnya akan mendapatkan versi halaman yang sudah di-cache (disimpan sementara), yang jauh lebih cepat dan hemat biaya. Ini memastikan website Anda tetap cepat bahkan saat trafik tinggi.

### Apa Saja yang Disimpan di Firestore?

Berikut adalah rincian data yang disimpan aplikasi Anda di database Firestore, diorganisir berdasarkan "koleksi" (folder data):

-   **`orders`**: Koleksi paling penting yang berisi semua data pesanan pelanggan.
    -   Kode Order Unik, Nama Pelanggan, Kontak Telegram.
    -   Produk yang dibeli, total pembayaran, dan status pesanan.
    -   Brief desain yang ditulis oleh pelanggan.

-   **`products`**: Katalog produk yang Anda tawarkan.
    -   Nama, deskripsi, kategori, dan URL gambar produk.
    -   Daftar harga untuk setiap tier (`Kaki Lima`, `UMKM`, `E-Commerce`).

-   **`users`**: Daftar pengguna yang memiliki akses ke panel admin.
    -   Nama, email, jabatan (`Owner`, `Admin`, `Designer`), dan URL avatar.

-   **`banners`**, **`coupons`**, **`promos`**: Semua data terkait pemasaran.
    -   Mengelola banner promosi di halaman utama.
    -   Menyimpan kode kupon diskon yang aktif/tidak aktif.
    -   Menyimpan info promo produk dengan periode waktu tertentu.

-   **`settings`**: Pengaturan global untuk toko Anda.
    -   Dokumen `theme`: Menyimpan skema warna dan tema visual.
    -   Dokumen `capacity`: Menyimpan batas order mingguan/bulanan.

-   **`refunds`**: (Jika ada) Riwayat pengembalian dana yang telah diproses.

Dengan menyimpan semua ini di Firestore, data Anda terpusat, aman, dan mudah dikelola melalui panel admin.

### Fitur AI

Logika untuk fitur kecerdasan buatan (AI) berada di dalam `src/ai/flows/`. Anda bisa mengubah file di sini untuk terhubung dengan model atau layanan AI yang berbeda.
