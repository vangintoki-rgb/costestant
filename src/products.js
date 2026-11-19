/**
 * products.js — Data dummy & konstanta katalog Costestant.
 * Milestone 1: kerangka modul. Berisi 8 kostum contoh nonpribadi
 * sesuai SPEC.md 4.6 dan satu source of truth untuk enum (NFR8).
 */

// PLACEHOLDER — ganti sebelum produksi (SPEC.md R2 / NFR7).
export const WHATSAPP_NUMBER = '6281234567890';

export const KATEGORI = Object.freeze(['Anime', 'Game', 'Tokusatsu', 'Original']);
export const UKURAN = Object.freeze(['S', 'M', 'L', 'XL', 'All Size']);
export const STATUS = Object.freeze(['Tersedia', 'Sedang Disewa', 'Perawatan']);

export const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

/** 8 kostum contoh. Dipakai ulang oleh tombol Reset ke Data Awal. */
export const PRODUK_SEED = Object.freeze([
  {
    id: '9f1c2e7a-6b4d-4f8a-9c11-2a7e5b0d3f64',
    nama: 'Sailor Moon',
    asal: 'Sailor Moon',
    kategori: 'Anime',
    ukuran: 'M',
    hargaPer2Hari: 100000,
    stok: 3,
    status: 'Tersedia',
    deskripsi: 'Lengkap: wig blonde, mahkota, tongkat bulan, dan sarung tangan.',
    imageUrl: '/images/kostum-01.svg',
    unggulan: true,
  },
  {
    id: '2c8b7f31-5d9e-4a6c-8b12-3e7f9a0d5c21',
    nama: 'Naruto Uzumaki',
    asal: 'Naruto',
    kategori: 'Anime',
    ukuran: 'L',
    hargaPer2Hari: 125000,
    stok: 2,
    status: 'Tersedia',
    deskripsi: 'Lengkap: wig kuning, headband, jaket oranye, dan kunai kayu.',
    imageUrl: '/images/kostum-02.svg',
    unggulan: true,
  },
  {
    id: '7a4e1d92-8c3b-4f5a-b6d7-1e9c2a4f8063',
    nama: 'Luffy Gear 5',
    asal: 'One Piece',
    kategori: 'Anime',
    ukuran: 'All Size',
    hargaPer2Hari: 150000,
    stok: 1,
    status: 'Sedang Disewa',
    deskripsi: 'Lengkap: wig putih, topi jerami, sarung tangan, dan aksesoris tangan.',
    imageUrl: '/images/kostum-03.svg',
    unggulan: true,
  },
  {
    id: '5d2f9a41-3e7c-4b8d-9a1f-6c2e8b4d7f53',
    nama: 'Geralt of Rivia',
    asal: 'The Witcher',
    kategori: 'Game',
    ukuran: 'L',
    hargaPer2Hari: 200000,
    stok: 2,
    status: 'Tersedia',
    deskripsi: 'Lengkap: wig putih, medallion, armor, dan pedang kayu.',
    imageUrl: '/images/kostum-04.svg',
    unggulan: false,
  },
  {
    id: '1b6c3e85-9a2d-4f7b-8c41-d5e3a9b27f60',
    nama: 'Samus Aran',
    asal: 'Metroid',
    kategori: 'Game',
    ukuran: 'M',
    hargaPer2Hari: 175000,
    stok: 0,
    status: 'Perawatan',
    deskripsi: 'Lengkap: helm visor, baju armor merah, dan blaster prop.',
    imageUrl: '/images/kostum-05.svg',
    unggulan: false,
  },
  {
    id: '4e9a7c12-6b8f-4d3e-a5c9-2f1b7d8e4a36',
    nama: 'Ultraman Tiga',
    asal: 'Ultraman',
    kategori: 'Tokusatsu',
    ukuran: 'All Size',
    hargaPer2Hari: 140000,
    stok: 4,
    status: 'Tersedia',
    deskripsi: 'Lengkap: topeng, kostum merah-perak, dan lampu dada berwarna.',
    imageUrl: '/images/kostum-06.svg',
    unggulan: false,
  },
  {
    id: '8f3d5b27-1c4a-4e9f-b2d6-7a5c1e9f3b84',
    nama: 'Kamen Rider Zero-One',
    asal: 'Kamen Rider',
    kategori: 'Tokusatsu',
    ukuran: 'XL',
    hargaPer2Hari: 180000,
    stok: 1,
    status: 'Tersedia',
    deskripsi: 'Lengkap: helm rider, sabuk, dan senjata busa.',
    imageUrl: '/images/kostum-07.svg',
    unggulan: false,
  },
  {
    id: '3a7e2c96-5f1b-4d8a-9e3c-6b4f2a1d7c50',
    nama: 'Starlight Wanderer',
    asal: 'Original',
    kategori: 'Original',
    ukuran: 'S',
    hargaPer2Hari: 90000,
    stok: 5,
    status: 'Tersedia',
    deskripsi: 'Lengkap: jubah, topeng bintang, dan tongkat kayu.',
    imageUrl: '/images/kostum-08.svg',
    unggulan: false,
  },
]);

/** Alias kompatibilitas dengan penamaan di TASKS.md. */
export const KOSTUM_SEED = PRODUK_SEED;
