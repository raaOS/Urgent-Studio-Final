
'use server';

/**
 * @fileOverview Provides suggestions to simplify a design brief to match a lower budget tier.
 *
 * - suggestBriefImprovement - A function that suggests how to simplify a brief.
 * - SuggestBriefImprovementInput - The input type for the function.
 * - SuggestBriefImprovementOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {
  type SuggestBriefImprovementInput,
  SuggestBriefImprovementInputSchema,
  type SuggestBriefImprovementOutput,
  SuggestBriefImprovementOutputSchema,
} from '@/lib/types';


export async function suggestBriefImprovement(input: SuggestBriefImprovementInput): Promise<SuggestBriefImprovementOutput> {
  return suggestBriefImprovementFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestBriefImprovementPrompt',
  input: {schema: SuggestBriefImprovementInputSchema},
  output: {schema: SuggestBriefImprovementOutputSchema},
  prompt: `You are an expert, helpful, and friendly Design Project Assistant. Your task is to analyze a customer's design brief to see if it's appropriate for their selected budget tier. If it's not, your main goal is to provide **constructive, actionable suggestions** on how the user can simplify their own brief to fit their chosen budget. Your tone should be helpful and guiding, not accusatory.

  Here is the strict rubric you must follow:

  - **Tier 'Kaki Lima'**:
    - **Tujuan**: Desain fungsional super cepat. **HANYA satu konsep final**, tidak ada alternatif. Maksimal 1x revisi minor (contoh: perbaikan salah ketik).
    - **Lingkup Kerja**: Ganti tulisan/gambar di template, desain sangat dasar.
    - **Kata Kunci Cocok (Kualitas Dasar)**: Kata-kata seperti "keren", "bagus", "rapi", "tidak norak" diizinkan karena merupakan ekspektasi kualitas dasar.
    - **TANDA BAHAYA (butuh penyederhanaan)**:
      - **Menyediakan link referensi (Google Drive, Pinterest, dll.). Kehadiran link itu sendiri sudah menandakan pekerjaan yang lebih dari sekadar 'ganti tulisan'. DILARANG KERAS.**
      - Meminta **lebih dari 1 konsep** atau alternatif.
      - Menyebut **nama brand lain** sebagai referensi (sekecil apapun brandnya, termasuk brand besar seperti Shopee, Gojek, Apple). DILARANG KERAS.
      - Meminta **"ilustrasi custom dari nol"**.
      - Meminta **revisi besar** atau lebih dari 1x revisi minor.
      - Meminta layanan tambahan (copywriting, edit foto kompleks).
      - Menggunakan **kata-kata yang menyiratkan EKSPLORASI GAYA**, contoh: "konsep", "filosofi", "unik", "estetik", "gaya tertentu", "minimalis", "beda dari yang lain", "sesuai trend".

  - **Tier 'UMKM'**:
    - **Tujuan**: Desain berkualitas yang dipikirkan dengan matang. **HANYA satu konsep final yang dieksekusi dengan baik.** Boleh ada 1-2 kali revisi medium (contoh: ganti warna, geser layout).
    - **Lingkup Kerja**: Desain yang lebih custom, layout dipikirkan, bisa pakai ilustrasi/aset sederhana. Boleh memberikan link referensi.
    - **TANDA BAHAYA (butuh penyederhanaan atau upgrade)**:
      - Meminta **lebih dari 1 konsep** atau alternatif.
      - Menyebut **nama brand lain** sebagai referensi (DILARANG KERAS).
      - Meminta "sistem desain", "animasi video", "pemotretan produk".
      - Meminta "copywriting strategis" atau "riset audiens".

  - **Tier 'E-Commerce'**:
    - **Tujuan**: Solusi desain strategis. **Maksimal 2 konsep awal** untuk dieksplorasi.
    - **Lingkup Kerja**: Hampir semua permintaan kompleks diterima di sini.

  ---

  **Tugas Anda:**

  Analisis brief pelanggan berikut berdasarkan tier yang mereka pilih.

  - **Selected Tier**: {{{budgetTier}}}
  - **Design Brief**:
    """
    {{{designBrief}}}
    """
  - **Provided Link**: {{{driveLink}}}

  **Instruksi Output:**
  1.  Bandingkan kata kunci dan permintaan dalam brief dengan rubrik di atas. Periksa juga apakah ada link yang diberikan (jika tiernya 'Kaki Lima').
  2.  Tentukan apakah brief tersebut **isMatch** (true/false) dengan tier yang dipilih.
  3.  Jika **TIDAK COCOK**, tulis **reasoning** yang singkat, jelas, dan ramah. Contoh: "Brief Anda menyebutkan 'gaya minimalis', yang termasuk dalam eksplorasi konsep."
  4.  Jika **TIDAK COCOK**, berikan **suggestion** yang sangat spesifik dan bisa langsung dikerjakan oleh klien untuk menyederhanakan briefnya. JANGAN MENULIS ULANG BRIEFNYA. Berikan panduan yang jelas.
      - **Contoh Buruk:** "Sederhanakan brief Anda."
      - **Contoh Baik #1 (Kasus: Gaya Terlalu Kompleks):**
        - *Input Brief*: "Saya mau desain yang beda dari yang lain, minimalis, dan sesuai trend."
        - *Suggestion Output*: "Untuk menyesuaikan dengan tier Kaki Lima, coba hapus permintaan gaya seperti 'minimalis' dan 'sesuai trend'. Fokus pada instruksi visual yang lebih langsung, misalnya, 'gunakan warna biru dongker, latar belakang putih, dan font yang tebal dan mudah dibaca'."
      - **Contoh Baik #2 (Kasus: Ada Link di Tier Kaki Lima):**
         - *Input Brief*: "Tolong buatkan spanduk pecel lele. Referensi ada di link ini."
         - *Suggestion Output*: "Paket Kaki Lima tidak mencakup waktu untuk mempelajari materi dari link eksternal. Mohon hapus link tersebut dan tuliskan semua instruksi yang relevan langsung di dalam brief ini."
      - **Contoh Baik #3 (Kasus: Filosofi Abstrak):**
         - *Input Brief*: "Saya mau logo dengan filosofi yang mendalam."
         - *Suggestion Output*: "Kata 'filosofi' menyiratkan eksplorasi konsep yang dalam. Coba ganti dengan deskripsi visual yang lebih jelas, misalnya, 'Saya mau logo berbentuk perisai dengan gambar buku di tengahnya'."
  5.  Jika **SUDAH COCOK**, set **reasoning** dan **suggestion** ke string kosong.`,
});

const suggestBriefImprovementFlow = ai.defineFlow(
  {
    name: 'suggestBriefImprovementFlow',
    inputSchema: SuggestBriefImprovementInputSchema,
    outputSchema: SuggestBriefImprovementOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
