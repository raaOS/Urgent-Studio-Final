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

Bot Anda belum akan merespon sampai Anda memberitahu Telegram alamat baru website Anda. **Langkah ini cukup dilakukan satu kali saja.**

1.  **Salin URL Vercel** yang baru saja Anda dapatkan.
2.  Siapkan URL lengkap berikut di text editor:
    `https://api.telegram.org/bot<TOKEN_ANDA>/setWebhook?url=<URL_VERCEL_ANDA>/api/telegram-webhook&secret_token=<SECRET_ANDA>`
3.  Ganti bagian-bagian ini:
    *   `<TOKEN_ANDA>`: Ganti dengan `TELEGRAM_BOT_TOKEN` Anda.
    *   `<URL_VERCEL_ANDA>`: Ganti dengan URL publik aplikasi Anda di Vercel.
    *   `<SECRET_ANDA>`: Ganti dengan `TELEGRAM_WEBHOOK_SECRET` Anda.
4.  Contoh URL Final:
    `https://api.telegram.org/bot123456:ABC.../setWebhook?url=https://nama-proyek-anda.vercel.app/api/telegram-webhook&secret_token=inikatasandirahasia-bot-12345`
5.  Salin URL final tersebut dan tempelkan di address bar browser Anda, lalu tekan Enter.
6.  Jika berhasil, Anda akan melihat pesan seperti ini di browser:
    `{"ok":true,"result":true,"description":"Webhook was set"}`

Setelah langkah ini selesai, seluruh sistem Anda, termasuk bot, akan berfungsi sepenuhnya.

---

### 🔧 Pengujian Bot Lokal (Opsional, untuk Developer)

Webhook bot Telegram memerlukan URL publik untuk menerima pesan. Server lokal Anda (`localhost`) tidak dapat diakses dari internet. Untuk menguji bot secara lokal, Anda memerlukan layanan *tunneling* seperti `ngrok`.

**Prasyarat:**
- Akun `ngrok` (gratis sudah cukup).
- `ngrok` sudah terpasang di komputer Anda. [Unduh di sini](https://ngrok.com/download).

#### Langkah 1: Jalankan Server Lokal Anda

Pastikan aplikasi Next.js Anda berjalan.

```bash
npm run dev
```

Aplikasi Anda akan berjalan di port tertentu, biasanya `3000`.

#### Langkah 2: Jalankan `ngrok`

Buka jendela terminal **baru yang terpisah** (jangan matikan server Next.js Anda). Jalankan perintah berikut, ganti `3000` dengan port aplikasi Anda jika berbeda.

```bash
ngrok http 3000
```

`ngrok` akan memberi Anda URL publik yang terlihat seperti ini: `https://<KARAKTER_ACAK>.ngrok-free.app`. **Salin URL `https://...` tersebut.**

#### Langkah 3: Atur Webhook dengan URL `ngrok`

Sekarang, ulangi **Langkah 5** di atas, tetapi ganti `<URL_VERCEL_ANDA>` dengan URL `ngrok` yang baru Anda salin. Ini akan memberitahu Telegram untuk mengirim pesan ke komputer lokal Anda selama pengujian.

**PENTING:** URL `ngrok` bersifat sementara. Jika Anda me-restart `ngrok`, Anda akan mendapatkan URL baru dan perlu mengulangi **Langkah 3** untuk memperbarui webhook di Telegram.
