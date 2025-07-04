
import type { Product } from './types';

export const MAX_WEEKLY_ORDERS = 10;

// =================================================================
// Data Produk Contoh (DIRAPIKAN)
// Hanya menggunakan object `prices` untuk konsistensi.
// Menghapus field `stock` yang tidak relevan.
// Ini digunakan sebagai fallback jika database gagal dimuat.
// =================================================================
export const mockProducts: Omit<Product, 'price'>[] = [
  // --- Kategori: Konten Digital ---
  {
    id: '1',
    name: 'Konten Feed (Single Post)',
    description: 'Satu konten feed untuk media sosial Anda.',
    prices: { kakiLima: 15000, umkm: 25000, ecommerce: 70000 },
    category: 'Konten Digital',
    image: 'https://placehold.co/300x300.png',
    hint: 'social media post',
  },
  {
    id: '2',
    name: 'Konten Carousel (3 Slide)',
    description: 'Konten carousel dengan 3 slide informatif.',
    prices: { kakiLima: 30000, umkm: 60000, ecommerce: 180000 },
    category: 'Konten Digital',
    image: 'https://placehold.co/300x300.png',
    hint: 'carousel post',
  },
  {
    id: '3',
    name: 'Konten Story (Vertikal)',
    description: 'Konten story vertikal untuk Instagram, TikTok, dll.',
    prices: { kakiLima: 15000, umkm: 25000, ecommerce: 70000 },
    category: 'Konten Digital',
    image: 'https://placehold.co/300x300.png',
    hint: 'social media story',
  },
  {
    id: '4',
    name: 'Frame Foto Profil (Twibbon)',
    description: 'Desain frame untuk foto profil atau kampanye.',
    prices: { kakiLima: 18000, umkm: 35000, ecommerce: 80000 },
    category: 'Konten Digital',
    image: 'https://placehold.co/300x300.png',
    hint: 'profile frame',
  },
  {
    id: '5',
    name: 'Undangan Digital / Cetak',
    description: 'Desain undangan untuk acara spesial Anda.',
    prices: { kakiLima: 25000, umkm: 60000, ecommerce: 145000 },
    category: 'Konten Digital',
    image: 'https://placehold.co/300x300.png',
    hint: 'invitation design',
  },
  {
    id: '6',
    name: 'Sampul E-book',
    description: 'Desain sampul menarik untuk e-book Anda.',
    prices: { kakiLima: 35000, umkm: 70000, ecommerce: 175000 },
    category: 'Konten Digital',
    image: 'https://placehold.co/300x300.png',
    hint: 'book cover',
  },
  {
    id: '7',
    name: 'Slide Presentasi (PPT)',
    description: 'Desain slide presentasi yang profesional.',
    prices: { kakiLima: 70000, umkm: 150000, ecommerce: 425000 },
    category: 'Konten Digital',
    image: 'https://placehold.co/300x300.png',
    hint: 'presentation slide',
  },
  {
    id: '8',
    name: 'Visual Landing Page',
    description: 'Desain visual untuk landing page website.',
    prices: { kakiLima: 125000, umkm: 350000, ecommerce: 950000 },
    category: 'Konten Digital',
    image: 'https://placehold.co/300x300.png',
    hint: 'website design',
  },

  // --- Kategori: Branding & Cetak ---
  {
    id: '9',
    name: 'Kop Surat (Letterhead)',
    description: 'Desain kop surat resmi untuk bisnis Anda.',
    prices: { kakiLima: 15000, umkm: 28000, ecommerce: 65000 },
    category: 'Branding & Cetak',
    image: 'https://placehold.co/300x300.png',
    hint: 'letterhead design',
  },
  {
    id: '10',
    name: 'Kartu Nama',
    description: 'Desain kartu nama yang profesional dan unik.',
    prices: { kakiLima: 18000, umkm: 30000, ecommerce: 70000 },
    category: 'Branding & Cetak',
    image: 'https://placehold.co/300x300.png',
    hint: 'business card',
  },
  {
    id: '11',
    name: 'Sertifikat / Piagam',
    description: 'Desain sertifikat atau piagam penghargaan.',
    prices: { kakiLima: 20000, umkm: 45000, ecommerce: 105000 },
    category: 'Branding & Cetak',
    image: 'https://placehold.co/300x300.png',
    hint: 'certificate design',
  },
  {
    id: '12',
    name: 'Lanyard / Tali ID Card',
    description: 'Desain lanyard atau tali untuk ID card.',
    prices: { kakiLima: 20000, umkm: 35000, ecommerce: 85000 },
    category: 'Branding & Cetak',
    image: 'https://placehold.co/300x300.png',
    hint: 'lanyard design',
  },
  {
    id: '13',
    name: 'Poster (Ukuran A4)',
    description: 'Desain poster ukuran A4 untuk berbagai keperluan.',
    prices: { kakiLima: 22000, umkm: 50000, ecommerce: 125000 },
    category: 'Branding & Cetak',
    image: 'https://placehold.co/300x300.png',
    hint: 'poster design',
  },
  {
    id: '14',
    name: 'Buku Menu',
    description: 'Desain buku menu untuk restoran atau kafe.',
    prices: { kakiLima: 25000, umkm: 60000, ecommerce: 160000 },
    category: 'Branding & Cetak',
    image: 'https://placehold.co/300x300.png',
    hint: 'menu book',
  },
  {
    id: '15',
    name: 'Brosur / Pamflet Promosi',
    description: 'Desain brosur atau pamflet untuk promosi.',
    prices: { kakiLima: 35000, umkm: 75000, ecommerce: 195000 },
    category: 'Branding & Cetak',
    image: 'https://placehold.co/300x300.png',
    hint: 'brochure design',
  },
  
  // --- Kategori: Promosi Outdoor ---
  {
    id: '16',
    name: 'X-Banner',
    description: 'Desain X-Banner untuk acara atau promosi.',
    prices: { kakiLima: 35000, umkm: 75000, ecommerce: 185000 },
    category: 'Promosi Outdoor',
    image: 'https://placehold.co/300x300.png',
    hint: 'x banner',
  },
  {
    id: '17',
    name: 'Spanduk / Banner Outdoor',
    description: 'Desain spanduk atau banner untuk luar ruangan.',
    prices: { kakiLima: 40000, umkm: 85000, ecommerce: 210000 },
    category: 'Promosi Outdoor',
    image: 'https://placehold.co/300x300.png',
    hint: 'outdoor banner',
  },
  {
    id: '18',
    name: 'Roll-Up Banner',
    description: 'Desain roll-up banner yang mudah dibawa.',
    prices: { kakiLima: 45000, umkm: 90000, ecommerce: 240000 },
    category: 'Promosi Outdoor',
    image: 'https://placehold.co/300x300.png',
    hint: 'roll up banner',
  },
  {
    id: '19',
    name: 'Gerbang Acara (Gate)',
    description: 'Desain gerbang untuk acara atau event.',
    prices: { kakiLima: 70000, umkm: 150000, ecommerce: 375000 },
    category: 'Promosi Outdoor',
    image: 'https://placehold.co/300x300.png',
    hint: 'event gate',
  },
];
