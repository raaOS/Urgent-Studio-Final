# 🚀 Panduan Deploy ke Firebase App Hosting

Dokumen ini berisi panduan langkah demi langkah untuk meluncurkan aplikasi Next.js Anda ke internet menggunakan Firebase App Hosting. Ikuti setiap langkah dengan teliti.

---

### ✅ Prasyarat

Sebelum memulai, pastikan Anda sudah melakukan ini:
- Anda sudah login ke Firebase di terminal (`firebase login`).
- Proyek Anda sudah terhubung ke Firebase (`firebase use --add`).

---

### Langkah 1: Inisialisasi App Hosting

Langkah ini hanya perlu dilakukan **satu kali** untuk proyek Anda. Perintah ini akan mengkonfigurasi proyek Anda untuk App Hosting dan secara otomatis memperbarui file `firebase.json`.

1.  Jalankan perintah berikut di terminal Anda:
    ```bash
    firebase init apphosting
    ```

2.  Terminal akan menanyakan beberapa hal. Ikuti panduan ini:
    *   Ia akan bertanya tentang "backend". Pilih opsi untuk **`Create a new backend`**.
    *   Ia akan meminta Anda memilih **region** (lokasi server). Anda bisa memilih `us-central1` sebagai pilihan default yang aman.
    *   Biarkan prosesnya selesai. Setelah berhasil, file `firebase.json` Anda akan diperbarui secara otomatis.

---

### Langkah 2: Bangun Aplikasi untuk Produksi

Sekarang, kita perlu membuat versi aplikasi yang sudah dioptimalkan untuk production.

1.  Jalankan perintah berikut:
    ```bash
    npm run build
    ```
    Perintah ini akan mengkompilasi semua kode Anda ke dalam folder `.next/` dan memastikan semuanya siap untuk di-upload.

---

### Langkah 3: Deploy!

Ini adalah langkah terakhir untuk meluncurkan aplikasi Anda.

1.  Jalankan perintah deploy:
    ```bash
    firebase deploy
    ```

2.  Firebase CLI akan mengurus sisanya—mengupload file Anda dan mengkonfigurasi server. Proses ini mungkin memakan waktu beberapa menit.

3.  Setelah selesai, terminal akan menampilkan pesan `✔ Deploy complete!` beserta **Hosting URL**. Ini adalah link publik ke website Anda yang sudah live!

**Selamat! Aplikasi Anda sekarang sudah bisa diakses oleh seluruh dunia.**
