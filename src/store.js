/**
 * store.js — State management + persistensi localStorage (M6).
 * Semua akses localStorage dibungkus try/catch sesuai SPEC.md R1 / NFR4.
 * Mutasi kostum selalu lewat satu fungsi `commit()` agar tidak ada yang
 * terlewat dari penyimpanan (T6.3).
 */
import {
  FILTER_DEFAULT,
  KATEGORI,
  PLACEHOLDER_IMAGE,
  PRODUK_SEED,
  STATUS,
  UKURAN,
  filterProducts,
} from './products.js';

/**
 * Audit C-01/C-02: batas & helper validator didefinisikan di sini (bukan products.js)
 * agar patch tetap berada dalam lingkup empat berkas yang disetujui.
 */
export const BATAS_SKEMA = Object.freeze({
  namaMin: 3,
  namaMax: 80,
  asalMin: 2,
  asalMax: 80,
  deskripsiMin: 10,
  deskripsiMax: 500,
  hargaMax: 100000000,
  stokMax: 999,
});

export const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const IMAGE_PATH_REGEX = /^\/images\/[A-Za-z0-9._/-]+\.(svg|png|jpe?g|webp)$/i;

export function isValidImagePath(value) {
  if (typeof value !== 'string') return false;
  const path = value.trim();
  if (path === '') return true;
  if (!path.startsWith('/images/')) return false;
  if (path.includes('..') || path.includes('\\') || path.includes('://')) return false;
  return IMAGE_PATH_REGEX.test(path);
}

export function normalisasiImagePath(value) {
  const path = typeof value === 'string' ? value.trim() : '';
  return path === '' ? PLACEHOLDER_IMAGE : path;
}

/** Key kanonik M6. Key lama M1–M5 tetap dibaca sekali untuk migrasi. */
export const STORAGE_KEY = 'costestant:costumes:v1';
const LEGACY_KEY = 'costestant.kostum.v1';
const META_KEY = 'costestant.meta.v1';

const STORAGE_WARNING =
  'PENYIMPANAN LOKAL TIDAK TERSEDIA; PERUBAHAN HANYA SESI INI.';

/** Audit C-03: batas ukuran payload & jumlah kostum. */
export const MAX_IMPORT_BYTES = 1_000_000;
const MAX_PAYLOAD_CHARS = 1_000_000;
const MAX_LIST_ITEMS = 500;

/** Guard file impor yang bisa dipanggil UI sekaligus diuji tanpa DOM. */
export function validateImportFile(file) {
  if (!file || typeof file !== 'object') {
    return { ok: false, error: 'GAGAL IMPORT: FILE TIDAK VALID.' };
  }
  if (!/\.json$/i.test(String(file.name ?? ''))) {
    return { ok: false, error: 'GAGAL IMPORT: PILIH FILE DENGAN EKSTENSI .JSON.' };
  }
  if (file.type && file.type !== 'application/json') {
    return { ok: false, error: 'GAGAL IMPORT: TIPE FILE HARUS APPLICATION/JSON.' };
  }
  if (Number(file.size) > MAX_IMPORT_BYTES) {
    return { ok: false, error: 'GAGAL IMPORT: UKURAN FILE MELEBIHI BATAS.' };
  }
  return { ok: true };
}

/** Audit C-04/P-01: hanya field skema yang boleh masuk state. */
const ALLOWED_KEYS = new Set([
  'id',
  'nama',
  'asal',
  'kategori',
  'ukuran',
  'hargaPer2Hari',
  'stok',
  'status',
  'deskripsi',
  'imageUrl',
  'unggulan',
]);

let products = cloneSeed();
let criteria = { ...FILTER_DEFAULT };
let storageAvailable = true;
let lastIssue = null;
const listeners = new Set();

function cloneSeed() {
  return PRODUK_SEED.map((item) => ({ ...item }));
}

/* ------------------------------------------------------------------
   Validasi skema (M6) — satu source of truth untuk load & import
   ------------------------------------------------------------------ */

/** Kumpulan pesan error untuk satu item; dipakai validator & pesan import. */
function itemErrors(item, prefix = '') {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return [`${prefix}DATA BUKAN OBJEK.`];
  }
  const errors = [];
  const push = (field, detail) => errors.push(`${prefix}${field}: ${detail}.`);

  // Audit C-04/P-01: kunci asing (termasuk __proto__/constructor/prototype) ditolak.
  if (Object.keys(item).some((key) => !ALLOWED_KEYS.has(key))) {
    errors.push(`${prefix}KUNCI OBJEK TIDAK DIIZINKAN.`);
  }

  const trimmed = (key) => (typeof item[key] === 'string' ? item[key].trim() : '');
  const id = trimmed('id');
  const nama = trimmed('nama');
  const asal = trimmed('asal');
  const deskripsi = trimmed('deskripsi');

  if (!ID_PATTERN.test(id)) push('id', 'STRING AMAN 1–64 KARAKTER');
  if (nama.length < BATAS_SKEMA.namaMin || nama.length > BATAS_SKEMA.namaMax) {
    push('nama', `STRING ${BATAS_SKEMA.namaMin}–${BATAS_SKEMA.namaMax} KARAKTER`);
  }
  if (asal.length < BATAS_SKEMA.asalMin || asal.length > BATAS_SKEMA.asalMax) {
    push('asal', `STRING ${BATAS_SKEMA.asalMin}–${BATAS_SKEMA.asalMax} KARAKTER`);
  }
  if (!KATEGORI.includes(item.kategori)) push('kategori', 'ENUM TIDAK VALID');
  if (!UKURAN.includes(item.ukuran)) push('ukuran', 'ENUM TIDAK VALID');
  if (
    !Number.isInteger(item.hargaPer2Hari) ||
    item.hargaPer2Hari < 0 ||
    item.hargaPer2Hari > BATAS_SKEMA.hargaMax
  ) {
    push('hargaPer2Hari', `INTEGER BULAT 0–${BATAS_SKEMA.hargaMax}`);
  }
  if (
    !Number.isInteger(item.stok) ||
    item.stok < 0 ||
    item.stok > BATAS_SKEMA.stokMax
  ) {
    push('stok', `INTEGER BULAT 0–${BATAS_SKEMA.stokMax}`);
  }
  if (!STATUS.includes(item.status)) push('status', 'ENUM TIDAK VALID');
  if (deskripsi.length < BATAS_SKEMA.deskripsiMin || deskripsi.length > BATAS_SKEMA.deskripsiMax) {
    push('deskripsi', `STRING ${BATAS_SKEMA.deskripsiMin}–${BATAS_SKEMA.deskripsiMax} KARAKTER`);
  }
  if (!isValidImagePath(item.imageUrl)) push('imageUrl', 'PATH LOKAL /images/ (SVG/PNG/JPG/WEBP)');
  if (typeof item.unggulan !== 'boolean') push('unggulan', 'HARUS BOOLEAN');
  return errors;
}

/** Bangun ulang objek bersih dari allow-list; dipakai setelah itemErrors lolos. */
function sanitizeItem(item) {
  return {
    id: item.id.trim(),
    nama: item.nama.trim(),
    asal: item.asal.trim(),
    kategori: item.kategori,
    ukuran: item.ukuran,
    hargaPer2Hari: item.hargaPer2Hari,
    stok: item.stok,
    status: item.status,
    deskripsi: item.deskripsi.trim(),
    imageUrl: normalisasiImagePath(item.imageUrl),
    unggulan: item.unggulan,
  };
}

/** Validator satu kostum — true hanya jika seluruh field wajib lolos. */
export function validateCostumeItem(item) {
  return itemErrors(item).length === 0;
}

/** Validasi seluruh array + pesan spesifik (untuk banner import). */
export function validateCostumeListDetailed(list) {
  if (!Array.isArray(list)) return { valid: false, errors: ['DATA BUKAN ARRAY.'] };
  if (list.length > MAX_LIST_ITEMS) {
    return { valid: false, errors: [`JUMLAH KOSTUM MELEBIHI ${MAX_LIST_ITEMS}.`] };
  }
  if (list.length === 0) return { valid: false, errors: ['ARRAY KOSTUM KOSONG.'] };

  const errors = [];
  const seen = new Set();
  list.forEach((item, index) => {
    const prefix = `ITEM ${index + 1} — `;
    errors.push(...itemErrors(item, prefix));
    if (item && typeof item === 'object' && typeof item.id === 'string') {
      const id = item.id.trim();
      if (seen.has(id)) errors.push(`${prefix}id: DUPLIKAT.`);
      seen.add(id);
    }
  });
  return { valid: errors.length === 0, errors };
}

/** Validator array kostum — true jika array non-kosong & semua item valid. */
export function validateCostumeList(list) {
  return validateCostumeListDetailed(list).valid;
}

/* ------------------------------------------------------------------
   localStorage: baca / tulis / pulihkan
   ------------------------------------------------------------------ */

function hasStorage() {
  try {
    const probe = '__costestant_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function writeMeta() {
  if (!storageAvailable) return;
  try {
    window.localStorage.setItem(
      META_KEY,
      JSON.stringify({ version: 1, lastReset: new Date().toISOString() }),
    );
  } catch {
    storageAvailable = false;
    lastIssue = { kind: 'unavailable', message: STORAGE_WARNING };
  }
}

function persist() {
  if (!storageAvailable) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return true;
  } catch {
    storageAvailable = false;
    lastIssue = { kind: 'unavailable', message: STORAGE_WARNING };
    return false;
  }
}

/** Baca key baru; bila belum ada, coba key lama untuk migrasi sekali jalan. */
function readRaw() {
  let raw = null;
  let usedLegacy = false;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    storageAvailable = false;
    return { raw: null, usedLegacy: false };
  }
  if (raw) return { raw, usedLegacy: false };

  try {
    raw = window.localStorage.getItem(LEGACY_KEY);
    usedLegacy = Boolean(raw);
  } catch {
    storageAvailable = false;
  }
  return { raw, usedLegacy };
}

function recover(message) {
  products = cloneSeed();
  persist();
  writeMeta();
  lastIssue = { kind: 'corrupt', message };
  return { products, issue: lastIssue };
}

function notify() {
  listeners.forEach((listener) => {
    try {
      listener(products);
    } catch {
      // Satu listener yang gagal tidak boleh menghentikan listener lain.
    }
  });
}

/**
 * Muat data saat aplikasi dibuka. Mengembalikan `{ products, issue }`.
 * JSON rusak / skema invalid / array kosong → banner + auto-reseed 8 data.
 */
export function initStore() {
  storageAvailable = hasStorage();
  lastIssue = null;

  if (!storageAvailable) {
    products = cloneSeed();
    lastIssue = { kind: 'unavailable', message: STORAGE_WARNING };
    return { products, issue: lastIssue };
  }

  const { raw, usedLegacy } = readRaw();
  if (!storageAvailable) {
    products = cloneSeed();
    lastIssue = { kind: 'unavailable', message: STORAGE_WARNING };
    return { products, issue: lastIssue };
  }

  if (raw && raw.length > MAX_PAYLOAD_CHARS) {
    return recover('DATA PENYIMPANAN TERLALU BESAR. KATALOG DIKEMBALIKAN KE 8 DATA CONTOH.');
  }

  if (!raw) {
    products = cloneSeed();
    persist();
    writeMeta();
    return { products, issue: null };
  }

  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return recover(
      'DATA PENYIMPANAN RUSAK (JSON TIDAK VALID). KATALOG DIKEMBALIKAN KE 8 DATA CONTOH.',
    );
  }

  const check = validateCostumeListDetailed(parsed);
  if (!check.valid) {
    const detail = check.errors.slice(0, 2).join(' ');
    return recover(
      `DATA PENYIMPANAN TIDAK SESUAI SKEMA. KATALOG DIKEMBALIKAN KE 8 DATA CONTOH. ${detail}`,
    );
  }

  products = parsed.map((item) => sanitizeItem(item));
  if (usedLegacy) persist(); // migrasi ke key kanonik M6
  return { products, issue: null };
}

export function getProducts() {
  return products;
}

export function getStorageStatus() {
  return storageAvailable;
}

export function getStorageIssue() {
  return lastIssue;
}

/* ---- State pencarian/filter/sort (satu source of truth) ---- */

export function getCriteria() {
  return { ...criteria };
}

export function setCriteria(patch) {
  criteria = { ...criteria, ...(patch ?? {}) };
  notify();
  return getCriteria();
}

export function resetCriteria() {
  criteria = { ...FILTER_DEFAULT };
  notify();
  return getCriteria();
}

/** Pipeline cari → filter → sort, dihitung dari state saat ini. */
export function getFilteredProducts() {
  return filterProducts(products, criteria);
}

export function subscribe(listener) {
  if (typeof listener === 'function') listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Satu jalur commit untuk semua mutasi: tulis localStorage lalu render. */
function commit(next) {
  products = next;
  persist();
  notify();
  return storageAvailable;
}

export function saveProducts(next) {
  if (!validateCostumeList(next)) return false;
  return commit(next.map((item) => sanitizeItem(item)));
}

/** Kembalikan seluruh katalog ke 8 data awal + perbarui meta. */
export function resetProducts() {
  commit(cloneSeed());
  writeMeta();
  return products;
}

/* ------------------------------------------------------------------
   Mutasi dashboard pengelola (M5) — semuanya lewat commit()
   ------------------------------------------------------------------ */

/** UUID v4 + fallback (SPEC.md NFR9 / R10). Id dibuat di store, bukan di form. */
export function createProductId() {
  const cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') return cryptoApi.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function getProductById(id) {
  return products.find((item) => item.id === id) ?? null;
}

/** Tambah kostum; `id` otomatis bila belum ada. */
export function addProduct(item) {
  const product = { ...(item ?? {}) };
  if (!product.id) product.id = createProductId();
  if (!validateCostumeItem(product)) return false;
  return commit([...products, sanitizeItem(product)]);
}

export function updateProduct(id, patch) {
  return commit(
    products.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, ...(patch ?? {}) };
      return validateCostumeItem(next) ? sanitizeItem(next) : item;
    }),
  );
}

export function deleteProduct(id) {
  return commit(products.filter((item) => item.id !== id));
}

/* ------------------------------------------------------------------
   Export / Import JSON (M6)
   ------------------------------------------------------------------ */

/** String JSON rapi untuk diunduh sebagai cadangan. */
export function exportProductsJson() {
  return JSON.stringify(products, null, 2);
}

/**
 * Parsing + validasi + commit dari teks file JSON.
 * Tidak menulis state sama sekali ketika validasi gagal.
 */
export function importProductsJson(raw) {
  const teks = String(raw ?? '').replace(/^\uFEFF/, '');
  if (teks.length > MAX_PAYLOAD_CHARS) {
    return { ok: false, error: 'GAGAL IMPORT: FILE TERLALU BESAR.' };
  }

  let parsed = null;
  try {
    parsed = JSON.parse(teks);
  } catch {
    return { ok: false, error: 'GAGAL IMPORT: ISI FILE BUKAN JSON YANG VALID.' };
  }

  const check = validateCostumeListDetailed(parsed);
  if (!check.valid) {
    const detail = check.errors.slice(0, 3).join(' ');
    return { ok: false, error: `GAGAL IMPORT: ${detail}` };
  }

  commit(parsed.map((item) => sanitizeItem(item)));
  return { ok: true, count: parsed.length };
}

/** Rumus statistik SPEC.md 4.3. */
export function getStats() {
  return products.reduce(
    (stats, item) => {
      stats.totalKatalog += 1;
      if (item.status === 'Tersedia') stats.unitStokTersedia += Number(item.stok) || 0;
      if (item.status === 'Sedang Disewa') stats.kostumDisewa += 1;
      return stats;
    },
    { totalKatalog: 0, unitStokTersedia: 0, kostumDisewa: 0 },
  );
}
