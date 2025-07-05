# Artisant Firebase Studio Project

This is a Next.js starter project for Artisant, pre-configured for Firebase Studio.

---

## 🚀 PENTING: Konfigurasi Awal (Langkah Wajib!)

Sebelum menjalankan aplikasi, Anda **WAJIB** mengatur kunci-kunci rahasia (API Keys). Tanpa ini, aplikasi tidak akan bisa terhubung ke layanan mana pun.

### **Langkah 1: Buat Proyek Firebase Baru**
Jika Anda belum punya, buatlah proyek baru di [Firebase Console](https://console.firebase.google.com/). Ini akan memastikan Anda memiliki izin **Owner** penuh.

### **Langkah 2: Isi File `.env`**
Buka file `.env` di direktori utama proyek Anda. Anda perlu mengisi semua nilai di bawah ini.

#### A. Kredensial Firebase
1.  Di Firebase Console, buka **Project Settings** (ikon gerigi ⚙️ di sebelah "Project Overview").
2.  Di tab **General**, gulir ke bawah ke bagian **"Your apps"**.
3.  Cari **"Firebase SDK snippet"** dan pilih **"Config"**.
4.  Anda akan melihat sesuatu seperti ini:
    ```javascript
    const firebaseConfig = {
      apiKey: "AIza...",
      authDomain: "nama-proyek.firebaseapp.com",
      projectId: "nama-proyek",
      // ...dan seterusnya
    };
    ```
5.  Salin-tempel setiap nilai ke dalam file `.env` Anda:
    ```
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=...
    ```

#### B. Kunci API Google AI (Gemini)
1.  Buka [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Klik **"Create API key in new project"**.
3.  Salin kunci yang muncul dan tempelkan ke `.env`:
    ```
    GOOGLE_API_KEY=...
    ```

#### C. Token Bot Telegram
1.  Di aplikasi Telegram, cari **BotFather**.
2.  Kirim perintah `/newbot` untuk membuat bot baru. Ikuti instruksinya.
3.  BotFather akan memberi Anda sebuah token. Salin dan tempelkan ke `.env`:
    ```
    TELEGRAM_BOT_TOKEN=...
    ```
4.  Buat **kata sandi rahasia acak** Anda sendiri (misal: `rahasiabanget-bot-123`). Ini untuk webhook. Tempelkan ke `.env`:
    ```
    TELEGRAM_WEBHOOK_SECRET=...
    ```
5.  Cari bot @userinfobot di Telegram, kirim pesan apa saja, dan ia akan membalas dengan **Chat ID** Anda. Salin dan tempelkan ke `.env`:
    ```
    OWNER_CHAT_ID=...
    ```

### **Langkah 3: Restart Server Anda**
Setelah mengisi file `.env`, **hentikan server pengembangan Anda** (tekan `Ctrl + C` di terminal) dan **jalankan kembali** dengan `npm run dev`. Ini penting agar perubahan terbaca.

---

## ⚠️ PENTING #2: Aktifkan Database Anda

Setelah konfigurasi di atas selesai, Anda akan melihat halaman error yang meminta Anda mengaktifkan database. Jangan panik, ini normal.

1.  Buka **Firebase Console** dan pilih proyek baru Anda.
2.  Di menu kiri, klik **Build > Firestore Database**.
3.  Klik tombol besar **"Create database"**. (Karena Anda adalah Owner, tombol ini PASTI bisa diklik).
4.  Pilih lokasi server (misal: `nam5 (us-central)`). Klik **Next**.
5.  Pilih **Start in test mode**. Ini akan membuat aturan keamanan yang mengizinkan baca/tulis selama pengembangan.
6.  Klik **Enable**. Tunggu beberapa saat hingga database siap.
7.  Muat ulang aplikasi Anda di browser. Error akan hilang.

---

## 🗄️ PENTING #3: Mengisi Data Awal

Database baru Anda masih kosong. Anda punya dua pilihan:

*   **Opsi 1 (Rekomendasi): Isi Data Contoh.** Buka halaman **/panel/owner/products** di aplikasi Anda dan klik tombol **"Isi Data Contoh"**. Ini akan mengisi semua produk yang dibutuhkan aplikasi.
*   **Opsi 2 (Jika Punya Data Lama): Migrasi.** Ikuti panduan di bawah untuk memindahkan data dari proyek Firebase lama ke proyek baru Anda.

### Panduan Migrasi Data (Opsional)
Gunakan metode ini jika Anda perlu memindahkan data dari proyek Firebase LAMA ke proyek BARU Anda. Anda memerlukan [Google Cloud SDK (gcloud)](https://cloud.google.com/sdk/docs/install) terpasang di komputer Anda.

#### Langkah 1: Ekspor Data dari Proyek LAMA
1.  Atur `gcloud` untuk menunjuk ke proyek LAMA (ganti `<ID_PROYEK_LAMA>`):
    ```bash
    gcloud config set project <ID_PROYEK_LAMA>
    ```
2.  Jalankan perintah ekspor. Ini akan menyimpan semua data Firestore Anda ke dalam bucket:
    ```bash
    gcloud firestore export gs://<ID_PROYEK_LAMA>.appspot.com/firestore-backup
    ```

#### Langkah 2: Impor Data ke Proyek BARU
1.  Pastikan proyek BARU Anda sudah memiliki database Firestore yang aktif (ikuti PENTING #2).
2.  Atur `gcloud` untuk menunjuk ke proyek BARU (ganti `<ID_PROYEK_BARU>`):
    ```bash
    gcloud config set project <ID_PROYEK_BARU>
    ```
3.  Jalankan perintah impor:
    ```bash
    gcloud firestore import gs://<ID_PROYEK_LAMA>.appspot.com/firestore-backup
    ```

---

## 🚀 Panduan Deploy

Untuk meluncurkan aplikasi Anda ke internet, silakan lihat panduan di file `DEPLOYMENT.md`.
