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

### 🚀 Menghubungkan Bot Telegram ke Vercel (Hosting Gratis)

Arsitektur aplikasi ini memungkinkan Anda untuk menjalankan "otak" bot Telegram langsung di Vercel menggunakan API Routes, tanpa perlu upgrade ke paket Blaze di Firebase. Berikut adalah panduan super detailnya setelah Anda men-deploy aplikasi ini ke Vercel.

**Prasyarat:**
- Akun Vercel (bisa gratis).
- Sudah men-deploy aplikasi ini ke Vercel dan mendapatkan URL publik (misal: `https://nama-proyek-anda.vercel.app`).

---

#### Langkah 1: Membuat Bot di Telegram & Mendapatkan Token

Anda perlu sebuah "kunci rahasia" dari Telegram agar aplikasi Anda bisa mengontrol bot.

1.  Buka aplikasi Telegram, cari akun bernama **`@BotFather`** (akun resmi dengan centang biru).
2.  Mulai percakapan dan ketik perintah `/newbot`.
3.  Ikuti instruksi untuk memberikan nama pada bot Anda (misal: "Toko Desain Bot") dan sebuah username unik (harus diakhiri dengan `bot`, misal: `TokoDesainKuBot`).
4.  Setelah berhasil, BotFather akan memberikan Anda sebuah **token API**. Token ini sangat rahasia, bentuknya seperti `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`.
5.  **Salin dan simpan token ini baik-baik.** Kita akan menyebutnya `TELEGRAM_BOT_TOKEN`.

---

#### Langkah 2: Membuat "Kata Sandi" Webhook Anda Sendiri

Untuk mencegah orang lain mengirim pesan palsu ke bot Anda, kita butuh "kata sandi" rahasia.

1.  Buat sebuah string teks yang acak dan sulit ditebak. Anda bisa menggunakan password generator atau mengetik acak, contoh: `inikatasandirahasia-bot-12345`.
2.  **Simpan teks rahasia ini.** Kita akan menyebutnya `TELEGRAM_WEBHOOK_SECRET`.

---

#### Langkah 3: Konfigurasi Environment Variables di Vercel

Vercel perlu tahu kunci-kunci rahasia Anda.

1.  Buka Dashboard proyek Anda di Vercel.
2.  Masuk ke menu **Settings** -> **Environment Variables**.
3.  Tambahkan variabel-variabel berikut satu per satu:
    *   `TELEGRAM_BOT_TOKEN`: Masukkan token yang Anda dapat dari BotFather di Langkah 1.
    *   `TELEGRAM_WEBHOOK_SECRET`: Masukkan "kata sandi" yang Anda buat di Langkah 2.
    *   `OWNER_CHAT_ID`: (Sangat Direkomendasikan) Ini adalah ID Chat personal Anda agar bot bisa mengirim notifikasi penting (misal: "Ada pesanan baru!").
        *   **Cara Mendapatkan ID Chat Anda:**
            1.  Di aplikasi Telegram, cari dan mulai chat dengan bot bernama **`@userinfobot`**.
            2.  Bot tersebut akan langsung membalas dengan ID Chat numerik Anda. Salin ID tersebut.
        *   Masukkan ID yang Anda salin sebagai nilai untuk variabel `OWNER_CHAT_ID`.
    *   **PENTING:** Anda juga harus memasukkan semua konfigurasi Firebase dan `GOOGLE_API_KEY` di sini agar Vercel bisa terhubung ke semua layanan Anda.

---

#### Langkah 4: Mendaftarkan "Kantor Pos" (Webhook) ke Telegram

Ini adalah langkah untuk memberitahu Telegram, "Hei, semua pesan untuk bot-ku, tolong kirim ke alamat ini." **Langkah ini cukup dilakukan satu kali saja.**

1.  Siapkan URL lengkap berikut di text editor:
    `https://api.telegram.org/bot<TOKEN_ANDA>/setWebhook?url=<URL_VERCEL_ANDA>/api/telegram-webhook&secret_token=<SECRET_ANDA>`
2.  Ganti bagian-bagian ini:
    *   `<TOKEN_ANDA>`: Ganti dengan `TELEGRAM_BOT_TOKEN` dari Langkah 1.
    *   `<URL_VERCEL_ANDA>`: Ganti dengan URL publik aplikasi Anda di Vercel.
    *   `<SECRET_ANDA>`: Ganti dengan `TELEGRAM_WEBHOOK_SECRET` dari Langkah 2.
3.  Contoh URL Final:
    `https://api.telegram.org/bot123456:ABC.../setWebhook?url=https://nama-proyek-anda.vercel.app/api/telegram-webhook&secret_token=inikatasandirahasia-bot-12345`
4.  Salin URL final tersebut dan tempelkan di address bar browser Anda, lalu tekan Enter.
5.  Jika berhasil, Anda akan melihat pesan seperti ini di browser:
    `{"ok":true,"result":true,"description":"Webhook was set"}`

---

#### Langkah 5: Uji Coba Bot!

Sekarang semuanya sudah terhubung!

1.  Cari bot Anda di Telegram menggunakan username yang Anda buat.
2.  Kirim pesan. Jika semuanya benar, bot akan merespon sesuai dengan logika yang ada di file `src/app/api/telegram-webhook/route.ts`.

---

### 🔧 Pengujian Lokal & `ngrok`

Webhook bot Telegram memerlukan URL publik untuk menerima pesan. Server lokal Anda (`localhost`) tidak dapat diakses dari internet. Untuk menguji bot secara lokal, Anda memerlukan layanan *tunneling* seperti `ngrok`.

**Prasyarat:**
- Akun `ngrok` (gratis sudah cukup).
- `ngrok` sudah terpasang di komputer Anda. [Unduh di sini](https://ngrok.com/download).

#### Langkah 1: Jalankan Server Lokal Anda

Pastikan aplikasi Next.js Anda berjalan.

```bash
npm run dev
```

Aplikasi Anda akan berjalan di port tertentu, biasanya `3000` atau `9002`.

#### Langkah 2: Jalankan `ngrok`

Buka jendela terminal **baru yang terpisah** (jangan matikan server Next.js Anda). Jalankan perintah berikut, ganti `3000` dengan port aplikasi Anda jika berbeda.

```bash
ngrok http 3000
```

`ngrok` akan memberi Anda URL publik yang terlihat seperti ini:

```
Forwarding                    https://<KARAKTER_ACAK>.ngrok-free.app -> http://localhost:3000
```

**Salin URL `https://...` tersebut.** Inilah alamat publik sementara Anda.

#### Langkah 3: Atur Webhook dengan URL `ngrok`

Sekarang, beri tahu Telegram untuk mengirim pesan ke URL `ngrok` Anda. Gunakan perintah yang sama seperti sebelumnya, tetapi ganti URL Vercel dengan URL `ngrok` Anda.

1.  Siapkan URL:
    `https://api.telegram.org/bot<TOKEN_ANDA>/setWebhook?url=<URL_NGROK_ANDA>/api/telegram-webhook&secret_token=<SECRET_ANDA>`

2.  Ganti placeholder:
    *   `<TOKEN_ANDA>`: `TELEGRAM_BOT_TOKEN` Anda dari file `.env`.
    *   `<URL_NGROK_ANDA>`: URL `https://...` yang Anda dapatkan dari `ngrok`.
    *   `<SECRET_ANDA>`: `TELEGRAM_WEBHOOK_SECRET` Anda dari file `.env`.

3.  Tempelkan URL final di browser Anda dan tekan Enter. Anda akan melihat `{"ok":true, ...}`.

#### Langkah 4: Uji Coba!

Server lokal Anda kini terhubung dengan Telegram! Anda dapat menguji seluruh alur checkout dan konfirmasi bot secara lokal. Setiap perubahan pada `src/app/api/telegram-webhook/route.ts` akan langsung terlihat tanpa perlu deploy ulang.

**PENTING:** URL `ngrok` bersifat sementara. Jika Anda me-restart `ngrok`, Anda akan mendapatkan URL baru dan perlu mengulangi **Langkah 3** untuk memperbarui webhook di Telegram.

