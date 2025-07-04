
'use server';

/**
 * @fileOverview Analyzes the complexity of a design brief relative to the selected budget tier.
 *
 * - analyzeBriefComplexity - A function that assesses if a brief matches its budget tier.
 * - AnalyzeBriefComplexityInput - The input type for the function.
 * - AnalyzeBriefComplexityOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {
  type AnalyzeBriefComplexityInput,
  AnalyzeBriefComplexityInputSchema,
  type AnalyzeBriefComplexityOutput,
  AnalyzeBriefComplexityOutputSchema,
} from '@/lib/types';


export async function analyzeBriefComplexity(input: AnalyzeBriefComplexityInput): Promise<AnalyzeBriefComplexityOutput> {
  return analyzeBriefComplexityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBriefComplexityPrompt',
  input: {schema: AnalyzeBriefComplexityInputSchema},
  output: {schema: AnalyzeBriefComplexityOutputSchema},
  prompt: `You are an expert, extremely firm, and rule-abiding Design Project Manager for a digital design studio. Your task is to analyze if a customer's design brief is appropriate for their selected budget tier based on a **VERY STRICT RUBRIC**. You must adhere to this rubric without exception. Your goal is to protect the studio from scope creep.

  Here is the non-negotiable rubric:

  - **Tier 'Kaki Lima'**:
    - **Tujuan**: Desain fungsional super cepat. **HANYA satu konsep final**, tidak ada alternatif. Maksimal 1x revisi minor (contoh: perbaikan salah ketik).
    - **Lingkup Kerja**: Ganti tulisan/gambar di template, desain sangat dasar.
    - **Kata Kunci Cocok (Kualitas Dasar)**: Kata-kata seperti "keren", "bagus", "rapi", "tidak norak" diizinkan karena merupakan ekspektasi kualitas dasar.
    - **TANDA BAHAYA (LANGSUNG REKOMENDASI UPGRADE)**:
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
    - **TANDA BAHAYA (LANGSUNG REKOMENDASI UPGRADE)**:
      - Meminta **lebih dari 1 konsep** atau alternatif.
      - Menyebut **nama brand lain** sebagai referensi (DILARANG KERAS).
      - Meminta "sistem desain", "animasi video", "pemotretan produk".
      - Meminta "copywriting strategis" atau "riset audiens".

  - **Tier 'E-Commerce'**:
    - **Tujuan**: Solusi desain strategis. **Maksimal 2 konsep awal** untuk dieksplorasi. Termasuk beberapa putaran revisi terstruktur. Boleh menggunakan referensi dari brand lain sebagai studi kasus.
    - **Lingkup Kerja**: Riset, branding, sistem desain yang bisa digunakan berulang kali.
    - **TANDA BAHAYA**:
      - Meminta **lebih dari 2 konsep** awal.

  ---

  **Tugas Anda:**

  Analisis brief pelanggan berikut berdasarkan tier yang mereka pilih. Fokus pada jenis produk yang mereka jual (konten digital, cetak, promosi), bukan logo.

  - **Selected Tier**: {{{budgetTier}}}
  - **Design Brief**:
    """
    {{{designBrief}}}
    """
  - **Provided Link**: {{{driveLink}}}

  **Instruksi Output:**
  1.  Bandingkan kata kunci dan permintaan dalam brief dengan rubrik di atas. Periksa juga apakah ada link yang diberikan.
  2.  Tentukan apakah brief tersebut **isMatch** (true/false) dengan tier yang dipilih. Ingat aturan ketat tentang link untuk tier Kaki Lima.
  3.  Tulis **reasoning** yang singkat, jelas, dan tegas namun sopan. Jika tidak cocok karena ada link, jelaskan (misal: "Paket Kaki Lima ditujukan untuk pekerjaan cepat tanpa referensi eksternal. Karena Anda melampirkan link, kami sarankan paket UMKM agar kami bisa mempelajari materi Anda."). Jika tidak cocok karena permintaan gaya, jelaskan (misal: "Permintaan Anda untuk gaya 'minimalis' dan 'sesuai trend' termasuk dalam eksplorasi konsep yang tidak dicakup oleh tier Kaki Lima.").
  4.  Jika tidak cocok, berikan **recommendation** tier yang paling sesuai. Jika sudah cocok, set recommendation ke null.`,
});

const analyzeBriefComplexityFlow = ai.defineFlow(
  {
    name: 'analyzeBriefComplexityFlow',
    inputSchema: AnalyzeBriefComplexityInputSchema,
    outputSchema: AnalyzeBriefComplexityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
