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

## ⚠️ PENTING #2: Mengatasi Error `PERMISSION_DENIED`

Jika Anda melihat error `PERMISSION_DENIED` di log server Anda, itu berarti database Anda terkunci. Ini adalah pengaturan default Firebase untuk keamanan.

**Solusi Cepat untuk Pengembangan:**

1.  Buka **Project Settings > Firestore Database** di Firebase Console.
2.  Pilih tab **Rules** (Aturan).
3.  Ubah aturannya menjadi "Test Mode" dengan mengganti isinya menjadi:
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
4.  Klik **Publish**.

**Peringatan:** Aturan ini membuat data Anda bisa diakses oleh siapa saja. Ini aman untuk pengembangan, tetapi **WAJIB** diamankan sebelum aplikasi Anda diluncurkan ke publik. [Pelajari cara mengamankan data Anda di sini.](https://firebase.google.com/docs/firestore/security/get-started)

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
