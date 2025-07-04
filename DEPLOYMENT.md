# 🚀 Panduan Deploy ke Vercel (Gratis & Tanpa Kartu Kredit)

Dokumen ini berisi panduan langkah demi langkah untuk meluncurkan aplikasi Next.js Anda ke internet menggunakan **Vercel**. Vercel adalah platform yang direkomendasikan untuk Next.js dan memiliki paket gratis yang sangat mumpuni.

---

### ✅ Prasyarat

Sebelum memulai, pastikan Anda sudah memiliki:
1.  **Akun GitHub:** Jika belum, daftar di [github.com](https://github.com). Ini gratis.
2.  **Akun Vercel:** Daftar di [vercel.com](https://vercel.com) menggunakan akun GitHub Anda. Ini juga gratis.
3.  **Proyek Anda di GitHub:** Pastikan semua kode Anda sudah di-upload ke sebuah repository di GitHub.

---

### Langkah 1: Persiapan Environment Variables

Ini adalah langkah **paling penting**. Vercel perlu tahu semua kunci rahasia (API keys) Anda.

1.  Buka file `.env` di proyek Anda.
2.  Siapkan semua nilai untuk variabel berikut:
    -   `NEXT_PUBLIC_FIREBASE_API_KEY`
    -   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    -   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    -   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    -   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    -   `NEXT_PUBLIC_FIREBASE_APP_ID`
    -   `GOOGLE_API_KEY`
    -   `TELEGRAM_BOT_TOKEN`
    -   `TELEGRAM_WEBHOOK_SECRET` (buat teks acak dan rahasia Anda sendiri)
    -   `OWNER_CHAT_ID` (ID chat Telegram Anda untuk notifikasi)

---

### Langkah 2: Impor Proyek ke Vercel

1.  Buka dashboard Vercel Anda, klik **"Add New..."** lalu pilih **"Project"**.
2.  Vercel akan menampilkan daftar repository GitHub Anda. Klik **"Import"** pada repository proyek ini.
3.  Vercel akan otomatis mendeteksi bahwa ini adalah proyek Next.js. Anda tidak perlu mengubah pengaturan build apa pun.

---

### Langkah 3: Konfigurasi Variabel di Vercel

Ini adalah momen untuk memasukkan kunci rahasia yang sudah Anda siapkan.

1.  Di halaman konfigurasi Vercel, buka bagian **"Environment Variables"**.
2.  Satu per satu, **salin dan tempelkan** setiap variabel dari file `.env` Anda ke dalam form Vercel.
    -   Nama variabel (misal: `GOOGLE_API_KEY`)
    -   Nilai variabel (misal: `AIzaSy...`)
3.  Pastikan **semua variabel** dari Langkah 1 sudah Anda masukkan. Aplikasi tidak akan berfungsi tanpanya.

---

### Langkah 4: Deploy!

1.  Setelah semua variabel dimasukkan, klik tombol **"Deploy"**.
2.  Tunggu beberapa saat. Vercel akan membangun dan meluncurkan aplikasi Anda.
3.  Setelah selesai, Anda akan melihat pesan **"Congratulations!"** beserta **URL publik** ke website Anda (misal: `nama-proyek.vercel.app`).

**Selamat! Aplikasi Anda sekarang sudah live di internet!**

---

### Langkah 5 (Terakhir): Hubungkan Bot Telegram

Bot Anda belum akan merespon sampai Anda memberitahu Telegram alamat baru website Anda.

1.  **Salin URL Vercel** yang baru saja Anda dapatkan.
2.  Buka file `README.md` di proyek Anda dan ikuti instruksi pada bagian **"Langkah 4: Mendaftarkan 'Kantor Pos' (Webhook) ke Telegram"**.
3.  Gunakan URL Vercel Anda saat membuat URL `setWebhook`.

Setelah langkah ini selesai, seluruh sistem Anda, termasuk bot, akan berfungsi sepenuhnya.