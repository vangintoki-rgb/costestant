/**
 * products.js — Data dummy & konstanta katalog Costestant.
 * 8 kostum FIKTIF/nonpribadi: tidak memakai nama karakter, logo, atau
 * aset berhak cipta (UI-SPEC.md Bagian 0). Seluruh ilustrasi dibuat
 * lokal sebagai SVG di public/images (tanpa request ke internet).
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
    nama: 'Luna Silver',
    asal: 'Lunar Chronicle',
    kategori: 'Anime',
    ukuran: 'M',
    hargaPer2Hari: 100000,
    stok: 3,
    status: 'Tersedia',
    deskripsi: 'Lengkap: kostum utama perak, wig silver panjang, mahkota bulan, dan sarung tangan.',
    imageUrl: '/images/kostum-01.svg',
    unggulan: true,
  },
  {
    id: '2c8b7f31-5d9e-4a6c-8b12-3e7f9a0d5c21',
    nama: 'Blaze Runner',
    asal: 'Ember Circuit',
    kategori: 'Anime',
    ukuran: 'L',
    hargaPer2Hari: 100000,
    stok: 2,
    status: 'Tersedia',
    deskripsi: 'Lengkap: jaket merah, wig pendek, visor, dan aksesoris sarung tangan.',
    imageUrl: '/images/kostum-02.svg',
    unggulan: true,
  },
  {
    id: '7a4e1d92-8c3b-4f5a-b6d7-1e9c2a4f8063',
    nama: 'Captain Nova',
    asal: 'Star Patrol Odyssey',
    kategori: 'Anime',
    ukuran: 'All Size',
    hargaPer2Hari: 100000,
    stok: 1,
    status: 'Sedang Disewa',
    deskripsi: 'Lengkap: baju antariksa, helm plastik, wig pendek, dan aksesoris komunikator.',
    imageUrl: '/images/kostum-03.svg',
    unggulan: true,
  },
  {
    id: '5d2f9a41-3e7c-4b8d-9a1f-6c2e8b4d7f53',
    nama: 'Iron Warden',
    asal: 'Verdant Quest',
    kategori: 'Game',
    ukuran: 'L',
    hargaPer2Hari: 200000,
    stok: 2,
    status: 'Tersedia',
    deskripsi: 'Lengkap: armor busa, wig hitam, perisai, dan pedang kayu.',
    imageUrl: '/images/kostum-04.svg',
    unggulan: false,
  },
  {
    id: '1b6c3e85-9a2d-4f7b-8c41-d5e3a9b27f60',
    nama: 'Mecha Aurora',
    asal: 'Aurora Protocol',
    kategori: 'Game',
    ukuran: 'M',
    hargaPer2Hari: 175000,
    stok: 0,
    status: 'Perawatan',
    deskripsi: 'Lengkap: kerangka mecha, helm visor, panel lampu, dan sarung tangan.',
    imageUrl: '/images/kostum-05.svg',
    unggulan: false,
  },
  {
    id: '4e9a7c12-6b8f-4d3e-a5c9-2f1b7d8e4a36',
    nama: 'Ultra Vanguard',
    asal: 'Guardian Wave',
    kategori: 'Tokusatsu',
    ukuran: 'All Size',
    hargaPer2Hari: 100000,
    stok: 4,
    status: 'Tersedia',
    deskripsi: 'Lengkap: kostum merah, topeng, pelindung dada, dan aksesoris sabuk.',
    imageUrl: '/images/kostum-06.svg',
    unggulan: false,
  },
  {
    id: '8f3d5b27-1c4a-4e9f-b2d6-7a5c1e9f3b84',
    nama: 'Crimson Rider',
    asal: 'Neon Rider Saga',
    kategori: 'Tokusatsu',
    ukuran: 'XL',
    hargaPer2Hari: 100000,
    stok: 1,
    status: 'Tersedia',
    deskripsi: 'Lengkap: kostum hitam-merah, helm rider, sabuk, dan pedang busa.',
    imageUrl: '/images/kostum-07.svg',
    unggulan: false,
  },
  {
    id: '3a7e2c96-5f1b-4d8a-9e3c-6b4f2a1d7c50',
    nama: 'Starlight Wanderer',
    asal: 'Dongeng Bintang',
    kategori: 'Original',
    ukuran: 'S',
    hargaPer2Hari: 90000,
    stok: 5,
    status: 'Tersedia',
    deskripsi: 'Lengkap: jubah bintang, topeng, wig putih, dan tongkat kayu.',
    imageUrl: '/images/kostum-08.svg',
    unggulan: false,
  },
]);

/** Alias kompatibilitas dengan penamaan di TASKS.md. */
export const KOSTUM_SEED = PRODUK_SEED;

export const SORT_OPTIONS = Object.freeze([
  'unggulan',
  'harga-asc',
  'harga-desc',
  'nama-asc',
]);

export const FILTER_DEFAULT = Object.freeze({
  search: '',
  kategori: 'Semua',
  ukuran: 'Semua',
  status: 'Semua',
  sortBy: 'unggulan',
});

/**
 * Fungsi murni: pencarian → filter → sort (urutan tetap sesuai R11).
 * Tidak memutasi `products` maupun objek di dalamnya; selalu mengembalikan array baru.
 * Kombinasi kriteria bersifat AND.
 */
export function filterProducts(products, criteria = {}) {
  const {
    search = '',
    kategori = 'Semua',
    ukuran = 'Semua',
    status = 'Semua',
    sortBy = 'unggulan',
  } = criteria ?? {};

  const query = String(search).trim().toLowerCase();
  const list = Array.isArray(products) ? products : [];

  const hasil = list.filter((item) => {
    if (query) {
      const nama = String(item.nama ?? '').toLowerCase();
      const asal = String(item.asal ?? '').toLowerCase();
      if (!nama.includes(query) && !asal.includes(query)) return false;
    }
    if (kategori !== 'Semua' && item.kategori !== kategori) return false;
    if (ukuran !== 'Semua' && item.ukuran !== ukuran) return false;
    if (status !== 'Semua' && item.status !== status) return false;
    return true;
  });

  const sorted = [...hasil];
  const byName = (a, b) =>
    String(a.nama ?? '').localeCompare(String(b.nama ?? ''), 'id', { sensitivity: 'base' });

  switch (sortBy) {
    case 'harga-asc':
      sorted.sort((a, b) => Number(a.hargaPer2Hari) - Number(b.hargaPer2Hari) || byName(a, b));
      break;
    case 'harga-desc':
      sorted.sort((a, b) => Number(b.hargaPer2Hari) - Number(a.hargaPer2Hari) || byName(a, b));
      break;
    case 'nama-asc':
      sorted.sort(byName);
      break;
    case 'unggulan':
    default:
      sorted.sort(
        (a, b) => Number(Boolean(b.unggulan)) - Number(Boolean(a.unggulan)) || byName(a, b),
      );
  }

  return sorted;
}

/* ------------------------------------------------------------------ */
/* Kalkulator sewa & WhatsApp (SPEC.md 4.4 / 4.5) — semua fungsi murni   */
/* ------------------------------------------------------------------ */

export const PAKET_HARI = 2;
export const DURASI_MIN = 2;
export const DURASI_MAX = 30;

/** Formatter Rupiah id-ID — satu source of truth untuk UI dan pesan WA. */
export function formatRupiah(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Rp 0';
  return `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount)}`;
}

/** Clamp durasi ke rentang paket yang diizinkan (SPEC 4.4). */
export function clampDurasi(value) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return DURASI_MIN;
  return Math.min(DURASI_MAX, Math.max(DURASI_MIN, n));
}

/**
 * Rincian sewa: tarif paket 2 hari + tarif harian tambahan.
 * rumus: hargaHariTambahan = ceil(harga/2); total = harga + (durasi-2)*tarif.
 * Sesuai SPEC.md 4.4 (bukan ceil(durasi/2)*harga — lihat catatan di TASKS.md M4).
 */
export function getRentalBreakdown(hargaPer2Hari, durasiHari) {
  const harga = Math.max(0, Math.floor(Number(hargaPer2Hari) || 0));
  const durasi = clampDurasi(durasiHari);
  const hargaHariTambahan = Math.ceil(harga / PAKET_HARI);
  const hariTambahan = durasi - PAKET_HARI;
  const total = harga + hariTambahan * hargaHariTambahan;
  return {
    hargaPer2Hari: harga,
    durasi,
    paket: 1,
    hariTambahan,
    hargaHariTambahan,
    total,
    totalFormatted: formatRupiah(total),
  };
}

/** Total biaya sewa (angka) — fungsi murni yang diminta. */
export function calculateRentalTotal(hargaPer2Hari, durasiHari) {
  return getRentalBreakdown(hargaPer2Hari, durasiHari).total;
}

/** Alias sesuai penamaan di SPEC.md 4.4 / TASKS T4.3. */
export const hitungSewa = calculateRentalTotal;

const KODE_NEGARA = Object.freeze(['62', '1', '44', '81', '65', '60', '91']);

/** Terima +62… / 08… / 628… dan kembalikan digit internasional. */
export function normalisasiNomorWhatsApp(nomor) {
  const digits = String(nomor ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
}

/**
 * Valid nomor internasional: seluruh karakter digit (tanpa spasi/+/-/huruf),
 * tidak diawali 0 (jadi `08...` ditolak), diawali kode negara, panjang 10–15 digit.
 * `normalisasiNomorWhatsApp` tetap diekspor sebagai utilitas, tetapi bukan validator.
 */
export function isValidWhatsAppNumber(nomor) {
  const raw = String(nomor ?? '');
  if (!/^\d+$/.test(raw) || raw.startsWith('0')) return false;
  return (
    raw.length >= 10 &&
    raw.length <= 15 &&
    KODE_NEGARA.some((kode) => raw.startsWith(kode))
  );
}

/** Pesan pre-filled persis format SPEC.md 4.5. */
export function buildWhatsAppMessage(detailSewa = {}) {
  const {
    nama = '',
    asal = '',
    ukuran = '',
    tanggalMulai = '',
    durasiHari,
    hargaPer2Hari,
  } = detailSewa ?? {};
  const r = getRentalBreakdown(hargaPer2Hari, durasiHari);
  return [
    'Halo Costestant, saya ingin menyewa kostum:',
    '',
    `Kostum   : ${nama}`,
    `Asal     : ${asal}`,
    `Ukuran   : ${ukuran}`,
    `Mulai    : ${tanggalMulai}`,
    `Durasi   : ${r.durasi} hari (paket 2 hari + ${r.hariTambahan} hari tambahan)`,
    `Estimasi : ${r.totalFormatted}`,
    '',
    'Mohon konfirmasi ketersediaannya. Terima kasih!',
  ].join('\n');
}

/** URL wa.me dengan pesan ter-encode. Melempar Error untuk nomor invalid. */
export function buildWhatsAppUrl(nomor, detailSewa = {}) {
  if (!isValidWhatsAppNumber(nomor)) {
    throw new Error('NOMOR WHATSAPP TIDAK VALID. GUNAKAN FORMAT INTERNASIONAL, CONTOH 6281234567890.');
  }
  const tujuan = String(nomor);
  return `https://wa.me/${tujuan}?text=${encodeURIComponent(buildWhatsAppMessage(detailSewa))}`;
}
