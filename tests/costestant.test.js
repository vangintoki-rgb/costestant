import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PLACEHOLDER_IMAGE,
  PRODUK_SEED,
  WHATSAPP_NUMBER,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  calculateRentalTotal,
  clampDurasi,
  filterProducts,
  getRentalBreakdown,
  isValidWhatsAppNumber,
} from '../src/products.js';
import {
  BATAS_SKEMA,
  isValidImagePath,
  normalisasiImagePath,
  validateImportFile,
} from '../src/store.js';
import { validateProductDraft } from '../src/ui.js';

const STORAGE_KEY = 'costestant:costumes:v1';

let map;
let storage;

/** Mock localStorage minimal: cukup getItem/setItem/removeItem/clear. */
function makeStorage() {
  return {
    getItem: vi.fn((key) => (map.has(key) ? map.get(key) : null)),
    setItem: vi.fn((key, value) => {
      map.set(key, String(value));
    }),
    removeItem: vi.fn((key) => {
      map.delete(key);
    }),
    clear: vi.fn(() => {
      map.clear();
    }),
  };
}

function seedStorage(entries = {}) {
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  }
}

/**
 * store.js menyimpan state di module scope, jadi registry harus di-reset
 * supaya setiap kasus mendapat instance baru dengan localStorage bersih.
 */
async function loadStore(entries = {}) {
  seedStorage(entries);
  return import('../src/store.js');
}

const baseItem = () => ({ ...PRODUK_SEED[0] });
const sewaLuna = {
  nama: 'Luna Silver',
  asal: 'Lunar Chronicle',
  ukuran: 'M',
  tanggalMulai: '2026-11-20',
  durasiHari: 5,
  hargaPer2Hari: 100000,
};

beforeEach(() => {
  vi.resetModules();
  map = new Map();
  storage = makeStorage();
  vi.stubGlobal('window', { localStorage: storage });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('filterProducts — pencarian, filter, sorting', () => {
  it('mencari case-insensitive pada nama kostum dan asal series', () => {
    const byNama = filterProducts(PRODUK_SEED, { search: 'LUNA' });
    expect(byNama.map((item) => item.nama)).toEqual(['Luna Silver']);

    const byAsal = filterProducts(PRODUK_SEED, { search: 'AURORA' });
    expect(byAsal.map((item) => item.nama)).toEqual(['Mecha Aurora']);
  });

  it('menggabungkan kategori + ukuran + status dengan logika AND', () => {
    const hasil = filterProducts(PRODUK_SEED, {
      kategori: 'Game',
      ukuran: 'M',
      status: 'Perawatan',
    });
    expect(hasil.map((item) => item.nama)).toEqual(['Mecha Aurora']);

    const hasilDenganSearch = filterProducts(PRODUK_SEED, {
      search: 'ultra',
      kategori: 'Tokusatsu',
      ukuran: 'All Size',
      status: 'Tersedia',
    });
    expect(hasilDenganSearch.map((item) => item.nama)).toEqual(['Ultra Vanguard']);
  });

  it('mengurutkan harga-asc dari termurah', () => {
    const hasil = filterProducts(PRODUK_SEED, { sortBy: 'harga-asc' });
    expect(hasil.map((item) => item.hargaPer2Hari)).toEqual([
      90000, 100000, 100000, 100000, 100000, 100000, 175000, 200000,
    ]);
    expect(hasil[0].nama).toBe('Starlight Wanderer');
  });

  it('mengurutkan harga-desc dari termahal', () => {
    const hasil = filterProducts(PRODUK_SEED, { sortBy: 'harga-desc' });
    expect(hasil.map((item) => item.hargaPer2Hari)).toEqual([
      200000, 175000, 100000, 100000, 100000, 100000, 100000, 90000,
    ]);
    expect(hasil[0].nama).toBe('Iron Warden');
  });

  it('mengurutkan nama-asc A–Z', () => {
    const hasil = filterProducts(PRODUK_SEED, { sortBy: 'nama-asc' });
    expect(hasil.map((item) => item.nama)).toEqual([
      'Blaze Runner',
      'Captain Nova',
      'Crimson Rider',
      'Iron Warden',
      'Luna Silver',
      'Mecha Aurora',
      'Starlight Wanderer',
      'Ultra Vanguard',
    ]);
  });

  it('mengembalikan array kosong bila tidak ada kostum cocok', () => {
    expect(filterProducts(PRODUK_SEED, { search: 'zzzz' })).toEqual([]);
  });

  it('tidak memutasi array sumber', () => {
    const salinan = PRODUK_SEED.map((item) => ({ ...item }));
    filterProducts(salinan, { sortBy: 'harga-desc' });
    expect(salinan).toEqual(PRODUK_SEED);
  });
});

describe('validateCostumeItem — batas dan enum', () => {
  it('menerima kasus batas hargaPer2Hari = 0 dan stok = 0', async () => {
    const { validateCostumeItem, validateCostumeList } = await loadStore();
    const item = baseItem();
    item.hargaPer2Hari = 0;
    item.stok = 0;

    expect(validateCostumeItem(item)).toBe(true);
    expect(validateCostumeList([item])).toBe(true);
  });

  it('menolak harga negatif, stok negatif, dan stok desimal', async () => {
    const { validateCostumeItem } = await loadStore();

    expect(validateCostumeItem({ ...baseItem(), hargaPer2Hari: -1 })).toBe(false);
    expect(validateCostumeItem({ ...baseItem(), stok: -1 })).toBe(false);
    expect(validateCostumeItem({ ...baseItem(), stok: 2.5 })).toBe(false);
  });

  it('menolak kategori, ukuran, atau status di luar enum', async () => {
    const { validateCostumeItem, validateCostumeListDetailed } = await loadStore();

    expect(validateCostumeItem({ ...baseItem(), kategori: 'Invalid' })).toBe(false);
    expect(validateCostumeItem({ ...baseItem(), ukuran: 'XXL' })).toBe(false);
    expect(validateCostumeItem({ ...baseItem(), status: 'Unknown' })).toBe(false);

    const detail = validateCostumeListDetailed([{ ...baseItem(), ukuran: 'XXL' }]);
    expect(detail.valid).toBe(false);
    expect(detail.errors.join(' ')).toMatch(/ITEM 1/);
    expect(detail.errors.join(' ')).toMatch(/ukuran/);
  });
});

describe('kalkulator sewa & buildWhatsAppUrl', () => {
  it('menghitung tarif Rp 100.000 / 2 hari untuk durasi genap, ganjil, dan clamp', () => {
    expect(calculateRentalTotal(100000, 2)).toBe(100000);
    expect(calculateRentalTotal(100000, 4)).toBe(200000);
    expect(calculateRentalTotal(100000, 5)).toBe(250000);
    expect(calculateRentalTotal(100000, 1)).toBe(100000);
    expect(calculateRentalTotal(100000, 31)).toBe(1500000);
    expect(clampDurasi(31)).toBe(30);
  });

  it('membulatkan tarif harian tambahan ke atas untuk harga ganjil', () => {
    const rincian = getRentalBreakdown(175000, 3);
    expect(rincian.hargaHariTambahan).toBe(87500);
    expect(rincian.hariTambahan).toBe(1);
    expect(rincian.total).toBe(262500);
    expect(rincian.totalFormatted).toBe('Rp 262.500');
  });

  it('menerima 628... dan menolak 08..., huruf/simbol, serta nomor terlalu pendek', () => {
    expect(isValidWhatsAppNumber(WHATSAPP_NUMBER)).toBe(true);
    expect(buildWhatsAppUrl(WHATSAPP_NUMBER, sewaLuna)).toMatch(
      /^https:\/\/wa\.me\/6281234567890\?text=/,
    );

    expect(isValidWhatsAppNumber('081234567890')).toBe(false);
    expect(isValidWhatsAppNumber('62abc1234567890')).toBe(false);
    expect(isValidWhatsAppNumber('62-812-3456-7890')).toBe(false);
    expect(isValidWhatsAppNumber('628123')).toBe(false);
    expect(() => buildWhatsAppUrl('081234567890', sewaLuna)).toThrow(
      /NOMOR WHATSAPP TIDAK VALID/,
    );
  });

  it('meng-encode pesan dengan encodeURIComponent secara aman', () => {
    const url = buildWhatsAppUrl(WHATSAPP_NUMBER, sewaLuna);
    const encoded = url.split('?text=')[1];
    const pesan = decodeURIComponent(encoded);

    expect(encoded).toBe(encodeURIComponent(buildWhatsAppMessage(sewaLuna)));
    expect(encoded).not.toContain('\n');
    expect(encoded).not.toContain(' ');
    expect(pesan).toContain('Kostum   : Luna Silver');
    expect(pesan).toContain('Mulai    : 2026-11-20');
    expect(pesan).toContain('Durasi   : 5 hari (paket 2 hari + 3 hari tambahan)');
    expect(pesan).toContain('Estimasi : Rp 250.000');
  });
});

describe('parser & pemulihan localStorage costestant:costumes:v1', () => {
  it('memuat array kostum valid dari localStorage dengan benar', async () => {
    const custom = [{ ...baseItem(), id: 'custom-1', nama: 'Kostum Uji' }];
    const store = await loadStore({ [STORAGE_KEY]: custom });

    const init = store.initStore();
    expect(init.issue).toBeNull();
    expect(init.products).toHaveLength(1);
    expect(init.products[0].nama).toBe('Kostum Uji');
    expect(store.getProducts()).toHaveLength(1);
  });

  it('memulihkan 8 seed saat payload JSON rusak (syntax error)', async () => {
    const store = await loadStore({ [STORAGE_KEY]: '{ json rusak' });

    const init = store.initStore();
    expect(init.issue.kind).toBe('corrupt');
    expect(init.issue.message).toMatch(/JSON TIDAK VALID/);
    expect(init.products).toHaveLength(8);
    expect(JSON.parse(map.get(STORAGE_KEY))).toHaveLength(8);
  });

  it('memulihkan 8 seed saat struktur field tidak valid', async () => {
    const rusak = [{ ...baseItem(), stok: 'dua' }];
    const store = await loadStore({ [STORAGE_KEY]: rusak });

    const init = store.initStore();
    expect(init.issue.kind).toBe('corrupt');
    expect(init.issue.message).toMatch(/ITEM 1/);
    expect(init.issue.message).toMatch(/stok/);
    expect(init.products).toHaveLength(8);
    expect(JSON.parse(map.get(STORAGE_KEY))).toHaveLength(8);
  });

  it('memulihkan 8 seed saat array kosong', async () => {
    const store = await loadStore({ [STORAGE_KEY]: [] });

    const init = store.initStore();
    expect(init.issue.kind).toBe('corrupt');
    expect(init.products).toHaveLength(8);
    expect(JSON.parse(map.get(STORAGE_KEY))).toHaveLength(8);
  });

  it('menyimpan setiap mutasi ke key kanonik', async () => {
    const store = await loadStore();
    store.initStore();

    store.addProduct({ ...baseItem(), id: 'added-1', nama: 'Kostum Tambahan' });
    expect(JSON.parse(map.get(STORAGE_KEY))).toHaveLength(9);

    store.deleteProduct('added-1');
    expect(JSON.parse(map.get(STORAGE_KEY))).toHaveLength(8);
  });
});

describe('hardening audit — path gambar, batas skema, allow-list, ukuran payload', () => {
  it('menerima path /images/ lokal dan menolak skema URL serta traversal', () => {
    expect(isValidImagePath('/images/kostum-01.svg')).toBe(true);
    expect(isValidImagePath('')).toBe(true);
    expect(isValidImagePath('https://example.com/gambar.png')).toBe(false);
    expect(isValidImagePath('data:example')).toBe(false);
    expect(isValidImagePath('javascript:example')).toBe(false);
    expect(isValidImagePath('/images/../rahasia.svg')).toBe(false);
    expect(isValidImagePath('/images/gambar\\aneh.png')).toBe(false);
    expect(normalisasiImagePath('')).toBe(PLACEHOLDER_IMAGE);
  });

  it('menolak kunci asing termasuk __proto__ tanpa mencemari Object.prototype', async () => {
    const { validateCostumeItem } = await loadStore();

    const denganProto = { ...baseItem(), ['__proto__']: { polluted: true } };
    expect(validateCostumeItem(denganProto)).toBe(false);
    expect(Object.prototype.polluted).toBeUndefined();
    expect({}.polluted).toBeUndefined();

    expect(validateCostumeItem({ ...baseItem(), constructor: 1 })).toBe(false);
    expect(validateCostumeItem({ ...baseItem(), prototype: 1 })).toBe(false);
  });

  it('menolak harga desimal/terlalu besar, stok > batas, dan teks di luar rentang', async () => {
    const { validateCostumeItem } = await loadStore();

    expect(validateCostumeItem({ ...baseItem(), hargaPer2Hari: 100000.5 })).toBe(false);
    expect(validateCostumeItem({ ...baseItem(), hargaPer2Hari: BATAS_SKEMA.hargaMax + 1 })).toBe(false);
    expect(validateCostumeItem({ ...baseItem(), stok: BATAS_SKEMA.stokMax + 1 })).toBe(false);
    expect(validateCostumeItem({ ...baseItem(), nama: 'ab' })).toBe(false);
    expect(validateCostumeItem({ ...baseItem(), deskripsi: 'pendek' })).toBe(false);
  });

  it('menolak array dengan jumlah item melebihi batas', async () => {
    const { validateCostumeListDetailed } = await loadStore();
    const hasil = validateCostumeListDetailed(
      Array.from({ length: 501 }, () => baseItem()),
    );

    expect(hasil.valid).toBe(false);
    expect(hasil.errors.join(' ')).toMatch(/MELEBIHI 500/);
  });

  it('menolak impor terlalu besar tanpa mengubah state', async () => {
    const store = await loadStore();
    store.initStore();
    const sebelum = store.getProducts().length;

    const hasil = store.importProductsJson('x'.repeat(1_000_001));
    expect(hasil.ok).toBe(false);
    expect(hasil.error).toMatch(/TERLALU BESAR/);
    expect(store.getProducts()).toHaveLength(sebelum);
  });

  it('menolak imageUrl eksternal dari impor dan menjaga state tetap 8 seed', async () => {
    const store = await loadStore();
    store.initStore();

    const hasil = store.importProductsJson(
      JSON.stringify([{ ...baseItem(), imageUrl: 'https://example.com/gambar.png' }]),
    );
    expect(hasil.ok).toBe(false);
    expect(store.getProducts()).toHaveLength(8);
  });

  it('memulihkan 8 seed saat localStorage berisi payload terlalu besar', async () => {
    const store = await loadStore({ [STORAGE_KEY]: 'x'.repeat(1_000_001) });

    const init = store.initStore();
    expect(init.issue.kind).toBe('corrupt');
    expect(init.issue.message).toMatch(/TERLALU BESAR/);
    expect(init.products).toHaveLength(8);
  });

  it('membersihkan Field impor: trim teks dan normalisasi imageUrl kosong', async () => {
    const store = await loadStore();
    store.initStore();

    const hasil = store.importProductsJson(
      JSON.stringify([
        { ...baseItem(), id: 'trim-1', nama: '  Kostum Trim  ', imageUrl: '' },
      ]),
    );
    expect(hasil.ok).toBe(true);
    expect(store.getProducts()).toHaveLength(1);
    expect(store.getProducts()[0].nama).toBe('Kostum Trim');
    expect(store.getProducts()[0].imageUrl).toBe(PLACEHOLDER_IMAGE);
    expect(Object.keys(store.getProducts()[0])).not.toContain('__proto__');
  });

  it('validateImportFile menolak ekstensi, MIME, dan ukuran file tidak aman', () => {
    expect(
      validateImportFile({ name: 'backup.json', type: 'application/json', size: 10 }).ok,
    ).toBe(true);
    expect(validateImportFile({ name: 'backup.txt', type: 'application/json', size: 10 }).ok).toBe(false);
    expect(validateImportFile({ name: 'backup.json', type: 'text/plain', size: 10 }).ok).toBe(false);
    expect(
      validateImportFile({ name: 'backup.json', type: 'application/json', size: 1_000_001 }).ok,
    ).toBe(false);
    expect(validateImportFile(null).ok).toBe(false);
  });

  it('validateProductDraft menolak path gambar berbahaya', () => {
    const draft = {
      nama: 'Kostum Uji',
      asal: 'Series Uji',
      kategori: 'Anime',
      ukuran: 'M',
      hargaPer2Hari: '100000',
      stok: '1',
      status: 'Tersedia',
      deskripsi: 'Lengkap: kostum, wig, dan aksesoris sesuai tema.',
      imageUrl: 'javascript:example',
    };

    expect(validateProductDraft(draft).errors.imageUrl).toBeTruthy();
  });
});

describe('hardening audit — konfigurasi CSP & font', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

  it('index.html memuat CSP dengan direktif pembatas yang wajib', () => {
    expect(html).toMatch(/http-equiv="Content-Security-Policy"/);
    expect(html).toMatch(/object-src 'none'/);
    expect(html).toMatch(/base-uri 'none'/);
    expect(html).toMatch(/img-src 'self'/);
    expect(html).not.toMatch(/unsafe-eval/);
  });

  it('tautan font eksternal memakai crossorigin dan di-allowlist CSP', () => {
    expect(html).toMatch(/fonts\.googleapis\.com/);
    expect(html).toMatch(/fonts\.gstatic\.com/);
    expect(html).toMatch(/crossorigin="anonymous"/);
    expect(html).toMatch(/font-src 'self' https:\/\/fonts\.gstatic\.com/);
  });
});
